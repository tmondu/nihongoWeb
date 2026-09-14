import type { Metadata } from 'next';
import { generatePageMetadata } from '@/core/i18n/metadata-helpers';
import { routing } from '@/core/i18n/routing';
import { BreadcrumbSchema } from '@/shared/ui-composite/SEO/BreadcrumbSchema';
import { ThamletLibraryView } from '@/features/Thamlet';

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
  return await generatePageMetadata('thamlet', {
    locale,
    pathname: '/thamlet',
  });
}

export default async function ThamletPage({
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
            name: 'Thamlet',
            url: `https://www.pthamnihongo.site/${locale}/thamlet`,
          },
        ]}
      />
      <ThamletLibraryView />
    </>
  );
}
