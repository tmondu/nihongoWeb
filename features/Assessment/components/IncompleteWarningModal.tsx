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
    <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4'>
      <div className='flex max-h-[85vh] w-full max-w-lg flex-col rounded-2xl border-2 border-slate-300 bg-white p-6 shadow-2xl dark:border-slate-700 dark:bg-slate-900'>
        <div className='mb-3'>
          <span className='rounded bg-rose-100 px-2.5 py-1 text-xs font-bold text-rose-700 dark:bg-rose-950/60 dark:text-rose-400'>
            Chưa hoàn thành
          </span>
          <h2 className='mt-2 text-lg font-bold text-slate-900 dark:text-white'>
            Bạn chưa hoàn thành tất cả câu hỏi
          </h2>
        </div>

        <p className='text-xs leading-relaxed text-slate-600 dark:text-slate-300'>
          Phần thi này hiện còn{' '}
          <strong className='font-bold text-rose-600 dark:text-rose-400'>
            {missingQuestions.length} câu
          </strong>{' '}
          chưa được trả lời.
        </p>

        <div className='mt-2 rounded-xl border border-amber-200 bg-amber-50/70 p-3 text-xs text-amber-900 dark:border-amber-900/40 dark:bg-amber-950/20 dark:text-amber-200'>
          <strong>Quy định:</strong> Bắt buộc hoàn thành 100% câu hỏi thì hệ
          thống mới cho phép nộp bài và tính điểm.
        </div>

        {/* Missing Numbers List */}
        <div className='my-4 flex flex-col gap-1.5'>
          <span className='text-xs font-bold text-slate-700 dark:text-slate-300'>
            Danh sách các câu còn thiếu (bấm vào số câu để chuyển nhanh):
          </span>
          <div className='max-h-36 overflow-y-auto rounded-xl border border-slate-200 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-800/40'>
            <div className='flex flex-wrap gap-1.5'>
              {missingQuestions.map(num => (
                <button
                  key={num}
                  type='button'
                  onClick={() => onJumpToQuestion(num)}
                  className='cursor-pointer rounded-lg border border-rose-300 bg-rose-50 px-2.5 py-1 text-xs font-bold text-rose-700 transition-colors hover:bg-rose-100 dark:border-rose-800 dark:bg-rose-950/50 dark:text-rose-300 dark:hover:bg-rose-900/60'
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
            className='cursor-pointer rounded-xl bg-blue-600 px-5 py-2.5 text-xs font-bold text-white transition-all hover:bg-blue-500 active:scale-98'
          >
            Làm tiếp các câu còn thiếu
          </button>
        </div>
      </div>
    </div>
  );
}
