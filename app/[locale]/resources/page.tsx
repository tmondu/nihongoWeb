import type { Metadata } from 'next';
import { routing } from '@/core/i18n/routing';
import { BreadcrumbSchema } from '@/shared/ui-composite/SEO/BreadcrumbSchema';
import { LearningResourceSchema } from '@/shared/ui-composite/SEO/LearningResourceSchema';
import Script from 'next/script';
import { ResourcesPageClient } from './ResourcesPageClient';
import {
  getAllResources,
  getAllCategories,
  enrichCategoriesWithCounts,
  getFilterOptions,
} from '@/features/Resources';

// Generate static pages for all locales at build time
export function generateStaticParams() {
  return routing.locales.map(locale => ({ locale }));
}

// ISR: Revalidate daily
export const revalidate = 86400;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const isVi = locale === 'vi' || !locale;
  const resources = getAllResources();
  const totalCount = resources.length;

  const title = isVi
    ? `Tài nguyên học tiếng Nhật tốt nhất - Ứng dụng, Giáo trình, YouTube & Nhiều hơn nữa | PThamSS`
    : 'Best Japanese Learning Resources - Apps, Textbooks, YouTube & More | PThamSS';
  const description = isVi
    ? `Khám phá hơn ${totalCount} tài nguyên học tiếng Nhật được chọn lọc kỹ lưỡng. Tìm kiếm ứng dụng, sách giáo khoa, kênh YouTube, podcast, trò chơi và công cụ luyện thi JLPT tốt nhất cho mọi trình độ.`
    : `Discover ${totalCount}+ curated Japanese learning resources. Find the best apps, textbooks, YouTube channels, podcasts, games, and tools for learning Japanese at any level.`;

  const keywords = isVi
    ? [
        'tài nguyên học tiếng nhật',
        'học tiếng nhật',
        'ứng dụng học tiếng nhật',
        'giáo trình tiếng nhật',
        'kênh youtube học tiếng nhật',
        'tài liệu thi jlpt',
        'tài liệu học tiếng nhật',
        'app học tiếng nhật tốt nhất',
        'pthamss tài nguyên',
        'japanese learning resources',
      ]
    : [
        'japanese learning resources',
        'learn japanese',
        'japanese apps',
        'japanese textbooks',
        'japanese youtube channels',
        'jlpt resources',
        'japanese study materials',
        'best japanese learning apps',
        'japanese language resources',
      ];

  return {
    title,
    description,
    keywords,
    openGraph: {
      title: isVi
        ? 'Tài nguyên học tiếng Nhật tốt nhất | PThamSS'
        : 'Best Japanese Learning Resources | PThamSS',
      description,
      url: 'https://www.pthamnihongo.site/resources',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: isVi
        ? 'Tài nguyên học tiếng Nhật tốt nhất | PThamSS'
        : 'Best Japanese Learning Resources | PThamSS',
      description,
    },
    alternates: {
      canonical: 'https://www.pthamnihongo.site/resources',
    },
  };
}

// Generate ItemList structured data for SEO
function generateItemListSchema(
  resources: ReturnType<typeof getAllResources>,
  locale: string,
) {
  const isVi = locale === 'vi' || !locale;
  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: isVi ? 'Tài nguyên học tiếng Nhật' : 'Japanese Learning Resources',
    description: isVi
      ? 'Tuyển tập chọn lọc các tài nguyên học tiếng Nhật tốt nhất'
      : 'Comprehensive collection of curated Japanese learning resources',
    numberOfItems: resources.length,
    itemListOrder: 'https://schema.org/ItemListUnordered',
    itemListElement: resources.slice(0, 25).map((resource, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      item: {
        '@type': 'LearningResource',
        name: resource.name,
        url: resource.url,
        educationalLevel:
          resource.difficulty === 'all-levels' ? 'All Levels' : undefined,
        inLanguage: locale === 'es' ? 'es' : isVi ? 'vi' : 'en',
      },
    })),
  };
}

export default async function ResourcesPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const isVi = locale === 'vi' || !locale;

  // Get all resources and categories with counts
  const resources = getAllResources();
  const categories = getAllCategories();
  const categoriesWithCounts = enrichCategoriesWithCounts(
    categories,
    resources,
  );
  const availableFilters = getFilterOptions(resources);

  const breadcrumbItems = [
    { name: isVi ? 'Trang chủ' : 'Home', url: 'https://www.pthamnihongo.site' },
    {
      name: isVi ? 'Tài nguyên' : 'Resources',
      url: 'https://www.pthamnihongo.site/resources',
    },
  ];

  const itemListSchema = generateItemListSchema(resources, locale);

  return (
    <>
      {/* Structured Data */}
      <BreadcrumbSchema items={breadcrumbItems} />
      <Script
        id='resources-itemlist-schema'
        type='application/ld+json'
        dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListSchema) }}
      />
      <LearningResourceSchema
        name={
          isVi
            ? 'Thư viện Tài nguyên Học Tiếng Nhật'
            : 'Japanese Learning Resources Library'
        }
        description={
          isVi
            ? `Bộ sưu tập chọn lọc hơn ${resources.length} tài nguyên học tiếng Nhật bao gồm ứng dụng, sách giáo trình, kênh YouTube, podcast, trò chơi và tài liệu luyện thi JLPT.`
            : `Curated collection of ${resources.length}+ Japanese learning resources including apps, textbooks, YouTube channels, podcasts, games, and JLPT preparation materials.`
        }
        url='https://www.pthamnihongo.site/resources'
        learningResourceType='Course'
        educationalLevel={['Beginner', 'Intermediate', 'Advanced']}
        teaches='Japanese Language — Hiragana, Katakana, Kanji, Vocabulary, Grammar'
        isAccessibleForFree={true}
        inLanguage={isVi ? ['vi', 'ja', 'en'] : ['en', 'ja']}
        provider={{ name: 'PThamSS', url: 'https://www.pthamnihongo.site' }}
      />

      {/* Page Content */}
      <ResourcesPageClient
        locale={locale}
        initialResources={resources}
        categoriesWithCounts={categoriesWithCounts}
        availableFilters={availableFilters}
      />
    </>
  );
}
