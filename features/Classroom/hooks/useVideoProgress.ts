'use client';

import { useEffect, useRef, useState, useCallback } from 'react';

interface ProgressData {
  watched_seconds: number;
  last_position_seconds: number;
  duration_seconds: number;
  progress_percent: number;
  is_completed: boolean;
}

interface UseVideoProgressOptions {
  lessonId: number;
  enabled?: boolean;
}

export function useVideoProgress({
  lessonId,
  enabled = true,
}: UseVideoProgressOptions) {
  const [initialProgress, setInitialProgress] = useState<ProgressData | null>(
    null,
  );
  const [loading, setLoading] = useState(true);

  // Active tracking refs to avoid re-renders and closure staleness
  const lastSentTimeRef = useRef<number>(0);
  const lastPlaybackPosRef = useRef<number>(0);
  const durationRef = useRef<number>(0);
  const lastActiveTimestampRef = useRef<number>(Date.now());
  const intervalTimerRef = useRef<NodeJS.Timeout | null>(null);
  const isPlayingRef = useRef<boolean>(false);

  // 1. Fetch initial saved progress for this lesson
  useEffect(() => {
    if (!enabled || !lessonId || isNaN(lessonId)) {
      setLoading(false);
      return;
    }

    let isMounted = true;
    const fetchSavedProgress = async () => {
      try {
        const res = await fetch(`/api/lessons/${lessonId}/progress`);
        if (!res.ok) return;
        const data = await res.json();
        if (data.progress && isMounted) {
          setInitialProgress(data.progress);
          lastPlaybackPosRef.current = data.progress.last_position_seconds || 0;
        }
      } catch (err) {
        console.error('Failed to load video progress:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchSavedProgress();

    return () => {
      isMounted = false;
    };
  }, [lessonId, enabled]);

  // 2. Core send function (supports beacon for page unload)
  const sendProgress = useCallback(
    (currentTime: number, duration: number, isFinal = false) => {
      if (!enabled || !lessonId || isNaN(lessonId)) return;
      if (duration <= 0 && durationRef.current <= 0) return;

      const effectiveDuration = duration > 0 ? duration : durationRef.current;
      const now = Date.now();
      const deltaMs = now - lastActiveTimestampRef.current;
      // Calculate active seconds watched (max capped at 120s)
      const watchedDelta = Math.min(
        120,
        Math.max(0, Math.round(deltaMs / 1000)),
      );

      lastActiveTimestampRef.current = now;
      lastSentTimeRef.current = currentTime;
      lastPlaybackPosRef.current = currentTime;
      durationRef.current = effectiveDuration;

      const payload = JSON.stringify({
        currentTime: Math.floor(currentTime),
        duration: Math.floor(effectiveDuration),
        watchedDelta: isPlayingRef.current ? watchedDelta : 0,
      });

      const url = `/api/lessons/${lessonId}/progress`;

      if (isFinal) {
        // Use sendBeacon for reliable background dispatch on tab close
        if (typeof navigator !== 'undefined' && navigator.sendBeacon) {
          const blob = new Blob([payload], { type: 'application/json' });
          navigator.sendBeacon(url, blob);
          return;
        }
        // Fallback to fetch with keepalive
        void fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: payload,
          keepalive: true,
        }).catch(() => {});
        return;
      }

      // Normal asynchronous fetch
      void fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: payload,
      }).catch(err => {
        console.warn('Could not update video progress:', err);
      });
    },
    [lessonId, enabled],
  );

  // 3. Periodic fallback check every 60s while playing
  useEffect(() => {
    if (!enabled) return;

    intervalTimerRef.current = setInterval(() => {
      if (isPlayingRef.current && lastPlaybackPosRef.current > 0) {
        sendProgress(lastPlaybackPosRef.current, durationRef.current, false);
      }
    }, 60000); // 60 seconds

    return () => {
      if (intervalTimerRef.current) clearInterval(intervalTimerRef.current);
    };
  }, [enabled, sendProgress]);

  // 4. Page hide / unload listener to guarantee final progress is persisted
  useEffect(() => {
    if (!enabled) return;

    const handleUnload = () => {
      if (lastPlaybackPosRef.current > 0) {
        sendProgress(lastPlaybackPosRef.current, durationRef.current, true);
      }
    };

    window.addEventListener('pagehide', handleUnload);
    window.addEventListener('beforeunload', handleUnload);

    return () => {
      window.removeEventListener('pagehide', handleUnload);
      window.removeEventListener('beforeunload', handleUnload);
      // Also send final progress when unmounting component
      handleUnload();
    };
  }, [enabled, sendProgress]);

  // Event handlers to be triggered by video players
  const handlePlay = useCallback(() => {
    isPlayingRef.current = true;
    lastActiveTimestampRef.current = Date.now();
  }, []);

  const handlePause = useCallback(
    (currentTime: number, duration: number) => {
      isPlayingRef.current = false;
      sendProgress(currentTime, duration, false);
    },
    [sendProgress],
  );

  const handleEnded = useCallback(
    (duration: number) => {
      isPlayingRef.current = false;
      sendProgress(duration, duration, false);
    },
    [sendProgress],
  );

  const handleTimeUpdate = useCallback(
    (currentTime: number, duration: number) => {
      lastPlaybackPosRef.current = currentTime;
      if (duration > 0) durationRef.current = duration;
    },
    [],
  );

  return {
    initialProgress,
    loading,
    handlePlay,
    handlePause,
    handleEnded,
    handleTimeUpdate,
  };
}
