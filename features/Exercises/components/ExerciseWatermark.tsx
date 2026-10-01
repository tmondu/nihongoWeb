'use client';

import React from 'react';

interface ExerciseWatermarkProps {
  text?: string;
  subText?: string;
}

export const ExerciseWatermark: React.FC<ExerciseWatermarkProps> = ({
  text = '文法',
  subText = 'Phan Thắm SS Nihongo',
}) => {
  return (
    <div
      aria-hidden='true'
      className='pointer-events-none absolute inset-0 flex items-center justify-center overflow-hidden select-none'
    >
      <div className='flex flex-col items-center justify-center text-center opacity-[0.035] transition-opacity dark:opacity-[0.05] print:opacity-[0.04]'>
        <div className='relative flex items-center justify-center'>
          {/* Kanji Watermark */}
          <span
            className='font-japanese text-[130px] leading-none font-black tracking-widest text-current sm:text-[180px] print:text-[150px]'
            style={{
              textShadow: '0 0 20px currentColor',
            }}
          >
            {text}
          </span>
        </div>
        <span className='mt-2 text-sm font-black tracking-[0.25em] text-current uppercase sm:text-base print:text-xs'>
          {subText}
        </span>
      </div>
    </div>
  );
};
