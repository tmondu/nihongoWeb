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
      kanji,
      kana,
      romaji,
      meaning_vi,
      word_type,
      example_ja,
      example_vi,
      order_num,
    } = body;

    if (!kana || !meaning_vi) {
      return NextResponse.json(
        { error: 'Vui lòng điền tối thiểu cách đọc Kana và nghĩa tiếng Việt' },
        { status: 400 },
      );
    }

    const pool = getDbPool();
    const targetLessonNum = lesson_num ?? Number(lessonIdStr);

    const [result] = await pool.execute<ResultSetHeader>(
      `INSERT INTO tham_vocabularies 
       (lesson_num, kanji, kana, romaji, meaning_vi, word_type, example_ja, example_vi, order_num)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        targetLessonNum,
        kanji || null,
        kana,
        romaji || '',
        meaning_vi,
        word_type || '',
        example_ja || '',
        example_vi || '',
        order_num || 0,
      ],
    );

    // Update vocab_count in tham_lessons
    await pool.execute(
      `UPDATE tham_lessons 
       SET vocab_count = (SELECT COUNT(*) FROM tham_vocabularies WHERE lesson_num = ?)
       WHERE lesson_num = ?`,
      [targetLessonNum, targetLessonNum],
    );

    return NextResponse.json({
      success: true,
      message: 'Đã thêm từ vựng mới',
      id: result.insertId,
    });
  } catch (error) {
    console.error('Error in POST /api/curriculum/[id]/vocab:', error);
    return NextResponse.json(
      { error: 'Lỗi khi thêm từ vựng' },
      { status: 500 },
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      id,
      kanji,
      kana,
      romaji,
      meaning_vi,
      word_type,
      example_ja,
      example_vi,
      order_num,
    } = body;

    if (!id || !kana || !meaning_vi) {
      return NextResponse.json(
        { error: 'Thiếu thông tin từ vựng cần cập nhật' },
        { status: 400 },
      );
    }

    const pool = getDbPool();

    await pool.execute(
      `UPDATE tham_vocabularies
       SET kanji = ?, kana = ?, romaji = ?, meaning_vi = ?, word_type = ?, example_ja = ?, example_vi = ?, order_num = ?
       WHERE id = ?`,
      [
        kanji || null,
        kana,
        romaji || '',
        meaning_vi,
        word_type || '',
        example_ja || '',
        example_vi || '',
        order_num || 0,
        id,
      ],
    );

    return NextResponse.json({ success: true, message: 'Đã cập nhật từ vựng' });
  } catch (error) {
    console.error('Error in PUT /api/curriculum/[id]/vocab:', error);
    return NextResponse.json(
      { error: 'Lỗi khi cập nhật từ vựng' },
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
    const vocabId = searchParams.get('vocab_id');

    if (!vocabId) {
      return NextResponse.json({ error: 'Thiếu vocab_id' }, { status: 400 });
    }

    const pool = getDbPool();
    await pool.execute('DELETE FROM tham_vocabularies WHERE id = ?', [vocabId]);

    const targetLessonNum = Number(lessonIdStr);
    if (!isNaN(targetLessonNum)) {
      await pool.execute(
        `UPDATE tham_lessons 
         SET vocab_count = (SELECT COUNT(*) FROM tham_vocabularies WHERE lesson_num = ?)
         WHERE lesson_num = ?`,
        [targetLessonNum, targetLessonNum],
      );
    }

    return NextResponse.json({ success: true, message: 'Đã xóa từ vựng' });
  } catch (error) {
    console.error('Error in DELETE /api/curriculum/[id]/vocab:', error);
    return NextResponse.json({ error: 'Lỗi khi xóa từ vựng' }, { status: 500 });
  }
}
