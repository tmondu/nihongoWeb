'use client';

import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
  useMemo,
} from 'react';
import { Link } from '@/core/i18n/routing';
import {
  ArrowLeft,
  ArrowRight,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  Send,
  BookOpen,
  ChevronDown,
  ChevronUp,
  Printer,
  SlidersHorizontal,
  LayoutList,
  Layers,
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/shared/ui/components/dialog';
import {
  PublicQuestion,
  SubmitExerciseResponse,
} from '@/shared/types/exercise';
import { ExerciseResult } from './ExerciseResult';
import { ExerciseA4Paper } from './ExerciseA4Paper';
import { ExerciseA4Sidebar } from './ExerciseA4Sidebar';
import { ExercisePrintDialog } from './ExercisePrintDialog';
import { ExerciseWatermark } from './ExerciseWatermark';
import { FormattedText } from './FormattedText';
import { useClick } from '@/shared/hooks/generic/useAudio';
import { useAdminStatus } from '@/shared/hooks/generic/useAdminStatus';

interface ExerciseRunnerProps {
  exerciseId: number;
  title: string;
  timeLimitMinutes: number;
  questions: PublicQuestion[];
}

export const ExerciseRunner: React.FC<ExerciseRunnerProps> = ({
  exerciseId,
  title,
  timeLimitMinutes,
  questions,
}) => {
  const { playClick } = useClick();
  const { isAdmin } = useAdminStatus();
  const [viewMode, setViewMode] = useState<'a4' | 'step'>('a4');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [timeLeft, setTimeLeft] = useState(timeLimitMinutes * 60);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isPrintDialogOpen, setIsPrintDialogOpen] = useState(false);
  const [printCleanMode, setPrintCleanMode] = useState(false);
  const [isMobilePaletteOpen, setIsMobilePaletteOpen] = useState(false);
  const [result, setResult] = useState<SubmitExerciseResponse | null>(null);
  const [isPassageExpanded, setIsPassageExpanded] = useState(true);

  const startTimeRef = useRef<number>(Date.now());
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const currentQ = questions[currentIndex] || questions[0];
  const totalQuestions = questions.length;
  const answeredCount = Object.keys(answers).length;

  interface PartGroup {
    partName: string;
    questions: { q: PublicQuestion; idx: number }[];
  }

  // Group questions by part_name (Bài 1, Bài 2, Bài 3...)
  const groupedParts = useMemo<PartGroup[]>(() => {
    const partsMap = new Map<string, PartGroup>();

    questions.forEach((q: PublicQuestion, idx: number) => {
      const partName = q.part_name || 'Bài 1';
      if (!partsMap.has(partName)) {
        partsMap.set(partName, { partName, questions: [] });
      }
      partsMap.get(partName)!.questions.push({ q, idx });
    });

    return Array.from(partsMap.values());
  }, [questions]);

  // Sync index if questions change
  useEffect(() => {
    if (questions.length > 0 && currentIndex >= questions.length) {
      setCurrentIndex(0);
    }
  }, [questions, currentIndex]);

  // Passage for Step Mode
  const effectivePassage = currentQ?.passage?.trim() || '';
  const effectivePassageTitle = currentQ?.passage_title?.trim() || '';

  // Submit test function
  const handleSubmit = useCallback(async () => {
    setIsSubmitting(true);
    setIsConfirmOpen(false);
    try {
      const durationSeconds = Math.round(
        (Date.now() - startTimeRef.current) / 1000,
      );

      const res = await fetch(`/api/exercises/${exerciseId}/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          answers,
          time_spent: durationSeconds,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setResult(data);
      } else {
        alert(data.message || 'Lỗi khi nộp bài');
      }
    } catch {
      alert('Không thể kết nối đến máy chủ để nộp bài.');
    } finally {
      setIsSubmitting(false);
    }
  }, [answers, exerciseId]);

  // Timer effect
  useEffect(() => {
    if (result) return;

    timerRef.current = setInterval(() => {
      if (timeLimitMinutes > 0) {
        setTimeLeft(prev => {
          if (prev <= 1) {
            clearInterval(timerRef.current!);
            handleSubmit();
            return 0;
          }
          return prev - 1;
        });
      }
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [timeLimitMinutes, result, handleSubmit]);

  // Keyboard shortcut listener
  useEffect(() => {
    if (result) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName))
        return;

      const key = e.key.toUpperCase();
      if (['1', '2', '3', '4'].includes(key)) {
        playClick();
        const optLetter = String.fromCharCode(64 + Number(key));
        const qKey = String(currentQ?.id || currentIndex + 1);
        setAnswers(prev => ({
          ...prev,
          [qKey]: optLetter,
        }));
      } else if (e.key === 'ArrowLeft' && viewMode === 'step') {
        playClick();
        setCurrentIndex(prev => Math.max(0, prev - 1));
      } else if (e.key === 'ArrowRight' && viewMode === 'step') {
        playClick();
        setCurrentIndex(prev => Math.min(totalQuestions - 1, prev + 1));
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentIndex, currentQ, totalQuestions, result, playClick, viewMode]);

  // Option selection
  const handleSelectOption = (qKey: string, letter: string) => {
    playClick();
    setAnswers(prev => ({
      ...prev,
      [qKey]: letter,
    }));
  };

  // Trigger print with custom clean mode
  const handleConfirmPrint = (cleanMode: boolean) => {
    setPrintCleanMode(cleanMode);
    setTimeout(() => {
      window.print();
    }, 100);
  };

  // Format timer
  const formatTimer = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m < 10 ? '0' : ''}${m}:${s < 10 ? '0' : ''}${s}`;
  };

  if (result) {
    return (
      <ExerciseResult
        result={result}
        exerciseTitle={title}
        onRetry={() => {
          setResult(null);
          setAnswers({});
          setCurrentIndex(0);
          setTimeLeft(timeLimitMinutes * 60);
          startTimeRef.current = Date.now();
        }}
      />
    );
  }

  return (
    <div className='mx-auto min-h-screen px-3 py-4 sm:px-6 sm:py-6 lg:px-8'>
      {/* Top Application Bar */}
      <header className='mx-auto mb-6 flex max-w-7xl items-center justify-between gap-2 rounded-3xl border-2 border-(--border-color) bg-(--card-color) p-3.5 shadow-sm select-none sm:p-4 print:hidden'>
        <div className='flex items-center gap-3'>
          <Link
            href='/exercises'
            onClick={playClick}
            className='inline-flex items-center gap-1.5 rounded-xl border border-(--border-color) bg-(--background-color) px-3 py-1.5 text-xs font-semibold text-(--secondary-color) transition-colors hover:border-(--main-color) hover:text-(--main-color)'
          >
            <ArrowLeft className='size-4' />
            <span className='hidden sm:inline'>Quay lại danh sách</span>
            <span className='sm:hidden'>Thoát</span>
          </Link>

          <h1 className='max-w-[150px] truncate text-xs font-bold text-(--main-color) sm:max-w-md sm:text-sm md:text-base'>
            {title}
          </h1>
        </div>

        <div className='flex items-center gap-2'>
          {/* View Mode Toggle Pill */}
          <div className='hidden items-center rounded-2xl border border-(--border-color) bg-(--background-color) p-1 sm:flex'>
            <button
              type='button'
              onClick={() => {
                playClick();
                setViewMode('a4');
              }}
              className={`inline-flex items-center gap-1.5 rounded-xl px-2.5 py-1 text-xs font-bold transition-all ${
                viewMode === 'a4'
                  ? 'bg-(--main-color) text-(--background-color) shadow-xs'
                  : 'text-(--secondary-color) hover:text-(--main-color)'
              }`}
            >
              <LayoutList className='size-3.5' />
              <span>Đề thi A4</span>
            </button>
            <button
              type='button'
              onClick={() => {
                playClick();
                setViewMode('step');
              }}
              className={`inline-flex items-center gap-1.5 rounded-xl px-2.5 py-1 text-xs font-bold transition-all ${
                viewMode === 'step'
                  ? 'bg-(--main-color) text-(--background-color) shadow-xs'
                  : 'text-(--secondary-color) hover:text-(--main-color)'
              }`}
            >
              <Layers className='size-3.5' />
              <span>Từng câu</span>
            </button>
          </div>

          {/* Print PDF Button in Header (Only for Admin) */}
          {isAdmin && (
            <button
              type='button'
              onClick={() => {
                playClick();
                setIsPrintDialogOpen(true);
              }}
              className='inline-flex items-center gap-1.5 rounded-2xl border border-(--border-color) bg-(--background-color) px-3 py-1.5 text-xs font-bold text-(--main-color) transition-all hover:border-(--main-color) active:scale-95'
              title='In đề thi ra PDF (Dành cho Admin)'
            >
              <Printer className='size-3.5 text-blue-500' />
              <span className='hidden md:inline'>In / Xuất PDF</span>
            </button>
          )}

          {/* Timer Display */}
          {timeLimitMinutes > 0 && (
            <div
              className={`flex items-center gap-1.5 rounded-2xl border px-3 py-1.5 font-mono text-xs font-bold ${
                timeLeft < 120
                  ? 'animate-pulse border-red-500/40 bg-red-500/10 text-red-400'
                  : 'border-(--border-color) bg-(--background-color) text-(--main-color)'
              }`}
            >
              <Clock className='size-3.5 text-(--main-color)' />
              <span>{formatTimer(timeLeft)}</span>
            </div>
          )}

          {/* Quick Submit Button in Header */}
          <button
            type='button'
            onClick={() => {
              playClick();
              setIsConfirmOpen(true);
            }}
            className='inline-flex items-center gap-1.5 rounded-2xl bg-(--main-color) px-3.5 py-1.5 text-xs font-bold text-(--background-color) shadow-sm transition-all hover:opacity-90 active:scale-95'
          >
            <Send className='size-3.5' />
            <span className='hidden sm:inline'>Nộp bài</span>
          </button>
        </div>
      </header>

      {/* ==================================================================== */}
      {/* MODE 1: A4 TEST PAPER MODE (Requested Standard View)                */}
      {/* ==================================================================== */}
      {viewMode === 'a4' && (
        <div className='mx-auto grid max-w-7xl grid-cols-1 gap-8 xl:grid-cols-12'>
          {/* Main A4 Document Column (9 cols on xl) */}
          <main className='w-full xl:col-span-9'>
            <ExerciseA4Paper
              title={title}
              timeLimitMinutes={timeLimitMinutes}
              totalQuestions={totalQuestions}
              questions={questions}
              answers={answers}
              onSelectOption={handleSelectOption}
              printCleanMode={printCleanMode}
              activeQuestionIndex={currentIndex}
            />
          </main>

          {/* Sticky Navigator Sidebar (3 cols on xl, hidden on print) */}
          <div className='hidden xl:col-span-3 xl:block'>
            <ExerciseA4Sidebar
              questions={questions}
              answers={answers}
              timeLeft={timeLeft}
              timeLimitMinutes={timeLimitMinutes}
              onSubmitClick={() => setIsConfirmOpen(true)}
              onPrintClick={() => setIsPrintDialogOpen(true)}
              viewMode={viewMode}
              onToggleViewMode={() => setViewMode('step')}
              activeQuestionIndex={currentIndex}
              onSelectQuestion={idx => setCurrentIndex(idx)}
              isAdmin={isAdmin}
            />
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* MODE 2: STEP-BY-STEP FLASHCARD MODE                                 */}
      {/* ==================================================================== */}
      {viewMode === 'step' && (
        <div
          className={`mx-auto space-y-6 print:hidden ${
            effectivePassage ? 'max-w-[1550px] 2xl:max-w-[1750px]' : 'max-w-5xl'
          }`}
        >
          <div className='grid grid-cols-1 gap-6 lg:grid-cols-4'>
            {/* Question Area (3 cols) */}
            <div className='space-y-6 lg:col-span-3'>
              {effectivePassage && (
                /* Mobile / Tablet Collapsible Passage Header (< xl) */
                <div className='rounded-3xl border-2 border-(--border-color) bg-(--card-color) p-4 shadow-sm xl:hidden'>
                  <button
                    type='button'
                    onClick={() => {
                      playClick();
                      setIsPassageExpanded(prev => !prev);
                    }}
                    className='flex w-full items-center justify-between text-sm font-bold text-(--main-color)'
                  >
                    <span className='flex items-center gap-2'>
                      <BookOpen className='size-4 text-(--main-color)' />
                      <span>
                        {effectivePassageTitle || 'Đoạn văn đọc hiểu (Passage)'}
                      </span>
                    </span>
                    <span className='flex items-center gap-1 text-xs text-(--secondary-color) underline'>
                      <span>
                        {isPassageExpanded ? 'Thu gọn' : 'Xem bài đọc'}
                      </span>
                      {isPassageExpanded ? (
                        <ChevronUp className='size-3.5' />
                      ) : (
                        <ChevronDown className='size-3.5' />
                      )}
                    </span>
                  </button>
                  {isPassageExpanded && (
                    <div className='mt-3 max-h-72 overflow-y-auto border-t border-(--border-color)/60 pt-3 pr-1 text-base leading-loose font-normal whitespace-pre-line text-(--main-color)'>
                      <FormattedText
                        text={effectivePassage}
                        highlightBlank={String(currentIndex + 1)}
                      />
                    </div>
                  )}
                </div>
              )}

              <div
                className={`grid grid-cols-1 gap-6 ${effectivePassage ? 'xl:grid-cols-12' : ''}`}
              >
                {effectivePassage && (
                  /* Desktop Left Sticky Passage Column (>= xl) */
                  <div className='sticky top-6 hidden max-h-[78vh] flex-col self-start rounded-3xl border-2 border-(--border-color) bg-(--card-color) p-6 shadow-sm sm:p-7 xl:col-span-6 xl:flex'>
                    <div className='mb-4 flex items-center gap-2 border-b border-(--border-color)/60 pb-3'>
                      <BookOpen className='size-5 text-(--main-color)' />
                      <span className='text-base font-bold text-(--main-color)'>
                        {effectivePassageTitle || 'Đoạn văn đọc hiểu'}
                      </span>
                    </div>
                    <div className='flex-1 overflow-y-auto pr-3 text-base leading-loose font-normal tracking-wide whitespace-pre-line text-(--main-color) selection:bg-(--main-color)/20 sm:text-lg'>
                      <FormattedText
                        text={effectivePassage}
                        highlightBlank={String(currentIndex + 1)}
                      />
                    </div>
                  </div>
                )}

                {/* Right Question & Options Column */}
                <div
                  className={`relative space-y-6 overflow-hidden rounded-3xl border-2 border-(--border-color) bg-(--card-color) p-6 shadow-sm sm:p-8 ${effectivePassage ? 'xl:col-span-6' : ''}`}
                >
                  {/* Subtle Background Watermark */}
                  <ExerciseWatermark />

                  {/* Question Progress Header */}
                  <div className='flex flex-wrap items-center justify-between gap-2 border-b border-(--border-color)/60 pb-4 select-none'>
                    <div className='flex flex-wrap items-center gap-2'>
                      <span className='rounded-full border border-amber-500/30 bg-amber-500/15 px-3 py-1 text-xs font-extrabold text-amber-500'>
                        {currentQ.part_name || 'Bài 1'}
                      </span>
                      <span className='rounded-full bg-(--main-color)/15 px-3 py-1 text-xs font-bold text-(--main-color)'>
                        Câu hỏi {currentIndex + 1} / {totalQuestions}
                      </span>
                    </div>

                    <span className='text-xs text-(--secondary-color)'>
                      Đã trả lời:{' '}
                      <b className='text-(--main-color)'>{answeredCount}</b>/
                      {totalQuestions}
                    </span>
                  </div>

                  {/* Question Text */}
                  <div className='py-2 select-none'>
                    <p className='text-lg leading-relaxed font-bold tracking-wide text-(--main-color) sm:text-xl'>
                      <FormattedText text={currentQ.question} />
                    </p>
                  </div>

                  {/* Options List */}
                  <div className='space-y-3 pt-2 select-none'>
                    {currentQ.options.map((optionText, optIdx) => {
                      const letter = String.fromCharCode(65 + optIdx);
                      const circleDigit =
                        ['①', '②', '③', '④', '⑤', '⑥'][optIdx] ||
                        `(${optIdx + 1})`;
                      const qKey = String(currentQ.id || currentIndex + 1);
                      const isSelected = answers[qKey] === letter;

                      return (
                        <button
                          key={letter}
                          type='button'
                          onClick={() => handleSelectOption(qKey, letter)}
                          className={`group flex w-full items-center gap-3.5 rounded-2xl border-2 p-3.5 text-left transition-all select-none ${
                            isSelected
                              ? 'border-(--main-color) bg-(--main-color)/15 shadow-sm'
                              : 'border-(--border-color) bg-(--background-color) hover:border-(--main-color)/60'
                          }`}
                        >
                          <span
                            className={`flex size-8 shrink-0 items-center justify-center rounded-xl text-xs font-bold transition-all ${
                              isSelected
                                ? 'bg-(--main-color) text-(--background-color) shadow-sm'
                                : 'border border-(--border-color) bg-(--card-color) text-(--secondary-color) group-hover:text-(--main-color)'
                            }`}
                          >
                            {circleDigit}
                          </span>
                          <span
                            className={`font-mixed text-sm leading-relaxed font-medium ${
                              isSelected
                                ? 'font-bold text-(--main-color)'
                                : 'text-(--secondary-color) group-hover:text-(--main-color)'
                            }`}
                          >
                            <FormattedText text={optionText} />
                          </span>
                        </button>
                      );
                    })}
                  </div>

                  {/* Navigation Bottom Controls */}
                  <div className='flex items-center justify-between border-t border-(--border-color)/60 pt-6 select-none'>
                    <button
                      type='button'
                      onClick={() => {
                        playClick();
                        setCurrentIndex(prev => Math.max(0, prev - 1));
                      }}
                      disabled={currentIndex === 0}
                      className='inline-flex items-center gap-1.5 rounded-2xl border border-(--border-color) bg-(--card-color) px-4 py-2 text-xs font-semibold text-(--secondary-color) transition-all select-none hover:border-(--main-color) hover:text-(--main-color) active:scale-95 disabled:pointer-events-none disabled:opacity-40'
                    >
                      <ArrowLeft className='size-4' />
                      <span>Câu trước</span>
                    </button>

                    {currentIndex < totalQuestions - 1 ? (
                      <button
                        type='button'
                        onClick={() => {
                          playClick();
                          setCurrentIndex(prev => prev + 1);
                        }}
                        className='inline-flex items-center gap-1.5 rounded-2xl bg-(--main-color) px-5 py-2 text-xs font-bold text-(--background-color) shadow-md transition-all select-none hover:opacity-90 active:scale-95'
                      >
                        <span>Câu tiếp</span>
                        <ArrowRight className='size-4' />
                      </button>
                    ) : (
                      <button
                        type='button'
                        onClick={() => {
                          playClick();
                          setIsConfirmOpen(true);
                        }}
                        className='inline-flex items-center gap-1.5 rounded-2xl bg-(--main-color) px-5 py-2 text-xs font-bold text-(--background-color) shadow-md transition-all select-none hover:opacity-90 active:scale-95'
                      >
                        <Send className='size-3.5' />
                        <span>Nộp bài</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Step Mode Sidebar Palette (1 col) */}
            <div className='space-y-4 select-none lg:col-span-1'>
              <div className='space-y-4 rounded-3xl border-2 border-(--border-color) bg-(--card-color) p-5 shadow-sm select-none'>
                <h3 className='text-xs font-bold tracking-wider text-(--secondary-color) uppercase'>
                  Bảng câu hỏi
                </h3>

                {/* Grouped Question Palette by Part */}
                <div className='max-h-[55vh] space-y-3.5 overflow-y-auto pr-1'>
                  {groupedParts.map(part => {
                    const partAnswered = part.questions.filter(({ q, idx }) =>
                      Boolean(answers[String(q.id || idx + 1)]),
                    ).length;

                    return (
                      <div
                        key={part.partName}
                        className='space-y-1.5 rounded-2xl border border-(--border-color)/50 bg-(--background-color)/40 p-2.5'
                      >
                        <div className='flex items-center justify-between text-xs font-bold text-amber-500'>
                          <span className='truncate'>{part.partName}</span>
                          <span className='text-[10px] font-normal text-(--secondary-color)/70'>
                            {partAnswered}/{part.questions.length}
                          </span>
                        </div>

                        <div className='grid grid-cols-5 gap-1.5'>
                          {part.questions.map(({ q, idx }) => {
                            const qKey = String(q.id || idx + 1);
                            const isAnswered = Boolean(answers[qKey]);
                            const isCurrent = idx === currentIndex;

                            return (
                              <button
                                key={idx}
                                type='button'
                                onClick={() => {
                                  playClick();
                                  setCurrentIndex(idx);
                                }}
                                className={`flex size-8 items-center justify-center rounded-lg text-xs font-bold transition-all select-none ${
                                  isCurrent
                                    ? 'scale-105 bg-(--main-color) text-(--background-color) shadow-md'
                                    : isAnswered
                                      ? 'border-2 border-(--main-color) bg-(--main-color)/20 text-(--main-color)'
                                      : 'border border-(--border-color) bg-(--background-color) text-(--secondary-color) hover:border-(--main-color)'
                                }`}
                                title={`Câu ${idx + 1} (${part.partName})`}
                              >
                                {idx + 1}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Submit Button in Sidebar */}
                <button
                  type='button'
                  onClick={() => {
                    playClick();
                    setIsConfirmOpen(true);
                  }}
                  className='flex w-full items-center justify-center gap-2 rounded-2xl bg-(--main-color) py-2.5 text-xs font-bold text-(--background-color) shadow-md transition-all select-none hover:opacity-90 active:scale-95'
                >
                  <Send className='size-3.5' />
                  <span>
                    Nộp bài ({answeredCount}/{totalQuestions})
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* MOBILE STICKY FLOATING ACTION BAR (< xl screens)                     */}
      {/* ==================================================================== */}
      <div className='fixed right-4 bottom-4 left-4 z-40 flex items-center justify-between rounded-2xl border-2 border-(--border-color) bg-(--card-color)/95 p-3 shadow-2xl backdrop-blur-md xl:hidden print:hidden'>
        <div className='flex items-center gap-2 text-xs'>
          <button
            type='button'
            onClick={() => {
              playClick();
              setIsMobilePaletteOpen(true);
            }}
            className='inline-flex items-center gap-1.5 rounded-xl border border-(--border-color) bg-(--background-color) px-3 py-2 font-bold text-(--main-color)'
          >
            <SlidersHorizontal className='size-3.5' />
            <span>
              Câu {answeredCount}/{totalQuestions}
            </span>
          </button>
        </div>

        <div className='flex items-center gap-2'>
          {isAdmin && (
            <button
              type='button'
              onClick={() => {
                playClick();
                setIsPrintDialogOpen(true);
              }}
              className='rounded-xl border border-(--border-color) bg-(--background-color) p-2 text-(--main-color)'
              title='In đề thi PDF (Admin)'
            >
              <Printer className='size-4 text-blue-500' />
            </button>
          )}

          <button
            type='button'
            onClick={() => {
              playClick();
              setIsConfirmOpen(true);
            }}
            className='inline-flex items-center gap-1.5 rounded-xl bg-(--main-color) px-4 py-2 text-xs font-bold text-(--background-color) shadow-md'
          >
            <Send className='size-3.5' />
            <span>Nộp bài</span>
          </button>
        </div>
      </div>

      {/* ==================================================================== */}
      {/* MOBILE PALETTE DRAWER / MODAL                                        */}
      {/* ==================================================================== */}
      <Dialog open={isMobilePaletteOpen} onOpenChange={setIsMobilePaletteOpen}>
        <DialogContent className='max-w-md rounded-3xl border-2 border-(--border-color) bg-(--card-color) p-5 text-(--main-color)'>
          <DialogHeader>
            <DialogTitle className='flex items-center justify-between text-sm font-bold'>
              <span>
                Bảng câu hỏi ({answeredCount}/{totalQuestions})
              </span>
              {timeLimitMinutes > 0 && (
                <span className='font-mono text-xs text-amber-500'>
                  ⏱ {formatTimer(timeLeft)}
                </span>
              )}
            </DialogTitle>
          </DialogHeader>

          <div className='max-h-[50vh] overflow-y-auto py-2'>
            <div className='grid grid-cols-5 gap-2'>
              {questions.map((q, idx) => {
                const qKey = String(q.id || idx + 1);
                const isAnswered = Boolean(answers[qKey]);

                return (
                  <button
                    key={idx}
                    type='button'
                    onClick={() => {
                      playClick();
                      setIsMobilePaletteOpen(false);
                      if (viewMode === 'step') {
                        setCurrentIndex(idx);
                      } else {
                        const targetEl = document.getElementById(
                          `q-item-${idx}`,
                        );
                        targetEl?.scrollIntoView({
                          behavior: 'smooth',
                          block: 'center',
                        });
                      }
                    }}
                    className={`flex size-10 items-center justify-center rounded-xl text-xs font-bold transition-all ${
                      isAnswered
                        ? 'border-2 border-(--main-color) bg-(--main-color)/20 text-(--main-color)'
                        : 'border border-(--border-color) bg-(--background-color) text-(--secondary-color)'
                    }`}
                  >
                    {idx + 1}
                  </button>
                );
              })}
            </div>
          </div>

          <DialogFooter className='border-t border-(--border-color)/60 pt-3'>
            <button
              type='button'
              onClick={() => setIsMobilePaletteOpen(false)}
              className='w-full rounded-2xl bg-(--background-color) py-2.5 text-xs font-semibold text-(--main-color)'
            >
              Đóng
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ==================================================================== */}
      {/* PRINT DIALOG                                                         */}
      {/* ==================================================================== */}
      <ExercisePrintDialog
        isOpen={isPrintDialogOpen}
        onOpenChange={setIsPrintDialogOpen}
        onConfirmPrint={handleConfirmPrint}
        hasAnswers={answeredCount > 0}
      />

      {/* ==================================================================== */}
      {/* SUBMISSION CONFIRMATION DIALOG                                       */}
      {/* ==================================================================== */}
      <Dialog open={isConfirmOpen} onOpenChange={setIsConfirmOpen}>
        <DialogContent className='max-w-md rounded-3xl border-2 border-(--border-color) bg-(--card-color) p-6 text-(--main-color)'>
          <DialogHeader>
            <DialogTitle className='flex items-center gap-2 text-base font-bold text-(--main-color)'>
              <CheckCircle2 className='size-5 text-(--main-color)' />
              <span>Xác nhận nộp bài</span>
            </DialogTitle>
          </DialogHeader>

          <div className='space-y-3 py-3 text-xs text-(--secondary-color)'>
            {answeredCount < totalQuestions ? (
              <div className='flex items-start gap-3 rounded-2xl border border-amber-500/30 bg-amber-500/10 p-3.5 text-amber-500'>
                <AlertTriangle className='size-5 shrink-0 text-amber-500' />
                <span>
                  Bạn còn <b>{totalQuestions - answeredCount} câu</b> chưa chọn
                  đáp án. Bạn có chắc chắn muốn nộp bài?
                </span>
              </div>
            ) : (
              <p>
                Bạn đã hoàn thành đủ{' '}
                <b>
                  {totalQuestions}/{totalQuestions}
                </b>{' '}
                câu hỏi. Bạn có chắc chắn muốn nộp bài để xem điểm và lời giải?
              </p>
            )}
          </div>

          <DialogFooter className='mt-2 flex justify-end gap-2 border-t border-(--border-color)/60 pt-4'>
            <button
              type='button'
              onClick={() => {
                playClick();
                setIsConfirmOpen(false);
              }}
              className='rounded-2xl border border-(--border-color) bg-(--background-color) px-4 py-2 text-xs font-semibold text-(--secondary-color) hover:text-(--main-color)'
            >
              Làm tiếp
            </button>
            <button
              type='button'
              onClick={() => {
                playClick();
                handleSubmit();
              }}
              disabled={isSubmitting}
              className='inline-flex items-center gap-1.5 rounded-2xl bg-(--main-color) px-5 py-2 text-xs font-bold text-(--background-color) shadow-md hover:opacity-90'
            >
              {isSubmitting ? (
                <>
                  <Loader2 className='size-3.5 animate-spin' />
                  <span>Đang chấm điểm...</span>
                </>
              ) : (
                'Xác nhận nộp'
              )}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
