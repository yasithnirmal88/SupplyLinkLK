import { Stack } from 'expo-router';

export default function OnboardingLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
        contentStyle: { backgroundColor: '#F9F7F2' },
      }}
    >
      <Stack.Screen name="supplier/profile" />
      <Stack.Screen name="supplier/nic-upload" />
      <Stack.Screen name="supplier/selfie" />
      <Stack.Screen name="supplier/categories" />
      <Stack.Screen name="supplier/category-selfie" />
      <Stack.Screen name="supplier/review" />
      <Stack.Screen name="supplier/submitted" options={{ animation: 'fade' }} />
      
      <Stack.Screen name="business/profile" />
      <Stack.Screen name="business/nic-upload" />
      <Stack.Screen name="business/selfie" />
      <Stack.Screen name="business/business-reg" />
      <Stack.Screen name="business/review" />
      <Stack.Screen name="business/submitted" options={{ animation: 'fade' }} />
    </Stack>
  );
}
