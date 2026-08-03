'use client';

import React from 'react';
import { cn } from '@/shared/utils/utils';
import { useLocale } from 'next-intl';
import type { VerbInfo } from '../types';

interface SEOContentProps {
  /** Optional verb info for verb-specific content */
  verb?: VerbInfo;
}

/**
 * SEOContent - Educational content about Japanese verb conjugation
 */
export default function SEOContent({ verb }: SEOContentProps) {
  const locale = useLocale();

  return (
    <section className='flex flex-col gap-8 py-12'>
      <div className='flex flex-col gap-2'>
        <div className='flex items-center gap-2 text-[10px] font-bold tracking-widest text-(--secondary-color)/40 uppercase'>
          <div className='h-[1px] w-4 bg-(--main-color)' />
          <span>{locale === 'vi' ? 'Thông tin' : 'Information'}</span>
        </div>
        <h2 className='text-2xl font-bold tracking-tight text-(--main-color)'>
          {locale === 'vi' ? 'Chia động từ tiếng Nhật' : 'Japanese Verb Conjugation'}
        </h2>
      </div>

      <div className='max-w-3xl text-(--secondary-color)/70'>
        <p className='text-base font-medium'>
          {locale === 'vi'
            ? 'Động từ tiếng Nhật được chia dựa trên phân loại của chúng: Godan, Ichidan, hoặc Bất quy tắc. Sử dụng công cụ này để nhanh chóng tìm thấy thể chính xác cho bất kỳ động từ nào.'
            : 'Japanese verbs are conjugated based on their classification: Godan, Ichidan, or Irregular. Use this tool to quickly find the correct form for any verb.'}
        </p>
      </div>

      <div className='grid grid-cols-1 gap-6 sm:grid-cols-3'>
        <div className='flex flex-col gap-2'>
          <h3 className='text-lg font-bold text-blue-500'>
            {locale === 'vi' ? 'Động từ Godan' : 'Godan Verbs'}
          </h3>
          <p className='text-sm text-(--secondary-color)/60'>
            {locale === 'vi'
              ? 'Động từ kết thúc bằng -u và biến đổi âm đuôi qua năm hàng nguyên âm.'
              : 'Verbs that end in -u and conjugate across five vowel sounds.'}
          </p>
        </div>
        <div className='flex flex-col gap-2'>
          <h3 className='text-lg font-bold text-green-500'>
            {locale === 'vi' ? 'Động từ Ichidan' : 'Ichidan Verbs'}
          </h3>
          <p className='text-sm text-(--secondary-color)/60'>
            {locale === 'vi'
              ? 'Động từ kết thúc bằng -iru hoặc -eru và lược bỏ đuôi る khi chia.'
              : 'Verbs that end in -iru or -eru and drop the る to conjugate.'}
          </p>
        </div>
        <div className='flex flex-col gap-2'>
          <h3 className='text-lg font-bold text-purple-500'>
            {locale === 'vi' ? 'Động từ Bất quy tắc' : 'Irregular Verbs'}
          </h3>
          <p className='text-sm text-(--secondary-color)/60'>
            {locale === 'vi'
              ? 'Các động từ như する và 来る tuân theo quy tắc biến đổi đặc trưng.'
              : 'Verbs like する and 来る that follow unique patterns.'}
          </p>
        </div>
      </div>

      <div className='border-t border-(--border-color)/10 pt-8'>
        <p className='text-xs text-(--secondary-color)/40'>
          {locale === 'vi'
            ? 'PThamSS cung cấp cách chia động từ tiếng Nhật chính xác cho học sinh và người bản xứ.'
            : 'PThamSS provides accurate Japanese verb conjugations for students and speakers.'}
        </p>
      </div>
    </section>
  );
}

