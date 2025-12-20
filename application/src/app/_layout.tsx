// Import  global CSS file
import '../../global.css';

import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import { ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import React, { useEffect } from 'react';
import { StyleSheet } from 'react-native';
import FlashMessage from 'react-native-flash-message';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { KeyboardProvider } from 'react-native-keyboard-controller';

import { APIProvider } from '@/api';
import {
  hydrateAuth,
  hydrateOnboarding,
  loadSelectedTheme,
  useAuth,
  useIsFirstTime,
  useNotifications,
  useOnboarding,
} from '@/lib';
import { useThemeConfig } from '@/lib/use-theme-config';

export { ErrorBoundary } from 'expo-router';

export const unstable_settings = {
  initialRouteName: '(app)',
};

hydrateAuth();
hydrateOnboarding();
loadSelectedTheme();
// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();
// Set the animation options. This is optional.
SplashScreen.setOptions({
  duration: 500,
  fade: true,
});

export default function RootLayout() {
  return (
    <Providers>
      <RootNavigator />
    </Providers>
  );
}

function RootNavigator() {
    const [isFirstTime] = useIsFirstTime();
    const hasCompletedOnboarding = useOnboarding.use.hasCompletedOnboarding();
    const isSubscribed = useOnboarding.use.isSubscribed();
    const status = useAuth.use.status();
    const isAuthenticated = status === 'signIn';

    // Initialize push notifications
    const { expoPushToken } = useNotifications();
    console.log('Push Token:', expoPushToken);

  //   temporary flags for testing
//   const isFirstTime = false;
//   const isAuthenticated = true;
//   const hasCompletedOnboarding = true;
//   const isSubscribed = true;

  // Hide splash once we have initial state
  useEffect(() => {
    SplashScreen.hideAsync();
  }, []);

  return (
    <Stack>
      <Stack.Protected guard={isFirstTime}>
        <Stack.Screen name="landing" options={{ headerShown: false }} />
      </Stack.Protected>

      <Stack.Protected guard={!isFirstTime && !isAuthenticated}>
        <Stack.Screen name="login" options={{ headerShown: false }} />
      </Stack.Protected>

      <Stack.Protected guard={isAuthenticated && !hasCompletedOnboarding}>
        <Stack.Screen name="onboarding" options={{ headerShown: false }} />
      </Stack.Protected>

      <Stack.Protected
        guard={isAuthenticated && hasCompletedOnboarding && !isSubscribed}
      >
        <Stack.Screen name="payment" options={{ headerShown: false }} />
      </Stack.Protected>

      <Stack.Protected
        guard={isAuthenticated && hasCompletedOnboarding && isSubscribed}
      >
        <Stack.Screen name="(app)" options={{ headerShown: false }} />
      </Stack.Protected>
    </Stack>
  );
}

function Providers({ children }: { children: React.ReactNode }) {
  const theme = useThemeConfig();
  return (
    <GestureHandlerRootView
      style={styles.container}
      className={theme.dark ? `dark` : undefined}
    >
      <KeyboardProvider>
        <ThemeProvider value={theme}>
          <APIProvider>
            <BottomSheetModalProvider>
              {children}
              <FlashMessage position="top" />
            </BottomSheetModalProvider>
          </APIProvider>
        </ThemeProvider>
      </KeyboardProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
