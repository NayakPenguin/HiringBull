import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { Pressable } from 'react-native';

import { Text, View } from '@/components/ui';

type Props = {
  title: string;
  subtitle?: string;
  rightAccessory?: React.ReactNode;
};

export function ScreenHeader({ title, subtitle, rightAccessory }: Props) {
  const router = useRouter();

  return (
    <View className="border-b border-neutral-100 bg-white px-4 pb-4 pt-2">
      <View className="flex-row items-center justify-between">
        <Pressable
          onPress={() => router.back()}
          hitSlop={12}
          className="h-10 w-10 items-center justify-center rounded-full active:bg-neutral-100"
          accessibilityRole="button"
          accessibilityLabel="Back"
        >
          <Ionicons name="chevron-back" size={24} color="#0a0a0a" />
        </Pressable>
        {rightAccessory ? <View>{rightAccessory}</View> : <View className="w-10" />}
      </View>
      <View className="mt-2 px-1">
        <Text className="text-[28px] font-extrabold leading-[34px] text-neutral-900">
          {title}
        </Text>
        {subtitle ? (
          <Text className="mt-1 text-[14px] leading-[20px] text-neutral-500">
            {subtitle}
          </Text>
        ) : null}
      </View>
    </View>
  );
}
