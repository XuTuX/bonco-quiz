// pages/index.tsx
import Link from "next/link";
import { useState } from "react";
import Layout from '@/components/Layout';

type BatchChoice = 10 | 20 | 30 | 40 | 50 | "all";
const BATCH_OPTIONS: BatchChoice[] = [10, 20, 30, 40, 50, "all"];

export default function Home() {
  const [batchChoice, setBatchChoice] = useState<BatchChoice>(BATCH_OPTIONS[0]);

  return (
    <Layout>
      <div className="flex flex-col items-center p-4 pt-20 text-white text-center">
        <h1 className="text-4xl font-bold mb-10 text-white">한 세트에 몇 장씩 학습할까요?</h1>


        {/* 배치 선택 */}
        <div className="flex flex-wrap justify-center gap-3 mb-10">
        {BATCH_OPTIONS.map((n) => (
          <button
            key={n}
            onClick={() => setBatchChoice(n)}    // <-- no more `as any`
            className={`
            px-5 py-3 rounded-lg border transition
            ${batchChoice === n
                ? "bg-yellow-400 text-gray-900 font-semibold shadow-md"
                : "bg-white bg-opacity-20 hover:bg-opacity-30 text-white font-semibold border border-white border-opacity-30 shadow-sm"
              }
          `}
          >
            {n === "all" ? "전체" : `${n}개`}
          </button>
        ))}
      </div>


      {/* 액션 버튼들 */}
        <div className="flex flex-col items-center gap-6">
        {/* 학습 시작 (새 페이지로 이동) */}
        <Link
          href={batchChoice ? `/learn?size=${batchChoice}` : "#"}
            className={`px-8 py-4 rounded-xl text-lg text-white transition
            ${batchChoice
              ? "bg-green-500 hover:bg-green-600 font-semibold shadow-md"
              : "bg-gray-400 cursor-not-allowed pointer-events-none" // Disabled state remains, can be styled further if needed
            }`}
        >
          학습 시작
        </Link>

        {/* 전체 카드 미리보기 */}
        <Link
          href="/preview"
            className="inline-block px-8 py-4 rounded-xl text-lg bg-indigo-500 hover:bg-indigo-600 text-white font-semibold shadow-md transition-colors"
        >
          전체 카드 미리보기
        </Link>

        {/* 초성별 랜덤 퀴즈 */}
        <Link
          href="/quiz"
            className="inline-block px-8 py-4 rounded-xl text-lg bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-bold shadow-md"
        >
          ✨ 초성별 랜덤 퀴즈로 가기
        </Link>
      </div>
    </Layout>
  );
}
