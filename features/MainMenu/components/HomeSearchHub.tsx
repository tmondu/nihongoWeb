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
  BookOpen,
  ChevronDown,
  ChevronUp,
  PenTool,
  ExternalLink,
  Languages,
} from 'lucide-react';
import clsx from 'clsx';
import { toKana, toRomaji } from 'wanakana';
import { Link } from '@/core/i18n/routing';
import { useClick } from '@/shared/hooks/generic/useAudio';
import { useJapaneseTTS } from '@/features/Preferences/hooks/useJapaneseTTS';
import {
  useAudioPreferences,
  useThemePreferences,
} from '@/features/Preferences';
import { kanjiDataService } from '@/features/Kanji/services/kanjiDataService';
import { HandwritingSearchCard } from '@/features/Kanji';
import KanjiSetDictionary from '@/features/Kanji/components/SetDictionary';
import hanvietMapRaw from '@/shared/data/kanji_hanviet.json';
import type { IKanjiObj } from '@/entities/kanji';
import {
  vocabDataService,
  VocabLevel,
} from '@/features/Vocabulary/services/vocabDataService';
import {
  useVocabSelection,
  ThamTuVungModal,
  type IVocabObj,
} from '@/features/Vocabulary';
import { parseFuriganaSegments } from '@/shared/utils/furigana';
import { cardBorderStyles } from '@/shared/utils/styles';
import {
  scoreKanjiMatch,
  scoreVocabMatch,
} from '@/shared/utils/searchMatching';

const hanvietMap = hanvietMapRaw as Record<string, string>;

interface ScoredKanjiItem extends IKanjiObj {
  score: number;
}

interface VocabSearchResultItem extends IVocabObj {
  level: VocabLevel;
  score?: number;
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

const SUGGESTED_QUERIES = [
  { text: '日', label: 'Nhật - Ngày' },
  { text: '一', label: 'Nhất - Một' },
  { text: '人', label: 'Nhân - Người' },
  { text: '水', label: 'Thủy - Nước' },
  { text: '火', label: 'Hỏa - Lửa' },
  { text: '木', label: 'Mộc - Cây' },
  { text: '日本', label: 'Nhật Bản' },
  { text: '先生', label: 'Thầy cô' },
  { text: '勉強', label: 'Học tập' },
  { text: '食べる', label: 'Ăn uống' },
];

export default function HomeSearchHub() {
  const inputRef = useRef<HTMLInputElement>(null);
  const { playClick } = useClick();
  const { displayKana: showKana } = useThemePreferences();
  const { pronunciationEnabled, pronunciationSpeed, pronunciationPitch } =
    useAudioPreferences();
  const { speak, stop, isPlaying, refreshVoices } = useJapaneseTTS();

  const { setActiveDetailWord } = useVocabSelection();
  const [kanjiList, setKanjiList] = useState<IKanjiObj[]>([]);
  const [vocabList, setVocabList] = useState<VocabSearchResultItem[]>([]);

  const [searchQuery, setSearchQuery] = useState('');
  const [showCanvas, setShowCanvas] = useState(true);
  const [activeTab, setActiveTab] = useState<'all' | 'kanji' | 'vocab'>('all');
  const [activePronunciationText, setActivePronunciationText] = useState<
    string | null
  >(null);
  const [kanjiLimit, setKanjiLimit] = useState(8);
  const [vocabLimit, setVocabLimit] = useState(12);

  // Preload data on mount
  useEffect(() => {
    Promise.all([kanjiDataService.preloadAll(), vocabDataService.preloadAll()])
      .then(() => {
        const cachedKanji = kanjiDataService.getAllCached();
        const allKanjis = Object.values(cachedKanji)
          .flat()
          .filter(Boolean) as IKanjiObj[];
        setKanjiList(allKanjis);

        const cachedVocab = vocabDataService.getAllCached();
        const levels: VocabLevel[] = ['n5', 'n4', 'n3', 'n2', 'n1'];
        const list: VocabSearchResultItem[] = [];
        const seen = new Set<string>();
        for (const lvl of levels) {
          const words = cachedVocab[lvl] || [];
          for (let i = 0; i < words.length; i++) {
            const w = words[i];
            if (!w || !w.word || seen.has(w.word)) continue;
            seen.add(w.word);
            list.push({ ...w, level: lvl });
          }
        }
        setVocabList(list);
      })
      .catch(console.error);
  }, []);

  // Keyboard shortcut '/' or 'Ctrl+K'
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable
      ) {
        if (e.key === 'Escape' && target === inputRef.current) {
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
  }, []);

