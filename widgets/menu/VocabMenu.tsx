'use client';

import { useEffect } from 'react';
import Info from '@/shared/ui-composite/Menu/Info';
import TrainingActionBar from '@/shared/ui-composite/Menu/TrainingActionBar';
import UnitSelector from '@/shared/ui-composite/Menu/UnitSelector';
import {
  VocabCards,
  VocabInlineSearch,
  ThamTuVungModal,
  useVocabSelection,
} from '@/features/Vocabulary';
import useVocabStore from '@/features/Vocabulary/store/useVocabStore';
import { vocabDataService } from '@/features/Vocabulary/services/vocabDataService';
import { useMenuSelectorStore } from '@/shared/ui-composite/Menu/store/useMenuSelectorStore';

const PRELOAD_FLAG = 'vocab-preload-complete';

type VocabMenuProps = {
  fixedCollection?: 'n5' | 'n4' | 'n3' | 'n2' | 'n1';
  hideUnitSelector?: boolean;
};

const VocabMenu = ({
  fixedCollection,
  hideUnitSelector = false,
}: VocabMenuProps) => {
  const vocabSelection = useVocabSelection();
  const selectedVocabCollection = vocabSelection.selectedCollection;
  const setVocabCollection = vocabSelection.setCollection;
  const clearVocab = vocabSelection.clearVocab;
  const clearVocabSets = vocabSelection.clearSets;
  const searchQuery = useVocabStore(state => state.searchQuery);
  const isSearching = searchQuery.trim().length > 0;

  const setPersistedCollectionSelection = useMenuSelectorStore(
    state => state.setCollectionSelection,
  );

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (sessionStorage.getItem(PRELOAD_FLAG)) return;

    sessionStorage.setItem(PRELOAD_FLAG, 'true');
    void vocabDataService.preloadAll();
  }, []);

  useEffect(() => {
    if (!fixedCollection) return;
    if (selectedVocabCollection === fixedCollection) return;

    setVocabCollection(fixedCollection);
    clearVocab();
    clearVocabSets();
    setPersistedCollectionSelection('vocabulary', {
      selectedCollection: fixedCollection,
      selectedSubunitByUnit: {},
    });
  }, [
    fixedCollection,
    selectedVocabCollection,
    setVocabCollection,
    clearVocab,
    clearVocabSets,
    setPersistedCollectionSelection,
  ]);

  return (
    <>
      <div className='flex flex-col gap-4'>
        <Info />
        <VocabInlineSearch />
        {!isSearching && !hideUnitSelector && <UnitSelector />}
        {!isSearching && <VocabCards />}
      </div>
      <ThamTuVungModal />
      <TrainingActionBar currentDojo='vocabulary' />
    </>
  );
};

export default VocabMenu;
