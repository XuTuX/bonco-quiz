import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/router";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { getWrongAnswerPaths } from "@/utils/wrongAnswers";
import shuffle from "@/utils/shuffle";

type Phase = "loading" | "learn" | "done";

const BLUR_DATA_URL =
    "data:image/gif;base64,R0lGODlhAQABAPAAAMzMzP///yH5BAAAAAAALAAAAAABAAEAAAICRAEAOw==";

export default function WrongQuiz() {
    const router = useRouter();
    const { set } = router.query;

    const [cards, setCards] = useState<string[]>([]);
    const [phase, setPhase] = useState<Phase>("loading");
    const [curr, setCurr] = useState(0);
    const [show, setShow] = useState(false);
    const [imgLoaded, setImgLoaded] = useState(false);

    useEffect(() => {
        if (!router.isReady) return;
        if (!set) {
            router.replace("/wrong-answers");
            return;
        }

        const wrongPaths = getWrongAnswerPaths(set as string);
        if (wrongPaths.length === 0) {
            router.replace("/wrong-answers");
            return;
        }

        setCards(shuffle(wrongPaths));
        setPhase("learn");
    }, [router.isReady, set, router]);

    const next = useCallback(() => {
        if (curr + 1 >= cards.length) setPhase("done");
        else {
            setImgLoaded(false);
            setCurr((i) => i + 1);
        }
    }, [curr, cards.length]);

    const know = useCallback(() => {
        setShow(false);
        next();
    }, [next]);

    useEffect(() => {
        const key = (e: KeyboardEvent) => {
            if (phase !== "learn") return;
            if (!show) setShow(true);
            else {
                if (e.key === "ArrowLeft" || e.key === "ArrowRight") know();
            }
        };
        window.addEventListener("keydown", key);
        return () => window.removeEventListener("keydown", key);
    }, [phase, show, know]);

    if (phase === "loading") {
        return <Center>퀴즈 로딩 중...</Center>;
    }

    if (phase === "done") {
        return (
            <Center>
                <div className="flex flex-col items-center space-y-6 px-4">
                    <h1 className="text-2xl font-bold text-green-700">
                        🎉 오답 복습 완료!
                    </h1>
                    <p className="text-gray-600">모든 오답 카드를 복습했습니다.</p>
                    <div className="flex gap-4">
                        <Link
                            href="/wrong-answers"
                            className="px-6 py-2 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-lg transition-colors"
                        >
                            오답 노트로
                        </Link>
                        <Link
                            href={`/set/${set}`}
                            className="px-6 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg text-gray-800 font-semibold transition-colors"
                        >
                            세트로
                        </Link>
                    </div>
                </div>
            </Center>
        );
    }

    const total = cards.length;
    const prog = curr + 1;
    const pct = (prog / total) * 100;
    const file = cards[curr];
    const answer = file.substring(file.lastIndexOf("/") + 1).replace(/\.(jp(e?)g|png)$/i, "");
    const disabled = !imgLoaded;

    return (
        <div className="flex flex-col items-center justify-start min-h-screen p-4 bg-gray-50 gap-4">
            <div className="w-full max-w-md">
                <div className="flex justify-between mb-1 font-medium text-purple-800">
                    <span>오답 복습: {prog} / {total}</span>
                </div>
                <div className="w-full h-2 bg-gray-200 rounded-full mb-3">
                    <div
                        className="h-full bg-purple-400 transition-all"
                        style={{ width: `${pct}%` }}
                    />
                </div>
            </div>

            <Card
                file={file}
                answer={answer}
                show={show}
                loaded={imgLoaded}
                isFirst={curr === 0}
                onLoad={() => setImgLoaded(true)}
                onToggle={() => setShow(!show)}
            />

            <Controls
                show={show}
                disabled={disabled}
                know={know}
                reveal={() => setShow(true)}
            />
        </div>
    );
}

const Center = ({ children }: { children: React.ReactNode }) => (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
        {children}
    </div>
);

function Card({
    file,
    answer,
    show,
    loaded,
    onLoad,
    onToggle,
    isFirst,
}: {
    file: string;
    answer: string;
    show: boolean;
    loaded: boolean;
    onLoad: () => void;
    onToggle: () => void;
    isFirst: boolean;
}) {
    const rotationRef = useRef<Record<string, number>>({});
    const angles = [0, 90, 180, 270];
    const rotation =
        rotationRef.current[file] ??
        (rotationRef.current[file] = angles[Math.floor(Math.random() * angles.length)]);

    return (
        <div
            className="w-full max-w-md lg:max-w-xl bg-white rounded-xl border-2
           border-purple-100 shadow-md overflow-hidden cursor-pointer
           flex flex-col flex-grow"
            onClick={onToggle}
        >
            <div className="relative flex-grow">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={file}
                        className="absolute inset-0 flex items-center justify-center"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                    >
                        <Image
                            src={`/images/${file}`}
                            alt=""
                            width={500}
                            height={500}
                            sizes="(max-width: 768px) 90vw, (max-width: 1200px) 70vw, 500px"
                            priority={isFirst}
                            placeholder="blur"
                            blurDataURL={BLUR_DATA_URL}
                            className="w-auto h-auto object-contain max-w-full max-h-full"
                            style={{ transform: `rotate(${rotation}deg)` }}
                            onLoadingComplete={onLoad}
                        />
                    </motion.div>
                </AnimatePresence>
                {!loaded && <div className="absolute inset-0 animate-pulse bg-gray-200" />}
                <div className="absolute bottom-0 left-0 right-0 p-4 h-20 flex items-center justify-center bg-white/80 backdrop-blur-sm">
                    {show && (
                        <span className="text-xl font-semibold text-purple-600">
                            정답: {answer}
                        </span>
                    )}
                </div>
            </div>
        </div>
    );
}

function Controls({
    show,
    disabled,
    know,
    reveal,
}: {
    show: boolean;
    disabled: boolean;
    know: () => void;
    reveal: () => void;
}) {
    return (
        <div className="w-full max-w-md flex justify-center mt-6 mb-4">
            {show ? (
                <button
                    onClick={know}
                    className="w-full bg-purple-400 hover:bg-purple-500 text-white py-3 rounded-lg font-semibold"
                >
                    다음 →
                </button>
            ) : (
                <button
                    onClick={reveal}
                    disabled={disabled}
                    className={`w-full bg-purple-500 hover:bg-purple-600 text-white py-3 rounded-lg font-semibold ${disabled && "opacity-50"
                        }`}
                >
                    정답 보기
                </button>
            )}
        </div>
    );
}
