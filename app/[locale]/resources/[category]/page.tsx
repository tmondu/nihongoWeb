import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { routing } from '@/core/i18n/routing';
import { BreadcrumbSchema } from '@/shared/ui-composite/SEO/BreadcrumbSchema';
import Script from 'next/script';
import { CategoryPageClient } from './CategoryPageClient';
import {
  getAllResources,
  getAllCategories,
  getCategoryById,
  getResourcesByCategory,
  enrichCategoriesWithCounts,
  getFilterOptions,
} from '@/features/Resources';

// Generate static pages for all locales and categories at build time
export function generateStaticParams() {
  const categories = getAllCategories();
  const params: { locale: string; category: string }[] = [];

  for (const locale of routing.locales) {
    for (const category of categories) {
      params.push({ locale, category: category.id });
    }
  }

  return params;
}

import {
  CATEGORY_NAMES_VI,
  CATEGORY_DESCRIPTIONS_VI,
} from '@/features/Resources/lib/translations';

// ISR: Revalidate daily
export const revalidate = 86400;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; category: string }>;
}): Promise<Metadata> {
  const { locale, category: categoryId } = await params;
  const isVi = locale === 'vi' || !locale;
  const category = getCategoryById(categoryId);

  if (!category) {
    return { title: 'Category Not Found' };
  }

  const resources = getResourcesByCategory(categoryId);
  const resourceCount = resources.length;

  const categoryName =
    isVi && CATEGORY_NAMES_VI[category.id]
      ? CATEGORY_NAMES_VI[category.id]
      : category.name;

  const categoryDesc =
    isVi && CATEGORY_DESCRIPTIONS_VI[category.id]
      ? CATEGORY_DESCRIPTIONS_VI[category.id]
      : category.description;

  const title = isVi
    ? `Top ${categoryName} học tiếng Nhật tốt nhất - ${resourceCount}+ tài nguyên | PThamSS`
    : `Best ${category.name} for Learning Japanese - ${resourceCount}+ Resources | PThamSS`;

  const description = isVi
    ? `${categoryDesc} Khám phá hơn ${resourceCount} ${categoryName.toLowerCase()} được tuyển chọn giúp bạn tự học tiếng Nhật hiệu quả.`
    : `${category.description} Discover ${resourceCount}+ curated ${category.name.toLowerCase()} to help you learn Japanese effectively.`;

  return {
    title,
    description,
    keywords: [
      `japanese ${category.name.toLowerCase()}`,
      `learn japanese ${category.name.toLowerCase()}`,
      `best ${category.name.toLowerCase()} for japanese`,
      `japanese learning ${category.name.toLowerCase()}`,
      category.name.toLowerCase(),
      'japanese study resources',
    ],
    openGraph: {
      title,
      description,
      url: `https://www.pthamnihongo.site/resources/${categoryId}`,
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
    alternates: {
      canonical: `https://www.pthamnihongo.site/resources/${categoryId}`,
    },
  };
}

// Generate ItemList structured data for category
function generateItemListSchema(
  categoryName: string,
  categoryDescription: string,
  resources: ReturnType<typeof getResourcesByCategory>,
  locale: string,
) {
  const isVi = locale === 'vi' || !locale;
  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: isVi
      ? `Tài nguyên ${categoryName} học tiếng Nhật tốt nhất`
      : `Best ${categoryName} for Learning Japanese`,
    description: categoryDescription,
    numberOfItems: resources.length,
    itemListOrder: 'https://schema.org/ItemListUnordered',
    itemListElement: resources.slice(0, 25).map((resource, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      item: {
        '@type': 'LearningResource',
        name: resource.name,
        url: resource.url,
      },
    })),
  };
}

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ locale: string; category: string }>;
}) {
  const { locale, category: categoryId } = await params;
  const isVi = locale === 'vi' || !locale;

  const category = getCategoryById(categoryId);

  if (!category) {
    notFound();
  }

  // Get resources for this category
  const categoryResources = getResourcesByCategory(categoryId);
  const allResources = getAllResources();
  const categories = getAllCategories();
  const categoriesWithCounts = enrichCategoriesWithCounts(
    categories,
    allResources,
  );
  const availableFilters = getFilterOptions(categoryResources);

  const categoryName =
    isVi && CATEGORY_NAMES_VI[category.id]
      ? CATEGORY_NAMES_VI[category.id]
      : category.name;

  const categoryDesc =
    isVi && CATEGORY_DESCRIPTIONS_VI[category.id]
      ? CATEGORY_DESCRIPTIONS_VI[category.id]
      : category.description;

  const breadcrumbItems = [
    { name: isVi ? 'Trang chủ' : 'Home', url: 'https://www.pthamnihongo.site' },
    {
      name: isVi ? 'Tài nguyên' : 'Resources',
      url: 'https://www.pthamnihongo.site/resources',
    },
    {
      name: categoryName,
      url: `https://www.pthamnihongo.site/resources/${categoryId}`,
    },
  ];

  const itemListSchema = generateItemListSchema(
    categoryName,
    categoryDesc,
    categoryResources,
    locale,
  );

  return (
    <>
      {/* Structured Data */}
      <BreadcrumbSchema items={breadcrumbItems} />
      <Script
        id='category-itemlist-schema'
        type='application/ld+json'
        dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListSchema) }}
      />

      {/* Page Content */}
      <CategoryPageClient
        locale={locale}
        category={category}
        initialResources={categoryResources}
        categoriesWithCounts={categoriesWithCounts}
        availableFilters={availableFilters}
      />
    </>
  );
}
