'use client';
import { ReactNode, memo } from 'react';
import { useThemePreferences } from '@/features/Preferences';
import { parseFuriganaSegments } from '@/shared/utils/furigana';
import { cn } from '@/shared/utils/utils';

interface FuriganaTextProps {
  text: string;
  reading?: string;
  className?: string;
  furiganaClassName?: string;
  lang?: string;
  children?: ReactNode;
  alwaysShow?: boolean;
}

/**
 * Component for displaying Japanese text with accurate furigana alignment
 * Only renders ruby annotation over Kanji, leaving Kana/Okurigana untouched.
 */
const FuriganaText = ({
  text,
  reading,
  className = '',
  furiganaClassName = '',
  lang = 'ja',
  children,
  alwaysShow = false,
}: FuriganaTextProps) => {
  const { furiganaEnabled } = useThemePreferences();
  const showFurigana = alwaysShow || furiganaEnabled;

  // If children are provided, render them with optional furigana
  if (children) {
    if (showFurigana && reading) {
      return (
        <ruby className={className} lang={lang}>
          {children}
          <rt
            className={cn(
              'text-xs text-(--secondary-color)',
              furiganaClassName,
            )}
          >
            {reading}
          </rt>
        </ruby>
      );
    }
    return (
      <span className={className} lang={lang}>
        {children}
      </span>
    );
  }

  if (showFurigana && reading) {
    const segments = parseFuriganaSegments(text, reading);

    return (
      <span className={cn('inline-flex items-end', className)} lang={lang}>
        {segments.map((seg, idx) => {
          if (seg.furigana) {
            return (
              <ruby key={idx} className='inline-ruby'>
                {seg.text}
                <rt
                  className={cn(
                    'text-xs text-(--secondary-color)',
                    furiganaClassName,
                  )}
                >
                  {seg.furigana}
                </rt>
              </ruby>
            );
          }
          return <span key={idx}>{seg.text}</span>;
        })}
      </span>
    );
  }

  return (
    <span className={className} lang={lang}>
      {text}
    </span>
  );
};

export default memo(FuriganaText);
