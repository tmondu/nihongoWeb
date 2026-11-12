import type { Metadata } from 'next';
import { generatePageMetadata } from '@/core/i18n/metadata-helpers';

interface SolutionsLayoutProps {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  return await generatePageMetadata('solutions', {
    locale,
    pathname: '/solutions',
  });
}

export default function SolutionsLayout({ children }: SolutionsLayoutProps) {
  return <>{children}</>;
}
