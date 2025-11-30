// pages/preview-1-1.tsx
import Link from "next/link";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { getChoseong } from "@/utils/hangul";
import PreviewGrid from "@/components/PreviewGrid";
import SideNav from "@/components/SideNav";
import Background from "@/components/Background";

/* ────────── 유틸 ────────── */
function groupByChoseong(files: string[]) {
    const map: Record<string, string[]> = {};
    files.forEach((f) => {
        const label = f.substring(f.lastIndexOf('/') + 1).replace(/\.(jpe?g|png)$/i, "");
        const key = getChoseong(label);
        if (!map[key]) map[key] = [];
        map[key]!.push(f);
    });
    // ㄱ→ㅎ / A→Z
    return Object.entries(map).sort(([a], [b]) => a.localeCompare(b, "ko"));
}

/* ────────── 메인 페이지 컴포넌트 ────────── */
export default function PreviewPage() {
    const [files, setFiles] = useState<string[]>([]);

    useEffect(() => {
        fetch("/imageList-1-1.json")
            .then((res) => res.json())
            .then((data: string[]) => setFiles(data));
    }, []);

    if (!files.length) {
        return (
            <div className="min-h-screen flex items-center justify-center text-lg text-gray-500 font-medium animate-pulse">
                이미지 목록 로딩 중…
            </div>
        );
    }

    const sections = groupByChoseong(files);
    const initials = sections.map(([ch]) => ch); // 사이드바용 ㄱ~ㅎ

    return (
        <div className="relative min-h-screen overflow-hidden">
            <Background />

            <main className="relative z-10 min-h-screen flex flex-col items-center scroll-smooth pb-32">
                <motion.header
                    initial={{ y: -100, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.6, ease: "easeOut" }}
                    className="w-full bg-white/60 backdrop-blur-xl border-b border-white/20 shadow-sm py-6 mb-12 sticky top-0 z-40"
                >
                    <div className="max-w-screen-xl mx-auto px-8 flex items-center justify-between">
                        <h1 className="text-2xl font-bold text-gray-800 tracking-tight">본1-1학기 2차수시</h1>
                        <Link
                            href="/"
                            className="text-sm font-semibold text-gray-600 hover:text-blue-600 transition-colors px-4 py-2 rounded-full hover:bg-white/50"
                        >
                            ← 홈으로 돌아가기
                        </Link>
                    </div>
                </motion.header>

                {/* 우측 초성 내비게이션 (lg 이상) */}
                <SideNav initials={initials} />

                {/* 초성별 섹션 */}
                <div className="w-full max-w-screen-xl px-6">
                    {sections.map(([ch, list], idx) => (
                        <motion.section
                            initial={{ opacity: 0, y: 50 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, margin: "-100px" }}
                            transition={{ duration: 0.6, delay: idx * 0.1 }}
                            id={ch}
                            key={ch}
                            className="mb-24 scroll-mt-32"
                        >
                            <div className="flex items-center gap-4 mb-8 border-b border-gray-200/50 pb-4">
                                <h2 className="text-4xl font-black text-gray-300/80 select-none">
                                    {ch}
                                </h2>
                                <span className="text-sm text-gray-500 font-medium bg-white/50 px-3 py-1 rounded-full backdrop-blur-sm">
                                    {list.length} items
                                </span>
                            </div>
                            <PreviewGrid files={list} useImageMap={true} />
                        </motion.section>
                    ))}
                </div>

                <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1, duration: 1 }}
                    className="mt-10 text-gray-500 text-sm font-medium text-center bg-white/40 px-6 py-2 rounded-full backdrop-blur-sm"
                >
                    카드를 클릭하면 이름과 그림이 뒤집힙니다.
                </motion.p>
            </main>
        </div>
    );
}
