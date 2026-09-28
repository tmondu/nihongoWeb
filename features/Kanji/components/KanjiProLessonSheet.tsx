'use client';

import React, { useState, useEffect, useRef } from 'react';
import type { KanjiProLesson, KanjiProWord } from '../data/kanjiProCurriculum';
import {
  Volume2,
  Check,
  ArrowLeft,
  BookOpen,
  Printer,
  CircleDot,
  PenTool,
  RotateCcw,
  Info,
} from 'lucide-react';
import clsx from 'clsx';
import KanjiStrokeView from './KanjiStrokeView';
import KanjiStrokeModal from './KanjiStrokeModal';

interface KanjiProLessonSheetProps {
  lesson: KanjiProLesson;
  onBackToLessons?: () => void;
}

export default function KanjiProLessonSheet({
  lesson,
  onBackToLessons,
}: KanjiProLessonSheetProps) {
  // Mastery status circle tracker (persisted in localStorage)
  const [completedMap, setCompletedMap] = useState<Record<string, boolean>>({});
  const [activeHighlightChar, setActiveHighlightChar] = useState<string | null>(
    null,
  );
  const [selectedStrokeIndex, setSelectedStrokeIndex] = useState<number | null>(
    null,
  );
  const [flippedCards, setFlippedCards] = useState<Record<string, boolean>>({});
  const [allFlipped, setAllFlipped] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const rowRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const toggleFlip = (kanjiChar: string) => {
    setFlippedCards(prev => ({
      ...prev,
      [kanjiChar]: !prev[kanjiChar],
    }));
  };

  const handleToggleFlipAll = () => {
    setAllFlipped(prev => {
      const next = !prev;
      const newFlipped: Record<string, boolean> = {};
      lesson.kanjiList.forEach(k => {
        newFlipped[k.kanjiChar] = next;
      });
      setFlippedCards(newFlipped);
      return next;
    });
  };

  // Check admin privileges
  useEffect(() => {
    let active = true;
    void (async () => {
      try {
        const res = await fetch('/api/auth/me');
        if (!active) return;
        if (res.ok) {
          const user = (await res.json()) as { is_admin?: number | boolean };
          if (active) {
            setIsAdmin(user.is_admin === 1 || user.is_admin === true);
          }
        }
      } catch {
        // Guest or unauthenticated
      }
    })();

    return () => {
      active = false;
    };
  }, []);

  // Load progress from localStorage
  useEffect(() => {
    let active = true;
    void (async () => {
      await Promise.resolve();
      if (!active) return;
      try {
        const stored = localStorage.getItem(`kanjipro_lesson_${lesson.id}`);
        if (active) {
          setCompletedMap(
            stored ? (JSON.parse(stored) as Record<string, boolean>) : {},
          );
        }
      } catch {
        // ignore
      }
    })();

    return () => {
      active = false;
    };
  }, [lesson.id]);

  const toggleComplete = (kanjiChar: string) => {
    setCompletedMap(prev => {
      const next = { ...prev, [kanjiChar]: !prev[kanjiChar] };
      try {
        localStorage.setItem(
          `kanjipro_lesson_${lesson.id}`,
          JSON.stringify(next),
        );
      } catch {
        // ignore
      }
      return next;
    });
  };

  const handlePlayAudio = (text: string) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    try {
      window.speechSynthesis.cancel();
      // Clean reading text if needed
      const cleanText = text.replace(/[（(].*?[）)]/g, '').replace(/～/g, '');
      const utterance = new SpeechSynthesisUtterance(cleanText || text);
      utterance.lang = 'ja-JP';
      utterance.rate = 0.9;
      window.speechSynthesis.speak(utterance);
    } catch {
      // Audio playback fallback
    }
  };

  const scrollToKanji = (kanjiChar: string) => {
    setActiveHighlightChar(kanjiChar);
    const targetEl = rowRefs.current[kanjiChar];
    if (targetEl) {
      targetEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
    setTimeout(() => {
      setActiveHighlightChar(null);
    }, 2500);
  };

  const handlePrint = () => {
    if (!isAdmin) return;
    if (typeof window !== 'undefined') {
      window.print();
    }
  };

  const completedCount = lesson.kanjiList.filter(
    k => completedMap[k.kanjiChar],
  ).length;

  return (
    <div className='mx-auto max-w-4xl space-y-6'>
      {/* Top Action Bar (Back, Stats, Print) */}
      <div className='flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-(--border-color) bg-(--card-color) p-3 shadow-sm print:hidden'>
        <div className='flex items-center gap-2'>
          {onBackToLessons && (
            <button
              type='button'
              onClick={onBackToLessons}
              className='flex items-center gap-1.5 rounded-xl border border-(--border-color) bg-(--background-color) px-3 py-1.5 text-xs font-bold text-(--main-color) transition-colors hover:bg-(--card-color)'
            >
              <ArrowLeft className='size-3.5' />
              <span>Danh sách bài</span>
            </button>
          )}
          <span className='text-xs font-semibold text-(--secondary-color)'>
            Cấp độ:{' '}
            <strong className='text-(--main-color) uppercase'>
              {lesson.level}
            </strong>{' '}
            / {lesson.title}
          </span>
        </div>

        <div className='flex items-center gap-2 sm:gap-3'>
          <button
            type='button'
            onClick={handleToggleFlipAll}
            className='flex cursor-pointer items-center gap-1.5 rounded-xl border border-sky-500/40 bg-sky-500/10 px-3 py-1.5 text-xs font-bold text-sky-600 transition-colors hover:bg-sky-500/20 dark:text-sky-400'
            title='Lật tất cả thẻ để xem nét vẽ / chữ mẫu'
          >
            <RotateCcw className='size-3.5' />
            <span className='max-sm:hidden'>
              {allFlipped ? 'Hiện chữ mẫu' : 'Lật xem nét vẽ'}
            </span>
            {/* <span className='sm:hidden'>
              {allFlipped ? 'Chữ mẫu' : 'Lật nét'}
            </span> */}
          </button>

          <button
            type='button'
            onClick={() => setSelectedStrokeIndex(0)}
            className='flex cursor-pointer items-center gap-1.5 rounded-xl border border-(--border-color) bg-(--background-color) px-3 py-1.5 text-xs font-bold text-(--secondary-color) transition-colors hover:text-(--main-color)'
            title='Luyện viết thứ tự từng nét cho toàn bộ chữ Hán trong bài'
          >
            <PenTool className='size-3.5' />
            <span className='max-sm:hidden'>Luyện viết nét</span>
            <span className='sm:hidden'>Tập viết</span>
          </button>

          <div className='flex items-center gap-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-400'>
            <Check className='size-4 stroke-[3]' />
            <span>
              Đã học: {completedCount}/{lesson.kanjiList.length} chữ
            </span>
          </div>

          {isAdmin && (
            <button
              type='button'
              onClick={handlePrint}
              className='flex items-center gap-1.5 rounded-xl border border-(--border-color) bg-(--background-color) px-3 py-1.5 text-xs font-bold text-(--secondary-color) transition-colors hover:text-(--main-color)'
              title='In bài học hoặc lưu PDF (Dành cho Admin)'
            >
              <Printer className='size-3.5' />
              <span className='max-sm:hidden'>In / Lưu PDF</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Printable / Textbook Style Container */}
      <div className='overflow-hidden rounded-3xl border border-(--border-color) bg-(--card-color) p-4 shadow-sm sm:p-7 print:border-none print:p-0 print:shadow-none'>
        {/* ================================================================= */}
        {/* HEADER: KANJI MASCOT BADGE & LESSON TAG (Chuẩn theo ảnh chụp)      */}
        {/* ================================================================= */}
        <div className='mb-6 flex flex-col items-center justify-center text-center'>
          {/* Cute Cloud Mascot Badge */}
          <div className='relative mb-2 inline-flex items-center'>
            <div className='relative flex items-center justify-center rounded-3xl border-4 border-slate-700 bg-amber-50/90 px-8 py-2.5 shadow-md dark:border-slate-400 dark:bg-amber-100/95'>
              {/* Cloud-like wavy lobes */}
              <div className='absolute -top-3 left-4 size-6 rounded-full border-t-4 border-slate-700 bg-amber-50 dark:border-slate-400 dark:bg-amber-100' />
              <div className='absolute -top-3.5 right-12 size-7 rounded-full border-t-4 border-slate-700 bg-amber-50 dark:border-slate-400 dark:bg-amber-100' />
              <div className='absolute -bottom-3 left-8 size-6 rounded-full border-b-4 border-slate-700 bg-amber-50 dark:border-slate-400 dark:bg-amber-100' />

              {/* Bold Red KANJI text */}
              <h1 className='font-sans text-4xl font-black tracking-wider text-rose-500 drop-shadow-[0_2px_0_rgba(180,30,60,0.8)] select-none sm:text-5xl'>
                KANJI
              </h1>

              {/* Cute Owl Mascot (Hand-crafted SVG illustration) */}
              <div className='ml-3 flex size-12 items-center justify-center sm:size-14'>
                <svg
                  viewBox='0 0 100 100'
                  className='size-full drop-shadow-sm'
                  fill='none'
                  xmlns='http://www.w3.org/2000/svg'
                >
                  {/* Owl body */}
                  <ellipse
                    cx='50'
                    cy='52'
                    rx='38'
                    ry='34'
                    fill='#f5d09b'
                    stroke='#2c3e50'
                    strokeWidth='4'
                  />
                  {/* Owl belly */}
                  <ellipse cx='50' cy='58' rx='24' ry='22' fill='#fff5e6' />
                  {/* Tuft ears */}
                  <path
                    d='M22 28 L15 12 L35 22 Z'
                    fill='#e67e22'
                    stroke='#2c3e50'
                    strokeWidth='4'
                    strokeLinejoin='round'
                  />
                  <path
                    d='M78 28 L85 12 L65 22 Z'
                    fill='#e67e22'
                    stroke='#2c3e50'
                    strokeWidth='4'
                    strokeLinejoin='round'
                  />
                  {/* Eyeglasses */}
                  <circle
                    cx='36'
                    cy='42'
                    r='14'
                    fill='#ffffff'
                    stroke='#2c3e50'
                    strokeWidth='4'
                  />
                  <circle
                    cx='64'
                    cy='42'
                    r='14'
                    fill='#ffffff'
                    stroke='#2c3e50'
                    strokeWidth='4'
                  />
                  <path
                    d='M50 42 L50 42'
                    stroke='#2c3e50'
                    strokeWidth='5'
                    strokeLinecap='round'
                  />
                  {/* Pupils */}
                  <circle cx='38' cy='43' r='5' fill='#2c3e50' />
                  <circle cx='36' cy='40' r='1.8' fill='#ffffff' />
                  <circle cx='62' cy='43' r='5' fill='#2c3e50' />
                  <circle cx='60' cy='40' r='1.8' fill='#ffffff' />
                  {/* Glasses bridge */}
                  <path
                    d='M48 42 C50 40 50 40 52 42'
                    stroke='#2c3e50'
                    strokeWidth='4'
                  />
                  {/* Beak */}
                  <polygon
                    points='50,47 44,56 56,56'
                    fill='#e67e22'
                    stroke='#2c3e50'
                    strokeWidth='2'
                  />
                  {/* Open Book held by owl */}
                  <path
                    d='M30 72 Q50 68 50 78 Q50 68 70 72 L72 88 Q50 82 50 90 Q50 82 28 88 Z'
                    fill='#e74c3c'
                    stroke='#2c3e50'
                    strokeWidth='3.5'
                  />
                  <path
                    d='M32 74 Q50 70 50 78 L50 88 Q50 80 30 86 Z'
                    fill='#fdfefe'
                  />
                  <path
                    d='M68 74 Q50 70 50 78 L50 88 Q50 80 70 86 Z'
                    fill='#fdfefe'
                  />
                </svg>
              </div>
            </div>
          </div>

          {/* Lesson pill tag: "Bài 24" */}
          <div className='inline-block rounded-xl border border-(--border-color) bg-(--background-color) px-7 py-1 shadow-xs'>
            <span className='font-sans text-base font-extrabold tracking-wide text-(--main-color) sm:text-lg'>
              {lesson.title}
            </span>
          </div>
        </div>

        {/* ================================================================= */}
        {/* DẢI 9 Ô VUÔNG KANJI ĐẦU BÀI (Top Kanji Strip)                      */}
        {/* [ 試 | 問 | 答 | 耳 | 用 | 験 | 集 | 研 | 台 ]                    */}
        {/* ================================================================= */}
        <div className='mb-6 overflow-hidden rounded-xl border border-(--border-color) bg-(--background-color)'>
          <div
            className='grid divide-x divide-(--border-color) text-center'
            style={{
              gridTemplateColumns: `repeat(${lesson.kanjiList.length}, minmax(0, 1fr))`,
            }}
          >
            {lesson.kanjiList.map((item, idx) => {
              const isDone = Boolean(completedMap[item.kanjiChar]);
              const isHighlighted = activeHighlightChar === item.kanjiChar;

              return (
                <button
                  key={item.id || idx}
                  type='button'
                  onClick={() => scrollToKanji(item.kanjiChar)}
                  className={clsx(
                    'group relative flex aspect-square flex-col items-center justify-center p-1 transition-all hover:bg-(--main-color)/10',
                    isHighlighted &&
                      'bg-amber-400/20 text-amber-600 dark:text-amber-400',
                    isDone && 'bg-emerald-500/10',
                  )}
                  title={`Bấm để chuyển tới chữ: ${item.kanjiChar} (${item.hanviet})`}
                >
                  <span className='font-japanese text-xl font-black text-(--main-color) transition-transform group-hover:scale-125 sm:text-3xl md:text-4xl'>
                    {item.kanjiChar}
                  </span>
                  {isDone && (
                    <span className='absolute top-1 right-1 size-1.5 rounded-full bg-emerald-500 sm:size-2' />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* ================================================================= */}
        {/* DANH SÁCH THẺ KANJI CHI TIẾT (Kanji Cards List)                   */}
        {/* ================================================================= */}
        <div className='space-y-6 sm:space-y-7 print:space-y-4'>
          {lesson.kanjiList.map((word: KanjiProWord, idx: number) => {
            const isChecked = Boolean(completedMap[word.kanjiChar]);
            const isHighlighted = activeHighlightChar === word.kanjiChar;
            const isFlipped = Boolean(flippedCards[word.kanjiChar]);

            return (
              <div
                key={word.id}
                data-print-card='true'
                ref={el => {
                  rowRefs.current[word.kanjiChar] = el;
                }}
                className={clsx(
                  'relative overflow-hidden rounded-3xl border border-(--border-color) bg-(--card-color) text-(--main-color) shadow-sm transition-all duration-300',
                  'print:page-break-inside-avoid print:mb-4 print:break-inside-avoid print:rounded-2xl print:border-slate-300 print:bg-white print:shadow-none',
                  isHighlighted && 'shadow-lg ring-4 ring-sky-500/60',
                )}
              >
                {/* 3-Column Layout: Left (Kanji & Meaning), Middle (Kun/On & Note), Right (Examples) */}
                <div className='grid grid-cols-1 md:grid-cols-12 print:grid-cols-12'>
                  {/* ===================================================== */}
                  {/* CỘT 1: ÂM HÁN VIỆT + CHỮ KANJI (LẬT 3D XEM NÉT VẼ) + PHÁT ÂM + NGHĨA VIỆT */}
                  {/* ===================================================== */}
                  <div className='relative flex flex-col items-center justify-between border-b border-(--border-color) bg-(--card-color) p-4 text-center md:col-span-3 md:border-r md:border-b-0 print:col-span-3 print:border-r print:border-b-0 print:border-slate-200 print:bg-white print:p-3'>
                    {/* Nút Info ở góc ngoài bên phải Cột 1 (CHỈ HIỆN KHI ĐANG XEM NÉT VẼ, ẨN KHI IN) */}
                    {isFlipped && (
                      <button
                        type='button'
                        onClick={e => {
                          e.stopPropagation();
                          setSelectedStrokeIndex(idx);
                        }}
                        className='absolute top-3 right-3 z-20 flex size-7 cursor-pointer items-center justify-center rounded-full border border-sky-500/30 bg-sky-500/15 text-sky-600 shadow-2xs backdrop-blur-xs transition-all hover:scale-115 hover:border-sky-500 hover:bg-sky-500 hover:text-white dark:bg-sky-500/25 dark:text-sky-300 print:hidden'
                        title='Xem thông tin chi tiết & tập viết nét'
                      >
                        <Info className='size-4' />
                      </button>
                    )}

                    {/* Âm Hán-Việt (In hoa, màu hồng san hô / rose) */}
                    <span className='font-sans text-sm font-black tracking-wider text-rose-500 uppercase sm:text-base dark:text-rose-400 print:text-sm print:text-rose-600'>
                      {word.hanviet}
                    </span>

                    {/* 3D Flashcard Flip Container (Screen view) */}
                    <div className='my-2 flex flex-col items-center print:hidden'>
                      <div className='relative h-32 w-32 [perspective:1000px] sm:h-36 sm:w-36'>
                        <div
                          className={clsx(
                            'relative h-full w-full transition-transform duration-500 [transform-style:preserve-3d]',
                            isFlipped && '[transform:rotateY(180deg)]',
                          )}
                        >
                          {/* FRONT FACE: Giao diện chữ Kanji lớn truyền thống */}
                          <div
                            onClick={() => toggleFlip(word.kanjiChar)}
                            role='button'
                            tabIndex={0}
                            title='Bấm vào chữ để lật xem nét vẽ'
                            className='group absolute inset-0 flex cursor-pointer items-center justify-center rounded-2xl border-2 border-dashed border-(--border-color)/70 bg-(--background-color)/50 p-2 shadow-2xs transition-all [backface-visibility:hidden] hover:border-emerald-500/60 hover:bg-(--background-color)'
                          >
                            <span className='font-japanese text-6xl font-black text-emerald-600 transition-transform select-none group-hover:scale-105 sm:text-7xl md:text-[4.75rem] dark:text-emerald-400'>
                              {word.kanjiChar}
                            </span>
                          </div>

                          {/* BACK FACE: Ô hoạt ảnh nét vẽ KanjiStrokeView (Bấm vào nét để lật lại) */}
                          <div className='absolute inset-0 flex [transform:rotateY(180deg)] flex-col items-center justify-center rounded-2xl border-2 border-(--border-color) bg-(--background-color) p-0.5 shadow-inner [backface-visibility:hidden]'>
                            <KanjiStrokeView
                              kanjiChar={word.kanjiChar}
                              size='card'
                              showControls={false}
                              onClick={() => toggleFlip(word.kanjiChar)}
                              isActive={isFlipped}
                            />
                          </div>
                        </div>
                      </div>

                      {/* Action buttons: Phát âm + Lật nét / Chữ mẫu (Nằm trên 1 hàng) */}
                      <div className='mt-2.5 flex flex-nowrap items-center justify-center gap-1.5 whitespace-nowrap'>
                        <button
                          type='button'
                          onClick={() => handlePlayAudio(word.kanjiChar)}
                          className='inline-flex shrink-0 cursor-pointer items-center gap-1 rounded-full border border-(--border-color) bg-(--background-color) px-2.5 py-1 text-xs font-semibold text-(--secondary-color) shadow-2xs transition-colors hover:border-(--main-color)/40 hover:text-(--main-color)'
                          title={`Nghe phát âm chữ ${word.kanjiChar}`}
                        >
                          <Volume2 className='size-3.5' />
                          <span>Phát âm</span>
                        </button>

                        <button
                          type='button'
                          onClick={() => toggleFlip(word.kanjiChar)}
                          className={clsx(
                            'inline-flex shrink-0 cursor-pointer items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-semibold shadow-2xs transition-all',
                            isFlipped
                              ? 'border-emerald-500/50 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                              : 'border-sky-500/40 bg-sky-500/10 text-sky-600 hover:bg-sky-500/20 dark:text-sky-400',
                          )}
                          title={
                            isFlipped
                              ? 'Lật về xem chữ mẫu'
                              : `Lật xem thứ tự nét vẽ chữ ${word.kanjiChar}`
                          }
                        >
                          <RotateCcw className='size-3.5' />
                          <span>{isFlipped ? 'Chữ mẫu' : 'Nét vẽ'}</span>
                        </button>
                      </div>
                    </div>

                    {/* Bản in (Print view) */}
                    <div className='my-1 hidden flex-col items-center print:flex'>
                      <span className='font-japanese text-5xl font-black text-emerald-700 select-none'>
                        {word.kanjiChar}
                      </span>
                    </div>

                    {/* Nghĩa tiếng Việt (Màu xanh dương) */}
                    <span className='font-sans text-sm font-bold text-sky-600 capitalize sm:text-base dark:text-sky-400 print:text-sm print:text-sky-700'>
                      {word.meaning}
                    </span>
                  </div>

                  {/* ===================================================== */}
                  {/* CỘT 2: ÂM KUN, ÂM ON & CỘT GHI CHÚ / NÉT NGHĨA        */}
                  {/* ===================================================== */}
                  <div className='flex flex-col justify-between border-b border-(--border-color) bg-(--card-color) md:col-span-4 md:border-r md:border-b-0 print:col-span-4 print:border-r print:border-b-0 print:border-slate-200 print:bg-white'>
                    {/* Phần trên: KUN & ON */}
                    <div className='flex flex-1 flex-col justify-center space-y-3 p-5 print:space-y-2 print:p-3'>
                      {/* Kun row */}
                      <div className='flex items-baseline gap-2'>
                        <span className='shrink-0 font-sans text-xs font-black tracking-wider text-(--main-color) uppercase sm:text-sm print:text-slate-800'>
                          KUN:
                        </span>
                        <span className='font-japanese text-xs font-bold text-amber-500 sm:text-sm dark:text-amber-400 print:text-amber-700'>
                          {word.kunyomi}
                        </span>
                      </div>

                      {/* Dashed divider */}
                      <div className='border-b border-dashed border-(--border-color) print:border-slate-200' />

                      {/* On row */}
                      <div className='flex items-baseline gap-2'>
                        <span className='shrink-0 font-sans text-xs font-black tracking-wider text-(--main-color) uppercase sm:text-sm print:text-slate-800'>
                          ON:
                        </span>
                        <span className='font-japanese text-xs font-bold text-amber-500 sm:text-sm dark:text-amber-400 print:text-amber-700'>
                          {word.onyomi}
                        </span>
                      </div>
                    </div>

                    {/* Phần dưới: Cột ghi chú & nét nghĩa nhớ chữ */}
                    <div className='flex min-h-[44px] items-center border-t border-dashed border-rose-500/30 bg-rose-500/10 px-4 py-3 sm:px-5 sm:py-3.5 print:min-h-0 print:border-rose-300 print:bg-rose-50 print:px-3 print:py-2'>
                      <span className='font-sans text-xs font-medium text-(--secondary-color) italic print:text-slate-600'>
                        {word.note || 'Cột ghi chú & nét nghĩa nhớ chữ'}
                      </span>
                    </div>
                  </div>

                  {/* ===================================================== */}
                  {/* CỘT 3: VÍ DỤ CÂU & TỪ VỰNG + NÚT HOÀN THÀNH          */}
                  {/* ===================================================== */}
                  <div className='flex flex-col justify-between bg-(--card-color) p-5 md:col-span-5 print:col-span-5 print:bg-white print:p-3'>
                    <div>
                      <div className='mb-3 flex items-center justify-between print:mb-2'>
                        <h4 className='font-sans text-xs font-black tracking-wider text-(--main-color) uppercase print:text-slate-800'>
                          VÍ DỤ CÂU & TỪ VỰNG:
                        </h4>

                        {/* Nút đánh dấu đã học (Góc trên bên phải) */}
                        <button
                          type='button'
                          onClick={() => toggleComplete(word.kanjiChar)}
                          className={clsx(
                            'flex size-6 cursor-pointer items-center justify-center rounded-full border transition-all sm:size-6.5',
                            'print:size-5 print:border-slate-400 print:bg-transparent',
                            isChecked
                              ? 'border-emerald-600 bg-emerald-500 text-white shadow-xs print:border-emerald-600 print:bg-emerald-600'
                              : 'border-(--border-color) bg-(--background-color) text-transparent hover:border-emerald-500 hover:bg-emerald-500/10',
                          )}
                          title={
                            isChecked
                              ? 'Đã thành thạo'
                              : 'Đánh dấu đã học chữ này'
                          }
                        >
                          <Check
                            className={clsx(
                              'size-3.5 stroke-[3] print:size-3',
                              isChecked ? 'opacity-100' : 'opacity-0',
                            )}
                          />
                        </button>
                      </div>

                      {/* Danh sách các ví dụ bo tròn */}
                      <div className='space-y-2.5 print:space-y-1.5'>
                        {word.examples.map((ex, exIdx) => {
                          return (
                            <div
                              key={exIdx}
                              className='group flex items-center justify-between gap-2.5 rounded-2xl border border-(--border-color) bg-(--background-color) p-2.5 px-3.5 shadow-2xs transition-all hover:border-emerald-500/50 print:rounded-xl print:border-slate-200 print:bg-slate-50/80 print:p-1.5 print:px-2.5'
                            >
                              <div className='flex flex-wrap items-baseline gap-1.5 text-xs sm:text-sm print:text-xs'>
                                <span className='font-sans font-bold text-(--secondary-color) print:text-slate-700'>
                                  {ex.num}
                                </span>
                                <span className='font-japanese font-bold text-sky-600 dark:text-sky-400 print:text-sky-800'>
                                  {ex.japanese}
                                </span>
                                <span className='font-sans font-medium text-(--main-color) print:text-slate-800'>
                                  : {ex.meaning}
                                </span>
                              </div>

                              {/* Nút tròn màu xanh lá (CircleDot) nghe âm thanh ví dụ (ẩn khi in) */}
                              <button
                                type='button'
                                onClick={() =>
                                  handlePlayAudio(
                                    `${ex.japanese} ${ex.meaning}`,
                                  )
                                }
                                className='flex size-6 shrink-0 cursor-pointer items-center justify-center rounded-full border border-emerald-500/60 bg-emerald-500/10 text-emerald-600 transition-all hover:scale-110 hover:border-emerald-500 hover:bg-emerald-500/20 dark:text-emerald-400 print:hidden'
                                title={`Nghe phát âm: ${ex.japanese}`}
                              >
                                <CircleDot className='size-3.5 stroke-[2.5]' />
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer info note */}
        <div className='mt-5 flex items-center justify-between text-[11px] text-(--secondary-color) sm:text-xs print:hidden'>
          <span className='flex items-center gap-1.5'>
            <BookOpen className='size-3.5' />
            Giáo trình Minna no Nihongo Kanji — {lesson.title} (
            {lesson.level.toUpperCase()})
          </span>
          <span>Bấm vòng tròn ◯ bên phải để đánh dấu hoàn thành</span>
        </div>
      </div>

      {/* Interactive Kanji Stroke Order & Handwriting Practice Modal */}
      {selectedStrokeIndex !== null &&
        lesson.kanjiList[selectedStrokeIndex] && (
          <KanjiStrokeModal
            isOpen={selectedStrokeIndex !== null}
            onClose={() => setSelectedStrokeIndex(null)}
            kanjiChar={lesson.kanjiList[selectedStrokeIndex].kanjiChar}
            hanviet={lesson.kanjiList[selectedStrokeIndex].hanviet}
            meaning={lesson.kanjiList[selectedStrokeIndex].meaning}
            onyomi={lesson.kanjiList[selectedStrokeIndex].onyomi}
            kunyomi={lesson.kanjiList[selectedStrokeIndex].kunyomi}
            currentIndex={selectedStrokeIndex}
            totalCount={lesson.kanjiList.length}
            lessonTitle={lesson.title}
            onPrev={
              selectedStrokeIndex > 0
                ? () =>
                    setSelectedStrokeIndex(i =>
                      i !== null && i > 0 ? i - 1 : i,
                    )
                : undefined
            }
            onNext={
              selectedStrokeIndex < lesson.kanjiList.length - 1
                ? () =>
                    setSelectedStrokeIndex(i =>
                      i !== null && i < lesson.kanjiList.length - 1 ? i + 1 : i,
                    )
                : undefined
            }
          />
        )}
    </div>
  );
}
