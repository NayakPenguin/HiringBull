// Import  global CSS file
import '../../global.css';

import { ClerkProvider, useAuth } from '@clerk/clerk-expo';
import { tokenCache } from '@clerk/clerk-expo/token-cache';
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import { ThemeProvider } from '@react-navigation/native';
import * as Font from 'expo-font';
import { Stack } from 'expo-router';
import { Slot } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import React, { useEffect, useState } from 'react';
import { Platform, StyleSheet } from 'react-native';
import FlashMessage from 'react-native-flash-message';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { KeyboardProvider } from 'react-native-keyboard-controller';

import { APIProvider } from '@/api';
import { GlobalLoadingOverlay } from '@/components/global-loading-overlay';
import { Toast } from '@/components/ui/Toast';
import { getUserInfo, useRegisterDevice } from '@/features/users';
import { updateUserInfo } from '@/lib';
import {
  completeOnboarding,
  hydrateOnboarding,
  loadSelectedTheme,
  useIsFirstTime,
  useNotificationObserver,
  useNotifications,
  useOnboarding,
} from '@/lib';
import { useSingleDeviceSessionGuard } from '@/lib/hooks/useSingleDeviceSessionGuard';
import { useThemeConfig } from '@/lib/use-theme-config';
import { authService } from '@/service/auth-service';
import { NotificationPromptModal } from '@/utils/NotificationPromptModal';
import { useNotificationPermissionPrompt } from '@/utils/useNotificationPermissionPrompt';

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
  const { expoPushToken, notification } = useNotifications();
  const { mutate: registerDevice } = useRegisterDevice();
  const { isSignedIn } = useAuth();
  useNotificationObserver();

  // Send push token to backend when available AND user is authenticated
  useEffect(() => {
    if (expoPushToken && isSignedIn) {
      console.log('Push Token:', expoPushToken, notification);
      const deviceType = Platform.OS === 'ios' ? 'ios' : 'android';
      registerDevice({ token: expoPushToken, type: deviceType });
    }
  }, [expoPushToken, registerDevice, isSignedIn]);

  return null;
}

function RootNavigator() {
  const [isFirstTime] = useIsFirstTime();
  const { isSignedIn, isLoaded, getToken } = useAuth();
  const hasCompletedOnboarding = useOnboarding.use.hasCompletedOnboarding();
  const _isSubscribed = useOnboarding.use.isSubscribed();

  const [isLoadingUser, setIsLoadingUser] = useState(false);
  const { modalVisible, setModalVisible } = useNotificationPermissionPrompt();
  console.log('modalVisible', modalVisible);
  useSingleDeviceSessionGuard();
  // Sync auth service with Clerk
  useEffect(() => {
    if (isSignedIn) {
      authService.setGetTokenFunction(getToken);
    } else {
      authService.clearAuth();
    }
  }, [isSignedIn, getToken]);

  // Wait for Clerk to load before determining auth state
  const isAuthenticated = isLoaded ? (isSignedIn ?? false) : false;

  // Notifications should only be initialized for authenticated users
  const shouldInitNotifications = isAuthenticated;
  // console.log(shouldInitNotifications, isAuthenticated);

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

  const checkUserInfo = async () => {
    try {
      console.log(' checkUserInfo: Starting to fetch user info...');
      setIsLoadingUser(true);
      const data = await getUserInfo();
      // console.log(
      //   'checkUserInfo: User data received:',
      //   JSON.stringify(data, null, 2)
      // );
      if (Boolean(data.onboarding_completed)) {
        completeOnboarding();
        updateUserInfo(data);
      }
    } catch (e: any) {
      console.error('checkUserInfo: Failed to get user info:', e?.message || e);
    } finally {
      setIsLoadingUser(false);
    }
  };

  useEffect(() => {
    if (isSignedIn) {
      checkUserInfo();
    }
  }, [isSignedIn]);

  const [fontsLoaded, setFontsLoaded] = useState(false);

  useEffect(() => {
    const loadFonts = async () => {
      try {
        await Font.loadAsync({
          Montez: require('../../assets/fonts/Montez-Regular.ttf'),
        });
      } finally {
        setFontsLoaded(true);
        SplashScreen.hideAsync();
      }
    };

    loadFonts();
  }, []);

  if (!fontsLoaded) {
    return null; // SplashScreen stays visible
  }
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

        <Stack.Protected guard={!isLoadingUser && !hasCompletedOnboarding}>
          <Stack.Screen name="onboarding" options={{ headerShown: false }} />
        </Stack.Protected>

        <Stack.Protected guard={hasCompletedOnboarding}>
          <Stack.Screen name="(app)" options={{ headerShown: false }} />
        </Stack.Protected>
        <Stack.Protected guard={hasCompletedOnboarding}>
          <Stack.Screen name="payment" options={{ headerShown: false }} />
          <Stack.Screen
            name="edit-experience"
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="edit-companies"
            options={{ headerShown: false }}
          />
        </Stack.Protected>

        {/* SSO callback route - accessible during OAuth flow */}
        <Stack.Screen name="sso-callback" options={{ headerShown: false }} />
      </Stack>
      {shouldInitNotifications && (
        <NotificationPromptModal
          visible={modalVisible}
          onClose={() => setModalVisible(false)}
        />
      )}
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
          <ClerkProvider
            tokenCache={tokenCache}
            publishableKey={process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY}
          >
            <APIProvider>
              <BottomSheetModalProvider>
                {children}
                <Toast />
                <GlobalLoadingOverlay />
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
