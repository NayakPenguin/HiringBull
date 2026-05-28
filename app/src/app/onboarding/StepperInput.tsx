import React from 'react';
import { Ionicons } from '@expo/vector-icons';
import { Pressable, View } from 'react-native';

export function StepperControls({ onInc, onDec }: any) {
  return (
    <View className="absolute inset-y-0 right-3 justify-center p-2">
      <View className="items-center">
        <Pressable onPress={onInc} hitSlop={10}>
          <Ionicons name="chevron-up" size={15} color="#9CA3AF" />
        </Pressable>

        <View className="h-1" />

        <Pressable onPress={onDec} hitSlop={10}>
          <Ionicons name="chevron-down" size={15} color="#9CA3AF" />
        </Pressable>
      </View>
    </View>
  );
}
