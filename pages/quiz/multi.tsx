
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";

import { getChoseong } from "@/utils/hangul";
import shuffle from "@/utils/shuffle";  // utils/shuffle.ts 에서 export default shuffle

type Phase = "loading" | "learn" | "done";

export default function QuizMulti() {
    const router = useRouter();
    const { initials } = router.query;

    // "ㄱ,ㄴ,ㄷ" → ["ㄱ","ㄴ","ㄷ"]
    const initialArr = typeof initials === "string"
        ? initials.split(",")
        : [];

    const [phase, setPhase] = useState<Phase>("loading");
    const [cards, setCards] = useState<string[]>([]);
    const [curr, setCurr] = useState(0);
    const [show, setShow] = useState(false);
    const [imgLoaded, setImgLoaded] = useState(false);
    const [wrongSet, setWrongSet] = useState<string[]>([]);

    useEffect(() => {
        if (!initialArr.length) {
            setPhase("done");
            return;
        }

        fetch("/imageList.json")
            .then(r => r.json())
            .then((all: string[]) => {
                // 배열 중 하나라도 일치하는 카드만
                const filtered = all.filter(f => {
                    const ch = getChoseong(f.replace(/\.(jpe?g|png)$/i, ""));
                    return initialArr.includes(ch);
                });
                setCards(shuffle(filtered));
                setPhase(filtered.length ? "learn" : "done");
            });
    }, [initialArr.join(",")]);

    useEffect(() => {
        const onKey = (e: KeyboardEvent) => {
            if (phase !== "learn") return;
            if (!show) {
                setShow(true);
            } else {
                if (e.key === "ArrowLeft") dont();
                if (e.key === "ArrowRight") know();
            }
        };
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [phase, show, curr, cards]);
    const know = () => {
        setShow(false);
        nextCard();
    };

    const dont = () => {
        const f = cards[curr];
        if (!wrongSet.includes(f)) setWrongSet(w => [...w, f]);
        setShow(false);
        nextCard();
    };

    const nextCard = () => {
        if (curr + 1 >= cards.length) {
            setPhase("done");
        } else {
            setImgLoaded(false);
            setCurr(i => i + 1);
        }
    };

    if (phase === "loading")
        return <Center>로딩 중…</Center>;

    if (phase === "done")
        return (
            <Center>
                <div className="flex flex-col items-center space-y-10">
                    <h1 className="text-2xl font-bold text-green-700 mb-4">
                        🎉 {initialArr.join(", ")} 세트 완료!
                    </h1>
                    <ResultBlock title="오답 카드" list={wrongSet} />
                </div>
            </Center>
        );

    // 진행률 계산
    const total = cards.length;
    const prog = curr + 1;
    const pct = (prog / total) * 100;

    // 현재 카드
    const file = cards[curr];
    const answer = file.replace(/\.(jp(e?)g|png)$/i, "");
    const disabled = !imgLoaded;

    return (
        <div className="flex flex-col items-center justify-between min-h-screen p-4 bg-gray-50">
            {/* 헤더 */}
            <div className="w-full max-w-md mb-4">
                <div className="flex justify-between text-green-800 mb-1">
                    <span>{prog} / {total}</span>
                </div>
                <div className="w-full h-2 bg-gray-200 rounded-full">
                    <div className="h-full bg-green-400" style={{ width: pct + "%" }} />
                </div>
            </div>

            {/* 카드 */}
            <Card
                file={file}
                answer={answer}
                show={show}
                loaded={imgLoaded}
                onLoad={() => setImgLoaded(true)}
                onToggle={() => setShow(s => !s)}
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

// 가운데 정렬
const Center = ({ children }: { children: React.ReactNode }) => (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
        {children}
    </div>
);

// 오답 리스트
function ResultBlock({ title, list }: { title: string; list: string[] }) {
    return (
        <div className="w-full max-w-md">
            <h2 className="font-bold text-lg mb-2 flex items-center gap-2">
                <span>📝</span> {title}
            </h2>
            <div className="border-2 rounded-xl px-4 py-3 bg-blue-50 max-h-64 overflow-y-auto">
                {list.length === 0
                    ? <p className="text-gray-400">👏 모두 맞힘!</p>
                    : list.map(f => (
                        <div key={f} className="truncate font-semibold">
                            {f.replace(/\.(jp(e?)g|png)$/i, "")}
                        </div>
                    ))
                }
            </div>
        </div>
    );
}

// 카드 + 애니메이션
function Card({ file, answer, show, loaded, onLoad, onToggle }: {
    file: string; answer: string;
    show: boolean; loaded: boolean;
    onLoad: () => void; onToggle: () => void;
}) {
    return (
        <div onClick={onToggle}
            className="w-full max-w-md bg-white rounded-xl border-2 border-green-100 shadow-md overflow-hidden cursor-pointer">
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
                            width={650} height={650}
                            priority className="object-contain max-h-[70vh]"
                            onLoadingComplete={onLoad}
                            alt=""
                        />
                    </motion.div>
                </AnimatePresence>
            </div>
            <div className="p-4 h-12 flex items-center justify-center">
                {show && <span className="text-xl font-semibold text-blue-600">정답: {answer}</span>}
            </div>
        </div>
    );
}

// 버튼들
function Controls({ show, disabled, know, dont, reveal }: {
    show: boolean; disabled: boolean;
    know: () => void; dont: () => void; reveal: () => void;
}) {
    return (
        <div className="w-full max-w-md flex justify-center mt-6 mb-4">
            {show ? (
                <div className="w-full flex gap-4">
                    <button onClick={dont} className="w-1/2 bg-red-400 hover:bg-red-500 text-white py-3 rounded-lg">
                        몰라요
                    </button>
                    <button onClick={know} className="w-1/2 bg-green-400 hover:bg-green-500 text-white py-3 rounded-lg">
                        알아요
                    </button>
                </div>
            ) : (
                <button onClick={reveal} disabled={disabled}
                    className={`w-full bg-blue-500 hover:bg-blue-600 text-white py-3 rounded-lg ${disabled && "opacity-50"}`}>
                    정답 보기
                </button>
            )}
        </div>
    );
}
