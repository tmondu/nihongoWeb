'use client';

import { List, Mic, ChevronRight, ArrowLeft, ArrowRight } from 'lucide-react';
import { Link } from '@/core/i18n/routing';
import { cn } from '@/shared/utils/utils';
import type { VocabLevel, StudySection, LessonData } from '../../types/study';
import { LESSON_COUNT } from '../../data/lessonsN5';

interface VocabTreeNavProps {
  level: VocabLevel;
  lessons: Record<number, LessonData>;
  currentSection: StudySection;
  currentLessonId: number;
  expandedVocab: boolean;
  expandedSpeak: boolean;
  learned: string[];
  scores: Record<string, number>;
  singleMode?: StudySection;
  onToggle: (section: StudySection) => void;
  onSelect: (section: StudySection, lessonId: number) => void;
}

function lessonLearnedCount(
  lessonId: number,
  words: LessonData['words'],
  learned: string[],
): number {
  return words.filter(w => learned.includes(`${lessonId}:${w.hira}`)).length;
}

function lessonScoredCount(
  lessonId: number,
  words: LessonData['words'],
  scores: Record<string, number>,
): number {
  return words.filter(w => scores[`${lessonId}:${w.hira}`] !== undefined)
    .length;
}

export default function VocabTreeNav({
  level,
  lessons,
  currentSection,
  currentLessonId,
  expandedVocab,
  expandedSpeak,
  learned,
  scores,
  singleMode,
  onToggle,
  onSelect,
}: VocabTreeNavProps) {
  const count = LESSON_COUNT[level];
  const lessonIds = Array.from({ length: count }, (_, i) => i + 1);

  // If singleMode is active, render a dedicated, clean lesson list
  if (singleMode) {
    const isVocab = singleMode === 'vocab';
    const otherMode = isVocab ? 'pronounce' : 'words';
    const otherLabel = isVocab ? 'Luyện phát âm' : '1000 từ vựng';
    const currentTitle = isVocab ? '1000 từ vựng' : 'Luyện phát âm';

    return (
      <nav
        className='font-vietnamese hidden w-60 shrink-0 flex-col gap-2 self-start lg:flex'
        style={{ position: 'sticky', top: '1.5rem' }}
      >
        <Link
          href={`/vocabulary/jlpt-${level}`}
          className='mb-2 flex items-center gap-1.5 text-xs font-semibold text-[var(--secondary-color)] transition-colors hover:text-[var(--main-color)]'
        >
          <ArrowLeft size={14} /> Quay lại JLPT {level.toUpperCase()}
        </Link>

        <div className='rounded-xl border border-[var(--border-color)] bg-[var(--card-color)] p-3'>
          <div className='mb-2 flex items-center gap-2 border-b border-[var(--border-color)] pb-2'>
            {isVocab ? (
              <List size={16} className='text-[var(--main-color)]' />
            ) : (
              <Mic size={16} className='text-purple-500' />
            )}
            <span className='text-sm font-bold text-[var(--foreground-color)]'>
              {currentTitle}
            </span>
          </div>

          <div
            className='flex flex-col gap-0.5 overflow-y-auto pr-1'
            style={{ maxHeight: 'calc(100vh - 240px)' }}
          >
            {lessonIds.map(id => {
              const lessonData = lessons[id] ?? { words: [] };
              const total = lessonData.words.length;
              const done = isVocab
                ? lessonLearnedCount(id, lessonData.words, learned)
                : lessonScoredCount(id, lessonData.words, scores);
              const isActive = currentLessonId === id;

              return (
                <button
                  key={id}
                  onClick={() => onSelect(singleMode, id)}
                  className={cn(
                    'flex w-full items-center justify-between rounded-lg px-2.5 py-2 text-xs transition-colors',
                    isActive
                      ? 'bg-[var(--main-color)] font-semibold text-white shadow-sm'
                      : 'text-[var(--secondary-color)] hover:bg-[var(--border-color)]/40 hover:text-[var(--foreground-color)]',
                  )}
                >
                  <span>Bài {id}</span>
                  {total > 0 && (
                    <span
                      className={cn(
                        'text-[10px] tabular-nums',
                        isActive
                          ? 'text-white/90'
                          : done === total
                            ? 'text-green-500'
                            : 'text-[var(--secondary-color)]',
                      )}
                    >
                      {done}/{total}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        <Link
          href={`/vocabulary/jlpt-${level}/${otherMode}`}
          className='mt-2 flex items-center justify-between rounded-lg border border-[var(--border-color)] px-3 py-2 text-xs text-[var(--secondary-color)] transition-colors hover:border-[var(--main-color)] hover:text-[var(--main-color)]'
        >
          <span>Sang {otherLabel}</span>
          <ArrowRight size={13} />
        </Link>
      </nav>
    );
  }

  // Multi-mode accordion tree (legacy fallback)
  const renderSection = (section: StudySection, expanded: boolean) => {
    const Icon = section === 'vocab' ? List : Mic;
    const label = section === 'vocab' ? '1000 từ vựng' : 'Luyện phát âm';

    return (
      <div key={section}>
        <button
          onClick={() => onToggle(section)}
          className={cn(
            'flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-semibold transition-colors',
            currentSection === section
              ? 'bg-[var(--main-color)] text-white'
              : 'text-[var(--foreground-color)] hover:bg-[var(--card-color)]',
          )}
        >
          <Icon size={15} />
          <span className='flex-1 text-left'>{label}</span>
          <ChevronRight
            size={14}
            className={cn(
              'shrink-0 transition-transform',
              expanded && 'rotate-90',
            )}
          />
        </button>

        {expanded && (
          <div className='mt-1 ml-2 border-l border-[var(--border-color)] pl-3'>
            {lessonIds.map(id => {
              const lessonData = lessons[id] ?? { words: [] };
              const total = lessonData.words.length;
              const done =
                section === 'vocab'
                  ? lessonLearnedCount(id, lessonData.words, learned)
                  : lessonScoredCount(id, lessonData.words, scores);
              const isActive =
                currentSection === section && currentLessonId === id;

              return (
                <button
                  key={id}
                  onClick={() => onSelect(section, id)}
                  className={cn(
                    'flex w-full items-center justify-between rounded-md px-2 py-1.5 text-xs transition-colors',
                    isActive
                      ? 'bg-[var(--main-color)]/15 font-semibold text-[var(--main-color)]'
                      : 'text-[var(--secondary-color)] hover:bg-[var(--card-color)] hover:text-[var(--foreground-color)]',
                  )}
                >
                  <span>Bài {id}</span>
                  {total > 0 && (
                    <span
                      className={cn(
                        'text-[10px] tabular-nums',
                        done === total
                          ? 'text-green-500'
                          : 'text-[var(--secondary-color)]',
                      )}
                    >
                      {done}/{total}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>
    );
  };

  return (
    <nav
      className='font-vietnamese hidden w-60 shrink-0 flex-col gap-2 self-start lg:flex'
      style={{ position: 'sticky', top: '1.5rem' }}
    >
      <div className='mb-2 px-2 text-xs font-bold tracking-widest text-[var(--secondary-color)] uppercase'>
        {level.toUpperCase()}
      </div>
      {renderSection('vocab', expandedVocab)}
      {renderSection('speak', expandedSpeak)}

      {/* Mobile fallback select */}
      <div className='lg:hidden'>
        <select
          className='w-full rounded-lg border border-[var(--border-color)] bg-[var(--card-color)] px-3 py-2 text-sm text-[var(--foreground-color)]'
          value={`${currentSection}:${currentLessonId}`}
          onChange={e => {
            const [sec, lid] = e.target.value.split(':');
            onSelect(sec as StudySection, Number(lid));
          }}
        >
          {(['vocab', 'speak'] as StudySection[]).map(sec =>
            lessonIds.map(id => (
              <option key={`${sec}:${id}`} value={`${sec}:${id}`}>
                {sec === 'vocab' ? '📖' : '🎤'} Bài {id}
              </option>
            )),
          )}
        </select>
      </div>
    </nav>
  );
}
