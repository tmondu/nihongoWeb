'use client';

import { useCallback } from 'react';
import { Link } from '@/core/i18n/routing';
import useVocabStudyStore from '../../store/useVocabStudyStore';
import { getLessons } from '../../data/lessonsN5';
import type { VocabLevel, StudySection } from '../../types/study';
import VocabLessonDropdown from './VocabLessonDropdown';
import VocabFlashcardHero from './VocabFlashcardHero';
import VocabTableView from './VocabTableView';
import VocabPronounceStudio from './VocabPronounceStudio';

interface ModernVocabContainerProps {
  fixedLevel?: VocabLevel;
  mode?: StudySection;
}

export default function ModernVocabContainer({
  fixedLevel,
  mode,
}: ModernVocabContainerProps) {
  const store = useVocabStudyStore();

  const level = fixedLevel ?? store.level;
  const section = mode ?? store.section;
  const { lessonId, learned, curMap, scores } = store;

  const lessons = getLessons(level);
  const lessonData = lessons[lessonId] ?? { words: [] };
  const words = lessonData.words;
  const cursor = curMap[String(lessonId)] ?? 0;
  const safeCursor = Math.min(cursor, Math.max(0, words.length - 1));

  const handleSelectLesson = useCallback(
    (lid: number) => {
      store.setView(section, lid);
    },
    [section, store],
  );

  const handleNavigate = useCallback(
    (dir: -1 | 1) => {
      const next = safeCursor + dir;
      if (next < 0 || next >= words.length) return;
      store.setCursor(lessonId, next);
    },
    [safeCursor, words.length, lessonId, store],
  );

  const handleMarkLearned = useCallback(() => {
    if (!words[safeCursor]) return;
    store.markLearned(`${lessonId}:${words[safeCursor].hira}`);
  }, [safeCursor, words, lessonId, store]);

  const handleMarkNotLearned = useCallback(() => {
    if (!words[safeCursor]) return;
    store.markNotLearned(`${lessonId}:${words[safeCursor].hira}`);
  }, [safeCursor, words, lessonId, store]);

  const handleSelectWord = useCallback(
    (idx: number) => {
      store.setCursor(lessonId, idx);
    },
    [lessonId, store],
  );

  const handleResetLesson = useCallback(() => {
    store.resetLesson(
      lessonId,
      words.map(w => w.hira),
    );
  }, [lessonId, words, store]);

  const handleScoreUpdated = useCallback(
    (key: string, pct: number) => {
      store.setScore(key, pct);
    },
    [store],
  );

  const sectionTitle = section === 'vocab' ? '1000 từ vựng' : 'Luyện phát âm';

  return (
    <div className='font-vietnamese mx-auto flex w-full max-w-5xl flex-col gap-6 py-2 sm:py-4'>
      {/* Header bar: Breadcrumb + Title (left) & Lesson Dropdown (right, ngang tiêu đề) */}
      <div className='flex flex-wrap items-center justify-between gap-4 border-b border-[var(--border-color)] pb-4'>
        {/* Left: Breadcrumbs + Title */}
        <div>
          <p className='text-xs text-[var(--secondary-color)]'>
            <Link
              href='/vocabulary'
              className='transition-colors hover:text-[var(--main-color)]'
            >
              Từ vựng
            </Link>{' '}
            &rsaquo;{' '}
            <Link
              href={`/vocabulary/jlpt-${level}`}
              className='transition-colors hover:text-[var(--main-color)]'
            >
              {level.toUpperCase()}
            </Link>{' '}
            &rsaquo; {sectionTitle} &rsaquo; Bài {lessonId}
          </p>
          <div className='mt-1 flex items-center gap-2.5'>
            <h1 className='text-xl font-bold tracking-tight text-[var(--foreground-color)] sm:text-2xl'>
              {sectionTitle} — Bài {lessonId}
            </h1>
            <span className='rounded-full border border-[var(--border-color)] bg-[var(--card-color)] px-2.5 py-0.5 text-xs font-semibold text-[var(--secondary-color)]'>
              {level.toUpperCase()}
            </span>
          </div>
        </div>

        {/* Right: Dropdown sổ ra chọn bài (ngang với chữ tiêu đề) */}
        <VocabLessonDropdown
          level={level}
          lessons={lessons}
          currentSection={section}
          currentLessonId={lessonId}
          learned={learned}
          scores={scores}
          singleMode={mode}
          onSelectLesson={handleSelectLesson}
        />
      </div>

      {/* Main Content Area */}
      {section === 'vocab' ? (
        <div className='flex flex-col gap-6'>
          {/* Sticky Flashcard Wrapper: ghim cố định ở viền trên khi cuộn xuống */}
          <div className='sticky top-0 z-20 -mx-4 border-b border-[var(--border-color)]/40 bg-[var(--background-color)]/95 px-4 pt-2 pb-4 shadow-xs backdrop-blur-md transition-all'>
            <VocabFlashcardHero
              words={words}
              lessonId={lessonId}
              cursor={safeCursor}
              learned={learned}
              onMarkLearned={handleMarkLearned}
              onMarkNotLearned={handleMarkNotLearned}
              onNavigate={handleNavigate}
            />
          </div>

          {/* Table */}
          <div className='pt-2'>
            <VocabTableView
              words={words}
              lessonId={lessonId}
              cursor={safeCursor}
              learned={learned}
              onSelectWord={handleSelectWord}
              onResetLesson={handleResetLesson}
            />
          </div>
        </div>
      ) : (
        <VocabPronounceStudio
          words={words}
          lessonId={lessonId}
          pIdx={safeCursor}
          scores={scores}
          onNavigate={handleNavigate}
          onSelectWord={handleSelectWord}
          onScoreUpdated={handleScoreUpdated}
        />
      )}
    </div>
  );
}
