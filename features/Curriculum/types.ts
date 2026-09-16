export type CurriculumLevel = 'n5' | 'n4' | 'n3' | 'n2' | 'n1';

export interface ThamLesson {
  id: number;
  lesson_num: number;
  title_vi: string;
  title_ja: string;
  description?: string | null;
  level: CurriculumLevel;
  book_vol: 1 | 2 | 3 | 4 | 5;
  vocab_count: number;
  grammar_count: number;
  order_num?: number;
  // User progress overlays
  is_locked?: boolean;
  is_completed?: boolean;
  grammar_completed?: number;
  vocab_completed?: boolean;
  quiz_score?: number;
}

export interface ThamVocabulary {
  id: number;
  lesson_num: number;
  kanji?: string | null;
  kana: string;
  word_ja?: string;
  reading_kana?: string;
  romaji: string;
  meaning_vi: string;
  word_type?: string | null;
  example_ja?: string | null;
  example_vi?: string | null;
  order_num?: number;
}

export interface ThamGrammarExample {
  ja: string;
  kana: string;
  vi: string;
  romaji?: string;
}

export interface ThamGrammarPoint {
  id: number;
  lesson_num: number;
  title: string;
  summary_vi: string;
  structure?: string | null;
  explanation_vi: string;
  examples: ThamGrammarExample[];
  order_num?: number;
}

export interface ThamLessonDetail extends ThamLesson {
  vocabularies: ThamVocabulary[];
  grammar_points: ThamGrammarPoint[];
}

export interface ThamUserProgress {
  lesson_num: number;
  grammar_completed: number;
  vocab_completed: boolean;
  quiz_score: number;
  completed_at: string | null;
}
