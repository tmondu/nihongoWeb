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
  is_admin: number;
}

export async function GET(request: NextRequest) {
  const token = request.cookies.get('auth_token')?.value;

  // 1. Check login
  if (!token) {
    return NextResponse.json(
      {
        error: 'unauthorized',
        message: 'Vui lòng đăng nhập để xem bài giảng.',
      },
      { status: 401 },
    );
  }

  const payload = await verifyJwt(token);
  if (!payload || !payload.userId) {
    return NextResponse.json(
      { error: 'unauthorized', message: 'Phiên đăng nhập không hợp lệ.' },
      { status: 401 },
    );
  }

  try {
    const pool = getDbPool();

    // 2. Check approval
    const [users] = await pool.execute<UserRow[]>(
      'SELECT id, email, is_approved, is_admin FROM users WHERE id = ?',
      [payload.userId as number],
    );

    const user = users[0];
    if (!user) {
      return NextResponse.json(
        {
          error: 'user_not_found',
          message: 'Không tìm thấy thông tin tài khoản.',
        },
        { status: 404 },
      );
    }

    if (!user.is_approved && !user.is_admin) {
      return NextResponse.json(
        {
          error: 'pending_approval',
          message:
            'Tài khoản của bạn đang chờ phê duyệt. Vui lòng liên hệ giáo viên để được cấp quyền vào lớp học.',
          user: {
            email: user.email,
            is_approved: false,
          },
        },
        { status: 403 },
      );
    }

    // 3. Fetch lessons
    const { searchParams } = new URL(request.url);
    const level = searchParams.get('level')?.toLowerCase();

    let query =
      'SELECT id, title, description, level, video_url, order_num, created_at FROM lessons';
    const params: (string | number)[] = [];

    if (level && ['n5', 'n4', 'n3', 'n2', 'n1'].includes(level)) {
      query += ' WHERE level = ?';
      params.push(level);
    }

    query += ' ORDER BY order_num ASC, id ASC';

    const [lessons] = await pool.execute<LessonRow[]>(query, params);

    return NextResponse.json({
      success: true,
      lessons,
      total: lessons.length,
      user: {
        email: user.email,
        is_approved: true,
        is_admin: Boolean(user.is_admin),
      },
    });
  } catch (error) {
    console.error('Error in /api/lessons:', error);
    return NextResponse.json(
      { error: 'server_error', message: 'Lỗi tải danh sách bài giảng.' },
      { status: 500 },
    );
  }
}
