import { NextRequest, NextResponse } from 'next/server';
import { getDbPool } from '@/shared/infra/server/db';
import { verifyPassword, signJwt } from '@/shared/utils/auth';
import { RowDataPacket } from 'mysql2';

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 },
      );
    }

    const pool = getDbPool();

    // Query user by email
    const [users] = await pool.execute<RowDataPacket[]>(
      'SELECT id, email, password_hash, is_approved, is_admin, deleted_at FROM users WHERE email = ?',
      [email],
    );

    const user = users[0];
    if (!user || user.deleted_at) {
      return NextResponse.json(
        {
          error:
            'Email hoặc mật khẩu không chính xác hoặc tài khoản đã bị khóa/xóa.',
        },
        { status: 400 },
      );
    }

    // Verify password
    const isPasswordValid = verifyPassword(password, user.password_hash);
    if (!isPasswordValid) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 400 },
      );
    }

    // Check if account is approved by admin
    if (!user.is_approved) {
      return NextResponse.json(
        { error: 'Tài khoản của bạn đang chờ phê duyệt từ Admin.' },
        { status: 403 },
      );
    }

    // Sign JWT
    const token = await signJwt({ userId: user.id, email: user.email });

    const isAdmin = Boolean(user.is_admin === 1 || user.is_admin === true);

    // Set cookie (Session cookie - expires when browser tab is closed)
    const response = NextResponse.json({
      success: true,
      message: 'Logged in successfully',
      is_admin: isAdmin ? 1 : 0,
    });
    response.cookies.set('auth_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
    });

    if (isAdmin) {
      response.cookies.set('is_admin', '1', {
        httpOnly: false,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 86400 * 7,
      });
    } else {
      response.cookies.set('is_admin', '', {
        httpOnly: false,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 0,
      });
    }

    return response;
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 },
    );
  }
}
