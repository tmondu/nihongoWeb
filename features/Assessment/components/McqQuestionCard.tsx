'use client';

import React from 'react';
import { AssessmentQuestion } from '../types';
import { useAssessmentStore } from '../store/useAssessmentStore';

interface McqQuestionCardProps {
  question: AssessmentQuestion;
}

export default function McqQuestionCard({ question }: McqQuestionCardProps) {
  const { answers, setAnswer } = useAssessmentStore();
  const selectedAnswer = answers[question.order_num] as string | undefined;

  const handleSelect = (key: 'A' | 'B' | 'C' | 'D') => {
    setAnswer(question.order_num, key);
  };

  // Render context sentence highlighting target word if provided
  const renderSentence = () => {
    if (!question.context_sentence) return null;
    if (!question.target_word) {
      return (
        <p className='text-foreground text-base sm:text-lg'>
          {question.context_sentence}
        </p>
      );
    }

    const parts = question.context_sentence.split(question.target_word);
    if (parts.length <= 1) {
      return (
        <p className='text-foreground text-base sm:text-lg'>
          {question.context_sentence}
        </p>
      );
    }

    return (
      <p className='text-foreground text-base leading-relaxed sm:text-lg'>
        {parts.map((segment, idx) => (
          <React.Fragment key={idx}>
            {segment}
            {idx < parts.length - 1 && (
              <span className='font-bold underline decoration-blue-600 decoration-2 underline-offset-4'>
                {question.target_word}
              </span>
            )}
          </React.Fragment>
        ))}
      </p>
    );
  };

  return (
    <div
      id={`question-${question.order_num}`}
      className='border-border/70 bg-card rounded-xl border p-4 shadow-xs sm:p-5'
    >
      {/* Question Header */}
      <div className='mb-3 flex items-center justify-between'>
        <span className='bg-muted text-foreground rounded-md px-2.5 py-1 text-xs font-bold'>
          Câu {question.order_num}
        </span>
        {selectedAnswer ? (
          <span className='text-[11px] font-semibold text-emerald-600 dark:text-emerald-400'>
            Đã chọn: {selectedAnswer}
          </span>
        ) : (
          <span className='text-muted-foreground text-[11px] font-medium'>
            Chưa trả lời
          </span>
        )}
      </div>

      {/* Question Content */}
      <div className='mb-4'>{renderSentence()}</div>

      {/* 4 Options */}
      <div className='grid grid-cols-1 gap-2.5 sm:grid-cols-2'>
        {question.options_json?.map(opt => {
          const isSelected = selectedAnswer === opt.key;
          return (
            <button
              key={opt.key}
              type='button'
              onClick={() => handleSelect(opt.key)}
              className={`flex items-center gap-3 rounded-lg border p-3 text-left transition-all ${
                isSelected
                  ? 'border-blue-600 bg-blue-50/70 font-semibold text-blue-900 shadow-xs dark:bg-blue-950/40 dark:text-blue-100'
                  : 'border-border/60 hover:bg-muted/50 text-foreground'
              }`}
            >
              <span
                className={`flex size-6 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                  isSelected
                    ? 'bg-blue-600 text-white'
                    : 'bg-muted text-muted-foreground'
                }`}
              >
                {opt.key}
              </span>
              <span className='text-sm sm:text-base'>{opt.text}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
