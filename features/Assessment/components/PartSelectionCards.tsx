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
    <div className='mx-auto max-w-4xl px-4 py-10'>
      {/* Top Navigation */}
      <div className='mb-6 flex items-center justify-between'>
        <button
          type='button'
          onClick={() => setCurrentView('test_overview')}
          className='cursor-pointer rounded-lg border border-slate-300 bg-white px-3.5 py-1.5 text-xs font-bold text-slate-700 transition-colors hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700'
        >
          ← Quay lại thông tin đề
        </button>
        <span className='text-xs font-medium text-slate-500 dark:text-slate-400'>
          Bài kiểm tra đầu vào N5
        </span>
      </div>

      {/* Header */}
      <div className='mb-8 text-center sm:text-left'>
        <h1 className='text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl dark:text-white'>
          Chọn phần thi
        </h1>
        <p className='mt-2 text-sm text-slate-600 dark:text-slate-400'>
          Bạn có thể làm Trắc nghiệm hoặc Tự luận trước. Khi ấn bắt đầu, đồng hồ
          sẽ tính giờ và không được thoát trang giữa chừng.
        </p>
      </div>

      {/* Completion Banner */}
      {isAllDone && (
        <div className='mb-8 rounded-xl border border-emerald-300 bg-emerald-50 p-4 text-emerald-900 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-200'>
          <div className='text-sm font-bold'>
            Chúc mừng! Bạn đã hoàn thành toàn bộ bài thi
          </div>
          <p className='mt-1 text-xs'>
            Cả hai phần Trắc nghiệm và Tự luận đã được ghi nhận. Giáo viên sẽ
            chấm và liên hệ phản hồi cho bạn.
          </p>
        </div>
      )}

      {/* 2 Big Cards Grid */}
      <div className='grid grid-cols-1 gap-6 md:grid-cols-2'>
        {/* Card 1: Trắc nghiệm */}
        <div className='flex flex-col justify-between rounded-2xl border-2 border-slate-200 bg-white p-6 shadow-sm transition-all dark:border-slate-800 dark:bg-slate-900'>
          <div>
            {/* Header / Badges */}
            <div className='flex items-center justify-between border-b border-slate-100 pb-4 dark:border-slate-800'>
              <span className='rounded bg-blue-100 px-2.5 py-1 text-xs font-bold text-blue-700 dark:bg-blue-900/40 dark:text-blue-300'>
                Phần 1
              </span>
              {isMcqDone ? (
                <span className='rounded bg-emerald-100 px-2.5 py-0.5 text-xs font-bold text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400'>
                  Đã hoàn thành
                </span>
              ) : (
                <span className='rounded bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-300'>
                  Chưa làm
                </span>
              )}
            </div>

            {/* Title & Info */}
            <div className='py-5'>
              <h2 className='text-xl font-bold text-slate-900 dark:text-white'>
                Trắc nghiệm
              </h2>
              <div className='mt-3 flex items-center gap-3 text-xs font-semibold text-slate-600 dark:text-slate-300'>
                <span className='rounded-md bg-slate-100 px-2 py-1 dark:bg-slate-800'>
                  100 câu hỏi
                </span>
                <span className='rounded-md bg-slate-100 px-2 py-1 dark:bg-slate-800'>
                  Thời gian: 60 phút
                </span>
              </div>
              <p className='mt-3 text-xs leading-relaxed text-slate-500 dark:text-slate-400'>
                Chọn 1 trong 4 đáp án đúng (A, B, C, D) cho cách đọc hoặc từ
                Kanji thích hợp trong câu ngữ cảnh.
              </p>
            </div>

            {/* Warning rule */}
            {!isMcqDone && (
              <div className='mb-6 rounded-xl border border-amber-200 bg-amber-50/70 p-3 text-xs leading-relaxed text-amber-900 dark:border-amber-900/40 dark:bg-amber-950/20 dark:text-amber-200'>
                <strong>Lưu ý:</strong> Sau khi bấm bắt đầu, đồng hồ 60 phút sẽ
                chạy và bạn không thể thoát giữa chừng. Nếu thoát sẽ mất tiến
                trình làm bài.
              </div>
            )}
          </div>

          {/* Button */}
          <div>
            {isMcqDone ? (
              <div className='w-full rounded-xl bg-slate-100 py-3 text-center text-xs font-bold text-slate-500 dark:bg-slate-800 dark:text-slate-400'>
                Đã nộp bài
              </div>
            ) : (
              <button
                type='button'
                onClick={() => startTestPart(1)}
                className='w-full cursor-pointer rounded-xl bg-blue-600 py-3 text-center text-sm font-bold text-white shadow-md transition-all hover:bg-blue-500 active:scale-98'
              >
                Bắt đầu làm Trắc nghiệm (60 phút)
              </button>
            )}
          </div>
        </div>

        {/* Card 2: Tự luận */}
        <div className='flex flex-col justify-between rounded-2xl border-2 border-slate-200 bg-white p-6 shadow-sm transition-all dark:border-slate-800 dark:bg-slate-900'>
          <div>
            {/* Header / Badges */}
            <div className='flex items-center justify-between border-b border-slate-100 pb-4 dark:border-slate-800'>
              <span className='rounded bg-indigo-100 px-2.5 py-1 text-xs font-bold text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300'>
                Phần 2
              </span>
              {isEssayDone ? (
                <span className='rounded bg-emerald-100 px-2.5 py-0.5 text-xs font-bold text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400'>
                  Đã hoàn thành
                </span>
              ) : (
                <span className='rounded bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-300'>
                  Chưa làm
                </span>
              )}
            </div>

            {/* Title & Info */}
            <div className='py-5'>
              <h2 className='text-xl font-bold text-slate-900 dark:text-white'>
                Tự luận
              </h2>
              <div className='mt-3 flex items-center gap-3 text-xs font-semibold text-slate-600 dark:text-slate-300'>
                <span className='rounded-md bg-slate-100 px-2 py-1 dark:bg-slate-800'>
                  100 câu hỏi
                </span>
                <span className='rounded-md bg-slate-100 px-2 py-1 dark:bg-slate-800'>
                  Thời gian: 80 phút
                </span>
              </div>
              <p className='mt-3 text-xs leading-relaxed text-slate-500 dark:text-slate-400'>
                Gồm 80 câu điền cách đọc Hiragana và 20 câu điền âm Hán Việt
                cùng nghĩa tiếng Việt của từ Kanji.
              </p>
            </div>

            {/* Warning rule */}
            {!isEssayDone && (
              <div className='mb-6 rounded-xl border border-amber-200 bg-amber-50/70 p-3 text-xs leading-relaxed text-amber-900 dark:border-amber-900/40 dark:bg-amber-950/20 dark:text-amber-200'>
                <strong>Lưu ý:</strong> Sau khi bấm bắt đầu, đồng hồ 80 phút sẽ
                chạy và bạn không thể thoát giữa chừng. Nếu thoát sẽ mất tiến
                trình làm bài.
              </div>
            )}
          </div>

          {/* Button */}
          <div>
            {isEssayDone ? (
              <div className='w-full rounded-xl bg-slate-100 py-3 text-center text-xs font-bold text-slate-500 dark:bg-slate-800 dark:text-slate-400'>
                Đã nộp bài
              </div>
            ) : (
              <button
                type='button'
                onClick={() => startTestPart(2)}
                className='w-full cursor-pointer rounded-xl bg-indigo-600 py-3 text-center text-sm font-bold text-white shadow-md transition-all hover:bg-indigo-500 active:scale-98'
              >
                Bắt đầu làm Tự luận (80 phút)
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
