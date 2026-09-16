'use client';

import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/shared/ui/components/dialog';
import {
  Volume2,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  Bookmark,
} from 'lucide-react';
import type { ThamGrammarPoint } from '../types';
import { FuriganaText } from './FuriganaText';
import { playJapaneseSpeech } from '../utils/speech';

interface GrammarDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  grammar: ThamGrammarPoint | null;
  allGrammar?: ThamGrammarPoint[];
  onSelectGrammar?: (grammar: ThamGrammarPoint) => void;
  showFurigana?: boolean;
  isCompleted?: boolean;
  onToggleCompleted?: (grammarId: number) => void;
}

export function GrammarDetailModal({
  isOpen,
  onClose,
  grammar,
  allGrammar = [],
  onSelectGrammar,
  showFurigana = true,
  isCompleted = false,
  onToggleCompleted,
}: GrammarDetailModalProps) {
  if (!grammar) return null;

  const currentIndex = allGrammar.findIndex(g => g.id === grammar.id);
  const prevGrammar = currentIndex > 0 ? allGrammar[currentIndex - 1] : null;
  const nextGrammar =
    currentIndex >= 0 && currentIndex < allGrammar.length - 1
      ? allGrammar[currentIndex + 1]
      : null;

  return (
    <Dialog open={isOpen} onOpenChange={open => !open && onClose()}>
      <DialogContent className='max-h-[90vh] max-w-2xl overflow-y-auto rounded-2xl border border-(--border-color) bg-(--card-color) p-6 text-(--main-color) shadow-xl sm:p-7'>
        <DialogHeader className='space-y-2 border-b border-(--border-color)/60 pr-8 pb-4 sm:pr-10'>
          <div className='flex items-start justify-between gap-4'>
            <div>
              <div className='flex items-center gap-3'>
                <DialogTitle className='font-japanese text-xl font-extrabold tracking-wide text-(--main-color) sm:text-2xl'>
                  {grammar.title}
                </DialogTitle>
                <button
                  type='button'
                  onClick={() => playJapaneseSpeech(grammar.title)}
                  aria-label='Nghe phát âm'
                  className='flex size-8 cursor-pointer items-center justify-center rounded-lg bg-sky-500/10 text-sky-500 transition-colors hover:bg-sky-500/20 active:scale-95'
                >
                  <Volume2 className='size-4' />
                </button>
              </div>
              <p className='mt-1 text-sm font-medium text-sky-600 sm:text-base dark:text-sky-400'>
                {grammar.summary_vi}
              </p>
            </div>

            {onToggleCompleted && (
              <button
                type='button'
                onClick={() => onToggleCompleted(grammar.id)}
                className={`mr-2 flex shrink-0 cursor-pointer items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
                  isCompleted
                    ? 'bg-emerald-500/15 text-emerald-500 hover:bg-emerald-500/25'
                    : 'bg-slate-100 text-(--secondary-color) hover:text-(--main-color) dark:bg-slate-800'
                }`}
              >
                <CheckCircle2 className='size-4' />
                <span>{isCompleted ? 'Đã học' : 'Đánh dấu'}</span>
              </button>
            )}
          </div>
        </DialogHeader>

        {/* Content Body */}
        <div className='space-y-6 pt-4'>
          {/* Structure Box */}
          {grammar.structure && (
            <div>
              <div className='mb-2 flex items-center gap-2 text-xs font-bold tracking-wider text-(--secondary-color) uppercase'>
                <Bookmark className='size-3.5 text-sky-500' />
                <span>Cấu trúc ngữ pháp</span>
              </div>
              <div className='font-japanese rounded-xl border border-sky-500/20 bg-sky-500/5 p-4 text-sm font-semibold text-(--main-color) sm:text-base'>
                {grammar.structure}
              </div>
            </div>
          )}

          {/* Explanation */}
          <div>
            <div className='mb-2 text-xs font-bold tracking-wider text-(--secondary-color) uppercase'>
              Giải thích & Cách dùng
            </div>
            <div className='rounded-xl border border-(--border-color)/50 bg-(--background-color) p-4 text-sm leading-relaxed whitespace-pre-line text-(--main-color)/90 sm:text-base'>
              {grammar.explanation_vi}
            </div>
          </div>

          {/* Examples */}
          {grammar.examples && grammar.examples.length > 0 && (
            <div>
              <div className='mb-3 text-xs font-bold tracking-wider text-(--secondary-color) uppercase'>
                Ví dụ minh họa ({grammar.examples.length})
              </div>

              <div className='space-y-3'>
                {grammar.examples.map((example, idx) => (
                  <div
                    key={`${example.ja}-${idx}`}
                    className='group/ex relative rounded-xl border border-(--border-color)/80 bg-(--background-color)/80 p-4 transition-all hover:border-sky-500/40'
                  >
                    <div className='flex items-start justify-between gap-3'>
                      <div className='min-w-0 flex-1 space-y-1.5'>
                        {/* Japanese with furigana */}
                        <div className='text-base font-medium text-(--main-color) sm:text-lg'>
                          <FuriganaText
                            text={example.ja}
                            kana={example.kana}
                            showFurigana={showFurigana}
                          />
                        </div>

                        {/* Romaji */}
                        {example.romaji && (
                          <div className='font-mono text-xs text-(--secondary-color)'>
                            {example.romaji}
                          </div>
                        )}

                        {/* Vietnamese Translation */}
                        <div className='border-t border-(--border-color)/30 pt-1 text-sm font-medium text-(--main-color)/80'>
                          {example.vi}
                        </div>
                      </div>

                      {/* Audio Button */}
                      <button
                        type='button'
                        onClick={() => playJapaneseSpeech(example.ja)}
                        aria-label={`Nghe câu ví dụ: ${example.ja}`}
                        className='flex size-8 shrink-0 cursor-pointer items-center justify-center rounded-lg bg-sky-500/10 text-sky-500 transition-colors hover:bg-sky-500/20 active:scale-95'
                      >
                        <Volume2 className='size-4' />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer: Prev / Next */}
        {allGrammar.length > 1 && onSelectGrammar && (
          <div className='mt-4 flex items-center justify-between border-t border-(--border-color)/60 pt-6'>
            <button
              type='button'
              disabled={!prevGrammar}
              onClick={() => prevGrammar && onSelectGrammar(prevGrammar)}
              className='flex cursor-pointer items-center gap-1.5 rounded-xl border border-(--border-color) px-3 py-2 text-xs font-medium transition-colors hover:bg-(--background-color) disabled:pointer-events-none disabled:opacity-40 sm:text-sm'
            >
              <ChevronLeft className='size-4' />
              <span>Mẫu trước</span>
            </button>

            <span className='text-xs font-medium text-(--secondary-color)'>
              {currentIndex + 1} / {allGrammar.length}
            </span>

            <button
              type='button'
              disabled={!nextGrammar}
              onClick={() => nextGrammar && onSelectGrammar(nextGrammar)}
              className='flex cursor-pointer items-center gap-1.5 rounded-xl border border-(--border-color) px-3 py-2 text-xs font-medium transition-colors hover:bg-(--background-color) disabled:pointer-events-none disabled:opacity-40 sm:text-sm'
            >
              <span>Mẫu tiếp</span>
              <ChevronRight className='size-4' />
            </button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
