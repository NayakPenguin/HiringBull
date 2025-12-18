import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import React from 'react';
import { Pressable } from 'react-native';

import {
  FocusAwareStatusBar,
  SafeAreaView,
  ScrollView,
  Text,
  View,
} from '@/components/ui';

type SettingsItem = {
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  color?: string;
  iconColor?: string;
  isDestructive?: boolean;
  onPress?: () => void;
};

const SETTINGS: SettingsItem[] = [
  {
    label: 'Report issue',
    icon: 'warning-outline',
    iconColor: '#f59e0b', // amber-500
  },
  {
    label: 'Change segment',
    icon: 'layers-outline',
    iconColor: '#3b82f6', // blue-500
  },
  {
    label: 'Update Companies',
    icon: 'business-outline',
    iconColor: '#8b5cf6', // violet-500
  },
  {
    label: 'Logout',
    icon: 'log-out-outline',
    isDestructive: true,
  },
];

function SettingsItemRow({ item }: { item: SettingsItem }) {
  return (
    <Pressable className="mb-3 flex-row items-center justify-between rounded-2xl border border-neutral-100 bg-white p-4 shadow-sm active:bg-neutral-50 dark:border-neutral-800 dark:bg-neutral-900 dark:active:bg-neutral-800">
      <View className="flex-row items-center gap-4">
        <View
          className={`size-10 items-center justify-center rounded-full ${
            item.isDestructive
              ? 'bg-red-50 dark:bg-red-900/20'
              : 'bg-neutral-50 dark:bg-neutral-800'
          }`}
        >
          <Ionicons
            name={item.icon}
            size={20}
            color={item.isDestructive ? '#ef4444' : item.iconColor || '#525252'}
          />
        </View>
        <Text
          className={`text-base font-semibold ${
            item.isDestructive
              ? 'text-red-500 dark:text-red-400'
              : 'text-neutral-900 dark:text-white'
          }`}
        >
          {item.label}
        </Text>
      </View>
      <Ionicons
        name="chevron-forward"
        size={20}
        color={item.isDestructive ? '#ef4444' : '#d4d4d4'}
      />
    </Pressable>
  );
}

export default function Profile() {
  return (
    <SafeAreaView
      className="flex-1 bg-white dark:bg-neutral-950"
      edges={['top']}
    >
      <FocusAwareStatusBar />
      <View className="flex-1 px-6 pt-8">
        {/* Header Section */}
        <View className="mb-8">
          <Text className="text-xl font-medium text-neutral-500 dark:text-neutral-400">
            Hey,
          </Text>
          <Text className="text-4xl font-black text-neutral-900 dark:text-white">
            Atanu Nayak
          </Text>
        </View>

        {/* Referral/Info Card */}
        <View className="mb-10 rounded-3xl bg-neutral-900 p-6 shadow-md dark:bg-neutral-800">
          <View className="mb-4 size-12 items-center justify-center rounded-full bg-white/10">
            <Ionicons name="gift-outline" size={24} color="white" />
          </View>
          <Text className="text-lg font-bold leading-7 text-white">
            Hope you are enjoying our product, share it with your friends and
            get referral bonus of 100.
          </Text>
        </View>

        {/* Settings List */}
        <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
          <Text className="mb-4 text-sm font-bold uppercase tracking-wider text-neutral-400">
            Settings
          </Text>
          {SETTINGS.map((item, index) => (
            <SettingsItemRow key={index} item={item} />
          ))}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}
