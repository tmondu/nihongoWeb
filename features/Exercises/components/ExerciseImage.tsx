'use client';

import React, { useState } from 'react';
import { Maximize2, X } from 'lucide-react';

interface ExerciseImageProps {
  src: string;
  alt: string;
  className?: string;
}

// Ảnh trong đề (bảng, tờ rơi, đáp án bằng hình): bấm để phóng to.
export const ExerciseImage: React.FC<ExerciseImageProps> = ({
  src,
  alt,
  className = '',
}) => {
  const [isZoomed, setIsZoomed] = useState(false);

  return (
    <>
      <button
        type='button'
        onClick={() => setIsZoomed(true)}
        className={`group relative block overflow-hidden rounded-xl border border-(--border-color) bg-white print:border-neutral-300 ${className}`}
        aria-label={`Phóng to: ${alt}`}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={src}
          alt={alt}
          loading='lazy'
          className='h-auto max-h-96 w-full object-contain print:max-h-64'
        />
        <span className='absolute right-2 bottom-2 inline-flex items-center gap-1 rounded-lg bg-black/75 px-2 py-1 text-[11px] font-medium text-white opacity-0 transition-opacity group-hover:opacity-100 print:hidden'>
          <Maximize2 className='size-3' />
          Phóng to
        </span>
      </button>

      {isZoomed && (
        <div
          className='fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 print:hidden'
          onClick={() => setIsZoomed(false)}
          role='dialog'
          aria-label={alt}
        >
          <div
            className='relative max-h-[90vh] max-w-5xl overflow-auto rounded-2xl bg-white p-2'
            onClick={e => e.stopPropagation()}
          >
            <button
              type='button'
              onClick={() => setIsZoomed(false)}
              className='absolute top-3 right-3 flex size-8 items-center justify-center rounded-full bg-black/70 text-white'
              aria-label='Đóng'
            >
              <X className='size-5' />
            </button>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={src}
              alt={alt}
              className='h-auto max-h-[85vh] w-auto max-w-full rounded-xl object-contain'
            />
          </div>
        </div>
      )}
    </>
  );
};
