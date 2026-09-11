'use client';

import React, { useEffect, useState, useMemo, useCallback } from 'react';
import clsx from 'clsx';
import { Volume2, Loader2, BookOpen } from 'lucide-react';
import FuriganaText from '@/shared/ui-composite/text/FuriganaText';
import { useAudioPreferences } from '@/features/Preferences';
import { useJapaneseTTS } from '@/features/Preferences/hooks/useJapaneseTTS';
import { useClick } from '@/shared/hooks/generic/useAudio';

export interface KanjiExampleItem {
  id: number;
  kanji: string;
  kana: string;
  definition: string;
  level: string;
  readingType: 'on' | 'kun' | 'other';
  matchedReading?: string;
}

interface KanjiExamplesListProps {
  kanjiChar: string;
  className?: string;
}

export default function KanjiExamplesList({
  kanjiChar,
  className,
}: KanjiExamplesListProps) {
  const [dataState, setDataState] = useState<{
    char: string;
    items: KanjiExampleItem[];
    loading: boolean;
  }>({
    char: '',
    items: [],
    loading: true,
  });
  const [activeFilter, setActiveFilter] = useState<'all' | 'on' | 'kun'>('all');

  const { playClick } = useClick();
  const { pronunciationEnabled, pronunciationSpeed, pronunciationPitch } =
    useAudioPreferences();
  const { speak, refreshVoices } = useJapaneseTTS();

  const playWordPronunciation = useCallback(
    async (word: string) => {
      const text = word.trim();
      if (!pronunciationEnabled || !text) return;

      if (typeof window !== 'undefined') {
        refreshVoices();
        const isFirefox = /Firefox/i.test(navigator.userAgent);
        const delay = isFirefox ? 300 : 100;
        await new Promise(resolve => setTimeout(resolve, delay));
      }

      await speak(text, {
        rate: pronunciationSpeed,
        pitch: pronunciationPitch,
        volume: 0.8,
      });
    },
    [
      pronunciationEnabled,
      pronunciationPitch,
      pronunciationSpeed,
      refreshVoices,
      speak,
    ],
  );

  useEffect(() => {
    let active = true;

    fetch(`/api/kanji/examples?char=${encodeURIComponent(kanjiChar)}`)
      .then(res => {
        if (!res.ok) throw new Error(`HTTP error ${res.status}`);
        return res.json() as Promise<KanjiExampleItem[]>;
      })
      .then(data => {
        if (active) {
          setDataState({
            char: kanjiChar,
            items: data || [],
            loading: false,
          });
        }
      })
      .catch(err => {
        console.error('Failed to load kanji examples:', err);
        if (active) {
          setDataState({
            char: kanjiChar,
            items: [],
            loading: false,
          });
        }
      });

    return () => {
      active = false;
    };
  }, [kanjiChar]);

  const loading = dataState.char !== kanjiChar || dataState.loading;
  const examples = useMemo(
    () => (dataState.char === kanjiChar ? dataState.items : []),
    [dataState.char, dataState.items, kanjiChar],
  );

  const onExamples = useMemo(
    () => examples.filter(item => item.readingType === 'on'),
    [examples],
  );

  const kunExamples = useMemo(
    () => examples.filter(item => item.readingType === 'kun'),
    [examples],
  );

  const filteredExamples = useMemo(() => {
    if (activeFilter === 'on') return onExamples;
    if (activeFilter === 'kun') return kunExamples;
    return examples;
  }, [activeFilter, examples, onExamples, kunExamples]);

  if (loading) {
    return (
      <div className='flex w-full flex-col items-center justify-center gap-3 py-10'>
        <Loader2 className='animate-spin text-(--main-color)' size={28} />
        <span className='text-xs font-medium text-(--secondary-color)/60'>
          Đang tải ví dụ từ vựng...
        </span>
      </div>
    );
  }

  if (examples.length === 0) {
    return (
      <div className='flex w-full flex-col items-center justify-center rounded-xl border border-(--border-color) bg-(--background-color) p-6 text-center text-sm text-(--secondary-color)/60'>
        Chưa có ví dụ từ vựng nào cho chữ {kanjiChar}.
      </div>
    );
  }

  return (
    <div className={clsx('flex w-full flex-col gap-4', className)}>
      {/* Header & Filter Tabs */}
      <div className='flex flex-wrap items-center justify-between gap-3 border-b border-(--border-color) pb-3'>
        <div className='flex items-center gap-2'>
          <BookOpen className='text-(--main-color)' size={20} />
          <h3 className='text-base font-bold text-(--secondary-color)'>
            Từ vựng ví dụ thực tế ({examples.length})
          </h3>
        </div>

        {/* Filter Pills */}
        <div className='flex items-center gap-1.5 rounded-xl bg-(--background-color) p-1'>
          <button
            type='button'
            onClick={() => {
              playClick();
              setActiveFilter('all');
            }}
            className={clsx(
              'cursor-pointer rounded-lg px-3 py-1 text-xs font-bold transition-all',
              activeFilter === 'all'
                ? 'bg-(--card-color) text-(--main-color) shadow-xs'
                : 'text-(--secondary-color)/60 hover:text-(--secondary-color)',
            )}
          >
            Tất cả ({examples.length})
          </button>
          <button
            type='button'
            onClick={() => {
              playClick();
              setActiveFilter('on');
            }}
            className={clsx(
              'cursor-pointer rounded-lg px-3 py-1 text-xs font-bold transition-all',
              activeFilter === 'on'
                ? 'bg-(--card-color) text-sky-500 shadow-xs dark:text-sky-400'
                : 'text-(--secondary-color)/60 hover:text-(--secondary-color)',
            )}
          >
            Âm On ({onExamples.length})
          </button>
          <button
            type='button'
            onClick={() => {
              playClick();
              setActiveFilter('kun');
            }}
            className={clsx(
              'cursor-pointer rounded-lg px-3 py-1 text-xs font-bold transition-all',
              activeFilter === 'kun'
                ? 'bg-(--card-color) text-emerald-500 shadow-xs dark:text-emerald-400'
                : 'text-(--secondary-color)/60 hover:text-(--secondary-color)',
            )}
          >
            Âm Kun ({kunExamples.length})
          </button>
        </div>
      </div>

      {/* Examples Grid */}
      <div className='grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3'>
        {filteredExamples.map(item => (
          <div
            key={`${item.id}-${item.kanji}`}
            className='group flex flex-col justify-between rounded-xl border border-(--border-color) bg-(--background-color) p-3.5 transition-all hover:border-(--main-color)/40 hover:bg-(--card-color)/70'
          >
            <div className='flex items-start justify-between gap-2'>
              {/* Word & Furigana */}
              <div className='flex flex-col'>
                <div className='text-xl font-extrabold text-(--secondary-color)'>
                  <FuriganaText text={item.kanji} reading={item.kana} />
                </div>
                <div className='text-xs font-medium text-(--secondary-color)/60'>
                  {item.kana}
                </div>
              </div>

              {/* Badges & Pronounce */}
              <div className='flex items-center gap-1.5'>
                {item.readingType === 'on' && (
                  <span className='rounded-md border border-sky-500/20 bg-sky-500/10 px-1.5 py-0.5 text-[10px] font-bold tracking-wide text-sky-600 uppercase dark:text-sky-400'>
                    Âm On
                  </span>
                )}
                {item.readingType === 'kun' && (
                  <span className='rounded-md border border-emerald-500/20 bg-emerald-500/10 px-1.5 py-0.5 text-[10px] font-bold tracking-wide text-emerald-600 uppercase dark:text-emerald-400'>
                    Âm Kun
                  </span>
                )}
                <span className='rounded-md border border-(--border-color) bg-(--card-color) px-1.5 py-0.5 text-[10px] font-semibold text-(--secondary-color)/60 uppercase'>
                  {item.level}
                </span>

                <button
                  type='button'
                  onClick={() => {
                    void playWordPronunciation(item.kana || item.kanji);
                  }}
                  disabled={!pronunciationEnabled}
                  className={clsx(
                    'flex h-7 w-7 items-center justify-center rounded-full bg-(--card-color) text-(--main-color) transition-colors',
                    pronunciationEnabled
                      ? 'cursor-pointer hover:bg-(--main-color)/20 hover:text-(--main-color)'
                      : 'cursor-not-allowed opacity-50',
                  )}
                  title={`Nghe phát âm: ${item.kanji}`}
                  aria-label={`Nghe phát âm ${item.kanji}`}
                >
                  <Volume2 size={14} className='fill-current' />
                </button>
              </div>
            </div>

            {/* Vietnamese Meaning */}
            <div className='mt-2 border-t border-(--border-color)/50 pt-2 text-xs font-medium text-(--secondary-color)/80'>
              {item.definition}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
