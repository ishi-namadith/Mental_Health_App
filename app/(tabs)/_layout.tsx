import { Stack } from 'expo-router';
import { Platform } from 'react-native';

export default function TabsLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        // Fix for Android to prevent white flash during screen transitions
        animation: Platform.OS === 'android' ? 'none' : 'default',
      }}
    >
      <Stack.Screen name="index" />
      <Stack.Screen name="termsandconditions" />
      <Stack.Screen name="language" />
      <Stack.Screen name="dashboard" />
    </Stack>
  );
}