'use client';

import { useCallback } from 'react';
import { cn } from '@/shared/utils/utils';
import useVocabStudyStore from '../../store/useVocabStudyStore';
import { getLessons, LESSON_COUNT } from '../../data/lessonsN5';
import type { VocabLevel } from '../../types/study';
import VocabTreeNav from './VocabTreeNav';
import VocabFlashcardHero from './VocabFlashcardHero';
import VocabTableView from './VocabTableView';
import VocabPronounceStudio from './VocabPronounceStudio';

interface ModernVocabContainerProps {
  fixedLevel?: VocabLevel;
}

export default function ModernVocabContainer({
  fixedLevel,
}: ModernVocabContainerProps) {
  const store = useVocabStudyStore();

  // If a fixed level is provided via route, use it (but let the store track state)
  const level = fixedLevel ?? store.level;
  const {
    section,
    lessonId,
    expandedVocab,
    expandedSpeak,
    learned,
    curMap,
    scores,
  } = store;

  const lessons = getLessons(level);
  const lessonData = lessons[lessonId] ?? { words: [] };
  const words = lessonData.words;
  const cursor = curMap[String(lessonId)] ?? 0;
  const safeCursor = Math.min(cursor, Math.max(0, words.length - 1));

  // callbacks
  const handleToggle = useCallback(
    (sec: 'vocab' | 'speak') => {
      store.toggleSection(sec);
    },
    [store],
  );

  const handleSelect = useCallback(
    (sec: 'vocab' | 'speak', lid: number) => {
      store.setView(sec, lid);
    },
    [store],
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

  const lessonCount = LESSON_COUNT[level];

  return (
    <div className='flex min-h-screen flex-col gap-6 lg:flex-row'>
      {/* Tree nav */}
      <VocabTreeNav
        level={level}
        lessons={lessons}
        currentSection={section}
        currentLessonId={lessonId}
        expandedVocab={expandedVocab}
        expandedSpeak={expandedSpeak}
        learned={learned}
        scores={scores}
        onToggle={handleToggle}
        onSelect={handleSelect}
      />

      {/* Main content */}
      <div className='flex flex-1 flex-col gap-6'>
        {/* Mobile nav */}
        <div className='lg:hidden'>
          <select
            className='w-full rounded-lg border border-[var(--border-color)] bg-[var(--card-color)] px-3 py-2 text-sm text-[var(--foreground-color)]'
            value={`${section}:${lessonId}`}
            onChange={e => {
              const [sec, lid] = e.target.value.split(':');
              handleSelect(sec as 'vocab' | 'speak', Number(lid));
            }}
          >
            {(['vocab', 'speak'] as const).map(sec =>
              Array.from({ length: lessonCount }, (_, i) => i + 1).map(id => (
                <option key={`${sec}:${id}`} value={`${sec}:${id}`}>
                  {sec === 'vocab' ? '📖' : '🎤'} Bài {id}
                </option>
              )),
            )}
          </select>
        </div>

        {/* Breadcrumb + Title */}
        <div>
          <p className='text-xs text-[var(--secondary-color)]'>
            Từ vựng &rsaquo; {level.toUpperCase()} &rsaquo;{' '}
            {section === 'vocab' ? '1000 từ vựng' : 'Luyện phát âm'} &rsaquo;
            Bài {lessonId}
          </p>
          <h1
            className={cn(
              'mt-1 text-xl font-bold text-[var(--foreground-color)]',
            )}
          >
            {section === 'vocab' ? '1000 từ vựng' : 'Luyện phát âm'} — Bài{' '}
            {lessonId}
            <span className='ml-2 text-sm font-normal text-[var(--secondary-color)]'>
              {level.toUpperCase()}
            </span>
          </h1>
        </div>

        {/* Content panel */}
        {section === 'vocab' ? (
          <div className='flex flex-col gap-8'>
            {/* Flashcard */}
            <VocabFlashcardHero
              words={words}
              lessonId={lessonId}
              cursor={safeCursor}
              learned={learned}
              onMarkLearned={handleMarkLearned}
              onMarkNotLearned={handleMarkNotLearned}
              onNavigate={handleNavigate}
            />

            {/* Divider */}
            <div className='flex items-center gap-4'>
              <div className='h-px flex-1 bg-[var(--border-color)]' />
              <span className='text-xs text-[var(--secondary-color)]'>
                Bảng từ vựng
              </span>
              <div className='h-px flex-1 bg-[var(--border-color)]' />
            </div>

            {/* Table */}
            <VocabTableView
              words={words}
              lessonId={lessonId}
              cursor={safeCursor}
              learned={learned}
              onSelectWord={handleSelectWord}
              onResetLesson={handleResetLesson}
            />
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
    </div>
  );
}
