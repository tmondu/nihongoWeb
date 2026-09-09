'use client';

import React, { useState, useMemo } from 'react';
import { Search, BookOpen } from 'lucide-react';
import { ExerciseCard } from './ExerciseCard';
import { useClick } from '@/shared/hooks/generic/useAudio';

interface ExerciseItem {
  id: number;
  title: string;
  description: string | null;
  level: string;
  time_limit: number;
  total_questions: number;
  total_submissions?: number;
  user_best_score?: number | null;
}

interface ExerciseListProps {
  initialExercises: ExerciseItem[];
}

const LEVELS = [
  { id: 'all', label: 'Tất cả' },
  { id: 'n5', label: 'JLPT N5' },
  { id: 'n4', label: 'JLPT N4' },
  { id: 'n3', label: 'JLPT N3' },
  { id: 'n2', label: 'JLPT N2' },
  { id: 'n1', label: 'JLPT N1' },
];

export const ExerciseList: React.FC<ExerciseListProps> = ({
  initialExercises,
}) => {
  const { playClick } = useClick();
  const [exercises] = useState<ExerciseItem[]>(initialExercises);
  const [selectedLevel, setSelectedLevel] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredExercises = useMemo(() => {
    const list = exercises.filter(ex => {
      const matchLevel =
        selectedLevel === 'all' ||
        ex.level.toLowerCase() === selectedLevel.toLowerCase();

      const matchSearch =
        !searchQuery.trim() ||
        ex.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (ex.description &&
          ex.description.toLowerCase().includes(searchQuery.toLowerCase()));

      return matchLevel && matchSearch;
    });

    const levelPriority: Record<string, number> = {
      n5: 1,
      n4: 2,
      n3: 3,
      n2: 4,
      n1: 5,
    };

    return list.sort((a, b) => {
      const pA = levelPriority[a.level?.toLowerCase()] ?? 99;
      const pB = levelPriority[b.level?.toLowerCase()] ?? 99;
      if (pA !== pB) return pA - pB;
      return a.title.localeCompare(b.title, undefined, {
        numeric: true,
        sensitivity: 'base',
      });
    });
  }, [exercises, selectedLevel, searchQuery]);

  return (
    <div className='space-y-6'>
      {/* Search and Filters */}
      <div className='flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
        {/* Level Tag Filters */}
        <div className='flex flex-wrap items-center gap-1.5 overflow-x-auto pb-1 text-xs'>
          {LEVELS.map(lvl => {
            const active = selectedLevel === lvl.id;
            return (
              <button
                key={lvl.id}
                type='button'
                onClick={() => {
                  playClick();
                  setSelectedLevel(lvl.id);
                }}
                className={`rounded-full px-3.5 py-1.5 font-semibold transition-all ${
                  active
                    ? 'bg-(--main-color) text-(--background-color)'
                    : 'border border-(--border-color) bg-(--card-color) text-(--secondary-color) hover:text-(--main-color)'
                }`}
              >
                {lvl.label}
              </button>
            );
          })}
        </div>

        {/* Search Input */}
        <div className='relative max-w-xs flex-1'>
          <Search className='absolute top-3 left-3.5 size-4 text-(--secondary-color)' />
          <input
            type='text'
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder='Tìm kiếm bài tập...'
            className='w-full rounded-2xl border border-(--border-color) bg-(--card-color) py-2.5 pr-4 pl-10 text-sm text-(--main-color) placeholder:text-(--secondary-color)/50 focus:border-(--main-color) focus:outline-none'
          />
        </div>
      </div>

      {/* Grid of Exercises */}
      {filteredExercises.length === 0 ? (
        <div className='flex min-h-[250px] flex-col items-center justify-center rounded-3xl border-2 border-dashed border-(--border-color) bg-(--card-color)/40 p-8 text-center'>
          <BookOpen className='size-10 text-(--secondary-color)' />
          <h3 className='mt-2.5 text-base font-semibold text-(--main-color)'>
            Không tìm thấy bài tập nào
          </h3>
          <p className='mt-1 max-w-sm text-xs text-(--secondary-color)'>
            Hiện chưa có bài tập nào thuộc cấp độ này hoặc thử tìm kiếm với từ
            khóa khác.
          </p>
        </div>
      ) : (
        <div className='grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3'>
          {filteredExercises.map(ex => (
            <ExerciseCard key={ex.id} exercise={ex} />
          ))}
        </div>
      )}
    </div>
  );
};
