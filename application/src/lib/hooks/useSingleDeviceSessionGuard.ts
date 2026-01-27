import { useQueryClient } from '@tanstack/react-query';
import { router, useRootNavigationState } from 'expo-router';
import { useEffect, useMemo } from 'react';

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

  const isConflict = useMemo(() => {
    if (!rootNavigationState?.key) return false;
    if (isLoading) return false;
    if (!expoPushToken) return false;
    console.log("expopush token",expoPushToken)

    const activeDeviceToken = data?.devices?.[0]?.token;
    console.log("active token",activeDeviceToken)
    if (!activeDeviceToken) return false;

    return activeDeviceToken !== expoPushToken;
  }, [rootNavigationState?.key, isLoading, expoPushToken, data]);

  return {
    isLoading,
    isConflict,
  };
}