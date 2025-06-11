import { useState } from "react";
import { useRouter } from "next/router";
import Layout from '@/components/Layout';

// 선택 가능한 초성 배열
const initials = "ㄱㄴㄷㄹㅁㅂㅅㅇㅈㅊㅋㅌㅍㅎ".split("");

export default function QuizHome() {
    const router = useRouter();
    const [selected, setSelected] = useState<string[]>([]);

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
        if (selected.length === 1) {
            router.push(`/quiz/${selected[0]}`);
        } else {
            router.push({
                pathname: "/quiz/multi/[initials]",
                query: { initials: selected },   // ❗️ string[] 이어야 합니다
            });
        }
    };

    return (
        <Layout>
            <main className="flex flex-col items-center p-6 pt-12 text-white">
                <h1 className="text-4xl font-bold mb-10 text-white text-center">초성별 퀴즈 선택</h1>

                <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 gap-4 mb-10">
                    {initials.map(ch => (
                        <button
                            key={ch}
                            onClick={() => toggle(ch)}
                            className={`w-16 h-16 flex items-center justify-center rounded text-xl font-bold transition
              ${selected.includes(ch)
                                ? "bg-yellow-400 text-gray-900 shadow-lg"
                                : "bg-white bg-opacity-20 hover:bg-opacity-30 text-white border border-white border-opacity-30 shadow-md"
                            }`}
                        >
                            {ch}
                        </button>
                    ))}
                </div>

                <button
                    onClick={startQuiz}
                    disabled={selected.length === 0}
                    className={`px-8 py-4 rounded-xl text-lg font-semibold transition text-white shadow-md
          ${selected.length > 0 ? "bg-green-500 hover:bg-green-600" : "bg-gray-500 bg-opacity-50 text-gray-300 cursor-not-allowed"}`}
                >
                    완료 ({selected.length})
                </button>
            </main>
        </Layout>
    );
}