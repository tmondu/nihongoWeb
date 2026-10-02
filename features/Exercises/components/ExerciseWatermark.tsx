'use client';

import React from 'react';
import Image from 'next/image';

interface ExerciseWatermarkProps {
  imageSrc?: string;
  text?: string;
  subText?: string;
  className?: string;
}

export const ExerciseWatermark: React.FC<ExerciseWatermarkProps> = ({
  imageSrc = '/images/exercise-watermark.png',
  text,
  subText,
  className = '',
}) => {
  return (
    <div
      aria-hidden='true'
      className={`pointer-events-none absolute inset-0 flex items-center justify-center overflow-hidden select-none ${className}`}
    >
      {/* Mascot Graphic Watermark */}
      {imageSrc && (
        <div className='absolute inset-0 flex items-center justify-center p-6 opacity-[0.06] transition-opacity md:p-12 dark:opacity-[0.08] print:opacity-[0.04] print:grayscale'>
          <div className='relative h-full max-h-[520px] w-full max-w-[720px]'>
            <Image
              src={imageSrc}
              alt='Exercise Watermark'
              fill
              sizes='(max-width: 768px) 100vw, 720px'
              className='pointer-events-none object-contain select-none'
              priority={false}
            />
          </div>
        </div>
      )}

      {/* Optional Overlay Text / Kanji Watermark */}
      {(text || subText) && (
        <div className='relative z-1 flex flex-col items-center justify-center text-center opacity-[0.035] transition-opacity dark:opacity-[0.05] print:opacity-[0.03]'>
          {text && (
            <div className='relative flex items-center justify-center'>
              <span
                className='font-japanese text-[130px] leading-none font-black tracking-widest text-current sm:text-[180px] print:text-[150px]'
                style={{
                  textShadow: '0 0 20px currentColor',
                }}
              >
                {text}
              </span>
            </div>
          )}
          {subText && (
            <span className='mt-2 text-sm font-black tracking-[0.25em] text-current uppercase sm:text-base print:text-xs'>
              {subText}
            </span>
          )}
        </div>
      )}
    </div>
  );
};
