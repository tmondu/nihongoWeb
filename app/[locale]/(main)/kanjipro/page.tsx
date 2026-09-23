'use client';

import { Suspense } from 'react';
import { KanjiCardStudyClient } from '@/features/Kanji';

export default function KanjiProPage() {
  return (
    <Suspense>
      <KanjiCardStudyClient />
    </Suspense>
  );
}
