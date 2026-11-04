'use client';

import { useState, useRef, useEffect } from 'react';
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Check,
  List,
  Mic,
  ArrowRight,
} from 'lucide-react';
import { Link } from '@/core/i18n/routing';
import { cn } from '@/shared/utils/utils';
import type { VocabLevel, StudySection, LessonData } from '../../types/study';
import { LESSON_COUNT } from '../../data/lessonsN5';

interface VocabLessonDropdownProps {
  level: VocabLevel;
  lessons: Record<number, LessonData>;
  currentSection: StudySection;
  currentLessonId: number;
  learned: string[];
  scores: Record<string, number>;
  singleMode?: StudySection;
  align?: 'left' | 'right';
  onSelectLesson: (lessonId: number) => void;
}

function lessonLearnedCount(
  lessonId: number,
  words: LessonData['words'],
  learned: string[],
): number {
  return words.filter(w => learned.includes(`${lessonId}:${w.hira}`)).length;
}

function lessonScoredCount(
  lessonId: number,
  words: LessonData['words'],
  scores: Record<string, number>,
): number {
  return words.filter(w => scores[`${lessonId}:${w.hira}`] !== undefined)
    .length;
}

export default function VocabLessonDropdown({
  level,
  lessons,
  currentSection,
  currentLessonId,
  learned,
  scores,
  singleMode,
  align = 'right',
  onSelectLesson,
}: VocabLessonDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const count = LESSON_COUNT[level];
  const lessonIds = Array.from({ length: count }, (_, i) => i + 1);

  const isVocab = currentSection === 'vocab';
  const curWords = lessons[currentLessonId]?.words ?? [];
  const curTotal = curWords.length;
  const curDone = isVocab
    ? lessonLearnedCount(currentLessonId, curWords, learned)
    : lessonScoredCount(currentLessonId, curWords, scores);

  const otherMode = isVocab ? 'pronounce' : 'words';
  const otherLabel = isVocab ? 'Luyện phát âm' : '1000 từ vựng';

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Close dropdown on Escape key
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (currentLessonId > 1) {
      onSelectLesson(currentLessonId - 1);
    }
  };

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (currentLessonId < count) {
      onSelectLesson(currentLessonId + 1);
    }
  };

  return (
    <div ref={dropdownRef} className='font-vietnamese relative inline-block'>
      {/* Selector trigger bar: [ < ] [ Bài X (done/total) ▾ ] [ > ] */}
      <div className='flex items-center gap-1.5'>
        {/* Prev lesson button */}
        <button
          type='button'
          onClick={handlePrev}
          disabled={currentLessonId <= 1}
          className='flex h-10 w-10 items-center justify-center rounded-xl border border-[var(--border-color)] bg-[var(--card-color)] text-[var(--secondary-color)] transition-all hover:border-[var(--main-color)] hover:text-[var(--foreground-color)] disabled:cursor-not-allowed disabled:opacity-30'
          title='Bài trước'
        >
          <ChevronLeft size={16} />
        </button>

        {/* Main dropdown button */}
        <button
          type='button'
          onClick={() => setIsOpen(v => !v)}
          className={cn(
            'flex h-10 items-center gap-2.5 rounded-xl border px-3.5 text-sm font-semibold transition-all select-none',
            isOpen
              ? 'border-[var(--main-color)] bg-[var(--card-color)] text-[var(--main-color)] shadow-md ring-2 ring-[var(--main-color)]/20'
              : 'border-[var(--border-color)] bg-[var(--card-color)] text-[var(--foreground-color)] shadow-xs hover:border-[var(--main-color)]',
          )}
        >
          {isVocab ? (
            <List size={16} className='text-[var(--main-color)]' />
          ) : (
            <Mic size={16} className='text-purple-500' />
          )}

          <span className='font-bold'>Bài {currentLessonId}</span>

          {curTotal > 0 && (
            <span
              className={cn(
                'rounded-full px-2 py-0.5 text-xs font-semibold tabular-nums',
                curDone === curTotal
                  ? 'bg-green-500/10 text-green-500'
                  : 'bg-[var(--border-color)] text-[var(--secondary-color)]',
              )}
            >
              {curDone}/{curTotal}
            </span>
          )}

          <ChevronDown
            size={15}
            className={cn(
              'text-[var(--secondary-color)] transition-transform duration-200',
              isOpen && 'rotate-180 text-[var(--main-color)]',
            )}
          />
        </button>

        {/* Next lesson button */}
        <button
          type='button'
          onClick={handleNext}
          disabled={currentLessonId >= count}
          className='flex h-10 w-10 items-center justify-center rounded-xl border border-[var(--border-color)] bg-[var(--card-color)] text-[var(--secondary-color)] transition-all hover:border-[var(--main-color)] hover:text-[var(--foreground-color)] disabled:cursor-not-allowed disabled:opacity-30'
          title='Bài kế tiếp'
        >
          <ChevronRight size={16} />
        </button>
      </div>

      {/* Popover Dropdown menu */}
      {isOpen && (
        <div
          className={cn(
            'animate-in fade-in zoom-in-95 absolute z-50 mt-2 w-72 rounded-2xl border border-[var(--border-color)] bg-[var(--card-color)] p-3 shadow-2xl backdrop-blur-md duration-150',
            align === 'left' ? 'left-0' : 'right-0',
          )}
          style={{
            maxHeight: '440px',
            boxShadow: '0 12px 36px -4px rgba(0, 0, 0, 0.25)',
          }}
        >
          {/* Header in popover */}
          <div className='flex items-center justify-between border-b border-[var(--border-color)] px-2 pb-2.5'>
            <div>
              <p className='text-xs font-bold text-[var(--foreground-color)]'>
                Chọn bài học
              </p>
              <p className='text-[10px] text-[var(--secondary-color)]'>
                {count} bài JLPT {level.toUpperCase()}
              </p>
            </div>
            <span className='rounded-md bg-[var(--border-color)] px-1.5 py-0.5 text-[10px] font-semibold text-[var(--secondary-color)]'>
              {isVocab ? '1000 từ vựng' : 'Luyện phát âm'}
            </span>
          </div>

          {/* List of lessons */}
          <div
            className='mt-2 flex flex-col gap-1 overflow-y-auto pr-1'
            style={{ maxHeight: '300px' }}
          >
            {lessonIds.map(id => {
              const lessonData = lessons[id] ?? { words: [] };
              const total = lessonData.words.length;
              const done = isVocab
                ? lessonLearnedCount(id, lessonData.words, learned)
                : lessonScoredCount(id, lessonData.words, scores);
              const isActive = currentLessonId === id;
              const isCompleted = total > 0 && done === total;

              return (
                <button
                  key={id}
                  type='button'
                  onClick={() => {
                    onSelectLesson(id);
                    setIsOpen(false);
                  }}
                  className={cn(
                    'flex w-full items-center justify-between rounded-xl px-3 py-2 text-xs font-medium transition-all select-none',
                    isActive
                      ? 'bg-[var(--main-color)] font-bold text-white shadow-sm'
                      : 'text-[var(--foreground-color)] hover:bg-[var(--border-color)]/50',
                  )}
                >
                  <div className='flex items-center gap-2'>
                    {isCompleted && !isActive && (
                      <Check size={13} className='text-green-500' />
                    )}
                    <span>Bài {id}</span>
                  </div>

                  {total > 0 ? (
                    <span
                      className={cn(
                        'text-[11px] tabular-nums',
                        isActive
                          ? 'text-white/90'
                          : isCompleted
                            ? 'font-semibold text-green-500'
                            : 'text-[var(--secondary-color)]',
                      )}
                    >
                      {done}/{total}
                    </span>
                  ) : (
                    <span
                      className={cn(
                        'text-[10px] italic',
                        isActive
                          ? 'text-white/60'
                          : 'text-[var(--secondary-color)]/60',
                      )}
                    >
                      Trống
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Footer in popover */}
          {singleMode && (
            <div className='mt-2.5 border-t border-[var(--border-color)] pt-2'>
              <Link
                href={`/vocabulary/jlpt-${level}/${otherMode}`}
                onClick={() => setIsOpen(false)}
                className='flex items-center justify-between rounded-xl px-2.5 py-1.5 text-xs font-semibold text-[var(--secondary-color)] transition-colors hover:bg-[var(--border-color)]/40 hover:text-[var(--main-color)]'
              >
                <span>Chuyển sang: {otherLabel}</span>
                <ArrowRight size={13} />
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
