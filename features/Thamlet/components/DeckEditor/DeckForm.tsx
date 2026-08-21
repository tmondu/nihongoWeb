'use client';

import React, { useState } from 'react';
import { Deck, CreateDeckInput, CreateCardInput } from '../../types';
import { CardRowEditor } from './CardRowEditor';
import { ImportModal } from './ImportModal';
import {
  Plus,
  FileSpreadsheet,
  Save,
  ArrowLeft,
  Tag,
  BookOpen,
} from 'lucide-react';
import { Link, useRouter } from '@/core/i18n/routing';
import { useClick } from '@/shared/hooks/generic/useAudio';

interface DeckFormProps {
  initialDeck?: Deck;
  onSave: (deckData: CreateDeckInput) => string; // Trả về deck id
}

export const DeckForm: React.FC<DeckFormProps> = ({ initialDeck, onSave }) => {
  const { playClick } = useClick();
  const router = useRouter();

  const [title, setTitle] = useState(initialDeck?.title || '');
  const [description, setDescription] = useState(
    initialDeck?.description || '',
  );
  const [tagsInput, setTagsInput] = useState(
    initialDeck?.tags?.join(', ') || '',
  );
  const [isImportOpen, setIsImportOpen] = useState(false);

  const [cards, setCards] = useState<CreateCardInput[]>(
    initialDeck?.cards && initialDeck.cards.length > 0
      ? initialDeck.cards
      : [
          { term: '', definition: '', reading: '', example: '' },
          { term: '', definition: '', reading: '', example: '' },
          { term: '', definition: '', reading: '', example: '' },
        ],
  );

  const handleAddCard = () => {
    playClick();
    setCards(prev => [
      ...prev,
      { term: '', definition: '', reading: '', example: '' },
    ]);
  };

  const handleCardChange = (
    index: number,
    field: string,
    value: string | boolean,
  ) => {
    setCards(prev => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: value };
      return next;
    });
  };

  const handleDeleteCard = (index: number) => {
    setCards(prev => prev.filter((_, i) => i !== index));
  };

  const handleImportCards = (importedCards: CreateCardInput[]) => {
    setCards(prev => {
      // Lọc bỏ những thẻ hoàn toàn trống
      const nonEmpty = prev.filter(
        c => c.term.trim() !== '' || c.definition.trim() !== '',
      );
      return [...nonEmpty, ...importedCards];
    });
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      alert('Vui lòng nhập tên bộ thẻ!');
      return;
    }

    const validCards = cards.filter(
      c => c.term.trim() !== '' && c.definition.trim() !== '',
    );
    if (validCards.length < 2) {
      alert('Một bộ thẻ cần tối thiểu ít nhất 2 thẻ từ vựng!');
      return;
    }

    playClick();

    const parsedTags = tagsInput
      .split(',')
      .map(t => t.trim())
      .filter(t => t.length > 0);

    const savedId = onSave({
      title: title.trim(),
      description: description.trim() || undefined,
      tags: parsedTags,
      cards: validCards,
    });

    router.push(`/thamlet/${savedId}`);
  };

  return (
    <form onSubmit={handleSave} className='space-y-6 pb-20'>
      {/* Top action bar */}
      <div className='flex flex-wrap items-center justify-between gap-4 border-b border-(--border-color) pb-4'>
        <Link
          href='/thamlet'
          onClick={playClick}
          className='inline-flex items-center gap-2 rounded-2xl border border-(--border-color) bg-(--card-color) px-4 py-2 text-sm font-semibold text-(--secondary-color) hover:text-(--main-color)'
        >
          <ArrowLeft className='size-4' />
          Quay lại Thư viện
        </Link>

        <div className='flex items-center gap-2.5'>
          <button
            type='button'
            onClick={() => {
              playClick();
              setIsImportOpen(true);
            }}
            className='inline-flex items-center gap-2 rounded-2xl border border-(--border-color) bg-(--card-color) px-4 py-2 text-sm font-semibold text-(--main-color) transition-all hover:border-(--main-color)'
          >
            <FileSpreadsheet className='size-4' />
            <span>Nhập từ Quizlet</span>
          </button>

          <button
            type='submit'
            className='inline-flex items-center gap-2 rounded-2xl bg-(--main-color) px-6 py-2 text-sm font-bold text-(--background-color) shadow-md transition-all hover:opacity-90 active:scale-95'
          >
            <Save className='size-4' />
            <span>{initialDeck ? 'Cập nhật' : 'Lưu bộ thẻ'}</span>
          </button>
        </div>
      </div>

      {/* Deck Metadata inputs */}
      <div className='space-y-4 rounded-3xl border-2 border-(--border-color) bg-(--card-color) p-6 shadow-sm'>
        <div className='flex items-center gap-2 text-lg font-bold text-(--main-color)'>
          <BookOpen className='size-5' />
          <span>Thông tin bộ thẻ</span>
        </div>

        <div>
          <label className='mb-1 block text-xs font-semibold text-(--secondary-color)'>
            Tiêu đề bộ thẻ <span className='text-red-500'>*</span>
          </label>
          <input
            type='text'
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder='Ví dụ: 50 Từ vựng N5 Bài 1 - Minna no Nihongo'
            required
            className='w-full rounded-2xl border border-(--border-color) bg-(--background-color) px-4 py-2.5 text-base font-semibold text-(--main-color) placeholder:text-(--secondary-color)/40 focus:border-(--main-color) focus:outline-none'
          />
        </div>

        <div className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
          <div>
            <label className='mb-1 block text-xs font-semibold text-(--secondary-color)'>
              Mô tả ngắn (tuỳ chọn)
            </label>
            <input
              type='text'
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder='Ghi chú về chủ đề, bài học...'
              className='w-full rounded-2xl border border-(--border-color) bg-(--background-color) px-4 py-2 text-sm text-(--main-color) placeholder:text-(--secondary-color)/40 focus:border-(--main-color) focus:outline-none'
            />
          </div>

          <div>
            <label className='mb-1 block text-xs font-semibold text-(--secondary-color)'>
              Thẻ phân loại (ngăn cách bằng dấu phẩy)
            </label>
            <div className='relative'>
              <Tag className='absolute top-2.5 left-3.5 size-4 text-(--secondary-color)' />
              <input
                type='text'
                value={tagsInput}
                onChange={e => setTagsInput(e.target.value)}
                placeholder='N5, Từ vựng, Động từ...'
                className='w-full rounded-2xl border border-(--border-color) bg-(--background-color) py-2 pr-4 pl-10 text-sm text-(--main-color) placeholder:text-(--secondary-color)/40 focus:border-(--main-color) focus:outline-none'
              />
            </div>
          </div>
        </div>
      </div>

      {/* Cards List */}
      <div className='space-y-4'>
        <div className='flex items-center justify-between'>
          <h3 className='text-lg font-bold text-(--main-color)'>
            Danh sách từ vựng ({cards.length} thẻ)
          </h3>
        </div>

        <div className='space-y-3'>
          {cards.map((card, idx) => (
            <CardRowEditor
              key={idx}
              index={idx}
              card={card}
              onChange={(field, val) => handleCardChange(idx, field, val)}
              onDelete={() => handleDeleteCard(idx)}
            />
          ))}
        </div>

        {/* Add Card & Import actions */}
        <div className='flex flex-wrap items-center justify-center gap-3 pt-4'>
          <button
            type='button'
            onClick={handleAddCard}
            className='inline-flex items-center gap-2 rounded-2xl border-2 border-dashed border-(--border-color) bg-(--card-color)/60 px-6 py-3 text-sm font-bold text-(--main-color) transition-all hover:border-(--main-color) hover:bg-(--card-color)'
          >
            <Plus className='size-4' />
            Thêm thẻ mới
          </button>

          <button
            type='button'
            onClick={() => {
              playClick();
              setIsImportOpen(true);
            }}
            className='inline-flex items-center gap-2 rounded-2xl border border-(--border-color) bg-(--card-color) px-6 py-3 text-sm font-semibold text-(--secondary-color) hover:text-(--main-color)'
          >
            <FileSpreadsheet className='size-4' />
            Nhập hàng loạt từ Quizlet
          </button>
        </div>
      </div>

      {/* Import Modal */}
      <ImportModal
        isOpen={isImportOpen}
        onClose={() => setIsImportOpen(false)}
        onImport={handleImportCards}
      />
    </form>
  );
};
