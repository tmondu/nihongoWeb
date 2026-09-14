'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import type {
  GameState,
  JLPTLevel,
  Difficulty,
  OniWordItem,
  GameStats,
  WordHistoryItem,
} from '../types';
import { fetchGameWords, shuffleWords } from '../lib/wordProvider';
import { GameCanvas } from './GameCanvas';
import { TypingHUD } from './TypingHUD';
import { GameOverModal } from './GameOverModal';
import { useOniAudio } from '../hooks/useOniAudio';
import {
  Play,
  Volume2,
  VolumeX,
  Shield,
  Swords,
  BookOpen,
  Trophy,
} from 'lucide-react';
import { useVocabSelection } from '@/features/Vocabulary';

export function OniEscapeGame() {
  const [gameState, setGameState] = useState<GameState>('LOBBY');
  const [selectedLevel, setSelectedLevel] = useState<JLPTLevel>('n5');
  const [difficulty, setDifficulty] = useState<Difficulty>('NORMAL');
  const [useCustomSelection, setUseCustomSelection] = useState(false);

  const [words, setWords] = useState<OniWordItem[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [inputRomaji, setInputRomaji] = useState('');
  const [distancePercent, setDistancePercent] = useState(75);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [maxStreak, setMaxStreak] = useState(0);
  const [metersRun, setMetersRun] = useState(0);
  const [wordsHistory, setWordsHistory] = useState<WordHistoryItem[]>([]);

  const [isDashing, setIsDashing] = useState(false);
  const [isStumbling, setIsStumbling] = useState(false);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  const inputRef = useRef<HTMLInputElement | null>(null);
  const { playSound } = useOniAudio();
  const { selectedVocab } = useVocabSelection();

  const customVocabCount = selectedVocab.length;
  const currentWord = words[currentIndex] || null;
  const isHyperBoost = streak >= 5;

  // Safe sound trigger
  const triggerSound = useCallback(
    (type: Parameters<typeof playSound>[0]) => {
      if (audioEnabled) {
        playSound(type);
      }
    },
    [audioEnabled, playSound],
  );

  // Start / Restart Game
  const startGame = useCallback(async () => {
    setIsLoading(true);
    const fetched = await fetchGameWords(
      selectedLevel,
      useCustomSelection ? selectedVocab : undefined,
    );
    const shuffled = shuffleWords(fetched);

    setWords(shuffled);
    setCurrentIndex(0);
    setInputRomaji('');
    setDistancePercent(75);
    setScore(0);
    setStreak(0);
    setMaxStreak(0);
    setMetersRun(0);
    setWordsHistory([]);
    setIsDashing(false);
    setIsStumbling(false);
    setGameState('PLAYING');
    setIsLoading(false);

    // Focus input after render
    setTimeout(() => {
      inputRef.current?.focus();
    }, 100);
  }, [selectedLevel, useCustomSelection, selectedVocab]);

  // Main game tick loop (decay distance, update meters)
  useEffect(() => {
    if (gameState !== 'PLAYING') return;

    const decayInterval = 100; // ms
    const decayRate =
      difficulty === 'EASY'
        ? 0.12 // ~1.2% per sec
        : difficulty === 'HARD'
          ? 0.22 // ~2.2% per sec
          : 0.16; // ~1.6% per sec

    const timer = setInterval(() => {
      setMetersRun(prev => prev + 1);

      setDistancePercent(prevDist => {
        const nextDist = prevDist - decayRate;
        if (nextDist <= 0) {
          clearInterval(timer);
          triggerSound('GAME_OVER');
          setGameState('GAME_OVER');
          return 0;
        }
        return nextDist;
      });
    }, decayInterval);

    return () => clearInterval(timer);
  }, [gameState, difficulty, triggerSound]);

  // Handle Keystrokes & Romaji Input
  const handleInputChange = (val: string) => {
    if (!currentWord || gameState !== 'PLAYING') return;

    const cleanInput = val.toLowerCase().replace(/[^a-z]/g, '');
    const target = currentWord.romaji.toLowerCase();

    // Check if cleanInput is a valid prefix of target
    if (target.startsWith(cleanInput)) {
      triggerSound('KEY');
      setInputRomaji(cleanInput);

      // Word fully matched!
      if (cleanInput === target) {
        // Boost distance
        const distanceBoost =
          difficulty === 'EASY' ? 24 : difficulty === 'HARD' ? 14 : 18;

        setDistancePercent(prev => Math.min(100, prev + distanceBoost));

        // Score calculation
        const wordPoints = isHyperBoost ? 250 : 100;
        const streakBonus = streak * 15;
        setScore(prev => prev + wordPoints + streakBonus);

        // Streak
        const nextStreak = streak + 1;
        setStreak(nextStreak);
        setMaxStreak(prev => Math.max(prev, nextStreak));

        if (nextStreak === 5) {
          triggerSound('BOOST');
        } else {
          triggerSound('DASH');
        }

        // Trigger visual dash
        setIsDashing(true);
        setTimeout(() => setIsDashing(false), 350);

        // Record history
        setWordsHistory(prev => [
          ...prev,
          {
            word: currentWord.word,
            reading: currentWord.reading,
            meaning: currentWord.meaning,
            correct: true,
          },
        ]);

        // Next word
        setInputRomaji('');
        setCurrentIndex(prev => (prev + 1) % words.length);
      }
    } else {
      // Mistake!
      triggerSound('ERROR');
      setIsStumbling(true);
      setTimeout(() => setIsStumbling(false), 250);

      // Stumble penalty
      const penalty = difficulty === 'HARD' ? 8 : 4;
      setDistancePercent(prev => Math.max(0, prev - penalty));
      setStreak(0);

      // Keep only matching prefix or clear
      let validPrefix = '';
      for (let i = cleanInput.length - 1; i >= 0; i--) {
        const sub = cleanInput.slice(0, i);
        if (target.startsWith(sub)) {
          validPrefix = sub;
          break;
        }
      }
      setInputRomaji(validPrefix);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Escape') {
      setGameState(prev => (prev === 'PLAYING' ? 'PAUSED' : 'PLAYING'));
    }
  };

  const currentStats: GameStats = {
    score,
    wordsCompleted: wordsHistory.length,
    wpm:
      metersRun > 0
        ? Math.round((wordsHistory.length / (metersRun / 10)) * 60)
        : 0,
    accuracy: 95,
    distance: metersRun,
    currentStreak: streak,
    maxStreak,
    wordsHistory,
  };

  return (
    <div className='mx-auto max-w-5xl space-y-6 px-4 py-8 sm:px-6'>
      {/* Game Header */}
      <div className='flex items-center justify-between'>
        <div className='flex items-center gap-3'>
          <div className='flex size-11 items-center justify-center rounded-2xl bg-gradient-to-br from-red-600 to-rose-700 text-white shadow-lg shadow-red-500/20'>
            <Swords className='size-6' />
          </div>
          <div>
            <h1 className='text-2xl font-black tracking-tight text-(--main-color) sm:text-3xl'>
              Oni Escape
            </h1>
            <p className='text-xs text-(--secondary-color)'>
              Cuộc rượt đuổi nghẹt thở trên nóc tàu Shinkansen
            </p>
          </div>
        </div>

        {/* Audio Toggle */}
        <button
          type='button'
          onClick={() => setAudioEnabled(prev => !prev)}
          className='flex size-10 items-center justify-center rounded-2xl border border-(--border-color) bg-(--card-color) text-(--secondary-color) transition-all hover:text-(--main-color) active:scale-95'
          title={audioEnabled ? 'Tắt âm thanh' : 'Bật âm thanh'}
        >
          {audioEnabled ? (
            <Volume2 className='size-4' />
          ) : (
            <VolumeX className='size-4' />
          )}
        </button>
      </div>

      {/* LOBBY VIEW */}
      {gameState === 'LOBBY' && (
        <div className='space-y-6 rounded-3xl border border-(--border-color) bg-(--card-color) p-6 shadow-xl sm:p-10'>
          {/* Hero Banner / Instructions */}
          <div className='rounded-2xl border border-red-500/20 bg-gradient-to-r from-red-950/40 via-slate-900/60 to-slate-900/40 p-6'>
            <div className='flex items-start gap-4'>
              <div className='rounded-xl bg-red-500/20 p-2.5 text-red-400'>
                <Shield className='size-6' />
              </div>
              <div className='space-y-1.5'>
                <h3 className='text-base font-bold text-red-200 sm:text-lg'>
                  Luật Chơi: Không Được Dừng Lại!
                </h3>
                <p className='text-xs leading-relaxed text-slate-300 sm:text-sm'>
                  Quái vật Oni khổng lồ đang đuổi sát phía sau lưng bạn. Cự ly
                  an toàn liên tục giảm dần theo thời gian. Gõ đúng Romaji của
                  từ vựng tiếng Nhật để kích hoạt <strong>Sprint Dash</strong>{' '}
                  vọt lên trước và bỏ xa Oni!
                </p>
              </div>
            </div>
          </div>

          {/* Level Selection */}
          <div className='space-y-3'>
            <label className='block text-xs font-bold tracking-wider text-(--secondary-color) uppercase'>
              1. Chọn Cấp Độ JLPT
            </label>
            <div className='grid grid-cols-5 gap-2'>
              {(['n5', 'n4', 'n3', 'n2', 'n1'] as JLPTLevel[]).map(lvl => (
                <button
                  key={lvl}
                  type='button'
                  onClick={() => {
                    setSelectedLevel(lvl);
                    setUseCustomSelection(false);
                  }}
                  className={`rounded-2xl py-3 text-sm font-bold uppercase transition-all ${
                    selectedLevel === lvl && !useCustomSelection
                      ? 'bg-(--main-color) text-(--background-color) shadow-md'
                      : 'border border-(--border-color) bg-(--background-color) text-(--secondary-color) hover:text-(--main-color)'
                  }`}
                >
                  {lvl}
                </button>
              ))}
            </div>

            {/* Custom selection from Vocab store if available */}
            {customVocabCount > 0 && (
              <button
                type='button'
                onClick={() => setUseCustomSelection(true)}
                className={`mt-2 flex w-full items-center justify-center gap-2 rounded-2xl px-4 py-2.5 text-xs font-semibold transition-all ${
                  useCustomSelection
                    ? 'border-2 border-cyan-500 bg-cyan-500/10 text-cyan-400'
                    : 'border border-(--border-color) bg-(--background-color) text-(--secondary-color)'
                }`}
              >
                <BookOpen className='size-3.5' />
                <span>
                  Sử dụng {customVocabCount} từ vựng bạn đã chọn trong
                  Vocabulary Dojo
                </span>
              </button>
            )}
          </div>

          {/* Difficulty Selection */}
          <div className='space-y-3'>
            <label className='block text-xs font-bold tracking-wider text-(--secondary-color) uppercase'>
              2. Độ Khó Của Oni
            </label>
            <div className='grid grid-cols-3 gap-2.5'>
              {(
                [
                  {
                    id: 'EASY',
                    label: 'Dễ (Thư thái)',
                    desc: 'Oni đuổi chậm, dash nới xa',
                  },
                  {
                    id: 'NORMAL',
                    label: 'Bình thường',
                    desc: 'Tốc độ tiêu chuẩn',
                  },
                  {
                    id: 'HARD',
                    label: 'Khó (Nghẹt thở)',
                    desc: 'Oni đuổi nhanh, gõ sai trừ nặng',
                  },
                ] as const
              ).map(item => (
                <button
                  key={item.id}
                  type='button'
                  onClick={() => setDifficulty(item.id)}
                  className={`rounded-2xl border p-3.5 text-left transition-all ${
                    difficulty === item.id
                      ? 'border-(--main-color) bg-(--main-color)/10 text-(--main-color)'
                      : 'border-(--border-color) bg-(--background-color) text-(--secondary-color)'
                  }`}
                >
                  <div className='text-sm font-bold'>{item.label}</div>
                  <div className='mt-0.5 text-[11px] opacity-70'>
                    {item.desc}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Start Button */}
          <button
            type='button'
            onClick={startGame}
            disabled={isLoading}
            className='flex w-full items-center justify-center gap-2.5 rounded-2xl bg-(--main-color) px-6 py-4 text-base font-extrabold text-(--background-color) shadow-xl transition-all hover:opacity-90 active:scale-[0.98] disabled:opacity-50'
          >
            <Play className='size-5 fill-current' />
            <span>
              {isLoading ? 'Đang tải từ vựng...' : 'Bắt Đầu Chạy Ngay'}
            </span>
          </button>
        </div>
      )}

      {/* PLAYING VIEW */}
      {gameState === 'PLAYING' && (
        <div className='animate-in fade-in space-y-4 duration-300'>
          {/* Top Running Status Bar */}
          <div className='flex items-center justify-between rounded-2xl border border-(--border-color) bg-(--card-color) px-4 py-2.5 text-xs'>
            <div className='flex items-center gap-4'>
              <div className='font-semibold text-(--secondary-color)'>
                Độ khó:{' '}
                <span className='font-bold text-(--main-color)'>
                  {difficulty}
                </span>
              </div>
              <div className='font-semibold text-(--secondary-color)'>
                Cấp độ:{' '}
                <span className='font-bold text-(--main-color) uppercase'>
                  {selectedLevel}
                </span>
              </div>
            </div>

            <div className='flex items-center gap-2'>
              <Trophy className='size-3.5 text-amber-400' />
              <span className='font-mono font-bold text-(--main-color)'>
                {metersRun} mét
              </span>
            </div>
          </div>

          {/* 60fps Shinkansen Game Canvas */}
          <GameCanvas
            distancePercent={distancePercent}
            isDashing={isDashing}
            isStumbling={isStumbling}
            isHyperBoost={isHyperBoost}
            streak={streak}
          />

          {/* Typing HUD */}
          <TypingHUD
            currentWord={currentWord}
            inputRomaji={inputRomaji}
            distancePercent={distancePercent}
            score={score}
            streak={streak}
            isHyperBoost={isHyperBoost}
            onInputChange={handleInputChange}
            onKeyDown={handleKeyDown}
            inputRef={inputRef}
          />
        </div>
      )}

      {/* GAME OVER MODAL */}
      {gameState === 'GAME_OVER' && (
        <GameOverModal
          stats={currentStats}
          onRestart={startGame}
          onBackToLobby={() => setGameState('LOBBY')}
        />
      )}
    </div>
  );
}
