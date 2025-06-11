// components/Layout.tsx
import Link from "next/link";
import { ReactNode } from "react";
import { Analytics } from "@vercel/analytics/next";

export default function Layout({ children }: { children: ReactNode }) {
    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-400 to-indigo-600">
            {/* 헤더 */}
            <header className="w-full p-4 bg-opacity-50 bg-black shadow-md flex justify-between items-center">
                <div className="text-xl font-bold text-white">
                    My Quiz App
                </div>
                <Link
                    href="/"
                    className="px-4 py-2 bg-yellow-400 hover:bg-yellow-500 text-gray-800 font-semibold rounded-lg shadow"
                >
                    HOME
                </Link>
            </header>

            {/* 본문 */}
            <main className="p-4">
                {children}
            </main>
            {/* Vercel Analytics: 페이지뷰 계측 */}
            <Analytics />
        </div>
    );
}
