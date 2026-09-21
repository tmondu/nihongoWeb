'use client';

import React, { useState, useEffect, useMemo } from 'react';
import type { IRadical } from '@/entities/radical';
import { radicalDataService } from '../services/radicalDataService';
import { useRadicalsStore } from '../store/useRadicalsStore';
import RadicalDetailModal from './RadicalDetailModal';
import { Search, Filter, X } from 'lucide-react';
import clsx from 'clsx';

export const RadicalExplorer: React.FC = () => {
  const [radicals, setRadicals] = useState<IRadical[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const {
    selectedLayer,
    setSelectedLayer,
    searchQuery,
    setSearchQuery,
    selectedStroke,
    setSelectedStroke,
    selectedRadical,
    setSelectedRadical,
  } = useRadicalsStore();

  useEffect(() => {
    let isMounted = true;
    radicalDataService
      .getRadicals()
      .then(data => {
        if (isMounted) {
          setRadicals(data);
          setIsLoading(false);
        }
      })
      .catch(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const filteredRadicals = useMemo(() => {
    let result = radicals;

    if (selectedLayer !== 'all') {
      result = result.filter(r => r.layer === selectedLayer);
    }

    if (selectedStroke !== null) {
      if (selectedStroke >= 11) {
        result = result.filter(r => r.strokeCount >= 11);
      } else {
        result = result.filter(r => r.strokeCount === selectedStroke);
      }
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        r =>
          r.char.includes(q) ||
          r.altForms.some(alt => alt.includes(q)) ||
          r.hanviet.toLowerCase().includes(q) ||
          r.meaning_vi.toLowerCase().includes(q) ||
          r.meaning_en.toLowerCase().includes(q) ||
          r.exampleKanji.some(k => k.includes(q)),
      );
    }

    return result;
  }, [radicals, selectedLayer, selectedStroke, searchQuery]);

  const layerStats = useMemo(() => {
    const core = radicals.filter(r => r.layer === 'core').length;
    const extended = radicals.filter(r => r.layer === 'extended').length;
    const rare = radicals.filter(r => r.layer === 'rare').length;
    return { all: radicals.length, core, extended, rare };
  }, [radicals]);

  return (
    <div className='flex flex-col gap-6'>
      {/* Filter and search control bar */}
      <div className='flex flex-col gap-4 rounded-2xl border border-(--border-color) bg-(--card-color) p-4 md:p-5'>
        {/* Layer tabs */}
        <div className='flex flex-wrap items-center justify-between gap-3'>
          <div className='flex flex-wrap items-center gap-1.5'>
            <button
              type='button'
              onClick={() => setSelectedLayer('all')}
              className={clsx(
                'rounded-xl px-3.5 py-1.5 text-xs font-semibold transition-all',
                selectedLayer === 'all'
                  ? 'bg-(--main-color) text-white shadow-xs'
                  : 'bg-background/60 hover:bg-background hover:text-foreground text-(--secondary-color)',
              )}
            >
              Tất cả ({layerStats.all})
            </button>
            <button
              type='button'
              onClick={() => setSelectedLayer('core')}
              className={clsx(
                'flex items-center gap-1.5 rounded-xl px-3.5 py-1.5 text-xs font-semibold transition-all',
                selectedLayer === 'core'
                  ? 'bg-rose-500 text-white shadow-xs'
                  : 'bg-background/60 hover:bg-background hover:text-foreground text-(--secondary-color)',
              )}
            >
              <span className='size-1.5 rounded-full bg-rose-400' />
              <span>Tầng Cốt Lõi ({layerStats.core})</span>
            </button>
            <button
              type='button'
              onClick={() => setSelectedLayer('extended')}
              className={clsx(
                'flex items-center gap-1.5 rounded-xl px-3.5 py-1.5 text-xs font-semibold transition-all',
                selectedLayer === 'extended'
                  ? 'bg-amber-500 text-white shadow-xs'
                  : 'bg-background/60 hover:bg-background hover:text-foreground text-(--secondary-color)',
              )}
            >
              <span className='size-1.5 rounded-full bg-amber-400' />
              <span>Tầng Mở Rộng ({layerStats.extended})</span>
            </button>
            <button
              type='button'
              onClick={() => setSelectedLayer('rare')}
              className={clsx(
                'flex items-center gap-1.5 rounded-xl px-3.5 py-1.5 text-xs font-semibold transition-all',
                selectedLayer === 'rare'
                  ? 'bg-slate-600 text-white shadow-xs'
                  : 'bg-background/60 hover:bg-background hover:text-foreground text-(--secondary-color)',
              )}
            >
              <span className='size-1.5 rounded-full bg-slate-400' />
              <span>Tầng Hiếm ({layerStats.rare})</span>
            </button>
          </div>

          <span className='text-xs font-medium text-(--secondary-color)'>
            Hiển thị {filteredRadicals.length} / {radicals.length} bộ thủ
          </span>
        </div>

        {/* Search input & stroke selector */}
        <div className='flex flex-col gap-3 sm:flex-row'>
          <div className='relative flex-1'>
            <Search className='absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-(--secondary-color)' />
            <input
              type='text'
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder='Tìm theo chữ (亻), Hán Việt (Nhân), nghĩa (người), chữ Kanji...'
              className='bg-background text-foreground w-full rounded-xl border border-(--border-color) py-2.5 pr-9 pl-10 text-sm placeholder:text-(--secondary-color)/60 focus:border-(--main-color) focus:outline-none'
            />
            {searchQuery && (
              <button
                type='button'
                onClick={() => setSearchQuery('')}
                className='hover:text-foreground absolute top-1/2 right-3 -translate-y-1/2 rounded-full p-1 text-(--secondary-color)'
              >
                <X className='size-3.5' />
              </button>
            )}
          </div>

          {/* Stroke count quick filter */}
          <div className='flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0'>
            <button
              type='button'
              onClick={() => setSelectedStroke(null)}
              className={clsx(
                'rounded-lg px-2.5 py-1.5 text-xs font-semibold whitespace-nowrap transition-all',
                selectedStroke === null
                  ? 'bg-(--main-color) text-white'
                  : 'bg-background/80 hover:bg-background text-(--secondary-color)',
              )}
            >
              Mọi nét
            </button>
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map(stroke => (
              <button
                key={stroke}
                type='button'
                onClick={() =>
                  setSelectedStroke(selectedStroke === stroke ? null : stroke)
                }
                className={clsx(
                  'flex size-8 shrink-0 items-center justify-center rounded-lg text-xs font-semibold transition-all',
                  selectedStroke === stroke
                    ? 'bg-(--main-color) text-white'
                    : 'bg-background/80 hover:bg-background hover:text-foreground text-(--secondary-color)',
                )}
              >
                {stroke >= 11 ? '11+' : stroke}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Grid of Radicals */}
      {isLoading ? (
        <div className='grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6'>
          {Array.from({ length: 24 }).map((_, i) => (
            <div
              key={i}
              className='h-28 animate-pulse rounded-2xl border border-(--border-color) bg-(--card-color)/50'
            />
          ))}
        </div>
      ) : filteredRadicals.length === 0 ? (
        <div className='flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-(--border-color) p-12 text-center'>
          <Filter className='size-8 text-(--secondary-color)/40' />
          <p className='text-foreground text-base font-semibold'>
            Không tìm thấy bộ thủ phù hợp
          </p>
          <p className='text-xs text-(--secondary-color)'>
            Thử thay đổi từ khóa tìm kiếm hoặc bấm &quot;Tất cả&quot; để hiển
            thị lại 214 bộ thủ
          </p>
          <button
            type='button'
            onClick={() => {
              setSelectedLayer('all');
              setSelectedStroke(null);
              setSearchQuery('');
            }}
            className='mt-2 rounded-xl bg-(--main-color) px-4 py-2 text-xs font-semibold text-white transition-opacity hover:opacity-90'
          >
            Đặt lại bộ lọc
          </button>
        </div>
      ) : (
        <div className='grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6'>
          {filteredRadicals.map(radical => {
            const isCore = radical.layer === 'core';
            const isExtended = radical.layer === 'extended';

            return (
              <button
                key={radical.id}
                type='button'
                onClick={() => setSelectedRadical(radical)}
                className={clsx(
                  'group relative flex flex-col items-center justify-between rounded-2xl border p-4 text-center transition-all duration-200',
                  'bg-(--card-color) hover:-translate-y-1 hover:border-(--main-color)/60 hover:shadow-md active:scale-[0.98]',
                  isCore
                    ? 'border-rose-500/20'
                    : isExtended
                      ? 'border-amber-500/20'
                      : 'border-(--border-color)',
                )}
              >
                {/* Top badges */}
                <div className='flex w-full items-center justify-between text-[11px] text-(--secondary-color)'>
                  <span className='font-mono font-medium'>#{radical.id}</span>
                  <span
                    className={clsx(
                      'rounded-full px-1.5 py-0.5 text-[10px] font-semibold',
                      isCore
                        ? 'bg-rose-500/10 text-rose-500'
                        : isExtended
                          ? 'bg-amber-500/10 text-amber-500'
                          : 'bg-slate-500/10 text-slate-400',
                    )}
                  >
                    {radical.strokeCount} nét
                  </span>
                </div>

                {/* Glyph */}
                <div className='my-2 flex flex-col items-center gap-1'>
                  <span className='text-foreground text-4xl font-extrabold transition-colors group-hover:text-(--main-color)'>
                    {radical.char}
                  </span>
                  {radical.altForms.length > 0 && (
                    <span className='text-xs font-medium text-(--secondary-color)'>
                      ({radical.altForms.join(', ')})
                    </span>
                  )}
                </div>

                {/* Info */}
                <div className='flex w-full flex-col items-center gap-0.5'>
                  <span className='text-sm font-bold tracking-wide text-(--main-color)'>
                    {radical.hanviet}
                  </span>
                  <span className='line-clamp-1 text-xs text-(--secondary-color)'>
                    {radical.meaning_vi}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      )}

      {/* Radical detail modal */}
      <RadicalDetailModal
        radical={selectedRadical}
        onClose={() => setSelectedRadical(null)}
      />
    </div>
  );
};

export default RadicalExplorer;
