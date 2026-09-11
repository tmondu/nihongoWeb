import { NextRequest, NextResponse } from 'next/server';
import { getDbPool } from '@/shared/infra/server/db';
import { verifyJwt } from '@/shared/utils/auth';
import { RowDataPacket } from 'mysql2';
import { ExerciseQuestion } from '@/shared/types/exercise';

export const dynamic = 'force-dynamic';

interface ExerciseRow extends RowDataPacket {
  id: number;
  title: string;
  description: string | null;
  level: string;
  time_limit: number;
  questions: string | object;
  is_published: number;
  created_at: string;
}

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;
  const token = request.cookies.get('auth_token')?.value;
  let userId: number | null = null;

  if (token) {
    const payload = await verifyJwt(token);
    if (payload?.userId) {
      userId = payload.userId as number;
    }
  }

  try {
    const pool = getDbPool();
    const [rows] = await pool.execute<ExerciseRow[]>(
      'SELECT * FROM exercises WHERE id = ? AND is_published = 1',
      [Number(id)],
    );

    if (rows.length === 0) {
      return NextResponse.json(
        { error: 'not_found', message: 'Không tìm thấy bài tập' },
        { status: 404 },
      );
    }

    const r = rows[0];
    let questionsList: ExerciseQuestion[] = [];
    try {
      questionsList =
        typeof r.questions === 'string'
          ? JSON.parse(r.questions)
          : r.questions || [];
    } catch {
      questionsList = [];
    }

    // Sanitize questions: strip correct_answer and explanation to prevent cheating
    const publicQuestions = questionsList.map(q => ({
      id: q.id,
      part_name: q.part_name || 'Bài 1',
      passage_title: q.passage_title,
      passage: q.passage,
      question: q.question,
      options: q.options,
    }));

    // Fetch user's best score if logged in
    let bestScore: number | null = null;
    if (userId) {
      const [subs] = await pool.execute<RowDataPacket[]>(
        'SELECT MAX(score) as best_score FROM exercise_submissions WHERE exercise_id = ? AND user_id = ?',
        [Number(id), userId],
      );
      if (subs[0]?.best_score !== null && subs[0]?.best_score !== undefined) {
        bestScore = Number(subs[0].best_score);
      }
    }

    return NextResponse.json({
      success: true,
      exercise: {
        id: r.id,
        title: r.title,
        description: r.description,
        level: r.level,
        time_limit: r.time_limit,
        questions: publicQuestions,
        total_questions: publicQuestions.length,
        user_best_score: bestScore,
      },
    });
  } catch (error) {
    console.error('Error fetching student exercise detail:', error);
    return NextResponse.json(
      { error: 'server_error', message: 'Lỗi tải đề bài' },
      { status: 500 },
    );
  }
}
