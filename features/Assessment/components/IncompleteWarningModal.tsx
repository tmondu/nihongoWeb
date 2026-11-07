'use client';

import React from 'react';
import { useClick } from '@/shared/hooks/generic/useAudio';

interface IncompleteWarningModalProps {
  isOpen: boolean;
  onClose: () => void;
  missingQuestions: number[];
  onJumpToQuestion: (orderNum: number) => void;
}

export default function IncompleteWarningModal({
  isOpen,
  onClose,
  missingQuestions,
  onJumpToQuestion,
}: IncompleteWarningModalProps) {
  const { playClick } = useClick();

  if (!isOpen) return null;

  const handleClose = () => {
    playClick();
    onClose();
  };

  const handleJump = (num: number) => {
    playClick();
    onJumpToQuestion(num);
  };

  return (
    <div className='font-vietnamese fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-xs'>
      <div className='flex max-h-[85vh] w-full max-w-lg flex-col rounded-3xl border-2 border-(--border-color) bg-(--card-color) p-6 shadow-2xl sm:p-7'>
        <div className='mb-3 border-b-2 border-(--border-color)/60 pb-3.5'>
          <span className='rounded-full border border-red-500/30 bg-red-500/15 px-3 py-0.5 text-xs font-extrabold text-red-500'>
            Chưa hoàn thành
          </span>
          <h2 className='mt-2.5 text-lg font-extrabold text-(--main-color)'>
            Chưa hoàn thành tất cả câu hỏi
          </h2>
        </div>

        <p className='text-xs leading-relaxed text-(--secondary-color)'>
          Phần thi này còn{' '}
          <strong className='font-bold text-red-500'>
            {missingQuestions.length} câu
          </strong>{' '}
          chưa được trả lời.
        </p>

        <div className='mt-3 rounded-2xl border-2 border-amber-500/30 bg-amber-500/10 p-3.5 text-xs leading-relaxed text-amber-600 dark:text-amber-400'>
          <strong className='font-bold text-amber-700 dark:text-amber-300'>
            Quy định:
          </strong>{' '}
          Bắt buộc hoàn thành 100% câu hỏi thì hệ thống mới cho phép nộp bài.
        </div>

        {/* Missing Numbers List */}
        <div className='my-4 flex flex-col gap-2'>
          <span className='text-xs font-bold text-(--main-color)'>
            Các câu chưa làm (bấm để chuyển đến):
          </span>
          <div className='max-h-36 overflow-y-auto rounded-2xl border-2 border-(--border-color) bg-(--background-color) p-3'>
            <div className='flex flex-wrap gap-2'>
              {missingQuestions.map(num => (
                <button
                  key={num}
                  type='button'
                  onClick={() => handleJump(num)}
                  className='cursor-pointer rounded-xl border-2 border-(--border-color) bg-(--card-color) px-3 py-1 text-xs font-bold text-(--main-color) transition-all hover:border-(--main-color) active:scale-90'
                  title={`Chuyển đến câu ${num}`}
                >
                  Câu {num}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className='mt-2 flex justify-end gap-2'>
          <button
            type='button'
            onClick={handleClose}
            className='cursor-pointer rounded-2xl bg-(--main-color) px-5 py-2.5 text-xs font-bold text-(--background-color) shadow-md transition-all hover:opacity-90 active:scale-95'
          >
            Làm tiếp câu còn thiếu
          </button>
        </div>
      </div>
    </div>
  );
}
