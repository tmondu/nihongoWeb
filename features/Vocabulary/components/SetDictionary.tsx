'use client';

import clsx from 'clsx';
import { toKana, toRomaji } from 'wanakana';
import { IWord } from '@/shared/types/interfaces';
import {
  useAudioPreferences,
  useThemePreferences,
} from '@/features/Preferences';
import { useJapaneseTTS } from '@/features/Preferences/hooks/useJapaneseTTS';
import { parseFuriganaSegments } from '@/shared/utils/furigana';
import { Volume2 } from 'lucide-react';
import { memo, useCallback, useState } from 'react';

type SetDictionaryProps = {
  words: IWord[];
};

const SetDictionary = memo(function SetDictionary({
  words,
}: SetDictionaryProps) {
  const { displayKana: showKana } = useThemePreferences();
  const { pronunciationEnabled, pronunciationSpeed, pronunciationPitch } =
    useAudioPreferences();
  const { speak, stop, isPlaying, refreshVoices } = useJapaneseTTS();
  const [activePronunciationText, setActivePronunciationText] = useState<
    string | null
  >(null);

  const playReadingPronunciation = useCallback(
    async (reading: string) => {
      const normalizedReading = reading.trim();
      if (!pronunciationEnabled || !normalizedReading) return;

      if (isPlaying && activePronunciationText === normalizedReading) {
        stop();
        setActivePronunciationText(null);
        return;
      }

      setActivePronunciationText(normalizedReading);

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

      setActivePronunciationText(current =>
        current === normalizedReading ? null : current,
      );
    },
    [
      activePronunciationText,
      isPlaying,
      pronunciationEnabled,
      pronunciationPitch,
      pronunciationSpeed,
      refreshVoices,
      speak,
      stop,
    ],
  );

  return (
    <div className={clsx('flex flex-col')}>
      {words.map((wordObj, i) => {
        const rawReading =
          typeof wordObj.reading === 'string' ? wordObj.reading : '';
        const baseReading = rawReading.split(' ')[1] || rawReading;
        const displayReading = showKana
          ? toKana(baseReading)
          : toRomaji(baseReading);

        const segments = parseFuriganaSegments(wordObj.word, wordObj.reading);

        return (
          <div
            key={`${wordObj.word}-${i}`}
            className={clsx(
              'flex min-h-[190px] flex-col items-start justify-start gap-2.5 py-4 max-md:px-4',
              i !== words.length - 1 && 'border-b-1 border-(--border-color)',
            )}
          >
            {/* Word container with fixed height and bottom-alignment for consistent baseline */}
            <div className='flex h-[76px] w-full items-end justify-start'>
              <a
                href={`https://jisho.org/search/${encodeURIComponent(
                  wordObj.word,
                )}`}
                target='_blank'
                rel='noopener'
                className='group inline-flex cursor-pointer items-end text-5xl leading-none font-black text-(--main-color) transition-opacity select-none md:text-6xl'
                lang='ja'
              >
                {segments.map((seg, idx) => {
                  if (seg.furigana) {
                    return (
                      <ruby key={idx} className='inline-ruby'>
                        {seg.text}
                        <rt className='pb-1 text-sm font-bold tracking-wider text-(--secondary-color) md:text-base'>
                          {seg.furigana}
                        </rt>
                      </ruby>
                    );
                  }
                  return <span key={idx}>{seg.text}</span>;
                })}
              </a>
            </div>

            <div className='flex w-full flex-col items-start gap-2'>
              <button
                type='button'
                onClick={() => {
                  void playReadingPronunciation(baseReading);
                }}
                disabled={!pronunciationEnabled || !baseReading.trim()}
                className={clsx(
                  'group flex flex-row items-center gap-1.5 rounded-xl px-2 py-1',
                  'bg-(--background-color) text-lg',
                  'text-(--secondary-color)',
                  'transition-colors duration-200',
                  pronunciationEnabled &&
                    baseReading.trim() &&
                    'hover:cursor-pointer md:hover:text-(--main-color)',
                  (!pronunciationEnabled || !baseReading.trim()) &&
                    'cursor-not-allowed opacity-70',
                )}
                aria-label={`Play pronunciation for ${wordObj.word}`}
              >
                <span>{displayReading}</span>
                <span
                  className={clsx(
                    'flex h-6 w-6 items-center justify-center rounded-full bg-(--card-color) text-(--main-color)',
                    'transition-colors duration-200',
                    'max-md:group-active:bg-(--main-color)/15',
                    'md:group-hover:bg-(--main-color)/15',
                  )}
                >
                  <Volume2 size={15} className='fill-current' />
                </span>
              </button>
              <p className='min-h-[3.5rem] text-xl leading-snug text-(--secondary-color) md:text-2xl'>
                {wordObj.meanings.join(', ')}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
});

export default SetDictionary;
