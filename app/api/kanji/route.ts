import { NextRequest, NextResponse } from 'next/server';
import { getDbPool } from '@/shared/infra/server/db';

import { RowDataPacket } from 'mysql2';

interface KanjiRow extends RowDataPacket {
  id: number;
  kanjiChar: string;
  onyomi: string | string[];
  kunyomi: string | string[];
  meanings: string | string[];
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const level = searchParams.get('level')?.toLowerCase();

  if (!level || !['n5', 'n4', 'n3', 'n2', 'n1'].includes(level)) {
    return NextResponse.json(
      { error: 'Invalid or missing level' },
      { status: 400 },
    );
  }

  try {
    const pool = getDbPool();
    const [rows] = await pool.execute(
      'SELECT original_id AS id, kanji_char AS kanjiChar, onyomi, kunyomi, meanings FROM kanjis WHERE level = ? ORDER BY original_id ASC',
      [level],
    );

    const kanjiList = (rows as KanjiRow[]).map(row => ({
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
    }));

    return NextResponse.json(kanjiList);
  } catch (error) {
    console.error('Error fetching kanji from DB:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 },
    );
  }
}
