'use client';

import React from 'react';
import { AssessmentQuestion, ShuffledAssessmentQuestion } from '../types';
import { useAssessmentStore } from '../store/useAssessmentStore';

interface EssayQuestionCardProps {
  question: AssessmentQuestion | ShuffledAssessmentQuestion;
}

function hasVietnamese(text?: string | null): boolean {
  if (!text) return false;
  return /[àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđĐ]/i.test(
    text,
  );
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

  // Keyboard navigation on Enter for smooth auto-jump
  const handleKeyDownHiragana = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const nextNum = question.order_num + 1;
      if (nextNum <= 180) {
        const nextInput = document.getElementById(`essay-input-${nextNum}`);
        nextInput?.focus();
        document
          .getElementById(`question-${nextNum}`)
          ?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      } else if (nextNum === 181) {
        const nextInput = document.getElementById('essay-hanviet-181');
        nextInput?.focus();
        document
          .getElementById('question-181')
          ?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  };

  const handleKeyDownHanViet = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      // Jump to meaning input of the same question
      const meaningInput = document.getElementById(
        `essay-meaning-${question.order_num}`,
      );
      meaningInput?.focus();
    }
  };

  const handleKeyDownMeaning = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const nextNum = question.order_num + 1;
      if (nextNum <= 200) {
        const nextInput = document.getElementById(`essay-hanviet-${nextNum}`);
        nextInput?.focus();
        document
          .getElementById(`question-${nextNum}`)
          ?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      } else {
        // Last question: dismiss keyboard
        e.currentTarget.blur();
      }
    }
  };

  // Render context sentence
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

  const isAnswered = isKanjiMeaningQuestion
    ? Boolean(compositeValue.hanViet?.trim() || compositeValue.meaning?.trim())
    : hiraganaValue.trim().length > 0;

  return (
    <div
      id={`question-${question.order_num}`}
      className='font-vietnamese rounded-3xl border-2 border-(--border-color) bg-(--card-color) p-5 shadow-xs transition-colors sm:p-6'
    >
      {/* Header */}
      <div className='mb-3.5 flex items-center justify-between'>
        <span className='rounded-full bg-(--main-color)/15 px-3 py-0.5 text-xs font-extrabold text-(--main-color)'>
          Câu {question.order_num}
        </span>
        {isAnswered ? (
          <span className='rounded-full border border-green-500/30 bg-green-500/15 px-3 py-0.5 text-xs font-bold text-green-600 dark:text-green-400'>
            Đã nhập câu trả lời
          </span>
        ) : (
          <span className='text-xs font-medium text-(--secondary-color)'>
            Chưa trả lời
          </span>
        )}
      </div>

      {/* Target Word / Context Sentence */}
      <div className='mb-5'>
        {isKanjiMeaningQuestion ? (
          <div className='flex items-center gap-4'>
            <span
              className='font-japanese flex size-16 items-center justify-center rounded-2xl border-2 border-(--border-color) bg-(--background-color) text-3xl font-extrabold text-(--main-color) shadow-inner'
              lang='ja'
            >
              {question.kanji_char || question.target_word}
            </span>
            <div className='font-vietnamese text-xs leading-relaxed text-(--secondary-color)'>
              Điền âm Hán Việt và Nghĩa tiếng Việt của chữ Hán này. Bấm Enter để
              chuyển ô tiếp theo.
            </div>
          </div>
        ) : (
          renderSentence()
        )}
      </div>

      {/* Input Fields */}
      {isKanjiMeaningQuestion ? (
        <div className='grid grid-cols-1 gap-3.5 sm:grid-cols-2'>
          <div>
            <label className='font-vietnamese mb-1.5 block text-xs font-bold text-(--main-color)'>
              Âm Hán Việt
            </label>
            <input
              id={`essay-hanviet-${question.order_num}`}
              type='text'
              value={compositeValue.hanViet || ''}
              onChange={handleHanVietChange}
              onKeyDown={handleKeyDownHanViet}
              enterKeyHint='next'
              placeholder='Ví dụ: TÂN...'
              className='font-vietnamese placeholder:font-vietnamese w-full rounded-2xl border-2 border-(--border-color) bg-(--background-color) px-4 py-3 text-sm font-medium text-(--main-color) transition-all placeholder:text-(--secondary-color)/50 focus:border-(--main-color) focus:ring-2 focus:ring-(--main-color)/20 focus:outline-hidden'
            />
          </div>
          <div>
            <label className='font-vietnamese mb-1.5 block text-xs font-bold text-(--main-color)'>
              Nghĩa tiếng Việt
            </label>
            <input
              id={`essay-meaning-${question.order_num}`}
              type='text'
              value={compositeValue.meaning || ''}
              onChange={handleMeaningChange}
              onKeyDown={handleKeyDownMeaning}
              enterKeyHint={question.order_num === 200 ? 'done' : 'next'}
              placeholder='Ví dụ: Mới, mới mẻ...'
              className='font-vietnamese placeholder:font-vietnamese w-full rounded-2xl border-2 border-(--border-color) bg-(--background-color) px-4 py-3 text-sm font-medium text-(--main-color) transition-all placeholder:text-(--secondary-color)/50 focus:border-(--main-color) focus:ring-2 focus:ring-(--main-color)/20 focus:outline-hidden'
            />
          </div>
        </div>
      ) : (
        <div>
          <label className='font-vietnamese mb-1.5 block text-xs font-bold text-(--main-color)'>
            Cách đọc Hiragana (Nhấn Enter để chuyển câu tiếp theo)
          </label>
          <input
            id={`essay-input-${question.order_num}`}
            type='text'
            value={hiraganaValue}
            onChange={handleHiraganaChange}
            onKeyDown={handleKeyDownHiragana}
            enterKeyHint='next'
            placeholder='Nhập cách đọc Hiragana...'
            className='font-japanese placeholder:font-vietnamese w-full rounded-2xl border-2 border-(--border-color) bg-(--background-color) px-4 py-3 text-sm font-medium text-(--main-color) transition-all placeholder:text-(--secondary-color)/50 focus:border-(--main-color) focus:ring-2 focus:ring-(--main-color)/20 focus:outline-hidden sm:text-base'
            lang='ja'
          />
        </div>
      )}
    </div>
  );
}
