import { useAuth, useUser } from '@clerk/clerk-expo';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Clipboard, Linking, Pressable, ScrollView } from 'react-native';

import {
  FocusAwareStatusBar,
  Image,
  SafeAreaView,
  Text,
  View,
} from '@/components/ui';
import { AppConfirmModal } from '@/components/ui/AppConfirmModal';
import { resetOnboarding } from '@/lib';

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
      className="android:shadow-md ios:shadow-sm mb-3 flex-row items-center justify-between rounded-xl border border-neutral-200 bg-white p-4 active:opacity-70"
    >
      <View className="flex-row items-center gap-3">
        <View
          className={`size-10 items-center justify-center rounded-xl ${
            item.isDestructive ? 'bg-danger-50' : 'bg-neutral-100'
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
            item.isDestructive ? 'text-danger-600' : 'text-neutral-900'
          }`}
        >
          {item.label}
        </Text>
      </View>
      <Ionicons name="chevron-forward" size={18} color="#a3a3a3" />
    </Pressable>
  );
}
type ConfirmAction = 'logout' | 'copy';

export default function Profile() {
  const { signOut } = useAuth();
  const { user } = useUser();
  const { navigate } = useRouter();
  const handleLogout = () => {
    setConfirmAction('logout');
    modalRef.current?.present();
  };

  const [confirmAction, setConfirmAction] = useState<ConfirmAction | null>(
    null
  );
  const modalRef = React.useRef<{
    present: () => void;
    dismiss: () => void;
  }>(null);
  const SETTINGS: SettingsItem[] = [
    {
      label: 'Edit Experience',
      icon: 'layers-outline',
      iconColor: '#13803b', // primary-500
      onPress: () => navigate('/edit-experience'),
    },
    {
      label: 'Edit Companies',
      icon: 'business-outline',
      iconColor: '#13803b', // primary-500
      onPress: () => navigate('/edit-companies'),
    },
    {
      label: 'Report Issue',
      icon: 'warning-outline',
      iconColor: '#f59e0b',
    },
    {
      label: 'Contact Team',
      icon: 'chatbubbles-outline',
      iconColor: '#0ea5e9',
      onPress: () => {
        Linking.openURL('mailto:team@hiringbull.org');
      },
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
  const initials = displayName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
  const handleConfirm = async () => {
    if (confirmAction === 'logout') {
      try {
        await signOut();
        resetOnboarding();
      } catch (error) {
        console.error('Logout error:', error);
      }
    }

    if (confirmAction === 'copy' && email) {
      Clipboard.setString(email);
    }
  };

  return (
    <>
      <SafeAreaView className="flex-1 bg-white" edges={['top']}>
        <FocusAwareStatusBar />
        <View className="flex-1 pt-6">
          <View className="border-b border-neutral-200 bg-white px-5 pb-4 shadow-sm">
            <Text
              className="text-3xl  text-neutral-900 "
              style={{ fontFamily: 'Montez' }}
            >
              Profile
            </Text>
            <Text className="my-2 text-base font-medium text-neutral-500">
              Manage your account, experience, and preferences to get more
              relevant jobs and recommendations.
            </Text>
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{
              paddingHorizontal: 20,
              paddingBottom: 20,
              paddingTop: 20,
            }}
          >
            <View className="android:shadow-md ios:shadow-sm mb-6 rounded-xl border border-neutral-200 bg-white p-5">
              <View className="flex-row items-center gap-4">
                <View className="size-16 items-center justify-center overflow-hidden rounded-full bg-primary-100">
                  <Image
                    source={require('../../../../assets/images/experience/profile.png')}
                    style={{ width: '100%', height: '100%' }}
                    resizeMode="cover"
                  />
                </View>

                <View className="flex-1">
                  <Text className="text-xl font-bold text-neutral-900">
                    {displayName}
                  </Text>
                  {email ? (
                    <View className="mt-1 flex-row items-center gap-1">
                      <Ionicons name="mail-outline" size={14} color="#737373" />
                      <Text className="text-sm font-medium text-neutral-600">
                        {email}
                      </Text>
                    </View>
                  ) : null}
                </View>
              </View>
            </View>

            <View className="mb-6">
              <Text className="mb-3 text-xs font-bold uppercase tracking-wider text-neutral-400">
                Settings
              </Text>
              {SETTINGS.map((item, index) => (
                <SettingsItemRow key={index} item={item} />
              ))}
            </View>

            <View className="rounded-xl border-2 border-primary-200 bg-yellow-300 p-4">
              <View className="flex-row items-start gap-3">
                <View className="mt-1 size-10 shrink-0 items-center justify-center rounded-full bg-primary-100">
                  <Ionicons name="gift-outline" size={20} color="#13803b" />
                </View>
                <View className="flex-1">
                  <Text className="mb-1 text-sm font-bold text-black">
                    Refer & Earn
                  </Text>
                  <Text className="text-sm font-medium leading-5 text-black">
                    Share HiringBull with friends and earn ₹100 when they sign
                    up using your referral code.
                  </Text>

                  {/* Referral code row */}
                  {email && (
                    <Pressable
                      onPress={() => {
                        setConfirmAction('copy');
                        modalRef.current?.present();
                      }}
                      className="mt-3 flex-row items-center justify-between rounded-lg border border-primary-300 bg-primary-100 px-3 py-2"
                    >
                      <Text className="text-sm font-medium text-primary-900">
                        {email}
                      </Text>
                      <Ionicons name="copy-outline" size={16} color="#13803b" />
                    </Pressable>
                  )}
                </View>
              </View>
            </View>
          </ScrollView>
        </View>
      </SafeAreaView>
      <AppConfirmModal
        ref={modalRef}
        title={confirmAction === 'logout' ? 'Logout' : 'Copy Referral Code'}
        description={
          confirmAction === 'logout'
            ? 'Are you sure you want to logout from HiringBull?'
            : 'Do you want to copy your referral code to share with friends?'
        }
        confirmText={confirmAction === 'logout' ? 'Logout' : 'Copy'}
        cancelText="Cancel"
        isDestructive={confirmAction === 'logout'}
        onConfirm={handleConfirm}
      />
    </>
  );
}
