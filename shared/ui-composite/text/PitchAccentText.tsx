'use client';

import React, { useMemo } from 'react';
import clsx from 'clsx';

export interface PitchAccentTextProps {
  kana: string;
  accent?: string; // Format: "LHHH-L", "LH-L", "LHLL-L", or pitch number as string
  pitchNumber?: number; // Optional integer accent position (0, 1, 2...)
  tokenizedKana?: { value: string; type?: string }[];
  className?: string;
  moraClassName?: string;
  showParticle?: boolean;
}

/**
 * Splits a Japanese kana string into phonological moras.
 * Handles digraphs (きゃ, しょ, etc.), sokuon (っ), and chouonpu (ー).
 */
export function splitIntoMoras(text: string): string[] {
  const moras: string[] = [];
  const smallKanaRegex = /^[ゃゅょぁぃぅぇぉゎャュョァィゥェォヮ]/;

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    if (i + 1 < text.length && smallKanaRegex.test(text[i + 1])) {
      moras.push(char + text[i + 1]);
      i++;
    } else {
      moras.push(char);
    }
  }
  return moras;
}

/**
 * Converts a pitch number (0, 1, 2...) into an accent pattern string (e.g. "LHH-L").
 */
export function pitchNumberToAccentPattern(
  pitchNum: number,
  moraCount: number,
): string {
  if (moraCount <= 0) return '';
  if (pitchNum === 0) {
    // Heiban: L H H H ... -H
    if (moraCount === 1) return 'L-H';
    return 'L' + 'H'.repeat(moraCount - 1) + '-H';
  }
  if (pitchNum === 1) {
    // Atamadaka: H L L L ... -L
    if (moraCount === 1) return 'H-L';
    return 'H' + 'L'.repeat(moraCount - 1) + '-L';
  }
  // Nakadaka / Odaka: L H ... (drops after pitchNum) ... L -L
  let pattern = 'L';
  for (let i = 2; i <= moraCount; i++) {
    if (i <= pitchNum) {
      pattern += 'H';
    } else {
      pattern += 'L';
    }
  }
  return pattern + '-L';
}

export default function PitchAccentText({
  kana,
  accent,
  pitchNumber,
  tokenizedKana,
  className,
  moraClassName,
}: PitchAccentTextProps) {
  const { moras, pitches, particlePitch } = useMemo(() => {
    if (!kana) return { moras: [], pitches: [], particlePitch: undefined };

    // 1. Determine moras
    let mList: string[] = [];
    const trimmedKana = kana.trim();
    let hasMismatchedTokenized = false;

    if (Array.isArray(tokenizedKana) && tokenizedKana.length > 0) {
      const tokenizedCombined = tokenizedKana.map(item => item.value).join('');
      // Guard-rail: only use tokenizedKana if it matches the target kana
      if (tokenizedCombined === trimmedKana) {
        mList = tokenizedKana.map(item => item.value);
      } else {
        hasMismatchedTokenized = true;
        mList = splitIntoMoras(trimmedKana);
      }
    } else {
      mList = splitIntoMoras(trimmedKana);
    }

    // 2. Determine accent pattern
    let rawAccent = hasMismatchedTokenized ? undefined : accent?.trim();
    if (!rawAccent && typeof pitchNumber === 'number') {
      rawAccent = pitchNumberToAccentPattern(pitchNumber, mList.length);
    } else if (rawAccent && /^\d+$/.test(rawAccent)) {
      rawAccent = pitchNumberToAccentPattern(
        parseInt(rawAccent, 10),
        mList.length,
      );
    }

    if (!rawAccent) {
      return { moras: mList, pitches: [], particlePitch: undefined };
    }

    const [mainPattern, particlePart] = rawAccent.split('-');
    const pitchArray = mainPattern ? mainPattern.split('') : [];

    return {
      moras: mList,
      pitches: pitchArray,
      particlePitch: particlePart || undefined,
    };
  }, [kana, accent, pitchNumber, tokenizedKana]);

  // Fallback: If no valid pitch accent pattern is present, render plain kana
  if (pitches.length === 0 || moras.length === 0) {
    return (
      <span className={clsx('font-japanese tracking-wide', className)}>
        {kana}
      </span>
    );
  }

  return (
    <span
      className={clsx(
        'font-japanese inline-flex items-baseline leading-none select-none',
        className,
      )}
    >
      {moras.map((mora, idx) => {
        const pitch = pitches[idx] || 'L';
        const isHigh = pitch === 'H';
        const prevIsLow = idx > 0 && (pitches[idx - 1] || 'L') === 'L';
        const isRising = isHigh && prevIsLow;

        const nextIsLow =
          idx + 1 < moras.length && (pitches[idx + 1] || 'L') === 'L';
        const isLastMora = idx === moras.length - 1;
        const isDownstep =
          isHigh && (nextIsLow || (isLastMora && particlePitch === 'L'));

        return (
          <span
            key={`${idx}-${mora}`}
            className={clsx(
              'inline-block px-[1.5px] pt-[2px] pb-[1px] text-[0.95em] transition-colors',
              // High pitch top overline
              isHigh &&
                'border-t-2 border-red-500 font-semibold dark:border-red-400',
              // Rising pitch left border
              isRising &&
                'rounded-tl-xs border-l-2 border-red-500 dark:border-red-400',
              // Downstep right border
              isDownstep &&
                'rounded-tr-xs border-r-2 border-red-500 dark:border-red-400',
              // Low pitch styling
              !isHigh && 'border-t-2 border-transparent font-normal opacity-80',
              moraClassName,
            )}
          >
            {mora}
          </span>
        );
      })}
    </span>
  );
}
