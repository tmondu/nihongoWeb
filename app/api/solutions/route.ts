import { NextRequest, NextResponse } from 'next/server';
import { getDbPool } from '@/shared/infra/server/db';
import { verifyJwt } from '@/shared/utils/auth';
import { RowDataPacket } from 'mysql2';
import {
  ALL_SOLUTIONS,
  getSolutionsByLevel,
  getSolutionByLevelAndExam,
  type SolutionExam,
} from '@/features/Solutions/data/solutionsData';

export const dynamic = 'force-dynamic';

interface ExamPackageRow extends RowDataPacket {
  id: string;
  level: string;
  exam_number: number;
  title: string;
  subtitle: string | null;
  author: string | null;
  total_questions: number;
  total_sessions: number;
  full_data: string | SolutionExam | null;
  created_at: string;
  updated_at: string;
}

interface ExamSessionRow extends RowDataPacket {
  id: number;
  exam_id: string;
  session_num: number;
  session_title: string;
  question_range: string;
  is_unlocked: number;
  answers_text: string;
  answers_json: string | unknown;
  detail_url: string | null;
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const rawLevel = searchParams.get('level')?.toLowerCase();
  const isAll = rawLevel === 'all';
  const level = isAll
    ? 'all'
    : ['n5', 'n4', 'n3', 'n2', 'n1'].includes(rawLevel || '')
      ? (rawLevel as string)
      : 'n5';

  const examParam = searchParams.get('exam');
  const examNumber = examParam ? parseInt(examParam, 10) : 1;
  const sessionParam =
    searchParams.get('session') ||
    searchParams.get('bai') ||
    searchParams.get('b') ||
    searchParams.get('section');
  const sessionNum = sessionParam ? parseInt(sessionParam, 10) : null;
  const format = searchParams.get('format')?.toLowerCase();

  const rangeParam = searchParams.get('range');
  let rangeFilter: { start: number; end: number } | null = null;
  if (rangeParam) {
    const parts = rangeParam.split(/[-_:]/).map(p => parseInt(p.trim(), 10));
    if (parts.length === 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
      rangeFilter = {
        start: Math.min(parts[0], parts[1]),
        end: Math.max(parts[0], parts[1]),
      };
    }
  }

  const responseHeaders = {
    'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
    Pragma: 'no-cache',
    Expires: '0',
  };

