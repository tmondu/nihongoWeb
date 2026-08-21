'use client';

import React from 'react';
import { DeckForm, useThamletStore, CreateDeckInput } from '@/features/Thamlet';

export default function NewDeckPage() {
  const { addDeck } = useThamletStore();

  return (
    <div className='mx-auto max-w-4xl px-4 py-8 sm:px-6'>
      <div className='mb-6'>
        <h1 className='text-2xl font-extrabold text-(--main-color) sm:text-3xl'>
          Tạo bộ thẻ mới
        </h1>
        <p className='text-sm text-(--secondary-color)'>
          Thêm các từ vựng, kanji hoặc mẫu câu bạn muốn ghi nhớ vào bộ thẻ
        </p>
      </div>

      <DeckForm onSave={(deckData: CreateDeckInput) => addDeck(deckData)} />
    </div>
  );
}
