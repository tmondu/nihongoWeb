import { NextRequest, NextResponse } from 'next/server';
import { getDbPool } from '@/shared/infra/server/db';
import { verifyJwt } from '@/shared/utils/auth';
import { RowDataPacket } from 'mysql2';

export const dynamic = 'force-dynamic';

interface ProgressRow extends RowDataPacket {
  id: number;
  user_id: number;
  lesson_id: number;
  watched_seconds: number;
  last_position_seconds: number;
  duration_seconds: number;
  progress_percent: number;
  is_completed: number;
  last_watched_at: string;
}

interface UserRow extends RowDataPacket {
  id: number;
  email: string;
}

async function getAuthenticatedUser(
  request: NextRequest,
): Promise<UserRow | null> {
  const token = request.cookies.get('auth_token')?.value;
  if (!token) return null;

  const payload = await verifyJwt(token);
  if (!payload?.userId) return null;

  try {
    const pool = getDbPool();
    const [users] = await pool.execute<UserRow[]>(
      'SELECT id, email FROM users WHERE id = ?',
      [payload.userId as number],
    );
    return users[0] || null;
  } catch (err) {
    console.error('Error verifying user in progress API:', err);
    return null;
  }
}

export async function GET(
  request: NextRequest,
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

  const user = await getAuthenticatedUser(request);
  if (!user) {
    return NextResponse.json({ error: 'Chưa đăng nhập' }, { status: 401 });
  }

  try {
    const pool = getDbPool();
    const [rows] = await pool.execute<ProgressRow[]>(
      `SELECT watched_seconds, last_position_seconds, duration_seconds, progress_percent, is_completed, last_watched_at
       FROM lesson_video_progress
       WHERE user_id = ? AND lesson_id = ?`,
      [user.id, lessonId],
    );

    if (rows.length === 0) {
      return NextResponse.json({
        progress: {
          watched_seconds: 0,
          last_position_seconds: 0,
          duration_seconds: 0,
          progress_percent: 0,
          is_completed: false,
          last_watched_at: null,
        },
      });
    }

    const row = rows[0];
    return NextResponse.json({
      progress: {
        watched_seconds: row.watched_seconds,
        last_position_seconds: row.last_position_seconds,
        duration_seconds: row.duration_seconds,
        progress_percent: row.progress_percent,
        is_completed: Boolean(row.is_completed),
        last_watched_at: row.last_watched_at,
      },
    });
  } catch (err) {
    console.error('Error fetching lesson progress:', err);
    return NextResponse.json(
      { error: 'Lỗi máy chủ khi lấy tiến độ' },
      { status: 500 },
    );
  }
}

export async function POST(
  request: NextRequest,
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

  const user = await getAuthenticatedUser(request);
  if (!user) {
    return NextResponse.json({ error: 'Chưa đăng nhập' }, { status: 401 });
  }

  let body: {
    currentTime?: number;
    duration?: number;
    watchedDelta?: number;
    coveragePercent?: number;
  } = {};

  try {
    const contentType = request.headers.get('content-type') || '';
    if (contentType.includes('application/json')) {
      body = await request.json();
    } else {
      const text = await request.text();
      body = text ? JSON.parse(text) : {};
    }
  } catch {
    return NextResponse.json(
      { error: 'Dữ liệu không hợp lệ' },
      { status: 400 },
    );
  }

  const currentTime = Math.max(0, Math.floor(body.currentTime ?? 0));
  const duration = Math.max(0, Math.floor(body.duration ?? 0));
  // Limit delta to max 120s per ping to prevent artificial tampering
  const watchedDelta = Math.min(
    120,
    Math.max(0, Math.floor(body.watchedDelta ?? 0)),
  );

  // Calculate percentage: strictly derived from coveragePercent (union of watched intervals).
  // Seeking/scrubbing forward will NOT increase coveragePercent!
  const coveragePercent = Math.min(
    100,
    Math.max(0, Math.floor(body.coveragePercent ?? 0)),
  );

  // If student reaches 85% or more coverage, mark as completed
  const isCompleted = coveragePercent >= 85 ? 1 : 0;

  try {
    const pool = getDbPool();
    await pool.execute(
      `INSERT INTO lesson_video_progress (
        user_id, lesson_id, watched_seconds, last_position_seconds, duration_seconds, progress_percent, is_completed, last_watched_at
      ) VALUES (
        ?, ?, ?, ?, ?, ?, ?, NOW()
      ) ON DUPLICATE KEY UPDATE
        watched_seconds = watched_seconds + VALUES(watched_seconds),
        last_position_seconds = VALUES(last_position_seconds),
        duration_seconds = IF(VALUES(duration_seconds) > 0, VALUES(duration_seconds), duration_seconds),
        progress_percent = GREATEST(progress_percent, VALUES(progress_percent)),
        is_completed = IF(is_completed = 1, 1, VALUES(is_completed)),
        last_watched_at = NOW()`,
      [
        user.id,
        lessonId,
        watchedDelta,
        currentTime,
        duration,
        coveragePercent,
        isCompleted,
      ],
    );

    return NextResponse.json({
      success: true,
      last_position_seconds: currentTime,
      progress_percent: coveragePercent,
      is_completed: Boolean(isCompleted),
    });
  } catch (err) {
    console.error('Error updating lesson progress:', err);
    return NextResponse.json(
      { error: 'Lỗi máy chủ khi lưu tiến độ' },
      { status: 500 },
    );
  }
}
