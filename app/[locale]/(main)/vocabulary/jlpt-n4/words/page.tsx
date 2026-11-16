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
  return await generatePageMetadata('vocabularyJlptN4', {
    locale,
    pathname: '/vocabulary/jlpt-n4/words',
  });
}

export default function VocabularyJlptN4WordsPage() {
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
            name: 'JLPT N4',
            url: `https://www.mondu.online/vocabulary/jlpt-n4`,
          },
          {
            name: 'Words',
            url: `https://www.mondu.online/vocabulary/jlpt-n4/words`,
          },
        ]}
      />
      <CourseSchema
        name='JLPT N4 Japanese Vocabulary - Flashcards & Word List'
        description='Learn 1000 JLPT N4 Japanese vocabulary words with 2-sided flashcards and comprehensive word table.'
        url={`https://www.mondu.online/vocabulary/jlpt-n4/words`}
        educationalLevel='Beginner to Intermediate'
        skillLevel='JLPT N4'
        learningResourceType='Interactive Course'
      />
      <LearningResourceSchema
        name='JLPT N4 Words Study'
        description='Interactive JLPT N4 vocabulary practice with flashcards and word lists.'
        url={`https://www.mondu.online/vocabulary/jlpt-n4/words`}
        learningResourceType={['Quiz', 'Interactive']}
        educationalLevel={['Beginner to Intermediate']}
        teaches='JLPT N4 Japanese vocabulary, meanings, and usage'
        assesses='JLPT N4 word recognition and recall speed'
        timeRequired='PT20M'
        isAccessibleForFree={true}
        provider={{ name: 'Mondu', url: 'https://www.mondu.online' }}
        educationalAlignment={{
          alignmentType: 'educationalLevel',
          educationalFramework: 'JLPT',
          targetName: 'N4',
        }}
      />
      <FAQSchema faqs={commonMonduFAQs} />
      <ModernVocabContainer fixedLevel='n4' mode='vocab' />
    </>
  );
}
