'use client';

import React, { useEffect, useState, useCallback, useMemo } from 'react';
import {
  X,
  Volume2,
  Copy,
  Check,
  BookOpen,
  Sparkles,
  ExternalLink,
  Plus,
  BookmarkCheck,
  Languages,
} from 'lucide-react';
import clsx from 'clsx';
import { toKana, toRomaji } from 'wanakana';
import useVocabStore from '@/features/Vocabulary/store/useVocabStore';
import { useClick } from '@/shared/hooks/generic/useAudio';
import { useJapaneseTTS } from '@/features/Preferences/hooks/useJapaneseTTS';
import { useAudioPreferences } from '@/features/Preferences';
import { parseFuriganaSegments } from '@/shared/utils/furigana';
import hanvietMapRaw from '@/shared/data/kanji_hanviet.json';
import { kanjiDataService } from '@/features/Kanji/services/kanjiDataService';
import { cardBorderStyles, buttonBorderStyles } from '@/shared/utils/styles';

import type { IKanjiObj } from '@/entities/kanji';

const hanvietMap = hanvietMapRaw as Record<string, string>;
const KANJI_REGEX = /[\u4e00-\u9faf\u3400-\u4dbf]/g;

export default function ThamTuVungModal() {
  const activeDetailWord = useVocabStore(state => state.activeDetailWord);
  const setActiveDetailWord = useVocabStore(state => state.setActiveDetailWord);

  const selectedVocabObjs = useVocabStore(state => state.selectedVocabObjs);
  const addVocabObj = useVocabStore(state => state.addVocabObj);

  const { playClick } = useClick();
  const { pronunciationEnabled, pronunciationSpeed, pronunciationPitch } =
    useAudioPreferences();
  const { speak, stop, refreshVoices } = useJapaneseTTS();

  const [copied, setCopied] = useState(false);
  const [isPlayingSlow, setIsPlayingSlow] = useState(false);
  const [isPlayingNormal, setIsPlayingNormal] = useState(false);
  const [kanjiList, setKanjiList] = useState<IKanjiObj[]>(() => {
    return Object.values(kanjiDataService.getAllCached())
      .flat()
      .filter(Boolean);
  });

  // Ensure Kanji data is fully preloaded in background for On/Kun and definitions
  useEffect(() => {
    let isMounted = true;
    const initial = Object.values(kanjiDataService.getAllCached())
      .flat()
      .filter(Boolean);

    if (initial.length === 0) {
      kanjiDataService
        .preloadAll()
        .then(() => {
          if (isMounted) {
            const all = Object.values(kanjiDataService.getAllCached())
              .flat()
              .filter(Boolean);
            setKanjiList(all);
          }
        })
        .catch(console.error);
    }

    return () => {
      isMounted = false;
    };
  }, []);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && activeDetailWord) {
        setActiveDetailWord(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeDetailWord, setActiveDetailWord]);

  // Lock body scroll when modal is open
  useEffect(() => {
    if (activeDetailWord) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [activeDetailWord]);

  const handlePronounce = useCallback(
    async (speed: number = 1.0) => {
      if (!activeDetailWord) return;
      const reading =
        activeDetailWord.reading?.trim() || activeDetailWord.word?.trim();
      if (!pronunciationEnabled || !reading) return;

      stop();
      if (speed < 1.0) {
        setIsPlayingSlow(true);
        setIsPlayingNormal(false);
      } else {
        setIsPlayingNormal(true);
        setIsPlayingSlow(false);
      }

      if (typeof window !== 'undefined') {
        refreshVoices();
        const isFirefox = /Firefox/i.test(navigator.userAgent);
        const delay = isFirefox ? 300 : 100;
        await new Promise(resolve => setTimeout(resolve, delay));
      }

      await speak(reading, {
        rate: pronunciationSpeed * speed,
        pitch: pronunciationPitch,
        volume: 0.9,
      });

      setIsPlayingSlow(false);
      setIsPlayingNormal(false);
    },
    [
      activeDetailWord,
      pronunciationEnabled,
      pronunciationPitch,
      pronunciationSpeed,
      refreshVoices,
      speak,
      stop,
    ],
  );

  const handleCopy = () => {
    if (!activeDetailWord) return;
    playClick();
    navigator.clipboard.writeText(activeDetailWord.word);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Extract Kanji characters and match Han-Viet readings
  const kanjiBreakdown = useMemo(() => {
    if (!activeDetailWord) return [];
    const kanjis = activeDetailWord.word.match(KANJI_REGEX) || [];
    const uniqueKanjis = Array.from(new Set(kanjis));

    return uniqueKanjis.map(char => {
      const kanjiInfo = kanjiList.find(k => k && k.kanjiChar === char);
      const hanviet = kanjiInfo?.hanviet || hanvietMap[char] || '';
      return {
        char,
        hanviet,
        onyomi: kanjiInfo?.onyomi || [],
        kunyomi: kanjiInfo?.kunyomi || [],
        meanings: kanjiInfo?.meanings || [],
      };
    });
  }, [activeDetailWord, kanjiList]);

  if (!activeDetailWord) return null;

  const rawReading =
    typeof activeDetailWord.reading === 'string'
      ? activeDetailWord.reading
      : '';
  const baseReading = rawReading.split(' ')[1] || rawReading;
  const kanaReading = toKana(baseReading);
  const romajiReading = toRomaji(baseReading);
  const segments = parseFuriganaSegments(
    activeDetailWord.word,
    activeDetailWord.reading,
  );

  const isSelected = selectedVocabObjs.some(
    item => item.word === activeDetailWord.word,
  );

  return (
    <div
      className='fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6'
      role='dialog'
      aria-modal='true'
      aria-labelledby='tham-tuvung-title'
    >
      {/* Backdrop */}
      <div
        className='animate-in fade-in fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity duration-200'
        onClick={() => {
          playClick();
          setActiveDetailWord(null);
        }}
      />

      {/* Modal Container */}
      <div
        className={clsx(
          'relative z-10 flex max-h-[92vh] w-full max-w-3xl flex-col overflow-hidden rounded-3xl border lg:max-w-4xl',
          'bg-(--card-color) text-(--main-color) shadow-2xl',
          'animate-in zoom-in-95 fade-in-50 duration-200',
          cardBorderStyles,
        )}
      >
        {/* Header Bar */}
        <div className='flex items-center justify-between border-b border-(--border-color) px-6 py-4.5 sm:px-8'>
          <div className='flex items-center gap-3'>
            <div className='flex size-9 items-center justify-center rounded-xl bg-(--main-color)/10 text-(--main-color) shadow-xs'>
              <BookOpen className='size-5' />
            </div>
            <div>
              <h2
                id='tham-tuvung-title'
                className='text-base font-black tracking-wide text-(--main-color) uppercase'
              >
                ThamTuVung • Tra cứu từ vựng
              </h2>
              <p className='text-xs text-(--secondary-color)/80'>
                Từ điển & Phân tích chi tiết PThamSS
              </p>
            </div>
          </div>

          <button
            type='button'
            onClick={() => {
              playClick();
              setActiveDetailWord(null);
            }}
            className='flex size-9 items-center justify-center rounded-xl text-(--secondary-color) transition-colors hover:bg-(--secondary-color)/10 hover:text-(--main-color)'
            aria-label='Đóng'
          >
            <X className='size-5.5' />
          </button>
        </div>

        {/* Modal Body - Scrollable */}
        <div className='flex-1 space-y-7 overflow-y-auto p-6 sm:p-8'>
          {/* Main Word Card */}
          <div className='flex flex-col items-center justify-center rounded-3xl border border-(--border-color) bg-(--background-color)/40 p-7 text-center shadow-inner sm:p-9'>
            {/* Furigana + Big Word */}
            <div className='flex items-end justify-center text-6xl font-black text-(--main-color) sm:text-7xl md:text-8xl'>
              {segments.map((seg, idx) => (
                <ruby key={idx} className='leading-none select-text'>
                  {seg.text}
                  {seg.furigana && (
                    <rt className='pb-1 text-base font-bold text-(--secondary-color) opacity-85 sm:text-lg'>
                      {seg.furigana}
                    </rt>
                  )}
                </ruby>
              ))}
            </div>

            {/* Reading details: Hiragana & Romaji */}
            <div className='mt-4 flex flex-wrap items-center justify-center gap-3 text-lg font-bold text-(--secondary-color)'>
              <span className='rounded-xl bg-(--secondary-color)/10 px-3.5 py-1 text-(--main-color)'>
                {kanaReading}
              </span>
              <span className='text-sm opacity-50'>•</span>
              <span className='italic opacity-85'>{romajiReading}</span>
            </div>

            {/* Audio Pronunciation & Copy Actions */}
            <div className='mt-6 flex flex-wrap items-center justify-center gap-3'>
              <button
                type='button'
                onClick={() => handlePronounce(1.0)}
                className={clsx(
                  'inline-flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-bold transition-all select-none',
                  buttonBorderStyles,
                  isPlayingNormal
                    ? 'animate-pulse border-emerald-500 bg-emerald-500/20 text-emerald-400'
                    : 'border-(--border-color) bg-(--card-color) text-(--main-color) shadow-xs hover:border-(--main-color)',
                )}
              >
                <Volume2 className='size-4.5' />
                <span>Phát âm (1.0x)</span>
              </button>

              <button
                type='button'
                onClick={() => handlePronounce(0.75)}
                className={clsx(
                  'inline-flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-bold transition-all select-none',
                  buttonBorderStyles,
                  isPlayingSlow
                    ? 'animate-pulse border-emerald-500 bg-emerald-500/20 text-emerald-400'
                    : 'border-(--border-color) bg-(--card-color) text-(--secondary-color) shadow-xs hover:text-(--main-color)',
                )}
              >
                <span>Chậm (0.75x)</span>
              </button>

              <button
                type='button'
                onClick={handleCopy}
                className='inline-flex items-center gap-2 rounded-xl border border-(--border-color) bg-(--card-color) px-4 py-2.5 text-sm font-bold text-(--secondary-color) shadow-xs transition-all select-none hover:text-(--main-color)'
              >
                {copied ? (
                  <Check className='size-4.5 text-emerald-400' />
                ) : (
                  <Copy className='size-4.5' />
                )}
                <span>{copied ? 'Đã sao chép' : 'Sao chép'}</span>
              </button>
            </div>
          </div>

          {/* Kanji Breakdown Section (Hán-Việt) */}
          {kanjiBreakdown.length > 0 && (
            <div className='space-y-3.5'>
              <div className='flex items-center gap-2 text-xs font-bold tracking-wider text-(--secondary-color) uppercase'>
                <Sparkles className='size-4 text-amber-400' />
                <span>Phân tích Hán - Việt ({kanjiBreakdown.length} chữ)</span>
              </div>

              <div className='grid grid-cols-1 gap-3.5 sm:grid-cols-2'>
                {kanjiBreakdown.map(k => (
                  <div
                    key={k.char}
                    className='flex items-start gap-4 rounded-2xl border border-(--border-color) bg-(--card-color)/80 p-4.5 shadow-xs transition-colors hover:border-(--main-color)/40'
                  >
                    <div className='flex size-16 shrink-0 items-center justify-center rounded-2xl bg-(--main-color)/10 text-4xl font-black text-(--main-color)'>
                      {k.char}
                    </div>

                    <div className='flex min-w-0 flex-1 flex-col'>
                      <div className='flex items-center gap-2'>
                        <span className='text-lg font-black tracking-wide text-(--main-color) uppercase'>
                          {k.hanviet || '—'}
                        </span>
                      </div>

                      {k.meanings.length > 0 && (
                        <p className='mt-1 line-clamp-2 text-xs font-medium text-(--secondary-color)'>
                          {k.meanings.join(', ')}
                        </p>
                      )}

                      {(k.onyomi.length > 0 || k.kunyomi.length > 0) && (
                        <div className='mt-2 flex flex-wrap gap-1.5 text-xs text-(--secondary-color)/85'>
                          {k.onyomi.length > 0 && (
                            <span className='rounded-lg bg-(--secondary-color)/10 px-2 py-0.5 font-medium'>
                              On: {k.onyomi.join('・')}
                            </span>
                          )}
                          {k.kunyomi.length > 0 && (
                            <span className='rounded-lg bg-(--secondary-color)/10 px-2 py-0.5 font-medium'>
                              Kun: {k.kunyomi.join('・')}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Definitions / Meanings */}
          <div className='space-y-3.5'>
            <div className='flex items-center gap-2 text-xs font-bold tracking-wider text-(--secondary-color) uppercase'>
              <Languages className='size-4 text-sky-400' />
              <span>Ý nghĩa từ vựng</span>
            </div>

            <div className='flex flex-col gap-2.5 rounded-2xl border border-(--border-color) bg-(--background-color)/30 p-5'>
              {activeDetailWord.meanings &&
              activeDetailWord.meanings.length > 0 ? (
                activeDetailWord.meanings.map((meaning, idx) => (
                  <div key={idx} className='flex items-start gap-3.5 text-base'>
                    <span className='flex size-6 shrink-0 items-center justify-center rounded-full bg-(--main-color)/10 text-xs font-black text-(--main-color)'>
                      {idx + 1}
                    </span>
                    <span className='leading-relaxed font-semibold text-(--main-color) select-text'>
                      {meaning}
                    </span>
                  </div>
                ))
              ) : (
                <p className='text-sm text-(--secondary-color)'>
                  Không có giải nghĩa bổ sung.
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className='flex flex-wrap items-center justify-between gap-3 border-t border-(--border-color) bg-(--background-color)/40 px-6 py-4.5 sm:px-8'>
          <div className='flex items-center gap-3'>
            <a
              href={`https://jisho.org/search/${encodeURIComponent(activeDetailWord.word)}`}
              target='_blank'
              rel='noopener noreferrer'
              className='inline-flex items-center gap-1 text-xs font-semibold text-(--secondary-color) hover:text-(--main-color)'
            >
              <span>Tra trên Jisho</span>
              <ExternalLink className='size-3.5' />
            </a>
            <span className='text-xs text-(--secondary-color)/40'>•</span>
            <a
              href={`https://mazii.net/search/word?dict=javi&query=${encodeURIComponent(activeDetailWord.word)}`}
              target='_blank'
              rel='noopener noreferrer'
              className='inline-flex items-center gap-1 text-xs font-semibold text-(--secondary-color) hover:text-(--main-color)'
            >
              <span>Mazii</span>
              <ExternalLink className='size-3.5' />
            </a>
          </div>

          <button
            type='button'
            onClick={() => {
              playClick();
              addVocabObj(activeDetailWord);
            }}
            className={clsx(
              'inline-flex items-center gap-2 rounded-xl border px-5 py-2.5 text-sm font-bold transition-all select-none',
              buttonBorderStyles,
              isSelected
                ? 'border-emerald-500 bg-emerald-500/15 text-emerald-400'
                : 'border-(--main-color) bg-(--main-color) text-(--background-color)',
            )}
          >
            {isSelected ? (
              <>
                <BookmarkCheck className='size-4.5' />
                <span>Đã thêm vào luyện tập</span>
              </>
            ) : (
              <>
                <Plus className='size-4.5' />
                <span>Chọn để luyện tập</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
