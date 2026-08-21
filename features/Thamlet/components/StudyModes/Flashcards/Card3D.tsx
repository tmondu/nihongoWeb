'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Volume2, Star, RotateCw } from 'lucide-react';
import { FlashCard } from '../../../types';
import { useClick } from '@/shared/hooks/generic/useAudio';
import clsx from 'clsx';

interface Card3DProps {
  card: FlashCard;
  isFlipped: boolean;
  onFlip: () => void;
  onToggleStar: () => void;
  isStarred?: boolean;
}

export const Card3D: React.FC<Card3DProps> = ({
  card,
  isFlipped,
  onFlip,
  onToggleStar,
  isStarred,
}) => {
  const { playClick } = useClick();

  const playAudio = (e: React.MouseEvent, text: string) => {
    e.stopPropagation();
    if (typeof window === 'undefined' || !window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'ja-JP';
    utterance.rate = 0.9;
    window.speechSynthesis.speak(utterance);
  };

  return (
    <div
      className='relative h-80 w-full max-w-xl cursor-pointer select-none sm:h-96'
      style={{ perspective: 1200 }}
      onClick={onFlip}
    >
      <motion.div
        className='relative h-full w-full'
        style={{ transformStyle: 'preserve-3d' }}
        animate={{ rotateY: isFlipped ? 180 : 0 }}
        transition={{ duration: 0.45, ease: [0.23, 1, 0.32, 1] }}
      >
        {/* Mặt trước (Term / Từ vựng) */}
        <div
          className={clsx(
            'absolute inset-0 flex flex-col justify-between rounded-3xl border-2 border-(--border-color) bg-(--card-color) p-6 shadow-xl sm:p-8',
            'backface-hidden',
          )}
          style={{ backfaceVisibility: 'hidden' }}
        >
          {/* Top Bar */}
          <div className='flex items-center justify-between text-xs text-(--secondary-color)'>
            <span className='font-semibold tracking-wider uppercase'>
              Thuật ngữ / Từ vựng
            </span>
            <div className='flex items-center gap-2'>
              <button
                type='button'
                onClick={e => playAudio(e, card.term)}
                className='rounded-xl p-2 text-(--secondary-color) hover:bg-(--background-color) hover:text-(--main-color)'
                title='Nghe phát âm'
              >
                <Volume2 className='size-5' />
              </button>

              <button
                type='button'
                onClick={e => {
                  e.stopPropagation();
                  playClick();
                  onToggleStar();
                }}
                className={clsx(
                  'rounded-xl p-2 transition-colors',
                  isStarred
                    ? 'text-amber-400'
                    : 'text-(--secondary-color) hover:text-(--main-color)',
                )}
                title='Đánh dấu từ quan trọng'
              >
                <Star className={clsx('size-5', isStarred && 'fill-current')} />
              </button>
            </div>
          </div>

          {/* Center Term */}
          <div className='my-auto flex flex-col items-center justify-center text-center'>
            <h2 className='text-4xl font-black tracking-wide text-(--main-color) sm:text-5xl'>
              {card.term}
            </h2>
            {card.reading && (
              <p className='mt-3 text-base font-medium text-(--secondary-color) sm:text-lg'>
                [{card.reading}]
              </p>
            )}
          </div>

          {/* Bottom hint */}
          <div className='flex items-center justify-center gap-1.5 text-xs text-(--secondary-color)/70'>
            <RotateCw className='size-3.5' />
            <span>Chạm hoặc bấm Space để lật xem nghĩa</span>
          </div>
        </div>

        {/* Mặt sau (Definition / Định nghĩa) */}
        <div
          className={clsx(
            'absolute inset-0 flex flex-col justify-between rounded-3xl border-2 border-(--main-color) bg-(--card-color) p-6 shadow-xl sm:p-8',
            'backface-hidden',
          )}
          style={{
            backfaceVisibility: 'hidden',
            transform: 'rotateY(180deg)',
          }}
        >
          {/* Top Bar */}
          <div className='flex items-center justify-between text-xs text-(--secondary-color)'>
            <span className='font-semibold tracking-wider text-(--main-color) uppercase'>
              Định nghĩa / Ý nghĩa
            </span>
            <div className='flex items-center gap-2'>
              <button
                type='button'
                onClick={e => playAudio(e, card.term)}
                className='rounded-xl p-2 text-(--secondary-color) hover:bg-(--background-color) hover:text-(--main-color)'
              >
                <Volume2 className='size-5' />
              </button>
            </div>
          </div>

          {/* Center Definition */}
          <div className='my-auto flex flex-col items-center justify-center text-center'>
            <h3 className='text-2xl leading-relaxed font-extrabold text-(--main-color) sm:text-3xl'>
              {card.definition}
            </h3>
            {card.example && (
              <div className='mt-4 max-w-md rounded-2xl bg-(--background-color)/80 px-4 py-2 text-xs text-(--secondary-color) italic sm:text-sm'>
                VD: {card.example}
              </div>
            )}
          </div>

          {/* Bottom hint */}
          <div className='flex items-center justify-center gap-1.5 text-xs text-(--secondary-color)/70'>
            <RotateCw className='size-3.5' />
            <span>Chạm để lật lại</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
