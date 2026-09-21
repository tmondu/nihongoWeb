'use client';

import React from 'react';
import {
  BookOpen,
  BookmarkCheck,
  Type,
  Eye,
  EyeOff,
  PenTool,
  Library,
} from 'lucide-react';
import clsx from 'clsx';
import { useReaderStore } from '../store/useReaderStore';

export default function ReaderHeader() {
  const {
    showFurigana,
    toggleFurigana,
    fontSize,
    increaseFontSize,
    decreaseFontSize,
    minedSentences,
    setIsMinedDrawerOpen,
    isCustomMode,
    setIsCustomMode,
  } = useReaderStore();

  return (
    <div className='flex flex-col gap-4 rounded-3xl border border-(--border-color) bg-(--card-color)/90 p-5 shadow-sm backdrop-blur-sm sm:p-6'>
      {/* Top row: Title and Status */}
      <div className='flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between'>
        <div className='flex items-center gap-3.5'>
          <div className='flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border-b-4 border-(--main-color-accent) bg-(--main-color) text-(--background-color) shadow-md'>
            <BookOpen className='h-6 w-6' />
          </div>
          <div>
            <div className='flex flex-wrap items-center gap-2'>
              <h1 className='text-xl font-black tracking-tight text-(--main-color) sm:text-2xl'>
                Trình Đọc Thông Minh 1 Chạm
              </h1>
              <span className='rounded-full border border-violet-500/30 bg-violet-500/10 px-2.5 py-0.5 text-[11px] font-bold text-violet-600 dark:text-violet-400'>
                Immersion & Mining
              </span>
            </div>
            <p className='mt-0.5 text-xs text-(--secondary-color) sm:text-sm'>
              Chạm vào bất kỳ từ nào để tra cứu tức thì hoặc lưu cả câu vào bộ
              ôn tập cá nhân.
            </p>
          </div>
        </div>

        {/* Right side: Mined Sentences Drawer Trigger */}
        <button
          type='button'
          onClick={() => setIsMinedDrawerOpen(true)}
          className='flex items-center justify-center gap-2 rounded-2xl border border-amber-500/30 bg-amber-500/10 px-4 py-2.5 text-sm font-bold text-amber-700 transition-all hover:bg-amber-500/20 active:scale-95 dark:text-amber-400'
        >
          <BookmarkCheck className='h-4 w-4' />
          <span>Kho câu đã đào</span>
          <span className='rounded-full bg-amber-500/20 px-2 py-0.5 text-xs font-black'>
            {minedSentences.length}
          </span>
        </button>
      </div>

      {/* Control Bar: Mode Toggle, Furigana & Font size */}
      <div className='flex flex-wrap items-center justify-between gap-3 border-t border-(--border-color)/60 pt-3'>
        {/* Switch mode tabs: Preset Articles vs Custom Text */}
        <div className='flex items-center gap-1.5 rounded-2xl border border-(--border-color) bg-(--background-color) p-1 text-xs'>
          <button
            type='button'
            onClick={() => setIsCustomMode(false)}
            className={clsx(
              'flex items-center gap-1.5 rounded-xl px-3 py-1.5 font-bold transition-all',
              !isCustomMode
                ? 'bg-(--main-color) text-(--background-color) shadow-sm'
                : 'text-(--secondary-color) hover:text-(--main-color)',
            )}
          >
            <Library className='h-3.5 w-3.5' />
            <span>Bài đọc mẫu</span>
          </button>
          <button
            type='button'
            onClick={() => setIsCustomMode(true)}
            className={clsx(
              'flex items-center gap-1.5 rounded-xl px-3 py-1.5 font-bold transition-all',
              isCustomMode
                ? 'bg-(--main-color) text-(--background-color) shadow-sm'
                : 'text-(--secondary-color) hover:text-(--main-color)',
            )}
          >
            <PenTool className='h-3.5 w-3.5' />
            <span>Văn bản tự nhập</span>
          </button>
        </div>

        {/* Reading Controls */}
        <div className='flex items-center gap-2 text-xs'>
          {/* Furigana Toggle */}
          <button
            type='button'
            onClick={toggleFurigana}
            className={clsx(
              'flex items-center gap-1.5 rounded-xl border px-3 py-1.5 font-semibold transition-all',
              showFurigana
                ? 'border-(--main-color)/40 bg-(--main-color)/10 text-(--main-color)'
                : 'border-(--border-color) bg-(--background-color) text-(--secondary-color) hover:text-(--main-color)',
            )}
            title={showFurigana ? 'Ẩn Furigana' : 'Hiện Furigana'}
          >
            {showFurigana ? (
              <Eye className='h-3.5 w-3.5' />
            ) : (
              <EyeOff className='h-3.5 w-3.5' />
            )}
            <span>Furigana: {showFurigana ? 'Bật' : 'Tắt'}</span>
          </button>

          {/* Font Size Adjust */}
          <div className='flex items-center gap-1 rounded-xl border border-(--border-color) bg-(--background-color) px-2 py-1'>
            <Type className='h-3.5 w-3.5 text-(--secondary-color)' />
            <button
              type='button'
              onClick={decreaseFontSize}
              disabled={fontSize <= 14}
              className='flex h-6 w-6 items-center justify-center rounded-lg text-xs font-bold text-(--secondary-color) hover:bg-(--card-color) hover:text-(--main-color) disabled:opacity-40'
              title='Giảm cỡ chữ'
            >
              -
            </button>
            <span className='min-w-6 text-center font-mono text-xs font-bold text-(--main-color)'>
              {fontSize}px
            </span>
            <button
              type='button'
              onClick={increaseFontSize}
              disabled={fontSize >= 32}
              className='flex h-6 w-6 items-center justify-center rounded-lg text-xs font-bold text-(--secondary-color) hover:bg-(--card-color) hover:text-(--main-color) disabled:opacity-40'
              title='Tăng cỡ chữ'
            >
              +
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
