import { useEffect, useState } from 'react';
import { Stack, useRouter, useSegments } from 'expo-router';
import { I18nextProvider } from 'react-i18next';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { View, ActivityIndicator } from 'react-native';
import i18n from '../services/i18n';
import { useAuthStore } from '../stores/authStore';
import { onAuthChange, getUserProfile } from '../services/auth';
import { useNotifications } from '../services/notifications';
import "../global.css";

function AuthGate({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const segments = useSegments();
  const {
    isAuthenticated,
    isLoading,
    setUser,
    setLoading,
    loadLanguage,
    language,
    role,
    uid,
  } = useAuthStore();

  useNotifications();

  const [isReady, setIsReady] = useState(false);

  // Load saved language on mount
  useEffect(() => {
    loadLanguage().then(() => {
      const lang = useAuthStore.getState().language;
      i18n.changeLanguage(lang);
    });
  }, []);

  // Listen to Firebase auth state
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
            // Firebase user exists but no Firestore profile yet
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

  // Navigation guard
  useEffect(() => {
    if (!isReady) return;

    const inAuthGroup = segments[0] === '(auth)';
    const inTabsGroup = segments[0] === '(tabs)';
    const inKycGroup = segments[0] === '(kyc)';

    if (isAuthenticated && (inAuthGroup || segments[0] === 'onboarding')) {
      // Authenticated user in auth/onboarding screens
      if (!role) {
        router.replace('/(auth)/role');
      } else if (segments[0] === '(auth)') {
        router.replace('/(tabs)/home');
      }
    } else if (!isAuthenticated && (inTabsGroup || segments[0] === 'onboarding')) {
      // Unauthenticated user in protected screens → send to splash
      router.replace('/(auth)/splash');
    }
  }, [isAuthenticated, isReady, segments, role]);

  // Show loading while checking auth
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
    <I18nextProvider i18n={i18n}>
      <SafeAreaProvider>
        <AuthGate>
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="index" />
            <Stack.Screen name="(auth)" />
            <Stack.Screen name="(tabs)" />
            <Stack.Screen name="onboarding" />
          </Stack>
        </AuthGate>
      </SafeAreaProvider>
    </I18nextProvider>
  );
}
