import React from 'react';
import { Link } from '@/core/i18n/routing';
import { Clock, HelpCircle, Trophy, ArrowRight, Play } from 'lucide-react';
import { useClick } from '@/shared/hooks/generic/useAudio';

interface ExerciseCardProps {
  exercise: {
    id: number;
    title: string;
    description: string | null;
    level: string;
    time_limit: number;
    total_questions: number;
    total_submissions?: number;
    user_best_score?: number | null;
  };
}

export const ExerciseCard: React.FC<ExerciseCardProps> = ({ exercise }) => {
  const { playClick } = useClick();

  return (
    <div className='group relative flex flex-col justify-between rounded-3xl border-2 border-(--border-color) bg-(--card-color) p-5 shadow-sm transition-all duration-250 hover:-translate-y-1 hover:border-(--main-color) hover:shadow-md'>
      <div>
        {/* Header: Level & Record badge */}
        <div className='flex items-center justify-between gap-2'>
          <span className='inline-flex items-center rounded-full bg-(--main-color)/15 px-3 py-0.5 text-xs font-bold tracking-wide text-(--main-color) uppercase'>
            JLPT {exercise.level}
          </span>

          {exercise.user_best_score !== null &&
            exercise.user_best_score !== undefined && (
              <span className='inline-flex items-center gap-1 rounded-full border border-(--border-color) bg-(--background-color) px-2.5 py-0.5 text-xs font-medium text-(--secondary-color)'>
                <Trophy className='size-3 text-(--main-color)' />
                <span>
                  Kỷ lục:{' '}
                  <b className='text-(--main-color)'>
                    {exercise.user_best_score}/{exercise.total_questions}
                  </b>
                </span>
              </span>
            )}
        </div>

        {/* Title */}
        <Link
          href={`/exercises/${exercise.id}`}
          onClick={playClick}
          className='mt-3.5 block'
        >
          <h3 className='line-clamp-2 text-lg font-bold text-(--main-color) transition-colors'>
            {exercise.title}
          </h3>
          {exercise.description && (
            <p className='mt-1.5 line-clamp-2 text-xs leading-relaxed text-(--secondary-color)'>
              {exercise.description}
            </p>
          )}
        </Link>

        {/* Meta Stats */}
        <div className='mt-4 flex flex-wrap items-center gap-4 text-xs text-(--secondary-color)'>
          <span className='flex items-center gap-1.5 font-medium'>
            <HelpCircle className='size-3.5 text-(--main-color)' />
            <span>{exercise.total_questions} câu hỏi</span>
          </span>
          <span className='flex items-center gap-1.5 font-medium'>
            <Clock className='size-3.5 text-(--main-color)' />
            <span>
              {exercise.time_limit > 0
                ? `${exercise.time_limit} phút`
                : 'Không giới hạn'}
            </span>
          </span>
        </div>
      </div>

      {/* Action Button */}
      <div className='mt-5 border-t border-(--border-color)/60 pt-4'>
        <Link
          href={`/exercises/${exercise.id}`}
          onClick={playClick}
          className='flex w-full items-center justify-between rounded-2xl bg-(--main-color) px-4 py-2.5 text-xs font-bold text-(--background-color) shadow-md transition-all hover:opacity-90 active:scale-95'
        >
          <span className='flex items-center gap-2'>
            <Play className='size-3.5 fill-current' />
            {exercise.user_best_score !== null &&
            exercise.user_best_score !== undefined
              ? 'Luyện tập lại'
              : 'Bắt đầu làm bài'}
          </span>
          <ArrowRight className='size-4' />
        </Link>
      </div>
    </div>
  );
};
