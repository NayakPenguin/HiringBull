import Constants from 'expo-constants';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Platform } from 'react-native';
import { AppState } from 'react-native';


import { updatePushToken } from '@/features/users';
import { storage } from '@/lib/storage';

import getOrCreateDeviceId from './getOrCreatedId';
import { queryClient } from '@/api/common/api-provider';

const PROMPT_INTERVAL = 10 * 60 * 1000; // 10 min (testing)
const LAST_PROMPT_TIME_KEY = 'last_notification_prompt_time';
const PUSH_REGISTERED_KEY = 'push_token_registered';
const LAST_FOREGROUND_PROMPT_KEY = 'last_foreground_prompt_time';


export function useNotificationPermissionPrompt() {
  const [modalVisible, setModalVisible] = useState(false);
  const [enabled, setEnabled] = useState(false);

  const hasRegistered = useRef(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const clearPromptInterval = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  const checkPermissions = useCallback(async () => {
    if (!Device.isDevice || !enabled) return;

    const { status: existingStatus } =
      await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    // 🟢 1️⃣ Ask OS native permission FIRST
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus === 'granted') {
      clearPromptInterval();
      setModalVisible(false);
      console.log('Notification permission granted.');

      const projectId =
        Constants.expoConfig?.extra?.eas?.projectId ??
        Constants.easConfig?.projectId;

      const { data: expoPushToken } = await Notifications.getExpoPushTokenAsync(
        { projectId }
      );
      console.log('Expo Push Token:', expoPushToken);

      const deviceId = await getOrCreateDeviceId();
      const platform = Platform.OS === 'android' ? 'android' : 'ios';

      const alreadyRegistered =
        storage.getBoolean(PUSH_REGISTERED_KEY) === true;

      // 🔁 Always re-register after logout / fresh login
      await updatePushToken({
        deviceId: deviceId,
        token: expoPushToken,
        type: platform,
      });
      queryClient.invalidateQueries({
        queryKey: ['users', 'me'],
      });

      storage.set(PUSH_REGISTERED_KEY, true);
      hasRegistered.current = true;

      return;
    }

    // ❌ Permission not granted → show modal
    const now = Date.now();
    const lastPromptTime = storage.getNumber(LAST_PROMPT_TIME_KEY);

    if (!lastPromptTime || now - lastPromptTime >= PROMPT_INTERVAL) {
      storage.set(LAST_PROMPT_TIME_KEY, now);
      setModalVisible(true);
    }
  }, [enabled]);

  useEffect(() => {
    if (!enabled) return;

    checkPermissions();

    intervalRef.current = setInterval(checkPermissions, PROMPT_INTERVAL);

    return () => clearPromptInterval();
  }, [enabled, checkPermissions]);

  const onModalClose = () => {
    storage.set(LAST_PROMPT_TIME_KEY, Date.now());
    setModalVisible(false);
  };

  return {
    modalVisible,
    setModalVisible,
    enablePrompt: () => setEnabled(true),
    onModalClose,
    recheckPermissions: checkPermissions,
  };
}
