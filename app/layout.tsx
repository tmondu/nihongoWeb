import { Analytics } from '@vercel/analytics/next';
import { SpeedInsights } from '@vercel/speed-insights/next';
import './globals.css';
import '@fortawesome/fontawesome-svg-core/styles.css';
import GoogleAnalytics from '@/core/analytics/GoogleAnalytics';
import MSClarity from '@/core/analytics/MSClarity';
import {
  StructuredData,
  kanaDojoSchema,
} from '@/shared/ui-composite/SEO/StructuredData';
import { Metadata, Viewport } from 'next';
import Script from 'next/script';
import { headers } from 'next/headers';
import SessionPrefetch from '@/shared/ui-composite/Performance/SessionPrefetch';
import SecurityGuard from '@/shared/ui-composite/Security/SecurityGuard';
import CustomContextMenu from '@/shared/ui-composite/Security/CustomContextMenu';

const googleVerificationToken = process.env.GOOGLE_VERIFICATION_TOKEN || '';
const msVerificationToken = process.env.MS_VERIFICATION_TOKEN || '';
const SITE_URL = process.env.SITE_URL || 'https://www.pthamnihongo.site';

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1.0,
  maximumScale: 5.0,
  userScalable: true,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#000000' },
  ],
};

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  manifest: '/manifest.json',
  title: {
    default:
      'PThamSS - Học tiếng Nhật Hiragana, Katakana, Kanji & Từ vựng trực tuyến',
    template: '%s | PThamSS',
  },
  description:
    'Làm chủ tiếng Nhật cùng PThamSS - một nền tảng học tập vui vẻ, thẩm mỹ, tối giản dành cho Hiragana, Katakana, Kanji và Từ vựng. Luyện tập với các trò chơi tương tác, theo dõi tiến trình và cá nhân hóa trải nghiệm của bạn với hơn 100 chủ đề.',
  icons: {
    icon: [
      { url: '/favicon.ico?v=2' },
      { url: '/favicon.ico?v=2', sizes: '16x16', type: 'image/x-icon' },
      { url: '/favicon.ico?v=2', sizes: '32x32', type: 'image/x-icon' },
    ],
    shortcut: '/favicon.ico?v=2',
    apple: '/favicon.ico?v=2',
  },
  verification: {
    google: googleVerificationToken,
    other: {
      'msvalidate.01': msVerificationToken,
      'msapplication-TileColor': '#667eea',
      'msapplication-config': '/browserconfig.xml',
    },
  },
  keywords: [
    'học tiếng nhật',
    'tự học tiếng nhật',
    'học hiragana trực tuyến',
    'học katakana miễn phí',
    'học kana nhanh',
    'học kanji miễn phí',
    'từ vựng tiếng nhật',
    'luyện tập hiragana',
    'luyện tập katakana',
    'ứng dụng luyện kanji',
    'tiếng nhật cơ bản',
    'hệ thống chữ viết tiếng nhật',
    'luyện thi JLPT',
    'công cụ học tiếng nhật',
    'bài học tiếng nhật miễn phí',
    'thamlet',
    'shadowing tiếng nhật',
    'flashcard tiếng nhật',
    'trò chơi tiếng nhật',
  ],
  authors: [{ name: 'PThamSS', url: SITE_URL }],
  creator: 'PThamSS',
  publisher: 'PThamSS',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    title: 'PThamSS - Học tiếng Nhật Hiragana, Katakana, Kanji & Từ vựng',
    description:
      'Làm chủ tiếng Nhật cùng PThamSS - một nền tảng học tập vui vẻ, thẩm mỹ, tối giản dành cho Hiragana, Katakana, Kanji và Từ vựng. Luyện tập với các trò chơi tương tác, theo dõi tiến trình và cá nhân hóa trải nghiệm của bạn với hơn 100 chủ đề.',
    url: SITE_URL,
    siteName: 'PThamSS',
    type: 'website',
    locale: 'vi_VN',
    alternateLocale: ['en_US', 'es_ES'],
  },
  twitter: {
    card: 'summary',
    title: 'PThamSS - Học tiếng Nhật trực tuyến',
    description:
      'Làm chủ tiếng Nhật Hiragana, Katakana, Kanji & Từ vựng với các trò chơi tương tác, flashcard và giao diện tuyệt đẹp.',
    creator: '@ptham',
  },
  alternates: {
    canonical: SITE_URL,
  },
  robots: {
    index: true,
    follow: true,
    nocache: false,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  category: 'education',
};

