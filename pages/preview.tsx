import Link from "next/link";   // ★ 추가
import { useEffect, useState } from "react";
import Image from "next/image";



/* ────────── 미리보기 그리드 ────────── */
function PreviewGrid({ files }: { files: string[] }) {
    const [flipped, setFlipped] = useState<Set<string>>(new Set());
    const toggle = (f: string) =>
        setFlipped((p) => {
            const n = new Set(p);
            if (n.has(f)) {
                n.delete(f);
            } else {
                n.add(f);
            }
            return n;
        });


    return (
        <div
            className="
        grid gap-4 p-6 w-full  max-w-screen-xl
        xl:grid-cols-2 lg:grid-cols-2 md:grid-cols-1 sm:grid-cols-1 grid-cols-2
      "
        >
            {files.map((f) => {
                const isFlipped = flipped.has(f);
                const label = f.replace(/\.(jp(e?)g|png)$/i, "");

                return (
                    <div
                        key={f}
                        onClick={() => toggle(f)}
                        className="
              aspect-square border rounded-xl shadow-sm
              flex items-center justify-center cursor-pointer bg-white
              hover:shadow-md transition
            "
                    >
                        {isFlipped ? (
                            <span className="text-3xl font-bold text-gray-800 text-center px-10 leading-tight">
                                {label}
                            </span>
                        ) : (
                            <img
                                src={`/images/${f}`}
                                alt={label}
                                width={1500}
                                height={1500}
                                className="object-contain max-h-full"
                                loading="lazy"
                            />
                        )}
                    </div>
                );
            })}
        </div>
    );
}

/* ────────── 페이지 컴포넌트 ────────── */
export default function PreviewPage() {
    const [files, setFiles] = useState<string[]>([]);

    // eslint-disable-next-line react-hooks/exhaustive-deps
    useEffect(() => {
        fetch('/imageList.json')
            .then(r => r.json())
            .then((d: string[]) => setFiles(d));
    }, []);


    if (files.length === 0)
        return (
            <div className="min-h-screen flex items-center justify-center text-lg text-gray-500">
                이미지 목록 로딩 중…
            </div>
        );

    return (
        <main className="min-h-screen flex flex-col items-center bg-gray-50">
            <h1 className="text-2xl font-bold mt-8 mb-4">전체 카드 미리보기</h1>
            {/* ➡️ 홈으로 돌아가는 버튼 */}
            <Link
                href="/"
                className="mt-6 inline-flex items-center gap-2
             px-6 py-3 rounded-lg
             bg-blue-500 hover:bg-blue-600 text-white
             transition-colors"
            >
                ← 홈으로 돌아가기
            </Link>
            <PreviewGrid files={files} />
            <p className="mt-6 mb-10 text-gray-500 text-sm">
                이미지를 클릭하면 이름 ↔ 그림이 토글됩니다.
            </p>
        </main>
    );
}
