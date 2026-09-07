export type JlptLevel = 'n5' | 'n4' | 'n3' | 'n2' | 'n1';

export const JLPT_LEVEL_RANKS: Record<JlptLevel, number> = {
  n5: 1,
  n4: 2,
  n3: 3,
  n2: 4,
  n1: 5,
};

export const JLPT_LEVEL_LABELS: Record<JlptLevel, string> = {
  n5: 'JLPT N5',
  n4: 'JLPT N4',
  n3: 'JLPT N3',
  n2: 'JLPT N2',
  n1: 'JLPT N1',
};

/**
 * Normalizes input string to a valid JlptLevel or defaults to 'n5'.
 */
export function normalizeLevel(level?: string | null): JlptLevel {
  const clean = (level || '').toLowerCase().trim();
  if (clean in JLPT_LEVEL_RANKS) {
    return clean as JlptLevel;
  }
  return 'n5';
}

export interface PermissionCheckParams {
  userLevel?: string | null;
  lessonLevel?: string | null;
  isAdmin?: boolean | number | null;
  canWatchVideo?: boolean | number | null;
}

/**
 * Checks if a user has permission to watch a lesson based on their level hierarchy:
 * N5 can watch: N5
 * N4 can watch: N4, N5
 * N3 can watch: N3, N4, N5
 * N2 can watch: N2, N3, N4, N5
 * N1 can watch: N1, N2, N3, N4, N5
 * Admin can watch all levels.
 */
export function canAccessLesson({
  userLevel,
  lessonLevel,
  isAdmin,
  canWatchVideo,
}: PermissionCheckParams): boolean {
  if (Boolean(isAdmin)) return true;
  if (!Boolean(canWatchVideo)) return false;

  const userRank = JLPT_LEVEL_RANKS[normalizeLevel(userLevel)];
  const lessonRank = JLPT_LEVEL_RANKS[normalizeLevel(lessonLevel)];

  return userRank >= lessonRank;
}
