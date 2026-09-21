import { RadicalsHub } from '@/features/Radicals';
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
  return await generatePageMetadata('kanjiRadicals', {
    locale,
    pathname: '/kanji/radicals',
  });
}

export default async function KanjiRadicalsPage({
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
            name: 'Radicals',
            url: `https://www.pthamnihongo.site/${locale}/kanji/radicals`,
          },
        ]}
      />
      <DojoRouteSchema
        routeKey='kanji'
        locale={locale}
        title='Học Kanji Theo Bộ Thủ - 214 Bộ Thủ Kangxi & Chiết Tự'
        description='Học Kanji qua 214 bộ thủ Kangxi theo phương pháp phân tầng sư phạm, phân tích chiết tự và ghép các bộ thủ thành Hán tự mới.'
        canonicalPath='/kanji/radicals'
        teaches='214 Kangxi Radicals, Ideogrammic Decomposition, and Kanji Synthesis'
        assesses='Radical recognition, radical composition recall, and character meaning'
        educationalAlignment={{
          alignmentType: 'educationalLevel',
          educationalFramework: 'JLPT',
          targetName: 'N5-N1',
        }}
      />
      <RadicalsHub />
    </>
  );
}
