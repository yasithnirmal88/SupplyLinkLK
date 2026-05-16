import { useState, useEffect, useCallback } from 'react';
import { apiClient } from '../services/api';
import { auth } from '../services/firebase';
import { useRatingsStore } from '../../stores/ratingsStore';

export function useReviews(uid?: string) {
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [lastDocId, setLastDocId] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [metrics, setMetrics] = useState<any>(null);
  const { setMetrics: cacheMetrics, getMetrics: getCachedMetrics } = useRatingsStore();

  const fetchReviews = useCallback(async (isInitial: boolean) => {
    if (!uid) return;
    
    // Check cache for metrics if initial load
    if (isInitial) {
      const cached = getCachedMetrics(uid);
      if (cached) {
        setMetrics(cached);
        // We still fetch reviews but metrics are ready
      }
    }

    const cursor = isInitial ? '' : lastDocId;
    try {
      const response = await apiClient<any>(`/ratings/user/${uid}?lastDocId=${cursor}&limit=10`, {
        method: 'GET'
      });

      if (isInitial) {
        setReviews(response.reviews);
        setMetrics(response.metrics);
        cacheMetrics(uid, response.metrics);
      } else {
        setReviews(prev => [...prev, ...response.reviews]);
      }

      setLastDocId(response.pagination.lastDocId);
      setHasMore(response.pagination.hasMore);
    } catch (error) {
      console.error('Error fetching reviews:', error);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [uid]);

  useEffect(() => {
    setLoading(true);
    setLastDocId(null);
    fetchReviews(true);
  }, [uid, fetchReviews]);

  const loadMore = () => {
    if (hasMore && !loadingMore && lastDocId) {
      setLoadingMore(true);
      fetchReviews(false);
    }
  };

  const submitReview = async (rating: number, reviewText: string, transactionId: string) => {
    const currentUser = auth.currentUser;
    const token = currentUser ? await currentUser.getIdToken() : undefined;

    const response = await apiClient<any>('/ratings/create', {
      method: 'POST',
      token,
      body: {
        targetUserId: uid,
        rating,
        reviewText,
        transactionId,
      },
    });

    // Refresh metrics and top of list
    fetchReviews(true);
    return response;
  };

  return {
    reviews,
    metrics,
    loading,
    loadingMore,
    hasMore,
    loadMore,
    submitReview
  };
}
