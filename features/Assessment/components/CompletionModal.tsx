'use client';

import React from 'react';
import Link from 'next/link';
import { useAssessmentStore } from '../store/useAssessmentStore';
import { useClick } from '@/shared/hooks/generic/useAudio';

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
  const { playClick } = useClick();

  if (!isOpen) return null;

  const handleContinue = () => {
    playClick();
    onClose();
    setCurrentView('part_selection');
  };

  return (
    <div className='font-vietnamese fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-xs'>
      <div className='flex w-full max-w-md flex-col rounded-3xl border-2 border-(--border-color) bg-(--card-color) p-6 text-center shadow-2xl sm:p-7'>
        <div className='mb-3 border-b-2 border-(--border-color)/60 pb-3.5'>
          <span className='rounded-full border border-green-500/30 bg-green-500/15 px-3 py-0.5 text-xs font-extrabold text-green-600 dark:text-green-400'>
            {isFullyCompleted ? 'Hoàn thành bài thi' : 'Đã nộp phần thi'}
          </span>
          <h2 className='mt-2.5 text-lg font-extrabold text-(--main-color)'>
            {isFullyCompleted
              ? 'Hoàn thành bài kiểm tra'
              : 'Đã nộp bài thành công'}
          </h2>
        </div>

        <p className='text-xs leading-relaxed text-(--secondary-color) sm:text-sm'>
          {message}
        </p>

        <p className='mt-2 text-xs leading-relaxed text-(--secondary-color)'>
          Kết quả bài thi đã được lưu vào hệ thống quản trị. Giáo viên sẽ kiểm
          tra và phản hồi sớm nhất.
        </p>

        <div className='mt-6 flex flex-col gap-2.5'>
          <button
            type='button'
            onClick={handleContinue}
            className='cursor-pointer rounded-2xl bg-(--main-color) px-5 py-3 text-xs font-bold text-(--background-color) shadow-md transition-all hover:opacity-90 active:scale-95 sm:text-sm'
          >
            {isFullyCompleted ? 'Xem lại các phần' : 'Làm tiếp phần còn lại'}
          </button>
          <Link
            href='/'
            onClick={playClick}
            className='rounded-2xl border-2 border-(--border-color) bg-(--background-color) px-4 py-2.5 text-xs font-bold text-(--secondary-color) transition-all hover:border-(--main-color) hover:text-(--main-color) active:scale-95'
          >
            Trở về trang chủ
          </Link>
        </div>
      </div>
    </div>
  );
}
