import { create } from 'zustand';

interface RatingsMetrics {
  averageRating: number;
  totalReviews: number;
  trustScore: number;
  badges: string[];
  lastFetched: number;
}

interface RatingsState {
  metricsCache: Record<string, RatingsMetrics>;
  setMetrics: (uid: string, metrics: Omit<RatingsMetrics, 'lastFetched'>) => void;
  getMetrics: (uid: string) => RatingsMetrics | undefined;
}

export const useRatingsStore = create<RatingsState>((set, get) => ({
  metricsCache: {},
  setMetrics: (uid, metrics) => set((state) => ({
    metricsCache: {
      ...state.metricsCache,
      [uid]: { ...metrics, lastFetched: Date.now() }
    }
  })),
  getMetrics: (uid) => {
    const metrics = get().metricsCache[uid];
    if (!metrics) return undefined;
    
    // Cache expiry: 5 minutes
    const isExpired = Date.now() - metrics.lastFetched > 5 * 60 * 1000;
    return isExpired ? undefined : metrics;
  }
}));
