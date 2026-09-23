import type { KanjiLevel } from '@/entities/kanji/types';

export interface KanjiProExample {
  num: string; // '①' | '②'
  japanese: string;
  reading?: string;
  meaning: string;
}

export interface KanjiProWord {
  id: string;
  kanjiChar: string;
  hanviet: string;
  meaning: string;
  kunyomi: string;
  onyomi: string;
  note?: string;
  examples: KanjiProExample[];
}

export interface KanjiProLesson {
  id: string; // e.g. 'n4-b24'
  lessonNum: number; // 24
  title: string; // 'Bài 24'
  level: KanjiLevel;
  kanjiList: KanjiProWord[];
  isAvailable: boolean;
  description?: string;
}

export interface KanjiProLevelInfo {
  level: KanjiLevel;
  label: string;
  desc: string;
  totalLessons: number;
}

export const KANJI_PRO_LEVELS: KanjiProLevelInfo[] = [
  { level: 'n5', label: 'N5', desc: 'Cơ bản', totalLessons: 25 },
  { level: 'n4', label: 'N4', desc: 'Sơ cấp', totalLessons: 25 },
  { level: 'n3', label: 'N3', desc: 'Trung cấp', totalLessons: 20 },
  { level: 'n2', label: 'N2', desc: 'Thượng cấp', totalLessons: 20 },
  { level: 'n1', label: 'N1', desc: 'Cao cấp', totalLessons: 20 },
];

/**
 * Bài 24 - N4: Dữ liệu chính xác 100% từ giáo trình Kanji (Minna no Nihongo)
 * Gồm 9 chữ Hán: 試, 問, 答, 耳, 用, 験, 集, 研, 台
 */
