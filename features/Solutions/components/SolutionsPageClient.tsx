'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import {
  getSolutionByLevelAndExam,
  getSolutionsByLevel,
  EXAM_1_N5_SOLUTION,
} from '../data/solutionsData';
import SolutionHeader from './SolutionHeader';
import SolutionA4Paper from './SolutionA4Paper';
import QuickAnswerChecker from './QuickAnswerChecker';
import { BookOpen, AlertCircle } from 'lucide-react';
import { useAdminStatus } from '@/shared/hooks/generic/useAdminStatus';

export const SolutionsPageClient: React.FC = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const { isAdmin } = useAdminStatus();

  const levelParam = (searchParams.get('level')?.toLowerCase() ||
    'n5') as string;
  const examParam = parseInt(searchParams.get('exam') || '1', 10);

  const [currentLevel, setCurrentLevel] = useState<string>(levelParam);
  const [examNumber, setExamNumber] = useState<number>(examParam);
  const [viewMode, setViewMode] = useState<'sheet' | 'checker'>('sheet');
  const [userAnswers, setUserAnswers] = useState<Record<number, string>>({});
  const [filterWrongOnly, setFilterWrongOnly] = useState<boolean>(false);

  // Sync state with URL params
  useEffect(() => {
    if (levelParam !== currentLevel) {
      setCurrentLevel(levelParam);
    }
    if (examParam !== examNumber) {
      setExamNumber(examParam);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [levelParam, examParam]);

  // Load saved answers from localStorage if available
  useEffect(() => {
    try {
      const saved = localStorage.getItem(
        `solutions_answers_${currentLevel}_${examNumber}`,
      );
      if (saved) {
        setUserAnswers(JSON.parse(saved));
      } else {
        setUserAnswers({});
      }
    } catch {
      setUserAnswers({});
    }
  }, [currentLevel, examNumber]);

  const handleSelectLevel = (lvl: string) => {
    setCurrentLevel(lvl);
    setExamNumber(1);
    const params = new URLSearchParams(searchParams.toString());
    params.set('level', lvl);
    params.set('exam', '1');
    router.push(`${pathname}?${params.toString()}`);
  };

  const handleSelectExam = (num: number) => {
    setExamNumber(num);
    const params = new URLSearchParams(searchParams.toString());
    params.set('exam', num.toString());
    router.push(`${pathname}?${params.toString()}`);
  };

  const handleSelectAnswer = (globalNum: number, option: string) => {
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

  const currentExam =
    getSolutionByLevelAndExam(currentLevel, examNumber) ||
    (currentLevel === 'n5' ? EXAM_1_N5_SOLUTION : null);
  const availableExams = getSolutionsByLevel(currentLevel).map(e => ({
    examNumber: e.examNumber,
    title: e.title,
  }));

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
            : [{ examNumber: 1, title: 'Đề 1' }]
        }
        onSelectExam={handleSelectExam}
        onPrint={handlePrint}
        viewMode={viewMode}
        onToggleViewMode={setViewMode}
        isAdmin={isAdmin}
      />

      <main className='mx-auto max-w-7xl px-4 sm:px-6'>
        {currentExam ? (
          <div className='grid grid-cols-1 items-start gap-8 lg:grid-cols-12'>
            {/* Cột trái / trung tâm: Trang giấy A4 */}
            <div
              className={`${viewMode === 'checker' ? 'lg:col-span-8' : 'lg:col-span-12'}`}
            >
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
              Đáp án chi tiết cho cấp độ {currentLevel.toUpperCase()} đang được
              cô Phan Thắm SS cập nhật.
            </p>
            <button
              type='button'
              onClick={() => handleSelectLevel('n5')}
              className='mt-5 inline-flex items-center gap-2 rounded-xl bg-(--main-color) px-4 py-2 text-sm font-bold text-(--background-color) shadow-xs transition-opacity hover:opacity-90'
            >
              <BookOpen className='size-4' />
              <span>Xem Đề 1 (Cấp độ N5)</span>
            </button>
          </div>
        )}
      </main>
    </div>
  );
};

export default SolutionsPageClient;
