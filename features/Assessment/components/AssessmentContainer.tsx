'use client';

import React, { useEffect, useState, useRef, useTransition } from 'react';
import Link from 'next/link';
import { AssessmentQuestion, AssessmentTest } from '../types';
import { useAssessmentStore } from '../store/useAssessmentStore';
import AssessmentHeader from './AssessmentHeader';
import AssessmentTabs from './AssessmentTabs';
import McqQuestionCard from './McqQuestionCard';
import EssayQuestionCard from './EssayQuestionCard';
import QuestionMatrixModal from './QuestionMatrixModal';
import IncompleteWarningModal from './IncompleteWarningModal';
import CompletionModal from './CompletionModal';

export default function AssessmentContainer() {
  const [test, setTest] = useState<AssessmentTest | null>(null);
  const [questions, setQuestions] = useState<AssessmentQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState<{
    type: 'unauthorized' | 'forbidden' | 'other';
    message: string;
  } | null>(null);

  const [submitting, setSubmitting] = useState(false);
  const [missingQuestions, setMissingQuestions] = useState<number[]>([]);
  const [isWarningOpen, setIsWarningOpen] = useState(false);
  const [completionData, setCompletionData] = useState<{
    isOpen: boolean;
    message: string;
    isFullyCompleted: boolean;
  }>({
    isOpen: false,
    message: '',
    isFullyCompleted: false,
  });

  const [, startTransition] = useTransition();

  const {
    activePart,
    setActivePart,
    answers,
    mcqTimerActive,
    essayTimerActive,
    startTimer,
    decrementTimer,
    syncWithServer,
    setPartStatus,
  } = useAssessmentStore();

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // 1. Fetch test data on mount
  useEffect(() => {
    let isCancelled = false;

    async function loadTest() {
      try {
        setLoading(true);
        const res = await fetch('/api/assessment');
        if (isCancelled) return;

        if (res.status === 401) {
          setAuthError({
            type: 'unauthorized',
            message: 'Vui lòng đăng nhập để làm bài kiểm tra.',
          });
          return;
        }

        if (res.status === 403) {
          const errData = await res.json();
          setAuthError({
            type: 'forbidden',
            message:
              errData.message ||
              'Tài khoản của bạn chưa được cấp quyền tham gia bài kiểm tra. Vui lòng liên hệ Admin để được duyệt.',
          });
          return;
        }

        if (!res.ok) {
          throw new Error('Lỗi tải dữ liệu đề thi');
        }

        const data = await res.json();
        setTest(data.test);
        setQuestions(data.questions || []);

        if (data.submission) {
          syncWithServer(data.submission);
        }

        // Auto start timer for initial part
        startTransition(() => {
          startTimer(1);
        });
      } catch (err: unknown) {
        if (!isCancelled) {
          console.error(err);
          setAuthError({
            type: 'other',
            message: 'Không thể tải đề thi. Vui lòng kiểm tra lại kết nối.',
          });
        }
      } finally {
        if (!isCancelled) {
          setLoading(false);
        }
      }
    }

    void loadTest();

    return () => {
      isCancelled = true;
    };
  }, [syncWithServer, startTimer]);

  // 2. Active timer countdown loop
  useEffect(() => {
    if (activePart === 1 && !mcqTimerActive) {
      startTimer(1);
    } else if (activePart === 2 && !essayTimerActive) {
      startTimer(2);
    }

    timerRef.current = setInterval(() => {
      decrementTimer(activePart);
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [
    activePart,
    mcqTimerActive,
    essayTimerActive,
    decrementTimer,
    startTimer,
  ]);

  // 3. Jump to question
  const handleJumpToQuestion = (orderNum: number) => {
    setIsWarningOpen(false);
    const targetPart = orderNum <= 100 ? 1 : 2;
    if (activePart !== targetPart) {
      setActivePart(targetPart);
    }
    setTimeout(() => {
      const el = document.getElementById(`question-${orderNum}`);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 100);
  };

  // 4. Handle Submit Current Part
  const handleSubmitPart = async () => {
    if (!test) return;

    // Local validation check for 100% completion of current part
    const range = activePart === 1 ? [1, 100] : [101, 200];
    const missing: number[] = [];

    for (let i = range[0]; i <= range[1]; i++) {
      const val = answers[i];
      if (i <= 180) {
        if (!val || typeof val !== 'string' || val.trim().length === 0) {
          missing.push(i);
        }
      } else {
        // Q181-200
        if (!val) {
          missing.push(i);
        } else if (typeof val === 'string' && val.trim().length === 0) {
          missing.push(i);
        } else if (typeof val === 'object') {
          const comp = val as { hanViet?: string; meaning?: string };
          if (!comp.hanViet?.trim() && !comp.meaning?.trim()) {
            missing.push(i);
          }
        }
      }
    }

    if (missing.length > 0) {
      setMissingQuestions(missing);
      setIsWarningOpen(true);
      return;
    }

    // Submit to server
    try {
      setSubmitting(true);
      const res = await fetch('/api/assessment/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          testId: test.id,
          part: activePart,
          answers,
        }),
      });

      const resData = await res.json();

      if (!res.ok) {
        if (resData.missingQuestions?.length) {
          setMissingQuestions(resData.missingQuestions);
          setIsWarningOpen(true);
          return;
        }
        alert(resData.message || 'Lỗi nộp bài thi');
        return;
      }

      // Success
      setPartStatus(activePart, 'completed');
      setCompletionData({
        isOpen: true,
        message: resData.message || 'Bạn đã nộp thành công phần thi!',
        isFullyCompleted: Boolean(resData.isFullyCompleted),
      });
    } catch (err) {
      console.error(err);
      alert(
        'Không thể kết nối máy chủ để nộp bài. Vui lòng kiểm tra lại mạng.',
      );
    } finally {
      setSubmitting(false);
    }
  };

  // Render Auth Error States
  if (authError) {
    return (
      <div className='flex min-h-[60vh] flex-col items-center justify-center px-4 text-center'>
        <div className='border-border/80 bg-card w-full max-w-md rounded-2xl border p-6 shadow-sm'>
          <h2 className='text-foreground text-lg font-bold'>
            {authError.type === 'unauthorized'
              ? 'Yêu cầu đăng nhập'
              : authError.type === 'forbidden'
                ? 'Chưa cấp quyền làm bài'
                : 'Thông báo'}
          </h2>
          <p className='text-muted-foreground mt-2 text-sm leading-relaxed'>
            {authError.message}
          </p>
          <div className='mt-6 flex flex-col gap-2'>
            {authError.type === 'unauthorized' ? (
              <Link
                href='/login?redirect=/assessment'
                className='rounded-lg bg-blue-600 px-4 py-2.5 text-xs font-semibold text-white transition-all hover:bg-blue-500'
              >
                Đăng nhập tài khoản
              </Link>
            ) : authError.type === 'forbidden' ? (
              <a
                href='https://zalo.me'
                target='_blank'
                rel='noopener noreferrer'
                className='rounded-lg bg-blue-600 px-4 py-2.5 text-xs font-semibold text-white transition-all hover:bg-blue-500'
              >
                Liên hệ Zalo cô Thắm
              </a>
            ) : null}
            <Link
              href='/'
              className='hover:bg-muted text-muted-foreground hover:text-foreground rounded-lg px-4 py-2 text-xs font-semibold transition-colors'
            >
              Trở về trang chủ
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Render Loading
  if (loading) {
    return (
      <div className='flex min-h-[60vh] flex-col items-center justify-center gap-3 px-4'>
        <div className='border-border/60 size-10 animate-spin rounded-full border-4 border-t-blue-600' />
        <p className='text-muted-foreground text-sm font-medium'>
          Đang tải đề thi...
        </p>
      </div>
    );
  }

  // Filter questions for active tab
  const currentQuestions = questions.filter(q => q.part === activePart);

  return (
    <div className='min-h-screen pb-20'>
      {/* Sticky Header */}
      <AssessmentHeader
        onSubmitPart={handleSubmitPart}
        submitting={submitting}
      />

      {/* Main Content Area */}
      <main className='mx-auto max-w-5xl px-4 pt-6'>
        {/* Tabs Control */}
        <AssessmentTabs />

        {/* Section Heading */}
        <div className='border-border/60 bg-muted/30 my-6 rounded-xl border p-4 text-center'>
          <h2 className='text-foreground text-base font-bold sm:text-lg'>
            {activePart === 1
              ? 'Phần 1: Trắc nghiệm (100 câu)'
              : 'Phần 2: Tự luận (100 câu)'}
          </h2>
          <p className='text-muted-foreground mt-1 text-xs'>
            {activePart === 1
              ? 'Thời gian làm bài: 60 phút. Chọn duy nhất 1 đáp án đúng cho mỗi câu.'
              : 'Thời gian làm bài: 80 phút. Điền Hiragana, Hán Việt và Nghĩa tiếng Việt rõ ràng.'}
          </p>
        </div>

        {/* Question List */}
        <div className='flex flex-col gap-4'>
          {currentQuestions.map(q => {
            if (activePart === 1) {
              return <McqQuestionCard key={q.id} question={q} />;
            }
            return <EssayQuestionCard key={q.id} question={q} />;
          })}
        </div>

        {/* Bottom Submit Action */}
        <div className='border-border/60 bg-card mt-8 flex flex-col items-center justify-between gap-3 rounded-xl border p-4 sm:flex-row'>
          <div className='text-muted-foreground text-xs'>
            Bắt buộc hoàn thành 100% câu hỏi của phần này trước khi nộp.
          </div>
          <button
            type='button'
            onClick={handleSubmitPart}
            disabled={submitting}
            className='w-full rounded-lg bg-blue-600 px-6 py-2.5 text-xs font-semibold text-white transition-all hover:bg-blue-500 active:scale-95 sm:w-auto'
          >
            {submitting ? 'Đang nộp...' : 'Nộp bài'}
          </button>
        </div>
      </main>

      {/* Modals */}
      <QuestionMatrixModal />
      <IncompleteWarningModal
        isOpen={isWarningOpen}
        onClose={() => setIsWarningOpen(false)}
        missingQuestions={missingQuestions}
        onJumpToQuestion={handleJumpToQuestion}
      />
      <CompletionModal
        isOpen={completionData.isOpen}
        message={completionData.message}
        isFullyCompleted={completionData.isFullyCompleted}
        onClose={() => setCompletionData(prev => ({ ...prev, isOpen: false }))}
      />
    </div>
  );
}
