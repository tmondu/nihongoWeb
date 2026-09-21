import kanjiHanVietData from '@/shared/data/kanji_hanviet.json';
import type {
  ReaderToken,
  WordLookupDetail,
  WordPronunciation,
} from '../types';

const hanVietMap: Record<string, string> = kanjiHanVietData as Record<
  string,
  string
>;

/**
 * Get Sino-Vietnamese (Hán-Việt) reading for any Japanese word or character.
 * For compounds (e.g. 先生), combines individual character readings (Tiên Sinh).
 */
export function getWordHanViet(text: string): string {
  if (!text) return '';
  const readings: string[] = [];

  for (const char of text) {
    if (hanVietMap[char]) {
      // Pick first reading if comma-separated
      const firstReading = hanVietMap[char].split(',')[0].trim();
      readings.push(firstReading);
    }
  }

  return readings.join(' ');
}

interface AnalyzedApiToken {
  surface: string;
  reading?: string;
  basicForm?: string;
  pos: string;
  posDetail?: string;
  translation?: string;
}

const articleTokenCache = new Map<string, ReaderToken[][]>();

/**
 * High-performance client-side tokenizer fallback using Intl.Segmenter.
 * Guarantees zero 429 errors and immediate response even offline.
 */
export function fallbackTokenize(text: string): ReaderToken[][] {
  const lines = text
    .split('\n')
    .map(l => l.trim())
    .filter(l => l.length > 0);

  if (typeof Intl !== 'undefined' && 'Segmenter' in Intl) {
    const segmenter = new Intl.Segmenter('ja', { granularity: 'word' });
    return lines.map((line, sIdx) => {
      const segments = Array.from(segmenter.segment(line));
      return segments.map((seg, tIdx) => ({
        id: `${sIdx}-${tIdx}-${seg.segment}`,
        surface: seg.segment,
        pos: 'Word',
        sentenceIndex: sIdx,
        tokenIndex: tIdx,
        hanViet: getWordHanViet(seg.segment),
      }));
    });
  }

  // Basic fallback
  return lines.map((line, sIdx) => [
    {
      id: `${sIdx}-0`,
      surface: line,
      pos: 'Text',
      sentenceIndex: sIdx,
      tokenIndex: 0,
      hanViet: getWordHanViet(line),
    },
  ]);
}

/**
 * Analyze an entire article in ONE single API request instead of looping per sentence.
 * Completely prevents 429 rate limit errors (15 req/min quota).
 */
export async function analyzeArticle(text: string): Promise<ReaderToken[][]> {
  const trimmed = text.trim();
  if (!trimmed) return [];

  // Check in-memory cache
  if (articleTokenCache.has(trimmed)) {
    return articleTokenCache.get(trimmed)!;
  }

  try {
    const res = await fetch('/api/analyze-text', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: trimmed }),
    });

    if (!res.ok) {
      console.warn(
        `Analyze API returned ${res.status}, falling back to Intl.Segmenter`,
      );
      const fallbackResult = fallbackTokenize(trimmed);
      articleTokenCache.set(trimmed, fallbackResult);
      return fallbackResult;
    }

    const data = (await res.json()) as { tokens?: AnalyzedApiToken[] };
    const rawTokens = data.tokens || [];

    // Group tokens by newline to reconstruct sentences
    const sentences: ReaderToken[][] = [];
    let currentSentence: ReaderToken[] = [];
    let sIdx = 0;
    let tIdx = 0;

    for (const t of rawTokens) {
      if (t.surface.includes('\n')) {
        if (currentSentence.length > 0) {
          sentences.push(currentSentence);
          currentSentence = [];
          sIdx++;
          tIdx = 0;
        }
      } else {
        currentSentence.push({
          id: `${sIdx}-${tIdx}-${t.surface}`,
          surface: t.surface,
          reading: t.reading,
          basicForm: t.basicForm,
          pos: t.pos,
          posDetail: t.posDetail,
          hanViet: getWordHanViet(t.surface),
          sentenceIndex: sIdx,
          tokenIndex: tIdx,
        });
        tIdx++;
      }
    }

    if (currentSentence.length > 0) {
      sentences.push(currentSentence);
    }

    const finalSentences =
      sentences.length > 0 ? sentences : fallbackTokenize(trimmed);
    articleTokenCache.set(trimmed, finalSentences);
    return finalSentences;
  } catch (err) {
    console.warn('Error analyzing article, using client fallback:', err);
    const fallbackResult = fallbackTokenize(trimmed);
    articleTokenCache.set(trimmed, fallbackResult);
    return fallbackResult;
  }
}

/**
 * Detailed word lookup (Mazii / TiDB + Pitch Accent)
 */
export async function lookupWordDetails(
  word: string,
  readingHint?: string,
): Promise<WordLookupDetail> {
  const query = word.trim();
  const fallbackHanViet = getWordHanViet(query);

  try {
    const res = await fetch(
      `/api/dictionary/lookup?word=${encodeURIComponent(query)}&dict=javi`,
    );

    if (!res.ok) {
      throw new Error(`Dictionary lookup error: ${res.status}`);
    }

    const data = (await res.json()) as {
      word?: string;
      phonetic?: string;
      pronunciations?: WordPronunciation[];
      means?: { kind?: string; mean: string }[];
    };

    const meansList: string[] = [];
    if (Array.isArray(data.means)) {
      for (const m of data.means) {
        if (m.mean) {
          const prefix = m.kind ? `[${m.kind}] ` : '';
          meansList.push(`${prefix}${m.mean}`);
        }
      }
    }

    return {
      word: data.word || query,
      reading: readingHint || data.phonetic || '',
      hanViet: fallbackHanViet,
      means: meansList.slice(0, 5),
      pronunciations: data.pronunciations || [],
    };
  } catch (err) {
    console.error('Failed to fetch detailed word info:', err);
    return {
      word: query,
      reading: readingHint || '',
      hanViet: fallbackHanViet,
      means: [],
      pronunciations: [],
    };
  }
}

/**
 * Text-to-Speech using native Web Speech API (Japanese voice)
 */
export function playJapaneseTTS(text: string): void {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    return;
  }

  try {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'ja-JP';
    utterance.rate = 0.9; // slightly comfortable pacing for learning

    // Pick a high-quality Japanese voice if available
    const voices = window.speechSynthesis.getVoices();
    const jaVoice = voices.find(
      v => v.lang.startsWith('ja') || v.lang.includes('JP'),
    );
    if (jaVoice) {
      utterance.voice = jaVoice;
    }

    window.speechSynthesis.speak(utterance);
  } catch (error) {
    console.warn('SpeechSynthesis error:', error);
  }
}
