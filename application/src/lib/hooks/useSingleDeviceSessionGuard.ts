import { useQueryClient } from '@tanstack/react-query';
import { useEffect, useMemo, useRef, useState } from 'react';
import { AppState } from 'react-native';

import { useMyProfile } from '@/api/outreach/useUserInfo';

import { useNotifications } from '../notifications';

export function useSingleDeviceSessionGuard() {
  const queryClient = useQueryClient();
  const { expoPushToken } = useNotifications();
  const { data, isLoading } = useMyProfile();

  const [shouldCheck, setShouldCheck] = useState(true);
  const appState = useRef(AppState.currentState);

  // Run ONLY when app comes to foreground
  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextState) => {
      if (
        appState.current.match(/inactive|background/) &&
        nextState === 'active'
      ) {
        queryClient.invalidateQueries({
          queryKey: ['users', 'devices'],
        });
        setShouldCheck(true);
      }
      appState.current = nextState;
    });

    return () => subscription.remove();
  }, []);

  const isConflict = useMemo(() => {
    if (!shouldCheck) return false;
    if (isLoading) return false;
    if (!expoPushToken) return false;

    const activeDeviceToken = data?.devices?.[0]?.token;
    if (!activeDeviceToken) return false;

    return activeDeviceToken !== expoPushToken;
  }, [shouldCheck, isLoading, expoPushToken, data]);

  return {
    isLoading,
    isConflict,
  };
}