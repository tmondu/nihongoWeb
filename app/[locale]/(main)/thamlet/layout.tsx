import type { Metadata } from 'next';
import { generatePageMetadata } from '@/core/i18n/metadata-helpers';

interface ThamletLayoutProps {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  return await generatePageMetadata('thamlet', {
    locale,
    pathname: '/thamlet',
  });
}

export default function ThamletLayout({ children }: ThamletLayoutProps) {
  return <>{children}</>;
}
