'use client';

import React from 'react';
import { useAssessmentStore } from '../store/useAssessmentStore';
import { useClick } from '@/shared/hooks/generic/useAudio';

export default function PartSelectionCards() {
  const { setCurrentView, startTestPart, mcqStatus, essayStatus } =
    useAssessmentStore();
  const { playClick } = useClick();

  const isMcqDone = mcqStatus === 'completed';
  const isEssayDone = essayStatus === 'completed';
  const isAllDone = isMcqDone && isEssayDone;

  const handleBack = () => {
    playClick();
    setCurrentView('test_overview');
  };

  const handleStartPart = (part: 1 | 2) => {
    playClick();
    startTestPart(part);
  };

  return (
    <div className='font-vietnamese mx-auto max-w-4xl px-4 py-12 sm:py-16'>
      {/* Top Bar */}
      <div className='mb-6 flex items-center justify-between'>
        <button
          type='button'
          onClick={handleBack}
          className='cursor-pointer rounded-2xl border-2 border-(--border-color) bg-(--card-color) px-4 py-2 text-xs font-bold text-(--secondary-color) transition-all hover:border-(--main-color) hover:text-(--main-color) active:scale-95'
        >
          Quay lại thông tin đề
        </button>
        <span className='text-xs font-semibold text-(--secondary-color)'>
          Đề thi Kanji N5
        </span>
      </div>

      {/* Page Heading */}
      <div className='mb-8'>
        <h1 className='text-2xl font-extrabold tracking-tight text-(--main-color) sm:text-3xl'>
          Kiểm tra đầu vào N5
        </h1>
        <p className='mt-2 text-xs leading-relaxed text-(--secondary-color) sm:text-sm'>
          Chọn phần thi để bắt đầu làm bài. Thời gian chỉ tính khi bạn bấm bắt
          đầu.
        </p>
      </div>

      {/* Completion Banner */}
      {isAllDone && (
        <div className='mb-8 rounded-3xl border-2 border-green-500/30 bg-green-500/10 p-5 text-xs leading-relaxed text-green-600 dark:text-green-400'>
          <div className='text-sm font-extrabold text-green-700 dark:text-green-300'>
            Đã hoàn thành toàn bộ bài kiểm tra
          </div>
          <p className='mt-1 text-(--secondary-color)'>
            Bạn đã nộp cả 2 phần Trắc nghiệm và Tự luận. Giáo viên sẽ chấm điểm
            và phản hồi kết quả cho bạn.
          </p>
        </div>
      )}

      {/* 2 Distinct Bento Cards */}
      <div className='grid grid-cols-1 gap-6 md:grid-cols-2'>
        {/* Card 1: Trắc nghiệm */}
        <div className='flex flex-col justify-between rounded-3xl border-2 border-(--border-color) bg-(--card-color) p-6 shadow-xs transition-all hover:border-(--main-color)/60 sm:p-7'>
          <div>
            {/* Header: Tag & Status */}
            <div className='flex items-center justify-between border-b-2 border-(--border-color)/60 pb-4'>
              <span className='rounded-full bg-(--main-color)/15 px-3 py-1 text-xs font-extrabold tracking-wide text-(--main-color) uppercase'>
                Phần 1
              </span>
              {isMcqDone ? (
                <span className='rounded-full border border-green-500/30 bg-green-500/15 px-3 py-1 text-xs font-bold text-green-600 dark:text-green-400'>
                  Đã hoàn thành
                </span>
              ) : (
                <span className='rounded-full border border-(--border-color) bg-(--background-color) px-3 py-1 text-xs font-semibold text-(--secondary-color)'>
                  Chưa làm
                </span>
              )}
            </div>

            {/* Title & Specs */}
            <div className='py-6'>
              <h2 className='text-xl font-extrabold tracking-tight text-(--main-color)'>
                Trắc nghiệm
              </h2>
              <div className='mt-1 text-xs font-bold text-(--secondary-color)'>
                100 câu · 60 phút
              </div>
              <p className='mt-3 text-xs leading-relaxed text-(--secondary-color)'>
                Chọn 1 trong 4 đáp án đúng (A, B, C, D) cho từ Kanji trong câu
                ngữ cảnh.
              </p>
            </div>

            {/* Warning Rule */}
            {!isMcqDone && (
              <div className='mb-6 rounded-2xl border-2 border-amber-500/30 bg-amber-500/10 p-3.5 text-xs leading-relaxed text-amber-600 dark:text-amber-400'>
                <strong className='font-bold text-amber-700 dark:text-amber-300'>
                  Lưu ý:
                </strong>{' '}
                Bấm bắt đầu sẽ tính giờ 60 phút và không được thoát trang giữa
                chừng.
              </div>
            )}
          </div>

          {/* Action Button */}
          <div>
            {isMcqDone ? (
              <div className='w-full rounded-2xl border border-(--border-color) bg-(--background-color) py-3.5 text-center text-xs font-bold text-(--secondary-color)'>
                Đã nộp bài
              </div>
            ) : (
              <button
                type='button'
                onClick={() => handleStartPart(1)}
                className='w-full cursor-pointer rounded-2xl bg-(--main-color) py-3.5 text-center text-xs font-bold text-(--background-color) shadow-md transition-all hover:opacity-90 active:scale-95 sm:text-sm'
              >
                Bắt đầu làm bài
              </button>
            )}
          </div>
        </div>

        {/* Card 2: Tự luận */}
        <div className='flex flex-col justify-between rounded-3xl border-2 border-(--border-color) bg-(--card-color) p-6 shadow-xs transition-all hover:border-(--main-color)/60 sm:p-7'>
          <div>
            {/* Header: Tag & Status */}
            <div className='flex items-center justify-between border-b-2 border-(--border-color)/60 pb-4'>
              <span className='rounded-full bg-(--main-color)/15 px-3 py-1 text-xs font-extrabold tracking-wide text-(--main-color) uppercase'>
                Phần 2
              </span>
              {isEssayDone ? (
                <span className='rounded-full border border-green-500/30 bg-green-500/15 px-3 py-1 text-xs font-bold text-green-600 dark:text-green-400'>
                  Đã hoàn thành
                </span>
              ) : (
                <span className='rounded-full border border-(--border-color) bg-(--background-color) px-3 py-1 text-xs font-semibold text-(--secondary-color)'>
                  Chưa làm
                </span>
              )}
            </div>

            {/* Title & Specs */}
            <div className='py-6'>
              <h2 className='text-xl font-extrabold tracking-tight text-(--main-color)'>
                Tự luận
              </h2>
              <div className='mt-1 text-xs font-bold text-(--secondary-color)'>
                100 câu · 80 phút
              </div>
              <p className='mt-3 text-xs leading-relaxed text-(--secondary-color)'>
                80 câu điền cách đọc Hiragana và 20 câu điền Âm Hán Việt cùng
                Nghĩa tiếng Việt.
              </p>
            </div>

            {/* Warning Rule */}
            {!isEssayDone && (
              <div className='mb-6 rounded-2xl border-2 border-amber-500/30 bg-amber-500/10 p-3.5 text-xs leading-relaxed text-amber-600 dark:text-amber-400'>
                <strong className='font-bold text-amber-700 dark:text-amber-300'>
                  Lưu ý:
                </strong>{' '}
                Bấm bắt đầu sẽ tính giờ 80 phút và không được thoát trang giữa
                chừng.
              </div>
            )}
          </div>

          {/* Action Button */}
          <div>
            {isEssayDone ? (
              <div className='w-full rounded-2xl border border-(--border-color) bg-(--background-color) py-3.5 text-center text-xs font-bold text-(--secondary-color)'>
                Đã nộp bài
              </div>
            ) : (
              <button
                type='button'
                onClick={() => handleStartPart(2)}
                className='w-full cursor-pointer rounded-2xl bg-(--main-color) py-3.5 text-center text-xs font-bold text-(--background-color) shadow-md transition-all hover:opacity-90 active:scale-95 sm:text-sm'
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
