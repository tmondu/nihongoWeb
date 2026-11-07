'use client';

import React from 'react';
import {
  AssessmentQuestion,
  ShuffledAssessmentQuestion,
  ShuffledMcqOption,
} from '../types';
import { useAssessmentStore } from '../store/useAssessmentStore';
import { useClick } from '@/shared/hooks/generic/useAudio';

interface McqQuestionCardProps {
  question: AssessmentQuestion | ShuffledAssessmentQuestion;
  displayIndex?: number;
}

function hasVietnamese(text?: string | null): boolean {
  if (!text) return false;
  return /[àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđĐ]/i.test(
    text,
  );
}

export default function McqQuestionCard({
  question,
  displayIndex,
}: McqQuestionCardProps) {
  const { answers, setAnswer } = useAssessmentStore();
  const { playClick } = useClick();
  const selectedAnswer = answers[question.order_num] as string | undefined;

  // Normalize options to support both regular and shuffled structures
  const options = (question.options_json || []).map(opt => {
    const isShuffled = 'displayKey' in opt;
    const displayKey = isShuffled
      ? (opt as ShuffledMcqOption).displayKey
      : opt.key;
    const originalKey = isShuffled
      ? (opt as ShuffledMcqOption).originalKey
      : opt.key;
    return {
      displayKey,
      originalKey,
      text: opt.text,
    };
  });

  const selectedOption = options.find(
    opt => opt.originalKey === selectedAnswer,
  );
  const selectedDisplayKey = selectedOption?.displayKey;

  const handleSelect = (originalKey: 'A' | 'B' | 'C' | 'D') => {
    playClick();
    setAnswer(question.order_num, originalKey);
  };

  // Render context sentence highlighting target word
  const renderSentence = () => {
    if (!question.context_sentence) return null;

    const sentenceContainsVi = hasVietnamese(question.context_sentence);
    const fontClass = sentenceContainsVi ? 'font-mixed' : 'font-japanese';
    const langAttr = sentenceContainsVi ? undefined : 'ja';

    if (!question.target_word) {
      return (
        <p
          className={`${fontClass} text-lg leading-relaxed font-bold tracking-wide text-(--main-color) sm:text-xl`}
          lang={langAttr}
        >
          {question.context_sentence}
        </p>
      );
    }

    const parts = question.context_sentence.split(question.target_word);
    if (parts.length <= 1) {
      return (
        <p
          className={`${fontClass} text-lg leading-relaxed font-bold tracking-wide text-(--main-color) sm:text-xl`}
          lang={langAttr}
        >
          {question.context_sentence}
        </p>
      );
    }

    return (
      <p
        className={`${fontClass} text-lg leading-relaxed font-bold tracking-wide text-(--main-color) sm:text-xl`}
        lang={langAttr}
      >
        {parts.map((segment, idx) => (
          <React.Fragment key={idx}>
            {segment}
            {idx < parts.length - 1 && (
              <span className='font-bold underline decoration-(--main-color) decoration-2 underline-offset-4'>
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
      className='font-vietnamese rounded-3xl border-2 border-(--border-color) bg-(--card-color) p-5 shadow-xs transition-colors sm:p-6'
    >
      {/* Header */}
      <div className='mb-3.5 flex items-center justify-between'>
        <span className='rounded-full bg-(--main-color)/15 px-3 py-0.5 text-xs font-extrabold text-(--main-color)'>
          Câu {displayIndex ?? question.order_num}
        </span>
        {selectedDisplayKey ? (
          <span className='rounded-full border border-green-500/30 bg-green-500/15 px-3 py-0.5 text-xs font-bold text-green-600 dark:text-green-400'>
            Đã chọn: {selectedDisplayKey}
          </span>
        ) : (
          <span className='text-xs font-medium text-(--secondary-color)'>
            Chưa trả lời
          </span>
        )}
      </div>

      {/* Sentence */}
      <div className='mb-5'>{renderSentence()}</div>

      {/* 4 Options Grid */}
      <div className='grid grid-cols-1 gap-3 sm:grid-cols-2'>
        {options.map(opt => {
          const isSelected = selectedAnswer === opt.originalKey;
          const optContainsVi = hasVietnamese(opt.text);
          const optionFontClass = optContainsVi
            ? 'font-vietnamese'
            : 'font-japanese';
          const optionLang = optContainsVi ? undefined : 'ja';

          return (
            <button
              key={opt.displayKey}
              type='button'
              onClick={() => handleSelect(opt.originalKey)}
              className={`group flex cursor-pointer items-center gap-3.5 rounded-2xl border-2 p-3.5 text-left transition-all select-none active:scale-[0.99] ${
                isSelected
                  ? 'border-(--main-color) bg-(--main-color)/15 text-(--main-color) shadow-sm'
                  : 'border-(--border-color) bg-(--background-color) text-(--secondary-color) hover:border-(--main-color)/60'
              }`}
            >
              <span
                className={`flex size-8 shrink-0 items-center justify-center rounded-xl text-xs font-bold transition-all ${
                  isSelected
                    ? 'bg-(--main-color) text-(--background-color) shadow-xs'
                    : 'border border-(--border-color) bg-(--card-color) text-(--secondary-color) group-hover:text-(--main-color)'
                }`}
              >
                {opt.displayKey}
              </span>
              <span
                className={`${optionFontClass} text-sm leading-relaxed font-medium sm:text-base ${
                  isSelected
                    ? 'font-bold text-(--main-color)'
                    : 'text-(--secondary-color) group-hover:text-(--main-color)'
                }`}
                lang={optionLang}
              >
                {opt.text}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
