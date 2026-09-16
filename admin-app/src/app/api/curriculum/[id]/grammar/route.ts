import { NextRequest, NextResponse } from 'next/server';
import { getDbPool } from '@/lib/db';
import { ResultSetHeader } from 'mysql2';

export const dynamic = 'force-dynamic';

export async function POST(
  request: NextRequest,
  props: { params: Promise<{ id: string }> },
) {
  try {
    const { id: lessonIdStr } = await props.params;
    const body = await request.json();
    const {
      lesson_num,
      title,
      summary_vi,
      structure,
      explanation_vi,
      examples,
      order_num,
    } = body;

    if (!title || !summary_vi || !explanation_vi) {
      return NextResponse.json(
        {
          error: 'Vui lòng điền đầy đủ tiêu đề, tóm tắt và giải thích ngữ pháp',
        },
        { status: 400 },
      );
    }

    const pool = getDbPool();
    const targetLessonNum = lesson_num ?? Number(lessonIdStr);

    const [result] = await pool.execute<ResultSetHeader>(
      `INSERT INTO tham_grammar_points 
       (lesson_num, title, summary_vi, structure, explanation_vi, examples, order_num)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        targetLessonNum,
        title,
        summary_vi,
        structure || '',
        explanation_vi,
        JSON.stringify(examples || []),
        order_num || 0,
      ],
    );

    // Update grammar_count in tham_lessons
    await pool.execute(
      `UPDATE tham_lessons 
       SET grammar_count = (SELECT COUNT(*) FROM tham_grammar_points WHERE lesson_num = ?)
       WHERE lesson_num = ?`,
      [targetLessonNum, targetLessonNum],
    );

    return NextResponse.json({
      success: true,
      message: 'Đã thêm mẫu ngữ pháp mới',
      id: result.insertId,
    });
  } catch (error) {
    console.error('Error in POST /api/curriculum/[id]/grammar:', error);
    return NextResponse.json(
      { error: 'Lỗi khi thêm mẫu ngữ pháp' },
      { status: 500 },
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      id,
      title,
      summary_vi,
      structure,
      explanation_vi,
      examples,
      order_num,
    } = body;

    if (!id || !title || !summary_vi || !explanation_vi) {
      return NextResponse.json(
        { error: 'Thiếu thông tin mẫu ngữ pháp cần sửa' },
        { status: 400 },
      );
    }

    const pool = getDbPool();

    await pool.execute(
      `UPDATE tham_grammar_points
       SET title = ?, summary_vi = ?, structure = ?, explanation_vi = ?, examples = ?, order_num = ?
       WHERE id = ?`,
      [
        title,
        summary_vi,
        structure || '',
        explanation_vi,
        JSON.stringify(examples || []),
        order_num || 0,
        id,
      ],
    );

    return NextResponse.json({
      success: true,
      message: 'Đã cập nhật mẫu ngữ pháp',
    });
  } catch (error) {
    console.error('Error in PUT /api/curriculum/[id]/grammar:', error);
    return NextResponse.json(
      { error: 'Lỗi khi cập nhật ngữ pháp' },
      { status: 500 },
    );
  }
}

export async function DELETE(
  request: NextRequest,
  props: { params: Promise<{ id: string }> },
) {
  try {
    const { id: lessonIdStr } = await props.params;
    const { searchParams } = new URL(request.url);
    const grammarId = searchParams.get('grammar_id');

    if (!grammarId) {
      return NextResponse.json({ error: 'Thiếu grammar_id' }, { status: 400 });
    }

    const pool = getDbPool();
    await pool.execute('DELETE FROM tham_grammar_points WHERE id = ?', [
      grammarId,
    ]);

    const targetLessonNum = Number(lessonIdStr);
    if (!isNaN(targetLessonNum)) {
      await pool.execute(
        `UPDATE tham_lessons 
         SET grammar_count = (SELECT COUNT(*) FROM tham_grammar_points WHERE lesson_num = ?)
         WHERE lesson_num = ?`,
        [targetLessonNum, targetLessonNum],
      );
    }

    return NextResponse.json({ success: true, message: 'Đã xóa mẫu ngữ pháp' });
  } catch (error) {
    console.error('Error in DELETE /api/curriculum/[id]/grammar:', error);
    return NextResponse.json(
      { error: 'Lỗi khi xóa mẫu ngữ pháp' },
      { status: 500 },
    );
  }
}
