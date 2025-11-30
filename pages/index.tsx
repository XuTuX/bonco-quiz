// pages/index.tsx
import Link from 'next/link';

const SETS = [
  {
    id: '1-1',
    title: '본1-1학기 2차수시',
    color: 'bg-blue-500 hover:bg-blue-600',
    status: '✅ imageList-1-1.json (NFC) 생성 완료',
  },
  {
    id: '1-2',
    title: '본1-2학기 1차수시',
    color: 'bg-teal-500 hover:bg-teal-600',
    status: '✅ imageList-1-2.json (NFC) 생성 완료',
  },
  {
    id: '1-3',
    title: '본초 세트 1-3 (NFC)',
    color: 'bg-indigo-500 hover:bg-indigo-600',
    status: '✅ imageList-1-3.json (NFC) 생성 완료',
  },
];

export default function RootPage() {
  return (
    <div className="flex flex-col items-center min-h-screen bg-gray-50 p-6">
      <h1 className="text-3xl font-bold mb-4">학습할 본초 세트를 선택하세요</h1>
      <p className="text-gray-600 mb-8 text-center">
        최신 목록 반영: <span className="font-semibold text-green-600">✅ imageList-1-3.json (NFC) 생성 완료</span>
      </p>

      <div className="grid gap-4 w-full max-w-2xl">
        {SETS.map(({ id, title, color, status }) => (
          <Link
            key={id}
            href={`/set/${id}`}
            className={`block px-6 py-5 rounded-lg text-xl text-center font-semibold text-white transition-colors shadow-sm ${color}`}
          >
            <div>{title}</div>
            <div className="text-sm mt-1 text-white/90">{status}</div>
          </Link>
        ))}
      </div>
    </div>
  );
}
