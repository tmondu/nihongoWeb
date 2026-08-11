import { NextRequest, NextResponse } from 'next/server';
import { getDbPool } from '@/shared/infra/server/db';
import { hashPassword } from '@/shared/utils/auth';
import crypto from 'crypto';
import { RowDataPacket } from 'mysql2';

export async function POST(request: NextRequest) {
  try {
    const { token, password } = await request.json();

    if (!token || !password) {
      return NextResponse.json(
        { error: 'Token và mật khẩu mới là bắt buộc.' },
        { status: 400 },
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Mật khẩu phải từ 6 ký tự trở lên.' },
        { status: 400 },
      );
    }

    // 1. Hash the token to compare with DB
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');

    const pool = getDbPool();

    // 2. Fetch token record
    const [tokens] = await pool.execute<RowDataPacket[]>(
      'SELECT user_id, expires_at FROM password_reset_tokens WHERE token_hash = ?',
      [tokenHash],
    );

    const tokenRecord = tokens[0];
    if (!tokenRecord) {
      return NextResponse.json(
        {
          error: 'Liên kết đặt lại mật khẩu không hợp lệ hoặc đã được sử dụng.',
        },
        { status: 400 },
      );
    }

    // 3. Check expiration
    const expiresAt = new Date(tokenRecord.expires_at).getTime();
    if (Date.now() > expiresAt) {
      // Clean up expired token
      await pool.execute(
        'DELETE FROM password_reset_tokens WHERE token_hash = ?',
        [tokenHash],
      );
      return NextResponse.json(
        {
          error:
            'Liên kết đặt lại mật khẩu đã hết hạn. Vui lòng yêu cầu mã mới.',
        },
        { status: 400 },
      );
    }

    const userId = tokenRecord.user_id;

    // 4. Hash new password and update in DB
    const passwordHash = hashPassword(password);
    await pool.execute('UPDATE users SET password_hash = ? WHERE id = ?', [
      passwordHash,
      userId,
    ]);

    // 5. Delete used token
    await pool.execute('DELETE FROM password_reset_tokens WHERE user_id = ?', [
      userId,
    ]);

    return NextResponse.json({
      success: true,
      message: 'Mật khẩu của bạn đã được đặt lại thành công!',
    });
  } catch (error) {
    console.error('Reset password error:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 },
    );
  }
}
