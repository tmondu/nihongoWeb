import type { Metadata } from 'next';
import { generatePageMetadata } from '@/core/i18n/metadata-helpers';

interface ShadowingLayoutProps {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  return await generatePageMetadata('shadowing', {
    locale,
    pathname: '/shadowing',
  });
}

export default function ShadowingLayout({ children }: ShadowingLayoutProps) {
  return <>{children}</>;
}
