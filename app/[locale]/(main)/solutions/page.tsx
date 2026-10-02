'use client';

import { Suspense } from 'react';
import { SolutionsPageClient } from '@/features/Solutions';

export default function SolutionsPage() {
  return (
    <Suspense
      fallback={
        <div className='flex min-h-screen items-center justify-center bg-slate-50 dark:bg-slate-950'>
          <div className='flex items-center gap-3 rounded-2xl bg-white p-6 shadow-xl dark:bg-slate-900'>
            <div className='size-6 animate-spin rounded-full border-2 border-emerald-600 border-t-transparent' />
            <span className='text-sm font-semibold text-slate-700 dark:text-slate-300'>
              Đang tải đáp án chi tiết...
            </span>
          </div>
        </div>
      }
    >
      <SolutionsPageClient />
    </Suspense>
  );
}
