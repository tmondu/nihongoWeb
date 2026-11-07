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

  // Render context sentence highlighting target word
  const renderSentence = () => {
    if (!question.context_sentence) return null;
    if (!question.target_word) {
      return (
        <p className='text-base font-medium text-slate-900 sm:text-lg dark:text-slate-100'>
          {question.context_sentence}
        </p>
      );
    }

    const parts = question.context_sentence.split(question.target_word);
    if (parts.length <= 1) {
      return (
        <p className='text-base font-medium text-slate-900 sm:text-lg dark:text-slate-100'>
          {question.context_sentence}
        </p>
      );
    }

    return (
      <p className='text-base leading-relaxed font-medium text-slate-900 sm:text-lg dark:text-slate-100'>
        {parts.map((segment, idx) => (
          <React.Fragment key={idx}>
            {segment}
            {idx < parts.length - 1 && (
              <span className='font-bold text-blue-600 underline decoration-blue-600 decoration-2 underline-offset-4 dark:text-blue-400'>
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
      className='rounded-xl border border-slate-200 bg-white p-5 shadow-xs transition-colors dark:border-slate-800 dark:bg-slate-900'
    >
      {/* Header */}
      <div className='mb-3 flex items-center justify-between'>
        <span className='rounded-md bg-slate-100 px-3 py-1 text-xs font-bold text-slate-900 dark:bg-slate-800 dark:text-slate-100'>
          Câu {question.order_num}
        </span>
        {selectedAnswer ? (
          <span className='rounded bg-emerald-100 px-2.5 py-0.5 text-xs font-bold text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400'>
            Đã chọn: {selectedAnswer}
          </span>
        ) : (
          <span className='text-xs font-medium text-slate-400'>
            Chưa trả lời
          </span>
        )}
      </div>

      {/* Sentence */}
      <div className='mb-4'>{renderSentence()}</div>

      {/* 4 Options Grid */}
      <div className='grid grid-cols-1 gap-3 sm:grid-cols-2'>
        {question.options_json?.map(opt => {
          const isSelected = selectedAnswer === opt.key;
          return (
            <button
              key={opt.key}
              type='button'
              onClick={() => handleSelect(opt.key)}
              className={`flex cursor-pointer items-center gap-3 rounded-xl border-2 p-3.5 text-left transition-all ${
                isSelected
                  ? 'border-blue-600 bg-blue-600 text-white shadow-sm'
                  : 'border-slate-200 bg-white text-slate-800 hover:border-blue-400 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800/80 dark:text-slate-100 dark:hover:border-blue-500'
              }`}
            >
              <span
                className={`flex size-7 shrink-0 items-center justify-center rounded-lg text-xs font-bold ${
                  isSelected
                    ? 'bg-white text-blue-600'
                    : 'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300'
                }`}
              >
                {opt.key}
              </span>
              <span className='text-sm font-medium sm:text-base'>
                {opt.text}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