  try {
    const pool = getDbPool();

    // 1. Lấy danh sách đề thi theo level từ DB
    const [packageRows] = await pool.execute<ExamPackageRow[]>(
      level === 'all'
        ? 'SELECT * FROM `exam_packages` ORDER BY `level` ASC, `exam_number` ASC'
        : 'SELECT * FROM `exam_packages` WHERE `level` = ? ORDER BY `exam_number` ASC',
      level === 'all' ? [] : [level],
    );

    const dbExamMap = new Map<string, SolutionExam>();

    for (const row of packageRows) {
      if (row.full_data) {
        let parsed: SolutionExam | null = null;
        if (typeof row.full_data === 'string') {
          try {
            parsed = JSON.parse(row.full_data) as SolutionExam;
          } catch {
            parsed = null;
          }
        } else if (
          typeof row.full_data === 'object' &&
          row.full_data !== null
        ) {
          parsed = row.full_data as SolutionExam;
        }

        if (parsed) {
          dbExamMap.set(`${parsed.level}_${parsed.examNumber}`, parsed);
        }
      }
    }

    // Kết hợp với dữ liệu tĩnh làm fallback nếu cần
    const defaultExams =
      level === 'all' ? ALL_SOLUTIONS : getSolutionsByLevel(level);
    const finalMap = new Map<string, SolutionExam>();
    defaultExams.forEach(e => finalMap.set(`${e.level}_${e.examNumber}`, e));
    dbExamMap.forEach((e, key) => finalMap.set(key, e));

    const mergedExams = Array.from(finalMap.values()).sort(
      (a, b) => a.examNumber - b.examNumber,
    );

    const availableExams = mergedExams.map(e => ({
      id: e.id,
      level: e.level,
      examNumber: e.examNumber,
      title: e.title,
      subtitle: e.subtitle || null,
      author: e.author || null,
      totalPages: e.totalPages || 0,
      totalQuestions: e.questions ? e.questions.length : 0,
      totalSessions: e.sections?.length || (e.id === 'n5-de1' ? 3 : 1),
    }));

    // Chọn đề hiện tại
    const currentExam =
      mergedExams.find(e => e.examNumber === examNumber) ||
      mergedExams[0] ||
      null;

    // 2. Lấy thông tin các buổi (Sessions) của đề hiện tại
    let sessions: {
      sessionNum: number;
      sessionTitle: string;
      questionRange: string;
      isUnlocked: boolean;
      answersText: string;
      answersJson: unknown;
      detailUrl: string | null;
    }[] = [];

    const examPkgId = currentExam
      ? `${currentExam.level}_de${String(currentExam.examNumber).padStart(2, '0')}`
      : `${level}_de${String(examNumber).padStart(2, '0')}`;

    const [sessionRows] = await pool.execute<ExamSessionRow[]>(
      'SELECT * FROM `exam_sessions` WHERE `exam_id` = ? ORDER BY `session_num` ASC',
      [examPkgId],
    );

    if (sessionRows.length > 0) {
      sessions = sessionRows.map(s => {
        let parsedJson: unknown = null;
        if (typeof s.answers_json === 'string') {
          try {
            parsedJson = JSON.parse(s.answers_json);
          } catch {
            parsedJson = null;
          }
        } else {
          parsedJson = s.answers_json;
        }

        return {
          sessionNum: s.session_num,
          sessionTitle: s.session_title,
          questionRange: s.question_range,
          isUnlocked: s.is_unlocked === 1,
          answersText: s.answers_text,
          answersJson: parsedJson,
          detailUrl: s.detail_url,
        };
      });
    }

    // 3. Nếu là yêu cầu đặc biệt từ Zalo Bot (format=text)
    if (format === 'text') {
      // 3.1. Nếu yêu cầu theo Dải câu hỏi tự do (VD: range=1-50)
      if (rangeFilter && currentExam) {
        const filtered = currentExam.questions.filter(
          q =>
            q.globalNumber >= rangeFilter.start &&
            q.globalNumber <= rangeFilter.end,
        );

        if (filtered.length === 0) {
          return new NextResponse(
            `⚠️ Đề ${currentExam.examNumber} (${currentExam.level.toUpperCase()}) có tổng cộng ${currentExam.questions.length} câu. Không tìm thấy câu hỏi nào trong dải câu ${rangeFilter.start} đến ${rangeFilter.end} em nhé!`,
            { headers: { 'Content-Type': 'text/plain; charset=utf-8' } },
          );
        }

        const detailWebUrl = `https://www.mondu.online/vi/solutions?level=${currentExam.level}&exam=${currentExam.examNumber}`;
        const minQ = filtered[0].globalNumber;
        const maxQ = filtered[filtered.length - 1].globalNumber;

        const lines: string[] = [];
        lines.push(
          `📚 ${currentExam.level.toUpperCase()} - ĐỀ ${currentExam.examNumber} (CÂU ${minQ} ĐẾN ${maxQ})`,
        );
        lines.push(
          `📌 Phạm vi: ${filtered.length} câu (trên tổng ${currentExam.questions.length} câu của đề)`,
        );
        lines.push('───────────────────────────────');

        // Định dạng 5 câu một dòng
        for (let i = 0; i < filtered.length; i += 5) {
          const group = filtered.slice(i, i + 5);
          const row = group
            .map(
              item =>
                `${String(item.globalNumber).padStart(2, ' ')}: ${item.correctOption.padEnd(2, ' ')}`,
            )
            .join('  ');
          lines.push(row);
        }

        lines.push('───────────────────────────────');
        lines.push(`👉 Xem đáp án & giải thích chi tiết tại:`);
        lines.push(detailWebUrl);

        return new NextResponse(lines.join('\n'), {
          headers: { 'Content-Type': 'text/plain; charset=utf-8' },
        });
      }

      // 3.2. Nếu yêu cầu theo Buổi học (session)
      if (sessionNum !== null) {
        const targetSession = sessions.find(s => s.sessionNum === sessionNum);
        if (!targetSession) {
          return new NextResponse(
            `⚠️ Đề ${examNumber} cấp độ ${level.toUpperCase()} không có Buổi ${sessionNum} em nhé!`,
            { headers: { 'Content-Type': 'text/plain; charset=utf-8' } },
          );
        }

        if (!targetSession.isUnlocked) {
          return new NextResponse(
            `⚠️ Buổi ${sessionNum} hiện đang ở trạng thái KHÓA (chưa mở đáp án) trên hệ thống.\n👉 Giáo viên vui lòng mở khóa (is_unlocked = 1) trên DB trước khi phát đáp án buổi này cho lớp nhé!`,
            { headers: { 'Content-Type': 'text/plain; charset=utf-8' } },
          );
        }

        return new NextResponse(targetSession.answersText, {
          headers: { 'Content-Type': 'text/plain; charset=utf-8' },
        });
      }

      // Trả về text tổng quan nếu không chỉ định session
      if (sessions.length > 0) {
        const openedSessions = sessions.filter(s => s.isUnlocked);
        if (openedSessions.length === 0) {
          return new NextResponse(
            `⚠️ Đề ${examNumber} cấp độ ${level.toUpperCase()} hiện chưa mở buổi học nào!`,
            { headers: { 'Content-Type': 'text/plain; charset=utf-8' } },
          );
        }
        const combinedText = openedSessions
          .map(s => s.answersText)
          .join('\n\n═══════════════════════════════\n\n');
        return new NextResponse(combinedText, {
          headers: { 'Content-Type': 'text/plain; charset=utf-8' },
        });
      }
    }

    // 4. Trả về JSON cho trang web /solutions
    return NextResponse.json(
      {
        success: true,
        level,
        examNumber: currentExam ? currentExam.examNumber : examNumber,
        availableExams,
        currentExam,
        sessions,
      },
      { headers: responseHeaders },
    );
  } catch (error) {
    console.error('Error fetching exam solutions from DB:', error);

    // Fallback toàn diện về in-memory data
    const fallbackExams =
      level === 'all' ? ALL_SOLUTIONS : getSolutionsByLevel(level);
    const fallbackCurrent =
      level === 'all'
        ? ALL_SOLUTIONS.find(e => e.examNumber === examNumber) ||
          ALL_SOLUTIONS[0] ||
          null
        : getSolutionByLevelAndExam(level, examNumber) ||
          fallbackExams[0] ||
          null;

    if (format === 'text') {
      if (rangeFilter && fallbackCurrent) {
        const filtered = fallbackCurrent.questions.filter(
          q =>
            q.globalNumber >= rangeFilter.start &&
            q.globalNumber <= rangeFilter.end,
        );

        if (filtered.length > 0) {
          const detailWebUrl = `https://www.mondu.online/vi/solutions?level=${fallbackCurrent.level}&exam=${fallbackCurrent.examNumber}`;
          const minQ = filtered[0].globalNumber;
          const maxQ = filtered[filtered.length - 1].globalNumber;

          const lines: string[] = [];
          lines.push(
            `📚 ${fallbackCurrent.level.toUpperCase()} - ĐỀ ${fallbackCurrent.examNumber} (CÂU ${minQ} ĐẾN ${maxQ})`,
          );
          lines.push(
            `📌 Phạm vi: ${filtered.length} câu (trên tổng ${fallbackCurrent.questions.length} câu của đề)`,
          );
          lines.push('───────────────────────────────');

          for (let i = 0; i < filtered.length; i += 5) {
            const group = filtered.slice(i, i + 5);
            const row = group
              .map(
                item =>
                  `${String(item.globalNumber).padStart(2, ' ')}: ${item.correctOption.padEnd(2, ' ')}`,
              )
              .join('  ');
            lines.push(row);
          }

          lines.push('───────────────────────────────');
          lines.push(`👉 Xem đáp án & giải thích chi tiết tại:`);
          lines.push(detailWebUrl);

          return new NextResponse(lines.join('\n'), {
            headers: { 'Content-Type': 'text/plain; charset=utf-8' },
          });
        }
      }

      if (sessionNum !== null && fallbackCurrent?.sections) {
        const sec = fallbackCurrent.sections.find(
          s => s.sectionNumber === sessionNum,
        );
        if (sec) {
          const detailWebUrl = `https://www.mondu.online/vi/solutions?level=${fallbackCurrent.level}&exam=${fallbackCurrent.examNumber}`;
          const lines: string[] = [];
          lines.push(
            `📚 ${fallbackCurrent.level.toUpperCase()} - ĐỀ ${fallbackCurrent.examNumber} - BÀI ${sec.sectionNumber}: ${sec.sectionTitle.toUpperCase()}`,
          );
          lines.push(
            `📌 Phạm vi: ${sec.questions.length} câu (Câu ${sec.questionRange})`,
          );
          lines.push('───────────────────────────────');
          for (let i = 0; i < sec.questions.length; i += 5) {
            const group = sec.questions.slice(i, i + 5);
            lines.push(
              group
                .map(
                  item =>
                    `${String(item.questionNumber).padStart(2, ' ')}: ${item.correctOption.padEnd(2, ' ')}`,
                )
                .join('  '),
            );
          }
          lines.push('───────────────────────────────');
          lines.push(`👉 Xem đáp án & giải thích chi tiết tại:`);
          lines.push(detailWebUrl);
          return new NextResponse(lines.join('\n'), {
            headers: { 'Content-Type': 'text/plain; charset=utf-8' },
          });
        }
      }

      return new NextResponse(
        `⚠️ Hệ thống đang bảo trì, vui lòng truy cập website: https://www.mondu.online/vi/solutions?level=${level}&exam=${examNumber}`,
        { headers: { 'Content-Type': 'text/plain; charset=utf-8' } },
      );
    }

    return NextResponse.json(
      {
        success: true,
        fromFallback: true,
        level,
        examNumber,
        availableExams: fallbackExams.map(e => ({
          id: e.id,
          level: e.level,
          examNumber: e.examNumber,
          title: e.title,
          subtitle: e.subtitle || null,
          author: e.author || null,
          totalPages: e.totalPages || 0,
          totalQuestions: e.questions ? e.questions.length : 0,
          totalSessions: e.sections?.length || (e.id === 'n5-de1' ? 3 : 1),
        })),
        currentExam: fallbackCurrent,
        sessions: [],
      },
      { headers: responseHeaders },
    );
  }
}

