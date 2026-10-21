'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  BookOpen,
  FileText,
  CheckSquare,
  Search,
  X,
  Calendar,
  HelpCircle,
  ArrowRight,
  ArrowLeft,
  Layers,
  GraduationCap,
  CheckCircle2,
  FileUp,
} from 'lucide-react';
import { useClick } from '@/shared/hooks/generic/useAudio';
import type { SolutionExamSummary } from '../types';

interface ExamSelectionViewProps {
  currentLevel: string;
  onSelectLevel: (lvl: string) => void;
  exams: SolutionExamSummary[];
  onSelectExam: (examNumber: number, mode?: 'sheet' | 'checker') => void;
  isLoading?: boolean;
  isAdmin?: boolean;
  onOpenPdfImport?: () => void;
}

const LEVELS = [
  { id: 'all', label: 'Tất cả' },
  { id: 'n5', label: 'JLPT N5' },
  { id: 'n4', label: 'JLPT N4' },
  { id: 'n3', label: 'JLPT N3' },
  { id: 'n2', label: 'JLPT N2' },
  { id: 'n1', label: 'JLPT N1' },
];

export const ExamSelectionView: React.FC<ExamSelectionViewProps> = ({
  currentLevel,
  onSelectLevel,
  exams,
  onSelectExam,
  isLoading = false,
  isAdmin = false,
  onOpenPdfImport,
}) => {
  const { playClick } = useClick();
  const [searchQuery, setSearchQuery] = useState('');

  // Lọc danh sách đề thi theo level và từ khóa tìm kiếm
  const filteredExams = useMemo(() => {
    return exams.filter(ex => {
      const matchLevel =
        currentLevel === 'all' ||
        ex.level.toLowerCase() === currentLevel.toLowerCase();

      const q = searchQuery.trim().toLowerCase();
      const matchSearch =
        !q ||
        ex.title.toLowerCase().includes(q) ||
        (ex.subtitle && ex.subtitle.toLowerCase().includes(q)) ||
        `đề ${ex.examNumber}`.includes(q) ||
        `de ${ex.examNumber}`.includes(q) ||
        `đề số ${ex.examNumber}`.includes(q) ||
        String(ex.examNumber) === q;

      return matchLevel && matchSearch;
    });
  }, [exams, currentLevel, searchQuery]);

  // Đếm số lượng đề cho từng cấp độ
  const examCountByLevel = useMemo(() => {
    const counts: Record<string, number> = { all: exams.length };
    for (const ex of exams) {
      const lvl = ex.level.toLowerCase();
      counts[lvl] = (counts[lvl] || 0) + 1;
    }
    return counts;
  }, [exams]);

  return (
    <div className='min-h-screen bg-(--background-color) pb-20 text-(--main-color)'>
      {/* Top Header */}
      <header className='sticky top-0 z-30 mb-8 border-b border-(--border-color) bg-(--card-color)/90 backdrop-blur-md'>
        <div className='mx-auto flex max-w-7xl items-center justify-between gap-4 p-4'>
          <div className='flex items-center gap-3'>
            <Link
              href='/'
              onClick={playClick}
              className='flex size-9 items-center justify-center rounded-xl border border-(--border-color) bg-(--background-color) text-(--secondary-color) transition-colors hover:text-(--main-color)'
              title='Về trang chủ'
            >
              <ArrowLeft className='size-4' />
            </Link>
            <div>
              <div className='flex items-center gap-2'>
                <BookOpen className='size-5 text-(--main-color)' />
                <h1 className='text-lg font-black text-(--main-color) sm:text-xl'>
                  Kho Đề & Tra Cứu Đáp Án
                </h1>
              </div>
              <p className='text-xs text-(--secondary-color)'>
                Hệ thống đáp án chi tiết độc quyền Phan Thắm SS - Minato
              </p>
            </div>
          </div>

          <div className='flex items-center gap-3'>
            {isAdmin && onOpenPdfImport && (
              <button
                type='button'
                onClick={() => {
                  playClick();
                  onOpenPdfImport();
                }}
                className='inline-flex items-center gap-1.5 rounded-xl bg-(--main-color) px-3.5 py-1.5 text-xs font-bold text-(--background-color) shadow-2xs transition-all hover:opacity-90'
                title='Nhập đề thi mới từ file PDF bằng AI (Dành cho Quản trị viên)'
              >
                <FileUp className='size-3.5' />
                <span>Nhập Đề Bằng PDF</span>
              </button>
            )}

            <div className='hidden items-center gap-2 sm:flex'>
              <span className='inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-bold text-emerald-600 dark:text-emerald-400'>
                <CheckCircle2 className='size-3.5' />
                <span>Cập nhật liên tục</span>
              </span>
            </div>
          </div>
        </div>
      </header>

      <main className='mx-auto max-w-7xl px-4 sm:px-6'>
        {/* Hero Banner Section */}
        <div className='relative mb-8 overflow-hidden rounded-3xl border border-(--border-color) bg-gradient-to-br from-(--card-color) via-(--card-color) to-(--background-color) p-6 shadow-xs sm:p-8'>
          <div className='relative z-10 max-w-3xl'>
            <div className='inline-flex items-center gap-2 rounded-full border border-(--border-color) bg-(--background-color)/80 px-3 py-1 text-xs font-semibold text-(--secondary-color) backdrop-blur-xs'>
              <GraduationCap className='size-3.5 text-(--main-color)' />
              <span>Luyện thi JLPT chất lượng cao</span>
            </div>

            <h2 className='mt-3 text-2xl font-black tracking-tight text-(--main-color) sm:text-3xl lg:text-4xl'>
              Chọn Đề Thi Để Xem Lời Giải Chi Tiết
            </h2>

            <p className='mt-2.5 text-sm leading-relaxed text-(--secondary-color) sm:text-base'>
              Tra cứu nhanh kết quả câu hỏi, phân tích cấu trúc ngữ pháp cặn kẽ,
              chỉ rõ bẫy sai ở các phương án và luyện tập với chế độ tự chấm
              điểm thông minh.
            </p>

            {/* Quick Stat Badges */}
            <div className='mt-5 flex flex-wrap items-center gap-3 text-xs'>
              <div className='inline-flex items-center gap-1.5 rounded-xl border border-(--border-color) bg-(--background-color) px-3 py-1.5 font-semibold text-(--main-color) shadow-2xs'>
                <FileText className='size-3.5 text-(--main-color)' />
                <span>{exams.length} Đề thi có sẵn</span>
              </div>
              <div className='inline-flex items-center gap-1.5 rounded-xl border border-(--border-color) bg-(--background-color) px-3 py-1.5 font-semibold text-(--main-color) shadow-2xs'>
                <Layers className='size-3.5 text-(--main-color)' />
                <span>Trang in A4 tiêu chuẩn</span>
              </div>
              <div className='inline-flex items-center gap-1.5 rounded-xl border border-(--border-color) bg-(--background-color) px-3 py-1.5 font-semibold text-(--main-color) shadow-2xs'>
                <CheckSquare className='size-3.5 text-(--main-color)' />
                <span>Chế độ tự chấm điểm</span>
              </div>
            </div>
          </div>
        </div>

        {/* Filter Controls Bar */}
        <div className='mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
          {/* Level Tabs */}
          <div className='flex items-center gap-1.5 overflow-x-auto pb-1 text-xs'>
            {LEVELS.map(lvl => {
              const active = currentLevel === lvl.id;
              const count = examCountByLevel[lvl.id] || 0;
              return (
                <button
                  key={lvl.id}
                  type='button'
                  onClick={() => {
                    playClick();
                    onSelectLevel(lvl.id);
                  }}
                  className={`inline-flex shrink-0 items-center gap-1.5 rounded-2xl px-4 py-2 text-xs font-bold transition-all ${
                    active
                      ? 'bg-(--main-color) text-(--background-color) shadow-sm'
                      : 'border border-(--border-color) bg-(--card-color) text-(--secondary-color) hover:text-(--main-color)'
                  }`}
                >
                  <span>{lvl.label}</span>
                  {count > 0 && (
                    <span
                      className={`py-0.2 rounded-full px-1.5 text-[10px] font-extrabold ${
                        active
                          ? 'bg-(--background-color) text-(--main-color)'
                          : 'bg-(--background-color) text-(--secondary-color)'
                      }`}
                    >
                      {count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Search Box */}
          <div className='relative w-full sm:w-72'>
            <Search className='absolute top-1/2 left-3 size-4 -translate-y-1/2 text-(--secondary-color)' />
            <input
              type='text'
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder='Tìm theo tên hoặc số đề...'
              aria-label='Tìm kiếm đề thi'
              className='w-full rounded-2xl border border-(--border-color) bg-(--card-color) py-2 pr-9 pl-9 text-xs font-medium text-(--main-color) placeholder:text-(--secondary-color)/60 focus:border-(--main-color) focus:outline-hidden'
            />
            {searchQuery && (
              <button
                type='button'
                onClick={() => setSearchQuery('')}
                className='absolute top-1/2 right-2.5 -translate-y-1/2 rounded-full p-1 text-(--secondary-color) hover:text-(--main-color)'
                aria-label='Xóa tìm kiếm'
              >
                <X className='size-3.5' />
              </button>
            )}
          </div>
        </div>

        {/* Exams Grid */}
        {isLoading ? (
          <div className='grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3'>
            {[1, 2, 3].map(i => (
              <div
                key={i}
                className='animate-pulse rounded-3xl border border-(--border-color) bg-(--card-color) p-6'
              >
                <div className='h-5 w-24 rounded-lg bg-(--border-color)/40' />
                <div className='mt-4 h-6 w-3/4 rounded-lg bg-(--border-color)/40' />
                <div className='mt-2 h-4 w-1/2 rounded-lg bg-(--border-color)/30' />
                <div className='mt-8 h-10 w-full rounded-2xl bg-(--border-color)/40' />
              </div>
            ))}
          </div>
        ) : filteredExams.length > 0 ? (
          <div className='grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3'>
            {filteredExams.map(exam => (
              <div
                key={exam.id}
                className='group relative flex flex-col justify-between rounded-3xl border-2 border-(--border-color) bg-(--card-color) p-6 shadow-xs transition-all duration-300 hover:-translate-y-1.5 hover:border-(--main-color) hover:shadow-lg'
              >
                <div>
                  {/* Card Header: Level Badge & Meta Badges */}
                  <div className='flex items-center justify-between gap-2'>
                    <div className='flex items-center gap-2'>
                      <span className='inline-flex items-center rounded-full bg-(--main-color) px-3 py-1 text-xs font-extrabold tracking-wider text-(--background-color) uppercase shadow-2xs'>
                        JLPT {exam.level.toUpperCase()}
                      </span>
                      <span className='inline-flex items-center rounded-full border border-(--border-color) bg-(--background-color) px-2.5 py-1 text-xs font-bold text-(--main-color)'>
                        Đề {exam.examNumber}
                      </span>
                    </div>

                    {exam.totalPages && exam.totalPages > 0 && (
                      <span className='inline-flex items-center gap-1 text-[11px] font-semibold text-(--secondary-color)'>
                        <FileText className='size-3 text-(--main-color)' />
                        <span>{exam.totalPages} trang A4</span>
                      </span>
                    )}
                  </div>

                  {/* Exam Title & Subtitle */}
                  <div className='mt-4'>
                    <h3 className='line-clamp-2 text-lg font-black text-(--main-color) group-hover:text-(--main-color)'>
                      {exam.title}
                    </h3>
                    {exam.subtitle && (
                      <p className='mt-1.5 line-clamp-2 text-xs leading-relaxed text-(--secondary-color)'>
                        {exam.subtitle}
                      </p>
                    )}
                  </div>

                  {/* Teacher & Stats Meta */}
                  <div className='mt-5 space-y-2 border-t border-(--border-color)/60 pt-4 text-xs text-(--secondary-color)'>
                    <div className='flex items-center gap-2 font-medium'>
                      <GraduationCap className='size-3.5 text-(--main-color)' />
                      <span>{exam.author || 'Phan Thắm SS - Minato'}</span>
                    </div>

                    <div className='flex flex-wrap items-center gap-4 text-xs font-medium'>
                      {exam.totalQuestions && exam.totalQuestions > 0 && (
                        <span className='flex items-center gap-1.5'>
                          <HelpCircle className='size-3.5 text-(--main-color)' />
                          <span>{exam.totalQuestions} câu hỏi chi tiết</span>
                        </span>
                      )}

                      {exam.totalSessions && exam.totalSessions > 0 ? (
                        <span className='flex items-center gap-1.5'>
                          <Calendar className='size-3.5 text-(--main-color)' />
                          <span>{exam.totalSessions} buổi học</span>
                        </span>
                      ) : null}
                    </div>
                  </div>
                </div>

                {/* CTAs */}
                <div className='mt-6 space-y-2 border-t border-(--border-color)/60 pt-4'>
                  <button
                    type='button'
                    onClick={() => {
                      playClick();
                      onSelectExam(exam.examNumber, 'sheet');
                    }}
                    className='flex w-full items-center justify-between rounded-2xl bg-(--main-color) px-4 py-3 text-xs font-bold text-(--background-color) shadow-sm transition-all hover:opacity-90 active:scale-98'
                  >
                    <span className='flex items-center gap-2'>
                      <BookOpen className='size-4' />
                      <span>Xem Lời Giải Chi Tiết</span>
                    </span>
                    <ArrowRight className='size-4' />
                  </button>

                  <button
                    type='button'
                    onClick={() => {
                      playClick();
                      onSelectExam(exam.examNumber, 'checker');
                    }}
                    className='flex w-full items-center justify-center gap-1.5 rounded-2xl border border-(--border-color) bg-(--background-color) py-2.5 text-xs font-bold text-(--main-color) transition-all hover:border-(--main-color) hover:bg-(--card-color) active:scale-98'
                  >
                    <CheckSquare className='size-3.5' />
                    <span>Làm Bài & Tự Chấm Điểm</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* Empty state */
          <div className='mx-auto max-w-lg rounded-3xl border border-(--border-color) bg-(--card-color) p-8 text-center shadow-xs'>
            <div className='mx-auto mb-4 flex size-14 items-center justify-center rounded-2xl border border-(--border-color) bg-(--background-color) text-(--main-color)'>
              <BookOpen className='size-7' />
            </div>

            {searchQuery ? (
              <>
                <h3 className='text-lg font-bold text-(--main-color)'>
                  Không tìm thấy đề thi phù hợp
                </h3>
                <p className='mt-2 text-xs leading-relaxed text-(--secondary-color)'>
                  Không có kết quả nào cho từ khóa &ldquo;{searchQuery}&rdquo;.
                  Vui lòng thử tìm với từ khóa khác.
                </p>
                <button
                  type='button'
                  onClick={() => setSearchQuery('')}
                  className='mt-5 inline-flex items-center gap-2 rounded-xl bg-(--main-color) px-4 py-2 text-xs font-bold text-(--background-color) shadow-xs transition-opacity hover:opacity-90'
                >
                  <X className='size-3.5' />
                  <span>Xóa tìm kiếm</span>
                </button>
              </>
            ) : (
              <>
                <h3 className='text-lg font-bold text-(--main-color)'>
                  Cấp Độ JLPT {currentLevel.toUpperCase()} Đang Được Cập Nhật
                </h3>
                <p className='mt-2 text-xs leading-relaxed text-(--secondary-color)'>
                  Cô Phan Thắm SS đang biên soạn và tối ưu hệ thống lời giải chi
                  tiết cho cấp độ này. Bạn có thể tham khảo trước kho đề thi cấp
                  độ N5 có sẵn!
                </p>
                <button
                  type='button'
                  onClick={() => {
                    playClick();
                    onSelectLevel('n5');
                  }}
                  className='mt-5 inline-flex items-center gap-2 rounded-2xl bg-(--main-color) px-5 py-2.5 text-xs font-bold text-(--background-color) shadow-sm transition-opacity hover:opacity-90'
                >
                  <BookOpen className='size-4' />
                  <span>Xem Các Đề Thi Cấp Độ N5</span>
                </button>
              </>
            )}
          </div>
        )}

        {/* Feature Highlights Footer Cards */}
        <div className='mt-14 grid grid-cols-1 gap-6 border-t border-(--border-color) pt-10 sm:grid-cols-3'>
          <div className='rounded-2xl border border-(--border-color) bg-(--card-color) p-5'>
            <div className='mb-3 inline-flex size-10 items-center justify-center rounded-xl bg-(--main-color)/10 text-(--main-color)'>
              <FileText className='size-5' />
            </div>
            <h4 className='text-sm font-bold text-(--main-color)'>
              Bảng Đáp Án Nhanh
            </h4>
            <p className='mt-1 text-xs leading-relaxed text-(--secondary-color)'>
              Xem nhanh đáp án toàn bộ đề thi chỉ trong vài giây, tiện lợi cho
              việc đối chiếu kết quả bài làm.
            </p>
          </div>

          <div className='rounded-2xl border border-(--border-color) bg-(--card-color) p-5'>
            <div className='mb-3 inline-flex size-10 items-center justify-center rounded-xl bg-(--main-color)/10 text-(--main-color)'>
              <BookOpen className='size-5' />
            </div>
            <h4 className='text-sm font-bold text-(--main-color)'>
              Phân Tích Bẫy Chi Tiết
            </h4>
            <p className='mt-1 text-xs leading-relaxed text-(--secondary-color)'>
              Giải thích cặn kẽ tại sao chọn đáp án đúng và phân tích cụ thể vì
              sao các phương án khác sai.
            </p>
          </div>

          <div className='rounded-2xl border border-(--border-color) bg-(--card-color) p-5'>
            <div className='mb-3 inline-flex size-10 items-center justify-center rounded-xl bg-(--main-color)/10 text-(--main-color)'>
              <CheckSquare className='size-5' />
            </div>
            <h4 className='text-sm font-bold text-(--main-color)'>
              Chế Độ Tự Chấm Điểm
            </h4>
            <p className='mt-1 text-xs leading-relaxed text-(--secondary-color)'>
              Nhập đáp án bạn đã làm để hệ thống tự động tính điểm số, thống kê
              và lọc riêng các câu làm sai.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ExamSelectionView;
