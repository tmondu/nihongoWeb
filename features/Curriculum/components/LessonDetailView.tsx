'use client';

import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  BookMarked,
  Eye,
  EyeOff,
  BookOpen,
  GraduationCap,
  Layers,
  Loader2,
  CheckCircle2,
} from 'lucide-react';

import type { ThamLessonDetail, ThamGrammarPoint } from '../types';
import { GrammarCard } from './GrammarCard';
import { GrammarDetailModal } from './GrammarDetailModal';
import { VocabularyTab } from './VocabularyTab';
import { PracticeTab } from './PracticeTab';
import { Link } from '@/core/i18n/routing';

interface LessonDetailViewProps {
  lessonId: number;
}

export function LessonDetailView({ lessonId }: LessonDetailViewProps) {
  const [detail, setDetail] = useState<ThamLessonDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'grammar' | 'vocab' | 'practice'>(
    'grammar',
  );
  const [showFurigana, setShowFurigana] = useState(true);
  const [selectedGrammar, setSelectedGrammar] =
    useState<ThamGrammarPoint | null>(null);
  const [completedGrammarIds, setCompletedGrammarIds] = useState<number[]>([]);
  const [isLessonCompleted, setIsLessonCompleted] = useState(false);

  // Fetch lesson details from API
  useEffect(() => {
    let isMounted = true;
    async function loadLessonDetail() {
      try {
        const res = await fetch(`/api/tham/lessons/${lessonId}`);
        if (res.ok) {
          const data: ThamLessonDetail = await res.json();
          if (isMounted && data) {
            setDetail(data);
            setIsLessonCompleted(Boolean(data.is_completed));
          }
        }
      } catch (err) {
        console.error('Failed to load lesson detail:', err);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadLessonDetail();
    return () => {
      isMounted = false;
    };
  }, [lessonId]);

  // Handle toggling grammar completion
  const handleToggleGrammarCompleted = (grammarId: number) => {
    setCompletedGrammarIds(prev =>
      prev.includes(grammarId)
        ? prev.filter(id => id !== grammarId)
        : [...prev, grammarId],
    );
  };

  // Handle completing whole lesson
  const handleCompleteLesson = async () => {
    if (!detail) return;
    try {
      const res = await fetch('/api/tham/progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          lesson_id: detail.id,
          lesson_num: detail.lesson_num,
          is_completed: 1,
          score: 100,
        }),
      });
      if (res.ok) {
        setIsLessonCompleted(true);
      }
    } catch (err) {
      console.error('Failed to update lesson progress:', err);
    }
  };

  if (isLoading) {
    return (
      <div className='flex min-h-[60vh] flex-col items-center justify-center text-(--secondary-color)'>
        <Loader2 className='mb-2 size-8 animate-spin text-sky-500' />
        <p className='text-sm font-medium'>Đang tải bài học {lessonId}...</p>
      </div>
    );
  }

  if (!detail) {
    return (
      <div className='mx-auto w-full max-w-5xl space-y-4 px-4 py-12 text-center'>
        <p className='text-base font-semibold text-rose-500'>
          Không tìm thấy bài học.
        </p>
        <Link
          href='/giao-trinh'
          className='inline-flex items-center gap-2 rounded-xl bg-sky-500 px-4 py-2 text-sm font-medium text-white'
        >
          <ArrowLeft className='size-4' />
          <span>Về danh sách bài học</span>
        </Link>
      </div>
    );
  }

  const lesson = detail;
  const { vocabularies, grammar_points } = detail;
  const nextLessonNum = lesson.lesson_num < 50 ? lesson.lesson_num + 1 : null;
  const prevLessonNum = lesson.lesson_num > 1 ? lesson.lesson_num - 1 : null;

  return (
    <div className='mx-auto w-full max-w-5xl space-y-6 px-4 py-6 sm:px-6 sm:py-8'>
      {/* Top Header Navigation (Matching Mockup Image 1) */}
      <div className='space-y-3'>
        {/* Back Link & Next Lesson Link Bar */}
        <div className='flex items-center justify-between gap-4'>
          <Link
            href='/giao-trinh'
            className='inline-flex items-center gap-1.5 text-xs font-semibold text-sky-600 transition-colors hover:text-sky-700 sm:text-sm dark:text-sky-400'
          >
            <ArrowLeft className='size-4' />
            <span>Quay lại</span>
          </Link>

          <div className='flex items-center gap-3'>
            {prevLessonNum && (
              <Link
                href={`/giao-trinh/${prevLessonNum}`}
                className='inline-flex items-center gap-1 text-xs font-semibold text-sky-600 transition-colors hover:text-sky-700 sm:text-sm dark:text-sky-400'
              >
                <ChevronLeft className='size-4' />
                <span>Bài {prevLessonNum}</span>
              </Link>
            )}

            {nextLessonNum && (
              <Link
                href={`/giao-trinh/${nextLessonNum}`}
                className='inline-flex items-center gap-1 text-xs font-semibold text-sky-600 transition-colors hover:text-sky-700 sm:text-sm dark:text-sky-400'
              >
                <span>Bài {nextLessonNum}</span>
                <ChevronRight className='size-4' />
              </Link>
            )}

            {/* Furigana Toggle Pill Button (Matching Mockup Image 1) */}
            <button
              type='button'
              onClick={() => setShowFurigana(prev => !prev)}
              aria-label='Bật/tắt Furigana'
              className={`inline-flex cursor-pointer items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-semibold transition-all ${
                showFurigana
                  ? 'border-sky-500/50 bg-sky-500/10 text-sky-600 shadow-xs dark:text-sky-400'
                  : 'border-(--border-color) bg-(--card-color) text-(--secondary-color) hover:text-(--main-color)'
              }`}
            >
              {showFurigana ? (
                <Eye className='size-3.5' />
              ) : (
                <EyeOff className='size-3.5' />
              )}
              <span className='font-japanese inline-flex flex-col items-center text-[11px] leading-none'>
                <span className='text-[8px] leading-none opacity-80'>かん</span>
                <span>漢</span>
              </span>
              <span>Furigana</span>
            </button>
          </div>
        </div>

        {/* Main Title & Chapter Info (Matching Mockup Image 1) */}
        <div className='flex flex-col justify-between gap-4 pt-1 sm:flex-row sm:items-center'>
          <div className='space-y-1'>
            <div className='flex items-center gap-3'>
              <div className='flex size-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-sky-500 to-indigo-600 text-white shadow-xs'>
                <BookMarked className='size-5' />
              </div>

              <h1 className='text-xl font-extrabold tracking-tight text-(--main-color) sm:text-2xl'>
                {lesson.book_vol === 1
                  ? `Minna no Nihongo I (第1-25課) - 第${lesson.lesson_num}課`
                  : `Minna no Nihongo II (第26-50課) - 第${lesson.lesson_num}課`}
              </h1>
            </div>

            <p className='pl-13 text-xs text-(--secondary-color) sm:text-sm'>
              Bài {lesson.lesson_num} · {lesson.title_vi}
            </p>
          </div>

          {isLessonCompleted && (
            <div className='inline-flex items-center gap-1.5 self-start rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-xs font-bold text-emerald-500 sm:self-center'>
              <CheckCircle2 className='size-4' />
              <span>Đã hoàn thành</span>
            </div>
          )}
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className='flex items-center gap-2 border-b border-(--border-color) pt-2'>
        <button
          type='button'
          onClick={() => setActiveTab('grammar')}
          className={`flex cursor-pointer items-center gap-2 border-b-2 px-4 pb-2.5 text-xs font-bold transition-all sm:text-sm ${
            activeTab === 'grammar'
              ? 'border-sky-500 text-sky-600 dark:text-sky-400'
              : 'border-transparent text-(--secondary-color) hover:text-(--main-color)'
          }`}
        >
          <BookOpen className='size-4' />
          <span>Ngữ pháp ({grammar_points.length})</span>
        </button>

        <button
          type='button'
          onClick={() => setActiveTab('vocab')}
          className={`flex cursor-pointer items-center gap-2 border-b-2 px-4 pb-2.5 text-xs font-bold transition-all sm:text-sm ${
            activeTab === 'vocab'
              ? 'border-sky-500 text-sky-600 dark:text-sky-400'
              : 'border-transparent text-(--secondary-color) hover:text-(--main-color)'
          }`}
        >
          <Layers className='size-4' />
          <span>Từ vựng ({vocabularies.length})</span>
        </button>

        <button
          type='button'
          onClick={() => setActiveTab('practice')}
          className={`flex cursor-pointer items-center gap-2 border-b-2 px-4 pb-2.5 text-xs font-bold transition-all sm:text-sm ${
            activeTab === 'practice'
              ? 'border-sky-500 text-sky-600 dark:text-sky-400'
              : 'border-transparent text-(--secondary-color) hover:text-(--main-color)'
          }`}
        >
          <GraduationCap className='size-4' />
          <span>Luyện tập & Mini Game</span>
        </button>
      </div>

      {/* Tab 1: Grammar 2-Column Grid (Matching Mockup Image 1) */}
      {activeTab === 'grammar' && (
        <div className='space-y-4'>
          <div className='grid grid-cols-1 gap-3.5 sm:gap-4 md:grid-cols-2'>
            {grammar_points.map(grammar => (
              <GrammarCard
                key={grammar.id}
                grammar={grammar}
                isCompleted={completedGrammarIds.includes(grammar.id)}
                onSelect={g => setSelectedGrammar(g)}
              />
            ))}
          </div>
        </div>
      )}

      {/* Tab 2: Vocabulary Tab */}
      {activeTab === 'vocab' && (
        <VocabularyTab
          vocabularies={vocabularies}
          showFurigana={showFurigana}
        />
      )}

      {/* Tab 3: Practice & Mini-game */}
      {activeTab === 'practice' && (
        <PracticeTab
          lessonDetail={detail}
          isCompleted={isLessonCompleted}
          onCompleteLesson={handleCompleteLesson}
        />
      )}

      {/* Grammar Detail Modal */}
      <GrammarDetailModal
        isOpen={Boolean(selectedGrammar)}
        onClose={() => setSelectedGrammar(null)}
        grammar={selectedGrammar}
        allGrammar={grammar_points}
        onSelectGrammar={g => setSelectedGrammar(g)}
        showFurigana={showFurigana}
        isCompleted={
          selectedGrammar
            ? completedGrammarIds.includes(selectedGrammar.id)
            : false
        }
        onToggleCompleted={handleToggleGrammarCompleted}
      />
    </div>
  );
}
