'use client';

import React from 'react';
import { DialogueLine } from '../../types';
import { useShadowingStore } from '../../store/useShadowingStore';
import { Volume2, Info } from 'lucide-react';
import { useClick } from '@/shared/hooks/generic/useAudio';
import clsx from 'clsx';

interface SubtitleOverlayProps {
  dialogue: DialogueLine;
  onReplayDialogue: () => void;
}

// Helper render Furigana tag [漢字:かんじ] -> <ruby>漢字<rt>かんじ</rt></ruby>
function renderFurigana(text: string) {
  const parts = [];
  const regex = /\[(.*?):(.*?)]/g;
  let lastIndex = 0;
  let match;

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(text.substring(lastIndex, match.index));
    }
    const [, kanji, furigana] = match;
    parts.push(
      <ruby key={match.index} className='px-0.5'>
        {kanji}
        <rt className='text-[11px] font-normal text-(--secondary-color) select-none'>
          {furigana}
        </rt>
      </ruby>,
    );
    lastIndex = regex.lastIndex;
  }

  if (lastIndex < text.length) {
    parts.push(text.substring(lastIndex));
  }

  return parts;
}

export const SubtitleOverlay: React.FC<SubtitleOverlayProps> = ({
  dialogue,
  onReplayDialogue,
}) => {
  const { playClick } = useClick();
  const {
    showFurigana,
    showRomaji,
    showVietnamese,
    toggleFurigana,
    toggleRomaji,
    toggleVietnamese,
  } = useShadowingStore();

  return (
    <div className='space-y-6 rounded-3xl border-2 border-(--border-color) bg-(--card-color) p-6 shadow-sm sm:p-8'>
      {/* Toggles bar */}
      <div className='flex flex-wrap items-center justify-between gap-2 border-b border-(--border-color)/50 pb-3 text-xs'>
        <div className='flex items-center gap-1.5'>
          <button
            type='button'
            onClick={() => {
              playClick();
              toggleFurigana();
            }}
            className={clsx(
              'rounded-xl px-3 py-1.5 font-semibold transition-all',
              showFurigana
                ? 'bg-(--main-color) text-(--background-color)'
                : 'border border-(--border-color) text-(--secondary-color)',
            )}
          >
            {showFurigana ? 'Furigana: Bật' : 'Furigana: Tắt'}
          </button>

          <button
            type='button'
            onClick={() => {
              playClick();
              toggleRomaji();
            }}
            className={clsx(
              'rounded-xl px-3 py-1.5 font-semibold transition-all',
              showRomaji
                ? 'bg-(--main-color) text-(--background-color)'
                : 'border border-(--border-color) text-(--secondary-color)',
            )}
          >
            {showRomaji ? 'Romaji: Bật' : 'Romaji: Tắt'}
          </button>

          <button
            type='button'
            onClick={() => {
              playClick();
              toggleVietnamese();
            }}
            className={clsx(
              'rounded-xl px-3 py-1.5 font-semibold transition-all',
              showVietnamese
                ? 'bg-(--main-color) text-(--background-color)'
                : 'border border-(--border-color) text-(--secondary-color)',
            )}
          >
            {showVietnamese ? 'Tiếng Việt: Bật' : 'Tiếng Việt: Tắt'}
          </button>
        </div>

        <div className='flex items-center gap-2'>
          <button
            type='button'
            onClick={onReplayDialogue}
            className='inline-flex items-center gap-1 text-(--secondary-color) hover:text-(--main-color)'
            title='Nghe lại đoạn video câu này'
          >
            <Volume2 className='size-4' />
            <span>Phát câu</span>
          </button>
        </div>
      </div>

      {/* Main Japanese Dialogue */}
      <div className='py-2 text-center'>
        <div className='text-2xl leading-relaxed font-extrabold tracking-wide text-(--main-color) sm:text-3xl sm:leading-loose'>
          {showFurigana && dialogue.furigana
            ? renderFurigana(dialogue.furigana)
            : dialogue.japanese}
        </div>

        {/* Romaji */}
        {showRomaji && dialogue.romaji && (
          <p className='mt-2 text-sm font-medium text-(--secondary-color)/80'>
            {dialogue.romaji}
          </p>
        )}

        {/* Vietnamese meaning */}
        {showVietnamese && (
          <p className='mx-auto mt-3 max-w-xl border-t border-(--border-color)/40 pt-3 text-base font-semibold text-(--secondary-color) sm:text-lg'>
            {dialogue.vietnamese}
          </p>
        )}
      </div>

      {/* Keywords Breakdown (Từ vựng quan trọng) */}
      {dialogue.keywords && dialogue.keywords.length > 0 && (
        <div className='rounded-2xl bg-(--background-color)/60 p-4'>
          <div className='mb-2.5 flex items-center gap-1.5 text-xs font-bold text-(--main-color)'>
            <Info className='size-3.5' />
            <span>Từ vựng & Mẫu câu trọng tâm:</span>
          </div>
          <div className='flex flex-wrap gap-2'>
            {dialogue.keywords.map((kw, idx) => (
              <div
                key={idx}
                className='inline-flex items-center gap-1.5 rounded-xl border border-(--border-color) bg-(--card-color) px-3 py-1.5 text-xs'
              >
                <span className='font-bold text-(--main-color)'>{kw.word}</span>
                {kw.reading && (
                  <span className='text-(--secondary-color)'>
                    [{kw.reading}]
                  </span>
                )}
                <span className='text-(--secondary-color)/80'>
                  : {kw.meaning}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
