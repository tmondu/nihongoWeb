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
  const learnedCount = words.filter(w =>
    learned.includes(`${lessonId}:${w.hira}`),
  ).length;
  const progressPct =
    words.length > 0 ? Math.round((learnedCount / words.length) * 100) : 0;

  return (
    <div className='font-vietnamese mx-auto flex w-full max-w-5xl flex-col gap-6 py-2 sm:py-4'>
      {/* Main Content Area */}
      {section === 'vocab' ? (
        <div className='flex flex-col gap-6'>
          {/* Sticky 2-Column Hero: Header & Chọn bài (Cột trái) + Flashcard (Cột phải) */}
          <div className='sticky top-0 z-20 -mx-4 border-b border-[var(--border-color)]/40 bg-[var(--background-color)]/95 px-4 pt-2 pb-3.5 shadow-xs backdrop-blur-md transition-all'>
            <div className='flex flex-col gap-4 md:flex-row md:items-stretch md:gap-5'>
              {/* CỘT TRÁI: Header info, Dropdown chọn bài, Tiến độ & Phím tắt */}
              <div className='flex flex-col justify-between gap-3 rounded-2xl border border-[var(--border-color)] bg-[var(--card-color)]/70 p-3.5 shadow-xs md:w-72 md:shrink-0 lg:w-80'>
                {/* 1. Breadcrumbs + Title */}
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
                    &rsaquo; {sectionTitle}
                  </p>
                  <div className='mt-1 flex items-center justify-between gap-2'>
                    <h1 className='text-lg font-bold tracking-tight text-[var(--foreground-color)] sm:text-xl'>
                      {sectionTitle}
                    </h1>
                    <span className='rounded-full border border-[var(--border-color)] bg-[var(--card-color)] px-2 py-0.5 text-xs font-semibold text-[var(--secondary-color)]'>
                      {level.toUpperCase()}
                    </span>
                  </div>
                </div>

                {/* 2. Chọn bài (Dropdown mở sang trái) */}
                <div className='w-full'>
                  <VocabLessonDropdown
                    level={level}
                    lessons={lessons}
                    currentSection={section}
                    currentLessonId={lessonId}
                    learned={learned}
                    scores={scores}
                    singleMode={mode}
                    align='left'
                    onSelectLesson={handleSelectLesson}
                  />
                </div>

                {/* 3. Tiến độ bài học */}
                <div className='rounded-xl border border-[var(--border-color)] bg-[var(--card-color)] p-2.5'>
                  <div className='flex items-center justify-between text-xs text-[var(--secondary-color)]'>
                    <span>Tiến độ bài {lessonId}</span>
                    <span className='font-semibold text-[var(--foreground-color)] tabular-nums'>
                      {learnedCount}/{words.length} ({progressPct}%)
                    </span>
                  </div>
                  <div className='mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-[var(--border-color)]'>
                    <div
                      className='h-full rounded-full bg-[var(--main-color)] transition-all duration-500'
                      style={{ width: `${progressPct}%` }}
                    />
                  </div>
                </div>

                {/* 4. Hướng dẫn phím tắt gọn */}
                <div className='hidden flex-col gap-1 text-[11px] text-[var(--secondary-color)] sm:flex'>
                  <div className='flex items-center gap-1.5'>
                    <kbd className='rounded border border-[var(--border-color)] bg-[var(--card-color)] px-1.5 py-0.5 font-mono text-[10px]'>
                      Space
                    </kbd>
                    <span>Lật thẻ</span>
                    <span className='text-[var(--border-color)]'>·</span>
                    <kbd className='rounded border border-[var(--border-color)] bg-[var(--card-color)] px-1.5 py-0.5 font-mono text-[10px]'>
                      ← →
                    </kbd>
                    <span>Chuyển từ</span>
                  </div>
                  <div className='flex items-center gap-1.5'>
                    <kbd className='rounded border border-[var(--border-color)] bg-[var(--card-color)] px-1.5 py-0.5 font-mono text-[10px]'>
                      1
                    </kbd>
                    <span>Chưa nhớ</span>
                    <span className='text-[var(--border-color)]'>·</span>
                    <kbd className='rounded border border-[var(--border-color)] bg-[var(--card-color)] px-1.5 py-0.5 font-mono text-[10px]'>
                      2
                    </kbd>
                    <span>Đã nhớ</span>
                  </div>
                </div>
              </div>

              {/* CỘT PHẢI: Flashcard 3D & Actions */}
              <div className='min-w-0 flex-1'>
                <VocabFlashcardHero
                  words={words}
                  lessonId={lessonId}
                  cursor={safeCursor}
                  learned={learned}
                  hideProgress={true}
                  hideHints={true}
                  onMarkLearned={handleMarkLearned}
                  onMarkNotLearned={handleMarkNotLearned}
                  onNavigate={handleNavigate}
                />
              </div>
            </div>
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
        <div className='flex flex-col gap-6'>
          {/* Header bar cho chế độ Luyện phát âm */}
          <div className='flex flex-wrap items-center justify-between gap-4 border-b border-[var(--border-color)] pb-4'>
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

          <VocabPronounceStudio
            words={words}
            lessonId={lessonId}
            pIdx={safeCursor}
            scores={scores}
            onNavigate={handleNavigate}
            onSelectWord={handleSelectWord}
            onScoreUpdated={handleScoreUpdated}
          />
        </div>
      )}
    </div>
  );
}
