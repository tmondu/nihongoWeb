export interface SolutionWrongOption {
  option: string;
  text: string;
}

export interface SolutionQuestion {
  id: string;
  globalNumber: number;
  questionNumber: number;
  sectionNumber?: number;
  sectionTitle?: string;
  partId: 'vocab' | 'grammar' | 'star' | 'passage' | 'kanji' | 'similar';
  partTitle: string;
  questionText: string;
  correctOption: string;
  correctText: string;
  hanviet: string | null;
  meaning: string;
  explanation: string;
  conclusion: string | null;
  wrongOptions: SolutionWrongOption[];
  starPositions?: string[];
  note: string | null;
  starOrder: string | null;
  fullSentence: string | null;
}

export interface SolutionSectionSummary {
  sectionNumber: number;
  sectionTitle: string;
  questionRange: string;
  questions: {
    questionNumber: number;
    globalNumber: number;
    correctOption: string;
    note?: string | null;
  }[];
}

export interface SolutionExam {
  id: string;
  level: 'n5' | 'n4' | 'n3' | 'n2' | 'n1';
  examNumber: number;
  title: string;
  subtitle: string;
  author: string;
  watermarkImage: string;
  totalPages: number;
  sections?: SolutionSectionSummary[];
  quickAnswerSummary: {
    vocab: { qNum: number; answer: string }[];
    grammar: { qNum: number; answer: string }[];
  };
  passageSection?: {
    fullText: string;
    translation: string;
  };
  questions: SolutionQuestion[];
}
