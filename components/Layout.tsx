// components/Layout.tsx
import Link from "next/link";
import { ReactNode } from "react";

export default function Layout({ children }: { children: ReactNode }) {
    return (
        <div className="min-h-screen bg-gray-50">
            {/* 헤더 */}
            <header className="w-full p-4 bg-white shadow-sm flex justify-between items-center">
                <div className="text-lg font-semibold text-gray-700">
                    본초 2차 수시 화이팅!
                </div>
                <Link
                    href="/"
                    className="px-3 py-1 bg-gray-200 hover:bg-gray-300 rounded"
                >
                    HOME
                </Link>
            </header>

            {/* 본문 */}
            <main className="p-4">
                {children}
            </main>
        </div>
    );
}
