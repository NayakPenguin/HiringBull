import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import { useColorScheme } from 'nativewind';
import React from 'react';

type IconName = React.ComponentProps<typeof Ionicons>['name'];

const TAB_SCREENS = [
  {
    name: 'index',
    title: 'Jobs',
    icon: 'briefcase-outline' as IconName,
    iconActive: 'briefcase' as IconName,
  },
  {
    name: 'search',
    title: 'Search',
    icon: 'search-outline' as IconName,
    iconActive: 'search' as IconName,
  },
  {
    name: 'saved',
    title: 'Saved',
    icon: 'bookmark-outline' as IconName,
    iconActive: 'bookmark' as IconName,
  },
  {
    name: 'profile',
    title: 'Profile',
    icon: 'person-outline' as IconName,
    iconActive: 'person' as IconName,
  },
] as const;

const HIDDEN_SCREENS = ['style', 'settings'] as const;

export default function TabLayout() {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#0a0a0a', // neutral-950 (black)
        tabBarInactiveTintColor: '#a3a3a3', // neutral-400 (gray)
        tabBarStyle: {
          backgroundColor: isDark ? '#000000' : '#ffffff',
          borderTopColor: isDark ? '#333333' : '#f5f5f5',
          borderTopWidth: 1,
          paddingTop: 8,
          height: 90,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
          marginTop: -4,
          marginBottom: 4,
        },
        tabBarIconStyle: {
          marginBottom: 2,
        },
      }}
    >
      {TAB_SCREENS.map(({ name, title, icon, iconActive }) => (
        <Tabs.Screen
          key={name}
          name={name}
          options={{
            title,
            tabBarIcon: ({ color, focused }) => (
              <Ionicons
                name={focused ? iconActive : icon}
                size={24}
                color={color}
              />
            ),
            tabBarButtonTestID: `tab-${name}`,
          }}
        />
      ))}
      {HIDDEN_SCREENS.map((name) => (
        <Tabs.Screen key={name} name={name} options={{ href: null }} />
      ))}
    </Tabs>
  );
}
