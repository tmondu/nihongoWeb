import type { Metadata } from 'next';
import { routing } from '@/core/i18n/routing';

export function generateStaticParams() {
  return routing.locales.map(locale => ({ locale }));
}

export const revalidate = 3600;

export async function generateMetadata(): Promise<Metadata> {
  const title = 'Credits & Data Sources | PThamSS';
  const description =
    'PThamSS uses trusted Japanese language data sources including JMdict, KANJIDIC, and open-source libraries to provide accurate learning tools.';

  return {
    title,
    description,
    keywords: [
      'japanese learning data sources',
      'jmdict',
      'kanjidic',
      'japanese dictionary',
      'open source japanese',
    ],
    alternates: {
      canonical: 'https://www.pthamnihongo.site/credits',
    },
    openGraph: {
      title,
      description,
      url: 'https://www.pthamnihongo.site/credits',
      type: 'website',
    },
    robots: {
      index: true,
      follow: true,
    },
  };
}

export default function CreditsPage() {
  return null;
}
