'use client';

import { ModernVocabContainer } from '@/features/Vocabulary';
import type { VocabLevel } from '@/features/Vocabulary/types/study';

type VocabMenuProps = {
  fixedCollection?: VocabLevel;
  hideUnitSelector?: boolean;
};

const VocabMenu = ({ fixedCollection }: VocabMenuProps) => {
  return <ModernVocabContainer fixedLevel={fixedCollection} />;
};

export default VocabMenu;
