import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import type { IRadical, RadicalLayer } from '@/entities/radical';

export type RadicalsTab = 'explore' | 'decompose' | 'synthesize';

interface RadicalsState {
  activeTab: RadicalsTab;
  setActiveTab: (tab: RadicalsTab) => void;

  selectedLayer: 'all' | RadicalLayer;
  setSelectedLayer: (layer: 'all' | RadicalLayer) => void;

  searchQuery: string;
  setSearchQuery: (query: string) => void;

  selectedStroke: number | null;
  setSelectedStroke: (stroke: number | null) => void;

  selectedRadical: IRadical | null;
  setSelectedRadical: (radical: IRadical | null) => void;

  // Synthesizer state
  synthesizerRadicals: string[];
  addSynthesizerRadical: (char: string) => void;
  removeSynthesizerRadical: (char: string) => void;
  clearSynthesizerRadicals: () => void;

  // Decomposer search input
  decomposerTarget: string;
  setDecomposerTarget: (char: string) => void;

  // History
  recentKanji: string[];
  addRecentKanji: (kanji: string) => void;
}

export const useRadicalsStore = create<RadicalsState>()(
  persist(
    (set, get) => ({
      activeTab: 'explore',
      setActiveTab: tab => set({ activeTab: tab }),

      selectedLayer: 'all',
      setSelectedLayer: layer => set({ selectedLayer: layer }),

      searchQuery: '',
      setSearchQuery: query => set({ searchQuery: query }),

      selectedStroke: null,
      setSelectedStroke: stroke => set({ selectedStroke: stroke }),

      selectedRadical: null,
      setSelectedRadical: radical => set({ selectedRadical: radical }),

      synthesizerRadicals: [],
      addSynthesizerRadical: char => {
        const current = get().synthesizerRadicals;
        if (!current.includes(char) && current.length < 5) {
          set({ synthesizerRadicals: [...current, char] });
        }
      },
      removeSynthesizerRadical: char => {
        set({
          synthesizerRadicals: get().synthesizerRadicals.filter(
            c => c !== char,
          ),
        });
      },
      clearSynthesizerRadicals: () => set({ synthesizerRadicals: [] }),

      decomposerTarget: '休',
      setDecomposerTarget: char => set({ decomposerTarget: char }),

      recentKanji: ['休', '明', '安', '好', '森'],
      addRecentKanji: kanji => {
        const filtered = get().recentKanji.filter(k => k !== kanji);
        set({ recentKanji: [kanji, ...filtered].slice(0, 10) });
      },
    }),
    {
      name: 'ptham-radicals-storage',
      storage:
        typeof window !== 'undefined'
          ? createJSONStorage(() => localStorage)
          : undefined,
      partialize: state => ({
        recentKanji: state.recentKanji,
        synthesizerRadicals: state.synthesizerRadicals,
        decomposerTarget: state.decomposerTarget,
      }),
    },
  ),
);
