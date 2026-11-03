'use client';

import { useRef, useState, useEffect, useCallback } from 'react';
import { Volume2, Mic, ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/shared/utils/utils';
import type { VocabWord } from '../../types/study';

interface VocabPronounceStudioProps {
  words: VocabWord[];
  lessonId: number;
  pIdx: number;
  scores: Record<string, number>;
  onNavigate: (dir: -1 | 1) => void;
  onSelectWord: (idx: number) => void;
  onScoreUpdated: (key: string, pct: number) => void;
}

// Katakana → Hiragana conversion
function kataToHira(str: string): string {
  return str.replace(/[\u30A1-\u30F6]/g, c =>
    String.fromCharCode(c.charCodeAt(0) - 0x60),
  );
}

// Levenshtein distance
function levenshtein(a: string, b: string): number {
  const m = a.length;
  const n = b.length;
  const dp: number[][] = Array.from({ length: m + 1 }, (_, i) =>
    Array.from({ length: n + 1 }, (_, j) => (i === 0 ? j : j === 0 ? i : 0)),
  );
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      dp[i][j] =
        a[i - 1] === b[j - 1]
          ? dp[i - 1][j - 1]
          : 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
    }
  }
  return dp[m][n];
}

function similarity(a: string, b: string): number {
  const maxLen = Math.max(a.length, b.length);
  if (maxLen === 0) return 1;
  return 1 - levenshtein(a, b) / maxLen;
}

function speak(text: string) {
  if (typeof window === 'undefined') return;
  window.speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text);
  u.lang = 'ja-JP';
  u.rate = 0.85;
  window.speechSynthesis.speak(u);
}

const WAVE_BARS = 44;
const WAVE_HEIGHTS = Array.from(
  { length: WAVE_BARS },
  (_, i) => ((i * 7 + 13) % 36) + 4,
);

