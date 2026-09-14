'use client';

import React, { useEffect, useState, useCallback, useId } from 'react';
import {
  X,
  Volume2,
  BookOpen,
  Layers,
  MessageSquare,
  ThumbsUp,
  ThumbsDown,
  Loader2,
  HelpCircle,
} from 'lucide-react';
import { useClick } from '@/shared/hooks/generic/useAudio';
import clsx from 'clsx';
import PitchAccentText from '@/shared/ui-composite/text/PitchAccentText';

export interface ExampleSentence {
  content: string;
  mean: string;
  transcription?: string;
}

export interface CommunityFeedback {
  id: number;
  username: string;
  avatar: string | null;
  mean: string;
  like: number;
  dislike: number;
}

export interface KanjiCompoundWord {
  kanji: string;
  kana: string;
  hanViet?: string;
  mean?: string;
  accent?: string;
  tokenizedKana?: { value: string; type?: string }[];
}

export interface WordPronunciation {
  kana: string;
  accent?: string;
  tokenizedKana?: { value: string; type?: string }[];
}

export interface WordLookupData {
  word: string;
  phonetic?: string;
  pronunciations?: WordPronunciation[];
  means?: {
    kind?: string;
    mean: string;
  }[];
  examples: ExampleSentence[];
  feedbacks: CommunityFeedback[];
  compounds?: KanjiCompoundWord[];
}

interface WordDetailModalProps {
  word: string | null;
  onClose: () => void;
}

