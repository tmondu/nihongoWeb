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
  startLesson: number;
  totalLessons: number;
}

export const KANJI_PRO_LEVELS: KanjiProLevelInfo[] = [
  {
    level: 'n5',
    label: 'N5',
    desc: 'Cơ bản (Bài 1 - 20)',
    startLesson: 1,
    totalLessons: 20,
  },
  {
    level: 'n4',
    label: 'N4',
    desc: 'Sơ cấp (Bài 21 - 50)',
    startLesson: 21,
    totalLessons: 30,
  },
  {
    level: 'n3',
    label: 'N3',
    desc: 'Trung cấp (Bài 1 - 20)',
    startLesson: 1,
    totalLessons: 20,
  },
  {
    level: 'n2',
    label: 'N2',
    desc: 'Thượng cấp (Bài 1 - 20)',
    startLesson: 1,
    totalLessons: 20,
  },
  {
    level: 'n1',
    label: 'N1',
    desc: 'Cao cấp (Bài 1 - 20)',
    startLesson: 1,
    totalLessons: 20,
  },
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
 * Bài 25 - N4: Dữ liệu chính xác 100% từ giáo trình Kanji (Minna no Nihongo)
 * Gồm 12 mục chữ Hán: 飯, 場, 正, 世, 界, 急, 特, 県, 低, 弱, 不, 急
 */
export const LESSON_25_N4_KANJI: KanjiProWord[] = [
  {
    id: 'n4-b25-01-phan',
    kanjiChar: '飯',
    hanviet: 'PHẠN',
    meaning: 'Cơm',
    kunyomi: 'めし',
    onyomi: 'ハン',
    examples: [
      {
        num: '①',
        japanese: 'ご飯',
        reading: 'ごはん',
        meaning: 'cơm',
      },
      {
        num: '②',
        japanese: 'ご飯を食べます。',
        reading: 'ごはんをたべます。',
        meaning: 'Tôi ăn cơm.',
      },
    ],
  },
  {
    id: 'n4-b25-02-truong',
    kanjiChar: '場',
    hanviet: 'TRƯỜNG',
    meaning: 'Nơi, chỗ',
    kunyomi: 'ば',
    onyomi: 'ジョウ',
    examples: [
      {
        num: '①',
        japanese: '売り場',
        reading: 'うりば',
        meaning: 'quầy bán hàng',
      },
      {
        num: '②',
        japanese: '売り場はどこですか。',
        reading: 'うりばはどこですか。',
        meaning: 'Quầy bán hàng ở đâu?',
      },
    ],
  },
  {
    id: 'n4-b25-03-chinh',
    kanjiChar: '正',
    hanviet: 'CHÍNH',
    meaning: 'Đúng',
    kunyomi: 'ただ.しい、ただ.す、まさ',
    onyomi: 'セイ、ショウ',
    examples: [
      {
        num: '①',
        japanese: 'お正月',
        reading: 'おしょうがつ',
        meaning: 'Tết dương lịch',
      },
      {
        num: '②',
        japanese: 'お正月は実家に帰ります。',
        reading: 'おしょうがつはじっかにかえります。',
        meaning: 'Tôi về nhà bố mẹ vào dịp Tết.',
      },
    ],
  },
  {
    id: 'n4-b25-04-the',
    kanjiChar: '世',
    hanviet: 'THẾ',
    meaning: 'Đời, thế giới',
    kunyomi: 'よ',
    onyomi: 'セイ、セ',
    examples: [
      {
        num: '①',
        japanese: '世界',
        reading: 'せかい',
        meaning: 'thế giới',
      },
      {
        num: '②',
        japanese: '世界にはいろいろな国があります。',
        reading: 'せかいにはいろいろなくにがあります。',
        meaning: 'Trên thế giới có nhiều quốc gia.',
      },
    ],
  },
  {
    id: 'n4-b25-05-gioi',
    kanjiChar: '界',
    hanviet: 'GIỚI',
    meaning: 'Ranh giới',
    kunyomi: '—',
    onyomi: 'カイ',
    examples: [
      {
        num: '①',
        japanese: '世界',
        reading: 'せかい',
        meaning: 'thế giới',
      },
      {
        num: '②',
        japanese: '世界で有名な場所です。',
        reading: 'せかいでゆうめいなばしょです。',
        meaning: 'Đây là nơi nổi tiếng trên thế giới.',
      },
    ],
  },
  {
    id: 'n4-b25-06-cap-1',
    kanjiChar: '急',
    hanviet: 'CẤP',
    meaning: 'Gấp, vội',
    kunyomi: 'いそ.ぐ',
    onyomi: 'キュウ',
    examples: [
      {
        num: '①',
        japanese: '急行',
        reading: 'きゅうこう',
        meaning: 'tàu tốc hành',
      },
      {
        num: '②',
        japanese: '急行で行きます。',
        reading: 'きゅうこうでいきます。',
        meaning: 'Tôi sẽ đi bằng tàu tốc hành.',
      },
    ],
  },
  {
    id: 'n4-b25-07-dac',
    kanjiChar: '特',
    hanviet: 'ĐẶC',
    meaning: 'Đặc biệt',
    kunyomi: '—',
    onyomi: 'トク',
    examples: [
      {
        num: '①',
        japanese: '特急',
        reading: 'とっきゅう',
        meaning: 'tàu tốc hành đặc biệt',
      },
      {
        num: '②',
        japanese: '特急は速いです。',
        reading: 'とっきゅうははやいです。',
        meaning: 'Tàu tốc hành đặc biệt chạy nhanh.',
      },
    ],
  },
  {
    id: 'n4-b25-08-huyen',
    kanjiChar: '県',
    hanviet: 'HUYỆN',
    meaning: 'Tỉnh',
    kunyomi: '—',
    onyomi: 'ケン',
    examples: [
      {
        num: '①',
        japanese: '県',
        reading: 'けん',
        meaning: 'tỉnh',
      },
      {
        num: '②',
        japanese: 'この県は有名です。',
        reading: 'このけんはゆうめいです。',
        meaning: 'Tỉnh này nổi tiếng.',
      },
    ],
  },
  {
    id: 'n4-b25-09-thap',
    kanjiChar: '低',
    hanviet: 'THẤP',
    meaning: 'Thấp',
    kunyomi: 'ひく.い、ひく.める、ひく.まる',
    onyomi: 'テイ',
    examples: [
      {
        num: '①',
        japanese: '低い',
        reading: 'ひくい',
        meaning: 'thấp',
      },
      {
        num: '②',
        japanese: 'この机は低いです。',
        reading: 'このつくえはひくいです。',
        meaning: 'Cái bàn này thấp.',
      },
    ],
  },
  {
    id: 'n4-b25-10-nhuoc',
    kanjiChar: '弱',
    hanviet: 'NHƯỢC',
    meaning: 'Yếu',
    kunyomi: 'よわ.い、よわ.る、よわ.まる、よわ.める',
    onyomi: 'ジャク',
    examples: [
      {
        num: '①',
        japanese: '弱い',
        reading: 'よわい',
        meaning: 'yếu',
      },
      {
        num: '②',
        japanese: '私は体が弱いです。',
        reading: 'わたしはからだがよわいです。',
        meaning: 'Thể chất của tôi yếu.',
      },
    ],
  },
  {
    id: 'n4-b25-11-bat',
    kanjiChar: '不',
    hanviet: 'BẤT',
    meaning: 'Không',
    kunyomi: '—',
    onyomi: 'フ、ブ',
    examples: [
      {
        num: '①',
        japanese: '不便な',
        reading: 'ふべんな',
        meaning: 'bất tiện',
      },
      {
        num: '②',
        japanese: 'ここは交通が不便です。',
        reading: 'ここはこうつうがふべんです。',
        meaning: 'Ở đây giao thông bất tiện.',
      },
    ],
  },
  {
    id: 'n4-b25-12-cap-2',
    kanjiChar: '急',
    hanviet: 'CẤP',
    meaning: 'Gấp, vội',
    kunyomi: 'いそ.ぐ',
    onyomi: 'キュウ',
    examples: [
      {
        num: '①',
        japanese: '急ぐ',
        reading: 'いそぐ',
        meaning: 'vội, vội vàng',
      },
      {
        num: '②',
        japanese: '急いで行きます。',
        reading: 'いそいでいきます。',
        meaning: 'Tôi sẽ đi ngay cho kịp.',
      },
    ],
  },
];

/**
 * Sinh danh sách bài học cho một cấp độ
 */
export function getLessonsForLevel(level: KanjiLevel): KanjiProLesson[] {
  const levelInfo = KANJI_PRO_LEVELS.find(l => l.level === level);
  const start = levelInfo?.startLesson ?? 1;
  const total = levelInfo?.totalLessons ?? 25;

  const lessons: KanjiProLesson[] = [];

  for (let i = 0; i < total; i++) {
    const num = start + i;
    const isLesson24N4 = level === 'n4' && num === 24;
    const isLesson25N4 = level === 'n4' && num === 25;

    let kanjiList: KanjiProWord[] = [];
    let isAvailable = false;
    let description = `Nội dung Kanji cho Bài ${num} đang được cập nhật`;

    if (isLesson24N4) {
      kanjiList = LESSON_24_N4_KANJI;
      isAvailable = true;
      description = '9 chữ Hán: 試, 問, 答, 耳, 用, 験, 集, 研, 台';
    } else if (isLesson25N4) {
      kanjiList = LESSON_25_N4_KANJI;
      isAvailable = true;
      description =
        '12 mục chữ Hán: 飯, 場, 正, 世, 界, 急, 特, 県, 低, 弱, 不, 急';
    }

    lessons.push({
      id: `${level}-b${num}`,
      lessonNum: num,
      title: `Bài ${num}`,
      level,
      isAvailable,
      kanjiList,
      description,
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