  // Pronunciation handler
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

  // Filter & Score Kanji
  const filteredKanjis = useMemo(() => {
    const query = searchQuery.trim();
    if (!query || kanjiList.length === 0) return [];

    const uniqueKanjisMap = new Map<string, IKanjiObj>();
    kanjiList.forEach(k => {
      if (k && k.kanjiChar) {
        uniqueKanjisMap.set(k.kanjiChar, k);
      }
    });
    const uniqueKanjis = Array.from(uniqueKanjisMap.values());

    const scored: ScoredKanjiItem[] = [];
    for (let i = 0; i < uniqueKanjis.length; i++) {
      const k = uniqueKanjis[i];
      const score = scoreKanjiMatch(k, query, hanvietMap);
      if (score > 0) {
        scored.push({
          ...k,
          id: i,
          score,
        });
      }
    }

    scored.sort((a, b) => b.score - a.score);
    return scored;
  }, [searchQuery, kanjiList]);

  // Filter & Score Vocabulary
  const filteredVocabs = useMemo(() => {
    const query = searchQuery.trim();
    if (!query || vocabList.length === 0) return [];

    const scored: VocabSearchResultItem[] = [];
    for (let i = 0; i < vocabList.length; i++) {
      const item = vocabList[i];
      const score = scoreVocabMatch(item, query);
      if (score > 0) {
        scored.push({ ...item, score });
      }
    }

    scored.sort((a, b) => (b.score || 0) - (a.score || 0));
    return scored;
  }, [searchQuery, vocabList]);

  const handleSelectHandwritten = (char: string) => {
    setSearchQuery(char);
    setKanjiLimit(8);
    setVocabLimit(12);
  };

  const handleQuickTagClick = (tagText: string) => {
    playClick();
    setSearchQuery(tagText);
    setKanjiLimit(8);
    setVocabLimit(12);
    inputRef.current?.focus();
  };

  const totalResults = filteredKanjis.length + filteredVocabs.length;
  const isSearching = searchQuery.trim().length > 0;

