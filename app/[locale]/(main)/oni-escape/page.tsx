import type { Metadata } from 'next';
import { routing } from '@/core/i18n/routing';
import { BreadcrumbSchema } from '@/shared/ui-composite/SEO/BreadcrumbSchema';
import { OniEscapeGame } from '@/features/OniEscape';

// Generate static pages for all locales at build time
export function generateStaticParams() {
  return routing.locales.map(locale => ({ locale }));
}

// ISR: Revalidate every hour
export const revalidate = 3600;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;

  const isVi = locale === 'vi';
  const title = isVi
    ? 'Oni Escape: Shinkansen Chase - Game Gõ Từ Vựng Tiếng Nhật | PThamSS'
    : 'Oni Escape: Shinkansen Chase - Japanese Vocabulary Typing Runner | PThamSS';
  const description = isVi
    ? 'Thử thách phản xạ gõ từ vựng tiếng Nhật trên nóc tàu Shinkansen và chạy trốn quái vật Oni khổng lồ. Hỗ trợ đầy đủ từ vựng JLPT N5 đến N1.'
    : 'High-speed Japanese vocabulary typing runner game on top of a Shinkansen train. Escape the giant Oni by typing Japanese words fast and accurately.';

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: 'website',
    },
  };
}

export default async function OniEscapePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  return (
    <>
      <BreadcrumbSchema
        items={[
          { name: 'Home', url: `https://www.pthamnihongo.site/${locale}` },
          {
            name: 'Oni Escape',
            url: `https://www.pthamnihongo.site/${locale}/oni-escape`,
          },
        ]}
      />
      <OniEscapeGame />
    </>
  );
}
