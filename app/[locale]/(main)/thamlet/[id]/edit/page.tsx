'use client';

import React, { use } from 'react';
import { DeckForm, useThamletStore, CreateDeckInput } from '@/features/Thamlet';
import { Link } from '@/core/i18n/routing';
import { ArrowLeft, Layers } from 'lucide-react';
import { useClick } from '@/shared/hooks/generic/useAudio';

interface EditDeckPageProps {
  params: Promise<{ id: string }>;
}

export default function EditDeckPage({ params }: EditDeckPageProps) {
  const { id } = use(params);
  const { playClick } = useClick();
  const { getDeck, updateDeck } = useThamletStore();

  const deck = getDeck(id);

  if (!deck) {
    return (
      <div className='mx-auto max-w-3xl px-4 py-16 text-center'>
        <Layers className='mx-auto size-12 text-(--secondary-color)' />
        <h2 className='mt-4 text-2xl font-bold text-(--main-color)'>
          Không tìm thấy bộ thẻ
        </h2>
        <Link
          href='/thamlet'
          onClick={playClick}
          className='mt-6 inline-flex items-center gap-2 rounded-2xl bg-(--main-color) px-6 py-2.5 text-sm font-bold text-(--background-color)'
        >
          <ArrowLeft className='size-4' />
          Quay lại Thư viện
        </Link>
      </div>
    );
  }

  return (
    <div className='mx-auto max-w-4xl px-4 py-8 sm:px-6'>
      <div className='mb-6'>
        <h1 className='text-2xl font-extrabold text-(--main-color) sm:text-3xl'>
          Chỉnh sửa bộ thẻ
        </h1>
        <p className='text-sm text-(--secondary-color)'>
          Cập nhật tiêu đề, mô tả và thêm/sửa từ vựng trong bộ thẻ
        </p>
      </div>

      <DeckForm
        initialDeck={deck}
        onSave={(deckData: CreateDeckInput) => {
          updateDeck(deck.id, deckData);
          return deck.id;
        }}
      />
    </div>
  );
}
