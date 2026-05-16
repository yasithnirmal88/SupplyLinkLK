import { useEffect, useState } from 'react';
import { Stack, useRouter, useSegments } from 'expo-router';
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

// Firebase is initialized via the services/firebase import in services/auth.ts
// which is imported above.

Sentry.init({
  dsn: 'https://example-dsn@sentry.io/123',
  debug: false
});

function AuthGate({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const segments = useSegments();
  const {
    isAuthenticated,
    isLoading,
    setUser,
    setLoading,
    loadLanguage,
    role,
  } = useAuthStore();

  useNotifications();

  const [isReady, setIsReady] = useState(false);

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

  useEffect(() => {
    if (!isReady) return;

    const inAuthGroup = segments[0] === '(auth)';
    const inTabsGroup = segments[0] === '(tabs)';
    const inOnboarding = segments[0] === 'onboarding';

    if (isAuthenticated) {
      if (inAuthGroup || inOnboarding) {
        if (!role) {
          router.replace('/(auth)/role');
        } else {
          router.replace('/(tabs)');
        }
      }
    } else {
      if (inTabsGroup || inOnboarding) {
        router.replace('/(auth)/splash');
      }
    }
  }, [isAuthenticated, isReady, segments, role]);

  if (!isReady || isLoading) {
    return (
      <View
        className="flex-1 items-center justify-center"
        style={{ backgroundColor: '#2D6A4F' }}
      >
        <ActivityIndicator size="large" color="#FFFFFF" />
      </View>
    );
  }

  return <>{children}</>;
}

export default function RootLayout() {
  return (
    <ErrorBoundary>
      <I18nextProvider i18n={i18n}>
        <SafeAreaProvider>
          <OfflineBanner />
          <AuthGate>
            <Stack screenOptions={{ headerShown: false }}>
              <Stack.Screen name="index" />
              {/* Note: Groups like (auth), (tabs), (kyc) are handled automatically by Expo Router based on file structure. 
                  Only define them here if you need specific options or to fix registration order. */}
            </Stack>
          </AuthGate>
        </SafeAreaProvider>
      </I18nextProvider>
    </ErrorBoundary>
  );
}