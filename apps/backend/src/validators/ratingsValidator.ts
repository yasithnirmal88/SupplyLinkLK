import { z } from 'zod';
import { adminDb } from '../firebase-admin';
import { COLLECTIONS } from '../constants/collections';

// ─── Profanity List (Simple blacklist) ─────────────────────
const PROFANITY_LIST = [
  'profanity1',
  'profanity2',
  'badword1',
  'badword2',
];

const PROFANITY_REGEX = new RegExp(`\\b(${PROFANITY_LIST.join('|')})\\b`, 'gi');

export const RatingSchema = z.object({
  reviewerId: z.string().min(1, 'Reviewer ID is required'),
  targetUserId: z.string().min(1, 'Target user ID is required'),
  transactionId: z.string().min(1, 'Transaction ID is required'),
  rating: z.number().int().min(1, 'Rating must be at least 1').max(5, 'Rating must not exceed 5'),
  reviewText: z.string().trim().min(5, 'Review must be at least 5 characters').max(500, 'Review must not exceed 500 characters'),
});

export type RatingInput = z.infer<typeof RatingSchema>;

/**
 * Validates a rating request.
 * Performs schema validation and deep business logic checks (DB-dependent).
 */
export async function validateRatingRequest(data: unknown): Promise<{
  valid: boolean;
  error?: string;
  sanitized?: RatingInput;
}> {
  // 1. Schema Validation
  const result = RatingSchema.safeParse(data);
  if (!result.success) {
    return { valid: false, error: result.error.errors[0].message };
  }

  const ratingData = result.data;

  // 2. Self-Review Prevention
  if (ratingData.reviewerId === ratingData.targetUserId) {
    return { valid: false, error: 'You cannot review yourself' };
  }

  // 3. Profanity Filtering
  if (PROFANITY_REGEX.test(ratingData.reviewText)) {
    return { valid: false, error: 'Review contains inappropriate content' };
  }

  // 4. Completed Transaction Existence & Participation
  const offerRef = adminDb.collection(COLLECTIONS.OFFERS || 'offers').doc(ratingData.transactionId);
  const offerDoc = await offerRef.get();

  if (!offerDoc.exists) {
    return { valid: false, error: 'Transaction not found' };
  }

  const offer = offerDoc.data();
  if (!offer) {
    return { valid: false, error: 'Failed to retrieve transaction data' };
  }

  if (offer.status !== 'completed') {
    return { valid: false, error: 'You can only review completed transactions' };
  }

  // Ensure reviewer is part of the transaction
  const isParticipant = offer.supplierId === ratingData.reviewerId || offer.businessId === ratingData.reviewerId;
  if (!isParticipant) {
    return { valid: false, error: 'You are not a participant in this transaction' };
  }

  // Ensure target user is part of the transaction
  const isTargetParticipant = offer.supplierId === ratingData.targetUserId || offer.businessId === ratingData.targetUserId;
  if (!isTargetParticipant) {
    return { valid: false, error: 'The target user is not part of this transaction' };
  }

  // 5. Duplicate Review Prevention
  const existingReviewQuery = await adminDb.collection(COLLECTIONS.RATINGS || 'ratings')
    .where('transactionId', '==', ratingData.transactionId)
    .where('reviewerId', '==', ratingData.reviewerId)
    .limit(1)
    .get();

  if (!existingReviewQuery.empty) {
    return { valid: false, error: 'You have already reviewed this transaction' };
  }

  // 6. Rate Limiting: Prevent spam
  const recentSnapshot = await adminDb.collection(COLLECTIONS.RATINGS || 'ratings')
    .where('reviewerId', '==', ratingData.reviewerId)
    .orderBy('createdAt', 'desc')
    .limit(1)
    .get();

  if (!recentSnapshot.empty) {
    const lastReview = recentSnapshot.docs[0].data();
    const lastTime = new Date(lastReview.createdAt).getTime();
    const now = Date.now();
    if (now - lastTime < 60 * 1000) { // 1 minute
      return { valid: false, error: 'Please wait a minute before submitting another review.' };
    }
  }

  return { valid: true, sanitized: ratingData };
}
