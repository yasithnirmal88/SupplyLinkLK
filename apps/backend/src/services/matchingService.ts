import { adminDb } from '../firebase-admin';
import { COLLECTIONS } from '../constants/collections';
import { sendNotification, broadcastNotification } from './notificationService';

const MATCH_LOOKBACK_DAYS = 30; // Don't scan older than 30 days for matches

/**
 * Service to handle marketplace matching and notifications.
 */

/**
 * When a Supplier posts a new ad: 
 * Notify Businesses who have active demand posts for that category/district.
 */
export async function notifyMatchesForSupplyAd(
  adId: string,
  category: string,
  district: string,
  itemName: string
) {
  try {
    const lookbackDate = new Date(Date.now() - MATCH_LOOKBACK_DAYS * 24 * 60 * 60 * 1000).toISOString();

    // 1. Find matching open demand posts (Optimized query)
    // We run two queries to handle 'Any District' vs Specific District efficiently
    const queries = [
      adminDb.collection(COLLECTIONS.DEMAND_POSTS)
        .where('category', '==', category)
        .where('status', '==', 'open')
        .where('districtPreference', '==', district)
        .where('createdAt', '>=', lookbackDate),
      adminDb.collection(COLLECTIONS.DEMAND_POSTS)
        .where('category', '==', category)
        .where('status', '==', 'open')
        .where('districtPreference', '==', 'Any District')
        .where('createdAt', '>=', lookbackDate)
    ];

    const snapshots = await Promise.all(queries.map(q => q.get()));
    const matchingBusinessIds = new Set<string>();

    snapshots.forEach(snap => {
      snap.forEach(doc => {
        matchingBusinessIds.add(doc.data().businessId);
      });
    });

    if (matchingBusinessIds.size === 0) return;

    // 2. Broadcast notifications
    await broadcastNotification(Array.from(matchingBusinessIds), {
      title: 'New Supply Found 🌿',
      body: `A supplier just posted ${itemName} in ${district}. Check it out!`,
      type: 'match_supply',
      relatedId: adId,
    });

    console.log(`[MatchingService] Notified ${matchingBusinessIds.size} businesses about Supply Ad ${adId}`);
  } catch (error) {
    console.error('[MatchingService] Error in notifyMatchesForSupplyAd:', error);
  }
}

/**
 * When a Business posts a new demand:
 * Notify Suppliers who have active ads for that category in the preferred district.
 */
export async function notifyMatchesForDemandPost(
  postId: string,
  category: string,
  districtPreference: string,
  itemName: string
) {
  try {
    const lookbackDate = new Date(Date.now() - MATCH_LOOKBACK_DAYS * 24 * 60 * 60 * 1000).toISOString();

    // 1. Find active supply ads
    let query = adminDb.collection(COLLECTIONS.SUPPLY_ADS)
      .where('category', '==', category)
      .where('status', '==', 'active')
      .where('createdAt', '>=', lookbackDate);

    // If a specific district is preferred, filter by it in Firestore
    if (districtPreference !== 'Any District') {
      query = query.where('district', '==', districtPreference);
    }

    const snapshot = await query.get();
    if (snapshot.empty) return;

    const matchingSupplierIds = Array.from(new Set(snapshot.docs.map(doc => doc.data().supplierId)));

    // 2. Broadcast notifications
    await broadcastNotification(matchingSupplierIds, {
      title: 'New Buyer Match 💰',
      body: `A business is looking for ${itemName} ${districtPreference !== 'Any District' ? 'near ' + districtPreference : ''}.`,
      type: 'match_demand',
      relatedId: postId,
    });

    console.log(`[MatchingService] Notified ${matchingSupplierIds.length} suppliers about Demand Post ${postId}`);
  } catch (error) {
    console.error('[MatchingService] Error in notifyMatchesForDemandPost:', error);
  }
}
