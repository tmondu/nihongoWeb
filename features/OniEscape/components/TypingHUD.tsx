'use client';

import React, { useRef, useEffect } from 'react';
import type { OniWordItem } from '../types';
import { Flame, ShieldAlert, Zap } from 'lucide-react';

interface TypingHUDProps {
  currentWord: OniWordItem | null;
  inputRomaji: string;
  distancePercent: number;
  score: number;
  streak: number;
  isHyperBoost: boolean;
  onInputChange: (val: string) => void;
  onKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  inputRef: React.RefObject<HTMLInputElement | null>;
}

export function TypingHUD({
  currentWord,
  inputRomaji,
  distancePercent,
  score,
  streak,
  isHyperBoost,
  onInputChange,
  onKeyDown,
  inputRef,
}: TypingHUDProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Auto focus input whenever clicked anywhere on the HUD
  const handleContainerClick = () => {
    inputRef.current?.focus();
  };

  useEffect(() => {
    inputRef.current?.focus();
  }, [inputRef, currentWord]);

  if (!currentWord) return null;

  const targetRomaji = currentWord.romaji;
  const typedLen = inputRomaji.length;

  // Determine Danger Status
  const isDanger = distancePercent < 30;
  const isWarning = distancePercent < 60 && !isDanger;

  return (
    <div
      ref={containerRef}
      onClick={handleContainerClick}
      className='cursor-text space-y-4 rounded-3xl border border-(--border-color) bg-(--card-color)/90 p-5 shadow-xl backdrop-blur-md transition-all'
    >
      {/* Top Bar: Danger Distance Gauge & Score */}
      <div className='flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between'>
        {/* Distance Gauge */}
        <div className='flex flex-1 items-center gap-3'>
          <div className='flex items-center gap-1.5 text-xs font-bold tracking-wider text-(--secondary-color) uppercase'>
            <ShieldAlert
              className={`size-4 ${
                isDanger
                  ? 'animate-pulse text-red-500'
                  : isWarning
                    ? 'text-amber-500'
                    : 'text-emerald-500'
              }`}
            />
            <span>Cự ly Oni:</span>
          </div>

          <div className='relative h-3.5 flex-1 overflow-hidden rounded-full border border-(--border-color) bg-slate-900/60'>
            <div
              className={`h-full transition-all duration-200 ${
                isDanger
                  ? 'bg-gradient-to-r from-red-600 to-rose-500 shadow-[0_0_12px_rgba(239,68,68,0.7)]'
                  : isWarning
                    ? 'bg-gradient-to-r from-amber-500 to-yellow-400'
                    : 'bg-gradient-to-r from-emerald-500 to-cyan-400'
              }`}
              style={{ width: `${Math.max(4, distancePercent)}%` }}
            />
          </div>

          <span
            className={`font-mono text-xs font-bold ${
              isDanger
                ? 'text-red-500'
                : isWarning
                  ? 'text-amber-500'
                  : 'text-emerald-500'
            }`}
          >
            {Math.round(distancePercent)}%
          </span>
        </div>

        {/* Score & Streak */}
        <div className='flex items-center gap-4 text-sm font-semibold'>
          {streak > 1 && (
            <div
              className={`flex items-center gap-1 rounded-full px-3 py-0.5 text-xs font-bold transition-all ${
                isHyperBoost
                  ? 'animate-bounce bg-amber-500 text-slate-950 shadow-[0_0_12px_rgba(245,158,11,0.6)]'
                  : 'bg-(--main-color)/15 text-(--main-color)'
              }`}
            >
              {isHyperBoost ? (
                <Zap className='size-3.5 fill-current' />
              ) : (
                <Flame className='size-3.5' />
              )}
              <span>
                {streak} COMBO {isHyperBoost && 'x2!'}
              </span>
            </div>
          )}

          <div className='rounded-xl border border-(--border-color) bg-(--background-color)/80 px-3 py-1 text-xs'>
            <span className='mr-1.5 text-(--secondary-color)'>Điểm:</span>
            <span className='font-mono font-bold text-(--main-color)'>
              {score.toLocaleString()}
            </span>
          </div>
        </div>
      </div>

      {/* Main Target Word Showcase */}
      <div className='relative flex flex-col items-center justify-center rounded-2xl border border-(--border-color)/60 bg-gradient-to-b from-(--background-color)/40 to-(--card-color) px-4 py-6 text-center'>
        {/* Japanese Reading / Furigana */}
        <div className='text-sm font-semibold tracking-widest text-(--secondary-color)'>
          {currentWord.reading}
        </div>

        {/* Kanji / Word Display */}
        <div className='font-japanese my-1 text-4xl font-black tracking-wide text-(--main-color) drop-shadow-sm sm:text-5xl'>
          {currentWord.word}
        </div>

        {/* Meaning Badge */}
        <div className='mt-1 inline-flex items-center rounded-full border border-(--border-color) bg-(--background-color)/80 px-3 py-0.5 text-xs font-medium text-(--secondary-color)'>
          {currentWord.meaning}
        </div>

        {/* Romaji Letters Stream */}
        <div className='mt-5 flex items-center justify-center gap-1 font-mono text-2xl font-bold tracking-widest'>
          {targetRomaji.split('').map((char, index) => {
            const isTyped = index < typedLen;
            const isNext = index === typedLen;

            return (
              <span
                key={index}
                className={`relative px-1 py-0.5 transition-all ${
                  isTyped
                    ? 'font-extrabold text-cyan-400 drop-shadow-[0_0_8px_rgba(34,211,238,0.6)]'
                    : isNext
                      ? 'animate-pulse rounded-t border-b-2 border-cyan-400 bg-cyan-500/10 text-(--main-color)'
                      : 'text-(--secondary-color)/40'
                }`}
              >
                {char}
              </span>
            );
          })}
        </div>

        {/* Hidden Input that captures all keystrokes */}
        <input
          ref={inputRef}
          type='text'
          value={inputRomaji}
          onChange={e => onInputChange(e.target.value)}
          onKeyDown={onKeyDown}
          autoComplete='off'
          autoCorrect='off'
          autoCapitalize='off'
          spellCheck='false'
          className='absolute inset-0 size-full cursor-text opacity-0'
        />
      </div>

      <div className='text-center text-xs text-(--secondary-color)/70'>
        Gõ Romaji trên bàn phím để tăng tốc chém Oni • Bấm bất kỳ đâu để tập
        trung gõ
      </div>
    </div>
  );
}
