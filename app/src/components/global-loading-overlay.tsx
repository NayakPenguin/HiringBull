import React from 'react';
import { Modal, StyleSheet, View } from 'react-native';
import { useGlobalLoading } from '@/lib/stores/global-loading-store';
import LogoLoader from './logo-loader';

export function GlobalLoadingOverlay() {
  const { isLoading } = useGlobalLoading();

  if (!isLoading) return null;

  return (
    <Modal
      transparent
      visible={isLoading}
      animationType="fade"
      statusBarTranslucent
    >
      <View style={styles.overlay}>
        <LogoLoader />
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
