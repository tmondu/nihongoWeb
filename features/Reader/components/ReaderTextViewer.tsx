'use client';

import React, { useEffect, useState, useMemo, useCallback } from 'react';
import clsx from 'clsx';
import { Volume2, BookmarkPlus, Loader2 } from 'lucide-react';
import { useReaderStore } from '../store/useReaderStore';
import { PRESET_ARTICLES } from '../data/presetArticles';
import {
  analyzeArticle,
  fallbackTokenize,
  lookupWordDetails,
  playJapaneseTTS,
  getWordHanViet,
} from '../services/readerService';
import type { ReaderToken } from '../types';

export default function ReaderTextViewer() {
  const {
    isCustomMode,
    customText,
    selectedArticleId,
    showFurigana,
    fontSize,
    setActiveWordDetail,
    setIsLoadingWordDetail,
    addMinedSentence,
    minedSentences,
  } = useReaderStore();

  // Active raw content
  const activeContent = useMemo(() => {
    if (isCustomMode) {
      return (
        customText.trim() ||
        'Xin vui lòng dán hoặc nhập một đoạn văn bản tiếng Nhật ở khung phía trên để bắt đầu đọc!'
      );
    }
    const found = PRESET_ARTICLES.find(a => a.id === selectedArticleId);
    return found ? found.content : '';
  }, [isCustomMode, customText, selectedArticleId]);

  // Tokenized sentences: array of sentence tokens
  const [sentences, setSentences] = useState<ReaderToken[][]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Analyze text in 1 single API call (with client-side instant fallback)
  useEffect(() => {
    let isCancelled = false;

    if (!activeContent.trim()) {
      return;
    }

    // Immediately show client-side tokenized text so UI is 100% responsive
    const instantTokens = fallbackTokenize(activeContent);
    setSentences(instantTokens);
    setIsAnalyzing(true);

    analyzeArticle(activeContent)
      .then(analyzedSentences => {
        if (!isCancelled && analyzedSentences.length > 0) {
          setSentences(analyzedSentences);
        }
      })
      .catch(err => {
        console.warn('Fallback tokenizer kept active:', err);
      })
      .finally(() => {
        if (!isCancelled) {
          setIsAnalyzing(false);
        }
      });

    return () => {
      isCancelled = true;
    };
  }, [activeContent]);

  const handleWordClick = useCallback(
    async (token: ReaderToken, sentenceText: string) => {
      // Ignore punctuation or symbols
      if (/^[、。！？「」『』（）\s.,!?:;…ー〜]+$/.test(token.surface)) {
        return;
      }

      const searchWord = token.basicForm || token.surface;
      setIsLoadingWordDetail(true);

      // Pre-fill preliminary data immediately
      setActiveWordDetail(
        {
          word: token.surface,
          reading: token.reading,
          hanViet: token.hanViet,
          means: [],
          pronunciations: [],
        },
        sentenceText,
      );

      try {
        const fullDetail = await lookupWordDetails(searchWord, token.reading);
        setActiveWordDetail(
          {
            ...fullDetail,
            word: token.surface,
            reading: token.reading || fullDetail.reading,
            hanViet: token.hanViet || fullDetail.hanViet,
          },
          sentenceText,
        );
      } catch (err) {
        console.error('Failed to load word details:', err);
      } finally {
        setIsLoadingWordDetail(false);
      }
    },
    [setActiveWordDetail, setIsLoadingWordDetail],
  );

  const handleQuickMineSentence = (
    sentenceTokens: ReaderToken[],
    rawSentence: string,
  ) => {
    // Pick the most prominent Kanji word as target
    const targetToken =
      sentenceTokens.find(
        t => /[\u4e00-\u9faf]/.test(t.surface) && t.surface.length > 1,
      ) ||
      sentenceTokens.find(t => /[\u4e00-\u9faf]/.test(t.surface)) ||
      sentenceTokens[0];

    const targetWord = targetToken
      ? targetToken.surface
      : rawSentence.slice(0, 8);

    addMinedSentence(
      rawSentence,
      targetWord,
      targetToken?.reading,
      targetToken?.hanViet || getWordHanViet(targetWord),
      'Toàn bộ câu nguyên văn',
    );
  };

  return (
    <div className='rounded-3xl border border-(--border-color) bg-(--card-color) p-6 shadow-sm sm:p-8'>
      {/* Loading banner if still analyzing */}
      {isAnalyzing && (
        <div className='mb-4 flex items-center gap-2 rounded-2xl bg-(--background-color) px-3 py-2 text-xs text-(--secondary-color)'>
          <Loader2 className='h-3.5 w-3.5 animate-spin text-(--main-color)' />
          <span>Đang tối ưu hóa Furigana và ngữ pháp câu...</span>
        </div>
      )}

      <div
        className='space-y-6 leading-loose'
        style={{ fontSize: `${fontSize}px` }}
      >
        {sentences.map((sentenceTokens, sIdx) => {
          const rawSentence = sentenceTokens.map(t => t.surface).join('');
          const isSentenceMined = minedSentences.some(
            s => s.sentence === rawSentence,
          );

          return (
            <div
              key={sIdx}
              className='group relative rounded-2xl p-3 transition-colors hover:bg-(--background-color)/70'
            >
              <div className='font-japanese flex flex-wrap items-baseline gap-x-0.5 gap-y-3'>
                {sentenceTokens.map(token => {
                  const isPunctuation =
                    /^[、。！？「」『』（）\s.,!?:;…ー〜]+$/.test(
                      token.surface,
                    );
                  const hasKanji = /[\u4e00-\u9faf]/.test(token.surface);
                  const shouldShowRuby =
                    showFurigana && hasKanji && token.reading;

                  if (isPunctuation) {
                    return (
                      <span
                        key={token.id}
                        className='px-0.5 text-(--secondary-color) select-none'
                      >
                        {token.surface}
                      </span>
                    );
                  }

                  return (
                    <button
                      key={token.id}
                      type='button'
                      onClick={() => handleWordClick(token, rawSentence)}
                      className={clsx(
                        'inline-flex flex-col items-center rounded-lg px-1 py-0.5 text-left transition-all',
                        'hover:bg-violet-500/15 hover:text-violet-700 dark:hover:text-violet-300',
                        'focus:ring-2 focus:ring-violet-500/40 focus:outline-none',
                        hasKanji
                          ? 'font-bold text-(--main-color)'
                          : 'text-(--main-color)',
                      )}
                      title={`Bấm để tra từ: ${token.surface} (${token.pos})`}
                    >
                      {shouldShowRuby ? (
                        <ruby className='ruby-text'>
                          {token.surface}
                          <rt
                            className='font-japanese text-center font-normal text-(--secondary-color)/80 select-none'
                            style={{
                              fontSize: `${Math.max(10, Math.round(fontSize * 0.55))}px`,
                            }}
                          >
                            {token.reading}
                          </rt>
                        </ruby>
                      ) : (
                        <span>{token.surface}</span>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Sentence Action Toolbar */}
              <div className='mt-2 flex items-center justify-end gap-2 border-t border-(--border-color)/30 pt-2 text-xs opacity-80 transition-opacity group-hover:opacity-100'>
                {/* Audio playback */}
                <button
                  type='button'
                  onClick={() => playJapaneseTTS(rawSentence)}
                  className='flex items-center gap-1 rounded-lg px-2 py-1 text-(--secondary-color) hover:bg-(--card-color) hover:text-(--main-color)'
                  title='Nghe đọc toàn bộ câu'
                >
                  <Volume2 className='h-3.5 w-3.5' />
                  <span className='text-[11px]'>Nghe câu</span>
                </button>

                {/* Quick Mine sentence button */}
                <button
                  type='button'
                  onClick={() =>
                    handleQuickMineSentence(sentenceTokens, rawSentence)
                  }
                  className={clsx(
                    'flex items-center gap-1 rounded-lg px-2.5 py-1 font-semibold transition-all',
                    isSentenceMined
                      ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                      : 'text-(--secondary-color) hover:bg-amber-500/10 hover:text-amber-700 dark:hover:text-amber-400',
                  )}
                  title='Lưu cả câu vào kho ôn tập (Sentence Mining)'
                >
                  <BookmarkPlus className='h-3.5 w-3.5' />
                  <span className='text-[11px]'>
                    {isSentenceMined ? 'Đã lưu' : 'Đào câu'}
                  </span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
