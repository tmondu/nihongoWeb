import { NextRequest, NextResponse } from 'next/server';
import { getDbPool } from '@/shared/infra/server/db';
import { verifyAdminSession } from '@/shared/infra/server/adminAuth';
import { RowDataPacket, ResultSetHeader } from 'mysql2';

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
  updated_at: string;
  submissions_count: number;
}

export async function GET(request: NextRequest) {
  const admin = await verifyAdminSession(request);
  if (!admin) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const level = searchParams.get('level')?.toLowerCase();
  const search = searchParams.get('query')?.trim();

  try {
    const pool = getDbPool();
    let query = `
      SELECT 
        e.*,
        COUNT(s.id) AS submissions_count
      FROM exercises e
      LEFT JOIN exercise_submissions s ON e.id = s.exercise_id
      WHERE 1=1
    `;
    const params: (string | number)[] = [];

    if (level && ['n5', 'n4', 'n3', 'n2', 'n1'].includes(level)) {
      query += ' AND e.level = ?';
      params.push(level);
    }

    if (search) {
      query += ' AND (e.title LIKE ? OR e.description LIKE ?)';
      params.push(`%${search}%`, `%${search}%`);
    }

    query += ' GROUP BY e.id ORDER BY e.id DESC';

    const [rows] = await pool.execute<ExerciseRow[]>(query, params);

    const exercises = rows.map(r => {
      let questionsList = [];
      try {
        questionsList =
          typeof r.questions === 'string'
            ? JSON.parse(r.questions)
            : r.questions || [];
      } catch {
        questionsList = [];
      }

      return {
        id: r.id,
        title: r.title,
        description: r.description,
        level: r.level,
        time_limit: r.time_limit,
        questions: questionsList,
        total_questions: Array.isArray(questionsList)
          ? questionsList.length
          : 0,
        is_published: Boolean(r.is_published),
        submissions_count: Number(r.submissions_count || 0),
        created_at: r.created_at,
        updated_at: r.updated_at,
      };
    });

    return NextResponse.json({
      success: true,
      exercises,
      total: exercises.length,
    });
  } catch (error) {
    console.error('Error fetching admin exercises:', error);
    return NextResponse.json(
      { error: 'server_error', message: 'Lỗi tải danh sách bài tập' },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  const admin = await verifyAdminSession(request);
  if (!admin) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { title, description, level, time_limit, questions, is_published } =
      body;

    if (!title || !title.trim()) {
      return NextResponse.json(
        { error: 'validation', message: 'Tiêu đề bài tập không được để trống' },
        { status: 400 },
      );
    }

    if (!Array.isArray(questions) || questions.length === 0) {
      return NextResponse.json(
        {
          error: 'validation',
          message: 'Bài tập phải có ít nhất 1 câu hỏi',
        },
        { status: 400 },
      );
    }

    const pool = getDbPool();
    const [result] = await pool.execute<ResultSetHeader>(
      `INSERT INTO exercises (title, description, level, time_limit, questions, is_published)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        title.trim(),
        description ? description.trim() : null,
        level || 'n5',
        Number(time_limit) || 0,
        JSON.stringify(questions),
        is_published === false ? 0 : 1,
      ],
    );

    return NextResponse.json({
      success: true,
      message: 'Tạo bài tập thành công',
      id: result.insertId,
    });
  } catch (error) {
    console.error('Error creating exercise:', error);
    return NextResponse.json(
      { error: 'server_error', message: 'Không thể tạo bài tập' },
      { status: 500 },
    );
  }
}
