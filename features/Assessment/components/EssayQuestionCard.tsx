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

  const isAnswered = isKanjiMeaningQuestion
    ? Boolean(compositeValue.hanViet?.trim() || compositeValue.meaning?.trim())
    : hiraganaValue.trim().length > 0;

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
        {isAnswered ? (
          <span className='rounded bg-[#EDF3EC] px-2.5 py-0.5 text-xs font-medium text-[#285A2C] dark:bg-emerald-950/40 dark:text-emerald-300'>
            Đã nhập câu trả lời
          </span>
        ) : (
          <span className='text-xs font-medium text-slate-400 dark:text-slate-500'>
            Chưa trả lời
          </span>
        )}
      </div>

      {/* Target Word / Context Sentence */}
      <div className='mb-5'>
        {isKanjiMeaningQuestion ? (
          <div className='flex items-center gap-4'>
            <span className='flex size-14 items-center justify-center rounded-lg border border-slate-200 bg-[#FBFBFA] text-2xl font-bold text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white'>
              {question.kanji_char || question.target_word}
            </span>
            <div className='text-xs text-slate-500 dark:text-slate-400'>
              Điền âm Hán Việt và Nghĩa tiếng Việt của chữ Hán này.
            </div>
          </div>
        ) : (
          renderSentence()
        )}
      </div>

      {/* Input Fields */}
      {isKanjiMeaningQuestion ? (
        <div className='grid grid-cols-1 gap-3 sm:grid-cols-2'>
          <div>
            <label className='mb-1.5 block text-xs font-medium text-slate-600 dark:text-slate-400'>
              Âm Hán Việt
            </label>
            <input
              type='text'
              value={compositeValue.hanViet || ''}
              onChange={handleHanVietChange}
              placeholder='Ví dụ: TÂN...'
              className='w-full rounded-lg border border-slate-200 bg-[#FBFBFA] px-3.5 py-2.5 text-sm font-medium text-slate-900 transition-colors placeholder:text-slate-400 focus:border-slate-900 focus:bg-white focus:outline-hidden dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:placeholder:text-slate-500 dark:focus:border-slate-100'
            />
          </div>
          <div>
            <label className='mb-1.5 block text-xs font-medium text-slate-600 dark:text-slate-400'>
              Nghĩa tiếng Việt
            </label>
            <input
              type='text'
              value={compositeValue.meaning || ''}
              onChange={handleMeaningChange}
              placeholder='Ví dụ: Mới, mới mẻ...'
              className='w-full rounded-lg border border-slate-200 bg-[#FBFBFA] px-3.5 py-2.5 text-sm font-medium text-slate-900 transition-colors placeholder:text-slate-400 focus:border-slate-900 focus:bg-white focus:outline-hidden dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:placeholder:text-slate-500 dark:focus:border-slate-100'
            />
          </div>
        </div>
      ) : (
        <div>
          <label className='mb-1.5 block text-xs font-medium text-slate-600 dark:text-slate-400'>
            Cách đọc Hiragana
          </label>
          <input
            type='text'
            value={hiraganaValue}
            onChange={handleHiraganaChange}
            placeholder='Nhập cách đọc Hiragana...'
            className='w-full rounded-lg border border-slate-200 bg-[#FBFBFA] px-3.5 py-2.5 text-sm font-medium text-slate-900 transition-colors placeholder:text-slate-400 focus:border-slate-900 focus:bg-white focus:outline-hidden dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:placeholder:text-slate-500 dark:focus:border-slate-100'
          />
        </div>
      )}
    </div>
  );
}
