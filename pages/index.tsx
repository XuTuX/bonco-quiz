// pages/index.tsx
import Link from "next/link";          // ★ 추가
import { useEffect, useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";

/* ───────── helpers ───────── */
function shuffle<T>(arr: T[]) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/* ───────── types ───────── */
type Phase = "setup" | "learn" | "batch-done" | "all-done";
type BatchChoice = 10 | 20 | 30 | 40 | 50 | "all";

/* ───────── component ───────── */
export default function Home() {
  /* 카드 저장소 */
  const [allCards, setAllCards] = useState<string[]>([]);

  /* 런타임 state */
  const [phase, setPhase] = useState<Phase>("setup");
  const [batchChoice, setBatchChoice] = useState<BatchChoice | null>(null);
  const [batchIndex, setBatchIndex] = useState(0);
  const [currentSet, setCurrentSet] = useState<string[]>([]);
  const [curr, setCurr] = useState(0);
  const [wrongBatch, setWrongBatch] = useState<string[]>([]);   // 이번 세트 오답
  const [wrongTotal, setWrongTotal] = useState<string[]>([]);   // 누적 오답
  const [show, setShow] = useState(false);
  const [lock, setLock] = useState(false);
  const [imgLoaded, setImgLoaded] = useState(false);

  /* ───────── 초기 카드 로딩 ───────── */
  useEffect(() => {
    fetch("/imageList.json")
      .then((r) => r.json())
      .then((d: string[]) => setAllCards(shuffle(d)));
  }, []);

  /* ───────── 진행 중 보조 로직 ───────── */
  useEffect(() => setImgLoaded(false), [curr]); // 카드 전환 시 로딩 리셋

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (currentSet.length && curr + 1 < currentSet.length) {
      new window.Image().src = `/images/${currentSet[curr + 1]}`;
    }
  }, [currentSet, curr]);

  /* 세트 완료 판정 */
  useEffect(() => {
    if (phase === "learn" && curr >= currentSet.length) {
      setPhase("batch-done");
    }
  }, [curr, currentSet.length, phase]);

  /* ───────── 키보드 컨트롤 ───────── */
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (phase === "setup" || lock) return;

      if (phase === "batch-done") {
        nextBatch();
        return;
      }

      if (!show) {
        showAns();
      } else {
        if (e.key === "ArrowLeft") dont();
        if (e.key === "ArrowRight") know();
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [show, lock, phase, curr, currentSet]); // deps

  /* ───────── 일반 핸들러 ───────── */
  const showAns = () => {
    if (lock) return;
    setLock(true);
    setShow(true);
    setTimeout(() => setLock(false), 300);
  };

  const know = () => {
    setShow(false);
    setCurr((i) => i + 1);
  };

  const dont = () => {
    const fname = currentSet[curr];
    if (!wrongBatch.includes(fname)) setWrongBatch((w) => [...w, fname]);
    if (!wrongTotal.includes(fname)) setWrongTotal((w) => [...w, fname]);
    setShow(false);
    setCurr((i) => i + 1);
  };

  /* ───────── 세트 이동 로직 ───────── */
  const startLearning = () => {
    if (!batchChoice) return;
    const size =
      batchChoice === "all" ? allCards.length : (batchChoice as number);
    setCurrentSet(allCards.slice(0, size));
    setCurr(0);
    setWrongBatch([]);
    setPhase("learn");
  };

  const nextBatch = () => {
    const size =
      batchChoice === "all" ? allCards.length : (batchChoice as number);
    const nextStart = (batchIndex + 1) * size;

    if (nextStart >= allCards.length) {
      setPhase("all-done");
    } else {
      setCurrentSet(allCards.slice(nextStart, nextStart + size));
      setBatchIndex((i) => i + 1);
      setCurr(0);
      setWrongBatch([]);
      setPhase("learn");
    }
  };


  /* SETUP */
  if (phase === "setup")
    return (
      <Center>
        {allCards.length === 0 ? (
          <p className="text-lg text-gray-500">이미지 목록 로딩 중…</p>
        ) : (
          <div className="flex flex-col items-center gap-6">
            <h1 className="text-xl font-semibold">한 세트에 몇 장씩 학습할까요?</h1>

            <div className="flex flex-wrap justify-center gap-3">
              {[10, 20, 30, 40, 50, "all"].map((n) => (
                <button
                  key={n}
                  onClick={() => setBatchChoice(n as BatchChoice)}
                  className={`px-4 py-2 rounded-lg border ${batchChoice === n
                    ? "bg-blue-500 text-white"
                    : "bg-white text-gray-800 hover:bg-gray-100"
                    }`}
                >
                  {n === "all" ? "전체 카드" : `${n} 장`}
                </button>
              ))}
            </div>

            <button
              onClick={startLearning}
              disabled={!batchChoice}
              className={`px-6 py-3 rounded-lg text-white transition ${batchChoice
                ? "bg-green-500 hover:bg-green-600"
                : "bg-gray-400 cursor-not-allowed"
                }`}
            >
              학습 시작
            </button>
            <Link
              href="/preview"
              className="mt-2 inline-block px-6 py-3 rounded-lg
             bg-purple-500 hover:bg-purple-600 text-white transition-colors"
            >
              전체 카드 미리보기
            </Link>

          </div>
        )}
      </Center>
    );

  /* ALL DONE */
  if (phase === "all-done")
    return (
      <Center>
        <div className="w-full max-w-md space-y-6 p-4">
          <h1 className="text-2xl font-bold text-center text-green-700">
            🎉 전체 학습 완료!
          </h1>
          <ResultBlock title="누적 오답 카드" list={wrongTotal} />
        </div>
      </Center>
    );

  /* BATCH DONE */
  if (phase === "batch-done")
    return (
      <Center>
        <div className="flex flex-col items-center gap-4">
          <p className="text-lg font-semibold">{batchIndex + 1} 세트 완료!</p>
          <button
            onClick={nextBatch}
            className="px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg"
          >
            {batchChoice === "all" ||
              (batchIndex + 1) * (batchChoice as number) >= allCards.length
              ? "전체 종료"
              : "다음 세트 시작"}
          </button>
          <ResultBlock title="이번 세트 오답" list={wrongBatch} small />
          <ResultBlock title="누적 오답" list={wrongTotal} small />
        </div>
      </Center>
    );

  /* LOADING */
  if (currentSet.length === 0) return <Center>이미지 로딩 중…</Center>;
  /* 준비 화면 */
  if (curr >= currentSet.length) return <Center>다음 세트를 준비 중…</Center>;

  /* LEARN 화면 */
  const total = currentSet.length;
  const prog = curr + 1;
  const pct = (prog / total) * 100;
  const file = currentSet[curr];
  const answer = file.replace(/\.(jp(e?)g|png)$/i, "");
  const disabled = lock || !imgLoaded;

  return (
    <div className="flex flex-col items-center justify-between min-h-screen p-4 bg-gray-50">
      {/* 헤더 */}
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

/* ───────── reusable components ───────── */
const Center = ({ children }: { children: React.ReactNode }) => (
  <div className="flex items-center justify-center min-h-screen bg-gray-50">
    {children}
  </div>
);

function ResultBlock({
  title,
  list,
  small = false,
  accent = "blue",
}: {
  title: string;
  list: string[];
  small?: boolean;
  accent?: "blue" | "pink" | "green" | "yellow";
}) {
  const accentMap = {
    blue: "border-blue-300 bg-blue-50",
    pink: "border-pink-300 bg-pink-50",
    green: "border-green-300 bg-green-50",
    yellow: "border-yellow-300 bg-yellow-50",
  };
  const iconMap = {
    blue: "📝",
    pink: "❌",
    green: "🌱",
    yellow: "⭐️",
  };

  /* small 옵션에 따른 높이·글꼴 크기 */
  const sizeCls = small
    ? "min-h-[120px] max-h-[240px] text-sm"
    : "min-h-[200px] max-h-[400px] text-base";

  return (
    <div className="mb-4">
      <div className="flex items-center gap-2 mb-1">
        <span className="text-xl">{iconMap[accent]}</span>
        <h2 className={`font-bold text-${accent}-700 ${small ? "text-md" : "text-lg"}`}>
          {title}
        </h2>
      </div>
      <div
        className={`
          border-2 rounded-xl px-4 py-4
          ${accentMap[accent]}
          ${sizeCls} w-full min-w-[300px]
          overflow-y-auto shadow-inner
        `}
      >
        {list.length === 0 ? (
          <div className="text-gray-400">👏 모두 맞힘!</div>
        ) : (
          <div className="grid grid-cols-2 gap-1">
            {list.map((f) => (
              <div key={f} className="font-semibold text-gray-800 truncate">
                {f.replace(/\.(jp(e?)g|png)$/i, "")}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

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
    <div className="w-full max-w-md lg:max-w-2xl xl:max-w-3xl
    bg-white rounded-xl border-2 border-green-100
    shadow-md overflow-hidden">
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
              width={300}
              height={300}
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
          className={`w-full bg-blue-500 hover:bg-blue-600 text-white py-3 rounded-lg ${disabled && "opacity-50"
            }`}
        >
          정답 보기
        </button>
      )}
    </div>
  );
}
