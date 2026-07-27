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
      'SELECT id, email, password_hash, is_approved FROM users WHERE email = ?',
      [email],
    );

    const user = users[0];
    if (!user) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
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

    // Set cookie (Session cookie - expires when browser tab is closed)
    const response = NextResponse.json({
      success: true,
      message: 'Logged in successfully',
    });
    response.cookies.set('auth_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 },
    );
  }
}
