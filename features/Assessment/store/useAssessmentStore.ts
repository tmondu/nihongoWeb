import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {
  AssessmentStatus,
  AssessmentQuestion,
  ShuffledAssessmentQuestion,
  ShuffledMcqOption,
  AssessmentScores,
} from '../types';

export type AssessmentView = 'test_overview' | 'part_selection' | 'taking_test';

function shuffleArray<T>(arr: T[]): T[] {
  const result = [...arr];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

export interface AssessmentStoreState {
  currentUserId: number | null;
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
  shuffledMcqQuestions: ShuffledAssessmentQuestion[] | null;
  scores: AssessmentScores | null;

  // Navigation & Actions
  setCurrentView: (view: AssessmentView) => void;
  startTestPart: (part: 1 | 2, questions?: AssessmentQuestion[]) => void;
  exitTestPart: (part: 1 | 2) => void;
  setAnswer: (
    orderNum: number,
    value: string | { hanViet: string; meaning: string },
  ) => void;
  decrementTimer: (part: 1 | 2) => void;
  setPartStatus: (part: 1 | 2, status: AssessmentStatus) => void;
  setScores: (scores: AssessmentScores) => void;
  setQuestionMatrixOpen: (open: boolean) => void;
  syncWithServer: (
    userId: number,
    data: {
      id?: number;
      mcq_status?: AssessmentStatus;
      essay_status?: AssessmentStatus;
      overall_status?: string;
      mcq_score?: number;
      essay_score?: number;
      total_score?: number;
      mcq_time_spent_seconds?: number;
      essay_time_spent_seconds?: number;
      answers?: Record<number, string | { hanViet: string; meaning: string }>;
      completed_at?: string | null;
    } | null,
  ) => void;
  resetAll: () => void;
}

export const useAssessmentStore = create<AssessmentStoreState>()(
  persist(
    (set, get) => ({
      currentUserId: null,
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
      shuffledMcqQuestions: null,
      scores: null,

      setCurrentView: view => {
        set({ currentView: view });
      },

      startTestPart: (part, questions) => {
        if (part === 1) {
          let shuffled = get().shuffledMcqQuestions;

          // If starting fresh or no shuffled questions yet, shuffle questions and options
          if (!shuffled && questions && questions.length > 0) {
            const mcqList = questions.filter(q => q.part === 1);
            const randomizedQuestions = shuffleArray(mcqList);

            shuffled = randomizedQuestions.map(q => {
              const rawOpts = q.options_json || [];
              const randomizedOpts = shuffleArray(rawOpts);
              const displayKeys: Array<'A' | 'B' | 'C' | 'D'> = [
                'A',
                'B',
                'C',
                'D',
              ];

              const mappedOptions: ShuffledMcqOption[] = randomizedOpts.map(
                (opt, idx) => ({
                  displayKey: displayKeys[idx] || 'A',
                  originalKey: opt.key as 'A' | 'B' | 'C' | 'D',
                  text: opt.text,
                }),
              );

              return {
                ...q,
                options_json: mappedOptions,
              };
            });
          }

          set({
            activePart: 1,
            currentView: 'taking_test',
            mcqTimerActive: true,
            shuffledMcqQuestions: shuffled,
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
            shuffledMcqQuestions: null, // reset shuffle for next attempt
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

      setScores: scores => {
        set(state => ({
          scores: {
            ...(state.scores || {}),
            ...scores,
          },
        }));
      },

      setQuestionMatrixOpen: open => {
        set({ isQuestionMatrixOpen: open });
      },

      syncWithServer: (userId, data) => {
        set(state => {
          // Detect if a different user logged in on this browser session
          const isDifferentUser =
            state.currentUserId !== null && state.currentUserId !== userId;

          // Case 1: Server has NO submission for this user
          if (!data) {
            // If user changed OR if previous state had completed status (from an old session / other user),
            // completely reset to fresh start for this user!
            if (
              isDifferentUser ||
              state.mcqStatus === 'completed' ||
              state.essayStatus === 'completed'
            ) {
              return {
                currentUserId: userId,
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
                shuffledMcqQuestions: null,
                scores: null,
              };
            }
            // Same user, continuing local in-progress test draft:
            return {
              currentUserId: userId,
            };
          }

          // Case 2: Server has an existing submission for this user
          const serverAnswers = data.answers || {};
          const newAnswers = isDifferentUser
            ? serverAnswers
            : { ...state.answers, ...serverAnswers };

          const mcqTimeSpent = data.mcq_time_spent_seconds || 0;
          const essayTimeSpent = data.essay_time_spent_seconds || 0;

          const mcqLeft = isDifferentUser
            ? Math.max(0, 3600 - mcqTimeSpent)
            : mcqTimeSpent > 0 && state.mcqSecondsLeft === 3600
              ? Math.max(0, 3600 - mcqTimeSpent)
              : state.mcqSecondsLeft;

          const essayLeft = isDifferentUser
            ? Math.max(0, 4800 - essayTimeSpent)
            : essayTimeSpent > 0 && state.essaySecondsLeft === 4800
              ? Math.max(0, 4800 - essayTimeSpent)
              : state.essaySecondsLeft;

          const updatedScores: AssessmentScores = {
            mcqScore:
              data.mcq_score !== undefined
                ? Number(data.mcq_score)
                : isDifferentUser
                  ? undefined
                  : state.scores?.mcqScore,
            essayScore:
              data.essay_score !== undefined
                ? Number(data.essay_score)
                : isDifferentUser
                  ? undefined
                  : state.scores?.essayScore,
            totalScore:
              data.total_score !== undefined
                ? Number(data.total_score)
                : isDifferentUser
                  ? undefined
                  : state.scores?.totalScore,
            mcqTimeSpent:
              data.mcq_time_spent_seconds ??
              (isDifferentUser ? undefined : state.scores?.mcqTimeSpent),
            essayTimeSpent:
              data.essay_time_spent_seconds ??
              (isDifferentUser ? undefined : state.scores?.essayTimeSpent),
          };

          const newMcqStatus =
            data.mcq_status ||
            (isDifferentUser ? 'not_started' : state.mcqStatus);
          const newEssayStatus =
            data.essay_status ||
            (isDifferentUser ? 'not_started' : state.essayStatus);

          return {
            currentUserId: userId,
            answers: newAnswers,
            mcqStatus: newMcqStatus,
            essayStatus: newEssayStatus,
            mcqSecondsLeft: mcqLeft,
            essaySecondsLeft: essayLeft,
            scores: updatedScores,
            currentView:
              newMcqStatus === 'completed' || newEssayStatus === 'completed'
                ? 'part_selection'
                : isDifferentUser
                  ? 'test_overview'
                  : state.currentView,
            shuffledMcqQuestions: isDifferentUser
              ? null
              : state.shuffledMcqQuestions,
          };
        });
      },

      resetAll: () => {
        set({
          currentUserId: null,
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
          shuffledMcqQuestions: null,
          scores: null,
        });
      },
    }),
    {
      name: 'ptham_assessment_draft_v3',
      partialize: state => ({
        currentUserId: state.currentUserId,
        currentView: state.currentView,
        answers: state.answers,
        activePart: state.activePart,
        mcqSecondsLeft: state.mcqSecondsLeft,
        essaySecondsLeft: state.essaySecondsLeft,
        mcqStatus: state.mcqStatus,
        essayStatus: state.essayStatus,
        shuffledMcqQuestions: state.shuffledMcqQuestions,
        scores: state.scores,
      }),
    },
  ),
);
