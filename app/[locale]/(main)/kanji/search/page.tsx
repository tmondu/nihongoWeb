import { SearchClient } from '@/features/Kanji';
import type { Metadata } from 'next';
import { generatePageMetadata } from '@/core/i18n/metadata-helpers';
import { BreadcrumbSchema } from '@/shared/ui-composite/SEO/BreadcrumbSchema';
import { DojoRouteSchema } from '@/shared/ui-composite/SEO/DojoRouteSchema';
import { routing } from '@/core/i18n/routing';

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
  return await generatePageMetadata('kanji', { locale, pathname: '/kanji/search' });
}

export default async function KanjiSearchPage({
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
            name: 'Kanji',
            url: `https://www.pthamnihongo.site/${locale}/kanji`,
          },
          {
            name: 'Search',
            url: `https://www.pthamnihongo.site/${locale}/kanji/search`,
          },
        ]}
      />
      <DojoRouteSchema
        routeKey='kanji'
        locale={locale}
        title='Tìm kiếm Kanji bằng vẽ tay - Tra cứu chữ Hán viết tay'
        description='Công cụ tìm kiếm và tra cứu chữ Kanji tiếng Nhật bằng cách vẽ tay hoặc nhập âm Hán-Việt, nghĩa tiếng Việt, cách đọc On/Kun tiện lợi.'
        canonicalPath='/kanji/search'
        teaches='Japanese Kanji Characters, Readings, and Meanings'
        assesses='Kanji recognition, onyomi and kunyomi recall, and meaning comprehension'
        educationalAlignment={{
          alignmentType: 'educationalLevel',
          educationalFramework: 'JLPT',
          targetName: 'N5-N1',
        }}
      />
      <SearchClient locale={locale} />
    </>
  );
}
