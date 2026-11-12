import type { Metadata } from 'next';
import { generatePageMetadata } from '@/core/i18n/metadata-helpers';

interface ExercisesLayoutProps {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  return await generatePageMetadata('exercises', {
    locale,
    pathname: '/exercises',
  });
}

export default function ExercisesLayout({ children }: ExercisesLayoutProps) {
  return <>{children}</>;
}
