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
  return await generatePageMetadata('vocabularyJlptN1', {
    locale,
    pathname: '/vocabulary/jlpt-n1/pronounce',
  });
}

export default function VocabularyJlptN1PronouncePage() {
  return (
    <>
      <BreadcrumbSchema
        items={[
          { name: 'Home', url: `https://www.mondu.online` },
          {
            name: 'Vocabulary',
            url: `https://www.mondu.online/vocabulary`,
          },
          {
            name: 'JLPT N1',
            url: `https://www.mondu.online/vocabulary/jlpt-n1`,
          },
          {
            name: 'Pronounce',
            url: `https://www.mondu.online/vocabulary/jlpt-n1/pronounce`,
          },
        ]}
      />
      <CourseSchema
        name='JLPT N1 Japanese Pronunciation Studio'
        description='Practice speaking JLPT N1 Japanese vocabulary words with microphone voice recording, audio waveform, and feedback.'
        url={`https://www.mondu.online/vocabulary/jlpt-n1/pronounce`}
        educationalLevel='Advanced'
        skillLevel='JLPT N1'
        learningResourceType='Interactive Course'
      />
      <LearningResourceSchema
        name='JLPT N1 Pronunciation Practice'
        description='Interactive speech practice for JLPT N1 words with voice scoring.'
        url={`https://www.mondu.online/vocabulary/jlpt-n1/pronounce`}
        learningResourceType={['Interactive']}
        educationalLevel={['Advanced']}
        teaches='Japanese pronunciation and speaking confidence'
        assesses='Voice recognition and pitch pronunciation'
        timeRequired='PT20M'
        isAccessibleForFree={true}
        provider={{ name: 'Mondu', url: 'https://www.mondu.online' }}
        educationalAlignment={{
          alignmentType: 'educationalLevel',
          educationalFramework: 'JLPT',
          targetName: 'N1',
        }}
      />
      <FAQSchema faqs={commonMonduFAQs} />
      <ModernVocabContainer fixedLevel='n1' mode='speak' />
    </>
  );
}
