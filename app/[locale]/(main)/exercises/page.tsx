'use client';

import React, { useState, useEffect } from 'react';
import { ClipboardCheck, Sparkles, Loader2, RefreshCw } from 'lucide-react';
import { ExerciseList } from '@/features/Exercises';
import { useClick } from '@/shared/hooks/generic/useAudio';

export default function ExercisesPage() {
  const { playClick } = useClick();
  const [exercises, setExercises] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchExercises = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/exercises');
      if (!res.ok) throw new Error('Không thể tải bài tập');
      const data = await res.json();
      if (data.success) {
        setExercises(data.exercises || []);
      } else {
        setError(data.message || 'Lỗi tải danh sách bài tập');
      }
    } catch {
      setError('Lỗi kết nối đến máy chủ.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExercises();
  }, []);

  return (
    <div className='mx-auto max-w-6xl space-y-8 px-4 py-8 sm:px-6'>
      {/* Header matching PThamSS design language */}
      <div className='flex flex-col gap-4 border-b border-(--border-color) pb-6 sm:flex-row sm:items-center sm:justify-between'>
        <div className='flex items-center gap-3.5'>
          <div className='flex size-12 items-center justify-center rounded-2xl bg-(--main-color) text-(--background-color) shadow-md'>
            <ClipboardCheck className='size-6' />
          </div>
          <div>
            <div className='flex items-center gap-2'>
              <h1 className='text-2xl font-extrabold text-(--main-color) sm:text-3xl'>
                Bài Tập Trắc Nghiệm
              </h1>
              <span className='inline-flex items-center gap-1 rounded-full bg-(--main-color)/15 px-2.5 py-0.5 text-xs font-bold text-(--main-color)'>
                <Sparkles className='size-3' />
                JLPT N5 - N1
              </span>
            </div>
            <p className='mt-0.5 text-xs text-(--secondary-color) sm:text-sm'>
              Luyện tập ngữ pháp, từ vựng và chữ Hán có chấm điểm & giải thích
              chi tiết
            </p>
          </div>
        </div>
      </div>

      {/* Content Area */}
      {loading ? (
        <div className='flex min-h-[300px] flex-col items-center justify-center gap-3 rounded-3xl border-2 border-(--border-color) bg-(--card-color) p-8'>
          <Loader2 className='size-8 animate-spin text-(--main-color)' />
          <p className='text-xs font-medium text-(--secondary-color)'>
            Đang tải danh sách bài tập...
          </p>
        </div>
      ) : error ? (
        <div className='flex min-h-[300px] flex-col items-center justify-center gap-3 rounded-3xl border-2 border-(--border-color) bg-(--card-color) p-8 text-center'>
          <ClipboardCheck className='size-10 text-red-500' />
          <p className='text-sm text-(--secondary-color)'>{error}</p>
          <button
            type='button'
            onClick={() => {
              playClick();
              fetchExercises();
            }}
            className='mt-2 inline-flex items-center gap-2 rounded-2xl border border-(--border-color) bg-(--card-color) px-4 py-2 text-xs font-semibold text-(--secondary-color) hover:border-(--main-color) hover:text-(--main-color)'
          >
            <RefreshCw className='size-3.5' />
            Thử lại
          </button>
        </div>
      ) : (
        <ExerciseList initialExercises={exercises} />
      )}
    </div>
  );
}
