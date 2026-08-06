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

    let countQuery = 'SELECT COUNT(*) as count FROM kanjis';
    let selectQuery =
      'SELECT id, level, original_id, kanji_char, onyomi, kunyomi, meanings, is_decoration FROM kanjis';
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
        '(kanji_char LIKE ? OR onyomi LIKE ? OR kunyomi LIKE ? OR meanings LIKE ?)',
      );
      const wildQuery = `%${query}%`;
      params.push(wildQuery, wildQuery, wildQuery, wildQuery);
      countParams.push(wildQuery, wildQuery, wildQuery, wildQuery);
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
    const [rows] = await pool.execute<RowDataPacket[]>(selectQuery, params);

    // Map and safely parse JSON columns
    const kanjis = rows.map(row => {
      let onyomiParsed = [];
      let kunyomiParsed = [];
      let meaningsParsed = [];

      try {
        onyomiParsed =
          typeof row.onyomi === 'string' ? JSON.parse(row.onyomi) : row.onyomi;
      } catch (e) {
        console.error('Failed to parse onyomi JSON:', row.onyomi, e);
      }

      try {
        kunyomiParsed =
          typeof row.kunyomi === 'string'
            ? JSON.parse(row.kunyomi)
            : row.kunyomi;
      } catch (e) {
        console.error('Failed to parse kunyomi JSON:', row.kunyomi, e);
      }

      try {
        meaningsParsed =
          typeof row.meanings === 'string'
            ? JSON.parse(row.meanings)
            : row.meanings;
      } catch (e) {
        console.error('Failed to parse meanings JSON:', row.meanings, e);
      }

      return {
        ...row,
        onyomi: Array.isArray(onyomiParsed) ? onyomiParsed : [],
        kunyomi: Array.isArray(kunyomiParsed) ? kunyomiParsed : [],
        meanings: Array.isArray(meaningsParsed) ? meaningsParsed : [],
      };
    });

    return NextResponse.json({
      kanjis,
      total: countResult[0].count,
      page,
      limit,
    });
  } catch (error) {
    console.error('Failed to fetch kanjis:', error);
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
    const {
      level,
      original_id,
      kanji_char,
      onyomi,
      kunyomi,
      meanings,
      is_decoration,
    } = await request.json();

    if (
      !level ||
      !kanji_char ||
      !Array.isArray(onyomi) ||
      !Array.isArray(kunyomi) ||
      !Array.isArray(meanings)
    ) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 },
      );
    }

    const pool = getDbPool();

    // Check unique kanji_char
    const [existing] = await pool.execute<RowDataPacket[]>(
      'SELECT id FROM kanjis WHERE kanji_char = ?',
      [kanji_char],
    );

    if (existing.length > 0) {
      return NextResponse.json(
        { error: `Chữ Kanji '${kanji_char}' đã tồn tại trong hệ thống.` },
        { status: 400 },
      );
    }

    await pool.execute(
      'INSERT INTO kanjis (level, original_id, kanji_char, onyomi, kunyomi, meanings, is_decoration) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [
        level,
        Number(original_id) || 0,
        kanji_char,
        JSON.stringify(onyomi),
        JSON.stringify(kunyomi),
        JSON.stringify(meanings),
        is_decoration ? 1 : 0,
      ],
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to create kanji:', error);
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
    const {
      id,
      level,
      original_id,
      kanji_char,
      onyomi,
      kunyomi,
      meanings,
      is_decoration,
    } = await request.json();

    if (
      !id ||
      !level ||
      !kanji_char ||
      !Array.isArray(onyomi) ||
      !Array.isArray(kunyomi) ||
      !Array.isArray(meanings)
    ) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 },
      );
    }

    const pool = getDbPool();
    await pool.execute(
      'UPDATE kanjis SET level = ?, original_id = ?, kanji_char = ?, onyomi = ?, kunyomi = ?, meanings = ?, is_decoration = ? WHERE id = ?',
      [
        level,
        Number(original_id) || 0,
        kanji_char,
        JSON.stringify(onyomi),
        JSON.stringify(kunyomi),
        JSON.stringify(meanings),
        is_decoration ? 1 : 0,
        id,
      ],
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to update kanji:', error);
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
    await pool.execute('DELETE FROM kanjis WHERE id = ?', [id]);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to delete kanji:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 },
    );
  }
}
