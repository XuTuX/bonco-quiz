// pages/index.tsx
import Link from "next/link";
import { useState } from "react";

type BatchChoice = 10 | 20 | 30 | 40 | 50 | "all";
const BATCH_OPTIONS: BatchChoice[] = [10, 20, 30, 40, 50, "all"];

export default function Home() {
  const [batchChoice, setBatchChoice] = useState<BatchChoice>(BATCH_OPTIONS[0]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-4">
      <h1 className="text-xl font-semibold mb-6">한 세트에 몇 장씩 학습할까요?</h1>

      return (
      {/* 배치 선택 */}
      <div className="flex flex-wrap justify-center gap-3 mb-6">
        {BATCH_OPTIONS.map((n) => (
          <button
            key={n}
            onClick={() => setBatchChoice(n)}    // <-- no more `as any`
            className={`
            px-4 py-2 rounded-lg border transition
            ${batchChoice === n
                ? "bg-blue-500 text-white"
                : "bg-white text-gray-800 hover:bg-gray-100"
              }
          `}
          >
            {n === "all" ? "전체" : `${n}개`}
          </button>
        ))}
      </div>
      );

      {/* 액션 버튼들 */}
      <div className="flex flex-col items-center gap-4">
        {/* 학습 시작 (새 페이지로 이동) */}
        <Link
          href={batchChoice ? `/learn?size=${batchChoice}` : "#"}
          className={`px-6 py-3 rounded-lg text-white transition
            ${batchChoice
              ? "bg-green-500 hover:bg-green-600"
              : "bg-gray-400 cursor-not-allowed pointer-events-none"
            }`}
        >
          학습 시작
        </Link>

        {/* 전체 카드 미리보기 */}
        <Link
          href="/preview"
          className="inline-block px-6 py-3 rounded-lg bg-purple-500 hover:bg-purple-600 text-white transition-colors"
        >
          전체 카드 미리보기
        </Link>

        {/* 초성별 랜덤 퀴즈 */}
        <Link
          href="/quiz"
          className="inline-block px-6 py-3 rounded-lg bg-yellow-400 hover:bg-yellow-500 text-white font-semibold"
        >
          ✨ 초성별 랜덤 퀴즈로 가기
        </Link>
      </div>
    </div>
  );
}
