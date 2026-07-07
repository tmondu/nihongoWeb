import createMiddleware from 'next-intl/middleware';
import { NextRequest, NextResponse } from 'next/server';
import { routing } from './core/i18n/routing';
import {
  getCanonicalNoPrefixPath,
  hasLocalePrefix,
  isTranslatorPath,
} from './shared/utils/translator-routing';

// Create intl middleware once at module level (more efficient)
const intlMiddleware = createMiddleware(routing);
const translatorMiddleware = createMiddleware({
  ...routing,
  localeDetection: false,
  alternateLinks: false,
});

export default function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Fast path - skip for paths that don't need locale handling
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

  if (hasLocalePrefix(pathname)) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = getCanonicalNoPrefixPath(pathname);
    return NextResponse.redirect(redirectUrl, 308);
  }

  // Derive locale from cookie
  const cookieLocale = request.cookies.get('NEXT_LOCALE')?.value;
  const locale = cookieLocale === 'es' || cookieLocale === 'en' || cookieLocale === 'vi'
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
