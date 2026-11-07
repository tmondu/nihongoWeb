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
    <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4'>
      <div className='flex max-h-[85vh] w-full max-w-2xl flex-col rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900'>
        {/* Modal Header */}
        <div className='flex items-center justify-between border-b border-slate-100 px-5 py-4 dark:border-slate-800'>
          <div className='flex items-center gap-3'>
            <h2 className='text-sm font-bold text-slate-900 dark:text-white'>
              Bảng câu hỏi ({activePart === 1 ? 'Trắc nghiệm' : 'Tự luận'})
            </h2>
            <span className='rounded bg-[#E1F3FE] px-2 py-0.5 text-xs font-medium text-[#1F6C9F] dark:bg-sky-950/40 dark:text-sky-300'>
              Đã làm: {answeredCount}/100 câu
            </span>
          </div>
          <button
            type='button'
            onClick={() => setQuestionMatrixOpen(false)}
            className='cursor-pointer rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 transition-colors hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800'
          >
            Đóng
          </button>
        </div>

        {/* Legend */}
        <div className='flex items-center gap-4 border-b border-slate-100 bg-[#FBFBFA] px-5 py-2.5 text-xs dark:border-slate-800 dark:bg-slate-800/40'>
          <div className='flex items-center gap-1.5'>
            <span className='size-3 rounded bg-slate-900 dark:bg-white' />
            <span className='font-medium text-slate-700 dark:text-slate-300'>
              Đã làm
            </span>
          </div>
          <div className='flex items-center gap-1.5'>
            <span className='size-3 rounded border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-800' />
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
                  className={`flex size-10 cursor-pointer items-center justify-center rounded-lg text-xs font-semibold transition-colors active:scale-95 ${
                    answered
                      ? 'border border-slate-900 bg-slate-900 text-white dark:border-white dark:bg-white dark:text-slate-900'
                      : 'border border-slate-200 bg-[#FBFBFA] text-slate-700 hover:border-slate-400 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:border-slate-600'
                  }`}
                >
                  {num}
                </button>
              );
            })}
          </div>
        </div>

        {/* Modal Footer */}
        <div className='flex items-center justify-end border-t border-slate-100 px-5 py-3 dark:border-slate-800'>
          <button
            type='button'
            onClick={() => setQuestionMatrixOpen(false)}
            className='cursor-pointer rounded-lg bg-slate-900 px-4 py-2 text-xs font-medium text-white transition-colors hover:bg-slate-800 active:scale-[0.99] dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100'
          >
            Tiếp tục làm bài
          </button>
        </div>
      </div>
    </div>
  );
}
