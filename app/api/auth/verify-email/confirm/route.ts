import { NextRequest, NextResponse } from 'next/server';
import { verifyJwt } from '@/shared/utils/auth';
import { getDbPool } from '@/shared/infra/server/db';
import { RowDataPacket } from 'mysql2';

export async function POST(request: NextRequest) {
  const token = request.cookies.get('auth_token')?.value;
  if (!token) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const payload = await verifyJwt(token);
  if (!payload || !payload.userId) {
    return NextResponse.json({ error: 'Invalid session' }, { status: 401 });
  }

  const userId = payload.userId as number;

  try {
    const { code } = await request.json();
    if (!code || typeof code !== 'string' || code.length !== 6) {
      return NextResponse.json(
        { error: 'Mã xác thực không hợp lệ. Vui lòng nhập đúng 6 chữ số.' },
        { status: 400 },
      );
    }

    const pool = getDbPool();

    // Fetch user email
    const [users] = await pool.execute<RowDataPacket[]>(
      'SELECT email FROM users WHERE id = ?',
      [userId],
    );

    const user = users[0];
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const email = user.email;

    // Check code in database
    const [codes] = await pool.execute<RowDataPacket[]>(
      'SELECT code, expires_at FROM email_verification_codes WHERE email = ? AND code = ?',
      [email, code],
    );

    const codeRecord = codes[0];
    if (!codeRecord) {
      return NextResponse.json(
        { error: 'Mã xác thực không chính xác.' },
        { status: 400 },
      );
    }

    // Check expiration
    const expiresAt = new Date(codeRecord.expires_at).getTime();
    if (Date.now() > expiresAt) {
      return NextResponse.json(
        { error: 'Mã xác thực đã hết hạn. Vui lòng gửi lại mã mới.' },
        { status: 400 },
      );
    }

    // Set user as verified
    await pool.execute('UPDATE users SET is_verified = 1 WHERE id = ?', [
      userId,
    ]);

    // Delete used code
    await pool.execute('DELETE FROM email_verification_codes WHERE email = ?', [
      email,
    ]);

    return NextResponse.json({
      success: true,
      message: 'Email đã được xác thực thành công!',
    });
  } catch (error) {
    console.error('Failed to confirm verification code:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 },
    );
  }
}
