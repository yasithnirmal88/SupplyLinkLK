import { Response } from 'express';
import { adminDb } from '../firebase-admin';
import { COLLECTIONS } from '../constants/collections';
import { AuthenticatedRequest } from '../middleware/auth';
import { sendNotification } from '../services/notificationService';

/**
 * POST /api/v1/offers
 * 
 * Create a new offer for a demand post.
 */
export async function createOffer(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const { uid } = req;
    const { 
      demandPostId, 
      quantityOffered, 
      pricePerUnit, 
      availableByDate, 
      notes 
    } = req.body;

    if (!uid) {
      res.status(401).json({ error: 'Unauthenticated' });
      return;
    }

    const userDoc = await adminDb.collection(COLLECTIONS.USERS).doc(uid).get();
    const userData = userDoc.data()!;

    if (userData.role !== 'supplier' || userData.verificationStatus !== 'approved') {
       res.status(403).json({ error: 'Only verified suppliers can submit offers' });
       return;
    }

    // Verify demand post exists and is open
    const postRef = adminDb.collection(COLLECTIONS.DEMAND_POSTS).doc(demandPostId);
    const postDoc = await postRef.get();

    if (!postDoc.exists) {
       res.status(404).json({ error: 'Demand post not found' });
       return;
    }

    const postData = postDoc.data()!;
    if (postData.status === 'filled' || postData.status === 'closed') {
       res.status(400).json({ error: 'This demand post is no longer accepting offers' });
       return;
    }

    const now = new Date().toISOString();
    const offerRef = adminDb.collection(COLLECTIONS.OFFERS).doc();

    await adminDb.runTransaction(async (transaction) => {
       // 1. Create Offer
       transaction.set(offerRef, {
          offerId: offerRef.id,
          demandPostId,
          supplierId: uid,
          supplierName: userData.displayName,
          businessId: postData.businessId,
          quantity: quantityOffered,
          unit: postData.unit,
          pricePerUnit,
          availableByDate,
          notes,
          status: 'pending',
          createdAt: now,
          updatedAt: now
       });

       // 2. Increment offerCount on post
       transaction.update(postRef, {
          offerCount: (postData.offerCount || 0) + 1,
          updatedAt: now
       });
    });

    // 3. TODO: FCM to Business
    console.log(`[Notification] Offer submitted for ${postData.title} by ${userData.displayName}`);

    res.status(201).json({ message: 'Offer submitted successfully', offerId: offerRef.id });

  } catch (error: any) {
    console.error('Error creating offer:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

/**
 * PATCH /api/v1/offers/:offerId/accept
 * 
 * Logic for accepting offers and managing the quota fill status.
 */
export async function acceptOffer(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const { offerId } = req.params;
    const { uid } = req;

    const offerRef = adminDb.collection(COLLECTIONS.OFFERS).doc(offerId);
    const offerDoc = await offerRef.get();

    if (!offerDoc.exists) {
       res.status(404).json({ error: 'Offer not found' });
       return;
    }

    const offerData = offerDoc.data()!;
    if (offerData.businessId !== uid) {
       res.status(403).json({ error: 'Unauthorized to accept this offer' });
       return;
    }

    if (offerData.status !== 'pending') {
       res.status(400).json({ error: `Offer is already ${offerData.status}` });
       return;
    }

    const postRef = adminDb.collection(COLLECTIONS.DEMAND_POSTS).doc(offerData.demandPostId);
    const postDoc = await postRef.get();
    const postData = postDoc.data()!;

    await adminDb.runTransaction(async (transaction) => {
       const now = new Date().toISOString();
       
       // 1. Update Offer Status
       transaction.update(offerRef, { status: 'accepted', updatedAt: now });

       // 2. Calculate new filled quantity
       const newFilledQty = (postData.filledQuantity || 0) + offerData.quantity;
       const isFullyFilled = newFilledQty >= postData.totalQuantity;

       let newStatus = postData.status;
       if (isFullyFilled) {
          newStatus = 'filled';
       } else if (newFilledQty > 0) {
          newStatus = 'partially_filled';
       }

       // 3. Update Post
       transaction.update(postRef, {
          filledQuantity: newFilledQty,
          status: newStatus,
          acceptedOfferCount: (postData.acceptedOfferCount || 0) + 1,
          updatedAt: now
       });

       // 4. Create Chat Session
       const chatId = `${offerData.demandPostId}_${offerData.supplierId}`;
       const chatRef = adminDb.collection(COLLECTIONS.CHATS).doc(chatId);
       
       const businessUserDoc = await transaction.get(adminDb.collection(COLLECTIONS.USERS).doc(uid));
       const businessName = businessUserDoc.data()?.displayName || 'Business';

       transaction.set(chatRef, {
          chatId,
          participants: [offerData.supplierId, uid],
          demandPostId: offerData.demandPostId,
          offerId: offerData.offerId,
          supplierName: offerData.supplierName,
          businessName: businessName,
          lastMessage: 'Negotiation Unlocked',
          lastMessageAt: now,
          unreadCount: { 
            [offerData.supplierId]: 1, 
            [uid]: 0 
          },
          status: 'active',
          updatedAt: now,
          createdAt: now
       });

       // 5. Initial System Message
       const msgRef = chatRef.collection('messages').doc();
       transaction.set(msgRef, {
          msgId: msgRef.id,
          senderId: 'system',
          senderName: 'System',
          text: `🎉 Offer Accepted! You can now chat regarding ${postData.title}. quantity: ${offerData.quantity}${offerData.unit}.`,
          type: 'text',
          readBy: [],
          createdAt: now
       });
    });

    // 6. Push + SMS + Unlock Chat Notification
    await sendNotification(offerData.supplierId, {
       title: '🤝 Offer Accepted!',
       body: `Great news! Your offer for ${postData.title} was accepted by ${businessName}. Start chatting now.`,
       type: 'offer_accepted',
       relatedId: chatId
    }, { push: true, sms: true, phone: offerData.supplierPhone || '' }); // Assuming phone is in offer or user doc

    console.log(`[Notification] Offer ${offerId} accepted! Chat unlocked: ${chatId}`);

    res.status(200).json({ 
       message: 'Offer accepted and chat unlocked',
       chatId: `${offerData.demandPostId}_${offerData.supplierId}`
    });

  } catch (error: any) {
    console.error('Error accepting offer:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

export async function rejectOffer(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const { offerId } = req.params;
    const { reason } = req.body;
    const { uid } = req;

    const offerRef = adminDb.collection(COLLECTIONS.OFFERS).doc(offerId);
    const offerDoc = await offerRef.get();
    
    if (!offerDoc.exists) return; // already checked middleware logic usually
    const offerData = offerDoc.data()!;
    
    if (offerData.businessId !== uid) {
       res.status(403).json({ error: 'Unauthorized' });
       return;
    }

    await offerRef.update({
       status: 'rejected',
       rejectionReason: reason || null,
       updatedAt: new Date().toISOString()
    });

    res.status(200).json({ message: 'Offer rejected' });
  } catch (e) {
    res.status(500).json({ error: 'Internal server error' });
  }
}
