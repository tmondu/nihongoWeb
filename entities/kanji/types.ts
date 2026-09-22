export interface IKanjiExample {
  japanese: string;
  reading?: string;
  meaning: string;
}

export interface IKanjiObj {
  id: number;
  kanjiChar: string;
  onyomi: string[];
  kunyomi: string[];
  meanings: string[];
  hanviet?: string;
  examples?: IKanjiExample[];
}

export type KanjiLevel = 'n5' | 'n4' | 'n3' | 'n2' | 'n1';
