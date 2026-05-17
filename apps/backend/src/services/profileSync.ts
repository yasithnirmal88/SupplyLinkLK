import { adminDb } from '../firebase-admin';
import { COLLECTIONS } from '../constants/collections';
import type { PublicProfile } from '@supplylink/shared-types';

const DEFAULT_FUTURE_FLAGS = {
  ratingEnabled: false,
  trustScoreEnabled: false,
  followersEnabled: false,
};

async function buildPublicProfileFromUser(
  uid: string,
  userData: FirebaseFirestore.DocumentData
): Promise<PublicProfile | null> {
  const role = userData.role;
  if (role !== 'supplier' && role !== 'business') {
    return null;
  }

  const supplierDoc = role === 'supplier'
    ? await adminDb.collection(COLLECTIONS.SUPPLIERS).doc(uid).get()
    : null;

  const businessDoc = role === 'business'
    ? await adminDb.collection(COLLECTIONS.BUSINESSES).doc(uid).get()
    : null;

  const categories = role === 'supplier' && supplierDoc?.exists
    ? (supplierDoc.data()?.supplyCategories as string[] | undefined)
    : undefined;

  const businessName = role === 'business' && businessDoc?.exists
    ? (businessDoc.data()?.businessName as string | undefined)
    : undefined;

  const languages = Array.isArray(userData.languages)
    ? userData.languages
    : userData.language
      ? [userData.language]
      : undefined;

  const stats = await generateUserStats(uid, role);

  return {
    uid,
    displayName: userData.displayName ?? '',
    photoURL: userData.avatarUrl ?? undefined,
    role,
    district: userData.district ?? '',
    bio: typeof userData.bio === 'string' ? userData.bio : undefined,
    businessName,
    categories,
    languages,
    verified: {
      kyc: userData.verificationStatus === 'approved' || userData.verificationStatus === true,
      business: role === 'business' && businessDoc?.exists === true,
      phone: Boolean(userData.phoneNumber),
    },
    memberSince: userData.createdAt ?? new Date().toISOString(),
    stats,
    future: DEFAULT_FUTURE_FLAGS,
  };
}

function safePublicProfilePayload(profile: PublicProfile): PublicProfile {
  return {
    uid: profile.uid,
    displayName: profile.displayName,
    photoURL: profile.photoURL,
    role: profile.role,
    district: profile.district,
    bio: profile.bio,
    businessName: profile.businessName,
    categories: profile.categories,
    languages: profile.languages,
    verified: profile.verified,
    memberSince: profile.memberSince,
    stats: profile.stats,
    future: profile.future,
  };
}

async function generateUserStats(uid: string, role: 'supplier' | 'business') {
  const activeListings = await countActiveListings(uid, role);
  const { acceptedOffers, totalOffers } = await countOfferStats(uid, role);
  const completedTransactions = acceptedOffers;
  const responseRate = totalOffers > 0
    ? Math.round((acceptedOffers / totalOffers) * 100)
    : 0;
  const averageResponseTime = await estimateAverageResponseTimeMinutes(uid);

  return {
    activeListings,
    completedTransactions,
    responseRate,
    averageResponseTime,
    responseTimeHours: Math.round(averageResponseTime / 60),
    averageRating: 0,
    totalReviews: 0,
    trustScore: 0,
    reliabilityScore: 0,
    repeatCustomers: 0,
  };
}

async function countActiveListings(uid: string, role: 'supplier' | 'business'): Promise<number> {
  if (role === 'supplier') {
    const snapshot = await adminDb
      .collection(COLLECTIONS.SUPPLY_ADS)
      .where('supplierId', '==', uid)
      .where('status', '==', 'active')
      .get();
    return snapshot.size;
  }

  const snapshot = await adminDb
    .collection(COLLECTIONS.DEMAND_POSTS)
    .where('businessId', '==', uid)
    .where('status', '==', 'open')
    .get();
  return snapshot.size;
}

async function countOfferStats(uid: string, role: 'supplier' | 'business') {
  const field = role === 'supplier' ? 'supplierId' : 'businessId';
  const offersRef = adminDb.collection(COLLECTIONS.OFFERS);
  const totalSnapshot = await offersRef.where(field, '==', uid).get();
  const acceptedSnapshot = await offersRef
    .where(field, '==', uid)
    .where('status', '==', 'accepted')
    .get();

  return {
    totalOffers: totalSnapshot.size,
    acceptedOffers: acceptedSnapshot.size,
  };
}

async function estimateAverageResponseTimeMinutes(uid: string): Promise<number> {
  try {
    const chatSnapshot = await adminDb
      .collection(COLLECTIONS.CHATS)
      .where('participants', 'array-contains', uid)
      .get();

    const responseIntervals: number[] = [];

    for (const chatDoc of chatSnapshot.docs.slice(0, 20)) {
      const messagesSnapshot = await adminDb
        .collection(COLLECTIONS.MESSAGES)
        .doc(chatDoc.id)
        .collection(COLLECTIONS.MESSAGES)
        .orderBy('createdAt', 'asc')
        .get();

      let pendingResponseAt: number | null = null;
      for (const messageDoc of messagesSnapshot.docs) {
        const message = messageDoc.data();
        const createdAt = new Date(message.createdAt).getTime();
        if (!createdAt || Number.isNaN(createdAt)) {
          continue;
        }

        if (message.senderId !== uid) {
          pendingResponseAt = createdAt;
          continue;
        }

        if (pendingResponseAt && message.senderId === uid) {
          responseIntervals.push((createdAt - pendingResponseAt) / 60000);
          pendingResponseAt = null;
        }
      }
    }

    if (responseIntervals.length === 0) {
      return 0;
    }

    const average = responseIntervals.reduce((sum, interval) => sum + interval, 0) / responseIntervals.length;
    return Math.max(0, Math.round(average));
  } catch (error) {
    console.warn('[ProfileSync] Response time estimation failed:', error);
    return 0;
  }
}

async function syncUserDocumentToPublicProfile(userDoc: FirebaseFirestore.QueryDocumentSnapshot) {
  const uid = userDoc.id;
  const userData = userDoc.data();
  const publicProfile = await buildPublicProfileFromUser(uid, userData);

  if (!publicProfile) {
    return;
  }

  const publicProfileRef = adminDb.collection(COLLECTIONS.PUBLIC_PROFILES).doc(uid);
  const existingProfileSnap = await publicProfileRef.get();
  const payload = safePublicProfilePayload(publicProfile);

  if (!existingProfileSnap.exists || JSON.stringify(existingProfileSnap.data()) !== JSON.stringify(payload)) {
    await publicProfileRef.set(payload, { merge: true });
    console.log(`[ProfileSync] publicProfiles/${uid} synced`);
  }
}

export async function initializePublicProfileSync(): Promise<void> {
  try {
    const usersRef = adminDb.collection(COLLECTIONS.USERS);

    usersRef.onSnapshot(async (snapshot) => {
      const tasks = snapshot.docChanges().map(async (change) => {
        if (change.type === 'added' || change.type === 'modified') {
          await syncUserDocumentToPublicProfile(change.doc);
        }
      });

      await Promise.all(tasks);
    }, (error) => {
      console.error('[ProfileSync] Firestore listener error:', error);
    });

    console.log('[ProfileSync] Listening for changes in users collection');
  } catch (error) {
    console.error('[ProfileSync] Failed to initialize public profile sync:', error);
  }
}
