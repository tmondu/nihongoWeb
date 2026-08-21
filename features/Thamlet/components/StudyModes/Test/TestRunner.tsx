'use client';

import React, { useState } from 'react';
import { Deck, FlashCard } from '../../../types';
import {
  ArrowLeft,
  RotateCcw,
  CheckCircle2,
  XCircle,
  Trophy,
  FileCheck2,
} from 'lucide-react';
import { Link } from '@/core/i18n/routing';
import { useClick } from '@/shared/hooks/generic/useAudio';
import clsx from 'clsx';

interface TestQuestion {
  card: FlashCard;
  prompt: string;
  correctAnswer: string;
  options: string[];
}

function generateTestQuestions(cards: FlashCard[]): TestQuestion[] {
  return cards.map(card => {
    const correctAnswer = card.definition;
    const otherDefs = cards
      .filter(c => c.id !== card.id)
      .map(c => c.definition);

    const shuffledOthers = [...otherDefs].sort(() => Math.random() - 0.5);
    const wrongOptions = shuffledOthers.slice(0, 3);
    const options = [correctAnswer, ...wrongOptions].sort(
      () => Math.random() - 0.5,
    );

    return {
      card,
      prompt: card.term,
      correctAnswer,
      options,
    };
  });
}

interface TestRunnerProps {
  deck: Deck;
}

