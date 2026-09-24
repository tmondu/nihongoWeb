import { NextRequest, NextResponse } from 'next/server';
import { getDbPool } from '@/shared/infra/server/db';
import { verifyAdminSession } from '@/shared/infra/server/adminAuth';
import { RowDataPacket, ResultSetHeader } from 'mysql2';
import {
  getLessonsForLevel,
  type KanjiProLesson,
  type KanjiProWord,
} from '@/features/Kanji/data/kanjiProCurriculum';
import type { KanjiLevel } from '@/entities/kanji/types';

export const dynamic = 'force-dynamic';

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
  const admin = await verifyAdminSession(request);
  if (!admin) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const rawLevel = searchParams.get('level')?.toLowerCase() || 'n4';
  const level = (
    ['n5', 'n4', 'n3', 'n2', 'n1'].includes(rawLevel) ? rawLevel : 'n4'
  ) as KanjiLevel;

  try {
    const pool = getDbPool();
    const [rows] = await pool.execute<KanjiProLessonRow[]>(
      'SELECT * FROM kanji_pro_lessons WHERE level = ? ORDER BY lesson_num ASC',
      [level],
    );

    // Map DB rows to a dictionary keyed by lesson_num
    const dbLessonMap = new Map<number, KanjiProLesson>();
    rows.forEach(row => {
      let kanjiList: KanjiProWord[] = [];
      if (typeof row.kanji_list === 'string') {
        try {
          kanjiList = JSON.parse(row.kanji_list) as KanjiProWord[];
        } catch {
          kanjiList = [];
        }
      } else if (Array.isArray(row.kanji_list)) {
        kanjiList = row.kanji_list;
      }

      dbLessonMap.set(row.lesson_num, {
        id: `${row.level}-b${row.lesson_num}`,
        lessonNum: row.lesson_num,
        title: row.title || `Bài ${row.lesson_num}`,
        level: row.level as KanjiLevel,
        isAvailable: row.is_available === 1,
        kanjiList,
        description: row.description || undefined,
      });
    });

    // Default static curriculum skeleton
    const defaultLessons = getLessonsForLevel(level);

    // Merge: DB records take precedence over default static records
    const mergedLessons = defaultLessons.map(defaultLesson => {
      const dbLesson = dbLessonMap.get(defaultLesson.lessonNum);
      if (dbLesson) {
        return dbLesson;
      }
      return defaultLesson;
    });

    return NextResponse.json({
      level,
      total: mergedLessons.length,
      lessons: mergedLessons,
    });
  } catch (err: unknown) {
    console.error('Error fetching admin kanji-pro lessons:', err);
    // Fallback to static data on DB error
    const defaultLessons = getLessonsForLevel(level);
    return NextResponse.json({
      level,
      total: defaultLessons.length,
      lessons: defaultLessons,
      warning: 'Fallback to static data due to database connection.',
    });
  }
}

export async function POST(request: NextRequest) {
  const admin = await verifyAdminSession(request);
  if (!admin) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }

  try {
    const body = (await request.json()) as {
      level: string;
      lesson_num: number;
      title?: string;
      description?: string;
      is_available?: boolean;
      kanji_list: KanjiProWord[];
    };

    const { level, lesson_num, title, description, is_available, kanji_list } =
      body;

    if (!level || !lesson_num) {
      return NextResponse.json(
        { error: 'Level và Số bài học là bắt buộc' },
        { status: 400 },
      );
    }

    const safeTitle = title || `Bài ${lesson_num}`;
    const safeDesc =
      description ??
      (kanji_list && kanji_list.length > 0
        ? `${kanji_list.length} chữ Hán: ${kanji_list.map(k => k.kanjiChar).join(', ')}`
        : `Nội dung Kanji cho Bài ${lesson_num}`);
    const safeIsAvailable =
      is_available !== undefined
        ? is_available
          ? 1
          : 0
        : kanji_list.length > 0
          ? 1
          : 0;
    const kanjiListJson = JSON.stringify(kanji_list || []);

    const pool = getDbPool();
    const query = `
      INSERT INTO kanji_pro_lessons (\`level\`, \`lesson_num\`, \`title\`, \`description\`, \`is_available\`, \`kanji_list\`)
      VALUES (?, ?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE
        \`title\` = VALUES(\`title\`),
        \`description\` = VALUES(\`description\`),
        \`is_available\` = VALUES(\`is_available\`),
        \`kanji_list\` = VALUES(\`kanji_list\`),
        \`updated_at\` = CURRENT_TIMESTAMP
    `;

    const [result] = await pool.execute<ResultSetHeader>(query, [
      level.toLowerCase(),
      lesson_num,
      safeTitle,
      safeDesc,
      safeIsAvailable,
      kanjiListJson,
    ]);

    return NextResponse.json({
      success: true,
      message: `Đã lưu thành công Bài ${lesson_num} (${level.toUpperCase()})`,
      affectedRows: result.affectedRows,
    });
  } catch (err: unknown) {
    console.error('Error saving admin kanji-pro lesson:', err);
    return NextResponse.json(
      {
        error:
          err instanceof Error ? err.message : 'Lỗi khi lưu dữ liệu bài học',
      },
      { status: 500 },
    );
  }
}

export async function DELETE(request: NextRequest) {
  const admin = await verifyAdminSession(request);
  if (!admin) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const level = searchParams.get('level')?.toLowerCase();
  const lessonNumStr = searchParams.get('lesson_num');

  if (!level || !lessonNumStr) {
    return NextResponse.json(
      { error: 'Level và Số bài học là bắt buộc' },
      { status: 400 },
    );
  }

  const lessonNum = parseInt(lessonNumStr, 10);
  if (isNaN(lessonNum)) {
    return NextResponse.json(
      { error: 'Số bài học không hợp lệ' },
      { status: 400 },
    );
  }

  try {
    const pool = getDbPool();
    await pool.execute(
      'DELETE FROM kanji_pro_lessons WHERE level = ? AND lesson_num = ?',
      [level, lessonNum],
    );

    return NextResponse.json({
      success: true,
      message: `Đã xóa dữ liệu Bài ${lessonNum} (${level.toUpperCase()}) khỏi cơ sở dữ liệu`,
    });
  } catch (err: unknown) {
    console.error('Error deleting admin kanji-pro lesson:', err);
    return NextResponse.json(
      {
        error:
          err instanceof Error ? err.message : 'Lỗi khi xóa dữ liệu bài học',
      },
      { status: 500 },
    );
  }
}
