'use client';

import React from 'react';
import Link from 'next/link';

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
  if (!isOpen) return null;

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs'>
      <div className='border-border/80 bg-background flex w-full max-w-md flex-col rounded-2xl border p-6 text-center shadow-2xl'>
        <h2 className='text-lg font-bold text-emerald-600 dark:text-emerald-400'>
          {isFullyCompleted
            ? 'Đã hoàn thành toàn bộ bài kiểm tra'
            : 'Đã nộp phần thi thành công'}
        </h2>

        <p className='text-muted-foreground mt-3 text-sm leading-relaxed'>
          {message}
        </p>

        <p className='text-muted-foreground mt-2 text-xs'>
          Kết quả và đánh giá năng lực của bạn đã được ghi nhận trên hệ thống và
          sẽ được giáo viên phản hồi sớm nhất.
        </p>

        <div className='mt-6 flex flex-col gap-2'>
          <button
            type='button'
            onClick={onClose}
            className='rounded-lg bg-blue-600 px-4 py-2.5 text-xs font-semibold text-white transition-all hover:bg-blue-500 active:scale-95'
          >
            {isFullyCompleted ? 'Đóng thông báo' : 'Làm tiếp phần còn lại'}
          </button>
          <Link
            href='/'
            className='hover:bg-muted text-muted-foreground hover:text-foreground rounded-lg px-4 py-2 text-xs font-semibold transition-colors'
          >
            Trở về trang chủ
          </Link>
        </div>
      </div>
    </div>
  );
}