export const TestRunner: React.FC<TestRunnerProps> = ({ deck }) => {
  const { playClick } = useClick();

  // Tạo danh sách câu hỏi trắc nghiệm
  const [questions] = useState<TestQuestion[]>(() =>
    generateTestQuestions(deck.cards),
  );

  const [userAnswers, setUserAnswers] = useState<Record<number, string>>({});
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSelectAnswer = (qIndex: number, answer: string) => {
    if (isSubmitted) return;
    playClick();
    setUserAnswers(prev => ({
      ...prev,
      [qIndex]: answer,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (Object.keys(userAnswers).length < questions.length) {
      if (
        !confirm(
          `Bạn mới trả lời ${Object.keys(userAnswers).length}/${questions.length} câu. Bạn có chắc muốn nộp bài ngay?`,
        )
      ) {
        return;
      }
    }

    playClick();
    setIsSubmitted(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleRetake = () => {
    playClick();
    setUserAnswers({});
    setIsSubmitted(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Tính điểm
  const correctAnswersCount = questions.filter(
    (q, idx) => userAnswers[idx] === q.correctAnswer,
  ).length;
  const scorePercent =
    questions.length > 0
      ? Math.round((correctAnswersCount / questions.length) * 100)
      : 0;

  return (
    <div className='mx-auto max-w-2xl space-y-6 px-4 py-8'>
      {/* Top bar */}
      <div className='flex items-center justify-between border-b border-(--border-color) pb-4'>
        <Link
          href={`/thamlet/${deck.id}`}
          onClick={playClick}
          className='inline-flex items-center gap-2 rounded-2xl border border-(--border-color) bg-(--card-color) px-4 py-2 text-xs font-semibold text-(--secondary-color) hover:text-(--main-color)'
        >
          <ArrowLeft className='size-3.5' />
          Thoát bài thi
        </Link>

        <div className='flex items-center gap-1.5 text-sm font-bold text-(--main-color)'>
          <FileCheck2 className='size-4' />
          <span>Bài kiểm tra: {deck.title}</span>
        </div>
      </div>

      {/* Kết quả sau khi nộp bài */}
      {isSubmitted && (
        <div className='space-y-4 rounded-3xl border-2 border-(--main-color) bg-(--card-color) p-8 text-center shadow-xl'>
          <div className='mx-auto flex size-16 items-center justify-center rounded-3xl bg-(--main-color)/15 text-(--main-color)'>
            <Trophy className='size-8' />
          </div>

          <h2 className='text-3xl font-black text-(--main-color)'>
            Kết quả: {scorePercent}%
          </h2>
          <p className='text-sm text-(--secondary-color)'>
            Bạn đã trả lời đúng{' '}
            <span className='font-bold text-(--main-color)'>
              {correctAnswersCount}
            </span>{' '}
            trên tổng số{' '}
            <span className='font-bold text-(--main-color)'>
              {questions.length}
            </span>{' '}
            câu hỏi.
          </p>

          <div className='flex items-center justify-center gap-3 pt-2'>
            <button
              type='button'
              onClick={handleRetake}
              className='inline-flex items-center gap-2 rounded-2xl bg-(--main-color) px-6 py-2.5 text-sm font-bold text-(--background-color) shadow-md transition-all hover:opacity-90 active:scale-95'
            >
              <RotateCcw className='size-4' />
              Làm lại bài thi
            </button>
          </div>
        </div>
      )}

      {/* Danh sách câu hỏi */}
      <form onSubmit={handleSubmit} className='space-y-6'>
        {questions.map((q, qIndex) => {
          const userAnswer = userAnswers[qIndex];
          const isCorrect = isSubmitted && userAnswer === q.correctAnswer;

          return (
            <div
              key={qIndex}
              className={clsx(
                'space-y-4 rounded-3xl border-2 p-6 shadow-sm transition-all',
                isSubmitted
                  ? isCorrect
                    ? 'border-emerald-500/60 bg-emerald-500/5'
                    : 'border-red-500/60 bg-red-500/5'
                  : 'border-(--border-color) bg-(--card-color)',
              )}
            >
              {/* Question Header */}
              <div className='flex items-center justify-between text-xs text-(--secondary-color)'>
                <span className='font-bold'>Câu hỏi {qIndex + 1}</span>
                {isSubmitted && (
                  <span
                    className={clsx(
                      'font-bold',
                      isCorrect ? 'text-emerald-500' : 'text-red-500',
                    )}
                  >
                    {isCorrect ? 'Đúng (+1đ)' : 'Sai (0đ)'}
                  </span>
                )}
              </div>

              {/* Term */}
              <div>
                <h3 className='text-2xl font-black text-(--main-color)'>
                  {q.prompt}
                </h3>
                {q.card.reading && (
                  <p className='mt-0.5 text-xs text-(--secondary-color)'>
                    [{q.card.reading}]
                  </p>
                )}
              </div>

              {/* Options */}
              <div className='grid grid-cols-1 gap-2.5 sm:grid-cols-2'>
                {q.options.map((opt, optIndex) => {
                  const isOptionSelected = userAnswer === opt;
                  const isThisCorrect = opt === q.correctAnswer;

                  let optClass =
                    'border border-(--border-color) bg-(--background-color) text-(--main-color) hover:border-(--main-color)';

                  if (isOptionSelected) {
                    optClass =
                      'border-2 border-(--main-color) bg-(--main-color)/15 text-(--main-color) font-bold';
                  }

                  if (isSubmitted) {
                    if (isThisCorrect) {
                      optClass =
                        'border-2 border-emerald-500 bg-emerald-500/20 text-emerald-500 font-bold';
                    } else if (isOptionSelected && !isThisCorrect) {
                      optClass =
                        'border-2 border-red-500 bg-red-500/20 text-red-500 font-bold';
                    } else {
                      optClass =
                        'border border-(--border-color) bg-(--background-color)/40 text-(--secondary-color) opacity-50';
                    }
                  }

                  return (
                    <button
                      key={optIndex}
                      type='button'
                      disabled={isSubmitted}
                      onClick={() => handleSelectAnswer(qIndex, opt)}
                      className={clsx(
                        'flex items-center justify-between rounded-2xl p-3.5 text-left text-sm transition-all',
                        'active:scale-98',
                        optClass,
                      )}
                    >
                      <span>{opt}</span>
                      {isSubmitted && isThisCorrect && (
                        <CheckCircle2 className='size-4 shrink-0 text-emerald-500' />
                      )}
                      {isSubmitted && isOptionSelected && !isThisCorrect && (
                        <XCircle className='size-4 shrink-0 text-red-500' />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}

        {/* Submit button */}
        {!isSubmitted && (
          <div className='flex justify-center pt-4'>
            <button
              type='submit'
              className='inline-flex items-center gap-2 rounded-2xl bg-(--main-color) px-10 py-3.5 text-base font-bold text-(--background-color) shadow-xl transition-all hover:opacity-90 active:scale-95'
            >
              <FileCheck2 className='size-5' />
              <span>Nộp bài kiểm tra</span>
            </button>
          </div>
        )}
      </form>
    </div>
  );
};
