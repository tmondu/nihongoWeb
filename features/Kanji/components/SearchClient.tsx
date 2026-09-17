'use client';

import { useEffect, useMemo } from 'react';

import TrainingActionBar from '@/shared/ui-composite/Menu/TrainingActionBar';
import { SearchSidebar } from '@/features/Kanji';
import { kanjiDataService } from '@/features/Kanji/services/kanjiDataService';
import useKanjiStore from '@/features/Kanji/store/useKanjiStore';
import KanjiSetDictionary from '@/features/Kanji/components/SetDictionary';
import hanvietMap from '@/shared/data/kanji_hanviet.json';
import type { IKanjiObj } from '@/entities/kanji';

import { Edit3, Languages, BookOpen } from 'lucide-react';
import { useClick } from '@/shared/hooks/generic/useAudio';

import { scoreKanjiMatch } from '@/shared/utils/searchMatching';

const PRELOAD_FLAG = 'kanji-preload-complete';

type SearchClientProps = {
  locale: string;
};

export default function SearchClient({ locale: _locale }: SearchClientProps) {
  const setSearchQuery = useKanjiStore(state => state.setSearchQuery);
  const searchQuery = useKanjiStore(state => state.searchQuery);
  const cachedByLevel = kanjiDataService.getAllCached();
  const { playClick } = useClick();

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (sessionStorage.getItem(PRELOAD_FLAG)) return;

    sessionStorage.setItem(PRELOAD_FLAG, 'true');
    void kanjiDataService.preloadAll();
  }, []);

  // Reset search query when component unmounts
  useEffect(() => {
    return () => {
      setSearchQuery('');
    };
  }, [setSearchQuery]);

  // Search filter logic with accurate scoring
  const filteredKanjis = useMemo(() => {
    const query = searchQuery.trim();
    if (!query) return [];

    const allKanjis = Object.values(cachedByLevel)
      .flat()
      .filter(Boolean) as IKanjiObj[];

    // Deduplicate by kanjiChar to prevent duplicate keys
    const uniqueKanjisMap = new Map<string, IKanjiObj>();
    allKanjis.forEach(k => {
      if (k && k.kanjiChar) {
        uniqueKanjisMap.set(k.kanjiChar, k);
      }
    });
    const uniqueKanjis = Array.from(uniqueKanjisMap.values());

    const scored: (IKanjiObj & { score: number })[] = [];
    for (let i = 0; i < uniqueKanjis.length; i++) {
      const kanji = uniqueKanjis[i];
      const score = scoreKanjiMatch(
        kanji,
        query,
        hanvietMap as Record<string, string>,
      );
      if (score > 0) {
        scored.push({
          ...kanji,
          id: i,
          score,
        });
      }
    }

    scored.sort((a, b) => b.score - a.score);
    return scored;
  }, [searchQuery, cachedByLevel]);

  return (
    <div className='mx-auto flex max-w-7xl flex-col gap-6 px-4 py-8'>
      <div className='flex flex-col gap-6 lg:flex-row lg:items-start'>
        {/* Left Column: Search sidebar */}
        <div className='flex w-full shrink-0 flex-col gap-4 lg:w-96'>
          <SearchSidebar />
        </div>

        {/* Right Column: Content grid */}
        <div className='flex min-w-0 flex-1 flex-col gap-4'>
          {searchQuery ? (
            <div className='flex flex-col gap-4 rounded-3xl border-2 border-(--border-color) bg-(--card-color) p-6 shadow-sm'>
              <div className='flex items-center justify-between border-b border-(--border-color) pb-4'>
                <h3 className='text-2xl font-bold text-(--main-color)'>
                  Kết quả tìm kiếm cho &ldquo;{searchQuery}&rdquo;
                </h3>
                <span className='rounded-full border border-(--border-color) bg-(--background-color) px-3 py-1 text-sm font-bold text-(--secondary-color)'>
                  {filteredKanjis.length} kết quả
                </span>
              </div>

              {filteredKanjis.length > 0 ? (
                <div className='max-h-[70vh] overflow-y-auto pr-2'>
                  <KanjiSetDictionary words={filteredKanjis} />
                </div>
              ) : (
                <p className='py-10 text-center text-sm font-medium text-(--secondary-color)/60'>
                  Không tìm thấy chữ Kanji nào phù hợp với từ khóa của bạn.
                </p>
              )}
            </div>
          ) : (
            <div className='flex flex-col gap-8 rounded-3xl border-2 border-(--border-color) bg-(--card-color) p-6 shadow-sm lg:p-8'>
              {/* Header */}
              <div className='border-b border-(--border-color) pb-6 text-center lg:text-left'>
                <h3 className='flex items-center justify-center gap-2.5 text-2xl font-bold text-(--main-color) lg:justify-start'>
                  <Languages className='text-(--main-color)' size={24} />
                  Tra cứu Kanji thông minh
                </h3>
                <p className='mt-2 text-sm text-(--secondary-color)/80'>
                  Viết tay chữ Kanji lên bảng vẽ hoặc nhập từ khóa bên thanh tìm
                  kiếm để tra cứu thông tin chi tiết.
                </p>
              </div>

              {/* Instructions Grid */}
              <div className='grid grid-cols-1 gap-6 md:grid-cols-3'>
                {/* Method 1 */}
                <div className='group flex flex-col gap-3 rounded-2xl border border-(--border-color) bg-(--background-color) p-5 transition-all hover:border-(--main-color) hover:shadow-md'>
                  <div className='flex h-10 w-10 items-center justify-center rounded-xl bg-orange-50 text-orange-500 transition-transform group-hover:scale-110 dark:bg-orange-950/20'>
                    <Edit3 size={20} />
                  </div>
                  <h4 className='font-bold text-(--secondary-color)'>
                    1. Bảng vẽ cảm ứng
                  </h4>
                  <p className='text-xs leading-relaxed text-(--secondary-color)/70'>
                    Vẽ chữ trực tiếp lên bảng vẽ bằng chuột hoặc màn hình cảm
                    ứng để nhận dạng chữ viết tay tức thì.
                  </p>
                </div>

                {/* Method 2 */}
                <div className='group flex flex-col gap-3 rounded-2xl border border-(--border-color) bg-(--background-color) p-5 transition-all hover:border-(--main-color) hover:shadow-md'>
                  <div className='flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-500 transition-transform group-hover:scale-110 dark:bg-blue-950/20'>
                    <Languages size={20} />
                  </div>
                  <h4 className='font-bold text-(--secondary-color)'>
                    2. Âm Hán-Việt
                  </h4>
                  <p className='text-xs leading-relaxed text-(--secondary-color)/70'>
                    Gõ tìm kiếm bằng âm Hán-Việt (ví dụ:{' '}
                    <code className='rounded bg-(--card-color) px-1 font-semibold text-(--main-color)'>
                      nhat
                    </code>
                    ,{' '}
                    <code className='rounded bg-(--card-color) px-1 font-semibold text-(--main-color)'>
                      thuy
                    </code>
                    ,{' '}
                    <code className='rounded bg-(--card-color) px-1 font-semibold text-(--main-color)'>
                      nhan
                    </code>
                    ).
                  </p>
                </div>

                {/* Method 3 */}
                <div className='group flex flex-col gap-3 rounded-2xl border border-(--border-color) bg-(--background-color) p-5 transition-all hover:border-(--main-color) hover:shadow-md'>
                  <div className='flex h-10 w-10 items-center justify-center rounded-xl bg-green-50 text-green-500 transition-transform group-hover:scale-110 dark:bg-green-950/20'>
                    <BookOpen size={20} />
                  </div>
                  <h4 className='font-bold text-(--secondary-color)'>
                    3. Nghĩa & Phiên âm
                  </h4>
                  <p className='text-xs leading-relaxed text-(--secondary-color)/70'>
                    Tìm bằng nghĩa tiếng Việt (
                    <code className='rounded bg-(--card-color) px-1 font-semibold text-(--main-color)'>
                      nguoi
                    </code>
                    ,{' '}
                    <code className='rounded bg-(--card-color) px-1 font-semibold text-(--main-color)'>
                      nuoc
                    </code>
                    ) hoặc cách đọc romaji/kana của chữ Kanji.
                  </p>
                </div>
              </div>

              {/* Suggested Searches */}
              <div className='flex flex-col gap-3 border-t border-(--border-color) pt-6'>
                <span className='pl-1 text-xs font-bold tracking-wider text-(--secondary-color)/60 uppercase'>
                  Gợi ý tìm kiếm phổ biến
                </span>
                <div className='flex flex-wrap gap-2'>
                  {[
                    { text: '一', label: 'Nhất - Một' },
                    { text: '日', label: 'Nhật - Ngày' },
                    { text: '人', label: 'Nhân - Người' },
                    { text: '水', label: 'Thủy - Nước' },
                    { text: '火', label: 'Hỏa - Lửa' },
                    { text: '木', label: 'Mộc - Cây' },
                    { text: 'học tập', label: 'Nghĩa "học tập"' },
                    { text: 'quốc gia', label: 'Nghĩa "quốc gia"' },
                  ].map(tag => (
                    <button
                      key={tag.text}
                      onClick={() => {
                        playClick();
                        setSearchQuery(tag.text);
                      }}
                      className='flex cursor-pointer items-center gap-1.5 rounded-full border border-(--border-color) bg-(--background-color) px-3.5 py-1.5 text-xs font-medium text-(--secondary-color) transition-all hover:border-(--main-color) hover:bg-(--card-color) hover:text-(--main-color) active:scale-95'
                    >
                      <span className='font-bold text-(--main-color)'>
                        {tag.text}
                      </span>
                      <span className='opacity-60'>({tag.label})</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <TrainingActionBar currentDojo='kanji' />
    </div>
  );
}
