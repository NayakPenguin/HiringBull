import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';

import {
  FocusAwareStatusBar,
  Pressable,
  SafeAreaView,
  Text,
  View,
} from '@/components/ui';
import { subscribe } from '@/lib';

const BENEFITS = [
  'Access to all job listings & applications',
  'Direct connect with HRs & employees',
  'Real-time interview experiences',
  'Priority support from our team',
];

export default function Payment() {
  const router = useRouter();

  const handleSubscribe = () => {
    subscribe();
    router.replace('/');
  };

  return (
    <View className="flex-1 bg-white dark:bg-neutral-950">
      <FocusAwareStatusBar />
      <SafeAreaView className="flex-1">
        <View className="flex-1 px-6 pt-10">
          <View className="items-center">
            <Text className="text-center text-4xl font-black text-neutral-900 dark:text-white">
              Get Started
            </Text>
            <Text className="mt-4 text-center text-lg font-medium text-neutral-500 dark:text-neutral-400">
              Subscribe to access the app and supercharge your job search
            </Text>
          </View>

          <View className="mt-12 rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
            <View className="mb-6 items-center border-b border-neutral-100 pb-6 dark:border-neutral-800">
              <Text className="text-sm font-bold uppercase tracking-widest text-neutral-500">
                Monthly
              </Text>
              <View className="flex-row items-baseline">
                <Text className="text-5xl font-black text-neutral-900 dark:text-white">
                  ₹299
                </Text>
                <Text className="ml-1 text-lg font-medium text-neutral-500">
                  /month
                </Text>
              </View>
              <Text className="mt-2 text-sm text-neutral-400">
                Less than ₹10/day
              </Text>
            </View>

            <View className="gap-4">
              {BENEFITS.map((benefit, index) => (
                <View key={index} className="flex-row items-center gap-3">
                  <View className="size-6 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/30">
                    <Ionicons name="checkmark" size={14} color="#10b981" />
                  </View>
                  <Text className="text-base font-medium text-neutral-600 dark:text-neutral-300">
                    {benefit}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        </View>

        <View className="border-t border-neutral-200 bg-white px-6 pb-8 pt-4 dark:border-neutral-800 dark:bg-neutral-950">
          <Pressable
            onPress={handleSubscribe}
            className="h-14 items-center justify-center rounded-xl bg-neutral-900 dark:bg-white"
          >
            <Text className="text-lg font-bold text-white dark:text-black">
              Subscribe · ₹299/month
            </Text>
          </Pressable>
          <Text className="mt-4 text-center text-xs font-medium text-neutral-400">
            Cancel anytime. Terms and conditions apply.
          </Text>
        </View>
      </SafeAreaView>
    </View>
  );
}
