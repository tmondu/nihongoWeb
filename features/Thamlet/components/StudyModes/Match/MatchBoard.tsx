'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Deck } from '../../../types';
import { ArrowLeft, RotateCcw, Timer, Trophy, Sparkles } from 'lucide-react';
import { Link } from '@/core/i18n/routing';
import {
  useClick,
  useCorrect,
  useError,
} from '@/shared/hooks/generic/useAudio';
import clsx from 'clsx';

interface MatchTile {
  uid: string; // Unique id for the tile
  cardId: string; // Associated card ID
  type: 'term' | 'definition';
  text: string;
  subText?: string;
  isMatched: boolean;
}

interface MatchBoardProps {
  deck: Deck;
}

export const MatchBoard: React.FC<MatchBoardProps> = ({ deck }) => {
  const { playClick } = useClick();
  const { playCorrect } = useCorrect();
  const { playError: playWrong } = useError();

  const [tiles, setTiles] = useState<MatchTile[]>([]);
  const [selectedTileUid, setSelectedTileUid] = useState<string | null>(null);
  const [wrongTileUids, setWrongTileUids] = useState<string[]>([]);
  const [matchedPairsCount, setMatchedPairsCount] = useState(0);
  const [totalPairs, setTotalPairs] = useState(0);
  const [isGameOver, setIsGameOver] = useState(false);

  // Timer
  const [elapsedMs, setElapsedMs] = useState(0);
  const [timerRunning, setTimerRunning] = useState(false);
  const startTimeRef = useRef<number>(0);
  const timerIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Best time key
  const bestTimeKey = `thamlet-best-match-${deck.id}`;
  const [bestTime, setBestTime] = useState<number | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(bestTimeKey);
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (stored) setBestTime(parseFloat(stored));
    }
  }, [bestTimeKey]);

  // Khởi tạo ván chơi
  const startNewGame = useCallback(() => {
    playClick();
    if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);

    // Lấy tối đa 6 thẻ ngẫu nhiên
    const shuffledCards = [...deck.cards]
      .sort(() => Math.random() - 0.5)
      .slice(0, 6);

    const generatedTiles: MatchTile[] = [];

    shuffledCards.forEach(card => {
      // Ô thuật ngữ
      generatedTiles.push({
        uid: `${card.id}-term`,
        cardId: card.id,
        type: 'term',
        text: card.term,
        subText: card.reading,
        isMatched: false,
      });

      // Ô định nghĩa
      generatedTiles.push({
        uid: `${card.id}-def`,
        cardId: card.id,
        type: 'definition',
        text: card.definition,
        isMatched: false,
      });
    });

    // Xáo trộn vị trí của tất cả các ô
    const randomized = generatedTiles.sort(() => Math.random() - 0.5);

    setTiles(randomized);
    setTotalPairs(shuffledCards.length);
    setMatchedPairsCount(0);
    setSelectedTileUid(null);
    setWrongTileUids([]);
    setIsGameOver(false);
    setElapsedMs(0);

    // Bắt đầu tính giờ
    const start = Date.now();
    startTimeRef.current = start;
    setTimerRunning(true);
    timerIntervalRef.current = setInterval(() => {
      setElapsedMs(Date.now() - start);
    }, 50);
  }, [deck.cards, playClick]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    startNewGame();
    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    };
  }, [startNewGame]);

  // Xử lý khi bấm vào ô
  const handleTileClick = (tile: MatchTile) => {
    if (tile.isMatched || wrongTileUids.length > 0 || !timerRunning) return;
    playClick();

    // Nếu chưa chọn ô nào
    if (!selectedTileUid) {
      setSelectedTileUid(tile.uid);
      return;
    }

    // Nếu bấm lại chính ô đó -> bỏ chọn
    if (selectedTileUid === tile.uid) {
      setSelectedTileUid(null);
      return;
    }

    // Đã chọn ô thứ 1, bây giờ bấm ô thứ 2
    const firstTile = tiles.find(t => t.uid === selectedTileUid);
    if (!firstTile) return;

    // Kiểm tra xem có trùng cardId và khác type không
    const isMatch =
      firstTile.cardId === tile.cardId && firstTile.type !== tile.type;

    if (isMatch) {
      // ĐÚNG CẶP
      playCorrect();
      setTiles(prev =>
        prev.map(t =>
          t.uid === firstTile.uid || t.uid === tile.uid
            ? { ...t, isMatched: true }
            : t,
        ),
      );
      setSelectedTileUid(null);

      const nextMatchedCount = matchedPairsCount + 1;
      setMatchedPairsCount(nextMatchedCount);

      // Nếu đã ghép hết toàn bộ
      if (nextMatchedCount === totalPairs) {
        if (timerIntervalRef.current) {
          clearInterval(timerIntervalRef.current);
        }
        setTimerRunning(false);
        const finalTimeSec = elapsedMs / 1000;
        setIsGameOver(true);

        // Cập nhật kỷ lục
        if (bestTime === null || finalTimeSec < bestTime) {
          setBestTime(finalTimeSec);
          if (typeof window !== 'undefined') {
            localStorage.setItem(bestTimeKey, finalTimeSec.toFixed(1));
          }
        }
      }
    } else {
      // SAI CẶP -> Hiệu ứng đỏ rung trong 0.6s
      playWrong();
      setWrongTileUids([firstTile.uid, tile.uid]);
      setTimeout(() => {
        setWrongTileUids([]);
        setSelectedTileUid(null);
      }, 600);
    }
  };

  const formattedTime = (elapsedMs / 1000).toFixed(1);

  if (isGameOver) {
    return (
      <div className='mx-auto max-w-lg space-y-6 px-4 py-12 text-center'>
        <div className='mx-auto flex size-20 items-center justify-center rounded-3xl bg-amber-500/20 text-amber-500 shadow-lg'>
          <Trophy className='size-10' />
        </div>

        <h2 className='text-3xl font-black text-(--main-color)'>
          Ghép thành công!
        </h2>
        <p className='text-sm text-(--secondary-color)'>
          Bạn đã nối chính xác tất cả các cặp thẻ trong thời gian:
        </p>

        {/* Big Time Display */}
        <div className='rounded-3xl border-2 border-(--main-color) bg-(--card-color) p-8'>
          <div className='text-5xl font-black tracking-tight text-(--main-color)'>
            {formattedTime} <span className='text-2xl font-bold'>giây</span>
          </div>
          {bestTime && (
            <div className='mt-2 flex items-center justify-center gap-1 text-xs font-semibold text-emerald-500'>
              <Sparkles className='size-3.5' />
              <span>Kỷ lục tốt nhất: {bestTime.toFixed(1)} giây</span>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className='flex flex-wrap items-center justify-center gap-3 pt-4'>
          <button
            type='button'
            onClick={startNewGame}
            className='inline-flex items-center gap-2 rounded-2xl bg-(--main-color) px-6 py-3 text-sm font-bold text-(--background-color) shadow-md transition-all hover:opacity-90 active:scale-95'
          >
            <RotateCcw className='size-4' />
            Chơi lại ván mới
          </button>

          <Link
            href={`/thamlet/${deck.id}`}
            onClick={playClick}
            className='inline-flex items-center gap-2 rounded-2xl border border-(--border-color) bg-(--card-color) px-6 py-3 text-sm font-semibold text-(--secondary-color) hover:text-(--main-color)'
          >
            <ArrowLeft className='size-4' />
            Về bộ thẻ
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className='mx-auto max-w-4xl space-y-6 px-4 py-6'>
      {/* Top Header info */}
      <div className='flex items-center justify-between border-b border-(--border-color) pb-4'>
        <Link
          href={`/thamlet/${deck.id}`}
          onClick={playClick}
          className='inline-flex items-center gap-2 rounded-2xl border border-(--border-color) bg-(--card-color) px-4 py-2 text-xs font-semibold text-(--secondary-color) hover:text-(--main-color)'
        >
          <ArrowLeft className='size-3.5' />
          Thoát
        </Link>

        {/* Timer */}
        <div className='flex items-center gap-2 rounded-2xl border border-(--border-color) bg-(--card-color) px-4 py-1.5 font-mono text-base font-bold text-(--main-color)'>
          <Timer className='size-4 text-(--main-color)' />
          <span>{formattedTime}s</span>
        </div>

        {/* Restart button */}
        <button
          type='button'
          onClick={startNewGame}
          className='rounded-xl p-2 text-(--secondary-color) hover:bg-(--card-color) hover:text-(--main-color)'
          title='Chơi lại ván mới'
        >
          <RotateCcw className='size-4' />
        </button>
      </div>

      {/* Grid of match tiles */}
      <div className='grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 md:grid-cols-4'>
        {tiles.map(tile => {
          if (tile.isMatched) {
            // Ô đã ghép đúng -> ẩn đi
            return (
              <div
                key={tile.uid}
                className='pointer-events-none h-24 rounded-2xl border-2 border-transparent opacity-0 sm:h-28'
              />
            );
          }

          const isSelected = selectedTileUid === tile.uid;
          const isWrong = wrongTileUids.includes(tile.uid);

          return (
            <button
              key={tile.uid}
              type='button'
              onClick={() => handleTileClick(tile)}
              className={clsx(
                'flex h-24 flex-col items-center justify-center rounded-2xl p-3 text-center shadow-sm transition-all duration-200 select-none sm:h-28',
                'hover:shadow-md active:scale-95',
                isSelected &&
                  'scale-105 border-2 border-(--main-color) bg-(--main-color)/15 text-(--main-color)',
                isWrong &&
                  'animate-shake border-2 border-red-500 bg-red-500/20 text-red-500',
                !isSelected &&
                  !isWrong &&
                  'border-2 border-(--border-color) bg-(--card-color) text-(--main-color) hover:border-(--main-color)/60',
              )}
            >
              <span
                className={clsx(
                  'leading-tight font-bold',
                  tile.type === 'term'
                    ? 'text-lg font-extrabold sm:text-xl'
                    : 'text-sm font-semibold sm:text-base',
                )}
              >
                {tile.text}
              </span>
              {tile.subText && (
                <span className='mt-1 text-[11px] text-(--secondary-color)'>
                  [{tile.subText}]
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};
