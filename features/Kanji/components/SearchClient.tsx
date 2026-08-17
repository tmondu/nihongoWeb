'use client';

import { useEffect, useMemo } from 'react';

import TrainingActionBar from '@/shared/ui-composite/Menu/TrainingActionBar';
import { SearchSidebar } from '@/features/Kanji';
import { kanjiDataService } from '@/features/Kanji/services/kanjiDataService';
import useKanjiStore from '@/features/Kanji/store/useKanjiStore';
import KanjiSetDictionary from '@/features/Kanji/components/SetDictionary';
import hanvietMap from '@/shared/data/kanji_hanviet.json';
import type { IKanjiObj } from '@/entities/kanji';

import { Sparkles, Edit3, Languages, BookOpen } from 'lucide-react';
import { useClick } from '@/shared/hooks/generic/useAudio';

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

  // Search filter logic
  const filteredKanjis = useMemo(() => {
    if (!searchQuery) return [];
    
    const query = searchQuery.trim().toLowerCase();
    if (!query) return [];

    const allKanjis = Object.values(cachedByLevel).flat().filter(Boolean) as IKanjiObj[];

    // Deduplicate by kanjiChar to prevent duplicate keys (e.g. key '54')
    const uniqueKanjisMap = new Map<string, IKanjiObj>();
    allKanjis.forEach(k => {
      if (k && k.kanjiChar) {
        uniqueKanjisMap.set(k.kanjiChar, k);
      }
    });
    const uniqueKanjis = Array.from(uniqueKanjisMap.values());

    return uniqueKanjis
      .filter(kanji => {
        // 1. Match kanji char exactly OR check if query contains the kanji char
        if (query.includes(kanji.kanjiChar)) return true;

        // 2. Match Sino-Vietnamese reading
        const hanviet = (hanvietMap as Record<string, string>)[kanji.kanjiChar];
        if (hanviet) {
          const hanvietClean = hanviet.toLowerCase();
          
          // Strip tones for better matching UX
          const cleanQuery = query.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
          const cleanHanviet = hanvietClean.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
          if (cleanHanviet.includes(cleanQuery)) return true;
        }

        // 3. Match meanings (case-insensitive & tone-stripped)
        const meaningMatches = kanji.meanings.some(meaning => {
          const cleanMeaning = meaning.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
          const cleanQuery = query.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
          return cleanMeaning.includes(cleanQuery);
        });
        if (meaningMatches) return true;

        // 4. Match onyomi or kunyomi
        const onyomiMatches = kanji.onyomi.some(r => r.toLowerCase().includes(query));
        const kunyomiMatches = kanji.kunyomi.some(r => r.toLowerCase().includes(query));
        if (onyomiMatches || kunyomiMatches) return true;

        return false;
      })
      .map((k, idx) => ({
        ...k,
        id: idx,
      }));
  }, [searchQuery, cachedByLevel]);

  return (
    <div className='mx-auto max-w-7xl px-4 py-8 flex flex-col gap-6'>

      <div className='flex flex-col gap-6 lg:flex-row lg:items-start'>
        {/* Left Column: Search sidebar */}
        <div className='flex w-full flex-col gap-4 lg:w-96 shrink-0'>
          <SearchSidebar />
        </div>

        {/* Right Column: Content grid */}
        <div className='flex flex-1 flex-col gap-4 min-w-0'>
          {searchQuery ? (
            <div className='flex flex-col gap-4 rounded-3xl border-2 border-(--border-color) bg-(--card-color) p-6 shadow-sm'>
              <div className='flex items-center justify-between border-b border-(--border-color) pb-4'>
                <h3 className='text-2xl font-bold text-(--main-color)'>
                  Kết quả tìm kiếm cho &ldquo;{searchQuery}&rdquo;
                </h3>
                <span className='text-sm text-(--secondary-color) font-bold bg-(--background-color) px-3 py-1 rounded-full border border-(--border-color)'>
                  {filteredKanjis.length} kết quả
                </span>
              </div>
              
              {filteredKanjis.length > 0 ? (
                <div className='max-h-[70vh] overflow-y-auto pr-2'>
                  <KanjiSetDictionary words={filteredKanjis} />
                </div>
              ) : (
                <p className='text-sm text-(--secondary-color)/60 py-10 text-center font-medium'>
                  Không tìm thấy chữ Kanji nào phù hợp với từ khóa của bạn.
                </p>
              )}
            </div>
          ) : (
            <div className='flex flex-col gap-8 rounded-3xl border-2 border-(--border-color) bg-(--card-color) p-6 lg:p-8 shadow-sm'>
              {/* Header */}
              <div className='border-b border-(--border-color) pb-6 text-center lg:text-left'>
                <h3 className='text-2xl font-bold text-(--main-color) flex items-center justify-center lg:justify-start gap-2.5'>
                  <Sparkles className='animate-pulse text-(--main-color)' size={24} />
                  Tra cứu Kanji thông minh
                </h3>
                <p className='text-sm text-(--secondary-color)/80 mt-2'>
                  Viết tay chữ Kanji lên bảng vẽ hoặc nhập từ khóa bên thanh tìm kiếm để tra cứu thông tin chi tiết.
                </p>
              </div>

              {/* Instructions Grid */}
              <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
                {/* Method 1 */}
                <div className='flex flex-col gap-3 rounded-2xl border border-(--border-color) bg-(--background-color) p-5 transition-all hover:border-(--main-color) hover:shadow-md group'>
                  <div className='flex h-10 w-10 items-center justify-center rounded-xl bg-orange-50 dark:bg-orange-950/20 text-orange-500 group-hover:scale-110 transition-transform'>
                    <Edit3 size={20} />
                  </div>
                  <h4 className='font-bold text-(--secondary-color)'>1. Bảng vẽ cảm ứng</h4>
                  <p className='text-xs text-(--secondary-color)/70 leading-relaxed'>
                    Vẽ chữ trực tiếp lên bảng vẽ bằng chuột hoặc màn hình cảm ứng để nhận dạng chữ viết tay tức thì.
                  </p>
                </div>

                {/* Method 2 */}
                <div className='flex flex-col gap-3 rounded-2xl border border-(--border-color) bg-(--background-color) p-5 transition-all hover:border-(--main-color) hover:shadow-md group'>
                  <div className='flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 dark:bg-blue-950/20 text-blue-500 group-hover:scale-110 transition-transform'>
                    <Languages size={20} />
                  </div>
                  <h4 className='font-bold text-(--secondary-color)'>2. Âm Hán-Việt</h4>
                  <p className='text-xs text-(--secondary-color)/70 leading-relaxed'>
                    Gõ tìm kiếm bằng âm Hán-Việt (ví dụ: <code className='bg-(--card-color) px-1 rounded font-semibold text-(--main-color)'>nhat</code>, <code className='bg-(--card-color) px-1 rounded font-semibold text-(--main-color)'>thuy</code>, <code className='bg-(--card-color) px-1 rounded font-semibold text-(--main-color)'>nhan</code>).
                  </p>
                </div>

                {/* Method 3 */}
                <div className='flex flex-col gap-3 rounded-2xl border border-(--border-color) bg-(--background-color) p-5 transition-all hover:border-(--main-color) hover:shadow-md group'>
                  <div className='flex h-10 w-10 items-center justify-center rounded-xl bg-green-50 dark:bg-green-950/20 text-green-500 group-hover:scale-110 transition-transform'>
                    <BookOpen size={20} />
                  </div>
                  <h4 className='font-bold text-(--secondary-color)'>3. Nghĩa & Phiên âm</h4>
                  <p className='text-xs text-(--secondary-color)/70 leading-relaxed'>
                    Tìm bằng nghĩa tiếng Việt (<code className='bg-(--card-color) px-1 rounded font-semibold text-(--main-color)'>nguoi</code>, <code className='bg-(--card-color) px-1 rounded font-semibold text-(--main-color)'>nuoc</code>) hoặc cách đọc romaji/kana của chữ Kanji.
                  </p>
                </div>
              </div>

              {/* Suggested Searches */}
              <div className='flex flex-col gap-3 border-t border-(--border-color) pt-6'>
                <span className='text-xs font-bold text-(--secondary-color)/60 uppercase tracking-wider pl-1'>
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
                      className='flex items-center gap-1.5 rounded-full border border-(--border-color) bg-(--background-color) px-3.5 py-1.5 text-xs text-(--secondary-color) transition-all hover:border-(--main-color) hover:text-(--main-color) hover:bg-(--card-color) active:scale-95 cursor-pointer font-medium'
                    >
                      <span className='font-bold text-(--main-color)'>{tag.text}</span>
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
