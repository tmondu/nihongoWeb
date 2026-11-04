'use client';

import { useEffect, useCallback, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Volume2,
  RotateCcw,
  Check,
  X,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { cn } from '@/shared/utils/utils';
import type { VocabWord } from '../../types/study';

interface VocabFlashcardHeroProps {
  words: VocabWord[];
  lessonId: number;
  cursor: number;
  learned: string[];
  onMarkLearned: () => void;
  onMarkNotLearned: () => void;
  onNavigate: (dir: -1 | 1) => void;
}

function speak(text: string) {
  if (typeof window === 'undefined') return;
  window.speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text);
  u.lang = 'ja-JP';
  u.rate = 0.85;
  window.speechSynthesis.speak(u);
}

export default function VocabFlashcardHero({
  words,
  lessonId,
  cursor,
  learned,
  onMarkLearned,
  onMarkNotLearned,
  onNavigate,
}: VocabFlashcardHeroProps) {
  const [flipped, setFlipped] = useState(false);

  const word = words[cursor];
  const learnedKey = word ? `${lessonId}:${word.hira}` : '';
  const isLearned = learned.includes(learnedKey);
  const learnedCount = words.filter(w =>
    learned.includes(`${lessonId}:${w.hira}`),
  ).length;
  const progress =
    words.length > 0 ? Math.round((learnedCount / words.length) * 100) : 0;

  // Reset flip when word changes
  useEffect(() => {
    void (async () => {
      await Promise.resolve();
      setFlipped(false);
    })();
  }, [cursor, lessonId]);

  // Keyboard shortcuts
  const handleKey = useCallback(
    (e: KeyboardEvent) => {
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      )
        return;
      if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault();
        setFlipped(f => !f);
      } else if (e.key === 'ArrowRight') {
        onNavigate(1);
      } else if (e.key === 'ArrowLeft') {
        onNavigate(-1);
      } else if (e.key === '1') {
        onMarkNotLearned();
        onNavigate(1);
      } else if (e.key === '2') {
        onMarkLearned();
        onNavigate(1);
      }
    },
    [onNavigate, onMarkLearned, onMarkNotLearned],
  );

  useEffect(() => {
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [handleKey]);

  if (!word) {
    return (
      <div className='font-vietnamese mx-auto flex h-[250px] w-full items-center justify-center rounded-3xl border border-[var(--border-color)] bg-[var(--card-color)] text-[var(--secondary-color)] shadow-sm sm:h-[280px]'>
        Bài học này chưa có dữ liệu. Dữ liệu sẽ được thêm sau.
      </div>
    );
  }

  // Highlight underlined word in example
  function renderExample(ex: string, under?: string) {
    if (!under || !ex.includes(under)) {
      return (
        <span className='font-japanese' lang='ja'>
          {ex}
        </span>
      );
    }
    const parts = ex.split(under);
    return (
      <span className='font-japanese' lang='ja'>
        {parts[0]}
        <u className='decoration-[var(--main-color)] underline-offset-2'>
          {under}
        </u>
        {parts.slice(1).join(under)}
      </span>
    );
  }

  return (
    <div className='flex w-full flex-col items-center gap-3.5 sm:gap-4'>
      {/* Progress bar */}
      <div className='flex w-full items-center gap-3'>
        <div className='h-1.5 flex-1 overflow-hidden rounded-full bg-[var(--border-color)]'>
          <div
            className='h-full rounded-full bg-[var(--main-color)] transition-all duration-500'
            style={{ width: `${progress}%` }}
          />
        </div>
        <span className='font-vietnamese text-xs text-[var(--secondary-color)] tabular-nums'>
          {learnedCount}/{words.length} đã nhớ
        </span>
      </div>

      {/* 3D Flashcard (Độ rộng bằng list, chiều cao thu gọn gọn gàng) */}
      <div
        className='relative h-[250px] w-full cursor-pointer select-none sm:h-[280px]'
        style={{ perspective: 1200 }}
        onClick={() => setFlipped(f => !f)}
      >
        <motion.div
          className='relative h-full w-full'
          style={{ transformStyle: 'preserve-3d' }}
          animate={{ rotateY: flipped ? 180 : 0 }}
          transition={{ duration: 0.45, ease: [0.23, 1, 0.32, 1] }}
        >
          {/* Mặt trước */}
          <div
            className={cn(
              'absolute inset-0 flex flex-col justify-between rounded-3xl border-2 p-5 shadow-xl transition-colors sm:p-6',
              isLearned
                ? 'border-green-600/50 bg-[#1a3a2a]'
                : 'border-[var(--main-color)]/30 bg-[#1a2a4a]',
            )}
            style={{ backfaceVisibility: 'hidden' }}
          >
            {/* Top bar mặt trước */}
            <div className='flex items-center justify-between text-xs text-blue-300/70'>
              <span className='font-semibold tracking-wider uppercase'>
                {cursor + 1} / {words.length}
              </span>
              <button
                type='button'
                onClick={e => {
                  e.stopPropagation();
                  speak(word.hira);
                }}
                className='rounded-xl p-2 text-blue-300/70 transition-colors hover:bg-white/10 hover:text-white'
                title='Nghe phát âm'
              >
                <Volume2 size={20} />
              </button>
            </div>

            {/* Center: Chữ Hiragana to + Kanji */}
            <div className='my-auto flex flex-col items-center justify-center text-center'>
              <p
                className='font-japanese text-4xl font-bold tracking-wider text-white sm:text-5xl'
                lang='ja'
              >
                {word.hira}
              </p>
              {word.kanji && (
                <p
                  className='font-japanese mt-2 text-lg font-medium text-blue-200/80 sm:text-xl'
                  lang='ja'
                >
                  {word.kanji}
                </p>
              )}
            </div>

            {/* Bottom hint mặt trước */}
            <div className='flex items-center justify-center gap-1.5 text-xs text-blue-300/50'>
              <RotateCcw size={13} />
              <span className='font-vietnamese'>
                Chạm hoặc nhấn Space để lật xem nghĩa
              </span>
            </div>
          </div>

          {/* Mặt sau */}
          <div
            className={cn(
              'absolute inset-0 flex flex-col justify-between rounded-3xl border-2 p-5 shadow-xl transition-colors sm:p-6',
              isLearned
                ? 'border-green-600/50 bg-[#1a3a2a]'
                : 'border-[var(--main-color)]/50 bg-[#16243d]',
            )}
            style={{
              backfaceVisibility: 'hidden',
              transform: 'rotateY(180deg)',
            }}
          >
            {/* Top bar mặt sau */}
            <div className='flex items-center justify-between text-xs text-blue-300/70'>
              <span className='font-semibold tracking-wider uppercase'>
                {cursor + 1} / {words.length}
              </span>
              <button
                type='button'
                onClick={e => {
                  e.stopPropagation();
                  speak(word.hira);
                }}
                className='rounded-xl p-2 text-blue-300/70 transition-colors hover:bg-white/10 hover:text-white'
                title='Nghe phát âm'
              >
                <Volume2 size={20} />
              </button>
            </div>

            {/* Center: Từ vựng + Nghĩa tiếng Việt + Câu ví dụ */}
            <div className='my-auto flex flex-col justify-center space-y-2.5 overflow-y-auto py-1'>
              <div className='flex flex-wrap items-baseline gap-2.5'>
                <p
                  className='font-japanese text-xl font-bold text-white sm:text-2xl'
                  lang='ja'
                >
                  {word.hira}
                </p>
                {word.kanji && (
                  <p
                    className='font-japanese text-sm text-blue-200/70 sm:text-base'
                    lang='ja'
                  >
                    ({word.kanji})
                  </p>
                )}
                <span className='text-blue-300/40'>—</span>
                <p className='font-vietnamese text-xl font-bold text-green-300 sm:text-2xl'>
                  {word.mean}
                </p>
              </div>

              {word.ex && (
                <div className='rounded-xl border border-white/10 bg-white/5 p-3 text-sm leading-relaxed text-blue-100/90'>
                  {renderExample(word.ex, word.under)}
                  {word.exVi && (
                    <span className='font-vietnamese mt-1 block text-xs text-blue-300/60 italic'>
                      {word.exVi}
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* Bottom hint mặt sau */}
            <div className='flex items-center justify-center gap-1.5 text-xs text-blue-300/50'>
              <RotateCcw size={13} />
              <span className='font-vietnamese'>
                Chạm hoặc nhấn Space để lật lại thẻ
              </span>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Action buttons (Căn giữa) */}
      <div className='flex flex-wrap items-center justify-center gap-2.5 pt-0.5 sm:gap-3'>
        {/* Prev */}
        <button
          type='button'
          onClick={() => onNavigate(-1)}
          disabled={cursor === 0}
          className='flex size-11 items-center justify-center rounded-2xl border border-[var(--border-color)] bg-[var(--card-color)] text-[var(--secondary-color)] transition-all hover:border-[var(--main-color)] hover:text-[var(--foreground-color)] disabled:opacity-30'
          title='Từ trước'
        >
          <ChevronLeft size={18} />
        </button>

        {/* Chưa nhớ */}
        <button
          type='button'
          onClick={() => {
            onMarkNotLearned();
            onNavigate(1);
          }}
          className='font-vietnamese flex items-center gap-2 rounded-2xl border border-red-500/30 bg-red-500/10 px-5 py-2.5 text-sm font-semibold text-red-400 transition-all hover:bg-red-500 hover:text-white active:scale-95'
        >
          <X size={16} />
          Chưa nhớ
        </button>

        {/* Lật thẻ */}
        <button
          type='button'
          onClick={() => setFlipped(f => !f)}
          className='font-vietnamese flex items-center gap-2 rounded-2xl border border-[var(--border-color)] bg-[var(--card-color)] px-5 py-2.5 text-sm font-semibold text-[var(--foreground-color)] transition-all hover:border-[var(--main-color)] active:scale-95'
        >
          <RotateCcw size={16} />
          {flipped ? 'Ẩn nghĩa' : 'Hiện đáp án'}
        </button>

        {/* Đã nhớ */}
        <button
          type='button'
          onClick={() => {
            onMarkLearned();
            onNavigate(1);
          }}
          className='font-vietnamese flex items-center gap-2 rounded-2xl bg-[var(--main-color)] px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:opacity-90 active:scale-95'
        >
          <Check size={16} />
          Đã nhớ
        </button>

        {/* Next */}
        <button
          type='button'
          onClick={() => onNavigate(1)}
          disabled={cursor === words.length - 1}
          className='flex size-11 items-center justify-center rounded-2xl border border-[var(--border-color)] bg-[var(--card-color)] text-[var(--secondary-color)] transition-all hover:border-[var(--main-color)] hover:text-[var(--foreground-color)] disabled:opacity-30'
          title='Từ kế tiếp'
        >
          <ChevronRight size={18} />
        </button>
      </div>

      {/* Keyboard hints */}
      <p className='font-vietnamese text-center text-xs text-[var(--secondary-color)]'>
        ← → điều hướng &nbsp;·&nbsp;{' '}
        <kbd className='rounded border border-[var(--border-color)] bg-[var(--card-color)] px-1.5 py-0.5'>
          Space
        </kbd>{' '}
        Lật thẻ &nbsp;·&nbsp;{' '}
        <kbd className='rounded border border-[var(--border-color)] bg-[var(--card-color)] px-1.5 py-0.5'>
          1
        </kbd>{' '}
        Chưa nhớ &nbsp;·&nbsp;{' '}
        <kbd className='rounded border border-[var(--border-color)] bg-[var(--card-color)] px-1.5 py-0.5'>
          2
        </kbd>{' '}
        Đã nhớ
      </p>
    </div>
  );
}
