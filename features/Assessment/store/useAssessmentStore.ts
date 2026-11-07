import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { AssessmentStatus } from '../types';

export type AssessmentView = 'test_overview' | 'part_selection' | 'taking_test';

export interface AssessmentStoreState {
  currentView: AssessmentView;
  answers: Record<number, string | { hanViet: string; meaning: string }>;
  activePart: 1 | 2 | null;
  mcqSecondsLeft: number; // 60 mins = 3600s
  essaySecondsLeft: number; // 80 mins = 4800s
  mcqTimerActive: boolean;
  essayTimerActive: boolean;
  mcqStatus: AssessmentStatus;
  essayStatus: AssessmentStatus;
  isQuestionMatrixOpen: boolean;

  // Navigation & Actions
  setCurrentView: (view: AssessmentView) => void;
  startTestPart: (part: 1 | 2) => void;
  exitTestPart: (part: 1 | 2) => void;
  setAnswer: (
    orderNum: number,
    value: string | { hanViet: string; meaning: string },
  ) => void;
  decrementTimer: (part: 1 | 2) => void;
  setPartStatus: (part: 1 | 2, status: AssessmentStatus) => void;
  setQuestionMatrixOpen: (open: boolean) => void;
  syncWithServer: (data: {
    mcq_status?: AssessmentStatus;
    essay_status?: AssessmentStatus;
    mcq_time_spent_seconds?: number;
    essay_time_spent_seconds?: number;
    answers?: Record<number, string | { hanViet: string; meaning: string }>;
  }) => void;
  resetAll: () => void;
}

export const useAssessmentStore = create<AssessmentStoreState>()(
  persist(
    (set, get) => ({
      currentView: 'test_overview',
      answers: {},
      activePart: null,
      mcqSecondsLeft: 60 * 60,
      essaySecondsLeft: 80 * 60,
      mcqTimerActive: false,
      essayTimerActive: false,
      mcqStatus: 'not_started',
      essayStatus: 'not_started',
      isQuestionMatrixOpen: false,

      setCurrentView: view => {
        set({ currentView: view });
      },

      startTestPart: part => {
        if (part === 1) {
          set({
            activePart: 1,
            currentView: 'taking_test',
            mcqTimerActive: true,
            mcqStatus:
              get().mcqStatus === 'completed' ? 'completed' : 'in_progress',
          });
        } else {
          set({
            activePart: 2,
            currentView: 'taking_test',
            essayTimerActive: true,
            essayStatus:
              get().essayStatus === 'completed' ? 'completed' : 'in_progress',
          });
        }
      },

      exitTestPart: part => {
        // If exiting while in progress, discard answers for that part
        const currentAnswers = { ...get().answers };
        const range = part === 1 ? [1, 100] : [101, 200];
        for (let i = range[0]; i <= range[1]; i++) {
          delete currentAnswers[i];
        }

        if (part === 1) {
          set({
            answers: currentAnswers,
            activePart: null,
            currentView: 'part_selection',
            mcqTimerActive: false,
            mcqSecondsLeft: 60 * 60, // reset timer
            mcqStatus: 'not_started',
            isQuestionMatrixOpen: false,
          });
        } else {
          set({
            answers: currentAnswers,
            activePart: null,
            currentView: 'part_selection',
            essayTimerActive: false,
            essaySecondsLeft: 80 * 60, // reset timer
            essayStatus: 'not_started',
            isQuestionMatrixOpen: false,
          });
        }
      },

      setAnswer: (orderNum, value) => {
        set(state => ({
          answers: {
            ...state.answers,
            [orderNum]: value,
          },
        }));
      },

      decrementTimer: part => {
        if (part === 1) {
          const current = get().mcqSecondsLeft;
          if (current > 0) {
            set({ mcqSecondsLeft: current - 1 });
          } else {
            set({ mcqTimerActive: false });
          }
        } else {
          const current = get().essaySecondsLeft;
          if (current > 0) {
            set({ essaySecondsLeft: current - 1 });
          } else {
            set({ essayTimerActive: false });
          }
        }
      },

      setPartStatus: (part, status) => {
        if (part === 1) {
          set({ mcqStatus: status, mcqTimerActive: false });
        } else {
          set({ essayStatus: status, essayTimerActive: false });
        }
      },

      setQuestionMatrixOpen: open => {
        set({ isQuestionMatrixOpen: open });
      },

      syncWithServer: data => {
        set(state => {
          const newAnswers = { ...state.answers, ...(data.answers || {}) };
          let mcqLeft = state.mcqSecondsLeft;
          if (
            data.mcq_time_spent_seconds &&
            data.mcq_time_spent_seconds > 0 &&
            state.mcqSecondsLeft === 3600
          ) {
            mcqLeft = Math.max(0, 3600 - data.mcq_time_spent_seconds);
          }

          let essayLeft = state.essaySecondsLeft;
          if (
            data.essay_time_spent_seconds &&
            data.essay_time_spent_seconds > 0 &&
            state.essaySecondsLeft === 4800
          ) {
            essayLeft = Math.max(0, 4800 - data.essay_time_spent_seconds);
          }

          return {
            answers: newAnswers,
            mcqStatus: data.mcq_status || state.mcqStatus,
            essayStatus: data.essay_status || state.essayStatus,
            mcqSecondsLeft: mcqLeft,
            essaySecondsLeft: essayLeft,
          };
        });
      },

      resetAll: () => {
        set({
          currentView: 'test_overview',
          answers: {},
          activePart: null,
          mcqSecondsLeft: 60 * 60,
          essaySecondsLeft: 80 * 60,
          mcqTimerActive: false,
          essayTimerActive: false,
          mcqStatus: 'not_started',
          essayStatus: 'not_started',
          isQuestionMatrixOpen: false,
        });
      },
    }),
    {
      name: 'ptham_assessment_draft_v2',
      partialize: state => ({
        currentView: state.currentView,
        answers: state.answers,
        activePart: state.activePart,
        mcqSecondsLeft: state.mcqSecondsLeft,
        essaySecondsLeft: state.essaySecondsLeft,
        mcqStatus: state.mcqStatus,
        essayStatus: state.essayStatus,
      }),
    },
  ),
);
