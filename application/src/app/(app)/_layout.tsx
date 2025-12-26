import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import { useColorScheme } from 'nativewind';
import React from 'react';

export default function TabLayout() {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
        tabBarActiveTintColor: '#0a0a0a', // neutral-950 (black)
        tabBarInactiveTintColor: '#a3a3a3', // neutral-400 (gray)
        tabBarStyle: {
          backgroundColor: isDark ? '#000000' : '#ffffff',
          borderTopColor: isDark ? '#333333' : '#f5f5f5',
          borderTopWidth: 1,
          paddingTop: 10,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? 'briefcase' : 'briefcase-outline'}
              size={24}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="search"
        options={{
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? 'paper-plane' : 'paper-plane-outline'}
              size={24}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="saved"
        options={{
          tabBarIcon: ({ color }) => (
            <MaterialCommunityIcons
              name="format-quote-close"
              size={40}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? 'person' : 'person-outline'}
              size={24}
              color={color}
            />
          ),
        }}
      />

      {/* Hidden screens */}
      <Tabs.Screen name="style" options={{ href: null }} />
      <Tabs.Screen name="settings" options={{ href: null }} />
    </Tabs>
  );
}
