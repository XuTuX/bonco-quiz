// pages/index.tsx
import { useEffect, useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";

/* ──────────── 유틸: 배열 랜덤 섞기 ──────────── */
function shuffleArray<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

/* ──────────── 컴포넌트 ──────────── */
export default function Home() {
  /* 상태값 */
  const [images, setImages] = useState<string[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [wrongList, setWrongList] = useState<string[]>([]);
  const [isAnswerButtonDisabled, setIsAnswerButtonDisabled] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);          // ⬅️ 새로 추가

  /* 이미지 목록 로드 + 랜덤 섞기 */
  useEffect(() => {
    fetch("/imageList.json")
      .then((res) => res.json())
      .then((data: string[]) => setImages(shuffleArray(data)));
  }, []);

  /* 다음 카드 미리 캐싱 */
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (images.length && currentIndex + 1 < images.length) {
      const nextSrc = `/images/${images[currentIndex + 1]}`;
      const preImg = new window.Image();
      preImg.src = nextSrc;
    }
  }, [images, currentIndex]);

  /* 카드가 바뀌면 로딩 상태 초기화 */
  useEffect(() => {
    setImageLoaded(false);
  }, [currentIndex]);

  /* ──────────── 핸들러 ──────────── */
  const handleShowAnswer = () => {
    if (isAnswerButtonDisabled) return;
    setIsAnswerButtonDisabled(true);
    setShowAnswer(true);
    setTimeout(() => setIsAnswerButtonDisabled(false), 300);
  };

  const handleKnow = () => {
    setShowAnswer(false);
    setCurrentIndex((prev) => prev + 1);
  };

  const handleDontKnow = () => {
    if (currentIndex < images.length) {
      setWrongList((prev) => [...prev, images[currentIndex]]);
    }
    setShowAnswer(false);
    setCurrentIndex((prev) => prev + 1);
  };

  /* ──────────── 분기 렌더링 (로딩, 종료) ──────────── */
  if (images.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <p className="text-lg text-gray-500">이미지 로딩 중...</p>
      </div>
    );
  }

  if (currentIndex >= images.length) {
    return (
      <div className="flex flex-col items-center p-4 min-h-screen bg-gray-50">
        <h1 className="text-2xl font-bold mb-4 text-gray-800">복습할 목록</h1>
        <div className="w-full max-w-md bg-white rounded-lg shadow-md overflow-hidden">
          {wrongList.length === 0 ? (
            <p className="p-6 text-center text-gray-600">모두 맞추셨습니다! 🎉</p>
          ) : (
            wrongList.map((filename) => (
              <div
                key={filename}
                className="flex items-center justify-between px-4 py-2 border-b last:border-b-0"
              >
                <span className="truncate text-gray-800">
                  {filename.replace(/\.(jpg|jpeg|png)$/i, "")}
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    );
  }

  /* ──────────── 현재 카드 정보 ──────────── */
  const progress = currentIndex + 1;
  const total = images.length;
  const progressPercentage = (progress / total) * 100;
  const imageName = images[currentIndex];
  const answerText = imageName.replace(/\.(jpg|jpeg|png)$/i, "");
  const showDisabled = isAnswerButtonDisabled || !imageLoaded;     // ⬅️ 이미지가 완전히 뜰 때까지 비활성화

  /* ──────────── UI ──────────── */
  return (
    <div className="flex flex-col items-center justify-between min-h-screen p-4 bg-gray-50">
      {/* 진행률 표시 */}
      <div className="w-full max-w-md mb-4">
        <div className="flex justify-between text-green-800 font-medium mb-1">
          <span>{progress} / {total}</span>
        </div>
        <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-green-400 transition-all duration-300"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
      </div>

      {/* 카드 컨테이너 */}
      <div className="w-full max-w-md bg-white rounded-xl border-2 border-green-100 shadow-md overflow-hidden">
        <div className="relative w-full aspect-square bg-gray-100">

          {/* ⬇️ 스켈레톤 플레이스홀더 */}
          {!imageLoaded && (
            <div className="absolute inset-0 animate-pulse bg-gray-200" />
          )}

          {/* 이미지 애니메이션 */}
          <AnimatePresence mode="wait">
            <motion.div
              key={imageName}
              initial={{ scale: 0.98 }}               // opacity 1 → 즉시 노출
              animate={{ scale: 1 }}
              exit={{ scale: 0.98 }}
              transition={{ duration: 0.15, ease: "easeOut" }}
              className="absolute inset-0 flex items-center justify-center"
            >
              <Image
                src={`/images/${imageName}`}
                alt="quiz"
                width={300}
                height={300}
                priority
                className="object-contain max-h-[70vh] rounded-t-lg"
                onLoadingComplete={() => setImageLoaded(true)}      // ⬅️ 완료 콜백
              />
            </motion.div>
          </AnimatePresence>
        </div>

        {/* 정답 텍스트 */}
        <div className="p-4 h-12 flex items-center justify-center">
          {showAnswer && (
            <div className="text-xl font-semibold text-blue-600">
              정답: {answerText}
            </div>
          )}
        </div>
      </div>

      {/* 버튼 영역 */}
      <div className="w-full max-w-md flex justify-center mt-6 mb-4">
        {showAnswer ? (
          <div className="w-full flex justify-between gap-4">
            <button
              onClick={handleDontKnow}
              className="w-[48%] bg-red-400 hover:bg-red-500 text-white font-medium py-3 rounded-lg shadow-sm transition"
            >
              몰라요
            </button>
            <button
              onClick={handleKnow}
              className="w-[48%] bg-green-400 hover:bg-green-500 text-white font-medium py-3 rounded-lg shadow-sm transition"
            >
              알아요
            </button>
          </div>
        ) : (
          <button
            onClick={handleShowAnswer}
            disabled={showDisabled}
            className={`w-full bg-blue-500 hover:bg-blue-600 text-white font-medium py-3 rounded-lg shadow-sm transition
            ${showDisabled ? "opacity-50 cursor-not-allowed" : ""}`}
          >
            정답 보기
          </button>
        )}
      </div>
    </div>
  );
}