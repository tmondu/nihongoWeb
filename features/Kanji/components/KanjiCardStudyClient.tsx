'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { KanjiLevel, IKanjiObj } from '@/entities/kanji';
import { kanjiDataService } from '@/features/Kanji/services/kanjiDataService';
import KanjiCardDetailView from './KanjiCardDetailView';
import KanjiProLessonSheet from './KanjiProLessonSheet';
import KanjiProLessonList from './KanjiProLessonList';
import {
  getLessonDetail,
  getLessonsForLevel,
  type KanjiProLesson,
} from '../data/kanjiProCurriculum';
import hanvietMap from '@/shared/data/kanji_hanviet.json';
import {
  FileText,
  Search,
  ChevronLeft,
  ChevronRight,
  Loader2,
  ExternalLink,
  Layers,
  BookOpen,
  LayoutGrid,
  ArrowLeft,
  WalletCards,
} from 'lucide-react';
import clsx from 'clsx';
import Link from 'next/link';

const hanVietDict = hanvietMap as Record<string, string>;
const levels: { key: KanjiLevel; label: string; desc: string }[] = [
  { key: 'n5', label: 'N5', desc: 'Cơ bản' },
  { key: 'n4', label: 'N4', desc: 'Sơ cấp' },
  { key: 'n3', label: 'N3', desc: 'Trung cấp' },
  { key: 'n2', label: 'N2', desc: 'Thượng cấp' },
  { key: 'n1', label: 'N1', desc: 'Cao cấp' },
];

interface KanjiCardStudyClientProps {
  initialLevel?: KanjiLevel;
  initialCharacter?: string;
}

