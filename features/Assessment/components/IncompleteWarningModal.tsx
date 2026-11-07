'use client';

import React from 'react';

interface IncompleteWarningModalProps {
  isOpen: boolean;
  onClose: () => void;
  missingQuestions: number[];
  onJumpToQuestion: (orderNum: number) => void;
}

export default function IncompleteWarningModal({
  isOpen,
  onClose,
  missingQuestions,
  onJumpToQuestion,
}: IncompleteWarningModalProps) {
  if (!isOpen) return null;

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4'>
      <div className='flex max-h-[85vh] w-full max-w-lg flex-col rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900'>
        <div className='mb-3'>
          <span className='rounded bg-[#FDEBEC] px-2.5 py-0.5 text-xs font-medium text-[#9F2F2D] dark:bg-rose-950/40 dark:text-rose-300'>
            Chưa hoàn thành
          </span>
          <h2 className='mt-2 text-base font-bold text-slate-900 dark:text-white'>
            Chưa hoàn thành tất cả câu hỏi
          </h2>
        </div>

        <p className='text-xs leading-relaxed text-slate-600 dark:text-slate-400'>
          Phần thi này còn{' '}
          <strong className='font-semibold text-rose-600 dark:text-rose-400'>
            {missingQuestions.length} câu
          </strong>{' '}
          chưa được trả lời.
        </p>

        <div className='mt-2.5 rounded-lg border border-[#F2E8C9] bg-[#FBF3DB]/50 p-3 text-xs text-[#7D5400] dark:border-amber-900/40 dark:bg-amber-950/20 dark:text-amber-200'>
          <strong>Quy định:</strong> Bắt buộc hoàn thành 100% câu hỏi thì hệ
          thống mới cho phép nộp bài.
        </div>

        {/* Missing Numbers List */}
        <div className='my-4 flex flex-col gap-1.5'>
          <span className='text-xs font-medium text-slate-600 dark:text-slate-400'>
            Các câu chưa làm (bấm để chuyển đến):
          </span>
          <div className='max-h-36 overflow-y-auto rounded-lg border border-slate-200 bg-[#FBFBFA] p-2.5 dark:border-slate-800 dark:bg-slate-800/40'>
            <div className='flex flex-wrap gap-1.5'>
              {missingQuestions.map(num => (
                <button
                  key={num}
                  type='button'
                  onClick={() => onJumpToQuestion(num)}
                  className='cursor-pointer rounded border border-slate-200 bg-white px-2.5 py-1 text-xs font-medium text-slate-800 transition-colors hover:border-slate-400 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200'
                  title={`Chuyển đến câu ${num}`}
                >
                  Câu {num}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className='mt-2 flex justify-end gap-2'>
          <button
            type='button'
            onClick={onClose}
            className='cursor-pointer rounded-lg bg-slate-900 px-4 py-2 text-xs font-medium text-white transition-colors hover:bg-slate-800 active:scale-[0.99] dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100'
          >
            Làm tiếp câu còn thiếu
          </button>
        </div>
      </div>
    </div>
  );
}
