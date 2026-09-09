import { NextRequest, NextResponse } from 'next/server';
import { getDbPool } from '@/shared/infra/server/db';
import { verifyJwt } from '@/shared/utils/auth';
import { RowDataPacket } from 'mysql2';

export const dynamic = 'force-dynamic';

interface ExerciseRow extends RowDataPacket {
  id: number;
  title: string;
  description: string | null;
  level: string;
  time_limit: number;
  questions: string | object;
  created_at: string;
  user_best_score: number | null;
  total_submissions: number;
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const level = searchParams.get('level')?.toLowerCase();
  const search = searchParams.get('query')?.trim();

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
    let query = `
      SELECT 
        e.id,
        e.title,
        e.description,
        e.level,
        e.time_limit,
        e.questions,
        e.created_at,
        COUNT(DISTINCT s.id) AS total_submissions,
        MAX(CASE WHEN s.user_id = ? THEN s.score ELSE NULL END) AS user_best_score
      FROM exercises e
      LEFT JOIN exercise_submissions s ON e.id = s.exercise_id
      WHERE e.is_published = 1
    `;
    const params: (string | number)[] = [userId || 0];

    if (level && ['n5', 'n4', 'n3', 'n2', 'n1'].includes(level)) {
      query += ' AND e.level = ?';
      params.push(level);
    }

    if (search) {
      query += ' AND (e.title LIKE ? OR e.description LIKE ?)';
      params.push(`%${search}%`, `%${search}%`);
    }

    query += ` GROUP BY e.id ORDER BY 
      CASE LOWER(e.level)
        WHEN 'n5' THEN 1
        WHEN 'n4' THEN 2
        WHEN 'n3' THEN 3
        WHEN 'n2' THEN 4
        WHEN 'n1' THEN 5
        ELSE 6
      END ASC,
      e.id ASC`;

    const [rows] = await pool.execute<ExerciseRow[]>(query, params);

    const exercises = rows.map(r => {
      let count = 0;
      try {
        const parsed =
          typeof r.questions === 'string'
            ? JSON.parse(r.questions)
            : r.questions || [];
        count = Array.isArray(parsed) ? parsed.length : 0;
      } catch {
        count = 0;
      }

      return {
        id: r.id,
        title: r.title,
        description: r.description,
        level: r.level,
        time_limit: r.time_limit,
        total_questions: count,
        total_submissions: Number(r.total_submissions || 0),
        user_best_score:
          r.user_best_score !== null ? Number(r.user_best_score) : null,
        created_at: r.created_at,
      };
    });

    return NextResponse.json({
      success: true,
      exercises,
      total: exercises.length,
    });
  } catch (error) {
    console.error('Error fetching student exercises:', error);
    return NextResponse.json(
      { error: 'server_error', message: 'Lỗi tải danh sách bài tập' },
      { status: 500 },
    );
  }
}
