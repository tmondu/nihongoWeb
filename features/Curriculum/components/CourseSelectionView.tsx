'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from '@/core/i18n/routing';
import {
  GraduationCap,
  CheckCircle2,
  ArrowRight,
  Lock,
  Award,
  Clock,
  Compass,
} from 'lucide-react';
import type { ThamLesson, CurriculumLevel } from '../types';
import { LESSONS_METADATA } from '../data/curriculumData';

export interface CourseSelectionViewProps {
  onSelectCourse?: (course: CurriculumLevel) => void;
  lessons?: ThamLesson[];
}

interface CourseConfig {
  id: CurriculumLevel;
  level: string;
  badgeText: string;
  badgeColorClass: string;
  title: string;
  jpTitle: string;
  subtitle: string;
  lessonsRange: string;
  isAvailable: boolean;
  totalLessons: number;
  grammarCount?: number;
  vocabCount?: number;
  gradient: string;
  glowColor: string;
  btnColorClass: string;
  highlights: string[];
}

const COURSES: CourseConfig[] = [
  {
    id: 'n5',
    level: 'JLPT N5',
    badgeText: 'N5 SƠ CẤP',
    badgeColorClass:
      'bg-sky-500/10 text-sky-600 border-sky-500/20 dark:text-sky-400',
    title: 'Minna no Nihongo I',
    jpTitle: 'みんなの日本語 初級 I',
    subtitle:
      'Khóa học khởi đầu hoàn hảo: Chữ cái Hiragana/Katakana, ngữ điệu, chào hỏi và cấu trúc ngữ pháp nền tảng.',
    lessonsRange: 'Bài 1 - 25 (25 bài)',
    isAvailable: true,
    totalLessons: 25,
    grammarCount: 108,
    vocabCount: 382,
    gradient: 'from-sky-500 to-blue-600',
    glowColor: 'group-hover:shadow-sky-500/10',
    btnColorClass: 'bg-sky-500 text-white hover:bg-sky-600',
    highlights: [
      '25 bài học trọn vẹn lý thuyết & thực hành',
      '108 mẫu câu ngữ pháp trọng điểm có âm thanh',
      '382 từ vựng chuẩn Minna kèm Hán tự & ví dụ',
    ],
  },
  {
    id: 'n4',
    level: 'JLPT N4',
    badgeText: 'N4 TRUNG SƠ CẤP',
    badgeColorClass:
      'bg-emerald-500/10 text-emerald-600 border-emerald-500/20 dark:text-emerald-400',
    title: 'Minna no Nihongo II',
    jpTitle: 'みんなの日本語 初級 II',
    subtitle:
      'Mở rộng khả năng giao tiếp: Thể khả năng, ý chí, điều kiện, bị động, sai khiến và kính ngữ căn bản.',
    lessonsRange: 'Bài 26 - 50 (25 bài)',
    isAvailable: true,
    totalLessons: 25,
    grammarCount: 70,
    vocabCount: 182,
    gradient: 'from-emerald-500 to-teal-600',
    glowColor: 'group-hover:shadow-emerald-500/10',
    btnColorClass: 'bg-emerald-600 text-white hover:bg-emerald-700',
    highlights: [
      '25 bài học nâng cấp tư duy diễn đạt câu',
      '70 mẫu câu ngữ pháp nâng cao thực tế',
      '182 từ vựng và cấu trúc giao tiếp thông dụng',
    ],
  },
  {
    id: 'n3',
    level: 'JLPT N3',
    badgeText: 'N3 TRUNG CẤP',
    badgeColorClass:
      'bg-indigo-500/10 text-indigo-600 border-indigo-500/20 dark:text-indigo-400',
    title: 'Trung Cấp Tổng Hợp',
    jpTitle: '中級総合日本語 N3',
    subtitle:
      'Bước chuyển mình quan trọng: Đọc hiểu văn bản trung cấp, sắc thái liên từ, ngữ pháp câu phức và biểu đạt tự nhiên.',
    lessonsRange: 'Bài 51 - 70 (20 bài)',
    isAvailable: true,
    totalLessons: 20,
    grammarCount: 80,
    vocabCount: 100,
    gradient: 'from-indigo-500 to-purple-600',
    glowColor: 'group-hover:shadow-indigo-500/10',
    btnColorClass: 'bg-indigo-600 text-white hover:bg-indigo-700',
    highlights: [
      '20 bài học trung cấp chuẩn JLPT N3 & Soumatome',
      '80 mẫu câu phân biệt sắc thái, liên từ và cấu trúc phức',
      '100 từ vựng và thuật ngữ chuyên đề kèm ví dụ và audio',
    ],
  },
  {
    id: 'n2',
    level: 'JLPT N2',
    badgeText: 'N2 CAO CẤP',
    badgeColorClass:
      'bg-amber-500/10 text-amber-600 border-amber-500/20 dark:text-amber-400',
    title: 'Trung Cao Cấp Chuyên Sâu',
    jpTitle: '上級への日本語 N2',
    subtitle:
      'Tiếng Nhật thương mại và công sở: Xử lý bài viết luận, văn phong tin tức xã hội, kính ngữ và phỏng vấn doanh nghiệp.',
    lessonsRange: 'Bài 71 - 90 (20 bài)',
    isAvailable: true,
    totalLessons: 20,
    grammarCount: 80,
    vocabCount: 100,
    gradient: 'from-amber-500 to-orange-600',
    glowColor: 'group-hover:shadow-amber-500/10',
    btnColorClass: 'bg-amber-600 text-white hover:bg-amber-700',
    highlights: [
      '20 bài học chuyên sâu về văn phong thương mại & tin tức',
      '80 cấu trúc ngữ pháp trang trọng, nghi thức và xã luận',
      '100 từ vựng công sở, thời sự và kinh tế có giải nghĩa chi tiết',
    ],
  },
  {
    id: 'n1',
    level: 'JLPT N1',
    badgeText: 'N1 THƯỢNG CẤP',
    badgeColorClass:
      'bg-rose-500/10 text-rose-600 border-rose-500/20 dark:text-rose-400',
    title: 'Thượng Cấp Học Thuật',
    jpTitle: '最高峰・日本語能力試験 N1',
    subtitle:
      'Đỉnh cao tiếng Nhật: Cấu trúc ngữ pháp hàn lâm, cổ ngữ, xã luận chính trị - kinh tế - triết học và văn học hiện đại.',
    lessonsRange: 'Bài 91 - 110 (20 bài)',
    isAvailable: true,
    totalLessons: 20,
    grammarCount: 80,
    vocabCount: 100,
    gradient: 'from-rose-500 to-red-600',
    glowColor: 'group-hover:shadow-rose-500/10',
    btnColorClass: 'bg-rose-600 text-white hover:bg-rose-700',
    highlights: [
      '20 chuyên đề ngữ pháp hàn lâm, nghiên cứu và dịch thuật',
      '80 mẫu câu cao cấp phục vụ đọc hiểu nghị luận và báo chí',
      '100 từ vựng học thuật, thành ngữ 4 chữ (Yojijukugo) chuyên sâu',
    ],
  },
];

