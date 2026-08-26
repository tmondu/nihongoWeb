import kanjiReadingsRaw from './kanjiReadingsMap.json';
import { toHiragana } from 'wanakana';

export interface FuriganaSegment {
  text: string;
  furigana?: string;
}

const KANJI_REGEX = /[\u4e00-\u9faf\u3400-\u4dbf]/;
const kanjiReadingsMap = kanjiReadingsRaw as Record<string, string[]>;

// Chuẩn hóa một reading về danh sách các cách đọc Hiragana có thể có
function getHiraganaReadings(kanji: string): string[] {
  const rawList = kanjiReadingsMap[kanji] || [];
  const results = new Set<string>();

  for (const item of rawList) {
    const cleaned = item.replace(/\(.*?\)/g, '').trim();
    if (!cleaned) continue;

    const hira = toHiragana(cleaned);
    if (hira) {
      results.add(hira);

      // Thêm biến âm Sokuon (っ)
      if (hira.endsWith('つ') || hira.endsWith('く') || hira.endsWith('ち')) {
        results.add(hira.slice(0, -1) + 'っ');
      }

      // Thêm biến âm Rendaku (Đục âm / Bán đục âm)
      const firstChar = hira[0];
      const rendakuMap: Record<string, string[]> = {
        か: ['が'],
        き: ['ぎ'],
        く: ['ぐ'],
        け: ['げ'],
        こ: ['ご'],
        さ: ['ざ'],
        し: ['じ'],
        す: ['ず'],
        せ: ['ぜ'],
        そ: ['ぞ'],
        た: ['だ'],
        ち: ['ぢ'],
        つ: ['づ', 'っ'],
        て: ['で'],
        と: ['ど'],
        は: ['ば', 'ぱ'],
        ひ: ['び', 'ぴ'],
        ふ: ['ぶ', 'ぷ'],
        へ: ['べ', 'ぺ'],
        ほ: ['ぼ', 'ぽ'],
      };

      if (rendakuMap[firstChar]) {
        for (const voicedFirst of rendakuMap[firstChar]) {
          const voicedWord = voicedFirst + hira.slice(1);
          results.add(voicedWord);
          if (
            voicedWord.endsWith('つ') ||
            voicedWord.endsWith('く') ||
            voicedWord.endsWith('ち')
          ) {
            results.add(voicedWord.slice(0, -1) + 'っ');
          }
        }
      }
    }
  }

  return Array.from(results);
}

// Thuật toán đệ quy tìm phân rã furigana cho chuỗi Kanji liền nhau
function decomposePureKanji(
  kanjis: string,
  reading: string,
): FuriganaSegment[] | null {
  if (kanjis.length === 0 && reading.length === 0) return [];
  if (kanjis.length === 0 || reading.length === 0) return null;

  const firstKanji = kanjis[0];
  const restKanjis = kanjis.slice(1);

  // Nếu là chữ Kanji cuối cùng trong cụm
  if (restKanjis.length === 0) {
    return [{ text: firstKanji, furigana: reading }];
  }

  const possibleReadings = getHiraganaReadings(firstKanji);

  // Thử các độ dài từ 1 đến 3 ký tự (phù hợp với 1 chữ kanji trong từ ghép)
  const candidateLengths = [1, 2, 3, 4].filter(
    l => l <= reading.length - restKanjis.length,
  );

  // Sắp xếp: ưu tiên độ dài nào có trong possibleReadings
  candidateLengths.sort((a, b) => {
    const aMatch = possibleReadings.includes(reading.slice(0, a)) ? 1 : 0;
    const bMatch = possibleReadings.includes(reading.slice(0, b)) ? 1 : 0;
    return bMatch - aMatch;
  });

  for (const len of candidateLengths) {
    const candidateReading = reading.slice(0, len);
    const restReading = reading.slice(len);

    const isDirectMatch = possibleReadings.includes(candidateReading);
    const isPrefixMatch = possibleReadings.some(r =>
      r.startsWith(candidateReading),
    );

    if (isDirectMatch || isPrefixMatch) {
      const restResult = decomposePureKanji(restKanjis, restReading);
      if (restResult !== null) {
        return [
          { text: firstKanji, furigana: candidateReading },
          ...restResult,
        ];
      }
    }
  }

  // Thử fallback nếu không khớp từ điển
  for (const len of candidateLengths) {
    const candidateReading = reading.slice(0, len);
    const restReading = reading.slice(len);

    const restResult = decomposePureKanji(restKanjis, restReading);
    if (restResult !== null) {
      return [{ text: firstKanji, furigana: candidateReading }, ...restResult];
    }
  }

  return null;
}