export const WordDetailModal: React.FC<WordDetailModalProps> = ({
  word,
  onClose,
}) => {
  const { playClick } = useClick();
  const titleId = useId();
  const [activeTab, setActiveTab] = useState<
    'compounds' | 'examples' | 'feedbacks'
  >('compounds');
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<WordLookupData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [speakingContent, setSpeakingContent] = useState<string | null>(null);

  // Reset state during render when word changes
  const [prevWord, setPrevWord] = useState<string | null>(word);
  if (word !== prevWord) {
    setPrevWord(word);
    setData(null);
    setError(null);
    setLoading(!!word);
  }

  // Play audio via Web Speech API
  const playSpeech = useCallback((text: string) => {
    if (typeof window === 'undefined' || !window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'ja-JP';
    utterance.rate = 0.85;
    utterance.onstart = () => setSpeakingContent(text);
    utterance.onend = () => setSpeakingContent(null);
    utterance.onerror = () => setSpeakingContent(null);
    window.speechSynthesis.speak(utterance);
  }, []);

  // Fetch word data
  useEffect(() => {
    if (!word) return;

    let isMounted = true;

    // Clean search word (remove extra brackets or notes, e.g. "食べる [taberu]" -> "食べる")
    const cleanWord = word.trim().split(/[\s(\[]/)[0] || word.trim();

    fetch(`/api/dictionary/lookup?word=${encodeURIComponent(cleanWord)}`)
      .then(res => {
        if (!res.ok) throw new Error(`HTTP error ${res.status}`);
        return res.json();
      })
      .then((resData: WordLookupData) => {
        if (isMounted) {
          setData(resData);
          setLoading(false);
          // Default tab priority: compounds -> examples -> feedbacks
          if (resData.compounds && resData.compounds.length > 0) {
            setActiveTab('compounds');
          } else if (
            resData.examples?.length === 0 &&
            resData.feedbacks?.length > 0
          ) {
            setActiveTab('feedbacks');
          } else {
            setActiveTab('examples');
          }
        }
      })
      .catch(err => {
        if (isMounted) {
          console.error('Error loading word details:', err);
          setError('Không thể tải thông tin từ điển vào lúc này.');
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [word]);

  // Handle ESC key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  // Lock body scroll
  useEffect(() => {
    if (word) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [word]);

  if (!word) return null;

  return (
    <div
      role='dialog'
      aria-modal='true'
      aria-labelledby={titleId}
      className='fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4'
    >
      {/* Backdrop */}
      <div
        onClick={() => {
          playClick();
          onClose();
        }}
        className='animate-in fade-in absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-200'
      />

      {/* Modal Container */}
      <div className='animate-in zoom-in-95 relative z-10 flex max-h-[90vh] w-full max-w-2xl flex-col rounded-3xl border border-(--border-color) bg-(--card-color) shadow-2xl transition-all duration-200'>
        {/* Header */}
        <div className='flex items-start justify-between border-b border-(--border-color)/60 p-5 sm:p-6'>
          <div className='flex-1 pr-4'>
            <div className='flex flex-wrap items-baseline gap-3'>
              <h2
                id={titleId}
                className='font-japanese text-3xl font-black tracking-tight text-(--main-color) sm:text-4xl'
              >
                {word}
              </h2>
              {data?.phonetic && (
                <span className='rounded-xl bg-(--background-color) px-2.5 py-1 text-sm font-semibold text-(--secondary-color)'>
                  <PitchAccentText
                    kana={data.pronunciations?.[0]?.kana || data.phonetic}
                    accent={data.pronunciations?.[0]?.accent}
                    tokenizedKana={data.pronunciations?.[0]?.tokenizedKana}
                  />
                </span>
              )}
              <button
                type='button'
                onClick={() => {
                  playClick();
                  playSpeech(word);
                }}
                className={clsx(
                  'inline-flex items-center gap-1.5 rounded-xl border border-(--border-color) px-2.5 py-1 text-xs font-semibold transition-colors',
                  speakingContent === word
                    ? 'border-blue-500 bg-blue-500/10 text-blue-500'
                    : 'bg-(--background-color) text-(--secondary-color) hover:text-(--main-color)',
                )}
                title='Phát âm từ vựng'
              >
                <Volume2 className='size-3.5' />
                <span>Nghe</span>
              </button>
            </div>

            {/* Meanings */}
            {data?.means && data.means.length > 0 && (
              <div className='mt-2.5 flex flex-wrap gap-1.5'>
                {data.means.slice(0, 4).map((m, idx) => (
                  <span
                    key={idx}
                    className='rounded-lg border border-(--border-color)/60 bg-(--background-color)/80 px-2 py-0.5 text-xs text-(--main-color)'
                  >
                    {m.kind ? (
                      <strong className='mr-1 text-(--secondary-color)'>
                        [{m.kind}]
                      </strong>
                    ) : null}
                    {m.mean}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Close button */}
          <button
            type='button'
            onClick={() => {
              playClick();
              onClose();
            }}
            className='rounded-2xl border border-(--border-color) bg-(--background-color) p-2 text-(--secondary-color) transition-colors hover:bg-red-500/10 hover:text-red-500'
            title='Đóng'
          >
            <X className='size-5' />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className='flex border-b border-(--border-color)/60 px-5 pt-2 sm:px-6'>
          {data?.compounds && data.compounds.length > 0 && (
            <button
              type='button'
              onClick={() => {
                playClick();
                setActiveTab('compounds');
              }}
              className={clsx(
                'flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-bold transition-colors',
                activeTab === 'compounds'
                  ? 'border-amber-500 text-amber-500 dark:text-amber-400'
                  : 'border-transparent text-(--secondary-color) hover:text-(--main-color)',
              )}
            >
              <Layers className='size-4' />
              <span>Từ ghép ({data.compounds.length})</span>
            </button>
          )}

          <button
            type='button'
            onClick={() => {
              playClick();
              setActiveTab('examples');
            }}
            className={clsx(
              'flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-bold transition-colors',
              activeTab === 'examples'
                ? 'border-(--main-color) text-(--main-color)'
                : 'border-transparent text-(--secondary-color) hover:text-(--main-color)',
            )}
          >
            <BookOpen className='size-4' />
            <span>Ví dụ theo câu</span>
            {data?.examples && (
              <span className='ml-1 rounded-full bg-(--background-color) px-2 py-0.5 text-xs font-semibold'>
                {data.examples.length}
              </span>
            )}
          </button>

          <button
            type='button'
            onClick={() => {
              playClick();
              setActiveTab('feedbacks');
            }}
            className={clsx(
              'flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-bold transition-colors',
              activeTab === 'feedbacks'
                ? 'border-(--main-color) text-(--main-color)'
                : 'border-transparent text-(--secondary-color) hover:text-(--main-color)',
            )}
          >
            <MessageSquare className='size-4' />
            <span>Ý kiến đóng góp</span>
            {data?.feedbacks && (
              <span className='ml-1 rounded-full bg-(--background-color) px-2 py-0.5 text-xs font-semibold'>
                {data.feedbacks.length}
              </span>
            )}
          </button>
        </div>

        {/* Content Body */}
        <div className='flex-1 overflow-y-auto p-5 sm:p-6'>
          {loading ? (
            <div className='flex flex-col items-center justify-center py-16 text-(--secondary-color)'>
              <Loader2 className='size-8 animate-spin text-(--main-color)' />
              <p className='mt-3 text-sm font-medium'>
                Đang tra cứu ví dụ & ý kiến đóng góp...
              </p>
            </div>
          ) : error ? (
            <div className='rounded-2xl border border-red-500/20 bg-red-500/5 p-6 text-center text-sm text-red-500'>
              <HelpCircle className='mx-auto size-8' />
              <p className='mt-2 font-medium'>{error}</p>
            </div>
          ) : activeTab === 'compounds' ? (
            /* TAB 0: COMPOUNDS & PITCH ACCENT */
            <div className='flex flex-col gap-2.5'>
              {!data?.compounds || data.compounds.length === 0 ? (
                <div className='py-12 text-center text-sm text-(--secondary-color)'>
                  Không có từ ghép cho từ này.
                </div>
              ) : (
                data.compounds.map((c, idx) => (
                  <div
                    key={idx}
                    className='group flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-(--border-color)/70 bg-(--background-color)/50 p-3.5 transition-all hover:border-amber-500/50 hover:bg-(--background-color)'
                  >
                    <div className='flex flex-wrap items-center gap-2.5 sm:gap-3.5'>
                      <button
                        type='button'
                        onClick={() => {
                          playClick();
                          playSpeech(c.kana || c.kanji);
                        }}
                        className='flex size-7 shrink-0 cursor-pointer items-center justify-center rounded-lg bg-(--card-color) text-(--secondary-color)/70 shadow-xs transition-all hover:bg-amber-500 hover:text-white'
                        title={`Nghe: ${c.kanji}`}
                      >
                        <Volume2 className='size-3.5' />
                      </button>

                      <span
                        onClick={() => {
                          playClick();
                          playSpeech(c.kana || c.kanji);
                        }}
                        className='font-japanese cursor-pointer text-lg font-black text-sky-600 transition-colors hover:underline dark:text-sky-400'
                      >
                        {c.kanji}
                      </span>

                      <span className='flex items-center text-sm font-medium text-(--secondary-color)/90'>
                        (
                        <PitchAccentText
                          kana={c.kana}
                          accent={c.accent}
                          tokenizedKana={c.tokenizedKana}
                        />
                        )
                      </span>

                      {c.hanViet && (
                        <span className='rounded-md border border-red-500/20 bg-red-500/10 px-2 py-0.5 text-xs font-bold tracking-wide text-red-600 uppercase dark:text-red-400'>
                          {c.hanViet}
                        </span>
                      )}
                    </div>

                    {c.mean && (
                      <div className='text-xs font-medium text-(--secondary-color)/80 sm:text-right sm:text-sm'>
                        {c.mean}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          ) : activeTab === 'examples' ? (
            /* TAB 1: EXAMPLES */
            <div className='space-y-3'>
              {!data?.examples || data.examples.length === 0 ? (
                <div className='py-12 text-center text-sm text-(--secondary-color)'>
                  Chưa có câu ví dụ nào cho từ này.
                </div>
              ) : (
                data.examples.map((ex, idx) => (
                  <div
                    key={idx}
                    className='group flex flex-col gap-2 rounded-2xl border border-(--border-color)/70 bg-(--background-color)/50 p-4 transition-all hover:border-(--main-color)/60 hover:bg-(--background-color)'
                  >
                    {/* Japanese Content + Audio button */}
                    <div className='flex items-start justify-between gap-3'>
                      <div className='flex-1'>
                        <div className='font-japanese text-base font-bold text-(--main-color) sm:text-lg'>
                          {ex.content}
                        </div>
                        {ex.transcription &&
                          ex.transcription !== ex.content && (
                            <div className='font-japanese mt-0.5 text-xs text-(--secondary-color)'>
                              {ex.transcription}
                            </div>
                          )}
                      </div>

                      <button
                        type='button'
                        onClick={() => {
                          playClick();
                          playSpeech(ex.content);
                        }}
                        className={clsx(
                          'rounded-xl border border-(--border-color) p-2 transition-colors',
                          speakingContent === ex.content
                            ? 'border-blue-500 bg-blue-500/10 text-blue-500'
                            : 'bg-(--card-color) text-(--secondary-color) hover:text-(--main-color)',
                        )}
                        title='Phát âm câu này'
                      >
                        <Volume2 className='size-4' />
                      </button>
                    </div>

                    {/* Vietnamese Meaning */}
                    <div className='border-t border-(--border-color)/40 pt-2 text-sm text-(--secondary-color)'>
                      {ex.mean}
                    </div>
                  </div>
                ))
              )}
            </div>
          ) : (
            /* TAB 2: FEEDBACKS / COMMUNITY TIPS */
            <div className='space-y-3'>
              {!data?.feedbacks || data.feedbacks.length === 0 ? (
                <div className='py-12 text-center text-sm text-(--secondary-color)'>
                  Chưa có ý kiến đóng góp nào từ cộng đồng cho từ này.
                </div>
              ) : (
                data.feedbacks.map(fb => (
                  <div
                    key={fb.id}
                    className='flex flex-col gap-2.5 rounded-2xl border border-(--border-color)/70 bg-(--background-color)/50 p-4 transition-all hover:border-(--main-color)/60 hover:bg-(--background-color)'
                  >
                    {/* Author & Vote Bar */}
                    <div className='flex items-center justify-between gap-2'>
                      <div className='flex items-center gap-2.5'>
                        {fb.avatar ? (
                          /* eslint-disable-next-line @next/next/no-img-element */
                          <img
                            src={fb.avatar}
                            alt={fb.username}
                            className='size-7 rounded-full object-cover ring-1 ring-(--border-color)'
                          />
                        ) : (
                          <div className='flex size-7 items-center justify-center rounded-full bg-(--main-color)/10 text-xs font-bold text-(--main-color)'>
                            {fb.username.charAt(0).toUpperCase()}
                          </div>
                        )}
                        <span className='text-xs font-bold text-(--main-color)'>
                          {fb.username}
                        </span>
                      </div>

                      {/* Likes / Dislikes */}
                      <div className='flex items-center gap-2 text-xs font-semibold text-(--secondary-color)'>
                        <span className='inline-flex items-center gap-1 rounded-lg bg-emerald-500/10 px-2 py-0.5 text-emerald-600 dark:text-emerald-400'>
                          <ThumbsUp className='size-3' />
                          {fb.like}
                        </span>
                        {fb.dislike > 0 && (
                          <span className='inline-flex items-center gap-1 rounded-lg bg-rose-500/10 px-2 py-0.5 text-rose-600 dark:text-rose-400'>
                            <ThumbsDown className='size-3' />
                            {fb.dislike}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Contribution Text / Mnemonic */}
                    <div className='rounded-xl bg-(--card-color) p-3 text-sm leading-relaxed text-(--main-color)'>
                      {fb.mean}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className='flex items-center justify-between border-t border-(--border-color)/60 px-5 py-3.5 sm:px-6'>
          <span className='text-xs text-(--secondary-color)/70'>
            Dữ liệu câu ví dụ & đóng góp từ từ điển mở
          </span>
          <button
            type='button'
            onClick={() => {
              playClick();
              onClose();
            }}
            className='rounded-xl bg-(--main-color) px-4 py-2 text-xs font-bold text-(--background-color) transition-opacity hover:opacity-90'
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};
