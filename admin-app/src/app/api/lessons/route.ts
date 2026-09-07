import { NextRequest, NextResponse } from 'next/server';
import { getDbPool } from '@/lib/db';
import { RowDataPacket, ResultSetHeader } from 'mysql2';

export const dynamic = 'force-dynamic';

interface LessonRow extends RowDataPacket {
  id: number;
  title: string;
  description: string | null;
  level: string;
  video_url: string;
  order_num: number;
  created_at: string;
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const level = searchParams.get('level')?.toLowerCase();
  const query = searchParams.get('query')?.trim();

  try {
    const pool = getDbPool();
    const conditions: string[] = [];
    const params: (string | number)[] = [];

    if (level && ['n5', 'n4', 'n3', 'n2', 'n1'].includes(level)) {
      conditions.push('level = ?');
      params.push(level);
    }

    if (query) {
      conditions.push('(title LIKE ? OR description LIKE ?)');
      const searchPattern = `%${query}%`;
      params.push(searchPattern, searchPattern);
    }

    const whereClause =
      conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    const [rows] = await pool.execute<LessonRow[]>(
      `SELECT id, title, description, level, video_url, order_num, created_at 
       FROM lessons ${whereClause} 
       ORDER BY order_num ASC, id ASC`,
      params,
    );

    return NextResponse.json({
      lessons: rows,
      total: rows.length,
    });
  } catch (error: any) {
    console.error('Error fetching lessons in admin:', error);
    return NextResponse.json(
      { error: error.message || 'Database error' },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, description, level, video_url, order_num } = body;

    if (!title || !video_url) {
      return NextResponse.json(
        { error: 'Vui lòng cung cấp tiêu đề và đường dẫn video' },
        { status: 400 },
      );
    }

    const pool = getDbPool();
    const [result] = await pool.execute<ResultSetHeader>(
      `INSERT INTO lessons (title, description, level, video_url, order_num) 
       VALUES (?, ?, ?, ?, ?)`,
      [
        title.trim(),
        description ? description.trim() : null,
        (level || 'n5').toLowerCase(),
        video_url.trim(),
        Number(order_num) || 1,
      ],
    );

    return NextResponse.json({
      success: true,
      id: result.insertId,
      message: 'Thêm bài giảng mới thành công',
    });
  } catch (error: any) {
    console.error('Error creating lesson:', error);
    return NextResponse.json(
      { error: error.message || 'Lỗi khi thêm bài giảng' },
      { status: 500 },
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, title, description, level, video_url, order_num } = body;

    if (!id || !title || !video_url) {
      return NextResponse.json(
        { error: 'Vui lòng cung cấp ID, tiêu đề và link video' },
        { status: 400 },
      );
    }

    const pool = getDbPool();
    const [result] = await pool.execute<ResultSetHeader>(
      `UPDATE lessons 
       SET title = ?, description = ?, level = ?, video_url = ?, order_num = ? 
       WHERE id = ?`,
      [
        title.trim(),
        description ? description.trim() : null,
        (level || 'n5').toLowerCase(),
        video_url.trim(),
        Number(order_num) || 1,
        id,
      ],
    );

    if (result.affectedRows === 0) {
      return NextResponse.json(
        { error: 'Không tìm thấy bài giảng để cập nhật' },
        { status: 404 },
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Cập nhật bài giảng thành công',
    });
  } catch (error: any) {
    console.error('Error updating lesson:', error);
    return NextResponse.json(
      { error: error.message || 'Lỗi khi cập nhật bài giảng' },
      { status: 500 },
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Vui lòng cung cấp ID bài giảng cần xóa' },
        { status: 400 },
      );
    }

    const pool = getDbPool();
    const [result] = await pool.execute<ResultSetHeader>(
      'DELETE FROM lessons WHERE id = ?',
      [id],
    );

    if (result.affectedRows === 0) {
      return NextResponse.json(
        { error: 'Không tìm thấy bài giảng để xóa' },
        { status: 404 },
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Xóa bài giảng thành công',
    });
  } catch (error: any) {
    console.error('Error deleting lesson:', error);
    return NextResponse.json(
      { error: error.message || 'Lỗi khi xóa bài giảng' },
      { status: 500 },
    );
  }
}
