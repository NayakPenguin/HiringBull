import { Ionicons } from '@expo/vector-icons';
import { BottomSheetModal } from '@gorhom/bottom-sheet';
import React, { forwardRef } from 'react';
import { Dimensions, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Modal, Text, View } from '@/components/ui';

type AppConfirmModalProps = {
  title: string;
  description?: string;
  confirmText?: string;
  cancelText?: string;
  isDestructive?: boolean;
  onConfirm: () => void;
};

export const AppConfirmModal = forwardRef<
  BottomSheetModal,
  AppConfirmModalProps
>(function AppConfirmModal(
  {
    title,
    description,
    confirmText = 'Confirm',
    cancelText = 'Cancel',
    isDestructive = false,
    onConfirm,
  },
  ref
) {
  const { height: SCREEN_HEIGHT } = Dimensions.get('window');
  const insets = useSafeAreaInsets();

  const TAB_BAR_HEIGHT = 56;
  const MODAL_HEIGHT = Math.min(
    SCREEN_HEIGHT * 0.3,
    SCREEN_HEIGHT - TAB_BAR_HEIGHT - insets.bottom - 32
  );
  return (
    <Modal ref={ref} snapPoints={[MODAL_HEIGHT]}>
      <View className="flex-1 px-6">
        {/* Icon */}
        <View className="flex-row items-center">
          <View
            className={`mr-4 size-12 items-center justify-center rounded-full ${
              isDestructive ? 'bg-danger-50' : 'bg-neutral-100'
            }`}
          >
            <Ionicons
              name={isDestructive ? 'warning-outline' : 'help-circle-outline'}
              size={24}
              color={isDestructive ? '#ef4444' : '#525252'}
            />
          </View>

          <Text className="text-xl font-bold text-neutral-900">{title}</Text>
        </View>

        {description && (
          <Text className="mt-2 text-sm text-neutral-500">{description}</Text>
        )}

        {/* Actions */}
        <View className="mt-8 flex-row gap-3">
          <Pressable
            onPress={() => (ref as any)?.current?.dismiss()}
            className="flex-1 rounded-xl border border-neutral-300 py-3"
          >
            <Text className="text-center text-base font-semibold text-neutral-700">
              {cancelText}
            </Text>
          </Pressable>

          <Pressable
            onPress={() => {
              (ref as any)?.current?.dismiss();
              onConfirm();
            }}
            className={`flex-1 rounded-xl py-3 ${
              isDestructive ? 'bg-danger-600' : 'bg-neutral-900'
            }`}
          >
            <Text className="text-center text-base font-semibold text-white">
              {confirmText}
            </Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
});
