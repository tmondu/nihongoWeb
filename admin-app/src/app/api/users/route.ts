import { NextRequest, NextResponse } from 'next/server';
import { getDbPool } from '@/lib/db';
import { RowDataPacket, ResultSetHeader } from 'mysql2';

export const dynamic = 'force-dynamic';

interface UserRow extends RowDataPacket {
  id: number;
  email: string;
  is_approved: number;
  is_admin: number;
  created_at: string;
}

export async function GET() {
  try {
    const pool = getDbPool();
    const [rows] = await pool.execute<UserRow[]>(
      'SELECT id, email, is_approved, is_admin, created_at FROM users ORDER BY id DESC',
    );

    return NextResponse.json(rows);
  } catch (error) {
    console.error('Error fetching users in admin API:', error);
    return NextResponse.json({ error: 'Database error' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, isApproved, isAdmin } = body;

    if (userId === undefined) {
      return NextResponse.json(
        { error: 'Thiếu userId cần cập nhật' },
        { status: 400 },
      );
    }

    const pool = getDbPool();
    const [result] = await pool.execute<ResultSetHeader>(
      'UPDATE users SET is_approved = ?, is_admin = ? WHERE id = ?',
      [isApproved ? 1 : 0, isAdmin ? 1 : 0, userId],
    );

    if (result.affectedRows === 0) {
      return NextResponse.json(
        { error: 'Không tìm thấy người dùng' },
        { status: 404 },
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Cập nhật quyền người dùng thành công',
    });
  } catch (error: any) {
    console.error('Error updating user:', error);
    return NextResponse.json(
      { error: error.message || 'Lỗi khi cập nhật thành viên' },
      { status: 500 },
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'Thiếu userId' }, { status: 400 });
    }

    const pool = getDbPool();
    const [result] = await pool.execute<ResultSetHeader>(
      'DELETE FROM users WHERE id = ?',
      [userId],
    );

    if (result.affectedRows === 0) {
      return NextResponse.json(
        { error: 'Không tìm thấy người dùng để xóa' },
        { status: 404 },
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Đã xóa người dùng thành công',
    });
  } catch (error: any) {
    console.error('Error deleting user:', error);
    return NextResponse.json(
      { error: error.message || 'Lỗi khi xóa người dùng' },
      { status: 500 },
    );
  }
}
