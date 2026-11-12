import type { Metadata } from 'next';

// Classroom requires an account, so keep it (and /classroom/[id]) out of search.
export const metadata: Metadata = {
  robots: { index: false, follow: true },
};

export default function ClassroomLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
