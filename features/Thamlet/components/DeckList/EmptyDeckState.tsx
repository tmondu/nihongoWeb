'use client';

import React from 'react';
import { Layers, Plus, FileSpreadsheet } from 'lucide-react';
import { Link } from '@/core/i18n/routing';
import { useClick } from '@/shared/hooks/generic/useAudio';

interface EmptyDeckStateProps {
  onOpenImport?: () => void;
}

export const EmptyDeckState: React.FC<EmptyDeckStateProps> = ({
  onOpenImport,
}) => {
  const { playClick } = useClick();

  return (
    <div className='flex flex-col items-center justify-center rounded-3xl border-2 border-dashed border-(--border-color) bg-(--card-color)/40 p-12 text-center'>
      <div className='flex size-16 items-center justify-center rounded-3xl bg-(--main-color)/15 text-(--main-color)'>
        <Layers className='size-8' />
      </div>

      <h3 className='mt-4 text-xl font-bold text-(--main-color)'>
        Chưa có bộ thẻ nào
      </h3>
      <p className='mt-1 max-w-sm text-sm text-(--secondary-color)'>
        Tạo bộ từ vựng cá nhân của riêng bạn hoặc dán danh sách từ vựng từ
        Quizlet / Excel để bắt đầu học ngay.
      </p>

      <div className='mt-6 flex flex-wrap items-center justify-center gap-3'>
        <Link
          href='/thamlet/new'
          onClick={playClick}
          className='inline-flex items-center gap-2 rounded-2xl bg-(--main-color) px-5 py-2.5 text-sm font-semibold text-(--background-color) transition-all hover:opacity-90 active:scale-95'
        >
          <Plus className='size-4' />
          Tạo bộ thẻ mới
        </Link>

        {onOpenImport && (
          <button
            type='button'
            onClick={() => {
              playClick();
              onOpenImport();
            }}
            className='inline-flex items-center gap-2 rounded-2xl border border-(--border-color) bg-(--background-color) px-5 py-2.5 text-sm font-semibold text-(--main-color) transition-all hover:border-(--main-color) active:scale-95'
          >
            <FileSpreadsheet className='size-4' />
            Nhập từ Quizlet / Excel
          </button>
        )}
      </div>
    </div>
  );
};
