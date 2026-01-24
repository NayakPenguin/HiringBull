import { useEffect, useRef, useState } from 'react';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';

export function useNotificationPermissionPrompt() {
  const lastPromptTime = useRef<number>(0);
  const [modalVisible, setModalVisible] = useState(false);

  const checkPermissions = async () => {
    if (!Device.isDevice) return;

    const { status } = await Notifications.getPermissionsAsync();

    if (status !== 'granted') {
      const now = Date.now();
      if (
        !lastPromptTime.current ||
        now - lastPromptTime.current > 10 * 60 * 1000
      ) {
        lastPromptTime.current = now;
        setModalVisible(true);
      }
    }
  };

  useEffect(() => {
    checkPermissions();

    const subscription = Notifications.addNotificationResponseReceivedListener(
      () => {
        checkPermissions();
      }
    );

    return () => subscription.remove();
  }, []);

  return { modalVisible, setModalVisible };
}
