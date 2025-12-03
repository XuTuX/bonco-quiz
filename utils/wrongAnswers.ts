// utils/wrongAnswers.ts
// 로컬 스토리지를 사용한 오답 관리 유틸리티

export interface WrongAnswerData {
    count: number;
    lastWrong: string; // ISO date string
}

export interface WrongAnswersStore {
    [set: string]: {
        [imagePath: string]: WrongAnswerData;
    };
}

export interface WrongAnswerStats {
    totalWrong: number;
    totalCards: number;
    bySet: {
        [set: string]: {
            count: number;
            cards: Array<{
                path: string;
                name: string;
                count: number;
                lastWrong: string;
            }>;
        };
    };
}

const STORAGE_KEY = 'bonco_wrong_answers';

// 로컬 스토리지에서 오답 데이터 로드
function loadWrongAnswers(): WrongAnswersStore {
    if (typeof window === 'undefined') return {};

    try {
        const data = localStorage.getItem(STORAGE_KEY);
        return data ? JSON.parse(data) : {};
    } catch (error) {
        console.error('Failed to load wrong answers:', error);
        return {};
    }
}

// 로컬 스토리지에 오답 데이터 저장
function saveWrongAnswers(data: WrongAnswersStore): void {
    if (typeof window === 'undefined') return;

    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (error) {
        console.error('Failed to save wrong answers:', error);
    }
}

// 오답 추가 (이미 있으면 카운트 증가)
export function addWrongAnswer(set: string, imagePath: string): void {
    const data = loadWrongAnswers();

    if (!data[set]) {
        data[set] = {};
    }

    if (!data[set][imagePath]) {
        data[set][imagePath] = {
            count: 1,
            lastWrong: new Date().toISOString(),
        };
    } else {
        data[set][imagePath].count += 1;
        data[set][imagePath].lastWrong = new Date().toISOString();
    }

    saveWrongAnswers(data);
}

// 특정 세트 또는 전체 오답 조회
export function getWrongAnswers(set?: string): WrongAnswersStore {
    const data = loadWrongAnswers();

    if (set) {
        return { [set]: data[set] || {} };
    }

    return data;
}

// 특정 오답 삭제
export function removeWrongAnswer(set: string, imagePath: string): void {
    const data = loadWrongAnswers();

    if (data[set] && data[set][imagePath]) {
        delete data[set][imagePath];

        // 세트에 오답이 없으면 세트도 삭제
        if (Object.keys(data[set]).length === 0) {
            delete data[set];
        }

        saveWrongAnswers(data);
    }
}

// 오답 초기화 (특정 세트 또는 전체)
export function clearWrongAnswers(set?: string): void {
    if (set) {
        const data = loadWrongAnswers();
        delete data[set];
        saveWrongAnswers(data);
    } else {
        if (typeof window !== 'undefined') {
            localStorage.removeItem(STORAGE_KEY);
        }
    }
}

// 오답 통계 생성
export function getWrongAnswerStats(set?: string): WrongAnswerStats {
    const data = getWrongAnswers(set);

    const stats: WrongAnswerStats = {
        totalWrong: 0,
        totalCards: 0,
        bySet: {},
    };

    Object.entries(data).forEach(([setKey, cards]) => {
        const cardArray = Object.entries(cards).map(([path, info]) => ({
            path,
            name: path.substring(path.lastIndexOf('/') + 1).replace(/\.(jpe?g|png)$/i, ''),
            count: info.count,
            lastWrong: info.lastWrong,
        }));

        stats.bySet[setKey] = {
            count: cardArray.length,
            cards: cardArray.sort((a, b) => b.count - a.count),
        };

        stats.totalCards += cardArray.length;
        stats.totalWrong += cardArray.reduce((sum, card) => sum + card.count, 0);
    });

    return stats;
}

// 가장 많이 틀린 카드 조회
export function getTopWrongAnswers(limit: number = 10): Array<{
    set: string;
    path: string;
    name: string;
    count: number;
    lastWrong: string;
}> {
    const data = loadWrongAnswers();
    const allCards: Array<{
        set: string;
        path: string;
        name: string;
        count: number;
        lastWrong: string;
    }> = [];

    Object.entries(data).forEach(([set, cards]) => {
        Object.entries(cards).forEach(([path, info]) => {
            allCards.push({
                set,
                path,
                name: path.substring(path.lastIndexOf('/') + 1).replace(/\.(jpe?g|png)$/i, ''),
                count: info.count,
                lastWrong: info.lastWrong,
            });
        });
    });

    return allCards
        .sort((a, b) => b.count - a.count)
        .slice(0, limit);
}

// 특정 세트의 오답 이미지 경로 배열 반환
export function getWrongAnswerPaths(set: string): string[] {
    const data = loadWrongAnswers();
    return Object.keys(data[set] || {});
}
