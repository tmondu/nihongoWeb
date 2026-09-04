import { NextRequest, NextResponse } from 'next/server';
import { getDbPool } from '@/shared/infra/server/db';
import { RowDataPacket } from 'mysql2';

interface KanjiRow extends RowDataPacket {
  id: number;
  kanjiChar: string;
  onyomi: string | string[];
  kunyomi: string | string[];
  meanings: string | string[];
  hanviet?: string | null;
}

interface KanjiItem {
  id: number;
  kanjiChar: string;
  onyomi: string[];
  kunyomi: string[];
  meanings: string[];
  hanviet: string;
}

// Server-side in-memory cache to prevent repeated queries to Railway MySQL
const kanjiMemoryCache = new Map<
  string,
  { data: KanjiItem[]; timestamp: number }
>();
const CACHE_TTL_MS = 60 * 60 * 1000; // 1 hour TTL

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const level = searchParams.get('level')?.toLowerCase();
  const forceRefresh = searchParams.get('refresh') === 'true';

  if (!level || !['n5', 'n4', 'n3', 'n2', 'n1'].includes(level)) {
    return NextResponse.json(
      { error: 'Invalid or missing level' },
      { status: 400 },
    );
  }

  // 1. Serve from in-memory cache if valid and not forcing refresh
  const now = Date.now();
  const cached = kanjiMemoryCache.get(level);
  if (!forceRefresh && cached && now - cached.timestamp < CACHE_TTL_MS) {
    return NextResponse.json(cached.data, {
      headers: {
        'Cache-Control':
          'public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800',
        'X-Cache': 'HIT',
      },
    });
  }

  // 2. Fetch from database on cache miss or force refresh
  try {
    const pool = getDbPool();
    const [rows] = await pool.execute(
      'SELECT original_id AS id, kanji_char AS kanjiChar, onyomi, kunyomi, meanings, hanviet FROM kanjis WHERE level = ? ORDER BY original_id ASC',
      [level],
    );

    const kanjiList: KanjiItem[] = (rows as KanjiRow[]).map(row => ({
      id: row.id,
      kanjiChar: row.kanjiChar,
      onyomi:
        typeof row.onyomi === 'string' ? JSON.parse(row.onyomi) : row.onyomi,
      kunyomi:
        typeof row.kunyomi === 'string' ? JSON.parse(row.kunyomi) : row.kunyomi,
      meanings:
        typeof row.meanings === 'string'
          ? JSON.parse(row.meanings)
          : row.meanings,
      hanviet: row.hanviet || '',
    }));

    // Update in-memory cache
    kanjiMemoryCache.set(level, { data: kanjiList, timestamp: now });

    return NextResponse.json(kanjiList, {
      headers: {
        'Cache-Control':
          'public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800',
        'X-Cache': 'MISS',
      },
    });
  } catch (error) {
    console.error('Error fetching kanji from DB:', error);

    // Fallback to stale memory cache if DB is unreachable
    if (cached) {
      return NextResponse.json(cached.data, {
        headers: {
          'Cache-Control': 'public, max-age=300',
          'X-Cache': 'STALE-FALLBACK',
        },
      });
    }

    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 },
    );
  }
}
