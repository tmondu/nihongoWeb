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
    <header className='font-vietnamese sticky top-0 z-40 border-b-2 border-(--border-color) bg-(--card-color)/95 shadow-xs backdrop-blur-md'>
      <div className='mx-auto flex max-w-4xl items-center justify-between gap-3 px-4 py-3'>
        {/* Left: Title & Progress */}
        <div className='flex flex-col gap-0.5'>
          <h1 className='text-sm font-extrabold tracking-tight text-(--main-color) sm:text-base'>
            {activePart === 1 ? 'Trắc nghiệm' : 'Tự luận'}
          </h1>
          <div className='flex items-center gap-2 text-xs text-(--secondary-color)'>
            <span>Tiến độ:</span>
            <span className='font-bold text-(--main-color) tabular-nums'>
              {answeredInPart}/100 câu
            </span>
            <div className='h-1.5 w-16 overflow-hidden rounded-full bg-(--border-color) sm:w-24'>
              <div
                className='h-full rounded-full bg-(--main-color) transition-all duration-300'
                style={{ width: `${(answeredInPart / 100) * 100}%` }}
              />
            </div>
          </div>
        </div>

        {/* Right: Actions */}
        <div className='flex items-center gap-2 sm:gap-2.5'>
          {/* Timer Display */}
          <div
            className={`flex items-center gap-1 rounded-2xl px-3 py-1.5 font-mono text-xs font-bold ${
              currentSecondsLeft <= 300
                ? 'animate-pulse border-2 border-red-500/40 bg-red-500/15 text-red-500'
                : 'border-2 border-(--border-color) bg-(--background-color) text-(--main-color)'
            }`}
          >
            <span>Thời gian:</span>
            <span>{formatTime(currentSecondsLeft)}</span>
          </div>

          {/* Matrix Button */}
          <button
            type='button'
            onClick={handleOpenMatrix}
            className='cursor-pointer rounded-2xl border-2 border-(--border-color) bg-(--background-color) px-3 py-1.5 text-xs font-bold text-(--secondary-color) transition-all hover:border-(--main-color) hover:text-(--main-color) active:scale-95'
          >
            Bảng câu hỏi
          </button>

          {/* Exit Button */}
          <button
            type='button'
            onClick={handleOpenExit}
            className='cursor-pointer rounded-2xl border-2 border-red-500/30 bg-red-500/10 px-3 py-1.5 text-xs font-bold text-red-500 transition-all hover:bg-red-500/20 active:scale-95'
          >
            Thoát
          </button>

          {/* Submit Button */}
          <button
            type='button'
            onClick={handleSubmit}
            disabled={submitting}
            className='cursor-pointer rounded-2xl bg-(--main-color) px-4 py-1.5 text-xs font-bold text-(--background-color) shadow-sm transition-all hover:opacity-90 active:scale-95 disabled:pointer-events-none disabled:opacity-40'
          >
            {submitting ? 'Đang nộp...' : 'Nộp bài'}
          </button>
        </div>
      </div>
    </header>
  );
}
