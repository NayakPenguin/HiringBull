import { useQueryClient } from '@tanstack/react-query';
import * as SecureStore from 'expo-secure-store';
import { useEffect, useMemo, useRef, useState } from 'react';
import { AppState } from 'react-native';

import { useMyProfile } from '@/api/outreach/useUserInfo';

export function useSingleDeviceSessionGuard() {
  const queryClient = useQueryClient();
  const { data, isLoading } = useMyProfile();

  const [localDeviceId, setLocalDeviceId] = useState<string | null>(null);
  const [shouldCheck, setShouldCheck] = useState(true);

  const appState = useRef(AppState.currentState);

  useEffect(() => {
    (async () => {
      const deviceId = await SecureStore.getItemAsync('DEVICE_ID');
      setLocalDeviceId(deviceId);
    })();
  }, []);

  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextState) => {
      if (
        appState.current.match(/inactive|background/) &&
        nextState === 'active'
      ) {
        queryClient.invalidateQueries({
          queryKey: ['users', 'me'],
        });
        setShouldCheck(true);
      }
      appState.current = nextState;
    });

    return () => subscription.remove();
  }, [queryClient]);

  const isConflict = useMemo(() => {
    if (!shouldCheck) return false;
    if (isLoading) return false;
    if (!localDeviceId) return false;

    // 👇 DB se active device id
    const activeDeviceId = data?.devices?.[0]?.deviceId;

    if (!activeDeviceId) return false;

    return activeDeviceId !== localDeviceId;
  }, [shouldCheck, isLoading, localDeviceId, data]);

  return {
    isLoading,
    isConflict,
  };
}