'use client';

import clsx from 'clsx';
import { Link } from '@/core/i18n/routing';
import type { IKanjiObj } from '@/features/Kanji/store/useKanjiStore';
import {
  useAudioPreferences,
  useThemePreferences,
} from '@/features/Preferences';
import { useJapaneseTTS } from '@/features/Preferences/hooks/useJapaneseTTS';
import FuriganaText from '@/shared/ui-composite/text/FuriganaText';
import { useClick } from '@/shared/hooks/generic/useAudio';
import { removeVerbDuplicates } from '@/shared/utils/meanings';
import { Volume2 } from 'lucide-react';
import { memo, useCallback } from 'react';
import KanjiStrokeView from '@/features/Kanji/components/KanjiStrokeView';

type KanjiSetDictionaryProps = {
  words: IKanjiObj[];
  large?: boolean;
};

const KanjiSetDictionary = memo(function KanjiSetDictionary({
  words,
  large = false,
}: KanjiSetDictionaryProps) {
  const { playClick } = useClick();
  const { displayKana: showKana } = useThemePreferences();
  const { pronunciationEnabled, pronunciationSpeed, pronunciationPitch } =
    useAudioPreferences();
  const { speak, refreshVoices } = useJapaneseTTS();

  const playReadingPronunciation = useCallback(
    async (reading: string) => {
      const normalizedReading = reading.trim();
      if (!pronunciationEnabled || !normalizedReading) return;

      if (typeof window !== 'undefined') {
        refreshVoices();
        const isFirefox = /Firefox/i.test(navigator.userAgent);
        const delay = isFirefox ? 300 : 100;
        await new Promise(resolve => setTimeout(resolve, delay));
      }

      await speak(normalizedReading, {
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

  return (
    <div className={clsx('flex flex-col')}>
      {words.map((kanjiObj, i) => {
        if (large) {
          // Giao diện phóng to dành riêng cho trang chi tiết chữ Kanji
          return (
            <div key={kanjiObj.id} className='flex w-full flex-col gap-6 py-2'>
              <div className='flex w-full flex-col items-center gap-6 sm:flex-row sm:items-start lg:gap-10'>
                {/* Cột trái: Ô chữ Kanji nét vẽ hoạt ảnh */}
                <div className='flex shrink-0 flex-col items-center gap-3'>
                  <KanjiStrokeView kanjiChar={kanjiObj.kanjiChar} />
                </div>

                {/* Cột phải: Âm On và Âm Kun to, rõ ràng */}
                <div className='flex w-full flex-1 flex-col justify-center gap-4 py-1 sm:gap-6'>
                  {/* Âm On */}
                  {kanjiObj.onyomi.length > 0 && kanjiObj.onyomi[0] !== '' && (
                    <div className='flex flex-col gap-2'>
                      <span className='text-xs font-bold tracking-wider text-(--main-color) uppercase sm:text-sm'>
                        Âm On
                      </span>
                      <div className='flex flex-row gap-2 rounded-2xl border border-(--border-color)/60 bg-(--background-color) p-2 shadow-xs'>
                        {kanjiObj.onyomi
                          .slice(0, 4)
                          .map((onyomiReading, idx) => {
                            const pronunciation =
                              onyomiReading.split(' ')[1] || onyomiReading;

                            return (
                              <button
                                type='button'
                                key={onyomiReading}
                                onClick={() => {
                                  void playReadingPronunciation(pronunciation);
                                }}
                                disabled={
                                  !pronunciationEnabled || !pronunciation.trim()
                                }
                                className={clsx(
                                  'group flex w-full flex-row items-center justify-center rounded-xl bg-transparent px-3 py-2.5 text-base font-semibold text-(--secondary-color) transition-all sm:text-lg md:text-xl',
                                  pronunciationEnabled &&
                                    pronunciation.trim() &&
                                    'hover:cursor-pointer hover:bg-(--card-color) hover:text-(--main-color)',
                                  (!pronunciationEnabled ||
                                    !pronunciation.trim()) &&
                                    'cursor-not-allowed opacity-70',
                                  idx <
                                    kanjiObj.onyomi.slice(0, 4).length - 1 &&
                                    'border-r border-(--border-color)',
                                )}
                                aria-label={`Play pronunciation for ${kanjiObj.kanjiChar} on'yomi ${pronunciation}`}
                              >
                                <div className='flex items-center gap-2'>
                                  <span
                                    className={clsx(
                                      showKana && 'font-japanese',
                                    )}
                                  >
                                    {showKana
                                      ? pronunciation
                                      : onyomiReading.split(' ')[0]}
                                  </span>
                                  <span
                                    className={clsx(
                                      'flex h-7 w-7 items-center justify-center rounded-full bg-(--card-color) text-(--main-color) shadow-xs transition-colors duration-200 sm:h-8 sm:w-8',
                                      pronunciationEnabled &&
                                        pronunciation.trim() &&
                                        'group-hover:bg-(--main-color)/15',
                                    )}
                                  >
                                    <Volume2
                                      size={16}
                                      className='fill-current'
                                    />
                                  </span>
                                </div>
                              </button>
                            );
                          })}
                      </div>
                    </div>
                  )}

                  {/* Âm Kun */}
                  {kanjiObj.kunyomi.length > 0 &&
                    kanjiObj.kunyomi[0] !== '' && (
                      <div className='flex flex-col gap-2'>
                        <span className='text-xs font-bold tracking-wider text-(--main-color) uppercase sm:text-sm'>
                          Âm Kun
                        </span>
                        <div className='flex flex-row gap-2 rounded-2xl border border-(--border-color)/60 bg-(--background-color) p-2 shadow-xs'>
                          {kanjiObj.kunyomi
                            .slice(0, 4)
                            .map((kunyomiReading, idx) => {
                              const pronunciation =
                                kunyomiReading.split(' ')[1] || kunyomiReading;

                              return (
                                <button
                                  type='button'
                                  key={kunyomiReading}
                                  onClick={() => {
                                    void playReadingPronunciation(
                                      pronunciation,
                                    );
                                  }}
                                  disabled={
                                    !pronunciationEnabled ||
                                    !pronunciation.trim()
                                  }
                                  className={clsx(
                                    'group flex w-full flex-row items-center justify-center rounded-xl bg-transparent px-3 py-2.5 text-base font-semibold text-(--secondary-color) transition-all sm:text-lg md:text-xl',
                                    pronunciationEnabled &&
                                      pronunciation.trim() &&
                                      'hover:cursor-pointer hover:bg-(--card-color) hover:text-(--main-color)',
                                    (!pronunciationEnabled ||
                                      !pronunciation.trim()) &&
                                      'cursor-not-allowed opacity-70',
                                    idx <
                                      kanjiObj.kunyomi.slice(0, 4).length - 1 &&
                                      'border-r border-(--border-color)',
                                  )}
                                  aria-label={`Play pronunciation for ${kanjiObj.kanjiChar} kun'yomi ${pronunciation}`}
                                >
                                  <div className='flex items-center gap-2'>
                                    <span
                                      className={clsx(
                                        showKana && 'font-japanese',
                                      )}
                                    >
                                      {showKana
                                        ? pronunciation
                                        : kunyomiReading.split(' ')[0]}
                                    </span>
                                    <span
                                      className={clsx(
                                        'flex h-7 w-7 items-center justify-center rounded-full bg-(--card-color) text-(--main-color) shadow-xs transition-colors duration-200 sm:h-8 sm:w-8',
                                        pronunciationEnabled &&
                                          pronunciation.trim() &&
                                          'group-hover:bg-(--main-color)/15',
                                      )}
                                    >
                                      <Volume2
                                        size={16}
                                        className='fill-current'
                                      />
                                    </span>
                                  </div>
                                </button>
                              );
                            })}
                        </div>
                      </div>
                    )}
                </div>
              </div>

              {/* Nghĩa tiếng Việt tràn nguyên 1 dòng bên dưới cả ô Kanji lẫn Âm Kun */}
              <div className='w-full pt-1'>
                <p className='text-2xl font-extrabold tracking-tight text-(--secondary-color) sm:text-3xl md:text-4xl'>
                  {removeVerbDuplicates(kanjiObj.meanings).join(', ')}
                </p>
              </div>
            </div>
          );
        }

        // Giao diện mặc định 100% như cũ cho trang /kanji và danh sách Kanji
        return (
          <div
            key={kanjiObj.id}
            className={clsx(
              'flex w-full flex-col items-center justify-start gap-2 py-4 max-md:px-4',
              i !== words.length - 1 && 'border-b-1 border-(--border-color)',
            )}
          >
            <div className='flex w-full flex-row gap-4'>
              <Link
                className='group relative flex aspect-square w-full max-w-[100px] items-center justify-center hover:cursor-pointer'
                href={`/kanji/thamkanji/${kanjiObj.kanjiChar}`}
                prefetch={false}
                onClick={() => {
                  playClick();
                }}
              >
                {/* 4-segment square background */}
                <div className='absolute inset-0 grid grid-cols-2 grid-rows-2 rounded-xl border-1 border-(--border-color) bg-(--background-color) transition-all group-hover:bg-(--card-color)'>
                  <div className='border-r border-b border-(--border-color)'></div>
                  <div className='border-b border-(--border-color)'></div>
                  <div className='border-r border-(--border-color)'></div>
                  <div className=''></div>
                </div>

                <FuriganaText
                  text={kanjiObj.kanjiChar}
                  reading={kanjiObj.onyomi[0] || kanjiObj.kunyomi[0]}
                  className='relative z-10 pb-2 text-7xl'
                  lang='ja'
                />
              </Link>

              <div className='flex w-full flex-col gap-1'>
                {kanjiObj.onyomi.length > 0 && kanjiObj.onyomi[0] !== '' && (
                  <span className='w-full text-xs font-semibold text-(--main-color)'>
                    Âm On
                  </span>
                )}
                <div
                  className={clsx(
                    'h-1/2',
                    'rounded-xl bg-(--background-color)',
                    'flex flex-row gap-2',
                    (kanjiObj.onyomi[0] === '' ||
                      kanjiObj.onyomi.length === 0) &&
                      'hidden',
                  )}
                >
                  {kanjiObj.onyomi.slice(0, 2).map((onyomiReading, idx) => {
                    const pronunciation =
                      onyomiReading.split(' ')[1] || onyomiReading;

                    return (
                      <button
                        type='button'
                        key={onyomiReading}
                        onClick={() => {
                          void playReadingPronunciation(pronunciation);
                        }}
                        disabled={
                          !pronunciationEnabled || !pronunciation.trim()
                        }
                        className={clsx(
                          'group flex w-full flex-row items-center justify-center bg-transparent px-2 py-1.5 text-sm md:text-base',
                          'w-full text-(--secondary-color)',
                          pronunciationEnabled &&
                            pronunciation.trim() &&
                            'hover:cursor-pointer md:hover:text-(--main-color)',
                          (!pronunciationEnabled || !pronunciation.trim()) &&
                            'cursor-not-allowed opacity-70',
                          idx < kanjiObj.onyomi.slice(0, 2).length - 1 &&
                            'border-r-1 border-(--border-color)',
                        )}
                        aria-label={`Play pronunciation for ${kanjiObj.kanjiChar} on'yomi ${pronunciation}`}
                      >
                        <div className='flex items-center gap-1.75 sm:gap-2'>
                          <span className={clsx(showKana && 'font-japanese')}>
                            {showKana
                              ? pronunciation
                              : onyomiReading.split(' ')[0]}
                          </span>
                          <span
                            className={clsx(
                              'flex h-6 w-6 items-center justify-center rounded-full bg-(--card-color) text-(--main-color)',
                              'transition-colors duration-200',
                              pronunciationEnabled &&
                                pronunciation.trim() &&
                                'md:group-hover:bg-(--main-color)/15',
                            )}
                          >
                            <Volume2 size={15} className='fill-current' />
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
                {kanjiObj.kunyomi.length > 0 && kanjiObj.kunyomi[0] !== '' && (
                  <span className='w-full text-xs font-semibold text-(--main-color)'>
                    Âm Kun
                  </span>
                )}

                <div
                  className={clsx(
                    'h-1/2',
                    'rounded-xl bg-(--background-color)',
                    'flex flex-row gap-2',
                    (kanjiObj.kunyomi[0] === '' ||
                      kanjiObj.kunyomi.length === 0) &&
                      'hidden',
                  )}
                >
                  {kanjiObj.kunyomi.slice(0, 2).map((kunyomiReading, idx) => {
                    const pronunciation =
                      kunyomiReading.split(' ')[1] || kunyomiReading;

                    return (
                      <button
                        type='button'
                        key={kunyomiReading}
                        onClick={() => {
                          void playReadingPronunciation(pronunciation);
                        }}
                        disabled={
                          !pronunciationEnabled || !pronunciation.trim()
                        }
                        className={clsx(
                          'group flex w-full flex-row items-center justify-center bg-transparent px-2 py-1.5 text-sm md:text-base',
                          'w-full text-(--secondary-color)',
                          pronunciationEnabled &&
                            pronunciation.trim() &&
                            'hover:cursor-pointer md:hover:text-(--main-color)',
                          (!pronunciationEnabled || !pronunciation.trim()) &&
                            'cursor-not-allowed opacity-70',
                          idx < kanjiObj.kunyomi.slice(0, 2).length - 1 &&
                            'border-r-1 border-(--border-color)',
                        )}
                        aria-label={`Play pronunciation for ${kanjiObj.kanjiChar} kun'yomi ${pronunciation}`}
                      >
                        <div className='flex items-center gap-1.75 sm:gap-2'>
                          <span className={clsx(showKana && 'font-japanese')}>
                            {showKana
                              ? pronunciation
                              : kunyomiReading.split(' ')[0]}
                          </span>
                          <span
                            className={clsx(
                              'flex h-6 w-6 items-center justify-center rounded-full bg-(--card-color) text-(--main-color)',
                              'transition-colors duration-200',
                              pronunciationEnabled &&
                                pronunciation.trim() &&
                                'md:group-hover:bg-(--main-color)/15',
                            )}
                          >
                            <Volume2 size={15} className='fill-current' />
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            <p className='w-full text-xl text-(--secondary-color) md:text-2xl'>
              {removeVerbDuplicates(kanjiObj.meanings).join(', ')}
            </p>
          </div>
        );
      })}
    </div>
  );
});

export default KanjiSetDictionary;