export default function KanjiCardStudyClient({
  initialLevel = 'n4',
  initialCharacter,
}: KanjiCardStudyClientProps) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const openParam = searchParams.get('open');
  const levelParam = searchParams.get('level')?.toLowerCase() as
    | KanjiLevel
    | undefined;
  const lessonParam = searchParams.get('lesson');

  const validLevel: KanjiLevel =
    levelParam && ['n5', 'n4', 'n3', 'n2', 'n1'].includes(levelParam)
      ? levelParam
      : initialLevel;

  const activeLevel: KanjiLevel = validLevel;

  // Derive selectedLessonNum directly from URL search params
  const selectedLessonNum: number | null = useMemo(() => {
    if (!lessonParam) return null;
    const parsed = parseInt(lessonParam, 10);
    return Number.isNaN(parsed) ? null : parsed;
  }, [lessonParam]);

  // Dynamic Lessons list for curriculum (fallback to static, updated from /api/kanji-pro)
  const [lessons, setLessons] = useState<KanjiProLesson[]>(() =>
    getLessonsForLevel(activeLevel),
  );

  useEffect(() => {
    let isMounted = true;
    setLessons(getLessonsForLevel(activeLevel));

    void (async () => {
      try {
        if (typeof window === 'undefined') return;
        const res = await fetch(`/api/kanji-pro?level=${activeLevel}`, {
          cache: 'no-store',
        });
        if (!res.ok) return;
        const data = await res.json();
        if (isMounted && data && Array.isArray(data.lessons)) {
          setLessons(data.lessons);
        }
      } catch {
        // Fallback to static in-memory data
      }
    })();

    return () => {
      isMounted = false;
    };
  }, [activeLevel]);

  // View mode: 'sheet' (Bảng sách giống ảnh) | 'flashcards' (Thẻ học)
  const [lessonViewMode, setLessonViewMode] = useState<'sheet' | 'flashcards'>(
    'sheet',
  );

  // Tab: 'curriculum' (Bài học theo bậc N) | 'all' (Tất cả Kanji tra cứu)
  const [activeTab, setActiveTab] = useState<'curriculum' | 'all'>(
    initialCharacter ? 'all' : 'curriculum',
  );

  // General Kanji list (for 'all' tab or flashcards)
  const [kanjiList, setKanjiList] = useState<IKanjiObj[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);

  // Current Lesson object (prefer dynamic DB lesson, fallback to static detail)
  const currentLesson: KanjiProLesson | null = useMemo(() => {
    if (selectedLessonNum === null) return null;
    const found = lessons.find(l => l.lessonNum === selectedLessonNum);
    if (found) return found;
    return getLessonDetail(activeLevel, selectedLessonNum);
  }, [activeLevel, selectedLessonNum, lessons]);

  // Convert current lesson's Kanji list to IKanjiObj format for Flashcard mode
  const lessonKanjiAsObjList: IKanjiObj[] = useMemo(() => {
    if (!currentLesson || currentLesson.kanjiList.length === 0) return [];
    return currentLesson.kanjiList.map((word, idx) => ({
      id: 2400 + idx,
      kanjiChar: word.kanjiChar,
      onyomi: [word.onyomi],
      kunyomi: [word.kunyomi],
      meanings: [word.meaning],
      hanviet: word.hanviet,
      examples: word.examples.map(ex => ({
        japanese: ex.japanese,
        reading: ex.reading,
        meaning: ex.meaning,
      })),
    }));
  }, [currentLesson]);

  // Load general kanji data when in 'all' tab or if initialCharacter is present
  useEffect(() => {
    if (activeTab !== 'all' && !initialCharacter) return;

    let active = true;

    void (async () => {
      await Promise.resolve();
      if (!active) return;
      setLoading(true);

      try {
        const data = await kanjiDataService.getKanjiByLevel(activeLevel, true);
        if (!active) return;
        setKanjiList(data);

        const target = initialCharacter || openParam;
        if (target) {
          const idx = data.findIndex(k => k.kanjiChar === target);
          setSelectedIndex(idx !== -1 ? idx : 0);
        } else {
          setSelectedIndex(0);
        }
      } catch (err) {
        console.error('Failed to load kanji for level', activeLevel, err);
      } finally {
        if (active) setLoading(false);
      }
    })();

    return () => {
      active = false;
    };
  }, [activeLevel, initialCharacter, openParam, activeTab]);

  // Update URL helper
  const updateUrl = useCallback(
    (lvl: KanjiLevel, lessonNum: number | null, replace: boolean = false) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set('level', lvl);
      if (lessonNum !== null) {
        params.set('lesson', lessonNum.toString());
      } else {
        params.delete('lesson');
      }
      params.delete('open');
      const targetUrl = `${pathname}?${params.toString()}`;
      if (replace) {
        router.replace(targetUrl, { scroll: false });
      } else {
        router.push(targetUrl, { scroll: false });
      }
    },
    [pathname, router, searchParams],
  );

  // Handle level change
  const handleSelectLevel = (lvl: KanjiLevel) => {
    setSearchQuery('');
    setSelectedIndex(0);
    updateUrl(lvl, null);
  };

  // Handle lesson click from list
  const handleSelectLesson = (lesson: KanjiProLesson) => {
    setSelectedIndex(0);
    updateUrl(activeLevel, lesson.lessonNum);
  };

  // Handle back to lessons
  const handleBackToLessons = () => {
    setSelectedIndex(0);
    updateUrl(activeLevel, null);
  };

  // Filter list by search query (for 'all' tab or flashcards)
  const currentList =
    activeTab === 'curriculum' &&
    currentLesson &&
    currentLesson.kanjiList.length > 0
      ? lessonKanjiAsObjList
      : kanjiList;

  const filteredList = useMemo(() => {
    if (!searchQuery.trim()) return currentList;
    const q = searchQuery.toLowerCase().trim();

    return currentList.filter(k => {
      const hv = (k.hanviet || hanVietDict[k.kanjiChar] || '').toLowerCase();
      const meanings = k.meanings.join(' ').toLowerCase();
      const on = (k.onyomi || []).join(' ').toLowerCase();
      const kun = (k.kunyomi || []).join(' ').toLowerCase();

      return (
        k.kanjiChar.includes(q) ||
        hv.includes(q) ||
        meanings.includes(q) ||
        on.includes(q) ||
        kun.includes(q)
      );
    });
  }, [currentList, searchQuery]);

  // Selected Kanji object
  const selectedKanji = filteredList[selectedIndex] || filteredList[0] || null;

  // Keyboard navigation
  const handlePrev = useCallback(() => {
    if (filteredList.length === 0) return;
    setSelectedIndex(prev => (prev > 0 ? prev - 1 : filteredList.length - 1));
  }, [filteredList.length]);

  const handleNext = useCallback(() => {
    if (filteredList.length === 0) return;
    setSelectedIndex(prev => (prev < filteredList.length - 1 ? prev + 1 : 0));
  }, [filteredList.length]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        document.activeElement?.tagName === 'INPUT' ||
        document.activeElement?.tagName === 'TEXTAREA'
      ) {
        return;
      }
      if (e.key === 'ArrowLeft') {
        handlePrev();
      } else if (e.key === 'ArrowRight') {
        handleNext();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handlePrev, handleNext]);

  return (
    <div className='mx-auto max-w-5xl space-y-6 px-4 py-6 sm:px-6 sm:py-8 print:max-w-none print:space-y-0 print:p-0'>
      {/* Top Banner / Header */}
      <div className='flex flex-col gap-5 rounded-3xl border border-(--border-color) bg-(--card-color)/90 p-5 shadow-sm backdrop-blur-sm sm:p-6 print:hidden'>
        <div className='flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
          <div className='flex items-center gap-3.5'>
            <div className='flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border-b-4 border-(--main-color-accent) bg-(--main-color) text-(--background-color) shadow-md'>
              <Layers className='h-6 w-6' />
            </div>
            <div>
              <div className='flex flex-wrap items-center gap-2'>
                <h1 className='text-xl font-black tracking-tight text-(--main-color) sm:text-2xl'>
                  Kanji Pro (Giáo Trình Hán Tự)
                </h1>
                <span className='rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-0.5 text-[11px] font-bold text-emerald-600 dark:text-emerald-400'>
                  JLPT N5 - N1
                </span>
              </div>
              <p className='mt-0.5 text-xs text-(--secondary-color) sm:text-sm'>
                Học Hán tự theo từng bài giáo trình Minna no Nihongo &amp; bảng
                tổng hợp chuẩn mực.
              </p>
            </div>
          </div>

          {/* Link back to ThamKanji detail page */}
          {selectedKanji && (
            <Link
              href={`/kanji/thamkanji/${encodeURIComponent(selectedKanji.kanjiChar)}`}
              className='flex shrink-0 items-center justify-center gap-1.5 rounded-xl border border-(--border-color) bg-(--background-color) px-3.5 py-2 text-xs font-bold text-(--secondary-color) hover:text-(--main-color)'
            >
              <span>Trang tra cứu</span>
              <ExternalLink className='size-3.5' />
            </Link>
          )}
        </div>

        {/* Level Tabs (N5 -> N1) */}
        <div className='grid grid-cols-5 gap-1.5 rounded-2xl border border-(--border-color) bg-(--background-color)/60 p-1 sm:gap-2 sm:p-1.5'>
          {levels.map(lvl => {
            const isActive = activeLevel === lvl.key;
            return (
              <button
                key={lvl.key}
                type='button'
                onClick={() => handleSelectLevel(lvl.key)}
                className={clsx(
                  'flex flex-col items-center justify-center rounded-xl px-1 py-2 transition-all',
                  isActive
                    ? 'border-b-2 border-emerald-600 bg-emerald-500/15 font-black text-emerald-600 shadow-sm dark:border-emerald-400 dark:text-emerald-400'
                    : 'font-bold text-(--secondary-color) hover:bg-(--card-color) hover:text-(--main-color)',
                )}
              >
                <span className='text-sm font-black sm:text-base'>
                  {lvl.label}
                </span>
                <span className='text-[10px] opacity-80 max-sm:hidden'>
                  {lvl.desc}
                </span>
              </button>
            );
          })}
        </div>

        {/* Tab switch: Bài học theo bậc N vs Toàn bộ danh mục */}
        <div className='flex flex-wrap items-center justify-between gap-3 border-t border-(--border-color)/60 pt-3'>
          <div className='flex items-center gap-2'>
            <button
              type='button'
              onClick={() => {
                setActiveTab('curriculum');
              }}
              className={clsx(
                'flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold transition-all',
                activeTab === 'curriculum'
                  ? 'bg-sky-500 text-white shadow-xs dark:bg-sky-600'
                  : 'bg-(--background-color) text-(--secondary-color) hover:text-(--main-color)',
              )}
            >
              <BookOpen className='size-3.5' />
              <span>Bài học theo bài ({activeLevel.toUpperCase()})</span>
            </button>

            <button
              type='button'
              onClick={() => {
                setActiveTab('all');
                updateUrl(activeLevel, null);
              }}
              className={clsx(
                'flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold transition-all',
                activeTab === 'all'
                  ? 'bg-sky-500 text-white shadow-xs dark:bg-sky-600'
                  : 'bg-(--background-color) text-(--secondary-color) hover:text-(--main-color)',
              )}
            >
              <LayoutGrid className='size-3.5' />
              <span>Tất cả chữ Hán</span>
            </button>
          </div>

          {/* Breadcrumb if inside lesson */}
          {selectedLessonNum !== null && activeTab === 'curriculum' && (
            <div className='flex items-center gap-2'>
              <button
                type='button'
                onClick={handleBackToLessons}
                className='flex items-center gap-1 text-xs font-bold text-sky-600 hover:underline dark:text-sky-400'
              >
                <ArrowLeft className='size-3' />
                <span>Chọn bài khác</span>
              </button>

              {/* View mode toggle: Bảng sách vs Thẻ Flashcard */}
              <div className='flex items-center rounded-lg border border-(--border-color) bg-(--background-color) p-0.5 text-xs'>
                <button
                  type='button'
                  onClick={() => setLessonViewMode('sheet')}
                  className={clsx(
                    'flex items-center gap-1 rounded-md px-2.5 py-1 font-bold transition-all',
                    lessonViewMode === 'sheet'
                      ? 'bg-sky-500 text-white shadow-xs dark:bg-sky-600'
                      : 'text-(--secondary-color) hover:text-(--main-color)',
                  )}
                >
                  <FileText className='size-3' />
                  <span>Bảng sách</span>
                </button>
                <button
                  type='button'
                  onClick={() => setLessonViewMode('flashcards')}
                  className={clsx(
                    'flex items-center gap-1 rounded-md px-2.5 py-1 font-bold transition-all',
                    lessonViewMode === 'flashcards'
                      ? 'bg-sky-500 text-white shadow-xs dark:bg-sky-600'
                      : 'text-(--secondary-color) hover:text-(--main-color)',
                  )}
                >
                  <WalletCards className='size-3' />
                  <span>Thẻ Flashcard</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* =================================================================== */}
      {/* CASE 1: CURRICULUM VIEW (BÀI HỌC THEO BẬC N)                        */}
      {/* =================================================================== */}
      {activeTab === 'curriculum' ? (
        selectedLessonNum === null ? (
          /* Sub-case 1A: Lesson list for the active level (e.g. N4) */
          <div className='rounded-3xl border border-(--border-color) bg-(--card-color) p-5 sm:p-7'>
            <KanjiProLessonList
              level={activeLevel}
              lessons={lessons}
              selectedLessonNum={selectedLessonNum}
              onSelectLesson={handleSelectLesson}
            />
          </div>
        ) : currentLesson && currentLesson.isAvailable ? (
          /* Sub-case 1B: Lesson with full content (e.g. Bài 24 of N4) */
          lessonViewMode === 'sheet' ? (
            /* Mode 1: Minna Sheet (100% faithful to textbook photo) */
            <KanjiProLessonSheet
              lesson={currentLesson}
              onBackToLessons={handleBackToLessons}
            />
          ) : (
            /* Mode 2: Flashcard Detail View for this lesson */
            <div className='space-y-4'>
              <div className='flex items-center justify-between rounded-2xl border border-(--border-color)/50 bg-(--card-color)/60 px-4 py-2 text-xs'>
                <button
                  type='button'
                  onClick={handlePrev}
                  className='flex items-center gap-1 rounded-lg px-2.5 py-1 font-bold text-(--secondary-color) hover:bg-(--background-color) hover:text-(--main-color)'
                  title='Phím tắt: Mũi tên trái (←)'
                >
                  <ChevronLeft className='size-4' />
                  <span>Chữ trước</span>
                </button>

                <span className='font-mono font-bold text-(--main-color)'>
                  Chữ {selectedIndex + 1} / {filteredList.length} (
                  {currentLesson.title} - {activeLevel.toUpperCase()})
                </span>

                <button
                  type='button'
                  onClick={handleNext}
                  className='flex items-center gap-1 rounded-lg px-2.5 py-1 font-bold text-(--secondary-color) hover:bg-(--background-color) hover:text-(--main-color)'
                  title='Phím tắt: Mũi tên phải (→)'
                >
                  <span>Tiếp theo</span>
                  <ChevronRight className='size-4' />
                </button>
              </div>

              {selectedKanji && <KanjiCardDetailView kanji={selectedKanji} />}

              {/* Quick Kanji Grid for this lesson */}
              <div className='rounded-3xl border border-(--border-color) bg-(--card-color) p-5'>
                <h3 className='mb-3 text-xs font-bold text-(--secondary-color) uppercase'>
                  9 chữ Hán trong {currentLesson.title}:
                </h3>
                <div className='grid grid-cols-3 gap-2 sm:grid-cols-5 md:grid-cols-9'>
                  {filteredList.map((k, idx) => {
                    const isSelected = idx === selectedIndex;
                    return (
                      <button
                        key={k.kanjiChar}
                        type='button'
                        onClick={() => setSelectedIndex(idx)}
                        className={clsx(
                          'flex flex-col items-center justify-center rounded-2xl border p-2.5 text-center transition-all',
                          isSelected
                            ? 'border-emerald-500 bg-emerald-500/10 text-emerald-600 shadow-sm ring-2 ring-emerald-500/30 dark:text-emerald-400'
                            : 'border-(--border-color) bg-(--background-color)/50 hover:border-(--main-color)/50',
                        )}
                      >
                        <span className='font-japanese text-2xl font-black text-(--main-color)'>
                          {k.kanjiChar}
                        </span>
                        <span className='mt-1 text-[11px] font-bold text-rose-600 uppercase dark:text-rose-400'>
                          {k.hanviet}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )
        ) : (
          /* Sub-case 1C: Lesson clicked without data yet */
          <div className='rounded-3xl border border-dashed border-(--border-color) bg-(--card-color) p-10 text-center'>
            <BookOpen className='mx-auto size-10 text-sky-500 opacity-70' />
            <h3 className='mt-3 text-base font-black text-(--main-color)'>
              {currentLesson ? currentLesson.title : `Bài ${selectedLessonNum}`}{' '}
              ({activeLevel.toUpperCase()})
            </h3>
            <p className='mt-1 text-xs text-(--secondary-color)'>
              Nội dung bài học này đang được chuẩn bị. Bạn có thể xem ngay{' '}
              <strong>Bài 24</strong> (N4) đã có sẵn đầy đủ 9 chữ Hán!
            </p>
            <div className='mt-5 flex justify-center gap-3'>
              <button
                type='button'
                onClick={() => {
                  updateUrl('n4', 24);
                }}
                className='rounded-xl bg-sky-500 px-4 py-2 text-xs font-bold text-white shadow-sm transition-all hover:bg-sky-600'
              >
                Học Bài 24 (N4) ngay
              </button>
              <button
                type='button'
                onClick={handleBackToLessons}
                className='rounded-xl border border-(--border-color) bg-(--background-color) px-4 py-2 text-xs font-bold text-(--main-color) hover:bg-(--card-color)'
              >
                Quay lại danh sách
              </button>
            </div>
          </div>
        )
      ) : (
        /* =================================================================== */
        /* CASE 2: ALL KANJI BROWSE TAB (TRA CỨU TOÀN BỘ CHỮ HÁN CỦA CẤP ĐỘ)   */
        /* =================================================================== */
        <div className='space-y-6'>
          {/* Search bar */}
          <div className='relative'>
            <Search className='absolute top-3 left-3 size-4 text-(--secondary-color)' />
            <input
              type='text'
              placeholder={`Tìm chữ Kanji, âm Hán-Việt, nghĩa trong cấp ${activeLevel.toUpperCase()}...`}
              value={searchQuery}
              onChange={e => {
                setSearchQuery(e.target.value);
                setSelectedIndex(0);
              }}
              className='w-full rounded-2xl border border-(--border-color) bg-(--card-color) py-2.5 pr-4 pl-9 text-xs text-(--main-color) placeholder:text-(--secondary-color)/50 focus:border-(--main-color) focus:outline-none'
            />
          </div>

          {loading ? (
            <div className='flex flex-col items-center justify-center rounded-3xl border border-(--border-color) bg-(--card-color) py-20 text-center'>
              <Loader2 className='size-8 animate-spin text-(--main-color)' />
              <p className='mt-3 text-xs text-(--secondary-color)'>
                Đang tải dữ liệu chữ Kanji cấp {activeLevel.toUpperCase()}...
              </p>
            </div>
          ) : selectedKanji ? (
            <div className='space-y-4'>
              {/* Navigation bar above card */}
              <div className='flex items-center justify-between rounded-2xl border border-(--border-color)/50 bg-(--card-color)/60 px-4 py-2 text-xs'>
                <button
                  type='button'
                  onClick={handlePrev}
                  className='flex items-center gap-1 rounded-lg px-2.5 py-1 font-bold text-(--secondary-color) hover:bg-(--background-color) hover:text-(--main-color)'
                >
                  <ChevronLeft className='size-4' />
                  <span>Chữ trước</span>
                </button>

                <span className='font-mono font-bold text-(--main-color)'>
                  {selectedIndex + 1} / {filteredList.length} chữ (
                  {activeLevel.toUpperCase()})
                </span>

                <button
                  type='button'
                  onClick={handleNext}
                  className='flex items-center gap-1 rounded-lg px-2.5 py-1 font-bold text-(--secondary-color) hover:bg-(--background-color) hover:text-(--main-color)'
                >
                  <span>Tiếp theo</span>
                  <ChevronRight className='size-4' />
                </button>
              </div>

              <KanjiCardDetailView kanji={selectedKanji} />
            </div>
          ) : (
            <div className='rounded-3xl border border-dashed border-(--border-color) bg-(--card-color) p-12 text-center'>
              <p className='text-sm font-bold text-(--main-color)'>
                Không tìm thấy chữ Kanji phù hợp trong cấp{' '}
                {activeLevel.toUpperCase()}
              </p>
            </div>
          )}

          {/* Quick Select Kanji Grid */}
          {!loading && filteredList.length > 0 && (
            <div className='rounded-3xl border border-(--border-color) bg-(--card-color) p-5 sm:p-6'>
              <div className='mb-3 flex items-center justify-between'>
                <h2 className='text-xs font-bold tracking-wider text-(--secondary-color) uppercase'>
                  Danh sách chữ Kanji {activeLevel.toUpperCase()} (
                  {filteredList.length} chữ):
                </h2>
                <span className='text-[11px] text-(--secondary-color)/60'>
                  Bấm vào chữ để xem thẻ chi tiết
                </span>
              </div>

              <div className='grid grid-cols-4 gap-2 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10'>
                {filteredList.map((k, idx) => {
                  const isSelected = idx === selectedIndex;
                  const hv = k.hanviet || hanVietDict[k.kanjiChar] || '';

                  return (
                    <button
                      key={k.id || k.kanjiChar}
                      type='button'
                      onClick={() => setSelectedIndex(idx)}
                      className={clsx(
                        'group flex flex-col items-center justify-center rounded-2xl border p-2.5 text-center transition-all',
                        isSelected
                          ? 'border-emerald-500 bg-emerald-500/10 text-emerald-600 shadow-sm ring-2 ring-emerald-500/30 dark:text-emerald-400'
                          : 'border-(--border-color) bg-(--background-color)/50 hover:border-(--main-color)/50 hover:bg-(--background-color)',
                      )}
                    >
                      <span className='font-japanese text-xl font-black text-(--main-color) transition-transform group-hover:scale-110'>
                        {k.kanjiChar}
                      </span>
                      {hv && (
                        <span className='mt-0.5 max-w-full truncate text-[10px] font-bold text-rose-600 uppercase dark:text-rose-400'>
                          {hv.split(',')[0]}
                        </span>
                      )}
                      <span className='max-w-full truncate text-[9px] text-(--secondary-color)'>
                        {k.meanings[0] || ''}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
