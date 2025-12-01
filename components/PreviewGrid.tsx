import React, { useState } from 'react';
import Image from 'next/image';
import { imageMap } from '@/utils/imageMap';

interface PreviewGridProps {
    files: string[];
    useImageMap?: boolean;
}

export default function PreviewGrid({ files, useImageMap = false }: PreviewGridProps) {
    const [flipped, setFlipped] = useState<Set<string>>(new Set());

    const toggle = (f: string) => {
        setFlipped((prev) => {
            const next = new Set(prev);
            next.has(f) ? next.delete(f) : next.add(f);
            return next;
        });
    };

    return (
        <div
            className="grid gap-8 p-6 w-full max-w-screen-xl
                 xl:grid-cols-3 lg:grid-cols-3 md:grid-cols-2 sm:grid-cols-1 grid-cols-1
                 select-none"
        >
            {files.map((f) => {
                const isFlipped = flipped.has(f);
                const label = f.substring(f.lastIndexOf('/') + 1).replace(/\.(jpe?g|png)$/i, "");
                const imgSrc = useImageMap ? imageMap[f] : `/images/${f}`;

                return (
                    <div
                        key={f}
                        className="group relative h-80 w-full cursor-pointer perspective-1000"
                        onClick={() => toggle(f)}
                    >
                        <div
                            className="relative h-full w-full rounded-3xl shadow-xl hover:shadow-2xl"
                            style={{
                                transformStyle: "preserve-3d",
                                transform: `rotateY(${isFlipped ? 180 : 0}deg)`,
                                transition: "none", // ✔ 애니메이션 제거 (즉시 flip)
                            }}
                        >
                            {/* Front */}
                            <div
                                className="absolute inset-0 h-full w-full rounded-3xl bg-white/80 backdrop-blur-sm border border-white/40 overflow-hidden"
                                style={{ backfaceVisibility: "hidden" }}
                            >
                                {imgSrc ? (
                                    <Image
                                        src={imgSrc}
                                        alt={label}
                                        fill
                                        className="object-contain p-6"
                                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                        placeholder="empty"
                                    />
                                ) : (
                                    <div className="flex items-center justify-center h-full text-gray-400">
                                        No Image
                                    </div>
                                )}
                            </div>

                            {/* Back */}
                            <div
                                className="absolute inset-0 h-full w-full rounded-3xl bg-gradient-to-br from-white/90 to-blue-50/90 backdrop-blur-md border border-white/50 flex items-center justify-center p-8 text-center"
                                style={{
                                    backfaceVisibility: "hidden",
                                    transform: "rotateY(180deg)",
                                }}
                            >
                                <span className="text-2xl font-bold text-gray-800 break-keep leading-snug tracking-tight">
                                    {label}
                                </span>
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
