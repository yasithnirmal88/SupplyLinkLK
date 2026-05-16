import { adminDb } from '../../firebase-admin';
import { COLLECTIONS } from '../../constants/collections';
import { calculateTrustScore } from './trustScoreService';
import { sendNotification } from '../notificationService';

/**
 * Handles incremental updates of seller metrics and badge assignments.
 * Avoids full recalculation by performing atomic/batched updates.
 */
export async function updateSellerMetrics(uid: string, newRating: number): Promise<any> {
  const profileRef = adminDb.collection(COLLECTIONS.PUBLIC_PROFILES).doc(uid);
  const userRef = adminDb.collection(COLLECTIONS.USERS).doc(uid);

  return await adminDb.runTransaction(async (transaction) => {
    const profileDoc = await transaction.get(profileRef);
    const userDoc = await transaction.get(userRef);

    if (!profileDoc.exists || !userDoc.exists) {
      throw new Error('User profile not found for aggregation');
    }

    const profileData = profileDoc.data() || {};
    const userData = userDoc.data() || {};
    
    // 1. Incremental Rating Update
    const stats = profileData.stats || { averageRating: 0, totalReviews: 0, ratingSum: 0 };
    const newTotalReviews = (stats.totalReviews || 0) + 1;
    const newRatingSum = (stats.ratingSum || 0) + newRating;
    const newAverageRating = Number((newRatingSum / newTotalReviews).toFixed(1));

    // 2. Fetch/Calculate Components for Trust Score & Badges
    const responseRate = userData.responseRate || 0;
    const completedTransactions = userData.completedTransactionsCount || 0;
    
    // 3. Evaluate Badges
    const badges: string[] = [];
    
    if (userData.verificationStatus === 'approved') {
      badges.push('KYC Verified');
    }
    
    if (newAverageRating >= 4.5 && newTotalReviews >= 20) {
      badges.push('Trusted Seller');
    }
    
    if (responseRate >= 90) {
      badges.push('Fast Responder');
    }
    
    if (completedTransactions >= 50 && newAverageRating >= 4.8) {
      badges.push('Top Supplier');
    }

    // 4. Trigger Notifications for New Badges
    const oldBadges = profileData.badges || [];
    const newlyUnlocked = badges.filter(b => !oldBadges.includes(b));
    
    for (const badge of newlyUnlocked) {
      await sendNotification(uid, {
        title: 'Badge Unlocked! 🏆',
        body: `Congratulations! You've earned the "${badge}" badge.`,
        type: 'badge_unlocked',
        data: { badge }
      });
    }

    // 5. Update the profile document
    const updatedMetrics = {
      'stats.averageRating': newAverageRating,
      'stats.totalReviews': newTotalReviews,
      'stats.ratingSum': newRatingSum,
      badges: badges,
      updatedAt: new Date().toISOString(),
    };

    transaction.update(profileRef, updatedMetrics);

    // Note: Trust score calculation requires the updated metrics to be persisted, 
    // but we can estimate it here or trigger it after the transaction.
    // For atomicity, we'll return the updated metrics so the controller can trigger the score sync.
    
    return {
      averageRating: newAverageRating,
      totalReviews: newTotalReviews,
      badges,
    };
  });
}

/**
 * Synchronizes the trust score to the user profile.
 */
export async function syncTrustScore(uid: string) {
  const score = await calculateTrustScore(uid);
  const profileRef = adminDb.collection(COLLECTIONS.PUBLIC_PROFILES).doc(uid);
  const profileDoc = await profileRef.get();
  const oldScore = profileDoc.data()?.trustScore || 0;

  await profileRef.update({
    trustScore: score,
    updatedAt: new Date().toISOString()
  });

  // Trigger Milestone Notifications
  const milestones = [75, 90, 100];
  const achievedMilestone = milestones.find(m => oldScore < m && score >= m);

  if (achievedMilestone) {
    await sendNotification(uid, {
      title: 'Trust Milestone Reached! 🚀',
      body: `Your trust score has reached ${achievedMilestone}! Your profile is now more visible to businesses.`,
      type: 'trust_milestone',
      data: { score }
    });
  }

  return score;
}
