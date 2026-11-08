'use client';

import React, { useState, useEffect, useCallback, useTransition } from 'react';
import {
  BookOpen,
  CheckCircle2,
  Star,
  Volume2,
  ChevronDown,
  Layers,
  AlertCircle,
  RotateCcw,
} from 'lucide-react';
import { cn } from '@/shared/utils/utils';
import type { GrammarPointItem } from '../types';

interface ModernGrammarStudyProps {
  level: string;
  initialLesson?: number;
}

const LESSON_LIMITS: Record<string, { start: number; end: number }> = {
  n5: { start: 1, end: 25 },
  n4: { start: 26, end: 50 },
  n3: { start: 1, end: 20 },
  n2: { start: 1, end: 15 },
  n1: { start: 1, end: 12 },
};

function speak(text: string) {
  if (typeof window === 'undefined') return;
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = 'ja-JP';
  utterance.rate = 0.85;
  window.speechSynthesis.speak(utterance);
}

export function ModernGrammarStudy({
  level,
  initialLesson = 1,
}: ModernGrammarStudyProps) {
  const limits = LESSON_LIMITS[level.toLowerCase()] || { start: 1, end: 25 };
  const [selectedLesson, setSelectedLesson] = useState<number>(() => {
    return initialLesson >= limits.start && initialLesson <= limits.end
      ? initialLesson
      : limits.start;
  });

  const [grammarPoints, setGrammarPoints] = useState<GrammarPointItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterMode, setFilterMode] = useState<
    'all' | 'unlearned' | 'mastered' | 'starred'
  >('all');
  const [, startTransition] = useTransition();

  // Fetch grammar points for lesson
  const fetchLessonData = useCallback(
    async (lessonNum: number) => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(
          `/api/grammar/study?level=${level}&lesson=${lessonNum}`,
        );
        if (!res.ok) {
          throw new Error('Không thể tải dữ liệu ngữ pháp.');
        }
        const data = await res.json();
        setGrammarPoints(data.grammar_points || []);
      } catch (err) {
        console.error(err);
        setError('Lỗi kết nối khi tải bài học. Vui lòng thử lại.');
      } finally {
        setLoading(false);
      }
    },
    [level],
  );

  useEffect(() => {
    void fetchLessonData(selectedLesson);
  }, [selectedLesson, fetchLessonData]);

  // Toggle Mastered
  const handleToggleMastered = async (item: GrammarPointItem) => {
    const nextState = !item.is_mastered;

    // Optimistic UI update
    setGrammarPoints(prev =>
      prev.map(p => (p.id === item.id ? { ...p, is_mastered: nextState } : p)),
    );

    try {
      await fetch('/api/grammar/progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          grammarId: item.id,
          isMastered: nextState,
        }),
      });
    } catch (err) {
      console.warn('Lưu tiến độ ngữ pháp thất bại:', err);
    }
  };

  // Toggle Starred
  const handleToggleStarred = async (item: GrammarPointItem) => {
    const nextState = !item.is_starred;

    // Optimistic UI update
    setGrammarPoints(prev =>
      prev.map(p => (p.id === item.id ? { ...p, is_starred: nextState } : p)),
    );

    try {
      await fetch('/api/grammar/progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          grammarId: item.id,
          isStarred: nextState,
        }),
      });
    } catch (err) {
      console.warn('Lưu đánh dấu sao thất bại:', err);
    }
  };

  // Derived stats
  const totalCount = grammarPoints.length;
  const masteredCount = grammarPoints.filter(p => p.is_mastered).length;
  const starredCount = grammarPoints.filter(p => p.is_starred).length;
  const progressPct =
    totalCount > 0 ? Math.round((masteredCount / totalCount) * 100) : 0;

  // Filtered list
  const filteredPoints = grammarPoints.filter(p => {
    if (filterMode === 'unlearned') return !p.is_mastered;
    if (filterMode === 'mastered') return p.is_mastered;
    if (filterMode === 'starred') return p.is_starred;
    return true;
  });

  // Array of available lessons
  const lessonList: number[] = [];
  for (let i = limits.start; i <= limits.end; i++) {
    lessonList.push(i);
  }

  return (
    <div className='font-vietnamese w-full space-y-6'>
      {/* Top Controls: Lesson Selector + Progress */}
      <div className='flex flex-col gap-4 rounded-3xl border border-[var(--border-color)] bg-[var(--card-color)] p-5 shadow-xs sm:flex-row sm:items-center sm:justify-between sm:p-6'>
        {/* Lesson Selector */}
        <div className='flex flex-wrap items-center gap-3'>
          <div className='relative'>
            <select
              value={selectedLesson}
              onChange={e => {
                const val = Number(e.target.value);
                startTransition(() => {
                  setSelectedLesson(val);
                });
              }}
              className='h-11 cursor-pointer appearance-none rounded-xl border border-[var(--border-color)] bg-[var(--background-color)] pr-10 pl-4 text-sm font-bold text-[var(--foreground-color)] focus:border-[var(--main-color)] focus:outline-none'
            >
              {lessonList.map(num => (
                <option key={num} value={num}>
                  Bài {num} (第{num}課)
                </option>
              ))}
            </select>
            <ChevronDown
              size={16}
              className='pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-[var(--secondary-color)]'
            />
          </div>

          <div className='flex items-center gap-2 text-xs font-semibold text-[var(--secondary-color)]'>
            <BookOpen size={14} className='text-[var(--main-color)]' />
            <span>
              {totalCount > 0
                ? `${totalCount} mẫu cấu trúc`
                : 'Đang cập nhật mẫu'}
            </span>
          </div>
        </div>

        {/* Progress Bar & Counter */}
        <div className='flex min-w-[220px] flex-col gap-1.5'>
          <div className='flex items-center justify-between text-xs font-semibold'>
            <span className='text-[var(--secondary-color)]'>
              Tiến độ nắm vững
            </span>
            <span className='text-[var(--main-color)]'>
              {masteredCount}/{totalCount} ({progressPct}%)
            </span>
          </div>
          <div className='h-2 w-full overflow-hidden rounded-full bg-[var(--border-color)]'>
            <div
              className='h-full rounded-full bg-[var(--main-color)] transition-all duration-300'
              style={{ width: `${progressPct}%` }}
            />
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className='flex items-center gap-2 overflow-x-auto pb-1 text-xs'>
        <button
          type='button'
          onClick={() => setFilterMode('all')}
          className={cn(
            'inline-flex shrink-0 items-center gap-1.5 rounded-xl px-3.5 py-2 font-bold transition-all active:scale-[0.98]',
            filterMode === 'all'
              ? 'bg-[var(--main-color)] text-white shadow-xs'
              : 'border border-[var(--border-color)] bg-[var(--card-color)] text-[var(--secondary-color)] hover:border-[var(--main-color)] hover:text-[var(--foreground-color)]',
          )}
        >
          <Layers size={13} />
          <span>Tất cả ({totalCount})</span>
        </button>

        <button
          type='button'
          onClick={() => setFilterMode('unlearned')}
          className={cn(
            'inline-flex shrink-0 items-center gap-1.5 rounded-xl px-3.5 py-2 font-bold transition-all active:scale-[0.98]',
            filterMode === 'unlearned'
              ? 'bg-[var(--main-color)] text-white shadow-xs'
              : 'border border-[var(--border-color)] bg-[var(--card-color)] text-[var(--secondary-color)] hover:border-[var(--main-color)] hover:text-[var(--foreground-color)]',
          )}
        >
          <span>Chưa nắm vững ({totalCount - masteredCount})</span>
        </button>

        <button
          type='button'
          onClick={() => setFilterMode('mastered')}
          className={cn(
            'inline-flex shrink-0 items-center gap-1.5 rounded-xl px-3.5 py-2 font-bold transition-all active:scale-[0.98]',
            filterMode === 'mastered'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'border border-[var(--border-color)] bg-[var(--card-color)] text-[var(--secondary-color)] hover:border-emerald-500 hover:text-emerald-500',
          )}
        >
          <CheckCircle2 size={13} />
          <span>Đã nắm vững ({masteredCount})</span>
        </button>

        <button
          type='button'
          onClick={() => setFilterMode('starred')}
          className={cn(
            'inline-flex shrink-0 items-center gap-1.5 rounded-xl px-3.5 py-2 font-bold transition-all active:scale-[0.98]',
            filterMode === 'starred'
              ? 'bg-amber-500 text-white shadow-xs'
              : 'border border-[var(--border-color)] bg-[var(--card-color)] text-[var(--secondary-color)] hover:border-amber-400 hover:text-amber-500',
          )}
        >
          <Star size={13} className='fill-current' />
          <span>Đã đánh dấu ({starredCount})</span>
        </button>
      </div>

      {/* Loading Skeleton */}
      {loading && (
        <div className='space-y-4'>
          {[1, 2, 3].map(i => (
            <div
              key={i}
              className='animate-pulse rounded-2xl border border-[var(--border-color)] bg-[var(--card-color)] p-6'
            >
              <div className='flex items-center justify-between'>
                <div className='h-5 w-48 rounded-md bg-[var(--border-color)]' />
                <div className='h-8 w-24 rounded-lg bg-[var(--border-color)]' />
              </div>
              <div className='mt-4 h-4 w-3/4 rounded-md bg-[var(--border-color)]/60' />
              <div className='mt-3 h-16 w-full rounded-xl bg-[var(--border-color)]/40' />
            </div>
          ))}
        </div>
      )}

      {/* Error State */}
      {error && !loading && (
        <div className='flex flex-col items-center justify-center gap-3 rounded-2xl border border-red-500/20 bg-red-500/5 p-8 text-center'>
          <AlertCircle size={28} className='text-red-500' />
          <p className='text-sm text-red-500'>{error}</p>
          <button
            type='button'
            onClick={() => fetchLessonData(selectedLesson)}
            className='inline-flex items-center gap-1.5 rounded-xl bg-red-500 px-4 py-2 text-xs font-bold text-white transition-opacity hover:opacity-90 active:scale-[0.98]'
          >
            <RotateCcw size={13} />
            <span>Thử lại</span>
          </button>
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && filteredPoints.length === 0 && (
        <div className='flex flex-col items-center justify-center gap-2 rounded-2xl border border-[var(--border-color)] bg-[var(--card-color)] p-12 text-center text-[var(--secondary-color)]'>
          <BookOpen size={32} className='text-[var(--secondary-color)]/40' />
          <p className='text-sm font-semibold'>
            Không tìm thấy mẫu cấu trúc nào phù hợp bộ lọc.
          </p>
          <p className='text-xs text-[var(--secondary-color)]/70'>
            Hãy chuyển sang bài học khác hoặc chọn tab &ldquo;Tất cả&rdquo;.
          </p>
        </div>
      )}

      {/* Grammar Cards List */}
      {!loading && !error && filteredPoints.length > 0 && (
        <div className='space-y-5'>
          {filteredPoints.map((item, index) => {
            const isMastered = !!item.is_mastered;
            const isStarred = !!item.is_starred;

            return (
              <div
                key={item.id}
                className={cn(
                  'group relative overflow-hidden rounded-2xl border p-5 shadow-xs transition-all duration-200 sm:p-6',
                  isMastered
                    ? 'border-emerald-500/40 bg-[var(--card-color)] hover:border-emerald-500'
                    : 'border-[var(--border-color)] bg-[var(--card-color)] hover:border-[var(--main-color)]/50',
                )}
              >
                {/* Header: Number, Title, Meaning & Actions */}
                <div className='flex flex-wrap items-start justify-between gap-3 border-b border-[var(--border-color)]/60 pb-4'>
                  <div className='flex items-start gap-3'>
                    <span
                      className={cn(
                        'flex size-8 shrink-0 items-center justify-center rounded-xl text-xs font-black',
                        isMastered
                          ? 'bg-emerald-500 text-white'
                          : 'bg-[var(--main-color)] text-white',
                      )}
                    >
                      {item.order_num || index + 1}
                    </span>
                    <div>
                      <h3 className='font-japanese text-lg font-bold text-[var(--foreground-color)] sm:text-xl'>
                        {item.title}
                      </h3>
                      <p className='mt-0.5 text-xs font-semibold text-[var(--secondary-color)] sm:text-sm'>
                        {item.summary_vi}
                      </p>
                    </div>
                  </div>

                  {/* Quick Action Buttons */}
                  <div className='flex items-center gap-1.5'>
                    <button
                      type='button'
                      onClick={() => handleToggleStarred(item)}
                      aria-label={
                        isStarred ? 'Bỏ đánh dấu sao' : 'Đánh dấu sao mẫu này'
                      }
                      className={cn(
                        'flex size-9 items-center justify-center rounded-xl border transition-all active:scale-[0.95]',
                        isStarred
                          ? 'border-amber-400/40 bg-amber-400/10 text-amber-500'
                          : 'border-[var(--border-color)] bg-[var(--background-color)] text-[var(--secondary-color)] hover:text-amber-500',
                      )}
                      title={
                        isStarred ? 'Bỏ đánh dấu sao' : 'Đánh dấu sao mẫu này'
                      }
                    >
                      <Star
                        size={16}
                        className={isStarred ? 'fill-current' : ''}
                      />
                    </button>

                    <button
                      type='button'
                      onClick={() => handleToggleMastered(item)}
                      className={cn(
                        'inline-flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-bold transition-all active:scale-[0.98]',
                        isMastered
                          ? 'border-emerald-500 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                          : 'border-[var(--border-color)] bg-[var(--background-color)] text-[var(--secondary-color)] hover:border-emerald-500 hover:text-emerald-600',
                      )}
                    >
                      <CheckCircle2
                        size={14}
                        className={
                          isMastered ? 'text-emerald-500' : 'text-neutral-400'
                        }
                      />
                      <span>{isMastered ? 'Đã nắm vững' : 'Chưa hiểu'}</span>
                    </button>
                  </div>
                </div>

                {/* Structure / Formula */}
                {item.structure && (
                  <div className='mt-4 flex flex-wrap items-center gap-2 rounded-xl border border-[var(--border-color)]/60 bg-[var(--background-color)] px-3.5 py-2.5 text-xs'>
                    <span className='font-bold text-[var(--main-color)] uppercase'>
                      Cấu trúc kết nối:
                    </span>
                    <code className='font-japanese rounded-md bg-[var(--card-color)] px-2 py-0.5 text-sm font-semibold text-[var(--foreground-color)]'>
                      {item.structure}
                    </code>
                  </div>
                )}

                {/* Explanation */}
                <div className='mt-4 text-xs leading-relaxed text-[var(--foreground-color)]/90 sm:text-sm'>
                  <p className='whitespace-pre-line'>{item.explanation_vi}</p>
                </div>

                {/* Nuance / Notes */}
                {item.nuance_notes && (
                  <div className='mt-3.5 rounded-xl border border-amber-500/20 bg-amber-500/5 p-3 text-xs leading-relaxed text-amber-700 dark:text-amber-300'>
                    <span className='font-bold'>Lưu ý quan trọng: </span>
                    <span>{item.nuance_notes}</span>
                  </div>
                )}

                {/* Examples */}
                {item.examples && item.examples.length > 0 && (
                  <div className='mt-5 space-y-2.5 border-t border-[var(--border-color)]/40 pt-4'>
                    <span className='text-xs font-bold text-[var(--secondary-color)] uppercase'>
                      Ví dụ thực tế:
                    </span>
                    <div className='space-y-2'>
                      {item.examples.map((ex, exIdx) => (
                        <div
                          key={exIdx}
                          className='flex items-start justify-between gap-3 rounded-xl border border-[var(--border-color)]/50 bg-[var(--background-color)]/60 p-3'
                        >
                          <div className='space-y-1'>
                            <p className='font-japanese text-sm font-semibold text-[var(--foreground-color)] sm:text-base'>
                              {ex.ja}
                            </p>
                            <p className='text-xs text-[var(--secondary-color)] sm:text-sm'>
                              {ex.vi}
                            </p>
                          </div>

                          <button
                            type='button'
                            onClick={() => speak(ex.ja)}
                            className='rounded-lg p-1.5 text-[var(--secondary-color)] transition-colors hover:bg-[var(--card-color)] hover:text-[var(--main-color)] active:scale-95'
                            title='Nghe phát âm ví dụ'
                            aria-label={`Nghe phát âm ví dụ: ${ex.ja}`}
                          >
                            <Volume2 size={16} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
