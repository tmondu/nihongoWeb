'use client';

import React, { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { AssessmentQuestion, AssessmentTest } from '../types';
import { useAssessmentStore } from '../store/useAssessmentStore';
import TestOverviewCard from './TestOverviewCard';
import PartSelectionCards from './PartSelectionCards';
import AssessmentHeader from './AssessmentHeader';
import McqQuestionCard from './McqQuestionCard';
import EssayQuestionCard from './EssayQuestionCard';
import QuestionMatrixModal from './QuestionMatrixModal';
import ExitConfirmModal from './ExitConfirmModal';
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
  const [isExitModalOpen, setIsExitModalOpen] = useState(false);
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

  const {
    currentView,
    activePart,
    answers,
    decrementTimer,
    exitTestPart,
    syncWithServer,
    setPartStatus,
  } = useAssessmentStore();

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // 1. Fetch test data and existing submission on mount
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
            message: 'Vui lòng đăng nhập để tham gia bài kiểm tra năng lực.',
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
  }, [syncWithServer]);

  // 2. Active timer countdown loop (ONLY when taking test and activePart is selected)
  useEffect(() => {
    if (currentView !== 'taking_test' || !activePart) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    timerRef.current = setInterval(() => {
      decrementTimer(activePart);
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [currentView, activePart, decrementTimer]);

  // 3. Prevent accidental reload/closing when in middle of taking test
  useEffect(() => {
    if (currentView !== 'taking_test') return;

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = '';
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [currentView]);

  // 4. Confirm Exit Action
  const handleConfirmExit = () => {
    if (activePart) {
      exitTestPart(activePart);
    }
    setIsExitModalOpen(false);
  };

  // 5. Jump to question
  const handleJumpToQuestion = (orderNum: number) => {
    setIsWarningOpen(false);
    setTimeout(() => {
      const el = document.getElementById(`question-${orderNum}`);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 100);
  };

  // 6. Handle Submit Current Part
  const handleSubmitPart = async () => {
    if (!test || !activePart) return;

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
        // Q181-200 composite check
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
        message: resData.message || 'Đã nộp thành công phần thi!',
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
      <div className='font-vietnamese flex min-h-[60vh] flex-col items-center justify-center px-4 text-center'>
        <div className='w-full max-w-md rounded-3xl border-2 border-(--border-color) bg-(--card-color) p-6 shadow-sm sm:p-8'>
          <h2 className='text-base font-extrabold text-(--main-color) sm:text-lg'>
            {authError.type === 'unauthorized'
              ? 'Yêu cầu đăng nhập'
              : authError.type === 'forbidden'
                ? 'Chưa cấp quyền làm bài'
                : 'Thông báo'}
          </h2>
          <p className='mt-2 text-xs leading-relaxed text-(--secondary-color) sm:text-sm'>
            {authError.message}
          </p>
          <div className='mt-6 flex flex-col gap-2.5'>
            {authError.type === 'unauthorized' ? (
              <Link
                href='/login?redirect=/assessment'
                className='rounded-2xl bg-(--main-color) px-5 py-3 text-xs font-bold text-(--background-color) shadow-md transition-all hover:opacity-90 active:scale-95'
              >
                Đăng nhập tài khoản
              </Link>
            ) : authError.type === 'forbidden' ? (
              <a
                href='https://zalo.me'
                target='_blank'
                rel='noopener noreferrer'
                className='rounded-2xl bg-(--main-color) px-5 py-3 text-xs font-bold text-(--background-color) shadow-md transition-all hover:opacity-90 active:scale-95'
              >
                Liên hệ Zalo cô Thắm để duyệt quyền
              </a>
            ) : null}
            <Link
              href='/'
              className='rounded-2xl border-2 border-(--border-color) bg-(--background-color) px-4 py-2.5 text-xs font-bold text-(--secondary-color) transition-all hover:border-(--main-color) hover:text-(--main-color) active:scale-95'
            >
              Trở về trang chủ
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Render Loading
  if (loading || !test) {
    return (
      <div className='flex min-h-[60vh] flex-col items-center justify-center gap-3.5 px-4'>
        <div className='size-10 animate-spin rounded-full border-4 border-(--border-color) border-t-(--main-color)' />
        <p className='text-xs font-bold text-(--secondary-color)'>
          Đang tải đề thi...
        </p>
      </div>
    );
  }

  // SCREEN 1: Test Overview Card
  if (currentView === 'test_overview') {
    return <TestOverviewCard test={test} />;
  }

  // SCREEN 2: Part Selection (2 distinct bento cards)
  if (currentView === 'part_selection') {
    return (
      <>
        <PartSelectionCards />
        <CompletionModal
          isOpen={completionData.isOpen}
          message={completionData.message}
          isFullyCompleted={completionData.isFullyCompleted}
          onClose={() =>
            setCompletionData(prev => ({ ...prev, isOpen: false }))
          }
        />
      </>
    );
  }

  // SCREEN 3: Taking Test (Active session for activePart only)
  const currentQuestions = questions.filter(q => q.part === activePart);

  return (
    <div className='font-vietnamese min-h-screen pb-24'>
      {/* Sticky Header */}
      <AssessmentHeader
        onOpenExitModal={() => setIsExitModalOpen(true)}
        onSubmitPart={handleSubmitPart}
        submitting={submitting}
      />

      {/* Main Content Area */}
      <main className='mx-auto max-w-4xl px-4 pt-6 sm:pt-8'>
        {/* Section Heading Banner */}
        <div className='mb-6 rounded-3xl border-2 border-(--border-color) bg-(--card-color) p-6 shadow-xs'>
          <div className='flex items-center justify-between'>
            <span className='rounded-full bg-(--main-color)/15 px-3 py-1 text-xs font-extrabold text-(--main-color) uppercase'>
              {activePart === 1 ? 'Phần 1: Trắc nghiệm' : 'Phần 2: Tự luận'}
            </span>
            <span className='text-xs font-bold text-(--secondary-color)'>
              {activePart === 1 ? 'Thời gian: 60 phút' : 'Thời gian: 80 phút'}
            </span>
          </div>
          <h2 className='mt-3 text-xl font-extrabold tracking-tight text-(--main-color)'>
            {activePart === 1 ? '100 câu trắc nghiệm' : '100 câu tự luận'}
          </h2>
          <p className='mt-1.5 text-xs leading-relaxed text-(--secondary-color)'>
            {activePart === 1
              ? 'Chọn 1 đáp án đúng (A, B, C, D) cho từng câu. Bắt buộc hoàn thành 100 câu mới được nộp bài.'
              : '80 câu điền Hiragana và 20 câu điền Âm Hán Việt cùng Nghĩa tiếng Việt. Bắt buộc làm đủ 100 câu.'}
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
        <div className='mt-8 flex flex-col items-center justify-between gap-3.5 rounded-3xl border-2 border-(--border-color) bg-(--card-color) p-5 shadow-xs sm:flex-row sm:p-6'>
          <div className='text-xs font-medium text-(--secondary-color)'>
            Bắt buộc hoàn thành 100% câu hỏi của phần này trước khi nộp.
          </div>
          <button
            type='button'
            onClick={handleSubmitPart}
            disabled={submitting}
            className='w-full cursor-pointer rounded-2xl bg-(--main-color) px-6 py-3 text-xs font-bold text-(--background-color) shadow-md transition-all hover:opacity-90 active:scale-95 disabled:pointer-events-none disabled:opacity-40 sm:w-auto sm:text-sm'
          >
            {submitting ? 'Đang nộp...' : 'Nộp bài'}
          </button>
        </div>
      </main>

      {/* Modals */}
      <QuestionMatrixModal />
      <ExitConfirmModal
        isOpen={isExitModalOpen}
        onClose={() => setIsExitModalOpen(false)}
        onConfirmExit={handleConfirmExit}
        part={activePart}
      />
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
