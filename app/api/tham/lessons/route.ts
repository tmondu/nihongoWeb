import { NextRequest, NextResponse } from 'next/server';
import { getDbPool } from '@/shared/infra/server/db';
import { verifyJwt } from '@/shared/utils/auth';
import {
  LESSONS_METADATA,
  LESSON_1_GRAMMAR,
  LESSON_1_VOCAB,
} from '@/features/Curriculum/data/curriculumData';
import type { ThamLesson, ThamUserProgress } from '@/features/Curriculum/types';
import { RowDataPacket } from 'mysql2';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('auth_token')?.value;
    let userId: number | null = null;
    if (token) {
      const payload = await verifyJwt(token);
      if (payload?.userId) {
        userId = payload.userId as number;
      }
    }

    const pool = getDbPool();

    // 1. Check if DB has lessons; if empty, seed default lessons
    let lessons: ThamLesson[] = [];
    try {
      const [rows] = await pool.execute<RowDataPacket[]>(
        'SELECT * FROM tham_lessons ORDER BY lesson_num ASC',
      );

      if (rows.length === 0) {
        // Seed initial 50 lessons
        for (const l of LESSONS_METADATA) {
          await pool.execute(
            `INSERT INTO tham_lessons (lesson_num, title_vi, title_ja, description, level, book_vol, vocab_count, grammar_count, order_num)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
             ON DUPLICATE KEY UPDATE title_vi = VALUES(title_vi), title_ja = VALUES(title_ja)`,
            [
              l.lesson_num,
              l.title_vi,
              l.title_ja,
              l.description || '',
              l.level,
              l.book_vol,
              l.vocab_count,
              l.grammar_count,
              l.order_num || l.lesson_num,
            ],
          );
        }

        // Seed Lesson 1 grammar and vocab
        for (const g of LESSON_1_GRAMMAR) {
          await pool.execute(
            `INSERT INTO tham_grammar_points (lesson_num, title, summary_vi, structure, explanation_vi, examples, order_num)
             VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [
              g.lesson_num,
              g.title,
              g.summary_vi,
              g.structure || '',
              g.explanation_vi,
              JSON.stringify(g.examples),
              g.order_num || 0,
            ],
          );
        }

        for (const v of LESSON_1_VOCAB) {
          await pool.execute(
            `INSERT INTO tham_vocabularies (lesson_num, kanji, kana, romaji, meaning_vi, word_type, example_ja, example_vi, order_num)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
              v.lesson_num,
              v.kanji ?? null,
              v.kana,
              v.romaji,
              v.meaning_vi,
              v.word_type || '',
              v.example_ja || '',
              v.example_vi || '',
              v.order_num || 0,
            ],
          );
        }

        lessons = LESSONS_METADATA;
      } else {
        lessons = rows as unknown as ThamLesson[];
      }
    } catch (dbErr) {
      console.warn(
        'DB error in /api/tham/lessons, falling back to static metadata:',
        dbErr,
      );
      lessons = LESSONS_METADATA;
    }

    // 2. Overlay user progress if logged in
    const progressMap = new Map<number, ThamUserProgress>();
    if (userId) {
      try {
        const [progressRows] = await pool.execute<RowDataPacket[]>(
          'SELECT lesson_num, grammar_completed, vocab_completed, quiz_score, completed_at FROM tham_user_progress WHERE user_id = ?',
          [userId],
        );

        for (const p of progressRows) {
          progressMap.set(p.lesson_num, {
            lesson_num: p.lesson_num,
            grammar_completed: p.grammar_completed || 0,
            vocab_completed: Boolean(p.vocab_completed),
            quiz_score: p.quiz_score || 0,
            completed_at: p.completed_at ? String(p.completed_at) : null,
          });
        }
      } catch (pErr) {
        console.warn('Could not fetch user progress:', pErr);
      }
    }

    const mergedLessons: ThamLesson[] = lessons.map(l => {
      const p = progressMap.get(l.lesson_num);
      return {
        ...l,
        grammar_completed: p?.grammar_completed || 0,
        vocab_completed: p?.vocab_completed || false,
        quiz_score: p?.quiz_score || 0,
        is_completed: Boolean(p?.completed_at),
      };
    });

    return NextResponse.json({
      lessons: mergedLessons,
      total_lessons: mergedLessons.length,
      user_id: userId,
    });
  } catch (error) {
    console.error('Error in GET /api/tham/lessons:', error);
    return NextResponse.json(
      { lessons: LESSONS_METADATA, total_lessons: LESSONS_METADATA.length },
      { status: 200 },
    );
  }
}
