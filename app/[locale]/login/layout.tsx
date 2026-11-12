import type { Metadata } from 'next';

// Auth pages are not useful in search results and create many
// /login?redirect=... URLs. Keep them out of the index.
export const metadata: Metadata = {
  robots: { index: false, follow: true },
};

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
