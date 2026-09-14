'use client';

import React from 'react';
import type { GameStats } from '../types';
import {
  RotateCcw,
  Home,
  Award,
  Zap,
  Compass,
  CheckCircle2,
} from 'lucide-react';

interface GameOverModalProps {
  stats: GameStats;
  onRestart: () => void;
  onBackToLobby: () => void;
}

export function GameOverModal({
  stats,
  onRestart,
  onBackToLobby,
}: GameOverModalProps) {
  return (
    <div className='animate-in fade-in fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-md duration-200'>
      <div className='relative w-full max-w-lg space-y-6 rounded-3xl border border-(--border-color) bg-(--card-color) p-6 shadow-2xl sm:p-8'>
        {/* Header Title */}
        <div className='space-y-1 text-center'>
          <div className='inline-flex items-center gap-1.5 rounded-full bg-red-500/10 px-3 py-1 text-xs font-bold text-red-500'>
            <span>Quái Vật Oni Đã Bắt Kịp!</span>
          </div>
          <h2 className='text-3xl font-black tracking-tight text-(--main-color) sm:text-4xl'>
            Cuộc Rượt Đuổi Kết Thúc
          </h2>
          <p className='text-xs text-(--secondary-color) sm:text-sm'>
            Bạn đã nỗ lực hết mình trên nóc tàu Shinkansen!
          </p>
        </div>

        {/* Stats Grid */}
        <div className='grid grid-cols-2 gap-3 sm:grid-cols-4'>
          <div className='rounded-2xl border border-(--border-color) bg-(--background-color)/60 p-3 text-center'>
            <Compass className='mx-auto mb-1 size-4 text-cyan-400' />
            <div className='font-mono text-xl font-bold text-(--main-color)'>
              {stats.distance}m
            </div>
            <div className='text-[10px] font-semibold text-(--secondary-color) uppercase'>
              Quãng đường
            </div>
          </div>

          <div className='rounded-2xl border border-(--border-color) bg-(--background-color)/60 p-3 text-center'>
            <Award className='mx-auto mb-1 size-4 text-amber-400' />
            <div className='font-mono text-xl font-bold text-(--main-color)'>
              {stats.score.toLocaleString()}
            </div>
            <div className='text-[10px] font-semibold text-(--secondary-color) uppercase'>
              Điểm số
            </div>
          </div>

          <div className='rounded-2xl border border-(--border-color) bg-(--background-color)/60 p-3 text-center'>
            <CheckCircle2 className='mx-auto mb-1 size-4 text-emerald-400' />
            <div className='font-mono text-xl font-bold text-(--main-color)'>
              {stats.wordsCompleted}
            </div>
            <div className='text-[10px] font-semibold text-(--secondary-color) uppercase'>
              Từ đã gõ
            </div>
          </div>

          <div className='rounded-2xl border border-(--border-color) bg-(--background-color)/60 p-3 text-center'>
            <Zap className='mx-auto mb-1 size-4 text-indigo-400' />
            <div className='font-mono text-xl font-bold text-(--main-color)'>
              {stats.maxStreak}
            </div>
            <div className='text-[10px] font-semibold text-(--secondary-color) uppercase'>
              Max Combo
            </div>
          </div>
        </div>

        {/* Words Review List */}
        {stats.wordsHistory.length > 0 && (
          <div className='space-y-2'>
            <div className='flex items-center justify-between text-xs font-semibold text-(--secondary-color)'>
              <span>
                Từ vựng đã gặp trong chuyến chạy ({stats.wordsHistory.length}):
              </span>
            </div>
            <div className='max-h-40 space-y-1.5 overflow-y-auto rounded-2xl border border-(--border-color) bg-(--background-color)/40 p-2'>
              {stats.wordsHistory.map((item, idx) => (
                <div
                  key={idx}
                  className='flex items-center justify-between rounded-xl bg-(--card-color)/60 px-3 py-1.5 text-xs hover:bg-(--card-color)'
                >
                  <div className='flex items-center gap-2'>
                    <span className='font-japanese text-sm font-bold text-(--main-color)'>
                      {item.word}
                    </span>
                    <span className='text-(--secondary-color)'>
                      ({item.reading})
                    </span>
                  </div>
                  <span className='font-medium text-(--secondary-color)'>
                    {item.meaning}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className='flex flex-col gap-3 sm:flex-row'>
          <button
            type='button'
            onClick={onRestart}
            className='flex flex-1 items-center justify-center gap-2 rounded-2xl bg-(--main-color) px-4 py-3.5 text-sm font-bold text-(--background-color) shadow-lg transition-all hover:opacity-90 active:scale-95'
          >
            <RotateCcw className='size-4' />
            <span>Chạy Lại Ngay</span>
          </button>

          <button
            type='button'
            onClick={onBackToLobby}
            className='flex items-center justify-center gap-2 rounded-2xl border border-(--border-color) bg-(--background-color) px-5 py-3.5 text-sm font-semibold text-(--secondary-color) transition-all hover:text-(--main-color) active:scale-95'
          >
            <Home className='size-4' />
            <span>Đổi Cấp Độ</span>
          </button>
        </div>
      </div>
    </div>
  );
}
