import { NextRequest, NextResponse } from 'next/server';
import { getDbPool } from '@/shared/infra/server/db';
import { verifyJwt } from '@/shared/utils/auth';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get('auth_token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const payload = await verifyJwt(token);
    if (!payload?.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = payload.userId as number;
    const body = await request.json();
    const { vocabId, isMemorized, pronounceScore, isStarred } = body;

    if (!vocabId || typeof vocabId !== 'number') {
      return NextResponse.json(
        { error: 'Thiếu hoặc sai định dạng vocabId' },
        { status: 400 },
      );
    }

    const pool = getDbPool();

    // Upsert into user_vocab_progress
    await pool.execute(
      `INSERT INTO user_vocab_progress (user_id, vocab_id, is_memorized, pronounce_score, is_starred)
       VALUES (?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE
         is_memorized = COALESCE(VALUES(is_memorized), is_memorized),
         pronounce_score = COALESCE(VALUES(pronounce_score), pronounce_score),
         is_starred = COALESCE(VALUES(is_starred), is_starred),
         updated_at = CURRENT_TIMESTAMP`,
      [
        userId,
        vocabId,
        typeof isMemorized === 'boolean' ? (isMemorized ? 1 : 0) : null,
        typeof pronounceScore === 'number' ? pronounceScore : null,
        typeof isStarred === 'boolean' ? (isStarred ? 1 : 0) : null,
      ],
    );

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Error in POST /api/vocabulary/progress:', err);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}
