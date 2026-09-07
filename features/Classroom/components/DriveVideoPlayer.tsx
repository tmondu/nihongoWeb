'use client';

import React, { useRef, useState, useEffect, useCallback, useId } from 'react';
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  Minimize,
  Gauge,
  SkipBack,
  SkipForward,
  MonitorCog,
} from 'lucide-react';
import { cn } from '@/shared/utils';

/* ─────────────────────────────────────────────
   Helper: format seconds → "m:ss" / "h:mm:ss"
───────────────────────────────────────────── */
function fmt(s: number): string {
  if (!isFinite(s) || s < 0) return '0:00';
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = Math.floor(s % 60);
  if (h > 0)
    return `${h}:${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
  return `${m}:${String(sec).padStart(2, '0')}`;
}

/* ─────────────────────────────────────────────
   Props
───────────────────────────────────────────── */
interface DriveVideoPlayerProps {
  /** Google Drive file ID */
  fileId: string;
  title?: string;
  className?: string;
}

const SPEEDS = [0.5, 0.75, 1, 1.25, 1.5, 2] as const;
type Speed = (typeof SPEEDS)[number];

/**
 * Build candidate URLs to try loading the Drive video.
 * Browser has Google session cookies → direct download often works for public files.
 */
function buildVideoUrls(fileId: string): string[] {
  return [
    // 1. usercontent (newer endpoint, handles large files)
    `https://drive.usercontent.google.com/download?id=${fileId}&export=download&authuser=0&confirm=t`,
    // 2. Classic uc endpoint
    `https://drive.google.com/uc?id=${fileId}&export=download&confirm=t`,
    // 3. Server-side proxy (last resort — has bandwidth limits)
    `/api/video/stream?id=${fileId}`,
  ];
}

