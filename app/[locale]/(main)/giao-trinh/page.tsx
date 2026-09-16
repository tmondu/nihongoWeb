import { Suspense } from 'react';
import type { Metadata } from 'next';
import { Loader2 } from 'lucide-react';
import { generatePageMetadata } from '@/core/i18n/metadata-helpers';
import { routing } from '@/core/i18n/routing';
import { BreadcrumbSchema } from '@/shared/ui-composite/SEO/BreadcrumbSchema';
import { CourseSchema } from '@/shared/ui-composite/SEO/CourseSchema';
import { CourseSelectionView } from '@/features/Curriculum';

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
  return await generatePageMetadata('curriculum', {
    locale,
    pathname: '/giao-trinh',
  });
}

export default async function GiaoTrinhPage({
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
            name: 'Giáo án',
            url: `https://www.pthamnihongo.site/${locale}/giao-trinh`,
          },
        ]}
      />
      <CourseSchema
        name='Lộ Trình Minna no Nihongo (Sơ Cấp N5 - N4)'
        description='Khóa học tiếng Nhật theo giáo trình Minna no Nihongo I & II (50 bài học N5 - N4) với ngữ pháp, từ vựng, phát âm và trò chơi tương tác.'
        url={`https://www.pthamnihongo.site/${locale}/giao-trinh`}
        educationalLevel='Beginner to Elementary (N5 - N4)'
        skillLevel='Beginner'
        learningResourceType='Interactive Course, Grammar and Vocabulary'
      />
      <Suspense
        fallback={
          <div className='flex min-h-[60vh] flex-col items-center justify-center text-(--secondary-color)'>
            <Loader2 className='mb-2 size-8 animate-spin text-sky-500' />
            <p className='text-sm font-medium'>Đang tải khóa học...</p>
          </div>
        }
      >
        <CourseSelectionView />
      </Suspense>
    </>
  );
}
