'use client';

import { useState } from 'react';
import { Mic } from 'lucide-react';
import { cn } from '@/shared/utils/utils';
import type { VocabLevel } from '../../types/study';
import ModernVocabContainer from './ModernVocabContainer';

type VocabTab = VocabLevel | 'kaiwa';

const LEVEL_TABS: VocabLevel[] = ['n5', 'n4', 'n3', 'n2', 'n1'];

export default function VocabTabsContainer() {
  const [activeTab, setActiveTab] = useState<VocabTab | null>(null);
  const [lastLevel, setLastLevel] = useState<VocabLevel>('n5');

  const handleSelect = (tab: VocabTab) => {
    setActiveTab(tab);
    if (tab !== 'kaiwa') setLastLevel(tab);
  };

  const tabClass = (active: boolean) =>
    cn(
      'flex min-h-24 items-center justify-center gap-2.5 rounded-xl border-[1.5px] px-4 text-center text-xl font-bold transition-all sm:min-h-32 sm:text-2xl md:min-h-40',
      'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--foreground-color)]',
      active
        ? 'border-[var(--main-color)] bg-[var(--main-color)] text-white'
        : 'border-[var(--border-color)] bg-[var(--card-color)] text-[var(--foreground-color)] hover:shadow-md',
    );

  return (
    <div className='font-vietnamese mx-auto flex w-full max-w-5xl flex-col gap-6 py-2 sm:py-4'>
      <div
        role='tablist'
        aria-label='Chọn cấp độ hoặc luyện nói'
        className='grid grid-cols-3 gap-3'
      >
        {LEVEL_TABS.map(level => (
          <button
            key={level}
            type='button'
            role='tab'
            aria-selected={activeTab === level}
            onClick={() => handleSelect(level)}
            className={tabClass(activeTab === level)}
          >
            {level.toUpperCase()}
          </button>
        ))}
        <button
          type='button'
          role='tab'
          aria-selected={activeTab === 'kaiwa'}
          onClick={() => handleSelect('kaiwa')}
          className={tabClass(activeTab === 'kaiwa')}
        >
          <Mic className='size-6 shrink-0' aria-hidden='true' />
          <span>Luyện Kaiwa / Phát âm</span>
        </button>
      </div>

      {activeTab && (
        <div role='tabpanel'>
          <ModernVocabContainer
            key={activeTab}
            fixedLevel={activeTab === 'kaiwa' ? lastLevel : activeTab}
            mode={activeTab === 'kaiwa' ? 'speak' : 'vocab'}
          />
        </div>
      )}
    </div>
  );
}
