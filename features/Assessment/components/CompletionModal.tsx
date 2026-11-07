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
    <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4'>
      <div className='flex w-full max-w-md flex-col rounded-xl border border-slate-200 bg-white p-6 text-center dark:border-slate-800 dark:bg-slate-900'>
        <div className='mb-3'>
          <span className='rounded bg-[#EDF3EC] px-2.5 py-0.5 text-xs font-medium text-[#285A2C] dark:bg-emerald-950/40 dark:text-emerald-300'>
            {isFullyCompleted ? 'Hoàn thành bài thi' : 'Đã nộp phần thi'}
          </span>
          <h2 className='mt-2 text-base font-bold text-slate-900 dark:text-white'>
            {isFullyCompleted
              ? 'Hoàn thành bài kiểm tra'
              : 'Đã nộp bài thành công'}
          </h2>
        </div>

        <p className='text-xs leading-relaxed text-slate-600 dark:text-slate-400'>
          {message}
        </p>

        <p className='mt-1 text-xs text-slate-500 dark:text-slate-400'>
          Kết quả bài thi đã được lưu vào hệ thống. Giáo viên sẽ kiểm tra và
          phản hồi sớm nhất.
        </p>

        <div className='mt-6 flex flex-col gap-2'>
          <button
            type='button'
            onClick={handleContinue}
            className='cursor-pointer rounded-lg bg-slate-900 px-4 py-2.5 text-xs font-medium text-white transition-colors hover:bg-slate-800 active:scale-[0.99] dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100'
          >
            {isFullyCompleted ? 'Xem lại các phần' : 'Làm tiếp phần còn lại'}
          </button>
          <Link
            href='/'
            className='rounded-lg border border-slate-200 bg-white px-4 py-2 text-xs font-medium text-slate-700 transition-colors hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700'
          >
            Trở về trang chủ
          </Link>
        </div>
      </div>
    </div>
  );
}
