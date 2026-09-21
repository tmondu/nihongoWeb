import type {
  IRadical,
  RadicalLayer,
  IKanjiComposition,
} from '@/entities/radical';

let cachedRadicals: IRadical[] | null = null;
let cachedCompositions: IKanjiComposition[] | null = null;
let pendingRadicalsPromise: Promise<IRadical[]> | null = null;
let pendingCompositionsPromise: Promise<IKanjiComposition[]> | null = null;

export const radicalDataService = {
  /**
   * Fetch all 214 radicals, optionally filtered by layer, search query or stroke count
   */
  async getRadicals(options?: {
    layer?: RadicalLayer | 'all';
    search?: string;
    stroke?: number;
  }): Promise<IRadical[]> {
    if (!cachedRadicals) {
      if (!pendingRadicalsPromise) {
        pendingRadicalsPromise = fetch('/api/radicals')
          .then(async res => {
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            return (await res.json()) as IRadical[];
          })
          .then(data => {
            cachedRadicals = data;
            pendingRadicalsPromise = null;
            return data;
          })
          .catch(err => {
            pendingRadicalsPromise = null;
            throw err;
          });
      }
      await pendingRadicalsPromise;
    }

    let results = cachedRadicals ?? [];

    if (options?.layer && options.layer !== 'all') {
      results = results.filter(r => r.layer === options.layer);
    }

    if (options?.stroke !== undefined && options.stroke > 0) {
      results = results.filter(r => r.strokeCount === options.stroke);
    }

    if (options?.search) {
      const q = options.search.toLowerCase().trim();
      results = results.filter(
        r =>
          r.char.includes(q) ||
          r.altForms.some(a => a.includes(q)) ||
          r.hanviet.toLowerCase().includes(q) ||
          r.meaning_vi.toLowerCase().includes(q) ||
          r.meaning_en.toLowerCase().includes(q),
      );
    }

    return results;
  },

  /**
   * Fetch all Kanji compositions / combinations
   */
  async getCompositions(): Promise<IKanjiComposition[]> {
    if (cachedCompositions) return cachedCompositions;

    if (!pendingCompositionsPromise) {
      pendingCompositionsPromise = fetch('/api/radicals/composition')
        .then(async res => {
          if (!res.ok) throw new Error(`HTTP ${res.status}`);
          return (await res.json()) as IKanjiComposition[];
        })
        .then(data => {
          cachedCompositions = data;
          pendingCompositionsPromise = null;
          return data;
        })
        .catch(err => {
          pendingCompositionsPromise = null;
          throw err;
        });
    }

    return pendingCompositionsPromise;
  },

  /**
   * Find kanji formed by a set of radicals
   */
  async findKanjiByRadicals(radicals: string[]): Promise<IKanjiComposition[]> {
    if (radicals.length === 0) return [];
    const all = await this.getCompositions();
    return all.filter(item =>
      radicals.every(
        r =>
          item.radicals.includes(r) ||
          item.radicalNames.some(n => n.includes(r)),
      ),
    );
  },

  /**
   * Get decomposition for a specific kanji
   */
  async getCompositionByKanji(
    kanji: string,
  ): Promise<IKanjiComposition | null> {
    if (cachedCompositions) {
      const match = cachedCompositions.find(item => item.kanji === kanji);
      if (match) return match;
    }

    try {
      const res = await fetch(
        `/api/radicals/composition?kanji=${encodeURIComponent(kanji)}`,
      );
      if (res.ok) {
        return (await res.json()) as IKanjiComposition;
      }
    } catch {
      // Fallback
    }

    const all = await this.getCompositions();
    return all.find(item => item.kanji === kanji) ?? null;
  },

  /**
   * Preload both radicals and compositions into memory
   */
  async preloadAll(): Promise<void> {
    await Promise.all([this.getRadicals(), this.getCompositions()]);
  },
};
