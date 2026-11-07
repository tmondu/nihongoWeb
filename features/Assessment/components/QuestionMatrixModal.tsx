'use client';

import React from 'react';
import { useAssessmentStore } from '../store/useAssessmentStore';

export default function QuestionMatrixModal() {
  const {
    isQuestionMatrixOpen,
    setQuestionMatrixOpen,
    activePart,
    setActivePart,
    answers,
  } = useAssessmentStore();

  if (!isQuestionMatrixOpen) return null;

  const handleSelectQuestion = (orderNum: number) => {
    // If selecting a question from another part, switch tab
    const targetPart = orderNum <= 100 ? 1 : 2;
    if (activePart !== targetPart) {
      setActivePart(targetPart);
    }
    setQuestionMatrixOpen(false);

    // Scroll to element after DOM updates
    setTimeout(() => {
      const el = document.getElementById(`question-${orderNum}`);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 100);
  };

  const isAnswered = (orderNum: number): boolean => {
    const val = answers[orderNum];
    if (!val) return false;
    if (typeof val === 'string') return val.trim().length > 0;
    if (typeof val === 'object') {
      return Boolean(val.hanViet?.trim() || val.meaning?.trim());
    }
    return false;
  };

  const currentRange = activePart === 1 ? [1, 100] : [101, 200];
  const questionNumbers: number[] = [];
  for (let i = currentRange[0]; i <= currentRange[1]; i++) {
    questionNumbers.push(i);
  }

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs'>
      <div className='border-border/80 bg-background flex max-h-[85vh] w-full max-w-2xl flex-col rounded-2xl border shadow-2xl'>
        {/* Modal Header */}
        <div className='border-border/60 flex items-center justify-between border-b px-5 py-3.5'>
          <div className='flex items-center gap-3'>
            <h2 className='text-foreground text-sm font-bold sm:text-base'>
              Bảng câu hỏi (
              {activePart === 1 ? 'Phần 1: Trắc nghiệm' : 'Phần 2: Tự luận'})
            </h2>
            <div className='flex items-center gap-2 text-xs'>
              <span className='flex items-center gap-1 text-emerald-600 dark:text-emerald-400'>
                <span className='size-2.5 rounded-full bg-emerald-500' />
                Đã làm
              </span>
              <span className='text-muted-foreground flex items-center gap-1'>
                <span className='border-border bg-muted size-2.5 rounded-full border' />
                Chưa làm
              </span>
            </div>
          </div>
          <button
            type='button'
            onClick={() => setQuestionMatrixOpen(false)}
            className='hover:bg-muted text-muted-foreground hover:text-foreground rounded-lg px-2.5 py-1 text-xs font-semibold transition-colors'
          >
            Đóng
          </button>
        </div>

        {/* Numbers Grid */}
        <div className='overflow-y-auto p-4 sm:p-5'>
          <div className='grid grid-cols-5 gap-2 sm:grid-cols-10'>
            {questionNumbers.map(num => {
              const answered = isAnswered(num);
              return (
                <button
                  key={num}
                  type='button'
                  onClick={() => handleSelectQuestion(num)}
                  className={`flex size-10 items-center justify-center rounded-lg text-xs font-bold transition-all active:scale-95 ${
                    answered
                      ? 'border border-emerald-500/30 bg-emerald-500/15 font-bold text-emerald-700 dark:text-emerald-300'
                      : 'border-border/60 bg-muted/30 hover:bg-muted/70 text-muted-foreground hover:text-foreground border'
                  }`}
                >
                  {num}
                </button>
              );
            })}
          </div>
        </div>

        {/* Modal Footer */}
        <div className='border-border/60 bg-muted/20 flex items-center justify-between border-t px-5 py-3'>
          <div className='flex gap-2'>
            <button
              type='button'
              onClick={() => setActivePart(1)}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
                activePart === 1
                  ? 'bg-blue-600 text-white'
                  : 'bg-muted text-muted-foreground hover:text-foreground'
              }`}
            >
              Phần 1 (1 - 100)
            </button>
            <button
              type='button'
              onClick={() => setActivePart(2)}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
                activePart === 2
                  ? 'bg-blue-600 text-white'
                  : 'bg-muted text-muted-foreground hover:text-foreground'
              }`}
            >
              Phần 2 (101 - 200)
            </button>
          </div>
          <button
            type='button'
            onClick={() => setQuestionMatrixOpen(false)}
            className='border-border/70 hover:bg-muted text-foreground rounded-lg border px-3 py-1.5 text-xs font-semibold transition-colors'
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
}
