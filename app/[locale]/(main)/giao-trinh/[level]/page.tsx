import { Suspense } from 'react';
import type { Metadata } from 'next';
import { Loader2 } from 'lucide-react';
import { generatePageMetadata } from '@/core/i18n/metadata-helpers';
import { routing, redirect } from '@/core/i18n/routing';
import { BreadcrumbSchema } from '@/shared/ui-composite/SEO/BreadcrumbSchema';
import { CourseSchema } from '@/shared/ui-composite/SEO/CourseSchema';
import { CurriculumRoadmapView } from '@/features/Curriculum';

interface LevelPageProps {
  params: Promise<{ locale: string; level: string }>;
}

export function generateStaticParams() {
  const levels = ['n5', 'n4'];
  return routing.locales.flatMap(locale =>
    levels.map(level => ({ locale, level })),
  );
}

// ISR: Revalidate every hour
export const revalidate = 3600;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; level: string }>;
}): Promise<Metadata> {
  const { locale, level } = await params;
  const isN4 = level.toLowerCase() === 'n4';

  const baseMetadata = await generatePageMetadata('curriculum', {
    locale,
    pathname: `/giao-trinh/${level}`,
  });

  return {
    ...baseMetadata,
    title: isN4
      ? 'Minna no Nihongo II (Bài 26 - 50 · N4) | PThamSS'
      : 'Minna no Nihongo I (Bài 1 - 25 · N5) | PThamSS',
    description: isN4
      ? 'Khóa học tiếng Nhật N4 giáo trình Minna no Nihongo II (Bài 26 - 50) với 70 điểm ngữ pháp trọng tâm và bài tập tương tác.'
      : 'Khóa học tiếng Nhật N5 giáo trình Minna no Nihongo I (Bài 1 - 25) với 108 điểm ngữ pháp nền tảng và bài tập tương tác.',
  };
}

export default async function CurriculumLevelPage({ params }: LevelPageProps) {
  const { locale, level } = await params;

  // Backward compatibility: If user accesses numeric route like /giao-trinh/1 or /giao-trinh/26
  if (/^\d+$/.test(level)) {
    const num = parseInt(level, 10);
    const target = num <= 25 ? 'n5' : 'n4';
    redirect({ href: `/giao-trinh/${target}/${num}`, locale });
  }

  const normalized = level.toLowerCase();
  if (normalized !== 'n5' && normalized !== 'n4') {
    redirect({ href: '/giao-trinh', locale });
  }

  const isN4 = normalized === 'n4';

  return (
    <>
      <BreadcrumbSchema
        items={[
          { name: 'Home', url: `https://www.pthamnihongo.site/${locale}` },
          {
            name: 'Giáo án',
            url: `https://www.pthamnihongo.site/${locale}/giao-trinh`,
          },
          {
            name: isN4 ? 'JLPT N4' : 'JLPT N5',
            url: `https://www.pthamnihongo.site/${locale}/giao-trinh/${normalized}`,
          },
        ]}
      />
      <CourseSchema
        name={
          isN4
            ? 'Minna no Nihongo II (Bài 26 - 50 · N4)'
            : 'Minna no Nihongo I (Bài 1 - 25 · N5)'
        }
        description={
          isN4
            ? 'Khóa học tiếng Nhật N4 giáo trình Minna no Nihongo II (Bài 26 - 50)'
            : 'Khóa học tiếng Nhật N5 giáo trình Minna no Nihongo I (Bài 1 - 25)'
        }
        url={`https://www.pthamnihongo.site/${locale}/giao-trinh/${normalized}`}
        educationalLevel={isN4 ? 'Elementary (N4)' : 'Beginner (N5)'}
        skillLevel={isN4 ? 'Elementary' : 'Beginner'}
        learningResourceType='Interactive Course, Grammar and Vocabulary'
      />
      <Suspense
        fallback={
          <div className='flex min-h-[60vh] flex-col items-center justify-center text-(--secondary-color)'>
            <Loader2 className='mb-2 size-8 animate-spin text-sky-500' />
            <p className='text-sm font-medium'>Đang tải danh sách bài học...</p>
          </div>
        }
      >
        <CurriculumRoadmapView level={normalized as 'n5' | 'n4'} />
      </Suspense>
    </>
  );
}
