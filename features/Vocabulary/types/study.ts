// ============================================================================
// Vocabulary Study Types
// ============================================================================

export interface VocabWord {
  hira: string;
  kanji?: string;
  mean: string;
  ex?: string;
  under?: string;
  exVi?: string;
}

export interface LessonData {
  words: VocabWord[];
}

export type VocabLevel = 'n5' | 'n4' | 'n3' | 'n2' | 'n1';
export type StudySection = 'vocab' | 'speak';
