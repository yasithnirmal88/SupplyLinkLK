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
  options: { push?: boolean; sms?: boolean; phone?: string; ignoreRateLimit?: boolean } = { push: true, sms: false, ignoreRateLimit: false }
) {
  try {
    const now = new Date().toISOString();

    // 0. Fetch User Data Once
    const userDoc = await adminDb.collection(COLLECTIONS.USERS).doc(uid).get();
    if (!userDoc.exists) return;
    const userData = userDoc.data()!;

    // 1. Check Notification Preferences
    const categoryMap: Record<string, string> = {
      'chat_message': 'chat',
      'kyc_submission': 'kyc',
      'kyc_status': 'kyc',
      'match_found': 'marketplace',
      'offer_accepted': 'marketplace',
      'promotion': 'promotional'
    };

    const prefCategory = categoryMap[notification.type] || 'promotional';
    const prefs = userData.notificationPreferences || { chat: true, marketplace: true, kyc: true, promotional: true };

    if (!prefs[prefCategory as keyof typeof prefs]) {
      console.log(`[NotificationService] Suppressed: User ${uid} opted out of ${prefCategory}.`);
      return;
    }

    // 2. Rate Limiting Check
    if (!options.ignoreRateLimit) {
      const isLimited = await shouldRateLimit(uid, notification.type, notification.relatedId, userData);
      if (isLimited) return;
    }

    // 3. Log to In-App Notification Center
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

    // 4. Send Push via FCM
    let pushSuccess = false;
    let pushError = null;

    if (options.push) {
      const fcmToken = userData.fcmToken;

      if (fcmToken) {
        try {
          const badgeCount = notification.data?.badge ? parseInt(notification.data.badge) : undefined;

          await getMessaging().send({ 
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
            apns: {
              payload: {
                aps: {
                  badge: badgeCount,
                  sound: 'default',
                },
              },
            },
          });
          pushSuccess = true;
        } catch (err: any) {
          pushError = err.message || 'Unknown FCM error';
          console.error(`[FCM Error] ${uid}:`, err);
        }
      } else {
        pushError = 'No FCM token found for user';
      }
    }

    // 5. Send SMS via Notify.lk
    let smsSuccess = false;
    let smsError = null;

    if (options.sms && options.phone) {
      try {
        await axios.post('https://app.notify.lk/api/v1/send', {
          user_id: SMS_USER_ID,
          api_key: SMS_API_KEY,
          sender_id: SMS_SENDER_ID,
          to: options.phone,
          message: notification.body,
        });
        smsSuccess = true;
      } catch (err: any) {
        smsError = err.message || 'Unknown SMS error';
        console.error(`[SMS Error] ${uid}:`, err);
      }
    }

    // 6. Update Rate Limit Metadata & Log for Analytics
    await updateNotificationMetadata(uid, notification.type, notification.relatedId, userData);

    await adminDb.collection('notification_logs').add({
      uid,
      type: notification.type,
      pushSuccess,
      pushError,
      smsSuccess,
      smsError,
      timestamp: now
    });

  } catch (error) {
    console.error(`[NotificationService] Critical Error sending to ${uid}:`, error);
  }
}

/**
 * Rate Limit Check
 * Prevents flood of notifications to a single user.
 */
async function shouldRateLimit(uid: string, type: string, relatedId?: string, cachedUserData?: any): Promise<boolean> {
  const isChat = type === 'chat_message';
  const COOLDOWN_MS = isChat ? 800 : 5000; // 0.8s for chat, 5s for others
  const DEDUPE_MS = 5 * 60 * 1000; // 5 minutes deduplication window

  const data = cachedUserData || (await adminDb.collection(COLLECTIONS.USERS).doc(uid).get()).data();
  if (!data) return false;
  
  const now = Date.now();
  
  // 1. Global Cooldown Check
  if (data.lastNotificationAt) {
    const lastSent = new Date(data.lastNotificationAt).getTime();
    if (now - lastSent < COOLDOWN_MS) {
      return true;
    }
  }

  // 2. Deduplication Check (Same type + ID within 5 mins)
  if (relatedId && data.lastNotifications) {
    const recentNotifs = data.lastNotifications as Array<{ type: string, relatedId: string, timestamp: string }>;
    const isDuplicate = recentNotifs.some(n => 
      n.type === type && 
      n.relatedId === relatedId && 
      (now - new Date(n.timestamp).getTime() < DEDUPE_MS)
    );

    if (isDuplicate) return true;
  }

  return false;
}

/**
 * Persists notification metadata for rate limiting.
 */
async function updateNotificationMetadata(uid: string, type: string, relatedId?: string, cachedUserData?: any) {
  const userRef = adminDb.collection(COLLECTIONS.USERS).doc(uid);
  const now = new Date().toISOString();
  
  let lastNotifications = cachedUserData?.lastNotifications || [];
  
  // Keep only last 5 entries to minimize document size
  lastNotifications = [
    { type, relatedId: relatedId || null, timestamp: now },
    ...lastNotifications
  ].slice(0, 5);

  await userRef.update({
    lastNotificationAt: now,
    lastNotifications
  });
}

export async function broadcastNotification(
  uids: string[],
  notification: { title: string; body: string; type: string; relatedId?: string; data?: any }
) {
  return Promise.all(uids.map(uid => sendNotification(uid, notification)));
}