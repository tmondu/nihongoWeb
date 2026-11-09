'use client';

import React from 'react';
import clsx from 'clsx';
import { Palette, Check, Layers } from 'lucide-react';
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from '@/shared/ui/components/popover';
import { SIDEBAR_PATTERNS, type SidebarPatternId } from './sidebarPatterns';

interface SidebarPatternSwitcherProps {
  currentPattern: SidebarPatternId;
  isEnabled: boolean;
  isCollapsed: boolean;
  onSelectPattern: (id: SidebarPatternId) => void;
  onToggleEnabled: () => void;
}

export default function SidebarPatternSwitcher({
  currentPattern,
  isEnabled,
  isCollapsed,
  onSelectPattern,
  onToggleEnabled,
}: SidebarPatternSwitcherProps) {
  const patternList: SidebarPatternId[] = [
    'sakura',
    'seigaiha',
    'shippo',
    'aurora',
    'dotgrid',
  ];

  const panelContent = (
    <div className='flex w-full flex-col gap-2 rounded-2xl border border-(--border-color)/60 bg-white/90 p-2.5 shadow-md backdrop-blur-md'>
      {/* Header: Title + Toggle On/Off Switch */}
      <div className='flex items-center justify-between px-0.5'>
        <div className='flex items-center gap-1.5'>
          <Palette className='size-4 text-indigo-600' />
          <span className='text-[11px] font-bold text-slate-800'>
            Hoa văn Sidebar
          </span>
        </div>

        {/* Enable / Disable Button */}
        <button
          type='button'
          onClick={onToggleEnabled}
          className={clsx(
            'inline-flex cursor-pointer items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-bold transition-all duration-200',
            isEnabled
              ? 'bg-emerald-600 text-white shadow-2xs hover:bg-emerald-700'
              : 'bg-slate-200 text-slate-600 hover:bg-slate-300',
          )}
        >
          {isEnabled ? 'ĐANG BẬT' : 'ĐANG TẮT'}
        </button>
      </div>

      {/* Pattern Selector Pills */}
      {isEnabled && (
        <div className='grid grid-cols-2 gap-1.5 pt-0.5'>
          {patternList.map(pid => {
            const pattern = SIDEBAR_PATTERNS[pid];
            const isSelected = currentPattern === pid;

            const selectedClass =
              pid === 'sakura'
                ? 'border-rose-400 bg-rose-50/95 text-rose-950 shadow-2xs ring-1 ring-rose-400/50'
                : pid === 'seigaiha'
                  ? 'border-sky-500 bg-sky-50/95 text-sky-950 shadow-2xs ring-1 ring-sky-500/40'
                  : pid === 'shippo'
                    ? 'border-purple-500 bg-purple-50/95 text-purple-950 shadow-2xs ring-1 ring-purple-500/40'
                    : pid === 'aurora'
                      ? 'border-violet-500 bg-violet-50/95 text-violet-950 shadow-2xs ring-1 ring-violet-500/40'
                      : 'border-teal-500 bg-teal-50/95 text-teal-950 shadow-2xs ring-1 ring-teal-500/40';

            return (
              <button
                key={pid}
                type='button'
                onClick={() => onSelectPattern(pid)}
                className={clsx(
                  'flex cursor-pointer items-center gap-1.5 rounded-xl border px-2 py-1.5 text-left transition-all duration-200 active:scale-[0.98]',
                  isSelected
                    ? selectedClass
                    : 'border-slate-200/80 bg-white/80 text-slate-700 hover:border-slate-300 hover:bg-white',
                )}
                title={pattern.description}
              >
                <span className='text-sm'>{pattern.icon}</span>
                <span className='truncate text-[11px] leading-tight font-semibold'>
                  {pattern.shortLabel}
                </span>
                {isSelected && (
                  <Check className='ml-auto size-3 shrink-0 text-current' />
                )}
              </button>
            );
          })}
        </div>
      )}

      {/* Active pattern note */}
      <div className='px-1 text-[10px] leading-tight text-slate-600'>
        {isEnabled ? (
          <span className='flex items-center gap-1'>
            <Layers className='size-3 text-amber-700' />
            <span>{SIDEBAR_PATTERNS[currentPattern].label}</span>
          </span>
        ) : (
          <span>Đang dùng nền trơn tự nhiên.</span>
        )}
      </div>
    </div>
  );

  if (isCollapsed) {
    return (
      <div className='flex w-full justify-center py-1'>
        <Popover>
          <PopoverTrigger asChild>
            <button
              type='button'
              className={clsx(
                'flex size-9 cursor-pointer items-center justify-center rounded-xl border transition-all duration-200 active:scale-95',
                isEnabled
                  ? currentPattern === 'sakura'
                    ? 'border-rose-300 bg-rose-50/90 text-rose-600 shadow-2xs hover:bg-rose-100/80'
                    : 'border-indigo-400/60 bg-white/80 text-indigo-600 shadow-xs hover:bg-white'
                  : 'border-(--border-color)/60 bg-(--card-color)/60 text-(--secondary-color) hover:text-(--main-color)',
              )}
              title={
                isEnabled
                  ? `Hoa văn: ${SIDEBAR_PATTERNS[currentPattern].label} (Click để đổi)`
                  : 'Hoa văn Sidebar đang TẮT (Click để bật)'
              }
              aria-label='Đổi hoa văn sidebar'
            >
              <Palette className='size-4.5' />
            </button>
          </PopoverTrigger>
          <PopoverContent
            side='right'
            align='end'
            className='w-64 border-none bg-transparent p-0 shadow-none'
          >
            {panelContent}
          </PopoverContent>
        </Popover>
      </div>
    );
  }

  return <div className='my-2 w-full'>{panelContent}</div>;
}
