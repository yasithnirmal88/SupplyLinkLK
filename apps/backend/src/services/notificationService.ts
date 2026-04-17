import axios from 'axios';
import { getMessaging } from 'firebase-admin/messaging'; // ✅ Direct import
import { adminDb } from '../firebase-admin';
import { COLLECTIONS } from '../constants/collections';

const SMS_USER_ID = process.env.NOTIFY_LK_USER_ID;
const SMS_API_KEY = process.env.NOTIFY_LK_API_KEY;
const SMS_SENDER_ID = process.env.NOTIFY_LK_SENDER_ID || 'SupplyLink';

export async function sendNotification(
  uid: string,
  notification: { title: string; body: string; type: string; relatedId?: string; data?: any },
  options: { push?: boolean; sms?: boolean; phone?: string } = { push: true, sms: false }
) {
  try {
    const now = new Date().toISOString();

    // 1. Log to In-App Notification Center
    const notifRef = adminDb
      .collection(COLLECTIONS.NOTIFICATIONS)
      .doc(uid)
      .collection(COLLECTIONS.NOTIFICATION_ITEMS)
      .doc();

    await notifRef.set({
      notifId: notifRef.id,
      title: notification.title,
      body: notification.body,
      type: notification.type,
      relatedId: notification.relatedId || null,
      read: false,
      createdAt: now,
    });

    // 2. Send Push via FCM
    if (options.push) {
      const userDoc = await adminDb.collection(COLLECTIONS.USERS).doc(uid).get();
      const fcmToken = userDoc.data()?.fcmToken;

      if (fcmToken) {
        await getMessaging().send({ // ✅ Use getMessaging() instead of admin.messaging()
          token: fcmToken,
          notification: {
            title: notification.title,
            body: notification.body,
          },
          data: {
            ...notification.data,
            type: notification.type,
            relatedId: notification.relatedId || '',
          },
          android: {
            priority: 'high',
          },
        });
      }
    }

    // 3. Send SMS via Notify.lk
    if (options.sms && options.phone) {
      await axios.post('https://app.notify.lk/api/v1/send', {
        user_id: SMS_USER_ID,
        api_key: SMS_API_KEY,
        sender_id: SMS_SENDER_ID,
        to: options.phone,
        message: notification.body,
      });
    }

  } catch (error) {
    console.error(`[NotificationService] Error sending to ${uid}:`, error);
  }
}

export async function broadcastNotification(
  uids: string[],
  notification: { title: string; body: string; type: string; relatedId?: string; data?: any }
) {
  return Promise.all(uids.map(uid => sendNotification(uid, notification)));
}