/**
 * Check admin authorization for modifying exams
 */
async function checkAdmin(request: NextRequest): Promise<boolean> {
  const adminSession = request.cookies.get('ptham_admin_session')?.value;
  if (adminSession) return true;

  const token = request.cookies.get('auth_token')?.value;
  if (!token) {
    return process.env.NODE_ENV === 'development';
  }

  const payload = await verifyJwt(token);
  if (!payload?.userId) {
    return process.env.NODE_ENV === 'development';
  }

  try {
    const pool = getDbPool();
    const [rows] = await pool.execute<(RowDataPacket & { is_admin: number })[]>(
      'SELECT id, is_admin FROM users WHERE id = ?',
      [payload.userId as number],
    );
    return rows.length > 0 && Number(rows[0].is_admin) === 1;
  } catch {
    return process.env.NODE_ENV === 'development';
  }
}

function formatZaloAnswers(
  examTitle: string,
  sessionTitle: string,
  startQ: number,
  endQ: number,
  answers: { qNum: number; answer: string }[],
  webUrl: string,
): string {
  const lines: string[] = [];
  lines.push(`📚 ${examTitle.toUpperCase()} - ${sessionTitle.toUpperCase()}`);
  lines.push(
    `📌 Phạm vi: Câu ${startQ} đến câu ${endQ} (${answers.length} câu)`,
  );
  lines.push('───────────────────────────────');

  for (let i = 0; i < answers.length; i += 5) {
    const group = answers.slice(i, i + 5);
    const row = group
      .map(
        item =>
          `${String(item.qNum).padStart(2, ' ')}: ${item.answer.padEnd(2, ' ')}`,
      )
      .join('  ');
    lines.push(row);
  }
  lines.push('───────────────────────────────');
  lines.push('👉 Xem đáp án & giải thích chi tiết tại:');
  lines.push(webUrl);

  return lines.join('\n');
}

