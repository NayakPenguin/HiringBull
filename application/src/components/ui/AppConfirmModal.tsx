import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { Ionicons } from '@expo/vector-icons';
import React, { forwardRef } from 'react';
import { Pressable } from 'react-native';

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
  return (
    <Modal ref={ref} snapPoints={['30%']}>
      <View className="flex-1 px-6 pt-6 pb-8">
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
