// ============================================================================
// Vocabulary Study Types
// ============================================================================

export interface VocabWord {
  id?: number;
  hira: string;
  kanji?: string;
  mean: string;
  hanViet?: string;
  ex?: string;
  under?: string;
  exVi?: string;
  audioUrl?: string;
  isStarred?: boolean;
  isMemorized?: boolean;
  score?: number;
}

export interface LessonData {
  words: VocabWord[];
}

export type VocabLevel = 'n5' | 'n4' | 'n3' | 'n2' | 'n1';
export type StudySection = 'vocab' | 'speak';
