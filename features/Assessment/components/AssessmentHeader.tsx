'use client';

import React from 'react';
import { useAssessmentStore } from '../store/useAssessmentStore';
import { useClick } from '@/shared/hooks/generic/useAudio';

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
  const { playClick } = useClick();

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

  const handleOpenMatrix = () => {
    playClick();
    setQuestionMatrixOpen(true);
  };

  const handleOpenExit = () => {
    playClick();
    onOpenExitModal();
  };

  const handleSubmit = () => {
    playClick();
    onSubmitPart();
  };

  return (
    <header className='font-vietnamese sticky top-0 z-40 border-b border-slate-200/90 bg-white/95 shadow-xs backdrop-blur-md dark:border-slate-800 dark:bg-[#121620]/95'>
      <div className='mx-auto flex max-w-4xl items-center justify-between gap-3 px-4 py-3'>
        {/* Left: Title & Progress */}
        <div className='flex flex-col gap-0.5'>
          <h1 className='text-sm font-bold tracking-tight text-slate-900 sm:text-base dark:text-white'>
            {activePart === 1 ? 'Phần 1: Trắc nghiệm' : 'Phần 2: Tự luận'}
          </h1>
          <div className='flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400'>
            <span>Tiến độ:</span>
            <span className='font-bold text-blue-600 tabular-nums dark:text-blue-400'>
              {answeredInPart}/100 câu
            </span>
            <div className='h-1.5 w-16 overflow-hidden rounded-full bg-slate-100 sm:w-24 dark:bg-slate-800'>
              <div
                className='h-full rounded-full bg-blue-600 transition-all duration-300'
                style={{ width: `${(answeredInPart / 100) * 100}%` }}
              />
            </div>
          </div>
        </div>

        {/* Right: Actions */}
        <div className='flex items-center gap-2 sm:gap-2.5'>
          {/* Timer Display */}
          <div
            className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 font-mono text-xs font-bold ${
              currentSecondsLeft <= 300
                ? 'animate-pulse border border-red-300 bg-red-50 text-red-600 dark:border-red-900/60 dark:bg-red-950/40 dark:text-red-400'
                : 'border border-slate-200 bg-slate-50 text-slate-900 dark:border-slate-800 dark:bg-slate-800/80 dark:text-white'
            }`}
          >
            <span className='font-medium text-slate-500 dark:text-slate-400'>
              Thời gian:
            </span>
            <span>{formatTime(currentSecondsLeft)}</span>
          </div>

          {/* Matrix Button */}
          <button
            type='button'
            onClick={handleOpenMatrix}
            className='cursor-pointer rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-bold text-slate-700 transition-all hover:border-blue-400 hover:text-blue-600 active:scale-95 dark:border-slate-800 dark:bg-slate-800/80 dark:text-slate-300 dark:hover:border-blue-500'
          >
            Bảng câu hỏi
          </button>

          {/* Exit Button */}
          <button
            type='button'
            onClick={handleOpenExit}
            className='cursor-pointer rounded-xl border border-red-200 bg-red-50/70 px-3 py-1.5 text-xs font-bold text-red-600 transition-all hover:bg-red-100/80 active:scale-95 dark:border-red-900/40 dark:bg-red-950/30 dark:text-red-400'
          >
            Thoát
          </button>

          {/* Submit Button */}
          <button
            type='button'
            onClick={handleSubmit}
            disabled={submitting}
            className='cursor-pointer rounded-xl bg-blue-600 px-4 py-1.5 text-xs font-bold text-white shadow-xs transition-all hover:bg-blue-500 active:scale-95 disabled:pointer-events-none disabled:opacity-40'
          >
            {submitting ? 'Đang nộp...' : 'Nộp bài'}
          </button>
        </div>
      </div>
    </header>
  );
}