export function CourseSelectionView({
  onSelectCourse,
  lessons: propLessons,
}: CourseSelectionViewProps) {
  const router = useRouter();
  const [fetchedLessons, setFetchedLessons] = useState<ThamLesson[] | null>(
    null,
  );

  useEffect(() => {
    if (propLessons && propLessons.length > 0) {
      return;
    }

    let isMounted = true;
    async function loadLessons() {
      try {
        const res = await fetch('/api/tham/lessons');
        if (res.ok) {
          const data = await res.json();
          if (isMounted && data.lessons && Array.isArray(data.lessons)) {
            setFetchedLessons(data.lessons);
          }
        }
      } catch (err) {
        console.error('Failed to load lessons for course selection:', err);
      }
    }

    loadLessons();
    return () => {
      isMounted = false;
    };
  }, [propLessons]);

  const lessons =
    propLessons && propLessons.length > 0
      ? propLessons
      : fetchedLessons || LESSONS_METADATA;

  const handleSelect = (courseId: CurriculumLevel) => {
    if (onSelectCourse) {
      onSelectCourse(courseId);
    } else {
      router.push(`/giao-trinh/${courseId}`);
    }
  };

  const getProgress = (courseId: CurriculumLevel) => {
    const volMap: Record<CurriculumLevel, { vol: number; total: number }> = {
      n5: { vol: 1, total: 25 },
      n4: { vol: 2, total: 25 },
      n3: { vol: 3, total: 20 },
      n2: { vol: 4, total: 20 },
      n1: { vol: 5, total: 20 },
    };

    const target = volMap[courseId];
    if (!target) return { completed: 0, total: 0, percent: 0 };

    const completed = lessons.filter(
      l =>
        (l.book_vol === target.vol || l.level === courseId) && l.is_completed,
    ).length;

    return {
      completed,
      total: target.total,
      percent:
        target.total > 0 ? Math.round((completed / target.total) * 100) : 0,
    };
  };

  const availableCourses = COURSES.filter(c => c.isAvailable);
  const upcomingCourses = COURSES.filter(c => !c.isAvailable);

  return (
    <div className='mx-auto w-full max-w-5xl space-y-8 px-4 py-6 sm:px-6 sm:py-8'>
      {/* Hero / Header Section */}
      <div className='relative overflow-hidden rounded-3xl border border-(--border-color) bg-(--card-color) p-6 shadow-sm sm:p-8 md:p-10'>
        <div className='relative z-10 max-w-3xl space-y-4'>
          <div className='inline-flex items-center gap-2 rounded-full border border-sky-500/20 bg-sky-500/10 px-3 py-1 text-xs font-bold text-sky-600 dark:text-sky-400'>
            <Compass className='size-3.5' />
            <span>LỘ TRÌNH CHUẨN JLPT & MINNA NO NIHONGO</span>
          </div>

          <h1 className='text-2xl font-extrabold tracking-tight text-(--main-color) sm:text-3xl md:text-4xl'>
            Chọn Khóa Học & Cấp Độ
          </h1>

          <p className='text-sm leading-relaxed text-(--secondary-color) sm:text-base'>
            Hệ thống giáo trình tiếng Nhật từ sơ cấp đến cao cấp (N5 - N1), tích
            hợp lý thuyết ngữ pháp có âm thanh, tra cứu từ vựng và bài tập trắc
            nghiệm tương tác giúp bạn tự tin chinh phục mục tiêu JLPT.
          </p>

          {/* Quick Metrics */}
          <div className='grid grid-cols-2 gap-3 pt-2 sm:grid-cols-4'>
            <div className='rounded-xl border border-(--border-color) bg-(--background-color) p-3 text-center'>
              <div className='text-lg font-black text-sky-600 sm:text-xl dark:text-sky-400'>
                5
              </div>
              <div className='text-[11px] font-medium text-(--secondary-color)'>
                Cấp độ JLPT (N5 - N1)
              </div>
            </div>

            <div className='rounded-xl border border-(--border-color) bg-(--background-color) p-3 text-center'>
              <div className='text-lg font-black text-emerald-600 sm:text-xl dark:text-emerald-400'>
                110
              </div>
              <div className='text-[11px] font-medium text-(--secondary-color)'>
                Bài học đầy đủ
              </div>
            </div>

            <div className='rounded-xl border border-(--border-color) bg-(--background-color) p-3 text-center'>
              <div className='text-lg font-black text-indigo-600 sm:text-xl dark:text-indigo-400'>
                418
              </div>
              <div className='text-[11px] font-medium text-(--secondary-color)'>
                Mẫu ngữ pháp chi tiết
              </div>
            </div>

            <div className='rounded-xl border border-(--border-color) bg-(--background-color) p-3 text-center'>
              <div className='text-lg font-black text-amber-600 sm:text-xl dark:text-amber-400'>
                864
              </div>
              <div className='text-[11px] font-medium text-(--secondary-color)'>
                Từ vựng có Audio
              </div>
            </div>
          </div>
        </div>

        {/* Ambient background decoration */}
        <div className='pointer-events-none absolute -top-12 -right-12 size-72 rounded-full bg-gradient-to-bl from-sky-500/10 via-indigo-500/5 to-transparent blur-3xl' />
      </div>

      {/* Available Courses (N5, N4, N3, N2, N1) */}
      <div className='space-y-4'>
        <div className='flex items-center justify-between'>
          <div className='flex items-center gap-2'>
            <Award className='size-5 text-sky-500' />
            <h2 className='text-lg font-bold text-(--main-color) sm:text-xl'>
              Khóa Học Đang Mở (N5 - N1)
            </h2>
          </div>
          <span className='text-xs font-semibold text-emerald-600 dark:text-emerald-400'>
            ● Sẵn sàng học ngay 5 cấp độ
          </span>
        </div>

        <div className='grid grid-cols-1 gap-5 md:grid-cols-2'>
          {availableCourses.map(course => {
            const progress = getProgress(course.id);

            return (
              <div
                key={course.id}
                onClick={() => handleSelect(course.id)}
                className={`group relative flex cursor-pointer flex-col justify-between overflow-hidden rounded-2xl border border-(--border-color) bg-(--card-color) p-5 shadow-xs transition-all duration-300 hover:-translate-y-1 hover:border-sky-500/50 hover:shadow-lg sm:p-6 ${course.glowColor}`}
              >
                {/* Top Badge & Level indicator */}
                <div className='space-y-3'>
                  <div className='flex items-center justify-between gap-2'>
                    <div className='flex items-center gap-2'>
                      <span
                        className={`inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-extrabold tracking-wider uppercase ${course.badgeColorClass}`}
                      >
                        {course.badgeText}
                      </span>
                      <span className='text-xs font-medium text-(--secondary-color)'>
                        {course.lessonsRange}
                      </span>
                    </div>

                    <div className='flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400'>
                      <span className='size-1.5 animate-pulse rounded-full bg-emerald-500' />
                      <span>Đầy đủ {course.totalLessons} bài</span>
                    </div>
                  </div>

                  {/* Title & Japanese Subtitle */}
                  <div>
                    <h3 className='text-xl font-extrabold text-(--main-color) transition-colors group-hover:text-sky-600 dark:group-hover:text-sky-400'>
                      {course.title}
                    </h3>
                    <p className='font-japanese text-xs font-medium text-(--secondary-color)/80'>
                      {course.jpTitle}
                    </p>
                  </div>

                  {/* Description */}
                  <p className='text-xs leading-relaxed text-(--secondary-color) sm:text-sm'>
                    {course.subtitle}
                  </p>

                  {/* Highlights Bullet List */}
                  <div className='space-y-1.5 pt-2'>
                    {course.highlights.map((h, i) => (
                      <div
                        key={i}
                        className='flex items-center gap-2 text-xs text-(--secondary-color)'
                      >
                        <CheckCircle2 className='size-3.5 shrink-0 text-emerald-500' />
                        <span>{h}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Bottom Section: Progress & CTA */}
                <div className='mt-6 space-y-3 border-t border-(--border-color)/60 pt-4'>
                  {/* Progress Indicator */}
                  <div className='space-y-1.5'>
                    <div className='flex items-center justify-between text-xs font-semibold'>
                      <span className='text-(--secondary-color)'>
                        Tiến độ học tập
                      </span>
                      <span className='font-mono text-sky-600 dark:text-sky-400'>
                        {progress.completed}/{progress.total} bài ·{' '}
                        {progress.percent}%
                      </span>
                    </div>
                    <div className='h-2 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800'>
                      <div
                        className={`h-full rounded-full bg-gradient-to-r ${course.gradient} transition-all duration-500`}
                        style={{ width: `${progress.percent}%` }}
                      />
                    </div>
                  </div>

                  {/* Action Button */}
                  <button
                    type='button'
                    onClick={e => {
                      e.stopPropagation();
                      handleSelect(course.id);
                    }}
                    className={`flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-bold shadow-xs transition-all duration-200 group-hover:scale-[1.01] ${course.btnColorClass}`}
                  >
                    <span>Vào học danh sách bài</span>
                    <ArrowRight className='size-4 transition-transform group-hover:translate-x-1' />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Upcoming Courses (if any left) */}
      {upcomingCourses.length > 0 && (
        <div className='space-y-4 pt-4'>
          <div className='flex items-center justify-between'>
            <div className='flex items-center gap-2'>
              <GraduationCap className='size-5 text-indigo-500' />
              <h2 className='text-lg font-bold text-(--main-color) sm:text-xl'>
                Lộ Trình Tiếp Theo
              </h2>
            </div>
            <span className='inline-flex items-center gap-1 text-xs font-medium text-(--secondary-color)'>
              <Clock className='size-3.5' />
              Đang biên soạn
            </span>
          </div>

          <div className='grid grid-cols-1 gap-4 sm:grid-cols-3'>
            {upcomingCourses.map(course => (
              <div
                key={course.id}
                className='relative flex flex-col justify-between rounded-2xl border border-(--border-color) bg-(--card-color)/60 p-5 opacity-90 shadow-xs transition-all hover:border-indigo-500/30 hover:opacity-100'
              >
                <div className='space-y-3'>
                  <div className='flex items-center justify-between gap-2'>
                    <span
                      className={`inline-flex items-center rounded-md border px-2 py-0.5 text-[11px] font-extrabold tracking-wider uppercase ${course.badgeColorClass}`}
                    >
                      {course.badgeText}
                    </span>

                    <span className='inline-flex items-center gap-1 rounded-full border border-(--border-color) bg-(--background-color) px-2 py-0.5 text-[10px] font-semibold text-(--secondary-color)'>
                      <Lock className='size-3' />
                      <span>Sắp ra mắt</span>
                    </span>
                  </div>

                  <div>
                    <h3 className='text-base font-bold text-(--main-color)'>
                      {course.title}
                    </h3>
                    <p className='font-japanese text-[11px] font-medium text-(--secondary-color)/70'>
                      {course.jpTitle}
                    </p>
                  </div>

                  <p className='text-xs leading-relaxed text-(--secondary-color)'>
                    {course.subtitle}
                  </p>

                  <div className='space-y-1 pt-1'>
                    {course.highlights.map((h, i) => (
                      <div
                        key={i}
                        className='flex items-center gap-1.5 text-[11px] text-(--secondary-color)/80'
                      >
                        <span className='size-1 rounded-full bg-(--secondary-color)/40' />
                        <span>{h}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className='mt-5 border-t border-(--border-color)/40 pt-3'>
                  <button
                    type='button'
                    disabled
                    className='flex w-full cursor-not-allowed items-center justify-center gap-1.5 rounded-xl border border-(--border-color) bg-(--background-color) py-2 text-xs font-semibold text-(--secondary-color) opacity-75'
                  >
                    <Lock className='size-3' />
                    <span>Chưa mở đăng ký</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
