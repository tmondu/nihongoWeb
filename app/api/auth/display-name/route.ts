import { NextRequest, NextResponse } from 'next/server';
import { verifyJwt } from '@/shared/utils/auth';
import { getDbPool } from '@/shared/infra/server/db';
import { RowDataPacket } from 'mysql2';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  const token = request.cookies.get('auth_token')?.value;
  if (!token) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const payload = await verifyJwt(token);
  if (!payload || !payload.userId) {
    return NextResponse.json({ error: 'Invalid session' }, { status: 401 });
  }

  try {
    const { displayName } = await request.json();
    const trimmedName = String(displayName || '').trim();

    if (!trimmedName || trimmedName.length < 2 || trimmedName.length > 50) {
      return NextResponse.json(
        { error: 'Tên hiển thị phải có độ dài từ 2 đến 50 ký tự.' },
        { status: 400 },
      );
    }

    // Check dangerous characters like tags
    if (/[<>]/.test(trimmedName)) {
      return NextResponse.json(
        { error: 'Tên hiển thị không được chứa ký tự không hợp lệ.' },
        { status: 400 },
      );
    }

    const userId = payload.userId as number;
    const pool = getDbPool();

    const [users] = await pool.execute<RowDataPacket[]>(
      'SELECT id, display_name, name_updated_at FROM users WHERE id = ?',
      [userId],
    );

    const user = users[0];
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Check 7-day cooldown if user already has a display name and changed it before
    if (
      user.display_name &&
      trimmedName !== user.display_name &&
      user.name_updated_at
    ) {
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

    // Update display name and timestamp
    await pool.execute(
      'UPDATE users SET display_name = ?, name_updated_at = NOW() WHERE id = ?',
      [trimmedName, userId],
    );

    return NextResponse.json({
      success: true,
      displayName: trimmedName,
      message: 'Cập nhật tên hiển thị thành công!',
    });
  } catch (error) {
    console.error('Failed to update display name:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 },
    );
  }
}
