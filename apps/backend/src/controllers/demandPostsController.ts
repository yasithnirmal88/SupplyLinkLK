import { Request, Response } from 'express';
import { adminDb } from '../firebase-admin';
import { COLLECTIONS } from '../constants/collections';
import { AuthenticatedRequest } from '../middleware/auth';

/**
 * POST /api/v1/demand-posts
 * 
 * Creates a new demand post for an approved business user.
 */
export async function createDemandPost(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const { uid } = req;
    if (!uid) {
      res.status(401).json({ error: 'Unauthenticated' });
      return;
    }

    const {
      category,
      itemName,
      totalQuantity,
      unit,
      priceRangeMin,
      priceRangeMax,
      deadline,
      districtPreference,
      qualityNotes,
      quotaSplitEnabled
    } = req.body;

    // 1. Verify User is Approved Business
    const userDoc = await adminDb.collection(COLLECTIONS.USERS).doc(uid).get();
    if (!userDoc.exists) {
       res.status(404).json({ error: 'User not found' });
       return;
    }

    const userData = userDoc.data()!;
    if (userData.role !== 'business') {
       res.status(403).json({ error: 'Forbidden: Only businesses can create demand posts' });
       return;
    }

    if (userData.verificationStatus !== 'approved') {
       res.status(403).json({ error: 'Forbidden: Business must be verified to post demands' });
       return;
    }

    const now = new Date().toISOString();

    const postData = {
       businessId: uid,
       businessName: userData.displayName,
       businessVerified: true,
       category,
       title: itemName, // Standardizing to title
       itemName,
       totalQuantity,
       filledQuantity: 0,
       unit,
       priceRangeMin,
       priceRangeMax,
       currency: 'LKR',
       deadline,
       districtPreference: districtPreference || 'Any District',
       qualityNotes: qualityNotes || '',
       quotaSplitEnabled: !!quotaSplitEnabled,
       status: 'open',
       offerCount: 0,
       acceptedOfferCount: 0,
       createdAt: now,
       updatedAt: now
    };

    const postRef = adminDb.collection(COLLECTIONS.DEMAND_POSTS).doc();
    await postRef.set({
       postId: postRef.id,
       ...postData
    });

    // 2. TODO: FCM Dispatch
    // If quotaSplitEnabled: send to ALL verified suppliers in matching district/category
    console.log(`[Notification] Demand Post created: ${itemName} for ${totalQuantity}${unit}. QuotaSplit: ${quotaSplitEnabled}`);

    res.status(201).json({ message: 'Demand post created successfully', postId: postRef.id });

  } catch (error: any) {
    console.error('Error creating demand post:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

/**
 * GET /api/v1/demand-posts/:postId
 * 
 * Fetches a single demand post detail.
 */
export async function getDemandPost(req: Request, res: Response): Promise<void> {
  try {
    const { postId } = req.params;
    const doc = await adminDb.collection(COLLECTIONS.DEMAND_POSTS).doc(postId).get();

    if (!doc.exists) {
      res.status(404).json({ error: 'Demand post not found' });
      return;
    }

    res.status(200).json({ id: doc.id, ...doc.data() });
  } catch (error: any) {
    res.status(500).json({ error: 'Internal server error' });
  }
}
