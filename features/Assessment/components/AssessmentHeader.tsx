'use client';

import React from 'react';
import { useAssessmentStore } from '../store/useAssessmentStore';

interface AssessmentHeaderProps {
  onSubmitPart: () => void;
  submitting: boolean;
}

function formatTime(totalSeconds: number): string {
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

export default function AssessmentHeader({
  onSubmitPart,
  submitting,
}: AssessmentHeaderProps) {
  const {
    activePart,
    mcqSecondsLeft,
    essaySecondsLeft,
    answers,
    setQuestionMatrixOpen,
  } = useAssessmentStore();

  // Calculate completed count
  const answeredCount = Object.keys(answers).filter(k => {
    const val = answers[Number(k)];
    if (!val) return false;
    if (typeof val === 'string') return val.trim().length > 0;
    if (typeof val === 'object') {
      return Boolean(val.hanViet?.trim() || val.meaning?.trim());
    }
    return false;
  }).length;

  const currentSecondsLeft =
    activePart === 1 ? mcqSecondsLeft : essaySecondsLeft;

  return (
    <header className='border-border/60 bg-background/95 sticky top-0 z-40 border-b backdrop-blur-md'>
      <div className='mx-auto flex max-w-5xl items-center justify-between gap-3 px-4 py-3'>
        {/* Left: Title & Progress */}
        <div className='flex flex-col gap-0.5'>
          <h1 className='text-foreground text-base font-bold tracking-tight sm:text-lg'>
            Kiểm tra đầu vào N5
          </h1>
          <div className='text-muted-foreground flex items-center gap-2 text-xs'>
            <span>Tiến độ:</span>
            <span className='text-foreground font-semibold'>
              {answeredCount}/200 câu
            </span>
            <div className='bg-muted h-1.5 w-16 overflow-hidden rounded-full sm:w-28'>
              <div
                className='h-full bg-blue-600 transition-all duration-300'
                style={{ width: `${(answeredCount / 200) * 100}%` }}
              />
            </div>
          </div>
        </div>

        {/* Right: Timer, Question Matrix Button, Submit Button */}
        <div className='flex items-center gap-2 sm:gap-3'>
          {/* Timer Display */}
          <div
            className={`flex items-center gap-1 rounded-lg px-2.5 py-1.5 font-mono text-xs font-bold ${
              currentSecondsLeft <= 300
                ? 'animate-pulse border border-rose-500/30 bg-rose-500/10 text-rose-500'
                : 'border border-blue-500/30 bg-blue-500/10 text-blue-600 dark:text-blue-400'
            }`}
          >
            <span>Thời gian:</span>
            <span>{formatTime(currentSecondsLeft)}</span>
          </div>

          {/* Matrix Button */}
          <button
            type='button'
            onClick={() => setQuestionMatrixOpen(true)}
            className='border-border/70 hover:bg-muted active:bg-muted/80 text-foreground rounded-lg border px-3 py-1.5 text-xs font-semibold transition-colors'
          >
            Bảng câu hỏi
          </button>

          {/* Submit Button */}
          <button
            type='button'
            onClick={onSubmitPart}
            disabled={submitting}
            className='rounded-lg bg-blue-600 px-3.5 py-1.5 text-xs font-semibold text-white shadow-sm transition-all hover:bg-blue-500 active:scale-95 disabled:pointer-events-none disabled:opacity-50'
          >
            {submitting ? 'Đang nộp...' : 'Nộp bài'}
          </button>
        </div>
      </div>
    </header>
  );
}
