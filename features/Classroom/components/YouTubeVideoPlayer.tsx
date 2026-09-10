/* eslint-disable @typescript-eslint/no-explicit-any */
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
   Props & Constants
───────────────────────────────────────────── */
interface YouTubeVideoPlayerProps {
  videoId: string;
  title?: string;
  className?: string;
  watermark?: string;
}

const SPEEDS = [0.5, 0.75, 1, 1.25, 1.5, 2] as const;
type Speed = (typeof SPEEDS)[number];

/* ─────────────────────────────────────────────
   YouTube IFrame API Loader (Singleton)
───────────────────────────────────────────── */
let ytApiPromise: Promise<void> | null = null;

function loadYouTubeApi(): Promise<void> {
  if (typeof window === 'undefined') return Promise.resolve();
  if ((window as any).YT && (window as any).YT.Player) {
    return Promise.resolve();
  }
  if (ytApiPromise) return ytApiPromise;

  ytApiPromise = new Promise(resolve => {
    const existing = document.getElementById('yt-iframe-api');
    if (!existing) {
      const tag = document.createElement('script');
      tag.id = 'yt-iframe-api';
      tag.src = 'https://www.youtube.com/iframe_api';
      document.head.appendChild(tag);
    }
    const prev = (window as any).onYouTubeIframeAPIReady;
    (window as any).onYouTubeIframeAPIReady = () => {
      if (prev) prev();
      resolve();
    };
  });

  return ytApiPromise;
}

