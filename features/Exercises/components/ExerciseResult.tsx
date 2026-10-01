'use client';

import React, { useEffect, useState } from 'react';
import { Link } from '@/core/i18n/routing';
import {
  Trophy,
  CheckCircle2,
  XCircle,
  RotateCcw,
  ArrowLeft,
  Clock,
  HelpCircle,
  BookOpen,
  ChevronDown,
  ChevronUp,
  ImageIcon,
  Maximize2,
  X,
  Printer,
} from 'lucide-react';
import {
  SubmitExerciseResponse,
  QuestionResultItem,
} from '@/shared/types/exercise';
import confetti from 'canvas-confetti';
import { useClick } from '@/shared/hooks/generic/useAudio';
import { useAdminStatus } from '@/shared/hooks/generic/useAdminStatus';
import { FormattedText } from './FormattedText';
import { ExerciseWatermark } from './ExerciseWatermark';

interface ExerciseResultProps {
  result: SubmitExerciseResponse;
  exerciseTitle: string;
  onRetry: () => void;
}

const CIRCLE_OPTIONS = ['①', '②', '③', '④', '⑤', '⑥'];

interface ReviewQuestionCardProps {
  question: QuestionResultItem;
  index: number;
}

const ReviewQuestionCard: React.FC<ReviewQuestionCardProps> = ({
  question: q,
  index: idx,
}) => {
  const [showPassage, setShowPassage] = useState(false);
  const [isZoomed, setIsZoomed] = useState(false);

  return (
    <div
      className={`rounded-3xl border-2 bg-(--card-color) p-5 transition-all print:border print:border-neutral-300 print:bg-white print:p-3.5 print:text-black ${
        q.is_correct
          ? 'border-(--main-color)/50'
          : 'border-red-500/40 print:border-red-300'
      }`}
      style={{ breakInside: 'avoid', pageBreakInside: 'avoid' }}
    >
      {/* Question Review Header with Collapsible Passage Toggle */}
      <div className='flex items-center justify-between gap-3 border-b border-(--border-color)/50 pb-3 print:border-neutral-200 print:pb-2'>
        <div className='flex items-center gap-2'>
          {q.part_name && (
            <span className='rounded-md border border-amber-500/30 bg-amber-500/10 px-2 py-0.5 text-[11px] font-bold text-amber-500 print:border-neutral-400 print:bg-neutral-100 print:text-neutral-800'>
              {q.part_name}
            </span>
          )}
          <span className='inline-flex items-center gap-1.5 text-xs font-bold'>
            {q.is_correct ? (
              <span className='flex items-center gap-1 text-(--main-color) print:text-emerald-700'>
                <CheckCircle2 className='size-4' /> Câu {idx + 1} - Đúng
              </span>
            ) : (
              <span className='flex items-center gap-1 text-red-400 print:text-red-600'>
                <XCircle className='size-4' /> Câu {idx + 1} - Sai
              </span>
            )}
          </span>
        </div>

        {q.passage && (
          <button
            type='button'
            onClick={() => setShowPassage(!showPassage)}
            className='inline-flex cursor-pointer items-center gap-1.5 rounded-xl border border-(--border-color) bg-(--background-color) px-3 py-1 text-xs font-semibold text-(--secondary-color) transition-all select-none hover:border-(--main-color) hover:text-(--main-color) print:hidden'
          >
            <BookOpen className='size-3.5 text-(--main-color)' />
            <span>{showPassage ? 'Ẩn bài đọc' : 'Xem bài đọc'}</span>
            {showPassage ? (
              <ChevronUp className='size-3.5' />
            ) : (
              <ChevronDown className='size-3.5' />
            )}
          </button>
        )}
      </div>

      {/* Collapsible Passage Box */}
      {q.passage && (showPassage || true) && (
        <div
          className={`my-3.5 rounded-2xl border border-(--border-color) bg-(--background-color) p-3.5 transition-all print:border-neutral-200 print:bg-neutral-50 print:p-2.5 ${
            !showPassage ? 'hidden print:block' : 'block'
          }`}
        >
          <div className='mb-1.5 flex items-center gap-1.5 text-xs font-bold text-(--main-color) print:text-black'>
            <BookOpen className='size-3.5' />
            <span>{q.passage_title || 'Bài đọc liên quan'}</span>
          </div>
          <div className='max-h-48 overflow-y-auto pr-1 text-xs leading-loose font-normal whitespace-pre-line text-(--secondary-color) sm:text-sm print:max-h-none print:text-xs print:text-neutral-800'>
            <FormattedText text={q.passage} highlightBlank={String(idx + 1)} />
          </div>
        </div>
      )}

      <div className='mt-3.5 print:mt-2'>
        <p className='text-sm leading-relaxed font-semibold text-(--main-color) sm:text-base print:text-xs print:text-black'>
          <FormattedText text={q.question} />
        </p>
      </div>

      {/* Options */}
      <div className='mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-4 print:mt-2 print:grid-cols-4 print:gap-1.5'>
        {q.options.map((opt, optIdx) => {
          const letter = String.fromCharCode(65 + optIdx);
          const circleDigit = CIRCLE_OPTIONS[optIdx] || `(${optIdx + 1})`;
          const isUserPick = q.user_answer === letter;
          const isCorrectAnswer = q.correct_answer === letter;

          let optClass =
            'border-(--border-color) bg-(--background-color) text-(--secondary-color) print:border-neutral-200 print:text-neutral-700';
          if (isCorrectAnswer) {
            optClass =
              'border-(--main-color) bg-(--main-color)/15 text-(--main-color) font-bold ring-1 ring-(--main-color)/30 print:border-emerald-600 print:bg-emerald-50 print:text-emerald-900';
          } else if (isUserPick && !q.is_correct) {
            optClass =
              'border-red-500/60 bg-red-500/10 text-red-400 line-through print:border-red-400 print:bg-red-50 print:text-red-700';
          }

          return (
            <div
              key={letter}
              className={`flex items-center gap-2 rounded-2xl border-2 px-3 py-2 text-xs print:rounded-lg print:border print:px-2 print:py-1 print:text-[11px] ${optClass}`}
            >
              <span className='font-bold'>{circleDigit}</span>
              <span className='font-mixed truncate'>
                <FormattedText text={opt} />
              </span>
            </div>
          );
        })}
      </div>

      {/* Explanation & Image */}
      {(q.explanation || q.explanation_image) && (
        <div className='mt-3.5 space-y-2.5 rounded-2xl border border-(--main-color)/30 bg-(--main-color)/5 p-3.5 text-xs leading-relaxed text-(--main-color) print:border-neutral-300 print:bg-neutral-50 print:p-2.5 print:text-neutral-900'>
          {q.explanation && (
            <div className='font-mixed'>
              <span className='font-bold'>💡 Lời giải chi tiết: </span>
              <FormattedText text={q.explanation} />
            </div>
          )}
          {q.explanation_image && (
            <div className='pt-1'>
              <div className='mb-1.5 flex items-center gap-1.5 text-[11px] font-semibold text-(--secondary-color) print:text-neutral-700'>
                <ImageIcon className='size-3.5 text-(--main-color)' />
                <span>Ảnh giải thích đáp án:</span>
              </div>
              <div className='group relative inline-block overflow-hidden rounded-xl border border-(--border-color) bg-black/20 print:border-neutral-300'>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={q.explanation_image}
                  alt={`Ảnh giải thích câu ${idx + 1}`}
                  className='max-h-72 w-auto max-w-full cursor-pointer object-contain transition-transform duration-200 hover:scale-[1.01] print:max-h-48'
                  onClick={() => setIsZoomed(true)}
                  loading='lazy'
                />
                <button
                  type='button'
                  onClick={() => setIsZoomed(true)}
                  className='absolute right-2 bottom-2 inline-flex items-center gap-1 rounded-lg bg-black/75 px-2 py-1 text-[11px] font-medium text-white backdrop-blur-xs transition-opacity hover:bg-black print:hidden'
                >
                  <Maximize2 className='size-3' />
                  <span>Phóng to</span>
                </button>
              </div>

              {/* Lightbox Zoom Modal */}
              {isZoomed && (
                <div
                  className='fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 backdrop-blur-xs print:hidden'
                  onClick={() => setIsZoomed(false)}
                >
                  <div
                    className='relative max-h-[90vh] max-w-4xl overflow-auto rounded-2xl bg-neutral-900 p-2 shadow-2xl'
                    onClick={e => e.stopPropagation()}
                  >
                    <button
                      type='button'
                      onClick={() => setIsZoomed(false)}
                      className='absolute top-3 right-3 z-10 flex size-8 items-center justify-center rounded-full bg-black/70 text-white transition-transform hover:scale-110'
                      aria-label='Đóng'
                    >
                      <X className='size-5' />
                    </button>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={q.explanation_image}
                      alt={`Ảnh giải thích câu ${idx + 1}`}
                      className='h-auto max-h-[85vh] w-auto max-w-full rounded-xl object-contain'
                    />
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export const ExerciseResult: React.FC<ExerciseResultProps> = ({
  result,
  exerciseTitle,
  onRetry,
}) => {
  const { playClick } = useClick();
  const { isAdmin } = useAdminStatus();

  useEffect(() => {
    if (result.passed) {
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
        });
      } catch {
        // Ignore in environments without canvas
      }
    }
  }, [result.passed]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}p ${secs < 10 ? '0' : ''}${secs}s`;
  };

  const handlePrint = () => {
    if (!isAdmin) return;
    playClick();
    window.print();
  };

  return (
    <div className='relative mx-auto max-w-4xl space-y-8 px-4 py-6 sm:py-8 print:max-w-none print:px-0 print:py-0'>
      {/* Background Watermark */}
      <ExerciseWatermark text='結果' subText='Bảng Kết Quả - Phan Thắm SS' />

      {/* Top Banner Card */}
      <div className='relative overflow-hidden rounded-3xl border-2 border-(--border-color) bg-(--card-color) p-6 text-center shadow-lg sm:p-8 print:rounded-none print:border-b-2 print:border-neutral-900 print:bg-white print:p-4 print:shadow-none'>
        <div className='relative z-10 space-y-4 print:space-y-2'>
          <div className='inline-flex size-16 items-center justify-center rounded-2xl bg-(--main-color)/15 text-(--main-color) shadow-sm print:hidden'>
            <Trophy className='size-8' />
          </div>

          <div className='space-y-1'>
            <span className='text-xs font-semibold tracking-wider text-(--secondary-color) uppercase print:text-neutral-600'>
              Kết quả bài luyện tập
            </span>
            <h1 className='text-xl font-black text-(--main-color) sm:text-2xl print:text-2xl print:text-black'>
              {exerciseTitle}
            </h1>
          </div>

          <div className='py-2 print:py-1'>
            <div className='text-4xl font-black text-(--main-color) sm:text-5xl print:text-3xl print:text-black'>
              {result.score} / {result.total_questions}
            </div>
            <div
              className={`mt-1 text-sm font-bold ${
                result.passed
                  ? 'text-(--main-color) print:text-emerald-700'
                  : 'text-red-400 print:text-red-700'
              }`}
            >
              Chính xác {result.percentage}% •{' '}
              {result.passed ? 'ĐẠT YÊU CẦU' : 'CHƯA ĐẠT'}
            </div>
          </div>

          <div className='flex items-center justify-center gap-6 pt-2 text-xs text-(--secondary-color) print:text-neutral-800'>
            <span className='flex items-center gap-1.5'>
              <Clock className='size-4 text-(--main-color) print:text-black' />
              Thời gian: {formatTime(result.time_spent)}
            </span>
            <span className='flex items-center gap-1.5 font-medium'>
              <CheckCircle2 className='size-4 text-(--main-color) print:text-emerald-700' />
              {result.score} Đúng
            </span>
            <span className='flex items-center gap-1.5 font-medium'>
              <XCircle className='size-4 text-red-400 print:text-red-700' />
              {result.total_questions - result.score} Sai
            </span>
          </div>

          {/* Action Buttons */}
          <div className='flex flex-wrap items-center justify-center gap-3 pt-4 print:hidden'>
            {isAdmin && (
              <button
                type='button'
                onClick={handlePrint}
                className='inline-flex items-center gap-2 rounded-2xl border border-(--border-color) bg-(--background-color) px-5 py-2.5 text-xs font-bold text-(--main-color) shadow-xs transition-all hover:border-(--main-color) hover:bg-(--main-color)/10 active:scale-95'
              >
                <Printer className='size-4 text-blue-500' />
                <span>In kết quả / Xuất PDF (Admin)</span>
              </button>
            )}
            <button
              type='button'
              onClick={() => {
                playClick();
                onRetry();
              }}
              className='inline-flex items-center gap-2 rounded-2xl bg-(--main-color) px-5 py-2.5 text-xs font-bold text-(--background-color) shadow-md transition-all hover:opacity-90 active:scale-95'
            >
              <RotateCcw className='size-4' />
              <span>Làm lại bài này</span>
            </button>
            <Link
              href='/exercises'
              onClick={playClick}
              className='inline-flex items-center gap-2 rounded-2xl border border-(--border-color) bg-(--background-color) px-5 py-2.5 text-xs font-semibold text-(--secondary-color) transition-all hover:border-(--main-color) hover:text-(--main-color)'
            >
              <ArrowLeft className='size-4' />
              <span>Danh sách bài tập</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Detailed Question Review List */}
      <div className='space-y-4 print:space-y-3'>
        <div className='flex items-center justify-between border-b border-(--border-color)/60 pb-3 print:border-neutral-300'>
          <h2 className='flex items-center gap-2 text-base font-bold text-(--main-color) print:text-black'>
            <HelpCircle className='size-5 text-(--main-color) print:text-black' />
            <span>Xem lại lời giải chi tiết từng câu</span>
          </h2>
          <span className='text-xs text-(--secondary-color) print:text-neutral-600'>
            Tổng số: {result.total_questions} câu
          </span>
        </div>

        <div className='space-y-4 print:space-y-3'>
          {result.questions_result.map((q, idx) => (
            <ReviewQuestionCard key={q.id || idx} question={q} index={idx} />
          ))}
        </div>
      </div>

      {/* Print Footer */}
      <div className='hidden items-center justify-between border-t border-neutral-300 pt-4 text-xs text-neutral-600 print:flex'>
        <span>Trang kết quả bài luyện tập tiếng Nhật</span>
        <div className='inline-flex items-center rounded-lg bg-[#0070c0] px-3 py-1 text-[11px] font-bold text-white'>
          Tài liệu được biên soạn bởi Phan Thắm SS
        </div>
      </div>
    </div>
  );
};
