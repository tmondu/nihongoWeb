import { NextRequest, NextResponse } from 'next/server';
import { getDbPool } from '@/lib/db';
import { RowDataPacket, ResultSetHeader } from 'mysql2';

export const dynamic = 'force-dynamic';

interface KanjiRow extends RowDataPacket {
  id: number;
  level: string;
  original_id: number;
  kanji_char: string;
  onyomi: string | string[];
  kunyomi: string | string[];
  meanings: string | string[];
  is_decoration: number;
}

interface CountRow extends RowDataPacket {
  total: number;
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const page = Math.max(1, Number(searchParams.get('page')) || 1);
  const limit = Math.min(
    100,
    Math.max(1, Number(searchParams.get('limit')) || 25),
  );
  const offset = (page - 1) * limit;

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
      conditions.push(
        '(kanji_char LIKE ? OR onyomi LIKE ? OR kunyomi LIKE ? OR meanings LIKE ?)',
      );
      const searchPattern = `%${query}%`;
      params.push(searchPattern, searchPattern, searchPattern, searchPattern);
    }

    const whereClause =
      conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    const [countRows] = await pool.execute<CountRow[]>(
      `SELECT COUNT(*) as total FROM kanjis ${whereClause}`,
      params,
    );
    const total = countRows[0]?.total ?? 0;

    const [rows] = await pool.execute<KanjiRow[]>(
      `SELECT id, level, original_id, kanji_char, onyomi, kunyomi, meanings, is_decoration 
       FROM kanjis ${whereClause} 
       ORDER BY id ASC 
       LIMIT ? OFFSET ?`,
      [...params, limit.toString(), offset.toString()],
    );

    const kanjis = rows.map(row => ({
      ...row,
      onyomi:
        typeof row.onyomi === 'string'
          ? JSON.parse(row.onyomi || '[]')
          : row.onyomi || [],
      kunyomi:
        typeof row.kunyomi === 'string'
          ? JSON.parse(row.kunyomi || '[]')
          : row.kunyomi || [],
      meanings:
        typeof row.meanings === 'string'
          ? JSON.parse(row.meanings || '[]')
          : row.meanings || [],
    }));

    return NextResponse.json({
      kanjis,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error('Error fetching kanjis in admin API:', error);
    return NextResponse.json({ error: 'Database error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      level,
      original_id,
      kanji_char,
      onyomi,
      kunyomi,
      meanings,
      is_decoration,
    } = body;

    if (!level || !kanji_char || !meanings) {
      return NextResponse.json(
        { error: 'Vui lòng điền đầy đủ các thông tin bắt buộc' },
        { status: 400 },
      );
    }

    const pool = getDbPool();
    const [result] = await pool.execute<ResultSetHeader>(
      `INSERT INTO kanjis (level, original_id, kanji_char, onyomi, kunyomi, meanings, is_decoration) 
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        level.toLowerCase(),
        original_id || 0,
        kanji_char,
        JSON.stringify(onyomi || []),
        JSON.stringify(kunyomi || []),
        JSON.stringify(meanings || []),
        is_decoration ? 1 : 0,
      ],
    );

    return NextResponse.json({
      success: true,
      id: result.insertId,
      message: 'Thêm chữ Kanji mới thành công',
    });
  } catch (error: any) {
    console.error('Error creating kanji:', error);
    return NextResponse.json(
      { error: error.message || 'Lỗi khi thêm chữ Kanji' },
      { status: 500 },
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      id,
      level,
      original_id,
      kanji_char,
      onyomi,
      kunyomi,
      meanings,
      is_decoration,
    } = body;

    if (!id || !level || !kanji_char) {
      return NextResponse.json(
        { error: 'Vui lòng cung cấp ID và đầy đủ thông tin' },
        { status: 400 },
      );
    }

    const pool = getDbPool();
    const [result] = await pool.execute<ResultSetHeader>(
      `UPDATE kanjis 
       SET level = ?, original_id = ?, kanji_char = ?, onyomi = ?, kunyomi = ?, meanings = ?, is_decoration = ? 
       WHERE id = ?`,
      [
        level.toLowerCase(),
        original_id || 0,
        kanji_char,
        JSON.stringify(onyomi || []),
        JSON.stringify(kunyomi || []),
        JSON.stringify(meanings || []),
        is_decoration ? 1 : 0,
        id,
      ],
    );

    if (result.affectedRows === 0) {
      return NextResponse.json(
        { error: 'Không tìm thấy chữ Kanji để cập nhật' },
        { status: 404 },
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Cập nhật chữ Kanji thành công',
    });
  } catch (error: any) {
    console.error('Error updating kanji:', error);
    return NextResponse.json(
      { error: error.message || 'Lỗi khi cập nhật chữ Kanji' },
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
        { error: 'Vui lòng cung cấp ID cần xóa' },
        { status: 400 },
      );
    }

    const pool = getDbPool();
    const [result] = await pool.execute<ResultSetHeader>(
      'DELETE FROM kanjis WHERE id = ?',
      [id],
    );

    if (result.affectedRows === 0) {
      return NextResponse.json(
        { error: 'Không tìm thấy chữ Kanji cần xóa' },
        { status: 404 },
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Đã xóa chữ Kanji thành công',
    });
  } catch (error: any) {
    console.error('Error deleting kanji:', error);
    return NextResponse.json(
      { error: error.message || 'Lỗi khi xóa chữ Kanji' },
      { status: 500 },
    );
  }
}
