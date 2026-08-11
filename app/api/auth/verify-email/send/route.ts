import { NextRequest, NextResponse } from 'next/server';
import { verifyJwt } from '@/shared/utils/auth';
import { getDbPool } from '@/shared/infra/server/db';
import crypto from 'crypto';
import { RowDataPacket } from 'mysql2';

// In-memory map for rate limiting: userId -> lastSentTimestamp
const lastSentTimestamps = new Map<number, number>();
const SEND_INTERVAL_LIMIT_MS = 60 * 1000; // 60 seconds

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

  // Rate Limiting Check
  const now = Date.now();
  const lastSent = lastSentTimestamps.get(userId);
  if (lastSent && now - lastSent < SEND_INTERVAL_LIMIT_MS) {
    const waitSeconds = Math.ceil(
      (SEND_INTERVAL_LIMIT_MS - (now - lastSent)) / 1000,
    );
    return NextResponse.json(
      { error: `Vui lòng đợi ${waitSeconds} giây trước khi gửi lại mã.` },
      { status: 429 },
    );
  }

  try {
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

    // Generate 6-digit OTP
    const code = String(crypto.randomInt(100000, 999999));
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes expiration

    // Save to database
    // Overwrite previous codes for this email
    await pool.execute('DELETE FROM email_verification_codes WHERE email = ?', [
      email,
    ]);

    await pool.execute(
      'INSERT INTO email_verification_codes (email, code, expires_at) VALUES (?, ?, ?)',
      [email, code, expiresAt],
    );

    // Record timestamp for rate limit
    lastSentTimestamps.set(userId, now);

    // Send email via Resend if API key is configured
    const apiKey = process.env.RESEND_API_KEY;
    if (apiKey) {
      try {
        const response = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${apiKey}`,
          },
          body: JSON.stringify({
            from: 'PThamSS <no-reply@pthamss.com>',
            to: [email],
            subject: `[PThamSS] Mã xác thực email của bạn: ${code}`,
            html: `
              <div style="font-family: sans-serif; max-width: 500px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
                <h2 style="color: #3b82f6; text-align: center;">Xác thực Email của bạn</h2>
                <p>Xin chào,</p>
                <p>Cảm ơn bạn đã sử dụng nền tảng học tập <strong>PThamSS</strong>. Dưới đây là mã xác thực (OTP) để xác thực địa chỉ email của bạn:</p>
                <div style="text-align: center; margin: 30px 0;">
                  <span style="font-size: 32px; font-weight: bold; tracking-spacing: 4px; background-color: #f1f5f9; padding: 10px 20px; border-radius: 8px; color: #1e3a8a; display: inline-block;">${code}</span>
                </div>
                <p style="color: #64748b; font-size: 14px;">Mã này có hiệu lực trong vòng 15 phút. Nếu bạn không yêu cầu mã này, vui lòng bỏ qua email này.</p>
                <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
                <p style="text-align: center; color: #94a3b8; font-size: 12px;">© ${new Date().getFullYear()} PThamSS. All rights reserved.</p>
              </div>
            `,
          }),
        });

        if (!response.ok) {
          const errorText = await response.text();
          console.error(
            'Failed to send verification email via Resend:',
            errorText,
          );
          throw new Error('Failed to send verification email');
        }
      } catch (err) {
        console.error('Email delivery error:', err);
        return NextResponse.json(
          { error: 'Không thể gửi email xác thực. Vui lòng thử lại sau.' },
          { status: 500 },
        );
      }
    } else {
      // Local development fallback: log the code in console
      console.warn('====================================');
      console.warn(`[LOCAL DEV] Verification code for ${email}: ${code}`);
      console.warn('====================================');
    }

    return NextResponse.json({
      success: true,
      message: 'Mã xác thực đã được gửi thành công!',
    });
  } catch (error) {
    console.error('Failed to process verification email:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 },
    );
  }
}
