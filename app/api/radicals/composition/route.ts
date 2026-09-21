import { NextRequest, NextResponse } from 'next/server';
import { readFileSync } from 'fs';
import { join } from 'path';
import type { IKanjiComposition } from '@/entities/radical';

let cachedCompositions: IKanjiComposition[] | null = null;

function loadCompositions(): IKanjiComposition[] {
  if (cachedCompositions) return cachedCompositions;
  const filePath = join(
    process.cwd(),
    'public',
    'data-kanji',
    'radical_kanji_map.json',
  );
  const fileContent = readFileSync(filePath, 'utf-8');
  cachedCompositions = JSON.parse(fileContent) as IKanjiComposition[];
  return cachedCompositions;
}

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const kanji = searchParams.get('kanji')?.trim();
    const radicalsParam = searchParams.get('radicals')?.trim();

    const compositions = loadCompositions();

    if (kanji) {
      const match = compositions.find(c => c.kanji === kanji);
      if (!match) {
        return NextResponse.json(
          { error: 'Kanji composition not found', kanji },
          { status: 404 },
        );
      }
      return NextResponse.json(match, {
        headers: {
          'Cache-Control': 'public, max-age=60, stale-while-revalidate=600',
        },
      });
    }

    if (radicalsParam) {
      const selectedRadicals = radicalsParam
        .split(',')
        .map(r => r.trim())
        .filter(Boolean);
      // Filter compositions containing ALL selected radicals (or matching IDs)
      const matches = compositions.filter(c => {
        return selectedRadicals.every(
          selected =>
            c.radicals.includes(selected) ||
            c.radicalIds.some(id => String(id) === selected) ||
            c.radicalNames.some(name => name.includes(selected)),
        );
      });

      return NextResponse.json(matches, {
        headers: {
          'Cache-Control':
            'public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800',
        },
      });
    }

    return NextResponse.json(compositions, {
      headers: {
        'Cache-Control':
          'public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800',
      },
    });
  } catch (error) {
    console.error('Error serving kanji composition:', error);
    return NextResponse.json(
      { error: 'Failed to load compositions' },
      { status: 500 },
    );
  }
}
