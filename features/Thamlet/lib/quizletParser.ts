import { QuizletImportResult } from '../types';

export interface ParseOptions {
  termSeparator?: string; // Mặc định là '\t' hoặc ',' hoặc ' - '
  cardSeparator?: string; // Mặc định là '\n'
}

/**
 * Tự động phát hiện ký tự phân tách giữa thuật ngữ và định nghĩa
 */
function detectTermSeparator(lines: string[]): string {
  const sampleLines = lines.slice(0, 5);

  const hasTabs = sampleLines.some(line => line.includes('\t'));
  if (hasTabs) return '\t';

  const hasHyphens = sampleLines.some(line => line.includes(' - '));
  if (hasHyphens) return ' - ';

  const hasPipe = sampleLines.some(line => line.includes('|'));
  if (hasPipe) return '|';

  const hasColon = sampleLines.some(line => line.includes(': '));
  if (hasColon) return ': ';

  const hasComma = sampleLines.some(line => line.includes(','));
  if (hasComma) return ',';

  return '\t';
}

/**
 * Phân tích dữ liệu văn bản copy từ Quizlet hoặc Excel thành danh sách thẻ Flashcard
 */
export function parseQuizletText(
  rawText: string,
  options?: ParseOptions,
): QuizletImportResult {
  if (!rawText || !rawText.trim()) {
    return { cards: [] };
  }

  const cardSeparator = options?.cardSeparator || '\n';
  const lines = rawText
    .split(cardSeparator)
    .map(line => line.trim())
    .filter(line => line.length > 0);

  if (lines.length === 0) {
    return { cards: [] };
  }

  const termSeparator = options?.termSeparator || detectTermSeparator(lines);

  const cards = lines
    .map(line => {
      const parts = line.split(termSeparator);
      if (parts.length < 2) return null;

      const term = parts[0].trim();
      const definition = parts.slice(1).join(termSeparator).trim();

      if (!term || !definition) return null;

      // Nhận diện nếu term có dạng "Kanji (Hiragana)" hoặc "Từ [Romaji]"
      let cleanTerm = term;
      let reading: string | undefined = undefined;

      const bracketMatch = term.match(/^(.+?)\s*[\(\[\{](.+?)[\)\]\}]$/);
      if (bracketMatch) {
        cleanTerm = bracketMatch[1].trim();
        reading = bracketMatch[2].trim();
      }

      return {
        term: cleanTerm,
        definition,
        reading,
      };
    })
    .filter((card): card is NonNullable<typeof card> => card !== null);

  return {
    cards,
  };
}
