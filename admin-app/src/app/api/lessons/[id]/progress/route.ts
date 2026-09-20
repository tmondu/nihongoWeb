import { NextRequest, NextResponse } from 'next/server';
import { getDbPool } from '@/lib/db';
import { RowDataPacket } from 'mysql2';

export const dynamic = 'force-dynamic';

interface LessonRow extends RowDataPacket {
  id: number;
  title: string;
  level: string;
  order_num: number;
}

interface UserRow extends RowDataPacket {
  id: number;
  sbd: string | null;
  display_name: string | null;
  email: string;
  level: string;
}

interface ProgressRow extends RowDataPacket {
  user_id: number;
  watched_seconds: number;
  last_position_seconds: number;
  duration_seconds: number;
  progress_percent: number;
  is_completed: number;
  last_watched_at: string;
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const lessonId = Number(id);

  if (!lessonId || isNaN(lessonId)) {
    return NextResponse.json(
      { error: 'ID bài giảng không hợp lệ' },
      { status: 400 },
    );
  }

  try {
    const pool = getDbPool();

    // 1. Fetch lesson
    const [lessons] = await pool.execute<LessonRow[]>(
      'SELECT id, title, level, order_num FROM lessons WHERE id = ?',
      [lessonId],
    );

    if (lessons.length === 0) {
      return NextResponse.json(
        { error: 'Không tìm thấy bài giảng' },
        { status: 404 },
      );
    }

    const lesson = lessons[0];

    // 2. Fetch all students (non-admins)
    const [users] = await pool.execute<UserRow[]>(
      `SELECT id, sbd, display_name, email, level 
       FROM users 
       WHERE is_admin = 0
       ORDER BY 
         CASE WHEN sbd IS NOT NULL AND sbd != '' THEN 0 ELSE 1 END,
         sbd ASC,
         display_name ASC,
         email ASC`,
    );

    // 3. Fetch progress rows for this lesson
    const [progressRows] = await pool.execute<ProgressRow[]>(
      `SELECT user_id, watched_seconds, last_position_seconds, duration_seconds, progress_percent, is_completed, last_watched_at
       FROM lesson_video_progress
       WHERE lesson_id = ?`,
      [lessonId],
    );

    const progressMap = new Map<number, ProgressRow>();
    for (const p of progressRows) {
      progressMap.set(p.user_id, p);
    }

    let completedCount = 0;
    let inProgressCount = 0;
    let notStartedCount = 0;

    const students = users.map(u => {
      const prog = progressMap.get(u.id);
      const percent = prog?.progress_percent ?? 0;
      const isCompleted = Boolean(prog?.is_completed || percent >= 85);

      if (isCompleted) {
        completedCount++;
      } else if (percent > 0) {
        inProgressCount++;
      } else {
        notStartedCount++;
      }

      return {
        user_id: u.id,
        sbd: u.sbd || '',
        display_name: u.display_name || 'Học viên',
        email: u.email,
        level: u.level || 'n5',
        watched_seconds: prog?.watched_seconds ?? 0,
        last_position_seconds: prog?.last_position_seconds ?? 0,
        duration_seconds: prog?.duration_seconds ?? 0,
        progress_percent: percent,
        is_completed: isCompleted,
        last_watched_at: prog?.last_watched_at || null,
      };
    });

    return NextResponse.json({
      lesson,
      summary: {
        total_students: students.length,
        completed_count: completedCount,
        in_progress_count: inProgressCount,
        not_started_count: notStartedCount,
      },
      students,
    });
  } catch (err) {
    console.error('Error fetching admin lesson progress:', err);
    return NextResponse.json(
      { error: 'Lỗi máy chủ khi tải tiến độ' },
      { status: 500 },
    );
  }
}
