'use client';

import React, { useState } from 'react';
import clsx from 'clsx';
import { PRESET_ARTICLES } from '../data/presetArticles';
import type { JLPTLevelFilter, PresetArticle } from '../types';
import { useReaderStore } from '../store/useReaderStore';
import { FileText, CheckCircle2 } from 'lucide-react';

export default function ReaderArticleSelector() {
  const {
    isCustomMode,
    selectedArticleId,
    setSelectedArticleId,
    customText,
    setCustomText,
  } = useReaderStore();

  const [selectedLevel, setSelectedLevel] = useState<JLPTLevelFilter>('All');
  const [draftCustomText, setDraftCustomText] = useState(customText);

  const levels: JLPTLevelFilter[] = ['All', 'N5', 'N4', 'N3', 'N2', 'N1'];

  const filteredArticles = PRESET_ARTICLES.filter(
    art => selectedLevel === 'All' || art.level === selectedLevel,
  );

  const handleApplyCustomText = () => {
    if (!draftCustomText.trim()) return;
    setCustomText(draftCustomText.trim());
  };

  if (isCustomMode) {
    return (
      <div className='rounded-3xl border border-(--border-color) bg-(--card-color) p-5 shadow-sm sm:p-6'>
        <div className='flex items-center justify-between gap-2 pb-3'>
          <h2 className='text-sm font-bold text-(--main-color) sm:text-base'>
            Dán đoạn văn bản tiếng Nhật bạn muốn đọc:
          </h2>
          <span className='text-xs text-(--secondary-color)'>
            Hỗ trợ tối đa 5.000 ký tự
          </span>
        </div>

        <textarea
          value={draftCustomText}
          onChange={e => setDraftCustomText(e.target.value)}
          placeholder='Dán bài báo, lời bài hát, đoạn văn ngắn tiếng Nhật vào đây... (Ví dụ: 吾輩は猫である。名前はまだ無い。)'
          rows={5}
          className='w-full rounded-2xl border border-(--border-color) bg-(--background-color) p-4 text-sm text-(--main-color) placeholder:text-(--secondary-color)/50 focus:border-(--main-color) focus:outline-none'
        />

        <div className='mt-3 flex flex-wrap items-center justify-between gap-3'>
          {/* Quick templates */}
          <div className='flex flex-wrap items-center gap-1.5 text-xs text-(--secondary-color)'>
            <span>Gợi ý nhanh:</span>
            <button
              type='button'
              onClick={() =>
                setDraftCustomText(
                  '雨ニモマケズ、風ニモマケズ、雪ニモ夏ノ暑サニモマケヌ丈夫ナカラダヲモチ。',
                )
              }
              className='rounded-lg border border-(--border-color) px-2 py-1 hover:border-(--main-color) hover:text-(--main-color)'
            >
              Thơ Miyazawa Kenji
            </button>
            <button
              type='button'
              onClick={() =>
                setDraftCustomText(
                  '日本の首都は東京です。東京にはたくさんの人が住んでいて、とても賑やかな街です。',
                )
              }
              className='rounded-lg border border-(--border-color) px-2 py-1 hover:border-(--main-color) hover:text-(--main-color)'
            >
              Đoạn văn ngắn Tokyo
            </button>
          </div>

          <button
            type='button'
            onClick={handleApplyCustomText}
            disabled={!draftCustomText.trim()}
            className='flex items-center gap-2 rounded-xl bg-(--main-color) px-5 py-2 text-sm font-bold text-(--background-color) shadow-sm transition-all hover:opacity-90 disabled:opacity-50'
          >
            <FileText className='h-4 w-4' />
            <span>Phân tích & Đọc ngay</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className='space-y-4'>
      {/* Level Filters */}
      <div className='flex items-center gap-1.5 overflow-x-auto pb-1 text-xs'>
        <span className='mr-1 font-semibold text-(--secondary-color)'>
          Cấp độ:
        </span>
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
            {lvl === 'All' ? 'Tất cả bài đọc' : lvl}
          </button>
        ))}
      </div>

      {/* Preset Articles Grid */}
      <div className='grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3'>
        {filteredArticles.map((art: PresetArticle) => {
          const isSelected = selectedArticleId === art.id;
          return (
            <div
              key={art.id}
              role='button'
              tabIndex={0}
              onClick={() => setSelectedArticleId(art.id)}
              onKeyDown={e => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  setSelectedArticleId(art.id);
                }
              }}
              className={clsx(
                'group relative flex cursor-pointer flex-col justify-between rounded-2xl border p-4 text-left transition-all',
                isSelected
                  ? 'border-(--main-color) bg-(--card-color) shadow-md ring-2 ring-(--main-color)/20'
                  : 'border-(--border-color) bg-(--card-color)/60 hover:border-(--main-color)/50 hover:bg-(--card-color)',
              )}
            >
              <div>
                <div className='flex items-center justify-between gap-2'>
                  <span
                    className={clsx(
                      'rounded-md px-2 py-0.5 text-[11px] font-black',
                      art.level === 'N5' &&
                        'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
                      art.level === 'N4' &&
                        'bg-sky-500/10 text-sky-600 dark:text-sky-400',
                      art.level === 'N3' &&
                        'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400',
                      art.level === 'N2' &&
                        'bg-amber-500/10 text-amber-600 dark:text-amber-400',
                      art.level === 'N1' &&
                        'bg-rose-500/10 text-rose-600 dark:text-rose-400',
                    )}
                  >
                    {art.level}
                  </span>
                  <span className='text-[11px] font-medium text-(--secondary-color)'>
                    {art.category}
                  </span>
                </div>

                <h3 className='font-japanese mt-2 text-base font-bold text-(--main-color) group-hover:text-(--main-color)'>
                  {art.title}
                </h3>
                <p className='mt-0.5 text-xs font-semibold text-(--main-color)/80'>
                  {art.titleVi}
                </p>
                <p className='mt-1.5 line-clamp-2 text-xs text-(--secondary-color)'>
                  {art.description}
                </p>
              </div>

              <div className='mt-3 flex items-center justify-between border-t border-(--border-color)/50 pt-2 text-xs'>
                <span className='font-medium text-(--secondary-color)'>
                  {art.content.split('\n').length} câu
                </span>
                {isSelected ? (
                  <span className='flex items-center gap-1 font-bold text-emerald-600 dark:text-emerald-400'>
                    <CheckCircle2 className='h-3.5 w-3.5' />
                    <span>Đang đọc</span>
                  </span>
                ) : (
                  <span className='font-semibold text-(--secondary-color) group-hover:text-(--main-color)'>
                    Chọn bài ➔
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
