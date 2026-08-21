'use client';

import React from 'react';
import { Sparkles, Plus, FileSpreadsheet, Layers } from 'lucide-react';
import { Link } from '@/core/i18n/routing';
import { useClick } from '@/shared/hooks/generic/useAudio';

interface ThamletHeaderProps {
  onOpenImport?: () => void;
}

export const ThamletHeader: React.FC<ThamletHeaderProps> = ({
  onOpenImport,
}) => {
  const { playClick } = useClick();

  return (
    <div className='flex flex-col gap-4 border-b border-(--border-color) pb-6 sm:flex-row sm:items-center sm:justify-between'>
      <div className='flex items-center gap-3'>
        <div className='flex size-12 items-center justify-center rounded-2xl bg-(--main-color) text-(--background-color) shadow-md'>
          <Layers className='size-6' />
        </div>
        <div>
          <div className='flex items-center gap-2'>
            <h1 className='text-2xl font-extrabold text-(--main-color) sm:text-3xl'>
              Thamlet
            </h1>
            <span className='inline-flex items-center gap-1 rounded-full bg-(--main-color)/15 px-2.5 py-0.5 text-xs font-bold text-(--main-color)'>
              <Sparkles className='size-3' />
              Flashcards
            </span>
          </div>
          <p className='text-xs text-(--secondary-color) sm:text-sm'>
            Học từ vựng & Kanji qua thẻ ghi nhớ, ghép từ và bài kiểm tra thông
            minh
          </p>
        </div>
      </div>

      {/* Action buttons */}
      <div className='flex items-center gap-2.5'>
        {onOpenImport && (
          <button
            type='button'
            onClick={() => {
              playClick();
              onOpenImport();
            }}
            className='inline-flex items-center gap-2 rounded-2xl border border-(--border-color) bg-(--card-color) px-4 py-2.5 text-sm font-semibold text-(--secondary-color) transition-all hover:border-(--main-color) hover:text-(--main-color)'
          >
            <FileSpreadsheet className='size-4' />
            <span className='hidden sm:inline'>Nhập từ Quizlet</span>
            <span className='sm:hidden'>Import</span>
          </button>
        )}

        <Link
          href='/thamlet/new'
          onClick={playClick}
          className='inline-flex items-center gap-2 rounded-2xl bg-(--main-color) px-5 py-2.5 text-sm font-bold text-(--background-color) shadow-md transition-all hover:opacity-90 active:scale-95'
        >
          <Plus className='size-4' />
          <span>Tạo bộ thẻ mới</span>
        </Link>
      </div>
    </div>
  );
};
