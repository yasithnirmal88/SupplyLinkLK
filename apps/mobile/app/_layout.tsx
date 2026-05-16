import { useEffect, useState } from 'react';
import { Stack } from 'expo-router';
import { I18nextProvider } from 'react-i18next';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { View, ActivityIndicator } from 'react-native';
import i18n from '../services/i18n';
import { useAuthStore } from '../stores/authStore';
import { onAuthChange, getUserProfile } from '../services/auth';
import { useNotifications } from '../services/notifications';
import * as Sentry from '@sentry/react-native';
import { OfflineBanner } from '../components/common/OfflineBanner';
import ErrorBoundary from '../components/common/ErrorBoundary';
import "../global.css";

// Only initialize Sentry if a valid DSN is provided
const SENTRY_DSN = process.env.EXPO_PUBLIC_SENTRY_DSN;
if (SENTRY_DSN && SENTRY_DSN !== 'https://example-dsn@sentry.io/123') {
  Sentry.init({
    dsn: SENTRY_DSN,
    debug: false,
  });
}

function AuthSync() {
  const { setUser, setLoading, loadLanguage } = useAuthStore();
  const [isReady, setIsReady] = useState(false);

  useNotifications();

  useEffect(() => {
    loadLanguage().then(() => {
      const lang = useAuthStore.getState().language;
      i18n.changeLanguage(lang);
    });
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthChange(async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const profile = await getUserProfile(firebaseUser.uid);
          if (profile) {
            setUser({
              uid: profile.uid,
              phoneNumber: profile.phoneNumber,
              role: profile.role,
              verificationStatus: profile.verificationStatus,
              displayName: profile.displayName,
            });
          } else {
            setUser({
              uid: firebaseUser.uid,
              phoneNumber: firebaseUser.phoneNumber || '',
              role: null,
              verificationStatus: null,
            });
          }
        } catch (error) {
          console.error('Error fetching user profile:', error);
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
      setIsReady(true);
    });

    return () => unsubscribe();
  }, []);

  if (!isReady) {
    return (
      <View
        className="flex-1 items-center justify-center"
        style={{ backgroundColor: '#FFFFFF' }}
      >
        <ActivityIndicator size="large" color="#2D6A4F" />
      </View>
    );
  }

  return null;
}

export default function RootLayout() {
  return (
    <ErrorBoundary>
      <I18nextProvider i18n={i18n}>
        <SafeAreaProvider>
          <OfflineBanner />
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="index" />
          </Stack>
          <AuthSync />
        </SafeAreaProvider>
      </I18nextProvider>
    </ErrorBoundary>
  );
}