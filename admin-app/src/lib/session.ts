// Signed admin session token. Web Crypto only, so it runs in middleware (edge) and routes.
// Secret: ADMIN_SESSION_SECRET, falls back to ADMIN_PASSWORD. No secret = nobody is valid.
export const ADMIN_SESSION_COOKIE = 'mondu_admin_session';
export const SESSION_MAX_AGE = 60 * 60 * 24 * 7; // 7 days

const enc = new TextEncoder();

function getSecret(): string | null {
  return process.env.ADMIN_SESSION_SECRET || process.env.ADMIN_PASSWORD || null;
}

async function sign(payload: string, secret: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    'raw',
    enc.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  );
  const sig = await crypto.subtle.sign('HMAC', key, enc.encode(payload));
  return Array.from(new Uint8Array(sig), b =>
    b.toString(16).padStart(2, '0'),
  ).join('');
}

function safeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

export async function createSessionToken(username: string): Promise<string> {
  const secret = getSecret();
  if (!secret) throw new Error('ADMIN_SESSION_SECRET / ADMIN_PASSWORD not set');
  const exp = Math.floor(Date.now() / 1000) + SESSION_MAX_AGE;
  const payload = `${encodeURIComponent(username)}.${exp}`;
  return `${payload}.${await sign(payload, secret)}`;
}

/** Returns the username if the token is validly signed and not expired, else null. */
export async function verifySessionToken(
  token: string | undefined,
): Promise<string | null> {
  const secret = getSecret();
  if (!token || !secret) return null;
  const parts = token.split('.');
  if (parts.length !== 3) return null;
  const [user, exp, sig] = parts;
  if (!(Number(exp) > Date.now() / 1000)) return null;
  const expected = await sign(`${user}.${exp}`, secret);
  if (!safeEqual(sig, expected)) return null;
  return decodeURIComponent(user);
}
