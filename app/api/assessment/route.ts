import { NextRequest, NextResponse } from 'next/server';
import { verifyJwt } from '@/shared/utils/auth';
import { getDbPool } from '@/shared/infra/server/db';
import { RowDataPacket } from 'mysql2';

export const dynamic = 'force-dynamic';

interface UserAuthRow extends RowDataPacket {
  id: number;
  email: string;
  is_approved: number;
  can_do_test: number;
  is_admin: number;
}

interface QuestionDbRow extends RowDataPacket {
  id: number;
  test_id: number;
  part: number;
  question_type: string;
  context_sentence: string | null;
  target_word: string | null;
  kanji_char: string | null;
  options_json: unknown;
  order_num: number;
}

export async function GET(request: NextRequest) {
  try {
    const adminSession = request.cookies.get('ptham_admin_session')?.value;
    const token = request.cookies.get('auth_token')?.value;

    if (!token && !adminSession) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    let userId = 0;
    let canDoTest = 0;
    let isAdmin = 0;

    if (adminSession) {
      userId = 0;
      canDoTest = 1;
      isAdmin = 1;
    }

    const pool = getDbPool();

    if (token) {
      const payload = await verifyJwt(token);
      if (payload?.userId) {
        userId = payload.userId as number;
        const [users] = await pool.execute<UserAuthRow[]>(
          'SELECT id, email, is_approved, can_do_test, is_admin FROM users WHERE id = ?',
          [userId],
        );
        if (users[0]) {
          canDoTest = users[0].can_do_test;
          isAdmin = users[0].is_admin;
        }
      }
    }

    // Check permission
    if (canDoTest !== 1 && isAdmin !== 1) {
      return NextResponse.json(
        {
          error: 'FORBIDDEN',
          message:
            'Tài khoản của bạn chưa được cấp quyền làm bài kiểm tra đầu vào. Vui lòng liên hệ Admin/cô Thắm để được kích hoạt.',
        },
        { status: 403 },
      );
    }

    // 1. Fetch active test
    const [tests] = await pool.execute<RowDataPacket[]>(
      "SELECT id, slug, title, description, total_questions, mcq_time_limit, essay_time_limit, is_active FROM assessment_tests WHERE slug = 'kanji-n5-placement' AND is_active = 1 LIMIT 1",
    );

    if (tests.length === 0) {
      return NextResponse.json(
        { error: 'Không tìm thấy bài kiểm tra khả dụng.' },
        { status: 404 },
      );
    }

    const test = tests[0];

    // 2. Fetch all 200 questions (OMITTING correct answers for security)
    const [questions] = await pool.execute<QuestionDbRow[]>(
      `SELECT id, test_id, part, question_type, context_sentence, target_word, kanji_char, options_json, order_num 
       FROM assessment_questions 
       WHERE test_id = ? 
       ORDER BY order_num ASC`,
      [test.id],
    );

    // Format options_json if string
    const sanitizedQuestions = questions.map(q => ({
      ...q,
      options_json:
        typeof q.options_json === 'string'
          ? JSON.parse(q.options_json)
          : q.options_json,
    }));

    // 3. Fetch existing submission status for this user if exists
    let existingSubmission: Record<string, unknown> | null = null;
    if (userId > 0) {
      const [submissions] = await pool.execute<RowDataPacket[]>(
        `SELECT id, mcq_status, essay_status, overall_status, 
                mcq_score, essay_score, total_score,
                mcq_time_spent_seconds, essay_time_spent_seconds, answers_json, completed_at
         FROM assessment_submissions 
         WHERE user_id = ? AND test_id = ?
         ORDER BY id DESC LIMIT 1`,
        [userId, test.id],
      );

      if (submissions[0]) {
        let parsedAnswers = {};
        try {
          parsedAnswers =
            typeof submissions[0].answers_json === 'string'
              ? JSON.parse(submissions[0].answers_json)
              : submissions[0].answers_json || {};
        } catch {}

        existingSubmission = {
          id: submissions[0].id,
          mcq_status: submissions[0].mcq_status,
          essay_status: submissions[0].essay_status,
          overall_status: submissions[0].overall_status,
          mcq_score: Number(submissions[0].mcq_score || 0),
          essay_score: Number(submissions[0].essay_score || 0),
          total_score: Number(submissions[0].total_score || 0),
          mcq_time_spent_seconds: submissions[0].mcq_time_spent_seconds,
          essay_time_spent_seconds: submissions[0].essay_time_spent_seconds,
          answers: parsedAnswers,
          completed_at: submissions[0].completed_at,
        };
      }
    }

    return NextResponse.json(
      {
        test,
        questions: sanitizedQuestions,
        submission: existingSubmission,
        user: {
          id: userId,
          canDoTest,
          isAdmin,
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
    console.error('Error fetching assessment test:', error);
    return NextResponse.json(
      { error: 'Lỗi tải đề thi từ máy chủ.' },
      { status: 500 },
    );
  }
}
