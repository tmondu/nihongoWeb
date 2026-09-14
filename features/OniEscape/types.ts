export type GameState = 'LOBBY' | 'PLAYING' | 'PAUSED' | 'GAME_OVER';

export type JLPTLevel = 'n5' | 'n4' | 'n3' | 'n2' | 'n1';

export type Difficulty = 'EASY' | 'NORMAL' | 'HARD';

export interface OniWordItem {
  id: string;
  word: string;
  reading: string;
  romaji: string;
  meaning: string;
}

export interface WordHistoryItem {
  word: string;
  reading: string;
  meaning: string;
  correct: boolean;
}

export interface GameStats {
  score: number;
  wordsCompleted: number;
  wpm: number;
  accuracy: number;
  distance: number; // in meters
  currentStreak: number;
  maxStreak: number;
  wordsHistory: WordHistoryItem[];
}
