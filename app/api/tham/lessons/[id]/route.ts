import { NextRequest, NextResponse } from 'next/server';
import { getDbPool } from '@/shared/infra/server/db';
import { verifyJwt } from '@/shared/utils/auth';
import { getLessonDetailFallback } from '@/features/Curriculum/data/curriculumData';
import type {
  ThamLessonDetail,
  ThamGrammarPoint,
  ThamVocabulary,
} from '@/features/Curriculum/types';
import { RowDataPacket } from 'mysql2';

export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  props: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await props.params;
    const lessonNum = parseInt(id, 10);

    if (isNaN(lessonNum) || lessonNum < 1 || lessonNum > 50) {
      return NextResponse.json(
        { error: 'Số bài học không hợp lệ (1 - 50)' },
        { status: 400 },
      );
    }

    const token = request.cookies.get('auth_token')?.value;
    let userId: number | null = null;
    if (token) {
      const payload = await verifyJwt(token);
      if (payload?.userId) {
        userId = payload.userId as number;
      }
    }

    const pool = getDbPool();
    let detail: ThamLessonDetail = getLessonDetailFallback(lessonNum);

    try {
      // 1. Fetch lesson info
      const [lessonRows] = await pool.execute<RowDataPacket[]>(
        'SELECT * FROM tham_lessons WHERE lesson_num = ?',
        [lessonNum],
      );

      if (lessonRows.length > 0) {
        const l = lessonRows[0];
        detail = {
          ...detail,
          id: l.id,
          lesson_num: l.lesson_num,
          title_vi: l.title_vi,
          title_ja: l.title_ja,
          description: l.description,
          level: l.level,
          book_vol: l.book_vol,
          vocab_count: l.vocab_count || detail.vocab_count,
          grammar_count: l.grammar_count || detail.grammar_count,
        };
      }

      // 2. Fetch grammar points
      const [grammarRows] = await pool.execute<RowDataPacket[]>(
        'SELECT * FROM tham_grammar_points WHERE lesson_num = ? ORDER BY order_num ASC, id ASC',
        [lessonNum],
      );

      if (grammarRows.length > 0) {
        detail.grammar_points = grammarRows.map(g => ({
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
        })) as ThamGrammarPoint[];
      }

      // 3. Fetch vocabularies
      const [vocabRows] = await pool.execute<RowDataPacket[]>(
        'SELECT * FROM tham_vocabularies WHERE lesson_num = ? ORDER BY order_num ASC, id ASC',
        [lessonNum],
      );

      if (vocabRows.length > 0) {
        detail.vocabularies = vocabRows.map(v => ({
          id: v.id,
          lesson_num: v.lesson_num,
          kanji: v.kanji,
          kana: v.kana,
          romaji: v.romaji,
          meaning_vi: v.meaning_vi,
          word_type: v.word_type,
          example_ja: v.example_ja,
          example_vi: v.example_vi,
          order_num: v.order_num,
        })) as ThamVocabulary[];
      }

      // 4. Fetch user progress
      if (userId) {
        const [progressRows] = await pool.execute<RowDataPacket[]>(
          'SELECT grammar_completed, vocab_completed, quiz_score, completed_at FROM tham_user_progress WHERE user_id = ? AND lesson_num = ?',
          [userId, lessonNum],
        );

        if (progressRows.length > 0) {
          const p = progressRows[0];
          detail.grammar_completed = p.grammar_completed || 0;
          detail.vocab_completed = Boolean(p.vocab_completed);
          detail.quiz_score = p.quiz_score || 0;
          detail.is_completed = Boolean(p.completed_at);
        }
      }
    } catch (dbErr) {
      console.warn('DB query error for lesson detail, using fallback:', dbErr);
    }

    return NextResponse.json(detail);
  } catch (error) {
    console.error('Error fetching lesson detail:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 },
    );
  }
}
