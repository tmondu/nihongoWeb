'use client';

import React, { useMemo } from 'react';
import clsx from 'clsx';
import {
  splitIntoMoras,
  pitchNumberToAccentPattern,
} from '@/shared/ui-composite/text/PitchAccentText';

interface PitchAccentChartProps {
  kana: string;
  accent?: string;
  pitchNumber?: number;
  tokenizedKana?: { value: string; type?: string }[];
  className?: string;
  /** compact = smaller chart, default = full size */
  compact?: boolean;
}

const MORA_WIDTH = 36;
const MORA_PAD_X = 18;
const HIGH_Y = 10;
const LOW_Y = 36;
const CHART_HEIGHT = 58;

/**
 * Renders a Japanese pitch accent contour diagram similar to those in NHK dictionaries.
 * High pitch → top rail, Low pitch → bottom rail, downstep → vertical drop.
 */
export default function PitchAccentChart({
  kana,
  accent,
  pitchNumber,
  tokenizedKana,
  className,
  compact = false,
}: PitchAccentChartProps) {
  const result = useMemo(() => {
    if (!kana) return null;

    const trimmed = kana.trim();

    // Determine moras
    let mList: string[] = [];
    if (Array.isArray(tokenizedKana) && tokenizedKana.length > 0) {
      const joined = tokenizedKana.map(t => t.value).join('');
      mList =
        joined === trimmed
          ? tokenizedKana.map(t => t.value)
          : splitIntoMoras(trimmed);
    } else {
      mList = splitIntoMoras(trimmed);
    }

    // Determine accent pattern
    let rawAccent = accent?.trim();
    if (!rawAccent && typeof pitchNumber === 'number') {
      rawAccent = pitchNumberToAccentPattern(pitchNumber, mList.length);
    } else if (rawAccent && /^\d+$/.test(rawAccent)) {
      rawAccent = pitchNumberToAccentPattern(
        parseInt(rawAccent, 10),
        mList.length,
      );
    }

    if (!rawAccent)
      return { moras: mList, pitches: [], particlePitch: undefined };

    const [mainPattern, particlePart] = rawAccent.split('-');
    const pitchArr = mainPattern ? mainPattern.split('') : [];

    return { moras: mList, pitches: pitchArr, particlePitch: particlePart };
  }, [kana, accent, pitchNumber, tokenizedKana]);

  if (!result || result.pitches.length === 0) {
    // Fallback: plain kana
    return (
      <span className={clsx('font-japanese text-sm tracking-wide', className)}>
        {kana}
      </span>
    );
  }

  const { moras, pitches, particlePitch } = result;

  // Include particle "は" as a virtual extra mora
  const hasParticle = Boolean(particlePitch);
  const totalCols = moras.length + (hasParticle ? 1 : 0);

  const svgWidth = totalCols * MORA_WIDTH + MORA_PAD_X * 2;
  const svgHeight = compact ? CHART_HEIGHT - 4 : CHART_HEIGHT + 20;

  // Build polyline points for the pitch line
  const points: { x: number; y: number; mora: string; isHigh: boolean }[] = [];

  for (let i = 0; i < moras.length; i++) {
    const pitch = pitches[i] || 'L';
    const isHigh = pitch === 'H';
    const cx = MORA_PAD_X + i * MORA_WIDTH + MORA_WIDTH / 2;
    points.push({ x: cx, y: isHigh ? HIGH_Y : LOW_Y, mora: moras[i], isHigh });
  }

  // Particle node
  if (hasParticle) {
    const pIsHigh = particlePitch === 'H';
    const cx = MORA_PAD_X + moras.length * MORA_WIDTH + MORA_WIDTH / 2;
    points.push({
      x: cx,
      y: pIsHigh ? HIGH_Y : LOW_Y,
      mora: 'は',
      isHigh: pIsHigh,
    });
  }

  // Downstep detection: H followed by L (or last H with particle L)
  const downstepIndices = new Set<number>();
  for (let i = 0; i < points.length - 1; i++) {
    if (points[i].isHigh && !points[i + 1].isHigh) {
      downstepIndices.add(i);
    }
  }

  // SVG path for smooth line
  const polylinePoints = points.map(p => `${p.x},${p.y}`).join(' ');

  const textY = svgHeight - (compact ? 6 : 12);

  return (
    <div className={clsx('inline-flex flex-col items-center', className)}>
      <svg
        width={svgWidth}
        height={svgHeight}
        viewBox={`0 0 ${svgWidth} ${svgHeight}`}
        aria-label={`Pitch accent chart for ${kana}`}
        className='overflow-visible'
      >
        {/* Guide rails (dashed background lines) */}
        <line
          x1={MORA_PAD_X}
          y1={HIGH_Y}
          x2={svgWidth - MORA_PAD_X}
          y2={HIGH_Y}
          stroke='currentColor'
          strokeWidth={0.5}
          strokeDasharray='3 3'
          className='text-(--border-color) opacity-40'
        />
        <line
          x1={MORA_PAD_X}
          y1={LOW_Y}
          x2={svgWidth - MORA_PAD_X}
          y2={LOW_Y}
          stroke='currentColor'
          strokeWidth={0.5}
          strokeDasharray='3 3'
          className='text-(--border-color) opacity-40'
        />

        {/* Main pitch contour line */}
        <polyline
          points={polylinePoints}
          fill='none'
          stroke='#ef4444'
          strokeWidth={2.2}
          strokeLinecap='round'
          strokeLinejoin='round'
        />

        {/* Downstep vertical drops */}
        {[...downstepIndices].map(idx => {
          const p = points[idx];
          const next = points[idx + 1];
          if (!p || !next) return null;
          // Mid-x between this and next point
          const midX = (p.x + next.x) / 2;
          return (
            <line
              key={`ds-${idx}`}
              x1={midX}
              y1={HIGH_Y}
              x2={midX}
              y2={LOW_Y}
              stroke='#ef4444'
              strokeWidth={2}
              strokeDasharray='0'
              strokeLinecap='round'
            />
          );
        })}

        {/* Mora dots & labels */}
        {points.map((p, idx) => {
          const isParticleNode = hasParticle && idx === points.length - 1;
          return (
            <g key={`m-${idx}`}>
              {/* Dot */}
              <circle
                cx={p.x}
                cy={p.y}
                r={3.5}
                fill={p.isHigh ? '#ef4444' : '#94a3b8'}
                stroke='white'
                strokeWidth={1.5}
              />
              {/* Mora text */}
              <text
                x={p.x}
                y={textY}
                textAnchor='middle'
                fontSize={compact ? 10 : 12}
                fontFamily='inherit'
                className={clsx(
                  'font-japanese select-none',
                  isParticleNode
                    ? 'fill-slate-400 opacity-60'
                    : 'fill-(--secondary-color)',
                )}
              >
                {p.mora}
              </text>
            </g>
          );
        })}

        {/* Labels: H / L annotations for High */}
        {!compact &&
          points.map((p, idx) => {
            if (!p.isHigh) return null;
            return (
              <text
                key={`hl-${idx}`}
                x={p.x}
                y={HIGH_Y - 5}
                textAnchor='middle'
                fontSize={8}
                fill='#ef4444'
                fontWeight='bold'
                className='select-none'
              >
                H
              </text>
            );
          })}
      </svg>
    </div>
  );
}
