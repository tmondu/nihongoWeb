'use client';

import React from 'react';

interface FuriganaTextProps {
  text: string;
  kana?: string;
  showFurigana?: boolean;
  className?: string;
}

/**
 * Renders Japanese text with Furigana support.
 * Supports bracket format: [漢字:かんじ]
 * If no brackets and kana is provided, optionally renders ruby or kana hint.
 */
export function FuriganaText({
  text,
  kana,
  showFurigana = true,
  className = '',
}: FuriganaTextProps) {
  // Check if text has [kanji:furigana] bracket format
  const hasBrackets = /\[(.*?):(.*?)]/.test(text);

  if (hasBrackets) {
    const parts: React.ReactNode[] = [];
    const regex = /\[(.*?):(.*?)]/g;
    let lastIndex = 0;
    let match: RegExpExecArray | null;

    while ((match = regex.exec(text)) !== null) {
      if (match.index > lastIndex) {
        parts.push(text.substring(lastIndex, match.index));
      }
      const [, kanji, furigana] = match;
      parts.push(
        <ruby key={`${kanji}-${match.index}`} className='px-0.5'>
          {kanji}
          {showFurigana && (
            <rt className='text-[10px] font-normal text-sky-600 select-none dark:text-sky-400'>
              {furigana}
            </rt>
          )}
        </ruby>,
      );
      lastIndex = regex.lastIndex;
    }

    if (lastIndex < text.length) {
      parts.push(text.substring(lastIndex));
    }

    return <span className={`font-japanese ${className}`}>{parts}</span>;
  }

  // If no bracket format, render standard text and optional kana
  return (
    <span className={`inline-flex flex-col ${className}`}>
      {showFurigana && kana && kana !== text && (
        <span className='font-japanese mb-0.5 text-[11px] leading-none font-normal text-sky-600 select-none dark:text-sky-400'>
          {kana}
        </span>
      )}
      <span className='font-japanese leading-relaxed'>{text}</span>
    </span>
  );
}
