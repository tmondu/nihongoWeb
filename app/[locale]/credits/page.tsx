import type { Metadata } from 'next';
import { routing } from '@/core/i18n/routing';

export function generateStaticParams() {
  return routing.locales.map(locale => ({ locale }));
}

export const revalidate = 3600;

export async function generateMetadata(): Promise<Metadata> {
  const title = 'Credits & Data Sources | Mondu';
  const description =
    'Mondu uses trusted Japanese language data sources including JMdict, KANJIDIC, and open-source libraries to provide accurate learning tools.';

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
      canonical: 'https://www.mondu.online/credits',
    },
    openGraph: {
      title,
      description,
      url: 'https://www.mondu.online/credits',
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
