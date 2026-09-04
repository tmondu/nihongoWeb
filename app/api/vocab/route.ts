import { NextRequest, NextResponse } from 'next/server';
import { getDbPool } from '@/shared/infra/server/db';
import { RowDataPacket } from 'mysql2';

interface VocabRow extends RowDataPacket {
  jmdict_seq: string;
  kana: string;
  kanji: string | null;
  waller_definition: string;
}

interface VocabItem {
  jmdict_seq: string;
  kana: string;
  kanji: string;
  waller_definition: string;
}

// Server-side in-memory cache to prevent repeated queries to Railway MySQL
const vocabMemoryCache = new Map<
  string,
  { data: VocabItem[]; timestamp: number }
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
  const cached = vocabMemoryCache.get(level);
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
      'SELECT jmdict_seq, kana, kanji, waller_definition FROM vocabularies WHERE level = ? ORDER BY id ASC',
      [level],
    );

    const vocabList: VocabItem[] = (rows as VocabRow[]).map(row => ({
      jmdict_seq: row.jmdict_seq,
      kana: row.kana,
      kanji: row.kanji || '',
      waller_definition: row.waller_definition,
    }));

    // Update in-memory cache
    vocabMemoryCache.set(level, { data: vocabList, timestamp: now });

    return NextResponse.json(vocabList, {
      headers: {
        'Cache-Control':
          'public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800',
        'X-Cache': 'MISS',
      },
    });
  } catch (error) {
    console.error('Error fetching vocabulary from DB:', error);

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
