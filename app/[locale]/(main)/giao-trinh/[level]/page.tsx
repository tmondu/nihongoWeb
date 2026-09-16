import { Suspense } from 'react';
import type { Metadata } from 'next';
import { Loader2 } from 'lucide-react';
import { generatePageMetadata } from '@/core/i18n/metadata-helpers';
import { routing, redirect } from '@/core/i18n/routing';
import { BreadcrumbSchema } from '@/shared/ui-composite/SEO/BreadcrumbSchema';
import { CourseSchema } from '@/shared/ui-composite/SEO/CourseSchema';
import { CurriculumRoadmapView } from '@/features/Curriculum';
import type { CurriculumLevel } from '@/features/Curriculum/types';

interface LevelPageProps {
  params: Promise<{ locale: string; level: string }>;
}

const VALID_LEVELS: CurriculumLevel[] = ['n5', 'n4', 'n3', 'n2', 'n1'];

export function generateStaticParams() {
  return routing.locales.flatMap(locale =>
    VALID_LEVELS.map(level => ({ locale, level })),
  );
}

// ISR: Revalidate every hour
export const revalidate = 3600;

interface LevelCourseMeta {
  title: string;
  description: string;
  badge: string;
  educationalLevel: string;
  skillLevel: string;
}

const LEVEL_COURSE_META: Record<CurriculumLevel, LevelCourseMeta> = {
  n5: {
    title: 'Minna no Nihongo I (Bài 1 - 25 · N5) | PThamSS',
    description:
      'Khóa học tiếng Nhật N5 giáo trình Minna no Nihongo I (Bài 1 - 25) với 108 điểm ngữ pháp nền tảng và bài tập tương tác.',
    badge: 'JLPT N5',
    educationalLevel: 'Beginner (N5)',
    skillLevel: 'Beginner',
  },
  n4: {
    title: 'Minna no Nihongo II (Bài 26 - 50 · N4) | PThamSS',
    description:
      'Khóa học tiếng Nhật N4 giáo trình Minna no Nihongo II (Bài 26 - 50) với 70 điểm ngữ pháp trọng tâm và bài tập tương tác.',
    badge: 'JLPT N4',
    educationalLevel: 'Elementary (N4)',
    skillLevel: 'Elementary',
  },
  n3: {
    title: 'Trung Cấp Tổng Hợp (Bài 51 - 70 · N3) | PThamSS',
    description:
      'Khóa học tiếng Nhật N3 Trung Cấp Tổng Hợp (Bài 51 - 70) với 80 mẫu câu ngữ pháp liên kết câu phức và sắc thái biểu đạt.',
    badge: 'JLPT N3',
    educationalLevel: 'Intermediate (N3)',
    skillLevel: 'Intermediate',
  },
  n2: {
    title: 'Trung Cao Cấp Chuyên Sâu (Bài 71 - 90 · N2) | PThamSS',
    description:
      'Khóa học tiếng Nhật N2 Trung Cao Cấp (Bài 71 - 90) với 80 cấu trúc ngữ pháp thương mại, xã luận và kính ngữ công sở.',
    badge: 'JLPT N2',
    educationalLevel: 'Upper-Intermediate (N2)',
    skillLevel: 'Upper-Intermediate',
  },
  n1: {
    title: 'Thượng Cấp Học Thuật (Bài 91 - 110 · N1) | PThamSS',
    description:
      'Khóa học tiếng Nhật N1 Thượng Cấp (Bài 91 - 110) với 80 cấu trúc ngữ pháp hàn lâm, cổ ngữ và phân tích bài luận chuyên môn.',
    badge: 'JLPT N1',
    educationalLevel: 'Advanced (N1)',
    skillLevel: 'Advanced',
  },
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; level: string }>;
}): Promise<Metadata> {
  const { locale, level } = await params;
  const normalized = level.toLowerCase() as CurriculumLevel;
  const meta = LEVEL_COURSE_META[normalized] || LEVEL_COURSE_META.n5;

  const baseMetadata = await generatePageMetadata('curriculum', {
    locale,
    pathname: `/giao-trinh/${level}`,
  });

  return {
    ...baseMetadata,
    title: meta.title,
    description: meta.description,
  };
}

export default async function CurriculumLevelPage({ params }: LevelPageProps) {
  const { locale, level } = await params;

  // Backward compatibility: If user accesses numeric route like /giao-trinh/1, /giao-trinh/51, etc.
  if (/^\d+$/.test(level)) {
    const num = parseInt(level, 10);
    let target: CurriculumLevel = 'n5';
    if (num > 90) target = 'n1';
    else if (num > 70) target = 'n2';
    else if (num > 50) target = 'n3';
    else if (num > 25) target = 'n4';
    redirect({ href: `/giao-trinh/${target}/${num}`, locale });
  }

  const normalized = level.toLowerCase() as CurriculumLevel;
  if (!VALID_LEVELS.includes(normalized)) {
    redirect({ href: '/giao-trinh', locale });
  }

  const meta = LEVEL_COURSE_META[normalized];

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
            name: meta.badge,
            url: `https://www.pthamnihongo.site/${locale}/giao-trinh/${normalized}`,
          },
        ]}
      />
      <CourseSchema
        name={meta.title}
        description={meta.description}
        url={`https://www.pthamnihongo.site/${locale}/giao-trinh/${normalized}`}
        educationalLevel={meta.educationalLevel}
        skillLevel={meta.skillLevel}
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
        <CurriculumRoadmapView level={normalized} />
      </Suspense>
    </>
  );
}
