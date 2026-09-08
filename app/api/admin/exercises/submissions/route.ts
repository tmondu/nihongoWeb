import { NextRequest, NextResponse } from 'next/server';
import { getDbPool } from '@/shared/infra/server/db';
import { verifyAdminSession } from '@/shared/infra/server/adminAuth';
import { RowDataPacket } from 'mysql2';

export const dynamic = 'force-dynamic';

interface SubmissionRow extends RowDataPacket {
  id: number;
  exercise_id: number;
  user_id: number;
  score: number;
  total_questions: number;
  percentage: number;
  answers: string | object;
  time_spent: number;
  created_at: string;
  user_email: string;
  exercise_title: string;
  exercise_level: string;
}

export async function GET(request: NextRequest) {
  const admin = await verifyAdminSession(request);
  if (!admin) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const exerciseId = searchParams.get('exercise_id');
  const search = searchParams.get('query')?.trim();

  try {
    const pool = getDbPool();
    let query = `
      SELECT 
        s.*,
        u.email AS user_email,
        e.title AS exercise_title,
        e.level AS exercise_level
      FROM exercise_submissions s
      JOIN users u ON s.user_id = u.id
      JOIN exercises e ON s.exercise_id = e.id
      WHERE 1=1
    `;
    const params: (string | number)[] = [];

    if (exerciseId) {
      query += ' AND s.exercise_id = ?';
      params.push(Number(exerciseId));
    }

    if (search) {
      query += ' AND (u.email LIKE ? OR e.title LIKE ?)';
      params.push(`%${search}%`, `%${search}%`);
    }

    query += ' ORDER BY s.id DESC LIMIT 100';

    const [rows] = await pool.execute<SubmissionRow[]>(query, params);

    const submissions = rows.map(r => {
      let answersParsed = {};
      try {
        answersParsed =
          typeof r.answers === 'string'
            ? JSON.parse(r.answers)
            : r.answers || {};
      } catch {
        answersParsed = {};
      }

      return {
        id: r.id,
        exercise_id: r.exercise_id,
        exercise_title: r.exercise_title,
        exercise_level: r.exercise_level,
        user_id: r.user_id,
        user_email: r.user_email,
        score: r.score,
        total_questions: r.total_questions,
        percentage: r.percentage,
        time_spent: r.time_spent,
        answers: answersParsed,
        created_at: r.created_at,
      };
    });

    return NextResponse.json({
      success: true,
      submissions,
      total: submissions.length,
    });
  } catch (error) {
    console.error('Error fetching admin submissions:', error);
    return NextResponse.json(
      { error: 'server_error', message: 'Lỗi tải bảng điểm học sinh' },
      { status: 500 },
    );
  }
}
