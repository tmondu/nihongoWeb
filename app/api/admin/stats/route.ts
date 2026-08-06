import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminSession } from '@/shared/infra/server/adminAuth';
import { getDbPool } from '@/shared/infra/server/db';
import { RowDataPacket } from 'mysql2';

export async function GET(request: NextRequest) {
  const admin = await verifyAdminSession(request);
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const pool = getDbPool();

    const [userCount] = await pool.execute<RowDataPacket[]>(
      'SELECT COUNT(*) as count FROM users',
    );
    const [pendingCount] = await pool.execute<RowDataPacket[]>(
      'SELECT COUNT(*) as count FROM users WHERE is_approved = 0',
    );
    const [vocabCount] = await pool.execute<RowDataPacket[]>(
      'SELECT COUNT(*) as count FROM vocabularies',
    );
    const [kanjiCount] = await pool.execute<RowDataPacket[]>(
      'SELECT COUNT(*) as count FROM kanjis',
    );

    return NextResponse.json({
      totalUsers: userCount[0].count,
      pendingUsers: pendingCount[0].count,
      totalVocab: vocabCount[0].count,
      totalKanji: kanjiCount[0].count,
    });
  } catch (error) {
    console.error('Failed to fetch admin stats:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 },
    );
  }
}
