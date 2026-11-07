'use client';

import React from 'react';
import { useClick } from '@/shared/hooks/generic/useAudio';

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
  const { playClick } = useClick();

  if (!isOpen || !part) return null;

  const handleClose = () => {
    playClick();
    onClose();
  };

  const handleConfirm = () => {
    playClick();
    onConfirmExit();
  };

  return (
    <div className='font-vietnamese fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-xs'>
      <div className='flex w-full max-w-md flex-col rounded-3xl border-2 border-(--border-color) bg-(--card-color) p-6 shadow-2xl sm:p-7'>
        <div className='border-b-2 border-(--border-color)/60 pb-3.5'>
          <span className='rounded-full border border-red-500/30 bg-red-500/15 px-3 py-0.5 text-xs font-extrabold text-red-500'>
            Cảnh báo thoát
          </span>
          <h2 className='mt-2.5 text-lg font-extrabold text-(--main-color)'>
            Xác nhận thoát bài thi
          </h2>
        </div>

        <div className='space-y-2.5 py-4 text-xs leading-relaxed text-(--secondary-color)'>
          <p>
            Bạn đang làm{' '}
            <strong className='font-bold text-(--main-color)'>
              {part === 1 ? 'Phần 1: Trắc nghiệm' : 'Phần 2: Tự luận'}
            </strong>
            .
          </p>
          <div className='rounded-2xl border-2 border-amber-500/30 bg-amber-500/10 p-3.5 text-amber-600 dark:text-amber-400'>
            <strong className='font-bold text-amber-700 dark:text-amber-300'>
              Lưu ý:
            </strong>{' '}
            Nếu thoát bây giờ, các câu trả lời của phần này sẽ bị hủy và thời
            gian làm bài sẽ tính lại từ đầu khi làm lại.
          </div>
        </div>

        <div className='mt-2 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end'>
          <button
            type='button'
            onClick={handleClose}
            className='cursor-pointer rounded-2xl border-2 border-(--border-color) bg-(--background-color) px-4 py-2.5 text-xs font-bold text-(--secondary-color) transition-all hover:border-(--main-color) hover:text-(--main-color) active:scale-95'
          >
            Tiếp tục làm bài
          </button>
          <button
            type='button'
            onClick={handleConfirm}
            className='cursor-pointer rounded-2xl bg-red-600 px-4 py-2.5 text-xs font-bold text-white shadow-md transition-all hover:bg-red-700 active:scale-95'
          >
            Hủy và thoát
          </button>
        </div>
      </div>
    </div>
  );
}
