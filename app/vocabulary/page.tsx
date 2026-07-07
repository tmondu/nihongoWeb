// src/app/vocabulary/page.tsx
'use client';

import { useLocale } from 'next-intl';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

/**
 * Because `localePrefix` is set to "never" the URL does not contain a locale segment.
 * This page redirects to the locale‑aware route, e.g. `/vi/vocabulary`.
 */
export default function VocabularyRedirect() {
  const locale = useLocale();
  const router = useRouter();

  useEffect(() => {
    const target = `/${locale}/vocabulary`;
    router.replace(target);
  }, [locale, router]);

  return null;
}