/**
 * POST /api/solutions
 * Save or update a full SolutionExam into exam_packages and exam_sessions
 */
export async function POST(request: NextRequest) {
  try {
    const isAdmin = await checkAdmin(request);
    if (!isAdmin) {
      return NextResponse.json(
        {
          error: 'unauthorized',
          message: 'Chỉ Quản trị viên mới có quyền cập nhật kho đề thi.',
        },
        { status: 403 },
      );
    }

    const body = (await request.json()) as { exam?: SolutionExam };
    const exam = body?.exam;

    if (
      !exam ||
      !exam.level ||
      !exam.examNumber ||
      !Array.isArray(exam.questions)
    ) {
      return NextResponse.json(
        {
          error: 'invalid_data',
          message: 'Dữ liệu đề thi không đầy đủ hoặc sai định dạng.',
        },
        { status: 400 },
      );
    }

    const pool = getDbPool();
    const examPkgId = `${exam.level}_de${String(exam.examNumber).padStart(2, '0')}`;
    const totalQuestions = exam.questions.length;
    const detailWebUrl = `https://www.mondu.online/vi/solutions?level=${exam.level}&exam=${exam.examNumber}`;

    // 1. Partition into sessions
    interface SessionPlan {
      sessionNum: number;
      sessionTitle: string;
      startQ: number;
      endQ: number;
    }

    const sessionPlans: SessionPlan[] = [];

    if (exam.sections && exam.sections.length > 0) {
      exam.sections.forEach((sec, idx) => {
        const qNums = sec.questions.map(q => q.globalNumber);
        const minQ = Math.min(...qNums);
        const maxQ = Math.max(...qNums);
        sessionPlans.push({
          sessionNum: idx + 1,
          sessionTitle: sec.sectionTitle || `Buổi ${idx + 1}`,
          startQ: minQ,
          endQ: maxQ,
        });
      });
    } else {
      // Automatic 3-session split
      if (totalQuestions <= 35) {
        sessionPlans.push(
          {
            sessionNum: 1,
            sessionTitle: 'Phần 1: Từ Vựng & Hán Tự',
            startQ: 1,
            endQ: Math.min(15, totalQuestions),
          },
          {
            sessionNum: 2,
            sessionTitle: 'Phần 2: Ngữ Pháp & Dấu Sao',
            startQ: 16,
            endQ: Math.min(30, totalQuestions),
          },
          {
            sessionNum: 3,
            sessionTitle: 'Phần 3: Đọc Hiểu Đoạn Văn',
            startQ: 31,
            endQ: totalQuestions,
          },
        );
      } else {
        const partSize = Math.ceil(totalQuestions / 3);
        sessionPlans.push(
          {
            sessionNum: 1,
            sessionTitle: 'Buổi 1: Kiến thức ngôn ngữ (Từ vựng - Chữ Hán)',
            startQ: 1,
            endQ: partSize,
          },
          {
            sessionNum: 2,
            sessionTitle: 'Buổi 2: Ngữ pháp & Cấu trúc câu',
            startQ: partSize + 1,
            endQ: partSize * 2,
          },
          {
            sessionNum: 3,
            sessionTitle: 'Buổi 3: Đọc hiểu & Tổng hợp',
            startQ: partSize * 2 + 1,
            endQ: totalQuestions,
          },
        );
      }
    }

    const validSessions = sessionPlans.filter(s => s.startQ <= s.endQ);
    const totalSessions = validSessions.length;

    // 2. UPSERT exam_packages
    await pool.execute(
      `INSERT INTO \`exam_packages\` 
        (\`id\`, \`level\`, \`exam_number\`, \`title\`, \`subtitle\`, \`author\`, \`total_questions\`, \`total_sessions\`, \`full_data\`)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE
        \`title\` = VALUES(\`title\`),
        \`subtitle\` = VALUES(\`subtitle\`),
        \`author\` = VALUES(\`author\`),
        \`total_questions\` = VALUES(\`total_questions\`),
        \`total_sessions\` = VALUES(\`total_sessions\`),
        \`full_data\` = VALUES(\`full_data\`)`,
      [
        examPkgId,
        exam.level,
        exam.examNumber,
        exam.title,
        exam.subtitle || null,
        exam.author || null,
        totalQuestions,
        totalSessions,
        JSON.stringify(exam),
      ],
    );

    // 3. Clear old sessions and insert new ones
    await pool.execute('DELETE FROM `exam_sessions` WHERE `exam_id` = ?', [
      examPkgId,
    ]);

    for (const session of validSessions) {
      const sessionQuestions = exam.questions.filter(
        q => q.globalNumber >= session.startQ && q.globalNumber <= session.endQ,
      );

      const sessionAnswers = sessionQuestions.map(q => ({
        qNum: q.globalNumber,
        answer: q.correctOption,
        part: q.partId,
        partTitle: q.partTitle,
        hanviet: q.hanviet,
        meaning: q.meaning,
      }));

      const answersText = formatZaloAnswers(
        `${exam.level.toUpperCase()} - Đề ${exam.examNumber}`,
        session.sessionTitle,
        session.startQ,
        session.endQ,
        sessionAnswers.map(a => ({ qNum: a.qNum, answer: a.answer })),
        detailWebUrl,
      );

      const questionRangeStr = `${session.startQ}-${session.endQ}`;

      await pool.execute(
        `INSERT INTO \`exam_sessions\`
          (\`exam_id\`, \`session_num\`, \`session_title\`, \`question_range\`, \`is_unlocked\`, \`answers_text\`, \`answers_json\`, \`detail_url\`)
         VALUES (?, ?, ?, ?, 1, ?, ?, ?)`,
        [
          examPkgId,
          session.sessionNum,
          session.sessionTitle,
          questionRangeStr,
          answersText,
          JSON.stringify(sessionAnswers),
          detailWebUrl,
        ],
      );
    }

    return NextResponse.json({
      success: true,
      message: `Đã lưu thành công Đề ${exam.examNumber} (${exam.level.toUpperCase()}) với ${totalQuestions} câu hỏi và ${totalSessions} buổi học.`,
      examId: examPkgId,
      examNumber: exam.examNumber,
      level: exam.level,
    });
  } catch (error) {
    console.error('Error in POST /api/solutions:', error);
    return NextResponse.json(
      {
        error: 'internal_error',
        message:
          'Không thể lưu đề thi vào cơ sở dữ liệu: ' +
          (error instanceof Error ? error.message : String(error)),
      },
      { status: 500 },
    );
  }
}

