import { NextRequest } from 'next/server';
import { verifyJwt } from '../../utils/auth';
import { getDbPool } from './db';
import { RowDataPacket } from 'mysql2';

export async function verifyAdminSession(request: NextRequest) {
  const token = request.cookies.get('auth_token')?.value;
  if (!token) return null;

  const payload = await verifyJwt(token);
  if (!payload || !payload.userId) return null;

  try {
    const pool = getDbPool();
    const [users] = await pool.execute<RowDataPacket[]>(
      'SELECT id, email, is_approved, is_admin FROM users WHERE id = ?',
      [payload.userId as number],
    );

    const user = users[0];
    if (!user || !user.is_admin || !user.is_approved) {
      return null;
    }

    return user;
  } catch (error) {
    console.error('Failed to verify admin session:', error);
    return null;
  }
}
