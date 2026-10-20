export type JlptLevel = 'n5' | 'n4' | 'n3' | 'n2' | 'n1';
export type LessonVideoType = 'grammar' | 'exam_review';

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
  videoType?: LessonVideoType | string | null;
}

/**
 * Checks if a user has permission to watch a grammar lesson:
 * - Admin: always allowed
 * - Must have can_watch_video permission
 * - User level must be >= lesson level
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

/**
 * Checks if a user can access an exam_review lesson.
 * Rules:
 * - Admin: always allowed
 * - Any logged-in user (no can_watch_video requirement)
 * - User level must be >= lesson level (cannot watch above their level)
 */
export function canAccessExamReview({
  userLevel,
  lessonLevel,
  isAdmin,
}: Pick<
  PermissionCheckParams,
  'userLevel' | 'lessonLevel' | 'isAdmin'
>): boolean {
  if (Boolean(isAdmin)) return true;

  const userRank = JLPT_LEVEL_RANKS[normalizeLevel(userLevel)];
  const lessonRank = JLPT_LEVEL_RANKS[normalizeLevel(lessonLevel)];

  return userRank >= lessonRank;
}

/**
 * Unified access check that dispatches based on video type.
 */
export function canAccessLessonByType(params: PermissionCheckParams): boolean {
  if (params.videoType === 'exam_review') {
    return canAccessExamReview(params);
  }
  return canAccessLesson(params);
}
