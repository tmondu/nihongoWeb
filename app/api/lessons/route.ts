import { NextRequest, NextResponse } from 'next/server';
import { getDbPool } from '@/shared/infra/server/db';
import { verifyJwt } from '@/shared/utils/auth';
import { canAccessLesson } from '@/features/Classroom/lib/permissions';
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
  level: string;
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
          'SELECT id, email, is_approved, can_watch_video, level, is_admin FROM users WHERE id = ?',
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

    // If requesting a specific lesson
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

      if (!currentUser.is_admin && !currentUser.can_watch_video) {
        return NextResponse.json(
          {
            error: 'pending',
            message:
              'Tài khoản của bạn chưa được cấp quyền xem video bài giảng. Vui lòng liên hệ giáo viên để được kích hoạt quyền học.',
            user: {
              email: currentUser.email,
              can_watch_video: false,
              level: currentUser.level || 'n5',
            },
          },
          { status: 403 },
        );
      }

      if (lessons.length === 0) {
        return NextResponse.json(
          { error: 'not_found', message: 'Không tìm thấy bài giảng.' },
          { status: 404 },
        );
      }

      const targetLesson = lessons[0];
      const hasLevelAccess = canAccessLesson({
        userLevel: currentUser.level,
        lessonLevel: targetLesson.level,
        isAdmin: currentUser.is_admin,
        canWatchVideo: currentUser.can_watch_video,
      });

      if (!hasLevelAccess) {
        const userLvl = (currentUser.level || 'n5').toUpperCase();
        const lessonLvl = (targetLesson.level || 'n5').toUpperCase();
        return NextResponse.json(
          {
            error: 'forbidden_level',
            message: `Bài giảng này thuộc cấp độ ${lessonLvl}. Tài khoản của bạn hiện ở cấp độ ${userLvl}. Vui lòng nâng cấp khóa học để mở khóa bài học này.`,
            requiredLevel: lessonLvl,
            userLevel: userLvl,
            user: {
              email: currentUser.email,
              can_watch_video: Boolean(currentUser.can_watch_video),
              level: currentUser.level || 'n5',
              is_admin: Boolean(currentUser.is_admin),
            },
          },
          { status: 403 },
        );
      }
    }

    // Sanitize lessons: only provide video_url if user has access to that specific lesson's level
    const sanitizedLessons = lessons.map(l => {
      const isAllowed = canAccessLesson({
        userLevel: currentUser?.level,
        lessonLevel: l.level,
        isAdmin: currentUser?.is_admin,
        canWatchVideo: currentUser?.can_watch_video,
      });

      return {
        ...l,
        video_url: isAllowed ? l.video_url : '',
        is_locked: !isAllowed,
      };
    });

    return NextResponse.json({
      success: true,
      lessons: sanitizedLessons,
      total: sanitizedLessons.length,
      user: currentUser
        ? {
            email: currentUser.email,
            can_watch_video: Boolean(currentUser.can_watch_video),
            level: currentUser.level || 'n5',
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
