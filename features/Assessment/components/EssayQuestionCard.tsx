'use client';

import React from 'react';
import { AssessmentQuestion } from '../types';
import { useAssessmentStore } from '../store/useAssessmentStore';

interface EssayQuestionCardProps {
  question: AssessmentQuestion;
}

export default function EssayQuestionCard({
  question,
}: EssayQuestionCardProps) {
  const { answers, setAnswer } = useAssessmentStore();
  const rawValue = answers[question.order_num];

  const isKanjiMeaningQuestion =
    question.order_num >= 181 && question.order_num <= 200;

  // For Q101-180: string
  const hiraganaValue = typeof rawValue === 'string' ? rawValue : '';

  // For Q181-200: { hanViet: string, meaning: string }
  const compositeValue =
    typeof rawValue === 'object' && rawValue !== null
      ? (rawValue as { hanViet?: string; meaning?: string })
      : { hanViet: typeof rawValue === 'string' ? rawValue : '', meaning: '' };

  const handleHiraganaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAnswer(question.order_num, e.target.value);
  };

  const handleHanVietChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAnswer(question.order_num, {
      hanViet: e.target.value,
      meaning: compositeValue.meaning || '',
    });
  };

  const handleMeaningChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAnswer(question.order_num, {
      hanViet: compositeValue.hanViet || '',
      meaning: e.target.value,
    });
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

  const isAnswered = isKanjiMeaningQuestion
    ? Boolean(compositeValue.hanViet?.trim() || compositeValue.meaning?.trim())
    : hiraganaValue.trim().length > 0;

  return (
    <div
      id={`question-${question.order_num}`}
      className='rounded-xl border border-slate-200 bg-white p-5 shadow-xs transition-colors dark:border-slate-800 dark:bg-slate-900'
    >
      {/* Question Header */}
      <div className='mb-3 flex items-center justify-between'>
        <span className='rounded-md bg-slate-100 px-3 py-1 text-xs font-bold text-slate-900 dark:bg-slate-800 dark:text-slate-100'>
          Câu {question.order_num}
        </span>
        {isAnswered ? (
          <span className='rounded bg-emerald-100 px-2.5 py-0.5 text-xs font-bold text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400'>
            Đã nhập câu trả lời
          </span>
        ) : (
          <span className='text-xs font-medium text-slate-400'>
            Chưa trả lời
          </span>
        )}
      </div>

      {isKanjiMeaningQuestion ? (
        /* Q181-200: Kanji Character + Han Viet + Meaning */
        <div className='flex flex-col gap-4'>
          <div className='flex items-center gap-4'>
            <div className='flex size-14 shrink-0 items-center justify-center rounded-xl border-2 border-slate-200 bg-slate-50 text-3xl font-bold text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white'>
              {question.kanji_char || question.target_word}
            </div>
            <div className='text-xs text-slate-600 dark:text-slate-400'>
              Viết âm Hán Việt và ý nghĩa tiếng Việt của chữ Hán trên.
            </div>
          </div>

          <div className='grid grid-cols-1 gap-3 sm:grid-cols-2'>
            <div className='flex flex-col gap-1.5'>
              <label
                htmlFor={`hanviet-${question.order_num}`}
                className='text-xs font-bold text-slate-700 dark:text-slate-300'
              >
                Âm Hán Việt
              </label>
              <input
                id={`hanviet-${question.order_num}`}
                type='text'
                value={compositeValue.hanViet || ''}
                onChange={handleHanVietChange}
                placeholder='Ví dụ: HỌC'
                className='w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm font-semibold text-slate-900 transition-colors outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 dark:border-slate-700 dark:bg-slate-800 dark:text-white'
              />
            </div>

            <div className='flex flex-col gap-1.5'>
              <label
                htmlFor={`meaning-${question.order_num}`}
                className='text-xs font-bold text-slate-700 dark:text-slate-300'
              >
                Ý nghĩa tiếng Việt
              </label>
              <input
                id={`meaning-${question.order_num}`}
                type='text'
                value={compositeValue.meaning || ''}
                onChange={handleMeaningChange}
                placeholder='Ví dụ: Học tập, trường học'
                className='w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm font-medium text-slate-900 transition-colors outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 dark:border-slate-700 dark:bg-slate-800 dark:text-white'
              />
            </div>
          </div>
        </div>
      ) : (
        /* Q101-180: Context sentence + Hiragana reading input */
        <div className='flex flex-col gap-3.5'>
          <div>{renderSentence()}</div>

          <div className='flex flex-col gap-1.5'>
            <label
              htmlFor={`hiragana-${question.order_num}`}
              className='text-xs font-semibold text-slate-600 dark:text-slate-400'
            >
              Cách đọc Hiragana cho từ{' '}
              <strong className='text-slate-900 dark:text-white'>
                {question.target_word}
              </strong>
              :
            </label>
            <input
              id={`hiragana-${question.order_num}`}
              type='text'
              value={hiraganaValue}
              onChange={handleHiraganaChange}
              placeholder='Nhập Hiragana...'
              className='max-w-md rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm font-medium text-slate-900 transition-colors outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 dark:border-slate-700 dark:bg-slate-800 dark:text-white'
            />
          </div>
        </div>
      )}
    </div>
  );
}