export const LESSON_24_N4_KANJI: KanjiProWord[] = [
  {
    id: 'n4-b24-01-thi',
    kanjiChar: '試',
    hanviet: 'THỬ',
    meaning: 'Thử',
    kunyomi: 'ため.す、こころ.みる',
    onyomi: 'シ',
    examples: [
      {
        num: '①',
        japanese: '試験',
        reading: 'しけん',
        meaning: 'kỳ thi',
      },
      {
        num: '②',
        japanese: '試験があります。',
        reading: 'しけんがあります。',
        meaning: 'Có kỳ thi.',
      },
    ],
  },
  {
    id: 'n4-b24-02-van',
    kanjiChar: '問',
    hanviet: 'VẤN',
    meaning: 'Hỏi',
    kunyomi: 'と.う、と.い',
    onyomi: 'モン',
    examples: [
      {
        num: '①',
        japanese: '問題',
        reading: 'もんだい',
        meaning: 'vấn đề, câu hỏi',
      },
      {
        num: '②',
        japanese: '問題を読んでください。',
        reading: 'もんだいをよんでください。',
        meaning: 'Hãy đọc câu hỏi.',
      },
    ],
  },
  {
    id: 'n4-b24-03-dap',
    kanjiChar: '答',
    hanviet: 'ĐÁP',
    meaning: 'Trả lời',
    kunyomi: 'こた.える、こた.え',
    onyomi: 'トウ',
    examples: [
      {
        num: '①',
        japanese: '答え',
        reading: 'こたえ',
        meaning: 'đáp án',
      },
      {
        num: '②',
        japanese: '答えを教えてください。',
        reading: 'こたえをおしえてください。',
        meaning: 'Hãy cho tôi biết đáp án.',
      },
    ],
  },
  {
    id: 'n4-b24-04-nhi',
    kanjiChar: '耳',
    hanviet: 'NHĨ',
    meaning: 'Tai',
    kunyomi: 'みみ',
    onyomi: 'ジ',
    examples: [
      {
        num: '①',
        japanese: '耳',
        reading: 'みみ',
        meaning: 'tai',
      },
      {
        num: '②',
        japanese: '耳が痛いです。',
        reading: 'みみがいたいです。',
        meaning: 'Tôi bị đau tai.',
      },
    ],
  },
  {
    id: 'n4-b24-05-dung',
    kanjiChar: '用',
    hanviet: 'DỤNG',
    meaning: 'Dùng',
    kunyomi: 'もち.いる',
    onyomi: 'ヨウ',
    examples: [
      {
        num: '①',
        japanese: '用事',
        reading: 'ようじ',
        meaning: 'việc, việc cần làm',
      },
      {
        num: '②',
        japanese: '用事があります。',
        reading: 'ようじがあります。',
        meaning: 'Tôi có việc bận.',
      },
    ],
  },
  {
    id: 'n4-b24-06-nghiem',
    kanjiChar: '験',
    hanviet: 'NGHIỆM',
    meaning: 'Kiểm nghiệm',
    kunyomi: '—',
    onyomi: 'ケン、ゲン',
    examples: [
      {
        num: '①',
        japanese: '試験',
        reading: 'しけん',
        meaning: 'kỳ thi',
      },
      {
        num: '②',
        japanese: '明日は試験です。',
        reading: 'あしたはしけんです。',
        meaning: 'Ngày mai có kỳ thi.',
      },
    ],
  },
  {
    id: 'n4-b24-07-tap',
    kanjiChar: '集',
    hanviet: 'TẬP',
    meaning: 'Tập hợp',
    kunyomi: 'あつ.まる、あつ.める、つど.う',
    onyomi: 'シュウ',
    examples: [
      {
        num: '①',
        japanese: '集める',
        reading: 'あつめる',
        meaning: 'thu thập',
      },
      {
        num: '②',
        japanese: 'カードを集めています。',
        reading: 'カードをあつめています。',
        meaning: 'Tôi đang sưu tầm thẻ.',
      },
    ],
  },
  {
    id: 'n4-b24-08-nghien',
    kanjiChar: '研',
    hanviet: 'NGHIÊN',
    meaning: 'Mài, nghiên cứu',
    kunyomi: 'と.ぐ',
    onyomi: 'ケン',
    examples: [
      {
        num: '①',
        japanese: '研究する',
        reading: 'けんきゅうする',
        meaning: 'nghiên cứu',
      },
      {
        num: '②',
        japanese: '日本語を研究しています。',
        reading: 'にほんごをけんきゅうしています。',
        meaning: 'Tôi đang nghiên cứu tiếng Nhật.',
      },
    ],
  },
  {
    id: 'n4-b24-09-dai',
    kanjiChar: '台',
    hanviet: 'ĐÀI',
    meaning: 'Bệ, đài',
    kunyomi: '—',
    onyomi: 'ダイ、タイ',
    examples: [
      {
        num: '①',
        japanese: '～台',
        reading: 'だい',
        meaning: 'chiếc, cái (máy móc)',
      },
      {
        num: '②',
        japanese: 'テレビを２台買いました。',
        reading: 'テレビをにだいかいました。',
        meaning: 'Tôi đã mua 2 chiếc tivi.',
      },
    ],
  },
];

/**
 * Sinh danh sách bài học cho một cấp độ
 */
export function getLessonsForLevel(level: KanjiLevel): KanjiProLesson[] {
  const levelInfo = KANJI_PRO_LEVELS.find(l => l.level === level);
  const total = levelInfo?.totalLessons || 25;

  const lessons: KanjiProLesson[] = [];

  for (let num = 1; num <= total; num++) {
    const isLesson24N4 = level === 'n4' && num === 24;

    lessons.push({
      id: `${level}-b${num}`,
      lessonNum: num,
      title: `Bài ${num}`,
      level,
      isAvailable: isLesson24N4,
      kanjiList: isLesson24N4 ? LESSON_24_N4_KANJI : [],
      description: isLesson24N4
        ? '9 chữ Hán: 試, 問, 答, 耳, 用, 験, 集, 研, 台'
        : `Nội dung Kanji cho Bài ${num} đang được cập nhật`,
    });
  }

  return lessons;
}

/**
 * Lấy chi tiết một bài học theo cấp độ và số bài
 */
export function getLessonDetail(
  level: KanjiLevel,
  lessonNum: number,
): KanjiProLesson | null {
  const lessons = getLessonsForLevel(level);
  return lessons.find(l => l.lessonNum === lessonNum) || null;
}
