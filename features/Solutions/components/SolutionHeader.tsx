'use client';

import React from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  BookOpen,
  Printer,
  CheckSquare,
  Layers,
  FileUp,
} from 'lucide-react';

interface SolutionHeaderProps {
  currentLevel: string;
  onSelectLevel: (lvl: string) => void;
  examNumber: number;
  availableExams: { examNumber: number; title: string }[];
  onSelectExam: (num: number) => void;
  onBackToSelection?: () => void;
  onPrint: () => void;
  viewMode: 'sheet' | 'checker';
  onToggleViewMode: (mode: 'sheet' | 'checker') => void;
  isAdmin?: boolean;
  onOpenPdfImport?: () => void;
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
  onBackToSelection,
  onPrint,
  viewMode,
  onToggleViewMode,
  isAdmin = false,
  onOpenPdfImport,
}) => {
  return (
    <header className='sticky top-0 z-30 mb-6 border-b border-(--border-color) bg-(--card-color)/90 backdrop-blur-md print:hidden'>
      <div className='mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 p-4'>
        {/* Left: Back & Title */}
        <div className='flex items-center gap-3'>
          {onBackToSelection ? (
            <button
              type='button'
              onClick={onBackToSelection}
              className='flex size-9 items-center justify-center rounded-xl border border-(--border-color) bg-(--background-color) text-(--secondary-color) transition-colors hover:text-(--main-color)'
              title='Quay lại danh sách chọn đề thi'
            >
              <ArrowLeft className='size-4' />
            </button>
          ) : (
            <Link
              href='/'
              className='flex size-9 items-center justify-center rounded-xl border border-(--border-color) bg-(--background-color) text-(--secondary-color) transition-colors hover:text-(--main-color)'
              title='Về trang chủ'
            >
              <ArrowLeft className='size-4' />
            </Link>
          )}

          <div>
            <div className='flex items-center gap-2'>
              <BookOpen className='size-5 text-(--main-color)' />
              <h1 className='text-lg font-black text-(--main-color) sm:text-xl'>
                Tra Cứu Đáp Án Chi Tiết
              </h1>
              {onBackToSelection && (
                <button
                  type='button'
                  onClick={onBackToSelection}
                  className='hidden items-center gap-1 rounded-lg border border-(--border-color) bg-(--background-color) px-2 py-0.5 text-[11px] font-bold text-(--secondary-color) transition-colors hover:text-(--main-color) md:inline-flex'
                  title='Quay lại màn chọn đề thi'
                >
                  <ArrowLeft className='size-3' />
                  <span>Đổi đề</span>
                </button>
              )}
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
          {availableExams.length > 0 && (
            <select
              value={examNumber}
              onChange={e => {
                if (e.target.value === 'back_to_list') {
                  onBackToSelection?.();
                } else {
                  onSelectExam(Number(e.target.value));
                }
              }}
              aria-label='Chọn đề thi'
              className='rounded-xl border border-(--border-color) bg-(--card-color) px-3 py-1.5 text-xs font-bold text-(--main-color)'
            >
              {onBackToSelection && (
                <option value='back_to_list'>📋 Danh sách đề thi...</option>
              )}
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

          {/* Admin Action Buttons */}
          {isAdmin && (
            <div className='flex items-center gap-1.5'>
              {onOpenPdfImport && (
                <button
                  type='button'
                  onClick={onOpenPdfImport}
                  className='inline-flex items-center gap-1.5 rounded-xl border border-(--border-color) bg-(--card-color) px-3 py-1.5 text-xs font-bold text-(--main-color) shadow-2xs transition-all hover:bg-(--background-color) active:scale-95'
                  title='Nhập đề thi mới từ file PDF bằng AI'
                >
                  <FileUp className='size-3.5' />
                  <span className='max-sm:hidden'>Nhập Đề</span>
                </button>
              )}

              <button
                type='button'
                onClick={onPrint}
                className='inline-flex items-center gap-1.5 rounded-xl bg-(--main-color) px-3.5 py-1.5 text-xs font-bold text-(--background-color) shadow-xs transition-opacity hover:opacity-90 active:scale-95'
                title='Chức năng In / Xuất PDF (Dành riêng cho Quản trị viên)'
              >
                <Printer className='size-3.5' />
                <span className='max-sm:hidden'>In / PDF</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default SolutionHeader;
