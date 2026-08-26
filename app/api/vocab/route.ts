import { NextRequest, NextResponse } from 'next/server';
import { getDbPool } from '@/shared/infra/server/db';

import { RowDataPacket } from 'mysql2';

interface VocabRow extends RowDataPacket {
  jmdict_seq: string;
  kana: string;
  kanji: string | null;
  waller_definition: string;
}

export const dynamic = 'force-dynamic';
export const revalidate = 0;

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
      'SELECT jmdict_seq, kana, kanji, waller_definition FROM vocabularies WHERE level = ? ORDER BY id ASC',
      [level],
    );

    const vocabList = (rows as VocabRow[]).map(row => ({
      jmdict_seq: row.jmdict_seq,
      kana: row.kana,
      kanji: row.kanji || '',
      waller_definition: row.waller_definition,
    }));

    return NextResponse.json(vocabList, {
      headers: {
        'Cache-Control':
          'no-store, no-cache, must-revalidate, proxy-revalidate',
        Pragma: 'no-cache',
        Expires: '0',
      },
    });
  } catch (error) {
    console.error('Error fetching vocabulary from DB:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 },
    );
  }
}
