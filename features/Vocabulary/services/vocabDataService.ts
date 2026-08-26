import type { IVocabObj, VocabLevel } from '@/entities/vocabulary';
import { useVocabCacheStore } from '@/features/Vocabulary/store/useVocabCacheStore';

type RawVocabEntry = {
  jmdict_seq: string;
  kana: string;
  kanji: string;
  waller_definition: string;
};

const toWordObj = (entry: RawVocabEntry): IVocabObj => {
  const definitionPieces = entry.waller_definition
    .split(/[;,]/)
    .map(piece => piece.trim())
    .filter(Boolean);

  return {
    word: entry.kanji?.trim() || entry.kana,
    reading: `${entry.kana}`.trim(),
    meanings: definitionPieces,
  };
};

// Module-level cache - persists across component mounts
const vocabCache: Partial<Record<VocabLevel, IVocabObj[]>> = {};
const pendingRequests: Partial<Record<VocabLevel, Promise<IVocabObj[]>>> = {};

const getCachedLevel = (level: VocabLevel) => {
  const sessionCache = useVocabCacheStore.getState().cachedByLevel[level];
  if (sessionCache && sessionCache.length > 0) return sessionCache;
  return vocabCache[level];
};

const setCachedLevel = (level: VocabLevel, items: IVocabObj[]) => {
  vocabCache[level] = items;
  useVocabCacheStore.getState().setCachedLevel(level, items);
};

export const vocabDataService = {
  /**
   * Fetch fresh vocabulary data from MySQL database
   */
  async fetchFresh(level: VocabLevel): Promise<IVocabObj[]> {
    if (pendingRequests[level]) {
      return pendingRequests[level];
    }

    pendingRequests[level] = fetch(`/api/vocab?level=${level}`, {
      cache: 'no-store',
      headers: {
        'Cache-Control': 'no-cache',
      },
    })
      .then(res => {
        if (!res.ok) throw new Error(`HTTP error ${res.status}`);
        return res.json() as Promise<RawVocabEntry[]>;
      })
      .then(data => {
        const words = data.map(toWordObj);
        setCachedLevel(level, words);
        delete pendingRequests[level];
        return words;
      })
      .catch(err => {
        delete pendingRequests[level];
        console.error(`Failed to fetch fresh vocab for ${level}:`, err);
        throw err;
      });

    return pendingRequests[level];
  },

  /**
   * Get vocab data for a specific level with Stale-While-Revalidate pattern.
   * Returns cached data immediately for instant UI render,
   * while always fetching the latest data from MySQL in the background.
   */
  async getVocabByLevel(level: VocabLevel): Promise<IVocabObj[]> {
    const cached = getCachedLevel(level);

    // Revalidate in background to fetch latest updates from MySQL
    void this.fetchFresh(level).catch(() => {
      // Ignore background revalidation errors if cache is available
    });

    if (cached) {
      return cached;
    }

    return this.fetchFresh(level);
  },

  /**
   * Preload all vocab levels in parallel
   */
  async preloadAll(): Promise<void> {
    const levels: VocabLevel[] = ['n5', 'n4', 'n3', 'n2', 'n1'];
    await Promise.all(levels.map(level => this.getVocabByLevel(level)));
  },

  /**
   * Check if a level is already cached
   */
  isCached(level: VocabLevel): boolean {
    return !!getCachedLevel(level);
  },

  /**
   * Get all cached data (for components that need all levels)
   */
  getAllCached(): Partial<Record<VocabLevel, IVocabObj[]>> {
    return { ...useVocabCacheStore.getState().cachedByLevel, ...vocabCache };
  },

  /**
   * Clear cache (useful for testing or forced refresh)
   */
  clearCache(): void {
    Object.keys(vocabCache).forEach(key => {
      delete vocabCache[key as VocabLevel];
    });
    useVocabCacheStore.getState().clearCache();
  },
};

export type { VocabLevel };
