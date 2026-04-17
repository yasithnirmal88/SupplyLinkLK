import { Response } from 'express';
import { adminDb } from '../firebase-admin';
import { COLLECTIONS } from '../constants/collections';
import { AuthenticatedRequest } from '../middleware/auth';
import { sendNotification } from '../services/notificationService';

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

       transaction.update(postRef, {
          offerCount: (postData.offerCount || 0) + 1,
          updatedAt: now
       });
    });

    console.log(`[Notification] Offer submitted for ${postData.title} by ${userData.displayName}`);
    res.status(201).json({ message: 'Offer submitted successfully', offerId: offerRef.id });

  } catch (error: any) {
    console.error('Error creating offer:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

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

    // ✅ FIX 1: Declare these OUTSIDE the transaction so they're accessible below
    let businessName: string = 'Business';
    const chatId = `${offerData.demandPostId}_${offerData.supplierId}`;

    await adminDb.runTransaction(async (transaction) => {
       const now = new Date().toISOString();

       transaction.update(offerRef, { status: 'accepted', updatedAt: now });

       const newFilledQty = (postData.filledQuantity || 0) + offerData.quantity;
       const isFullyFilled = newFilledQty >= postData.totalQuantity;

       let newStatus = postData.status;
       if (isFullyFilled) {
          newStatus = 'filled';
       } else if (newFilledQty > 0) {
          newStatus = 'partially_filled';
       }

       transaction.update(postRef, {
          filledQuantity: newFilledQty,
          status: newStatus,
          acceptedOfferCount: (postData.acceptedOfferCount || 0) + 1,
          updatedAt: now
       });

       const chatRef = adminDb.collection(COLLECTIONS.CHATS).doc(chatId);

       const businessUserDoc = await transaction.get(adminDb.collection(COLLECTIONS.USERS).doc(uid!));
       // ✅ FIX 2: Assign to the outer variable
       businessName = businessUserDoc.data()?.displayName || 'Business';

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
            // ✅ FIX 3: Cast supplierId to string for computed property
            [offerData.supplierId as string]: 1,
            [uid!]: 0
          },
          status: 'active',
          updatedAt: now,
          createdAt: now
       });

       const msgRef = chatRef.collection('messages').doc();
       transaction.set(msgRef, {
          msgId: msgRef.id,
          senderId: 'system',
          senderName: 'System',
          // ✅ FIX 4: Add fallback for unit which could be undefined
          text: `🎉 Offer Accepted! You can now chat regarding ${postData.title}. Quantity: ${offerData.quantity} ${offerData.unit ?? ''}.`,
          type: 'text',
          readBy: [],
          createdAt: now
       });
    });

    // ✅ Now businessName and chatId are accessible here
    await sendNotification(offerData.supplierId, {
       title: '🤝 Offer Accepted!',
       body: `Great news! Your offer for ${postData.title} was accepted by ${businessName}. Start chatting now.`,
       type: 'offer_accepted',
       relatedId: chatId
    }, { push: true, sms: true, phone: offerData.supplierPhone || '' });

    console.log(`[Notification] Offer ${offerId} accepted! Chat unlocked: ${chatId}`);

    res.status(200).json({
       message: 'Offer accepted and chat unlocked',
       chatId
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

    if (!offerDoc.exists) return;
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