import type { Metadata } from 'next';

// Auth pages are not useful in search results and create many
// /register?redirect=... URLs. Keep them out of the index.
export const metadata: Metadata = {
  robots: { index: false, follow: true },
};

export default function RegisterLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
