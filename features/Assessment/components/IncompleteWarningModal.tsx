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
    <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs'>
      <div className='border-border/80 bg-background flex max-h-[85vh] w-full max-w-lg flex-col rounded-2xl border p-6 shadow-2xl'>
        <div className='mb-3'>
          <h2 className='text-base font-bold text-rose-600 sm:text-lg dark:text-rose-400'>
            Chưa hoàn thành bài thi
          </h2>
        </div>

        <p className='text-muted-foreground text-sm leading-relaxed'>
          Phần bạn đang nộp hiện còn{' '}
          <strong className='text-foreground'>
            {missingQuestions.length} câu
          </strong>{' '}
          chưa làm.
        </p>

        <p className='text-muted-foreground mt-1 text-xs'>
          Quy định: Bạn bắt buộc phải hoàn thành 100% câu hỏi thì bài thi mới
          được hệ thống ghi nhận và tính điểm.
        </p>

        {/* Missing Numbers List */}
        <div className='my-4 flex flex-col gap-1.5'>
          <span className='text-muted-foreground text-xs font-semibold'>
            Các câu chưa làm:
          </span>
          <div className='bg-muted/40 border-border/60 max-h-36 overflow-y-auto rounded-lg border p-2.5'>
            <div className='flex flex-wrap gap-1.5'>
              {missingQuestions.map(num => (
                <button
                  key={num}
                  type='button'
                  onClick={() => onJumpToQuestion(num)}
                  className='rounded bg-rose-500/10 px-2 py-0.5 text-xs font-bold text-rose-600 transition-colors hover:bg-rose-500/20 dark:text-rose-400'
                  title={`Nhảy đến câu ${num}`}
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
            className='rounded-lg bg-blue-600 px-4 py-2 text-xs font-semibold text-white transition-all hover:bg-blue-500 active:scale-95'
          >
            Làm tiếp câu còn thiếu
          </button>
        </div>
      </div>
    </div>
  );
}
