// pages/quiz/[initial].tsx
import Link from "next/link";   // ← 맨 위에 추가
import { GetStaticPaths, GetStaticProps } from "next";
import fs from "fs";
import path from "path";
import { getChoseong } from "@/utils/hangul";
import shuffle from "@/utils/shuffle";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";

export const getStaticPaths: GetStaticPaths = async () => {
    const json = fs.readFileSync(path.join(process.cwd(), "public/imageList.json"), "utf-8");
    const allFiles: string[] = JSON.parse(json);
    const initials = Array.from(new Set(
        allFiles.map(f => getChoseong(f.replace(/\.(jpe?g|png)$/i, "")))
    ));
    return {
        paths: initials.map(i => ({ params: { initial: i } })),
        fallback: false,
    };
};

export const getStaticProps: GetStaticProps = async ({ params }) => {
    const initial = params!.initial as string;
    const json = fs.readFileSync(path.join(process.cwd(), "public/imageList.json"), "utf-8");
    const allFiles: string[] = JSON.parse(json);
    const cards = shuffle(
        allFiles.filter(f =>
            getChoseong(f.replace(/\.(jp(e?)g|png)$/i, "")) === initial
        )
    );
    return { props: { initial, cards } };
};

interface Props {
    initial: string;
    cards: string[];
}

type Phase = "learn" | "done";

export default function QuizByInitial({ initial, cards: initialCards }: Props) {
    // 1) cards, initial 은 props 로 이미 주어지므로 useRouter/useState(cards) 전부 삭제
    // 2) phase 는 cards.length 에 따라 초기값 결정
    const [cards, setCards] = useState<string[]>(initialCards);
    const [phase, setPhase] = useState<Phase>(cards.length ? "learn" : "done");
    const [curr, setCurr] = useState(0);
    const [show, setShow] = useState(false);
    const [imgLoaded, setImgLoaded] = useState(false);
    const [wrongSet, setWrongSet] = useState<string[]>([]);

    // keyboard, handlers 는 그대로 사용
    useEffect(() => {
        const key = (e: KeyboardEvent) => {
            if (phase !== "learn") return;
            if (!show) setShow(true);
            else {
                if (e.key === "ArrowLeft") dont();
                if (e.key === "ArrowRight") know();
            }
        };
        window.addEventListener("keydown", key);
        return () => window.removeEventListener("keydown", key);
    }, [phase, show, curr, cards]);

    const know = () => {
        setShow(false);
        next();
    };
    const dont = () => {
        const f = cards[curr];
        if (!wrongSet.includes(f)) setWrongSet(w => [...w, f]);
        setShow(false);
        next();
    };
    const next = () => {
        if (curr + 1 >= cards.length) setPhase("done");
        else {
            setImgLoaded(false);
            setCurr(i => i + 1);
        }
    };

    // render
    if (phase === "done") {
        const retryWrongSet = () => {
            if (wrongSet.length === 0) return;
            setCards(shuffle([...wrongSet]));
            setCurr(0);
            setShow(false);
            setImgLoaded(false);
            setWrongSet([]);
            setPhase("learn");
        };

        return (
            <Center>
                <div className="flex flex-col items-center space-y-6 px-4">
                    <h1 className="text-2xl font-bold text-green-700">
                        🎉 {initial} 세트 완료!
                    </h1>
                    <ResultBlock title="오답 카드" list={wrongSet} onRetry={retryWrongSet} />
                    <Link
                        href="/quiz"
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

// 이하 Center, ResultBlock, Card, Controls는 기존 코드 유지


/* ────────── 재사용 컴포넌트 ────────── */
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
            <h2 className="font-bold text-xl mb-4 flex items-center gap-2 text-blue-700">
                <span>📝</span> {title}
            </h2>

            {list.length === 0 ? (
                <p className="text-gray-400">👏 모두 맞힘!</p>
            ) : (
                <>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {list.map((f) => {
                            const label = f.replace(/\.(jpe?g|png)$/i, "");
                            return (
                                <div
                                    key={f}
                                    className="rounded-xl border shadow-sm bg-white/80 p-2"
                                >
                                    <img
                                        src={`/images/${f}`}
                                        alt={label}
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
                            width={500}
                            height={500}
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
