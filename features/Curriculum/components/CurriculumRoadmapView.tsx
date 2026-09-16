'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  BookOpen,
  Search,
  BookMarked,
  CheckCircle2,
  Loader2,
  ArrowLeft,
} from 'lucide-react';

import type { ThamLesson } from '../types';
import { LessonCard } from './LessonCard';
import { CourseSelectionView } from './CourseSelectionView';
import { LESSONS_METADATA } from '../data/curriculumData';
import { useRouter } from '@/core/i18n/routing';

export function CurriculumRoadmapView() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const courseParam = searchParams.get('course'); // 'n5' | 'n4' | null
  const [lessons, setLessons] = useState<ThamLesson[]>(LESSONS_METADATA);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // Active tab: 1 for N5 (lessons 1-25), 2 for N4 (lessons 26-50)
  const activeTab: 1 | 2 = courseParam === 'n4' ? 2 : 1;

  // Fetch live lessons & user progress from API
  useEffect(() => {
    let isMounted = true;
    async function loadLessons() {
      try {
        const res = await fetch('/api/tham/lessons');
        if (res.ok) {
          const data = await res.json();
          if (isMounted && data.lessons && Array.isArray(data.lessons)) {
            setLessons(data.lessons);
          }
        }
      } catch (err) {
        console.error('Failed to load lessons from API:', err);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadLessons();
    return () => {
      isMounted = false;
    };
  }, []);

  // Filter lessons based on active volume and search query
  const filteredLessons = useMemo(() => {
    return lessons
      .filter(lesson => lesson.book_vol === activeTab)
      .filter(lesson => {
        if (!searchQuery.trim()) return true;
        const query = searchQuery.toLowerCase();
        return (
          lesson.title_vi.toLowerCase().includes(query) ||
          lesson.title_ja.toLowerCase().includes(query) ||
          `bài ${lesson.lesson_num}`.includes(query) ||
          lesson.lesson_num.toString() === query.trim()
        );
      });
  }, [lessons, activeTab, searchQuery]);

  // Overall progress stats for the active volume
  const volumeLessons = useMemo(() => {
    return lessons.filter(lesson => lesson.book_vol === activeTab);
  }, [lessons, activeTab]);

  const totalGrammarCount = useMemo(() => {
    return volumeLessons.reduce((acc, l) => acc + (l.grammar_count || 0), 0);
  }, [volumeLessons]);

  const completedLessonsCount = useMemo(() => {
    return volumeLessons.filter(l => l.is_completed).length;
  }, [volumeLessons]);

  // Approximate completed grammar points based on lesson completion
  const completedGrammarEstimate = useMemo(() => {
    return volumeLessons.reduce((acc, l) => {
      if (l.is_completed) return acc + (l.grammar_count || 0);
      return acc;
    }, 0);
  }, [volumeLessons]);

  const progressPercent =
    totalGrammarCount > 0
      ? Math.round((completedGrammarEstimate / totalGrammarCount) * 100)
      : 0;

  // Handlers for course selection & navigation
  const handleSelectCourse = (selected: 'n5' | 'n4') => {
    router.push(`/giao-trinh?course=${selected}`);
  };

  const handleBackToCourses = () => {
    router.push('/giao-trinh');
  };

  // If no course selected (or invalid), show CourseSelectionView
  if (!courseParam || (courseParam !== 'n5' && courseParam !== 'n4')) {
    return (
      <CourseSelectionView
        onSelectCourse={handleSelectCourse}
        lessons={lessons}
      />
    );
  }

  return (
    <div className='mx-auto w-full max-w-5xl space-y-6 px-4 py-6 sm:px-6 sm:py-8'>
      {/* Header Section */}
      <div className='space-y-4'>
        {/* Breadcrumb / Back Button */}
        <div>
          <button
            type='button'
            onClick={handleBackToCourses}
            aria-label='Chọn khóa học'
            className='group -ml-1.5 inline-flex cursor-pointer items-center gap-1.5 rounded-lg px-2 py-1 text-xs font-semibold text-sky-600 transition-colors hover:bg-sky-500/10 hover:text-sky-700 sm:text-sm dark:text-sky-400 dark:hover:text-sky-300'
          >
            <ArrowLeft className='size-3.5 transition-transform group-hover:-translate-x-0.5 sm:size-4' />
            <span>Chọn khóa học</span>
          </button>
        </div>

        {/* Title & Level Badge */}
        <div className='flex flex-col justify-between gap-4 sm:flex-row sm:items-center'>
          <div>
            <div className='mb-1.5 flex items-center gap-2.5'>
              <span className='inline-flex items-center rounded-md border border-sky-500/20 bg-sky-500/10 px-2 py-0.5 text-[11px] font-extrabold tracking-wider text-sky-600 uppercase dark:text-sky-400'>
                {activeTab === 1 ? 'N5 Sơ Cấp' : 'N4 Trung Sơ Cấp'}
              </span>
              <span className='text-xs text-(--secondary-color)'>
                {activeTab === 1 ? '25 bài học' : '25 bài học'}
              </span>
            </div>

            <div className='flex items-center gap-3'>
              <div className='flex size-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-sky-500 to-indigo-600 text-white shadow-sm sm:size-11'>
                <BookMarked className='size-6' />
              </div>
              <div>
                <h1 className='text-xl font-extrabold tracking-tight text-(--main-color) sm:text-2xl md:text-3xl'>
                  {activeTab === 1
                    ? 'Minna no Nihongo I (第1-25課)'
                    : 'Minna no Nihongo II (第26-50課)'}
                </h1>

                <p className='mt-0.5 text-xs text-(--secondary-color) sm:text-sm'>
                  Lộ trình giáo án chuẩn Minna no Nihongo (Sơ Cấp N5 - N4)
                </p>
              </div>
            </div>
          </div>

          {/* Quick Stats Pill */}
          <div className='flex items-center gap-3 self-start rounded-xl border border-(--border-color) bg-(--card-color) px-3.5 py-2 text-xs sm:self-center'>
            <div className='flex items-center gap-1.5 font-semibold text-emerald-500'>
              <CheckCircle2 className='size-4' />
              <span>{completedLessonsCount}/25 hoàn thành</span>
            </div>
          </div>
        </div>

        {/* Tabs: Minna I vs Minna II */}
        <div className='flex items-center gap-2 border-b border-(--border-color) pt-2'>
          <button
            type='button'
            onClick={() => router.push('/giao-trinh?course=n5')}
            className={`flex cursor-pointer items-center gap-2 border-b-2 px-3 pb-2.5 text-sm font-bold transition-all ${
              activeTab === 1
                ? 'border-sky-500 text-sky-600 dark:text-sky-400'
                : 'border-transparent text-(--secondary-color) hover:text-(--main-color)'
            }`}
          >
            <BookOpen className='size-4' />
            <span>Tập 1: Minna I (Bài 1 - 25 · N5)</span>
          </button>

          <button
            type='button'
            onClick={() => router.push('/giao-trinh?course=n4')}
            className={`flex cursor-pointer items-center gap-2 border-b-2 px-3 pb-2.5 text-sm font-bold transition-all ${
              activeTab === 2
                ? 'border-sky-500 text-sky-600 dark:text-sky-400'
                : 'border-transparent text-(--secondary-color) hover:text-(--main-color)'
            }`}
          >
            <BookOpen className='size-4' />
            <span>Tập 2: Minna II (Bài 26 - 50 · N4)</span>
          </button>
        </div>

        {/* Overall Progress Bar (Tiến độ tổng) */}
        <div className='space-y-2.5 rounded-xl border border-(--border-color) bg-(--card-color) p-4 shadow-xs'>
          <div className='flex items-center justify-between text-xs font-semibold sm:text-sm'>
            <span className='text-(--main-color)'>Tiến độ tổng</span>
            <span className='font-mono text-sky-600 dark:text-sky-400'>
              {completedGrammarEstimate}/{totalGrammarCount} mẫu ·{' '}
              {progressPercent}%
            </span>
          </div>

          <div className='h-2.5 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800'>
            <div
              className='h-full rounded-full bg-gradient-to-r from-sky-500 to-indigo-500 transition-all duration-500 ease-out'
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className='flex flex-col items-stretch justify-between gap-3 pt-2 sm:flex-row sm:items-center'>
        <div className='relative max-w-md flex-1'>
          <Search className='absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-(--secondary-color)' />
          <input
            type='text'
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder='Tìm kiếm bài học theo số bài hoặc chủ đề...'
            className='w-full rounded-xl border border-(--border-color) bg-(--card-color) py-2 pr-4 pl-10 text-sm text-(--main-color) transition-all placeholder:text-(--secondary-color)/60 focus:border-sky-500 focus:ring-2 focus:ring-sky-500/30 focus:outline-none'
          />
        </div>

        <div className='self-end text-xs font-medium text-(--secondary-color) sm:self-center'>
          Hiển thị {filteredLessons.length} / 25 bài
        </div>
      </div>

      {/* 2-Column Grid of Rectangular Lesson Cards */}
      {isLoading ? (
        <div className='flex flex-col items-center justify-center py-16 text-(--secondary-color)'>
          <Loader2 className='mb-2 size-8 animate-spin text-sky-500' />
          <p className='text-sm font-medium'>Đang tải danh sách bài học...</p>
        </div>
      ) : filteredLessons.length > 0 ? (
        <div className='grid grid-cols-1 gap-3.5 sm:gap-4 md:grid-cols-2'>
          {filteredLessons.map(lesson => (
            <LessonCard key={lesson.id} lesson={lesson} />
          ))}
        </div>
      ) : (
        <div className='flex flex-col items-center justify-center rounded-2xl border border-dashed border-(--border-color) py-16 text-center text-(--secondary-color)'>
          <BookOpen className='mb-2 size-10 opacity-40' />
          <p className='text-sm font-medium'>
            Không tìm thấy bài học nào phù hợp
          </p>
          <p className='mt-1 text-xs'>Vui lòng thử lại với từ khóa khác</p>
        </div>
      )}
    </div>
  );
}
