import { NextRequest, NextResponse } from 'next/server';
import { getDbPool } from '@/shared/infra/server/db';
import { signJwt, hashPassword } from '@/shared/utils/auth';
import { RowDataPacket, ResultSetHeader } from 'mysql2';
import crypto from 'crypto';

export const dynamic = 'force-dynamic';

function getBaseUrl(request: NextRequest): string {
  const forwardedHost = request.headers.get('x-forwarded-host');
  const forwardedProto = request.headers.get('x-forwarded-proto') || 'https';
  if (forwardedHost) {
    return `${forwardedProto}://${forwardedHost}`;
  }
  return request.nextUrl.origin;
}

interface UserRow extends RowDataPacket {
  id: number;
  email: string;
  is_approved: number;
  can_watch_video: number;
  is_admin: number;
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  const stateRaw = searchParams.get('state');
  const googleError = searchParams.get('error');

  const baseUrl = getBaseUrl(request);

  // Parse state to find redirect path
  let redirectTarget = '/';
  if (stateRaw) {
    try {
      const parsed = JSON.parse(stateRaw);
      if (
        parsed.redirect &&
        typeof parsed.redirect === 'string' &&
        parsed.redirect.startsWith('/')
      ) {
        redirectTarget = parsed.redirect;
      }
    } catch {
      // Ignore JSON parse error, keep default '/'
    }
  }

  if (googleError) {
    console.error('Google OAuth error:', googleError);
    return NextResponse.redirect(
      new URL(
        `/login?error=${encodeURIComponent('Đăng nhập Google bị hủy hoặc thất bại.')}`,
        baseUrl,
      ),
    );
  }

  if (!code) {
    return NextResponse.redirect(
      new URL(
        `/login?error=${encodeURIComponent('Không nhận được authorization code từ Google.')}`,
        baseUrl,
      ),
    );
  }

  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    return NextResponse.redirect(
      new URL(
        `/login?error=${encodeURIComponent('Chưa cấu hình Google Client ID hoặc Client Secret trong hệ thống.')}`,
        baseUrl,
      ),
    );
  }

  const redirectUri = `${baseUrl}/api/auth/callback/google`;

  try {
    // 1. Exchange code for tokens
    const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        grant_type: 'authorization_code',
      }),
    });

    const tokenData = await tokenRes.json();
    if (!tokenRes.ok || !tokenData.access_token) {
      console.error('Failed to exchange Google token:', tokenData);
      return NextResponse.redirect(
        new URL(
          `/login?error=${encodeURIComponent(tokenData.error_description || 'Không thể xác thực mã từ Google.')}`,
          baseUrl,
        ),
      );
    }

    // 2. Fetch user profile from Google
    const userRes = await fetch(
      'https://www.googleapis.com/oauth2/v3/userinfo',
      {
        headers: {
          Authorization: `Bearer ${tokenData.access_token}`,
        },
      },
    );

    const userData = await userRes.json();
    if (!userRes.ok || !userData.email) {
      console.error('Failed to fetch Google user info:', userData);
      return NextResponse.redirect(
        new URL(
          `/login?error=${encodeURIComponent('Không thể lấy thông tin email từ Google.')}`,
          baseUrl,
        ),
      );
    }

    const email = userData.email.toLowerCase().trim();

    // 3. Find or create user in Database
    const pool = getDbPool();
    const [existingUsers] = await pool.execute<UserRow[]>(
      'SELECT id, email, is_approved, can_watch_video, is_admin FROM users WHERE email = ?',
      [email],
    );

    let userId: number;

    if (existingUsers.length > 0) {
      userId = existingUsers[0].id;
    } else {
      // New user registering via Google:
      // Verified automatically by Google, approved by default, can_watch_video = 0
      const randomPassword = crypto.randomUUID();
      const passwordHash = hashPassword(randomPassword);

      const [insertResult] = await pool.execute<ResultSetHeader>(
        'INSERT INTO users (email, password_hash, is_approved, can_watch_video, is_admin, is_verified) VALUES (?, ?, 1, 0, 0, 1)',
        [email, passwordHash],
      );
      userId = insertResult.insertId;
    }

    // 4. Sign JWT session token
    const token = await signJwt({
      userId,
      email,
    });

    // 5. Set session cookie and redirect to target page
    const redirectUrl = new URL(redirectTarget, baseUrl);
    const response = NextResponse.redirect(redirectUrl);

    response.cookies.set('auth_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 86400 * 7, // 7 days
    });

    return response;
  } catch (error) {
    console.error('Google callback error:', error);
    return NextResponse.redirect(
      new URL(
        `/login?error=${encodeURIComponent('Đã xảy ra lỗi hệ thống khi đăng nhập bằng Google.')}`,
        baseUrl,
      ),
    );
  }
}
