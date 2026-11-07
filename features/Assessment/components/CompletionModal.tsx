'use client';

import React from 'react';
import Link from 'next/link';
import { useAssessmentStore } from '../store/useAssessmentStore';

interface CompletionModalProps {
  isOpen: boolean;
  message: string;
  isFullyCompleted: boolean;
  onClose: () => void;
}

export default function CompletionModal({
  isOpen,
  message,
  isFullyCompleted,
  onClose,
}: CompletionModalProps) {
  const { setCurrentView } = useAssessmentStore();

  if (!isOpen) return null;

  const handleContinue = () => {
    onClose();
    setCurrentView('part_selection');
  };

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4'>
      <div className='flex w-full max-w-md flex-col rounded-2xl border-2 border-slate-300 bg-white p-6 text-center shadow-2xl dark:border-slate-700 dark:bg-slate-900'>
        <div className='mb-3'>
          <span className='rounded bg-emerald-100 px-2.5 py-1 text-xs font-bold text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400'>
            {isFullyCompleted ? 'Hoàn thành bài thi' : 'Đã nộp phần thi'}
          </span>
          <h2 className='mt-2 text-lg font-bold text-slate-900 dark:text-white'>
            {isFullyCompleted
              ? 'Đã hoàn thành toàn bộ bài kiểm tra'
              : 'Đã ghi nhận phần thi thành công'}
          </h2>
        </div>

        <p className='text-sm leading-relaxed text-slate-600 dark:text-slate-300'>
          {message}
        </p>

        <p className='mt-2 text-xs text-slate-500 dark:text-slate-400'>
          Kết quả đánh giá năng lực của bạn đã được gửi tới hệ thống quản trị.
          Giáo viên sẽ xem xét và liên hệ phản hồi cho bạn sớm nhất.
        </p>

        <div className='mt-6 flex flex-col gap-2'>
          <button
            type='button'
            onClick={handleContinue}
            className='cursor-pointer rounded-xl bg-blue-600 px-4 py-2.5 text-xs font-bold text-white transition-all hover:bg-blue-500 active:scale-98'
          >
            {isFullyCompleted
              ? 'Xem lại danh sách phần thi'
              : 'Làm tiếp phần còn lại'}
          </button>
          <Link
            href='/'
            className='rounded-xl border border-slate-300 bg-slate-100 px-4 py-2 text-xs font-bold text-slate-700 transition-colors hover:bg-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700'
          >
            Trở về trang chủ
          </Link>
        </div>
      </div>
    </div>
  );
}
