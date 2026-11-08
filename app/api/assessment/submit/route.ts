import { NextRequest, NextResponse } from 'next/server';
import { verifyJwt } from '@/shared/utils/auth';
import { getDbPool } from '@/shared/infra/server/db';
import { RowDataPacket, ResultSetHeader } from 'mysql2';

export const dynamic = 'force-dynamic';

interface QuestionGradeRow extends RowDataPacket {
  id: number;
  order_num: number;
  part: number;
  question_type: string;
  correct_answer: string;
  acceptable_answers_json: unknown;
  han_viet: string | null;
  meaning_vi: string | null;
  explanation: string | null;
}

// Helper to normalize strings for comparison
function cleanStr(s?: string | null): string {
  if (!s) return '';
  return s
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '')
    .replace(/[.,/#!$%^&*;:{}=\-_`~()]/g, '');
}

export async function POST(request: NextRequest) {
  try {
    const adminSession = request.cookies.get('ptham_admin_session')?.value;
    const token = request.cookies.get('auth_token')?.value;

    if (!token && !adminSession) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    let userId = 0;
    const pool = getDbPool();

    if (token) {
      const payload = await verifyJwt(token);
      if (payload?.userId) {
        userId = payload.userId as number;
      }
    }

    if (userId === 0 && !adminSession) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      testId = 1,
      part, // 1 | 2 | 'all'
      answers = {}, // Record<number, string>
      timeSpentSeconds = 0,
    } = body;

    if (!part || (part !== 1 && part !== 2 && part !== 'all')) {
      return NextResponse.json(
        { error: 'Phần thi không hợp lệ.' },
        { status: 400 },
      );
    }

    // 1. Fetch full questions with answers for grading
    const [questions] = await pool.execute<QuestionGradeRow[]>(
      `SELECT id, order_num, part, question_type, correct_answer, acceptable_answers_json, han_viet, meaning_vi, explanation 
       FROM assessment_questions 
       WHERE test_id = ? 
       ORDER BY order_num ASC`,
      [testId],
    );

    // 2. Enforce 100% completion rule
    const missingQuestions: number[] = [];

    if (part === 1 || part === 'all') {
      const mcqQuestions = questions.filter(q => q.part === 1);
      for (const q of mcqQuestions) {
        const ans = answers[q.order_num];
        if (!ans || typeof ans !== 'string' || ans.trim() === '') {
          missingQuestions.push(q.order_num);
        }
      }
    }

    if (part === 2 || part === 'all') {
      const essayQuestions = questions.filter(q => q.part === 2);
      for (const q of essayQuestions) {
        const ans = answers[q.order_num];
        if (!ans) {
          missingQuestions.push(q.order_num);
        } else if (typeof ans === 'string' && ans.trim() === '') {
          missingQuestions.push(q.order_num);
        } else if (typeof ans === 'object') {
          // For Q181-200, ans might be { hanViet: string, meaning: string }
          const composite = ans as { hanViet?: string; meaning?: string };
          if (!composite.hanViet?.trim() && !composite.meaning?.trim()) {
            missingQuestions.push(q.order_num);
          }
        }
      }
    }

    if (missingQuestions.length > 0) {
      return NextResponse.json(
        {
          error: 'INCOMPLETE_SUBMISSION',
          message: `Bạn chưa hoàn thành hết bài thi! Còn ${missingQuestions.length} câu chưa làm. Bạn bắt buộc phải làm hết tất cả các câu thì bài thi mới được tính.`,
          missingQuestions,
        },
        { status: 400 },
      );
    }

    // 3. Fetch existing submission or create new
    const [existingRows] = await pool.execute<RowDataPacket[]>(
      `SELECT id, mcq_status, essay_status, overall_status, mcq_score, essay_score, total_score, mcq_time_spent_seconds, essay_time_spent_seconds, answers_json, grading_details_json 
       FROM assessment_submissions 
       WHERE user_id = ? AND test_id = ? 
       ORDER BY id DESC LIMIT 1`,
      [userId, testId],
    );

    let currentAnswers: Record<number, unknown> = {};
    let currentGrading: Record<number, unknown> = {};
    let mcqScore = 0;
    let essayScore = 0;
    let mcqStatus = 'not_started';
    let essayStatus = 'not_started';
    let mcqTime = 0;
    let essayTime = 0;

    if (existingRows[0]) {
      try {
        currentAnswers =
          typeof existingRows[0].answers_json === 'string'
            ? JSON.parse(existingRows[0].answers_json)
            : existingRows[0].answers_json || {};
        currentGrading =
          typeof existingRows[0].grading_details_json === 'string'
            ? JSON.parse(existingRows[0].grading_details_json)
            : existingRows[0].grading_details_json || {};
      } catch {}

      mcqScore = existingRows[0].mcq_score || 0;
      essayScore = existingRows[0].essay_score || 0;
      mcqStatus = existingRows[0].mcq_status || 'not_started';
      essayStatus = existingRows[0].essay_status || 'not_started';
      mcqTime = existingRows[0].mcq_time_spent_seconds || 0;
      essayTime = existingRows[0].essay_time_spent_seconds || 0;
    }

    // Merge newly submitted answers
    Object.assign(currentAnswers, answers);

    // 4. Perform Server-side Grading
    if (part === 1 || part === 'all') {
      let part1Score = 0;
      const part1Questions = questions.filter(q => q.part === 1);
      for (const q of part1Questions) {
        const userAns = String(currentAnswers[q.order_num] || '')
          .trim()
          .toUpperCase();
        const correct = q.correct_answer.trim().toUpperCase();
        const isCorrect = userAns === correct;
        if (isCorrect) part1Score += 1;

        currentGrading[q.order_num] = {
          orderNum: q.order_num,
          isCorrect,
          userAnswer: userAns,
          correctAnswer: q.correct_answer,
          explanation: q.explanation,
        };
      }
      mcqScore = part1Score;
      mcqStatus = 'completed';
      mcqTime = timeSpentSeconds || mcqTime;
    }

    if (part === 2 || part === 'all') {
      let part2Score = 0;
      const part2Questions = questions.filter(q => q.part === 2);
      for (const q of part2Questions) {
        let isCorrect = false;
        const rawAns = currentAnswers[q.order_num];

        if (q.order_num >= 101 && q.order_num <= 180) {
          // Hiragana reading check
          const userStr = cleanStr(typeof rawAns === 'string' ? rawAns : '');
          let acceptable: string[] = [];
          try {
            acceptable =
              typeof q.acceptable_answers_json === 'string'
                ? JSON.parse(q.acceptable_answers_json)
                : (q.acceptable_answers_json as string[]) || [];
          } catch {}
          acceptable.push(q.correct_answer);

          isCorrect = acceptable.some(acc => cleanStr(acc) === userStr);
          if (isCorrect) part2Score += 1;

          currentGrading[q.order_num] = {
            orderNum: q.order_num,
            isCorrect,
            userAnswer: typeof rawAns === 'string' ? rawAns : '',
            correctAnswer: q.correct_answer,
            acceptableAnswers: acceptable,
            explanation: q.explanation,
          };
        } else if (q.order_num >= 181 && q.order_num <= 200) {
          // Kanji Han Viet + Meaning
          let userHanViet = '';
          let userMeaning = '';
          if (typeof rawAns === 'object' && rawAns !== null) {
            const comp = rawAns as { hanViet?: string; meaning?: string };
            userHanViet = comp.hanViet || '';
            userMeaning = comp.meaning || '';
          } else if (typeof rawAns === 'string') {
            userHanViet = rawAns;
          }

          let acceptableHan: string[] = [];
          try {
            acceptableHan =
              typeof q.acceptable_answers_json === 'string'
                ? JSON.parse(q.acceptable_answers_json)
                : (q.acceptable_answers_json as string[]) || [];
          } catch {}
          if (q.han_viet) acceptableHan.push(q.han_viet);

          // Check if Han Viet is correct
          const matchHan = acceptableHan.some(
            h => cleanStr(h) === cleanStr(userHanViet),
          );
          isCorrect = matchHan;
          if (isCorrect) part2Score += 1;

          currentGrading[q.order_num] = {
            orderNum: q.order_num,
            isCorrect,
            userHanViet,
            userMeaning,
            correctHanViet: q.han_viet,
            meaningVi: q.meaning_vi,
            explanation: q.explanation,
          };
        }
      }
      essayScore = part2Score;
      essayStatus = 'completed';
      essayTime = timeSpentSeconds || essayTime;
    }

    const totalScore = mcqScore + essayScore;
    const isFullyCompleted =
      mcqStatus === 'completed' && essayStatus === 'completed';
    const overallStatus = isFullyCompleted ? 'completed' : 'in_progress';

    // 5. Save to database
    if (existingRows[0]) {
      await pool.execute(
        `UPDATE assessment_submissions 
         SET mcq_status = ?, essay_status = ?, overall_status = ?, 
             mcq_score = ?, essay_score = ?, total_score = ?, 
             mcq_time_spent_seconds = ?, essay_time_spent_seconds = ?, 
             answers_json = ?, grading_details_json = ?, 
             completed_at = ${isFullyCompleted ? 'NOW()' : 'completed_at'}
         WHERE id = ?`,
        [
          mcqStatus,
          essayStatus,
          overallStatus,
          mcqScore,
          essayScore,
          totalScore,
          mcqTime,
          essayTime,
          JSON.stringify(currentAnswers),
          JSON.stringify(currentGrading),
          existingRows[0].id,
        ],
      );
    } else {
      await pool.execute<ResultSetHeader>(
        `INSERT INTO assessment_submissions 
         (user_id, test_id, mcq_status, essay_status, overall_status, mcq_score, essay_score, total_score, mcq_time_spent_seconds, essay_time_spent_seconds, answers_json, grading_details_json, completed_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ${isFullyCompleted ? 'NOW()' : 'NULL'})`,
        [
          userId,
          testId,
          mcqStatus,
          essayStatus,
          overallStatus,
          mcqScore,
          essayScore,
          totalScore,
          mcqTime,
          essayTime,
          JSON.stringify(currentAnswers),
          JSON.stringify(currentGrading),
        ],
      );
    }

    // 6. Return response to student with scores
    return NextResponse.json(
      {
        success: true,
        message: isFullyCompleted
          ? 'Bạn đã hoàn thành trọn vẹn bài kiểm tra đánh giá năng lực!'
          : part === 1
            ? 'Bạn đã nộp thành công Phần 1 (Trắc nghiệm).'
            : 'Bạn đã nộp thành công Phần 2 (Tự luận).',
        part,
        mcqStatus,
        essayStatus,
        isFullyCompleted,
        scores: {
          part,
          mcqScore,
          essayScore,
          totalScore,
          mcqTimeSpent: mcqTime,
          essayTimeSpent: essayTime,
        },
      },
      {
        headers: {
          'Cache-Control':
            'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0',
          Pragma: 'no-cache',
          Expires: '0',
        },
      },
    );
  } catch (error) {
    console.error('Error submitting assessment:', error);
    return NextResponse.json(
      { error: 'Lỗi nộp bài kiểm tra. Vui lòng thử lại.' },
      { status: 500 },
    );
  }
}
