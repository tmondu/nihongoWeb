'use client';

import React from 'react';
import { useAssessmentStore } from '../store/useAssessmentStore';

export default function PartSelectionCards() {
  const { setCurrentView, startTestPart, mcqStatus, essayStatus } =
    useAssessmentStore();

  const isMcqDone = mcqStatus === 'completed';
  const isEssayDone = essayStatus === 'completed';
  const isAllDone = isMcqDone && isEssayDone;

  return (
    <div className='mx-auto max-w-4xl px-4 py-16 sm:py-20'>
      {/* Top Bar */}
      <div className='mb-8 flex items-center justify-between'>
        <button
          type='button'
          onClick={() => setCurrentView('test_overview')}
          className='cursor-pointer rounded-lg border border-slate-200 bg-white px-3.5 py-1.5 text-xs font-medium text-slate-700 transition-colors hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800'
        >
          Quay lại thông tin đề
        </button>
        <span className='text-xs font-medium text-slate-400 dark:text-slate-500'>
          Đề thi Kanji N5
        </span>
      </div>

      {/* Page Heading */}
      <div className='mb-8'>
        <h1 className='text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl dark:text-white'>
          Kiểm tra đầu vào N5
        </h1>
        <p className='mt-2 text-sm text-slate-600 dark:text-slate-400'>
          Chọn phần thi để bắt đầu làm bài. Thời gian chỉ tính khi bạn bấm bắt
          đầu.
        </p>
      </div>

      {/* Completion Banner */}
      {isAllDone && (
        <div className='mb-8 rounded-lg border border-[#D4E8D2] bg-[#EDF3EC] p-4 text-xs leading-relaxed text-[#285A2C] dark:border-emerald-900/40 dark:bg-emerald-950/20 dark:text-emerald-300'>
          <div className='text-sm font-bold'>
            Đã hoàn thành toàn bộ bài kiểm tra
          </div>
          <p className='mt-1'>
            Bạn đã nộp cả 2 phần Trắc nghiệm và Tự luận. Giáo viên sẽ chấm điểm
            và phản hồi kết quả cho bạn.
          </p>
        </div>
      )}

      {/* Bento Grid: 2 Distinct Cards */}
      <div className='grid grid-cols-1 gap-6 md:grid-cols-2'>
        {/* Card 1: Trắc nghiệm */}
        <div className='flex flex-col justify-between rounded-xl border border-slate-200 bg-white p-6 sm:p-8 dark:border-slate-800 dark:bg-slate-900'>
          <div>
            {/* Tag & Status */}
            <div className='flex items-center justify-between border-b border-slate-100 pb-4 dark:border-slate-800'>
              <span className='rounded bg-[#E1F3FE] px-2.5 py-0.5 text-xs font-medium tracking-wide text-[#1F6C9F] dark:bg-sky-950/40 dark:text-sky-300'>
                Phần 1
              </span>
              {isMcqDone ? (
                <span className='rounded bg-[#EDF3EC] px-2.5 py-0.5 text-xs font-medium text-[#285A2C] dark:bg-emerald-950/40 dark:text-emerald-300'>
                  Đã hoàn thành
                </span>
              ) : (
                <span className='rounded bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-400'>
                  Chưa làm
                </span>
              )}
            </div>

            {/* Title & Specs */}
            <div className='py-6'>
              <h2 className='text-xl font-bold tracking-tight text-slate-900 dark:text-white'>
                Trắc nghiệm
              </h2>
              <div className='mt-1.5 text-xs font-medium text-slate-500 dark:text-slate-400'>
                100 câu · 60 phút
              </div>
              <p className='mt-3 text-xs leading-relaxed text-slate-600 dark:text-slate-400'>
                Chọn 1 trong 4 đáp án đúng (A, B, C, D) cho từ Kanji trong câu
                ngữ cảnh.
              </p>
            </div>

            {/* Warning Rule */}
            {!isMcqDone && (
              <div className='mb-6 rounded-lg border border-[#F2E8C9] bg-[#FBF3DB]/50 p-3 text-xs leading-relaxed text-[#7D5400] dark:border-amber-900/40 dark:bg-amber-950/20 dark:text-amber-200'>
                <strong>Lưu ý:</strong> Bấm bắt đầu sẽ tính giờ 60 phút và không
                được thoát trang giữa chừng.
              </div>
            )}
          </div>

          {/* Action Button */}
          <div>
            {isMcqDone ? (
              <div className='w-full rounded-lg bg-slate-100 py-3 text-center text-xs font-medium text-slate-400 dark:bg-slate-800 dark:text-slate-500'>
                Đã nộp bài
              </div>
            ) : (
              <button
                type='button'
                onClick={() => startTestPart(1)}
                className='w-full cursor-pointer rounded-lg bg-slate-900 py-3 text-center text-xs font-medium text-white transition-colors hover:bg-slate-800 active:scale-[0.99] dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100'
              >
                Bắt đầu làm bài
              </button>
            )}
          </div>
        </div>

        {/* Card 2: Tự luận */}
        <div className='flex flex-col justify-between rounded-xl border border-slate-200 bg-white p-6 sm:p-8 dark:border-slate-800 dark:bg-slate-900'>
          <div>
            {/* Tag & Status */}
            <div className='flex items-center justify-between border-b border-slate-100 pb-4 dark:border-slate-800'>
              <span className='rounded bg-[#F0EEFD] px-2.5 py-0.5 text-xs font-medium tracking-wide text-[#5341C6] dark:bg-indigo-950/40 dark:text-indigo-300'>
                Phần 2
              </span>
              {isEssayDone ? (
                <span className='rounded bg-[#EDF3EC] px-2.5 py-0.5 text-xs font-medium text-[#285A2C] dark:bg-emerald-950/40 dark:text-emerald-300'>
                  Đã hoàn thành
                </span>
              ) : (
                <span className='rounded bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-400'>
                  Chưa làm
                </span>
              )}
            </div>

            {/* Title & Specs */}
            <div className='py-6'>
              <h2 className='text-xl font-bold tracking-tight text-slate-900 dark:text-white'>
                Tự luận
              </h2>
              <div className='mt-1.5 text-xs font-medium text-slate-500 dark:text-slate-400'>
                100 câu · 80 phút
              </div>
              <p className='mt-3 text-xs leading-relaxed text-slate-600 dark:text-slate-400'>
                80 câu điền cách đọc Hiragana và 20 câu điền Âm Hán Việt cùng
                Nghĩa tiếng Việt.
              </p>
            </div>

            {/* Warning Rule */}
            {!isEssayDone && (
              <div className='mb-6 rounded-lg border border-[#F2E8C9] bg-[#FBF3DB]/50 p-3 text-xs leading-relaxed text-[#7D5400] dark:border-amber-900/40 dark:bg-amber-950/20 dark:text-amber-200'>
                <strong>Lưu ý:</strong> Bấm bắt đầu sẽ tính giờ 80 phút và không
                được thoát trang giữa chừng.
              </div>
            )}
          </div>

          {/* Action Button */}
          <div>
            {isEssayDone ? (
              <div className='w-full rounded-lg bg-slate-100 py-3 text-center text-xs font-medium text-slate-400 dark:bg-slate-800 dark:text-slate-500'>
                Đã nộp bài
              </div>
            ) : (
              <button
                type='button'
                onClick={() => startTestPart(2)}
                className='w-full cursor-pointer rounded-lg bg-slate-900 py-3 text-center text-xs font-medium text-white transition-colors hover:bg-slate-800 active:scale-[0.99] dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100'
              >
                Bắt đầu làm bài
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
