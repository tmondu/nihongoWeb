import { NextRequest, NextResponse } from 'next/server';
import { getDbPool } from '@/shared/infra/server/db';
import { verifyJwt } from '@/shared/utils/auth';
import { RowDataPacket } from 'mysql2';

export const dynamic = 'force-dynamic';

interface LessonRow extends RowDataPacket {
  id: number;
  title: string;
  description: string | null;
  level: string;
  video_url: string;
  order_num: number;
  created_at: string;
}

interface UserRow extends RowDataPacket {
  id: number;
  email: string;
  is_approved: number;
  can_watch_video: number;
  is_admin: number;
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');
  const level = searchParams.get('level')?.toLowerCase();

  const token = request.cookies.get('auth_token')?.value;

  let currentUser: UserRow | null = null;
  if (token) {
    const payload = await verifyJwt(token);
    if (payload?.userId) {
      try {
        const pool = getDbPool();
        const [users] = await pool.execute<UserRow[]>(
          'SELECT id, email, is_approved, can_watch_video, is_admin FROM users WHERE id = ?',
          [payload.userId as number],
        );
        if (users[0]) {
          currentUser = users[0];
        }
      } catch (err) {
        console.error('Error fetching user info in /api/lessons:', err);
      }
    }
  }

  const canWatch = Boolean(
    currentUser?.can_watch_video || currentUser?.is_admin,
  );

  // If requesting to watch a specific video (e.g. ?id=...)
  if (id) {
    if (!currentUser) {
      return NextResponse.json(
        {
          error: 'unauthorized',
          message: 'Vui lòng đăng nhập để xem video bài giảng.',
        },
        { status: 401 },
      );
    }

    if (!canWatch) {
      return NextResponse.json(
        {
          error: 'forbidden',
          message:
            'Tài khoản của bạn chưa được cấp quyền xem video bài giảng. Vui lòng liên hệ giáo viên để được kích hoạt quyền học.',
          user: {
            email: currentUser.email,
            can_watch_video: false,
          },
        },
        { status: 403 },
      );
    }
  }

  try {
    const pool = getDbPool();
    let query =
      'SELECT id, title, description, level, video_url, order_num, created_at FROM lessons';
    const params: (string | number)[] = [];

    if (id) {
      query += ' WHERE id = ?';
      params.push(Number(id));
    } else if (level && ['n5', 'n4', 'n3', 'n2', 'n1'].includes(level)) {
      query += ' WHERE level = ?';
      params.push(level);
    }

    query += ' ORDER BY order_num ASC, id ASC';

    const [lessons] = await pool.execute<LessonRow[]>(query, params);

    // If user cannot watch, hide video_url to prevent link leakage
    const sanitizedLessons = lessons.map(l => ({
      ...l,
      video_url: canWatch ? l.video_url : '',
    }));

    return NextResponse.json({
      success: true,
      lessons: sanitizedLessons,
      total: sanitizedLessons.length,
      user: currentUser
        ? {
            email: currentUser.email,
            can_watch_video: canWatch,
            is_admin: Boolean(currentUser.is_admin),
          }
        : null,
    });
  } catch (error) {
    console.error('Error in /api/lessons:', error);
    return NextResponse.json(
      { error: 'server_error', message: 'Lỗi tải danh sách bài giảng.' },
      { status: 500 },
    );
  }
}
