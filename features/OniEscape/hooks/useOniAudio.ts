'use client';

import { useCallback, useRef, useEffect } from 'react';

type OniSoundType = 'KEY' | 'DASH' | 'ERROR' | 'BOOST' | 'GAME_OVER';

export function useOniAudio() {
  const audioCtxRef = useRef<AudioContext | null>(null);

  useEffect(() => {
    const init = () => {
      if (!audioCtxRef.current) {
        const AudioCtx =
          window.AudioContext ||
          (window as unknown as { webkitAudioContext: typeof AudioContext })
            .webkitAudioContext;
        if (AudioCtx) {
          audioCtxRef.current = new AudioCtx();
        }
      }
    };

    window.addEventListener('click', init, { once: true });
    window.addEventListener('keydown', init, { once: true });

    return () => {
      if (audioCtxRef.current && audioCtxRef.current.state !== 'closed') {
        audioCtxRef.current.close().catch(() => {});
      }
    };
  }, []);

  const playSound = useCallback((type: OniSoundType) => {
    const ctx = audioCtxRef.current;
    if (!ctx) return;
    if (ctx.state === 'suspended') {
      ctx.resume().catch(() => {});
    }

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.connect(gain);
    gain.connect(ctx.destination);

    switch (type) {
      case 'KEY': {
        // Crisp mechanical click
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(800, now);
        osc.frequency.exponentialRampToValueAtTime(300, now + 0.04);
        gain.gain.setValueAtTime(0.12, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);
        osc.start(now);
        osc.stop(now + 0.04);
        break;
      }

      case 'DASH': {
        // High-speed energetic dash / sword slash
        osc.type = 'sine';
        osc.frequency.setValueAtTime(450, now);
        osc.frequency.exponentialRampToValueAtTime(1100, now + 0.12);
        gain.gain.setValueAtTime(0.22, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.12);
        osc.start(now);
        osc.stop(now + 0.12);
        break;
      }

      case 'ERROR': {
        // Low stumble thud
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(140, now);
        osc.frequency.linearRampToValueAtTime(80, now + 0.12);
        gain.gain.setValueAtTime(0.18, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.12);
        osc.start(now);
        osc.stop(now + 0.12);
        break;
      }

      case 'BOOST': {
        // Hyper boost chime
        osc.type = 'sine';
        osc.frequency.setValueAtTime(523.25, now); // C5
        osc.frequency.setValueAtTime(659.25, now + 0.08); // E5
        osc.frequency.setValueAtTime(783.99, now + 0.16); // G5
        osc.frequency.setValueAtTime(1046.5, now + 0.24); // C6
        gain.gain.setValueAtTime(0.2, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.32);
        osc.start(now);
        osc.stop(now + 0.32);
        break;
      }

      case 'GAME_OVER': {
        // Descending defeat chord
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(320, now);
        osc.frequency.exponentialRampToValueAtTime(110, now + 0.5);
        gain.gain.setValueAtTime(0.25, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.5);
        osc.start(now);
        osc.stop(now + 0.5);
        break;
      }
    }
  }, []);

  return { playSound };
}
