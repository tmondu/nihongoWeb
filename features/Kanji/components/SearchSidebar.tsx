'use client';

import React, { useRef, useState, useEffect, useCallback } from 'react';
import { Eraser, Undo2, Loader2, Search, Database } from 'lucide-react';
import { cn } from '@/shared/utils/utils';
import { useClick } from '@/shared/hooks/generic/useAudio';
import { useThemePreferences } from '@/features/Preferences';
import useKanjiStore from '../store/useKanjiStore';

type Point = [number, number, number]; // [x, y, timestamp]
type Stroke = Point[];

const drawGrid = (ctx: CanvasRenderingContext2D) => {
  const w = ctx.canvas.width / (window.devicePixelRatio || 1);
  const h = ctx.canvas.height / (window.devicePixelRatio || 1);

  ctx.save();
  ctx.strokeStyle = 'var(--border-color, #e2e8f0)';
  ctx.lineWidth = 1.5;
  ctx.setLineDash([5, 5]);

  ctx.beginPath();
  ctx.moveTo(w / 2, 0);
  ctx.lineTo(w / 2, h);
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(0, h / 2);
  ctx.lineTo(w, h / 2);
  ctx.stroke();

  ctx.restore();
};

interface HandwritingSearchCardProps {
  onSelectKanji: (kanji: string) => void;
  className?: string;
}

