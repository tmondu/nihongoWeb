import { NextRequest, NextResponse } from 'next/server';
import { getDbPool } from '@/lib/db';
import { RowDataPacket, ResultSetHeader } from 'mysql2';

export const dynamic = 'force-dynamic';

export interface KanjiProExample {
  num?: string;
  japanese: string;
  reading?: string;
  meaning: string;
}

export interface KanjiProWord {
  id: string;
  kanjiChar: string;
  hanviet: string;
  meaning: string;
  kunyomi: string;
  onyomi: string;
  examples: KanjiProExample[];
}

interface KanjiProLessonRow extends RowDataPacket {
  id: number;
  level: string;
  lesson_num: number;
  title: string;
  description: string | null;
  is_available: number;
  kanji_list: string | KanjiProWord[];
  created_at: string;
  updated_at: string;
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const level = searchParams.get('level')?.toLowerCase();
  const lessonNum =
    searchParams.get('lesson') || searchParams.get('lesson_num');
  const id = searchParams.get('id');
  const query = searchParams.get('query')?.trim();

  try {
    const pool = getDbPool();

    // 1. Single lesson query by id
    if (id) {
      const [rows] = await pool.execute<KanjiProLessonRow[]>(
        'SELECT * FROM `kanji_pro_lessons` WHERE `id` = ? LIMIT 1',
        [Number(id)],
      );

      if (rows.length === 0) {
        return NextResponse.json(
          { error: 'Không tìm thấy bài học' },
          { status: 404 },
        );
      }

      const row = rows[0];
      const kanjiList =
        typeof row.kanji_list === 'string'
          ? JSON.parse(row.kanji_list)
          : row.kanji_list;

      return NextResponse.json({
        lesson: {
          ...row,
          kanji_list: kanjiList,
        },
      });
    }

    // 2. Single lesson query by level & lesson_num
    if (level && lessonNum) {
      const [rows] = await pool.execute<KanjiProLessonRow[]>(
        'SELECT * FROM `kanji_pro_lessons` WHERE `level` = ? AND `lesson_num` = ? LIMIT 1',
        [level, Number(lessonNum)],
      );

      if (rows.length > 0) {
        const row = rows[0];
        const kanjiList =
          typeof row.kanji_list === 'string'
            ? JSON.parse(row.kanji_list)
            : row.kanji_list;

        return NextResponse.json({
          lesson: {
            ...row,
            kanji_list: kanjiList,
          },
          source: 'database',
        });
      }
    }

    // 3. List all lessons
    const conditions: string[] = [];
    const params: (string | number)[] = [];

    if (level && ['n5', 'n4', 'n3', 'n2', 'n1'].includes(level)) {
      conditions.push('`level` = ?');
      params.push(level);
    }

    if (query) {
      conditions.push('(`title` LIKE ? OR `description` LIKE ?)');
      params.push(`%${query}%`, `%${query}%`);
    }

    const whereClause =
      conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    const sql = `
      SELECT 
        id, 
        level, 
        lesson_num, 
        title, 
        description, 
        is_available, 
        kanji_list,
        created_at, 
        updated_at
      FROM \`kanji_pro_lessons\`
      ${whereClause}
      ORDER BY 
        CASE \`level\`
          WHEN 'n5' THEN 1
          WHEN 'n4' THEN 2
          WHEN 'n3' THEN 3
          WHEN 'n2' THEN 4
          WHEN 'n1' THEN 5
          ELSE 6
        END,
        \`lesson_num\` ASC
    `;

    const [rows] = await pool.execute<KanjiProLessonRow[]>(sql, params);

    const lessons = rows.map(r => {
      let kanjiList: KanjiProWord[] = [];
      try {
        kanjiList =
          typeof r.kanji_list === 'string'
            ? JSON.parse(r.kanji_list)
            : r.kanji_list;
      } catch {
        kanjiList = [];
      }
      return {
        ...r,
        kanji_count: Array.isArray(kanjiList) ? kanjiList.length : 0,
        kanji_list: kanjiList,
      };
    });

    return NextResponse.json({
      success: true,
      total: lessons.length,
      lessons,
    });
  } catch (error) {
    console.error('Lỗi khi tải dữ liệu Kanji Pro:', error);
    return NextResponse.json(
      { error: 'Lỗi server khi tải dữ liệu Kanji Pro' },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      id,
      level,
      lesson_num,
      title,
      description,
      is_available,
      kanji_list,
    } = body;

    if (!level || lesson_num === undefined || !title || !kanji_list) {
      return NextResponse.json(
        { error: 'Vui lòng cung cấp đầy đủ thông tin bắt buộc' },
        { status: 400 },
      );
    }

    const pool = getDbPool();
    const kanjiJson =
      typeof kanji_list === 'string' ? kanji_list : JSON.stringify(kanji_list);

    if (id) {
      // Update by ID
      const [result] = await pool.execute<ResultSetHeader>(
        `UPDATE \`kanji_pro_lessons\` 
         SET \`level\` = ?, \`lesson_num\` = ?, \`title\` = ?, \`description\` = ?, \`is_available\` = ?, \`kanji_list\` = ?, \`updated_at\` = CURRENT_TIMESTAMP
         WHERE \`id\` = ?`,
        [
          level.toLowerCase(),
          Number(lesson_num),
          title.trim(),
          description?.trim() || null,
          is_available ? 1 : 0,
          kanjiJson,
          Number(id),
        ],
      );

      if (result.affectedRows === 0) {
        return NextResponse.json(
          { error: 'Không tìm thấy bài học để cập nhật' },
          { status: 404 },
        );
      }

      return NextResponse.json({
        success: true,
        message: 'Cập nhật bài học thành công',
        id,
      });
    } else {
      // Insert or Update on duplicate key
      const [result] = await pool.execute<ResultSetHeader>(
        `INSERT INTO \`kanji_pro_lessons\` (\`level\`, \`lesson_num\`, \`title\` , \`description\`, \`is_available\`, \`kanji_list\`)
         VALUES (?, ?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE
           \`title\` = VALUES(\`title\`),
           \`description\` = VALUES(\`description\`),
           \`is_available\` = VALUES(\`is_available\`),
           \`kanji_list\` = VALUES(\`kanji_list\`),
           \`updated_at\` = CURRENT_TIMESTAMP`,
        [
          level.toLowerCase(),
          Number(lesson_num),
          title.trim(),
          description?.trim() || null,
          is_available ? 1 : 0,
          kanjiJson,
        ],
      );

      return NextResponse.json({
        success: true,
        message: 'Lưu bài học thành công',
        id: result.insertId || undefined,
      });
    }
  } catch (error) {
    console.error('Lỗi khi lưu bài học Kanji Pro:', error);
    return NextResponse.json(
      { error: 'Lỗi server khi lưu bài học Kanji Pro' },
      { status: 500 },
    );
  }
}

export async function DELETE(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');

  if (!id) {
    return NextResponse.json(
      { error: 'Thiếu tham số id để xóa' },
      { status: 400 },
    );
  }

  try {
    const pool = getDbPool();
    const [result] = await pool.execute<ResultSetHeader>(
      'DELETE FROM `kanji_pro_lessons` WHERE `id` = ?',
      [Number(id)],
    );

    if (result.affectedRows === 0) {
      return NextResponse.json(
        { error: 'Không tìm thấy bài học để xóa' },
        { status: 404 },
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Xóa bài học thành công',
    });
  } catch (error) {
    console.error('Lỗi khi xóa bài học Kanji Pro:', error);
    return NextResponse.json(
      { error: 'Lỗi server khi xóa bài học Kanji Pro' },
      { status: 500 },
    );
  }
}
