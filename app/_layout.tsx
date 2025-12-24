import { RouteNames } from '@/constants/routes';
import { Stack } from 'expo-router';
import { SafeAreaProvider } from 'react-native-safe-area-context';

export default function RootLayout() {

  return (
    <SafeAreaProvider>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name={RouteNames.HOME}/>
        <Stack.Screen name={RouteNames.DECISION_SELECTION}/>
      </Stack>
    </SafeAreaProvider>
  );
}
