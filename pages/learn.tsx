// pages/learn.tsx
import { useRouter } from 'next/router';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';

type Phase = 'learn' | 'batch-done' | 'all-done';
type BatchChoice = number | 'all';

// 배열을 무작위로 섞는 헬퍼
function shuffle<T>(arr: T[]) {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
}

export default function Learn() {
    const router = useRouter();
    const { size } = router.query;

    const [batchChoice, setBatchChoice] = useState<BatchChoice | null>(null);
    const [allCards, setAllCards] = useState<string[]>([]);
    const [phase, setPhase] = useState<Phase>('learn');
    const [batchIndex, setBatchIndex] = useState(0);
    const [currentSet, setCurrentSet] = useState<string[]>([]);
    const [curr, setCurr] = useState(0);
    const [wrongBatch, setWrongBatch] = useState<string[]>([]);
    const [wrongTotal, setWrongTotal] = useState<string[]>([]);
    const [show, setShow] = useState(false);
    const [lock, setLock] = useState(false);
    const [imgLoaded, setImgLoaded] = useState(false);
    const [initialized, setInitialized] = useState(false);

    // 1) 파라미터 체크 & 이미지 목록 로드 → 첫 배치 세팅
    useEffect(() => {
        if (!router.isReady || initialized) return;

        let bc: BatchChoice | null = null;
        if (typeof size === 'string') {
            if (size === 'all') bc = 'all';
            else if (!isNaN(Number(size))) bc = Number(size);
        }
        if (bc === null) {
            router.replace('/');
            return;
        }
        setBatchChoice(bc);

        fetch('/imageList.json')
            .then((r) => r.json())
            .then((data: string[]) => {
                const cards = shuffle(data);
                setAllCards(cards);

                const batchSize = bc === 'all' ? cards.length : bc;
                setCurrentSet(cards.slice(0, batchSize));
                setWrongBatch([]);
                setWrongTotal([]);
                setCurr(0);
                setPhase('learn');
                setInitialized(true);
            });
    }, [router.isReady, size, initialized, router]);

    // 2) 카드 전환 시 로딩 리셋
    useEffect(() => setImgLoaded(false), [curr]);

    // 3) 다음 카드 미리 로드
    useEffect(() => {
        if (typeof window === 'undefined') return;
        if (currentSet.length && curr + 1 < currentSet.length) {
            new window.Image().src = `/images/${currentSet[curr + 1]}`;
        }
    }, [currentSet, curr]);

    // 4) 세트 완료 감지
    useEffect(() => {
        if (phase === 'learn' && curr >= currentSet.length) {
            setPhase('batch-done');
        }
    }, [curr, currentSet.length, phase]);

    // 5) 키보드 컨트롤
    useEffect(() => {
        const handleKey = (e: KeyboardEvent) => {
            if (lock) return;
            if (phase === 'batch-done') {
                if (e.key === 'ArrowRight') nextBatch();
            } else if (!show) {
                showAns();
            } else {
                if (e.key === 'ArrowLeft') dont();
                if (e.key === 'ArrowRight') know();
            }
        };
        window.addEventListener('keydown', handleKey);
        return () => window.removeEventListener('keydown', handleKey);
    }, [show, lock, phase, curr, currentSet]);

    // Handlers
    const showAns = () => {
        if (lock) return;
        setLock(true);
        setShow(true);
        setTimeout(() => setLock(false), 100);
    };
    const know = () => {
        setShow(false);
        setCurr((i) => i + 1);
    };
    const dont = () => {
        const f = currentSet[curr];
        if (!wrongBatch.includes(f)) setWrongBatch((w) => [...w, f]);
        if (!wrongTotal.includes(f)) setWrongTotal((w) => [...w, f]);
        setShow(false);
        setCurr((i) => i + 1);
    };

    // 다음 배치로 이동
    const nextBatch = () => {
        if (batchChoice === null) return;

        const sizeVal = batchChoice === 'all' ? allCards.length : batchChoice;
        const nextStart = (batchIndex + 1) * sizeVal;

        if (nextStart >= allCards.length) {
            setPhase('all-done');
        } else {
            setCurrentSet(allCards.slice(nextStart, nextStart + sizeVal));
            setBatchIndex((i) => i + 1);
            setCurr(0);
            setWrongBatch([]);
            setPhase('learn');
        }
    };

    // --- 화면 분기 ---
    if (!initialized) return <Center>로딩 중…</Center>;

    /* BATCH DONE */
    if (phase === 'batch-done')
        return (
            <Center>
                <div className="flex flex-col items-center gap-4">
                    <p className="text-lg font-semibold">{batchIndex + 1} 세트 완료!</p>

                    <div className="flex flex-col items-center gap-2 w-full max-w-xs">
                        {wrongBatch.length > 0 &&
                            (batchChoice === 'all' ||
                                (batchIndex + 1) * (batchChoice as number) >= allCards.length) && (
                                <button
                                    onClick={() => {
                                        // 이번 세트 오답만 다시 풀기
                                        setCurrentSet(wrongBatch);
                                        setWrongBatch([]);
                                        setWrongTotal([]);
                                        setCurr(0);
                                        setPhase('learn');
                                    }}
                                    className="w-full px-6 py-3 bg-red-500 hover:bg-red-600 text-white rounded-lg"
                                >
                                    오답만 다시 풀기
                                </button>
                            )}

                        <button
                            onClick={nextBatch}
                            className="w-full px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg"
                        >
                            다음 세트로 넘어가기
                        </button>
                        <Link
                            href="/"
                            className="w-full block text-center px-6 py-3 bg-gray-500 hover:bg-gray-600 text-white rounded-lg"
                        >
                            홈으로 돌아가기
                        </Link>
                    </div>

                    <GridResultBlock title="이번 세트 오답" items={wrongBatch} />
                    <GridResultBlock title="누적 오답" items={wrongTotal} />
                </div>
            </Center>
        );


    if (currentSet.length === 0) return <Center>이미지 로딩 중…</Center>;
    if (curr >= currentSet.length) return <Center>다음 세트를 준비 중…</Center>;

    // 학습 화면
    const total = currentSet.length;
    const prog = curr + 1;
    const pct = (prog / total) * 100;
    const file = currentSet[curr];
    const answer = file.replace(/\.(jp(e?)g|png)$/i, '');
    const disabled = lock || !imgLoaded;

    return (
        <div className="flex flex-col items-center justify-between min-h-screen p-4 bg-gray-50">
            {/* 진행 바 */}
            <div className="w-full max-w-md mb-4">
                <div className="flex justify-between mb-1 font-medium text-green-800">
                    <span>
                        {prog} / {total}
                    </span>
                    <span>{batchIndex + 1} 세트</span>
                </div>
                <div className="w-full h-2 bg-gray-200 rounded-full">
                    <div
                        className="h-full bg-green-400 transition-all"
                        style={{ width: `${pct}%` }}
                    />
                </div>
            </div>

            {/* 카드 */}
            <Card
                file={file}
                answer={answer}
                show={show}
                loaded={imgLoaded}
                onLoad={() => setImgLoaded(true)}
            />

            {/* 버튼 */}
            <Controls
                show={show}
                disabled={disabled}
                know={know}
                dont={dont}
                showAns={showAns}
            />
        </div>
    );
}

