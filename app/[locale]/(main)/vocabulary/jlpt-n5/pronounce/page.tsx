import type { Metadata } from 'next';
import { generatePageMetadata } from '@/core/i18n/metadata-helpers';
import { CourseSchema } from '@/shared/ui-composite/SEO/CourseSchema';
import { BreadcrumbSchema } from '@/shared/ui-composite/SEO/BreadcrumbSchema';
import {
  FAQSchema,
  commonMonduFAQs,
} from '@/shared/ui-composite/SEO/FAQSchema';
import { LearningResourceSchema } from '@/shared/ui-composite/SEO/LearningResourceSchema';
import { routing } from '@/core/i18n/routing';
import { ModernVocabContainer } from '@/features/Vocabulary';

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
  return await generatePageMetadata('vocabularyJlptN5', {
    locale,
    pathname: '/vocabulary/jlpt-n5/pronounce',
  });
}

export default async function VocabularyJlptN5PronouncePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  return (
    <>
      <BreadcrumbSchema
        items={[
          { name: 'Home', url: `https://www.mondu.online/${locale}` },
          {
            name: 'Vocabulary',
            url: `https://www.mondu.online/${locale}/vocabulary`,
          },
          {
            name: 'JLPT N5',
            url: `https://www.mondu.online/${locale}/vocabulary/jlpt-n5`,
          },
          {
            name: 'Pronounce',
            url: `https://www.mondu.online/${locale}/vocabulary/jlpt-n5/pronounce`,
          },
        ]}
      />
      <CourseSchema
        name='JLPT N5 Japanese Pronunciation Studio'
        description='Practice speaking JLPT N5 Japanese vocabulary words with microphone voice recording, audio waveform, and feedback.'
        url={`https://www.mondu.online/${locale}/vocabulary/jlpt-n5/pronounce`}
        educationalLevel='Beginner'
        skillLevel='JLPT N5'
        learningResourceType='Interactive Course'
      />
      <LearningResourceSchema
        name='JLPT N5 Pronunciation Practice'
        description='Interactive speech practice for JLPT N5 words with voice scoring.'
        url={`https://www.mondu.online/${locale}/vocabulary/jlpt-n5/pronounce`}
        learningResourceType={['Interactive']}
        educationalLevel={['Beginner']}
        teaches='Japanese pronunciation and speaking confidence'
        assesses='Voice recognition and pitch pronunciation'
        timeRequired='PT20M'
        isAccessibleForFree={true}
        provider={{ name: 'Mondu', url: 'https://www.mondu.online' }}
        educationalAlignment={{
          alignmentType: 'educationalLevel',
          educationalFramework: 'JLPT',
          targetName: 'N5',
        }}
      />
      <FAQSchema faqs={commonMonduFAQs} />
      <ModernVocabContainer fixedLevel='n5' mode='speak' />
    </>
  );
}