export default function VocabPronounceStudio({
  words,
  lessonId,
  pIdx,
  scores,
  onNavigate,
  onSelectWord,
  onScoreUpdated,
}: VocabPronounceStudioProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [caption, setCaption] = useState('');
  const [lastScore, setLastScore] = useState<number | null>(null);
  const [supported, setSupported] = useState(true);
  const recRef = useRef<SpeechRecognition | null>(null);

  const word = words[pIdx];
  const scoreKey = word ? `${lessonId}:${word.hira}` : '';
  const currentScore = scores[scoreKey] ?? lastScore;

  useEffect(() => {
    void (async () => {
      await Promise.resolve();
      const SpeechRec =
        (typeof window !== 'undefined' &&
          (window.SpeechRecognition || window.webkitSpeechRecognition)) ||
        null;
      if (!SpeechRec) setSupported(false);
    })();
  }, []);

  // cleanup on unmount
  useEffect(() => {
    return () => {
      recRef.current?.abort();
    };
  }, []);

  const handleRecord = useCallback(() => {
    if (!word) return;
    if (isRecording) {
      recRef.current?.stop();
      return;
    }

    const SpeechRec =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRec) return;

    const rec = new SpeechRec();
    recRef.current = rec;
    rec.lang = 'ja-JP';
    rec.maxAlternatives = 5;
    rec.interimResults = false;

    rec.onstart = () => {
      setIsRecording(true);
      setCaption('Đang nghe...');
    };

    rec.onresult = (event: SpeechRecognitionEvent) => {
      const target = kataToHira(word.hira.replace(/[〜～]/g, '').trim());
      let best = 0;
      for (let i = 0; i < event.results[0].length; i++) {
        const alt = kataToHira(event.results[0][i].transcript.trim());
        const sim = similarity(alt, target);
        if (sim > best) best = sim;
      }
      const pct = Math.round(best * 100);
      setLastScore(pct);
      setCaption(event.results[0][0].transcript);
      onScoreUpdated(scoreKey, pct);
    };

    rec.onerror = () => {
      setIsRecording(false);
      setCaption('Có lỗi xảy ra. Thử lại nhé.');
    };

    rec.onend = () => {
      setIsRecording(false);
    };

    rec.start();
  }, [isRecording, word, scoreKey, onScoreUpdated]);

  function scoreColor(pct: number) {
    if (pct >= 80) return 'text-green-400';
    if (pct >= 50) return 'text-yellow-400';
    return 'text-red-400';
  }

  return (
    <div className='flex flex-col gap-6 lg:flex-row'>
      {/* Left: Practice panel */}
      <div className='flex flex-1 flex-col gap-5'>
        {!supported && (
          <div className='rounded-xl border border-yellow-500/30 bg-yellow-500/10 p-4 text-sm text-yellow-300'>
            Trình duyệt của bạn không hỗ trợ nhận dạng giọng nói. Hãy dùng
            Chrome/Edge.
          </div>
        )}

        {!word ? (
          <div className='flex h-48 items-center justify-center rounded-xl border border-[var(--border-color)] text-[var(--secondary-color)]'>
            Bài này chưa có dữ liệu.
          </div>
        ) : (
          <>
            {/* Word display */}
            <div className='rounded-2xl border border-[var(--border-color)] bg-[var(--card-color)] p-8 text-center'>
              <p className='text-5xl font-bold tracking-wider text-[var(--foreground-color)]'>
                {word.hira}
              </p>
              {word.kanji && (
                <p className='mt-2 text-lg text-[var(--secondary-color)]'>
                  {word.kanji}
                </p>
              )}
              <p className='mt-3 text-base text-[var(--main-color)]'>
                {word.mean}
              </p>

              <button
                onClick={() => speak(word.hira)}
                className='mx-auto mt-4 flex items-center gap-2 rounded-lg border border-[var(--border-color)] px-4 py-2 text-sm text-[var(--secondary-color)] transition-colors hover:bg-[var(--border-color)] hover:text-[var(--foreground-color)]'
              >
                <Volume2 size={16} />
                Nghe mẫu
              </button>
            </div>

            {/* Wave visualizer */}
            <div className='flex h-14 items-center justify-center gap-0.5 rounded-xl bg-[var(--card-color)] px-4'>
              {Array.from({ length: WAVE_BARS }).map((_, i) => (
                <div
                  key={i}
                  className={cn(
                    'w-1 rounded-full bg-[var(--main-color)] transition-all',
                    isRecording ? 'animate-pulse' : 'h-1 opacity-30',
                  )}
                  style={
                    isRecording
                      ? {
                          height: `${WAVE_HEIGHTS[i]}px`,
                          animationDelay: `${(i % 8) * 0.1}s`,
                          animationDuration: '0.9s',
                        }
                      : {}
                  }
                />
              ))}
            </div>

            {/* Caption */}
            <p className='min-h-6 text-center text-sm text-[var(--secondary-color)] italic'>
              {caption || 'Nhấn nút mic để bắt đầu phát âm'}
            </p>

            {/* Score bar */}
            {currentScore !== null && (
              <div className='flex items-center gap-3'>
                <div className='h-2 flex-1 overflow-hidden rounded-full bg-[var(--border-color)]'>
                  <div
                    className={cn(
                      'h-full rounded-full transition-all duration-700',
                      currentScore >= 80
                        ? 'bg-green-500'
                        : currentScore >= 50
                          ? 'bg-yellow-500'
                          : 'bg-red-500',
                    )}
                    style={{ width: `${currentScore}%` }}
                  />
                </div>
                <span
                  className={cn(
                    'text-sm font-bold tabular-nums',
                    scoreColor(currentScore),
                  )}
                >
                  {currentScore}%
                </span>
              </div>
            )}

            {/* Record button */}
            <div className='flex items-center justify-center gap-4'>
              <button
                onClick={() => onNavigate(-1)}
                disabled={pIdx === 0}
                className='rounded-full border border-[var(--border-color)] p-2.5 text-[var(--secondary-color)] hover:bg-[var(--card-color)] disabled:opacity-30'
              >
                <ChevronLeft size={18} />
              </button>

              <button
                onClick={handleRecord}
                disabled={!supported}
                className={cn(
                  'flex h-16 w-16 items-center justify-center rounded-full shadow-lg transition-all',
                  isRecording
                    ? 'scale-110 animate-pulse bg-red-500 shadow-red-500/30'
                    : 'bg-[var(--main-color)] hover:opacity-90',
                  !supported && 'cursor-not-allowed opacity-40',
                )}
              >
                <Mic size={24} className='text-white' />
              </button>

              <button
                onClick={() => onNavigate(1)}
                disabled={pIdx === words.length - 1}
                className='rounded-full border border-[var(--border-color)] p-2.5 text-[var(--secondary-color)] hover:bg-[var(--card-color)] disabled:opacity-30'
              >
                <ChevronRight size={18} />
              </button>
            </div>
          </>
        )}
      </div>

      {/* Right: Queue list */}
      <div className='w-full shrink-0 lg:w-56'>
        <p className='mb-2 text-xs font-semibold tracking-wide text-[var(--secondary-color)] uppercase'>
          Danh sách
        </p>
        <div
          className='flex flex-col gap-1 overflow-y-auto rounded-xl border border-[var(--border-color)] p-2'
          style={{ maxHeight: '400px' }}
        >
          {words.length === 0 && (
            <p className='py-4 text-center text-xs text-[var(--secondary-color)]'>
              Chưa có dữ liệu
            </p>
          )}
          {words.map((w, i) => {
            const key = `${lessonId}:${w.hira}`;
            const sc = scores[key];
            const isActive = i === pIdx;
            return (
              <button
                key={key}
                onClick={() => onSelectWord(i)}
                className={cn(
                  'flex items-center justify-between rounded-lg px-3 py-2 text-left text-xs transition-colors',
                  isActive
                    ? 'bg-[var(--main-color)]/15 text-[var(--main-color)]'
                    : 'text-[var(--foreground-color)] hover:bg-[var(--card-color)]',
                )}
              >
                <div>
                  <p className='font-medium'>{w.hira}</p>
                  <p className='text-[10px] text-[var(--secondary-color)]'>
                    {w.mean}
                  </p>
                </div>
                {sc !== undefined && (
                  <span
                    className={cn('font-bold tabular-nums', scoreColor(sc))}
                  >
                    {sc}%
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
