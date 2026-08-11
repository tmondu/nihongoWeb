import { NextRequest, NextResponse } from 'next/server';
import { getDbPool } from '@/shared/infra/server/db';
import { hashPassword } from '@/shared/utils/auth';
import { RowDataPacket } from 'mysql2';

// Memory store for registration limits (IP -> timestamp[])
const registrationHistory = new Map<string, number[]>();
const REGISTRATION_LIMIT_WINDOW_MS = 24 * 60 * 60 * 1000; // 24 hours
const MAX_REGISTRATIONS_PER_WINDOW = 3;

/**
 * Check if the request IP is rate limited for registrations
 */
function isIpRateLimited(ip: string): boolean {
  const now = Date.now();
  const history = registrationHistory.get(ip) || [];

  // Filter out timestamps older than 24 hours
  const activeTimestamps = history.filter(
    ts => now - ts < REGISTRATION_LIMIT_WINDOW_MS,
  );

  if (activeTimestamps.length >= MAX_REGISTRATIONS_PER_WINDOW) {
    return true;
  }

  // Record the new registration timestamp
  activeTimestamps.push(now);
  registrationHistory.set(ip, activeTimestamps);
  return false;
}

/**
 * Verify Cloudflare Turnstile token
 */
async function verifyTurnstileToken(
  token: string | undefined,
  ip?: string,
): Promise<boolean> {
  const secret = process.env.TURNSTILE_SECRET_KEY;
  if (!secret) {
    // If not configured locally, pass verification (bypass for development)
    return true;
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
    const { email, password, turnstileToken } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 },
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 },
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters long' },
        { status: 400 },
      );
    }

    const ip = request.headers.get('x-forwarded-for') || '127.0.0.1';

    // 1. Check Rate Limit
    if (isIpRateLimited(ip)) {
      return NextResponse.json(
        {
          error:
            'Bạn đã đăng ký quá nhiều tài khoản từ IP này hôm nay. Vui lòng quay lại sau.',
        },
        { status: 429 },
      );
    }

    // 2. Verify Turnstile Token (if secret is configured)
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

    // Check if user already exists
    const [existing] = await pool.execute<RowDataPacket[]>(
      'SELECT id FROM users WHERE email = ?',
      [email],
    );

    if (existing.length > 0) {
      return NextResponse.json(
        { error: 'Email is already registered' },
        { status: 400 },
      );
    }

    // Hash password and insert with is_approved = 1
    const passwordHash = hashPassword(password);
    await pool.execute(
      'INSERT INTO users (email, password_hash, is_approved) VALUES (?, ?, 1)',
      [email, passwordHash],
    );

    return NextResponse.json(
      {
        success: true,
        message: 'Đăng ký tài khoản thành công!',
      },
      { status: 201 },
    );
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 },
    );
  }
}
