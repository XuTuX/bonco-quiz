// rename_images.js
const fs = require('fs');
const path = require('path');

const imagesDir = path.join(__dirname, 'public', 'images');
const jsonPath = path.join(__dirname, 'public', 'imageList.json');

const files = fs
    .readdirSync(imagesDir)
    .filter(f => /\.(jpe?g|png)$/i.test(f))
    .sort();

const newList = files.map((oldName, idx) => {
    const ext = path.extname(oldName).toLowerCase();
    const label = path.basename(oldName, ext);      // → 원본 이름 (확장자 뺀 부분)
    const newName = String(idx + 1).padStart(3, '0') + ext;  // “001.jpg” 등
    fs.renameSync(
        path.join(imagesDir, oldName),
        path.join(imagesDir, newName)
    );
    return { file: newName, label };  // 객체 형태로 리턴
});

// JSON에 [{ file, label }, …] 형태로 저장
fs.writeFileSync(jsonPath, JSON.stringify(newList, null, 2), 'utf8');
console.log('✅ Images renamed and imageList.json updated.');
