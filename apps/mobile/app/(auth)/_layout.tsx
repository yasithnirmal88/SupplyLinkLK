import { Stack } from 'expo-router';
export default function AuthLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: '#F9F7F2' },
      }}
    >
      <Stack.Screen name="splash" />
      <Stack.Screen name="language" />
      <Stack.Screen name="phone" />
      <Stack.Screen name="otp" />
      <Stack.Screen name="role" />
    </Stack>
  );
}