/* ═══════════════════════════════════════════
   Main Component
═══════════════════════════════════════════ */
export default function YouTubeVideoPlayer({
  videoId,
  title: _title = 'Video bài giảng',
  className,
  watermark,
}: YouTubeVideoPlayerProps) {
  const uid = useId();
  const playerContainerId = `yt-player-${uid.replace(/:/g, '-')}`;

  const wrapperRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<any>(null);
  const pollTimer = useRef<ReturnType<typeof setInterval> | null>(null);
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  /* ─── state ─── */
  const [ready, setReady] = useState(false);
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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  /* ─── auto-hide controls ─── */
  const scheduleHide = useCallback(() => {
    if (hideTimer.current) clearTimeout(hideTimer.current);
    hideTimer.current = setTimeout(() => {
      if (!seeking && !showSpeedMenu && !showQualityMenu) {
        setShowControls(false);
      }
    }, 3000);
  }, [seeking, showSpeedMenu, showQualityMenu]);

  const revealControls = useCallback(() => {
    setShowControls(true);
    scheduleHide();
  }, [scheduleHide]);

  /* ─── initialize YouTube Player ─── */
  useEffect(() => {
    let isCancelled = false;

    loadYouTubeApi().then(() => {
      if (isCancelled) return;

      try {
        const YT = (window as any).YT;
        if (!YT || !YT.Player) return;

        playerRef.current = new YT.Player(playerContainerId, {
          width: '100%',
          height: '100%',
          videoId,
          playerVars: {
            autoplay: 0,
            controls: 0, // HIDE ALL YOUTUBE NATIVE CONTROLS
            disablekb: 1, // HIDE YOUTUBE SHORTCUTS
            fs: 0, // HIDE YOUTUBE FULLSCREEN BUTTON
            iv_load_policy: 3, // HIDE ANNOTATIONS
            modestbranding: 1, // HIDE YOUTUBE LOGO
            rel: 0, // NO RELATED VIDEOS
            playsinline: 1, // PLAY INLINE ON MOBILE
            origin:
              typeof window !== 'undefined'
                ? window.location.origin
                : undefined,
          },
          events: {
            onReady: (e: any) => {
              if (isCancelled) return;
              setReady(true);
              setLoading(false);
              const d = e.target.getDuration();
              if (d && d > 0) setDuration(d);

              // Proactively request 1080p on mount
              try {
                if (typeof e.target.setPlaybackQuality === 'function') {
                  e.target.setPlaybackQuality('hd1080');
                }
              } catch {}
            },
            onStateChange: (e: any) => {
              if (isCancelled) return;
              const state = e.data;
              // YT.PlayerState: -1 (unstarted), 0 (ended), 1 (playing), 2 (paused), 3 (buffering), 5 (cued)
              if (state === 1) {
                setPlaying(true);
                setLoading(false);
              } else if (state === 2 || state === 0) {
                setPlaying(false);
              } else if (state === 3) {
                setLoading(true);
              }
            },
            onError: () => {
              if (isCancelled) return;
              setError(
                'Không thể tải video YouTube. Vui lòng kiểm tra lại liên kết hoặc quyền truy cập.',
              );
              setLoading(false);
            },
          },
        });
      } catch (err) {
        console.error('Failed to init YouTube player:', err);
      }
    });

    return () => {
      isCancelled = true;
      if (pollTimer.current) clearInterval(pollTimer.current);
      if (hideTimer.current) clearTimeout(hideTimer.current);
      if (playerRef.current && playerRef.current.destroy) {
        try {
          playerRef.current.destroy();
        } catch {}
        playerRef.current = null;
      }
    };
  }, [videoId, playerContainerId]);

  /* ─── time & progress polling loop ─── */
  useEffect(() => {
    if (!ready) return;

    pollTimer.current = setInterval(() => {
      const p = playerRef.current;
      if (!p || typeof p.getCurrentTime !== 'function') return;

      if (!seeking) {
        const cur = p.getCurrentTime();
        if (typeof cur === 'number') setCurrentTime(cur);
      }

      const dur = p.getDuration();
      if (typeof dur === 'number' && dur > 0) setDuration(dur);

      const frac = p.getVideoLoadedFraction();
      if (typeof frac === 'number') setBuffered(frac * (dur || 100));
    }, 250);

    return () => {
      if (pollTimer.current) clearInterval(pollTimer.current);
    };
  }, [ready, seeking]);

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

  /* ─── toggleFullscreen ─── */
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
      const p = playerRef.current;
      if (!p) return;
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement).tagName))
        return;

      switch (e.key) {
        case ' ':
        case 'k':
          e.preventDefault();
          if (playing) {
            p.pauseVideo();
            setPlaying(false);
          } else {
            p.playVideo();
            setPlaying(true);
          }
          break;
        case 'ArrowRight':
          e.preventDefault();
          if (typeof p.getCurrentTime === 'function') {
            const next = Math.min(duration, p.getCurrentTime() + 10);
            p.seekTo(next, true);
            setCurrentTime(next);
          }
          break;
        case 'ArrowLeft':
          e.preventDefault();
          if (typeof p.getCurrentTime === 'function') {
            const prev = Math.max(0, p.getCurrentTime() - 10);
            p.seekTo(prev, true);
            setCurrentTime(prev);
          }
          break;
        case 'm':
          if (muted) {
            p.unMute();
            setMuted(false);
          } else {
            p.mute();
            setMuted(true);
          }
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
  }, [playing, duration, muted, toggleFullscreen]);

  /* ─── actions ─── */
  const togglePlay = () => {
    const p = playerRef.current;
    if (!p) return;
    if (playing) {
      p.pauseVideo();
      setPlaying(false);
    } else {
      p.playVideo();
      setPlaying(true);
    }
    revealControls();
  };

  const handleSeekChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = Number(e.target.value);
    setCurrentTime(val);
    const p = playerRef.current;
    if (p && typeof p.seekTo === 'function') {
      p.seekTo(val, true);
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = Number(e.target.value);
    setVolume(val);
    setMuted(val === 0);
    const p = playerRef.current;
    if (p) {
      if (val === 0) {
        p.mute();
      } else {
        p.unMute();
        p.setVolume(val * 100);
      }
    }
  };

  const toggleMute = () => {
    const p = playerRef.current;
    if (!p) return;
    const next = !muted;
    setMuted(next);
    if (next) {
      p.mute();
    } else {
      p.unMute();
      p.setVolume(volume * 100);
    }
  };

  const changeSpeed = (s: Speed) => {
    setSpeed(s);
    const p = playerRef.current;
    if (p && typeof p.setPlaybackRate === 'function') {
      p.setPlaybackRate(s);
    }
    setShowSpeedMenu(false);
  };

  const skip = (seconds: number) => {
    const p = playerRef.current;
    if (!p || typeof p.getCurrentTime !== 'function') return;
    const next = Math.max(
      0,
      Math.min(duration || 0, p.getCurrentTime() + seconds),
    );
    p.seekTo(next, true);
    setCurrentTime(next);
    revealControls();
  };

  /* ─── progress % helpers ─── */
  const pct = duration > 0 ? (currentTime / duration) * 100 : 0;
  const bufferedPct = duration > 0 ? (buffered / duration) * 100 : 0;

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
      onContextMenu={e => e.preventDefault()}
    >
      {/* ── YouTube Iframe Wrapper (forced 100% dimensions to avoid 360p downscale) ── */}
      <div className='pointer-events-none relative h-full w-full [&_iframe]:h-full [&_iframe]:w-full'>
        <div id={playerContainerId} className='h-full w-full' />
      </div>

      {/* ── Transparent Click Interceptor Overlay (Blocks direct clicks on YouTube UI) ── */}
      <div
        className='absolute inset-0 z-10 cursor-pointer'
        onClick={togglePlay}
        onContextMenu={e => e.preventDefault()}
      />

      {/* ── Anti-recording Watermark (Email/User ID) ── */}
      {watermark && (
        <div className='pointer-events-none absolute top-3 right-3 z-30 rounded bg-black/40 px-2 py-0.5 font-mono text-[11px] tracking-wider text-white/40 backdrop-blur-[1px] select-none'>
          {watermark}
        </div>
      )}

      {/* ── Loading spinner ── */}
      {loading && !error && (
        <div className='pointer-events-none absolute inset-0 z-20 flex items-center justify-center bg-black/40'>
          <div className='h-12 w-12 animate-spin rounded-full border-4 border-white/20 border-t-white' />
        </div>
      )}

      {/* ── Error state ── */}
      {error && (
        <div className='absolute inset-0 z-20 flex flex-col items-center justify-center gap-3 bg-black/80 px-6 text-center'>
          <p className='text-sm text-white/80'>{error}</p>
          <button
            type='button'
            onClick={() => {
              setError(null);
              setLoading(true);
              const p = playerRef.current;
              if (p && p.playVideo) p.playVideo();
            }}
            className='rounded-xl bg-blue-600 px-4 py-2 text-xs font-semibold text-white'
          >
            Thử lại
          </button>
        </div>
      )}

      {/* ── Big center play button (tap to play) ── */}
      {!playing && !loading && !error && (
        <button
          type='button'
          onClick={togglePlay}
          className='absolute inset-0 z-20 flex items-center justify-center'
          aria-label='Phát video'
        >
          <div className='flex h-20 w-20 items-center justify-center rounded-full bg-white/15 backdrop-blur-md transition-transform active:scale-90'>
            <Play className='h-9 w-9 translate-x-0.5 fill-white text-white' />
          </div>
        </button>
      )}

      {/* ── Custom Controls Overlay (Identical to Drive player) ── */}
      <div
        className={cn(
          'absolute inset-x-0 bottom-0 z-20 transition-opacity duration-200',
          showControls || !playing
            ? 'opacity-100'
            : 'pointer-events-none opacity-0',
        )}
      >
        {/* gradient bg */}
        <div className='pointer-events-none absolute inset-0 rounded-b-2xl bg-gradient-to-t from-black/85 via-black/35 to-transparent' />

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

            {/* Volume slider */}
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
                  setShowQualityMenu(false);
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

            {/* Quality Indicator */}
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
                <span className='hidden sm:inline'>Auto (HD)</span>
              </button>

              {showQualityMenu && (
                <div
                  className='absolute right-0 bottom-8 z-50 flex min-w-[220px] flex-col rounded-xl border border-white/10 bg-black/95 p-3 shadow-2xl backdrop-blur-md'
                  onPointerDown={e => e.stopPropagation()}
                >
                  <div className='flex items-center justify-between border-b border-white/10 pb-2'>
                    <span className='text-[10px] font-bold tracking-wider text-white/50 uppercase'>
                      Chất lượng phát
                    </span>
                    <span className='rounded bg-blue-500/20 px-1.5 py-0.5 text-[10px] font-semibold text-blue-400'>
                      Tự động tối ưu
                    </span>
                  </div>
                  <div className='flex flex-col gap-1.5 py-2.5'>
                    <div className='flex items-center gap-2 text-xs font-medium text-white'>
                      <span className='h-2 w-2 rounded-full bg-emerald-400 shadow-sm shadow-emerald-400/50' />
                      <span>Chuẩn sắc nét (1080p / 4K)</span>
                    </div>
                    <p className='text-[11px] leading-relaxed text-white/50'>
                      Hệ thống tự động tải luồng sắc nét nhất dựa trên độ phân
                      giải màn hình và đường truyền của bạn.
                    </p>
                  </div>
                  <div className='border-t border-white/10 pt-2 text-[10px] leading-relaxed text-amber-300/80'>
                    💡 <strong>Mẹo:</strong> Bật chế độ 16:9 hoặc Toàn màn hình
                    để hình ảnh luôn đạt độ nét cao nhất.
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
