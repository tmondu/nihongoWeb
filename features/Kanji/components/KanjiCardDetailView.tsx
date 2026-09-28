'use client';

import React, { useMemo, useState } from 'react';
import clsx from 'clsx';
import { Volume2, Check, RotateCcw, Info } from 'lucide-react';
import type { IKanjiObj, IKanjiExample } from '@/entities/kanji/types';
import FuriganaText from '@/shared/ui-composite/text/FuriganaText';
import hanvietMap from '@/shared/data/kanji_hanviet.json';
import KanjiStrokeView from './KanjiStrokeView';
import KanjiStrokeModal from './KanjiStrokeModal';

const hanVietDict = hanvietMap as Record<string, string>;

interface KanjiCardDetailViewProps {
  kanji: IKanjiObj;
  className?: string;
}

const CIRCLE_NUMBERS = ['①', '②', '③', '④', '⑤', '⑥', '⑦', '⑧', '⑨', '⑩'];

export default function KanjiCardDetailView({
  kanji,
  className,
}: KanjiCardDetailViewProps) {
  // Checkbox/status state for each example
  const [checkedExamples, setCheckedExamples] = useState<
    Record<number, boolean>
  >({});
  const [isStrokeModalOpen, setIsStrokeModalOpen] = useState(false);
  const [isFlipped, setIsFlipped] = useState(false);

  // Resolve Hán-Việt
  const hanViet = useMemo(() => {
    if (kanji.hanviet && kanji.hanviet.trim()) {
      return kanji.hanviet.trim().toUpperCase();
    }
    const fromMap = hanVietDict[kanji.kanjiChar];
    if (fromMap) {
      return fromMap.split(',')[0].trim().toUpperCase();
    }
    return '';
  }, [kanji]);

  // Clean Onyomi display
  const onyomiDisplay = useMemo(() => {
    if (!kanji.onyomi || kanji.onyomi.length === 0) return '';
    return kanji.onyomi
      .map(o => {
        const parts = o.trim().split(' ');
        return parts[1] || parts[0];
      })
      .filter(Boolean)
      .join(', ');
  }, [kanji.onyomi]);

  // Clean Kunyomi display
  const kunyomiDisplay = useMemo(() => {
    if (!kanji.kunyomi || kanji.kunyomi.length === 0) return '';
    return kanji.kunyomi
      .map(k => {
        const parts = k.trim().split(' ');
        return parts[1] || parts[0];
      })
      .filter(Boolean)
      .join(', ');
  }, [kanji.kunyomi]);

  // Primary meaning
  const primaryMeaning = useMemo(() => {
    if (!kanji.meanings || kanji.meanings.length === 0) return '';
    return kanji.meanings[0] || '';
  }, [kanji.meanings]);

  // Secondary meanings
  const secondaryMeanings = useMemo(() => {
    if (!kanji.meanings || kanji.meanings.length <= 1) return '';
    return kanji.meanings.slice(1).join(', ');
  }, [kanji.meanings]);

  // Examples list
  const examplesList: IKanjiExample[] = useMemo(() => {
    if (Array.isArray(kanji.examples) && kanji.examples.length > 0) {
      return kanji.examples;
    }
    return [];
  }, [kanji.examples]);

  const handlePlayAudio = (text: string) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'ja-JP';
      utterance.rate = 0.9;
      window.speechSynthesis.speak(utterance);
    } catch (e) {
      console.warn('Audio playback error:', e);
    }
  };

  const toggleCheck = (idx: number) => {
    setCheckedExamples(prev => ({ ...prev, [idx]: !prev[idx] }));
  };

  return (
    <>
      <div
        className={clsx(
          'w-full overflow-hidden rounded-3xl border-2 border-(--border-color) bg-(--card-color) shadow-lg transition-all',
          className,
        )}
      >
        <div className='grid grid-cols-1 md:grid-cols-12'>
          {/* ================================================================= */}
          {/* CỘT 1 (BÊN TRÁI): Âm Hán Việt + Chữ Kanji/Lật nét 3D + Nghĩa tiếng Việt */}
          {/* ================================================================= */}
          <div className='relative flex flex-col items-center justify-between border-b border-(--border-color) p-5 text-center md:col-span-3 md:border-r md:border-b-0'>
            {/* Nút Info ở góc ngoài bên phải Cột 1 (CHỈ HIỆN KHI ĐANG XEM NÉT VẼ, ẨN KHI IN) */}
            {isFlipped && (
              <button
                type='button'
                onClick={e => {
                  e.stopPropagation();
                  setIsStrokeModalOpen(true);
                }}
                className='absolute top-3 right-3 z-20 flex size-7 cursor-pointer items-center justify-center rounded-full border border-sky-500/30 bg-sky-500/15 text-sky-600 shadow-2xs backdrop-blur-xs transition-all hover:scale-115 hover:border-sky-500 hover:bg-sky-500 hover:text-white dark:bg-sky-500/20 dark:text-sky-300 print:hidden'
                title='Xem thông tin chi tiết & tập viết nét'
              >
                <Info className='size-4' />
              </button>
            )}

            {/* Âm Hán-Việt */}
            <div className='text-sm font-black tracking-widest text-rose-700 uppercase sm:text-base dark:text-rose-400'>
              {hanViet || <span className='opacity-40'>-</span>}
            </div>

            {/* 3D Flashcard Flip Container */}
            <div className='my-3 flex flex-col items-center justify-center'>
              <div className='relative h-32 w-32 [perspective:1000px] sm:h-36 sm:w-36'>
                <div
                  className={clsx(
                    'relative h-full w-full transition-transform duration-500 [transform-style:preserve-3d]',
                    isFlipped && '[transform:rotateY(180deg)]',
                  )}
                >
                  {/* FRONT FACE: Chữ Kanji lớn truyền thống */}
                  <div
                    onClick={() => setIsFlipped(true)}
                    role='button'
                    tabIndex={0}
                    title='Bấm vào chữ để lật xem nét vẽ'
                    className='group absolute inset-0 flex cursor-pointer items-center justify-center rounded-2xl border-2 border-dashed border-(--border-color)/70 bg-(--background-color)/50 p-2 shadow-2xs transition-all [backface-visibility:hidden] hover:border-emerald-500/60 hover:bg-(--background-color)'
                  >
                    <span className='font-japanese text-6xl font-black text-emerald-600 transition-transform select-none group-hover:scale-105 sm:text-7xl md:text-[4.75rem] dark:text-emerald-400'>
                      {kanji.kanjiChar}
                    </span>
                  </div>

                  {/* BACK FACE: Ô hoạt ảnh nét vẽ KanjiStrokeView (Bấm vào nét để lật lại) */}
                  <div className='absolute inset-0 flex [transform:rotateY(180deg)] flex-col items-center justify-center rounded-2xl border-2 border-(--border-color) bg-(--background-color) p-0.5 shadow-inner [backface-visibility:hidden]'>
                    <KanjiStrokeView
                      kanjiChar={kanji.kanjiChar}
                      size='card'
                      showControls={false}
                      onClick={() => setIsFlipped(false)}
                      isActive={isFlipped}
                    />
                  </div>
                </div>
              </div>

              {/* Action buttons: Phát âm + Lật nét/Chữ mẫu (Nằm trên 1 hàng) */}
              <div className='mt-2.5 flex flex-nowrap items-center justify-center gap-1.5 whitespace-nowrap'>
                <button
                  type='button'
                  onClick={() => handlePlayAudio(kanji.kanjiChar)}
                  className='inline-flex shrink-0 cursor-pointer items-center gap-1 rounded-full border border-(--border-color)/50 bg-(--background-color) px-2.5 py-1 text-xs text-(--secondary-color) transition-colors hover:text-(--main-color)'
                  title='Nghe phát âm'
                >
                  <Volume2 className='size-3.5' />
                  <span>Phát âm</span>
                </button>

                <button
                  type='button'
                  onClick={() => setIsFlipped(f => !f)}
                  className={clsx(
                    'inline-flex shrink-0 cursor-pointer items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-semibold shadow-2xs transition-all',
                    isFlipped
                      ? 'border-emerald-500/50 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                      : 'border-sky-500/40 bg-sky-500/10 text-sky-600 hover:bg-sky-500/20 dark:text-sky-400',
                  )}
                  title={
                    isFlipped
                      ? 'Lật về xem chữ mẫu'
                      : `Lật xem thứ tự nét vẽ chữ ${kanji.kanjiChar}`
                  }
                >
                  <RotateCcw className='size-3.5' />
                  <span>{isFlipped ? 'Chữ mẫu' : 'Nét vẽ'}</span>
                </button>
              </div>
            </div>

            {/* Nghĩa tiếng Việt */}
            <div className='text-xs font-bold text-(--main-color) capitalize sm:text-sm'>
              {primaryMeaning || (
                <span className='opacity-40'>(Chưa có nghĩa)</span>
              )}
            </div>
          </div>

          {/* ================================================================= */}
          {/* CỘT 2 (Ở GIỮA): Âm Kun & Âm On + Khung ghi chú                    */}
          {/* ================================================================= */}
          <div className='flex flex-col border-b border-(--border-color) md:col-span-4 md:border-r md:border-b-0'>
            {/* Kun Row */}
            <div className='flex items-baseline gap-2.5 border-b border-dashed border-(--border-color) p-4'>
              <span className='shrink-0 text-xs font-black tracking-wider text-(--secondary-color) uppercase sm:text-sm'>
                Kun:
              </span>
              <span className='font-japanese text-sm font-bold text-amber-700 sm:text-base dark:text-amber-400'>
                {kunyomiDisplay || (
                  <span className='text-xs font-normal text-(--secondary-color)/50 italic'>
                    (để trống)
                  </span>
                )}
              </span>
            </div>

            {/* On Row */}
            <div className='flex items-baseline gap-2.5 border-b border-dashed border-(--border-color) p-4'>
              <span className='shrink-0 text-xs font-black tracking-wider text-(--secondary-color) uppercase sm:text-sm'>
                On:
              </span>
              <span className='font-japanese text-sm font-bold text-amber-700 sm:text-base dark:text-amber-400'>
                {onyomiDisplay || (
                  <span className='text-xs font-normal text-(--secondary-color)/50 italic'>
                    (để trống)
                  </span>
                )}
              </span>
            </div>

            {/* Tinted Bottom Area (Ghi chú / Mở rộng nghĩa) */}
            <div className='flex flex-1 flex-col justify-end bg-rose-500/5 p-4'>
              {secondaryMeanings ? (
                <div className='text-xs leading-relaxed text-(--secondary-color)'>
                  <span className='font-bold text-(--main-color)'>
                    Nghĩa mở rộng:{' '}
                  </span>
                  {secondaryMeanings}
                </div>
              ) : (
                <div className='text-[11px] text-(--secondary-color)/60 italic'>
                  Cột ghi chú & nét nghĩa nhớ chữ
                </div>
              )}
            </div>
          </div>

          {/* ================================================================= */}
          {/* CỘT 3 (BÊN PHẢI): Danh sách ví dụ kèm Furigana & Checkbox         */}
          {/* ================================================================= */}
          <div className='flex flex-col justify-center p-5 md:col-span-5'>
            <div className='mb-2 text-[11px] font-bold tracking-wider text-(--secondary-color) uppercase'>
              Ví dụ câu & từ vựng:
            </div>

            {examplesList.length > 0 ? (
              <div className='space-y-3.5'>
                {examplesList.map((ex, idx) => {
                  const isChecked = Boolean(checkedExamples[idx]);
                  const numChar = CIRCLE_NUMBERS[idx] || `(${idx + 1})`;

                  return (
                    <div
                      key={idx}
                      className='group flex items-center justify-between gap-3 rounded-xl border border-(--border-color)/50 bg-(--background-color)/60 p-2.5 transition-colors hover:border-(--main-color)/40 hover:bg-(--background-color)'
                    >
                      <div className='flex flex-wrap items-baseline gap-1.5'>
                        <span className='text-xs font-black text-slate-500'>
                          {numChar}
                        </span>
                        <span className='font-japanese text-base font-bold text-(--main-color)'>
                          <FuriganaText
                            text={ex.japanese}
                            reading={ex.reading}
                          />
                        </span>
                        <span className='text-xs text-(--secondary-color)'>
                          : {ex.meaning}
                        </span>
                      </div>

                      <div className='flex shrink-0 items-center gap-1.5'>
                        <button
                          type='button'
                          onClick={() => handlePlayAudio(ex.japanese)}
                          className='rounded-md p-1 text-(--secondary-color) opacity-0 transition-opacity group-hover:opacity-100 hover:text-(--main-color)'
                          title='Nghe từ ví dụ'
                        >
                          <Volume2 className='size-3.5' />
                        </button>

                        {/* Status circle badge (Click to toggle learned) */}
                        <button
                          type='button'
                          onClick={() => toggleCheck(idx)}
                          className={clsx(
                            'flex size-5 cursor-pointer items-center justify-center rounded-full border-2 transition-all',
                            isChecked
                              ? 'border-emerald-500 bg-emerald-500 text-white shadow-xs'
                              : 'border-emerald-500/50 bg-emerald-500/10 hover:border-emerald-500',
                          )}
                          title={
                            isChecked ? 'Đã thuộc ví dụ' : 'Đánh dấu đã thuộc'
                          }
                        >
                          {isChecked ? (
                            <Check className='size-3 stroke-[3]' />
                          ) : (
                            <div className='size-1.5 rounded-full bg-emerald-500/40' />
                          )}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className='flex flex-col items-center justify-center rounded-2xl border border-dashed border-(--border-color) py-8 text-center'>
                <p className='text-xs text-(--secondary-color) italic'>
                  Chưa có ví dụ nào cho chữ Kanji này.
                </p>
                <p className='mt-1 text-[11px] text-(--secondary-color)/60'>
                  Liên hệ SS để đóng góp nha!
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Interactive Kanji Stroke Modal */}
      {isStrokeModalOpen && (
        <KanjiStrokeModal
          isOpen={isStrokeModalOpen}
          onClose={() => setIsStrokeModalOpen(false)}
          kanjiChar={kanji.kanjiChar}
          hanviet={hanViet}
          meaning={primaryMeaning}
          onyomi={onyomiDisplay}
          kunyomi={kunyomiDisplay}
        />
      )}
    </>
  );
}
