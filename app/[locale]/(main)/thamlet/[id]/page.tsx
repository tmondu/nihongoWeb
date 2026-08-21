'use client';

import React, { use } from 'react';
import { useThamletStore } from '@/features/Thamlet';
import { Link } from '@/core/i18n/routing';
import {
  ArrowLeft,
  Play,
  Grid,
  HelpCircle,
  FileCheck2,
  Volume2,
  Star,
  Edit,
  RotateCcw,
  Sparkles,
  Layers,
} from 'lucide-react';
import { useClick } from '@/shared/hooks/generic/useAudio';
import clsx from 'clsx';

interface DeckDetailPageProps {
  params: Promise<{ id: string }>;
}

export default function DeckDetailPage({ params }: DeckDetailPageProps) {
  const { id } = use(params);
  const { playClick } = useClick();
  const { getDeck, toggleStarCard, resetDeckProgress } = useThamletStore();

  const deck = getDeck(id);

  if (!deck) {
    return (
      <div className='mx-auto max-w-3xl px-4 py-16 text-center'>
        <Layers className='mx-auto size-12 text-(--secondary-color)' />
        <h2 className='mt-4 text-2xl font-bold text-(--main-color)'>
          Không tìm thấy bộ thẻ
        </h2>
        <p className='mt-1 text-sm text-(--secondary-color)'>
          Bộ thẻ này có thể đã bị xóa hoặc đường dẫn không tồn tại.
        </p>
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

  // Phát âm tiếng Nhật Web Speech API
  const playAudio = (text: string) => {
    if (typeof window === 'undefined' || !window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'ja-JP';
    utterance.rate = 0.9;
    window.speechSynthesis.speak(utterance);
  };

  const masteredCount = deck.cards.filter(c => (c.boxLevel || 0) >= 3).length;
  const masteryPercent =
    deck.cards.length > 0
      ? Math.round((masteredCount / deck.cards.length) * 100)
      : 0;

  return (
    <div className='mx-auto max-w-5xl space-y-8 px-4 py-8 sm:px-6'>
      {/* Top navigation */}
      <div className='flex items-center justify-between'>
        <Link
          href='/thamlet'
          onClick={playClick}
          className='inline-flex items-center gap-2 rounded-2xl border border-(--border-color) bg-(--card-color) px-4 py-2 text-sm font-semibold text-(--secondary-color) hover:text-(--main-color)'
        >
          <ArrowLeft className='size-4' />
          Thư viện Thamlet
        </Link>

        <div className='flex items-center gap-2'>
          <button
            type='button'
            onClick={() => {
              playClick();
              if (
                confirm(
                  'Bạn có chắc muốn đặt lại toàn bộ tiến độ của bộ thẻ này?',
                )
              ) {
                resetDeckProgress(deck.id);
              }
            }}
            className='inline-flex items-center gap-1.5 rounded-2xl border border-(--border-color) bg-(--card-color) px-3.5 py-2 text-xs font-semibold text-(--secondary-color) hover:text-(--main-color)'
          >
            <RotateCcw className='size-3.5' />
            <span>Đặt lại tiến độ</span>
          </button>

          <Link
            href={`/thamlet/${deck.id}/edit`}
            onClick={playClick}
            className='inline-flex items-center gap-1.5 rounded-2xl border border-(--border-color) bg-(--card-color) px-4 py-2 text-xs font-semibold text-(--main-color) hover:border-(--main-color)'
          >
            <Edit className='size-3.5' />
            <span>Chỉnh sửa</span>
          </Link>
        </div>
      </div>

      {/* Deck Overview Banner */}
      <div className='rounded-3xl border-2 border-(--border-color) bg-(--card-color) p-6 shadow-sm sm:p-8'>
        <div className='mb-3 flex flex-wrap items-center gap-2'>
          {deck.isSample && (
            <span className='inline-flex items-center gap-1 rounded-full bg-(--main-color)/15 px-3 py-1 text-xs font-bold text-(--main-color)'>
              <Sparkles className='size-3' />
              Mẫu PThamSS
            </span>
          )}
          {deck.tags?.map((t, idx) => (
            <span
              key={idx}
              className='rounded-full bg-(--background-color) px-3 py-1 text-xs font-medium text-(--secondary-color)'
            >
              #{t}
            </span>
          ))}
        </div>

        <h1 className='text-2xl font-extrabold text-(--main-color) sm:text-3xl'>
          {deck.title}
        </h1>
        {deck.description && (
          <p className='mt-2 max-w-2xl text-sm text-(--secondary-color)'>
            {deck.description}
          </p>
        )}

        {/* Progress & Quick Stats */}
        <div className='mt-6 flex flex-wrap items-center gap-6 border-t border-(--border-color)/60 pt-4 text-xs text-(--secondary-color) sm:text-sm'>
          <div>
            <span className='font-bold text-(--main-color)'>
              {deck.cards.length}
            </span>{' '}
            từ vựng
          </div>
          <div>
            <span className='font-bold text-emerald-500'>{masteredCount}</span>{' '}
            đã thuộc
          </div>
          <div>
            <span className='font-bold text-amber-500'>
              {deck.cards.length - masteredCount}
            </span>{' '}
            đang học
          </div>
          <div className='ml-auto font-bold text-(--main-color)'>
            Độ thành thục: {masteryPercent}%
          </div>
        </div>
      </div>

      {/* 4 Study Modes Grid */}
      <div>
        <h2 className='mb-4 text-xl font-bold text-(--main-color)'>
          Chọn chế độ học
        </h2>
        <div className='grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4'>
          {/* Flashcards */}
          <Link
            href={`/thamlet/${deck.id}/flashcards`}
            onClick={playClick}
            className='group flex flex-col justify-between rounded-3xl border-2 border-(--border-color) bg-(--card-color) p-5 shadow-sm transition-all hover:-translate-y-1 hover:border-(--main-color) hover:shadow-md'
          >
            <div className='flex items-center gap-3'>
              <div className='flex size-11 items-center justify-center rounded-2xl bg-(--main-color) text-(--background-color)'>
                <Play className='size-5 fill-current' />
              </div>
              <div>
                <h3 className='text-base font-bold text-(--main-color)'>
                  Thẻ ghi nhớ
                </h3>
                <p className='text-xs text-(--secondary-color)'>
                  Flashcards 3D
                </p>
              </div>
            </div>
            <p className='mt-4 text-xs text-(--secondary-color)'>
              Lật thẻ xem nghĩa, vuốt chạm và ghi nhớ từng từ.
            </p>
          </Link>

          {/* Match Game */}
          <Link
            href={`/thamlet/${deck.id}/match`}
            onClick={playClick}
            className='group flex flex-col justify-between rounded-3xl border-2 border-(--border-color) bg-(--card-color) p-5 shadow-sm transition-all hover:-translate-y-1 hover:border-(--main-color) hover:shadow-md'
          >
            <div className='flex items-center gap-3'>
              <div className='flex size-11 items-center justify-center rounded-2xl bg-amber-500/20 text-amber-500'>
                <Grid className='size-5' />
              </div>
              <div>
                <h3 className='text-base font-bold text-(--main-color)'>
                  Ghép thẻ
                </h3>
                <p className='text-xs text-(--secondary-color)'>Match Game</p>
              </div>
            </div>
            <p className='mt-4 text-xs text-(--secondary-color)'>
              Nối từ tiếng Nhật với nghĩa đúng nhanh nhất để ghi điểm.
            </p>
          </Link>

          {/* Learn Mode */}
          <Link
            href={`/thamlet/${deck.id}/learn`}
            onClick={playClick}
            className='group flex flex-col justify-between rounded-3xl border-2 border-(--border-color) bg-(--card-color) p-5 shadow-sm transition-all hover:-translate-y-1 hover:border-(--main-color) hover:shadow-md'
          >
            <div className='flex items-center gap-3'>
              <div className='flex size-11 items-center justify-center rounded-2xl bg-purple-500/20 text-purple-500'>
                <HelpCircle className='size-5' />
              </div>
              <div>
                <h3 className='text-base font-bold text-(--main-color)'>
                  Học thông minh
                </h3>
                <p className='text-xs text-(--secondary-color)'>Learn SRS</p>
              </div>
            </div>
            <p className='mt-4 text-xs text-(--secondary-color)'>
              Luyện tập trắc nghiệm và lặp lại các từ bạn hay quên.
            </p>
          </Link>

          {/* Test Mode */}
          <Link
            href={`/thamlet/${deck.id}/test`}
            onClick={playClick}
            className='group flex flex-col justify-between rounded-3xl border-2 border-(--border-color) bg-(--card-color) p-5 shadow-sm transition-all hover:-translate-y-1 hover:border-(--main-color) hover:shadow-md'
          >
            <div className='flex items-center gap-3'>
              <div className='flex size-11 items-center justify-center rounded-2xl bg-emerald-500/20 text-emerald-500'>
                <FileCheck2 className='size-5' />
              </div>
              <div>
                <h3 className='text-base font-bold text-(--main-color)'>
                  Kiểm tra
                </h3>
                <p className='text-xs text-(--secondary-color)'>Test Mode</p>
              </div>
            </div>
            <p className='mt-4 text-xs text-(--secondary-color)'>
              Tự tạo bài thi trắc nghiệm tổng hợp chấm điểm %.
            </p>
          </Link>
        </div>
      </div>

      {/* Cards Table / List */}
      <div className='space-y-4'>
        <div className='flex items-center justify-between'>
          <h2 className='text-xl font-bold text-(--main-color)'>
            Danh sách từ trong bộ ({deck.cards.length} thẻ)
          </h2>
        </div>

        <div className='space-y-2.5'>
          {deck.cards.map((card, idx) => (
            <div
              key={card.id || idx}
              className='flex items-center justify-between rounded-2xl border border-(--border-color) bg-(--card-color) p-4 transition-all hover:border-(--main-color)/50'
            >
              {/* Term & Reading */}
              <div className='flex-1 pr-4'>
                <div className='flex items-center gap-2'>
                  <button
                    type='button'
                    onClick={() => playAudio(card.term)}
                    className='rounded-lg p-1 text-(--secondary-color) transition-colors hover:bg-(--background-color) hover:text-(--main-color)'
                    title='Phát âm'
                  >
                    <Volume2 className='size-4' />
                  </button>
                  <span className='text-lg font-bold text-(--main-color)'>
                    {card.term}
                  </span>
                  {card.reading && (
                    <span className='text-xs text-(--secondary-color)'>
                      [{card.reading}]
                    </span>
                  )}
                </div>
                {card.example && (
                  <p className='mt-1 text-xs text-(--secondary-color) italic'>
                    VD: {card.example}
                  </p>
                )}
              </div>

              {/* Definition */}
              <div className='flex-1 border-l border-(--border-color)/50 pl-4 text-sm font-medium text-(--main-color)'>
                {card.definition}
              </div>

              {/* Star toggle */}
              <button
                type='button'
                onClick={() => toggleStarCard(deck.id, card.id)}
                className={clsx(
                  'ml-2 rounded-lg p-1.5 transition-colors',
                  card.isStarred
                    ? 'text-amber-400'
                    : 'text-(--secondary-color) hover:text-(--main-color)',
                )}
              >
                <Star
                  className={clsx('size-4', card.isStarred && 'fill-current')}
                />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
