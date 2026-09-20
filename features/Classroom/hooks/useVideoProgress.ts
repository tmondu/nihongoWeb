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

export type TimeInterval = [number, number]; // [startSeconds, endSeconds]

/**
 * Merges overlapping or near-contiguous intervals (within 1s tolerance)
 */
export function mergeIntervals(intervals: TimeInterval[]): TimeInterval[] {
  if (intervals.length <= 1) return intervals;
  const sorted = [...intervals].sort((a, b) => a[0] - b[0]);
  const merged: TimeInterval[] = [sorted[0]];

  for (let i = 1; i < sorted.length; i++) {
    const current = sorted[i];
    const last = merged[merged.length - 1];

    // If current starts within last interval or at most 1 second after last ends
    if (current[0] <= last[1] + 1) {
      last[1] = Math.max(last[1], current[1]);
    } else {
      merged.push(current);
    }
  }

  return merged;
}

/**
 * Calculates total unique seconds covered by merged intervals
 */
export function calculateCoverageSeconds(intervals: TimeInterval[]): number {
  const merged = mergeIntervals(intervals);
  return merged.reduce(
    (acc, [start, end]) => acc + Math.max(0, end - start),
    0,
  );
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
  const lastPlaybackPosRef = useRef<number>(0);
  const durationRef = useRef<number>(0);
  const lastActiveTimestampRef = useRef<number>(Date.now());
  const intervalTimerRef = useRef<NodeJS.Timeout | null>(null);
  const isPlayingRef = useRef<boolean>(false);

  // Watched intervals for coverage tracking (Method 3)
  const intervalsRef = useRef<TimeInterval[]>([]);
  const currentSegmentStartRef = useRef<number | null>(null);

  // LocalStorage storage key for intervals cache
  const storageKey = `lesson_progress_intervals_${lessonId}`;

  // Helper to commit active playing segment into intervalsRef
  const commitCurrentSegment = useCallback(
    (currentPos: number) => {
      if (currentSegmentStartRef.current === null) return;
      const start = Math.min(currentSegmentStartRef.current, currentPos);
      const end = Math.max(currentSegmentStartRef.current, currentPos);
      if (end - start >= 0.5) {
        intervalsRef.current = mergeIntervals([
          ...intervalsRef.current,
          [Math.floor(start), Math.ceil(end)],
        ]);
        // Persist to localStorage
        try {
          if (typeof window !== 'undefined') {
            localStorage.setItem(
              storageKey,
              JSON.stringify(intervalsRef.current),
            );
          }
        } catch {
          // ignore localStorage quota errors
        }
      }
      currentSegmentStartRef.current = currentPos;
    },
    [storageKey],
  );

  // 1. Fetch initial saved progress for this lesson & restore intervals
  useEffect(() => {
    if (!enabled || !lessonId || isNaN(lessonId)) {
      setLoading(false);
      return;
    }

    // Try loading intervals from localStorage
    try {
      if (typeof window !== 'undefined') {
        const cached = localStorage.getItem(storageKey);
        if (cached) {
          const parsed = JSON.parse(cached);
          if (Array.isArray(parsed)) {
            intervalsRef.current = mergeIntervals(parsed);
          }
        }
      }
    } catch {
      // ignore
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
          if (data.progress.duration_seconds > 0) {
            durationRef.current = data.progress.duration_seconds;
          }
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
  }, [lessonId, enabled, storageKey]);

  // 2. Core send function (supports beacon for page unload)
  const sendProgress = useCallback(
    (currentTime: number, duration: number, isFinal = false) => {
      if (!enabled || !lessonId || isNaN(lessonId)) return;
      if (duration <= 0 && durationRef.current <= 0) return;

      const effectiveDuration = duration > 0 ? duration : durationRef.current;
      const now = Date.now();

      // Commit any active playing segment up to currentTime
      if (isPlayingRef.current) {
        commitCurrentSegment(currentTime);
      }

      // 1. Calculate watchedDelta (Method 1 - Actual Playtime)
      let watchedDelta = 0;
      if (isPlayingRef.current) {
        const deltaMs = now - lastActiveTimestampRef.current;
        watchedDelta = Math.min(120, Math.max(0, Math.round(deltaMs / 1000)));
      }
      lastActiveTimestampRef.current = now;
      lastPlaybackPosRef.current = currentTime;
      durationRef.current = effectiveDuration;

      // 2. Calculate Coverage % (Method 3 - Merged Intervals)
      const coveredSeconds = calculateCoverageSeconds(intervalsRef.current);
      const coveragePercent =
        effectiveDuration > 0
          ? Math.min(
              100,
              Math.round((coveredSeconds / effectiveDuration) * 100),
            )
          : 0;

      const payload = JSON.stringify({
        currentTime: Math.floor(currentTime),
        duration: Math.floor(effectiveDuration),
        watchedDelta,
        coveragePercent,
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
    [lessonId, enabled, commitCurrentSegment],
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
    currentSegmentStartRef.current = lastPlaybackPosRef.current;
  }, []);

  const handlePause = useCallback(
    (currentTime: number, duration: number) => {
      if (isPlayingRef.current) {
        commitCurrentSegment(currentTime);
      }
      isPlayingRef.current = false;
      currentSegmentStartRef.current = null;
      sendProgress(currentTime, duration, false);
    },
    [commitCurrentSegment, sendProgress],
  );

  const handleEnded = useCallback(
    (duration: number) => {
      if (isPlayingRef.current) {
        commitCurrentSegment(duration);
      }
      isPlayingRef.current = false;
      currentSegmentStartRef.current = null;
      sendProgress(duration, duration, false);
    },
    [commitCurrentSegment, sendProgress],
  );

  const handleTimeUpdate = useCallback(
    (currentTime: number, duration: number) => {
      if (duration > 0) durationRef.current = duration;

      // Detect seeking jumps while playing
      if (isPlayingRef.current) {
        const prevPos = lastPlaybackPosRef.current;
        const timeDiff = currentTime - prevPos;

        // Normal progression is ~0.2s to 2s. If jump backwards (< -0.5s) or forward (> 3s),
        // it means the user scrubbed/seeked the video!
        if (timeDiff < -0.5 || timeDiff > 3) {
          // Commit the segment watched before the seek
          commitCurrentSegment(prevPos);
          // Start a new segment at the new seek location
          currentSegmentStartRef.current = currentTime;
        }
      }

      lastPlaybackPosRef.current = currentTime;
    },
    [commitCurrentSegment],
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
