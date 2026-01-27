import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { useCallback, useEffect, useRef, useState } from 'react';

export function useNotificationPermissionPrompt() {
  const lastPromptTime = useRef<number>(0);
  const [modalVisible, setModalVisible] = useState(false);
  const [enabled, setEnabled] = useState(false);

  const checkPermissions = useCallback(async () => {
    if (!Device.isDevice) return;
    if (!enabled) return;

    const { status: existingStatus } =
      await Notifications.getPermissionsAsync();

    let finalStatus = existingStatus;

    // 🔔 OS-level prompt (only once per session)
    if (finalStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    const now = Date.now();

    if (
      finalStatus !== 'granted' &&
      (!lastPromptTime.current || now - lastPromptTime.current > 10 * 60 * 1000)
    ) {
      lastPromptTime.current = now;
      setModalVisible(true);
    }
  }, [enabled]);

  // Start listening ONLY when enabled
  useEffect(() => {
    if (!enabled) return;

    checkPermissions();

    const subscription = Notifications.addNotificationResponseReceivedListener(
      () => {
        checkPermissions();
      }
    );

    return () => subscription.remove();
  }, [enabled, checkPermissions]);

  return {
    modalVisible,
    setModalVisible,
    enablePrompt: () => setEnabled(true),
  };
}
