// pages/index.tsx
import Link from 'next/link';
import { motion } from 'framer-motion';
import Background from '@/components/Background';

const SETS = [
  {
    id: '1-1',
    title: '본1-1학기 2차수시',
    desc: '총 123개의 본초 이미지',
    gradient: 'from-blue-400 to-blue-600',
  },
  {
    id: '1-2',
    title: '본1-2학기 1차수시',
    desc: '총 99개의 본초 이미지',
    gradient: 'from-teal-400 to-teal-600',
  },
  {
    id: '1-3',
    title: '본1-2학기 2차수시',
    desc: '총 319개의 본초 이미지',
    gradient: 'from-indigo-400 to-indigo-600',
  },
];

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 }
};

export default function RootPage() {
  return (
    <div className="relative min-h-screen overflow-hidden flex flex-col items-center justify-center p-6">
      <Background />

      <main className="relative z-10 w-full max-w-4xl flex flex-col items-center">
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="text-center mb-16"
        >
          <h1 className="text-5xl md:text-6xl font-black text-gray-800 tracking-tight mb-4">
            Bonco Gallery
          </h1>
          <p className="text-xl text-gray-600 font-medium">
            학습할 본초 세트를 선택하세요
          </p>
        </motion.div>

        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="grid gap-6 w-full max-w-lg"
        >
          {SETS.map(({ id, title, desc, gradient }) => (
            <motion.div key={id} variants={item}>
              <Link
                href={`/set/${id}`}
                className="group block relative overflow-hidden rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 bg-white"
              >
                <div className={`absolute inset-0 bg-gradient-to-r ${gradient} opacity-90 transition-opacity group-hover:opacity-100`} />
                <div className="absolute inset-0 bg-white/10 group-hover:bg-transparent transition-colors" />

                <div className="relative p-8 flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold text-white mb-1">{title}</h2>
                    <p className="text-white/80 font-medium text-sm">{desc}</p>
                  </div>
                  <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm group-hover:scale-110 transition-transform">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </motion.div>

        <motion.footer
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 1 }}
          className="mt-20 text-gray-400 text-sm font-medium"
        >
          © 2025 Bonco Image Site
        </motion.footer>
      </main>
    </div>
  );
}
