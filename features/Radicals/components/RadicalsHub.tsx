'use client';

import React from 'react';
import { useRadicalsStore, type RadicalsTab } from '../store/useRadicalsStore';
import RadicalExplorer from './RadicalExplorer';
import KanjiDecomposer from './KanjiDecomposer';
import KanjiSynthesizer from './KanjiSynthesizer';
import { LayoutGrid, Puzzle, Layers } from 'lucide-react';
import clsx from 'clsx';

export const RadicalsHub: React.FC = () => {
  const { activeTab, setActiveTab } = useRadicalsStore();

  const tabs: { key: RadicalsTab; label: string; icon: React.ElementType }[] = [
    { key: 'explore', label: 'Khám phá 214 Bộ Thủ', icon: LayoutGrid },
    { key: 'synthesize', label: 'Ghép Bộ Thủ Thành Chữ', icon: Puzzle },
    { key: 'decompose', label: 'Phân Rã & Chiết Tự', icon: Layers },
  ];

  return (
    <div className='flex flex-col gap-6'>
      {/* Top title & intro */}
      <div className='flex flex-col gap-2'>
        <h1 className='text-foreground text-2xl font-black tracking-tight md:text-3xl'>
          Kanji Theo Bộ Thủ (Kangxi Radicals)
        </h1>
        <p className='text-sm text-(--secondary-color)'>
          Khám phá 214 bộ thủ Kangxi theo mô hình phân tầng sư phạm, phân tích
          chiết tự và ghép các bộ thủ thành Hán tự mới
        </p>
      </div>

      {/* Main Tab Navigation */}
      <div className='flex items-center gap-2 overflow-x-auto border-b border-(--border-color) pb-2'>
        {tabs.map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              type='button'
              onClick={() => setActiveTab(tab.key)}
              className={clsx(
                'flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold whitespace-nowrap transition-all',
                isActive
                  ? 'bg-(--main-color) text-white shadow-sm'
                  : 'hover:text-foreground text-(--secondary-color) hover:bg-(--card-color)',
              )}
            >
              <Icon className='size-4' />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab Panels */}
      <div>
        {activeTab === 'explore' && <RadicalExplorer />}
        {activeTab === 'synthesize' && <KanjiSynthesizer />}
        {activeTab === 'decompose' && <KanjiDecomposer />}
      </div>
    </div>
  );
};

export default RadicalsHub;
