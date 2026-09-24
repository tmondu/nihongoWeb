import { NextRequest, NextResponse } from 'next/server';
import { getDbPool } from '@/shared/infra/server/db';
import { RowDataPacket } from 'mysql2';
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
  const { searchParams } = new URL(request.url);
  const rawLevel = searchParams.get('level')?.toLowerCase() || 'n4';
  const level = (
    ['n5', 'n4', 'n3', 'n2', 'n1'].includes(rawLevel) ? rawLevel : 'n4'
  ) as KanjiLevel;
  const lessonNumParam = searchParams.get('lesson');

  try {
    const pool = getDbPool();
    const [rows] = await pool.execute<KanjiProLessonRow[]>(
      'SELECT * FROM kanji_pro_lessons WHERE level = ? ORDER BY lesson_num ASC',
      [level],
    );

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

    const defaultLessons = getLessonsForLevel(level);

    const mergedLessons = defaultLessons.map(defaultLesson => {
      const dbLesson = dbLessonMap.get(defaultLesson.lessonNum);
      if (dbLesson) {
        return dbLesson;
      }
      return defaultLesson;
    });

    if (lessonNumParam) {
      const lessonNum = parseInt(lessonNumParam, 10);
      const targetLesson =
        mergedLessons.find(l => l.lessonNum === lessonNum) || null;
      return NextResponse.json({
        lesson: targetLesson,
      });
    }

    return NextResponse.json({
      level,
      total: mergedLessons.length,
      lessons: mergedLessons,
    });
  } catch {
    // Fallback to static data
    const defaultLessons = getLessonsForLevel(level);
    if (lessonNumParam) {
      const lessonNum = parseInt(lessonNumParam, 10);
      const targetLesson =
        defaultLessons.find(l => l.lessonNum === lessonNum) || null;
      return NextResponse.json({
        lesson: targetLesson,
      });
    }
    return NextResponse.json({
      level,
      total: defaultLessons.length,
      lessons: defaultLessons,
    });
  }
}
