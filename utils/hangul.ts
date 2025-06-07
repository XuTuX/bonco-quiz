// utils/hangul.ts
export function getChoseong(word: string): string {
    // 한글 초성 테이블
    const CHOSEONG = [
        "ㄱ", "ㄲ", "ㄴ", "ㄷ", "ㄸ", "ㄹ", "ㅁ", "ㅂ", "ㅃ",
        "ㅅ", "ㅆ", "ㅇ", "ㅈ", "ㅉ", "ㅊ", "ㅋ", "ㅌ", "ㅍ", "ㅎ",
    ] as const;

    const code = word.charCodeAt(0);

    // 가(0xac00) ~ 힣(0xd7a3) 범위 밖이면 영문·숫자 → 대문자 첫 글자로 그룹
    if (code < 0xac00 || code > 0xd7a3) return word[0].toUpperCase();

    // (음절 − 가) / 588 = 초성 인덱스
    const index = Math.floor((code - 0xac00) / 588);
    return CHOSEONG[index];
}
