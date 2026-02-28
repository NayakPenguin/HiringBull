// Import  global CSS file
import '../../global.css';

import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import { ThemeProvider } from '@react-navigation/native';
import * as Font from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import React, { useEffect, useRef, useState } from 'react';
import { AppState, Platform, StyleSheet } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { KeyboardProvider } from 'react-native-keyboard-controller';

import { APIProvider } from '@/api';
import { GlobalLoadingOverlay } from '@/components/global-loading-overlay';
import { Toast } from '@/components/ui/Toast';
import { getUserInfo, updatePushToken } from '@/features/users';
import { hydrateAuth, useAuth } from '@/lib/auth';
import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';

import {
  completeOnboarding,
  hydrateOnboarding,
  loadSelectedTheme,
  updateUserInfo,
  useIsFirstTime,
  useNotificationObserver,
  useOnboarding,
} from '@/lib';
import { useThemeConfig } from '@/lib/use-theme-config';
import { NotificationPromptModal } from '@/utils/NotificationPromptModal';
import { useNotificationPermissionPrompt } from '@/utils/useNotificationPermissionPrompt';
import * as Updates from 'expo-updates';
import getOrCreateDeviceId from '@/utils/getOrCreatedId';

export { ErrorBoundary } from 'expo-router';

export const unstable_settings = {
  initialRouteName: '(app)',
};

hydrateOnboarding();
hydrateAuth();
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
  useNotificationObserver();

  return null;
}

function RootNavigator() {
  const [isFirstTime] = useIsFirstTime();
  const { isSignedIn, isLoaded } = useAuth();
  const hasCompletedOnboarding = useOnboarding.use.hasCompletedOnboarding();
  const _isSubscribed = useOnboarding.use.isSubscribed();

  const [isLoadingUser, setIsLoadingUser] = useState(false);
  const { modalVisible, setModalVisible, enablePrompt, recheckPermissions } =
    useNotificationPermissionPrompt();

  // Wait for auth store to hydrate before determining auth state
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

  // Hide splash once auth has loaded
  useEffect(() => {
    if (isLoaded) {
      SplashScreen.hideAsync();
    }
  }, [isLoaded]);

  const checkUserInfo = async () => {
    try {
      setIsLoadingUser(true);
      const data = await getUserInfo();
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
  const appState = useRef(AppState.currentState);
  const isFirstForeground = useRef(true);
  useEffect(() => {
    if (isSignedIn) {
      checkUserInfo();
    }
  }, [isSignedIn]);
  useEffect(() => {
    if (isAuthenticated) {
      enablePrompt(); // ✅ starts permission flow
    }
  }, [isAuthenticated]);
  useEffect(() => {
    const subscription = AppState.addEventListener(
      'change',
      async (nextState) => {
        // ✅ First foreground OR background → foreground
        if (
          nextState === 'active' &&
          (appState.current !== 'active' || isFirstForeground.current)
        ) {
          isFirstForeground.current = false;

          const { status } = await Notifications.getPermissionsAsync();

          if (status !== 'granted') {
            setModalVisible(true);
          }
        }

        appState.current = nextState;
      }
    );

    return () => subscription.remove();
  }, []);
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
        {/* <Stack.Protected guard={isFirstTime}>
          <Stack.Screen name="landing" options={{ headerShown: false }} />
        </Stack.Protected> */}

        <Stack.Protected guard={!isAuthenticated}>
          <Stack.Screen name="login" options={{ headerShown: false }} />
        </Stack.Protected>

        <Stack.Protected guard={!isLoadingUser && !hasCompletedOnboarding}>
          <Stack.Screen name="onboarding" options={{ headerShown: false }} />
        </Stack.Protected>

        <Stack.Protected guard={hasCompletedOnboarding}>
          <Stack.Screen name="(app)" options={{ headerShown: false }} />
        </Stack.Protected>
        <Stack.Protected guard={hasCompletedOnboarding}>
          <Stack.Screen
            name="edit-experience"
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="edit-companies"
            options={{ headerShown: false }}
          />
        </Stack.Protected>

        {/* Payment + no-membership accessible regardless of onboarding state */}
        <Stack.Screen name="payment" options={{ headerShown: false }} />
        <Stack.Screen name="no-membership" options={{ headerShown: false }} />
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
            <APIProvider>
              <BottomSheetModalProvider>
                {children}
                <Toast />
                <GlobalLoadingOverlay />
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
