// pages/preview-1-1.tsx
import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { getChoseong } from "@/utils/hangul";
import { imageMap } from "@/utils/imageMap";

/* ────────── 작은 컴포넌트들 ────────── */

/** 썸네일 ↔ 라벨 토글 그리드 */
function PreviewGrid({ files }: { files: string[] }) {
    const [flipped, setFlipped] = useState<Set<string>>(new Set());

    const toggle = (f: string) =>
        setFlipped((prev) => {
            const next = new Set(prev);
            if (next.has(f)) {
                next.delete(f);
            } else next.add(f);
            return next;
        });

    return (
        <div
            className="grid gap-4 p-6 w-full max-w-screen-xl
                 xl:grid-cols-2 lg:grid-cols-2 sm:grid-cols-1 grid-cols-2
                 select-none"
        >
            {files.map((f) => {
                const isFlipped = flipped.has(f);
                const label = f.substring(f.lastIndexOf('/') + 1).replace(/\.(jpe?g|png)$/i, "");
                return (
                    <div
                        key={f}
                        onClick={() => toggle(f)}
                        className="aspect-square border rounded-xl shadow-sm
                       flex items-center justify-center cursor-pointer bg-black/20

                       hover:shadow-md transition"
                    >
                        {isFlipped ? (
                            <span className="text-3xl font-bold text-gray-800 text-center px-10 leading-tight">
                                {label}
                            </span>
                        ) : (
                            <Image
                                src={imageMap[f]}
                                alt={label}
                                className="object-contain max-h-full w-auto h-auto"
                                sizes="(max-width: 640px) 90vw, (max-width: 1024px) 45vw, 30vw"
                                placeholder="blur"
                            />
                        )}
                    </div>
                );
            })}
        </div>
    );
}

/** 우측 초성 사이드 내비게이션 */
function SideNav({ initials }: { initials: string[] }) {
    return (
        <nav
            className="hidden lg:flex flex-col gap-2
                 fixed top-1/2 right-4 -translate-y-1/2
                 bg-white/80 backdrop-blur rounded-xl p-3 shadow-lg"
        >
            {initials.map((ch) => (
                <a
                    key={ch}
                    href={`#${ch}`}
                    className="w-6 h-6 flex items-center justify-center
                     text-sm font-semibold text-gray-700
                     hover:bg-blue-100 rounded"
                >
                    {ch}
                </a>
            ))}
        </nav>
    );
}

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
            <div className="min-h-screen flex items-center justify-center text-lg text-gray-500">
                이미지 목록 로딩 중…
            </div>
        );
    }

    const sections = groupByChoseong(files);
    const initials = sections.map(([ch]) => ch); // 사이드바용 ㄱ~ㅎ

    return (
        <main className="min-h-screen flex flex-col items-center bg-gray-50 scroll-smooth">
            <h1 className="text-2xl font-bold mt-8 mb-4">본1-1학기 2차수시</h1>

            <Link
                href="/"
                className="mt-6 inline-flex items-center gap-2 px-6 py-3 rounded-lg
                   bg-blue-500 hover:bg-blue-600 text-white transition-colors"
            >
                ← 홈으로 돌아가기
            </Link>

            {/* 우측 초성 내비게이션 (lg 이상) */}
            <SideNav initials={initials} />

            {/* 초성별 섹션 */}
            {sections.map(([ch, list]) => (
                <section
                    id={ch}
                    key={ch}
                    className="w-full max-w-screen-xl mb-12 scroll-mt-24"
                >
                    <h2 className="sticky top-0 bg-gray-50 text-xl font-bold mb-4">
                        {ch}
                    </h2>
                    <PreviewGrid files={list} />
                </section>
            ))}

            <p className="mt-6 mb-10 text-gray-500 text-sm">
                이미지를 클릭하면 이름 ↔ 그림이 토글됩니다.
            </p>
        </main>
    );
}
