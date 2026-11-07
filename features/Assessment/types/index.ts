export type AssessmentPart = 1 | 2; // 1: Trắc nghiệm (1-100), 2: Tự luận (101-200)

export type AssessmentStatus = 'not_started' | 'in_progress' | 'completed';

export interface AssessmentTest {
  id: number;
  slug: string;
  title: string;
  description?: string;
  total_questions: number;
  mcq_time_limit: number; // minutes (60)
  essay_time_limit: number; // minutes (80)
  is_active: number;
  created_at?: string;
}

export interface McqOption {
  key: 'A' | 'B' | 'C' | 'D';
  text: string;
}

export interface ShuffledMcqOption {
  displayKey: 'A' | 'B' | 'C' | 'D';
  originalKey: 'A' | 'B' | 'C' | 'D';
  text: string;
}

export interface ShuffledAssessmentQuestion extends Omit<
  AssessmentQuestion,
  'options_json'
> {
  options_json?: ShuffledMcqOption[] | null;
}

export interface AssessmentScores {
  part?: 1 | 2;
  mcqScore?: number;
  essayScore?: number;
  totalScore?: number;
  mcqTimeSpent?: number;
  essayTimeSpent?: number;
}

export interface AssessmentQuestion {
  id: number;
  test_id: number;
  part: AssessmentPart;
  question_type: string;
  context_sentence?: string | null;
  target_word?: string | null;
  kanji_char?: string | null;
  options_json?: McqOption[] | null;
  order_num: number;
  // Note: correct_answer, acceptable_answers, han_viet, meaning_vi, explanation are kept server-side only
}

export interface AssessmentSubmissionRecord {
  id: number;
  user_id: number;
  test_id: number;
  mcq_status: AssessmentStatus;
  essay_status: AssessmentStatus;
  overall_status: 'in_progress' | 'completed';
  mcq_score: number;
  essay_score: number;
  total_score: number;
  mcq_time_spent_seconds: number;
  essay_time_spent_seconds: number;
  answers_json: Record<number, string>;
  grading_details_json?: Record<
    number,
    {
      isCorrect: boolean;
      userAnswer: string;
      correctAnswer: string;
      explanation?: string;
    }
  >;
  completed_at?: string;
}

export interface StudentAnswers {
  // Key is question order_num (1..200)
  // For Q1-180: string
  // For Q181-200: JSON string { hanViet: string, meaning: string } or composite
  [questionNum: number]: string;
}
