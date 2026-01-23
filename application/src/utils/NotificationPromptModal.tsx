import React from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
} from 'react-native';
import * as Notifications from 'expo-notifications';
import { Linking } from 'react-native';

interface Props {
  visible: boolean;
  onClose: () => void;
}

export const NotificationPromptModal: React.FC<Props> = ({
  visible,
  onClose,
}) => {
  const openAppSettings = () => {
    if (Platform.OS === 'ios') {
      Notifications.openSettings();
    } else {
      Linking.openSettings();
    }
    onClose();
  };

  return (
    <Modal transparent visible={visible} animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.container}>
          <Text style={styles.title}>Enable Notifications</Text>
          <Text style={styles.message}>
            Notifications are currently disabled. Please enable them in your
            device settings to receive important updates.
          </Text>
          <View style={styles.buttonRow}>
            <TouchableOpacity
              style={[styles.button, styles.cancel]}
              onPress={onClose}
            >
              <Text style={styles.buttonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.button, styles.open]}
              onPress={openAppSettings}
            >
              <Text style={[styles.buttonText, { color: '#fff' }]}>
                Open Settings
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    width: '85%',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 10,
  },
  message: {
    fontSize: 14,
    color: '#555',
    marginBottom: 20,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  button: {
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 8,
    marginLeft: 10,
  },
  cancel: {
    backgroundColor: '#eee',
  },
  open: {
    backgroundColor: '#404040',
  },
  buttonText: {
    fontSize: 14,
  },
});
