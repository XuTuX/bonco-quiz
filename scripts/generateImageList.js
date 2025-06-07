// scripts/fixAndGenerateImageList.js
const fs = require("fs");
const path = require("path");

const imagesDir = path.join(__dirname, "../public/images");
const jsonPath = path.join(__dirname, "../public/imageList.json");

const imageFiles = fs
    .readdirSync(imagesDir)
    .filter((f) => /\.(jpe?g|png)$/i.test(f));

const normalized = imageFiles.map((oldName) => {
    const nfcName = oldName.normalize("NFC"); // 완성형으로 변환
    if (oldName !== nfcName) {
        // 디스크 파일도 rename
        fs.renameSync(
            path.join(imagesDir, oldName),
            path.join(imagesDir, nfcName)
        );
        console.log(`🔄 rename: ${oldName} → ${nfcName}`);
    }
    return nfcName;
}).sort();

// JSON 작성
fs.writeFileSync(jsonPath, JSON.stringify(normalized, null, 2), "utf-8");
console.log("✅ imageList.json (NFC) 생성 완료");
