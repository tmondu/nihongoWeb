import { NextRequest, NextResponse } from 'next/server';
import { getDbPool } from '@/lib/db';
import { RowDataPacket, ResultSetHeader } from 'mysql2';

export const dynamic = 'force-dynamic';

interface UserRow extends RowDataPacket {
  id: number;
  sbd: string | null;
  email: string;
  display_name: string | null;
  is_approved: number;
  can_watch_video: number;
  level: string;
  is_admin: number;
  created_at: string;
  deleted_at: string | null;
}

interface CountRow extends RowDataPacket {
  cnt: number;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('query')?.trim();
    const isTrash = searchParams.get('trash') === 'true';

    const pool = getDbPool();

    // Get count of trash items for tab badge
    const [trashCountRows] = await pool.execute<CountRow[]>(
      'SELECT COUNT(*) as cnt FROM users WHERE deleted_at IS NOT NULL',
    );
    const trashCount = trashCountRows[0]?.cnt ?? 0;

    // Get count of active users
    const [activeCountRows] = await pool.execute<CountRow[]>(
      'SELECT COUNT(*) as cnt FROM users WHERE deleted_at IS NULL',
    );
    const activeCount = activeCountRows[0]?.cnt ?? 0;

    let sql = `
      SELECT id, sbd, email, display_name, is_approved, can_watch_video, level, is_admin, created_at, deleted_at 
      FROM users 
      WHERE ${isTrash ? 'deleted_at IS NOT NULL' : 'deleted_at IS NULL'}
    `;
    const params: string[] = [];

    if (query) {
      sql += ' AND (email LIKE ? OR display_name LIKE ? OR sbd LIKE ?)';
      params.push(`%${query}%`, `%${query}%`, `%${query}%`);
    }

    sql += isTrash ? ' ORDER BY deleted_at DESC' : ' ORDER BY id DESC';

    const [rows] = await pool.execute<UserRow[]>(sql, params);

    return NextResponse.json({
      users: rows,
      activeCount,
      trashCount,
    });
  } catch (error) {
    console.error('Error fetching users in admin API:', error);
    return NextResponse.json({ error: 'Database error' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, isApproved, isAdmin, canWatchVideo, level, sbd, action } =
      body;

    const pool = getDbPool();

    // Handle single user restore from trash
    if (action === 'restore') {
      if (!userId) {
        return NextResponse.json(
          { error: 'Thiếu userId cần khôi phục' },
          { status: 400 },
        );
      }
      const [result] = await pool.execute<ResultSetHeader>(
        'UPDATE users SET deleted_at = NULL WHERE id = ?',
        [userId],
      );
      if (result.affectedRows === 0) {
        return NextResponse.json(
          { error: 'Không tìm thấy người dùng trong thùng rác' },
          { status: 404 },
        );
      }
      return NextResponse.json({
        success: true,
        message: 'Đã khôi phục tài khoản thành công',
      });
    }

    // Handle restore all from trash
    if (action === 'restore_all') {
      const [result] = await pool.execute<ResultSetHeader>(
        'UPDATE users SET deleted_at = NULL WHERE deleted_at IS NOT NULL',
      );
      return NextResponse.json({
        success: true,
        message: `Đã khôi phục toàn bộ ${result.affectedRows} tài khoản trong thùng rác`,
      });
    }

    if (userId === undefined) {
      return NextResponse.json(
        { error: 'Thiếu userId cần cập nhật' },
        { status: 400 },
      );
    }

    const updates: string[] = [];
    const values: (number | string | null)[] = [];

    if (isApproved !== undefined) {
      updates.push('is_approved = ?');
      values.push(isApproved ? 1 : 0);
    }
    if (canWatchVideo !== undefined) {
      updates.push('can_watch_video = ?');
      values.push(canWatchVideo ? 1 : 0);
    }
    if (isAdmin !== undefined) {
      updates.push('is_admin = ?');
      values.push(isAdmin ? 1 : 0);
    }
    if (level !== undefined) {
      updates.push('level = ?');
      values.push(String(level).toLowerCase().trim());
    }
    if (sbd !== undefined) {
      updates.push('sbd = ?');
      values.push(sbd === null || sbd === '' ? null : String(sbd).trim());
    }

    if (updates.length === 0) {
      return NextResponse.json({ success: true });
    }

    values.push(userId);
    const [result] = await pool.execute<ResultSetHeader>(
      `UPDATE users SET ${updates.join(', ')} WHERE id = ?`,
      values,
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
  } catch (error: unknown) {
    console.error('Error updating user:', error);
    const msg =
      error instanceof Error ? error.message : 'Lỗi khi cập nhật thành viên';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const isPermanent = searchParams.get('permanent') === 'true';
    const isEmptyTrash = searchParams.get('emptyTrash') === 'true';

    const pool = getDbPool();

    // 1. Empty all trash permanently
    if (isEmptyTrash) {
      const [result] = await pool.execute<ResultSetHeader>(
        'DELETE FROM users WHERE deleted_at IS NOT NULL',
      );
      return NextResponse.json({
        success: true,
        message: `Đã dọn sạch ${result.affectedRows} tài khoản khỏi thùng rác`,
      });
    }

    if (!userId) {
      return NextResponse.json({ error: 'Thiếu userId' }, { status: 400 });
    }

    // 2. Permanent Hard Delete (Xóa hẳn vĩnh viễn)
    if (isPermanent) {
      const [result] = await pool.execute<ResultSetHeader>(
        'DELETE FROM users WHERE id = ?',
        [userId],
      );

      if (result.affectedRows === 0) {
        return NextResponse.json(
          { error: 'Không tìm thấy người dùng để xóa vĩnh viễn' },
          { status: 404 },
        );
      }

      return NextResponse.json({
        success: true,
        message: 'Đã xóa vĩnh viễn người dùng khỏi hệ thống',
      });
    }

    // 3. Soft Delete (Chuyển vào thùng rác)
    const [result] = await pool.execute<ResultSetHeader>(
      'UPDATE users SET deleted_at = CURRENT_TIMESTAMP WHERE id = ?',
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
      message: 'Đã chuyển người dùng vào thùng rác',
    });
  } catch (error: unknown) {
    console.error('Error deleting user:', error);
    const msg =
      error instanceof Error ? error.message : 'Lỗi khi xóa người dùng';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
