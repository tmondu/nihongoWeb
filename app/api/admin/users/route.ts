import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminSession } from '@/shared/infra/server/adminAuth';
import { getDbPool } from '@/shared/infra/server/db';
import { RowDataPacket } from 'mysql2';
import { hashPassword } from '@/shared/utils/auth';

export async function POST(request: NextRequest) {
  const admin = await verifyAdminSession(request);
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { email, password, isApproved, isAdmin } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email và mật khẩu không được để trống' },
        { status: 400 },
      );
    }

    const pool = getDbPool();

    // Check if email already exists
    const [existing] = await pool.execute<RowDataPacket[]>(
      'SELECT id FROM users WHERE email = ?',
      [email],
    );

    if (existing.length > 0) {
      return NextResponse.json(
        { error: 'Email này đã được đăng ký trong hệ thống.' },
        { status: 400 },
      );
    }

    const hashedPassword = hashPassword(password);

    await pool.execute(
      'INSERT INTO users (email, password_hash, is_approved, is_admin) VALUES (?, ?, ?, ?)',
      [email, hashedPassword, isApproved ? 1 : 0, isAdmin ? 1 : 0],
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to create user:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 },
    );
  }
}

export async function GET(request: NextRequest) {
  const admin = await verifyAdminSession(request);
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const pool = getDbPool();
    const [users] = await pool.execute<RowDataPacket[]>(
      'SELECT id, email, is_approved, is_admin, created_at FROM users ORDER BY created_at DESC',
    );

    return NextResponse.json(users);
  } catch (error) {
    console.error('Failed to fetch users:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 },
    );
  }
}

export async function PUT(request: NextRequest) {
  const admin = await verifyAdminSession(request);
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { userId, email, password, isApproved, isAdmin } =
      await request.json();

    if (
      userId === undefined ||
      isApproved === undefined ||
      isAdmin === undefined
    ) {
      return NextResponse.json(
        { error: 'Missing parameters' },
        { status: 400 },
      );
    }

    // Safety check: Admin cannot change their own admin or approval status
    if (Number(userId) === Number(admin.id)) {
      if (isAdmin === 0 || isApproved === 0) {
        return NextResponse.json(
          {
            error:
              'Bạn không thể tự hạ quyền hoặc hủy phê duyệt tài khoản của chính mình.',
          },
          { status: 400 },
        );
      }
    }

    const pool = getDbPool();

    // Check duplicate email
    if (email) {
      const [existing] = await pool.execute<RowDataPacket[]>(
        'SELECT id FROM users WHERE email = ? AND id != ?',
        [email, userId],
      );

      if (existing.length > 0) {
        return NextResponse.json(
          { error: 'Email này đã được sử dụng bởi một tài khoản khác.' },
          { status: 400 },
        );
      }
    }

    if (password) {
      const hashedPassword = hashPassword(password);
      await pool.execute(
        'UPDATE users SET email = ?, password_hash = ?, is_approved = ?, is_admin = ? WHERE id = ?',
        [email, hashedPassword, isApproved ? 1 : 0, isAdmin ? 1 : 0, userId],
      );
    } else {
      await pool.execute(
        'UPDATE users SET email = ?, is_approved = ?, is_admin = ? WHERE id = ?',
        [email, isApproved ? 1 : 0, isAdmin ? 1 : 0, userId],
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to update user:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 },
    );
  }
}

export async function DELETE(request: NextRequest) {
  const admin = await verifyAdminSession(request);
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'Missing userId' }, { status: 400 });
    }

    // Safety check: Admin cannot delete themselves
    if (Number(userId) === Number(admin.id)) {
      return NextResponse.json(
        { error: 'Bạn không thể tự xóa tài khoản của chính mình.' },
        { status: 400 },
      );
    }

    const pool = getDbPool();
    await pool.execute('DELETE FROM users WHERE id = ?', [userId]);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to delete user:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 },
    );
  }
}
