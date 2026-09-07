import { NextRequest, NextResponse } from 'next/server';

/**
 * GET /api/video/stream?id=DRIVE_FILE_ID
 *
 * Server-side proxy that streams a public Google Drive video to the client.
 * Handles:
 *  - Large file confirmation page (virus-scan warning)
 *  - Range requests for seeking
 *  - CORS headers
 */

const BROWSER_UA =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const fileId = searchParams.get('id');

  if (!fileId || !/^[a-zA-Z0-9_-]+$/.test(fileId)) {
    return new NextResponse('Missing or invalid file id', { status: 400 });
  }

  const rangeHeader = req.headers.get('range');

  const baseHeaders: HeadersInit = {
    'User-Agent': BROWSER_UA,
    Accept: 'video/*,*/*;q=0.8',
    'Accept-Encoding': 'identity',
  };
  if (rangeHeader) baseHeaders['Range'] = rangeHeader;

  // ── Step 1: Try the usercontent URL (newest Drive download endpoint) ──
  // This handles both small and large files automatically.
  const usercontent = `https://drive.usercontent.google.com/download?id=${fileId}&export=download&authuser=0&confirm=t`;

  let res = await safeFetch(usercontent, baseHeaders);

  // ── Step 2: Fallback to classic uc endpoint ──
  if (!res || (!res.ok && res.status !== 206)) {
    const ucUrl = `https://drive.google.com/uc?export=download&id=${fileId}&confirm=t`;
    res = await safeFetch(ucUrl, baseHeaders);
  }

  if (!res) {
    return new NextResponse('Failed to connect to Google Drive', {
      status: 502,
    });
  }

  // ── Step 3: If we got an HTML page (confirmation / warning), extract real URL ──
  const ct = res.headers.get('content-type') ?? '';
  if (ct.includes('text/html')) {
    const html = await res.text();

    // Pattern 1: newer usercontent confirm link
    const confirmUrl =
      extractHref(
        html,
        /href="(https:\/\/drive\.usercontent\.google\.com\/download[^"]+)"/i,
      ) ||
      // Pattern 2: classic /uc?export=download&confirm=... link
      extractHref(
        html,
        /href="(\/uc\?export=download[^"]+)"/i,
        'https://drive.google.com',
      ) ||
      // Pattern 3: form action with all input fields (fallback)
      buildFormUrl(html, fileId);

    if (!confirmUrl) {
      return new NextResponse('Could not resolve Google Drive download URL', {
        status: 502,
      });
    }

    // Re-use cookies Google gave us
    const cookieHeader = res.headers.get('set-cookie') ?? '';
    const retryHeaders: HeadersInit = { ...baseHeaders, Cookie: cookieHeader };
    res = await safeFetch(confirmUrl, retryHeaders);

    if (!res || (!res.ok && res.status !== 206)) {
      return new NextResponse('Confirmation request failed', { status: 502 });
    }
  }

  if (!res.ok && res.status !== 206) {
    return new NextResponse(`Drive returned ${res.status}`, { status: 502 });
  }

  // ── Step 4: Stream response to client ──
  const respHeaders = new Headers();
  const videoContentType = res.headers.get('content-type') ?? 'video/mp4';
  const contentLength = res.headers.get('content-length');
  const contentRange = res.headers.get('content-range');
  const acceptRanges = res.headers.get('accept-ranges') ?? 'bytes';

  respHeaders.set('Content-Type', videoContentType);
  respHeaders.set('Accept-Ranges', acceptRanges);
  respHeaders.set('Cache-Control', 'public, max-age=3600');
  respHeaders.set('Access-Control-Allow-Origin', '*');
  if (contentLength) respHeaders.set('Content-Length', contentLength);
  if (contentRange) respHeaders.set('Content-Range', contentRange);

  return new NextResponse(res.body, {
    status: res.status === 206 ? 206 : 200,
    headers: respHeaders,
  });
}

/* ── helpers ── */

async function safeFetch(
  url: string,
  headers: HeadersInit,
): Promise<Response | null> {
  try {
    return await fetch(url, { headers, redirect: 'follow' });
  } catch {
    return null;
  }
}

function extractHref(
  html: string,
  pattern: RegExp,
  prefix = '',
): string | null {
  const m = html.match(pattern);
  if (!m) return null;
  const href = m[1].replace(/&amp;/g, '&');
  return prefix ? `${prefix}${href}` : href;
}

/** Last-resort: build confirm URL from Google's download warning form fields */
function buildFormUrl(html: string, fileId: string): string | null {
  const confirmMatch = html.match(/name="confirm"\s+value="([^"]+)"/i);
  const uuidMatch = html.match(/name="uuid"\s+value="([^"]+)"/i);
  if (!confirmMatch) return null;
  const confirm = confirmMatch[1];
  const uuid = uuidMatch?.[1] ?? '';
  return `https://drive.google.com/uc?export=download&id=${fileId}&confirm=${confirm}&uuid=${uuid}`;
}
