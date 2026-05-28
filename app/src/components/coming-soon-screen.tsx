import { Ionicons } from '@expo/vector-icons';
import React from 'react';

import { SafeAreaView, Text, View } from '@/components/ui';

import { ScreenHeader } from './screen-header';

type Props = {
  title: string;
  subtitle?: string;
  message?: string;
  icon?: keyof typeof Ionicons.glyphMap;
};

export function ComingSoonScreen({
  title,
  subtitle,
  message = 'We are putting the final touches on this. Check back very soon.',
  icon = 'construct-outline',
}: Props) {
  return (
    <SafeAreaView className="flex-1 bg-white" edges={['top']}>
      <ScreenHeader title={title} subtitle={subtitle} />
      <View className="flex-1 items-center justify-center px-8">
        <View className="h-20 w-20 items-center justify-center rounded-3xl bg-neutral-100">
          <Ionicons name={icon} size={36} color="#525252" />
        </View>
        <Text className="mt-6 text-center text-[20px] font-bold text-neutral-900">
          Coming soon
        </Text>
        <Text className="mt-2 max-w-[300px] text-center text-[14px] leading-[20px] text-neutral-500">
          {message}
        </Text>
      </View>
    </SafeAreaView>
  );
}
