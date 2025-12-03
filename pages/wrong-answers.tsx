import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import Background from "@/components/Background";
import {
    getWrongAnswerStats,
    getTopWrongAnswers,
    removeWrongAnswer,
    clearWrongAnswers,
} from "@/utils/wrongAnswers";

const BLUR_DATA_URL =
    "data:image/gif;base64,R0lGODlhAQABAPAAAMzMzP///yH5BAAAAAAALAAAAAABAAEAAAICRAEAOw==";

const SET_NAME: Record<string, string> = {
    "1-1": "본1-1학기 2차수시",
    "1-2": "본1-2학기 1차수시",
    "1-3": "본1-2학기 2차수시",
};

type TabType = "all" | "1-1" | "1-2" | "1-3";

export default function WrongAnswersPage() {
    const router = useRouter();
    const { set: setParam } = router.query;
    const [activeTab, setActiveTab] = useState<TabType>("all");
    const [stats, setStats] = useState<ReturnType<typeof getWrongAnswerStats> | null>(null);
    const [topWrong, setTopWrong] = useState<ReturnType<typeof getTopWrongAnswers>>([]);
    const [refreshKey, setRefreshKey] = useState(0);

    // Set initial tab based on URL parameter
    useEffect(() => {
        if (setParam && (setParam === "1-1" || setParam === "1-2" || setParam === "1-3")) {
            setActiveTab(setParam as TabType);
        }
    }, [setParam]);

    useEffect(() => {
        const filter = activeTab === "all" ? undefined : activeTab;
        const statsData = getWrongAnswerStats(filter);
        const topData = getTopWrongAnswers(10);
        setStats(statsData);
        setTopWrong(topData);
    }, [activeTab, refreshKey]);

    const handleRemove = (set: string, path: string) => {
        removeWrongAnswer(set, path);
        setRefreshKey((k) => k + 1);
    };

    const handleClearAll = () => {
        if (confirm("모든 오답 기록을 삭제하시겠습니까?")) {
            clearWrongAnswers();
            setRefreshKey((k) => k + 1);
        }
    };

    const handleClearSet = (set: string) => {
        if (confirm(`${SET_NAME[set]} 세트의 오답 기록을 삭제하시겠습니까?`)) {
            clearWrongAnswers(set);
            setRefreshKey((k) => k + 1);
        }
    };

    const handleRetryWrong = (set: string) => {
        router.push(`/quiz/wrong?set=${set}`);
    };

    if (!stats) {
        return (
            <div className="relative min-h-screen flex items-center justify-center">
                <Background />
                <div className="relative z-10 text-xl font-semibold text-gray-700">로딩 중...</div>
            </div>
        );
    }

    // If accessed from a specific set page, show only that set
    const isSetSpecific = setParam && (setParam === "1-1" || setParam === "1-2" || setParam === "1-3");
    const displayTab = isSetSpecific ? (setParam as TabType) : activeTab;

    const currentCards =
        displayTab === "all"
            ? Object.values(stats.bySet).flatMap((s) => s.cards.map((c) => ({ ...c, set: "" })))
            : stats.bySet[displayTab]?.cards || [];

    return (
        <div className="relative min-h-screen overflow-hidden">
            <Background />

            <main className="relative z-10 max-w-6xl mx-auto p-6">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="text-center mb-8"
                >
                    <h1 className="text-4xl md:text-5xl font-black text-gray-800 mb-2">
                        📝 오답 노트
                        {isSetSpecific && <span className="text-3xl ml-3 text-blue-600">- {SET_NAME[setParam as string]}</span>}
                    </h1>
                    <p className="text-lg text-gray-600">틀린 카드를 복습하고 다시 도전하세요!</p>
                </motion.div>

                {/* Privacy Notice */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1, duration: 0.6 }}
                    className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4 mb-6 max-w-4xl mx-auto"
                >
                    <div className="flex items-start gap-3">
                        <span className="text-2xl">ℹ️</span>
                        <div className="text-sm text-blue-800">
                            <p className="font-semibold mb-1">개인정보 보호 안내</p>
                            <p>오답 기록은 <strong>브라우저의 로컬 스토리지</strong>에만 저장되며, 서버나 제작자에게 전송되지 않습니다.
                                <br />브라우저 캐시를 삭제하거나 다른 기기에서 접속하면 기록이 사라집니다.</p>
                        </div>
                    </div>
                </motion.div>

                {/* Statistics Cards */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2, duration: 0.6 }}
                    className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8"
                >
                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                        <div className="text-sm text-gray-500 mb-1 font-medium">총 오답 카드</div>
                        <div className="flex items-baseline gap-2">
                            <span className="text-4xl font-bold text-gray-800">{stats.totalCards}</span>
                            <span className="text-gray-400 text-sm">개</span>
                        </div>
                    </div>
                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                        <div className="text-sm text-gray-500 mb-1 font-medium">총 틀린 횟수</div>
                        <div className="flex items-baseline gap-2">
                            <span className="text-4xl font-bold text-gray-800">{stats.totalWrong}</span>
                            <span className="text-gray-400 text-sm">회</span>
                        </div>
                    </div>
                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                        <div className="text-sm text-gray-500 mb-1 font-medium">평균 틀린 횟수</div>
                        <div className="flex items-baseline gap-2">
                            <span className="text-4xl font-bold text-gray-800">
                                {stats.totalCards > 0 ? (stats.totalWrong / stats.totalCards).toFixed(1) : 0}
                            </span>
                            <span className="text-gray-400 text-sm">회</span>
                        </div>
                    </div>
                </motion.div>

                {/* Top 10 Wrong Answers */}
                {topWrong.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3, duration: 0.6 }}
                        className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 mb-8"
                    >
                        <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                            <span className="text-2xl">🏆</span>
                            가장 많이 틀린 카드 TOP 10
                        </h2>
                        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                            {topWrong.map((card, idx) => (
                                <motion.div
                                    key={`${card.set}-${card.path}`}
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: 0.4 + idx * 0.05 }}
                                    className="relative group"
                                >
                                    <div className="relative bg-gray-50 rounded-xl p-4 border border-gray-100 hover:border-blue-200 hover:shadow-md transition-all">
                                        <div className="absolute -top-2 -left-2 bg-gray-800 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center shadow-sm z-10">
                                            {idx + 1}
                                        </div>
                                        <Image
                                            src={`/images/${card.path}`}
                                            alt={card.name}
                                            width={200}
                                            height={200}
                                            className="rounded-lg object-contain h-24 w-full mb-3 bg-white p-1"
                                            placeholder="blur"
                                            blurDataURL={BLUR_DATA_URL}
                                        />
                                        <div className="text-xs font-semibold text-gray-700 text-center mb-1 truncate">
                                            {card.name}
                                        </div>
                                        <div className="text-center">
                                            <span className="text-red-500 text-xs font-bold bg-red-50 px-2 py-0.5 rounded-full">
                                                {card.count}회
                                            </span>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>
                )}

                {/* Tabs - only show when not set-specific */}
                {!isSetSpecific && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.4, duration: 0.6 }}
                        className="flex gap-2 mb-6 overflow-x-auto"
                    >
                        {(["all", "1-1", "1-2", "1-3"] as TabType[]).map((tab) => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`px-6 py-3 rounded-xl font-semibold transition-all whitespace-nowrap ${activeTab === tab
                                    ? "bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg"
                                    : "bg-white/80 text-gray-700 hover:bg-gray-100"
                                    }`}
                            >
                                {tab === "all" ? "전체" : SET_NAME[tab]}
                                {tab !== "all" && stats.bySet[tab] && (
                                    <span className="ml-2 text-sm">({stats.bySet[tab].count})</span>
                                )}
                            </button>
                        ))}
                    </motion.div>
                )}

                {/* Action Buttons */}
                {currentCards.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.5, duration: 0.6 }}
                        className="flex gap-3 mb-6 flex-wrap"
                    >
                        {displayTab !== "all" && (
                            <button
                                onClick={() => handleRetryWrong(displayTab)}
                                className="px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all"
                            >
                                🔄 오답만 다시 풀기
                            </button>
                        )}
                        <button
                            onClick={() => (displayTab === "all" ? handleClearAll() : handleClearSet(displayTab))}
                            className="px-6 py-3 bg-gradient-to-r from-red-500 to-pink-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all"
                        >
                            🗑️ {displayTab === "all" ? "전체" : "세트"} 삭제
                        </button>
                    </motion.div>
                )}

                {/* Wrong Answer Grid */}
                {currentCards.length === 0 ? (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.5, duration: 0.6 }}
                        className="bg-white/80 backdrop-blur-sm rounded-2xl p-12 text-center shadow-lg"
                    >
                        <div className="text-6xl mb-4">🎉</div>
                        <div className="text-2xl font-bold text-gray-800 mb-2">오답이 없습니다!</div>
                        <div className="text-gray-600">완벽하게 학습하셨네요!</div>
                    </motion.div>
                ) : (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.5, duration: 0.6 }}
                        className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6"
                    >
                        {currentCards.map((card, index) => {
                            const cardSet = displayTab === "all"
                                ? Object.keys(stats.bySet).find(s =>
                                    stats.bySet[s].cards.some(c => c.path === card.path)
                                ) || ""
                                : displayTab;

                            return (
                                <motion.div
                                    key={card.path}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.5 + index * 0.02 }}
                                    className="group relative bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md hover:border-blue-200 transition-all overflow-hidden"
                                >
                                    <div className="relative p-4 bg-white">
                                        <Image
                                            src={`/images/${card.path}`}
                                            alt={card.name}
                                            width={300}
                                            height={300}
                                            className="w-full h-40 object-contain rounded-lg mb-3"
                                            placeholder="blur"
                                            blurDataURL={BLUR_DATA_URL}
                                        />
                                        <button
                                            onClick={() => handleRemove(cardSet, card.path)}
                                            className="absolute top-2 right-2 bg-gray-100 hover:bg-red-500 hover:text-white text-gray-400 rounded-full w-8 h-8 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all"
                                            title="삭제"
                                        >
                                            <span className="text-lg leading-none">×</span>
                                        </button>

                                        <div className="flex justify-between items-end border-t border-gray-50 pt-3">
                                            <div className="flex-1 min-w-0 mr-2">
                                                <div className="font-semibold text-gray-800 text-sm truncate">
                                                    {card.name}
                                                </div>
                                                <div className="text-xs text-gray-400 truncate">
                                                    {displayTab === "all" && cardSet && SET_NAME[cardSet]}
                                                </div>
                                            </div>
                                            <div className="bg-red-50 text-red-600 text-xs font-bold px-2 py-1 rounded-full whitespace-nowrap">
                                                {card.count}회
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </motion.div>
                )}

                {/* Back Button */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.6, duration: 0.6 }}
                    className="mt-8 text-center"
                >
                    <Link
                        href={isSetSpecific ? `/set/${setParam}` : "/"}
                        className="inline-block px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold rounded-xl transition-colors"
                    >
                        ← {isSetSpecific ? "세트로 돌아가기" : "홈으로"}
                    </Link>
                </motion.div>
            </main>
        </div >
    );
}
