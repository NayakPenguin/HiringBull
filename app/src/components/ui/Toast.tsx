import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { View, Text } from 'react-native';

import { useToastStore } from '@/lib/stores/toast-store';

const toastStyles = {
  success: {
    bg: 'bg-green-600',
    icon: 'checkmark-circle',
  },
  error: {
    bg: 'bg-red-600',
    icon: 'close-circle',
  },
  info: {
    bg: 'bg-neutral-800',
    icon: 'information-circle',
  },
} as const;

export function Toast() {
  const { visible, message, type } = useToastStore();

  if (!visible) return null;

  const style = toastStyles[type];

  return (
    <View className="absolute bottom-10 inset-x-4 z-50 items-center">
      <View
        className={`flex-row items-center gap-3 rounded-xl px-4 py-3 ${style.bg}`}
      >
        <Ionicons name={style.icon as any} size={20} color="#fff" />
        <Text className="flex-1 text-sm font-medium text-white">{message}</Text>
      </View>
    </View>
  );
}
