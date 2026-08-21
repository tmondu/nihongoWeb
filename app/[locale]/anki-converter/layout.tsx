import SidebarLayout from '@/shared/ui-composite/layout/SidebarLayout';

interface AnkiConverterLayoutProps {
  children: React.ReactNode;
}

export default function AnkiConverterLayout({
  children,
}: AnkiConverterLayoutProps) {
  return <SidebarLayout showBanner={false}>{children}</SidebarLayout>;
}
