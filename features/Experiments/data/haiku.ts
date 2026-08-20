// Collection of famous haiku for Daily Haiku experiment
export interface Haiku {
  japanese: string[];
  romanji: string[];
  english: string[];
  author: string;
  authorJapanese: string;
}

export const haikus: Haiku[] = [
  {
    japanese: ['古池や', '蛙飛び込む', '水の音'],
    romanji: ['furuike ya', 'kawazu tobikomu', 'mizu no oto'],
    english: ['Ao cũ đìu hiu', 'Con ếch nhảy vào', 'Vang tiếng nước xao'],
    author: 'Matsuo Bashō',
    authorJapanese: '松尾芭蕉',
  },
  {
    japanese: ['閑さや', '岩にしみ入る', '蝉の声'],
    romanji: ['shizukasa ya', 'iwa ni shimiiru', 'semi no koe'],
    english: ['Cảnh lặng tờ', 'Thấm sâu vào đá', 'Tiếng ve kêu sầu'],
    author: 'Matsuo Bashō',
    authorJapanese: '松尾芭蕉',
  },
  {
    japanese: ['菜の花や', '月は東に', '日は西に'],
    romanji: ['na no hana ya', 'tsuki wa higashi ni', 'hi wa nishi ni'],
    english: ['Hoa cải vàng', 'Trăng lên hướng đông', 'Mặt trời lặn hướng tây'],
    author: 'Yosa Buson',
    authorJapanese: '与謝蕪村',
  },
  {
    japanese: ['春の海', 'ひねもすのたり', 'のたりかな'],
    romanji: ['haru no umi', 'hinemosu notari', 'notari kana'],
    english: ['Biển mùa xuân', 'Sóng dập dềnh êm dịu', 'Suốt cả ngày dài'],
    author: 'Yosa Buson',
    authorJapanese: '与謝蕪村',
  },
  {
    japanese: ['痩蛙', '負けるな一茶', 'これにあり'],
    romanji: ['yasegaeru', 'makeruna issa', 'kore ni ari'],
    english: ['Chú ếch gầy', 'Đừng thua cuộc nhé', 'Có Issa ở đây rồi'],
    author: 'Kobayashi Issa',
    authorJapanese: '小林一茶',
  },
  {
    japanese: ['雪とけて', '村いっぱいの', '子どもかな'],
    romanji: ['yuki tokete', 'mura ippai no', 'kodomo kana'],
    english: [
      'Tuyết tan đi',
      'Cả ngôi làng tràn ngập',
      'Tiếng trẻ thơ vui đùa',
    ],
    author: 'Kobayashi Issa',
    authorJapanese: '小林一茶',
  },
  {
    japanese: ['柿くへば', '鐘が鳴るなり', '法隆寺'],
    romanji: ['kaki kueba', 'kane ga narunari', 'hōryūji'],
    english: ['Cắn miếng hồng', 'Chuông chùa vang vọng', 'Chùa Hōryūji'],
    author: 'Masaoka Shiki',
    authorJapanese: '正岡子規',
  },
  {
    japanese: ['夏草や', '兵どもが', '夢の跡'],
    romanji: ['natsukusa ya', 'tsuwamono domo ga', 'yume no ato'],
    english: ['Cỏ mùa hè', 'Dấu tích còn lại', 'Giấc mơ người chiến binh'],
    author: 'Matsuo Bashō',
    authorJapanese: '松尾芭蕉',
  },
  {
    japanese: ['荒海や', '佐渡によこたふ', '天の川'],
    romanji: ['araumi ya', 'sado ni yokotau', 'amanogawa'],
    english: [
      'Biển động dữ dội',
      'Trải dài đến đảo Sado',
      'Dải Ngân Hà lấp lánh',
    ],
    author: 'Matsuo Bashō',
    authorJapanese: '松尾芭蕉',
  },
  {
    japanese: ['五月雨を', 'あつめて早し', '最上川'],
    romanji: ['samidare wo', 'atsumete hayashi', 'mogamigawa'],
    english: ['Gom mưa tháng Năm', 'Dòng chảy xiết dữ dội', 'Sông Mogami'],
    author: 'Matsuo Bashō',
    authorJapanese: '松尾芭蕉',
  },
];

export const getDailyHaiku = (): Haiku => {
  const today = new Date();
  const dayOfYear = Math.floor(
    (today.getTime() - new Date(today.getFullYear(), 0, 0).getTime()) /
      86400000,
  );
  return haikus[dayOfYear % haikus.length];
};

export const getRandomHaiku = (): Haiku => {
  return haikus[Math.floor(Math.random() * haikus.length)];
};
