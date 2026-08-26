'use client';

import React, { useState, useMemo } from 'react';
import {
  useShadowingStore,
  VideoCard,
  ShadowingHeader,
  JLPTLevel,
} from '@/features/Shadowing';
import { Search, Video } from 'lucide-react';
import clsx from 'clsx';

export default function ShadowingLibraryPage() {
  const { videos } = useShadowingStore();

  const [selectedLevel, setSelectedLevel] = useState<JLPTLevel>('All');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');

  const levels: JLPTLevel[] = ['All', 'N5', 'N4', 'N3', 'N2', 'N1'];
  const categories = [
    'All',
    'Giao tiếp',
    'Anime & Phim',
    'Tin tức',
    'Đời sống',
    'Phỏng vấn',
  ];

  const filteredVideos = useMemo(() => {
    return videos.filter(v => {
      const matchLevel = selectedLevel === 'All' || v.level === selectedLevel;
      const matchCategory =
        selectedCategory === 'All' || v.category === selectedCategory;
      const matchSearch =
        searchQuery === '' ||
        v.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        v.description.toLowerCase().includes(searchQuery.toLowerCase());

      return matchLevel && matchCategory && matchSearch;
    });
  }, [videos, selectedLevel, selectedCategory, searchQuery]);

  return (
    <div className='mx-auto max-w-6xl space-y-8 px-4 py-8 sm:px-6'>
      {/* Header */}
      <ShadowingHeader />

      {/* Filters & Search bar */}
      <div className='flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
        {/* Search input */}
        <div className='relative max-w-md flex-1'>
          <Search className='absolute top-3 left-3.5 size-4 text-(--secondary-color)' />
          <input
            type='text'
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder='Tìm kiếm bài học, chủ đề giao tiếp...'
            className='w-full rounded-2xl border border-(--border-color) bg-(--card-color) py-2.5 pr-4 pl-10 text-sm text-(--main-color) placeholder:text-(--secondary-color)/50 focus:border-(--main-color) focus:outline-none'
          />
        </div>

        {/* JLPT Level Pills */}
        <div className='flex items-center gap-1.5 overflow-x-auto pb-1 text-xs'>
          {levels.map(lvl => (
            <button
              key={lvl}
              type='button'
              onClick={() => setSelectedLevel(lvl)}
              className={clsx(
                'rounded-full px-3.5 py-1.5 font-bold transition-all',
                selectedLevel === lvl
                  ? 'bg-(--main-color) text-(--background-color) shadow-sm'
                  : 'border border-(--border-color) bg-(--card-color) text-(--secondary-color) hover:text-(--main-color)',
              )}
            >
              {lvl === 'All' ? 'Tất cả cấp độ' : lvl}
            </button>
          ))}
        </div>
      </div>

      {/* Category Pills */}
      <div className='flex items-center gap-2 overflow-x-auto pb-1 text-xs'>
        <span className='mr-1 text-xs font-semibold text-(--secondary-color)'>
          Chủ đề:
        </span>
        {categories.map(cat => (
          <button
            key={cat}
            type='button'
            onClick={() => setSelectedCategory(cat)}
            className={clsx(
              'rounded-xl px-3 py-1.5 font-medium transition-all',
              selectedCategory === cat
                ? 'border-2 border-(--main-color) bg-(--card-color) font-bold text-(--main-color)'
                : 'border border-(--border-color) bg-(--background-color) text-(--secondary-color) hover:text-(--main-color)',
            )}
          >
            {cat === 'All' ? 'Tất cả chủ đề' : cat}
          </button>
        ))}
      </div>

      {/* Video Grid */}
      {filteredVideos.length > 0 ? (
        <div className='grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3'>
          {filteredVideos.map(video => (
            <VideoCard key={video.id} video={video} />
          ))}
        </div>
      ) : (
        <div className='rounded-3xl border border-dashed border-(--border-color) bg-(--card-color)/40 p-12 text-center'>
          <Video className='mx-auto size-10 text-(--secondary-color)' />
          <p className='mt-2 text-base font-bold text-(--main-color)'>
            Không tìm thấy video bài học phù hợp
          </p>
          <p className='mt-1 text-xs text-(--secondary-color)'>
            Hãy thử thay đổi từ khoá tìm kiếm hoặc chọn lại cấp độ JLPT khác.
          </p>
        </div>
      )}

      {/* Experimental Testing Notice Banner (Dưới 3 video và kích thước to) */}
      <div className='rounded-3xl border-2 border-dashed border-amber-500/40 bg-amber-500/10 p-6 text-center shadow-sm'>
        <div className='space-y-1.5'>
          <p className='flex items-center justify-center gap-2 text-lg font-black text-amber-600 sm:text-xl md:text-2xl dark:text-amber-400'>
            <span>🧪</span>
            <span>Chế độ đang được thử nghiệm hí hí</span>
            <span>✨</span>
          </p>
          <p className='text-xs text-(--secondary-color) sm:text-sm'>
            Hệ thống nhận diện giọng nói & đồng bộ video đang trong giai đoạn
            phát triển và hoàn thiện.
          </p>
        </div>
      </div>
    </div>
  );
}
