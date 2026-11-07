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
        <p className='text-base leading-relaxed font-medium text-slate-900 sm:text-lg dark:text-slate-100'>
          {question.context_sentence}
        </p>
      );
    }

    const parts = question.context_sentence.split(question.target_word);
    if (parts.length <= 1) {
      return (
        <p className='text-base leading-relaxed font-medium text-slate-900 sm:text-lg dark:text-slate-100'>
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
              <span className='font-bold underline decoration-slate-900 decoration-2 underline-offset-4 dark:decoration-white'>
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
      className='rounded-xl border border-slate-200 bg-white p-5 sm:p-6 dark:border-slate-800 dark:bg-slate-900'
    >
      {/* Header */}
      <div className='mb-3 flex items-center justify-between'>
        <span className='rounded bg-[#F0F0EF] px-2.5 py-0.5 text-xs font-semibold text-slate-700 dark:bg-slate-800 dark:text-slate-300'>
          Câu {question.order_num}
        </span>
        {selectedAnswer ? (
          <span className='rounded bg-[#EDF3EC] px-2.5 py-0.5 text-xs font-medium text-[#285A2C] dark:bg-emerald-950/40 dark:text-emerald-300'>
            Đã chọn: {selectedAnswer}
          </span>
        ) : (
          <span className='text-xs font-medium text-slate-400 dark:text-slate-500'>
            Chưa trả lời
          </span>
        )}
      </div>

      {/* Sentence */}
      <div className='mb-5'>{renderSentence()}</div>

      {/* 4 Options Grid */}
      <div className='grid grid-cols-1 gap-2.5 sm:grid-cols-2'>
        {question.options_json?.map(opt => {
          const isSelected = selectedAnswer === opt.key;
          return (
            <button
              key={opt.key}
              type='button'
              onClick={() => handleSelect(opt.key)}
              className={`flex cursor-pointer items-center gap-3 rounded-lg border p-3.5 text-left transition-colors active:scale-[0.99] ${
                isSelected
                  ? 'border-slate-900 bg-slate-900 text-white dark:border-white dark:bg-white dark:text-slate-900'
                  : 'border-slate-200 bg-white text-slate-800 hover:border-slate-400 hover:bg-slate-50/60 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200 dark:hover:border-slate-700'
              }`}
            >
              <span
                className={`flex size-6 shrink-0 items-center justify-center rounded text-xs font-bold ${
                  isSelected
                    ? 'bg-white/20 text-white dark:bg-slate-900/10 dark:text-slate-900'
                    : 'border border-slate-200 bg-[#FBFBFA] text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300'
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
