import { adminDb } from '../../firebase-admin';
import { COLLECTIONS } from '../../constants/collections';

/**
 * Calculates a weighted trust score (0-100) for a user.
 * 
 * Weights:
 * - 40% Average Rating
 * - 20% Response Rate
 * - 20% Completed Transactions
 * - 10% Account Age
 * - 10% KYC Verification
 */
export async function calculateTrustScore(uid: string): Promise<number> {
  try {
    const userDoc = await adminDb.collection(COLLECTIONS.USERS).doc(uid).get();
    const profileDoc = await adminDb.collection(COLLECTIONS.PUBLIC_PROFILES).doc(uid).get();

    if (!userDoc.exists || !profileDoc.exists) return 50; // Default score

    const userData = userDoc.data() || {};
    const profileData = profileDoc.data() || {};

    // 1. Average Rating (40%)
    const avgRating = profileData.stats?.averageRating || 0;
    const ratingScore = (avgRating / 5) * 100 * 0.40;

    // 2. Response Rate (20%)
    // Assuming responseRate is stored as a percentage (0-100)
    const responseRate = userData.responseRate || 70; // Default 70%
    const responseScore = responseRate * 0.20;

    // 3. Completed Transactions (20%)
    // Benchmark: 50 completed transactions = 100% score for this component
    const completedCount = userData.completedTransactionsCount || 0;
    const transactionScore = Math.min((completedCount / 50) * 100, 100) * 0.20;

    // 4. Account Age (10%)
    // Benchmark: 1 year (365 days) = 100% score for this component
    const createdAt = userData.createdAt ? new Date(userData.createdAt) : new Date();
    const now = new Date();
    const ageInDays = Math.floor((now.getTime() - createdAt.getTime()) / (1000 * 60 * 60 * 24));
    const ageScore = Math.min((ageInDays / 365) * 100, 100) * 0.10;

    // 5. KYC Verification (10%)
    const isVerified = userData.verificationStatus === 'approved';
    const kycScore = (isVerified ? 100 : 0) * 0.10;

    const totalScore = Math.round(ratingScore + responseScore + transactionScore + ageScore + kycScore);

    return Math.max(0, Math.min(100, totalScore));
  } catch (error) {
    console.error(`Error calculating trust score for ${uid}:`, error);
    return 50; // Fallback
  }
}
