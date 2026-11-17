'use client';

import React from 'react';

interface FormattedTextProps {
  text: string;
  className?: string;
  highlightBlank?: string;
  /** Giao diện tờ đề giấy: chữ Nhật dùng Mincho, chữ Việt dùng serif; ô trống và gạch chân kiểu in. */
  paper?: boolean;
}

/**
 * Các khoảng ký tự được coi là chữ Nhật (dùng cho cả nhận diện lẫn tách đoạn):
 * - Hiragana ぀-ゟ, Katakana ゠-ヿ và ㇰ-ㇿ
 * - Kanji 一-龯, 㐀-䶿
 * - Dấu câu CJK 　-〿 (「」『』【】〜、。 và khoảng trắng toàn chiều rộng)
 * - Số khoanh tròn ①②③ ①-⓿
 * - Dạng full/half-width ＀-￯ (（）＿！？ và katakana nửa chiều rộng)
 * Hai nhóm sau trước đây bị coi là "tiếng Việt" nên rơi vào font Việt không có glyph.
 */
const JA_RANGES = '぀-ゟ゠-ヿㇰ-ㇿ㐀-䶿一-龯　-〿①-⓿＀-￯';

const JAPANESE_CHAR_REGEX = new RegExp(`[${JA_RANGES}]`);

// Một "đoạn Nhật" gồm các ký tự Nhật, kể cả khi bị ngăn bằng dấu cách thường
// (đề N5/N4 hay viết "まいあさ 新聞を よみます"), để không đổi font giữa các từ.
const JAPANESE_RUN_SPLIT = new RegExp(
  `([${JA_RANGES}]+(?:[ \\t]+[${JA_RANGES}]+)*)`,
  'g',
);

/**
 * Tách đoạn chữ Nhật và chữ Việt/Latin rồi gán font riêng cho từng đoạn.
 * - Mặc định: .font-japanese / .font-vietnamese (font người dùng chọn).
 * - paper: .paper-ja (Mincho) / .paper-vi (serif có dấu tiếng Việt), định nghĩa trong globals.css.
 */
function renderSegmentWithFont(str: string, keyPrefix: string, paper = false) {
  if (!str) return null;

  const segments = str.split(JAPANESE_RUN_SPLIT);

  return segments.map((seg, sIdx) => {
    if (!seg) return null;
    const isJapanese = JAPANESE_CHAR_REGEX.test(seg);

    let fontClass = isJapanese ? 'font-japanese' : 'font-vietnamese';
    if (paper) fontClass = isJapanese ? 'paper-ja' : 'paper-vi';

    return (
      <span
        key={`${keyPrefix}-${sIdx}`}
        className={fontClass}
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
  paper = false,
}) => {
  if (!text) return null;

  // Split text by blanks [18], [ 18 ], [★], [ * ], 【18】, 【 18 】
  const parts = text.split(
    /(\[[^\]\n]*?(?:\d+|★|\*)[^\]\n]*?\]|【[^】\n]*?(?:\d+|★|\*)[^】\n]*?】)/g,
  );

  return (
    <span className={`${paper ? '' : 'font-mixed'} ${className}`}>
      {parts.map((part, index) => {
        const match = part.match(/\[\s*(\d+|★|\*)\s*\]|【\s*(\d+|★|\*)\s*】/);
        if (match) {
          const tagContent = (match[1] || match[2] || '').trim();
          if (paper) {
            return (
              <span
                key={index}
                className='paper-vi mx-1 inline-block min-w-8 border border-current px-1.5 text-center text-[0.85em] leading-snug font-semibold'
              >
                {tagContent}
              </span>
            );
          }
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
                      className={
                        paper
                          ? 'underline decoration-1 underline-offset-4'
                          : 'border-b-2 border-current pb-0.5 font-bold tracking-wide'
                      }
                    >
                      {renderSegmentWithFont(uSub, `u-${index}-${uIdx}`, paper)}
                    </span>
                  );
                }
                return renderSegmentWithFont(uSub, `p-${index}-${uIdx}`, paper);
              })}
            </span>
          );
        }

        return renderSegmentWithFont(part, `part-${index}`, paper);
      })}
    </span>
  );
};
