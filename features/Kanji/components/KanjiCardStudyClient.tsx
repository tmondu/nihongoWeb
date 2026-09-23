'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { KanjiLevel, IKanjiObj } from '@/entities/kanji';
import { kanjiDataService } from '@/features/Kanji/services/kanjiDataService';
import KanjiCardDetailView from './KanjiCardDetailView';
import hanvietMap from '@/shared/data/kanji_hanviet.json';
import {
  Search,
  ChevronLeft,
  ChevronRight,
  Loader2,
  ExternalLink,
  Layers,
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
  initialLevel = 'n5',
  initialCharacter,
}: KanjiCardStudyClientProps) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const openParam = searchParams.get('open');
  const levelParam = searchParams.get('level')?.toLowerCase() as
    | KanjiLevel
    | undefined;

  const validLevel: KanjiLevel =
    levelParam && ['n5', 'n4', 'n3', 'n2', 'n1'].includes(levelParam)
      ? levelParam
      : initialLevel;

  const [activeLevel, setActiveLevel] = useState<KanjiLevel>(validLevel);
  const [kanjiList, setKanjiList] = useState<IKanjiObj[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);

  // Sync if URL levelParam changes
  useEffect(() => {
    if (
      levelParam &&
      ['n5', 'n4', 'n3', 'n2', 'n1'].includes(levelParam) &&
      levelParam !== activeLevel
    ) {
      setActiveLevel(levelParam);
      setSelectedIndex(0);
    }
  }, [levelParam, activeLevel]);

  // Load kanji data for active level
  useEffect(() => {
    let active = true;

    void (async () => {
      await Promise.resolve();
      if (!active) return;
      setLoading(true);

      try {
        const data = await kanjiDataService.getKanjiByLevel(activeLevel, true);
        if (!active) return;
        setKanjiList(data);

        // Find initial index if initialCharacter or openParam provided
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
  }, [activeLevel, initialCharacter, openParam]);

  // Handle switching level
  const handleSelectLevel = (lvl: KanjiLevel) => {
    setActiveLevel(lvl);
    setSearchQuery('');
    setSelectedIndex(0);

    // Update query string smoothly without reload
    const params = new URLSearchParams(searchParams.toString());
    params.set('level', lvl);
    params.delete('open');
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  };

  // Filter list by search query
  const filteredList = useMemo(() => {
    if (!searchQuery.trim()) return kanjiList;
    const q = searchQuery.toLowerCase().trim();

    return kanjiList.filter(k => {
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
  }, [kanjiList, searchQuery]);

  // Selected Kanji object
  const selectedKanji = filteredList[selectedIndex] || filteredList[0] || null;

  // Keyboard navigation (ArrowLeft / ArrowRight)
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
    <div className='mx-auto max-w-5xl space-y-6 px-4 py-6 sm:px-6 sm:py-8'>
      {/* Top Banner / Header */}
      <div className='flex flex-col gap-5 rounded-3xl border border-(--border-color) bg-(--card-color)/90 p-5 shadow-sm backdrop-blur-sm sm:p-6'>
        <div className='flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
          <div className='flex items-center gap-3.5'>
            <div className='flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border-b-4 border-(--main-color-accent) bg-(--main-color) text-(--background-color) shadow-md'>
              <Layers className='h-6 w-6' />
            </div>
            <div>
              <div className='flex flex-wrap items-center gap-2'>
                <h1 className='text-xl font-black tracking-tight text-(--main-color) sm:text-2xl'>
                  Kanji Pro (Thẻ Học Kanji)
                </h1>
                <span className='rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-0.5 text-[11px] font-bold text-emerald-600 dark:text-emerald-400'>
                  JLPT N5 - N1
                </span>
              </div>
              <p className='mt-0.5 text-xs text-(--secondary-color) sm:text-sm'>
                Học Hán tự chuyên sâu dạng bảng 3 khối: Âm Hán-Việt ➔ Âm On/Kun
                ➔ Ví dụ Furigana.
              </p>
            </div>
          </div>

          {/* Link back to ThamKanji detail page */}
          {selectedKanji && (
            <Link
              href={`/kanji/thamkanji/${encodeURIComponent(selectedKanji.kanjiChar)}`}
              className='flex shrink-0 items-center justify-center gap-1.5 rounded-xl border border-(--border-color) bg-(--background-color) px-3.5 py-2 text-xs font-bold text-(--secondary-color) hover:text-(--main-color)'
            >
              <span>Xem trang Tham Kanji</span>
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

        {/* Search Bar & Sub info */}
        <div className='flex flex-wrap items-center justify-between gap-3 border-t border-(--border-color)/60 pt-3'>
          <div className='text-xs font-bold text-(--secondary-color)'>
            Đang xem cấp độ:{' '}
            <span className='font-black text-(--main-color)'>
              {activeLevel.toUpperCase()}
            </span>{' '}
            ({filteredList.length} chữ)
          </div>

          {/* Search Box */}
          <div className='relative min-w-[220px] flex-1 sm:max-w-xs'>
            <Search className='absolute top-2.5 left-3 size-3.5 text-(--secondary-color)' />
            <input
              type='text'
              placeholder='Tìm chữ Kanji, Hán-Việt, nghĩa...'
              value={searchQuery}
              onChange={e => {
                setSearchQuery(e.target.value);
                setSelectedIndex(0);
              }}
              className='w-full rounded-xl border border-(--border-color) bg-(--background-color) py-1.5 pr-3 pl-8 text-xs text-(--main-color) placeholder:text-(--secondary-color)/50 focus:border-(--main-color) focus:outline-none'
            />
          </div>
        </div>
      </div>

      {/* Main Flashcard Display */}
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
              title='Phím tắt: Mũi tên trái (←)'
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
              title='Phím tắt: Mũi tên phải (→)'
            >
              <span>Tiếp theo</span>
              <ChevronRight className='size-4' />
            </button>
          </div>

          {/* The New Card View Component */}
          <KanjiCardDetailView kanji={selectedKanji} />
        </div>
      ) : (
        <div className='rounded-3xl border border-dashed border-(--border-color) bg-(--card-color) p-12 text-center'>
          <p className='text-sm font-bold text-(--main-color)'>
            Không tìm thấy chữ Kanji phù hợp trong cấp{' '}
            {activeLevel.toUpperCase()}
          </p>
          <p className='mt-1 text-xs text-(--secondary-color)'>
            Thử thay đổi từ khóa tìm kiếm hoặc chọn cấp độ khác.
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
  );
}
