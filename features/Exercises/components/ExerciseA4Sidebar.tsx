'use client';

import React from 'react';
import {
  Clock,
  Printer,
  Send,
  ArrowUp,
  SlidersHorizontal,
  CheckCircle2,
} from 'lucide-react';
import { PublicQuestion } from '@/shared/types/exercise';
import { useClick } from '@/shared/hooks/generic/useAudio';

interface ExerciseA4SidebarProps {
  questions: PublicQuestion[];
  answers: Record<string, string>;
  timeLeft: number;
  timeLimitMinutes: number;
  onSubmitClick: () => void;
  onPrintClick: () => void;
  viewMode: 'a4' | 'step';
  onToggleViewMode: () => void;
  activeQuestionIndex?: number;
  onSelectQuestion?: (index: number) => void;
  isAdmin?: boolean;
}

export const ExerciseA4Sidebar: React.FC<ExerciseA4SidebarProps> = ({
  questions,
  answers,
  timeLeft,
  timeLimitMinutes,
  onSubmitClick,
  onPrintClick,
  viewMode,
  onToggleViewMode,
  activeQuestionIndex,
  onSelectQuestion,
  isAdmin = false,
}) => {
  const { playClick } = useClick();
  const totalQuestions = questions.length;
  const answeredCount = Object.keys(answers).length;
  const progressPercent =
    totalQuestions > 0 ? Math.round((answeredCount / totalQuestions) * 100) : 0;

  const formatTimer = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m < 10 ? '0' : ''}${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const handleScrollToQuestion = (idx: number) => {
    playClick();
    if (viewMode === 'step') {
      onSelectQuestion?.(idx);
      return;
    }

    const targetEl = document.getElementById(`q-item-${idx}`);
    if (targetEl) {
      targetEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  const handleScrollToTop = () => {
    playClick();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <aside className='sticky top-6 space-y-4 select-none print:hidden'>
      <div className='space-y-4 rounded-3xl border-2 border-(--border-color) bg-(--card-color) p-5 shadow-lg'>
        {/* Timer Card */}
        {timeLimitMinutes > 0 && (
          <div
            className={`flex items-center justify-between rounded-2xl border p-3 font-mono font-bold transition-all ${
              timeLeft < 120
                ? 'animate-pulse border-red-500/40 bg-red-500/10 text-red-400'
                : 'border-(--border-color) bg-(--background-color) text-(--main-color)'
            }`}
          >
            <div className='flex items-center gap-2 text-xs'>
              <Clock className='size-4 text-(--main-color)' />
              <span>Thời gian còn:</span>
            </div>
            <span className='text-base tracking-wider'>
              {formatTimer(timeLeft)}
            </span>
          </div>
        )}

        {/* Progress & Stats */}
        <div className='space-y-2 rounded-2xl border border-(--border-color)/60 bg-(--background-color)/40 p-3.5'>
          <div className='flex items-center justify-between text-xs font-semibold text-(--secondary-color)'>
            <span>Tiến độ làm bài</span>
            <span className='font-bold text-(--main-color)'>
              {answeredCount}/{totalQuestions} câu ({progressPercent}%)
            </span>
          </div>
          <div className='h-2 w-full overflow-hidden rounded-full bg-(--border-color)/40'>
            <div
              className='h-full rounded-full bg-(--main-color) transition-all duration-300'
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Quick Question Jump Palette */}
        <div className='space-y-2'>
          <div className='flex items-center justify-between text-xs font-bold text-(--secondary-color)'>
            <span>Danh sách câu hỏi</span>
            <span className='text-[11px] font-normal'>
              (Bấm để chuyển nhanh)
            </span>
          </div>

          <div className='max-h-[36vh] overflow-y-auto pr-1'>
            <div className='grid grid-cols-5 gap-1.5'>
              {questions.map((q, idx) => {
                const qKey = String(q.id || idx + 1);
                const isAnswered = Boolean(answers[qKey]);
                const isCurrent = activeQuestionIndex === idx;

                return (
                  <button
                    key={idx}
                    type='button'
                    onClick={() => handleScrollToQuestion(idx)}
                    className={`flex size-8 items-center justify-center rounded-lg text-xs font-bold transition-all active:scale-90 ${
                      isCurrent
                        ? 'bg-(--main-color) text-(--background-color) shadow-md ring-2 ring-(--main-color)/40'
                        : isAnswered
                          ? 'border-2 border-(--main-color) bg-(--main-color)/20 font-bold text-(--main-color)'
                          : 'border border-(--border-color) bg-(--background-color) text-(--secondary-color) hover:border-(--main-color)'
                    }`}
                    title={`Câu ${idx + 1}`}
                  >
                    {idx + 1}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Palette Status Legend */}
          <div className='flex items-center justify-between border-t border-(--border-color)/50 pt-2 text-[10px] text-(--secondary-color)'>
            <div className='flex items-center gap-1.5'>
              <span className='size-2.5 rounded-sm border border-(--main-color) bg-(--main-color)/30' />
              <span>Đã làm</span>
            </div>
            <div className='flex items-center gap-1.5'>
              <span className='size-2.5 rounded-sm border border-(--border-color) bg-(--background-color)' />
              <span>Chưa làm</span>
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className='space-y-2 border-t border-(--border-color)/60 pt-3'>
          {/* Print PDF Button (Only for Admin) */}
          {isAdmin && (
            <button
              type='button'
              onClick={() => {
                playClick();
                onPrintClick();
              }}
              className='flex w-full items-center justify-center gap-2 rounded-2xl border border-(--border-color) bg-(--background-color) py-2.5 text-xs font-bold text-(--main-color) shadow-xs transition-all hover:border-(--main-color) hover:bg-(--main-color)/10 active:scale-95'
            >
              <Printer className='size-4 text-blue-500' />
              <span>In đề thi / Xuất PDF (Admin)</span>
            </button>
          )}

          {/* View Mode Toggle */}
          <button
            type='button'
            onClick={() => {
              playClick();
              onToggleViewMode();
            }}
            className='flex w-full items-center justify-center gap-2 rounded-2xl border border-(--border-color) bg-(--background-color) py-2 text-xs font-semibold text-(--secondary-color) transition-all hover:text-(--main-color) active:scale-95'
          >
            <SlidersHorizontal className='size-3.5' />
            <span>
              {viewMode === 'a4'
                ? 'Đổi sang xem từng câu'
                : 'Đổi sang dạng Đề A4'}
            </span>
          </button>

          {/* Submit Test Button */}
          <button
            type='button'
            onClick={() => {
              playClick();
              onSubmitClick();
            }}
            className='flex w-full items-center justify-center gap-2 rounded-2xl bg-(--main-color) py-3 text-xs font-bold text-(--background-color) shadow-md transition-all hover:opacity-90 active:scale-95'
          >
            {answeredCount === totalQuestions ? (
              <CheckCircle2 className='size-4' />
            ) : (
              <Send className='size-4' />
            )}
            <span>
              Nộp bài ({answeredCount}/{totalQuestions})
            </span>
          </button>

          {/* Scroll to Top (Only in A4 scroll mode) */}
          {viewMode === 'a4' && (
            <button
              type='button'
              onClick={handleScrollToTop}
              className='flex w-full items-center justify-center gap-1.5 py-1 text-[11px] font-medium text-(--secondary-color) transition-colors hover:text-(--main-color)'
            >
              <ArrowUp className='size-3' />
              <span>Lên đầu đề thi</span>
            </button>
          )}
        </div>
      </div>
    </aside>
  );
};
