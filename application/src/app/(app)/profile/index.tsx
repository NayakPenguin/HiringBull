import { Ionicons } from '@expo/vector-icons';
import { useAuth, useUser } from '@clerk/clerk-expo';
import React, { useState } from 'react';
import { Alert, Pressable, Image, Linking } from 'react-native';

import {
  FocusAwareStatusBar,
  SafeAreaView,
  ScrollView,
  Text,
  View,
} from '@/components/ui';
import { resetOnboarding } from '@/lib';
import { useRouter } from 'expo-router';

type SettingsItem = {
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  color?: string;
  iconColor?: string;
  isDestructive?: boolean;
  onPress?: () => void;
};

function SettingsItemRow({ item }: { item: SettingsItem }) {
  return (
    <Pressable
      onPress={item.onPress}
      className="mb-4 flex-row items-center justify-between rounded-xl border border-neutral-200 bg-white p-5 shadow-sm active:opacity-70 dark:border-neutral-800 dark:bg-neutral-900"
    >
      <View className="flex-row items-center gap-4">
        <View
          className={`size-10 items-center justify-center rounded-full ${
            item.isDestructive
              ? 'bg-red-50 dark:bg-red-900/20'
              : 'bg-neutral-100 dark:bg-neutral-800'
          }`}
        >
          <Ionicons
            name={item.icon}
            size={20}
            color={item.isDestructive ? '#ef4444' : item.iconColor || '#525252'}
          />
        </View>
        <Text
          className={`text-base font-bold ${
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
  const { signOut, getToken } = useAuth();
  const { user } = useUser();
  const {navigate} = useRouter();
  const [apiResponse, setApiResponse] = useState<any>(null);
  const [isLoadingApi, setIsLoadingApi] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  const fetchAuthTest = async () => {
    setIsLoadingApi(true);
    setApiError(null);
    setApiResponse(null);

    try {
      // Get the JWT token from Clerk
      const token = await getToken();

      if (!token) {
        throw new Error('No authentication token available');
      }

      console.log('Making API call with token...');

      // Make the API call
      const response = await fetch(
        'http://localhost:4000/api/public/auth-test',
        {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || `API error: ${response.status}`);
      }

      console.log('API Response:', data);
      setApiResponse(data);
    } catch (error: any) {
      console.error('API call error:', error);
      setApiError(error.message || 'Failed to fetch data');
    } finally {
      setIsLoadingApi(false);
    }
  };

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Logout',
        style: 'destructive',
        onPress: async () => {
          try {
            // Reset onboarding state on logout
            resetOnboarding();
            // Sign out from Clerk
            await signOut();
          } catch (error) {
            console.error('Logout error:', error);
          }
        },
      },
    ]);
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
      onPress:()=> navigate('/profile/editExperience'),
    },
    {
      label: 'Update Companies',
      icon: 'business-outline',
      iconColor: '#8b5cf6', // violet-500
      onPress:()=> navigate('/profile/editFollowedCompanies'),
    },
    {
      label: 'Logout',
      icon: 'log-out-outline',
      isDestructive: true,
      onPress: handleLogout,
    },
  ];

  // Get user display info
  const displayName =
    user?.fullName ||
    user?.firstName ||
    user?.emailAddresses?.[0]?.emailAddress?.split('@')[0] ||
    'User';
  const email = user?.primaryEmailAddress?.emailAddress || '';

  return (
    <SafeAreaView
      className="flex-1 bg-white dark:bg-neutral-950"
      edges={['top']}
    >
      <FocusAwareStatusBar />
      <View className="flex-1 pt-6">
        <View className="px-5 pb-4 border-b border-neutral-200 shadow-sm bg-white dark:bg-neutral-950 dark:border-neutral-800">
          <Text className="text-3xl font-black text-neutral-900 dark:text-white">
            Profile
          </Text>
          <Text className="mb-4 text-base font-medium text-neutral-500">
            Manage your account and preferences. We’re here to help you get the most out of your job search. ❤️
          </Text>
          <Pressable
            onPress={() => {
              Linking.openURL('https://github.com/NayakPenguin/HiringBull');
            }}
            className="mb-4 self-start flex-row items-center rounded-full border border-neutral-300"
            style={{
              paddingVertical: 5,
              paddingHorizontal: 10,
              backgroundColor: '#fff',
            }}
          >
            <View className="flex-row items-center gap-2">
              <Image
                source={{
                  uri: 'https://icones.pro/wp-content/uploads/2021/06/icone-github-noir.png',
                }}
                style={{ width: 22, height: 22 }}
                resizeMode="contain"
              />

              <Text
                style={{
                  fontSize: 11, // ~0.8rem
                  color: 'rgb(19, 128, 59)',
                  fontWeight: '100',
                }}
              >
                Contribute to our open-source code on GitHub
              </Text>

              <Text
                style={{
                  fontSize: 16,
                  color: 'rgb(19, 128, 59)',
                  fontWeight: '100',
                  marginLeft: -6,
                }}
              >
                ↗
              </Text>
            </View>
          </Pressable>
        </View>

        <ScrollView
          className="flex-1"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            paddingHorizontal: 20,
            paddingBottom: 20,
            paddingTop: 20,
          }}
        >
          {/* User Info Card */}
          <View className="mb-6 rounded-xl border border-neutral-200 bg-white p-5 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
            <Text className="text-sm font-medium text-neutral-500 dark:text-neutral-400">
              Signed in as
            </Text>
            <Text className="mt-1 text-2xl font-black text-neutral-900 dark:text-white">
              {displayName}
            </Text>
            {email ? (
              <View className="mt-4 flex-row items-center gap-2 rounded-lg bg-neutral-100 px-3 py-2 self-start dark:bg-neutral-800">
                <Ionicons name="mail-outline" size={16} color="#737373" />
                <Text className="text-sm font-medium text-neutral-600 dark:text-neutral-300">
                  {email}
                </Text>
              </View>
            ) : null}
          </View>

          {/* API Test Card */}
          {/* <View className="mb-6 rounded-xl border border-neutral-200 bg-white p-5 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
            <View className="flex-row items-center justify-between mb-4">
              <Text className="text-lg font-bold text-neutral-900 dark:text-white">
                API Test
              </Text>
              <Pressable
                onPress={fetchAuthTest}
                disabled={isLoadingApi}
                className={`rounded-lg px-4 py-2 ${
                  isLoadingApi
                    ? 'bg-neutral-200 dark:bg-neutral-800'
                    : 'bg-neutral-900 dark:bg-white'
                }`}
              >
                {isLoadingApi ? (
                  <ActivityIndicator size="small" color="#737373" />
                ) : (
                  <Text className="text-sm font-semibold text-white dark:text-black">
                    Test Auth
                  </Text>
                )}
              </Pressable>
            </View>

            {apiError ? (
              <View className="rounded-lg bg-red-50 p-3 dark:bg-red-900/20">
                <View className="flex-row items-center gap-2 mb-1">
                  <Ionicons name="alert-circle" size={16} color="#ef4444" />
                  <Text className="text-sm font-semibold text-red-600 dark:text-red-400">
                    Error
                  </Text>
                </View>
                <Text className="text-sm text-red-600 dark:text-red-400">
                  {apiError}
                </Text>
              </View>
            ) : apiResponse ? (
              <View className="rounded-lg bg-green-50 p-3 dark:bg-green-900/20">
                <View className="flex-row items-center gap-2 mb-2">
                  <Ionicons name="checkmark-circle" size={16} color="#22c55e" />
                  <Text className="text-sm font-semibold text-green-600 dark:text-green-400">
                    Success
                  </Text>
                </View>
                <View className="rounded-md bg-neutral-100 p-3 dark:bg-neutral-800">
                  <Text className="text-xs font-mono text-neutral-700 dark:text-neutral-300">
                    {JSON.stringify(apiResponse, null, 2)}
                  </Text>
                </View>
              </View>
            ) : (
              <View className="rounded-lg bg-neutral-50 p-3 dark:bg-neutral-800">
                <Text className="text-sm text-neutral-500 dark:text-neutral-400">
                  Click "Test Auth" to make an authenticated API call to the backend
                </Text>
              </View>
            )}
          </View> */}

          {/* Referral/Info Card */}
          <View className="mb-8 flex-row items-center gap-4 overflow-hidden rounded-xl bg-neutral-900 p-5 shadow-md dark:bg-neutral-800">
            <View className="size-12 shrink-0 items-center justify-center rounded-full bg-white/20">
              <Ionicons name="gift-outline" size={24} color="white" />
            </View>
            <View className="flex-1">
              <Text className="text-base font-bold leading-6 text-white">
                Enjoying the product? Share it with friends and earn a flat ₹100
                referral bonus when they sign up using your email.
              </Text>
            </View>
          </View>

          {/* Settings List */}
          <Text className="mb-4 text-xs font-bold uppercase tracking-widest text-neutral-400">
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
