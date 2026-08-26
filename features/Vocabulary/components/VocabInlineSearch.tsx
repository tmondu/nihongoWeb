'use client';

import React, {
  useState,
  useEffect,
  useMemo,
  useRef,
  useCallback,
} from 'react';
import {
  Search,
  X,
  Volume2,
  Check,
  CheckCheck,
  Sparkles,
  BookOpen,
} from 'lucide-react';
import { toKana, toRomaji } from 'wanakana';
import clsx from 'clsx';
import { useClick } from '@/shared/hooks/generic/useAudio';
import { useJapaneseTTS } from '@/features/Preferences/hooks/useJapaneseTTS';
import {
  useAudioPreferences,
  useThemePreferences,
} from '@/features/Preferences';
import {
  vocabDataService,
  VocabLevel,
} from '@/features/Vocabulary/services/vocabDataService';
import useVocabStore, {
  IVocabObj,
} from '@/features/Vocabulary/store/useVocabStore';
import { parseFuriganaSegments } from '@/shared/utils/furigana';
import { cardBorderStyles, buttonBorderStyles } from '@/shared/utils/styles';

interface VocabSearchResultItem extends IVocabObj {
  level: VocabLevel;
}

interface IndexedVocabEntry {
  obj: IVocabObj;
  level: VocabLevel;
  wordLower: string;
  kanaReading: string;
  romajiReading: string;
  meaningsJoined: string;
}

// Module-level precomputed search index for 0ms lookup
let indexedVocabCache: IndexedVocabEntry[] | null = null;
let lastCacheStamp = 0;

function getIndexedVocab(): IndexedVocabEntry[] {
  const cached = vocabDataService.getAllCached();
  const keys = Object.keys(cached);
  if (keys.length === 0) return [];

  // Rebuild only if cache data changed or not yet built
  const currentStamp = Object.values(cached).reduce(
    (acc, arr) => acc + (arr?.length || 0),
    0,
  );
  if (indexedVocabCache && lastCacheStamp === currentStamp) {
    return indexedVocabCache;
  }

  const levels: VocabLevel[] = ['n5', 'n4', 'n3', 'n2', 'n1'];
  const list: IndexedVocabEntry[] = [];
  const seen = new Set<string>();

  for (const lvl of levels) {
    const words = cached[lvl] || [];
    for (let i = 0; i < words.length; i++) {
      const w = words[i];
      if (!w || !w.word || seen.has(`${w.word}-${lvl}`)) continue;
      seen.add(`${w.word}-${lvl}`);

      const rawReading =
        typeof w.reading === 'string' ? w.reading.toLowerCase() : '';
      const baseReading = rawReading.split(' ')[1] || rawReading;
      const romaji = toRomaji(baseReading).toLowerCase();
      const meanings = Array.isArray(w.meanings)
        ? w.meanings.join(' ').toLowerCase()
        : '';

      list.push({
        obj: w,
        level: lvl,
        wordLower: w.word.toLowerCase(),
        kanaReading: rawReading,
        romajiReading: romaji,
        meaningsJoined: meanings,
      });
    }
  }

  indexedVocabCache = list;
  lastCacheStamp = currentStamp;
  return list;
}

const levelBadgeStyles: Record<
  VocabLevel,
  { bg: string; text: string; border: string }
> = {
  n5: {
    bg: 'bg-emerald-500/10',
    text: 'text-emerald-500 dark:text-emerald-400',
    border: 'border-emerald-500/30',
  },
  n4: {
    bg: 'bg-sky-500/10',
    text: 'text-sky-500 dark:text-sky-400',
    border: 'border-sky-500/30',
  },
  n3: {
    bg: 'bg-amber-500/10',
    text: 'text-amber-500 dark:text-amber-400',
    border: 'border-amber-500/30',
  },
  n2: {
    bg: 'bg-purple-500/10',
    text: 'text-purple-500 dark:text-purple-400',
    border: 'border-purple-500/30',
  },
  n1: {
    bg: 'bg-rose-500/10',
    text: 'text-rose-500 dark:text-rose-400',
    border: 'border-rose-500/30',
  },
};

