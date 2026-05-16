import { useCallback, useEffect, useRef, useState } from 'react';
import {
  collection,
  getDocs,
  limit,
  orderBy,
  query,
  QueryDocumentSnapshot,
  startAfter,
  where,
  DocumentData,
} from 'firebase/firestore';
import { db } from '../../services/firebase';
import { COLLECTIONS } from '../../constants/Collections';
import type { DemandPost, SupplyAd } from '@supplylink/shared-types';

type ListingType = 'supply' | 'demand';

const PAGE_SIZE = 10;

function getListingConfig(listingType: ListingType) {
  if (listingType === 'supply') {
    return {
      collectionPath: COLLECTIONS.SUPPLY_ADS,
      ownerField: 'supplierId',
      statusField: 'status',
      activeStatus: 'active',
    };
  }

  return {
    collectionPath: COLLECTIONS.DEMAND_POSTS,
    ownerField: 'businessId',
    statusField: 'status',
    activeStatus: 'open',
  };
}

interface UseSellerListingsResult<T> {
  items: T[];
  loading: boolean;
  loadingMore: boolean;
  hasMore: boolean;
  error: Error | null;
  refresh: () => Promise<void>;
  loadMore: () => Promise<void>;
}

export function useSellerListings(
  ownerId: string | undefined,
  listingType: ListingType
): UseSellerListingsResult<SupplyAd | DemandPost> {
  const [items, setItems] = useState<Array<SupplyAd | DemandPost>>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [loadingMore, setLoadingMore] = useState<boolean>(false);
  const [hasMore, setHasMore] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  const lastDocRef = useRef<QueryDocumentSnapshot<DocumentData> | null>(null);

  const config = getListingConfig(listingType);

  const fetchPage = useCallback(
    async (fetchNextPage: boolean) => {
      if (!ownerId) {
        setItems([]);
        setHasMore(false);
        setLoading(false);
        setLoadingMore(false);
        setError(null);
        lastDocRef.current = null;
        return;
      }

      if (fetchNextPage && (!hasMore || loadingMore)) {
        return;
      }

      const isInitial = !fetchNextPage;
      if (isInitial) {
        setLoading(true);
        setError(null);
        lastDocRef.current = null;
      } else {
        setLoadingMore(true);
      }

      try {
        const listQuery = query(
          collection(db, config.collectionPath),
          where(config.ownerField, '==', ownerId),
          where(config.statusField, '==', config.activeStatus),
          orderBy('createdAt', 'desc'),
          limit(PAGE_SIZE),
          ...(lastDocRef.current && fetchNextPage ? [startAfter(lastDocRef.current)] : [])
        );

        const snapshot = await getDocs(listQuery);
        const fetchedItems = snapshot.docs.map((doc) => ({
          ...doc.data(),
        })) as Array<SupplyAd | DemandPost>;

        if (fetchNextPage) {
          setItems((prevItems) => [...prevItems, ...fetchedItems]);
        } else {
          setItems(fetchedItems);
        }

        lastDocRef.current = snapshot.docs[snapshot.docs.length - 1] ?? null;
        setHasMore(snapshot.docs.length === PAGE_SIZE);
      } catch (fetchError) {
        setError(fetchError as Error);
      } finally {
        if (isInitial) {
          setLoading(false);
        } else {
          setLoadingMore(false);
        }
      }
    },
    [config.collectionPath, config.ownerField, config.statusField, config.activeStatus, hasMore, loadingMore, ownerId]
  );

  const refresh = useCallback(async () => {
    setHasMore(true);
    await fetchPage(false);
  }, [fetchPage]);

  const loadMore = useCallback(async () => {
    if (!hasMore || loadingMore || loading) return;
    await fetchPage(true);
  }, [fetchPage, hasMore, loading, loadingMore]);

  useEffect(() => {
    refresh();
  }, [ownerId, listingType, refresh]);

  return {
    items,
    loading,
    loadingMore,
    hasMore,
    error,
    refresh,
    loadMore,
  };
}
