import { Stack } from 'expo-router';

export default function KycLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: true,
        headerTitle: 'KYC Verification',
        headerBackTitle: 'Back',
        headerStyle: { backgroundColor: '#FFFFFF' },
        headerTintColor: '#2D6A4F',
        headerTitleStyle: { fontWeight: '700', color: '#1A1A2E' },
      }}
    >
      <Stack.Screen name="nic-upload" options={{ title: 'Upload NIC' }} />
      <Stack.Screen name="selfie" options={{ title: 'Selfie Verification' }} />
      <Stack.Screen name="status" options={{ title: 'Verification Status' }} />
    </Stack>
  );
}
