import { NextRequest, NextResponse } from 'next/server';
import { getDbPool } from '@/shared/infra/server/db';
import { verifyJwt } from '@/shared/utils/auth';
import { RowDataPacket, ResultSetHeader } from 'mysql2';

export const dynamic = 'force-dynamic';

interface CommentRow extends RowDataPacket {
  id: number;
  lesson_id: number;
  user_id: number;
  parent_id: number | null;
  content: string;
  created_at: string;
  email: string;
  display_name?: string | null;
  level: string;
  is_admin: number;
}

interface UserRow extends RowDataPacket {
  id: number;
  email: string;
  display_name?: string | null;
  is_approved: number;
  can_watch_video: number;
  is_admin: number;
  level: string;
}

interface FormattedComment {
  id: number;
  lesson_id: number;
  user_id: number;
  parent_id: number | null;
  content: string;
  created_at: string;
  user: {
    email: string;
    display_name: string;
    level: string;
    is_admin: boolean;
  };
  replies?: FormattedComment[];
}

// GET /api/lessons/[id]/comments - Lấy danh sách bình luận (có cây phản hồi)
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const lessonId = Number(id);

  if (!lessonId || isNaN(lessonId)) {
    return NextResponse.json(
      { error: 'invalid_id', message: 'ID bài giảng không hợp lệ.' },
      { status: 400 },
    );
  }

  try {
    const pool = getDbPool();
    const [comments] = await pool.execute<CommentRow[]>(
      `SELECT 
        c.id, 
        c.lesson_id, 
        c.user_id, 
        c.parent_id,
        c.content, 
        c.created_at, 
        u.email, 
        u.display_name,
        u.level, 
        u.is_admin 
      FROM lesson_comments c
      JOIN users u ON c.user_id = u.id
      WHERE c.lesson_id = ?
      ORDER BY c.created_at ASC`,
      [lessonId],
    );

    // Xây dựng cây bình luận theo phong cách YouTube:
    // Bình luận gốc sắp xếp mới nhất lên đầu, câu trả lời con sắp xếp theo thời gian tăng dần
    const rootComments: FormattedComment[] = [];
    const repliesMap = new Map<number, FormattedComment[]>();

    for (const c of comments) {
      const item: FormattedComment = {
        id: c.id,
        lesson_id: c.lesson_id,
        user_id: c.user_id,
        parent_id: c.parent_id,
        content: c.content,
        created_at: c.created_at,
        user: {
          email: c.email,
          display_name: c.display_name || c.email.split('@')[0],
          level: (c.level || 'n5').toUpperCase(),
          is_admin: Boolean(c.is_admin),
        },
      };

      if (!c.parent_id) {
        item.replies = [];
        rootComments.push(item);
      } else {
        const existing = repliesMap.get(c.parent_id) || [];
        existing.push(item);
        repliesMap.set(c.parent_id, existing);
      }
    }

    for (const root of rootComments) {
      root.replies = repliesMap.get(root.id) || [];
    }

    // Sắp xếp bình luận gốc mới nhất lên đầu
    rootComments.sort(
      (a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
    );

    return NextResponse.json({
      success: true,
      comments: rootComments,
      total: comments.length,
    });
  } catch (error) {
    console.error('Error fetching lesson comments:', error);
    return NextResponse.json(
      { error: 'server_error', message: 'Không thể tải bình luận.' },
      { status: 500 },
    );
  }
}

