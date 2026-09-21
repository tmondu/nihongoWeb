import { NextRequest, NextResponse } from 'next/server';
import { readFileSync } from 'fs';
import { join } from 'path';
import type { IRadical, RadicalLayer } from '@/entities/radical';

let cachedRadicals: IRadical[] | null = null;

function loadRadicals(): IRadical[] {
  if (cachedRadicals) return cachedRadicals;
  const filePath = join(process.cwd(), 'public', 'data-kanji', 'radicals.json');
  const fileContent = readFileSync(filePath, 'utf-8');
  cachedRadicals = JSON.parse(fileContent) as IRadical[];
  return cachedRadicals;
}

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const layer = searchParams.get('layer')?.toLowerCase() as
      | RadicalLayer
      | undefined;
    const search = searchParams.get('q')?.toLowerCase()?.trim();
    const stroke = searchParams.get('stroke');

    let radicals = loadRadicals();

    if (layer && ['core', 'extended', 'rare'].includes(layer)) {
      radicals = radicals.filter(r => r.layer === layer);
    }

    if (stroke) {
      const strokeNum = parseInt(stroke, 10);
      if (!isNaN(strokeNum)) {
        radicals = radicals.filter(r => r.strokeCount === strokeNum);
      }
    }

    if (search) {
      radicals = radicals.filter(
        r =>
          r.char.includes(search) ||
          r.altForms.some(a => a.includes(search)) ||
          r.hanviet.toLowerCase().includes(search) ||
          r.meaning_vi.toLowerCase().includes(search) ||
          r.meaning_en.toLowerCase().includes(search),
      );
    }

    return NextResponse.json(radicals, {
      headers: {
        'Cache-Control':
          'public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800',
        'X-Cache': 'HIT',
      },
    });
  } catch (error) {
    console.error('Error serving radicals:', error);
    return NextResponse.json(
      { error: 'Failed to load radicals' },
      { status: 500 },
    );
  }
}