const PAGE_SIZE = 36;

export default function VocabInlineSearch() {
  const inputRef = useRef<HTMLInputElement>(null);
  const { playClick } = useClick();
  const { displayKana: showKana } = useThemePreferences();
  const { pronunciationEnabled, pronunciationSpeed, pronunciationPitch } =
    useAudioPreferences();
  const { speak, stop, isPlaying, refreshVoices } = useJapaneseTTS();

  const storeSearchQuery = useVocabStore(state => state.searchQuery);
  const setSearchQuery = useVocabStore(state => state.setSearchQuery);
  const searchLevelFilter = useVocabStore(state => state.searchLevelFilter);
  const setSearchLevelFilter = useVocabStore(
    state => state.setSearchLevelFilter,
  );
  const setActiveDetailWord = useVocabStore(state => state.setActiveDetailWord);

  const selectedVocabObjs = useVocabStore(state => state.selectedVocabObjs);
  const addVocabObj = useVocabStore(state => state.addVocabObj);
  const addVocabObjs = useVocabStore(state => state.addVocabObjs);

  const [activePronunciationText, setActivePronunciationText] = useState<
    string | null
  >(null);

  // Local state for instantaneous 0ms input typing
  const [localInput, setLocalInput] = useState(storeSearchQuery);
  const [displayCount, setDisplayCount] = useState(PAGE_SIZE);

  // Preload all vocab on mount for instantaneous search
  useEffect(() => {
    void vocabDataService.preloadAll().catch(console.error);
  }, []);

  // Debounced sync to global store so typing remains 120fps fluid
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchQuery(localInput);
    }, 100);
    return () => clearTimeout(timer);
  }, [localInput, setSearchQuery]);

  const handleInputChange = (val: string) => {
    setLocalInput(val);
    setDisplayCount(PAGE_SIZE);
  };

  const handleClearInput = () => {
    setLocalInput('');
    setSearchQuery('');
    setDisplayCount(PAGE_SIZE);
    inputRef.current?.focus();
  };

  const handleFilterClick = (lvlId: string) => {
    playClick();
    setSearchLevelFilter(lvlId);
    setDisplayCount(PAGE_SIZE);
  };

  // Keyboard shortcut (press '/' or Ctrl+K / Cmd+K to focus search)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable
      ) {
        if (e.key === 'Escape' && target === inputRef.current) {
          setLocalInput('');
          setSearchQuery('');
          inputRef.current?.blur();
        }
        return;
      }

      if (
        e.key === '/' ||
        ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k')
      ) {
        e.preventDefault();
        inputRef.current?.focus();
        inputRef.current?.select();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [setSearchQuery]);

  const handlePronounce = useCallback(
    async (reading: string, e?: React.MouseEvent) => {
      e?.stopPropagation();
      const normalizedReading = reading.trim();
      if (!pronunciationEnabled || !normalizedReading) return;

      if (isPlaying && activePronunciationText === normalizedReading) {
        stop();
        setActivePronunciationText(null);
        return;
      }

      setActivePronunciationText(normalizedReading);

      if (typeof window !== 'undefined') {
        refreshVoices();
        const isFirefox = /Firefox/i.test(navigator.userAgent);
        const delay = isFirefox ? 300 : 100;
        await new Promise(resolve => setTimeout(resolve, delay));
      }

      await speak(normalizedReading, {
        rate: pronunciationSpeed,
        pitch: pronunciationPitch,
        volume: 0.8,
      });

      setActivePronunciationText(current =>
        current === normalizedReading ? null : current,
      );
    },
    [
      activePronunciationText,
      isPlaying,
      pronunciationEnabled,
      pronunciationPitch,
      pronunciationSpeed,
      refreshVoices,
      speak,
      stop,
    ],
  );

  // Ultra-fast search logic using pre-indexed lookup (0ms)
  const searchResults = useMemo(() => {
    const q = storeSearchQuery.trim().toLowerCase();
    if (!q) return [];

    const kanaQ = toKana(q).toLowerCase();
    const index = getIndexedVocab();
    const results: VocabSearchResultItem[] = [];

    for (let i = 0; i < index.length; i++) {
      const item = index[i];
      if (searchLevelFilter !== 'all' && searchLevelFilter !== item.level) {
        continue;
      }

      const matchKanji =
        item.wordLower.includes(q) || item.wordLower.includes(kanaQ);
      const matchKana =
        item.kanaReading.includes(q) || item.kanaReading.includes(kanaQ);
      const matchRomaji = item.romajiReading.includes(q);
      const matchMeaning = item.meaningsJoined.includes(q);

      if (matchKanji || matchKana || matchRomaji || matchMeaning) {
        results.push({
          ...item.obj,
          level: item.level,
        });
      }
    }

    return results;
  }, [storeSearchQuery, searchLevelFilter]);

  const displayedResults = useMemo(() => {
    return searchResults.slice(0, displayCount);
  }, [searchResults, displayCount]);

  const levels: { id: string; label: string }[] = [
    { id: 'all', label: 'Tất cả' },
    { id: 'n5', label: 'N5' },
    { id: 'n4', label: 'N4' },
    { id: 'n3', label: 'N3' },
    { id: 'n2', label: 'N2' },
    { id: 'n1', label: 'N1' },
  ];

  const isSearching =
    storeSearchQuery.trim().length > 0 || localInput.trim().length > 0;

  const handleSelectAllResults = () => {
    playClick();
    if (searchResults.length === 0) return;
    addVocabObjs(searchResults);
  };

  const isAllResultsSelected =
    searchResults.length > 0 &&
    searchResults.every(r =>
      selectedVocabObjs.some(selected => selected.word === r.word),
    );

  return (
    <div className='w-full space-y-4'>
      {/* Search Input Bar */}
      <div className='relative flex flex-col gap-3 sm:flex-row sm:items-center'>
        <div className='relative flex-1'>
          <Search className='absolute top-3.5 left-4 size-4.5 text-(--secondary-color)/60' />
          <input
            ref={inputRef}
            type='text'
            value={localInput}
            onChange={e => handleInputChange(e.target.value)}
            placeholder='Tìm từ vựng theo chữ Hán, Hiragana, Romaji hoặc nghĩa tiếng Việt...'
            className={clsx(
              'w-full rounded-2xl border py-3 pr-20 pl-11 text-sm font-medium transition-all select-none',
              'border-(--border-color) bg-(--card-color) text-(--main-color) placeholder:text-(--secondary-color)/40',
              'focus:border-(--main-color) focus:ring-2 focus:ring-(--main-color)/20 focus:outline-none',
              'shadow-xs',
            )}
          />
          {localInput ? (
            <button
              type='button'
              onClick={handleClearInput}
              aria-label='Xóa tìm kiếm'
              className='absolute top-2.5 right-3 flex size-7 items-center justify-center rounded-xl bg-(--secondary-color)/10 text-(--secondary-color) transition-colors hover:bg-(--secondary-color)/20 hover:text-(--main-color)'
            >
              <X className='size-4' />
            </button>
          ) : (
            <div className='pointer-events-none absolute top-3 right-3 hidden items-center gap-1 rounded-md border border-(--border-color) bg-(--background-color)/80 px-1.5 py-0.5 text-[10px] font-semibold text-(--secondary-color)/60 sm:flex'>
              <span>/</span>
            </div>
          )}
        </div>

        {/* Level Filters */}
        <div className='flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0'>
          {levels.map(lvl => {
            const isSelected = searchLevelFilter === lvl.id;
            return (
              <button
                key={lvl.id}
                type='button'
                onClick={() => handleFilterClick(lvl.id)}
                className={clsx(
                  'shrink-0 rounded-xl px-3 py-2 text-xs font-bold transition-all select-none',
                  isSelected
                    ? 'bg-(--main-color) text-(--background-color) shadow-xs'
                    : 'border border-(--border-color) bg-(--card-color) text-(--secondary-color) hover:border-(--main-color)/40 hover:text-(--main-color)',
                )}
              >
                {lvl.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Search Results View */}
      {isSearching && (
        <div className='animate-in fade-in-50 space-y-4 pt-1 duration-200'>
          {/* Results Header */}
          <div className='flex flex-wrap items-center justify-between gap-2 border-b border-(--border-color)/50 pb-3'>
            <div className='flex items-center gap-2'>
              <Sparkles className='size-4 text-(--main-color)' />
              <span className='text-sm font-bold text-(--main-color)'>
                Kết quả tìm kiếm ({searchResults.length})
              </span>
              {searchLevelFilter !== 'all' && (
                <span className='rounded-md bg-(--secondary-color)/10 px-2 py-0.5 text-xs font-semibold text-(--secondary-color)'>
                  Cấp độ {searchLevelFilter.toUpperCase()}
                </span>
              )}
            </div>

            {searchResults.length > 0 && (
              <button
                type='button'
                onClick={handleSelectAllResults}
                className={clsx(
                  'inline-flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-bold transition-all',
                  buttonBorderStyles,
                  isAllResultsSelected
                    ? 'border-(--main-color) bg-(--main-color) text-(--background-color)'
                    : 'border-(--border-color) bg-(--card-color) text-(--secondary-color) hover:text-(--main-color)',
                )}
              >
                {isAllResultsSelected ? (
                  <>
                    <CheckCheck className='size-3.5' />
                    Đã chọn tất cả
                  </>
                ) : (
                  <>
                    <Check className='size-3.5' />
                    Chọn tất cả ({searchResults.length})
                  </>
                )}
              </button>
            )}
          </div>

          {/* Results Grid */}
          {searchResults.length > 0 ? (
            <>
              <div className='grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3'>
                {displayedResults.map((wordObj, i) => {
                  const isSelected = selectedVocabObjs.some(
                    selected => selected.word === wordObj.word,
                  );
                  const rawReading =
                    typeof wordObj.reading === 'string' ? wordObj.reading : '';
                  const baseReading = rawReading.split(' ')[1] || rawReading;
                  const displayReading = showKana
                    ? toKana(baseReading)
                    : toRomaji(baseReading);
                  const segments = parseFuriganaSegments(
                    wordObj.word,
                    wordObj.reading,
                  );
                  const badge = levelBadgeStyles[wordObj.level];

                  return (
                    <div
                      key={`${wordObj.word}-${wordObj.level}-${i}`}
                      onClick={() => {
                        playClick();
                        addVocabObj(wordObj);
                      }}
                      className={clsx(
                        'group relative flex cursor-pointer flex-col justify-between gap-3 rounded-2xl border p-4 transition-all duration-150 select-none',
                        isSelected
                          ? 'border-(--main-color) bg-(--main-color)/10 shadow-md ring-1 ring-(--main-color)'
                          : 'border-(--border-color) bg-(--card-color) hover:border-(--main-color)/50 hover:shadow-xs',
                        cardBorderStyles,
                      )}
                    >
                      {/* Top Row: Word with Furigana + Level Badge & Selection */}
                      <div className='flex items-start justify-between gap-2'>
                        <div className='flex flex-col items-start'>
                          {/* Word + Furigana */}
                          <div className='flex items-end text-3xl font-black text-(--main-color) transition-transform group-hover:scale-[1.02]'>
                            {segments.map((seg, idx) => (
                              <ruby key={idx} className='leading-none'>
                                {seg.text}
                                {seg.furigana && (
                                  <rt className='text-xs font-semibold text-(--secondary-color) opacity-80'>
                                    {seg.furigana}
                                  </rt>
                                )}
                              </ruby>
                            ))}
                          </div>

                          {/* Reading */}
                          <span className='mt-1 text-sm font-medium text-(--secondary-color)'>
                            {displayReading}
                          </span>
                        </div>

                        {/* Right actions: JLPT Level + Checkbox */}
                        <div className='flex items-center gap-2'>
                          <span
                            className={clsx(
                              'rounded-lg border px-2 py-0.5 text-[11px] font-black uppercase',
                              badge.bg,
                              badge.text,
                              badge.border,
                            )}
                          >
                            {wordObj.level}
                          </span>
                          <div
                            className={clsx(
                              'flex size-5.5 items-center justify-center rounded-lg border transition-all',
                              isSelected
                                ? 'border-(--main-color) bg-(--main-color) text-(--background-color)'
                                : 'border-(--border-color) bg-(--background-color)/50 text-transparent group-hover:border-(--main-color)/40',
                            )}
                          >
                            <Check className='size-3.5 stroke-[3]' />
                          </div>
                        </div>
                      </div>

                      {/* Middle: Meanings */}
                      <div className='flex flex-wrap gap-1 pt-1'>
                        {wordObj.meanings?.slice(0, 3).map((mean, mIdx) => (
                          <span
                            key={mIdx}
                            className='rounded-md bg-(--background-color)/60 px-2 py-0.5 text-xs text-(--main-color)/90'
                          >
                            {mean}
                          </span>
                        ))}
                        {(wordObj.meanings?.length ?? 0) > 3 && (
                          <span className='rounded-md bg-(--background-color)/40 px-1.5 py-0.5 text-xs text-(--secondary-color)'>
                            +{(wordObj.meanings?.length ?? 0) - 3}
                          </span>
                        )}
                      </div>

                      {/* Bottom: Quick Pronounce & ThamTuVung Details */}
                      <div
                        className='flex items-center justify-between border-t border-(--border-color)/40 pt-2 text-xs text-(--secondary-color)'
                        onClick={e => e.stopPropagation()}
                      >
                        <button
                          type='button'
                          onClick={e => handlePronounce(wordObj.reading, e)}
                          className='inline-flex items-center gap-1 rounded-lg px-2 py-1 transition-colors hover:bg-(--secondary-color)/10 hover:text-(--main-color)'
                        >
                          <Volume2
                            className={clsx(
                              'size-3.5',
                              activePronunciationText ===
                                wordObj.reading.trim() &&
                                'animate-pulse text-emerald-500',
                            )}
                          />
                          <span>Phát âm</span>
                        </button>

                        <button
                          type='button'
                          onClick={() => {
                            playClick();
                            setActiveDetailWord(wordObj);
                          }}
                          className='inline-flex items-center gap-1 rounded-lg px-2 py-1 font-bold text-(--main-color) transition-colors hover:bg-(--main-color)/10'
                        >
                          <BookOpen className='size-3.5 text-(--main-color)' />
                          <span>ThamTuVung</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Load More Button */}
              {searchResults.length > displayCount && (
                <div className='flex justify-center pt-2 pb-4'>
                  <button
                    type='button'
                    onClick={() => setDisplayCount(prev => prev + PAGE_SIZE)}
                    className={clsx(
                      'rounded-2xl border px-6 py-2.5 text-xs font-bold transition-all',
                      'border-(--border-color) bg-(--card-color) text-(--main-color)',
                      'shadow-xs hover:border-(--main-color) hover:bg-(--main-color)/10 active:scale-95',
                    )}
                  >
                    Xem thêm{' '}
                    {Math.min(PAGE_SIZE, searchResults.length - displayCount)}{' '}
                    kết quả (còn {searchResults.length - displayCount} từ)
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className='flex flex-col items-center justify-center rounded-3xl border border-dashed border-(--border-color) bg-(--card-color)/30 py-16 text-center'>
              <BookOpen className='size-10 text-(--secondary-color)/40' />
              <p className='mt-3 text-base font-bold text-(--main-color)'>
                Không tìm thấy từ vựng khớp với &quot;{storeSearchQuery}&quot;
              </p>
              <p className='mt-1 max-w-md text-xs text-(--secondary-color)'>
                Thử tìm kiếm bằng chữ Hán, Hiragana (ví dụ: がっこう), Romaji
                (ví dụ: gakkou) hoặc nghĩa tiếng Việt (ví dụ: trường học).
              </p>
              {searchLevelFilter !== 'all' && (
                <button
                  type='button'
                  onClick={() => handleFilterClick('all')}
                  className='mt-4 rounded-xl border border-(--border-color) bg-(--card-color) px-3.5 py-1.5 text-xs font-bold text-(--main-color) transition-all hover:border-(--main-color)'
                >
                  Tìm trên tất cả các cấp độ (N5 - N1)
                </button>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
