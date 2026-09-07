import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

interface CacheEntry {
  available: boolean;
  reason?: string;
  timestamp: number;
}

const cache = new Map<string, CacheEntry>();
const CACHE_TTL = 60 * 1000; // 1 minute

export async function verifyVideoUrl(
  url: string,
): Promise<{ available: boolean; reason?: string }> {
  const trimmed = (url || '').trim();
  if (!trimmed) {
    return { available: false, reason: 'empty_url' };
  }

  // 1. Google Drive
  const driveMatch1 = trimmed.match(
    /drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)/i,
  );
  const driveMatch2 = trimmed.match(
    /drive\.google\.com\/open\?id=([a-zA-Z0-9_-]+)/i,
  );
  const driveId = driveMatch1?.[1] || driveMatch2?.[1];

  if (driveId) {
    try {
      const driveUrl = `https://drive.google.com/file/d/${driveId}/preview`;
      const res = await fetch(driveUrl, {
        method: 'HEAD',
        redirect: 'manual',
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        },
      });

      if (res.status === 200) {
        return { available: true };
      }

      if (res.status === 302) {
        const location = res.headers.get('location') || '';
        if (
          location.includes('accounts.google.com') ||
          location.includes('ServiceLogin')
        ) {
          return { available: false, reason: 'private_or_not_shared' };
        }
        return { available: true };
      }

      return { available: false, reason: 'not_found' };
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'fetch_error';
      return { available: false, reason: msg };
    }
  }

  // 2. YouTube
  const ytMatch = trimmed.match(
    /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/i,
  );
  const ytId = ytMatch?.[1];
  if (ytId) {
    try {
      const ytUrl = `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${ytId}&format=json`;
      const res = await fetch(ytUrl, { method: 'GET' });
      return res.ok
        ? { available: true }
        : { available: false, reason: 'youtube_unavailable' };
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'fetch_error';
      return { available: false, reason: msg };
    }
  }

  // 3. Generic URL
  try {
    const res = await fetch(trimmed, {
      method: 'HEAD',
      redirect: 'follow',
    });
    return { available: res.ok };
  } catch {
    return { available: true };
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const url = searchParams.get('url');
  const bypassCache = searchParams.get('fresh') === 'true';

  if (!url) {
    return NextResponse.json(
      { available: false, reason: 'missing_url' },
      { status: 400 },
    );
  }

  const now = Date.now();
  const cached = cache.get(url);

  if (!bypassCache && cached && now - cached.timestamp < CACHE_TTL) {
    return NextResponse.json({
      available: cached.available,
      reason: cached.reason,
      cached: true,
    });
  }

  const result = await verifyVideoUrl(url);

  cache.set(url, {
    available: result.available,
    reason: result.reason,
    timestamp: now,
  });

  return NextResponse.json({
    available: result.available,
    reason: result.reason,
    cached: false,
  });
}
