'use client';

import { CreateCardInput } from '../../types';
import { Trash2, Star } from 'lucide-react';
import { useClick } from '@/shared/hooks/generic/useAudio';
import clsx from 'clsx';

interface CardRowEditorProps {
  index: number;
  card: CreateCardInput;
  onChange: (field: string, value: string | boolean) => void;
  onDelete: () => void;
}

export const CardRowEditor: React.FC<CardRowEditorProps> = ({
  index,
  card,
  onChange,
  onDelete,
}) => {
  const { playClick } = useClick();

  return (
    <div className='group relative flex flex-col gap-3 rounded-2xl border border-(--border-color) bg-(--card-color) p-4 transition-all hover:border-(--main-color)/60'>
      {/* Top action row */}
      <div className='flex items-center justify-between border-b border-(--border-color)/50 pb-2 text-xs font-semibold text-(--secondary-color)'>
        <span className='rounded-md bg-(--background-color) px-2 py-0.5'>
          #{index + 1}
        </span>

        <div className='flex items-center gap-1'>
          <button
            type='button'
            onClick={() => {
              playClick();
              onChange('isStarred', !card.isStarred);
            }}
            className={clsx(
              'rounded-lg p-1 transition-colors',
              card.isStarred
                ? 'text-amber-400'
                : 'text-(--secondary-color) hover:text-(--main-color)',
            )}
            title='Đánh dấu từ quan trọng'
          >
            <Star
              className={clsx('size-4', card.isStarred && 'fill-current')}
            />
          </button>

          <button
            type='button'
            onClick={() => {
              playClick();
              onDelete();
            }}
            className='rounded-lg p-1 text-(--secondary-color) transition-colors hover:bg-red-500/10 hover:text-red-500'
            title='Xóa thẻ này'
          >
            <Trash2 className='size-4' />
          </button>
        </div>
      </div>

      {/* Inputs grid */}
      <div className='grid grid-cols-1 gap-3 sm:grid-cols-2'>
        {/* Thuật ngữ */}
        <div>
          <label className='mb-1 block text-xs font-medium text-(--secondary-color)'>
            Thuật ngữ (Từ vựng / Kanji)
          </label>
          <input
            type='text'
            value={card.term}
            onChange={e => onChange('term', e.target.value)}
            placeholder='Ví dụ: 食べる'
            className='w-full rounded-xl border border-(--border-color) bg-(--background-color) px-3 py-2 text-sm text-(--main-color) placeholder:text-(--secondary-color)/40 focus:border-(--main-color) focus:outline-none'
          />
        </div>

        {/* Định nghĩa */}
        <div>
          <label className='mb-1 block text-xs font-medium text-(--secondary-color)'>
            Định nghĩa (Nghĩa tiếng Việt)
          </label>
          <input
            type='text'
            value={card.definition}
            onChange={e => onChange('definition', e.target.value)}
            placeholder='Ví dụ: Ăn uống'
            className='w-full rounded-xl border border-(--border-color) bg-(--background-color) px-3 py-2 text-sm text-(--main-color) placeholder:text-(--secondary-color)/40 focus:border-(--main-color) focus:outline-none'
          />
        </div>
      </div>

      {/* Extra fields toggle (Reading / Example) */}
      <div className='grid grid-cols-1 gap-3 sm:grid-cols-2'>
        <div>
          <input
            type='text'
            value={card.reading || ''}
            onChange={e => onChange('reading', e.target.value)}
            placeholder='Cách đọc / Furigana (tuỳ chọn: taberu)'
            className='w-full rounded-xl border border-(--border-color) bg-(--background-color) px-3 py-1.5 text-xs text-(--main-color) placeholder:text-(--secondary-color)/40 focus:border-(--main-color) focus:outline-none'
          />
        </div>
        <div>
          <input
            type='text'
            value={card.example || ''}
            onChange={e => onChange('example', e.target.value)}
            placeholder='Câu ví dụ (tuỳ chọn: ご飯を食べる)'
            className='w-full rounded-xl border border-(--border-color) bg-(--background-color) px-3 py-1.5 text-xs text-(--main-color) placeholder:text-(--secondary-color)/40 focus:border-(--main-color) focus:outline-none'
          />
        </div>
      </div>
    </div>
  );
};
