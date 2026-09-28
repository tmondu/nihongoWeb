'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/shared/ui/components/dialog';
import KanjiStrokeView from './KanjiStrokeView';
import {
  Volume2,
  PenTool,
  RotateCcw,
  Eye,
  EyeOff,
  ChevronLeft,
  ChevronRight,
  Eraser,
  Undo2,
  CheckCircle2,
} from 'lucide-react';
import clsx from 'clsx';
import { useClick } from '@/shared/hooks/generic/useAudio';

export interface KanjiStrokeModalProps {
  isOpen: boolean;
  onClose: () => void;
  kanjiChar: string;
  hanviet?: string;
  meaning?: string;
  onyomi?: string;
  kunyomi?: string;
  currentIndex?: number;
  totalCount?: number;
  onPrev?: () => void;
  onNext?: () => void;
  lessonTitle?: string;
}

interface StrokePoint {
  x: number;
  y: number;
}

interface CanvasStroke {
  points: StrokePoint[];
  color: string;
  width: number;
}

const INK_COLORS = [
  { id: 'slate', value: '#1e293b', label: 'Đen than' },
  { id: 'red', value: '#dc2626', label: 'Đỏ son' },
  { id: 'blue', value: '#2563eb', label: 'Xanh lam' },
  { id: 'emerald', value: '#059669', label: 'Xanh lục' },
];

