import Info from '@/shared/ui-composite/Menu/Info';
import { Breadcrumbs } from '@/shared/ui-composite/Breadcrumbs';
import { routing } from '@/core/i18n/routing';
import type { Metadata } from 'next';

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
  return {
    title: locale === 'vi' ? 'Thông tin JLPT | PThamSS' : 'JLPT Information | PThamSS',
    description: locale === 'vi' ? 'Tìm hiểu thông tin chi tiết về kỳ thi năng lực tiếng Nhật JLPT.' : 'Learn more details about the Japanese Language Proficiency Test (JLPT).',
  };
}

export default async function JLPTPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  return (
    <div className='mx-auto max-w-4xl px-4 py-8 flex flex-col gap-6'>
      <Breadcrumbs
        items={[
          { name: locale === 'vi' ? 'Trang chủ' : 'Home', url: `/${locale}` },
          { name: 'JLPT', url: `/${locale}/jlpt` },
        ]}
      />
      <Info />
    </div>
  );
}
