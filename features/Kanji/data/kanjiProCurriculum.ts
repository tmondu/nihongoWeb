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

export const LESSON_26_N4_KANJI: KanjiProWord[] = [
  {
    id: 'n4-b26-01-nghi-1',
    kanjiChar: '議',
    hanviet: 'NGHỊ',
    meaning: 'Bàn bạc',
    kunyomi: '—',
    onyomi: 'ギ',
    examples: [
      { num: '①', japanese: '会議', reading: 'かいぎ', meaning: 'cuộc họp' },
      {
        num: '②',
        japanese: '会議が始まります。',
        reading: 'かいぎがはじまります。',
        meaning: 'Cuộc họp bắt đầu.',
      },
    ],
  },
  {
    id: 'n4-b26-02-nghi-2',
    kanjiChar: '議',
    hanviet: 'NGHỊ',
    meaning: 'Bàn bạc',
    kunyomi: '—',
    onyomi: 'ギ',
    examples: [
      {
        num: '①',
        japanese: '国会議事堂',
        reading: 'こっかいぎじどう',
        meaning: 'tòa nhà Quốc hội',
      },
      {
        num: '②',
        japanese: '国会議事堂を見に行きました。',
        reading: 'こっかいぎじどうをみにいきました。',
        meaning: 'Tôi đã đi xem tòa nhà Quốc hội.',
      },
    ],
  },
  {
    id: 'n4-b26-03-tru',
    kanjiChar: '駐',
    hanviet: 'TRÚ',
    meaning: 'Đỗ, lưu trú',
    kunyomi: '—',
    onyomi: 'チュウ',
    examples: [
      {
        num: '①',
        japanese: '駐車場',
        reading: 'ちゅうしゃじょう',
        meaning: 'bãi đỗ xe',
      },
      {
        num: '②',
        japanese: '駐車場はこちらです。',
        reading: 'ちゅうしゃじょうはこちらです。',
        meaning: 'Bãi đỗ xe ở đằng kia.',
      },
    ],
  },
  {
    id: 'n4-b26-04-mao',
    kanjiChar: '帽',
    hanviet: 'MẠO',
    meaning: 'Mũ, nón',
    kunyomi: '—',
    onyomi: 'ボウ',
    examples: [
      { num: '①', japanese: '帽子', reading: 'ぼうし', meaning: 'mũ, nón' },
      {
        num: '②',
        japanese: '新しい帽子を買いました。',
        reading: 'あたらしいぼうしをかいました。',
        meaning: 'Tôi đã mua mũ mới.',
      },
    ],
  },
  {
    id: 'n4-b26-05-hoanh',
    kanjiChar: '横',
    hanviet: 'HOÀNH',
    meaning: 'Ngang, bên cạnh',
    kunyomi: 'よこ',
    onyomi: 'オウ',
    examples: [
      { num: '①', japanese: '横', reading: 'よこ', meaning: 'bên cạnh' },
      {
        num: '②',
        japanese: '駅の横にコンビニがあります。',
        reading: 'えきのよこにコンビニがあります。',
        meaning: 'Bên cạnh ga có cửa hàng tiện lợi.',
      },
    ],
  },
  {
    id: 'n4-b26-06-thi',
    kanjiChar: '市',
    hanviet: 'THỊ',
    meaning: 'Thành phố, chợ',
    kunyomi: 'いち',
    onyomi: 'シ',
    examples: [
      {
        num: '①',
        japanese: '市役所',
        reading: 'しやくしょ',
        meaning: 'tòa thị chính',
      },
      {
        num: '②',
        japanese: '市役所へ行きます。',
        reading: 'しやくしょへいきます。',
        meaning: 'Tôi đến tòa thị chính.',
      },
    ],
  },
  {
    id: 'n4-b26-07-dich',
    kanjiChar: '役',
    hanviet: 'DỊCH',
    meaning: 'Vai trò',
    kunyomi: '—',
    onyomi: 'ヤク、エキ',
    examples: [
      {
        num: '①',
        japanese: '市役所',
        reading: 'しやくしょ',
        meaning: 'tòa thị chính',
      },
      {
        num: '②',
        japanese: '市役所で手続きをします。',
        reading: 'しやくしょでてつづきをします。',
        meaning: 'Tôi làm thủ tục ở tòa thị chính.',
      },
    ],
  },
  {
    id: 'n4-b26-08-so',
    kanjiChar: '所',
    hanviet: 'SỞ',
    meaning: 'Nơi, chỗ',
    kunyomi: 'ところ',
    onyomi: 'ショ',
    examples: [
      { num: '①', japanese: '場所', reading: 'ばしょ', meaning: 'địa điểm' },
      {
        num: '②',
        japanese: 'ここは待ち合わせの場所です。',
        reading: 'ここはまちあわせのばしょです。',
        meaning: 'Đây là nơi hẹn gặp.',
      },
    ],
  },
  {
    id: 'n4-b26-09-thap',
    kanjiChar: '拾',
    hanviet: 'THẬP',
    meaning: 'Nhặt',
    kunyomi: 'ひろ.う',
    onyomi: 'シュウ、ジュウ',
    examples: [
      { num: '①', japanese: '拾う', reading: 'ひろう', meaning: 'nhặt, lượm' },
      {
        num: '②',
        japanese: '道で財布を拾いました。',
        reading: 'みちでさいふをひろいました。',
        meaning: 'Tôi đã nhặt được ví trên đường.',
      },
    ],
  },
  {
    id: 'n4-b26-10-xa',
    kanjiChar: '捨',
    hanviet: 'XẢ',
    meaning: 'Vứt, bỏ',
    kunyomi: 'す.てる',
    onyomi: 'シャ',
    examples: [
      {
        num: '①',
        japanese: '捨てる',
        reading: 'すてる',
        meaning: 'vứt, bỏ',
      },
      {
        num: '②',
        japanese: 'ごみを捨ててください。',
        reading: 'ごみをすててください。',
        meaning: 'Hãy vứt rác.',
      },
    ],
  },
  {
    id: 'n4-b26-11-tri',
    kanjiChar: '遅',
    hanviet: 'TRÌ',
    meaning: 'Chậm, muộn',
    kunyomi: 'おく.れる、おく.らす、おそ.い',
    onyomi: 'チ',
    examples: [
      {
        num: '①',
        japanese: '遅れる',
        reading: 'おくれる',
        meaning: 'trễ, muộn',
      },
      {
        num: '②',
        japanese: '電車に遅れました。',
        reading: 'でんしゃにおくれました。',
        meaning: 'Tôi đã bị lỡ tàu.',
      },
    ],
  },
  {
    id: 'n4-b26-12-vien',
    kanjiChar: '遠',
    hanviet: 'VIỄN',
    meaning: 'Xa',
    kunyomi: 'とお.い',
    onyomi: 'エン、オン',
    examples: [
      { num: '①', japanese: '遠い', reading: 'とおい', meaning: 'xa' },
      {
        num: '②',
        japanese: '駅は遠いです。',
        reading: 'えきはとおいです。',
        meaning: 'Ga ở xa.',
      },
    ],
  },
  {
    id: 'n4-b26-13-tue',
    kanjiChar: '歳',
    hanviet: 'TUẾ',
    meaning: 'Tuổi',
    kunyomi: '—',
    onyomi: 'サイ、セイ',
    examples: [
      { num: '①', japanese: '～歳', reading: 'さい', meaning: 'tuổi' },
      {
        num: '②',
        japanese: '私は２０歳です。',
        reading: 'わたしはにじゅっさいです。',
        meaning: 'Tôi 20 tuổi.',
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
    const isLesson26N4 = level === 'n4' && num === 26;

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
    } else if (isLesson26N4) {
      kanjiList = LESSON_26_N4_KANJI;
      isAvailable = true;
      description =
        '13 mục chữ Hán: 議, 議, 駐, 帽, 横, 市, 役, 所, 拾, 捨, 遅, 遠, 歳';
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
