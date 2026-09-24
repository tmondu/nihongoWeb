'use client';

import React from 'react';
import type { KanjiLevel } from '@/entities/kanji/types';
import {
  getLessonsForLevel,
  type KanjiProLesson,
} from '../data/kanjiProCurriculum';
import { BookOpen, ArrowRight, CheckCircle2 } from 'lucide-react';
import clsx from 'clsx';

interface KanjiProLessonListProps {
  level: KanjiLevel;
  lessons?: KanjiProLesson[];
  selectedLessonNum?: number | null;
  onSelectLesson: (lesson: KanjiProLesson) => void;
}

export default function KanjiProLessonList({
  level,
  lessons: customLessons,
  selectedLessonNum,
  onSelectLesson,
}: KanjiProLessonListProps) {
  const fallbackLessons = getLessonsForLevel(level);
  const lessons =
    customLessons && customLessons.length > 0 ? customLessons : fallbackLessons;

  return (
    <div className='space-y-5'>
      <div className='flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between'>
        <div>
          <h2 className='text-lg font-black tracking-tight text-(--main-color) sm:text-xl'>
            Danh Sách Bài Học Cấp Độ {level.toUpperCase()}
          </h2>
          <p className='text-xs text-(--secondary-color) sm:text-sm'>
            Chọn bài học để bắt đầu luyện tập Kanji theo giáo trình Minna no
            Nihongo.
          </p>
        </div>

        <div className='text-xs font-bold text-emerald-600 dark:text-emerald-400'>
          Tổng số: {lessons.length} bài học
        </div>
      </div>

      {/* Grid of lessons */}
      <div className='grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3'>
        {lessons.map(lesson => {
          const isSelected = selectedLessonNum === lesson.lessonNum;
          const hasData = lesson.isAvailable && lesson.kanjiList.length > 0;

          return (
            <button
              key={lesson.id}
              type='button'
              onClick={() => onSelectLesson(lesson)}
              className={clsx(
                'group relative flex flex-col justify-between rounded-2xl border p-4 text-left transition-all',
                isSelected
                  ? 'border-emerald-500 bg-emerald-500/10 shadow-md ring-2 ring-emerald-500/30'
                  : hasData
                    ? 'border-sky-500/50 bg-(--card-color) hover:border-sky-500 hover:shadow-md'
                    : 'border-(--border-color) bg-(--card-color)/60 opacity-80 hover:border-(--main-color)/40 hover:opacity-100',
              )}
            >
              <div>
                <div className='flex items-center justify-between gap-2'>
                  <div className='flex items-center gap-2'>
                    <div
                      className={clsx(
                        'flex size-9 items-center justify-center rounded-xl text-sm font-black transition-transform group-hover:scale-105',
                        hasData
                          ? 'border-b-2 border-sky-600 bg-sky-500 text-white shadow-xs dark:bg-sky-600'
                          : 'border border-(--border-color) bg-(--background-color) text-(--secondary-color)',
                      )}
                    >
                      {lesson.lessonNum}
                    </div>
                    <div>
                      <h3 className='text-sm font-extrabold text-(--main-color)'>
                        {lesson.title}
                      </h3>
                      <span className='text-[10px] font-semibold text-(--secondary-color)'>
                        {level.toUpperCase()}
                      </span>
                    </div>
                  </div>

                  {hasData ? (
                    <span className='rounded-full border border-emerald-500/30 bg-emerald-500/15 px-2.5 py-0.5 text-[10px] font-bold text-emerald-600 dark:text-emerald-400'>
                      Đầy đủ nội dung
                    </span>
                  ) : (
                    <span className='rounded-full border border-(--border-color) bg-(--background-color) px-2 py-0.5 text-[10px] font-medium text-(--secondary-color)'>
                      Sắp có
                    </span>
                  )}
                </div>

                {/* Preview Kanji if available */}
                {hasData ? (
                  <div className='mt-3'>
                    <div className='flex flex-wrap gap-1.5'>
                      {lesson.kanjiList.map(k => (
                        <span
                          key={k.id}
                          className='font-japanese flex size-7 items-center justify-center rounded-lg border border-sky-500/30 bg-sky-500/10 text-xs font-black text-sky-900 transition-transform group-hover:scale-110 dark:text-sky-200'
                        >
                          {k.kanjiChar}
                        </span>
                      ))}
                    </div>
                    <p className='mt-2 text-[11px] font-medium text-emerald-600 dark:text-emerald-400'>
                      {lesson.kanjiList.length} chữ Hán • Kèm ví dụ & câu mẫu
                    </p>
                  </div>
                ) : (
                  <p className='mt-3 text-[11px] text-(--secondary-color)/70 italic'>
                    Đang chuẩn bị nội dung theo sách...
                  </p>
                )}
              </div>

              <div className='mt-4 flex items-center justify-between border-t border-(--border-color)/50 pt-2.5 text-xs font-bold'>
                {hasData ? (
                  <span className='flex items-center gap-1 text-sky-600 transition-transform group-hover:translate-x-1 dark:text-sky-400'>
                    <span>Vào học ngay</span>
                    <ArrowRight className='size-3.5' />
                  </span>
                ) : (
                  <span className='flex items-center gap-1 text-(--secondary-color)/60'>
                    <BookOpen className='size-3' />
                    <span>Xem bài học</span>
                  </span>
                )}

                {hasData && (
                  <span className='flex items-center gap-1 text-[11px] font-normal text-emerald-600 dark:text-emerald-400'>
                    <CheckCircle2 className='size-3.5' />
                    <span>Sẵn sàng</span>
                  </span>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
