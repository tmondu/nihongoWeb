'use client';

import React, { useState } from 'react';
import {
  Volume2,
  BookmarkPlus,
  Check,
  X,
  ExternalLink,
  BookA,
} from 'lucide-react';
import Link from 'next/link';
import { useReaderStore } from '../store/useReaderStore';
import { playJapaneseTTS } from '../services/readerService';
import PitchAccentChart from '@/shared/ui-composite/text/PitchAccentChart';

export default function ReaderWordPopover() {
  const {
    activeWordDetail,
    activeSentenceContext,
    isWordPopoverOpen,
    setIsWordPopoverOpen,
    isLoadingWordDetail,
    addMinedSentence,
    minedSentences,
  } = useReaderStore();

  const [isSaved, setIsSaved] = useState(false);

  if (!isWordPopoverOpen || !activeWordDetail) {
    return null;
  }

  const isAlreadyMined = minedSentences.some(
    s =>
      s.targetWord === activeWordDetail.word &&
      (!activeSentenceContext || s.sentence === activeSentenceContext),
  );

  const handleMine = () => {
    if (!activeWordDetail) return;
    const sentenceToMine = activeSentenceContext || activeWordDetail.word;
    addMinedSentence(
      sentenceToMine,
      activeWordDetail.word,
      activeWordDetail.reading,
      activeWordDetail.hanViet,
      activeWordDetail.means[0] || '',
    );
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  const firstPron = activeWordDetail.pronunciations?.[0];

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs'>
      <div
        role='dialog'
        aria-modal='true'
        className='animate-in fade-in-0 zoom-in-95 relative flex max-h-[85vh] w-full max-w-lg flex-col overflow-hidden rounded-3xl border border-(--border-color) bg-(--card-color) p-6 shadow-2xl'
      >
        {/* Close Button */}
        <button
          type='button'
          onClick={() => setIsWordPopoverOpen(false)}
          className='absolute top-4 right-4 flex h-8 w-8 items-center justify-center rounded-full border border-(--border-color) bg-(--background-color) text-(--secondary-color) hover:text-(--main-color)'
          aria-label='Đóng'
        >
          <X className='h-4 w-4' />
        </button>

        {/* Header: Word & Pronunciation */}
        <div className='flex items-start justify-between gap-4 border-b border-(--border-color)/60 pb-4'>
          <div>
            <div className='flex flex-wrap items-baseline gap-3'>
              <h2 className='font-japanese text-3xl font-black text-(--main-color) sm:text-4xl'>
                {activeWordDetail.word}
              </h2>
              {activeWordDetail.reading && (
                <span className='font-japanese text-lg font-bold text-(--secondary-color)'>
                  【{activeWordDetail.reading}】
                </span>
              )}
            </div>

            {/* Han-Viet Badge */}
            {activeWordDetail.hanViet && (
              <div className='mt-1.5 flex items-center gap-1.5'>
                <span className='rounded-lg border border-purple-500/30 bg-purple-500/10 px-2.5 py-0.5 text-xs font-black text-purple-600 dark:text-purple-400'>
                  Âm Hán-Việt: {activeWordDetail.hanViet.toUpperCase()}
                </span>
              </div>
            )}
          </div>

          {/* Pronounce Audio Button */}
          <button
            type='button'
            onClick={() => playJapaneseTTS(activeWordDetail.word)}
            className='mt-1 flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-(--main-color)/30 bg-(--main-color)/10 text-(--main-color) transition-transform hover:scale-105 active:scale-95'
            title='Nghe phát âm'
          >
            <Volume2 className='h-5 w-5' />
          </button>
        </div>

        {/* Content Scroll Area */}
        <div className='flex-1 space-y-4 overflow-y-auto py-4 text-sm'>
          {isLoadingWordDetail ? (
            <div className='space-y-2 py-4'>
              <div className='h-4 w-3/4 animate-pulse rounded-md bg-(--border-color)' />
              <div className='h-4 w-1/2 animate-pulse rounded-md bg-(--border-color)' />
              <div className='h-4 w-2/3 animate-pulse rounded-md bg-(--border-color)' />
            </div>
          ) : (
            <>
              {/* Pitch Accent Chart */}
              {firstPron && (firstPron.accent || firstPron.kana) && (
                <div className='rounded-2xl border border-red-500/20 bg-red-500/5 p-3'>
                  <div className='mb-1 flex items-center justify-between text-[11px] font-bold text-red-600 dark:text-red-400'>
                    <span>Biểu đồ ngữ điệu (Pitch Accent)</span>
                    {firstPron.accent && (
                      <span className='font-mono'>Mẫu: {firstPron.accent}</span>
                    )}
                  </div>
                  <div className='flex justify-center overflow-x-auto py-1'>
                    <PitchAccentChart
                      kana={firstPron.kana || activeWordDetail.reading || ''}
                      accent={firstPron.accent}
                      tokenizedKana={firstPron.tokenizedKana}
                      compact
                    />
                  </div>
                </div>
              )}

              {/* Meanings */}
              <div>
                <h3 className='flex items-center gap-1.5 text-xs font-bold tracking-wider text-(--secondary-color) uppercase'>
                  <BookA className='h-3.5 w-3.5' />
                  <span>Ý nghĩa từ điển</span>
                </h3>

                {activeWordDetail.means.length > 0 ? (
                  <ul className='mt-2 space-y-2'>
                    {activeWordDetail.means.map((m, idx) => (
                      <li
                        key={idx}
                        className='rounded-xl border border-(--border-color)/50 bg-(--background-color) p-2.5 text-xs leading-relaxed text-(--main-color) sm:text-sm'
                      >
                        <span className='mr-1.5 font-bold text-(--main-color-accent)'>
                          {idx + 1}.
                        </span>
                        <span>{m}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className='mt-2 text-xs text-(--secondary-color) italic'>
                    Đang cập nhật thêm giải nghĩa từ vựng này.
                  </p>
                )}
              </div>

              {/* Context Sentence */}
              {activeSentenceContext && (
                <div className='rounded-2xl border border-(--border-color) bg-(--background-color) p-3'>
                  <span className='text-[11px] font-bold text-(--secondary-color) uppercase'>
                    Ngữ cảnh câu trong bài:
                  </span>
                  <p className='font-japanese mt-1 text-xs leading-relaxed text-(--main-color) sm:text-sm'>
                    {activeSentenceContext}
                  </p>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer Actions */}
        <div className='flex items-center justify-between gap-3 border-t border-(--border-color)/60 pt-4'>
          {/* External link to ThamKanji if word is Kanji */}
          {/[\u4e00-\u9faf]/.test(activeWordDetail.word) &&
          activeWordDetail.word.length === 1 ? (
            <Link
              href={`/kanji/thamkanji/${activeWordDetail.word}`}
              target='_blank'
              className='flex items-center gap-1.5 text-xs font-bold text-violet-600 hover:underline dark:text-violet-400'
            >
              <span>Xem chi tiết Kanji</span>
              <ExternalLink className='h-3.5 w-3.5' />
            </Link>
          ) : (
            <div />
          )}

          {/* Sentence Mining Button */}
          <button
            type='button'
            onClick={handleMine}
            disabled={isAlreadyMined}
            className={`flex items-center gap-2 rounded-2xl px-5 py-2.5 text-xs font-bold shadow-sm transition-all active:scale-95 sm:text-sm ${
              isAlreadyMined || isSaved
                ? 'bg-emerald-600 text-white dark:bg-emerald-500'
                : 'bg-(--main-color) text-(--background-color) hover:opacity-90'
            }`}
          >
            {isAlreadyMined || isSaved ? (
              <>
                <Check className='h-4 w-4' />
                <span>Đã lưu vào kho câu</span>
              </>
            ) : (
              <>
                <BookmarkPlus className='h-4 w-4' />
                <span>Lưu câu này (Mine)</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