// Move analytics condition to a constant to avoid repeated evaluation
const isAnalyticsEnabled =
  process.env.NODE_ENV === 'production' &&
  process.env.ANALYTICS_DISABLED !== 'true';

interface RootLayoutProps {
  readonly children: React.ReactNode;
}

export default async function RootLayout({ children }: RootLayoutProps) {
  // Trigger rebuild: 2025-12-31
  // Get locale from middleware header
  const headersList = await headers();
  const locale = headersList.get('x-locale') || 'vi';

  return (
    <html lang={locale} suppressHydrationWarning>
      <head>
        <StructuredData data={kanaDojoSchema} />
        {/* DNS prefetch for external domains - resolve DNS early */}
        {isAnalyticsEnabled && (
          <>
            <link rel='dns-prefetch' href='https://www.googletagmanager.com' />
            <link rel='dns-prefetch' href='https://www.clarity.ms' />
            <link rel='dns-prefetch' href='https://vercel-analytics.com' />
            <link
              rel='dns-prefetch'
              href='https://vitals.vercel-insights.com'
            />
          </>
        )}
        <link rel='dns-prefetch' href='https://translation.googleapis.com' />
        {/* Preconnect to critical domains - establish early connections */}
        {isAnalyticsEnabled && (
          <>
            <link
              rel='preconnect'
              href='https://www.googletagmanager.com'
              crossOrigin='anonymous'
            />
            <link
              rel='preconnect'
              href='https://vercel-analytics.com'
              crossOrigin='anonymous'
            />
          </>
        )}
        <link
          rel='preconnect'
          href='https://translation.googleapis.com'
          crossOrigin='anonymous'
        />
        <Script
          async
          src='https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-4838010337597054'
          crossOrigin='anonymous'
          strategy='afterInteractive'
        />
        <script
          id='theme-init'
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var raw = localStorage.getItem('theme-css-cache');
                  var root = document.documentElement;
                  if (raw) {
                    var theme = JSON.parse(raw);
                    if (theme.id) {
                      root.setAttribute('data-theme', theme.id);
                    }
                    for (var k in theme) {
                      if (k !== 'id' && theme[k]) {
                        var cssKey = '--' + k.replace(/([A-Z])/g, '-$1').toLowerCase();
                        root.style.setProperty(cssKey, theme[k]);
                      }
                    }
                  } else {
                    var pref = localStorage.getItem('theme-storage');
                    if (pref) {
                      var parsed = JSON.parse(pref);
                      var themeId = parsed && parsed.state && parsed.state.theme;
                      if (themeId) {
                        root.setAttribute('data-theme', themeId);
                      }
                    }
                  }
                } catch(e) {}
              })();
            `,
          }}
        />
      </head>
      <body>
        <Script id='audio-sw-migration' strategy='afterInteractive'>
          {`try {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker
      .getRegistrations()
      .then(function (registrations) {
        return Promise.all(
          registrations
            .filter(function (reg) {
              return (
                reg.active &&
                reg.active.scriptURL.endsWith('/sw.js') &&
                new URL(reg.scope).pathname === '/'
              );
            })
            .map(function (reg) {
              return reg.unregister();
            })
        );
      })
      .catch(function () {});
  }
} catch (_) {}`}
        </Script>
        <SessionPrefetch />
        {isAnalyticsEnabled && (
          <>
            <GoogleAnalytics />
            <MSClarity />
            <Analytics />
            <SpeedInsights />
          </>
        )}
        <SecurityGuard />
        <CustomContextMenu />
        <noscript>
          <div
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              width: '100vw',
              height: '100vh',
              backgroundColor: '#0a0a0f',
              color: '#ffffff',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 9999999,
              textAlign: 'center',
              padding: '24px',
              fontFamily: 'system-ui, -apple-system, sans-serif',
            }}
          >
            <h1
              style={{
                fontSize: '24px',
                fontWeight: 'bold',
                marginBottom: '12px',
              }}
            >
              JavaScript bị vô hiệu hoá
            </h1>
            <p
              style={{ fontSize: '15px', color: '#a0a0b0', maxWidth: '400px' }}
            >
              PThamSS là ứng dụng tương tác học tiếng Nhật yêu cầu bật
              JavaScript để hoạt động. Vui lòng bật lại JavaScript trong cài đặt
              trình duyệt để tiếp tục.
            </p>
          </div>
        </noscript>
        {children}
      </body>
    </html>
  );
}
