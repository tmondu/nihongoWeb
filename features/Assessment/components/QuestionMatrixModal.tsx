'use client';

import React from 'react';
import { useAssessmentStore } from '../store/useAssessmentStore';

export default function QuestionMatrixModal() {
  const { isQuestionMatrixOpen, setQuestionMatrixOpen, activePart, answers } =
    useAssessmentStore();

  if (!isQuestionMatrixOpen || !activePart) return null;

  const handleSelectQuestion = (orderNum: number) => {
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

  const answeredCount = questionNumbers.filter(isAnswered).length;

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4'>
      <div className='flex max-h-[85vh] w-full max-w-2xl flex-col rounded-2xl border-2 border-slate-300 bg-white shadow-2xl dark:border-slate-700 dark:bg-slate-900'>
        {/* Modal Header */}
        <div className='flex items-center justify-between border-b border-slate-200 px-5 py-4 dark:border-slate-800'>
          <div className='flex items-center gap-3'>
            <h2 className='text-base font-bold text-slate-900 dark:text-white'>
              Danh sách câu hỏi (
              {activePart === 1 ? 'Phần 1: Trắc nghiệm' : 'Phần 2: Tự luận'})
            </h2>
            <span className='rounded bg-blue-100 px-2 py-0.5 text-xs font-bold text-blue-700 dark:bg-blue-900/40 dark:text-blue-300'>
              Đã làm: {answeredCount}/100 câu
            </span>
          </div>
          <button
            type='button'
            onClick={() => setQuestionMatrixOpen(false)}
            className='rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-bold text-slate-700 transition-colors hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700'
          >
            Đóng
          </button>
        </div>

        {/* Legend */}
        <div className='flex items-center gap-4 border-b border-slate-100 bg-slate-50 px-5 py-2.5 text-xs dark:border-slate-800/60 dark:bg-slate-800/30'>
          <div className='flex items-center gap-1.5'>
            <span className='size-3 rounded bg-emerald-600' />
            <span className='font-medium text-slate-700 dark:text-slate-300'>
              Đã làm
            </span>
          </div>
          <div className='flex items-center gap-1.5'>
            <span className='size-3 rounded border border-slate-300 bg-slate-100 dark:border-slate-600 dark:bg-slate-800' />
            <span className='font-medium text-slate-700 dark:text-slate-300'>
              Chưa làm
            </span>
          </div>
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
                  className={`flex size-10 items-center justify-center rounded-lg text-xs font-bold transition-transform active:scale-90 ${
                    answered
                      ? 'border-2 border-emerald-600 bg-emerald-600 text-white shadow-xs'
                      : 'border border-slate-300 bg-slate-100 text-slate-800 hover:border-blue-500 hover:bg-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:border-blue-400'
                  }`}
                >
                  {num}
                </button>
              );
            })}
          </div>
        </div>

        {/* Modal Footer */}
        <div className='flex items-center justify-end border-t border-slate-200 bg-slate-50 px-5 py-3 dark:border-slate-800 dark:bg-slate-800/30'>
          <button
            type='button'
            onClick={() => setQuestionMatrixOpen(false)}
            className='rounded-lg bg-blue-600 px-4 py-2 text-xs font-bold text-white transition-colors hover:bg-blue-500'
          >
            Tiếp tục làm bài
          </button>
        </div>
      </div>
    </div>
  );
}
