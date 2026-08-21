import createMiddleware from 'next-intl/middleware';
import { NextRequest, NextResponse } from 'next/server';
import { routing } from './core/i18n/routing';
import {
  getCanonicalNoPrefixPath,
  hasLocalePrefix,
  isTranslatorPath,
} from './shared/utils/translator-routing';

import { verifyJwt } from './shared/utils/auth';

// Create intl middleware once at module level (more efficient)
const intlMiddleware = createMiddleware(routing);
const translatorMiddleware = createMiddleware({
  ...routing,
  localeDetection: false,
  alternateLinks: false,
});

export default async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Force HTTPS and www in production
  if (process.env.NODE_ENV === 'production') {
    const host = request.headers.get('host') ?? '';

    // Check multiple headers — Railway / proxies may use different ones
    const proto =
      request.headers.get('x-forwarded-proto') ??
      request.headers.get('x-scheme') ??
      (request.headers.get('x-forwarded-ssl') === 'on' ? 'https' : null) ??
      (request.headers.get('front-end-https') === 'on' ? 'https' : null) ??
      'http';

    const isHttps = proto === 'https';
    const isWww = host.startsWith('www.');

    if (!isHttps || !isWww) {
      const canonicalUrl = request.nextUrl.clone();
      canonicalUrl.protocol = 'https:';
      canonicalUrl.host = isWww ? host : `www.${host}`;
      return NextResponse.redirect(canonicalUrl, { status: 301 });
    }
  }

  // Fast path - skip for paths that don't need locale handling or auth protection
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.startsWith('/_vercel') ||
    pathname.startsWith('/monitoring') ||
    pathname.startsWith('/healthcheck') ||
    pathname.includes('.')
  ) {
    return NextResponse.next();
  }

  // 1. Session verification
  const token = request.cookies.get('auth_token')?.value;
  let user = null;
  if (token) {
    user = await verifyJwt(token);
  }

  const canonicalPath = hasLocalePrefix(pathname)
    ? getCanonicalNoPrefixPath(pathname)
    : pathname;

  const isAuthPage =
    canonicalPath === '/login' ||
    canonicalPath === '/register' ||
    canonicalPath === '/forgot-password' ||
    canonicalPath === '/reset-password';
  const isPublicPage =
    canonicalPath === '/' ||
    canonicalPath === '/about' ||
    canonicalPath === '/privacy' ||
    canonicalPath === '/terms' ||
    canonicalPath === '/credits' ||
    canonicalPath === '/faq' ||
    canonicalPath === '/how-to-use' ||
    canonicalPath === '/patch-notes' ||
    canonicalPath.startsWith('/kana') ||
    canonicalPath.startsWith('/kanji') ||
    canonicalPath.startsWith('/vocabulary') ||
    canonicalPath.startsWith('/translate') ||
    canonicalPath.startsWith('/conjugate') ||
    canonicalPath.startsWith('/academy') ||
    canonicalPath.startsWith('/resources') ||
    canonicalPath.startsWith('/preferences') ||
    canonicalPath.startsWith('/progress') ||
    canonicalPath.startsWith('/zen') ||
    canonicalPath.startsWith('/anki-converter');

  // Redirect if not authenticated
  if (!user && !isAuthPage && !isPublicPage) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = '/login';
    // Preserve original path to redirect back after successful login
    redirectUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(redirectUrl);
  }

  // Redirect if already authenticated and trying to access auth pages
  if (user && isAuthPage) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = '/';
    return NextResponse.redirect(redirectUrl);
  }

  if (hasLocalePrefix(pathname)) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = getCanonicalNoPrefixPath(pathname);
    return NextResponse.redirect(redirectUrl, 308);
  }

  // Derive locale from cookie
  const cookieLocale = request.cookies.get('NEXT_LOCALE')?.value;
  const locale =
    cookieLocale === 'es' || cookieLocale === 'en' || cookieLocale === 'vi'
      ? cookieLocale
      : 'vi';

  if (isTranslatorPath(pathname)) {
    const response = translatorMiddleware(request);
    response.headers.set('x-locale', locale);
    return response;
  }

  // Use next-intl middleware for locale handling
  const response = intlMiddleware(request);
  response.headers.set('x-locale', locale);

  return response;
}

export const config = {
  // More restrictive matcher - only match actual page routes
  // Excludes: api, _next, _vercel, static files, and common bot endpoints
  matcher: ['/((?!api|_next|_vercel|monitoring|healthcheck|.*\\..*).*)'],
};