  return (
    <div className='flex w-full max-w-4xl flex-col gap-6'>
      {/* Search Bar Container */}
      <div className='flex flex-col gap-3'>
        <div className='relative flex items-center rounded-2xl border-2 border-(--border-color) bg-(--card-color) p-2 shadow-sm transition-all focus-within:border-(--main-color) focus-within:ring-4 focus-within:ring-(--main-color)/15'>
          <Search className='ml-2 h-5 w-5 shrink-0 text-(--secondary-color)/60' />
          <input
            ref={inputRef}
            type='text'
            value={searchQuery}
            onChange={e => {
              setSearchQuery(e.target.value);
              setKanjiLimit(8);
              setVocabLimit(12);
            }}
            placeholder='Tìm kiếm chữ Kanji, âm Hán-Việt, từ vựng hoặc Romaji...'
            className='w-full border-none bg-transparent px-3 py-2 text-sm font-medium text-(--foreground-color) placeholder:text-(--secondary-color)/50 focus:ring-0 focus:outline-none sm:text-base'
          />

          <div className='flex shrink-0 items-center gap-1.5 pr-1'>
            {searchQuery ? (
              <button
                type='button'
                onClick={() => {
                  playClick();
                  setSearchQuery('');
                  inputRef.current?.focus();
                }}
                className='flex h-8 w-8 cursor-pointer items-center justify-center rounded-xl bg-(--secondary-color)/10 text-(--secondary-color) transition-colors hover:bg-(--secondary-color)/20 hover:text-(--main-color)'
                title='Xóa tìm kiếm'
              >
                <X size={16} />
              </button>
            ) : (
              <span className='hidden items-center rounded-md border border-(--border-color) bg-(--background-color) px-2 py-0.5 text-xs font-semibold text-(--secondary-color)/60 sm:inline-flex'>
                /
              </span>
            )}

            <button
              type='button'
              onClick={() => {
                playClick();
                setShowCanvas(prev => !prev);
              }}
              className={clsx(
                'flex cursor-pointer items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-bold transition-all select-none',
                showCanvas
                  ? 'border-(--main-color) bg-(--main-color) text-(--background-color)'
                  : 'border-(--border-color) bg-(--background-color) text-(--secondary-color) hover:border-(--main-color) hover:text-(--main-color)',
              )}
              title={showCanvas ? 'Thu gọn bảng vẽ' : 'Mở bảng vẽ Kanji'}
            >
              <PenTool size={14} />
              <span className='hidden sm:inline'>Bảng vẽ Kanji</span>
              {showCanvas ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            </button>
          </div>
        </div>

        {/* Handwriting Canvas: Directly under the search bar */}
        {showCanvas && (
          <div className='transition-all'>
            <HandwritingSearchCard onSelectKanji={handleSelectHandwritten} />
          </div>
        )}
      </div>

      {/* Results View */}
      {isSearching ? (
        <div className='flex flex-col gap-6'>
          {/* Result Filter Tabs */}
          <div className='flex items-center justify-between border-b border-(--border-color) pb-3'>
            <div className='flex flex-wrap items-center gap-2'>
              <button
                type='button'
                onClick={() => {
                  playClick();
                  setActiveTab('all');
                }}
                className={clsx(
                  'cursor-pointer rounded-xl px-3.5 py-1.5 text-xs font-bold transition-all sm:text-sm',
                  activeTab === 'all'
                    ? 'bg-(--main-color) text-(--background-color) shadow-sm'
                    : 'border border-(--border-color) bg-(--card-color) text-(--secondary-color) hover:text-(--main-color)',
                )}
              >
                Tất cả ({totalResults})
              </button>
              <button
                type='button'
                onClick={() => {
                  playClick();
                  setActiveTab('kanji');
                }}
                className={clsx(
                  'cursor-pointer rounded-xl px-3.5 py-1.5 text-xs font-bold transition-all sm:text-sm',
                  activeTab === 'kanji'
                    ? 'bg-(--main-color) text-(--background-color) shadow-sm'
                    : 'border border-(--border-color) bg-(--card-color) text-(--secondary-color) hover:text-(--main-color)',
                )}
              >
                Kanji ({filteredKanjis.length})
              </button>
              <button
                type='button'
                onClick={() => {
                  playClick();
                  setActiveTab('vocab');
                }}
                className={clsx(
                  'cursor-pointer rounded-xl px-3.5 py-1.5 text-xs font-bold transition-all sm:text-sm',
                  activeTab === 'vocab'
                    ? 'bg-(--main-color) text-(--background-color) shadow-sm'
                    : 'border border-(--border-color) bg-(--card-color) text-(--secondary-color) hover:text-(--main-color)',
                )}
              >
                Từ vựng ({filteredVocabs.length})
              </button>
            </div>

            <span className='hidden text-xs text-(--secondary-color)/70 sm:inline'>
              Kết quả cho &ldquo;
              <strong className='text-(--main-color)'>{searchQuery}</strong>
              &rdquo;
            </span>
          </div>

          {totalResults === 0 ? (
            <div className='flex flex-col items-center justify-center rounded-3xl border border-dashed border-(--border-color) bg-(--card-color)/40 p-10 text-center'>
              <BookOpen className='h-10 w-10 text-(--secondary-color)/40' />
              <p className='mt-3 text-base font-bold text-(--main-color)'>
                Không tìm thấy kết quả phù hợp với &ldquo;{searchQuery}&rdquo;
              </p>
              <p className='mt-1 max-w-md text-xs text-(--secondary-color)/70'>
                Bạn có thể thử tra theo âm Hán-Việt không dấu (vd:{' '}
                <code>nhat</code>
                ), vẽ chữ Kanji lên bảng vẽ hoặc tìm bằng Romaji/Hiragana.
              </p>
            </div>
          ) : (
            <div className='flex flex-col gap-8'>
              {(() => {
                const topKanjiScore = filteredKanjis[0]?.score || 0;
                const topVocabScore = filteredVocabs[0]?.score || 0;
                // If vocab has higher top score, render vocab section before kanji section
                const showVocabFirst = topVocabScore > topKanjiScore;

                const kanjiSection = (activeTab === 'all' ||
                  activeTab === 'kanji') &&
                  filteredKanjis.length > 0 && (
                    <div className='flex flex-col gap-4 rounded-3xl border-2 border-(--border-color) bg-(--card-color) p-5 shadow-sm sm:p-6'>
                      <div className='flex items-center justify-between border-b border-(--border-color) pb-3'>
                        <div className='flex items-center gap-2'>
                          <span className='flex h-7 w-7 items-center justify-center rounded-lg border-b-2 border-(--main-color-accent) bg-(--main-color) text-xs font-black text-(--background-color)'>
                            字
                          </span>
                          <h3 className='text-lg font-bold text-(--main-color) sm:text-xl'>
                            Chữ Kanji ({filteredKanjis.length})
                          </h3>
                        </div>
                        <Link
                          href={`/kanji/search?q=${encodeURIComponent(searchQuery)}`}
                          prefetch={false}
                          className='flex items-center gap-1 text-xs font-semibold text-(--secondary-color) hover:text-(--main-color)'
                        >
                          <span>Xem trong ThamKanji</span>
                          <ExternalLink size={12} />
                        </Link>
                      </div>

                      <div className='max-h-[60vh] overflow-y-auto pr-1'>
                        <KanjiSetDictionary
                          words={filteredKanjis.slice(0, kanjiLimit)}
                        />
                      </div>

                      {filteredKanjis.length > kanjiLimit && (
                        <div className='flex justify-center pt-2'>
                          <button
                            type='button'
                            onClick={() => {
                              playClick();
                              setKanjiLimit(prev => prev + 8);
                            }}
                            className='cursor-pointer rounded-xl border border-(--border-color) bg-(--background-color) px-5 py-2 text-xs font-bold text-(--main-color) transition-all hover:border-(--main-color) active:scale-95'
                          >
                            Xem thêm{' '}
                            {Math.min(8, filteredKanjis.length - kanjiLimit)}{' '}
                            chữ Kanji
                          </button>
                        </div>
                      )}
                    </div>
                  );

                const vocabSection = (activeTab === 'all' ||
                  activeTab === 'vocab') &&
                  filteredVocabs.length > 0 && (
                    <div className='flex flex-col gap-4 rounded-3xl border-2 border-(--border-color) bg-(--card-color) p-5 shadow-sm sm:p-6'>
                      <div className='flex items-center justify-between border-b border-(--border-color) pb-3'>
                        <div className='flex items-center gap-2'>
                          <span className='flex h-7 w-7 items-center justify-center rounded-lg border-b-2 border-(--secondary-color-accent) bg-(--secondary-color) text-xs font-black text-(--background-color)'>
                            語
                          </span>
                          <h3 className='text-lg font-bold text-(--main-color) sm:text-xl'>
                            Từ vựng ({filteredVocabs.length})
                          </h3>
                        </div>
                        <Link
                          href={`/vocabulary`}
                          prefetch={false}
                          className='flex items-center gap-1 text-xs font-semibold text-(--secondary-color) hover:text-(--main-color)'
                        >
                          <span>Xem trong Từ vựng</span>
                          <ExternalLink size={12} />
                        </Link>
                      </div>

                      <div className='grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3'>
                        {filteredVocabs
                          .slice(0, vocabLimit)
                          .map((wordObj, i) => {
                            const rawReading =
                              typeof wordObj.reading === 'string'
                                ? wordObj.reading
                                : '';
                            const baseReading =
                              rawReading.split(' ')[1] || rawReading;
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
                                  setActiveDetailWord(wordObj);
                                }}
                                className={clsx(
                                  'group relative flex cursor-pointer flex-col justify-between gap-2.5 rounded-2xl border p-4 transition-all duration-150 select-none',
                                  'border-(--border-color) bg-(--background-color) hover:border-(--main-color)/50 hover:shadow-xs',
                                  cardBorderStyles,
                                )}
                              >
                                <div className='flex items-start justify-between gap-2'>
                                  <div className='flex flex-col items-start'>
                                    <span className='inline-flex items-end text-left text-2xl font-black text-(--main-color) transition-all'>
                                      {segments.map((seg, idx) => (
                                        <ruby
                                          key={idx}
                                          className='leading-none'
                                        >
                                          {seg.text}
                                          {seg.furigana && (
                                            <rt className='text-xs font-semibold text-(--secondary-color) opacity-80'>
                                              {seg.furigana}
                                            </rt>
                                          )}
                                        </ruby>
                                      ))}
                                    </span>
                                    <span className='mt-1 text-xs font-medium text-(--secondary-color)'>
                                      {displayReading}
                                    </span>
                                  </div>

                                  <span
                                    className={clsx(
                                      'rounded-lg border px-2 py-0.5 text-[11px] font-black uppercase',
                                      badge.bg,
                                      badge.text,
                                      badge.border,
                                    )}
                                  >
                                    {wordObj.level.toUpperCase()}
                                  </span>
                                </div>

                                <p className='line-clamp-2 text-xs text-(--secondary-color)'>
                                  {wordObj.meanings.join(', ')}
                                </p>

                                <div className='flex items-center justify-between border-t border-(--border-color)/50 pt-2 text-xs'>
                                  <button
                                    type='button'
                                    onClick={e =>
                                      handlePronounce(
                                        wordObj.reading.split(' ')[0] ||
                                          wordObj.word,
                                        e,
                                      )
                                    }
                                    className='inline-flex cursor-pointer items-center gap-1 font-semibold text-(--secondary-color) transition-colors hover:text-(--main-color)'
                                  >
                                    <Volume2
                                      className={clsx(
                                        'h-3.5 w-3.5',
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
                                    className='inline-flex cursor-pointer items-center gap-1 rounded-lg px-2 py-1 font-bold text-(--main-color) transition-colors hover:bg-(--main-color)/10'
                                  >
                                    <BookOpen className='h-3.5 w-3.5' />
                                    <span>Chi tiết</span>
                                  </button>
                                </div>
                              </div>
                            );
                          })}
                      </div>

                      {filteredVocabs.length > vocabLimit && (
                        <div className='flex justify-center pt-2'>
                          <button
                            type='button'
                            onClick={() => {
                              playClick();
                              setVocabLimit(prev => prev + 12);
                            }}
                            className='cursor-pointer rounded-xl border border-(--border-color) bg-(--background-color) px-5 py-2 text-xs font-bold text-(--main-color) transition-all hover:border-(--main-color) active:scale-95'
                          >
                            Xem thêm{' '}
                            {Math.min(12, filteredVocabs.length - vocabLimit)}{' '}
                            từ vựng
                          </button>
                        </div>
                      )}
                    </div>
                  );

                if (showVocabFirst) {
                  return (
                    <>
                      {vocabSection}
                      {kanjiSection}
                    </>
                  );
                }

                return (
                  <>
                    {kanjiSection}
                    {vocabSection}
                  </>
                );
              })()}
            </div>
          )}
        </div>
      ) : (
        /* Empty State: Quick Suggestions and Guides */
        <div className='flex flex-col gap-6'>
          {/* Quick Suggestions */}
          <div className='flex flex-col gap-3 rounded-2xl border-2 border-(--border-color) bg-(--card-color) p-4 shadow-sm'>
            <span className='pl-1 text-xs font-bold tracking-wider text-(--secondary-color)/70 uppercase'>
              Gợi ý tra cứu phổ biến
            </span>
            <div className='flex flex-wrap gap-2'>
              {SUGGESTED_QUERIES.map(item => (
                <button
                  key={item.text}
                  type='button'
                  onClick={() => handleQuickTagClick(item.text)}
                  className='flex cursor-pointer items-center gap-1.5 rounded-full border border-(--border-color) bg-(--background-color) px-3.5 py-1.5 text-xs text-(--secondary-color) transition-all hover:border-(--main-color) hover:bg-(--card-color) hover:text-(--main-color) active:scale-95'
                >
                  <span className='font-bold text-(--main-color)'>
                    {item.text}
                  </span>
                  <span className='opacity-60'>({item.label})</span>
                </button>
              ))}
            </div>
          </div>

          {/* Quick Guidance Cards */}
          <div className='grid grid-cols-1 gap-4 md:grid-cols-3'>
            <div className='flex flex-col gap-2.5 rounded-2xl border border-(--border-color) bg-(--card-color) p-4 transition-all hover:border-(--main-color)/50'>
              <div className='flex h-9 w-9 items-center justify-center rounded-xl bg-orange-500/10 text-orange-500'>
                <PenTool size={18} />
              </div>
              <h4 className='text-sm font-bold text-(--foreground-color)'>
                1. Bảng vẽ tay cảm ứng
              </h4>
              <p className='text-xs leading-relaxed text-(--secondary-color)/80'>
                Vẽ chữ Kanji trực tiếp bằng chuột hoặc chạm vuốt trên điện
                thoại. Hệ thống nhận diện nét vẽ và đưa ra gợi ý tức thì.
              </p>
            </div>

            <div className='flex flex-col gap-2.5 rounded-2xl border border-(--border-color) bg-(--card-color) p-4 transition-all hover:border-(--main-color)/50'>
              <div className='flex h-9 w-9 items-center justify-center rounded-xl bg-blue-500/10 text-blue-500'>
                <Languages size={18} />
              </div>
              <h4 className='text-sm font-bold text-(--foreground-color)'>
                2. Âm Hán-Việt & nghĩa
              </h4>
              <p className='text-xs leading-relaxed text-(--secondary-color)/80'>
                Gõ tìm kiếm bằng âm Hán-Việt (như <code>nhat</code>,{' '}
                <code>thuy</code>, <code>tam</code>) hoặc nghĩa tiếng Việt để
                tìm Kanji tương ứng.
              </p>
            </div>

            <div className='flex flex-col gap-2.5 rounded-2xl border border-(--border-color) bg-(--card-color) p-4 transition-all hover:border-(--main-color)/50'>
              <div className='flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-500'>
                <BookOpen size={18} />
              </div>
              <h4 className='text-sm font-bold text-(--foreground-color)'>
                3. Từ vựng & Romaji
              </h4>
              <p className='text-xs leading-relaxed text-(--secondary-color)/80'>
                Nhập từ vựng bằng chữ Hán, Hiragana hoặc Romaji (như{' '}
                <code>taberu</code>, <code>gakkou</code>) để tra cứu từ N5 đến
                N1.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ThamTuVung Modal for rich vocabulary view */}
      <ThamTuVungModal />
    </div>
  );
}
