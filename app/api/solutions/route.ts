import { NextRequest, NextResponse } from 'next/server';
import { getDbPool } from '@/shared/infra/server/db';
import { RowDataPacket } from 'mysql2';
import {
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
  const rawLevel = searchParams.get('level')?.toLowerCase() || 'n5';
  const level = ['n5', 'n4', 'n3', 'n2', 'n1'].includes(rawLevel)
    ? rawLevel
    : 'n5';

  const examParam = searchParams.get('exam');
  const examNumber = examParam ? parseInt(examParam, 10) : 1;
  const sessionParam = searchParams.get('session');
  const sessionNum = sessionParam ? parseInt(sessionParam, 10) : null;
  const format = searchParams.get('format')?.toLowerCase();

  const responseHeaders = {
    'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
    Pragma: 'no-cache',
    Expires: '0',
  };

  try {
    const pool = getDbPool();

    // 1. Lấy danh sách đề thi theo level từ DB
    const [packageRows] = await pool.execute<ExamPackageRow[]>(
      'SELECT * FROM `exam_packages` WHERE `level` = ? ORDER BY `exam_number` ASC',
      [level],
    );

    const dbExamMap = new Map<number, SolutionExam>();

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
          dbExamMap.set(row.exam_number, parsed);
        }
      }
    }

    // Kết hợp với dữ liệu tĩnh làm fallback nếu cần
    const defaultExams = getSolutionsByLevel(level);
    const finalMap = new Map<number, SolutionExam>();
    defaultExams.forEach(e => finalMap.set(e.examNumber, e));
    dbExamMap.forEach((e, num) => finalMap.set(num, e));

    const mergedExams = Array.from(finalMap.values()).sort(
      (a, b) => a.examNumber - b.examNumber,
    );

    const availableExams = mergedExams.map(e => ({
      examNumber: e.examNumber,
      title: e.title,
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
    const fallbackExams = getSolutionsByLevel(level);
    const fallbackCurrent =
      getSolutionByLevelAndExam(level, examNumber) || fallbackExams[0] || null;

    if (format === 'text') {
      return new NextResponse(
        `⚠️ Hệ thống đang bảo trì, vui lòng truy cập website: https://www.pthamnihongo.site/vi/solutions?level=${level}&exam=${examNumber}`,
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
          examNumber: e.examNumber,
          title: e.title,
        })),
        currentExam: fallbackCurrent,
        sessions: [],
      },
      { headers: responseHeaders },
    );
  }
}
