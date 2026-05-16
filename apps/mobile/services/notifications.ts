import { useEffect, useRef } from 'react';
import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import Constants from 'expo-constants';
import { doc, updateDoc } from 'firebase/firestore';

import { db } from './firebase';
import { useAuthStore } from '../stores/authStore';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    // Newer SDKs expect these fields as well
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

    registerForPushNotificationsAsync().then(token => {
      if (token) {
        updateDoc(doc(db, 'users', uid), { fcmToken: token });
      }
    });

    notificationListener.current = Notifications.addNotificationReceivedListener(notification => {
      // Handle foreground notification
      console.log('Notification Received:', notification);
    });

    responseListener.current = Notifications.addNotificationResponseReceivedListener(response => {
      // Handle user interaction with notification
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

async function registerForPushNotificationsAsync() {
  if (Platform.OS === 'web') return null;
  let token;

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#10B981',
    });
  }

  if (Device.isDevice) {
    const perm: any = await Notifications.getPermissionsAsync();
    let finalStatus = perm.status ?? (perm.granted ? 'granted' : 'denied');

    if (finalStatus !== 'granted') {
      const res: any = await Notifications.requestPermissionsAsync();
      finalStatus = res.status ?? (res.granted ? 'granted' : finalStatus);
    }

    if (finalStatus !== 'granted') {
      console.warn('Failed to get push token for push notification!');
      return;
    }

    // Replace with your Expo project ID or sender ID
    token = (await Notifications.getExpoPushTokenAsync({
       projectId: Constants.expoConfig?.extra?.eas?.projectId 
    })).data;
    
    console.log('FCM Token:', token);
  } else {
    console.log('Must use physical device for Push Notifications');
  }

  return token;
}