// ───────── auxiliary components ─────────
const Center = ({ children }: { children: React.ReactNode }) => (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
        {children}
    </div>
);

function Card({
    file,
    answer,
    show,
    loaded,
    onLoad,
}: {
    file: string;
    answer: string;
    show: boolean;
    loaded: boolean;
    onLoad: () => void;
}) {
    return (
        <div className="w-full max-w-md lg:max-w-2xl xl:max-w-3xl bg-white rounded-xl border-2 border-green-100 shadow-md overflow-hidden">
            <div className="relative w-full aspect-square bg-gray-100">
                {!loaded && <div className="absolute inset-0 animate-pulse bg-gray-200" />}
                <AnimatePresence mode="wait">
                    <motion.div
                        key={file}
                        initial={{ scale: 0.98 }}
                        animate={{ scale: 1 }}
                        exit={{ scale: 0.98 }}
                        transition={{ duration: 0.15 }}
                        className="absolute inset-0 flex items-center justify-center"
                    >
                        <Image
                            src={`/images/${file}`}
                            alt=""
                            width={650}
                            height={650}
                            priority
                            className="object-contain max-h-[70vh]"
                            onLoadingComplete={onLoad}
                        />
                    </motion.div>
                </AnimatePresence>
            </div>
            <div className="p-4 h-12 flex items-center justify-center">
                {show && (
                    <span className="text-xl font-semibold text-blue-600">
                        정답: {answer}
                    </span>
                )}
            </div>
        </div>
    );
}

// 카드 그리드로 오답을 표시하는 컴포넌트

function GridResultBlock({
    title,
    items,
}: {
    title: string;
    items: string[];
}) {
    if (items.length === 0) return null;

    return (
        <div className="w-full max-w-3xl">
            <h2 className="font-bold text-xl mb-4 flex items-center gap-2 text-blue-700">
                <span>📝</span> {title}
            </h2>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {items.map((f) => {
                    const label = f.replace(/\.(jp(e?)g|png)$/i, '');
                    return (
                        <div
                            key={f}
                            className="rounded-xl border border-gray-200 shadow-sm bg-white p-2 flex flex-col items-center"
                        >
                            <Image
                                src={`/images/${f}`}
                                alt={label}
                                width={400}
                                height={400}
                                className="object-contain h-32 w-full"
                                priority
                            />
                            <p className="text-center font-semibold mt-2">{label}</p>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}


function Controls({
    show,
    disabled,
    know,
    dont,
    showAns,
}: {
    show: boolean;
    disabled: boolean;
    know: () => void;
    dont: () => void;
    showAns: () => void;
}) {
    return (
        <div className="w-full max-w-md flex justify-center mt-6 mb-4">
            {show ? (
                <div className="w-full flex gap-4">
                    <button
                        onClick={dont}
                        className="w-1/2 bg-red-400 hover:bg-red-500 text-white py-3 rounded-lg"
                    >
                        몰라요
                    </button>
                    <button
                        onClick={know}
                        className="w-1/2 bg-green-400 hover:bg-green-500 text-white py-3 rounded-lg"
                    >
                        알아요
                    </button>
                </div>
            ) : (
                <button
                    onClick={showAns}
                    disabled={disabled}
                    className={`w-full bg-blue-500 hover:bg-blue-600 text-white py-3 rounded-lg ${disabled && 'opacity-50'
                        }`}
                >
                    정답 보기
                </button>
            )}
        </div>
    );
}
