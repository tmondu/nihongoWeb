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
    <div className='font-vietnamese flex w-full max-w-6xl flex-col gap-6 py-2 sm:py-4'>
      {/* Main Content Area */}
      {section === 'vocab' ? (
        <div className='flex flex-col gap-6 lg:flex-row lg:items-start lg:gap-6'>
          {/* CỘT TRÁI: Đặt ở vùng trống bên trái (ngay dưới banner Từ vựng) */}
          <aside className='sticky top-4 flex w-full shrink-0 flex-col gap-4 self-start lg:w-72 xl:w-80'>
            {/* Box 1: Breadcrumbs, Tiêu đề & Chọn bài */}
            <div className='flex flex-col gap-3.5 rounded-2xl border border-[var(--border-color)] bg-[var(--card-color)] p-4 shadow-xs'>
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
                <div className='mt-1.5 flex items-center justify-between gap-2'>
                  <h1 className='text-lg font-bold tracking-tight text-[var(--foreground-color)] sm:text-xl'>
                    {sectionTitle}
                  </h1>
                  <span className='rounded-full border border-[var(--border-color)] bg-[var(--background-color)] px-2.5 py-0.5 text-xs font-semibold text-[var(--secondary-color)]'>
                    {level.toUpperCase()}
                  </span>
                </div>
              </div>

              {/* Dropdown chọn bài học */}
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
            </div>

            {/* Box 2: Tiến độ bài học */}
            <div className='flex flex-col gap-2 rounded-2xl border border-[var(--border-color)] bg-[var(--card-color)] p-4 shadow-xs'>
              <div className='flex items-center justify-between text-xs text-[var(--secondary-color)]'>
                <span className='font-medium'>Tiến độ Bài {lessonId}</span>
                <span className='font-bold text-[var(--foreground-color)] tabular-nums'>
                  {learnedCount}/{words.length} ({progressPct}%)
                </span>
              </div>
              <div className='h-2 w-full overflow-hidden rounded-full bg-[var(--border-color)]'>
                <div
                  className='h-full rounded-full bg-[var(--main-color)] transition-all duration-500'
                  style={{ width: `${progressPct}%` }}
                />
              </div>
              <p className='mt-0.5 text-[11px] text-[var(--secondary-color)]'>
                {words.length - learnedCount > 0
                  ? `Còn ${words.length - learnedCount} từ cần nhớ`
                  : '🎉 Đã nhớ hết các từ trong bài!'}
              </p>
            </div>

            {/* Box 3: Bảng phím tắt học nhanh */}
            <div className='hidden flex-col gap-2 rounded-2xl border border-[var(--border-color)] bg-[var(--card-color)] p-4 text-xs text-[var(--secondary-color)] shadow-xs lg:flex'>
              <p className='text-xs font-semibold tracking-wider text-[var(--foreground-color)] uppercase'>
                Phím tắt học nhanh
              </p>
              <div className='flex items-center justify-between'>
                <span>Lật thẻ</span>
                <kbd className='rounded border border-[var(--border-color)] bg-[var(--background-color)] px-2 py-0.5 font-mono text-[11px] font-semibold text-[var(--foreground-color)]'>
                  Space / Enter
                </kbd>
              </div>
              <div className='flex items-center justify-between'>
                <span>Chưa nhớ</span>
                <kbd className='rounded border border-red-500/30 bg-red-500/10 px-2 py-0.5 font-mono text-[11px] font-semibold text-red-400'>
                  1
                </kbd>
              </div>
              <div className='flex items-center justify-between'>
                <span>Đã nhớ</span>
                <kbd className='rounded border border-green-500/30 bg-green-500/10 px-2 py-0.5 font-mono text-[11px] font-semibold text-green-500'>
                  2
                </kbd>
              </div>
              <div className='flex items-center justify-between'>
                <span>Chuyển từ</span>
                <kbd className='rounded border border-[var(--border-color)] bg-[var(--background-color)] px-2 py-0.5 font-mono text-[11px] font-semibold text-[var(--foreground-color)]'>
                  ← →
                </kbd>
              </div>
            </div>
          </aside>

          {/* CỘT PHẢI: Khu vực Flashcard 3D & Bảng từ vựng */}
          <main className='flex min-w-0 flex-1 flex-col gap-6'>
            {/* Sticky Flashcard: Giữ cố định trên cùng khi cuộn danh sách từ */}
            <div className='sticky top-0 z-20 border-b border-[var(--border-color)]/40 bg-[var(--background-color)]/95 pt-2 pb-3.5 shadow-xs backdrop-blur-md transition-all'>
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

            {/* Bảng danh sách từ vựng */}
            <div className='pt-1'>
              <VocabTableView
                words={words}
                lessonId={lessonId}
                cursor={safeCursor}
                learned={learned}
                onSelectWord={handleSelectWord}
                onResetLesson={handleResetLesson}
              />
            </div>
          </main>
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
