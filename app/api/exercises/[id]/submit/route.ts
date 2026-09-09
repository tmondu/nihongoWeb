import { NextRequest, NextResponse } from 'next/server';
import { getDbPool } from '@/shared/infra/server/db';
import { verifyJwt } from '@/shared/utils/auth';
import { RowDataPacket, ResultSetHeader } from 'mysql2';
import {
  ExerciseQuestion,
  QuestionResultItem,
  SubmitExerciseResponse,
} from '@/shared/types/exercise';

export const dynamic = 'force-dynamic';

interface ExerciseRow extends RowDataPacket {
  id: number;
  title: string;
  questions: string | object;
}

export async function POST(
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
    const body = await request.json();
    const userAnswers: Record<string, string> = body.answers || {};
    const timeSpent = Number(body.time_spent) || 0;

    const pool = getDbPool();
    const [rows] = await pool.execute<ExerciseRow[]>(
      'SELECT id, title, questions FROM exercises WHERE id = ?',
      [Number(id)],
    );

    if (rows.length === 0) {
      return NextResponse.json(
        { error: 'not_found', message: 'Không tìm thấy bài tập' },
        { status: 404 },
      );
    }

    const r = rows[0];
    let questions: ExerciseQuestion[] = [];
    try {
      questions =
        typeof r.questions === 'string'
          ? JSON.parse(r.questions)
          : r.questions || [];
    } catch {
      questions = [];
    }

    if (questions.length === 0) {
      return NextResponse.json(
        { error: 'invalid', message: 'Bài tập chưa có câu hỏi' },
        { status: 400 },
      );
    }

    let correctCount = 0;
    const questionsResult: QuestionResultItem[] = [];

    questions.forEach((q, idx) => {
      const qKey = String(q.id || idx + 1);
      const chosen = (userAnswers[qKey] || '').trim();
      const correct = (q.correct_answer || '').trim();

      // Normalize comparison: chosen might be 'A' or the text itself
      let isCorrect = false;
      if (chosen.toUpperCase() === correct.toUpperCase()) {
        isCorrect = true;
      } else {
        // Check if chosen answer matches option letter corresponding to correct answer
        const optLetters = ['A', 'B', 'C', 'D'];
        const correctIndex = optLetters.indexOf(correct.toUpperCase());
        if (correctIndex >= 0 && q.options && q.options[correctIndex]) {
          if (
            chosen.toLowerCase() ===
            q.options[correctIndex].trim().toLowerCase()
          ) {
            isCorrect = true;
          }
        }
      }

      if (isCorrect) correctCount++;

      questionsResult.push({
        id: q.id,
        passage_title: q.passage_title,
        passage: q.passage,
        question: q.question,
        options: q.options,
        user_answer: chosen,
        correct_answer: correct,
        is_correct: isCorrect,
        explanation: q.explanation,
        explanation_image: q.explanation_image,
      });
    });

    const totalQuestions = questions.length;
    const percentage = Math.round((correctCount / totalQuestions) * 100);
    const passed = percentage >= 60;

    // Record submission if user is logged in
    if (userId) {
      try {
        await pool.execute<ResultSetHeader>(
          `INSERT INTO exercise_submissions (exercise_id, user_id, score, total_questions, percentage, answers, time_spent)
           VALUES (?, ?, ?, ?, ?, ?, ?)`,
          [
            Number(id),
            userId,
            correctCount,
            totalQuestions,
            percentage,
            JSON.stringify(userAnswers),
            timeSpent,
          ],
        );
      } catch (saveErr) {
        console.error('Failed to save submission:', saveErr);
      }
    }

    const responseData: SubmitExerciseResponse = {
      success: true,
      score: correctCount,
      total_questions: totalQuestions,
      percentage,
      time_spent: timeSpent,
      passed,
      questions_result: questionsResult,
    };

    return NextResponse.json(responseData);
  } catch (error) {
    console.error('Error grading exercise:', error);
    return NextResponse.json(
      { error: 'server_error', message: 'Lỗi chấm bài' },
      { status: 500 },
    );
  }
}
