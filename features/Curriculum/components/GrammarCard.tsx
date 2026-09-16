'use client';

import React from 'react';
import { ChevronRight, Pencil, CheckCircle2 } from 'lucide-react';
import type { ThamGrammarPoint } from '../types';

interface GrammarCardProps {
  grammar: ThamGrammarPoint;
  isCompleted?: boolean;
  onSelect: (grammar: ThamGrammarPoint) => void;
}

export function GrammarCard({
  grammar,
  isCompleted = false,
  onSelect,
}: GrammarCardProps) {
  return (
    <div
      role='button'
      tabIndex={0}
      onClick={() => onSelect(grammar)}
      onKeyDown={e => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onSelect(grammar);
        }
      }}
      className={`group relative flex cursor-pointer items-center justify-between rounded-xl border p-4 transition-all duration-200 sm:p-5 ${
        isCompleted
          ? 'border-emerald-500/30 bg-(--card-color) shadow-xs hover:border-emerald-500/60 hover:shadow-md'
          : 'border-(--border-color) bg-(--card-color) shadow-xs hover:border-sky-500/50 hover:shadow-md'
      }`}
    >
      {/* Left Details */}
      <div className='min-w-0 flex-1 pr-3'>
        <div className='flex items-center gap-2'>
          {isCompleted && (
            <CheckCircle2
              className='size-4 shrink-0 text-emerald-500'
              aria-label='Đã hoàn thành'
            />
          )}
          <h3 className='font-mixed truncate text-base font-bold tracking-wide text-(--main-color) transition-colors group-hover:text-sky-500 sm:text-lg'>
            {grammar.title}
          </h3>
        </div>
        <p className='mt-1 line-clamp-2 text-xs text-(--secondary-color) sm:text-sm'>
          {grammar.summary_vi}
        </p>
      </div>

      {/* Right Action: Chevron + Blue Pencil Button */}
      <div className='flex shrink-0 items-center gap-3'>
        <ChevronRight className='size-4 text-(--secondary-color)/60 transition-transform group-hover:translate-x-0.5 group-hover:text-sky-500' />

        <button
          type='button'
          onClick={e => {
            e.stopPropagation();
            onSelect(grammar);
          }}
          aria-label={`Chi tiết ngữ pháp ${grammar.title}`}
          className='flex size-9 cursor-pointer items-center justify-center rounded-xl bg-sky-500 text-white shadow-xs transition-all hover:scale-105 hover:bg-sky-600 active:scale-95 sm:size-10'
        >
          <Pencil className='size-4' />
        </button>
      </div>
    </div>
  );
}
