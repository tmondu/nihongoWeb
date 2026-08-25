'use client';

import React from 'react';
import { Link } from '@/core/i18n/routing';
import { Video, ArrowLeft, Trophy } from 'lucide-react';
import { useClick } from '@/shared/hooks/generic/useAudio';
import { useShadowingStore } from '../../store/useShadowingStore';

interface ShadowingHeaderProps {
  showBackToLibrary?: boolean;
}

export const ShadowingHeader: React.FC<ShadowingHeaderProps> = ({
  showBackToLibrary,
}) => {
  const { playClick } = useClick();
  const { completedDialogueIds } = useShadowingStore();

  return (
    <div className='flex flex-col gap-4 border-b border-(--border-color) pb-6 sm:flex-row sm:items-center sm:justify-between'>
      <div className='space-y-1'>
        {showBackToLibrary ? (
          <Link
            href='/shadowing'
            onClick={playClick}
            className='mb-2 inline-flex items-center gap-1.5 rounded-2xl border border-(--border-color) bg-(--card-color) px-3.5 py-1.5 text-xs font-semibold text-(--secondary-color) hover:text-(--main-color)'
          >
            <ArrowLeft className='size-3.5' />
            <span>Thư viện Shadowing</span>
          </Link>
        ) : (
          <div className='flex items-center gap-2'>
            <div className='flex size-9 items-center justify-center rounded-2xl bg-(--main-color) text-(--background-color) shadow-md'>
              <Video className='size-5' />
            </div>
            <h1 className='text-2xl font-black tracking-tight text-(--main-color) sm:text-3xl'>
              Shadowing Video
            </h1>
            <span className='rounded-full bg-(--main-color)/15 px-2.5 py-0.5 text-xs font-black text-(--main-color)'>
              PRO
            </span>
          </div>
        )}

        <p className='max-w-xl text-xs text-(--secondary-color) sm:text-sm'>
          Luyện nói nhại theo từng câu của người bản xứ trong video để chuẩn hóa
          ngữ điệu và phản xạ giao tiếp tự nhiên.
        </p>
      </div>

      {/* Progress Badge */}
      <div className='flex items-center gap-2.5 rounded-2xl border border-(--border-color) bg-(--card-color) px-4 py-2.5 shadow-sm'>
        <Trophy className='size-5 text-amber-500' />
        <div className='text-xs'>
          <div className='font-bold text-(--main-color)'>
            {completedDialogueIds.length} câu
          </div>
          <div className='text-[11px] text-(--secondary-color)'>
            Đã phát âm thành thạo
          </div>
        </div>
      </div>
    </div>
  );
};
