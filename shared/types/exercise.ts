export interface ExerciseQuestion {
  id: number | string;
  passage_title?: string;
  passage?: string;
  question: string;
  options: string[]; // 4 options
  correct_answer: string; // 'A' | 'B' | 'C' | 'D' or option text
  explanation?: string;
}

export type PublicQuestion = Omit<
  ExerciseQuestion,
  'correct_answer' | 'explanation'
>;

export interface ExerciseRecord {
  id: number;
  title: string;
  description?: string | null;
  level: 'n5' | 'n4' | 'n3' | 'n2' | 'n1' | string;
  time_limit: number; // minutes, 0 = unlimited
  questions: ExerciseQuestion[];
  is_published: boolean | number;
  created_at: string;
  updated_at?: string;
  total_questions?: number;
  submissions_count?: number;
  user_best_score?: number | null;
}

export interface ExercisePublic {
  id: number;
  title: string;
  description?: string | null;
  level: string;
  time_limit: number;
  questions: PublicQuestion[];
  total_questions: number;
  user_best_score?: number | null;
}

export interface ExerciseSubmissionRecord {
  id: number;
  exercise_id: number;
  exercise_title?: string;
  exercise_level?: string;
  user_id: number;
  user_email?: string;
  score: number;
  total_questions: number;
  percentage: number;
  answers: Record<string, string>;
  time_spent: number; // in seconds
  created_at: string;
}

export interface QuestionResultItem {
  id: number | string;
  passage_title?: string;
  passage?: string;
  question: string;
  options: string[];
  user_answer: string;
  correct_answer: string;
  is_correct: boolean;
  explanation?: string;
}

export interface SubmitExerciseResponse {
  success: boolean;
  score: number;
  total_questions: number;
  percentage: number;
  time_spent: number;
  passed: boolean;
  questions_result: QuestionResultItem[];
}
