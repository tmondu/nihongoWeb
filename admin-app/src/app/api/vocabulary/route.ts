import { NextRequest, NextResponse } from 'next/server';
import { getDbPool } from '@/lib/db';
import { RowDataPacket, ResultSetHeader } from 'mysql2';

export const dynamic = 'force-dynamic';

interface VocabRow extends RowDataPacket {
  id: number;
  level: string;
  jmdict_seq: string;
  kana: string;
  kanji: string | null;
  waller_definition: string;
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
        '(kana LIKE ? OR kanji LIKE ? OR waller_definition LIKE ? OR jmdict_seq LIKE ?)',
      );
      const searchPattern = `%${query}%`;
      params.push(searchPattern, searchPattern, searchPattern, searchPattern);
    }

    const whereClause =
      conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    // 1. Get total count
    const [countRows] = await pool.execute<CountRow[]>(
      `SELECT COUNT(*) as total FROM vocabularies ${whereClause}`,
      params,
    );
    const total = countRows[0]?.total ?? 0;

    // 2. Get paginated records
    const [rows] = await pool.execute<VocabRow[]>(
      `SELECT id, level, jmdict_seq, kana, kanji, waller_definition 
       FROM vocabularies ${whereClause} 
       ORDER BY id ASC 
       LIMIT ? OFFSET ?`,
      [...params, limit.toString(), offset.toString()],
    );

    return NextResponse.json({
      vocabularies: rows,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error('Error fetching vocabulary in admin API:', error);
    return NextResponse.json({ error: 'Database error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { level, jmdict_seq, kana, kanji, waller_definition } = body;

    if (!level || !jmdict_seq || !kana || !waller_definition) {
      return NextResponse.json(
        { error: 'Vui lòng điền đầy đủ các thông tin bắt buộc' },
        { status: 400 },
      );
    }

    const pool = getDbPool();
    const [result] = await pool.execute<ResultSetHeader>(
      `INSERT INTO vocabularies (level, jmdict_seq, kana, kanji, waller_definition) 
       VALUES (?, ?, ?, ?, ?)`,
      [level.toLowerCase(), jmdict_seq, kana, kanji || null, waller_definition],
    );

    return NextResponse.json({
      success: true,
      id: result.insertId,
      message: 'Thêm từ vựng mới thành công',
    });
  } catch (error: any) {
    console.error('Error creating vocabulary:', error);
    return NextResponse.json(
      { error: error.message || 'Lỗi khi thêm từ vựng' },
      { status: 500 },
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, level, jmdict_seq, kana, kanji, waller_definition } = body;

    if (!id || !level || !jmdict_seq || !kana || !waller_definition) {
      return NextResponse.json(
        { error: 'Vui lòng cung cấp ID và đầy đủ thông tin cập nhật' },
        { status: 400 },
      );
    }

    const pool = getDbPool();
    const [result] = await pool.execute<ResultSetHeader>(
      `UPDATE vocabularies 
       SET level = ?, jmdict_seq = ?, kana = ?, kanji = ?, waller_definition = ? 
       WHERE id = ?`,
      [
        level.toLowerCase(),
        jmdict_seq,
        kana,
        kanji || null,
        waller_definition,
        id,
      ],
    );

    if (result.affectedRows === 0) {
      return NextResponse.json(
        { error: 'Không tìm thấy từ vựng để cập nhật' },
        { status: 404 },
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Cập nhật từ vựng thành công',
    });
  } catch (error: any) {
    console.error('Error updating vocabulary:', error);
    return NextResponse.json(
      { error: error.message || 'Lỗi khi cập nhật từ vựng' },
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
      'DELETE FROM vocabularies WHERE id = ?',
      [id],
    );

    if (result.affectedRows === 0) {
      return NextResponse.json(
        { error: 'Không tìm thấy từ vựng cần xóa' },
        { status: 404 },
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Đã xóa từ vựng thành công',
    });
  } catch (error: any) {
    console.error('Error deleting vocabulary:', error);
    return NextResponse.json(
      { error: error.message || 'Lỗi khi xóa từ vựng' },
      { status: 500 },
    );
  }
}
