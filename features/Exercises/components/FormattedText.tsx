'use client';

import React from 'react';

interface FormattedTextProps {
  text: string;
  className?: string;
  highlightBlank?: string;
}

/**
 * Regex detecting Japanese characters:
 * Hiragana (\u3040-\u309f), Katakana (\u30a0-\u30ff), Kanji (\u4e00-\u9faf),
 * Japanese brackets / punctuation (「」『』【】・ー)
 */
const JAPANESE_CHAR_REGEX =
  /[\u3040-\u309f\u30a0-\u30ff\u4e00-\u9faf\u3400-\u4dbf\u3000-\u303f]/;

/**
 * Intelligently separates and renders text segments with proper font styling
 * so Vietnamese uses Be Vietnam Pro and Japanese uses Zen Maru Gothic / Noto Sans JP.
 */
function renderSegmentWithFont(str: string, keyPrefix: string) {
  if (!str) return null;

  // Split into tokens of Japanese sequences and non-Japanese sequences
  const segments = str.split(
    /([\u3040-\u309f\u30a0-\u30ff\u4e00-\u9faf\u3400-\u4dbf\u3000-\u303f]+)/g,
  );

  return segments.map((seg, sIdx) => {
    if (!seg) return null;
    const isJapanese = JAPANESE_CHAR_REGEX.test(seg);

    return (
      <span
        key={`${keyPrefix}-${sIdx}`}
        className={isJapanese ? 'font-japanese' : 'font-vietnamese'}
        lang={isJapanese ? 'ja' : 'vi'}
      >
        {seg}
      </span>
    );
  });
}

/**
 * Parses and renders Japanese question or passage text with underlines,
 * furigana tags, blanks like [ 18 ], [★], and HTML <u> tags safely.
 */
export const FormattedText: React.FC<FormattedTextProps> = ({
  text,
  className = '',
  highlightBlank,
}) => {
  if (!text) return null;

  // Split text by blanks [18], [ 18 ], [★], [ * ], 【18】, 【 18 】
  const parts = text.split(
    /(\[[^\]\n]*?(?:\d+|★|\*)[^\]\n]*?\]|【[^】\n]*?(?:\d+|★|\*)[^】\n]*?】)/g,
  );

  return (
    <span className={`font-mixed ${className}`}>
      {parts.map((part, index) => {
        const match = part.match(/\[\s*(\d+|★|\*)\s*\]|【\s*(\d+|★|\*)\s*】/);
        if (match) {
          const tagContent = (match[1] || match[2] || '').trim();
          const isActive =
            highlightBlank &&
            (highlightBlank === tagContent ||
              highlightBlank.includes(tagContent));

          return (
            <span
              key={index}
              className={`mx-1 my-0.5 inline-flex items-center justify-center rounded-lg px-2 py-0.5 text-xs font-bold transition-all select-none print:border print:border-neutral-700 print:bg-neutral-100 print:text-black ${
                isActive
                  ? 'scale-105 bg-(--main-color) font-black text-(--background-color) shadow-sm ring-2 ring-(--main-color)/40 print:bg-neutral-800 print:text-white'
                  : 'border border-(--main-color)/40 bg-(--main-color)/15 text-(--main-color)'
              }`}
            >
              [ {tagContent} ]
            </span>
          );
        }

        // Render underlines like <u>...</u> or __...__
        if (part.includes('<u>') || part.includes('</u>')) {
          const uParts = part.split(/(<\/?u>)/gi);
          let isUnderline = false;
          return (
            <span key={index}>
              {uParts.map((uSub, uIdx) => {
                if (uSub.toLowerCase() === '<u>') {
                  isUnderline = true;
                  return null;
                }
                if (uSub.toLowerCase() === '</u>') {
                  isUnderline = false;
                  return null;
                }
                if (isUnderline) {
                  return (
                    <span
                      key={uIdx}
                      className='border-b-2 border-current pb-0.5 font-bold tracking-wide'
                    >
                      {renderSegmentWithFont(uSub, `u-${index}-${uIdx}`)}
                    </span>
                  );
                }
                return renderSegmentWithFont(uSub, `p-${index}-${uIdx}`);
              })}
            </span>
          );
        }

        return renderSegmentWithFont(part, `part-${index}`);
      })}
    </span>
  );
};
