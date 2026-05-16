import { useEffect } from 'react';
import { useRouter, useRootNavigationState } from 'expo-router';
import { useAuthStore } from '../stores/authStore';
import { View, ActivityIndicator } from 'react-native';

export default function Index() {
  const { isAuthenticated, role, isLoading } = useAuthStore();
  const router = useRouter();
  const rootNavigationState = useRootNavigationState();

  useEffect(() => {
    // Wait until navigation is ready and auth is not loading
    if (!rootNavigationState?.key || isLoading) return;

    if (isAuthenticated) {
      if (!role) {
        router.replace('/(auth)/role');
      } else {
        router.replace('/(tabs)');
      }
    } else {
      router.replace('/(auth)/splash');
    }
  }, [isAuthenticated, role, isLoading, rootNavigationState?.key]);

  return (
    <View className="flex-1 items-center justify-center bg-white">
      <ActivityIndicator size="large" color="#2D6A4F" />
    </View>
  );
}
