'use client';

import React from 'react';
import { Printer, Send, ArrowUp } from 'lucide-react';
import { PublicQuestion } from '@/shared/types/exercise';
import { useClick } from '@/shared/hooks/generic/useAudio';
import type { PenTool } from './ExerciseA4Paper';
import { cn } from '@/shared/utils/utils';

interface ExerciseA4SidebarProps {
  questions: PublicQuestion[];
  answers: Record<string, string>;
  timeLeft: number;
  timeLimitMinutes: number;
  onSubmitClick: () => void;
  onPrintClick: () => void;
  activeQuestionIndex?: number;
  onSelectQuestion?: (index: number) => void;
  /** Tô đáp án trực tiếp trên phiếu; đồng bộ với tờ đề. */
  onSelectOption?: (qKey: string, letter: string) => void;
  onClearOption?: (qKey: string) => void;
  penTool?: PenTool | null;
  onPenToolChange?: (tool: PenTool | null) => void;
  showFurigana?: boolean;
  flaggedQuestions?: Set<string>;
  onToggleFurigana?: () => void;
  isAdmin?: boolean;
}

const LETTERS = ['A', 'B', 'C', 'D'];
const PEN_TOOLS: { id: PenTool; label: string }[] = [
  { id: 'hl', label: 'Bút dạ' },
  { id: 'ul', label: 'Gạch chân' },
  { id: 'er', label: 'Tẩy' },
];

