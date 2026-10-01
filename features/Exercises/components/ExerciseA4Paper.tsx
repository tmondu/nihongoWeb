'use client';

import React, { useMemo } from 'react';
import { BookOpen } from 'lucide-react';
import { PublicQuestion } from '@/shared/types/exercise';
import { FormattedText } from './FormattedText';
import { ExerciseWatermark } from './ExerciseWatermark';

interface ExerciseA4PaperProps {
  title: string;
  timeLimitMinutes?: number;
  totalQuestions: number;
  questions: PublicQuestion[];
  answers: Record<string, string>;
  onSelectOption: (qKey: string, letter: string) => void;
  printCleanMode?: boolean;
  activeQuestionIndex?: number;
}

const CIRCLE_OPTIONS = ['①', '②', '③', '④', '⑤', '⑥'];
const OPTION_LETTERS = ['A', 'B', 'C', 'D', 'E', 'F'];

interface MondaiSection {
  partName: string;
  passage?: string;
  passageTitle?: string;
  questions: {
    question: PublicQuestion;
    globalIndex: number;
    displayNumber: string;
  }[];
}

/**
 * Extracts display question number from question text (e.g. "[10] ...", "10. ...", "Câu 10: ...")
 * or falls back to standard 1-based globalIndex.
 */
function extractQuestionNumber(
  questionText: string,
  fallbackIndex: number,
): { cleanText: string; displayNumber: string } {
  // Check for leading [10], 【10】, (10), 10., Câu 10:
  const match = questionText.match(
    /^\[\s*(\d+|★|\*)\s*\]|^【\s*(\d+|★|\*)\s*】|^\(\s*(\d+)\s*\)|^(?:Câu|Bài)\s*(\d+)[:.]\s*|^(\d+)\.\s+/i,
  );

  if (match) {
    const num = match[1] || match[2] || match[3] || match[4] || match[5];
    const cleanText = questionText.slice(match[0].length).trim();
    return {
      displayNumber: `[${num}]`,
      cleanText,
    };
  }

  return {
    displayNumber: `[${fallbackIndex + 1}]`,
    cleanText: questionText,
  };
}

