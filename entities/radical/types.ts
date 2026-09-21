export type RadicalLayer = 'core' | 'extended' | 'rare';

export interface IRadical {
  id: number;
  char: string;
  altForms: string[];
  strokeCount: number;
  hanviet: string;
  meaning_vi: string;
  meaning_en: string;
  layer: RadicalLayer;
  exampleKanji: string[];
}

export type KanjiStructure =
  | 'left-right'
  | 'top-bottom'
  | 'enclosure'
  | 'triangular'
  | 'solo';

export interface IKanjiComposition {
  kanji: string;
  hanviet: string;
  meanings: string[];
  onyomi: string[];
  kunyomi: string[];
  radicals: string[];
  radicalNames: string[];
  radicalIds: number[];
  primaryRadical: number;
  structure: KanjiStructure;
  story: string;
  level?: string;
}
