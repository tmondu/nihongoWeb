'use client';

import React, { useEffect, useState, useRef, useCallback } from 'react';
import clsx from 'clsx';
import { RotateCcw, PenTool, Type, Loader2 } from 'lucide-react';
import { useClick } from '@/shared/hooks/generic/useAudio';

interface KanjiStrokeViewProps {
  kanjiChar: string;
  className?: string;
}

interface ParsedStroke {
  id: string;
  d: string;
  color: string;
}

interface ParsedNumber {
  text: string;
  transform: string;
  color: string;
}

// 16 distinct, attractive colors for distinguishing stroke orders
const STROKE_COLORS = [
  '#2563eb', // blue
  '#ea580c', // orange
  '#16a34a', // green
  '#9333ea', // purple
  '#e11d48', // rose
  '#0891b2', // cyan
  '#ca8a04', // amber
  '#4f46e5', // indigo
  '#db2777', // pink
  '#059669', // emerald
  '#d97706', // warm amber
  '#7c3aed', // violet
  '#dc2626', // red
  '#0284c7', // sky
  '#65a30d', // lime
  '#c026d3', // fuchsia
];

// Memory cache for fetched SVG data
const svgCache = new Map<
  string,
  { strokes: ParsedStroke[]; numbers: ParsedNumber[] }
>();

