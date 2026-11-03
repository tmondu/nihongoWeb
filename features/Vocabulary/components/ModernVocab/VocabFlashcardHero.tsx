'use client';

import { useEffect, useCallback, useState } from 'react';
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
      <div className='font-vietnamese flex h-64 items-center justify-center rounded-2xl border border-[var(--border-color)] bg-[var(--card-color)] text-[var(--secondary-color)]'>
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
    <div className='flex flex-col gap-4'>
      {/* Progress bar */}
      <div className='flex items-center gap-3'>
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

      {/* Card */}
      <div
        className={cn(
          'relative min-h-64 cursor-pointer rounded-2xl p-8 transition-all duration-300 select-none',
          isLearned
            ? 'border border-green-700/40 bg-[#1a3a2a]'
            : 'border border-[var(--main-color)]/20 bg-[#1a2a4a]',
        )}
        onClick={() => setFlipped(f => !f)}
      >
        {/* Front */}
        <div
          className={cn(
            'transition-opacity duration-200',
            flipped ? 'absolute opacity-0' : 'opacity-100',
          )}
        >
          <div className='flex items-center justify-between'>
            <span className='text-xs font-medium tracking-widest text-blue-300/60 uppercase'>
              {cursor + 1} / {words.length}
            </span>
            <button
              onClick={e => {
                e.stopPropagation();
                speak(word.hira);
              }}
              className='rounded-full p-2 text-blue-300/60 transition-colors hover:bg-white/10 hover:text-white'
              title='Nghe phát âm'
            >
              <Volume2 size={18} />
            </button>
          </div>
          <div className='mt-6 text-center'>
            <p
              className='font-japanese text-5xl font-bold tracking-wider text-white'
              lang='ja'
            >
              {word.hira}
            </p>
            {word.kanji && (
              <p
                className='font-japanese mt-2 text-lg text-blue-200/60'
                lang='ja'
              >
                {word.kanji}
              </p>
            )}
          </div>
          <p className='font-vietnamese mt-8 text-center text-xs text-blue-300/40'>
            Nhấn <kbd className='rounded bg-white/10 px-1.5 py-0.5'>Space</kbd>{' '}
            để lật thẻ
          </p>
        </div>

        {/* Back */}
        <div
          className={cn(
            'transition-opacity duration-200',
            flipped ? 'opacity-100' : 'absolute inset-8 opacity-0',
          )}
        >
          <div className='flex items-center justify-between'>
            <span className='text-xs font-medium tracking-widest text-blue-300/60 uppercase'>
              {cursor + 1} / {words.length}
            </span>
            <button
              onClick={e => {
                e.stopPropagation();
                speak(word.hira);
              }}
              className='rounded-full p-2 text-blue-300/60 transition-colors hover:bg-white/10 hover:text-white'
              title='Nghe phát âm'
            >
              <Volume2 size={18} />
            </button>
          </div>
          <div className='mt-4 space-y-3'>
            <p
              className='font-japanese text-3xl font-bold text-white'
              lang='ja'
            >
              {word.hira}
            </p>
            {word.kanji && (
              <p className='font-japanese text-lg text-blue-200/70' lang='ja'>
                {word.kanji}
              </p>
            )}
            <p className='font-vietnamese text-xl font-semibold text-green-300'>
              {word.mean}
            </p>
            {word.ex && (
              <div className='mt-3 rounded-lg bg-white/5 px-4 py-3 text-sm leading-relaxed text-blue-100/80'>
                {renderExample(word.ex, word.under)}
                {word.exVi && (
                  <span className='font-vietnamese mt-1 block text-blue-300/50 italic'>
                    {word.exVi}
                  </span>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Action buttons */}
      <div className='flex items-center justify-center gap-3'>
        <button
          onClick={() => onNavigate(-1)}
          disabled={cursor === 0}
          className='rounded-full border border-[var(--border-color)] p-2.5 text-[var(--secondary-color)] transition-colors hover:bg-[var(--card-color)] hover:text-[var(--foreground-color)] disabled:opacity-30'
        >
          <ChevronLeft size={18} />
        </button>

        <button
          onClick={() => {
            onMarkNotLearned();
            onNavigate(1);
          }}
          className='font-vietnamese flex items-center gap-2 rounded-xl border border-red-500/30 bg-red-500/10 px-5 py-2.5 text-sm font-medium text-red-400 transition-colors hover:bg-red-500/20'
        >
          <X size={16} />
          Chưa nhớ
        </button>

        <button
          onClick={() => setFlipped(f => !f)}
          className='font-vietnamese flex items-center gap-2 rounded-xl border border-[var(--border-color)] bg-[var(--card-color)] px-5 py-2.5 text-sm font-medium text-[var(--foreground-color)] transition-colors hover:bg-[var(--border-color)]'
        >
          <RotateCcw size={16} />
          {flipped ? 'Ẩn' : 'Hiện đáp án'}
        </button>

        <button
          onClick={() => {
            onMarkLearned();
            onNavigate(1);
          }}
          className='font-vietnamese flex items-center gap-2 rounded-xl bg-[var(--main-color)] px-5 py-2.5 text-sm font-medium text-white transition-opacity hover:opacity-90'
        >
          <Check size={16} />
          Đã nhớ
        </button>

        <button
          onClick={() => onNavigate(1)}
          disabled={cursor === words.length - 1}
          className='rounded-full border border-[var(--border-color)] p-2.5 text-[var(--secondary-color)] transition-colors hover:bg-[var(--card-color)] hover:text-[var(--foreground-color)] disabled:opacity-30'
        >
          <ChevronRight size={18} />
        </button>
      </div>

      <p className='font-vietnamese text-center text-xs text-[var(--secondary-color)]'>
        ← → điều hướng &nbsp;·&nbsp;{' '}
        <kbd className='rounded bg-[var(--card-color)] px-1 py-0.5'>1</kbd> Chưa
        nhớ &nbsp;·&nbsp;{' '}
        <kbd className='rounded bg-[var(--card-color)] px-1 py-0.5'>2</kbd> Đã
        nhớ
      </p>
    </div>
  );
}
