/**
 * Vietnamese IME (Telex/VNI) to Japanese Romaji decoder.
 * Automatically resolves accents/diacritics created by Unikey, EVKey, OpenKey,
 * or OS Vietnamese keyboards back to their intended Romaji keystrokes.
 */

const VIETNAMESE_TELEX_MAP: Record<string, string> = {
  // a + tones / accents
  á: 'as',
  à: 'af',
  ả: 'ar',
  ã: 'ax',
  ạ: 'aj',
  â: 'aa',
  ấ: 'aas',
  ầ: 'aaf',
  ẩ: 'aar',
  ẫ: 'aax',
  ậ: 'aaj',
  ă: 'aw',
  ắ: 'aws',
  ằ: 'awf',
  ẳ: 'awr',
  ẵ: 'awx',
  ặ: 'awj',

  // e + tones / accents
  é: 'es',
  è: 'ef',
  ẻ: 'er',
  ẽ: 'ex',
  ẹ: 'ej',
  ê: 'ee',
  ế: 'ees',
  ề: 'eef',
  ể: 'eer',
  ễ: 'eex',
  ệ: 'eej',

  // i + tones
  í: 'is',
  ì: 'if',
  ỉ: 'ir',
  ĩ: 'ix',
  ị: 'ij',

  // o + tones / accents
  ó: 'os',
  ò: 'of',
  ỏ: 'or',
  õ: 'ox',
  ọ: 'oj',
  ô: 'oo',
  ố: 'oos',
  ồ: 'oof',
  ổ: 'oor',
  ỗ: 'oox',
  ộ: 'ooj',
  ơ: 'ow',
  ớ: 'ows',
  ờ: 'owf',
  ở: 'owr',
  ỡ: 'owx',
  ợ: 'owj',

  // u + tones / accents
  ú: 'us',
  ù: 'uf',
  ủ: 'ur',
  ũ: 'ux',
  ụ: 'uj',
  ư: 'uw',
  ứ: 'uws',
  ừ: 'uwf',
  ử: 'uwr',
  ữ: 'uwx',
  ự: 'uwj',

  // y + tones
  ý: 'ys',
  ỳ: 'yf',
  ỷ: 'yr',
  ỹ: 'yx',
  ỵ: 'yj',

  // d
  đ: 'dd',
};

/**
 * Decodes input string (which might contain Vietnamese diacritics from Telex/VNI)
 * into the intended Romaji string based on targetRomaji context.
 */
export function decodeVietnameseToRomaji(
  input: string,
  targetRomaji: string,
): string {
  if (!input) return '';

  // Normalize Unicode to NFC precomposed form
  const val = input.normalize('NFC').toLowerCase();
  let unpacked = '';

  for (let i = 0; i < val.length; i++) {
    const char = val[i];

    // Special case for 'ư' (often typed as 'w' or 'uw')
    if (char === 'ư') {
      const nextExpected = targetRomaji.slice(unpacked.length);
      if (nextExpected.startsWith('w')) {
        unpacked += 'w';
      } else if (nextExpected.startsWith('uw')) {
        unpacked += 'uw';
      } else if (nextExpected.startsWith('u')) {
        unpacked += 'u';
      } else {
        unpacked += 'w';
      }
      continue;
    }

    // Special case for 'ơ' (often typed as 'ow' or 'o')
    if (char === 'ơ') {
      const nextExpected = targetRomaji.slice(unpacked.length);
      if (nextExpected.startsWith('ow')) {
        unpacked += 'ow';
      } else {
        unpacked += 'o';
      }
      continue;
    }

    // Special case for 'ă' (often typed as 'aw' or 'a')
    if (char === 'ă') {
      const nextExpected = targetRomaji.slice(unpacked.length);
      if (nextExpected.startsWith('aw')) {
        unpacked += 'aw';
      } else {
        unpacked += 'a';
      }
      continue;
    }

    // General Telex map lookup
    if (VIETNAMESE_TELEX_MAP[char]) {
      const telexSequence = VIETNAMESE_TELEX_MAP[char];
      const nextExpected = targetRomaji.slice(unpacked.length);

      // Check if target expects the full sequence (e.g. 'as' for 'á', 'or' for 'ỏ', 'ee' for 'ê')
      if (nextExpected.startsWith(telexSequence)) {
        unpacked += telexSequence;
      } else {
        // Otherwise check if target expects just the base vowel without the tone key
        const baseChar = telexSequence[0];
        if (nextExpected.startsWith(baseChar)) {
          unpacked += baseChar;
        } else {
          unpacked += telexSequence;
        }
      }
      continue;
    }

    // Normal Latin letter
    unpacked += char;
  }

  // Only keep alphanumeric a-z characters
  return unpacked.replace(/[^a-z]/g, '');
}
