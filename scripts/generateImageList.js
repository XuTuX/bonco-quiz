// scripts/generateImageList.js
const fs = require('fs');
const path = require('path');

const imagesBaseDir = path.join(__dirname, '../public/images');
const publicDir = path.join(__dirname, '../public');

const dirMapping = {
    '1-2': 'imageList-1-1.json',
    '2-1': 'imageList-1-2.json'
};

// public/images 안의 모든 폴더를 읽음
const subDirs = fs.readdirSync(imagesBaseDir).filter(dir =>
    fs.statSync(path.join(imagesBaseDir, dir)).isDirectory()
);

// 기존 imageList.json 삭제
const oldJsonPath = path.join(publicDir, 'imageList.json');
if (fs.existsSync(oldJsonPath)) {
    fs.unlinkSync(oldJsonPath);
    console.log('🗑️  기존 imageList.json 삭제 완료');
}

// 각 폴더별로 별도의 JSON 파일을 생성
subDirs.forEach(dir => {
    const jsonFileName = dirMapping[dir];
    if (!jsonFileName) {
        console.log(`⚠️ ${dir}에 대한 매핑이 없어 건너뜁니다.`);
        return;
    }

    const imageFiles = fs.readdirSync(path.join(imagesBaseDir, dir))
        .filter(f => /\.(jpe?g|png)$/i.test(f));

    let imagePaths = [];
    imageFiles.forEach(oldName => {
        const nfcName = oldName.normalize('NFC');
        const oldPath = path.join(imagesBaseDir, dir, oldName);
        const newPath = path.join(imagesBaseDir, dir, nfcName);

        if (oldName !== nfcName) {
            fs.renameSync(oldPath, newPath);
            console.log(`🔄 rename: ${oldName} → ${nfcName}`);
        }

        // dir/image.jpeg 형식으로 저장
        imagePaths.push(`${dir}/${nfcName}`);
    });

    imagePaths.sort();

    const jsonPath = path.join(publicDir, jsonFileName);

    // JSON 작성
    fs.writeFileSync(jsonPath, JSON.stringify(imagePaths, null, 2), 'utf-8');
    console.log(`✅ ${jsonFileName} (NFC) 생성 완료`);
});