/**
 * DELETE /api/solutions?level=n5&exam=2
 * Delete an exam package and its sessions
 */
export async function DELETE(request: NextRequest) {
  try {
    const isAdmin = await checkAdmin(request);
    if (!isAdmin) {
      return NextResponse.json(
        {
          error: 'unauthorized',
          message: 'Chỉ Quản trị viên mới có quyền xóa đề thi.',
        },
        { status: 403 },
      );
    }

    const { searchParams } = new URL(request.url);
    const level = searchParams.get('level')?.toLowerCase();
    const examParam = searchParams.get('exam');

    if (!level || !examParam) {
      return NextResponse.json(
        {
          error: 'missing_params',
          message: 'Thiếu thông tin level hoặc exam.',
        },
        { status: 400 },
      );
    }

    const examNumber = parseInt(examParam, 10);
    const examPkgId = `${level}_de${String(examNumber).padStart(2, '0')}`;

    const pool = getDbPool();
    await pool.execute('DELETE FROM `exam_sessions` WHERE `exam_id` = ?', [
      examPkgId,
    ]);
    const [result] = await pool.execute<
      RowDataPacket[] & { affectedRows: number }
    >('DELETE FROM `exam_packages` WHERE `id` = ?', [examPkgId]);

    return NextResponse.json({
      success: true,
      message: `Đã xóa đề thi ${examPkgId} thành công.`,
      affectedRows: (result as { affectedRows?: number })?.affectedRows || 0,
    });
  } catch (error) {
    console.error('Error in DELETE /api/solutions:', error);
    return NextResponse.json(
      {
        error: 'internal_error',
        message:
          'Lỗi khi xóa đề thi: ' +
          (error instanceof Error ? error.message : String(error)),
      },
      { status: 500 },
    );
  }
}