function HandwritingSearchCard({
  onSelectKanji,
  className,
}: HandwritingSearchCardProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [strokes, setStrokes] = useState<Stroke[]>([]);
  const [currentStroke, setCurrentStroke] = useState<Stroke>([]);
  const [candidates, setCandidates] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const recognitionTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const { playClick } = useClick();
  const { theme } = useThemePreferences();

  const redrawStrokes = useCallback((ctx: CanvasRenderingContext2D, allStrokes: Stroke[]) => {
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    drawGrid(ctx);

    ctx.lineWidth = 5;
    ctx.strokeStyle = 'var(--main-color, #ff4e50)';

    allStrokes.forEach(stroke => {
      if (stroke.length === 0) return;
      ctx.beginPath();
      ctx.moveTo(stroke[0][0], stroke[0][1]);
      for (let i = 1; i < stroke.length; i++) {
        ctx.lineTo(stroke[i][0], stroke[i][1]);
      }
      ctx.stroke();
    });
  }, []);

  // Draw coordinate smoothing & DPI handling
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resizeCanvas = () => {
      const rect = canvas.parentElement?.getBoundingClientRect();
      const width = rect?.width || 280;
      const height = rect?.height || 280;
      const dpr = window.devicePixelRatio || 1;

      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;

      ctx.scale(dpr, dpr);
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.lineWidth = 5;
      
      const resolvedColor = getComputedStyle(document.documentElement)
        .getPropertyValue('--main-color')
        .trim();
      ctx.strokeStyle = resolvedColor || '#ff4e50';

      redrawStrokes(ctx, strokes);
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    return () => window.removeEventListener('resize', resizeCanvas);
  }, [strokes, theme, redrawStrokes]);



  const getCoordinates = (e: React.MouseEvent | React.TouchEvent): [number, number] => {
    const canvas = canvasRef.current;
    if (!canvas) return [0, 0];
    const rect = canvas.getBoundingClientRect();

    let clientX, clientY;
    if ('touches' in e) {
      if (e.touches.length === 0) return [0, 0];
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }

    return [clientX - rect.left, clientY - rect.top];
  };

  const handleStartDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    if (recognitionTimeoutRef.current) {
      clearTimeout(recognitionTimeoutRef.current);
    }

    const [x, y] = getCoordinates(e);
    const point: Point = [x, y, Date.now()];

    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        const resolvedColor = getComputedStyle(document.documentElement)
          .getPropertyValue('--main-color')
          .trim();
        ctx.strokeStyle = resolvedColor || '#ff4e50';
        ctx.beginPath();
        ctx.moveTo(x, y);
      }
    }

    setIsDrawing(true);
    setCurrentStroke([point]);
  };

  const handleDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing) return;
    e.preventDefault();

    const [x, y] = getCoordinates(e);
    const point: Point = [x, y, Date.now()];
    setCurrentStroke(prev => [...prev, point]);

    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        const resolvedColor = getComputedStyle(document.documentElement)
          .getPropertyValue('--main-color')
          .trim();
        ctx.strokeStyle = resolvedColor || '#ff4e50';
        ctx.lineTo(x, y);
        ctx.stroke();
      }
    }
  };

  const handleStopDrawing = () => {
    if (!isDrawing) return;
    setIsDrawing(false);

    const updatedStrokes = [...strokes, currentStroke];
    setStrokes(updatedStrokes);
    setCurrentStroke([]);

    if (recognitionTimeoutRef.current) clearTimeout(recognitionTimeoutRef.current);
    recognitionTimeoutRef.current = setTimeout(() => {
      void recognizeHandwriting(updatedStrokes);
    }, 600);
  };

  const recognizeHandwriting = async (currentStrokes: Stroke[]) => {
    if (currentStrokes.length === 0) return;
    setLoading(true);

    const canvas = canvasRef.current;
    const width = canvas?.clientWidth || 280;
    const height = canvas?.clientHeight || 280;

    const ink = currentStrokes.map(stroke => {
      const xs: number[] = [];
      const ys: number[] = [];
      const ts: number[] = [];
      stroke.forEach(([x, y, t]) => {
        xs.push(Math.round(x));
        ys.push(Math.round(y));
        ts.push(t);
      });
      return [xs, ys, ts];
    });

    try {
      const response = await fetch(
        'https://inputtools.google.com/request?itc=ja-t-i0-handwrit&app=translate',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            app_version: 0.4,
            api_level: '533.0',
            device: 'co',
            input_type: 0,
            options: 'enable_pre_space',
            requests: [
              {
                writing_area_width: width,
                writing_area_height: height,
                pre_context: '',
                max_num_results: 8,
                max_completions: 0,
                language: 'ja',
                ink,
              },
            ],
          }),
        }
      );

      const data = await response.json();
      if (data && data[0] === 'SUCCESS') {
        const parsedCandidates: string[] = data[1][0][1];
        const latinOrDigitRegex = /[a-zA-Z0-9\u00C0-\u024F\u1E00-\u1EFF]/;
        setCandidates(
          parsedCandidates.filter(
            c => c.trim().length > 0 && !latinOrDigitRegex.test(c),
          ),
        );
      }
    } catch (err) {
      console.error('Lỗi nhận diện viết tay:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    playClick();
    setStrokes([]);
    setCurrentStroke([]);
    setCandidates([]);
    if (recognitionTimeoutRef.current) clearTimeout(recognitionTimeoutRef.current);

    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        drawGrid(ctx);
      }
    }
  };

  const handleUndo = () => {
    playClick();
    if (strokes.length === 0) return;
    const updated = strokes.slice(0, -1);
    setStrokes(updated);

    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        redrawStrokes(ctx, updated);
      }
    }

    if (recognitionTimeoutRef.current) clearTimeout(recognitionTimeoutRef.current);

    if (updated.length > 0) {
      recognitionTimeoutRef.current = setTimeout(() => {
        void recognizeHandwriting(updated);
      }, 600);
    } else {
      setCandidates([]);
    }
  };

  return (
    <div className={cn(
      'flex flex-col gap-3 p-4 shadow-sm',
      'rounded-2xl border-2 border-(--border-color) bg-(--card-color)',
      className
    )}>
      <div className='flex items-center justify-between'>
        <span className='text-sm font-bold text-(--secondary-color) flex items-center gap-1.5'>
          <Search size={15} />
          Hoặc vẽ Kanji
        </span>
        <div className='flex gap-1.5'>
          <button
            onClick={handleUndo}
            disabled={strokes.length === 0}
            className={cn(
              'rounded-xl bg-(--background-color) p-2 text-(--secondary-color) border border-(--border-color)',
              'hover:text-(--main-color) hover:border-(--main-color) disabled:opacity-40 transition-all',
              'active:scale-95 duration-275 cursor-pointer'
            )}
            title='Undo'
          >
            <Undo2 size={15} />
          </button>
          <button
            onClick={handleClear}
            disabled={strokes.length === 0 && candidates.length === 0}
            className={cn(
              'rounded-xl bg-(--background-color) p-2 text-red-500 border border-(--border-color)',
              'hover:bg-red-50 dark:hover:bg-red-950/20 disabled:opacity-40 transition-all',
              'active:scale-95 duration-275 cursor-pointer'
            )}
            title='Clear'
          >
            <Eraser size={15} />
          </button>
        </div>
      </div>

      <div className='relative h-[280px] w-full overflow-hidden rounded-xl border-2 border-(--border-color) bg-(--background-color)'>
        <canvas
          ref={canvasRef}
          onMouseDown={handleStartDrawing}
          onMouseMove={handleDrawing}
          onMouseUp={handleStopDrawing}
          onMouseLeave={handleStopDrawing}
          onTouchStart={handleStartDrawing}
          onTouchMove={handleDrawing}
          onTouchEnd={handleStopDrawing}
          className='absolute inset-0 z-10 cursor-crosshair touch-none'
        />
        {strokes.length === 0 && (
          <div className='pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-xs text-(--secondary-color)/40 gap-1 select-none z-0'>
            <span className='font-medium'>Vẽ chữ Kanji tại đây</span>
            <span className='scale-75 opacity-70'>(Dùng chuột hoặc cảm ứng)</span>
          </div>
        )}
      </div>

      <div className='flex flex-wrap gap-1.5 min-h-[44px] items-center justify-start py-1'>
        {loading && (
          <div className='flex items-center gap-1.5 text-xs text-(--secondary-color) animate-pulse font-medium'>
            <Loader2 className='animate-spin' size={14} />
            Đang nhận diện...
          </div>
        )}
        {!loading && candidates.length === 0 && strokes.length > 0 && (
          <span className='text-xs text-(--secondary-color)/60 font-medium'>Không có gợi ý phù hợp.</span>
        )}
        {!loading && candidates.map((char) => (
          <button
            key={char}
            onClick={() => {
              playClick();
              onSelectKanji(char);
            }}
            className={cn(
              'h-9 min-w-9 px-2 flex items-center justify-center text-lg font-bold cursor-pointer',
              'rounded-xl border-2 border-(--border-color) bg-(--background-color) text-(--secondary-color)',
              'hover:border-(--main-color) hover:text-(--main-color)',
              'active:scale-90 transition-all duration-150'
            )}
          >
            {char}
          </button>
        ))}
      </div>
    </div>
  );
}

