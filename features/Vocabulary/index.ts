// ============================================================================
// Vocabulary Feature - Public API
// ============================================================================

// Facades (PRIMARY API - Use these in new code)
export { useVocabSelection } from './facade';
export type {
  VocabSelection,
  VocabSelectionActions,
  IVocabObj,
} from './facade';
export type { VocabLevel } from '@/entities/vocabulary';

// Components (page-level)
export { default as VocabularyGame } from './components/Game';
export { default as VocabCards } from './components';
export { default as VocabBlitz } from './components/Blitz';
export { default as VocabGauntlet } from './components/Gauntlet';
export { default as VocabInlineSearch } from './components/VocabInlineSearch';
export { default as ThamTuVungModal } from './components/ThamTuVungModal';

// ============================================================================
// PRIVATE - DO NOT IMPORT DIRECTLY
// ============================================================================
// - store/useVocabStore.ts (use useVocabSelection facade instead)
// - services/vocabDataService.ts (internal)
