import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { AssessmentStatus } from '../types';

export interface AssessmentStoreState {
  answers: Record<number, string | { hanViet: string; meaning: string }>;
  activePart: 1 | 2;
  mcqSecondsLeft: number; // 60 mins = 3600s
  essaySecondsLeft: number; // 80 mins = 4800s
  mcqTimerActive: boolean;
  essayTimerActive: boolean;
  mcqStatus: AssessmentStatus;
  essayStatus: AssessmentStatus;
  isQuestionMatrixOpen: boolean;

  // Actions
  setAnswer: (
    orderNum: number,
    value: string | { hanViet: string; meaning: string },
  ) => void;
  setActivePart: (part: 1 | 2) => void;
  startTimer: (part: 1 | 2) => void;
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
      answers: {},
      activePart: 1,
      mcqSecondsLeft: 60 * 60,
      essaySecondsLeft: 80 * 60,
      mcqTimerActive: false,
      essayTimerActive: false,
      mcqStatus: 'not_started',
      essayStatus: 'not_started',
      isQuestionMatrixOpen: false,

      setAnswer: (orderNum, value) => {
        set(state => ({
          answers: {
            ...state.answers,
            [orderNum]: value,
          },
        }));
      },

      setActivePart: part => {
        set({ activePart: part });
      },

      startTimer: part => {
        if (part === 1) {
          set({ mcqTimerActive: true });
        } else {
          set({ essayTimerActive: true });
        }
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
          set({ mcqStatus: status });
        } else {
          set({ essayStatus: status });
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
          answers: {},
          activePart: 1,
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
      name: 'ptham_assessment_draft_v1',
      partialize: state => ({
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