export default function KanjiStrokeView({
  kanjiChar,
  className,
}: KanjiStrokeViewProps) {
  const { playClick } = useClick();
  const [viewMode, setViewMode] = useState<'stroke' | 'font'>('stroke');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [showNumbers, setShowNumbers] = useState(true);
  const [strokes, setStrokes] = useState<ParsedStroke[]>([]);
  const [numbers, setNumbers] = useState<ParsedNumber[]>([]);
  const [isAnimating, setIsAnimating] = useState(false);
  const [animProgress, setAnimProgress] = useState<number[]>([]); // 0 (hidden) to 1 (drawn)

  const pathRefs = useRef<(SVGPathElement | null)[]>([]);
  const animTimeoutsRef = useRef<NodeJS.Timeout[]>([]);

  // Calculate 5-digit hex codepoint for KanjiVG
  const getUnicodeHex = useCallback((char: string) => {
    if (!char) return '';
    return char.charCodeAt(0).toString(16).toLowerCase().padStart(5, '0');
  }, []);

  // Stroke animation logic
  const triggerStrokeAnimation = useCallback((strokeList: ParsedStroke[]) => {
    if (strokeList.length === 0) return;
    setIsAnimating(true);

    animTimeoutsRef.current.forEach(t => clearTimeout(t));
    animTimeoutsRef.current = [];

    // Hide all strokes initially
    setAnimProgress(strokeList.map(() => 0));

    const strokeDuration = 320; // ms per stroke
    const gap = 80; // ms between strokes

    strokeList.forEach((_, idx) => {
      const timeout = setTimeout(
        () => {
          setAnimProgress(prev => {
            const next = [...prev];
            next[idx] = 1;
            return next;
          });

          // When the last stroke finishes
          if (idx === strokeList.length - 1) {
            setTimeout(() => {
              setIsAnimating(false);
            }, strokeDuration);
          }
        },
        idx * (strokeDuration + gap) + 120,
      );

      animTimeoutsRef.current.push(timeout);
    });
  }, []);

  // Fetch and parse KanjiVG SVG
  useEffect(() => {
    if (!kanjiChar) return;
    const hex = getUnicodeHex(kanjiChar);
    if (!hex) return;

    if (svgCache.has(hex)) {
      const cached = svgCache.get(hex)!;
      setStrokes(cached.strokes);
      setNumbers(cached.numbers);
      setLoading(false);
      setError(false);
      // Auto-play immediately when viewing Kanji
      triggerStrokeAnimation(cached.strokes);
      return;
    }

    let isMounted = true;
    setLoading(true);
    setError(false);

    const primaryUrl = `https://cdn.jsdelivr.net/gh/KanjiVG/kanjivg/kanji/${hex}.svg`;
    const fallbackUrl = `https://data.mazii.net/kanji/${hex}.svg`;

    const fetchSvg = async () => {
      try {
        let res = await fetch(primaryUrl);
        if (!res.ok) {
          res = await fetch(fallbackUrl);
        }
        if (!res.ok) throw new Error('Cannot load Kanji SVG');

        const xmlText = await res.text();
        if (typeof window === 'undefined') return;

        const parser = new DOMParser();
        const doc = parser.parseFromString(xmlText, 'image/svg+xml');

        // Extract stroke paths
        const pathElements = Array.from(doc.querySelectorAll('path[id*="-s"]'));
        const parsedStrokes: ParsedStroke[] = pathElements.map((p, idx) => ({
          id: p.id || `stroke-${idx}`,
          d: p.getAttribute('d') || '',
          color: STROKE_COLORS[idx % STROKE_COLORS.length],
        }));

        // Extract stroke numbers
        const textElements = Array.from(doc.querySelectorAll('text'));
        const parsedNumbers: ParsedNumber[] = textElements.map((t, idx) => ({
          text: t.textContent?.trim() || `${idx + 1}`,
          transform: t.getAttribute('transform') || '',
          color: STROKE_COLORS[idx % STROKE_COLORS.length],
        }));

        if (parsedStrokes.length === 0) {
          throw new Error('No strokes found in SVG');
        }

        svgCache.set(hex, { strokes: parsedStrokes, numbers: parsedNumbers });

        if (isMounted) {
          setStrokes(parsedStrokes);
          setNumbers(parsedNumbers);
          setLoading(false);
          // Auto-play immediately upon entering Kanji view
          triggerStrokeAnimation(parsedStrokes);
        }
      } catch {
        if (isMounted) {
          setError(true);
          setLoading(false);
          setViewMode('font'); // Fallback to font if SVG not available
        }
      }
    };

    void fetchSvg();

    return () => {
      isMounted = false;
      animTimeoutsRef.current.forEach(t => clearTimeout(t));
      animTimeoutsRef.current = [];
    };
  }, [kanjiChar, getUnicodeHex, triggerStrokeAnimation]);

  const handleManualReplay = useCallback(() => {
    playClick();
    triggerStrokeAnimation(strokes);
  }, [playClick, triggerStrokeAnimation, strokes]);

  return (
    <div className={clsx('flex flex-col items-center gap-3', className)}>
      {/* Box container with 4-quadrant dashed practice lines */}
      <div className='group relative flex h-48 w-48 items-center justify-center overflow-hidden rounded-3xl border-2 border-(--border-color) bg-(--background-color) shadow-inner transition-all hover:border-(--main-color)/50 sm:h-56 sm:w-56 md:h-64 md:w-64'>
        {/* Dashed crosshair grid (Kẻ ô chữ thập nét đứt luyện viết) */}
        <div className='pointer-events-none absolute inset-0'>
          {/* Vertical center dashed line */}
          <div className='absolute top-0 bottom-0 left-1/2 -translate-x-1/2 border-l-2 border-dashed border-(--border-color)/60' />
          {/* Horizontal center dashed line */}
          <div className='absolute top-1/2 right-0 left-0 -translate-y-1/2 border-t-2 border-dashed border-(--border-color)/60' />
        </div>

        {/* Content Mode 1: Stroke SVG View */}
        {viewMode === 'stroke' && !error && (
          <>
            {loading ? (
              <div className='flex flex-col items-center justify-center gap-2 text-(--secondary-color)/60'>
                <Loader2 className='size-8 animate-spin text-(--main-color)' />
                <span className='text-xs font-medium'>Đang vẽ nét chữ...</span>
              </div>
            ) : (
              <div className='relative flex h-full w-full items-center justify-center p-1 sm:p-2'>
                <svg
                  viewBox='0 0 109 109'
                  className='h-full w-full select-none'
                  style={{ overflow: 'visible' }}
                >
                  {/* Gray background guides for all strokes */}
                  <g
                    style={{
                      fill: 'none',
                      stroke: 'var(--border-color)',
                      strokeWidth: 3.4,
                      strokeLinecap: 'round',
                      strokeLinejoin: 'round',
                      opacity: 0.35,
                    }}
                  >
                    {strokes.map(s => (
                      <path key={`bg-${s.id}`} d={s.d} />
                    ))}
                  </g>

                  {/* Active colored strokes with animation */}
                  <g
                    style={{
                      fill: 'none',
                      strokeWidth: 3.6,
                      strokeLinecap: 'round',
                      strokeLinejoin: 'round',
                    }}
                  >
                    {strokes.map((s, idx) => {
                      const isDrawn = animProgress[idx] === 1;
                      const pathEl = pathRefs.current[idx];
                      const totalLength = pathEl
                        ? pathEl.getTotalLength()
                        : 300;

                      return (
                        <path
                          key={s.id}
                          ref={el => {
                            pathRefs.current[idx] = el;
                          }}
                          d={s.d}
                          stroke={s.color}
                          style={{
                            strokeDasharray: totalLength,
                            strokeDashoffset: isDrawn ? 0 : totalLength,
                            transition: isAnimating
                              ? 'stroke-dashoffset 320ms ease-in-out'
                              : 'none',
                          }}
                        />
                      );
                    })}
                  </g>

                  {/* Stroke Numbers */}
                  {showNumbers && (
                    <g style={{ fontSize: 9, fontWeight: 'bold' }}>
                      {numbers.map((n, idx) => {
                        const isDrawn = animProgress[idx] === 1;
                        return (
                          <text
                            key={`num-${idx}`}
                            transform={n.transform}
                            fill={n.color}
                            className='transition-opacity duration-200'
                            style={{
                              opacity: isDrawn ? 1 : 0.25,
                              filter: 'drop-shadow(0 1px 1px rgba(0,0,0,0.25))',
                            }}
                          >
                            {n.text}
                          </text>
                        );
                      })}
                    </g>
                  )}
                </svg>
              </div>
            )}
          </>
        )}

        {/* Content Mode 2: Standard Font Character */}
        {(viewMode === 'font' || error) && (
          <span className='font-japanese relative z-10 text-8xl leading-none font-bold text-(--main-color) select-none sm:text-9xl md:text-[10rem]'>
            {kanjiChar}
          </span>
        )}
      </div>

      {/* Sub-controls under the box (Không đặt nút bên trong ô để tránh che khuất nét chữ) */}
      <div className='flex items-center gap-2 rounded-2xl border border-(--border-color)/60 bg-(--card-color)/80 p-1.5 text-xs font-semibold shadow-2xs'>
        {/* Replay Button */}
        {viewMode === 'stroke' && !error && (
          <button
            type='button'
            onClick={handleManualReplay}
            disabled={isAnimating || loading}
            className={clsx(
              'flex cursor-pointer items-center gap-1.5 rounded-xl px-3 py-1.5 text-(--secondary-color) transition-all hover:bg-(--main-color)/10 hover:text-(--main-color) active:scale-95',
              isAnimating && 'font-bold text-(--main-color)',
            )}
            title='Vẽ lại các nét'
          >
            <RotateCcw
              className={clsx('size-3.5', isAnimating && 'animate-spin')}
            />
            <span>Vẽ lại</span>
          </button>
        )}

        {/* Toggle between Strokes and Font */}
        <button
          type='button'
          onClick={() => {
            playClick();
            setViewMode(m => (m === 'stroke' ? 'font' : 'stroke'));
          }}
          disabled={error}
          className={clsx(
            'flex cursor-pointer items-center gap-1.5 rounded-xl px-3 py-1.5 transition-all',
            viewMode === 'stroke'
              ? 'bg-(--main-color) text-(--background-color) shadow-xs'
              : 'text-(--secondary-color) hover:text-(--main-color)',
            error && 'cursor-not-allowed opacity-50',
          )}
          title={
            viewMode === 'stroke'
              ? 'Chuyển sang xem chữ mẫu'
              : 'Chuyển sang xem nét vẽ'
          }
        >
          {viewMode === 'stroke' ? (
            <>
              <PenTool className='size-3.5' />
              <span>Nét vẽ</span>
            </>
          ) : (
            <>
              <Type className='size-3.5' />
              <span>Chữ mẫu</span>
            </>
          )}
        </button>

        {/* Toggle stroke numbers */}
        {viewMode === 'stroke' && !error && (
          <button
            type='button'
            onClick={() => {
              playClick();
              setShowNumbers(s => !s);
            }}
            className={clsx(
              'cursor-pointer rounded-xl px-2.5 py-1.5 text-xs font-bold transition-colors',
              showNumbers
                ? 'bg-(--background-color) text-(--main-color) shadow-2xs'
                : 'text-(--secondary-color)/60 hover:text-(--secondary-color)',
            )}
            title='Bật / Tắt số thứ tự nét'
          >
            123
          </button>
        )}
      </div>
    </div>
  );
}