export default function KanjiStrokeModal({
  isOpen,
  onClose,
  kanjiChar,
  hanviet,
  meaning,
  onyomi,
  kunyomi,
  currentIndex,
  totalCount,
  onPrev,
  onNext,
  lessonTitle,
}: KanjiStrokeModalProps) {
  const { playClick } = useClick();
  const [activeTab, setActiveTab] = useState<'animate' | 'practice'>('animate');
  const [showGuide, setShowGuide] = useState(true);
  const [selectedColor, setSelectedColor] = useState(INK_COLORS[0].value);
  const [penWidth, setPenWidth] = useState(6);
  const [drawnStrokes, setDrawnStrokes] = useState<CanvasStroke[]>([]);
  const [isDrawing, setIsDrawing] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const currentPointsRef = useRef<StrokePoint[]>([]);

  // Redraw canvas when strokes, guide, or kanji change
  const redrawCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;

    // Clear canvas
    ctx.clearRect(0, 0, width, height);

    // Draw practice crosshair grid lines
    ctx.save();
    ctx.strokeStyle = 'rgba(148, 163, 184, 0.4)';
    ctx.lineWidth = 1.5;
    ctx.setLineDash([6, 6]);

    // Vertical dashed center line
    ctx.beginPath();
    ctx.moveTo(width / 2, 0);
    ctx.lineTo(width / 2, height);
    ctx.stroke();

    // Horizontal dashed center line
    ctx.beginPath();
    ctx.moveTo(0, height / 2);
    ctx.lineTo(width, height / 2);
    ctx.stroke();

    ctx.restore();

    // Draw faint ghost template character if enabled
    if (showGuide && kanjiChar) {
      ctx.save();
      ctx.fillStyle = 'rgba(148, 163, 184, 0.22)';
      ctx.font = `bold ${Math.round(width * 0.72)}px "Noto Sans JP", sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(kanjiChar, width / 2, height / 2 + width * 0.05);
      ctx.restore();
    }

    // Draw all user-drawn strokes
    drawnStrokes.forEach(stroke => {
      if (stroke.points.length === 0) return;
      ctx.save();
      ctx.strokeStyle = stroke.color;
      ctx.lineWidth = stroke.width;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      ctx.beginPath();
      ctx.moveTo(stroke.points[0].x, stroke.points[0].y);
      if (stroke.points.length === 1) {
        ctx.lineTo(stroke.points[0].x + 0.5, stroke.points[0].y + 0.5);
      } else {
        for (let i = 1; i < stroke.points.length; i++) {
          ctx.lineTo(stroke.points[i].x, stroke.points[i].y);
        }
      }
      ctx.stroke();
      ctx.restore();
    });
  }, [drawnStrokes, showGuide, kanjiChar]);

  // Reset drawing when kanjiChar changes
  useEffect(() => {
    let active = true;
    void (async () => {
      await Promise.resolve();
      if (!active) return;
      setDrawnStrokes([]);
      currentPointsRef.current = [];
    })();
    return () => {
      active = false;
    };
  }, [kanjiChar]);

  // Initialize and resize canvas
  useEffect(() => {
    if (!isOpen || activeTab !== 'practice') return;

    const timer = setTimeout(() => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      const dpr =
        typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1;
      const size = Math.min(rect.width || 300, 360);

      canvas.width = size * dpr;
      canvas.height = size * dpr;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.scale(dpr, dpr);
      }
      redrawCanvas();
    }, 50);

    return () => clearTimeout(timer);
  }, [isOpen, activeTab, redrawCanvas]);

  // Trigger canvas redraw on stroke change
  useEffect(() => {
    if (activeTab === 'practice') {
      redrawCanvas();
    }
  }, [drawnStrokes, showGuide, activeTab, redrawCanvas]);

  const handleClearCanvas = () => {
    playClick();
    setDrawnStrokes([]);
    currentPointsRef.current = [];
  };

  const handleUndoStroke = () => {
    playClick();
    setDrawnStrokes(prev => prev.slice(0, -1));
  };

  const getCanvasCoordinates = (
    e:
      | React.MouseEvent<HTMLCanvasElement>
      | React.TouchEvent<HTMLCanvasElement>,
  ): StrokePoint | null => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    const rect = canvas.getBoundingClientRect();

    let clientX = 0;
    let clientY = 0;

    if ('touches' in e) {
      if (e.touches.length === 0) return null;
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }

    return {
      x: clientX - rect.left,
      y: clientY - rect.top,
    };
  };

  const startDrawing = (
    e:
      | React.MouseEvent<HTMLCanvasElement>
      | React.TouchEvent<HTMLCanvasElement>,
  ) => {
    const pt = getCanvasCoordinates(e);
    if (!pt) return;
    setIsDrawing(true);
    currentPointsRef.current = [pt];
  };

  const drawMove = (
    e:
      | React.MouseEvent<HTMLCanvasElement>
      | React.TouchEvent<HTMLCanvasElement>,
  ) => {
    if (!isDrawing) return;
    const pt = getCanvasCoordinates(e);
    if (!pt) return;

    currentPointsRef.current.push(pt);

    // Live drawing on canvas context
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.save();
    ctx.strokeStyle = selectedColor;
    ctx.lineWidth = penWidth;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    const pts = currentPointsRef.current;
    if (pts.length >= 2) {
      const p1 = pts[pts.length - 2];
      const p2 = pts[pts.length - 1];
      ctx.beginPath();
      ctx.moveTo(p1.x, p1.y);
      ctx.lineTo(p2.x, p2.y);
      ctx.stroke();
    }
    ctx.restore();
  };

  const endDrawing = () => {
    if (!isDrawing) return;
    setIsDrawing(false);
    if (currentPointsRef.current.length > 0) {
      const newStroke: CanvasStroke = {
        points: [...currentPointsRef.current],
        color: selectedColor,
        width: penWidth,
      };
      setDrawnStrokes(prev => [...prev, newStroke]);
      currentPointsRef.current = [];
    }
  };

  const handlePlayAudio = () => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(kanjiChar);
      utterance.lang = 'ja-JP';
      utterance.rate = 0.9;
      window.speechSynthesis.speak(utterance);
    } catch {
      // Audio playback error fallback
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={open => !open && onClose()}>
      <DialogContent
        className='max-w-2xl overflow-hidden rounded-3xl border border-(--border-color) bg-(--card-color) p-0 text-(--main-color) shadow-2xl sm:max-w-xl'
        aria-describedby='kanji-stroke-description'
      >
        {/* Header Section */}
        <DialogHeader className='border-b border-(--border-color) bg-(--background-color)/80 px-6 py-4'>
          <div className='flex items-center justify-between gap-3'>
            <div className='flex items-center gap-3'>
              <div className='font-japanese flex size-11 items-center justify-center rounded-2xl border border-emerald-500/30 bg-emerald-500/10 text-2xl font-black text-emerald-600 dark:text-emerald-400'>
                {kanjiChar}
              </div>
              <div>
                <DialogTitle className='flex items-center gap-2 text-base font-black text-(--main-color) sm:text-lg'>
                  <span>Vẽ nét chữ Hán:</span>
                  <span className='text-rose-500 uppercase dark:text-rose-400'>
                    {hanviet || kanjiChar}
                  </span>
                </DialogTitle>
                <DialogDescription className='text-xs text-(--secondary-color)'>
                  {meaning ? `Nghĩa: ${meaning}` : 'Thứ tự nét viết chuẩn Nhật'}
                  {lessonTitle ? ` • ${lessonTitle}` : ''}
                </DialogDescription>
              </div>
            </div>

            {/* Audio pronunciation button */}
            <button
              type='button'
              onClick={handlePlayAudio}
              className='mr-6 flex size-9 cursor-pointer items-center justify-center rounded-xl border border-(--border-color) bg-(--card-color) text-(--secondary-color) transition-all hover:scale-105 hover:border-(--main-color) hover:text-(--main-color)'
              title='Phát âm chữ này'
            >
              <Volume2 className='size-4' />
            </button>
          </div>

          {/* Quick Readings row */}
          {(onyomi || kunyomi) && (
            <div className='mt-2.5 flex flex-wrap items-center gap-3 text-xs'>
              {onyomi && (
                <div className='flex items-center gap-1'>
                  <span className='font-bold text-(--main-color) uppercase'>
                    ON:
                  </span>
                  <span className='font-japanese font-semibold text-amber-500 dark:text-amber-400'>
                    {onyomi}
                  </span>
                </div>
              )}
              {kunyomi && (
                <div className='flex items-center gap-1'>
                  <span className='font-bold text-(--main-color) uppercase'>
                    KUN:
                  </span>
                  <span className='font-japanese font-semibold text-amber-500 dark:text-amber-400'>
                    {kunyomi}
                  </span>
                </div>
              )}
            </div>
          )}
        </DialogHeader>

        {/* Tab Selector: Xem nét vẽ vs Tập viết */}
        <div className='flex border-b border-(--border-color) bg-(--background-color)/40 p-2'>
          <div className='grid w-full grid-cols-2 gap-2 rounded-2xl border border-(--border-color)/60 bg-(--background-color) p-1'>
            <button
              type='button'
              onClick={() => {
                playClick();
                setActiveTab('animate');
              }}
              className={clsx(
                'flex cursor-pointer items-center justify-center gap-2 rounded-xl py-2 text-xs font-bold transition-all',
                activeTab === 'animate'
                  ? 'bg-sky-500 text-white shadow-xs dark:bg-sky-600'
                  : 'text-(--secondary-color) hover:text-(--main-color)',
              )}
            >
              <RotateCcw className='size-3.5' />
              <span>Hoạt ảnh nét vẽ</span>
            </button>

            <button
              type='button'
              onClick={() => {
                playClick();
                setActiveTab('practice');
              }}
              className={clsx(
                'flex cursor-pointer items-center justify-center gap-2 rounded-xl py-2 text-xs font-bold transition-all',
                activeTab === 'practice'
                  ? 'bg-sky-500 text-white shadow-xs dark:bg-sky-600'
                  : 'text-(--secondary-color) hover:text-(--main-color)',
              )}
            >
              <PenTool className='size-3.5' />
              <span>Tập viết nét (Canvas)</span>
            </button>
          </div>
        </div>

        {/* Tab Body */}
        <div className='flex flex-col items-center justify-center p-6'>
          {activeTab === 'animate' ? (
            /* TAB 1: Animated Stroke Order View */
            <div className='flex flex-col items-center gap-4'>
              <KanjiStrokeView
                kanjiChar={kanjiChar}
                size='lg'
                isActive={isOpen && activeTab === 'animate'}
              />
              <div className='max-w-md text-center text-xs text-(--secondary-color)'>
                <p>
                  Thứ tự từng nét viết chuẩn theo <strong>KanjiVG</strong>. Màu
                  sắc và số thứ tự giúp phân biệt rõ từng nét theo quy tắc bút
                  thuận tiếng Nhật.
                </p>
              </div>
            </div>
          ) : (
            /* TAB 2: Interactive Practice Drawing Canvas */
            <div className='flex flex-col items-center gap-4'>
              <div className='relative flex h-72 w-72 items-center justify-center overflow-hidden rounded-3xl border-2 border-(--border-color) bg-(--background-color) shadow-inner sm:h-80 sm:w-80'>
                <canvas
                  ref={canvasRef}
                  onMouseDown={startDrawing}
                  onMouseMove={drawMove}
                  onMouseUp={endDrawing}
                  onMouseLeave={endDrawing}
                  onTouchStart={startDrawing}
                  onTouchMove={drawMove}
                  onTouchEnd={endDrawing}
                  onTouchCancel={endDrawing}
                  className='h-full w-full cursor-crosshair touch-none select-none'
                />

                {/* Stroke count badge */}
                <div className='pointer-events-none absolute top-2.5 left-2.5 rounded-lg border border-(--border-color)/60 bg-(--card-color)/80 px-2 py-0.5 text-[11px] font-bold text-(--secondary-color) backdrop-blur-xs'>
                  Đã vẽ: {drawnStrokes.length} nét
                </div>
              </div>

              {/* Canvas Controls Bar */}
              <div className='flex flex-wrap items-center justify-center gap-2'>
                {/* Color pickers */}
                <div className='flex items-center gap-1 rounded-xl border border-(--border-color) bg-(--card-color) p-1'>
                  {INK_COLORS.map(c => (
                    <button
                      key={c.id}
                      type='button'
                      onClick={() => setSelectedColor(c.value)}
                      className={clsx(
                        'size-5 rounded-full transition-transform',
                        selectedColor === c.value
                          ? 'scale-110 ring-2 ring-(--main-color) ring-offset-1'
                          : 'opacity-70 hover:opacity-100',
                      )}
                      style={{ backgroundColor: c.value }}
                      title={`Màu mực: ${c.label}`}
                    />
                  ))}
                </div>

                {/* Brush size */}
                <div className='flex items-center gap-1 rounded-xl border border-(--border-color) bg-(--card-color) px-2 py-1 text-xs'>
                  <span className='text-[10px] text-(--secondary-color)'>
                    Nét:
                  </span>
                  {[4, 6, 9].map(w => (
                    <button
                      key={w}
                      type='button'
                      onClick={() => setPenWidth(w)}
                      className={clsx(
                        'flex size-5 cursor-pointer items-center justify-center rounded-md font-bold',
                        penWidth === w
                          ? 'bg-sky-500 text-white dark:bg-sky-600'
                          : 'text-(--secondary-color) hover:text-(--main-color)',
                      )}
                    >
                      {w === 4 ? 'S' : w === 6 ? 'M' : 'L'}
                    </button>
                  ))}
                </div>

                {/* Toggle Guide Template */}
                <button
                  type='button'
                  onClick={() => {
                    playClick();
                    setShowGuide(g => !g);
                  }}
                  className={clsx(
                    'flex cursor-pointer items-center gap-1 rounded-xl border border-(--border-color) bg-(--card-color) px-2.5 py-1.5 text-xs font-semibold transition-all hover:bg-(--background-color)',
                    showGuide
                      ? 'text-(--main-color)'
                      : 'text-(--secondary-color)/60',
                  )}
                  title='Bật / Tắt nét chữ mờ hướng dẫn'
                >
                  {showGuide ? (
                    <Eye className='size-3.5' />
                  ) : (
                    <EyeOff className='size-3.5' />
                  )}
                  <span>Nét mẫu</span>
                </button>

                {/* Undo stroke */}
                <button
                  type='button'
                  onClick={handleUndoStroke}
                  disabled={drawnStrokes.length === 0}
                  className='flex cursor-pointer items-center gap-1 rounded-xl border border-(--border-color) bg-(--card-color) px-2.5 py-1.5 text-xs font-semibold text-(--secondary-color) transition-all hover:text-(--main-color) disabled:cursor-not-allowed disabled:opacity-40'
                  title='Hoàn tác nét vừa vẽ'
                >
                  <Undo2 className='size-3.5' />
                  <span>Hoàn tác</span>
                </button>

                {/* Clear canvas */}
                <button
                  type='button'
                  onClick={handleClearCanvas}
                  disabled={drawnStrokes.length === 0}
                  className='flex cursor-pointer items-center gap-1 rounded-xl border border-(--border-color) bg-(--card-color) px-2.5 py-1.5 text-xs font-semibold text-rose-500 transition-all hover:bg-rose-500/10 disabled:cursor-not-allowed disabled:opacity-40'
                  title='Xóa hết để viết lại từ đầu'
                >
                  <Eraser className='size-3.5' />
                  <span>Xóa hết</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer Navigation (Previous / Next Kanji) */}
        {(onPrev || onNext) && (
          <div className='flex items-center justify-between border-t border-(--border-color) bg-(--background-color)/80 px-6 py-3 text-xs font-bold'>
            <button
              type='button'
              onClick={() => {
                playClick();
                onPrev?.();
              }}
              disabled={!onPrev}
              className='flex cursor-pointer items-center gap-1.5 rounded-xl border border-(--border-color) bg-(--card-color) px-3 py-1.5 text-(--secondary-color) transition-all hover:text-(--main-color) disabled:cursor-not-allowed disabled:opacity-40'
            >
              <ChevronLeft className='size-3.5' />
              <span>Chữ trước</span>
            </button>

            {currentIndex !== undefined && totalCount !== undefined && (
              <span className='flex items-center gap-1 font-mono text-(--main-color)'>
                <CheckCircle2 className='size-3.5 text-emerald-500' />
                <span>
                  Chữ {currentIndex + 1} / {totalCount}
                </span>
              </span>
            )}

            <button
              type='button'
              onClick={() => {
                playClick();
                onNext?.();
              }}
              disabled={!onNext}
              className='flex cursor-pointer items-center gap-1.5 rounded-xl border border-(--border-color) bg-(--card-color) px-3 py-1.5 text-(--secondary-color) transition-all hover:text-(--main-color) disabled:cursor-not-allowed disabled:opacity-40'
            >
              <span>Chữ tiếp</span>
              <ChevronRight className='size-3.5' />
            </button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
