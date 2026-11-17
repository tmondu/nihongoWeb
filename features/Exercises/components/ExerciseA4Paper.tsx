'use client';

import React, { useMemo, useState } from 'react';
import { PublicQuestion, QuestionResultItem } from '@/shared/types/exercise';
import { cn } from '@/shared/utils/utils';
import { FormattedText } from './FormattedText';
import { ExerciseWatermark } from './ExerciseWatermark';
import { ExerciseImage } from './ExerciseImage';

interface ExerciseA4PaperProps {
  title: string;
  timeLimitMinutes?: number;
  totalQuestions: number;
  questions: PublicQuestion[];
  answers: Record<string, string>;
  onSelectOption?: (qKey: string, letter: string) => void;
  /** Có kết quả chấm: tờ đề chuyển sang chế độ "bài đã chấm" bằng mực đỏ, không làm bài được nữa. */
  /** Hiện phiên âm (furigana) trên chữ Hán. */
  showFurigana?: boolean;
  /** Các câu chưa làm cần tô đỏ ô số (sau khi bấm Nộp bài). */
  flaggedQuestions?: Set<string>;
  results?: QuestionResultItem[];
  summary?: { score: number; total: number; passed: boolean };
  /** Bấm lại đáp án đang chọn để bỏ khoanh. */
  onClearOption?: (qKey: string) => void;
  /** Bút đang chọn (đặt ở phiếu đáp án). */
  penTool?: PenTool | null;
  printCleanMode?: boolean;
  activeQuestionIndex?: number;
}

const CIRCLE_OPTIONS = ['①', '②', '③', '④', '⑤', '⑥'];
const OPTION_LETTERS = ['A', 'B', 'C', 'D', 'E', 'F'];

// Mực in và giấy: cố định, không đổi theo theme để luôn giống đề giấy.
const INK = '#1d1d1b';
const PAPER = '#fffdf7';
// Độ "nặng" tối đa của một tờ khi gom các phần (Mondai) vào cùng trang.
const PAGE_CAPACITY = 30;

export type PenTool = 'hl' | 'ul' | 'er';

interface MondaiSection {
  partName: string;
  passage?: string;
  passageImage?: string;
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
  const match = questionText.match(
    /^\[\s*(\d+|★|\*)\s*\]|^【\s*(\d+|★|\*)\s*】|^\(\s*(\d+)\s*\)|^(?:Câu|Bài)\s*(\d+)[:.]\s*|^(\d+)\.\s+/i,
  );

  if (match) {
    const num = match[1] || match[2] || match[3] || match[4] || match[5];
    return {
      displayNumber: `${num}`,
      cleanText: questionText.slice(match[0].length).trim(),
    };
  }

  return {
    displayNumber: `${fallbackIndex + 1}`,
    cleanText: questionText,
  };
}

const sectionWeight = (s: MondaiSection) =>
  3 +
  s.questions.length * 3 +
  Math.ceil((s.passage?.length ?? 0) / 55) +
  (s.passageImage ? 12 : 0) +
  s.questions.filter(({ question }) => question.question_image).length * 8;

const RING_PATH =
  'M20 4C30 3 37 11 36 21 35 31 27 37 18 36 9 35 3 28 4 19 5 10 13 5 24 5';
const CROSS_PATH = 'M8 8L32 33M33 7L9 34';
const RED = '#c4372b';
const PENCIL = '#2a3140';
// Chỉ dùng cho chữ số của điểm số (ASCII), nên không lo thiếu glyph tiếng Việt.
const HAND_FONT =
  "'Caveat', 'Segoe Print', 'Bradley Hand', 'Comic Sans MS', cursive";

