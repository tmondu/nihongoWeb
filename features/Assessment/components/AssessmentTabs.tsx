'use client';

import React from 'react';
import { useAssessmentStore } from '../store/useAssessmentStore';

export default function AssessmentTabs() {
  const { activePart, setActivePart, mcqStatus, essayStatus, answers } =
    useAssessmentStore();

  // Count answered in each part
  const part1Answered = Object.keys(answers).filter(k => {
    const num = Number(k);
    if (num < 1 || num > 100) return false;
    const val = answers[num];
    return typeof val === 'string' && val.trim().length > 0;
  }).length;

  const part2Answered = Object.keys(answers).filter(k => {
    const num = Number(k);
    if (num < 101 || num > 200) return false;
    const val = answers[num];
    if (!val) return false;
    if (typeof val === 'string') return val.trim().length > 0;
    if (typeof val === 'object') {
      return Boolean(val.hanViet?.trim() || val.meaning?.trim());
    }
    return false;
  }).length;

  return (
    <div className='bg-muted/50 border-border/60 mx-auto grid w-full max-w-5xl grid-cols-2 gap-2 rounded-xl border p-1'>
      {/* Tab 1: Trắc nghiệm */}
      <button
        type='button'
        onClick={() => setActivePart(1)}
        className={`flex flex-col items-center justify-center gap-1 rounded-lg px-4 py-2.5 text-center transition-all ${
          activePart === 1
            ? 'bg-background text-foreground shadow-sm'
            : 'text-muted-foreground hover:text-foreground'
        }`}
      >
        <div className='flex items-center gap-2'>
          <span className='text-sm font-bold sm:text-base'>Trắc nghiệm</span>
          {mcqStatus === 'completed' ? (
            <span className='rounded bg-emerald-500/15 px-1.5 py-0.5 text-[10px] font-bold text-emerald-600 dark:text-emerald-400'>
              Đã hoàn thành
            </span>
          ) : (
            <span className='text-muted-foreground text-[11px] font-medium'>
              {part1Answered}/100 câu
            </span>
          )}
        </div>
        <span className='text-muted-foreground text-xs'>100 câu • 60 phút</span>
      </button>

      {/* Tab 2: Tự luận */}
      <button
        type='button'
        onClick={() => setActivePart(2)}
        className={`flex flex-col items-center justify-center gap-1 rounded-lg px-4 py-2.5 text-center transition-all ${
          activePart === 2
            ? 'bg-background text-foreground shadow-sm'
            : 'text-muted-foreground hover:text-foreground'
        }`}
      >
        <div className='flex items-center gap-2'>
          <span className='text-sm font-bold sm:text-base'>Tự luận</span>
          {essayStatus === 'completed' ? (
            <span className='rounded bg-emerald-500/15 px-1.5 py-0.5 text-[10px] font-bold text-emerald-600 dark:text-emerald-400'>
              Đã hoàn thành
            </span>
          ) : (
            <span className='text-muted-foreground text-[11px] font-medium'>
              {part2Answered}/100 câu
            </span>
          )}
        </div>
        <span className='text-muted-foreground text-xs'>100 câu • 80 phút</span>
      </button>
    </div>
  );
}
