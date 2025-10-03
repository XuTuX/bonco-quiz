// pages/set/[id].tsx
import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/router';

type BatchChoice = 10 | 20 | 30 | 40 | 50 | 'all';
const BATCH_OPTIONS: BatchChoice[] = [10, 20, 30, 40, 50, 'all'];

export default function SetHubPage() {
  const router = useRouter();
  const { id } = router.query;
  const [batchChoice, setBatchChoice] = useState<BatchChoice>(BATCH_OPTIONS[0]);

  const setName = id === '1-1' ? '본1-1학기 2차수시' : '본1-2학기 1차수시';

  if (!id) {
    return <div>Loading...</div>;
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-4">
      <h1 className="text-3xl font-bold mb-4">{setName}</h1>
      <p className="text-xl font-semibold mb-6">한 세트에 몇 장씩 학습할까요?</p>

      {/* 배치 선택 */}
      <div className="flex flex-wrap justify-center gap-3 mb-6">
        {BATCH_OPTIONS.map((n) => (
          <button
            key={n}
            onClick={() => setBatchChoice(n)}
            className={`
            px-4 py-2 rounded-lg border transition
            ${batchChoice === n
                ? 'bg-blue-500 text-white'
                : 'bg-white text-gray-800 hover:bg-gray-100'
              }
          `}
          >
            {n === 'all' ? '전체' : `${n}개`}
          </button>
        ))}
      </div>

      {/* 액션 버튼들 */}
      <div className="flex flex-col items-center gap-4">
        {/* 학습 시작 */}
        <Link
          href={`/learn?set=${id}&size=${batchChoice}`}
          className="px-6 py-3 rounded-lg text-white transition bg-green-500 hover:bg-green-600"
        >
          학습 시작
        </Link>

        {/* 전체 카드 미리보기 */}
        <Link
          href={`/preview-${id}`}
          className="inline-block px-6 py-3 rounded-lg bg-purple-500 hover:bg-purple-600 text-white transition-colors"
        >
          전체 카드 미리보기
        </Link>

        {/* 초성별 랜덤 퀴즈 */}
        <Link
          href={`/quiz?set=${id}`}
          className="inline-block px-6 py-3 rounded-lg bg-yellow-400 hover:bg-yellow-500 text-white font-semibold"
        >
          ✨ 초성별 랜덤 퀴즈로 가기
        </Link>
      </div>
      
      <div className="mt-8">
        <Link href="/" className="text-gray-500 hover:text-gray-700">← 세트 선택으로 돌아가기</Link>
      </div>
    </div>
  );
}
