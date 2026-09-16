import { NextRequest, NextResponse } from 'next/server';
import { getDbPool } from '@/lib/db';
import { RowDataPacket, ResultSetHeader } from 'mysql2';

export const dynamic = 'force-dynamic';

interface ThamLessonRow extends RowDataPacket {
  id: number;
  lesson_num: number;
  title_vi: string;
  title_ja: string;
  description: string | null;
  level: string;
  book_vol: number;
  vocab_count: number;
  grammar_count: number;
  order_num: number;
  actual_vocab_count?: number;
  actual_grammar_count?: number;
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const vol = searchParams.get('vol');
  const level = searchParams.get('level')?.toLowerCase();
  const query = searchParams.get('query')?.trim();

  try {
    const pool = getDbPool();
    const conditions: string[] = [];
    const params: (string | number)[] = [];

    if (vol && (vol === '1' || vol === '2')) {
      conditions.push('l.book_vol = ?');
      params.push(Number(vol));
    }

    if (level && ['n5', 'n4'].includes(level)) {
      conditions.push('l.level = ?');
      params.push(level);
    }

    if (query) {
      conditions.push(
        '(l.title_vi LIKE ? OR l.title_ja LIKE ? OR l.lesson_num = ?)',
      );
      const pattern = `%${query}%`;
      const numQuery = isNaN(Number(query)) ? -1 : Number(query);
      params.push(pattern, pattern, numQuery);
    }

    const whereClause =
      conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    const sql = `
      SELECT 
        l.id, 
        l.lesson_num, 
        l.title_vi, 
        l.title_ja, 
        l.description, 
        l.level, 
        l.book_vol, 
        l.vocab_count, 
        l.grammar_count, 
        l.order_num,
        (SELECT COUNT(*) FROM tham_vocabularies v WHERE v.lesson_num = l.lesson_num) AS actual_vocab_count,
        (SELECT COUNT(*) FROM tham_grammar_points g WHERE g.lesson_num = l.lesson_num) AS actual_grammar_count
      FROM tham_lessons l
      ${whereClause}
      ORDER BY l.book_vol ASC, l.lesson_num ASC
    `;

    const [rows] = await pool.execute<ThamLessonRow[]>(sql, params);

    return NextResponse.json({
      lessons: rows,
      total: rows.length,
    });
  } catch (error) {
    console.error('Error in GET /api/curriculum:', error);
    return NextResponse.json(
      { error: 'Không thể tải danh sách bài học giáo án' },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      id,
      lesson_num,
      title_vi,
      title_ja,
      description,
      level,
      book_vol,
      order_num,
    } = body;

    if (!lesson_num || !title_vi || !title_ja) {
      return NextResponse.json(
        {
          error:
            'Vui lòng nhập đầy đủ số bài, tên tiếng Việt và tên tiếng Nhật',
        },
        { status: 400 },
      );
    }

    const pool = getDbPool();

    if (id) {
      // Update existing lesson
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
    } else {
      // Insert new lesson
      const [result] = await pool.execute<ResultSetHeader>(
        `INSERT INTO tham_lessons (lesson_num, title_vi, title_ja, description, level, book_vol, order_num)
         VALUES (?, ?, ?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE 
           title_vi = VALUES(title_vi), 
           title_ja = VALUES(title_ja), 
           description = VALUES(description),
           level = VALUES(level),
           book_vol = VALUES(book_vol),
           order_num = VALUES(order_num)`,
        [
          lesson_num,
          title_vi,
          title_ja,
          description || '',
          level || 'n5',
          book_vol || 1,
          order_num || lesson_num,
        ],
      );
      return NextResponse.json({
        success: true,
        message: 'Đã thêm bài học thành công',
        id: result.insertId,
      });
    }
  } catch (error) {
    console.error('Error in POST /api/curriculum:', error);
    return NextResponse.json(
      { error: 'Lỗi khi lưu bài học giáo án' },
      { status: 500 },
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Thiếu ID bài học' }, { status: 400 });
    }

    const pool = getDbPool();

    // Find lesson_num before deleting
    const [rows] = await pool.execute<RowDataPacket[]>(
      'SELECT lesson_num FROM tham_lessons WHERE id = ?',
      [id],
    );

    if (rows.length > 0) {
      const lessonNum = rows[0].lesson_num;
      // Delete associated vocab and grammar
      await pool.execute('DELETE FROM tham_vocabularies WHERE lesson_num = ?', [
        lessonNum,
      ]);
      await pool.execute(
        'DELETE FROM tham_grammar_points WHERE lesson_num = ?',
        [lessonNum],
      );
    }

    await pool.execute('DELETE FROM tham_lessons WHERE id = ?', [id]);

    return NextResponse.json({
      success: true,
      message: 'Đã xóa bài học thành công',
    });
  } catch (error) {
    console.error('Error in DELETE /api/curriculum:', error);
    return NextResponse.json({ error: 'Lỗi khi xóa bài học' }, { status: 500 });
  }
}
