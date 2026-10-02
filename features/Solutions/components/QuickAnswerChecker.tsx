'use client';

import React from 'react';
import {
  CheckCircle,
  XCircle,
  RotateCcw,
  Printer,
  Filter,
  Award,
} from 'lucide-react';
import { SolutionExam } from '../data/solutionsData';

interface QuickAnswerCheckerProps {
  exam: SolutionExam;
  userAnswers: Record<number, string>;
  onSelectAnswer: (globalNum: number, option: string) => void;
  onClearAnswers: () => void;
  filterWrongOnly: boolean;
  onToggleFilterWrong: () => void;
  onPrint: () => void;
  isAdmin?: boolean;
}

export const QuickAnswerChecker: React.FC<QuickAnswerCheckerProps> = ({
  exam,
  userAnswers,
  onSelectAnswer,
  onClearAnswers,
  filterWrongOnly,
  onToggleFilterWrong,
  onPrint,
  isAdmin = false,
}) => {
  const totalQuestions = exam.questions.length;
  const answeredCount = Object.keys(userAnswers).length;

  let correctCount = 0;
  let wrongCount = 0;

  exam.questions.forEach(q => {
    const userAns = userAnswers[q.globalNumber];
    if (userAns) {
      if (q.correctOption.includes(userAns)) {
        correctCount++;
      } else {
        wrongCount++;
      }
    }
  });

  const percent =
    answeredCount > 0 ? Math.round((correctCount / totalQuestions) * 100) : 0;

  return (
    <div className='rounded-2xl border border-(--border-color) bg-(--card-color) p-4 shadow-xl print:hidden'>
      {/* Header Panel */}
      <div className='flex flex-wrap items-center justify-between gap-3 border-b border-(--border-color)/60 pb-3'>
        <div className='flex items-center gap-2'>
          <Award className='size-5 text-(--main-color)' />
          <h3 className='font-bold text-(--main-color)'>
            Bảng Chấm Điểm & Tự Check
          </h3>
        </div>
        <div className='flex items-center gap-2'>
          {isAdmin && (
            <button
              type='button'
              onClick={onPrint}
              className='inline-flex items-center gap-1.5 rounded-lg border border-(--border-color) bg-(--background-color) px-2.5 py-1 text-xs font-semibold text-(--main-color) transition-colors hover:border-(--main-color)'
              title='In toàn bộ đáp án A4 (Admin)'
            >
              <Printer className='size-3.5' />
              <span>In A4</span>
            </button>
          )}
          {answeredCount > 0 && (
            <button
              type='button'
              onClick={onClearAnswers}
              className='inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs text-(--secondary-color) hover:text-rose-500'
              title='Xóa hết lựa chọn để làm lại'
            >
              <RotateCcw className='size-3' />
              <span>Làm lại</span>
            </button>
          )}
        </div>
      </div>

      {/* Progress & Score Bar */}
      <div className='my-3 grid grid-cols-3 gap-2 text-center'>
        <div className='rounded-xl border border-(--border-color)/60 bg-(--background-color)/60 p-2'>
          <span className='text-[11px] text-(--secondary-color)'>Đã làm</span>
          <p className='text-base font-bold text-(--main-color)'>
            {answeredCount}/{totalQuestions}
          </p>
        </div>
        <div className='rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-2'>
          <span className='text-[11px] font-semibold text-emerald-600 dark:text-emerald-400'>
            Số câu đúng ({percent}%)
          </span>
          <p className='text-base font-black text-emerald-600 dark:text-emerald-400'>
            {correctCount}
          </p>
        </div>
        <div className='rounded-xl border border-rose-500/30 bg-rose-500/10 p-2'>
          <span className='text-[11px] font-semibold text-rose-600 dark:text-rose-400'>
            Số câu sai
          </span>
          <p className='text-base font-black text-rose-600 dark:text-rose-400'>
            {wrongCount}
          </p>
        </div>
      </div>

      {/* Filter Button */}
      {wrongCount > 0 && (
        <button
          type='button'
          onClick={onToggleFilterWrong}
          className={`mb-3 flex w-full items-center justify-center gap-2 rounded-xl py-2 text-xs font-bold transition-all ${
            filterWrongOnly
              ? 'bg-rose-600 text-white shadow-sm ring-2 ring-rose-300'
              : 'border border-rose-500/30 bg-rose-500/10 text-rose-600 hover:bg-rose-500/20 dark:text-rose-300'
          }`}
        >
          <Filter className='size-3.5' />
          <span>
            {filterWrongOnly
              ? 'Đang chỉ hiện câu sai (Bấm để xem tất cả)'
              : `Lọc xem ${wrongCount} câu làm sai`}
          </span>
        </button>
      )}

      {/* Fast Check Grid */}
      <div className='scrollbar-thin max-h-[360px] space-y-1.5 overflow-y-auto pr-1'>
        {exam.questions.map(q => {
          const userAns = userAnswers[q.globalNumber];
          const isCorrect = userAns ? q.correctOption.includes(userAns) : null;

          return (
            <div
              key={`checker-q-${q.globalNumber}`}
              className={`flex items-center justify-between rounded-lg border p-1.5 px-2 text-xs transition-colors ${
                isCorrect === true
                  ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-600 dark:text-emerald-300'
                  : isCorrect === false
                    ? 'border-rose-500/40 bg-rose-500/10 text-rose-600 dark:text-rose-300'
                    : 'border-(--border-color) bg-(--card-color) hover:bg-(--background-color)'
              }`}
            >
              <span className='font-bold text-(--main-color)'>
                {q.partId === 'vocab' ? 'Từ vựng C' : 'Ngữ pháp C'}
                {q.questionNumber}
              </span>

              {/* 4 Choices ① ② ③ ④ */}
              <div className='flex items-center gap-1'>
                {['①', '②', '③', '④'].map(opt => (
                  <button
                    key={opt}
                    type='button'
                    onClick={() => onSelectAnswer(q.globalNumber, opt)}
                    className={`font-japanese flex size-6 items-center justify-center rounded-md text-xs font-bold transition-all ${
                      userAns === opt
                        ? isCorrect
                          ? 'bg-emerald-600 text-white'
                          : 'bg-rose-600 text-white'
                        : 'border border-(--border-color) bg-(--background-color) text-(--secondary-color) hover:border-(--main-color) hover:text-(--main-color)'
                    }`}
                  >
                    {opt}
                  </button>
                ))}
              </div>

              {/* Feedback indicator */}
              <div className='w-5 text-center'>
                {isCorrect === true && (
                  <CheckCircle className='size-4 text-emerald-600 dark:text-emerald-400' />
                )}
                {isCorrect === false && (
                  <XCircle className='size-4 text-rose-600 dark:text-rose-400' />
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default QuickAnswerChecker;
