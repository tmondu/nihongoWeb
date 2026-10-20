import { NextRequest, NextResponse } from 'next/server';
import { getDbPool } from '@/lib/db';
import { RowDataPacket, ResultSetHeader } from 'mysql2';

export const dynamic = 'force-dynamic';

type VideoType = 'grammar' | 'exam_review';

interface LessonRow extends RowDataPacket {
  id: number;
  title: string;
  description: string | null;
  level: string;
  video_url: string;
  video_type: VideoType;
  order_num: number;
  created_at: string;
}

const VALID_VIDEO_TYPES: VideoType[] = ['grammar', 'exam_review'];

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const level = searchParams.get('level')?.toLowerCase();
  const query = searchParams.get('query')?.trim();
  const videoType = searchParams.get('video_type');

  try {
    const pool = getDbPool();
    const conditions: string[] = [];
    const params: (string | number)[] = [];

    if (level && ['n5', 'n4', 'n3', 'n2', 'n1'].includes(level)) {
      conditions.push('level = ?');
      params.push(level);
    }

    if (videoType && VALID_VIDEO_TYPES.includes(videoType as VideoType)) {
      conditions.push('video_type = ?');
      params.push(videoType);
    }

    if (query) {
      conditions.push('(title LIKE ? OR description LIKE ?)');
      const searchPattern = `%${query}%`;
      params.push(searchPattern, searchPattern);
    }

    const whereClause =
      conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    const [rows] = await pool.execute<LessonRow[]>(
      `SELECT id, title, description, level, video_url, video_type, order_num, created_at 
       FROM lessons ${whereClause}        ORDER BY 
          CASE LOWER(level)
            WHEN 'n5' THEN 1
            WHEN 'n4' THEN 2
            WHEN 'n3' THEN 3
            WHEN 'n2' THEN 4
            WHEN 'n1' THEN 5
            ELSE 6
          END ASC,
          order_num ASC, 
          id ASC`,
      params,
    );

    return NextResponse.json({
      lessons: rows,
      total: rows.length,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Database error';
    console.error('Error fetching lessons in admin:', error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as {
      title?: string;
      description?: string;
      level?: string;
      video_url?: string;
      video_type?: string;
      order_num?: number | string;
    };
    const { title, description, level, video_url, video_type, order_num } =
      body;

    if (!title || !video_url) {
      return NextResponse.json(
        { error: 'Vui lòng cung cấp tiêu đề và đường dẫn video' },
        { status: 400 },
      );
    }

    const safeVideoType: VideoType = VALID_VIDEO_TYPES.includes(
      video_type as VideoType,
    )
      ? (video_type as VideoType)
      : 'grammar';

    const pool = getDbPool();
    const [result] = await pool.execute<ResultSetHeader>(
      `INSERT INTO lessons (title, description, level, video_url, video_type, order_num) 
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        title.trim(),
        description ? description.trim() : null,
        (level || 'n5').toLowerCase(),
        video_url.trim(),
        safeVideoType,
        Number(order_num) || 1,
      ],
    );

    return NextResponse.json({
      success: true,
      id: result.insertId,
      message: 'Thêm bài giảng mới thành công',
    });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : 'Lỗi khi thêm bài giảng';
    console.error('Error creating lesson:', error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = (await request.json()) as {
      id?: number;
      title?: string;
      description?: string;
      level?: string;
      video_url?: string;
      video_type?: string;
      order_num?: number | string;
    };
    const { id, title, description, level, video_url, video_type, order_num } =
      body;

    if (!id || !title || !video_url) {
      return NextResponse.json(
        { error: 'Vui lòng cung cấp ID, tiêu đề và link video' },
        { status: 400 },
      );
    }

    const safeVideoType: VideoType = VALID_VIDEO_TYPES.includes(
      video_type as VideoType,
    )
      ? (video_type as VideoType)
      : 'grammar';

    const pool = getDbPool();
    const [result] = await pool.execute<ResultSetHeader>(
      `UPDATE lessons 
       SET title = ?, description = ?, level = ?, video_url = ?, video_type = ?, order_num = ? 
       WHERE id = ?`,
      [
        title.trim(),
        description ? description.trim() : null,
        (level || 'n5').toLowerCase(),
        video_url.trim(),
        safeVideoType,
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
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : 'Lỗi khi cập nhật bài giảng';
    console.error('Error updating lesson:', error);
    return NextResponse.json({ error: message }, { status: 500 });
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
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : 'Lỗi khi xóa bài giảng';
    console.error('Error deleting lesson:', error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
