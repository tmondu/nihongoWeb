'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Deck, FlashCard } from '../../../types';
import { Card3D } from './Card3D';
import {
  ArrowLeft,
  Shuffle,
  RotateCcw,
  Check,
  X,
  Sparkles,
  Trophy,
  List,
  ChevronLeft,
} from 'lucide-react';
import { Link } from '@/core/i18n/routing';
import { useClick } from '@/shared/hooks/generic/useAudio';
import { useThamletStore } from '../../../store/useThamletStore';
import clsx from 'clsx';

interface FlashcardViewerProps {
  deck: Deck;
}

export const FlashcardViewer: React.FC<FlashcardViewerProps> = ({ deck }) => {
  const { playClick } = useClick();
  const { toggleStarCard, recordCardStudyResult } = useThamletStore();

  const [cardsList, setCardsList] = useState<FlashCard[]>(deck.cards);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);

  // Thống kê phiên học
  const [learnedCardIds, setLearnedCardIds] = useState<Set<string>>(new Set());
  const [unlearnedCardIds, setUnlearnedCardIds] = useState<Set<string>>(
    new Set(),
  );

  const currentCard = cardsList[currentIndex];

  const handleNext = useCallback(() => {
    if (currentIndex < cardsList.length - 1) {
      playClick();
      setIsFlipped(false);
      setCurrentIndex(prev => prev + 1);
    } else {
      setIsCompleted(true);
    }
  }, [currentIndex, cardsList.length, playClick]);

  const handlePrev = useCallback(() => {
    if (currentIndex > 0) {
      playClick();
      setIsFlipped(false);
      setCurrentIndex(prev => prev - 1);
    }
  }, [currentIndex, playClick]);

  const handleMarkKnow = useCallback(() => {
    if (!currentCard) return;
    playClick();
    recordCardStudyResult(deck.id, currentCard.id, true);
    setLearnedCardIds(prev => new Set(prev).add(currentCard.id));
    handleNext();
  }, [currentCard, deck.id, recordCardStudyResult, handleNext, playClick]);

  const handleMarkDontKnow = useCallback(() => {
    if (!currentCard) return;
    playClick();
    recordCardStudyResult(deck.id, currentCard.id, false);
    setUnlearnedCardIds(prev => new Set(prev).add(currentCard.id));
    handleNext();
  }, [currentCard, deck.id, recordCardStudyResult, handleNext, playClick]);

  const handleShuffle = () => {
    playClick();
    const shuffled = [...cardsList].sort(() => Math.random() - 0.5);
    setCardsList(shuffled);
    setCurrentIndex(0);
    setIsFlipped(false);
    setIsCompleted(false);
  };

  const handleRestart = () => {
    playClick();
    setCurrentIndex(0);
    setIsFlipped(false);
    setIsCompleted(false);
    setLearnedCardIds(new Set());
    setUnlearnedCardIds(new Set());
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isCompleted) return;

      if (e.code === 'Space') {
        e.preventDefault();
        setIsFlipped(prev => !prev);
      } else if (e.code === 'ArrowRight') {
        e.preventDefault();
        handleMarkKnow();
      } else if (e.code === 'ArrowLeft') {
        e.preventDefault();
        handleMarkDontKnow();
      } else if (e.code === 'ArrowUp' || e.code === 'ArrowDown') {
        e.preventDefault();
        setIsFlipped(prev => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isCompleted, handleMarkKnow, handleMarkDontKnow]);

  // Session Completed Screen
  if (isCompleted || !currentCard) {
    return (
      <div className='mx-auto max-w-xl space-y-6 px-4 py-12 text-center'>
        <div className='mx-auto flex size-20 items-center justify-center rounded-3xl bg-amber-500/20 text-amber-500 shadow-lg'>
          <Trophy className='size-10' />
        </div>

        <h2 className='text-3xl font-black text-(--main-color)'>
          Hoàn thành xuất sắc!
        </h2>
        <p className='text-sm text-(--secondary-color)'>
          Bạn đã hoàn thành lượt ôn tập cho bộ thẻ &quot;{deck.title}&quot;
        </p>

        {/* Stats summary */}
        <div className='grid grid-cols-2 gap-4 rounded-3xl border border-(--border-color) bg-(--card-color) p-6'>
          <div className='border-r border-(--border-color)/60 pr-2'>
            <div className='text-3xl font-black text-emerald-500'>
              {learnedCardIds.size}
            </div>
            <div className='mt-1 text-xs font-semibold text-(--secondary-color)'>
              Đã thuộc (Biết)
            </div>
          </div>
          <div className='pl-2'>
            <div className='text-3xl font-black text-red-500'>
              {unlearnedCardIds.size}
            </div>
            <div className='mt-1 text-xs font-semibold text-(--secondary-color)'>
              Cần ôn lại (Chưa biết)
            </div>
          </div>
        </div>

        {/* Action buttons */}
        <div className='flex flex-wrap items-center justify-center gap-3 pt-4'>
          <button
            type='button'
            onClick={handleRestart}
            className='inline-flex items-center gap-2 rounded-2xl bg-(--main-color) px-6 py-3 text-sm font-bold text-(--background-color) shadow-md transition-all hover:opacity-90 active:scale-95'
          >
            <RotateCcw className='size-4' />
            Ôn tập lại từ đầu
          </button>

          <Link
            href={`/thamlet/${deck.id}/match`}
            onClick={playClick}
            className='inline-flex items-center gap-2 rounded-2xl border border-(--border-color) bg-(--card-color) px-6 py-3 text-sm font-semibold text-(--main-color) hover:border-(--main-color)'
          >
            <Sparkles className='size-4' />
            Chơi game ghép thẻ
          </Link>

          <Link
            href={`/thamlet/${deck.id}`}
            onClick={playClick}
            className='inline-flex items-center gap-2 rounded-2xl border border-(--border-color) bg-(--card-color) px-6 py-3 text-sm font-semibold text-(--secondary-color) hover:text-(--main-color)'
          >
            <List className='size-4' />
            Về chi tiết bộ thẻ
          </Link>
        </div>
      </div>
    );
  }

  const progressPercentage = Math.round(
    ((currentIndex + 1) / cardsList.length) * 100,
  );

  return (
    <div className='mx-auto max-w-2xl space-y-6 px-4 py-6'>
      {/* Top action header */}
      <div className='flex items-center justify-between'>
        <Link
          href={`/thamlet/${deck.id}`}
          onClick={playClick}
          className='inline-flex items-center gap-2 rounded-2xl border border-(--border-color) bg-(--card-color) px-4 py-2 text-xs font-semibold text-(--secondary-color) hover:text-(--main-color)'
        >
          <ArrowLeft className='size-3.5' />
          Thoát
        </Link>

        {/* Counter */}
        <div className='text-sm font-bold text-(--main-color)'>
          {currentIndex + 1} / {cardsList.length}
        </div>

        {/* Shuffle */}
        <button
          type='button'
          onClick={handleShuffle}
          className='rounded-xl p-2 text-(--secondary-color) hover:bg-(--card-color) hover:text-(--main-color)'
          title='Xáo trộn thứ tự thẻ'
        >
          <Shuffle className='size-4' />
        </button>
      </div>

      {/* Progress bar */}
      <div className='h-2 w-full overflow-hidden rounded-full bg-(--card-color)'>
        <div
          className='h-full bg-(--main-color) transition-all duration-300'
          style={{ width: `${progressPercentage}%` }}
        />
      </div>

      {/* 3D Flashcard */}
      <div className='flex justify-center'>
        <Card3D
          card={currentCard}
          isFlipped={isFlipped}
          onFlip={() => setIsFlipped(prev => !prev)}
          onToggleStar={() => toggleStarCard(deck.id, currentCard.id)}
          isStarred={currentCard.isStarred}
        />
      </div>

      {/* Control Buttons */}
      <div className='flex items-center justify-center gap-2 pt-2 sm:gap-4'>
        {/* Nút Lùi lại thẻ trước */}
        <button
          type='button'
          disabled={currentIndex === 0}
          onClick={handlePrev}
          className={clsx(
            'flex size-12 items-center justify-center rounded-2xl border border-(--border-color) bg-(--card-color) text-(--secondary-color) transition-all',
            currentIndex === 0
              ? 'cursor-not-allowed opacity-40'
              : 'hover:border-(--main-color) hover:text-(--main-color) active:scale-95',
          )}
          title='Thẻ trước'
        >
          <ChevronLeft className='size-5' />
        </button>

        {/* Nút Chưa thuộc (Đỏ) */}
        <button
          type='button'
          onClick={handleMarkDontKnow}
          className={clsx(
            'flex items-center justify-center gap-2 rounded-2xl border-2 border-red-500/30 bg-red-500/10 px-4 py-3 sm:px-7',
            'font-bold text-red-500 transition-all hover:bg-red-500 hover:text-white active:scale-95',
          )}
          title='Bấm phím Mũi tên trái (←)'
        >
          <X className='size-5' />
          <span className='text-sm sm:text-base'>Chưa thuộc</span>
        </button>

        {/* Nút Lật thẻ ở giữa */}
        <button
          type='button'
          onClick={() => setIsFlipped(prev => !prev)}
          className='flex size-14 items-center justify-center rounded-2xl border-2 border-(--border-color) bg-(--card-color) text-(--main-color) transition-all hover:border-(--main-color) active:scale-95'
          title='Bấm phím Space để lật'
        >
          <RotateCcw className='size-6' />
        </button>

        {/* Nút Đã thuộc (Xanh) */}
        <button
          type='button'
          onClick={handleMarkKnow}
          className={clsx(
            'flex items-center justify-center gap-2 rounded-2xl border-2 border-emerald-500/30 bg-emerald-500/10 px-5 py-3.5 sm:px-8',
            'font-bold text-emerald-500 transition-all hover:bg-emerald-500 hover:text-white active:scale-95',
          )}
          title='Bấm phím Mũi tên phải (→)'
        >
          <Check className='size-5' />
          <span className='text-sm sm:text-base'>Đã thuộc</span>
        </button>
      </div>

      {/* Keyboard hints */}
      <div className='hidden items-center justify-center gap-6 pt-2 text-xs text-(--secondary-color)/60 sm:flex'>
        <span>Phím [Space]: Lật thẻ</span>
        <span>Phím [←]: Chưa thuộc</span>
        <span>Phím [→]: Đã thuộc</span>
      </div>
    </div>
  );
};
