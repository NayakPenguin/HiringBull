import { useQueryClient } from '@tanstack/react-query';
import { router, useRootNavigationState } from 'expo-router';
import { useEffect } from 'react';

import { useMyProfile } from '@/api/outreach/useUserInfo';

import { useNotifications } from '../notifications';

export function useSingleDeviceSessionGuard() {
  const queryClient = useQueryClient();
  const { expoPushToken } = useNotifications();
  const { data, isLoading } = useMyProfile();

  const rootNavigationState = useRootNavigationState();

  // Refetch devices on app open
  useEffect(() => {
    queryClient.invalidateQueries({
      queryKey: ['users', 'devices'],
    });
  }, []);

  useEffect(() => {
    // 🚨 critical guards
    if (!rootNavigationState?.key) return;
    if (isLoading) return;
    if (!expoPushToken) return;

    const activeDeviceToken = data?.devices?.[0]?.token;
    if (!activeDeviceToken) return;

    if (activeDeviceToken !== expoPushToken) {
      console.log('🚨 Device conflict → redirecting');
      router.replace('/outreach/deviceConflict');
    }
  }, [rootNavigationState?.key, isLoading, expoPushToken, data]);
}
