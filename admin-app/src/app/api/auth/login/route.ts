import { NextRequest, NextResponse } from 'next/server';
import { setAdminSession } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json();

    const expectedUser = process.env.ADMIN_USERNAME || 'admin';
    const expectedPass = process.env.ADMIN_PASSWORD;

    // Không còn mặc định admin/admin: thiếu ADMIN_PASSWORD thì từ chối
    if (!expectedPass) {
      return NextResponse.json({ error: 'Lỗi máy chủ' }, { status: 500 });
    }

    if (username === expectedUser && password === expectedPass) {
      await setAdminSession(username);
      return NextResponse.json({ success: true, username });
    }

    return NextResponse.json(
      { error: 'Tên đăng nhập hoặc mật khẩu không chính xác' },
      { status: 401 },
    );
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ error: 'Lỗi máy chủ' }, { status: 500 });
  }
}
