import { NextResponse } from 'next/server';
import { getDbPool } from '@/lib/db';
import { RowDataPacket } from 'mysql2';

export const dynamic = 'force-dynamic';

interface CountRow extends RowDataPacket {
  total: number;
}

export async function GET() {
  try {
    const pool = getDbPool();

    // 1. Total users
    const [userRows] = await pool.execute<CountRow[]>(
      'SELECT COUNT(*) as total FROM users',
    );
    const totalUsers = userRows[0]?.total ?? 0;

    // 2. Pending users
    const [pendingRows] = await pool.execute<CountRow[]>(
      'SELECT COUNT(*) as total FROM users WHERE is_approved = 0',
    );
    const pendingUsers = pendingRows[0]?.total ?? 0;

    // 3. Total vocabulary
    const [vocabRows] = await pool.execute<CountRow[]>(
      'SELECT COUNT(*) as total FROM vocabularies',
    );
    const totalVocab = vocabRows[0]?.total ?? 0;

    // 4. Total Kanji
    const [kanjiRows] = await pool.execute<CountRow[]>(
      'SELECT COUNT(*) as total FROM kanjis',
    );
    const totalKanji = kanjiRows[0]?.total ?? 0;

    // 5. Breakdown by levels
    const [vocabByLevel] = await pool.execute<RowDataPacket[]>(
      'SELECT level, COUNT(*) as count FROM vocabularies GROUP BY level',
    );
    const [kanjiByLevel] = await pool.execute<RowDataPacket[]>(
      'SELECT level, COUNT(*) as count FROM kanjis GROUP BY level',
    );

    return NextResponse.json({
      totalUsers,
      pendingUsers,
      totalVocab,
      totalKanji,
      vocabByLevel,
      kanjiByLevel,
    });
  } catch (error) {
    console.error('Error fetching admin stats:', error);
    return NextResponse.json({ error: 'Database error' }, { status: 500 });
  }
}
