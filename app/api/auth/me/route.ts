import { NextRequest, NextResponse } from 'next/server';
import { verifyJwt, verifyPassword, hashPassword } from '@/shared/utils/auth';
import { getDbPool } from '@/shared/infra/server/db';
import { RowDataPacket } from 'mysql2';

export async function GET(request: NextRequest) {
  const token = request.cookies.get('auth_token')?.value;
  if (!token) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const payload = await verifyJwt(token);
  if (!payload || !payload.userId) {
    return NextResponse.json({ error: 'Invalid session' }, { status: 401 });
  }

  try {
    const pool = getDbPool();
    const [users] = await pool.execute<RowDataPacket[]>(
      'SELECT id, email, display_name, name_updated_at, is_approved, can_watch_video, level, is_admin, is_verified, created_at FROM users WHERE id = ?',
      [payload.userId as number],
    );

    const user = users[0];
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error('Failed to get user profile:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 },
    );
  }
}

export async function PUT(request: NextRequest) {
  const token = request.cookies.get('auth_token')?.value;
  if (!token) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const payload = await verifyJwt(token);
  if (!payload || !payload.userId) {
    return NextResponse.json({ error: 'Invalid session' }, { status: 401 });
  }

  try {
    const { email, currentPassword, newPassword, displayName } =
      await request.json();
    const userId = payload.userId as number;
    const pool = getDbPool();

    // Fetch user details first
    const [users] = await pool.execute<RowDataPacket[]>(
      'SELECT email, password_hash, display_name, name_updated_at FROM users WHERE id = ?',
      [userId],
    );

    const user = users[0];
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // 1. Handle Display Name update with 7-day cooldown rule
    if (displayName !== undefined) {
      const trimmedName = String(displayName).trim();

      if (trimmedName.length > 0) {
        if (trimmedName.length < 2 || trimmedName.length > 50) {
          return NextResponse.json(
            { error: 'Tên hiển thị phải có độ dài từ 2 đến 50 ký tự.' },
            { status: 400 },
          );
        }

        // Only enforce cooldown if display_name is changing from an existing name
        if (user.display_name && trimmedName !== user.display_name) {
          if (user.name_updated_at) {
            const lastUpdate = new Date(user.name_updated_at).getTime();
            const diffDays = (Date.now() - lastUpdate) / (1000 * 60 * 60 * 24);
            if (diffDays < 7) {
              const daysLeft = Math.ceil(7 - diffDays);
              return NextResponse.json(
                {
                  error: `Bạn chỉ có thể đổi tên hiển thị 7 ngày một lần. Vui lòng thử lại sau ${daysLeft} ngày.`,
                },
                { status: 400 },
              );
            }
          }
        }

        if (trimmedName !== user.display_name) {
          await pool.execute(
            'UPDATE users SET display_name = ?, name_updated_at = NOW() WHERE id = ?',
            [trimmedName, userId],
          );
        }
      }
    }

    // 2. Handle email update if changing
    if (email && email !== user.email) {
      // Check duplicate email
      const [existing] = await pool.execute<RowDataPacket[]>(
        'SELECT id FROM users WHERE email = ? AND id != ?',
        [email, userId],
      );

      if (existing.length > 0) {
        return NextResponse.json(
          { error: 'Email này đã được sử dụng bởi tài khoản khác.' },
          { status: 400 },
        );
      }

      await pool.execute('UPDATE users SET email = ? WHERE id = ?', [
        email,
        userId,
      ]);
    }

    // 3. Handle password update
    if (newPassword) {
      if (!currentPassword) {
        return NextResponse.json(
          { error: 'Vui lòng nhập mật khẩu hiện tại để xác minh thay đổi.' },
          { status: 400 },
        );
      }

      const isPasswordValid = verifyPassword(
        currentPassword,
        user.password_hash,
      );
      if (!isPasswordValid) {
        return NextResponse.json(
          { error: 'Mật khẩu hiện tại không chính xác.' },
          { status: 400 },
        );
      }

      const hashedNewPassword = hashPassword(newPassword);
      await pool.execute('UPDATE users SET password_hash = ? WHERE id = ?', [
        hashedNewPassword,
        userId,
      ]);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to update user profile:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 },
    );
  }
}
