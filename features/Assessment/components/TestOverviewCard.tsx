'use client';

import React from 'react';
import { AssessmentTest } from '../types';
import { useAssessmentStore } from '../store/useAssessmentStore';

interface TestOverviewCardProps {
  test: AssessmentTest;
}

export default function TestOverviewCard({ test }: TestOverviewCardProps) {
  const { setCurrentView, mcqStatus, essayStatus } = useAssessmentStore();

  const isCompletedAll =
    mcqStatus === 'completed' && essayStatus === 'completed';

  return (
    <div className='mx-auto max-w-3xl px-4 py-16 sm:py-20'>
      <div className='rounded-xl border border-slate-200 bg-white p-6 sm:p-10 dark:border-slate-800 dark:bg-slate-900'>
        {/* Header */}
        <div className='border-b border-slate-100 pb-6 dark:border-slate-800'>
          <span className='inline-block rounded bg-[#E1F3FE] px-2.5 py-0.5 text-xs font-medium tracking-wide text-[#1F6C9F] dark:bg-sky-950/40 dark:text-sky-300'>
            Đánh giá năng lực
          </span>
          <h1 className='mt-3 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl dark:text-white'>
            {test.title || 'Kiểm tra đầu vào N5'}
          </h1>
          <p className='mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-400'>
            {test.description ||
              'Đề thi đánh giá năng lực Kanji N5 chuẩn Minna no Nihongo.'}
          </p>
        </div>

        {/* Specifications Grid */}
        <div className='grid grid-cols-1 gap-4 py-6 sm:grid-cols-2'>
          <div className='rounded-lg border border-slate-100 bg-[#FBFBFA] p-5 dark:border-slate-800 dark:bg-slate-800/40'>
            <div className='text-xs font-medium text-slate-500 dark:text-slate-400'>
              Quy mô đề thi
            </div>
            <div className='mt-1 text-lg font-bold text-slate-900 dark:text-white'>
              {test.total_questions || 200} câu hỏi
            </div>
            <div className='mt-1 text-xs text-slate-500 dark:text-slate-400'>
              100 câu Trắc nghiệm · 100 câu Tự luận
            </div>
          </div>

          <div className='rounded-lg border border-slate-100 bg-[#FBFBFA] p-5 dark:border-slate-800 dark:bg-slate-800/40'>
            <div className='text-xs font-medium text-slate-500 dark:text-slate-400'>
              Hình thức làm bài
            </div>
            <div className='mt-1 text-lg font-bold text-slate-900 dark:text-white'>
              Làm tách buổi
            </div>
            <div className='mt-1 text-xs text-slate-500 dark:text-slate-400'>
              Trắc nghiệm (60 phút) · Tự luận (80 phút)
            </div>
          </div>
        </div>

        {/* Rules Box */}
        <div className='mb-8 rounded-lg border border-[#F2E8C9] bg-[#FBF3DB]/50 p-4 text-xs leading-relaxed text-[#7D5400] dark:border-amber-900/40 dark:bg-amber-950/20 dark:text-amber-200'>
          <span className='font-bold'>Quy định làm bài:</span>
          <ul className='mt-1.5 list-inside list-disc space-y-1 text-slate-700 dark:text-slate-300'>
            <li>
              Bắt buộc hoàn thành 100% câu hỏi của từng phần để được nộp bài.
            </li>
            <li>
              Khi bấm bắt đầu, đồng hồ sẽ tính giờ và không được thoát trang.
            </li>
            <li>Nếu thoát giữa chừng, bài làm của phần đó sẽ bị hủy.</li>
          </ul>
        </div>

        {/* Primary CTA Button */}
        <button
          type='button'
          onClick={() => setCurrentView('part_selection')}
          className='w-full cursor-pointer rounded-lg bg-slate-900 py-3.5 text-center text-sm font-medium text-white transition-colors hover:bg-slate-800 active:scale-[0.99] dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100'
        >
          {isCompletedAll ? 'Xem lại bài thi' : 'Vào bài thi'}
        </button>
      </div>
    </div>
  );
}
