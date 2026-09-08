import { NextRequest, NextResponse } from 'next/server';
import { getDbPool } from '@/lib/db';
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
}

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;

  try {
    const pool = getDbPool();
    const [rows] = await pool.execute<ExerciseRow[]>(
      'SELECT * FROM exercises WHERE id = ?',
      [Number(id)],
    );

    if (rows.length === 0) {
      return NextResponse.json(
        { error: 'not_found', message: 'Không tìm thấy bài tập' },
        { status: 404 },
      );
    }

    const r = rows[0];
    let questionsList = [];
    try {
      questionsList =
        typeof r.questions === 'string'
          ? JSON.parse(r.questions)
          : r.questions || [];
    } catch {
      questionsList = [];
    }

    return NextResponse.json({
      success: true,
      exercise: {
        id: r.id,
        title: r.title,
        description: r.description,
        level: r.level,
        time_limit: r.time_limit,
        questions: questionsList,
        is_published: Boolean(r.is_published),
        created_at: r.created_at,
        updated_at: r.updated_at,
      },
    });
  } catch (error) {
    console.error('Error fetching exercise detail in admin-app:', error);
    return NextResponse.json(
      { error: 'server_error', message: 'Lỗi tải thông tin bài tập' },
      { status: 500 },
    );
  }
}

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;

  try {
    const body = await request.json();
    const { title, description, level, time_limit, questions, is_published } =
      body;

    if (!title || !title.trim()) {
      return NextResponse.json(
        { error: 'validation', message: 'Tiêu đề không được để trống' },
        { status: 400 },
      );
    }

    const pool = getDbPool();
    await pool.execute<ResultSetHeader>(
      `UPDATE exercises 
       SET title = ?, description = ?, level = ?, time_limit = ?, questions = ?, is_published = ?
       WHERE id = ?`,
      [
        title.trim(),
        description ? description.trim() : null,
        level || 'n5',
        Number(time_limit) || 0,
        JSON.stringify(questions || []),
        is_published ? 1 : 0,
        Number(id),
      ],
    );

    return NextResponse.json({
      success: true,
      message: 'Cập nhật bài tập thành công',
    });
  } catch (error) {
    console.error('Error updating exercise in admin-app:', error);
    return NextResponse.json(
      { error: 'server_error', message: 'Lỗi cập nhật bài tập' },
      { status: 500 },
    );
  }
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;

  try {
    const pool = getDbPool();
    await pool.execute('DELETE FROM exercises WHERE id = ?', [Number(id)]);

    return NextResponse.json({
      success: true,
      message: 'Đã xóa bài tập thành công',
    });
  } catch (error) {
    console.error('Error deleting exercise in admin-app:', error);
    return NextResponse.json(
      { error: 'server_error', message: 'Lỗi xóa bài tập' },
      { status: 500 },
    );
  }
}
