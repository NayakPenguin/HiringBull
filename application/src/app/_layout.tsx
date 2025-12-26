// Import  global CSS file
import '../../global.css';

import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import { ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import React, { useEffect } from 'react';
import { Platform, StyleSheet } from 'react-native';
import FlashMessage from 'react-native-flash-message';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { KeyboardProvider } from 'react-native-keyboard-controller';
import { ClerkProvider, useAuth, useUser } from '@clerk/clerk-expo'
import { tokenCache } from '@clerk/clerk-expo/token-cache'

import { APIProvider } from '@/api';
import {
  hydrateOnboarding,
  loadSelectedTheme,
  resetOnboarding,
  useIsFirstTime,
  useNotificationObserver,
  useNotifications,
  useOnboarding,
} from '@/lib';
import { useThemeConfig } from '@/lib/use-theme-config';

export { ErrorBoundary } from 'expo-router';

export const unstable_settings = {
  initialRouteName: '(app)',
};

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

/**
 * Initializes push notifications only for authenticated, subscribed users.
 * This component renders nothing - it only runs the notification hooks.
 */
function NotificationInitializer() {
  const { expoPushToken } = useNotifications();
  const { getToken } = useAuth();
  useNotificationObserver();

  // Send push token to backend when available
  useEffect(() => {
    async function registerDeviceToken() {
      if (!expoPushToken) return;

      console.log('Push Token:', expoPushToken);

      try {
        // Get the JWT token from Clerk for authentication
        const authToken = await getToken();

        if (!authToken) {
          console.error('No authentication token available for device registration');
          return;
        }

        const API_URL = 'https://e09f70749ed9.ngrok-free.app/api/users/devices';
        const deviceType = Platform.OS === 'ios' ? 'ios' : 'android';

        const response = await fetch(API_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${authToken}`,
          },
          body: JSON.stringify({
            token: expoPushToken,
            type: deviceType,
          }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || `API error: ${response.status}`);
        }

        console.log('Push token registered:', data);
      } catch (error) {
        console.error('Failed to register push token:', error);
      }
    }

    registerDeviceToken();
  }, [expoPushToken, getToken]);

  return null;
}

function RootNavigator() {
    const [isFirstTime] = useIsFirstTime();
  const { isSignedIn, isLoaded } = useAuth()
    const hasCompletedOnboarding = useOnboarding.use.hasCompletedOnboarding();
    // const hasCompletedOnboarding = false;
    const isSubscribed = useOnboarding.use.isSubscribed();
    // const isSubscribed = false;

    // Wait for Clerk to load before determining auth state
    const isAuthenticated = isLoaded ? (isSignedIn ?? false) : false;

    // Notifications should only be initialized for paying users
    const shouldInitNotifications = isAuthenticated && isSubscribed;

  //   temporary flags for testing
//   const isFirstTime = false;
//   const isAuthenticated = true;
//   const hasCompletedOnboarding = true;
//   const isSubscribed = true;
// const shouldInitNotifications = true

  // Hide splash only after Clerk has loaded
  useEffect(() => {
    if (isLoaded) {
      SplashScreen.hideAsync();
    }
  }, [isLoaded]);

  return (
    <>
      {shouldInitNotifications && <NotificationInitializer />}
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
    </>
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
          <ClerkProvider tokenCache={tokenCache}>
          <APIProvider>
            <BottomSheetModalProvider>
              {children}
              <FlashMessage position="top" />
            </BottomSheetModalProvider>
          </APIProvider>
      </ClerkProvider>
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
