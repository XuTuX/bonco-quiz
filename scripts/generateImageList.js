// scripts/generateImageList.js

const fs = require("fs");
const path = require("path");

// 이미지 폴더 경로
const imagesDir = path.join(__dirname, "../public/images");

// 저장될 JSON 파일 경로
const outputFile = path.join(__dirname, "../public/imageList.json");

// 이미지 확장자만 필터링
const imageList = fs
    .readdirSync(imagesDir)
    .filter((file) => /\.(jpg|jpeg|png)$/i.test(file)) // 이미지 파일만
    .sort(); // 이름순 정렬 (선택사항)

// JSON 파일로 저장
fs.writeFileSync(outputFile, JSON.stringify(imageList, null, 2), "utf-8");

console.log("✅ imageList.json 생성 완료!");
