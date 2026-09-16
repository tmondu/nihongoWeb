'use client';

import React from 'react';
import { BookOpen, Lock, CheckCircle2, ChevronRight } from 'lucide-react';
import type { ThamLesson } from '../types';
import { Link } from '@/core/i18n/routing';

interface LessonCardProps {
  lesson: ThamLesson;
}

export function LessonCard({ lesson }: LessonCardProps) {
  const isLocked = Boolean(lesson.is_locked);
  const isCompleted = Boolean(lesson.is_completed);

  const courseLevel =
    lesson.level ||
    (lesson.lesson_num <= 25
      ? 'n5'
      : lesson.lesson_num <= 50
        ? 'n4'
        : lesson.lesson_num <= 70
          ? 'n3'
          : lesson.lesson_num <= 90
            ? 'n2'
            : 'n1');

  return (
    <Link
      href={`/giao-trinh/${courseLevel}/${lesson.lesson_num}`}
      className={`group relative flex items-center justify-between rounded-xl border p-4 transition-all duration-200 ${
        isLocked
          ? 'border-(--border-color)/50 bg-(--card-color)/40 text-slate-400 hover:border-(--border-color)'
          : isCompleted
            ? 'border-emerald-500/30 bg-(--card-color) text-(--main-color) shadow-sm hover:border-emerald-500/60 hover:shadow-md'
            : 'border-(--border-color) bg-(--card-color) text-(--main-color) shadow-sm hover:border-sky-500/50 hover:bg-(--card-color)/90 hover:shadow-md'
      }`}
    >
      {/* Left: Icon & Titles */}
      <div className='flex items-start gap-3.5'>
        <div
          className={`mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-lg ${
            isLocked
              ? 'bg-slate-800/40 text-slate-500'
              : isCompleted
                ? 'bg-emerald-500/10 text-emerald-500'
                : 'bg-sky-500/10 text-sky-500 group-hover:bg-sky-500/20'
          }`}
        >
          {isLocked ? (
            <Lock className='size-4' />
          ) : isCompleted ? (
            <CheckCircle2 className='size-4' />
          ) : (
            <BookOpen className='size-4' />
          )}
        </div>

        <div className='space-y-0.5'>
          {/* Japanese Chapter No */}
          <div className='font-japanese text-[11px] font-medium tracking-wide text-(--secondary-color)'>
            {lesson.title_ja}
          </div>

          {/* Vietnamese Lesson Title */}
          <div className='text-base font-bold text-(--main-color) transition-colors group-hover:text-sky-500'>
            Bài {lesson.lesson_num}
          </div>

          {/* Subtitle / Topic */}
          <div className='text-xs text-(--secondary-color)'>
            {lesson.title_vi}
          </div>
        </div>
      </div>

      {/* Right: Grammar Count & Action Indicator */}
      <div className='flex items-center gap-1.5 pl-2 text-xs font-medium text-(--secondary-color)'>
        <span>{lesson.grammar_count} mẫu câu</span>
        {isLocked ? (
          <Lock className='size-3.5 text-slate-400' />
        ) : isCompleted ? (
          <CheckCircle2 className='size-3.5 text-emerald-500' />
        ) : (
          <ChevronRight className='size-4 text-(--secondary-color) transition-transform group-hover:translate-x-0.5 group-hover:text-sky-500' />
        )}
      </div>
    </Link>
  );
}
