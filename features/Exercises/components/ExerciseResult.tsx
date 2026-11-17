'use client';

import React, { useEffect, useMemo } from 'react';
import { Link } from '@/core/i18n/routing';
import { ArrowLeft, RotateCcw, Printer } from 'lucide-react';
import {
  PublicQuestion,
  SubmitExerciseResponse,
} from '@/shared/types/exercise';
import confetti from 'canvas-confetti';
import { useClick } from '@/shared/hooks/generic/useAudio';
import { useAdminStatus } from '@/shared/hooks/generic/useAdminStatus';
import { ExerciseA4Paper } from './ExerciseA4Paper';
import { FormattedText } from './FormattedText';

interface ExerciseResultProps {
  result: SubmitExerciseResponse;
  exerciseTitle: string;
  onRetry: () => void;
}

const formatTime = (seconds: number) => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}p ${secs < 10 ? '0' : ''}${secs}s`;
};

// Bài đã chấm: chính tờ đề, giáo viên chấm bằng mực đỏ (○ đúng, ✗ sai, khoanh đáp án đúng, ghi chú ở lề).
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
        confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } });
      } catch {
        // Ignore in environments without canvas
      }
    }
  }, [result.passed]);

  const { questions, answers } = useMemo(() => {
    const qs: PublicQuestion[] = [];
    const ans: Record<string, string> = {};
    result.questions_result.forEach((q, idx) => {
      const key = String(q.id || idx + 1);
      qs.push({
        id: q.id,
        part_name: q.part_name,
        passage_title: q.passage_title,
        passage: q.passage,
        passage_image: q.passage_image,
        question: q.question,
        question_image: q.question_image,
        options: q.options,
      });
      if (q.user_answer) ans[key] = q.user_answer.trim().toUpperCase();
    });
    return { questions: qs, answers: ans };
  }, [result.questions_result]);

  const wrongCount = result.total_questions - result.score;

  return (
    <div className='mx-auto max-w-7xl px-3 py-4 sm:px-6 sm:py-6 lg:px-8 print:max-w-none print:p-0'>
      {/* Thanh kết quả: phẳng, cùng ngôn ngữ với tờ đề */}
      <div className='paper-vi sticky top-2 z-30 mx-auto mb-6 flex max-w-[794px] items-stretch border border-[#1d1d1b] bg-[#fffdf7] text-[#1d1d1b] shadow-[0_8px_20px_-14px_rgba(60,50,30,0.55)] select-none print:hidden'>
        <Link
          href='/exercises'
          onClick={playClick}
          className='flex shrink-0 items-center gap-2 border-r border-[#1d1d1b] px-3 text-xs font-semibold transition-colors hover:bg-black/5 sm:px-4'
        >
          <ArrowLeft className='size-4' />
          <span className='hidden sm:inline'>Danh sách</span>
        </Link>

        <div className='min-w-0 flex-1 px-3 py-2 sm:px-5'>
          <h1 className='truncate text-sm font-bold sm:text-base'>
            <FormattedText text={exerciseTitle} paper />
          </h1>
          <p className='font-mono text-[11px] text-[#55524b] tabular-nums'>
            Đúng {result.score} · Sai {wrongCount} · {result.percentage}% ·{' '}
            {formatTime(result.time_spent)}
          </p>
        </div>

        <div className='flex shrink-0 items-stretch divide-x divide-[#1d1d1b] border-l border-[#1d1d1b]'>
          {isAdmin && (
            <button
              type='button'
              onClick={() => {
                playClick();
                window.print();
              }}
              className='flex items-center gap-2 px-3 text-xs font-semibold transition-colors hover:bg-black/5 sm:px-4'
              title='In kết quả / Xuất PDF (dành cho Admin)'
            >
              <Printer className='size-4' />
              <span className='hidden lg:inline'>In / Xuất PDF</span>
            </button>
          )}
          <button
            type='button'
            onClick={() => {
              playClick();
              onRetry();
            }}
            className='flex items-center gap-2 bg-[#1d1d1b] px-4 text-xs font-bold text-[#fffdf7] transition-opacity hover:opacity-90 active:translate-y-px sm:px-5'
          >
            <RotateCcw className='size-3.5' />
            <span className='hidden sm:inline'>Làm lại</span>
          </button>
        </div>
      </div>

      <ExerciseA4Paper
        title={exerciseTitle}
        totalQuestions={result.total_questions}
        questions={questions}
        answers={answers}
        results={result.questions_result}
        summary={{
          score: result.score,
          total: result.total_questions,
          passed: result.passed,
        }}
      />
    </div>
  );
};
