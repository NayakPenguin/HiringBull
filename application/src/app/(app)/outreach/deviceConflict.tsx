import { useAuth } from '@clerk/clerk-expo';
import { useRouter } from 'expo-router';
import React from 'react';
import { Pressable, Text, View } from 'react-native';

import { resetOnboarding } from '@/lib';

export default function DeviceConflict() {
  const { navigate } = useRouter();
  const { signOut } = useAuth();
  return (
    <View className="flex-1 items-center justify-center bg-white px-6">
      <Text className="text-xl font-semibold text-neutral-900">
        Session Ended
      </Text>

      <Text className="mt-3 text-center text-neutral-600">
        Your account is currently active on another device. Please sign in again
        to continue.
      </Text>

      <Pressable
        onPress={async () => {
          await signOut();
          resetOnboarding();
          navigate('/login');
        }}
        className="mt-6 rounded-lg bg-neutral-900 px-6 py-3"
      >
        <Text className="font-semibold text-white">Sign in again</Text>
      </Pressable>
    </View>
  );
}
