export interface GrammarExample {
  ja: string;
  kana?: string;
  romaji?: string;
  vi: string;
}

export interface GrammarPointItem {
  id: number;
  lesson_num: number;
  title: string;
  summary_vi: string;
  structure: string | null;
  explanation_vi: string;
  nuance_notes?: string | null;
  examples: GrammarExample[];
  order_num: number;
  is_mastered?: boolean;
  is_starred?: boolean;
  user_notes?: string | null;
}

export interface LessonSummary {
  lesson_num: number;
  title_vi: string;
  title_ja: string;
  grammar_count: number;
}
