import { useEffect, useRef } from 'react';
import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import messaging from '@react-native-firebase/messaging';
import { getFirestore, doc, updateDoc } from '@react-native-firebase/firestore';
import { useAuthStore } from '../stores/authStore';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export const useNotifications = () => {
  const { uid } = useAuthStore();
  const notificationListener = useRef<any>(null);
  const responseListener = useRef<any>(null);

  useEffect(() => {
    if (!uid) return;

    registerForPushNotificationsAsync().then(async token => {
      if (token) {
        try {
          const db = getFirestore();
          await updateDoc(doc(db, 'users', uid), { fcmToken: token });
          console.log('[Notifications] Token saved to Firestore');
        } catch (err) {
          console.error('[Notifications] Failed to save FCM token:', err);
        }
      }
    });

    notificationListener.current = Notifications.addNotificationReceivedListener(notification => {
      console.log('Notification Received:', notification);
    });

    responseListener.current = Notifications.addNotificationResponseReceivedListener(response => {
      console.log('Notification Response:', response);
    });

    return () => {
      if (notificationListener.current && (Notifications as any).removeNotificationSubscription) {
        (Notifications as any).removeNotificationSubscription(notificationListener.current);
      }
      if (responseListener.current && (Notifications as any).removeNotificationSubscription) {
        (Notifications as any).removeNotificationSubscription(responseListener.current);
      }
    };
  }, [uid]);
};

async function registerForPushNotificationsAsync(): Promise<string | null> {
  if (Platform.OS === 'web') return null;

  try {
    // Request FCM permission (iOS needs explicit request)
    const authStatus = await messaging().requestPermission();
    const enabled =
      authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
      authStatus === messaging.AuthorizationStatus.PROVISIONAL;

    if (!enabled) {
      console.warn('Push notification permission denied');
      return null;
    }

    // Set up Android notification channel
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#10B981',
      });
    }

    // Get FCM token directly
    const token = await messaging().getToken();
    console.log('FCM Token:', token);
    return token;

  } catch (error) {
    console.warn('Failed to get FCM token:', error);
    return null;
  }
}
