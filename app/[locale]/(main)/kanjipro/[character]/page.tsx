'use client';

import { use, Suspense } from 'react';
import { KanjiCardStudyClient } from '@/features/Kanji';

export default function KanjiProCharacterPage({
  params,
}: {
  params: Promise<{ character: string }>;
}) {
  const resolvedParams = use(params);
  const character = decodeURIComponent(resolvedParams.character || '');

  return (
    <Suspense>
      <KanjiCardStudyClient initialCharacter={character} />
    </Suspense>
  );
}
