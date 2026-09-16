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
    const lessonNum = body.lesson_num ?? body.lessonNum;
    const grammarCompleted =
      body.grammar_completed ?? body.grammarCompleted ?? 0;
    const vocabCompleted = body.vocab_completed ?? body.vocabCompleted ?? false;
    const quizScore = body.quiz_score ?? body.quizScore ?? body.score ?? 0;
    const isCompleted = body.is_completed ?? body.isCompleted ?? false;

    if (!lessonNum || typeof lessonNum !== 'number') {
      return NextResponse.json(
        { error: 'Thiếu hoặc sai định dạng lessonNum' },
        { status: 400 },
      );
    }

    const pool = getDbPool();

    await pool.execute(
      `INSERT INTO tham_user_progress (user_id, lesson_num, grammar_completed, vocab_completed, quiz_score, completed_at)
       VALUES (?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE
         grammar_completed = GREATEST(grammar_completed, VALUES(grammar_completed)),
         vocab_completed = GREATEST(vocab_completed, VALUES(vocab_completed)),
         quiz_score = GREATEST(quiz_score, VALUES(quiz_score)),
         completed_at = COALESCE(VALUES(completed_at), completed_at),
         updated_at = CURRENT_TIMESTAMP`,
      [
        userId,
        lessonNum,
        grammarCompleted,
        vocabCompleted ? 1 : 0,
        quizScore,
        isCompleted ? new Date() : null,
      ],
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in POST /api/tham/progress:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 },
    );
  }
}
