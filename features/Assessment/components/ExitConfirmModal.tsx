'use client';

import React from 'react';

interface ExitConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirmExit: () => void;
  part: 1 | 2 | null;
}

export default function ExitConfirmModal({
  isOpen,
  onClose,
  onConfirmExit,
  part,
}: ExitConfirmModalProps) {
  if (!isOpen || !part) return null;

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4'>
      <div className='flex w-full max-w-md flex-col rounded-2xl border-2 border-slate-300 bg-white p-6 shadow-2xl dark:border-slate-700 dark:bg-slate-900'>
        <div className='border-b border-slate-100 pb-3 dark:border-slate-800'>
          <span className='rounded bg-rose-100 px-2 py-0.5 text-xs font-bold text-rose-700 dark:bg-rose-950/60 dark:text-rose-400'>
            Cảnh báo thoát
          </span>
          <h2 className='mt-2 text-lg font-bold text-slate-900 dark:text-white'>
            Bạn có chắc muốn thoát bài thi?
          </h2>
        </div>

        <div className='space-y-2 py-4 text-xs leading-relaxed text-slate-700 dark:text-slate-300'>
          <p>
            Bạn đang làm{' '}
            <strong className='font-bold text-slate-900 dark:text-white'>
              {part === 1 ? 'Phần 1: Trắc nghiệm' : 'Phần 2: Tự luận'}
            </strong>
            .
          </p>
          <div className='rounded-xl border border-rose-200 bg-rose-50/70 p-3 text-rose-900 dark:border-rose-900/40 dark:bg-rose-950/20 dark:text-rose-300'>
            <strong>Quy định:</strong> Nếu thoát ngay bây giờ, toàn bộ câu trả
            lời của phần này sẽ bị hủy và thời gian làm bài sẽ bị tính lại từ
            đầu.
          </div>
        </div>

        <div className='mt-2 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end'>
          <button
            type='button'
            onClick={onClose}
            className='cursor-pointer rounded-xl border border-slate-300 bg-slate-100 px-4 py-2.5 text-xs font-bold text-slate-700 transition-colors hover:bg-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700'
          >
            Tiếp tục làm bài
          </button>
          <button
            type='button'
            onClick={onConfirmExit}
            className='cursor-pointer rounded-xl bg-rose-600 px-4 py-2.5 text-xs font-bold text-white transition-colors hover:bg-rose-500'
          >
            Hủy và thoát
          </button>
        </div>
      </div>
    </div>
  );
}
