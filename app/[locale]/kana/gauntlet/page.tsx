import { KanaGauntlet } from '@/features/Kana';
import type { Metadata } from 'next';
import { generatePageMetadata } from '@/core/i18n/metadata-helpers';
import { routing } from '@/core/i18n/routing';
import { LearningResourceSchema } from '@/shared/ui-composite/SEO/LearningResourceSchema';
import { BreadcrumbSchema } from '@/shared/ui-composite/SEO/BreadcrumbSchema';

export function generateStaticParams() {
  return routing.locales.map(locale => ({ locale }));
}

export const revalidate = 3600;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  return await generatePageMetadata('kanaGauntlet', {
    locale,
    pathname: '/kana/gauntlet',
  });
}

export default function GauntletPage() {
  return (
    <>
      <BreadcrumbSchema
        items={[
          { name: 'Home', url: 'https://www.mondu.online' },
          { name: 'Kana', url: 'https://www.mondu.online/kana' },
          {
            name: 'Gauntlet',
            url: 'https://www.mondu.online/kana/gauntlet',
          },
        ]}
      />
      <LearningResourceSchema
        name='Hiragana & Katakana Gauntlet Mode'
        description='Progressive Japanese Kana challenge. Master all Hiragana and Katakana characters in order with increasing difficulty levels.'
        url='https://www.mondu.online/kana/gauntlet'
        learningResourceType='Assessment'
        educationalLevel={['Beginner', 'Intermediate']}
        teaches='Complete mastery of Japanese Hiragana and Katakana'
        assesses='Progressive Kana recognition and mastery'
        timeRequired='PT15M'
        isAccessibleForFree={true}
        provider={{ name: 'Mondu', url: 'https://www.mondu.online' }}
      />
      <KanaGauntlet />
    </>
  );
}