/* ═══════════════════════════════════════════
   Main Component
═══════════════════════════════════════════ */
export default function DriveVideoPlayer({
  fileId,
  title = 'Video bài giảng',
  className,
}: DriveVideoPlayerProps) {
  const uid = useId();
  const videoRef = useRef<HTMLVideoElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const seekRef = useRef<HTMLInputElement>(null);
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  /* ─── state ─── */
  const [playing, setPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [buffered, setBuffered] = useState(0);
  const [volume, setVolume] = useState(1);
  const [muted, setMuted] = useState(false);
  const [speed, setSpeed] = useState<Speed>(1);
  const [showControls, setShowControls] = useState(true);
  const [showSpeedMenu, setShowSpeedMenu] = useState(false);
  const [showQualityMenu, setShowQualityMenu] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [seeking, setSeeking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [urlIndex, setUrlIndex] = useState(0);

  const candidateUrls = buildVideoUrls(fileId);
  const currentSrc = candidateUrls[urlIndex];

  /* ─── auto-hide controls ─── */
  const scheduleHide = useCallback(() => {
    if (hideTimer.current) clearTimeout(hideTimer.current);
    hideTimer.current = setTimeout(() => {
      if (!seeking && !showSpeedMenu) setShowControls(false);
    }, 3000);
  }, [seeking, showSpeedMenu]);

  const revealControls = useCallback(() => {
    setShowControls(true);
    scheduleHide();
  }, [scheduleHide]);

  /* ─── video event handlers ─── */
  const onTimeUpdate = () => {
    const v = videoRef.current;
    if (!v || seeking) return;
    setCurrentTime(v.currentTime);
    // update buffered
    if (v.buffered.length > 0) {
      setBuffered(v.buffered.end(v.buffered.length - 1));
    }
  };

  const onLoadedMetadata = () => {
    const v = videoRef.current;
    if (!v) return;
    setDuration(v.duration);
    setLoading(false);
  };

  const onPlay = () => setPlaying(true);
  const onPause = () => setPlaying(false);
  const onEnded = () => setPlaying(false);
  const onWaiting = () => setLoading(true);
  const onCanPlay = () => setLoading(false);
  const onError = () => {
    // Try next URL in the fallback chain
    if (urlIndex < candidateUrls.length - 1) {
      setUrlIndex(i => i + 1);
      setLoading(true);
      return;
    }
    // All URLs failed
    setError(
      'Không thể tải video. Vui lòng kiểm tra kết nối hoặc thử lại sau.',
    );
    setLoading(false);
  };

  /* ─── fullscreen change ─── */
  useEffect(() => {
    const onFSChange = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', onFSChange);
    return () => document.removeEventListener('fullscreenchange', onFSChange);
  }, []);

  /* ─── close menus on outside click ─── */
  useEffect(() => {
    if (!showSpeedMenu && !showQualityMenu) return;
    const handler = () => {
      setShowSpeedMenu(false);
      setShowQualityMenu(false);
    };
    window.addEventListener('pointerdown', handler, { once: true });
    return () => window.removeEventListener('pointerdown', handler);
  }, [showSpeedMenu, showQualityMenu]);

  /* ─── toggleFullscreen (declared before keyboard useEffect to avoid hoisting issue) ─── */
  const toggleFullscreen = useCallback(() => {
    const el = wrapperRef.current;
    if (!el) return;
    if (document.fullscreenElement) {
      document.exitFullscreen().catch(() => {});
    } else {
      el.requestFullscreen().catch(() => {});
    }
  }, []);

  /* ─── keyboard shortcuts ─── */
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const v = videoRef.current;
      if (!v) return;
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement).tagName))
        return;
      switch (e.key) {
        case ' ':
        case 'k':
          e.preventDefault();
          if (v.paused) {
            void v.play();
          } else {
            v.pause();
          }
          break;
        case 'ArrowRight':
          e.preventDefault();
          v.currentTime = Math.min(v.duration, v.currentTime + 10);
          break;
        case 'ArrowLeft':
          e.preventDefault();
          v.currentTime = Math.max(0, v.currentTime - 10);
          break;
        case 'm':
          setMuted(m => !m);
          break;
        case 'f':
          toggleFullscreen();
          break;
        default:
          break;
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [toggleFullscreen]);

  /* ─── actions ─── */
  const togglePlay = () => {
    const v = videoRef.current;
    if (!v) return;
    if (v.paused) {
      v.play().catch(() => {});
    } else {
      v.pause();
    }
    revealControls();
  };

  const handleSeekChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = videoRef.current;
    if (!v) return;
    const val = Number(e.target.value);
    setCurrentTime(val);
    v.currentTime = val;
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = videoRef.current;
    if (!v) return;
    const val = Number(e.target.value);
    setVolume(val);
    v.volume = val;
    setMuted(val === 0);
    v.muted = val === 0;
  };

  const toggleMute = () => {
    const v = videoRef.current;
    if (!v) return;
    const next = !muted;
    setMuted(next);
    v.muted = next;
  };

  const changeSpeed = (s: Speed) => {
    const v = videoRef.current;
    if (!v) return;
    setSpeed(s);
    v.playbackRate = s;
    setShowSpeedMenu(false);
  };

  const skip = (seconds: number) => {
    const v = videoRef.current;
    if (!v) return;
    v.currentTime = Math.max(
      0,
      Math.min(v.duration || 0, v.currentTime + seconds),
    );
    revealControls();
  };

  /* ─── progress % helpers ─── */
  const pct = duration > 0 ? (currentTime / duration) * 100 : 0;
  const bufferedPct = duration > 0 ? (buffered / duration) * 100 : 0;

  /* ─── render ─── */
  return (
    <div
      ref={wrapperRef}
      className={cn(
        'group relative overflow-hidden rounded-2xl bg-black select-none',
        className,
      )}
      onPointerMove={revealControls}
      onTouchStart={revealControls}
      onPointerLeave={() => scheduleHide()}
    >
      {/* ── Video element ── */}
      <video
        ref={videoRef}
        key={currentSrc} /* remount when src changes */
        src={currentSrc}
        title={title}
        playsInline
        preload='metadata'
        className='h-full w-full object-contain'
        onTimeUpdate={onTimeUpdate}
        onLoadedMetadata={onLoadedMetadata}
        onPlay={onPlay}
        onPause={onPause}
        onEnded={onEnded}
        onWaiting={onWaiting}
        onCanPlay={onCanPlay}
        onError={onError}
        onClick={togglePlay}
      />

      {/* ── Loading spinner ── */}
      {loading && !error && (
        <div className='pointer-events-none absolute inset-0 flex items-center justify-center bg-black/40'>
          <div className='h-12 w-12 animate-spin rounded-full border-4 border-white/20 border-t-white' />
        </div>
      )}

      {/* ── Error state ── */}
      {error && (
        <div className='absolute inset-0 flex flex-col items-center justify-center gap-3 bg-black/80 px-6 text-center'>
          <p className='text-sm text-white/80'>{error}</p>
          <button
            onClick={() => {
              setError(null);
              setLoading(true);
              if (videoRef.current) {
                videoRef.current.load();
              }
            }}
            className='rounded-xl bg-blue-600 px-4 py-2 text-xs font-semibold text-white'
          >
            Thử lại
          </button>
          <button
            onClick={() => {
              setError(null);
              setUrlIndex(0);
              setLoading(true);
            }}
            className='rounded-xl border border-white/20 px-4 py-2 text-xs font-medium text-white/80'
          >
            Đổi nguồn
          </button>
        </div>
      )}

      {/* ── Big play button (center, tap) ── */}
      {!playing && !loading && !error && (
        <button
          type='button'
          onClick={togglePlay}
          className='absolute inset-0 flex items-center justify-center'
          aria-label='Phát video'
        >
          <div className='flex h-20 w-20 items-center justify-center rounded-full bg-white/15 backdrop-blur-md transition-transform active:scale-90'>
            <Play className='h-9 w-9 translate-x-0.5 fill-white text-white' />
          </div>
        </button>
      )}

      {/* ── Controls overlay ── */}
      <div
        className={cn(
          'absolute inset-x-0 bottom-0 transition-opacity duration-200',
          showControls || !playing
            ? 'opacity-100'
            : 'pointer-events-none opacity-0',
        )}
      >
        {/* gradient bg */}
        <div className='pointer-events-none absolute inset-0 rounded-b-2xl bg-gradient-to-t from-black/80 via-black/30 to-transparent' />

        <div className='relative flex flex-col gap-2 px-3 pt-6 pb-3'>
          {/* ── Seek bar ── */}
          <div className='relative flex h-5 items-center'>
            {/* buffered track */}
            <div
              className='absolute left-0 h-1 rounded-full bg-white/20'
              style={{ width: `${bufferedPct}%` }}
            />
            {/* played track */}
            <div
              className='absolute left-0 h-1 rounded-full bg-blue-500'
              style={{ width: `${pct}%` }}
            />
            <input
              id={`${uid}-seek`}
              ref={seekRef}
              type='range'
              min={0}
              max={duration || 100}
              step={0.5}
              value={currentTime}
              onChange={handleSeekChange}
              onPointerDown={() => setSeeking(true)}
              onPointerUp={() => setSeeking(false)}
              onTouchStart={() => setSeeking(true)}
              onTouchEnd={() => setSeeking(false)}
              className='absolute inset-0 h-full w-full cursor-pointer opacity-0'
              aria-label='Tua video'
            />
            {/* visible thumb */}
            <div
              className='absolute h-3.5 w-3.5 -translate-x-1/2 rounded-full bg-white shadow-md'
              style={{ left: `${pct}%` }}
            />
          </div>

          {/* ── Button row ── */}
          <div className='flex items-center gap-1.5'>
            {/* Play / Pause */}
            <button
              type='button'
              onClick={togglePlay}
              className='p-1 text-white transition-colors hover:text-blue-300'
              aria-label={playing ? 'Dừng' : 'Phát'}
            >
              {playing ? (
                <Pause className='h-5 w-5 fill-white' />
              ) : (
                <Play className='h-5 w-5 translate-x-0.5 fill-white' />
              )}
            </button>

            {/* Skip -10s */}
            <button
              type='button'
              onClick={() => skip(-10)}
              className='p-1 text-white transition-colors hover:text-blue-300'
              aria-label='Tua lùi 10 giây'
            >
              <SkipBack className='h-4.5 w-4.5' />
            </button>

            {/* Skip +10s */}
            <button
              type='button'
              onClick={() => skip(10)}
              className='p-1 text-white transition-colors hover:text-blue-300'
              aria-label='Tua tới 10 giây'
            >
              <SkipForward className='h-4.5 w-4.5' />
            </button>

            {/* Volume */}
            <button
              type='button'
              onClick={toggleMute}
              className='p-1 text-white transition-colors hover:text-blue-300'
              aria-label={muted ? 'Bật tiếng' : 'Tắt tiếng'}
            >
              {muted || volume === 0 ? (
                <VolumeX className='h-4.5 w-4.5' />
              ) : (
                <Volume2 className='h-4.5 w-4.5' />
              )}
            </button>

            {/* Volume slider — hidden on very small screens */}
            <input
              type='range'
              min={0}
              max={1}
              step={0.05}
              value={muted ? 0 : volume}
              onChange={handleVolumeChange}
              className='hidden w-16 cursor-pointer accent-blue-500 sm:block'
              aria-label='Âm lượng'
            />

            {/* Time */}
            <span className='ml-1 flex-1 font-mono text-[11px] text-white/80 tabular-nums'>
              {fmt(currentTime)} / {fmt(duration)}
            </span>

            {/* Speed */}
            <div className='relative'>
              <button
                type='button'
                onClick={e => {
                  e.stopPropagation();
                  setShowSpeedMenu(v => !v);
                }}
                className='flex items-center gap-1 p-1 text-xs font-semibold text-white transition-colors hover:text-blue-300'
                aria-label='Tốc độ phát'
              >
                <Gauge className='h-4 w-4' />
                <span>{speed}×</span>
              </button>

              {showSpeedMenu && (
                <div
                  className='absolute right-0 bottom-8 z-50 flex min-w-[72px] flex-col rounded-xl border border-white/10 bg-black/90 py-1 shadow-xl backdrop-blur-md'
                  onPointerDown={e => e.stopPropagation()}
                >
                  {SPEEDS.map(s => (
                    <button
                      key={s}
                      type='button'
                      onClick={() => changeSpeed(s)}
                      className={cn(
                        'px-4 py-1.5 text-left text-xs font-semibold transition-colors hover:bg-white/10',
                        s === speed ? 'text-blue-400' : 'text-white/80',
                      )}
                    >
                      {s}×
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Quality */}
            <div className='relative'>
              <button
                type='button'
                onClick={e => {
                  e.stopPropagation();
                  setShowQualityMenu(v => !v);
                  setShowSpeedMenu(false);
                }}
                className='flex items-center gap-1 p-1 text-xs font-semibold text-white transition-colors hover:text-blue-300'
                aria-label='Chất lượng video'
              >
                <MonitorCog className='h-4 w-4' />
                <span className='hidden sm:inline'>Auto</span>
              </button>

              {showQualityMenu && (
                <div
                  className='absolute right-0 bottom-8 z-50 min-w-[160px] rounded-xl border border-white/10 bg-black/90 p-3 shadow-xl backdrop-blur-md'
                  onPointerDown={e => e.stopPropagation()}
                >
                  <p className='mb-1.5 text-[10px] font-semibold tracking-wider text-white/40 uppercase'>
                    Chất lượng
                  </p>
                  <div className='flex flex-col gap-0.5'>
                    <div className='flex items-center gap-2 rounded-lg bg-blue-500/15 px-3 py-1.5'>
                      <span className='h-1.5 w-1.5 rounded-full bg-blue-400' />
                      <span className='text-xs font-semibold text-blue-300'>
                        Tự động (Auto)
                      </span>
                    </div>
                    <p className='mt-1.5 text-[10px] leading-relaxed text-white/40'>
                      Chất lượng do Google Drive tự chọn dựa trên tốc độ mạng
                      của bạn.
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Fullscreen */}
            <button
              type='button'
              onClick={toggleFullscreen}
              className='p-1 text-white transition-colors hover:text-blue-300'
              aria-label={
                isFullscreen ? 'Thoát toàn màn hình' : 'Toàn màn hình'
              }
            >
              {isFullscreen ? (
                <Minimize className='h-4.5 w-4.5' />
              ) : (
                <Maximize className='h-4.5 w-4.5' />
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
