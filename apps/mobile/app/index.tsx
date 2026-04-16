import { Redirect } from 'expo-router';
import { useAuthStore } from '../stores/authStore';

/**
 * Root index — redirects to splash (auth) or home (tabs)
 * based on authentication state.
 */
export default function Index() {
  const { isAuthenticated, role } = useAuthStore();

  if (isAuthenticated && role) {
    return <Redirect href="/(tabs)/home" />;
  }

  return <Redirect href="/(auth)/splash" />;
}
