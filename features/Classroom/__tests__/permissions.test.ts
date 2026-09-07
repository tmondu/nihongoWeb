import {
  canAccessLesson,
  normalizeLevel,
} from '@/features/Classroom/lib/permissions';

describe('Classroom Level Permissions', () => {
  it('should normalize levels correctly', () => {
    expect(normalizeLevel('N5')).toBe('n5');
    expect(normalizeLevel('n4')).toBe('n4');
    expect(normalizeLevel('  N3  ')).toBe('n3');
    expect(normalizeLevel('invalid')).toBe('n5');
    expect(normalizeLevel(null)).toBe('n5');
  });

  it('N5 student should only access N5 lessons', () => {
    const params = { userLevel: 'n5', canWatchVideo: 1 };
    expect(canAccessLesson({ ...params, lessonLevel: 'n5' })).toBe(true);
    expect(canAccessLesson({ ...params, lessonLevel: 'n4' })).toBe(false);
    expect(canAccessLesson({ ...params, lessonLevel: 'n3' })).toBe(false);
    expect(canAccessLesson({ ...params, lessonLevel: 'n2' })).toBe(false);
    expect(canAccessLesson({ ...params, lessonLevel: 'n1' })).toBe(false);
  });

  it('N4 student should access N4 and N5 lessons', () => {
    const params = { userLevel: 'n4', canWatchVideo: 1 };
    expect(canAccessLesson({ ...params, lessonLevel: 'n5' })).toBe(true);
    expect(canAccessLesson({ ...params, lessonLevel: 'n4' })).toBe(true);
    expect(canAccessLesson({ ...params, lessonLevel: 'n3' })).toBe(false);
    expect(canAccessLesson({ ...params, lessonLevel: 'n2' })).toBe(false);
    expect(canAccessLesson({ ...params, lessonLevel: 'n1' })).toBe(false);
  });

  it('N3 student should access N3, N4 and N5 lessons', () => {
    const params = { userLevel: 'n3', canWatchVideo: 1 };
    expect(canAccessLesson({ ...params, lessonLevel: 'n5' })).toBe(true);
    expect(canAccessLesson({ ...params, lessonLevel: 'n4' })).toBe(true);
    expect(canAccessLesson({ ...params, lessonLevel: 'n3' })).toBe(true);
    expect(canAccessLesson({ ...params, lessonLevel: 'n2' })).toBe(false);
    expect(canAccessLesson({ ...params, lessonLevel: 'n1' })).toBe(false);
  });

  it('N2 student should access N2, N3, N4, and N5 lessons', () => {
    const params = { userLevel: 'n2', canWatchVideo: 1 };
    expect(canAccessLesson({ ...params, lessonLevel: 'n5' })).toBe(true);
    expect(canAccessLesson({ ...params, lessonLevel: 'n4' })).toBe(true);
    expect(canAccessLesson({ ...params, lessonLevel: 'n3' })).toBe(true);
    expect(canAccessLesson({ ...params, lessonLevel: 'n2' })).toBe(true);
    expect(canAccessLesson({ ...params, lessonLevel: 'n1' })).toBe(false);
  });

  it('N1 student should access all levels', () => {
    const params = { userLevel: 'n1', canWatchVideo: 1 };
    expect(canAccessLesson({ ...params, lessonLevel: 'n5' })).toBe(true);
    expect(canAccessLesson({ ...params, lessonLevel: 'n4' })).toBe(true);
    expect(canAccessLesson({ ...params, lessonLevel: 'n3' })).toBe(true);
    expect(canAccessLesson({ ...params, lessonLevel: 'n2' })).toBe(true);
    expect(canAccessLesson({ ...params, lessonLevel: 'n1' })).toBe(true);
  });

  it('Admin should access all lessons regardless of canWatchVideo', () => {
    expect(
      canAccessLesson({
        isAdmin: true,
        canWatchVideo: 0,
        userLevel: 'n5',
        lessonLevel: 'n1',
      }),
    ).toBe(true);
  });

  it('User without canWatchVideo permission cannot access any lesson', () => {
    expect(
      canAccessLesson({
        canWatchVideo: 0,
        userLevel: 'n1',
        lessonLevel: 'n5',
      }),
    ).toBe(false);
  });
});
