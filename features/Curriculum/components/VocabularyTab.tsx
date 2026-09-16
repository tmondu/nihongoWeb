'use client';

import React, { useState, useMemo } from 'react';
import { Search, Volume2, BookOpen } from 'lucide-react';
import type { ThamVocabulary } from '../types';
import { FuriganaText } from './FuriganaText';
import { playJapaneseSpeech } from '../utils/speech';

interface VocabularyTabProps {
  vocabularies: ThamVocabulary[];
  showFurigana?: boolean;
}

export function VocabularyTab({
  vocabularies,
  showFurigana = true,
}: VocabularyTabProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedWordType, setSelectedWordType] = useState<string>('all');

  // Extract unique word types for filter tabs
  const wordTypes = useMemo(() => {
    const types = new Set<string>();
    vocabularies.forEach(v => {
      if (v.word_type) types.add(v.word_type);
    });
    return Array.from(types);
  }, [vocabularies]);

  // Filtered vocabulary list
  const filteredVocab = useMemo(() => {
    return vocabularies.filter(item => {
      const wordText = item.word_ja || item.kanji || item.kana;
      const readingText = item.reading_kana || item.kana;
      const matchesSearch =
        !searchTerm.trim() ||
        wordText.toLowerCase().includes(searchTerm.toLowerCase()) ||
        readingText.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.romaji &&
          item.romaji.toLowerCase().includes(searchTerm.toLowerCase())) ||
        item.meaning_vi.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesType =
        selectedWordType === 'all' || item.word_type === selectedWordType;

      return matchesSearch && matchesType;
    });
  }, [vocabularies, searchTerm, selectedWordType]);

  return (
    <div className='space-y-6'>
      {/* Search & Filter Bar */}
      <div className='flex flex-col items-stretch justify-between gap-3 sm:flex-row sm:items-center'>
        {/* Search input */}
        <div className='relative max-w-md flex-1'>
          <Search className='absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-(--secondary-color)' />
          <input
            type='text'
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder='Tìm kiếm từ vựng (Kanji, Kana, Romaji, tiếng Việt)...'
            className='w-full rounded-xl border border-(--border-color) bg-(--card-color) py-2 pr-4 pl-10 text-sm text-(--main-color) transition-all placeholder:text-(--secondary-color)/60 focus:border-sky-500 focus:ring-2 focus:ring-sky-500/30 focus:outline-none'
          />
        </div>

        {/* Word Count */}
        <div className='self-end text-xs font-semibold text-(--secondary-color) sm:self-center'>
          {filteredVocab.length} / {vocabularies.length} từ
        </div>
      </div>

      {/* Word Type Filter Pills */}
      {wordTypes.length > 0 && (
        <div className='no-scrollbar flex items-center gap-2 overflow-x-auto pb-1'>
          <button
            type='button'
            onClick={() => setSelectedWordType('all')}
            className={`shrink-0 cursor-pointer rounded-lg px-3 py-1 text-xs font-medium transition-all ${
              selectedWordType === 'all'
                ? 'bg-sky-500 font-semibold text-white shadow-xs'
                : 'border border-(--border-color) bg-(--card-color) text-(--secondary-color) hover:text-(--main-color)'
            }`}
          >
            Tất cả ({vocabularies.length})
          </button>
          {wordTypes.map(type => {
            const count = vocabularies.filter(v => v.word_type === type).length;
            return (
              <button
                key={type}
                type='button'
                onClick={() => setSelectedWordType(type)}
                className={`shrink-0 cursor-pointer rounded-lg px-3 py-1 text-xs font-medium transition-all ${
                  selectedWordType === type
                    ? 'bg-sky-500 font-semibold text-white shadow-xs'
                    : 'border border-(--border-color) bg-(--card-color) text-(--secondary-color) hover:text-(--main-color)'
                }`}
              >
                {type} ({count})
              </button>
            );
          })}
        </div>
      )}

      {/* Vocabulary Grid (2 columns on md+, rectangular rounded-xl cards) */}
      {filteredVocab.length > 0 ? (
        <div className='grid grid-cols-1 gap-3.5 sm:gap-4 md:grid-cols-2'>
          {filteredVocab.map(vocab => (
            <div
              key={vocab.id}
              className='group relative flex items-start justify-between rounded-xl border border-(--border-color) bg-(--card-color) p-4 transition-all duration-200 hover:border-sky-500/40 hover:shadow-xs'
            >
              <div className='min-w-0 flex-1 space-y-1.5 pr-3'>
                {/* Kanji / Word & Furigana */}
                {(() => {
                  const wordText = vocab.word_ja || vocab.kanji || vocab.kana;
                  const readingText = vocab.reading_kana || vocab.kana;
                  return (
                    <>
                      <div className='flex flex-wrap items-baseline gap-2'>
                        <span className='font-japanese text-lg font-bold tracking-wide text-(--main-color) sm:text-xl'>
                          <FuriganaText
                            text={wordText}
                            kana={readingText}
                            showFurigana={showFurigana}
                          />
                        </span>

                        {readingText &&
                          wordText !== readingText &&
                          !showFurigana && (
                            <span className='font-japanese text-xs text-(--secondary-color)'>
                              ({readingText})
                            </span>
                          )}

                        {vocab.word_type && (
                          <span className='inline-block rounded-md bg-sky-500/10 px-2 py-0.5 text-[10px] font-semibold text-sky-600 dark:text-sky-400'>
                            {vocab.word_type}
                          </span>
                        )}
                      </div>
                    </>
                  );
                })()}

                {/* Romaji */}
                {vocab.romaji && (
                  <div className='font-mono text-xs text-(--secondary-color)'>
                    {vocab.romaji}
                  </div>
                )}

                {/* Vietnamese Meaning */}
                <div className='border-t border-(--border-color)/40 pt-1 text-sm font-medium text-(--main-color)'>
                  {vocab.meaning_vi}
                </div>

                {/* Example sentence if available */}
                {vocab.example_ja && (
                  <div className='mt-2 space-y-0.5 rounded-lg border border-(--border-color)/30 bg-(--background-color)/80 p-2.5 text-xs'>
                    <div className='font-japanese font-medium text-(--main-color)'>
                      {vocab.example_ja}
                    </div>
                    {vocab.example_vi && (
                      <div className='text-(--secondary-color)'>
                        {vocab.example_vi}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Action: Audio Speak Button */}
              <button
                type='button'
                onClick={() => {
                  const speechText =
                    vocab.reading_kana ||
                    vocab.kana ||
                    vocab.word_ja ||
                    vocab.kanji ||
                    '';
                  playJapaneseSpeech(speechText);
                }}
                aria-label='Nghe phát âm'
                className='flex size-9 shrink-0 cursor-pointer items-center justify-center rounded-xl bg-sky-500/10 text-sky-600 transition-all hover:bg-sky-500 hover:text-white active:scale-95 dark:text-sky-400'
              >
                <Volume2 className='size-4' />
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div className='flex flex-col items-center justify-center rounded-2xl border border-dashed border-(--border-color) py-12 text-center text-(--secondary-color)'>
          <BookOpen className='mb-2 size-10 opacity-40' />
          <p className='text-sm font-medium'>Không tìm thấy từ vựng phù hợp</p>
          <p className='mt-1 text-xs'>
            Thử thay đổi từ khóa hoặc bộ lọc từ loại
          </p>
        </div>
      )}
    </div>
  );
}
