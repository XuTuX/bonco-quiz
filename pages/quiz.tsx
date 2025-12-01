import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { motion } from "framer-motion";
import Background from "@/components/Background";

// 선택 가능한 초성 배열
const initials = "ㄱㄴㄷㄹㅁㅂㅅㅇㅈㅊㅋㅌㅍㅎ".split("");
const SET_NAME: Record<string, string> = {
    "1-1": "본1-1학기 2차수시",
    "1-2": "본1-2학기 1차수시",
    "1-3": "본초 세트 1-3 (NFC)",
};

const container = {
    hidden: { opacity: 0 },
    show: {
        opacity: 1,
        transition: {
            staggerChildren: 0.03
        }
    }
};

const item = {
    hidden: { opacity: 0, scale: 0.8 },
    show: { opacity: 1, scale: 1 }
};

export default function QuizHome() {
    const router = useRouter();
    const { set } = router.query;
    const [selected, setSelected] = useState<string[]>([]);

    useEffect(() => {
        if (router.isReady && !set) {
            router.replace('/');
        }
    }, [router.isReady, set, router]);

    // 초성 토글 선택/해제
    const toggle = (ch: string) => {
        setSelected(prev =>
            prev.includes(ch)
                ? prev.filter(c => c !== ch)
                : [...prev, ch]
        );
    };

    // 완료 시 선택된 초성으로 퀴즈 페이지 이동
    const startQuiz = () => {
        if (selected.length === 0) return;
        if (selected.length === 1) {
            router.push(`/quiz/${selected[0]}?set=${set}`);
        } else {
            router.push(`/quiz/multi/${selected.join('')}?set=${set}`);
        }
    };

    if (!set) {
        return (
            <div className="relative min-h-screen flex items-center justify-center">
                <Background />
                <div className="relative z-10 text-xl font-semibold text-gray-700">로딩 중...</div>
            </div>
        );
    }

    const setName = SET_NAME[set as string] ?? '선택된 세트';

    return (
        <div className="relative min-h-screen overflow-hidden flex flex-col items-center justify-center p-6">
            <Background />

            <main className="relative z-10 w-full max-w-3xl flex flex-col items-center">
                <motion.div
                    initial={{ opacity: 0, y: -30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className="text-center mb-12"
                >
                    <h1 className="text-4xl md:text-5xl font-black text-gray-800 tracking-tight mb-2">
                        {setName}
                    </h1>
                    <p className="text-xl text-gray-600 font-medium">
                        ✨ 초성별 퀴즈 선택
                    </p>
                </motion.div>

                <motion.div
                    variants={container}
                    initial="hidden"
                    animate="show"
                    className="grid grid-cols-7 gap-3 mb-10 w-full max-w-xl"
                >
                    {initials.map(ch => (
                        <motion.button
                            key={ch}
                            variants={item}
                            onClick={() => toggle(ch)}
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.95 }}
                            className={`relative w-full aspect-square flex items-center justify-center rounded-xl text-2xl font-bold transition-all duration-300 shadow-lg hover:shadow-xl overflow-hidden
                                ${selected.includes(ch)
                                    ? "bg-gradient-to-br from-blue-500 to-indigo-600 text-white"
                                    : "bg-white text-gray-700 hover:bg-gradient-to-br hover:from-blue-50 hover:to-indigo-50"
                                }`}
                        >
                            {selected.includes(ch) && (
                                <motion.div
                                    layoutId={`selected-${ch}`}
                                    className="absolute inset-0 bg-gradient-to-br from-blue-400 to-indigo-500"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                />
                            )}
                            <span className="relative z-10">{ch}</span>
                        </motion.button>
                    ))}
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5, duration: 0.6 }}
                    className="w-full max-w-md"
                >
                    <button
                        onClick={startQuiz}
                        disabled={selected.length === 0}
                        className={`w-full px-8 py-4 rounded-2xl text-lg font-bold transition-all duration-300 shadow-xl
                            ${selected.length > 0
                                ? "bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:shadow-2xl hover:scale-105 transform"
                                : "bg-gray-300 text-gray-500 cursor-not-allowed"
                            }`}
                    >
                        {selected.length > 0 ? `퀴즈 시작 (${selected.length}개 선택)` : '초성을 선택하세요'}
                    </button>
                </motion.div>

                <motion.button
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.7, duration: 0.6 }}
                    onClick={() => router.back()}
                    className="mt-8 text-gray-500 hover:text-gray-700 font-medium transition-colors"
                >
                    ← 돌아가기
                </motion.button>
            </main>
        </div>
    );
}
