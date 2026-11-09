import React from 'react';
import type { Metadata } from 'next';
import dynamic from 'next/dynamic';

export const metadata: Metadata = {
  title: 'Kiểm tra đầu vào N5 | PThamSS',
  description:
    'Bài kiểm tra đánh giá năng lực đầu vào tiếng Nhật N5 gồm 200 câu hỏi (100 trắc nghiệm + 100 tự luận).',
};

const AssessmentContainer = dynamic(
  () => import('@/features/Assessment/components/AssessmentContainer'),
  {
    ssr: false,
    loading: () => (
      <div className='flex min-h-[60vh] flex-col items-center justify-center gap-3.5 px-4'>
        <div className='size-10 animate-spin rounded-full border-4 border-[var(--border-color)] border-t-[var(--main-color)]' />
        <p className='text-xs font-bold text-[var(--secondary-color)]'>
          Đang tải đề thi...
        </p>
      </div>
    ),
  },
);

export default function AssessmentPage() {
  return <AssessmentContainer />;
}
