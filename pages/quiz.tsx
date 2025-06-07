import { useState } from "react";
import { useRouter } from "next/router";

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
        if (selected.length === 0) return;
        // /quiz/multi 에서 initials 쿼리로 받음
        router.push({
            pathname: "/quiz/multi/[initials]",
            query: { initials: selected.join(",") },
        });

    };

    return (
        <main className="min-h-screen flex flex-col items-center bg-gray-50 p-10">
            <h1 className="text-2xl font-bold mb-6">초성별 퀴즈 선택</h1>

            <div className="grid grid-cols-6 gap-4 mb-6">
                {initials.map(ch => (
                    <button
                        key={ch}
                        onClick={() => toggle(ch)}
                        className={`w-12 h-12 flex items-center justify-center rounded text-lg font-bold transition
              ${selected.includes(ch)
                                ? "bg-blue-500 text-white"
                                : "bg-blue-100 hover:bg-blue-200 text-gray-800"
                            }`}
                    >
                        {ch}
                    </button>
                ))}
            </div>

            <button
                onClick={startQuiz}
                disabled={selected.length === 0}
                className={`px-6 py-3 rounded-lg text-white transition
          ${selected.length > 0 ? "bg-green-500 hover:bg-green-600" : "bg-gray-400 cursor-not-allowed"}`}
            >
                완료 ({selected.length})
            </button>
        </main>
    );
}