// pages/set/[id].tsx
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { motion } from 'framer-motion';
import Background from '@/components/Background';
import { getWrongAnswerStats } from '@/utils/wrongAnswers';

type BatchChoice = 10 | 20 | 30 | 40 | 50 | 'all';
const BATCH_OPTIONS: BatchChoice[] = [10, 20, 30, 40, 50, 'all'];

const SET_META: Record<
  string,
  { title: string; previewPath: string; desc: string }
> = {
  '1-1': {
    title: '본1-1학기 2차수시',
    previewPath: '/preview-1-1',
    desc: '총 123개의 본초 이미지',
  },
  '1-2': {
    title: '본1-2학기 1차수시',
    previewPath: '/preview-1-2',
    desc: '총 99개의 본초 이미지',
  },
  '1-3': {
    title: '본1-2학기 2차수시',
    previewPath: '/preview-1-3',
    desc: '총 101개의 본초 이미지',
  },
};

export default function SetHubPage() {
  const router = useRouter();
  const { id } = router.query;
  const [batchChoice, setBatchChoice] = useState<BatchChoice>(BATCH_OPTIONS[0]);
  const [wrongCount, setWrongCount] = useState(0);

  useEffect(() => {
    if (id) {
      const stats = getWrongAnswerStats(id as string);
      setWrongCount(stats.totalCards);
    }
  }, [id]);

  if (!id) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-gray-500">로딩 중...</div>
      </div>
    );
  }

  const meta = SET_META[id as string];
  if (!meta) {
    return (
      <div className="relative min-h-screen overflow-hidden flex flex-col items-center justify-center p-6">
        <Background />
        <div className="relative z-10 text-center">
          <p className="text-lg font-semibold text-red-600 mb-4">알 수 없는 세트입니다.</p>
          <Link href="/" className="text-blue-600 hover:text-blue-800 font-medium">
            ← 홈으로 돌아가기
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen overflow-hidden">
      <Background />

      <main className="relative z-10 min-h-screen flex flex-col items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl md:text-5xl font-black text-gray-800 mb-2">{meta.title}</h1>
          <p className="text-gray-600 font-medium">{meta.desc}</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="w-full max-w-2xl bg-white/80 backdrop-blur-xl rounded-2xl shadow-2xl p-8 mb-8"
        >
          <h2 className="text-xl font-bold text-gray-800 mb-6 text-center">학습 방식을 선택하세요</h2>

          {/* Batch Size Selection */}
          <div className="mb-8">
            <p className="text-sm font-semibold text-gray-700 mb-3">한 세트에 몇 장씩 학습할까요?</p>
            <div className="flex flex-wrap gap-3">
              {BATCH_OPTIONS.map((n) => (
                <button
                  key={n}
                  onClick={() => setBatchChoice(n)}
                  className={`px-4 py-2 rounded-lg font-semibold transition-all ${batchChoice === n
                    ? 'bg-blue-500 text-white shadow-md scale-105'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                >
                  {n === 'all' ? '전체' : `${n}개`}
                </button>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="grid gap-4">
            <Link
              href={`/learn?set=${id}&size=${batchChoice}`}
              className="block px-6 py-4 rounded-xl text-white font-bold text-center transition-all bg-gradient-to-r from-green-400 to-green-600 hover:from-green-500 hover:to-green-700 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              📚 학습 시작
            </Link>

            <Link
              href={meta.previewPath}
              className="block px-6 py-4 rounded-xl text-white font-bold text-center transition-all bg-gradient-to-r from-purple-400 to-purple-600 hover:from-purple-500 hover:to-purple-700 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              👁️ 전체 카드 미리보기
            </Link>

            <Link
              href={`/quiz?set=${id}`}
              className="block px-6 py-4 rounded-xl text-white font-bold text-center transition-all bg-gradient-to-r from-yellow-400 to-yellow-600 hover:from-yellow-500 hover:to-yellow-700 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              ✨ 초성별 랜덤 퀴즈
            </Link>

            <Link
              href={`/wrong-answers?set=${id}`}
              className="relative block px-6 py-4 rounded-xl text-white font-bold text-center transition-all bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              📝 오답 노트
              {wrongCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-yellow-400 text-red-900 text-xs font-bold rounded-full w-7 h-7 flex items-center justify-center animate-pulse">
                  {wrongCount}
                </span>
              )}
            </Link>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          <Link href="/" className="text-gray-500 hover:text-gray-700 font-medium">
            ← 홈으로 돌아가기
          </Link>
        </motion.div>
      </main>
    </div>
  );
}
