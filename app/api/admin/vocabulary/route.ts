/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminSession } from '@/shared/infra/server/adminAuth';
import { getDbPool } from '@/shared/infra/server/db';
import { RowDataPacket } from 'mysql2';

export async function GET(request: NextRequest) {
  const admin = await verifyAdminSession(request);
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const pageVal = Number(searchParams.get('page')) || 1;
    const limitVal = Number(searchParams.get('limit')) || 20;
    const level = searchParams.get('level') || '';
    const query = searchParams.get('query') || '';

    const page = Math.max(1, pageVal);
    const limit = Math.max(1, limitVal);
    const offset = (page - 1) * limit;

    const pool = getDbPool();

    let countQuery = 'SELECT COUNT(*) as count FROM vocabularies';
    let selectQuery =
      'SELECT id, level, jmdict_seq, kana, kanji, waller_definition FROM vocabularies';
    const params: any[] = [];
    const countParams: any[] = [];
    const conditions: string[] = [];

    if (level) {
      conditions.push('level = ?');
      params.push(level);
      countParams.push(level);
    }

    if (query) {
      conditions.push(
        '(kana LIKE ? OR kanji LIKE ? OR waller_definition LIKE ?)',
      );
      const wildQuery = `%${query}%`;
      params.push(wildQuery, wildQuery, wildQuery);
      countParams.push(wildQuery, wildQuery, wildQuery);
    }

    if (conditions.length > 0) {
      const condStr = ' WHERE ' + conditions.join(' AND ');
      countQuery += condStr;
      selectQuery += condStr;
    }

    selectQuery += ` ORDER BY id DESC LIMIT ${limit} OFFSET ${offset}`;

    const [countResult] = await pool.execute<RowDataPacket[]>(
      countQuery,
      countParams,
    );
    const [vocabularies] = await pool.execute<RowDataPacket[]>(
      selectQuery,
      params,
    );

    return NextResponse.json({
      vocabularies,
      total: countResult[0].count,
      page,
      limit,
    });
  } catch (error) {
    console.error('Failed to fetch vocabulary:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  const admin = await verifyAdminSession(request);
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { level, jmdict_seq, kana, kanji, waller_definition } =
      await request.json();

    if (!level || !jmdict_seq || !kana || !waller_definition) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 },
      );
    }

    const pool = getDbPool();

    // Check unique key: level + jmdict_seq
    const [existing] = await pool.execute<RowDataPacket[]>(
      'SELECT id FROM vocabularies WHERE level = ? AND jmdict_seq = ?',
      [level, jmdict_seq],
    );

    if (existing.length > 0) {
      return NextResponse.json(
        {
          error: `Từ vựng với mã seq ${jmdict_seq} đã tồn tại trong cấp độ ${level.toUpperCase()}.`,
        },
        { status: 400 },
      );
    }

    await pool.execute(
      'INSERT INTO vocabularies (level, jmdict_seq, kana, kanji, waller_definition) VALUES (?, ?, ?, ?, ?)',
      [level, jmdict_seq, kana, kanji || null, waller_definition],
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to create vocabulary:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 },
    );
  }
}

export async function PUT(request: NextRequest) {
  const admin = await verifyAdminSession(request);
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { id, level, jmdict_seq, kana, kanji, waller_definition } =
      await request.json();

    if (!id || !level || !jmdict_seq || !kana || !waller_definition) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 },
      );
    }

    const pool = getDbPool();
    await pool.execute(
      'UPDATE vocabularies SET level = ?, jmdict_seq = ?, kana = ?, kanji = ?, waller_definition = ? WHERE id = ?',
      [level, jmdict_seq, kana, kanji || null, waller_definition, id],
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to update vocabulary:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 },
    );
  }
}

export async function DELETE(request: NextRequest) {
  const admin = await verifyAdminSession(request);
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Missing id' }, { status: 400 });
    }

    const pool = getDbPool();
    await pool.execute('DELETE FROM vocabularies WHERE id = ?', [id]);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to delete vocabulary:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 },
    );
  }
}