export default function SearchSidebar() {
  const searchQuery = useKanjiStore(state => state.searchQuery);
  const setSearchQuery = useKanjiStore(state => state.setSearchQuery);
  const { playClick } = useClick();
  const [inputValue, setInputValue] = useState(searchQuery);

  // Sync state when query is updated elsewhere (e.g. cleared)
  useEffect(() => {
    setInputValue(searchQuery);
  }, [searchQuery]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setInputValue(val);
    setSearchQuery(val);
  };

  const handleSelectHandwritten = (char: string) => {
    setInputValue(char);
    setSearchQuery(char);
  };

  return (
    <div className='flex w-full flex-col gap-4'>
      {/* Title */}
      <h2 className='text-2xl font-bold text-(--main-color) pl-1'>Tìm kiếm Kanji</h2>

      {/* Input query field */}
      <div className='relative w-full rounded-2xl border-2 border-(--border-color) bg-(--card-color) p-2 shadow-sm'>
        <input
          type='text'
          value={inputValue}
          onChange={handleInputChange}
          placeholder='Nhập kanji hoặc âm hán việt'
          className='w-full bg-transparent px-3 py-2 text-sm text-(--secondary-color) outline-none placeholder:text-(--secondary-color)/50'
        />
        {inputValue && (
          <button
            onClick={() => {
              playClick();
              setInputValue('');
              setSearchQuery('');
            }}
            className='absolute top-1/2 right-4 -translate-y-1/2 text-xs text-red-500 hover:underline cursor-pointer'
          >
            Xóa
          </button>
        )}
      </div>

      {/* Canvas card */}
      <HandwritingSearchCard onSelectKanji={handleSelectHandwritten} />

      {/* Stats database card at the bottom */}
      <div className='flex items-center gap-4 rounded-2xl border-2 border-(--border-color) bg-(--card-color) p-4 shadow-sm'>
        <div className='flex h-12 w-12 items-center justify-center rounded-xl border-2 border-b-6 border-(--main-color-accent) bg-(--main-color) text-(--background-color)'>
          <Database size={20} />
        </div>
        <div>
          <h4 className='font-bold text-(--main-color)'>2500+ Kanji</h4>
          <p className='text-xs text-(--secondary-color)/80'>Chiết tự - Sơ đồ - N5...N1</p>
        </div>
      </div>
    </div>
  );
}
