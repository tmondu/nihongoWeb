'use client';

import React from 'react';
import { AssessmentTest } from '../types';
import { useAssessmentStore } from '../store/useAssessmentStore';
import { useClick } from '@/shared/hooks/generic/useAudio';

interface TestOverviewCardProps {
  test: AssessmentTest;
}

export default function TestOverviewCard({ test }: TestOverviewCardProps) {
  const { setCurrentView, mcqStatus, essayStatus } = useAssessmentStore();
  const { playClick } = useClick();

  const isCompletedAll =
    mcqStatus === 'completed' && essayStatus === 'completed';

  const handleStart = () => {
    playClick();
    setCurrentView('part_selection');
  };

  return (
    <div className='font-vietnamese mx-auto max-w-3xl px-4 py-12 sm:py-16'>
      <div className='rounded-3xl border-2 border-(--border-color) bg-(--card-color) p-6 shadow-sm sm:p-10'>
        {/* Header */}
        <div className='border-b-2 border-(--border-color)/60 pb-6'>
          <span className='inline-flex items-center rounded-full bg-(--main-color)/15 px-3.5 py-1 text-xs font-extrabold tracking-wide text-(--main-color) uppercase'>
            Đánh giá năng lực
          </span>
          <h1 className='mt-3.5 text-2xl font-extrabold tracking-tight text-(--main-color) sm:text-3xl'>
            {test.title || 'Kiểm tra đầu vào N5'}
          </h1>
          <p className='mt-2 text-xs leading-relaxed text-(--secondary-color) sm:text-sm'>
            {test.description ||
              'Đề thi đánh giá năng lực tiếng Nhật N5 chuẩn Minna no Nihongo.'}
          </p>
        </div>

        {/* Specifications Grid */}
        <div className='grid grid-cols-1 gap-4 py-6 sm:grid-cols-2'>
          <div className='rounded-2xl border-2 border-(--border-color) bg-(--background-color) p-5 transition-all hover:border-(--main-color)/60'>
            <div className='text-xs font-semibold text-(--secondary-color)'>
              Quy mô đề thi
            </div>
            <div className='mt-1 text-lg font-extrabold text-(--main-color) sm:text-xl'>
              {test.total_questions || 200} câu hỏi
            </div>
            <div className='mt-1 text-xs text-(--secondary-color)'>
              100 câu Trắc nghiệm · 100 câu Tự luận
            </div>
          </div>

          <div className='rounded-2xl border-2 border-(--border-color) bg-(--background-color) p-5 transition-all hover:border-(--main-color)/60'>
            <div className='text-xs font-semibold text-(--secondary-color)'>
              Hình thức làm bài
            </div>
            <div className='mt-1 text-lg font-extrabold text-(--main-color) sm:text-xl'>
              Làm tách buổi
            </div>
            <div className='mt-1 text-xs text-(--secondary-color)'>
              Trắc nghiệm (60 phút) · Tự luận (80 phút)
            </div>
          </div>
        </div>

        {/* Rules Box */}
        <div className='mb-8 rounded-2xl border-2 border-amber-500/30 bg-amber-500/10 p-4 text-xs leading-relaxed text-amber-600 dark:text-amber-400'>
          <span className='font-bold text-amber-700 dark:text-amber-300'>
            Quy định làm bài:
          </span>
          <ul className='mt-1.5 list-inside list-disc space-y-1 text-(--secondary-color)'>
            <li>
              Bắt buộc hoàn thành 100% câu hỏi của từng phần để được nộp bài.
            </li>
            <li>
              Khi bấm bắt đầu, đồng hồ sẽ tính giờ và không được thoát trang
              giữa chừng.
            </li>
            <li>
              Nếu thoát trang trong lúc đang làm, bài làm của phần đó sẽ bị hủy.
            </li>
          </ul>
        </div>

        {/* Action Button */}
        <button
          type='button'
          onClick={handleStart}
          className='w-full cursor-pointer rounded-2xl bg-(--main-color) py-3.5 text-center text-sm font-bold text-(--background-color) shadow-md transition-all hover:opacity-90 active:scale-95'
        >
          {isCompletedAll ? 'Xem lại bài thi' : 'Vào bài thi'}
        </button>
      </div>
    </div>
  );
}
