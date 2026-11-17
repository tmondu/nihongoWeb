'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Link } from '@/core/i18n/routing';
import {
  ArrowLeft,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  Send,
  Printer,
  SlidersHorizontal,
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
import { ExerciseA4Paper, type PenTool } from './ExerciseA4Paper';
import { ExerciseA4Sidebar } from './ExerciseA4Sidebar';
import { ExercisePrintDialog } from './ExercisePrintDialog';
import { PrintGuard } from './PrintGuard';
import { cn } from '@/shared/utils/utils';
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
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [timeLeft, setTimeLeft] = useState(timeLimitMinutes * 60);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isPrintDialogOpen, setIsPrintDialogOpen] = useState(false);
  const [printCleanMode, setPrintCleanMode] = useState(false);
  const [isMobilePaletteOpen, setIsMobilePaletteOpen] = useState(false);
  const [result, setResult] = useState<SubmitExerciseResponse | null>(null);
  const [penTool, setPenTool] = useState<PenTool | null>(null);

  const startTimeRef = useRef<number>(Date.now());
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const currentQ = questions[currentIndex] || questions[0];
  const totalQuestions = questions.length;
  const answeredCount = Object.keys(answers).length;

  // Sync index if questions change
  useEffect(() => {
    if (questions.length > 0 && currentIndex >= questions.length) {
      setCurrentIndex(0);
    }
  }, [questions, currentIndex]);

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

  // Chặn Ctrl/Cmd+P với người không phải admin (lớp phụ; PrintGuard ẩn nội dung khi in)
  useEffect(() => {
    if (isAdmin) return;
    const blockPrintShortcut = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'p') {
        e.preventDefault();
      }
    };
    window.addEventListener('keydown', blockPrintShortcut);
    return () => window.removeEventListener('keydown', blockPrintShortcut);
  }, [isAdmin]);

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
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentIndex, currentQ, result, playClick]);

  // Option selection
  const handleSelectOption = (qKey: string, letter: string) => {
    playClick();
    setAnswers(prev => ({
      ...prev,
      [qKey]: letter,
    }));
  };

  // Bỏ khoanh (bấm lại đáp án đang chọn)
  const handleClearOption = (qKey: string) => {
    playClick();
    setAnswers(prev => {
      const next = { ...prev };
      delete next[qKey];
      return next;
    });
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
      <PrintGuard blocked={!isAdmin}>
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
      </PrintGuard>
    );
  }

  return (
    <PrintGuard blocked={!isAdmin}>
      <div className='mx-auto min-h-screen px-3 py-4 sm:px-6 sm:py-6 lg:px-8'>
        {/* Thanh trên: phẳng, cùng ngôn ngữ với tờ đề và phiếu đáp án */}
        <header className='paper-vi sticky top-2 z-30 mx-auto mb-6 flex max-w-7xl items-stretch border border-[#1d1d1b] bg-[#fffdf7] text-[#1d1d1b] shadow-[0_8px_20px_-14px_rgba(60,50,30,0.55)] select-none print:hidden'>
          <Link
            href='/exercises'
            onClick={playClick}
            className='flex shrink-0 items-center gap-2 border-r border-[#1d1d1b] px-3 text-xs font-semibold transition-colors hover:bg-black/5 sm:px-4'
          >
            <ArrowLeft className='size-4' />
            <span className='hidden sm:inline'>Danh sách</span>
          </Link>

          <h1 className='min-w-0 flex-1 truncate px-3 py-3 text-sm font-bold sm:px-5 sm:text-base'>
            <FormattedText text={title} paper />
          </h1>

          <div className='flex shrink-0 items-stretch divide-x divide-[#1d1d1b] border-l border-[#1d1d1b]'>
            <div className='hidden items-center gap-1.5 px-4 font-mono text-xs tabular-nums md:flex'>
              <span className='paper-vi text-[#55524b]'>Đã làm</span>
              <span className='font-semibold'>
                {answeredCount}/{totalQuestions}
              </span>
            </div>

            {timeLimitMinutes > 0 && (
              <div
                className={cn(
                  'flex items-center gap-2 px-3 font-mono text-sm font-semibold tabular-nums sm:px-4',
                  timeLeft <= 300 && 'bg-[#c4372b] text-[#fffdf7]',
                )}
              >
                <Clock className='size-3.5' />
                <span>{formatTimer(timeLeft)}</span>
              </div>
            )}

            {/* In đề / xuất PDF: chỉ admin */}
            {isAdmin && (
              <button
                type='button'
                onClick={() => {
                  playClick();
                  setIsPrintDialogOpen(true);
                }}
                className='flex items-center gap-2 px-3 text-xs font-semibold transition-colors hover:bg-black/5 sm:px-4'
                title='In đề thi ra PDF (dành cho Admin)'
              >
                <Printer className='size-4' />
                <span className='hidden lg:inline'>In / Xuất PDF</span>
              </button>
            )}

            <button
              type='button'
              onClick={() => {
                playClick();
                setIsConfirmOpen(true);
              }}
              className='flex items-center gap-2 bg-[#1d1d1b] px-4 text-xs font-bold text-[#fffdf7] transition-opacity hover:opacity-90 active:translate-y-px sm:px-5'
            >
              <Send className='size-3.5' />
              <span className='hidden sm:inline'>Nộp bài</span>
            </button>
          </div>
        </header>

        <div className='mx-auto grid max-w-7xl grid-cols-1 gap-8 p-3 sm:p-8 xl:grid-cols-12 print:p-0'>
          {/* Main A4 Document Column (9 cols on xl) */}
          <main className='w-full xl:col-span-9'>
            <ExerciseA4Paper
              title={title}
              timeLimitMinutes={timeLimitMinutes}
              totalQuestions={totalQuestions}
              questions={questions}
              answers={answers}
              onSelectOption={handleSelectOption}
              onClearOption={handleClearOption}
              penTool={penTool}
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
              activeQuestionIndex={currentIndex}
              onSelectQuestion={idx => setCurrentIndex(idx)}
              onSelectOption={handleSelectOption}
              onClearOption={handleClearOption}
              penTool={penTool}
              onPenToolChange={setPenTool}
              isAdmin={isAdmin}
            />
          </div>
        </div>

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
        <Dialog
          open={isMobilePaletteOpen}
          onOpenChange={setIsMobilePaletteOpen}
        >
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
                        setCurrentIndex(idx);
                        document
                          .getElementById(`q-item-${idx}`)
                          ?.scrollIntoView({
                            behavior: 'smooth',
                            block: 'center',
                          });
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
                    Bạn còn <b>{totalQuestions - answeredCount} câu</b> chưa
                    chọn đáp án. Bạn có chắc chắn muốn nộp bài?
                  </span>
                </div>
              ) : (
                <p>
                  Bạn đã hoàn thành đủ{' '}
                  <b>
                    {totalQuestions}/{totalQuestions}
                  </b>{' '}
                  câu hỏi. Bạn có chắc chắn muốn nộp bài để xem điểm và lời
                  giải?
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
    </PrintGuard>
  );
};
