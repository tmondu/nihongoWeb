import { ThamKanjiClient } from '@/features/Kanji';
import type { Metadata } from 'next';
import { generatePageMetadata } from '@/core/i18n/metadata-helpers';
import { BreadcrumbSchema } from '@/shared/ui-composite/SEO/BreadcrumbSchema';
import { DojoRouteSchema } from '@/shared/ui-composite/SEO/DojoRouteSchema';
import { routing } from '@/core/i18n/routing';
import { KanjiLevel } from '@/entities/kanji';

export const dynamicParams = true;

export function generateStaticParams() {
  const params: { locale: string; character: string }[] = [];
  const levels = ['jlptn5', 'jlptn4', 'jlptn3', 'jlptn2', 'jlptn1'];

  for (const locale of routing.locales) {
    for (const lvl of levels) {
      params.push({ locale, character: lvl });
    }
  }
  return params;
}

// ISR: Revalidate every hour
export const revalidate = 3600;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; character: string }>;
}): Promise<Metadata> {
  const { locale, character } = await params;
  const decoded = decodeURIComponent(character);
  const pathname = `/kanji/thamkanji/${character}`;

  if (decoded.startsWith('jlpt')) {
    const levelStr = decoded.replace('jlpt', '').toUpperCase();
    const baseMetadata = await generatePageMetadata('kanji', {
      locale,
      pathname,
    });
    return {
      ...baseMetadata,
      title: `Tham Kanji JLPT ${levelStr} - PThamSS`,
    };
  }

  const baseMetadata = await generatePageMetadata('kanji', {
    locale,
    pathname,
  });
  return {
    ...baseMetadata,
    title: `Chữ Kanji ${decoded} - Tham Kanji`,
  };
}

export default async function ThamKanjiDetailPage({
  params,
}: {
  params: Promise<{ locale: string; character: string }>;
}) {
  const { locale, character } = await params;
  const decoded = decodeURIComponent(character);

  if (decoded.startsWith('jlpt')) {
    const activeLevel = decoded.replace('jlpt', '').toLowerCase() as KanjiLevel;
    const levelStr = activeLevel.toUpperCase();

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
              name: `Tham Kanji JLPT ${levelStr}`,
              url: `https://www.pthamnihongo.site/${locale}/kanji/thamkanji/jlpt${activeLevel}`,
            },
          ]}
        />
        <DojoRouteSchema
          routeKey='kanji'
          locale={locale}
          title={`Tham Kanji JLPT ${levelStr} - Sơ đồ tiến trình học chữ Hán`}
          description={`Lưới chữ Kanji JLPT ${levelStr}. Theo dõi mức độ ghi nhớ và tiến độ học tập chữ Hán của bạn.`}
          canonicalPath={`/kanji/thamkanji/jlpt${activeLevel}`}
          teaches='Japanese Kanji Characters, Readings, and Meanings'
          assesses='Kanji recognition, onyomi and kunyomi recall, and meaning comprehension'
          educationalAlignment={{
            alignmentType: 'educationalLevel',
            educationalFramework: 'JLPT',
            targetName: levelStr,
          }}
        />
        <ThamKanjiClient locale={locale} initialLevel={activeLevel} />
      </>
    );
  }

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
            name: 'Tham Kanji',
            url: `https://www.pthamnihongo.site/${locale}/kanji/thamkanji/jlptn5`,
          },
          {
            name: decoded,
            url: `https://www.pthamnihongo.site/${locale}/kanji/thamkanji/${character}`,
          },
        ]}
      />
      <DojoRouteSchema
        routeKey='kanji'
        locale={locale}
        title={`Tra cứu chữ Kanji ${decoded} - Tham Kanji`}
        description={`Chi tiết chữ Kanji ${decoded} bao gồm âm đọc On/Kun, âm Hán Việt, nghĩa tiếng Việt và tiến trình ghi nhớ.`}
        canonicalPath={`/kanji/thamkanji/${character}`}
        teaches='Japanese Kanji Characters, Readings, and Meanings'
        assesses='Kanji recognition, onyomi and kunyomi recall, and meaning comprehension'
        educationalAlignment={{
          alignmentType: 'educationalLevel',
          educationalFramework: 'JLPT',
          targetName: 'N5-N1',
        }}
      />
      <ThamKanjiClient locale={locale} initialCharacter={decoded} />
    </>
  );
}
