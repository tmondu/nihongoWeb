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
    <div className='mx-auto max-w-2xl px-4 py-12'>
      <div className='rounded-2xl border-2 border-slate-200 bg-white p-6 shadow-md sm:p-8 dark:border-slate-800 dark:bg-slate-900'>
        {/* Title */}
        <div className='border-b border-slate-100 pb-5 dark:border-slate-800'>
          <span className='rounded bg-blue-100 px-2.5 py-1 text-xs font-bold text-blue-700 dark:bg-blue-900/40 dark:text-blue-300'>
            Bài kiểm tra xếp lớp
          </span>
          <h1 className='mt-3 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl dark:text-white'>
            {test.title}
          </h1>
          <p className='mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-400'>
            {test.description ||
              'Đề thi đánh giá năng lực tiếng Nhật N5 chuẩn Minna no Nihongo.'}
          </p>
        </div>

        {/* Specifications */}
        <div className='grid grid-cols-1 gap-4 py-6 sm:grid-cols-2'>
          <div className='rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-800/40'>
            <div className='text-xs font-semibold text-slate-500 dark:text-slate-400'>
              Quy mô đề thi
            </div>
            <div className='mt-1 text-lg font-bold text-slate-900 dark:text-white'>
              {test.total_questions} câu hỏi
            </div>
            <div className='mt-1 text-xs text-slate-500'>
              Gồm 100 câu Trắc nghiệm & 100 câu Tự luận
            </div>
          </div>

          <div className='rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-800/40'>
            <div className='text-xs font-semibold text-slate-500 dark:text-slate-400'>
              Hình thức làm bài
            </div>
            <div className='mt-1 text-lg font-bold text-slate-900 dark:text-white'>
              Làm tách buổi
            </div>
            <div className='mt-1 text-xs text-slate-500'>
              Có thể làm Trắc nghiệm trước, Tự luận sau
            </div>
          </div>
        </div>

        {/* Rules */}
        <div className='mb-6 rounded-xl border border-amber-200 bg-amber-50/60 p-4 text-xs leading-relaxed text-amber-900 dark:border-amber-900/50 dark:bg-amber-950/20 dark:text-amber-200'>
          <strong className='font-bold'>Lưu ý khi làm bài:</strong>
          <ul className='mt-1.5 list-inside list-disc space-y-1 text-slate-700 dark:text-slate-300'>
            <li>
              Bắt buộc hoàn thành 100% câu hỏi của từng phần thì bài thi mới
              được tính điểm.
            </li>
            <li>
              Khi đã ấn vào làm một phần, đồng hồ sẽ bắt đầu tính giờ và không
              được thoát giữa chừng.
            </li>
            <li>
              Nếu thoát trang trong lúc đang làm, tiến trình bài làm của phần đó
              sẽ bị hủy.
            </li>
          </ul>
        </div>

        {/* Action Button */}
        <button
          type='button'
          onClick={() => setCurrentView('part_selection')}
          className='w-full cursor-pointer rounded-xl bg-blue-600 py-3.5 text-center text-sm font-bold text-white shadow-md transition-all hover:bg-blue-500 active:scale-98'
        >
          {isCompletedAll ? 'Xem lại bài thi' : 'Vào bài thi'}
        </button>
      </div>
    </div>
  );
}
