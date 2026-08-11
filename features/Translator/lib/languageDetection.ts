import type { LanguageDetectionResult } from '../types';

/**
 * Detect if text is Japanese or English
 * @param text - Text to analyze
 * @returns Detected language with confidence score
 */
export function detectLanguage(text: string): LanguageDetectionResult {
  if (!text || text.trim().length === 0) {
    return { language: 'en', confidence: 0 };
  }

  const trimmedText = text.trim();

  // Count Japanese characters
  const hiraganaCount = (trimmedText.match(/[\u3040-\u309F]/g) || []).length;
  const katakanaCount = (trimmedText.match(/[\u30A0-\u30FF]/g) || []).length;
  const kanjiCount = (trimmedText.match(/[\u4E00-\u9FAF]/g) || []).length;
  const japaneseCount = hiraganaCount + katakanaCount + kanjiCount;

  // Count Latin characters (excluding spaces and punctuation)
  const latinCount = (trimmedText.match(/[a-zA-Z]/g) || []).length;

  // Check for Vietnamese specific characters/diacritics
  const vietnameseRegex =
    /[àáảãạâầấẩẫậăằắẳẵặèéẻẽẹêềếểễệìíỉĩịòóỏõọôồốổỗộơờớởỡợùúủũụưừứửữựỳýỷỹỵđÀÁẢÃẠÂẦẤẨẪẬĂẰẮẲẴẶÈÉẺẼẸÊỀẾỂỄỆÌÍỈĨỊÒÓỎÕỌÔỒỐỔỖỘƠỜỚỞỠỢÙÚỦŨỤƯỪỨỬỮỰỲÝỶỸỸĐ]/;
  const hasVietnameseChars = vietnameseRegex.test(trimmedText);

  // Total meaningful characters
  const totalChars = japaneseCount + latinCount;

  if (totalChars === 0) {
    // Only punctuation or numbers
    return { language: 'vi', confidence: 0.3 };
  }

  // Calculate Japanese ratio
  const japaneseRatio = japaneseCount / totalChars;

  // Determine language and confidence
  if (japaneseRatio > 0.5) {
    // More than 50% Japanese characters = Japanese
    const confidence = Math.min(0.6 + japaneseRatio * 0.4, 1);
    return { language: 'ja', confidence };
  } else if (hasVietnameseChars) {
    // Vietnamese specific characters = Vietnamese
    return { language: 'vi', confidence: 0.95 };
  } else {
    // Check for common English vs Vietnamese words if no specific diacritics are present
    const commonEnWords =
      /\b(the|be|to|of|and|a|in|that|have|i|it|for|not|on|with|he|as|you|do|at|this|but|his|by|from|they|we|say|her|she|or|an|will|my|one|all|would|there|their|what|so|up|out|if|about|who|get|which|go|me|when|make|can|like|time|no|just|him|know|take|people|into|year|your|good|some|could|them|see|other|than|then|now|look|only|come|its|over|think|also|back|after|use|two|how|our|work|first|well|way|even|new|want|because|any|these|give|day|most|us)\b/i;
    const commonViWords =
      /\b(và|là|có|của|trong|một|cho|với|không|được|người|các|này|đã|đang|sẽ|nào|lúc|khi|nhưng|họ|tôi|chúng|nó|để|ra|vào|lên|về|đến|ở|tại|theo|nơi|việc|những|thì|mà|như|cũng|hơn|nhất|trên|dưới|này|kia|đó|đây|nước|nhà|bạn|anh|chị|em|ông|bà|con|cái)\b/i;

    if (commonViWords.test(trimmedText)) {
      return { language: 'vi', confidence: 0.85 };
    } else if (commonEnWords.test(trimmedText)) {
      return { language: 'en', confidence: 0.85 };
    }

    // Default to 'vi' if unsure
    const confidence = latinCount > 5 ? 0.8 : 0.6;
    return { language: 'vi', confidence };
  }
}

/**
 * Format confidence as percentage string
 */
export function formatConfidence(confidence: number): string {
  return `${Math.round(confidence * 100)}%`;
}

/**
 * Get confidence level description
 */
export function getConfidenceLevel(
  confidence: number,
): 'high' | 'medium' | 'low' {
  if (confidence >= 0.8) return 'high';
  if (confidence >= 0.5) return 'medium';
  return 'low';
}
