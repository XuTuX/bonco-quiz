import React, { useState } from 'react';
import Image from 'next/image';
import { imageMap } from '@/utils/imageMap';

interface PreviewGridProps {
    files: string[];
    useImageMap?: boolean;
}

export default function PreviewGrid({ files, useImageMap = false }: PreviewGridProps) {
    const [opened, setOpened] = useState<Set<string>>(new Set());

    const toggle = (f: string) => {
        setOpened((prev) => {
            const next = new Set(prev);
            if (next.has(f)) {
                next.delete(f);
            } else {
                next.add(f);
            }
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
                const isOpen = opened.has(f);
                const label = f.substring(f.lastIndexOf('/') + 1).replace(/\.(jpe?g|png)$/i, "");
                const imgSrc = useImageMap ? imageMap[f] : `/images/${f}`;

                return (
                    <div
                        key={f}
                        className="relative h-80 w-full rounded-3xl shadow-lg hover:shadow-xl border border-gray-200 cursor-pointer bg-white/70 backdrop-blur-sm transition-all"
                        onClick={() => toggle(f)}
                    >
                        {/* 이미지 영역 */}
                        {!isOpen && (
                            <div className="absolute inset-0 flex items-center justify-center p-6">
                                <Image
                                    src={imgSrc}
                                    alt={label}
                                    fill
                                    className="object-contain"
                                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                    placeholder={undefined}
                                />
                            </div>
                        )}

                        {/* 텍스트 영역 */}
                        {isOpen && (
                            <div className="absolute inset-0 flex items-center justify-center p-8 text-center">
                                <span className="text-2xl font-bold text-gray-800 break-keep leading-snug">
                                    {label}
                                </span>
                            </div>
                        )}
                    </div>
                );
            })}
        </div>
    );
}
