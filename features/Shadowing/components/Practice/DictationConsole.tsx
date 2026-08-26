/* eslint-disable react-hooks/set-state-in-effect */
'use client';

import React, { useState, useEffect } from 'react';
import { DialogueLine } from '../../types';
import { useShadowingStore } from '../../store/useShadowingStore';
import {
  Volume2,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  XCircle,
  Eye,
  Send,
  RotateCcw,
} from 'lucide-react';
import {
  useClick,
  useCorrect,
  useError,
} from '@/shared/hooks/generic/useAudio';
import clsx from 'clsx';

interface DictationConsoleProps {
  dialogue: DialogueLine;
  hasPrev: boolean;
  hasNext: boolean;
  onPrev: () => void;
  onNext: () => void;
  onPlayOriginal: () => void;
}

export const DictationConsole: React.FC<DictationConsoleProps> = ({
  dialogue,
  hasPrev,
  hasNext,
  onPrev,
  onNext,
  onPlayOriginal,
}) => {
  const { playClick } = useClick();
  const { playCorrect } = useCorrect();
  const { playError } = useError();
  const { markDialogueCompleted } = useShadowingStore();

  const [inputVal, setInputVal] = useState('');
  const [showHint, setShowHint] = useState(false);
  const [isChecked, setIsChecked] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);

  // Reset form khi chuyển câu
  useEffect(() => {
    setInputVal('');
    setShowHint(false);
    setIsChecked(false);
    setIsCorrect(false);
  }, [dialogue.id]);

  const handleCheck = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputVal.trim()) return;

    playClick();

    // Chuẩn hóa chuỗi so sánh bỏ dấu câu
    const cleanTarget = dialogue.japanese
      .replace(/[^\p{L}\p{N}]/gu, '')
      .toLowerCase();
    const cleanInput = inputVal.replace(/[^\p{L}\p{N}]/gu, '').toLowerCase();

    const matched = cleanTarget === cleanInput;
    setIsChecked(true);
    setIsCorrect(matched);

    if (matched) {
      playCorrect();
      markDialogueCompleted(dialogue.id);
    } else {
      playError();
    }
  };

  const handleRetry = () => {
    playClick();
    setInputVal('');
    setIsChecked(false);
    setIsCorrect(false);
    onPlayOriginal();
  };

  return (
    <div className='space-y-6 rounded-3xl border-2 border-(--border-color) bg-(--card-color) p-6 shadow-md'>
      {/* Top action info */}
      <div className='flex items-center justify-between border-b border-(--border-color)/50 pb-3 text-xs'>
        <div className='flex items-center gap-1.5 font-bold text-(--main-color)'>
          <span>✍️ Chế độ Nghe Chép Chính Tả (Dictation)</span>
        </div>
        <button
          type='button'
          onClick={() => {
            playClick();
            setShowHint(!showHint);
          }}
          className='inline-flex items-center gap-1 font-medium text-(--secondary-color) hover:text-(--main-color)'
        >
          <Eye className='size-3.5' />
          <span>{showHint ? 'Ẩn gợi ý' : 'Xem gợi ý'}</span>
        </button>
      </div>

      {/* Hint display */}
      {showHint && (
        <div className='animate-in fade-in rounded-2xl border border-(--border-color) bg-(--background-color)/80 p-3.5 text-center text-sm font-semibold text-(--secondary-color) duration-200'>
          <p className='mb-1 text-xs text-(--secondary-color)/60'>
            Nghĩa tiếng Việt:
          </p>
          <p className='text-(--main-color)'>{dialogue.vietnamese}</p>
          {dialogue.romaji && (
            <p className='mt-1 font-mono text-xs text-(--secondary-color)/70'>
              {dialogue.romaji}
            </p>
          )}
        </div>
      )}

      {/* Input form */}
      <form onSubmit={handleCheck} className='space-y-4'>
        <div className='relative'>
          <input
            type='text'
            value={inputVal}
            onChange={e => setInputVal(e.target.value)}
            disabled={isChecked && isCorrect}
            placeholder='Gõ câu tiếng Nhật bạn vừa nghe được...'
            className={clsx(
              'w-full rounded-2xl border-2 bg-(--background-color) px-4 py-3.5 text-base font-bold text-(--main-color) shadow-inner transition-all placeholder:text-sm placeholder:text-(--secondary-color)/40 focus:outline-none sm:text-lg',
              isChecked
                ? isCorrect
                  ? 'border-emerald-500 bg-emerald-500/10'
                  : 'border-rose-500 bg-rose-500/10'
                : 'border-(--border-color) focus:border-(--main-color)',
            )}
          />
        </div>

        {/* Action Controls */}
        <div className='flex flex-wrap items-center justify-between gap-3'>
          {/* Replay Sound */}
          <button
            type='button'
            onClick={() => {
              playClick();
              onPlayOriginal();
            }}
            className='inline-flex items-center gap-1.5 rounded-2xl border border-(--border-color) bg-(--background-color) px-4 py-2.5 text-xs font-bold text-(--main-color) shadow-sm hover:border-(--main-color) active:scale-95'
          >
            <Volume2 className='size-4' />
            <span>Nghe lại</span>
          </button>

          {/* Submit / Retry */}
          <div className='flex items-center gap-2'>
            {isChecked && !isCorrect && (
              <button
                type='button'
                onClick={handleRetry}
                className='inline-flex items-center gap-1.5 rounded-2xl border border-(--border-color) bg-(--background-color) px-4 py-2.5 text-xs font-bold text-(--secondary-color) hover:text-(--main-color) active:scale-95'
              >
                <RotateCcw className='size-3.5' />
                <span>Thử lại</span>
              </button>
            )}

            <button
              type='submit'
              disabled={!inputVal.trim() || (isChecked && isCorrect)}
              className={clsx(
                'inline-flex items-center gap-1.5 rounded-2xl px-6 py-2.5 text-xs font-black shadow-md transition-all active:scale-95',
                isChecked && isCorrect
                  ? 'cursor-default bg-emerald-500 text-white'
                  : !inputVal.trim()
                    ? 'cursor-not-allowed bg-(--border-color) text-(--secondary-color)/50'
                    : 'bg-(--main-color) text-(--background-color) hover:opacity-90',
              )}
            >
              {isChecked && isCorrect ? (
                <>
                  <CheckCircle2 className='size-4' />
                  <span>Chính xác!</span>
                </>
              ) : (
                <>
                  <Send className='size-3.5' />
                  <span>Kiểm tra</span>
                </>
              )}
            </button>
          </div>
        </div>
      </form>

      {/* Answer feedback */}
      {isChecked && (
        <div
          className={clsx(
            'animate-in fade-in space-y-1.5 rounded-2xl border p-4 text-center duration-200',
            isCorrect
              ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-500'
              : 'border-rose-500/40 bg-rose-500/10 text-rose-500',
          )}
        >
          <div className='flex items-center justify-center gap-1.5 text-sm font-black'>
            {isCorrect ? (
              <>
                <CheckCircle2 className='size-5' />
                <span>Tuyệt vời! Bạn nghe và gõ chính xác 100%</span>
              </>
            ) : (
              <>
                <XCircle className='size-5' />
                <span>Chưa hoàn toàn chính xác</span>
              </>
            )}
          </div>

          {!isCorrect && (
            <div className='pt-1 text-xs text-(--secondary-color)'>
              <span className='font-semibold'>Đáp án đúng: </span>
              <strong className='text-sm font-bold text-(--main-color)'>
                {dialogue.japanese}
              </strong>
            </div>
          )}
        </div>
      )}

      {/* Footer Navigation */}
      <div className='flex items-center justify-between border-t border-(--border-color)/50 pt-4'>
        <button
          type='button'
          disabled={!hasPrev}
          onClick={() => {
            playClick();
            onPrev();
          }}
          className={clsx(
            'inline-flex items-center gap-1.5 rounded-2xl border border-(--border-color) bg-(--background-color) px-4 py-2 text-xs font-bold transition-all',
            !hasPrev
              ? 'cursor-not-allowed opacity-30'
              : 'hover:border-(--main-color) hover:text-(--main-color) active:scale-95',
          )}
        >
          <ChevronLeft className='size-4' />
          <span>Câu trước</span>
        </button>

        <button
          type='button'
          disabled={!hasNext}
          onClick={() => {
            playClick();
            onNext();
          }}
          className={clsx(
            'inline-flex items-center gap-1.5 rounded-2xl border border-(--border-color) bg-(--background-color) px-4 py-2 text-xs font-bold transition-all',
            !hasNext
              ? 'cursor-not-allowed opacity-30'
              : 'hover:border-(--main-color) hover:text-(--main-color) active:scale-95',
          )}
        >
          <span>Câu tiếp</span>
          <ChevronRight className='size-4' />
        </button>
      </div>
    </div>
  );
};
