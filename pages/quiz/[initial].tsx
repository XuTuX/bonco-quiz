// pages/quiz/[initial].tsx
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { getChoseong } from "@/utils/hangul";
import shuffle from "@/utils/shuffle";

/* ───────── helpers ───────── */
type Phase = "loading" | "learn" | "done";

export default function QuizByInitial() {
    const router = useRouter();
    const { initial } = router.query;

    const [phase, setPhase] = useState<Phase>("loading");
    const [cards, setCards] = useState<string[]>([]);
    const [curr, setCurr] = useState(0);
    const [show, setShow] = useState(false);
    const [imgLoaded, setImgLoaded] = useState(false);
    const [wrongSet, setWrongSet] = useState<string[]>([]);

    /* ───────── 이미지 로딩 ───────── */
    useEffect(() => {
        if (!initial) return;

        fetch("/imageList.json")
            .then(r => r.json())
            .then((arr: string[]) => {
                const filtered = arr.filter(
                    (f) => getChoseong(f.replace(/\.(jp(e?)g|png)$/i, "")) === initial
                );
                const list = shuffle(filtered);
                setCards(list);
                setPhase(list.length ? "learn" : "done");
            });
    }, [initial]);

    /* ───────── 키보드 컨트롤 ───────── */
    useEffect(() => {
        const key = (e: KeyboardEvent) => {
            if (phase !== "learn") return;
            if (!show) {
                setShow(true);
            } else {
                if (e.key === "ArrowLeft") dont();
                if (e.key === "ArrowRight") know();
            }
        };
        window.addEventListener("keydown", key);
        return () => window.removeEventListener("keydown", key);
    }, [phase, show, curr, cards]);

    /* ───────── 핸들러 ───────── */
    const know = () => {
        setShow(false);
        next();
    };

    const dont = () => {
        const f = cards[curr];
        if (!wrongSet.includes(f)) setWrongSet((w) => [...w, f]);
        setShow(false);
        next();
    };

    const next = () => {
        if (curr + 1 >= cards.length) {
            setPhase("done");
        } else {
            setImgLoaded(false);
            setCurr((i) => i + 1);
        }
    };

    /* ───────── 렌더링 ───────── */
    if (phase === "loading")
        return <Center>로딩 중…</Center>;

    if (phase === "done")
        return (
            <Center>
                <div className="space-y-6">
                    <h1 className="text-2xl font-bold text-green-700 text-center">
                        🎉 [{initial}] 세트 완료!
                    </h1>
                    <ResultBlock title="오답 카드" list={wrongSet} />
                </div>
            </Center>
        );

    /* 학습 화면 */
    const total = cards.length;
    const prog = curr + 1;
    const pct = (prog / total) * 100;
    const file = cards[curr];
    const answer = file.replace(/\.(jp(e?)g|png)$/i, "");
    const disabled = !imgLoaded;

    return (
        <div className="flex flex-col items-center justify-between min-h-screen p-4 bg-gray-50">
            {/* 헤더 */}
            <div className="w-full max-w-md mb-4">
                <div className="flex justify-between mb-1 font-medium text-green-800">
                    <span>{prog} / {total}</span>
                </div>
                <div className="w-full h-2 bg-gray-200 rounded-full">
                    <div
                        className="h-full bg-green-400 transition-all"
                        style={{ width: `${pct}%` }}
                    />
                </div>
            </div>

            {/* 카드 */}
            <Card
                file={file}
                answer={answer}
                show={show}
                loaded={imgLoaded}
                onLoad={() => setImgLoaded(true)}
                onToggle={() => setShow(!show)}
            />

            {/* 버튼 */}
            <Controls
                show={show}
                disabled={disabled}
                know={know}
                dont={dont}
                reveal={() => setShow(true)}
            />
        </div>
    );
}

/* ────────── 재사용 컴포넌트 ────────── */
const Center = ({ children }: { children: React.ReactNode }) => (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
        {children}
    </div>
);

function ResultBlock({
    title,
    list,
}: { title: string; list: string[] }) {
    return (
        <div className="w-full max-w-md">
            <h2 className="font-bold text-lg mb-2 flex items-center gap-2">
                <span>📝</span> {title}
            </h2>
            <div className="border-2 rounded-xl px-4 py-3 bg-blue-50 max-h-64 overflow-y-auto">
                {list.length === 0
                    ? <p className="text-gray-400">👏 모두 맞힘!</p>
                    : list.map(f => (
                        <div key={f} className="truncate font-semibold text-gray-800">
                            {f.replace(/\.(jp(e?)g|png)$/i, "")}
                        </div>
                    ))
                }
            </div>
        </div>
    );
}

function Card({
    file,
    answer,
    show,
    loaded,
    onLoad,
    onToggle,
}: {
    file: string;
    answer: string;
    show: boolean;
    loaded: boolean;
    onLoad: () => void;
    onToggle: () => void;
}) {
    return (
        <div
            className="w-full max-w-md lg:max-w-2xl bg-white rounded-xl border-2
                 border-green-100 shadow-md overflow-hidden cursor-pointer"
            onClick={onToggle}
        >
            <div className="relative w-full aspect-square bg-gray-100">
                {!loaded && <div className="absolute inset-0 animate-pulse bg-gray-200" />}
                <AnimatePresence mode="wait">
                    <motion.div
                        key={file}
                        initial={{ scale: 0.98 }}
                        animate={{ scale: 1 }}
                        exit={{ scale: 0.98 }}
                        transition={{ duration: 0.15 }}
                        className="absolute inset-0 flex items-center justify-center"
                    >
                        <Image
                            src={`/images/${file}`}
                            alt=""
                            width={650}
                            height={650}
                            priority
                            className="object-contain max-h-[70vh]"
                            onLoadingComplete={onLoad}
                        />
                    </motion.div>
                </AnimatePresence>
            </div>
            <div className="p-4 h-12 flex items-center justify-center">
                {show && (
                    <span className="text-xl font-semibold text-blue-600">
                        정답: {answer}
                    </span>
                )}
            </div>
        </div>
    );
}

function Controls({
    show,
    disabled,
    know,
    dont,
    reveal,
}: {
    show: boolean;
    disabled: boolean;
    know: () => void;
    dont: () => void;
    reveal: () => void;
}) {
    return (
        <div className="w-full max-w-md flex justify-center mt-6 mb-4">
            {show ? (
                <div className="w-full flex gap-4">
                    <button
                        onClick={dont}
                        className="w-1/2 bg-red-400 hover:bg-red-500 text-white py-3 rounded-lg"
                    >
                        몰라요
                    </button>
                    <button
                        onClick={know}
                        className="w-1/2 bg-green-400 hover:bg-green-500 text-white py-3 rounded-lg"
                    >
                        알아요
                    </button>
                </div>
            ) : (
                <button
                    onClick={reveal}
                    disabled={disabled}
                    className={`w-full bg-blue-500 hover:bg-blue-600 text-white py-3 rounded-lg ${disabled && "opacity-50"}`}
                >
                    정답 보기
                </button>
            )}
        </div>
    );
}
