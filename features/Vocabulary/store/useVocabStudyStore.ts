'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { VocabLevel, StudySection } from '../types/study';

interface VocabStudyState {
  level: VocabLevel;
  section: StudySection;
  lessonId: number;
  expandedVocab: boolean;
  expandedSpeak: boolean;
  learned: string[];
  starred: string[];
  curMap: Record<string, number>;
  scores: Record<string, number>;
}

interface VocabStudyActions {
  setLevel: (level: VocabLevel) => void;
  setView: (section: StudySection, lessonId: number) => void;
  toggleSection: (section: StudySection) => void;
  markLearned: (key: string) => void;
  markNotLearned: (key: string) => void;
  toggleStarred: (key: string) => void;
  setScore: (key: string, pct: number) => void;
  setCursor: (lessonId: number, idx: number) => void;
  resetLesson: (lessonId: number, words: string[]) => void;
}

type VocabStudyStore = VocabStudyState & VocabStudyActions;

const useVocabStudyStore = create<VocabStudyStore>()(
  persist(
    set => ({
      level: 'n5',
      section: 'vocab',
      lessonId: 1,
      expandedVocab: true,
      expandedSpeak: false,
      learned: [],
      starred: [],
      curMap: {},
      scores: {},

      setLevel: level => set({ level, lessonId: 1 }),

      setView: (section, lessonId) => set({ section, lessonId }),

      toggleSection: section =>
        set(state => ({
          expandedVocab:
            section === 'vocab' ? !state.expandedVocab : state.expandedVocab,
          expandedSpeak:
            section === 'speak' ? !state.expandedSpeak : state.expandedSpeak,
        })),

      markLearned: key =>
        set(state => ({
          learned: state.learned.includes(key)
            ? state.learned
            : [...state.learned, key],
        })),

      markNotLearned: key =>
        set(state => ({
          learned: state.learned.filter(k => k !== key),
        })),

      toggleStarred: key =>
        set(state => ({
          starred: state.starred.includes(key)
            ? state.starred.filter(k => k !== key)
            : [...state.starred, key],
        })),

      setScore: (key, pct) =>
        set(state => ({
          scores: { ...state.scores, [key]: pct },
        })),

      setCursor: (lessonId, idx) =>
        set(state => ({
          curMap: { ...state.curMap, [String(lessonId)]: idx },
        })),

      resetLesson: (lessonId, words) =>
        set(state => {
          const prefix = `${lessonId}:`;
          return {
            learned: state.learned.filter(k => !k.startsWith(prefix)),
            starred: state.starred.filter(k => !k.startsWith(prefix)),
            scores: Object.fromEntries(
              Object.entries(state.scores).filter(
                ([k]) => !k.startsWith(prefix),
              ),
            ),
            curMap: { ...state.curMap, [String(lessonId)]: 0 },
            curWords: words,
          };
        }),
    }),
    {
      name: 'mondu:vocab:study',
    },
  ),
);

export default useVocabStudyStore;
