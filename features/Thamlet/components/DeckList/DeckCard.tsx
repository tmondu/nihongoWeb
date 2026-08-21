'use client';

import React from 'react';
import { Deck } from '../../types';
import { Link } from '@/core/i18n/routing';
import {
  Layers,
  Sparkles,
  Play,
  Grid,
  HelpCircle,
  MoreVertical,
  Trash2,
  Edit,
  RotateCcw,
} from 'lucide-react';
import { useClick } from '@/shared/hooks/generic/useAudio';
import clsx from 'clsx';

interface DeckCardProps {
  deck: Deck;
  onDelete?: (id: string) => void;
  onResetProgress?: (id: string) => void;
}

export const DeckCard: React.FC<DeckCardProps> = ({
  deck,
  onDelete,
  onResetProgress,
}) => {
  const { playClick } = useClick();
  const [showMenu, setShowMenu] = React.useState(false);

  // Tính tỷ lệ thuộc bài (mastery percent)
  const masteredCards = deck.cards.filter(c => (c.boxLevel || 0) >= 3).length;
  const progressPercent =
    deck.cards.length > 0
      ? Math.round((masteredCards / deck.cards.length) * 100)
      : 0;

  return (
    <div
      className={clsx(
        'group relative flex flex-col justify-between rounded-3xl border-2 border-(--border-color) bg-(--card-color) p-5',
        'transition-all duration-250 hover:-translate-y-1 hover:border-(--main-color)',
        'shadow-sm hover:shadow-md',
      )}
    >
      {/* Header card */}
      <div>
        <div className='flex items-start justify-between gap-3'>
          <div className='flex flex-wrap items-center gap-2'>
            {deck.isSample ? (
              <span className='inline-flex items-center gap-1 rounded-full bg-(--main-color)/15 px-2.5 py-0.5 text-xs font-semibold text-(--main-color)'>
                <Sparkles className='size-3' />
                Mẫu PThamSS
              </span>
            ) : null}
            {deck.tags?.map((tag, idx) => (
              <span
                key={idx}
                className='rounded-full bg-(--background-color) px-2.5 py-0.5 text-xs font-medium text-(--secondary-color)'
              >
                #{tag}
              </span>
            ))}
          </div>

          {/* Action dropdown menu */}
          <div className='relative'>
            <button
              type='button'
              onClick={e => {
                e.preventDefault();
                e.stopPropagation();
                playClick();
                setShowMenu(prev => !prev);
              }}
              className='rounded-xl p-1.5 text-(--secondary-color) transition-colors hover:bg-(--background-color) hover:text-(--main-color)'
              aria-label='Tùy chọn'
            >
              <MoreVertical className='size-5' />
            </button>

            {showMenu && (
              <>
                <div
                  className='fixed inset-0 z-20'
                  onClick={e => {
                    e.stopPropagation();
                    setShowMenu(false);
                  }}
                />
                <div className='absolute right-0 z-30 mt-1 w-44 rounded-2xl border border-(--border-color) bg-(--card-color) p-1.5 shadow-xl'>
                  <Link
                    href={`/thamlet/${deck.id}/edit`}
                    onClick={() => {
                      playClick();
                      setShowMenu(false);
                    }}
                    className='flex items-center gap-2 rounded-xl px-3 py-2 text-sm text-(--main-color) hover:bg-(--background-color)'
                  >
                    <Edit className='size-4' />
                    Chỉnh sửa thẻ
                  </Link>
                  {onResetProgress && (
                    <button
                      type='button'
                      onClick={e => {
                        e.stopPropagation();
                        playClick();
                        setShowMenu(false);
                        onResetProgress(deck.id);
                      }}
                      className='flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm text-(--secondary-color) hover:bg-(--background-color) hover:text-(--main-color)'
                    >
                      <RotateCcw className='size-4' />
                      Đặt lại tiến độ
                    </button>
                  )}
                  {onDelete && !deck.isSample && (
                    <button
                      type='button'
                      onClick={e => {
                        e.stopPropagation();
                        playClick();
                        setShowMenu(false);
                        onDelete(deck.id);
                      }}
                      className='flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm text-red-500 hover:bg-red-500/10'
                    >
                      <Trash2 className='size-4' />
                      Xóa bộ thẻ
                    </button>
                  )}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Title & Description */}
        <Link
          href={`/thamlet/${deck.id}`}
          onClick={playClick}
          className='mt-3 block'
        >
          <h3 className='line-clamp-2 text-xl font-bold text-(--main-color) transition-colors group-hover:text-(--main-color)'>
            {deck.title}
          </h3>
          {deck.description && (
            <p className='mt-1 line-clamp-2 text-sm text-(--secondary-color)'>
              {deck.description}
            </p>
          )}
        </Link>
      </div>

      {/* Footer stats & modes */}
      <div className='mt-5 space-y-4 border-t border-(--border-color)/60 pt-3'>
        {/* Stats */}
        <div className='flex items-center justify-between text-xs text-(--secondary-color)'>
          <div className='flex items-center gap-1.5 font-medium'>
            <Layers className='size-4 text-(--main-color)' />
            <span>{deck.cards.length} thẻ</span>
          </div>
          <div className='flex items-center gap-1 font-semibold text-(--main-color)'>
            <span>Đã thuộc: {progressPercent}%</span>
          </div>
        </div>

        {/* Progress bar */}
        <div className='h-2 w-full overflow-hidden rounded-full bg-(--background-color)'>
          <div
            className='h-full bg-gradient-to-r from-(--main-color) to-(--secondary-color) transition-all duration-500'
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        {/* Quick action buttons */}
        <div className='grid grid-cols-3 gap-2'>
          <Link
            href={`/thamlet/${deck.id}/flashcards`}
            onClick={playClick}
            className='flex items-center justify-center gap-1 rounded-xl bg-(--main-color) py-2 text-xs font-semibold text-(--background-color) transition-transform hover:opacity-90 active:scale-95'
            title='Lật thẻ Flashcard'
          >
            <Play className='size-3.5 fill-current' />
            <span>Lật thẻ</span>
          </Link>

          <Link
            href={`/thamlet/${deck.id}/match`}
            onClick={playClick}
            className='flex items-center justify-center gap-1 rounded-xl border border-(--border-color) bg-(--background-color) py-2 text-xs font-semibold text-(--main-color) transition-transform hover:border-(--main-color) active:scale-95'
            title='Trò chơi nối thẻ ghép từ'
          >
            <Grid className='size-3.5' />
            <span>Ghép từ</span>
          </Link>

          <Link
            href={`/thamlet/${deck.id}/learn`}
            onClick={playClick}
            className='flex items-center justify-center gap-1 rounded-xl border border-(--border-color) bg-(--background-color) py-2 text-xs font-semibold text-(--main-color) transition-transform hover:border-(--main-color) active:scale-95'
            title='Học thích ứng'
          >
            <HelpCircle className='size-3.5' />
            <span>Học</span>
          </Link>
        </div>
      </div>
    </div>
  );
};