/** Nét khoanh tròn vẽ tay, mỗi lần nghiêng khác nhau. */
const Ring: React.FC<{ seed: number; color?: string }> = ({
  seed,
  color = RED,
}) => (
  <svg
    className='paper-ring pointer-events-none absolute top-1/2 left-1/2 -mt-[1.05em] -ml-[1.05em] size-[2.1em] overflow-visible print:hidden'
    style={{ transform: `rotate(${((seed * 37) % 36) - 18}deg)` }}
    viewBox='0 0 40 40'
    aria-hidden='true'
  >
    <path
      pathLength={1}
      d={RING_PATH}
      fill='none'
      stroke={color}
      strokeWidth={1.7}
      strokeLinecap='round'
    />
  </svg>
);

export const ExerciseA4Paper: React.FC<ExerciseA4PaperProps> = ({
  title,
  timeLimitMinutes = 0,
  totalQuestions,
  questions,
  answers,
  onSelectOption,
  showFurigana = true,
  flaggedQuestions,
  results,
  summary,
  onClearOption,
  penTool = null,
  printCleanMode = false,
  activeQuestionIndex,
}) => {
  const tool = penTool;
  const graded = Boolean(results);
  const resultByKey = useMemo(
    () => new Map((results ?? []).map(r => [String(r.id), r])),
    [results],
  );
  const [excluded, setExcluded] = useState<Set<string>>(new Set());
  const [ringSeed, setRingSeed] = useState(1);

  // Group questions by Mondai / Part
  const sections = useMemo<MondaiSection[]>(() => {
    const map = new Map<string, MondaiSection>();

    questions.forEach((q, idx) => {
      const partName = q.part_name?.trim() || 'Bài 1';
      if (!map.has(partName)) {
        map.set(partName, {
          partName,
          passage: q.passage?.trim(),
          passageImage: q.passage_image?.trim(),
          passageTitle: q.passage_title?.trim(),
          questions: [],
        });
      }

      const section = map.get(partName)!;
      if (!section.passageImage && q.passage_image?.trim()) {
        section.passageImage = q.passage_image.trim();
      }
      if (!section.passage && q.passage?.trim()) {
        section.passage = q.passage.trim();
        section.passageTitle = q.passage_title?.trim();
      }

      const { cleanText, displayNumber } = extractQuestionNumber(
        q.question,
        idx,
      );

      section.questions.push({
        question: { ...q, question: cleanText },
        globalIndex: idx,
        displayNumber,
      });
    });

    return Array.from(map.values());
  }, [questions]);

  // Gom các phần vào từng tờ giấy (tờ đầu có thêm phần đầu đề).
  const pages = useMemo<MondaiSection[][]>(() => {
    const result: MondaiSection[][] = [];
    let current: MondaiSection[] = [];
    let load = 8;
    sections.forEach(section => {
      const w = sectionWeight(section);
      if (current.length > 0 && load + w > PAGE_CAPACITY) {
        result.push(current);
        current = [];
        load = 0;
      }
      current.push(section);
      load += w;
    });
    if (current.length > 0) result.push(current);
    return result;
  }, [sections]);

  const toggleExcluded = (key: string) =>
    setExcluded(prev => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });

  // Bút dạ / gạch chân: bọc vùng đang chọn; tẩy: gỡ lớp bọc khi bấm vào.
  const handlePaperMouseUp = () => {
    if (tool !== 'hl' && tool !== 'ul') return;
    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0 || sel.isCollapsed) return;
    const range = sel.getRangeAt(0);
    const host = range.commonAncestorContainer.parentElement;
    if (!host?.closest('[data-paper-text]')) return;
    const mark = document.createElement('span');
    mark.setAttribute('data-pen', tool);
    mark.className =
      tool === 'hl'
        ? 'bg-[rgba(255,214,51,0.55)]'
        : 'underline decoration-[#c4372b] decoration-2 underline-offset-4';
    try {
      range.surroundContents(mark);
    } catch {
      // Vùng chọn cắt ngang nhiều thẻ: bỏ qua, không đánh dấu.
    }
    sel.removeAllRanges();
  };

  const handlePaperClick = (e: React.MouseEvent) => {
    if (tool !== 'er') return;
    const pen = (e.target as HTMLElement).closest('[data-pen]');
    if (!pen || !pen.parentNode) return;
    const parent = pen.parentNode;
    while (pen.firstChild) parent.insertBefore(pen.firstChild, pen);
    pen.remove();
    parent.normalize();
  };

  return (
    <div className='flex flex-col items-center gap-6 print:block'>
      {pages.map((pageSections, pageIdx) => {
        const isFirst = pageIdx === 0;
        const isLast = pageIdx === pages.length - 1;

        return (
          <article
            key={pageIdx}
            data-paper-text
            onMouseUp={handlePaperMouseUp}
            onClick={handlePaperClick}
            className='paper-vi relative w-full max-w-[794px] px-6 pt-10 pb-20 shadow-[0_1px_2px_rgba(60,50,30,0.25),0_14px_30px_-14px_rgba(60,50,30,0.45)] sm:px-12 sm:pt-12 md:min-h-[1123px] md:px-[72px] md:pt-16 print:max-w-none print:break-after-page print:p-0 print:shadow-none'
            style={{
              background: PAPER,
              color: INK,
              lineHeight: 1.95,
            }}
          >
            <ExerciseWatermark />

            {/* Đầu đề: chỉ ở tờ đầu */}
            {isFirst && (
              <div className='relative z-10 grid grid-cols-1 items-end gap-5 border-b-2 border-[#1d1d1b] pb-3.5 sm:grid-cols-[1fr_auto]'>
                <div>
                  <h1 className='text-xl leading-snug font-bold tracking-wide sm:text-[21px]'>
                    <FormattedText
                      text={title}
                      paper
                      showFurigana={showFurigana}
                    />
                  </h1>
                  {timeLimitMinutes > 0 && (
                    <p className='text-xs leading-normal tracking-wide text-[#55524b]'>
                      Thời gian làm bài: {timeLimitMinutes} phút · Tổng số:{' '}
                      {totalQuestions} câu
                    </p>
                  )}
                </div>
                {graded && summary ? (
                  <div
                    className='mx-auto -rotate-6 text-center sm:mx-0'
                    style={{ color: RED }}
                  >
                    <div
                      className='rounded-[50%] px-7 py-3 leading-none'
                      style={{ border: `3px solid ${RED}` }}
                    >
                      <span
                        className='block text-4xl font-bold sm:text-5xl'
                        style={{ fontFamily: HAND_FONT }}
                      >
                        {summary.score}/{summary.total}
                      </span>
                      <span className='mt-1 block text-sm italic'>
                        {summary.passed ? 'Đạt' : 'Chưa đạt'}
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className='grid min-w-[220px] gap-2 text-xs leading-snug'>
                    {['Họ và tên', 'Lớp / Mã SV'].map(label => (
                      <div key={label} className='flex items-end gap-2'>
                        <span>{label}</span>
                        <span className='h-[18px] flex-1 border-b border-[#1d1d1b]' />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {isFirst && !graded && (
              <div className='relative z-10 mt-4 border border-[#1d1d1b] px-4 py-2 text-[13px] leading-[1.8] print:hidden'>
                <b className='mr-2 inline-block border border-[#1d1d1b] px-1.5 leading-normal'>
                  Lưu ý
                </b>
                <FormattedText
                  text='Bấm vào ①②③④ để khoanh đáp án, bấm lần nữa để bỏ khoanh. Bấm chuột phải vào một đáp án để gạch bỏ.'
                  paper
                  showFurigana={showFurigana}
                />
              </div>
            )}

            <div className='relative z-10'>
              {pageSections.map((section, sIdx) => (
                <section
                  key={section.partName}
                  className={cn(
                    'print:break-inside-auto',
                    isFirst && sIdx === 0 ? 'mt-6' : 'mt-8 first:mt-0',
                  )}
                >
                  {/* Tiêu đề phần (Mondai) */}
                  <h2 className='mb-1.5 text-[15px] leading-relaxed font-bold tracking-wider'>
                    <FormattedText
                      text={section.partName}
                      paper
                      showFurigana={showFurigana}
                    />
                  </h2>

                  {/* Đoạn văn / ảnh dùng chung */}
                  {(section.passage || section.passageImage) && (
                    <div className='my-3 border border-[#1d1d1b] px-5 py-3.5 text-[15.5px] leading-[2.05] whitespace-pre-line print:py-2'>
                      {section.passageTitle && (
                        <div className='mb-1 text-[13px] font-bold tracking-wider'>
                          <FormattedText
                            text={section.passageTitle}
                            paper
                            showFurigana={showFurigana}
                          />
                        </div>
                      )}
                      {section.passage && (
                        <FormattedText
                          text={section.passage}
                          paper
                          showFurigana={showFurigana}
                        />
                      )}
                      {section.passageImage && (
                        <ExerciseImage
                          src={section.passageImage}
                          alt={
                            section.passageTitle?.replace(
                              /\[([^[\]:]+):[^\]]+\]/g,
                              '$1',
                            ) || 'Hình đề bài'
                          }
                          className='mt-3'
                        />
                      )}
                    </div>
                  )}

                  {/* Các câu hỏi trong phần này */}
                  {section.questions.map(
                    ({ question: q, globalIndex, displayNumber }) => {
                      const qKey = String(q.id || globalIndex + 1);
                      const selectedLetter = answers[qKey];
                      const r = resultByKey.get(qKey);
                      const keyLetter = r?.correct_answer?.trim().toUpperCase();
                      const isCurrentFocus =
                        activeQuestionIndex === globalIndex;

                      return (
                        <div
                          key={qKey}
                          id={`q-item-${globalIndex}`}
                          className='relative grid scroll-mt-24 grid-cols-[34px_minmax(0,1fr)] gap-x-1.5 py-2.5'
                          style={{ breakInside: 'avoid' }}
                        >
                          {/* Dấu chấm của giáo viên ở lề trái */}
                          {r && (
                            <svg
                              className='paper-ring pointer-events-none absolute -top-0.5 -left-[22px] size-7 overflow-visible sm:-left-9 sm:size-9 md:-left-12 md:size-11'
                              viewBox='0 0 40 40'
                              role='img'
                              aria-label={r.is_correct ? 'Đúng' : 'Sai'}
                            >
                              <path
                                pathLength={1}
                                d={r.is_correct ? RING_PATH : CROSS_PATH}
                                fill='none'
                                stroke={RED}
                                strokeWidth={3}
                                strokeLinecap='round'
                              />
                            </svg>
                          )}
                          <span
                            className={cn(
                              'mt-1 size-[26px] self-start border border-[#1d1d1b] text-center text-[13px] leading-6 font-semibold',
                              isCurrentFocus && 'bg-[#1d1d1b] text-[#fffdf7]',
                              flaggedQuestions?.has(qKey) &&
                                'border-[#c4372b] bg-[#c4372b] text-[#fffdf7]',
                            )}
                          >
                            {displayNumber}
                          </span>

                          <div className='min-w-0'>
                            <p className='text-base whitespace-pre-line'>
                              <FormattedText
                                text={q.question}
                                paper
                                showFurigana={showFurigana}
                              />
                            </p>
                            {q.question_image && (
                              <ExerciseImage
                                src={q.question_image}
                                alt={`Hình câu ${displayNumber}`}
                                className='mt-2 max-w-md'
                              />
                            )}

                            <div className='mt-0.5 flex flex-wrap gap-x-7'>
                              {q.options.map((optionText, optIdx) => {
                                const letter = OPTION_LETTERS[optIdx] || 'A';
                                const isSelected =
                                  !printCleanMode && selectedLetter === letter;
                                const isKey = graded && keyLetter === letter;
                                const isWrongPick =
                                  graded && isSelected && !r?.is_correct;
                                const exKey = `${qKey}:${letter}`;
                                const isOut = excluded.has(exKey);

                                return (
                                  <button
                                    key={letter}
                                    type='button'
                                    disabled={graded}
                                    onClick={() => {
                                      if (isSelected) {
                                        onClearOption?.(qKey);
                                      } else {
                                        setRingSeed(s => s + 1);
                                        onSelectOption?.(qKey, letter);
                                      }
                                    }}
                                    onContextMenu={e => {
                                      e.preventDefault();
                                      toggleExcluded(exKey);
                                    }}
                                    className={cn(
                                      'inline-flex items-baseline gap-1.5 px-0.5 text-left text-[15.5px] select-none focus-visible:outline-1 focus-visible:outline-offset-2 focus-visible:outline-dashed',
                                      graded
                                        ? 'cursor-default'
                                        : 'cursor-pointer',
                                    )}
                                  >
                                    <span className='paper-ja relative inline-block w-[1.3em] text-center'>
                                      {CIRCLE_OPTIONS[optIdx] ||
                                        `(${optIdx + 1})`}
                                      {isSelected && (
                                        <Ring
                                          seed={ringSeed + optIdx}
                                          color={graded ? PENCIL : RED}
                                        />
                                      )}
                                      {/* Đáp án đúng khi chọn sai: giáo viên khoanh đỏ */}
                                      {isKey && !r?.is_correct && (
                                        <Ring seed={optIdx + 7} />
                                      )}
                                    </span>
                                    <span
                                      className={cn(
                                        // Đáp án đã khoanh: chữ đậm + vệt bút dạ đỏ dịu
                                        isSelected &&
                                          !graded &&
                                          'bg-[linear-gradient(transparent_18%,rgba(255,158,199,0.5)_18%,rgba(255,158,199,0.5)_88%,transparent_88%)] px-1 font-semibold',
                                        isSelected && graded && 'font-semibold',
                                        isWrongPick &&
                                          'line-through decoration-[#c4372b] decoration-2',
                                        isOut &&
                                          'line-through opacity-40 print:no-underline print:opacity-100',
                                      )}
                                    >
                                      <FormattedText
                                        text={optionText}
                                        paper
                                        showFurigana={showFurigana}
                                      />
                                    </span>
                                  </button>
                                );
                              })}
                            </div>

                            {/* Ghi chú đỏ của giáo viên */}
                            {r && (
                              <div
                                className='mt-1.5 text-[14.5px] leading-snug italic'
                                style={{ color: RED }}
                              >
                                {!r.is_correct && (
                                  <span className='mr-2 font-semibold not-italic'>
                                    {r.user_answer ? '' : 'Chưa làm · '}
                                    Đáp án đúng:{' '}
                                    {CIRCLE_OPTIONS[
                                      OPTION_LETTERS.indexOf(keyLetter ?? '')
                                    ] ?? keyLetter}
                                  </span>
                                )}
                                {r.explanation && (
                                  <FormattedText
                                    text={r.explanation}
                                    paper
                                    showFurigana={showFurigana}
                                  />
                                )}
                                {r.explanation_image && (
                                  <ExerciseImage
                                    src={r.explanation_image}
                                    alt={`Ảnh giải thích câu ${displayNumber}`}
                                    className='mt-2 max-w-md'
                                  />
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    },
                  )}
                </section>
              ))}

              {isLast && (
                <div className='mt-9 text-center text-sm tracking-[0.4em]'>
                  — Hết —
                  <p className='mt-2 text-[11px] tracking-normal text-[#55524b]'>
                    Tài liệu được biên soạn bởi Phan Thắm SS
                  </p>
                </div>
              )}
            </div>

            <div className='absolute inset-x-0 bottom-8 text-center text-[13px] text-[#55524b] print:bottom-2'>
              - {pageIdx + 1} -
            </div>
          </article>
        );
      })}
    </div>
  );
};
