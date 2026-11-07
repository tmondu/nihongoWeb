'use client';

import React from 'react';
import { useAssessmentStore } from '../store/useAssessmentStore';

interface AssessmentHeaderProps {
  onOpenExitModal: () => void;
  onSubmitPart: () => void;
  submitting: boolean;
}

function formatTime(totalSeconds: number): string {
  const m = Math.floor(Math.max(0, totalSeconds) / 60);
  const s = Math.max(0, totalSeconds) % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

export default function AssessmentHeader({
  onOpenExitModal,
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

  const range = activePart === 1 ? [1, 100] : [101, 200];
  let answeredInPart = 0;
  for (let i = range[0]; i <= range[1]; i++) {
    const val = answers[i];
    if (val) {
      if (typeof val === 'string' && val.trim().length > 0) {
        answeredInPart++;
      } else if (typeof val === 'object') {
        if (val.hanViet?.trim() || val.meaning?.trim()) {
          answeredInPart++;
        }
      }
    }
  }

  const currentSecondsLeft =
    activePart === 1 ? mcqSecondsLeft : essaySecondsLeft;

  return (
    <header className='sticky top-0 z-40 border-b border-slate-200 bg-white shadow-xs dark:border-slate-800 dark:bg-slate-900'>
      <div className='mx-auto flex max-w-5xl items-center justify-between gap-3 px-4 py-3'>
        {/* Left: Title & Progress */}
        <div className='flex flex-col gap-0.5'>
          <h1 className='text-sm font-bold tracking-tight text-slate-900 sm:text-base dark:text-white'>
            {activePart === 1
              ? 'Kiểm tra N5 — Trắc nghiệm'
              : 'Kiểm tra N5 — Tự luận'}
          </h1>
          <div className='flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400'>
            <span>Tiến độ:</span>
            <span className='font-bold text-slate-900 dark:text-white'>
              {answeredInPart}/100 câu
            </span>
            <div className='h-1.5 w-16 overflow-hidden rounded-full bg-slate-200 sm:w-28 dark:bg-slate-700'>
              <div
                className='h-full bg-blue-600 transition-all duration-300'
                style={{ width: `${(answeredInPart / 100) * 100}%` }}
              />
            </div>
          </div>
        </div>

        {/* Right: Actions */}
        <div className='flex items-center gap-2 sm:gap-3'>
          {/* Timer Display */}
          <div
            className={`flex items-center gap-1 rounded-lg px-2.5 py-1.5 font-mono text-xs font-bold ${
              currentSecondsLeft <= 300
                ? 'animate-pulse border border-rose-500/40 bg-rose-50 text-rose-600 dark:bg-rose-950/40 dark:text-rose-400'
                : 'border border-blue-500/30 bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300'
            }`}
          >
            <span>Thời gian:</span>
            <span>{formatTime(currentSecondsLeft)}</span>
          </div>

          {/* Matrix Button */}
          <button
            type='button'
            onClick={() => setQuestionMatrixOpen(true)}
            className='cursor-pointer rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 transition-colors hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700'
          >
            Bảng câu hỏi
          </button>

          {/* Exit Button */}
          <button
            type='button'
            onClick={onOpenExitModal}
            className='cursor-pointer rounded-lg border border-rose-300 bg-rose-50 px-3 py-1.5 text-xs font-bold text-rose-700 transition-colors hover:bg-rose-100 dark:border-rose-900/50 dark:bg-rose-950/40 dark:text-rose-300 dark:hover:bg-rose-900/60'
          >
            Thoát
          </button>

          {/* Submit Button */}
          <button
            type='button'
            onClick={onSubmitPart}
            disabled={submitting}
            className='cursor-pointer rounded-lg bg-blue-600 px-3.5 py-1.5 text-xs font-bold text-white shadow-xs transition-all hover:bg-blue-500 active:scale-95 disabled:pointer-events-none disabled:opacity-50'
          >
            {submitting ? 'Đang nộp...' : 'Nộp bài'}
          </button>
        </div>
      </div>
    </header>
  );
}
