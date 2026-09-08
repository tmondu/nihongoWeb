'use client';

import React, { useEffect } from 'react';
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
} from 'lucide-react';
import { SubmitExerciseResponse } from '@/shared/types/exercise';
import confetti from 'canvas-confetti';
import { useClick } from '@/shared/hooks/generic/useAudio';

interface ExerciseResultProps {
  result: SubmitExerciseResponse;
  exerciseTitle: string;
  onRetry: () => void;
}

/**
 * Renders passage text with highlighted placeholder badges [18], [ 19 ], [★], etc.
 */
function renderPassageWithHighlights(
  passageText: string,
  activeQuestionText?: string,
  currentIndex?: number,
) {
  if (!passageText) return null;

  const questionNumMatch = activeQuestionText?.match(
    /(?:\[|\b)(\d+|★)(?:\]|\.|\b)/,
  );
  const activeBlank = questionNumMatch
    ? questionNumMatch[1]
    : currentIndex !== undefined
      ? String(currentIndex + 1)
      : '';

  const parts = passageText.split(
    /(\[[^\]\n]*?(?:\d+|★|\*)[^\]\n]*?\]|【[^】\n]*?(?:\d+|★|\*)[^】\n]*?】)/g,
  );

  return parts.map((part, index) => {
    const match = part.match(/\[\s*(\d+|★|\*)\s*\]|【\s*(\d+|★|\*)\s*】/);
    if (match) {
      const tagContent = (match[1] || match[2] || '').trim();
      const isActive =
        activeBlank &&
        (activeBlank === tagContent || activeBlank.includes(tagContent));

      return (
        <span
          key={index}
          className={`mx-1 my-0.5 inline-flex items-center justify-center rounded-xl px-2 py-0.5 text-xs font-bold transition-all select-none ${
            isActive
              ? 'bg-(--main-color) font-black text-(--background-color) shadow-sm ring-2 ring-(--main-color)/40'
              : 'border border-(--main-color)/40 bg-(--main-color)/20 text-(--main-color)'
          }`}
        >
          [ {tagContent} ]
        </span>
      );
    }
    return <span key={index}>{part}</span>;
  });
}

