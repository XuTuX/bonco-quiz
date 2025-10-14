// components/Layout.tsx
import { ReactNode } from "react";
import { Analytics } from "@vercel/analytics/next";
import { useRouter, usePathname } from "next/navigation";


export default function Layout({ children }: { children: ReactNode }) {
    const router = useRouter();
    const pathname = usePathname();


    const goBack = () => {
        if (pathname !== '/') {
            router.back();

        } else {
            return;
        }
    }
    return (
        <div className="min-h-screen bg-gray-50">
            {/* 헤더 */}
            <header className="w-full p-4 bg-white shadow-sm flex justify-between items-center">
                <div className="text-lg font-semibold text-gray-700">
                    본초 수시 화이팅!
                </div>
                <button
                    onClick={goBack}
                    className="px-3 py-1 bg-gray-200 hover:bg-gray-300 rounded"
                >
                    이전으로
                </button>
            </header>

            {/* 홍보 배너 */}
            <div className="bg-gradient-to-r from-blue-100 to-teal-100 p-3 text-center shadow-sm">
                <a href="https://www.quizpick.org" target="_blank" rel="noopener noreferrer" className="font-semibold text-gray-700 hover:text-blue-700 transition-colors">
                    ✨ 시험공부에 AI를 활용한 퀴즈로 하고 싶다면?
                </a>
            </div>

            {/* 본문 */}
            <main className="p-4">
                {children}
            </main>
            {/* Vercel Analytics: 페이지뷰 계측 */}
            <Analytics />
        </div>
    );
}
