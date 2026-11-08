import { NextRequest, NextResponse } from 'next/server';
import { getDbPool } from '@/shared/infra/server/db';
import { verifyJwt } from '@/shared/utils/auth';
import { RowDataPacket } from 'mysql2';
import { LESSON_1_GRAMMAR } from '@/features/Curriculum/data/curriculumData';

export const dynamic = 'force-dynamic';

interface GrammarDbRow extends RowDataPacket {
  id: number;
  lesson_num: number;
  title: string;
  summary_vi: string;
  structure: string | null;
  explanation_vi: string;
  nuance_notes?: string | null;
  examples: string | unknown[];
  order_num: number;
  is_mastered?: number | null;
  is_starred?: number | null;
  user_notes?: string | null;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const lessonNum = parseInt(searchParams.get('lesson') || '1', 10);

    if (isNaN(lessonNum) || lessonNum < 1 || lessonNum > 50) {
      return NextResponse.json(
        { error: 'Số bài học không hợp lệ (1 - 50)' },
        { status: 400 },
      );
    }

    // Check optional authentication
    let userId: number | null = null;
    const token = request.cookies.get('auth_token')?.value;
    if (token) {
      const payload = await verifyJwt(token);
      if (payload?.userId) {
        userId = payload.userId as number;
      }
    }

    const pool = getDbPool();

    let query: string;
    let params: (string | number)[] = [];

    if (userId) {
      query = `
        SELECT 
          g.id, g.lesson_num, g.title, g.summary_vi, g.structure, 
          g.explanation_vi, g.nuance_notes, g.examples, g.order_num,
          ugp.is_mastered, ugp.is_starred, ugp.user_notes
        FROM tham_grammar_points g
        LEFT JOIN user_grammar_progress ugp ON g.id = ugp.grammar_id AND ugp.user_id = ?
        WHERE g.lesson_num = ?
        ORDER BY g.order_num ASC, g.id ASC
      `;
      params = [userId, lessonNum];
    } else {
      query = `
        SELECT 
          g.id, g.lesson_num, g.title, g.summary_vi, g.structure, 
          g.explanation_vi, g.nuance_notes, g.examples, g.order_num,
          NULL AS is_mastered, NULL AS is_starred, NULL AS user_notes
        FROM tham_grammar_points g
        WHERE g.lesson_num = ?
        ORDER BY g.order_num ASC, g.id ASC
      `;
      params = [lessonNum];
    }

    let rows: GrammarDbRow[] = [];
    try {
      const [dbRows] = await pool.execute<GrammarDbRow[]>(query, params);
      rows = dbRows;
    } catch (dbErr) {
      console.warn('Database query failed in /api/grammar/study:', dbErr);
    }

    // Fallback to static data if database is empty for lesson 1
    if (rows.length === 0 && lessonNum === 1) {
      const staticPoints = LESSON_1_GRAMMAR.map(g => ({
        id: g.id,
        lesson_num: g.lesson_num,
        title: g.title,
        summary_vi: g.summary_vi,
        structure: g.structure,
        explanation_vi: g.explanation_vi,
        nuance_notes: null,
        examples: g.examples,
        order_num: g.order_num,
        is_mastered: false,
        is_starred: false,
        user_notes: null,
      }));

      return NextResponse.json({
        lesson_num: lessonNum,
        total_points: staticPoints.length,
        grammar_points: staticPoints,
        source: 'static_fallback',
      });
    }

    const grammarPoints = rows.map(r => ({
      id: r.id,
      lesson_num: r.lesson_num,
      title: r.title,
      summary_vi: r.summary_vi,
      structure: r.structure,
      explanation_vi: r.explanation_vi,
      nuance_notes: r.nuance_notes || null,
      examples:
        typeof r.examples === 'string'
          ? JSON.parse(r.examples)
          : r.examples || [],
      order_num: r.order_num,
      is_mastered: r.is_mastered === 1,
      is_starred: r.is_starred === 1,
      user_notes: r.user_notes || null,
    }));

    return NextResponse.json({
      lesson_num: lessonNum,
      total_points: grammarPoints.length,
      grammar_points: grammarPoints,
      source: 'database',
    });
  } catch (err) {
    console.error('Error in GET /api/grammar/study:', err);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}
