import { NextRequest, NextResponse } from 'next/server';
import { getDbPool } from '@/shared/infra/server/db';
import { RowDataPacket } from 'mysql2';

interface VocabRow extends RowDataPacket {
  id: number;
  kana: string;
  kanji: string | null;
  waller_definition: string;
  level: string;
}

interface KanjiRow extends RowDataPacket {
  onyomi: string | string[];
  kunyomi: string | string[];
}

export interface KanjiExampleItem {
  id: number;
  kanji: string;
  kana: string;
  definition: string;
  level: string;
  readingType: 'on' | 'kun' | 'other';
  matchedReading?: string;
}

const examplesMemoryCache = new Map<
  string,
  { data: KanjiExampleItem[]; timestamp: number }
>();
const CACHE_TTL_MS = 60 * 60 * 1000; // 1 hour TTL

function katakanaToHiragana(src: string): string {
  return src.replace(/[\u30a1-\u30f6]/g, match => {
    const chr = match.charCodeAt(0) - 0x60;
    return String.fromCharCode(chr);
  });
}

function cleanReadingForMatching(reading: string): string {
  // Extracts the core phonetic kana, e.g. "nichi ニチ" -> "にち", "-bi -び" -> "び", "hi ひ" -> "ひ"
  const parts = reading.trim().split(/\s+/);
  const kanaPart = parts[1] || parts[0];
  const cleaned = kanaPart
    .replace(/^[-・]/, '')
    .replace(/\(.*?\)/g, '')
    .trim();
  return katakanaToHiragana(cleaned);
}

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const char = (
    searchParams.get('char') || searchParams.get('character')
  )?.trim();

  if (!char) {
    return NextResponse.json(
      { error: 'Missing kanji character' },
      { status: 400 },
    );
  }

  // 1. Check in-memory cache
  const now = Date.now();
  const cached = examplesMemoryCache.get(char);
  if (cached && now - cached.timestamp < CACHE_TTL_MS) {
    return NextResponse.json(cached.data, {
      headers: {
        'Cache-Control':
          'public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800',
        'X-Cache': 'HIT',
      },
    });
  }

  try {
    const pool = getDbPool();

    // Fetch kanji onyomi/kunyomi readings for classification
    const [kanjiRows] = await pool.execute<KanjiRow[]>(
      'SELECT onyomi, kunyomi FROM kanjis WHERE kanji_char = ? LIMIT 1',
      [char],
    );

    let onReadings: string[] = [];
    let kunReadings: string[] = [];

    if (kanjiRows && kanjiRows.length > 0) {
      const row = kanjiRows[0];
      const parsedOn: string[] =
        typeof row.onyomi === 'string'
          ? JSON.parse(row.onyomi || '[]')
          : row.onyomi || [];
      const parsedKun: string[] =
        typeof row.kunyomi === 'string'
          ? JSON.parse(row.kunyomi || '[]')
          : row.kunyomi || [];

      onReadings = parsedOn.map(cleanReadingForMatching).filter(Boolean);
      kunReadings = parsedKun.map(cleanReadingForMatching).filter(Boolean);
    }

    // Query vocabulary containing this kanji
    const [vocabRows] = await pool.execute<VocabRow[]>(
      'SELECT id, kana, kanji, waller_definition, level FROM vocabularies WHERE kanji LIKE ? ORDER BY LENGTH(kanji) ASC, id ASC LIMIT 25',
      [`%${char}%`],
    );

    const examples: KanjiExampleItem[] = (vocabRows || []).map(row => {
      const wordKanji = row.kanji || row.kana;
      const wordKana = row.kana;

      let readingType: 'on' | 'kun' | 'other' = 'other';
      let matchedReading: string | undefined = undefined;

      const matchedOn = onReadings.find(
        r =>
          wordKana.includes(r) ||
          (r.length > 1 && wordKana.includes(r.slice(0, -1))),
      );
      const matchedKun = kunReadings.find(
        r =>
          wordKana.includes(r) ||
          (r.length > 1 && wordKana.includes(r.slice(0, -1))),
      );

      if (matchedOn && !matchedKun) {
        readingType = 'on';
        matchedReading = matchedOn;
      } else if (matchedKun && !matchedOn) {
        readingType = 'kun';
        matchedReading = matchedKun;
      } else if (matchedOn && matchedKun) {
        // If single kanji word, check exact match
        if (wordKanji === char) {
          if (kunReadings.includes(wordKana)) {
            readingType = 'kun';
            matchedReading = wordKana;
          } else {
            readingType = 'on';
            matchedReading = wordKana;
          }
        } else {
          readingType = 'on';
          matchedReading = matchedOn;
        }
      }

      return {
        id: row.id,
        kanji: wordKanji,
        kana: wordKana,
        definition: row.waller_definition,
        level: row.level?.toUpperCase() || 'N5',
        readingType,
        matchedReading,
      };
    });

    // Save to cache
    examplesMemoryCache.set(char, { data: examples, timestamp: now });

    return NextResponse.json(examples, {
      headers: {
        'Cache-Control':
          'public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800',
        'X-Cache': 'MISS',
      },
    });
  } catch (error) {
    console.error(`Error fetching examples for kanji '${char}':`, error);
    if (cached) {
      return NextResponse.json(cached.data, {
        headers: {
          'Cache-Control': 'public, max-age=300',
          'X-Cache': 'STALE-FALLBACK',
        },
      });
    }

    return NextResponse.json([], { status: 200 });
  }
}
