// scripts/compressImages.js
const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const imagesDir = path.join(__dirname, '../public/images');
const backupDir = path.join(__dirname, '../public/images-backup');

// 백업 디렉토리 생성
if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir, { recursive: true });
}

// 이미지 압축 함수
async function compressImage(inputPath, outputPath) {
    try {
        const stats = fs.statSync(inputPath);
        const originalSize = stats.size;

        await sharp(inputPath)
            .jpeg({ quality: 60, progressive: true }) // JPEG 품질 60%로 압축
            .toFile(outputPath);

        const newStats = fs.statSync(outputPath);
        const newSize = newStats.size;
        const reduction = ((originalSize - newSize) / originalSize * 100).toFixed(1);

        console.log(`✓ ${path.basename(inputPath)}: ${(originalSize / 1024).toFixed(1)}KB → ${(newSize / 1024).toFixed(1)}KB (${reduction}% 감소)`);
    } catch (error) {
        console.error(`✗ ${path.basename(inputPath)} 압축 실패:`, error.message);
    }
}

// 디렉토리 재귀 처리
async function processDirectory(dir, backupRoot, originalRoot) {
    const items = fs.readdirSync(dir);

    for (const item of items) {
        const fullPath = path.join(dir, item);
        const stat = fs.statSync(fullPath);

        if (stat.isDirectory()) {
            // 하위 디렉토리 처리
            const relativePath = path.relative(originalRoot, fullPath);
            const backupPath = path.join(backupRoot, relativePath);

            if (!fs.existsSync(backupPath)) {
                fs.mkdirSync(backupPath, { recursive: true });
            }

            await processDirectory(fullPath, backupRoot, originalRoot);
        } else if (/\.(jpe?g|png)$/i.test(item)) {
            // 이미지 파일 처리
            const relativePath = path.relative(originalRoot, fullPath);
            const backupPath = path.join(backupRoot, relativePath);
            const backupDirPath = path.dirname(backupPath);

            // 백업 디렉토리 생성
            if (!fs.existsSync(backupDirPath)) {
                fs.mkdirSync(backupDirPath, { recursive: true });
            }

            // 원본을 백업으로 복사
            if (!fs.existsSync(backupPath)) {
                fs.copyFileSync(fullPath, backupPath);
            }

            // 압축된 이미지를 원본 위치에 저장
            const tempPath = fullPath + '.tmp';
            await compressImage(fullPath, tempPath);

            // 임시 파일을 원본으로 교체
            fs.renameSync(tempPath, fullPath);
        }
    }
}

async function main() {
    console.log('🖼️  이미지 압축을 시작합니다...\n');
    console.log(`📁 원본 백업 위치: ${backupDir}\n`);

    const startTime = Date.now();
    await processDirectory(imagesDir, backupDir, imagesDir);
    const endTime = Date.now();

    console.log(`\n✅ 압축 완료! (소요 시간: ${((endTime - startTime) / 1000).toFixed(1)}초)`);
    console.log(`💡 원본 이미지는 ${backupDir} 에 백업되었습니다.`);
}

main().catch(console.error);
