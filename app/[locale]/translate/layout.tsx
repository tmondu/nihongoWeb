import SidebarLayout from '@/shared/ui-composite/layout/SidebarLayout';

interface TranslateLayoutProps {
  children: React.ReactNode;
}

export default function TranslateLayout({ children }: TranslateLayoutProps) {
  return <SidebarLayout showBanner={false}>{children}</SidebarLayout>;
}
