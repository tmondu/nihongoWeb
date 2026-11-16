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
  return await generatePageMetadata('vocabularyJlptN3', {
    locale,
    pathname: '/vocabulary/jlpt-n3/words',
  });
}

export default function VocabularyJlptN3WordsPage() {
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
            name: 'JLPT N3',
            url: `https://www.mondu.online/vocabulary/jlpt-n3`,
          },
          {
            name: 'Words',
            url: `https://www.mondu.online/vocabulary/jlpt-n3/words`,
          },
        ]}
      />
      <CourseSchema
        name='JLPT N3 Japanese Vocabulary - Flashcards & Word List'
        description='Learn 1000 JLPT N3 Japanese vocabulary words with 2-sided flashcards and comprehensive word table.'
        url={`https://www.mondu.online/vocabulary/jlpt-n3/words`}
        educationalLevel='Intermediate'
        skillLevel='JLPT N3'
        learningResourceType='Interactive Course'
      />
      <LearningResourceSchema
        name='JLPT N3 Words Study'
        description='Interactive JLPT N3 vocabulary practice with flashcards and word lists.'
        url={`https://www.mondu.online/vocabulary/jlpt-n3/words`}
        learningResourceType={['Quiz', 'Interactive']}
        educationalLevel={['Intermediate']}
        teaches='JLPT N3 Japanese vocabulary, meanings, and usage'
        assesses='JLPT N3 word recognition and recall speed'
        timeRequired='PT20M'
        isAccessibleForFree={true}
        provider={{ name: 'Mondu', url: 'https://www.mondu.online' }}
        educationalAlignment={{
          alignmentType: 'educationalLevel',
          educationalFramework: 'JLPT',
          targetName: 'N3',
        }}
      />
      <FAQSchema faqs={commonMonduFAQs} />
      <ModernVocabContainer fixedLevel='n3' mode='vocab' />
    </>
  );
}
