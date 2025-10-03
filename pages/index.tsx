// pages/index.tsx
import Link from 'next/link';

export default function RootPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-4">
      <h1 className="text-3xl font-bold mb-8">학습할 본초 세트를 선택하세요</h1>
      <div className="flex flex-col gap-6">
        <Link href="/set/1-1" className="block px-10 py-6 rounded-lg text-xl text-center font-semibold text-white bg-blue-500 hover:bg-blue-600 transition-colors">
          본1-1학기 2차수시
        </Link>
        <Link href="/set/1-2" className="block px-10 py-6 rounded-lg text-xl text-center font-semibold text-white bg-teal-500 hover:bg-teal-600 transition-colors">
          본1-2학기 1차수시
        </Link>
      </div>
    </div>
  );
}