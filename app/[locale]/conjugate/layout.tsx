import SidebarLayout from '@/shared/ui-composite/layout/SidebarLayout';

interface ConjugateLayoutProps {
  children: React.ReactNode;
}

export default function ConjugateLayout({ children }: ConjugateLayoutProps) {
  return <SidebarLayout showBanner={false}>{children}</SidebarLayout>;
}