export const ExerciseA4Paper: React.FC<ExerciseA4PaperProps> = ({
  title,
  timeLimitMinutes = 0,
  totalQuestions,
  questions,
  answers,
  onSelectOption,
  printCleanMode = false,
  activeQuestionIndex,
}) => {
  // Group questions by Mondai / Part
  const sections = useMemo<MondaiSection[]>(() => {
    const map = new Map<string, MondaiSection>();

    questions.forEach((q, idx) => {
      const partName = q.part_name?.trim() || 'Bài 1';
      if (!map.has(partName)) {
        map.set(partName, {
          partName,
          passage: q.passage?.trim(),
          passageTitle: q.passage_title?.trim(),
          questions: [],
        });
      }

      const section = map.get(partName)!;
      // If later questions have passage and section hasn't captured it yet
      if (!section.passage && q.passage?.trim()) {
        section.passage = q.passage.trim();
        section.passageTitle = q.passage_title?.trim();
      }

      const { cleanText, displayNumber } = extractQuestionNumber(
        q.question,
        idx,
      );

      section.questions.push({
        question: {
          ...q,
          question: cleanText,
        },
        globalIndex: idx,
        displayNumber,
      });
    });

    return Array.from(map.values());
  }, [questions]);

  return (
    <div
      className='relative mx-auto w-full max-w-[860px] rounded-2xl border-2 border-(--border-color) bg-(--card-color) p-6 shadow-xl transition-all sm:p-10 md:p-12 print:max-w-none print:rounded-none print:border-none print:bg-white print:p-0 print:text-black print:shadow-none'
      style={{
        minHeight: '1120px',
      }}
    >
      {/* Authentic Watermark */}
      <ExerciseWatermark text='文法' subText='Phan Thắm SS Nihongo' />

      {/* Printable Exam Paper Header */}
      <div className='relative z-10 space-y-4 border-b-2 border-(--border-color)/80 pb-6 print:border-neutral-900 print:pb-4'>
        {/* Main Title */}
        <div className='text-center'>
          <h1 className='font-mixed text-xl font-extrabold tracking-wide text-rose-600 sm:text-2xl md:text-3xl print:text-xl print:text-black'>
            {title.toUpperCase()}
          </h1>
          {timeLimitMinutes > 0 && (
            <p className='font-vietnamese mt-1 text-xs font-semibold text-(--secondary-color) print:text-neutral-700'>
              Thời gian làm bài: {timeLimitMinutes} phút • Tổng số:{' '}
              {totalQuestions} câu
            </p>
          )}
        </div>

        {/* Student Name and Test Info (Prominently visible in Print, subtle on Web) */}
        <div className='font-vietnamese grid grid-cols-1 gap-2 pt-2 text-xs font-semibold sm:grid-cols-3 print:grid print:grid-cols-3 print:pt-1 print:text-[11px] print:text-neutral-900'>
          <div className='flex items-center gap-1.5'>
            <span>Họ và tên:</span>
            <span className='flex-1 border-b border-dotted border-current opacity-70'></span>
          </div>
          <div className='flex items-center gap-1.5'>
            <span>Lớp / Mã SV:</span>
            <span className='flex-1 border-b border-dotted border-current opacity-70'></span>
          </div>
          <div className='flex items-center gap-1.5'>
            <span>Điểm số:</span>
            <span className='flex-1 border-b border-dotted border-current opacity-70'></span>
          </div>
        </div>
      </div>

      {/* Main Questions Body */}
      <div className='relative z-10 mt-6 space-y-8 print:mt-4 print:space-y-6'>
        {sections.map((section, sIdx) => {
          return (
            <section
              key={sIdx}
              className='space-y-5 print:break-inside-auto print:space-y-4'
            >
              {/* Mondai / Part Header Banner */}
              <div className='rounded-xl border border-blue-500/30 bg-blue-500/10 px-4 py-2.5 text-blue-600 dark:text-blue-400 print:border-none print:bg-transparent print:p-0 print:text-blue-700'>
                <h2 className='font-mixed text-sm leading-relaxed font-bold tracking-wide sm:text-base print:text-[13px]'>
                  <FormattedText text={section.partName} />
                </h2>
              </div>

              {/* Shared Reading Passage if present */}
              {section.passage && (
                <div className='rounded-2xl border-2 border-dashed border-(--border-color) bg-(--background-color)/60 p-4 sm:p-5 print:rounded-lg print:border print:border-neutral-300 print:bg-neutral-50/50 print:p-3'>
                  <div className='font-vietnamese mb-2 flex items-center gap-2 text-xs font-bold text-(--main-color) print:text-black'>
                    <BookOpen className='size-4 text-blue-500' />
                    <span>{section.passageTitle || 'Đoạn văn đọc hiểu'}</span>
                  </div>
                  <div className='font-mixed text-sm leading-loose whitespace-pre-line text-(--main-color) sm:text-base print:text-xs print:leading-relaxed print:text-neutral-800'>
                    <FormattedText text={section.passage} />
                  </div>
                </div>
              )}

              {/* Questions under this Mondai */}
              <div className='space-y-4 sm:space-y-5 print:space-y-3.5'>
                {section.questions.map(
                  ({ question: q, globalIndex, displayNumber }) => {
                    const qKey = String(q.id || globalIndex + 1);
                    const selectedLetter = answers[qKey];
                    const isCurrentFocus = activeQuestionIndex === globalIndex;

                    return (
                      <div
                        key={qKey}
                        id={`q-item-${globalIndex}`}
                        className={`group relative scroll-mt-24 rounded-2xl p-3 transition-all sm:p-4 print:p-1 ${
                          isCurrentFocus
                            ? 'bg-(--main-color)/10 ring-2 ring-(--main-color)/40 print:bg-transparent print:ring-0'
                            : 'hover:bg-(--background-color)/50 print:bg-transparent'
                        }`}
                        style={{
                          breakInside: 'avoid',
                          pageBreakInside: 'avoid',
                        }}
                      >
                        {/* Question Text */}
                        <div className='flex items-start gap-2.5 text-sm sm:text-base print:text-[13px]'>
                          <span className='font-vietnamese shrink-0 font-extrabold text-(--main-color) print:text-black'>
                            {displayNumber}
                          </span>
                          <div className='leading-relaxed font-bold text-(--main-color) print:text-black'>
                            <FormattedText text={q.question} />
                          </div>
                        </div>

                        {/* Options Row / Grid */}
                        <div className='mt-2.5 grid grid-cols-1 gap-2 pl-2 sm:grid-cols-2 lg:grid-cols-4 print:mt-1.5 print:grid-cols-4 print:gap-1.5 print:pl-0'>
                          {q.options.map((optionText, optIdx) => {
                            const letter = OPTION_LETTERS[optIdx] || 'A';
                            const circleDigit =
                              CIRCLE_OPTIONS[optIdx] || `(${optIdx + 1})`;
                            const isSelected =
                              !printCleanMode && selectedLetter === letter;

                            return (
                              <button
                                key={letter}
                                type='button'
                                onClick={() => onSelectOption(qKey, letter)}
                                className={`group/btn flex items-center gap-2 rounded-xl border px-3 py-2 text-left text-xs transition-all select-none sm:text-sm print:border-none print:p-0 print:text-[12px] ${
                                  isSelected
                                    ? 'border-(--main-color) bg-(--main-color)/15 font-bold text-(--main-color) shadow-xs ring-1 ring-(--main-color)/40 print:font-bold print:text-black'
                                    : 'border-(--border-color)/70 bg-(--background-color)/50 text-(--secondary-color) hover:border-(--main-color)/60 hover:text-(--main-color) print:bg-transparent print:text-neutral-800'
                                }`}
                              >
                                {/* Circled Digit: ①, ②, ③, ④ */}
                                <span
                                  className={`font-japanese flex size-6 shrink-0 items-center justify-center rounded-full text-xs font-bold transition-all sm:text-sm print:size-auto print:font-bold ${
                                    isSelected
                                      ? 'bg-(--main-color) text-(--background-color) print:bg-transparent print:text-black print:underline'
                                      : 'text-(--secondary-color) group-hover/btn:text-(--main-color) print:text-black'
                                  }`}
                                >
                                  {circleDigit}
                                </span>

                                {/* Option Text */}
                                <span className='font-mixed truncate leading-snug'>
                                  <FormattedText text={optionText} />
                                </span>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    );
                  },
                )}
              </div>
            </section>
          );
        })}
      </div>

      {/* Authentic A4 Document Footer */}
      <div className='font-vietnamese relative z-10 mt-12 flex items-center justify-between border-t border-(--border-color)/60 pt-6 text-xs text-(--secondary-color) print:mt-8 print:border-neutral-300 print:pt-4 print:text-neutral-600'>
        <div className='font-mono font-medium'>
          Trang 1 / 1 • Tổng số: {totalQuestions} câu
        </div>

        {/* Branding Badge (Matching exactly user screenshot blue badge) */}
        <div className='inline-flex items-center rounded-lg bg-[#0070c0] px-3 py-1 text-[11px] font-bold text-white shadow-xs print:bg-[#0070c0] print:text-white'>
          Tài liệu được biên soạn bởi Phan Thắm SS
        </div>
      </div>
    </div>
  );
};
