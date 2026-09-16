import { NextRequest, NextResponse } from 'next/server';
import { getDbPool } from '@/lib/db';
import { RowDataPacket } from 'mysql2';

export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  props: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await props.params;
    const pool = getDbPool();

    // 1. Fetch lesson
    const [lessonRows] = await pool.execute<RowDataPacket[]>(
      'SELECT * FROM tham_lessons WHERE id = ? OR lesson_num = ?',
      [id, id],
    );

    if (lessonRows.length === 0) {
      return NextResponse.json(
        { error: 'Không tìm thấy bài học' },
        { status: 404 },
      );
    }

    const lesson = lessonRows[0];
    const lessonNum = lesson.lesson_num;

    // 2. Fetch grammar points
    const [grammarRows] = await pool.execute<RowDataPacket[]>(
      'SELECT * FROM tham_grammar_points WHERE lesson_num = ? ORDER BY order_num ASC, id ASC',
      [lessonNum],
    );

    const grammarPoints = grammarRows.map(g => ({
      id: g.id,
      lesson_num: g.lesson_num,
      title: g.title,
      summary_vi: g.summary_vi,
      structure: g.structure,
      explanation_vi: g.explanation_vi,
      examples:
        typeof g.examples === 'string'
          ? JSON.parse(g.examples)
          : g.examples || [],
      order_num: g.order_num,
      created_at: g.created_at,
    }));

    // 3. Fetch vocabularies
    const [vocabRows] = await pool.execute<RowDataPacket[]>(
      'SELECT * FROM tham_vocabularies WHERE lesson_num = ? ORDER BY order_num ASC, id ASC',
      [lessonNum],
    );

    return NextResponse.json({
      lesson,
      grammar_points: grammarPoints,
      vocabularies: vocabRows,
    });
  } catch (error) {
    console.error('Error in GET /api/curriculum/[id]:', error);
    return NextResponse.json(
      { error: 'Lỗi máy chủ khi tải chi tiết bài học' },
      { status: 500 },
    );
  }
}

export async function PUT(
  request: NextRequest,
  props: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await props.params;
    const body = await request.json();
    const {
      lesson_num,
      title_vi,
      title_ja,
      description,
      level,
      book_vol,
      order_num,
    } = body;

    const pool = getDbPool();

    await pool.execute(
      `UPDATE tham_lessons
       SET lesson_num = ?, title_vi = ?, title_ja = ?, description = ?, level = ?, book_vol = ?, order_num = ?
       WHERE id = ?`,
      [
        lesson_num,
        title_vi,
        title_ja,
        description || '',
        level || 'n5',
        book_vol || 1,
        order_num || lesson_num,
        id,
      ],
    );

    return NextResponse.json({
      success: true,
      message: 'Đã cập nhật bài học thành công',
    });
  } catch (error) {
    console.error('Error in PUT /api/curriculum/[id]:', error);
    return NextResponse.json(
      { error: 'Lỗi khi cập nhật bài học' },
      { status: 500 },
    );
  }
}
