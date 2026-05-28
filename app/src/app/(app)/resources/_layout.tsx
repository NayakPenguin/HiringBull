import { Stack } from 'expo-router';
import React from 'react';

export default function CopilotLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: '#ffffff' },
      }}
    >
      <Stack.Screen name="index" />
    </Stack>
  );
}
