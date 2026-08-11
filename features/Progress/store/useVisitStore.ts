import { create } from 'zustand';
import localforage from 'localforage';
import { formatDate } from '../lib/streakCalculations';

const STORAGE_KEY = 'pthamss-visits';

interface VisitState {
  visits: string[]; // Array of "YYYY-MM-DD" date strings
  isLoaded: boolean;
  userId: string | null;

  // Actions
  loadVisits: () => Promise<void>;
  recordVisit: (date?: string) => Promise<void>;
  getVisits: () => string[];
}

const useVisitStore = create<VisitState>()((set, get) => ({
  visits: [],
  isLoaded: false,
  userId: null,

  loadVisits: async () => {
    let userId: string | null = null;
    if (typeof window !== 'undefined') {
      try {
        const response = await fetch('/api/auth/me');
        if (response.ok) {
          const user = await response.json();
          if (user && user.id) {
            userId = String(user.id);
          }
        }
      } catch {
        // Fallback silently (e.g. offline, not logged in, or test environment)
      }

      // Rehydrate user stats and achievements stores dynamically using user-scoped keys
      try {
        const [statsModule, achievementModule] = await Promise.all([
          import('./useStatsStore'),
          import('../../Achievements/store/useAchievementStore'),
        ]);

        const statsKey = userId ? `pthamss-stats-${userId}` : 'pthamss-stats';
        const achievementsKey = userId
          ? `pthamss-achievements-${userId}`
          : 'pthamss-achievements';

        statsModule.default.persist.setOptions({ name: statsKey });
        achievementModule.default.persist.setOptions({ name: achievementsKey });

        await Promise.all([
          statsModule.default.persist.rehydrate(),
          achievementModule.default.persist.rehydrate(),
        ]);
      } catch (err) {
        console.warn('Failed to dynamically rehydrate user stores:', err);
      }
    }

    const storageKey = userId ? `pthamss-visits-${userId}` : STORAGE_KEY;

    try {
      const storedVisits = await localforage.getItem<string[]>(storageKey);

      if (storedVisits && Array.isArray(storedVisits)) {
        // Filter out any invalid date strings
        const validVisits = storedVisits.filter(
          date => typeof date === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(date),
        );
        set({ visits: validVisits, userId, isLoaded: true });
      } else {
        set({ visits: [], userId, isLoaded: true });
      }
    } catch (error) {
      console.warn('Failed to load visits from LocalForage:', error);
      set({ visits: [], userId, isLoaded: true });
    }
  },

  recordVisit: async (date?: string) => {
    const dateToRecord = date || formatDate(new Date());
    const { visits, userId } = get();

    // Check if already recorded (idempotent)
    if (visits.includes(dateToRecord)) {
      return;
    }

    const newVisits = [...visits, dateToRecord];
    set({ visits: newVisits });

    const storageKey = userId ? `pthamss-visits-${userId}` : STORAGE_KEY;

    try {
      await localforage.setItem(storageKey, newVisits);
    } catch (error) {
      console.warn('Failed to save visit to LocalForage:', error);
    }
  },

  getVisits: () => get().visits,
}));

export default useVisitStore;
