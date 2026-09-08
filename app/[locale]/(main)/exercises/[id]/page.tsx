'use client';

import React, { useState, useEffect, use } from 'react';
import { Link } from '@/core/i18n/routing';
import { ArrowLeft, Loader2, BookOpen } from 'lucide-react';
import { ExerciseRunner } from '@/features/Exercises';
import { PublicQuestion } from '@/shared/types/exercise';

interface ExerciseDetail {
  id: number;
  title: string;
  description: string | null;
  level: string;
  time_limit: number;
  questions: PublicQuestion[];
  total_questions: number;
}

export default function ExerciseDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const exerciseId = resolvedParams.id;

  const [exercise, setExercise] = useState<ExerciseDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchExercise = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await fetch(`/api/exercises/${exerciseId}`);
        if (!res.ok) throw new Error('Không thể tải bài tập');
        const data = await res.json();
        if (data.success && data.exercise) {
          setExercise(data.exercise);
        } else {
          setError(data.message || 'Bài tập không tồn tại hoặc đã bị ẩn.');
        }
      } catch {
        setError('Lỗi kết nối đến máy chủ.');
      } finally {
        setLoading(false);
      }
    };

    fetchExercise();
  }, [exerciseId]);

  if (loading) {
    return (
      <div className='flex min-h-[60vh] flex-col items-center justify-center gap-3'>
        <Loader2 className='size-10 animate-spin text-(--main-color)' />
        <p className='text-sm text-(--secondary-color)'>
          Đang tải đề bài tập...
        </p>
      </div>
    );
  }

  if (error || !exercise) {
    return (
      <div className='flex min-h-[60vh] flex-col items-center justify-center gap-4 text-center'>
        <BookOpen className='size-12 text-red-400' />
        <h2 className='text-lg font-bold text-(--main-color)'>
          {error || 'Không tìm thấy bài tập'}
        </h2>
        <Link href='/exercises'>
          <button
            type='button'
            className='inline-flex items-center gap-2 rounded-2xl border border-(--border-color) bg-(--card-color) px-5 py-2.5 text-xs font-semibold text-(--secondary-color) hover:border-(--main-color) hover:text-(--main-color)'
          >
            <ArrowLeft className='size-4' />
            Quay lại danh sách bài tập
          </button>
        </Link>
      </div>
    );
  }

  return (
    <div className='min-h-screen pb-16'>
      <ExerciseRunner
        exerciseId={exercise.id}
        title={exercise.title}
        timeLimitMinutes={exercise.time_limit}
        questions={exercise.questions}
      />
    </div>
  );
}
