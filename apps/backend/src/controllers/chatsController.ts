import { Request, Response } from 'express';
import { adminDb } from '../firebase-admin';
import { COLLECTIONS } from '../constants/collections';
import { sendNotification } from '../services/notificationService';
import { AuthenticatedRequest } from '../middleware/auth';

/**
 * POST /api/v1/chats/notify-message
 * 
 * Triggered by the mobile app after a message is sent via Firestore.
 * This sends the FCM push notification to the recipient.
 */
export async function notifyNewMessage(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const { uid: senderId } = req;
    const { chatId, recipientId, text, senderName } = req.body;

    if (!chatId || !recipientId || !senderName) {
      res.status(400).json({ error: 'Missing required notification fields' });
      return;
    }

    // 1. Calculate badge count (Optimized: only query chats that actually have unreads)
    const chatsSnapshot = await adminDb.collection(COLLECTIONS.CHATS)
      .where('participants', 'array-contains', recipientId)
      .where(`unreadCount.${recipientId}`, '>', 0)
      .get();
    
    let totalUnread = 0;
    chatsSnapshot.forEach(doc => {
      totalUnread += (doc.data().unreadCount?.[recipientId] || 0);
    });

    // 2. Send the push notification
    await sendNotification(recipientId, {
      title: senderName,
      body: text || '📷 Sent a photo',
      type: 'chat_message',
      relatedId: chatId,
      data: {
        chatId,
        senderId: senderId || '',
        badge: totalUnread.toString(),
      }
    }, { push: true, sms: false });

    // Update FCM badge explicitly if notificationService supports it or via raw FCM
    // For now, our notificationService uses getMessaging().send() which takes a notification object.

    res.status(200).json({ message: 'Notification dispatched' });
  } catch (error: any) {
    console.error('Error sending chat notification:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

export async function createChat(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const { uid: senderId } = req;
    const { targetUserId, targetDisplayName } = req.body;

    if (!senderId || !targetUserId || !targetDisplayName) {
      res.status(400).json({ error: 'Missing required chat fields' });
      return;
    }

    if (senderId === targetUserId) {
      res.status(400).json({ error: 'Cannot create a chat with yourself' });
      return;
    }

    const senderDoc = await adminDb.collection(COLLECTIONS.USERS).doc(senderId).get();
    const targetDoc = await adminDb.collection(COLLECTIONS.USERS).doc(targetUserId).get();

    if (!targetDoc.exists) {
      res.status(404).json({ error: 'Target user not found' });
      return;
    }

    const senderName = senderDoc.exists ? senderDoc.data()?.displayName || 'Member' : 'Member';
    const targetName = targetDoc.data()?.displayName || targetDisplayName;

    const existingChats = await adminDb.collection(COLLECTIONS.CHATS)
      .where('participants', 'array-contains', senderId)
      .get();

    const matchingChat = existingChats.docs.find((doc) => {
      const participants: string[] = doc.data().participants || [];
      return participants.includes(targetUserId) && participants.length === 2;
    });

    if (matchingChat) {
      res.status(200).json({ chatId: matchingChat.id });
      return;
    }

    const orderedIds = [senderId, targetUserId].sort();
    const chatId = `chat_${orderedIds.join('_')}`;
    const now = new Date().toISOString();

    await adminDb.collection(COLLECTIONS.CHATS).doc(chatId).set({
      chatId,
      participants: [senderId, targetUserId],
      participantNames: {
        [senderId]: senderName,
        [targetUserId]: targetName,
      },
      lastMessage: 'Chat started',
      lastMessageAt: now,
      unreadCount: {
        [senderId]: 0,
        [targetUserId]: 0,
      },
      status: 'active',
      createdAt: now,
      updatedAt: now,
    });

    res.status(200).json({ chatId });
  } catch (error: any) {
    console.error('Error creating chat:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
