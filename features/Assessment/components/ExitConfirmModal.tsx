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
    <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4'>
      <div className='flex w-full max-w-md flex-col rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900'>
        <div className='border-b border-slate-100 pb-3 dark:border-slate-800'>
          <span className='rounded bg-[#FDEBEC] px-2.5 py-0.5 text-xs font-medium text-[#9F2F2D] dark:bg-rose-950/40 dark:text-rose-300'>
            Cảnh báo thoát
          </span>
          <h2 className='mt-2 text-base font-bold text-slate-900 dark:text-white'>
            Xác nhận thoát bài thi
          </h2>
        </div>

        <div className='space-y-2 py-4 text-xs leading-relaxed text-slate-600 dark:text-slate-400'>
          <p>
            Bạn đang làm{' '}
            <strong className='font-semibold text-slate-900 dark:text-white'>
              {part === 1 ? 'Phần 1: Trắc nghiệm' : 'Phần 2: Tự luận'}
            </strong>
            .
          </p>
          <div className='rounded-lg border border-[#F2E8C9] bg-[#FBF3DB]/50 p-3 text-[#7D5400] dark:border-amber-900/40 dark:bg-amber-950/20 dark:text-amber-200'>
            <strong>Lưu ý:</strong> Nếu thoát bây giờ, các câu trả lời của phần
            này sẽ bị hủy và thời gian làm bài sẽ tính lại từ đầu khi làm lại.
          </div>
        </div>

        <div className='mt-2 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end'>
          <button
            type='button'
            onClick={onClose}
            className='cursor-pointer rounded-lg border border-slate-200 bg-white px-4 py-2 text-xs font-medium text-slate-700 transition-colors hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700'
          >
            Tiếp tục làm bài
          </button>
          <button
            type='button'
            onClick={onConfirmExit}
            className='cursor-pointer rounded-lg bg-rose-600 px-4 py-2 text-xs font-medium text-white transition-colors hover:bg-rose-500 active:scale-[0.99]'
          >
            Hủy và thoát
          </button>
        </div>
      </div>
    </div>
  );
}
