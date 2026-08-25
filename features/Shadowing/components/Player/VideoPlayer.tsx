'use client';

import React, {
  useEffect,
  useRef,
  useCallback,
  useImperativeHandle,
  forwardRef,
} from 'react';
import { ShadowingVideo, DialogueLine } from '../../types';
import { useShadowingStore } from '../../store/useShadowingStore';
import { RotateCcw, Gauge } from 'lucide-react';
import { useClick } from '@/shared/hooks/generic/useAudio';
import clsx from 'clsx';

export interface VideoPlayerRef {
  playDialogueSegment: (startTime: number, endTime: number) => void;
  pause: () => void;
  play: () => void;
}

interface VideoPlayerProps {
  video: ShadowingVideo;
  currentDialogue: DialogueLine;
  onDialogueTimeUpdate?: (currentTime: number) => void;
}

export const VideoPlayer = forwardRef<VideoPlayerRef, VideoPlayerProps>(
  ({ video, currentDialogue, onDialogueTimeUpdate }, ref) => {
    const { playClick } = useClick();
    const {
      autoLoopDialogue,
      playbackSpeed,
      setPlaybackSpeed,
      toggleAutoLoop,
    } = useShadowingStore();

    const videoRef = useRef<HTMLVideoElement | null>(null);
    const iframeRef = useRef<HTMLIFrameElement | null>(null);

    const currentSegmentRef = useRef<{ start: number; end: number }>({
      start: currentDialogue.startTime,
      end: currentDialogue.endTime,
    });

    useEffect(() => {
      currentSegmentRef.current = {
        start: currentDialogue.startTime,
        end: currentDialogue.endTime,
      };
    }, [currentDialogue]);

    // Xử lý HTML5 video timeupdate
    const handleTimeUpdate = () => {
      if (!videoRef.current) return;
      const cur = videoRef.current.currentTime;
      if (onDialogueTimeUpdate) onDialogueTimeUpdate(cur);

      const segment = currentSegmentRef.current;
      if (cur >= segment.end) {
        if (autoLoopDialogue) {
          videoRef.current.currentTime = segment.start;
          videoRef.current.play();
        } else {
          videoRef.current.pause();
        }
      }
    };

    const playDialogueSegment = useCallback(
      (startTime: number, endTime: number) => {
        currentSegmentRef.current = { start: startTime, end: endTime };
        if (videoRef.current) {
          videoRef.current.currentTime = startTime;
          videoRef.current.playbackRate = playbackSpeed;
          videoRef.current.play();
        }
      },
      [playbackSpeed],
    );

    useImperativeHandle(ref, () => ({
      playDialogueSegment,
      pause: () => {
        if (videoRef.current) videoRef.current.pause();
      },
      play: () => {
        if (videoRef.current) videoRef.current.play();
      },
    }));

    // Đổi tốc độ phát
    const handleSpeedChange = (speed: number) => {
      playClick();
      setPlaybackSpeed(speed);
      if (videoRef.current) {
        videoRef.current.playbackRate = speed;
      }
    };

    return (
      <div className='relative overflow-hidden rounded-3xl border-2 border-(--border-color) bg-black shadow-lg'>
        {/* Video Frame */}
        <div className='relative flex aspect-video w-full items-center justify-center bg-zinc-950'>
          {video.videoUrl ? (
            <video
              ref={videoRef}
              src={video.videoUrl}
              onTimeUpdate={handleTimeUpdate}
              className='h-full w-full object-cover'
              playsInline
            />
          ) : (
            /* YouTube Iframe Embedded Player */
            <iframe
              ref={iframeRef}
              src={`https://www.youtube-nocookie.com/embed/${video.youtubeId}?enablejsapi=1&rel=0&modestbranding=1&start=${Math.floor(
                currentDialogue.startTime,
              )}`}
              title={video.title}
              className='h-full w-full'
              allow='accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture'
              allowFullScreen
            />
          )}
        </div>

        {/* Player Custom Control Bar */}
        <div className='flex flex-wrap items-center justify-between gap-3 border-t border-(--border-color) bg-(--card-color) p-3 text-xs sm:px-6'>
          {/* Play/Pause & Replay segment */}
          <div className='flex items-center gap-2'>
            <button
              type='button'
              onClick={() => {
                playClick();
                playDialogueSegment(
                  currentDialogue.startTime,
                  currentDialogue.endTime,
                );
              }}
              className='inline-flex items-center gap-1.5 rounded-xl bg-(--main-color) px-3.5 py-2 font-bold text-(--background-color) shadow-sm hover:opacity-90 active:scale-95'
            >
              <RotateCcw className='size-3.5' />
              <span>Phát lại câu này</span>
            </button>

            <button
              type='button'
              onClick={() => {
                playClick();
                toggleAutoLoop();
              }}
              className={clsx(
                'rounded-xl border px-3 py-2 font-semibold transition-all',
                autoLoopDialogue
                  ? 'border-(--main-color) bg-(--main-color)/15 text-(--main-color)'
                  : 'border-(--border-color) text-(--secondary-color)',
              )}
            >
              {autoLoopDialogue ? 'Lặp câu: BẬT' : 'Lặp câu: TẮT'}
            </button>
          </div>

          {/* Speed Controls (0.75x, 1.0x, 1.25x) */}
          <div className='flex items-center gap-1'>
            <Gauge className='mr-1 size-3.5 text-(--secondary-color)' />
            {[0.75, 1.0, 1.25].map(s => (
              <button
                key={s}
                type='button'
                onClick={() => handleSpeedChange(s)}
                className={clsx(
                  'rounded-lg px-2.5 py-1 font-bold transition-all',
                  playbackSpeed === s
                    ? 'bg-(--main-color) text-(--background-color)'
                    : 'text-(--secondary-color) hover:text-(--main-color)',
                )}
              >
                {s}x
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  },
);

VideoPlayer.displayName = 'VideoPlayer';
