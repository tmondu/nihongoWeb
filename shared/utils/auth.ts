import crypto from 'crypto';

const JWT_SECRET =
  process.env.JWT_SECRET ||
  'your-default-jwt-secret-key-change-this-in-production';

// Password hashing using Node.js scrypt (Only run on Server/Node runtime)
export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.scryptSync(password, salt, 64).toString('hex');
  return `${salt}:${hash}`;
}

export function verifyPassword(password: string, storedHash: string): boolean {
  const parts = storedHash.split(':');
  if (parts.length !== 2) return false;
  const [salt, hash] = parts;
  const verifyHash = crypto.scryptSync(password, salt, 64).toString('hex');
  return crypto.timingSafeEqual(
    Buffer.from(hash, 'hex'),
    Buffer.from(verifyHash, 'hex'),
  );
}

// Helpers for Base64URL encoding/decoding (Safe for Node & Edge Runtime)
function arrayBufferToBase64Url(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  const base64 = btoa(binary);
  return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
}

function base64UrlToArrayBuffer(base64Url: string): ArrayBuffer {
  let base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
  while (base64.length % 4) {
    base64 += '=';
  }
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes.buffer;
}

// JWT sign using Web Crypto subtle API (Compatible with Next.js Middleware/Edge Runtime)
export async function signJwt(
  payload: Record<string, unknown>,
  expiresInSeconds = 86400 * 7,
): Promise<string> {
  const header = { alg: 'HS256', typ: 'JWT' };
  const exp = Math.floor(Date.now() / 1000) + expiresInSeconds;
  const body = { ...payload, exp };

  const base64Header = btoa(JSON.stringify(header))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');
  const base64Body = btoa(JSON.stringify(body))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');

  const encoder = new TextEncoder();
  const keyData = encoder.encode(JWT_SECRET);
  const messageData = encoder.encode(`${base64Header}.${base64Body}`);

  const key = await crypto.subtle.importKey(
    'raw',
    keyData,
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  );

  const signatureBuffer = await crypto.subtle.sign('HMAC', key, messageData);
  const signature = arrayBufferToBase64Url(signatureBuffer);

  return `${base64Header}.${base64Body}.${signature}`;
}

// JWT verify using Web Crypto subtle API (Compatible with Next.js Middleware/Edge Runtime)
export async function verifyJwt(
  token: string,
): Promise<Record<string, unknown> | null> {
  const parts = token.split('.');
  if (parts.length !== 3) return null;

  const [header, body, signature] = parts;

  const encoder = new TextEncoder();
  const keyData = encoder.encode(JWT_SECRET);
  const messageData = encoder.encode(`${header}.${body}`);
  const signatureData = base64UrlToArrayBuffer(signature);

  try {
    const key = await crypto.subtle.importKey(
      'raw',
      keyData,
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['verify'],
    );

    const isValid = await crypto.subtle.verify(
      'HMAC',
      key,
      signatureData,
      messageData,
    );
    if (!isValid) return null;

    const payload = JSON.parse(
      atob(body.replace(/-/g, '+').replace(/_/g, '/')),
    );
    if (payload.exp && Date.now() / 1000 > payload.exp) {
      return null; // Token expired
    }

    return payload;
  } catch (err) {
    console.error('JWT verification failed:', err);
    return null;
  }
}
