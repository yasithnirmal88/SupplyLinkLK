import { useCallback, useEffect, useMemo, useState } from 'react';
import { doc, getDoc, getDocFromCache, getDocFromServer } from 'firebase/firestore';
import { db } from '../../services/firebase';
import { COLLECTIONS } from '../../constants/Collections';
import type { PublicProfile } from '@supplylink/shared-types';

const profileCache = new Map<string, PublicProfile>();
const pendingProfileRequests = new Map<string, Promise<PublicProfile | null>>();

async function fetchPublicProfileFromFirestore(
  uid: string,
  source: 'cache' | 'default'
): Promise<PublicProfile | null> {
  const profileRef = doc(db, COLLECTIONS.PUBLIC_PROFILES, uid);
  try {
    let snapshot;
    if (source === 'cache') {
      snapshot = await getDocFromCache(profileRef);
    } else if (source === 'default') {
      // try server first, fallback to cache
      try {
        snapshot = await getDocFromServer(profileRef);
      } catch (e) {
        snapshot = await getDoc(profileRef);
      }
    } else {
      snapshot = await getDoc(profileRef);
    }

    if (!snapshot || !snapshot.exists()) return null;
    return snapshot.data() as PublicProfile;
  } catch (err) {
    return null;
  }
}

async function loadPublicProfile(uid: string): Promise<PublicProfile | null> {
  if (profileCache.has(uid)) {
    return profileCache.get(uid)!;
  }

  if (pendingProfileRequests.has(uid)) {
    return pendingProfileRequests.get(uid)!;
  }

  const request = (async () => {
    try {
      let profile = null;

      try {
        profile = await fetchPublicProfileFromFirestore(uid, 'cache');
      } catch {
        profile = null;
      }

      if (!profile) {
        profile = await fetchPublicProfileFromFirestore(uid, 'default');
      }

      if (profile) {
        profileCache.set(uid, profile);
      }

      return profile;
    } finally {
      pendingProfileRequests.delete(uid);
    }
  })();

  pendingProfileRequests.set(uid, request);
  return request;
}

export function usePublicProfile(uid?: string) {
  const initialProfile = useMemo(
    () => (uid && profileCache.has(uid) ? profileCache.get(uid)! : null),
    [uid]
  );

  const [profile, setProfile] = useState<PublicProfile | null>(initialProfile);
  const [loading, setLoading] = useState<boolean>(Boolean(uid && !initialProfile));
  const [error, setError] = useState<Error | null>(null);

  const refresh = useCallback(async () => {
    if (!uid) {
      setProfile(null);
      setError(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      profileCache.delete(uid);
      const publicProfile = await loadPublicProfile(uid);
      setProfile(publicProfile);
    } catch (fetchError) {
      setError(fetchError as Error);
    } finally {
      setLoading(false);
    }
  }, [uid]);

  useEffect(() => {
    if (!uid) {
      setProfile(null);
      setLoading(false);
      return;
    }

    let active = true;

    const load = async () => {
      setLoading(true);
      setError(null);

      try {
        const publicProfile = await loadPublicProfile(uid);
        if (!active) return;
        setProfile(publicProfile);
      } catch (fetchError) {
        if (!active) return;
        setError(fetchError as Error);
      } finally {
        if (!active) return;
        setLoading(false);
      }
    };

    load();

    return () => {
      active = false;
    };
  }, [uid]);

  return {
    profile,
    loading,
    error,
    refresh,
  };
}
