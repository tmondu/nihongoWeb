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
    const { grammarId, isMastered, isStarred, userNotes } = body;

    if (!grammarId || typeof grammarId !== 'number') {
      return NextResponse.json(
        { error: 'Thiếu hoặc sai định dạng grammarId' },
        { status: 400 },
      );
    }

    const pool = getDbPool();

    await pool.execute(
      `INSERT INTO user_grammar_progress (user_id, grammar_id, is_mastered, is_starred, user_notes)
       VALUES (?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE
         is_mastered = COALESCE(VALUES(is_mastered), is_mastered),
         is_starred = COALESCE(VALUES(is_starred), is_starred),
         user_notes = COALESCE(VALUES(user_notes), user_notes),
         updated_at = CURRENT_TIMESTAMP`,
      [
        userId,
        grammarId,
        typeof isMastered === 'boolean' ? (isMastered ? 1 : 0) : null,
        typeof isStarred === 'boolean' ? (isStarred ? 1 : 0) : null,
        typeof userNotes === 'string' ? userNotes : null,
      ],
    );

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Error in POST /api/grammar/progress:', err);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}