// Phiếu trả lời kiểu giấy: màu cố định giống tờ đề.
export const ExerciseA4Sidebar: React.FC<ExerciseA4SidebarProps> = ({
  questions,
  answers,
  timeLeft,
  timeLimitMinutes,
  onSubmitClick,
  onPrintClick,
  activeQuestionIndex,
  onSelectQuestion,
  onSelectOption,
  onClearOption,
  penTool = null,
  onPenToolChange,
  showFurigana = true,
  flaggedQuestions,
  onToggleFurigana,
  isAdmin = false,
}) => {
  const { playClick } = useClick();
  const totalQuestions = questions.length;
  const answeredCount = Object.keys(answers).length;

  const formatTimer = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m < 10 ? '0' : ''}${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const handleScrollToQuestion = (idx: number) => {
    playClick();
    onSelectQuestion?.(idx);
    document
      .getElementById(`q-item-${idx}`)
      ?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };

  const handleBubble = (qKey: string, letter: string) => {
    playClick();
    if (answers[qKey] === letter) onClearOption?.(qKey);
    else onSelectOption?.(qKey, letter);
  };

  return (
    <aside className='sticky top-6 space-y-3 select-none print:hidden'>
      <div className='border border-[#1d1d1b] bg-[#fffdf7] text-[#1d1d1b] shadow-[0_10px_24px_-14px_rgba(60,50,30,0.5)]'>
        <div className='flex items-center justify-between border-b-2 border-[#1d1d1b] px-3 py-2 text-xs font-semibold tracking-wider'>
          <span className='paper-ja' lang='ja'>
            解答用紙
          </span>
          <span className='font-mono tabular-nums'>
            {answeredCount}/{totalQuestions}
          </span>
        </div>

        {timeLimitMinutes > 0 && (
          <div
            className={cn(
              'flex items-center justify-between border-b border-[#1d1d1b] px-3 py-1.5 font-mono text-sm font-semibold tabular-nums',
              timeLeft <= 300 && 'bg-[#c4372b] text-[#fffdf7]',
            )}
          >
            <span className='font-vietnamese text-[11px] font-normal'>
              Còn lại
            </span>
            <span>{formatTimer(timeLeft)}</span>
          </div>
        )}

        <div className='max-h-[52vh] overflow-y-auto'>
          <table className='w-full border-collapse text-xs'>
            <tbody>
              {questions.map((q, idx) => {
                const qKey = String(q.id || idx + 1);
                const isCurrent = activeQuestionIndex === idx;

                return (
                  <tr
                    key={qKey}
                    className='border-b border-dotted border-[#b9b3a3]'
                  >
                    <td className='w-9 border-r border-[#1d1d1b] p-0 text-center'>
                      <button
                        type='button'
                        onClick={() => handleScrollToQuestion(idx)}
                        title={`Đến câu ${idx + 1}`}
                        className={cn(
                          'font-vietnamese w-full py-1 font-semibold hover:bg-black/5',
                          isCurrent &&
                            'bg-[#1d1d1b] text-[#fffdf7] hover:bg-[#1d1d1b]',
                          flaggedQuestions?.has(qKey) &&
                            'bg-[#c4372b] text-[#fffdf7] hover:bg-[#c4372b]',
                        )}
                      >
                        {idx + 1}
                      </button>
                    </td>
                    <td className='px-1 py-0.5 text-center'>
                      {LETTERS.map((letter, i) => {
                        const disabled = i >= q.options.length;
                        const on = answers[qKey] === letter;
                        return (
                          <button
                            key={letter}
                            type='button'
                            disabled={disabled}
                            onClick={() => handleBubble(qKey, letter)}
                            className={cn(
                              'font-vietnamese mx-0.5 inline-block size-5 rounded-full border border-[#1d1d1b] text-[10px] leading-[18px]',
                              on
                                ? 'border-[#2a3140] bg-[#2a3140] text-white'
                                : 'text-[#55524b] hover:bg-black/10',
                              disabled &&
                                'cursor-default opacity-25 hover:bg-transparent',
                            )}
                            aria-label={`Câu ${idx + 1}, đáp án ${i + 1}`}
                            aria-pressed={on}
                          >
                            {i + 1}
                          </button>
                        );
                      })}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {flaggedQuestions && flaggedQuestions.size > 0 && (
          <p
            role='status'
            className='font-vietnamese border-t border-[#c4372b] bg-[#c4372b]/10 px-3 py-1.5 text-[11px] font-semibold text-[#c4372b]'
          >
            Còn {flaggedQuestions.size} câu chưa làm (ô số màu đỏ)
          </p>
        )}

        <div className='font-vietnamese space-y-2 border-t-2 border-[#1d1d1b] p-3'>
          <button
            type='button'
            onClick={() => {
              playClick();
              onSubmitClick();
            }}
            className='flex w-full items-center justify-center gap-2 border border-[#1d1d1b] bg-[#1d1d1b] py-2.5 text-xs font-bold text-[#fffdf7] transition-transform active:translate-y-px'
          >
            <Send className='size-3.5' />
            <span>
              Nộp bài ({answeredCount}/{totalQuestions})
            </span>
          </button>

          {isAdmin && (
            <button
              type='button'
              onClick={() => {
                playClick();
                onPrintClick();
              }}
              className='flex w-full items-center justify-center gap-2 border border-[#1d1d1b] py-2 text-xs font-semibold hover:bg-black/5'
            >
              <Printer className='size-3.5' />
              <span>In đề / Xuất PDF</span>
            </button>
          )}

          <button
            type='button'
            onClick={() => {
              playClick();
              // Trang cuộn trong khung của layout, không phải window.
              const container = document.querySelector(
                '[data-scroll-restoration-id="container"]',
              );
              (container ?? window).scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className='flex w-full items-center justify-center gap-1.5 text-[11px] text-[#55524b] hover:text-[#1d1d1b]'
          >
            <ArrowUp className='size-3' />
            <span>Lên đầu đề thi</span>
          </button>
        </div>
        {/* Bút của thí sinh: nằm cuối phiếu, dưới nút Lên đầu đề thi */}
        <div
          role='group'
          aria-label='Công cụ bút'
          className='font-vietnamese flex divide-x divide-[#1d1d1b]/40 border-t border-[#1d1d1b]'
        >
          {PEN_TOOLS.map(({ id, label }) => (
            <button
              key={id}
              type='button'
              aria-pressed={penTool === id}
              onClick={() => {
                playClick();
                onPenToolChange?.(penTool === id ? null : id);
              }}
              className={cn(
                'flex-1 py-2 text-[11px] font-semibold transition-colors',
                penTool === id
                  ? 'bg-[#1d1d1b] text-[#fffdf7]'
                  : 'hover:bg-black/5',
              )}
            >
              {label}
            </button>
          ))}
        </div>

        {onToggleFurigana && (
          <button
            type='button'
            role='switch'
            aria-checked={showFurigana}
            onClick={() => {
              playClick();
              onToggleFurigana();
            }}
            className='font-vietnamese flex w-full items-center justify-between border-t border-[#1d1d1b] px-3 py-2 text-[11px] font-semibold transition-colors hover:bg-black/5'
          >
            <span>
              Phiên âm <span lang='ja'>ふりがな</span>
            </span>
            <span
              className={cn(
                'relative h-4 w-7 rounded-full transition-colors',
                showFurigana ? 'bg-[#1d1d1b]' : 'bg-[#cfc9bd]',
              )}
            >
              <span
                className={cn(
                  'absolute top-0.5 left-0.5 size-3 rounded-full bg-[#fffdf7] transition-transform',
                  showFurigana && 'translate-x-3',
                )}
              />
            </span>
          </button>
        )}
      </div>
    </aside>
  );
};
