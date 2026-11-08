import { NextRequest, NextResponse } from 'next/server';
import { getDbPool } from '@/shared/infra/server/db';
import { verifyJwt } from '@/shared/utils/auth';
import { RowDataPacket } from 'mysql2';
import { LESSONS_N5 } from '@/features/Vocabulary/data/lessonsN5';

export const dynamic = 'force-dynamic';

interface VocabDbRow extends RowDataPacket {
  id: number;
  lesson_num: number;
  kanji: string | null;
  kana: string;
  romaji: string;
  han_viet: string | null;
  meaning_vi: string;
  word_type: string | null;
  audio_url: string | null;
  example_ja: string | null;
  example_vi: string | null;
  order_num: number;
  is_memorized?: number | null;
  pronounce_score?: number | null;
  is_starred?: number | null;
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

    // Query vocabularies with user progress if logged in
    let query: string;
    let params: (string | number)[] = [];

    if (userId) {
      query = `
        SELECT 
          v.id, v.lesson_num, v.kanji, v.kana, v.romaji, v.han_viet, 
          v.meaning_vi, v.word_type, v.audio_url, v.example_ja, v.example_vi, v.order_num,
          uvp.is_memorized, uvp.pronounce_score, uvp.is_starred
        FROM tham_vocabularies v
        LEFT JOIN user_vocab_progress uvp ON v.id = uvp.vocab_id AND uvp.user_id = ?
        WHERE v.lesson_num = ?
        ORDER BY v.order_num ASC, v.id ASC
      `;
      params = [userId, lessonNum];
    } else {
      query = `
        SELECT 
          v.id, v.lesson_num, v.kanji, v.kana, v.romaji, v.han_viet, 
          v.meaning_vi, v.word_type, v.audio_url, v.example_ja, v.example_vi, v.order_num,
          NULL AS is_memorized, NULL AS pronounce_score, NULL AS is_starred
        FROM tham_vocabularies v
        WHERE v.lesson_num = ?
        ORDER BY v.order_num ASC, v.id ASC
      `;
      params = [lessonNum];
    }

    let rows: VocabDbRow[] = [];
    try {
      const [dbRows] = await pool.execute<VocabDbRow[]>(query, params);
      rows = dbRows;
    } catch (dbErr) {
      console.warn('Database query failed in /api/vocabulary/study:', dbErr);
    }

    // Fallback to static data if database is empty for this lesson
    if (rows.length === 0) {
      const staticLesson = LESSONS_N5[lessonNum];
      const staticWords = (staticLesson?.words || []).map((w, index) => ({
        id: index + 1,
        lesson_num: lessonNum,
        kanji: w.kanji || null,
        kana: w.hira,
        romaji: '',
        han_viet: null,
        meaning_vi: w.mean,
        word_type: null,
        audio_url: null,
        example_ja: w.ex || null,
        example_vi: w.exVi || null,
        order_num: index + 1,
        is_memorized: false,
        pronounce_score: null,
        is_starred: false,
      }));

      return NextResponse.json({
        lesson_num: lessonNum,
        total_words: staticWords.length,
        words: staticWords,
        source: 'static_fallback',
      });
    }

    const words = rows.map(r => ({
      id: r.id,
      lesson_num: r.lesson_num,
      kanji: r.kanji,
      kana: r.kana,
      romaji: r.romaji,
      han_viet: r.han_viet,
      meaning_vi: r.meaning_vi,
      word_type: r.word_type,
      audio_url: r.audio_url,
      example_ja: r.example_ja,
      example_vi: r.example_vi,
      order_num: r.order_num,
      is_memorized: r.is_memorized === 1,
      pronounce_score: r.pronounce_score ?? null,
      is_starred: r.is_starred === 1,
    }));

    return NextResponse.json({
      lesson_num: lessonNum,
      total_words: words.length,
      words,
      source: 'database',
    });
  } catch (err) {
    console.error('Error in GET /api/vocabulary/study:', err);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}
