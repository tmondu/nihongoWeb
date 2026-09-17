import { toKana, toRomaji } from 'wanakana';
import type { IKanjiObj } from '@/entities/kanji';
import type { IVocabObj } from '@/entities/vocabulary';

/**
 * Checks if a string contains Vietnamese diacritics / tones
 */
export function hasVietnameseAccent(str: string): boolean {
  return /[àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ]/i.test(
    str,
  );
}

/**
 * Strips Vietnamese diacritics and converts 'đ' to 'd' for unaccented search
 */
export function stripVietnameseAccents(str: string): string {
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/gi, 'd');
}

/**
 * Calculates a matching score for a meaning / definition text against a query.
 * Uses exact word-boundary token matching to prevent false positives like
 * "an" matching "nhật bản", "bạn", "sáng", "màu xanh (danh từ)", etc.
 *
 * Scores:
 * 1000: Exact meaning match
 *  800: Starts with query (whole word token)
 *  600: Contains query as a whole word token
 *  400: Prefix match on a word (only for queries >= 3 chars)
 *  500: Unaccented exact match
 *  450: Unaccented starts with
 *  350: Unaccented word token
 *  250: Unaccented word prefix (queries >= 3 chars)
 *    0: No match
 */
export function matchMeaningScore(
  text: string,
  query: string,
  hasAccent?: boolean,
): number {
  if (!text || !query) return 0;
  const t = text.toLowerCase().trim();
  const q = query.toLowerCase().trim();
  if (!t || !q) return 0;

  // 1. Exact match with meaning
  if (t === q) return 1000;

  const isAccented =
    typeof hasAccent === 'boolean' ? hasAccent : hasVietnameseAccent(q);

  // 2. Exact word token matching (e.g. "thức ăn", "ăn uống" for query "ăn")
  const escaped = q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const tokenRegex = new RegExp(
    `(^|[^\\p{L}\\p{N}])${escaped}([^\\p{L}\\p{N}]|$)`,
    'u',
  );

  if (tokenRegex.test(t)) {
    if (t.startsWith(q)) return 800; // e.g. "ăn uống"
    return 600; // e.g. "thức ăn"
  }

  // 3. Prefix match on a word token (only if query is at least 3 characters)
  if (q.length >= 3) {
    const prefixRegex = new RegExp(`(^|[^\\p{L}\\p{N}])${escaped}`, 'u');
    if (prefixRegex.test(t)) return 400;
  }

  // 4. If user query has NO accents (e.g. "an", "hoc", "thuc an"):
  // Match unaccented tokens without false substring matching inside other syllables
  if (!isAccented) {
    const cleanT = stripVietnameseAccents(t);
    const cleanQ = stripVietnameseAccents(q);

    if (cleanT === cleanQ) return 500;

    const cleanEscaped = cleanQ.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const cleanTokenRegex = new RegExp(
      `(^|[^\\p{L}\\p{N}])${cleanEscaped}([^\\p{L}\\p{N}]|$)`,
      'u',
    );

    if (cleanTokenRegex.test(cleanT)) {
      if (cleanT.startsWith(cleanQ)) return 450;
      return 350;
    }

    if (cleanQ.length >= 3) {
      const cleanPrefixRegex = new RegExp(
        `(^|[^\\p{L}\\p{N}])${cleanEscaped}`,
        'u',
      );
      if (cleanPrefixRegex.test(cleanT)) return 250;
    }
  }

  return 0;
}

/**
 * Scores a Kanji object match against a search query.
 */
export function scoreKanjiMatch(
  kanji: IKanjiObj,
  query: string,
  hanvietMap: Record<string, string>,
): number {
  const q = query.trim().toLowerCase();
  if (!q) return 0;

  const hasAccent = hasVietnameseAccent(q);
  const cleanQ = stripVietnameseAccents(q);
  let score = 0;

  // 1. Direct Kanji character match
  if (kanji.kanjiChar === q) {
    score = Math.max(score, 1200);
  } else if (q.includes(kanji.kanjiChar)) {
    score = Math.max(score, 900);
  }

  // 2. Sino-Vietnamese reading (âm Hán-Việt)
  const hanviet = hanvietMap[kanji.kanjiChar];
  if (hanviet) {
    const cleanHanviet = stripVietnameseAccents(hanviet.toLowerCase());
    if (cleanHanviet === cleanQ) {
      score = Math.max(score, 950);
    } else if (cleanHanviet.startsWith(cleanQ) && cleanQ.length >= 2) {
      score = Math.max(score, 650);
    }
  }

  // 3. Onyomi / Kunyomi readings
  for (const on of kanji.onyomi || []) {
    const o = on.toLowerCase();
    if (o === q) score = Math.max(score, 850);
    else if (o.startsWith(q)) score = Math.max(score, 600);
  }
  for (const kun of kanji.kunyomi || []) {
    const ku = kun.toLowerCase();
    if (ku === q) score = Math.max(score, 850);
    else if (ku.startsWith(q)) score = Math.max(score, 600);
  }

  // 4. Meanings
  for (const m of kanji.meanings || []) {
    const s = matchMeaningScore(m, q, hasAccent);
    if (s > score) score = s;
  }

  return score;
}

/**
 * Scores a Vocabulary object match against a search query.
 */
export function scoreVocabMatch(vocab: IVocabObj, query: string): number {
  const q = query.trim().toLowerCase();
  if (!q) return 0;

  const hasAccent = hasVietnameseAccent(q);
  const kanaQ = toKana(q).toLowerCase();

  let score = 0;
  const word = (vocab.word || '').toLowerCase();
  const rawReading =
    typeof vocab.reading === 'string' ? vocab.reading.toLowerCase() : '';
  const baseReading = rawReading.split(' ')[1] || rawReading;
  const romaji = toRomaji(baseReading).toLowerCase();

  // 1. Exact or prefix Japanese Kanji/Kana word match
  if (word === q || word === kanaQ) {
    score = Math.max(score, 1200);
  } else if (word.startsWith(q) || word.startsWith(kanaQ)) {
    score = Math.max(score, 900);
  } else if (word.includes(q) || word.includes(kanaQ)) {
    score = Math.max(score, 600);
  }

  // 2. Reading match (Hiragana / Romaji)
  if (rawReading === q || rawReading === kanaQ || romaji === q) {
    score = Math.max(score, 1000);
  } else if (
    rawReading.startsWith(q) ||
    rawReading.startsWith(kanaQ) ||
    romaji.startsWith(q)
  ) {
    score = Math.max(score, 800);
  } else if (rawReading.includes(kanaQ) || romaji.includes(q)) {
    score = Math.max(score, 500);
  }

  // 3. Meaning match
  const meanings = Array.isArray(vocab.meanings)
    ? vocab.meanings
    : [vocab.meanings || ''];

  for (const m of meanings) {
    const s = matchMeaningScore(m, q, hasAccent);
    if (s > score) score = s;
  }

  return score;
}
