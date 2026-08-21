'use client';

import React, { use } from 'react';
import { useThamletStore } from '@/features/Thamlet';
import { FlashcardViewer } from '@/features/Thamlet/components/StudyModes/Flashcards/FlashcardViewer';
import { Link } from '@/core/i18n/routing';
import { ArrowLeft, Layers } from 'lucide-react';
import { useClick } from '@/shared/hooks/generic/useAudio';

interface FlashcardsPageProps {
  params: Promise<{ id: string }>;
}

export default function FlashcardsPage({ params }: FlashcardsPageProps) {
  const { id } = use(params);
  const { playClick } = useClick();
  const { getDeck } = useThamletStore();

  const deck = getDeck(id);

  if (!deck || deck.cards.length === 0) {
    return (
      <div className='mx-auto max-w-3xl px-4 py-16 text-center'>
        <Layers className='mx-auto size-12 text-(--secondary-color)' />
        <h2 className='mt-4 text-2xl font-bold text-(--main-color)'>
          Không có từ vựng nào trong bộ thẻ
        </h2>
        <p className='mt-1 text-sm text-(--secondary-color)'>
          Vui lòng thêm ít nhất 2 thẻ từ vựng trước khi bắt đầu học.
        </p>
        <Link
          href={`/thamlet/${id}`}
          onClick={playClick}
          className='mt-6 inline-flex items-center gap-2 rounded-2xl bg-(--main-color) px-6 py-2.5 text-sm font-bold text-(--background-color)'
        >
          <ArrowLeft className='size-4' />
          Quay lại bộ thẻ
        </Link>
      </div>
    );
  }

  return <FlashcardViewer deck={deck} />;
}
