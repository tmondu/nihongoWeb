'use client';

import localforage from 'localforage';
import { create } from 'zustand';

import {
  KANJI_SET_PROGRESS_CAP,
  VOCAB_MEANING_PROGRESS_CAP,
  VOCAB_READING_PROGRESS_CAP,
} from '@/features/Progress/lib/setProgress';

export interface AllTimeSetProgress {
  version: 1;
  updatedAt: number;
  kanji: Record<string, { correct: number }>;
  vocabulary: Record<
    string,
    { meaningCorrect: number; readingCorrect: number }
  >;
}

interface SetProgressState {
  isHydrated: boolean;
  userId: string | null;
  data: AllTimeSetProgress;
  hydrate: () => Promise<void>;
  recordKanjiProgress: (kanjiChar: string) => Promise<void>;
  recordVocabularyProgress: (
    word: string,
    questionType: 'meaning' | 'reading',
  ) => Promise<void>;
  clearSetProgress: () => Promise<void>;
}

const STORAGE_KEY = 'pthamss-set-progress-v1';

function getStorageKey(): string {
  try {
    const userId = useSetProgressStore.getState()?.userId;
    if (userId) {
      return `pthamss-set-progress-v1-${userId}`;
    }
  } catch {
    // Fallback if store is not initialized yet
  }
  return STORAGE_KEY;
}

const setProgressStore = localforage.createInstance({
  name: 'pthamss',
  storeName: 'set_progress',
});

const createDefaultSetProgress = (): AllTimeSetProgress => ({
  version: 1,
  updatedAt: Date.now(),
  kanji: {},
  vocabulary: {},
});

async function loadPersistedSetProgress(): Promise<AllTimeSetProgress> {
  try {
    const data =
      await setProgressStore.getItem<AllTimeSetProgress>(getStorageKey());
    if (!data || data.version !== 1) {
      return createDefaultSetProgress();
    }

    return {
      version: 1,
      updatedAt: data.updatedAt ?? Date.now(),
      kanji: data.kanji ?? {},
      vocabulary: data.vocabulary ?? {},
    };
  } catch {
    return createDefaultSetProgress();
  }
}

const PERSIST_DEBOUNCE_MS = 2000;

let persistTimeoutId: ReturnType<typeof setTimeout> | null = null;

function debouncedPersist(data: AllTimeSetProgress): void {
  if (persistTimeoutId) clearTimeout(persistTimeoutId);
  persistTimeoutId = setTimeout(async () => {
    await setProgressStore.setItem(getStorageKey(), data);
    persistTimeoutId = null;
  }, PERSIST_DEBOUNCE_MS);
}

async function persistSetProgressNow(data: AllTimeSetProgress): Promise<void> {
  if (persistTimeoutId) {
    clearTimeout(persistTimeoutId);
    persistTimeoutId = null;
  }
  await setProgressStore.setItem(getStorageKey(), data);
}

let hydrationPromise: Promise<void> | null = null;

const useSetProgressStore = create<SetProgressState>((set, get) => ({
  isHydrated: false,
  userId: null,
  data: createDefaultSetProgress(),

  hydrate: async () => {
    if (get().isHydrated) return;
    if (hydrationPromise) return hydrationPromise;

    hydrationPromise = (async () => {
      let userId: string | null = null;
      if (typeof window !== 'undefined') {
        try {
          const response = await fetch('/api/auth/me');
          if (response.ok) {
            const user = await response.json();
            if (user && user.id) {
              userId = String(user.id);
            }
          }
        } catch {
          // Fallback silently
        }
      }
      set({ userId });

      const data = await loadPersistedSetProgress();
      set({ data, isHydrated: true });
      hydrationPromise = null;
    })();

    return hydrationPromise;
  },

  recordKanjiProgress: async kanjiChar => {
    if (!kanjiChar) return;
    if (!get().isHydrated) {
      await get().hydrate();
    }

    let nextData = get().data;
    let didChange = false;

    set(state => {
      const current = state.data.kanji[kanjiChar] ?? { correct: 0 };
      const nextCorrect = Math.min(current.correct + 1, KANJI_SET_PROGRESS_CAP);

      if (nextCorrect === current.correct) {
        nextData = state.data;
        return state;
      }

      didChange = true;
      nextData = {
        ...state.data,
        updatedAt: Date.now(),
        kanji: {
          ...state.data.kanji,
          [kanjiChar]: { correct: nextCorrect },
        },
      };

      return { data: nextData };
    });

    if (!didChange) {
      return;
    }

    debouncedPersist(nextData);
  },

  recordVocabularyProgress: async (word, questionType) => {
    if (!word) return;
    if (!get().isHydrated) {
      await get().hydrate();
    }

    let nextData = get().data;
    let didChange = false;

    set(state => {
      const current = state.data.vocabulary[word] ?? {
        meaningCorrect: 0,
        readingCorrect: 0,
      };

      const nextEntry =
        questionType === 'meaning'
          ? {
              ...current,
              meaningCorrect: Math.min(
                current.meaningCorrect + 1,
                VOCAB_MEANING_PROGRESS_CAP,
              ),
            }
          : {
              ...current,
              readingCorrect: Math.min(
                current.readingCorrect + 1,
                VOCAB_READING_PROGRESS_CAP,
              ),
            };

      const isUnchanged =
        nextEntry.meaningCorrect === current.meaningCorrect &&
        nextEntry.readingCorrect === current.readingCorrect;

      if (isUnchanged) {
        nextData = state.data;
        return state;
      }

      didChange = true;
      nextData = {
        ...state.data,
        updatedAt: Date.now(),
        vocabulary: {
          ...state.data.vocabulary,
          [word]: nextEntry,
        },
      };

      return { data: nextData };
    });

    if (!didChange) {
      return;
    }

    debouncedPersist(nextData);
  },

  clearSetProgress: async () => {
    const data = createDefaultSetProgress();
    set({ data, isHydrated: true });
    await persistSetProgressNow(data);
  },
}));

if (typeof window !== 'undefined') {
  void useSetProgressStore.getState().hydrate();
}

export default useSetProgressStore;