export const ExerciseResult: React.FC<ExerciseResultProps> = ({
  result,
  exerciseTitle,
  onRetry,
}) => {
  const { playClick } = useClick();
  const hasPassage = result.questions_result.some(q => !!q.passage);

  useEffect(() => {
    if (result.percentage >= 70) {
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
  }, [result.percentage]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins} phút ${secs < 10 ? '0' : ''}${secs} giây`;
  };

  return (
    <div
      className={`mx-auto space-y-8 px-4 py-6 transition-all sm:px-6 lg:px-8 ${
        hasPassage ? 'max-w-5xl xl:max-w-6xl' : 'max-w-3xl'
      }`}
    >
      {/* Result Hero Header */}
      <div className='relative overflow-hidden rounded-3xl border-2 border-(--border-color) bg-(--card-color) p-8 text-center shadow-md'>
        <div className='relative z-10 space-y-4'>
          <div className='inline-flex items-center justify-center rounded-2xl border border-(--border-color) bg-(--background-color) p-3'>
            {result.passed ? (
              <Trophy className='size-10 text-(--main-color)' />
            ) : (
              <RotateCcw className='size-10 text-red-400' />
            )}
          </div>

          <div>
            <h2 className='text-2xl font-black text-(--main-color) sm:text-3xl'>
              {result.percentage >= 90
                ? 'Xuất sắc! 🎉'
                : result.passed
                  ? 'Làm tốt lắm! 👏'
                  : 'Cố gắng hơn lần sau nhé! 💪'}
            </h2>
            <p className='mt-1 text-xs text-(--secondary-color)'>
              {exerciseTitle}
            </p>
          </div>

          {/* Big Score Box */}
          <div className='inline-flex flex-col items-center justify-center rounded-3xl border border-(--border-color) bg-(--background-color) px-8 py-4'>
            <div className='text-4xl font-black text-(--main-color) sm:text-5xl'>
              {result.score}{' '}
              <span className='text-xl text-(--secondary-color)'>
                / {result.total_questions}
              </span>
            </div>
            <div
              className={`mt-1 text-sm font-bold ${
                result.passed ? 'text-(--main-color)' : 'text-red-400'
              }`}
            >
              Chính xác {result.percentage}% •{' '}
              {result.passed ? 'ĐẠT' : 'CHƯA ĐẠT'}
            </div>
          </div>

          <div className='flex items-center justify-center gap-6 pt-2 text-xs text-(--secondary-color)'>
            <span className='flex items-center gap-1.5'>
              <Clock className='size-4 text-(--main-color)' />
              Thời gian: {formatTime(result.time_spent)}
            </span>
            <span className='flex items-center gap-1.5 font-medium'>
              <CheckCircle2 className='size-4 text-(--main-color)' />
              Đúng: {result.score}
            </span>
            <span className='flex items-center gap-1.5 font-medium'>
              <XCircle className='size-4 text-red-400' />
              Sai: {result.total_questions - result.score}
            </span>
          </div>

          {/* Actions */}
          <div className='flex flex-wrap items-center justify-center gap-3 pt-4'>
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

      {/* Detailed Question Review */}
      <div className='space-y-4'>
        <h3 className='flex items-center gap-2 text-base font-bold text-(--main-color)'>
          <HelpCircle className='size-5 text-(--main-color)' />
          <span>Xem lại lời giải chi tiết</span>
        </h3>

        <div className='space-y-4'>
          {result.questions_result.map((q, idx) => (
            <div
              key={q.id || idx}
              className={`rounded-3xl border-2 bg-(--card-color) p-5 transition-all ${
                q.is_correct ? 'border-(--main-color)/50' : 'border-red-500/40'
              }`}
            >
              <div className='flex items-start justify-between gap-4'>
                <div className='space-y-1.5'>
                  <span className='inline-flex items-center gap-1.5 text-xs font-bold'>
                    {q.is_correct ? (
                      <span className='flex items-center gap-1 text-(--main-color)'>
                        <CheckCircle2 className='size-4' /> Câu {idx + 1} - Đúng
                      </span>
                    ) : (
                      <span className='flex items-center gap-1 text-red-400'>
                        <XCircle className='size-4' /> Câu {idx + 1} - Sai
                      </span>
                    )}
                  </span>

                  {q.passage && (
                    <div className='my-2 rounded-2xl border border-(--border-color) bg-(--background-color) p-3'>
                      <div className='mb-1 flex items-center gap-1.5 text-xs font-bold text-(--main-color)'>
                        <BookOpen className='size-3.5' />
                        <span>{q.passage_title || 'Bài đọc liên quan'}</span>
                      </div>
                      <div className='max-h-40 overflow-y-auto pr-1 text-xs leading-loose font-normal whitespace-pre-line text-(--secondary-color) sm:text-sm'>
                        {renderPassageWithHighlights(
                          q.passage,
                          q.question,
                          idx,
                        )}
                      </div>
                    </div>
                  )}

                  <p className='text-sm leading-relaxed font-semibold text-(--main-color)'>
                    {q.question}
                  </p>
                </div>
              </div>

              {/* Options */}
              <div className='mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2'>
                {q.options.map((opt, optIdx) => {
                  const letter = String.fromCharCode(65 + optIdx);
                  const isUserPick = q.user_answer === letter;
                  const isCorrectAnswer = q.correct_answer === letter;

                  let optClass =
                    'border-(--border-color) bg-(--background-color) text-(--secondary-color)';
                  if (isCorrectAnswer) {
                    optClass =
                      'border-(--main-color) bg-(--main-color)/15 text-(--main-color) font-bold ring-1 ring-(--main-color)/30';
                  } else if (isUserPick && !q.is_correct) {
                    optClass =
                      'border-red-500/60 bg-red-500/10 text-red-400 line-through';
                  }

                  return (
                    <div
                      key={letter}
                      className={`flex items-center gap-2.5 rounded-2xl border-2 px-3.5 py-2 text-xs ${optClass}`}
                    >
                      <span className='font-bold'>{letter}.</span>
                      <span>{opt}</span>
                    </div>
                  );
                })}
              </div>

              {/* Explanation */}
              {q.explanation && (
                <div className='mt-3.5 rounded-2xl border border-(--main-color)/30 bg-(--main-color)/5 p-3.5 text-xs leading-relaxed text-(--main-color)'>
                  <span className='font-bold'>💡 Giải thích: </span>
                  {q.explanation}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
