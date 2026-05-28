import { Ionicons } from '@expo/vector-icons';
import { useQueryClient } from '@tanstack/react-query';
import Constants from 'expo-constants';
import * as Notifications from 'expo-notifications';
import { Tabs, useRouter } from 'expo-router';
import { useColorScheme } from 'nativewind';
import React, { useEffect, useRef } from 'react';
import { AppState, Platform, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { getUserInfo, updatePushToken } from '@/features/users';
import { useSingleDeviceSessionGuard } from '@/lib/hooks/useSingleDeviceSessionGuard';
import {
  getMembership,
  isMembershipValid,
  saveMembership,
} from '@/lib/membership';
import getOrCreateDeviceId from '@/utils/getOrCreatedId';

import DeviceConflict from './outreach/deviceConflict';

export default function TabLayout() {
  const insets = useSafeAreaInsets();
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';
  const appState = useRef(AppState.currentState);
  const queryClient = useQueryClient();
  const router = useRouter();
  useEffect(() => {
    const checkMembership = async () => {
      let membershipData = getMembership();
      console.log(
        '[TabLayout] Mount: membershipData =',
        JSON.stringify(membershipData)
      );

      // If local membership is missing or expired, try restoring from server
      if (!membershipData || !isMembershipValid(membershipData.membershipEnd)) {
        console.log(
          '[TabLayout] Local membership missing/expired, checking server...'
        );
        try {
          const userInfo = await getUserInfo();
          const serverPlanEnd =
            userInfo.current_plan_end || userInfo.planExpiry;
          if (
            userInfo.isPaid &&
            serverPlanEnd &&
            new Date(serverPlanEnd) > new Date()
          ) {
            saveMembership({
              email: userInfo.email,
              membershipEnd: new Date(serverPlanEnd).toISOString(),
            });
            console.log(
              '[TabLayout] Membership restored from server, expires',
              serverPlanEnd
            );
            return; // Stay in (app)
          }
        } catch (e: any) {
          console.warn(
            '[TabLayout] Failed to check server membership:',
            e.message
          );
        }

        console.log(
          '[TabLayout] No valid membership → redirecting to /no-membership'
        );
        router.replace('/no-membership');
        return;
      }

      console.log('[TabLayout] Membership is valid, staying in (app)');
    };

    checkMembership();
  }, []);
  useEffect(() => {
    const subscription = AppState.addEventListener(
      'change',
      async (nextAppState) => {
        // app coming back to foreground
        if (
          appState.current.match(/inactive|background/) &&
          nextAppState === 'active'
        ) {
          const membershipData = getMembership();
          if (
            !membershipData ||
            !isMembershipValid(membershipData.membershipEnd)
          ) {
            // Try server before kicking out
            try {
              const userInfo = await getUserInfo();
              const serverPlanEnd =
                userInfo.current_plan_end || userInfo.planExpiry;
              if (
                userInfo.isPaid &&
                serverPlanEnd &&
                new Date(serverPlanEnd) > new Date()
              ) {
                saveMembership({
                  email: userInfo.email,
                  membershipEnd: new Date(serverPlanEnd).toISOString(),
                });
                console.log(
                  '[TabLayout] Foreground: membership restored from server'
                );
              } else {
                router.replace('/no-membership');
                return;
              }
            } catch {
              router.replace('/no-membership');
              return;
            }
          }
          // 1️⃣ Check permission
          const { status } = await Notifications.getPermissionsAsync();

          if (status === 'granted') {
            const projectId =
              Constants.expoConfig?.extra?.eas?.projectId ??
              Constants.easConfig?.projectId;

            const { data: expoPushToken } =
              await Notifications.getExpoPushTokenAsync({ projectId });

            const deviceId = await getOrCreateDeviceId();
            const platform = Platform.OS === 'android' ? 'android' : 'ios';

            // 🔁 Always re-register after logout / fresh login
            await updatePushToken({
              deviceId: deviceId,
              token: expoPushToken,
              type: platform,
            });
            queryClient.invalidateQueries({
              queryKey: ['users', 'me'],
            });
          }
        }

        appState.current = nextAppState;
      }
    );

    return () => subscription.remove();
  }, []);

  const { isConflict, isLoading: isSessionCheckLoading } =
    useSingleDeviceSessionGuard();

  if (!isSessionCheckLoading && isConflict) {
    // console.log("device conflict", isConflict)
    return <DeviceConflict />;
  }

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: true,
        tabBarActiveTintColor: isDark ? '#ffffff' : '#0a0a0a', // black active (matches original main)
        tabBarInactiveTintColor: '#a3a3a3', // neutral-400
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
          marginTop: 2,
        },
        tabBarStyle: {
          backgroundColor: isDark ? '#000000' : '#ffffff',
          borderTopColor: isDark ? '#262626' : '#f5f5f5',
          borderTopWidth: 1,
          paddingTop: 8,
          paddingBottom: Math.max(insets.bottom, 8),
          height: 60 + insets.bottom,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          tabBarLabel: 'Jobs',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? 'briefcase' : 'briefcase-outline'}
              size={24}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="outreach"
        options={{
          tabBarLabel: 'Referrals',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? 'paper-plane' : 'paper-plane-outline'}
              size={24}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="resources"
        options={{
          tabBarLabel: 'Copilot',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? 'sparkles' : 'sparkles-outline'}
              size={24}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          tabBarLabel: 'Profile',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? 'person' : 'person-outline'}
              size={24}
              color={color}
            />
          ),
        }}
      />

      {/* Hidden screens */}
      <Tabs.Screen name="style" options={{ href: null }} />
      <Tabs.Screen name="settings" options={{ href: null }} />
    </Tabs>
  );
}
