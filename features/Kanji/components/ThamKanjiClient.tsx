'use client';

import React, {
  useEffect,
  useState,
  useMemo,
  useCallback,
  useRef,
} from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { kanjiDataService } from '@/features/Kanji/services/kanjiDataService';
import { KanjiLevel } from '@/entities/kanji';
import useSetProgressHydration from '@/features/Progress/hooks/useSetProgress';
import { useSetProgressStore } from '@/features/Progress';
import KanjiSetDictionary from '@/features/Kanji/components/SetDictionary';
import type { IKanjiObj } from '@/entities/kanji';
import hanvietMap from '@/shared/data/kanji_hanviet.json';
import { useClick } from '@/shared/hooks/generic/useAudio';
import { Loader2, Info, Star, ChevronDown, ChevronUp } from 'lucide-react';
import clsx from 'clsx';

const levelOrder: KanjiLevel[] = ['n5', 'n4', 'n3', 'n2', 'n1'];

type ThamKanjiClientProps = {
  locale: string;
  initialCharacter?: string;
  initialLevel?: KanjiLevel;
};

export default function ThamKanjiClient({
  locale: _locale,
  initialCharacter,
  initialLevel,
}: ThamKanjiClientProps) {
  const t = useTranslations('navigation.menu');
  const router = useRouter();
  const searchParams = useSearchParams();
  const openParam = searchParams.get('open');
  const { playClick } = useClick();

  const isAllCached =
    typeof window !== 'undefined' &&
    kanjiDataService.isCached('n5') &&
    kanjiDataService.isCached('n4') &&
    kanjiDataService.isCached('n3') &&
    kanjiDataService.isCached('n2') &&
    kanjiDataService.isCached('n1');

  const [loading, setLoading] = useState(!isAllCached);
  const [activeLevel, setActiveLevel] = useState<KanjiLevel>(
    initialLevel || 'n5',
  );
  const [selectedKanji, setSelectedKanji] = useState<IKanjiObj | null>(null);
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Height dynamic state for smooth max-height transitions
  const gridRef = useRef<HTMLDivElement>(null);
  const [gridHeight, setGridHeight] = useState('auto');

  // Initialize and hydrate user progress
  useSetProgressHydration();
  const kanjiProgress = useSetProgressStore(state => state.data.kanji);

  // Preload all kanji data on mount
  useEffect(() => {
    let active = true;
    void kanjiDataService.preloadAll().then(() => {
      if (active) {
        setLoading(false);
      }
    });
    return () => {
      active = false;
    };
  }, []);

  const cachedByLevel = useMemo(() => {
    if (loading) return {};
    return kanjiDataService.getAllCached();
  }, [loading]);

  // Sync activeLevel state from prop
  useEffect(() => {
    if (initialLevel && levelOrder.includes(initialLevel)) {
      setActiveLevel(initialLevel);
    }
  }, [initialLevel]);

  // Handle URL "?open=X" parameter or path parameter
  const targetChar = initialCharacter || openParam;

  useEffect(() => {
    if (loading) return;

    if (!targetChar) {
      setSelectedKanji(null);
      return;
    }

    for (const level of levelOrder) {
      const list = cachedByLevel[level];
      if (list) {
        const found = list.find(k => k.kanjiChar === targetChar);
        if (found) {
          setActiveLevel(level);
          setSelectedKanji(found);
          setIsCollapsed(false); // Automatically expand to show selected character
          break;
        }
      }
    }
  }, [targetChar, loading, cachedByLevel]);

  // Retrieve current level's kanji list
  const currentKanjis = useMemo(() => {
    if (loading) return [];
    return cachedByLevel[activeLevel] || [];
  }, [activeLevel, cachedByLevel, loading]);

  // Calculate statistics for the active level
  const stats = useMemo(() => {
    if (currentKanjis.length === 0) {
      return { total: 0, mastered: 0, learning: 0, notStarted: 0 };
    }

    let mastered = 0;
    let learning = 0;
    let notStarted = 0;

    currentKanjis.forEach(kanji => {
      const score = kanjiProgress[kanji.kanjiChar]?.correct ?? 0;
      if (score >= 15) {
        mastered++;
      } else if (score >= 1) {
        learning++;
      } else {
        notStarted++;
      }
    });

    return {
      total: currentKanjis.length,
      mastered,
      learning,
      notStarted,
    };
  }, [currentKanjis, kanjiProgress]);

  // Track height of grid dynamically for smooth transition animations
  useEffect(() => {
    const updateHeight = () => {
      if (gridRef.current) {
        setGridHeight(
          isCollapsed ? '48px' : `${gridRef.current.scrollHeight}px`,
        );
      }
    };

    updateHeight();

    if (
      typeof window !== 'undefined' &&
      'ResizeObserver' in window &&
      gridRef.current
    ) {
      const observer = new ResizeObserver(() => {
        updateHeight();
      });
      observer.observe(gridRef.current);
      return () => observer.disconnect();
    }
  }, [isCollapsed, currentKanjis, loading]);

  // Color helper function based on kanji mastery score
  const getCellColorClass = useCallback(
    (score: number, isSelected: boolean) => {
      if (score >= 15) {
        return clsx(
          'bg-emerald-500 hover:bg-emerald-600 text-white border-emerald-500',
          isSelected &&
            'ring-4 ring-emerald-300 dark:ring-emerald-700 border-white dark:border-slate-900',
        );
      }
      if (score >= 10) {
        return clsx(
          'bg-emerald-400 hover:bg-emerald-500 text-emerald-950 border-emerald-400',
          isSelected &&
            'ring-4 ring-emerald-300 dark:ring-emerald-700 border-white dark:border-slate-900',
        );
      }
      if (score >= 5) {
        return clsx(
          'bg-emerald-200 hover:bg-emerald-300 text-emerald-900 border-emerald-200 dark:bg-emerald-900/40 dark:hover:bg-emerald-900/60 dark:text-emerald-300 dark:border-emerald-800/40',
          isSelected &&
            'ring-4 ring-emerald-300 dark:ring-emerald-700 border-white dark:border-slate-900',
        );
      }
      if (score >= 1) {
        return clsx(
          'bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border-emerald-100 dark:bg-emerald-950/20 dark:hover:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-900/30',
          isSelected &&
            'ring-4 ring-emerald-300 dark:ring-emerald-700 border-white dark:border-slate-900',
        );
      }
      return clsx(
        'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200 dark:bg-slate-900/40 dark:hover:bg-slate-900/60 dark:text-slate-400 dark:border-slate-800',
        isSelected &&
          'ring-4 ring-slate-400 dark:ring-slate-600 border-white dark:border-slate-900',
      );
    },
    [],
  );

  if (loading) {
    return (
      <div className='flex min-h-[400px] flex-col items-center justify-center gap-3'>
        <Loader2 className='animate-spin text-(--main-color)' size={40} />
        <span className='animate-pulse text-sm font-medium text-(--secondary-color)/80'>
          Đang tải...
        </span>
      </div>
    );
  }

  // Focus character detail view: only render the details card with a back button
  if (initialCharacter && selectedKanji) {
    return (
      <div className='animate-fade-in mx-auto flex w-full max-w-4xl flex-col items-start gap-4 px-4 py-8'>
        <div className='self-start'>
          <button
            onClick={() => {
              playClick();
              if (typeof window !== 'undefined' && window.history.length > 1) {
                router.back();
              } else {
                router.push(`/kanji/thamkanji/jlpt${activeLevel}`);
              }
            }}
            className='flex cursor-pointer items-center gap-1.5 text-xs font-bold text-(--secondary-color)/60 transition-colors hover:text-(--main-color)'
          >
            ← Quay lại
          </button>
        </div>

        <div className='flex w-full flex-col gap-4 rounded-2xl border border-(--border-color) bg-(--card-color) p-6 shadow-sm'>
          <div className='flex items-center justify-between border-b border-(--border-color) pb-4'>
            <h2 className='flex items-center gap-2 text-lg font-bold text-(--secondary-color)'>
              Chi tiết chữ Kanji:{' '}
              <span className='text-2xl font-extrabold text-(--main-color)'>
                {selectedKanji.kanjiChar}
              </span>
            </h2>
          </div>
          <div className='w-full'>
            <KanjiSetDictionary words={[selectedKanji]} />
          </div>
        </div>
      </div>
    );
  }

  const masteredPercent = Math.round((stats.mastered / stats.total) * 100) || 0;
  const learningPercent = Math.round((stats.learning / stats.total) * 100) || 0;
  const notStartedPercent = 100 - masteredPercent - learningPercent;

  return (
    <div className='mx-auto flex w-full flex-col gap-6 px-6 py-8'>
      <div className='-mb-2 self-start'>
        <button
          onClick={() => {
            playClick();
            router.push('/kanji');
          }}
          className='flex cursor-pointer items-center gap-1.5 text-xs font-bold text-(--secondary-color)/60 transition-colors hover:text-(--main-color)'
        >
          ← Quay lại
        </button>
      </div>

      <div className='w-full'>
        <h1 className='flex items-center gap-2.5 text-3xl font-extrabold tracking-tight text-(--secondary-color)'>
          <Star className='fill-current text-(--main-color)' size={28} />
          {t('thamKanji')}
        </h1>
        <p className='mt-1 text-sm font-medium text-(--secondary-color)/60'>
          Theo dõi và đánh giá trực quan mức độ thuộc lòng toàn bộ chữ Kanji từ
          N5 đến N1 của bạn.
        </p>
      </div>

      {/* Tabs Level Selector as Links */}
      <div className='flex flex-wrap gap-1 border-b border-(--border-color)'>
        {levelOrder.map(level => (
          <Link
            key={level}
            href={`/kanji/thamkanji/jlpt${level}`}
            onClick={() => {
              playClick();
            }}
            className={clsx(
              '-mb-[2px] cursor-pointer border-b-2 px-6 py-3 text-sm font-bold tracking-wide uppercase transition-all duration-200',
              activeLevel === level
                ? 'border-(--main-color) text-(--main-color)'
                : 'border-transparent text-(--secondary-color)/60 hover:text-(--secondary-color)',
            )}
          >
            JLPT {level.toUpperCase()}
          </Link>
        ))}
      </div>

      {/* Statistics & Premium Progress Bar */}
      <div className='grid grid-cols-1 gap-4 rounded-2xl border border-(--border-color) bg-(--card-color) p-6 shadow-sm md:grid-cols-4'>
        <div className='flex flex-col gap-1'>
          <span className='text-xs font-bold tracking-wider text-(--secondary-color)/50 uppercase'>
            Tổng chữ Kanji
          </span>
          <span className='text-3xl font-extrabold text-(--secondary-color)'>
            {stats.total}
          </span>
        </div>
        <div className='flex flex-col gap-1 border-l-0 border-(--border-color) md:border-l md:pl-6'>
          <span className='text-xs font-bold tracking-wider text-emerald-500 uppercase'>
            Đã thuộc (15+ correct)
          </span>
          <span className='text-3xl font-extrabold text-emerald-500'>
            {stats.mastered}{' '}
            <span className='text-sm font-semibold text-(--secondary-color)/40'>
              ({masteredPercent}%)
            </span>
          </span>
        </div>
        <div className='flex flex-col gap-1 border-l-0 border-(--border-color) md:border-l md:pl-6'>
          <span className='text-xs font-bold tracking-wider text-yellow-500 uppercase'>
            Đang học (1-14 correct)
          </span>
          <span className='text-3xl font-extrabold text-yellow-500'>
            {stats.learning}{' '}
            <span className='text-sm font-semibold text-(--secondary-color)/40'>
              ({learningPercent}%)
            </span>
          </span>
        </div>
        <div className='flex flex-col gap-1 border-l-0 border-(--border-color) md:border-l md:pl-6'>
          <span className='text-xs font-bold tracking-wider text-slate-400 uppercase'>
            Chưa bắt đầu (0 correct)
          </span>
          <span className='text-3xl font-extrabold text-slate-400'>
            {stats.notStarted}{' '}
            <span className='text-sm font-semibold text-(--secondary-color)/40'>
              ({notStartedPercent}%)
            </span>
          </span>
        </div>

        {/* Stacked Progress Bar */}
        <div className='col-span-1 mt-2 md:col-span-4'>
          <div className='flex h-3 w-full overflow-hidden rounded-full bg-slate-200 shadow-inner dark:bg-slate-800'>
            <div
              style={{ width: `${masteredPercent}%` }}
              className='h-full bg-emerald-500 transition-all duration-500'
              title={`Đã thuộc: ${masteredPercent}%`}
            />
            <div
              style={{ width: `${learningPercent}%` }}
              className='h-full bg-yellow-500 transition-all duration-500'
              title={`Đang học: ${learningPercent}%`}
            />
            <div
              style={{ width: `${notStartedPercent}%` }}
              className='h-full bg-slate-300 transition-all duration-500 dark:bg-slate-700'
              title={`Chưa bắt đầu: ${notStartedPercent}%`}
            />
          </div>
        </div>
      </div>

      {/* Heatmap Grid */}
      <div className='flex flex-col gap-4 rounded-2xl border border-(--border-color) bg-(--card-color) p-6 shadow-sm'>
        {/* Header container with info text on left and control button on right */}
        <div className='flex flex-col justify-between gap-3 border-b border-(--border-color)/50 pb-2 sm:flex-row sm:items-center'>
          <div className='flex items-center gap-1.5 text-xs font-semibold text-(--secondary-color)/60'>
            <Info size={14} className='text-(--main-color)' />
            <span>
              Di chuột qua ô vuông để xem thông tin chi tiết, click để mở thẻ
              học Kanji.
            </span>
          </div>

          <button
            type='button'
            onClick={() => {
              playClick();
              setIsCollapsed(!isCollapsed);
            }}
            className='flex cursor-pointer items-center gap-1.5 self-end rounded-full border border-(--main-color)/20 px-4 py-1.5 text-xs font-bold text-(--main-color) shadow-sm transition-colors hover:bg-(--main-color)/10 active:scale-95 sm:self-auto'
          >
            {isCollapsed ? (
              <>
                <ChevronDown size={14} />
                Xem thêm Kanji
              </>
            ) : (
              <>
                <ChevronUp size={14} />
                Thu gọn
              </>
            )}
          </button>
        </div>

        {/* Expandable Grid Wrapper */}
        <div className='relative'>
          <div
            ref={gridRef}
            style={{ maxHeight: gridHeight }}
            className='grid grid-cols-[repeat(auto-fill,minmax(2.5rem,1fr))] gap-2.5 overflow-hidden transition-all duration-300 ease-in-out'
          >
            {currentKanjis.map(kanji => {
              const score = kanjiProgress[kanji.kanjiChar]?.correct ?? 0;
              const hanviet =
                (hanvietMap as Record<string, string>)[kanji.kanjiChar] || '';
              const isSelected = selectedKanji?.kanjiChar === kanji.kanjiChar;

              return (
                <div
                  key={kanji.kanjiChar}
                  className='group relative flex justify-center'
                >
                  <Link
                    href={`/kanji/thamkanji/${kanji.kanjiChar}`}
                    onClick={() => {
                      playClick();
                    }}
                    className={clsx(
                      'flex h-10 w-10 cursor-pointer items-center justify-center rounded-lg border text-base font-bold shadow-sm transition-all duration-150 active:scale-90',
                      getCellColorClass(score, isSelected),
                    )}
                  >
                    {kanji.kanjiChar}
                  </Link>

                  {/* Pure CSS Hover Tooltip */}
                  <div className='pointer-events-none absolute bottom-full left-1/2 z-50 mb-2.5 hidden w-44 -translate-x-1/2 rounded-xl border border-slate-800/80 bg-slate-900/95 p-3 text-xs text-white shadow-xl backdrop-blur-sm group-hover:block dark:bg-slate-950/95'>
                    <div className='flex flex-col gap-1.5'>
                      <div className='flex items-center justify-between border-b border-slate-800 pb-1'>
                        <span className='text-sm font-bold text-emerald-400'>
                          {kanji.kanjiChar}
                        </span>
                        <span className='text-[10px] font-bold tracking-wider text-slate-400 uppercase'>
                          {activeLevel.toUpperCase()}
                        </span>
                      </div>
                      {hanviet && (
                        <div>
                          <span className='text-[10px] font-bold text-slate-400 uppercase'>
                            Âm Hán:{' '}
                          </span>
                          <span className='font-semibold text-slate-200'>
                            {hanviet.toUpperCase()}
                          </span>
                        </div>
                      )}
                      <div>
                        <span className='text-[10px] font-bold text-slate-400 uppercase'>
                          Nghĩa:{' '}
                        </span>
                        <span className='line-clamp-2 font-medium text-slate-200'>
                          {kanji.meanings.join(', ')}
                        </span>
                      </div>
                      <div className='flex items-center justify-between border-t border-slate-800/60 pt-1 text-[10px]'>
                        <span className='font-bold text-slate-400 uppercase'>
                          Tiến trình:
                        </span>
                        <span className='font-semibold text-emerald-400'>
                          {score} / 15
                        </span>
                      </div>
                    </div>
                    {/* Tooltip arrow pointer */}
                    <div className='absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-900/95 dark:border-t-slate-950/95' />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Fade gradient overlay for collapsed state */}
          {isCollapsed && (
            <div className='pointer-events-none absolute right-0 bottom-0 left-0 h-10 bg-gradient-to-t from-(--card-color) to-transparent' />
          )}
        </div>

        {/* Legend (Transitions smoothly with collapse) */}
        <div
          className={clsx(
            'overflow-hidden transition-all duration-300 ease-in-out',
            isCollapsed
              ? 'mt-0 max-h-0 border-t-0 pt-0 opacity-0'
              : 'mt-2 max-h-16 border-t border-(--border-color) pt-4 opacity-100',
          )}
        >
          <div className='flex flex-wrap justify-end gap-4 text-xs font-semibold text-(--secondary-color)/60'>
            <div className='flex items-center gap-2'>
              <div className='h-4 w-4 rounded border border-slate-200 bg-slate-100 dark:border-slate-800 dark:bg-slate-900/40' />
              <span>Chưa học (0)</span>
            </div>
            <div className='flex items-center gap-2'>
              <div className='h-4 w-4 rounded border border-emerald-100 bg-emerald-50 dark:border-emerald-900/30 dark:bg-emerald-950/20' />
              <span>1 - 4</span>
            </div>
            <div className='flex items-center gap-2'>
              <div className='h-4 w-4 rounded border border-emerald-200 bg-emerald-200 dark:border-emerald-900/30 dark:bg-emerald-950/20' />
              <span>5 - 9</span>
            </div>
            <div className='flex items-center gap-2'>
              <div className='h-4 w-4 rounded border border-emerald-400 bg-emerald-400' />
              <span>10 - 14</span>
            </div>
            <div className='flex items-center gap-2'>
              <div className='h-4 w-4 rounded border border-emerald-500 bg-emerald-500' />
              <span>Đã thuộc (15+)</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
