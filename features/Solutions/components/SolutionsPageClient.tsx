'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import {
  getSolutionByLevelAndExam,
  getExamSummaries,
  type SolutionExam,
  type SolutionExamSummary,
} from '../data/solutionsData';
import SolutionHeader from './SolutionHeader';
import SolutionA4Paper from './SolutionA4Paper';
import QuickAnswerChecker from './QuickAnswerChecker';
import ExamSelectionView from './ExamSelectionView';
import PdfExamImportModal from './PdfExamImportModal';
import { BookOpen, AlertCircle, Calendar } from 'lucide-react';
import { useAdminStatus } from '@/shared/hooks/generic/useAdminStatus';

export const SolutionsPageClient: React.FC = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const { isAdmin } = useAdminStatus();

  // URL parameters (derived state)
  const rawLevelParam = searchParams.get('level')?.toLowerCase();
  const currentLevel = rawLevelParam || 'n5';

  const examParamRaw = searchParams.get('exam');
  const hasExamParam =
    examParamRaw !== null &&
    examParamRaw !== '' &&
    !isNaN(parseInt(examParamRaw, 10));
  const examNumber = hasExamParam ? parseInt(examParamRaw, 10) : null;

  // View mode & answer states
  const [viewMode, setViewMode] = useState<'sheet' | 'checker'>('sheet');
  const [userAnswers, setUserAnswers] = useState<Record<number, string>>({});
  const [filterWrongOnly, setFilterWrongOnly] = useState<boolean>(false);
  const [isPdfModalOpen, setIsPdfModalOpen] = useState<boolean>(false);

  // DB Data states
  const [dbExam, setDbExam] = useState<SolutionExam | null>(null);
  const [dbExams, setDbExams] = useState<SolutionExamSummary[]>([]);
  const [sessions, setSessions] = useState<
    {
      sessionNum: number;
      sessionTitle: string;
      questionRange: string;
      isUnlocked: boolean;
    }[]
  >([]);
  const [isDbLoading, setIsDbLoading] = useState<boolean>(false);

  // Static fallback summaries derived synchronously
  const staticSummaries = useMemo(() => {
    return getExamSummaries(currentLevel);
  }, [currentLevel]);

  // Static fallback exam for current selection
  const staticCurrentExam = useMemo(() => {
    if (examNumber === null) return null;
    return getSolutionByLevelAndExam(currentLevel, examNumber);
  }, [currentLevel, examNumber]);

  // Merged available exams: use DB list if available, otherwise static summaries
  const availableExams = dbExams.length > 0 ? dbExams : staticSummaries;
  const currentExam = dbExam || staticCurrentExam;

  // Fetch dữ liệu đề thi và các buổi học động từ DB (/api/solutions)
  useEffect(() => {
    let isMounted = true;

    void (async () => {
      try {
        setIsDbLoading(true);
        const queryUrl =
          examNumber !== null
            ? `/api/solutions?level=${currentLevel}&exam=${examNumber}`
            : `/api/solutions?level=${currentLevel}`;

        const res = await fetch(queryUrl, { cache: 'no-store' });
        if (!res.ok) return;
        const data = await res.json();
        if (!isMounted || !data?.success) return;

        if (data.currentExam && examNumber !== null) {
          setDbExam(data.currentExam);
        }
        if (
          Array.isArray(data.availableExams) &&
          data.availableExams.length > 0
        ) {
          setDbExams(data.availableExams);
        }
        if (Array.isArray(data.sessions)) {
          setSessions(data.sessions);
        }
      } catch {
        // Giữ nguyên static data nếu DB không phản hồi
      } finally {
        if (isMounted) {
          setIsDbLoading(false);
        }
      }
    })();

    return () => {
      isMounted = false;
    };
  }, [currentLevel, examNumber]);

  // Load saved answers from localStorage asynchronously when exam is active
  useEffect(() => {
    if (examNumber === null) return;
    void (async () => {
      await Promise.resolve();
      try {
        const saved = localStorage.getItem(
          `solutions_answers_${currentLevel}_${examNumber}`,
        );
        setUserAnswers(saved ? JSON.parse(saved) : {});
      } catch {
        setUserAnswers({});
      }
    })();
  }, [currentLevel, examNumber]);

  // Navigation Handlers
  const handleSelectLevel = (lvl: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('level', lvl);
    // Khi đổi cấp độ, quay về màn chọn đề thi của cấp độ đó
    params.delete('exam');
    setDbExam(null);
    setSessions([]);
    router.push(`${pathname}?${params.toString()}`);
  };

  const handleOpenExam = (num: number, mode: 'sheet' | 'checker' = 'sheet') => {
    setViewMode(mode);
    const params = new URLSearchParams(searchParams.toString());
    params.set('level', currentLevel === 'all' ? 'n5' : currentLevel);
    params.set('exam', String(num));
    router.push(`${pathname}?${params.toString()}`);
  };

  const handleBackToSelection = () => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete('exam');
    setDbExam(null);
    setSessions([]);
    router.push(`${pathname}?${params.toString()}`);
  };

  const handleSelectExamNumber = (num: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('exam', String(num));
    setDbExam(null);
    router.push(`${pathname}?${params.toString()}`);
  };

  const handleSelectAnswer = (globalNum: number, option: string) => {
    if (examNumber === null) return;
    setUserAnswers(prev => {
      const next = { ...prev, [globalNum]: option };
      try {
        localStorage.setItem(
          `solutions_answers_${currentLevel}_${examNumber}`,
          JSON.stringify(next),
        );
      } catch {
        // ignore storage errors
      }
      return next;
    });
  };

  const handleClearAnswers = () => {
    if (examNumber === null) return;
    setUserAnswers({});
    try {
      localStorage.removeItem(
        `solutions_answers_${currentLevel}_${examNumber}`,
      );
    } catch {
      // ignore storage errors
    }
  };

  const handlePrint = () => {
    if (!isAdmin) return;
    window.print();
  };

  const existingExamNumbers = useMemo(() => {
    return availableExams
      .filter(
        e =>
          currentLevel === 'all' ||
          e.level?.toLowerCase() === currentLevel.toLowerCase(),
      )
      .map(e => e.examNumber);
  }, [availableExams, currentLevel]);

  const handleImportSuccess = (newExam: SolutionExam) => {
    setDbExam(newExam);
    handleOpenExam(newExam.examNumber, 'sheet');
  };

  // MÀN 1: Nếu người dùng chưa chọn đề thi (truy cập /solutions) -> Hiển thị Màn chọn đề thi
  if (examNumber === null) {
    return (
      <>
        <ExamSelectionView
          currentLevel={currentLevel}
          onSelectLevel={handleSelectLevel}
          exams={availableExams}
          onSelectExam={handleOpenExam}
          isLoading={isDbLoading && availableExams.length === 0}
          isAdmin={isAdmin}
          onOpenPdfImport={() => setIsPdfModalOpen(true)}
        />
        <PdfExamImportModal
          isOpen={isPdfModalOpen}
          onClose={() => setIsPdfModalOpen(false)}
          defaultLevel={currentLevel === 'all' ? 'n5' : currentLevel}
          existingExamNumbers={existingExamNumbers}
          onImportSuccess={handleImportSuccess}
        />
      </>
    );
  }

  // MÀN 2: Người dùng đã chọn đề thi -> Hiển thị Chi tiết đáp án & Tự chấm
  return (
    <div className='min-h-screen bg-(--background-color) pb-16 text-(--main-color) print:bg-white print:p-0'>
      {/* Top sticky bar */}
      <SolutionHeader
        currentLevel={currentLevel}
        onSelectLevel={handleSelectLevel}
        examNumber={examNumber}
        availableExams={
          availableExams.length > 0
            ? availableExams
            : [{ examNumber, title: `Đề ${examNumber}` }]
        }
        onSelectExam={handleSelectExamNumber}
        onBackToSelection={handleBackToSelection}
        onPrint={handlePrint}
        viewMode={viewMode}
        onToggleViewMode={setViewMode}
        isAdmin={isAdmin}
        onOpenPdfImport={() => setIsPdfModalOpen(true)}
      />

      <PdfExamImportModal
        isOpen={isPdfModalOpen}
        onClose={() => setIsPdfModalOpen(false)}
        defaultLevel={currentLevel === 'all' ? 'n5' : currentLevel}
        existingExamNumbers={existingExamNumbers}
        onImportSuccess={handleImportSuccess}
      />

      <main className='mx-auto max-w-7xl px-4 sm:px-6'>
        {currentExam ? (
          <div className='grid grid-cols-1 items-start gap-8 lg:grid-cols-12'>
            {/* Cột trái / trung tâm: Trang giấy A4 */}
            <div
              className={`${viewMode === 'checker' ? 'lg:col-span-8' : 'lg:col-span-12'}`}
            >
              {/* Thông tin tiến độ các buổi dạy (từ DB) */}
              {sessions.length > 0 && (
                <div className='mb-6 rounded-2xl border border-(--border-color) bg-(--card-color) p-4 shadow-xs print:hidden'>
                  <div className='mb-2.5 flex items-center gap-2'>
                    <Calendar className='size-4 text-(--main-color)' />
                    <span className='text-xs font-bold tracking-wide text-(--main-color) uppercase'>
                      Tiến độ buổi học ({sessions.length} buổi):
                    </span>
                  </div>
                  <div className='flex flex-wrap items-center gap-2'>
                    {sessions.map(s => (
                      <div
                        key={s.sessionNum}
                        className={`inline-flex items-center gap-2 rounded-xl border px-3 py-1.5 text-xs font-medium transition-all ${
                          s.isUnlocked
                            ? 'border-emerald-300 bg-emerald-50/70 text-emerald-800 dark:border-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-300'
                            : 'border-slate-200 bg-slate-50 text-slate-500 dark:border-slate-800 dark:bg-slate-900/60 dark:text-slate-400'
                        }`}
                      >
                        <span className='font-bold'>{s.sessionTitle}</span>
                        <span className='rounded bg-black/5 px-1.5 py-0.5 font-mono text-[11px] dark:bg-white/10'>
                          Câu {s.questionRange}
                        </span>
                        {s.isUnlocked ? (
                          <span className='rounded-full bg-emerald-600 px-2 py-0.5 text-[10px] font-bold text-white uppercase shadow-2xs'>
                            Đã mở
                          </span>
                        ) : (
                          <span className='rounded-full bg-slate-300 px-2 py-0.5 text-[10px] font-bold text-slate-700 uppercase dark:bg-slate-700 dark:text-slate-300'>
                            Đang khóa
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <SolutionA4Paper
                exam={currentExam}
                userAnswers={userAnswers}
                onSelectAnswer={handleSelectAnswer}
                filterWrongOnly={filterWrongOnly}
              />
            </div>

            {/* Cột phải: Bảng chấm điểm & Tra cứu tương tác (chỉ hiện khi bật chế độ checker) */}
            {viewMode === 'checker' && (
              <div className='sticky top-24 hidden lg:col-span-4 lg:block print:hidden'>
                <QuickAnswerChecker
                  exam={currentExam}
                  userAnswers={userAnswers}
                  onSelectAnswer={handleSelectAnswer}
                  onClearAnswers={handleClearAnswers}
                  filterWrongOnly={filterWrongOnly}
                  onToggleFilterWrong={() => setFilterWrongOnly(prev => !prev)}
                  onPrint={handlePrint}
                  isAdmin={isAdmin}
                />
              </div>
            )}
          </div>
        ) : (
          <div className='mx-auto max-w-md rounded-2xl border border-(--border-color) bg-(--card-color) p-8 text-center shadow-lg'>
            <AlertCircle className='mx-auto mb-3 size-10 text-amber-500' />
            <h3 className='text-lg font-bold text-(--main-color)'>
              Đang Cập Nhật Đề Thi {currentLevel.toUpperCase()}
            </h3>
            <p className='mt-2 text-sm text-(--secondary-color)'>
              Đáp án chi tiết cho đề số {examNumber} cấp độ{' '}
              {currentLevel.toUpperCase()} đang được cô Phan Thắm SS cập nhật.
            </p>
            <div className='mt-5 flex flex-wrap items-center justify-center gap-3'>
              <button
                type='button'
                onClick={handleBackToSelection}
                className='inline-flex items-center gap-2 rounded-xl border border-(--border-color) bg-(--background-color) px-4 py-2 text-sm font-bold text-(--main-color) shadow-xs transition-opacity hover:opacity-90'
              >
                <span>Xem danh sách đề khác</span>
              </button>
              <button
                type='button'
                onClick={() => handleOpenExam(1)}
                className='inline-flex items-center gap-2 rounded-xl bg-(--main-color) px-4 py-2 text-sm font-bold text-(--background-color) shadow-xs transition-opacity hover:opacity-90'
              >
                <BookOpen className='size-4' />
                <span>Xem Đề 1 (N5)</span>
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default SolutionsPageClient;
