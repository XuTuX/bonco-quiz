import { useEffect, useState } from "react";
import Image from "next/image";

// 이미지 배열 랜덤 섞기
function shuffleArray<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export default function Home() {
  const [images, setImages] = useState<string[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [wrongList, setWrongList] = useState<string[]>([]);
  const [isAnswerButtonDisabled, setIsAnswerButtonDisabled] = useState(false);

  // 이미지 불러오기 + 랜덤 섞기
  useEffect(() => {
    fetch("/imageList.json")
      .then((res) => res.json())
      .then((data: string[]) => setImages(shuffleArray(data)));
  }, []);

  // "정답 보기" 클릭
  const handleShowAnswer = () => {
    if (isAnswerButtonDisabled) return;
    setIsAnswerButtonDisabled(true);
    setShowAnswer(true);
    // 버튼 잠깐 비활성화 후 활성화
    setTimeout(() => {
      setIsAnswerButtonDisabled(false);
    }, 300);
  };

  // "알아요" 클릭 → 바로 다음 문제
  const handleKnow = () => {
    setShowAnswer(false);
    setCurrentIndex((prev) => prev + 1);
  };

  // "몰라요" 클릭 → 복습 목록 추가 후 다음 문제
  const handleDontKnow = () => {
    setWrongList((prev) => [...prev, images[currentIndex]]);
    setShowAnswer(false);
    setCurrentIndex((prev) => prev + 1);
  };

  // 로딩 중
  if (images.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-lg text-gray-500">이미지 로딩 중...</p>
      </div>
    );
  }

  // 끝났을 때
  if (currentIndex >= images.length) {
    return (
      <div className="flex flex-col items-center p-4 min-h-screen">
        <h1 className="text-2xl font-bold mb-4">복습할 목록</h1>
        <div className="w-full max-w-md">
          {wrongList.length === 0 ? (
            <p className="text-center text-gray-600">모두 맞추셨습니다! 🎉</p>
          ) : (
            wrongList.map((filename) => (
              <div
                key={filename}
                className="flex items-center justify-between px-4 py-2 border-b last:border-b-0"
              >
                <span className="truncate">
                  {filename.replace(/\.(jpg|jpeg|png)$/i, "")}
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    );
  }

  // 현재 이미지 및 정답 텍스트
  const imageName = images[currentIndex];
  const answerText = imageName.replace(/\.(jpg|jpeg|png)$/i, "");

  return (
    <div className="flex flex-col items-center justify-between min-h-screen p-4 bg-gray-50">
      {/* 이미지 + 정답 */}
      <div className="flex flex-col items-center w-full grow">
        <div className="w-full max-w-md flex justify-center">
          <Image
            src={`/images/${imageName}`}
            alt="quiz"
            width={300}
            height={300}
            className="object-contain max-h-[50vh] rounded-lg shadow-md"
          />
        </div>
        <div className="mt-4 h-8">
          {showAnswer && (
            <div className="text-xl font-semibold text-blue-600">
              정답: {answerText}
            </div>
          )}
        </div>
      </div>

      {/* 버튼 */}
      <div className="w-full max-w-md flex justify-center mt-6 mb-4">
        {showAnswer ? (
          // 정답 본 후 "알아요"/"몰라요" 버튼
          <div className="w-full flex justify-between">
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
          // 아직 정답 안 본 상태에서는 "정답 보기" 버튼
          <button
            onClick={handleShowAnswer}
            disabled={isAnswerButtonDisabled}
            className={`w-full bg-blue-500 hover:bg-blue-600 text-white font-medium py-3 rounded-lg shadow-sm transition ${isAnswerButtonDisabled ? "opacity-50 cursor-not-allowed" : ""
              }`}
          >
            정답 보기
          </button>
        )}
      </div>
    </div>
  );
}
