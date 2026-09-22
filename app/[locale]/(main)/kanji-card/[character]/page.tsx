'use client';

import { use } from 'react';
import { KanjiCardStudyClient } from '@/features/Kanji';

export default function KanjiCardCharacterPage({
  params,
}: {
  params: Promise<{ character: string }>;
}) {
  const resolvedParams = use(params);
  const character = decodeURIComponent(resolvedParams.character || '');

  return <KanjiCardStudyClient initialCharacter={character} />;
}