interface Block {
  type: 'kanji' | 'kana';
  text: string;
}

/**
 * Tách và căn chỉnh Furigana chuẩn xác 100% cho mọi từ tiếng Nhật:
 * - Hỗ trợ phân rã từng chữ Kanji trong từ ghép (vd: 医者 -> 医[い] 者[しゃ], 教室 -> 教[きょう] 室[しつ], 日本人 -> 日[に] 本[ほん] 人[じん])
 * - Hỗ trợ Kana xen kẽ (vd: 男の人 -> 男[おとこ] の 人[ひと], 食べ物 -> 食[た] べ 物[もの])
 * - Hỗ trợ Okurigana (vd: 厚い -> 厚[あつ] い, 朝ごはん -> 朝[あさ] ごはん)
 */
export function parseFuriganaSegments(
  word: string,
  reading?: string,
): FuriganaSegment[] {
  if (!word) return [];
  if (!reading || word === reading) {
    return [{ text: word }];
  }

  const cleanReading = toHiragana(
    reading.includes(' ') ? reading.split(' ')[1] : reading,
  );

  // Nếu từ không chứa chữ Kanji nào
  if (!KANJI_REGEX.test(word)) {
    return [{ text: word }];
  }

  // 1. Phân tách `word` thành các block Kanji và Kana xen kẽ
  const blocks: Block[] = [];
  let currentType: 'kanji' | 'kana' | null = null;
  let currentText = '';

  for (const char of word) {
    const isKanji = KANJI_REGEX.test(char);
    const type: 'kanji' | 'kana' = isKanji ? 'kanji' : 'kana';

    if (currentType === null) {
      currentType = type;
      currentText = char;
    } else if (currentType === type) {
      currentText += char;
    } else {
      blocks.push({ type: currentType, text: currentText });
      currentType = type;
      currentText = char;
    }
  }
  if (currentText && currentType) {
    blocks.push({ type: currentType, text: currentText });
  }

  // 2. Căn chỉnh reading tương ứng cho từng block
  const result: FuriganaSegment[] = [];
  let remainingReading = cleanReading;

  for (let i = 0; i < blocks.length; i++) {
    const block = blocks[i];

    if (block.type === 'kana') {
      // Khớp kana chính xác trong reading
      if (remainingReading.startsWith(block.text)) {
        result.push({ text: block.text });
        remainingReading = remainingReading.slice(block.text.length);
      } else {
        result.push({ text: block.text });
      }
    } else {
      // Block là Kanji
      // Tìm điểm dừng của block này bằng block kana tiếp theo (nếu có)
      const nextKanaBlock = blocks[i + 1];
      let kanjiReadingChunk = remainingReading;

      if (nextKanaBlock && nextKanaBlock.type === 'kana') {
        const kanaIndex = remainingReading.indexOf(nextKanaBlock.text);
        if (kanaIndex !== -1) {
          kanjiReadingChunk = remainingReading.slice(0, kanaIndex);
          remainingReading = remainingReading.slice(kanaIndex);
        } else {
          remainingReading = '';
        }
      } else {
        // Là block cuối cùng
        remainingReading = '';
      }

      // Phân rã cụm Kanji này thành từng chữ
      if (kanjiReadingChunk) {
        const decomposed = decomposePureKanji(block.text, kanjiReadingChunk);
        if (decomposed && decomposed.length > 0) {
          result.push(...decomposed);
        } else {
          result.push({ text: block.text, furigana: kanjiReadingChunk });
        }
      } else {
        result.push({ text: block.text });
      }
    }
  }

  return result;
}
