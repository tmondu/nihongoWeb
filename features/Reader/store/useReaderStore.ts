'use client';

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { MinedSentence, WordLookupDetail } from '../types';

interface ReaderState {
  // Navigation & Content
  selectedArticleId: string;
  customText: string;
  isCustomMode: boolean;

  // View Settings
  showFurigana: boolean;
  fontSize: number; // in pixels, e.g. 18

  // Interactive Word Detail State
  activeWordDetail: WordLookupDetail | null;
  activeSentenceContext: string | null;
  isWordPopoverOpen: boolean;
  isLoadingWordDetail: boolean;

  // Sentence Mining
  minedSentences: MinedSentence[];
  isMinedDrawerOpen: boolean;

  // Actions
  setSelectedArticleId: (id: string) => void;
  setCustomText: (text: string) => void;
  setIsCustomMode: (val: boolean) => void;
  setShowFurigana: (val: boolean) => void;
  toggleFurigana: () => void;
  setFontSize: (size: number) => void;
  increaseFontSize: () => void;
  decreaseFontSize: () => void;

  setActiveWordDetail: (
    detail: WordLookupDetail | null,
    sentenceContext?: string | null,
  ) => void;
  setIsWordPopoverOpen: (open: boolean) => void;
  setIsLoadingWordDetail: (loading: boolean) => void;

  addMinedSentence: (
    sentence: string,
    targetWord: string,
    reading?: string,
    hanViet?: string,
    meaning?: string,
    articleTitle?: string,
  ) => void;
  removeMinedSentence: (id: string) => void;
  clearMinedSentences: () => void;
  setIsMinedDrawerOpen: (open: boolean) => void;
}

export const useReaderStore = create<ReaderState>()(
  persist(
    (set, get) => ({
      selectedArticleId: 'momotaro-n4',
      customText: '',
      isCustomMode: false,

      showFurigana: true,
      fontSize: 18,

      activeWordDetail: null,
      activeSentenceContext: null,
      isWordPopoverOpen: false,
      isLoadingWordDetail: false,

      minedSentences: [],
      isMinedDrawerOpen: false,

      setSelectedArticleId: id =>
        set({ selectedArticleId: id, isCustomMode: false }),

      setCustomText: text => set({ customText: text }),

      setIsCustomMode: val => set({ isCustomMode: val }),

      setShowFurigana: val => set({ showFurigana: val }),

      toggleFurigana: () =>
        set(state => ({ showFurigana: !state.showFurigana })),

      setFontSize: size => set({ fontSize: Math.min(32, Math.max(14, size)) }),

      increaseFontSize: () =>
        set(state => ({ fontSize: Math.min(32, state.fontSize + 2) })),

      decreaseFontSize: () =>
        set(state => ({ fontSize: Math.max(14, state.fontSize - 2) })),

      setActiveWordDetail: (detail, sentenceContext = null) =>
        set({
          activeWordDetail: detail,
          activeSentenceContext: sentenceContext,
          isWordPopoverOpen: detail !== null,
        }),

      setIsWordPopoverOpen: open => set({ isWordPopoverOpen: open }),

      setIsLoadingWordDetail: loading => set({ isLoadingWordDetail: loading }),

      addMinedSentence: (
        sentence,
        targetWord,
        reading,
        hanViet,
        meaning,
        articleTitle,
      ) => {
        const { minedSentences } = get();
        // Prevent duplicate mine of same target word in same sentence
        const alreadyExists = minedSentences.some(
          s => s.sentence === sentence && s.targetWord === targetWord,
        );
        if (alreadyExists) return;

        const newEntry: MinedSentence = {
          id: `${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
          sentence: sentence.trim(),
          targetWord: targetWord.trim(),
          reading: reading?.trim(),
          hanViet: hanViet?.trim(),
          meaning: meaning?.trim(),
          articleTitle: articleTitle?.trim(),
          createdAt: Date.now(),
        };

        set({ minedSentences: [newEntry, ...minedSentences] });
      },

      removeMinedSentence: id =>
        set(state => ({
          minedSentences: state.minedSentences.filter(s => s.id !== id),
        })),

      clearMinedSentences: () => set({ minedSentences: [] }),

      setIsMinedDrawerOpen: open => set({ isMinedDrawerOpen: open }),
    }),
    {
      name: 'pthamss-reader-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: state => ({
        minedSentences: state.minedSentences,
        fontSize: state.fontSize,
        showFurigana: state.showFurigana,
        selectedArticleId: state.selectedArticleId,
        customText: state.customText,
      }),
    },
  ),
);
