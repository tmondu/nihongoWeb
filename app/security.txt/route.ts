import { NextResponse } from 'next/server';

/**
 * Security.txt route handler
 * Serves security policy information at /.well-known/security.txt and /security.txt
 * https://securitytxt.org/
 */
export async function GET() {
  const securityTxt = `Contact: https://github.com/tmondu/nihongoWeb/security
Contact: mailto:security@www.pthamnihongo.site
Expires: 2026-12-31T23:59:59.000Z
Preferred-Languages: en, es
Canonical: https://www.pthamnihongo.site/.well-known/security.txt
Policy: https://www.pthamnihongo.site/security
Acknowledgments: https://www.pthamnihongo.site/credits

# Security Policy for PThamSS
# If you discover a security vulnerability, please report it responsibly.
# See our security policy at https://www.pthamnihongo.site/security for details.`;

  return new NextResponse(securityTxt, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=86400', // Cache for 1 day
    },
  });
}
