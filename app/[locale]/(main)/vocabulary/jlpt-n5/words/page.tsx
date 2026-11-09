import dynamic from 'next/dynamic';
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

const ModernVocabContainer = dynamic(
  () => import('@/features/Vocabulary').then(m => m.ModernVocabContainer),
  {
    ssr: false,
    loading: () => (
      <div className='flex min-h-[400px] w-full items-center justify-center py-12'>
        <div className='size-10 animate-spin rounded-full border-4 border-[var(--border-color)] border-t-[var(--main-color)]' />
      </div>
    ),
  },
);

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
    pathname: '/vocabulary/jlpt-n5/words',
  });
}

export default async function VocabularyJlptN5WordsPage({
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
            name: 'Words',
            url: `https://www.mondu.online/${locale}/vocabulary/jlpt-n5/words`,
          },
        ]}
      />
      <CourseSchema
        name='JLPT N5 Japanese Vocabulary - Flashcards & Word List'
        description='Learn 1000 JLPT N5 Japanese vocabulary words with 2-sided flashcards and comprehensive word table.'
        url={`https://www.mondu.online/${locale}/vocabulary/jlpt-n5/words`}
        educationalLevel='Beginner'
        skillLevel='JLPT N5'
        learningResourceType='Interactive Course'
      />
      <LearningResourceSchema
        name='JLPT N5 Words Study'
        description='Interactive JLPT N5 vocabulary practice with flashcards and word lists.'
        url={`https://www.mondu.online/${locale}/vocabulary/jlpt-n5/words`}
        learningResourceType={['Quiz', 'Interactive']}
        educationalLevel={['Beginner']}
        teaches='JLPT N5 Japanese vocabulary, meanings, and usage'
        assesses='JLPT N5 word recognition and recall speed'
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
      <ModernVocabContainer fixedLevel='n5' mode='vocab' />
    </>
  );
}
