import AppProvider from '@/providers/AppProvider';
import { Stack } from 'expo-router';
import { SafeAreaProvider } from 'react-native-safe-area-context';

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <AppProvider>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="index" />
          <Stack.Screen name="create" />
          <Stack.Screen name="decision/[id]" />
        </Stack>
      </AppProvider>
    </SafeAreaProvider>
  );
}
