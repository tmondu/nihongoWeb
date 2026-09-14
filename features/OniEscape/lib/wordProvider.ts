import { toRomaji } from 'wanakana';
import type { OniWordItem, JLPTLevel } from '../types';
import type { IVocabObj } from '@/features/Vocabulary';

// Curated instant-load fallback N5 words (fast offline start)
const FALLBACK_N5_WORDS: Array<{
  word: string;
  reading: string;
  meaning: string;
}> = [
  { word: '食べる', reading: 'たべる', meaning: 'Ăn' },
  { word: '飲む', reading: 'のむ', meaning: 'Uống' },
  { word: '行く', reading: 'いく', meaning: 'Đi' },
  { word: '来る', reading: 'くる', meaning: 'Đến' },
  { word: '見る', reading: 'みる', meaning: 'Nhìn, xem' },
  { word: '聞く', reading: 'きく', meaning: 'Nghe' },
  { word: '話す', reading: 'はなす', meaning: 'Nói chuyện' },
  { word: '買う', reading: 'かう', meaning: 'Mua' },
  { word: '書く', reading: 'かく', meaning: 'Viết' },
  { word: '読む', reading: 'よむ', meaning: 'Đọc' },
  { word: '走る', reading: 'はしる', meaning: 'Chạy' },
  { word: '歩く', reading: 'あるく', meaning: 'Đi bộ' },
  { word: '待つ', reading: 'まつ', meaning: 'Chờ đợi' },
  { word: '寝る', reading: 'ねる', meaning: 'Ngủ' },
  { word: '起きる', reading: 'おきる', meaning: 'Thức dậy' },
  { word: '猫', reading: 'ねこ', meaning: 'Con mèo' },
  { word: '犬', reading: 'いぬ', meaning: 'Con chó' },
  { word: '車', reading: 'くるま', meaning: 'Xe hơi' },
  { word: '電車', reading: 'でんしゃ', meaning: 'Tàu điện' },
  { word: '学校', reading: 'がっこう', meaning: 'Trường học' },
  { word: '先生', reading: 'せんせい', meaning: 'Thầy cô' },
  { word: '友達', reading: 'ともだち', meaning: 'Bạn bè' },
  { word: '本', reading: 'ほん', meaning: 'Quyển sách' },
  { word: '水', reading: 'みず', meaning: 'Nước' },
  { word: 'お茶', reading: 'おちゃ', meaning: 'Trà' },
  { word: '魚', reading: 'さかな', meaning: 'Con cá' },
  { word: '肉', reading: 'にく', meaning: 'Thịt' },
  { word: '山', reading: 'やま', meaning: 'Ngọn núi' },
  { word: '川', reading: 'かわ', meaning: 'Dòng sông' },
  { word: '海', reading: 'うみ', meaning: 'Biển' },
  { word: '空', reading: 'そら', meaning: 'Bầu trời' },
  { word: '雨', reading: 'あめ', meaning: 'Cơn mưa' },
  { word: '月', reading: 'つき', meaning: 'Mặt trăng' },
  { word: '日', reading: 'ひ', meaning: 'Mặt trời, ngày' },
  { word: '手', reading: 'て', meaning: 'Bàn tay' },
  { word: '足', reading: 'あし', meaning: 'Bàn chân' },
  { word: '目', reading: 'め', meaning: 'Mắt' },
  { word: '耳', reading: 'みみ', meaning: 'Tai' },
  { word: '口', reading: 'くち', meaning: 'Miệng' },
  { word: '今日', reading: 'きょう', meaning: 'Hôm nay' },
  { word: '明日', reading: 'あした', meaning: 'Ngày mai' },
  { word: '昨日', reading: 'きのう', meaning: 'Hôm qua' },
  { word: '時間', reading: 'じかん', meaning: 'Thời gian' },
  { word: 'お金', reading: 'おかね', meaning: 'Tiền bạc' },
  { word: '家', reading: 'いえ', meaning: 'Ngôi nhà' },
  { word: '部屋', reading: 'へや', meaning: 'Căn phòng' },
  { word: '道', reading: 'みち', meaning: 'Con đường' },
  { word: '駅', reading: 'えき', meaning: 'Nhà ga' },
  { word: '桜', reading: 'さくら', meaning: 'Hoa anh đào' },
  { word: '刀', reading: 'かたな', meaning: 'Thanh kiếm' },
];

function formatRomaji(reading: string): string {
  return toRomaji(reading)
    .toLowerCase()
    .replace(/[^a-z]/g, '');
}

type RawVocabItem = {
  kanji: string | null;
  kana: string;
  waller_definition: string;
};

export async function fetchGameWords(
  level: JLPTLevel,
  customWords?: IVocabObj[],
): Promise<OniWordItem[]> {
  // If user provided custom vocabulary from facade
  if (customWords && customWords.length > 0) {
    return customWords.map((item, index) => ({
      id: `custom-${index}-${item.word}`,
      word: item.word,
      reading: item.reading,
      romaji: formatRomaji(item.reading),
      meaning: item.meanings?.[0] || item.word,
    }));
  }

  try {
    const res = await fetch(`/api/vocab?level=${level}`);
    if (res.ok) {
      const data = (await res.json()) as RawVocabItem[];
      if (Array.isArray(data) && data.length > 0) {
        return data
          .filter(item => item.kana)
          .map((item, index) => ({
            id: `${level}-${index}-${item.kanji || item.kana}`,
            word: item.kanji?.trim() || item.kana,
            reading: item.kana.trim(),
            romaji: formatRomaji(item.kana),
            meaning: item.waller_definition?.split(/[;,]/)[0]?.trim() || '',
          }))
          .filter(item => item.romaji.length > 0 && item.romaji.length <= 14);
      }
    }
  } catch (error) {
    console.warn(
      'Could not fetch online vocab for Oni Escape, using fallback:',
      error,
    );
  }

  // Fallback to offline N5 set
  return FALLBACK_N5_WORDS.map((item, index) => ({
    id: `fallback-${index}-${item.word}`,
    word: item.word,
    reading: item.reading,
    romaji: formatRomaji(item.reading),
    meaning: item.meaning,
  }));
}

export function shuffleWords<T>(array: T[]): T[] {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}
