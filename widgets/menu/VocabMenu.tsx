'use client';

import {
  ModernVocabContainer,
  VocabTabsContainer,
} from '@/features/Vocabulary';
import type { VocabLevel } from '@/features/Vocabulary/types/study';

type VocabMenuProps = {
  fixedCollection?: VocabLevel;
  hideUnitSelector?: boolean;
};

const VocabMenu = ({ fixedCollection }: VocabMenuProps) => {
  if (!fixedCollection) return <VocabTabsContainer />;
  return <ModernVocabContainer fixedLevel={fixedCollection} />;
};

export default VocabMenu;
