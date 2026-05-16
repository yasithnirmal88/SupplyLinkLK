import { Response } from 'express';
import { adminDb, adminAuth } from '../../firebase-admin';
import { COLLECTIONS } from '../../constants/collections';
import { AuthenticatedRequest } from '../../middleware/auth';
import { validateRatingRequest } from '../../validators/ratingsValidator';
import { sendNotification } from '../../services/notificationService';
import { updateSellerMetrics, syncTrustScore } from '../../services/ratings/ratingsAggregationService';

/**
 * POST /api/v1/ratings/create
 * Creates a new rating and updates seller metrics.
 */
export async function submitRating(req: AuthenticatedRequest, res: Response) {
  try {
    const reviewerId = req.uid;
    if (!reviewerId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // 1. Validate request
    const validation = await validateRatingRequest({ ...req.body, reviewerId });
    if (!validation.valid || !validation.sanitized) {
      return res.status(400).json({ error: validation.error });
    }

    const { targetUserId, transactionId, rating, reviewText } = validation.sanitized;

    const now = new Date().toISOString();
    const ratingRef = adminDb.collection(COLLECTIONS.RATINGS).doc();

    // 2. Save Rating
    await ratingRef.set({
      ratingId: ratingRef.id,
      reviewerId,
      targetUserId,
      transactionId,
      rating,
      reviewText,
      createdAt: now,
    });

    // 3. Trigger Incremental Aggregation & Badge Logic
    const updatedMetrics = await updateSellerMetrics(targetUserId, rating);

    // 4. Sync Trust Score (Asynchronous)
    const newTrustScore = await syncTrustScore(targetUserId);

    // 5. Trigger Notification to Target User
    await sendNotification(targetUserId, {
      title: 'New Review Received! ⭐',
      body: `You received a ${rating}-star review: "${reviewText.substring(0, 50)}${reviewText.length > 50 ? '...' : ''}"`,
      type: 'new_rating',
      relatedId: ratingRef.id,
    });

    res.status(201).json({
      message: 'Rating submitted successfully',
      ratingId: ratingRef.id,
      metrics: {
        ...updatedMetrics,
        trustScore: newTrustScore,
      }
    });

  } catch (error: any) {
    console.error('Error submitting rating:', error);
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
}

/**
 * GET /api/v1/ratings/user/:uid
 * Returns paginated ratings and aggregate metrics for a user.
 */
export async function getUserRatings(req: AuthenticatedRequest, res: Response) {
  try {
    const { uid } = req.params;
    const lastDocId = req.query.lastDocId as string;
    const limit = parseInt(req.query.limit as string) || 10;

    if (!uid) {
      return res.status(400).json({ error: 'User ID is required' });
    }

    // 1. Fetch Aggregate Metrics from Public Profile
    const profileDoc = await adminDb.collection(COLLECTIONS.PUBLIC_PROFILES).doc(uid).get();
    if (!profileDoc.exists) {
      return res.status(404).json({ error: 'User not found' });
    }

    const profileData = profileDoc.data() || {};

    // 2. Build Paginated Reviews Query
    let query = adminDb.collection(COLLECTIONS.RATINGS)
      .where('targetUserId', '==', uid)
      .orderBy('createdAt', 'desc')
      .limit(limit);

    if (lastDocId) {
      const lastDoc = await adminDb.collection(COLLECTIONS.RATINGS).doc(lastDocId).get();
      if (lastDoc.exists) {
        query = query.startAfter(lastDoc);
      }
    }

    const ratingsQuery = await query.get();
    const reviews = ratingsQuery.docs.map(doc => doc.data());
    const newLastDocId = ratingsQuery.docs.length > 0 ? ratingsQuery.docs[ratingsQuery.docs.length - 1].id : null;

    res.status(200).json({
      metrics: {
        averageRating: profileData.stats?.averageRating || 0,
        totalReviews: profileData.stats?.totalReviews || 0,
        trustScore: profileData.trustScore || 0,
        badges: profileData.badges || [],
      },
      reviews,
      pagination: {
        lastDocId: newLastDocId,
        limit,
        count: reviews.length,
        hasMore: reviews.length === limit
      }
    });

  } catch (error: any) {
    console.error('Error fetching user ratings:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

/**
 * POST /api/v1/ratings/report
 * Allows users to report a rating.
 */
export async function reportRating(req: AuthenticatedRequest, res: Response) {
  try {
    const reporterId = req.uid;
    const { ratingId, reason, description } = req.body;

    if (!reporterId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    if (!ratingId || !reason) {
      return res.status(400).json({ error: 'Rating ID and reason are required' });
    }

    const now = new Date().toISOString();
    const reportRef = adminDb.collection(COLLECTIONS.REPORTED_REVIEWS).doc();

    await reportRef.set({
      reportId: reportRef.id,
      ratingId,
      reporterId,
      reason, // e.g., 'fake', 'abuse', 'spam'
      description: description || '',
      flagged: true,
      status: 'pending',
      createdAt: now,
    });

    res.status(200).json({ message: 'Report submitted successfully', reportId: reportRef.id });

  } catch (error: any) {
    console.error('Error reporting rating:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
