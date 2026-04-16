import { Response } from 'express';
import { adminDb } from '../firebase-admin';
import { COLLECTIONS } from '../constants/collections';
import { AuthenticatedRequest } from '../middleware/auth';

/**
 * PATCH /api/v1/chats/:chatId/confirm-delivery
 */
export async function confirmDelivery(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const { chatId } = req.params;
    const { uid } = req;

    const chatRef = adminDb.collection(COLLECTIONS.CHATS).doc(chatId);
    const chatDoc = await chatRef.get();

    if (!chatDoc.exists) {
      res.status(404).json({ error: 'Chat not found' });
      return;
    }

    const data = chatDoc.data()!;
    if (!data.participants.includes(uid)) {
      res.status(403).json({ error: 'Unauthorized' });
      return;
    }

    const now = new Date().toISOString();
    await chatRef.update({
      status: 'delivery_confirmed',
      deliveryConfirmedAt: now,
      updatedAt: now
    });

    // Initial system msg
    await chatRef.collection('messages').add({
      senderId: 'system',
      senderName: 'System',
      text: '📦 Delivery Confirmed! Both parties can now rate the transaction.',
      type: 'text',
      readBy: [],
      createdAt: now
    });

    res.status(200).json({ message: 'Delivery confirmed' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}

/**
 * POST /api/v1/reviews
 */
export async function submitReview(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const { uid } = req;
    const { 
      chatId, 
      rating, 
      reviewText, 
      wouldTradeAgain 
    } = req.body;

    const chatDoc = await adminDb.collection(COLLECTIONS.CHATS).doc(chatId).get();
    if (!chatDoc.exists) {
       res.status(404).json({ error: 'Chat not found' });
       return;
    }

    const chatData = chatDoc.data()!;
    const revieweeId = chatData.participants.find((id: string) => id !== uid);
    
    const userDoc = await adminDb.collection(COLLECTIONS.USERS).doc(uid).get();
    const reviewerRole = userDoc.data()?.role;
    const revieweeRole = reviewerRole === 'supplier' ? 'business' : 'supplier';

    const reviewRef = adminDb.collection(COLLECTIONS.REVIEWS).doc();
    const now = new Date().toISOString();

    await adminDb.runTransaction(async (transaction) => {
       // 1. Create Review
       transaction.set(reviewRef, {
          reviewId: reviewRef.id,
          chatId,
          demandPostId: chatData.demandPostId,
          offerId: chatData.offerId,
          reviewerId: uid,
          reviewerRole,
          revieweeId,
          revieweeRole,
          rating,
          reviewText,
          wouldTradeAgain,
          createdAt: now
       });

       // 2. Recalculate Rating
       const reviewsSnap = await adminDb.collection(COLLECTIONS.REVIEWS)
          .where('revieweeId', '==', revieweeId)
          .get();
       
       const allRatings = reviewsSnap.docs.map(d => d.data().rating);
       allRatings.push(rating); // Add current one since it's in transaction
       
       const averageRating = allRatings.reduce((a, b) => a + b, 0) / allRatings.length;
       
       const revieweeRef = adminDb.collection(COLLECTIONS.USERS).doc(revieweeId);
       transaction.update(revieweeRef, {
          averageRating: parseFloat(averageRating.toFixed(1)),
          reviewCount: allRatings.length,
          updatedAt: now
       });
    });

    res.status(201).json({ message: 'Review submitted successfully' });

  } catch (error: any) {
    console.error('Submit Review Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
