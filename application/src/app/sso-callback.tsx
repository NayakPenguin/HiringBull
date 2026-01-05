import { useEffect, useCallback } from 'react';
import { View, ActivityIndicator, Text } from 'react-native';
import * as WebBrowser from 'expo-web-browser';
import { useRouter, useFocusEffect } from 'expo-router';
import { useAuth } from '@clerk/clerk-expo';
import { useOnboarding } from '@/lib';

// This MUST be called to complete the OAuth session
WebBrowser.maybeCompleteAuthSession();

export default function SSOCallback() {
  console.log('SSOCallback component mounted!');
  const router = useRouter();
  const { isSignedIn, isLoaded } = useAuth();

  // Get user state to determine where to route
  const hasCompletedOnboarding = useOnboarding.use.hasCompletedOnboarding();
  const isSubscribed = useOnboarding.use.isSubscribed();

  // Helper to determine target route based on state
  const getTargetRoute = () => {
    if (!hasCompletedOnboarding) return '/onboarding';
    if (!isSubscribed) return '/payment';
    return '/';
  };

  // Use useFocusEffect to ensure navigation happens when the screen is focused
  useFocusEffect(
    useCallback(() => {
      if (!isLoaded) {
        console.log('SSO Callback: Waiting for Clerk to load...');
        return;
      }

      console.log('SSO Callback: isSignedIn =', isSignedIn);

      if (isSignedIn) {
        const target = getTargetRoute();
        console.log(`SSO Callback: User is signed in! Navigating to ${target}...`);

        // Use setTimeout to ensure navigation happens after the current render cycle
        setTimeout(() => {
          router.replace(target);
        }, 100);
      }
    }, [isLoaded, isSignedIn, router, hasCompletedOnboarding, isSubscribed])
  );

  // Fallback timeout - if still on this screen after 5 seconds, force navigation
  useEffect(() => {
    const timeout = setTimeout(() => {
      console.log('SSO Callback: Timeout reached, forcing navigation...');
      if (isSignedIn) {
        console.log("Getting target")
        const route = getTargetRoute()
        console.log("target route is " , route)
        router.replace(getTargetRoute());
      } else {
        console.log("moving to login")
        router.replace('/login');
      }
    }, 5000);

    return () => clearTimeout(timeout);
  }, [isSignedIn, router, hasCompletedOnboarding, isSubscribed]);

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' }}>
      <ActivityIndicator size="large" color="#000" />
      <Text style={{ marginTop: 16, color: '#666' }}>SSO callback screen</Text>
    </View>
  );
}
