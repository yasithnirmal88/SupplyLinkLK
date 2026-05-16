import { useEffect, useState } from 'react';
import { Stack, useRouter, useSegments } from 'expo-router';
import { I18nextProvider } from 'react-i18next';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { View, ActivityIndicator } from 'react-native';
import i18n from '../services/i18n';
import { useAuthStore } from '../stores/authStore';
import { onAuthChange, getUserProfile } from '../services/auth';
import { useNotifications } from '../services/notifications';
import { OfflineBanner } from '../components/common/OfflineBanner';
import ErrorBoundary from '../components/common/ErrorBoundary';
import "../global.css";

// ─── Protected route hook ─────────────────────────────────────────────────────
function useProtectedRoute() {
  const router = useRouter();
  const segments = useSegments();
  const { isAuthenticated, isLoading, role } = useAuthStore();
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsReady(true), 100);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!isReady || isLoading) return;

    const inAuthGroup  = segments[0] === '(auth)';
    const inTabsGroup  = segments[0] === '(tabs)';
    const inIndex      = segments.length === 0 || segments[0] === 'index';

    if (isAuthenticated && (inAuthGroup || inIndex)) {
      router.replace(role ? '/(tabs)' : '/(auth)/role');
    } else if (!isAuthenticated && (inTabsGroup || segments[0] === 'onboarding')) {
      router.replace('/(auth)/splash');
    } else if (!isAuthenticated && inIndex) {
      router.replace('/(auth)/splash');
    }
  }, [isAuthenticated, isLoading, isReady, segments, role]);
}

// ─── Inner layout (needs navigation context to already exist) ─────────────────
function RootLayoutNav() {
  const { setUser, setLoading, loadLanguage, isLoading } = useAuthStore();

  useNotifications();
  useProtectedRoute();

  // Load persisted language once
  useEffect(() => {
    loadLanguage().then(() => {
      const lang = useAuthStore.getState().language;
      i18n.changeLanguage(lang);
    });
  }, []);

  // Firebase auth state listener
  useEffect(() => {
    const unsubscribe = onAuthChange(async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const profile = await getUserProfile(firebaseUser.uid);
          setUser(
            profile
              ? {
                  uid: profile.uid,
                  phoneNumber: profile.phoneNumber,
                  role: profile.role,
                  verificationStatus: profile.verificationStatus,
                  displayName: profile.displayName,
                }
              : {
                  uid: firebaseUser.uid,
                  phoneNumber: firebaseUser.phoneNumber || '',
                  role: null,
                  verificationStatus: null,
                }
          );
        } catch (error) {
          console.error('Error fetching user profile:', error);
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    });
    return () => unsubscribe();
  }, []);

  if (isLoading) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#2D6A4F' }}>
        <ActivityIndicator size="large" color="#FFFFFF" />
      </View>
    );
  }

  return (
    <>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="(kyc)" />
        <Stack.Screen name="onboarding" />
      </Stack>
      <OfflineBanner />
    </>
  );
}

// ─── Root export ──────────────────────────────────────────────────────────────
export default function RootLayout() {
  return (
    <ErrorBoundary>
      <I18nextProvider i18n={i18n}>
        <SafeAreaProvider>
          <RootLayoutNav />
        </SafeAreaProvider>
      </I18nextProvider>
    </ErrorBoundary>
  );
}