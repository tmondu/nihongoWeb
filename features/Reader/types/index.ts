export type JLPTLevelFilter = 'All' | 'N5' | 'N4' | 'N3' | 'N2' | 'N1';

export interface PresetArticle {
  id: string;
  title: string;
  titleVi: string;
  level: JLPTLevelFilter;
  category: string;
  description: string;
  content: string;
}

export interface ReaderToken {
  id: string;
  surface: string;
  reading?: string;
  basicForm?: string;
  pos: string;
  posDetail?: string;
  hanViet?: string;
  sentenceIndex: number;
  tokenIndex: number;
}

export interface WordPronunciation {
  kana: string;
  accent?: string;
  tokenizedKana?: { value: string; type?: string }[];
}

export interface WordLookupDetail {
  word: string;
  reading?: string;
  hanViet?: string;
  pos?: string;
  means: string[];
  pronunciations?: WordPronunciation[];
  examples?: {
    content: string;
    mean: string;
  }[];
}

export interface MinedSentence {
  id: string;
  sentence: string;
  targetWord: string;
  reading?: string;
  hanViet?: string;
  meaning?: string;
  articleTitle?: string;
  createdAt: number;
}