// POST /api/lessons/[id]/comments - Thêm bình luận mới cho bài giảng
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const lessonId = Number(id);

  if (!lessonId || isNaN(lessonId)) {
    return NextResponse.json(
      { error: 'invalid_id', message: 'ID bài giảng không hợp lệ.' },
      { status: 400 },
    );
  }

  // Xác thực người dùng
  const token = request.cookies.get('auth_token')?.value;
  if (!token) {
    return NextResponse.json(
      { error: 'unauthorized', message: 'Vui lòng đăng nhập để bình luận.' },
      { status: 401 },
    );
  }

  const payload = await verifyJwt(token);
  if (!payload?.userId) {
    return NextResponse.json(
      { error: 'unauthorized', message: 'Phiên đăng nhập không hợp lệ.' },
      { status: 401 },
    );
  }

  const userId = payload.userId as number;

  try {
    const pool = getDbPool();

    // Kiểm tra quyền của người dùng
    const [users] = await pool.execute<UserRow[]>(
      'SELECT id, email, display_name, is_approved, can_watch_video, is_admin, level FROM users WHERE id = ?',
      [userId],
    );

    const currentUser = users[0];
    if (!currentUser) {
      return NextResponse.json(
        { error: 'user_not_found', message: 'Tài khoản không tồn tại.' },
        { status: 404 },
      );
    }

    if (!currentUser.is_approved && !currentUser.is_admin) {
      return NextResponse.json(
        {
          error: 'not_approved',
          message: 'Tài khoản chưa được phê duyệt để tham gia thảo luận.',
        },
        { status: 403 },
      );
    }

    const body = await request.json();
    const content = (body.content || '').trim();
    const parentId = body.parentId ? Number(body.parentId) : null;

    if (!content) {
      return NextResponse.json(
        {
          error: 'empty_content',
          message: 'Vui lòng nhập nội dung bình luận.',
        },
        { status: 400 },
      );
    }

    if (content.length > 1500) {
      return NextResponse.json(
        {
          error: 'content_too_long',
          message: 'Bình luận tối đa 1500 ký tự.',
        },
        { status: 400 },
      );
    }

    let validatedParentId: number | null = null;
    if (parentId && !isNaN(parentId)) {
      const [parents] = await pool.execute<RowDataPacket[]>(
        'SELECT id, parent_id FROM lesson_comments WHERE id = ? AND lesson_id = ?',
        [parentId, lessonId],
      );
      if (parents.length > 0) {
        // Flat nesting: if replying to a reply, group under the root parent comment
        validatedParentId = parents[0].parent_id || parents[0].id;
      }
    }

    // Thêm bình luận vào DB
    const [result] = await pool.execute<ResultSetHeader>(
      'INSERT INTO lesson_comments (lesson_id, user_id, parent_id, content) VALUES (?, ?, ?, ?)',
      [lessonId, userId, validatedParentId, content],
    );

    const newComment = {
      id: result.insertId,
      lesson_id: lessonId,
      user_id: userId,
      parent_id: validatedParentId,
      content,
      created_at: new Date().toISOString(),
      user: {
        email: currentUser.email,
        display_name:
          currentUser.display_name || currentUser.email.split('@')[0],
        level: (currentUser.level || 'n5').toUpperCase(),
        is_admin: Boolean(currentUser.is_admin),
      },
      replies: [],
    };

    return NextResponse.json({
      success: true,
      comment: newComment,
      message: validatedParentId
        ? 'Đã gửi phản hồi thành công!'
        : 'Đã gửi bình luận thành công!',
    });
  } catch (error) {
    console.error('Error posting lesson comment:', error);
    return NextResponse.json(
      { error: 'server_error', message: 'Lỗi máy chủ khi gửi bình luận.' },
      { status: 500 },
    );
  }
}

// DELETE /api/lessons/[id]/comments - Xóa bình luận (chính chủ hoặc admin)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const lessonId = Number(id);

  const { searchParams } = new URL(request.url);
  const commentId = Number(searchParams.get('commentId'));

  if (!lessonId || !commentId || isNaN(commentId)) {
    return NextResponse.json(
      { error: 'invalid_params', message: 'Thông tin bình luận không hợp lệ.' },
      { status: 400 },
    );
  }

  const token = request.cookies.get('auth_token')?.value;
  if (!token) {
    return NextResponse.json(
      { error: 'unauthorized', message: 'Vui lòng đăng nhập.' },
      { status: 401 },
    );
  }

  const payload = await verifyJwt(token);
  if (!payload?.userId) {
    return NextResponse.json(
      { error: 'unauthorized', message: 'Phiên đăng nhập không hợp lệ.' },
      { status: 401 },
    );
  }

  const userId = payload.userId as number;

  try {
    const pool = getDbPool();

    // Lấy thông tin comment
    const [comments] = await pool.execute<RowDataPacket[]>(
      'SELECT id, user_id FROM lesson_comments WHERE id = ? AND lesson_id = ?',
      [commentId, lessonId],
    );

    if (comments.length === 0) {
      return NextResponse.json(
        { error: 'not_found', message: 'Bình luận không tồn tại.' },
        { status: 404 },
      );
    }

    const comment = comments[0];

    // Lấy thông tin user
    const [users] = await pool.execute<UserRow[]>(
      'SELECT id, is_admin FROM users WHERE id = ?',
      [userId],
    );

    const currentUser = users[0];
    const isOwner = comment.user_id === userId;
    const isAdmin = Boolean(currentUser?.is_admin);

    if (!isOwner && !isAdmin) {
      return NextResponse.json(
        {
          error: 'forbidden',
          message: 'Bạn không có quyền xóa bình luận này.',
        },
        { status: 403 },
      );
    }

    await pool.execute(
      'DELETE FROM lesson_comments WHERE id = ? OR parent_id = ?',
      [commentId, commentId],
    );

    return NextResponse.json({
      success: true,
      message: 'Đã xóa bình luận thành công.',
    });
  } catch (error) {
    console.error('Error deleting lesson comment:', error);
    return NextResponse.json(
      { error: 'server_error', message: 'Lỗi khi xóa bình luận.' },
      { status: 500 },
    );
  }
}
