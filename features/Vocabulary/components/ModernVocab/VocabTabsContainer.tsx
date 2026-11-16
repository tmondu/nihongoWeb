'use client';

import { Mic } from 'lucide-react';
import { Link } from '@/core/i18n/routing';
import { cn } from '@/shared/utils/utils';
import type { VocabLevel } from '../../types/study';

type Tone = 'teal' | 'amber' | 'coral' | 'sky' | 'lime' | 'pink';

interface TabItem {
  level: VocabLevel;
  tone: Tone;
}

// Mỗi ô một màu riêng, hàng trên ấm/đậm, hàng dưới sáng hơn.
const LEVEL_TABS: TabItem[] = [
  { level: 'n5', tone: 'teal' },
  { level: 'n4', tone: 'amber' },
  { level: 'n3', tone: 'coral' },
  { level: 'n2', tone: 'sky' },
  { level: 'n1', tone: 'lime' },
];

const TONE_CLASS: Record<Tone, string> = {
  teal: 'bg-[#2fb7ad]',
  amber: 'bg-[#ffc93c]',
  coral: 'bg-[#ff7a6b]',
  sky: 'bg-[#6db7f2]',
  lime: 'bg-[#b6dc5a]',
  pink: 'bg-[#ff9ec7]',
};

const tabClass = (tone: Tone) =>
  cn(
    'flex min-h-36 items-center justify-center gap-3 rounded-3xl border-[3px] border-[#16353a] px-4 text-center text-2xl font-extrabold text-[#16353a]',
    'shadow-[-6px_7px_0_0_#16353a] transition-all duration-150 ease-out',
    'hover:translate-x-[-4px] hover:translate-y-[5px] hover:shadow-[-2px_2px_0_0_#16353a]',
    'active:translate-x-[-6px] active:translate-y-[7px] active:shadow-[0_0_0_0_#16353a]',
    'focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#16353a]',
    'sm:min-h-48 sm:text-3xl md:min-h-[264px] lg:min-h-[312px] lg:text-5xl',
    TONE_CLASS[tone],
  );

export default function VocabTabsContainer() {
  return (
    <div className='font-vietnamese flex w-full flex-col gap-6 px-2 py-4 sm:py-6'>
      <nav
        aria-label='Chọn cấp độ hoặc luyện nói'
        className='grid grid-cols-3 gap-5 sm:gap-7'
      >
        {LEVEL_TABS.map(({ level, tone }) => (
          <Link
            key={level}
            href={`/vocabulary/jlpt-${level}`}
            className={tabClass(tone)}
          >
            {level.toUpperCase()}
          </Link>
        ))}
        <Link href='/vocabulary/jlpt-n5/pronounce' className={tabClass('pink')}>
          <Mic
            className='size-7 shrink-0 lg:size-10'
            strokeWidth={2.5}
            aria-hidden='true'
          />
          <span className='text-xl sm:text-2xl lg:text-4xl'>
            Luyện Kaiwa / Phát âm
          </span>
        </Link>
      </nav>
    </div>
  );
}
