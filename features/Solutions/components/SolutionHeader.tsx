'use client';

import React from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  BookOpen,
  Printer,
  CheckSquare,
  Layers,
} from 'lucide-react';

interface SolutionHeaderProps {
  currentLevel: string;
  onSelectLevel: (lvl: string) => void;
  examNumber: number;
  availableExams: { examNumber: number; title: string }[];
  onSelectExam: (num: number) => void;
  onPrint: () => void;
  viewMode: 'sheet' | 'checker';
  onToggleViewMode: (mode: 'sheet' | 'checker') => void;
  isAdmin?: boolean;
}

const LEVELS = [
  { id: 'n5', label: 'JLPT N5' },
  { id: 'n4', label: 'JLPT N4' },
  { id: 'n3', label: 'JLPT N3' },
  { id: 'n2', label: 'JLPT N2' },
  { id: 'n1', label: 'JLPT N1' },
];

export const SolutionHeader: React.FC<SolutionHeaderProps> = ({
  currentLevel,
  onSelectLevel,
  examNumber,
  availableExams,
  onSelectExam,
  onPrint,
  viewMode,
  onToggleViewMode,
  isAdmin = false,
}) => {
  return (
    <header className='sticky top-0 z-30 mb-6 border-b border-(--border-color) bg-(--card-color)/90 backdrop-blur-md print:hidden'>
      <div className='mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 p-4'>
        {/* Left: Back & Title */}
        <div className='flex items-center gap-3'>
          <Link
            href='/'
            className='flex size-9 items-center justify-center rounded-xl border border-(--border-color) bg-(--background-color) text-(--secondary-color) transition-colors hover:text-(--main-color)'
            title='Về trang chủ'
          >
            <ArrowLeft className='size-4' />
          </Link>
          <div>
            <div className='flex items-center gap-2'>
              <BookOpen className='size-5 text-(--main-color)' />
              <h1 className='text-lg font-black text-(--main-color) sm:text-xl'>
                Tra Cứu Đáp Án Chi Tiết
              </h1>
            </div>
            <p className='text-xs text-(--secondary-color)'>
              Hệ thống tra cứu lời giải bài tập Phan Thắm SS - Minato
            </p>
          </div>
        </div>

        {/* Center: Level Selector */}
        <div className='flex items-center gap-1 rounded-xl border border-(--border-color) bg-(--background-color) p-1'>
          {LEVELS.map(lvl => (
            <button
              key={lvl.id}
              type='button'
              onClick={() => onSelectLevel(lvl.id)}
              className={`rounded-lg px-3 py-1.5 text-xs font-bold transition-all ${
                currentLevel === lvl.id
                  ? 'bg-(--main-color) text-(--background-color) shadow-xs'
                  : 'text-(--secondary-color) hover:text-(--main-color)'
              }`}
            >
              {lvl.label}
            </button>
          ))}
        </div>

        {/* Right: Actions */}
        <div className='flex items-center gap-2'>
          {/* Exam Selector if multiple */}
          {availableExams.length > 1 && (
            <select
              value={examNumber}
              onChange={e => onSelectExam(Number(e.target.value))}
              aria-label='Chọn đề thi'
              className='rounded-xl border border-(--border-color) bg-(--card-color) px-3 py-1.5 text-xs font-bold text-(--main-color)'
            >
              {availableExams.map(ex => (
                <option key={ex.examNumber} value={ex.examNumber}>
                  Đề số {ex.examNumber}
                </option>
              ))}
            </select>
          )}

          {/* Mode Switcher */}
          <div className='flex items-center rounded-xl border border-(--border-color) bg-(--background-color) p-1'>
            <button
              type='button'
              onClick={() => onToggleViewMode('sheet')}
              className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition-all ${
                viewMode === 'sheet'
                  ? 'bg-(--card-color) text-(--main-color) shadow-xs'
                  : 'text-(--secondary-color) hover:text-(--main-color)'
              }`}
            >
              <Layers className='size-3.5' />
              <span className='max-sm:hidden'>Trang A4</span>
            </button>
            <button
              type='button'
              onClick={() => onToggleViewMode('checker')}
              className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition-all ${
                viewMode === 'checker'
                  ? 'bg-(--card-color) text-(--main-color) shadow-xs'
                  : 'text-(--secondary-color) hover:text-(--main-color)'
              }`}
            >
              <CheckSquare className='size-3.5' />
              <span>Tự Chấm</span>
            </button>
          </div>

          {/* Print Button (Admin Only) */}
          {isAdmin && (
            <button
              type='button'
              onClick={onPrint}
              className='inline-flex items-center gap-1.5 rounded-xl bg-(--main-color) px-3.5 py-1.5 text-xs font-bold text-(--background-color) shadow-xs transition-opacity hover:opacity-90 active:scale-95'
              title='Chức năng In / Xuất PDF (Dành riêng cho Quản trị viên)'
            >
              <Printer className='size-3.5' />
              <span className='max-sm:hidden'>In / PDF (Admin)</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};

export default SolutionHeader;
