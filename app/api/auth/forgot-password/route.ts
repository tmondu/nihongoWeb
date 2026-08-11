import { NextRequest, NextResponse } from 'next/server';
import { getDbPool } from '@/shared/infra/server/db';
import crypto from 'crypto';
import { RowDataPacket } from 'mysql2';

// Memory store for rate limits (email -> timestamp[])
const resetHistory = new Map<string, number[]>();
const RESET_LIMIT_WINDOW_MS = 60 * 60 * 1000; // 1 hour
const MAX_RESETS_PER_WINDOW = 3;

function isEmailRateLimited(email: string): boolean {
  const now = Date.now();
  const history = resetHistory.get(email) || [];

  // Filter out timestamps older than 1 hour
  const activeTimestamps = history.filter(
    ts => now - ts < RESET_LIMIT_WINDOW_MS,
  );

  if (activeTimestamps.length >= MAX_RESETS_PER_WINDOW) {
    return true;
  }

  activeTimestamps.push(now);
  resetHistory.set(email, activeTimestamps);
  return false;
}

async function verifyTurnstileToken(
  token: string | undefined,
  ip?: string,
): Promise<boolean> {
  const secret = process.env.TURNSTILE_SECRET_KEY;
  if (!secret) {
    return true; // Bypass in local dev
  }
  if (!token) {
    return false;
  }
  try {
    const response = await fetch(
      'https://challenges.cloudflare.com/turnstile/v0/siteverify',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          secret,
          response: token,
          remoteip: ip,
        }),
      },
    );
    const data = (await response.json()) as { success?: boolean };
    return Boolean(data.success);
  } catch (error) {
    console.error('Turnstile verification error:', error);
    return false;
  }
}

export async function POST(request: NextRequest) {
  try {
    const { email, turnstileToken } = await request.json();
    if (!email) {
      return NextResponse.json(
        { error: 'Vui lòng cung cấp địa chỉ email.' },
        { status: 400 },
      );
    }

    const ip = request.headers.get('x-forwarded-for') || '127.0.0.1';

    // 1. Verify Turnstile Token if secret key is present
    if (process.env.TURNSTILE_SECRET_KEY) {
      const isTurnstileValid = await verifyTurnstileToken(turnstileToken, ip);
      if (!isTurnstileValid) {
        return NextResponse.json(
          { error: 'Xác thực bảo mật Turnstile không hợp lệ hoặc đã hết hạn.' },
          { status: 400 },
        );
      }
    }

    const pool = getDbPool();

    // 2. Check if user exists
    const [users] = await pool.execute<RowDataPacket[]>(
      'SELECT id, email, is_verified FROM users WHERE email = ?',
      [email],
    );

    const user = users[0];
    if (!user) {
      // Security: return success to prevent username enumeration
      return NextResponse.json({
        success: true,
        message:
          'Nếu email tồn tại và đã được xác thực, liên kết đặt lại mật khẩu đã được gửi.',
      });
    }

    // 3. Check if email is verified
    if (user.is_verified !== 1) {
      return NextResponse.json(
        {
          error:
            'Tài khoản này chưa được xác thực email chính chủ. Vui lòng đăng nhập và thực hiện xác thực email trước khi khôi phục mật khẩu.',
        },
        { status: 400 },
      );
    }

    // 4. Check email rate limit
    if (isEmailRateLimited(email)) {
      return NextResponse.json(
        {
          error:
            'Bạn đã yêu cầu đặt lại mật khẩu quá nhiều lần. Vui lòng đợi 1 giờ trước khi thử lại.',
        },
        { status: 429 },
      );
    }

    // 5. Generate secure token
    const rawToken = crypto.randomBytes(32).toString('hex');
    const tokenHash = crypto
      .createHash('sha256')
      .update(rawToken)
      .digest('hex');
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour expiration

    // Clean old tokens and insert the new one
    await pool.execute('DELETE FROM password_reset_tokens WHERE user_id = ?', [
      user.id,
    ]);
    await pool.execute(
      'INSERT INTO password_reset_tokens (user_id, token_hash, expires_at) VALUES (?, ?, ?)',
      [user.id, tokenHash, expiresAt],
    );

    // 6. Send reset password link
    const origin = request.nextUrl.origin;
    const resetLink = `${origin}/reset-password?token=${rawToken}`;

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
            subject: '[PThamSS] Đặt lại mật khẩu tài khoản của bạn',
            html: `
              <div style="font-family: sans-serif; max-width: 500px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
                <h2 style="color: #3b82f6; text-align: center;">Yêu cầu đặt lại mật khẩu</h2>
                <p>Xin chào,</p>
                <p>Chúng tôi nhận được yêu cầu đặt lại mật khẩu cho tài khoản <strong>PThamSS</strong> của bạn. Bấm vào nút dưới đây để thiết lập mật khẩu mới:</p>
                <div style="text-align: center; margin: 30px 0;">
                  <a href="${resetLink}" style="background-color: #3b82f6; color: white; padding: 12px 24px; border-radius: 8px; font-weight: bold; text-decoration: none; display: inline-block;">Đặt lại mật khẩu</a>
                </div>
                <p style="color: #64748b; font-size: 14px;">Hoặc bạn có thể truy cập trực tiếp liên kết sau:</p>
                <p style="word-break: break-all; font-size: 12px; color: #3b82f6;"><a href="${resetLink}">${resetLink}</a></p>
                <p style="color: #64748b; font-size: 14px; margin-top: 20px;">Liên kết này có hiệu lực trong vòng 1 giờ. Nếu bạn không yêu cầu đặt lại mật khẩu, vui lòng bỏ qua email này.</p>
                <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
                <p style="text-align: center; color: #94a3b8; font-size: 12px;">© ${new Date().getFullYear()} PThamSS. All rights reserved.</p>
              </div>
            `,
          }),
        });

        if (!response.ok) {
          const errorText = await response.text();
          console.error('Failed to send reset email via Resend:', errorText);
          throw new Error('Failed to send reset email');
        }
      } catch (err) {
        console.error('Email delivery error:', err);
        return NextResponse.json(
          {
            error:
              'Không thể gửi email đặt lại mật khẩu. Vui lòng thử lại sau.',
          },
          { status: 500 },
        );
      }
    } else {
      console.warn('====================================');
      console.warn(
        `[LOCAL DEV] Password reset link for ${email}: ${resetLink}`,
      );
      console.warn('====================================');
    }

    return NextResponse.json({
      success: true,
      message:
        'Nếu email tồn tại và đã được xác thực, liên kết đặt lại mật khẩu đã được gửi.',
    });
  } catch (error) {
    console.error('Forgot password error:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 },
    );
  }
}
