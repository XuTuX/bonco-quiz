// pages/quiz/multi/[initials].tsx
import Link from "next/link";
import { useRouter } from "next/router";
import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";

import { getChoseong } from "@/utils/hangul";
import shuffle from "@/utils/shuffle";



type Phase = "loading" | "learn" | "done";

export default function QuizMulti() {
    const router = useRouter();
    const { initials: initialsParam, set } = router.query;

    const [phase, setPhase] = useState<Phase>("loading");
    const [cards, setCards] = useState<string[]>([]);
    const [initialArr, setInitialArr] = useState<string[]>([]);

    const [curr, setCurr] = useState(0);
    const [show, setShow] = useState(false);
    const [imgLoaded, setImgLoaded] = useState(false);
    const [wrongSet, setWrongSet] = useState<string[]>([]);

    useEffect(() => {
        if (!router.isReady) return;
        if (!initialsParam || !set) {
            router.replace("/quiz");
            return;
        }

        const initials = (initialsParam as string).split('');
        setInitialArr(initials);

        fetch(`/imageList-${set}.json`)
            .then((res) => res.json())
            .then((allFiles: string[]) => {
                const filteredCards = shuffle(
                    allFiles.filter((f) => {
                        const ch = getChoseong(f.substring(f.lastIndexOf("/") + 1).replace(/\.(jpe?g|png)$/i, ""));
                        return initials.includes(ch);
                    })
                );
                setCards(filteredCards);
                setPhase(filteredCards.length ? "learn" : "done");
            });
    }, [router.isReady, initialsParam, set, router]);

    const know = useCallback(() => {
        setShow(false);
        if (curr + 1 >= cards.length) {
            setPhase("done");
        } else {
            setImgLoaded(false);
            setCurr((i) => i + 1);
        }
    }, [curr, cards.length]);

    const dont = useCallback(() => {
        const file = cards[curr];
        if (!wrongSet.includes(file)) {
            setWrongSet((w) => [...w, file]);
        }
        know();
    }, [curr, cards, wrongSet, know]);

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
    }, [phase, show, dont, know]);

    if (phase === "loading") {
        return <Center>퀴즈 로딩 중...</Center>;
    }

    if (phase === "done") {
        const retryWrongSet = () => {
            if (wrongSet.length === 0) return;
            setPhase("learn");
            setCurr(0);
            setShow(false);
            setImgLoaded(false);
            setWrongSet([]);
            setCards(shuffle([...wrongSet]));
        };

        return (
            <Center>
                <div className="flex flex-col items-center space-y-6 px-4">
                    <h1 className="text-2xl font-bold text-green-700">
                        🎉 {initialArr.join(",")} 세트 완료!
                    </h1>
                    <ResultBlock title="오답 카드" list={wrongSet} onRetry={retryWrongSet} />
                    <Link
                        href={`/set/${set}`}
                        className="mt-4 px-6 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg text-gray-800"
                    >
                        나가기
                    </Link>
                </div>
            </Center>
        );
    }

    const total = cards.length;
    const prog = curr + 1;
    const pct = (prog / total) * 100;
    const file = cards[curr];
    const answer = file.substring(file.lastIndexOf("/") + 1).replace(/\.(jpe?g|png)$/i, "");
    const disabled = !imgLoaded;

    return (
        <div className="flex flex-col items-center justify-start min-h-screen p-4 bg-gray-50 gap-4">
            <div className="w-full max-w-md mb-4">
                <div className="flex justify-between mb-1 text-green-800">
                    <span>{prog} / {total}</span>
                </div>
                <div className="w-full h-2 bg-gray-200 rounded-full">
                    <div
                        className="h-full bg-green-400 transition-all"
                        style={{ width: `${pct}%` }}
                    />
                </div>
            </div>

            <Card
                file={file}
                answer={answer}
                show={show}
                loaded={imgLoaded}
                onLoad={() => setImgLoaded(true)}
                onToggle={() => setShow((s) => !s)}
            />

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

const Center = ({ children }: { children: React.ReactNode }) => (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
        {children}
    </div>
);

function ResultBlock({
    title,
    list,
    onRetry,
}: {
    title: string;
    list: string[];
    onRetry?: () => void;
}) {
    if (list.length === 0) return null;

    return (
        <div className="w-full max-w-3xl">
            <h2 className="font-bold-2 text-xl mb-4 flex items-center gap-2 text-blue-700">
                <span>📝</span> {title}
            </h2>

            {list.length === 0 ? (
                <p className="text-gray-400">👏 모두 맞힘!</p>
            ) : (
                <>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {list.map((f) => {
                            const label = f.substring(f.lastIndexOf("/") + 1).replace(/\.(jpe?g|png)$/i, "");
                            return (
                                <div
                                    key={f}
                                    className="rounded-xl border shadow-sm bg-white/80 p-2"
                                >
                                    <Image
                                        src={`/images/${f}`}
                                        alt={label}
                                        width={400}
                                        height={400}
                                        className="rounded object-contain h-32 w-full mx-auto"
                                        draggable={false}
                                    />
                                    <p className="text-center font-semibold mt-2">{label}</p>
                                </div>
                            );
                        })}
                    </div>

                    {onRetry && (
                        <button
                            onClick={onRetry}
                            className="mt-6 px-6 py-2 bg-red-100 hover:bg-red-200 text-red-700 font-semibold rounded-lg"
                        >
                            오답만 다시 풀기
                        </button>
                    )}
                </>
            )}
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
            className="w-full max-w-md lg:max-w-xl bg-white rounded-xl border-2
                 border-green-100 shadow-md overflow-hidden cursor-pointer
                 flex flex-col flex-grow" // Added flex and flex-grow
            onClick={onToggle}
        >
            {/* Make this container relative for the image */}
            <div className="relative flex-grow">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={file} // Animate when file changes
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
                            priority
                            className="w-auto h-auto object-contain max-w-full max-h-full"
                            onLoadingComplete={onLoad}
                        />
                    </motion.div>
                </AnimatePresence>
                {!loaded && <div className="absolute inset-0 animate-pulse bg-gray-200" />}
            </div>
            {/* Explicit height for the answer bar */}
            <div className="p-4 h-20 flex-shrink-0 flex items-center justify-center">
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
        <div className="w-full max-w-xl flex justify-center mt-6 mb-4">
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
                    className={`w-full bg-blue-500 hover:bg-blue-600 text-white py-3 rounded-lg ${disabled ? "opacity-50" : ""}`}
                >
                    정답 보기
                </button>
            )}
        </div>
    );
}