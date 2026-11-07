'use client';

import React from 'react';
import { useAssessmentStore } from '../store/useAssessmentStore';
import { useClick } from '@/shared/hooks/generic/useAudio';

export default function QuestionMatrixModal() {
  const { isQuestionMatrixOpen, setQuestionMatrixOpen, activePart, answers } =
    useAssessmentStore();
  const { playClick } = useClick();

  if (!isQuestionMatrixOpen || !activePart) return null;

  const handleSelectQuestion = (orderNum: number) => {
    playClick();
    setQuestionMatrixOpen(false);

    // Scroll to element after DOM updates
    setTimeout(() => {
      const el = document.getElementById(`question-${orderNum}`);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 100);
  };

  const handleClose = () => {
    playClick();
    setQuestionMatrixOpen(false);
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
    <div className='font-vietnamese fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-xs'>
      <div className='flex max-h-[85vh] w-full max-w-2xl flex-col rounded-3xl border-2 border-(--border-color) bg-(--card-color) p-5 shadow-2xl sm:p-6'>
        {/* Modal Header */}
        <div className='flex items-center justify-between border-b-2 border-(--border-color)/60 pb-4'>
          <div className='flex items-center gap-3'>
            <h2 className='text-sm font-extrabold text-(--main-color) sm:text-base'>
              Bảng câu hỏi ({activePart === 1 ? 'Trắc nghiệm' : 'Tự luận'})
            </h2>
            <span className='rounded-full bg-(--main-color)/15 px-3 py-0.5 text-xs font-bold text-(--main-color) tabular-nums'>
              Đã làm: {answeredCount}/100 câu
            </span>
          </div>
          <button
            type='button'
            onClick={handleClose}
            className='cursor-pointer rounded-2xl border-2 border-(--border-color) bg-(--background-color) px-3.5 py-1.5 text-xs font-bold text-(--secondary-color) transition-all hover:border-(--main-color) hover:text-(--main-color) active:scale-95'
          >
            Đóng
          </button>
        </div>

        {/* Legend */}
        <div className='flex items-center gap-4 border-b-2 border-(--border-color)/40 bg-(--background-color)/60 px-2 py-2.5 text-xs'>
          <div className='flex items-center gap-2'>
            <span className='size-3 rounded-md bg-(--main-color)' />
            <span className='font-bold text-(--main-color)'>Đã làm</span>
          </div>
          <div className='flex items-center gap-2'>
            <span className='size-3 rounded-md border-2 border-(--border-color) bg-(--card-color)' />
            <span className='font-medium text-(--secondary-color)'>
              Chưa làm
            </span>
          </div>
        </div>

        {/* Numbers Grid */}
        <div className='overflow-y-auto p-2 sm:p-4'>
          <div className='grid grid-cols-5 gap-2 sm:grid-cols-10'>
            {questionNumbers.map(num => {
              const answered = isAnswered(num);
              return (
                <button
                  key={num}
                  type='button'
                  onClick={() => handleSelectQuestion(num)}
                  className={`flex size-10 cursor-pointer items-center justify-center rounded-xl text-xs font-bold transition-all active:scale-90 ${
                    answered
                      ? 'border-2 border-(--main-color) bg-(--main-color) text-(--background-color) shadow-xs'
                      : 'border-2 border-(--border-color) bg-(--background-color) text-(--secondary-color) hover:border-(--main-color)/60 hover:text-(--main-color)'
                  }`}
                >
                  {num}
                </button>
              );
            })}
          </div>
        </div>

        {/* Modal Footer */}
        <div className='flex items-center justify-end border-t-2 border-(--border-color)/60 pt-4'>
          <button
            type='button'
            onClick={handleClose}
            className='cursor-pointer rounded-2xl bg-(--main-color) px-5 py-2.5 text-xs font-bold text-(--background-color) shadow-md transition-all hover:opacity-90 active:scale-95'
          >
            Tiếp tục làm bài
          </button>
        </div>
      </div>
    </div>
  );
}
