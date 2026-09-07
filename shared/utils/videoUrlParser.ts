/**
 * Utility to parse and format video URLs for embedding (Google Drive & YouTube)
 */

export interface ParsedVideo {
  type: 'drive' | 'youtube' | 'generic';
  embedUrl: string;
  originalUrl: string;
}

export function parseVideoEmbedUrl(rawUrl: string): ParsedVideo {
  const url = (rawUrl || '').trim();

  // 1. Google Drive
  // Patterns:
  // - https://drive.google.com/file/d/{FILE_ID}/view...
  // - https://drive.google.com/file/d/{FILE_ID}/preview
  // - https://drive.google.com/open?id={FILE_ID}
  const driveMatch1 = url.match(
    /drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)/i,
  );
  const driveMatch2 = url.match(
    /drive\.google\.com\/open\?id=([a-zA-Z0-9_-]+)/i,
  );
  const driveId = driveMatch1?.[1] || driveMatch2?.[1];

  if (driveId) {
    return {
      type: 'drive',
      embedUrl: `https://drive.google.com/file/d/${driveId}/preview`,
      originalUrl: url,
    };
  }

  // 2. YouTube
  // Patterns:
  // - https://www.youtube.com/watch?v={VIDEO_ID}
  // - https://youtu.be/{VIDEO_ID}
  // - https://www.youtube.com/embed/{VIDEO_ID}
  const youtubeMatch = url.match(
    /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/i,
  );
  const youtubeId = youtubeMatch?.[1];

  if (youtubeId) {
    return {
      type: 'youtube',
      embedUrl: `https://www.youtube-nocookie.com/embed/${youtubeId}?rel=0`,
      originalUrl: url,
    };
  }

  // 3. Fallback generic embed URL
  return {
    type: 'generic',
    embedUrl: url,
    originalUrl: url,
  };
}
