import { useAuth } from '@clerk/clerk-expo';
import { Ionicons } from '@expo/vector-icons';
import { type BottomSheetModal } from '@gorhom/bottom-sheet';
import { useQueryClient } from '@tanstack/react-query';
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
import { resetUser } from '@/features/users';

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
      className="mb-3 flex-row items-center justify-between rounded-xl border border-neutral-200 bg-white p-4 active:opacity-70"
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
  const { navigate } = useRouter();

  // Get user info from backend API (saved in Zustand store)
  const queryClient = useQueryClient();

  const userInfo = queryClient.getQueryData(['users', 'me']);
  // const userInfo = useOnboarding.use.userInfo();
  console.log(userInfo.devices);

  const handleLogout = () => {
    setConfirmAction('logout');
    modalRef.current?.present();
  };

  const [confirmAction, setConfirmAction] = useState<ConfirmAction | null>(
    null
  );
  const modalRef = React.useRef<BottomSheetModal>(null);
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
      onPress: () => {
        Linking.openURL('mailto:team@hiringbull.org');
      },
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

  // Get user display info - prefer backend name over Clerk name
  const displayName = userInfo?.name;
  const email = userInfo?.email || '';
  const handleConfirm = async () => {
    if (confirmAction === 'logout') {
      try {
        await resetUser();
        await signOut();
        resetOnboarding();
      } catch (error) {
        console.error('Logout error:', error);
      }
    }
  };
  const isMembershipValid = (expiryDate: string) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const expiry = new Date(expiryDate);
    expiry.setHours(0, 0, 0, 0);

    return expiry > today;
  };
  const MEMBERSHIP_EXPIRY = userInfo?.planExpiry || userInfo?.expiry; // YYYY-MM-DD
  const isValid = isMembershipValid(MEMBERSHIP_EXPIRY);

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
            <View className="android:shadow-sm ios:shadow-sm mb-6 rounded-xl border border-neutral-300 bg-neutral-50 p-5">
              <View className="flex-row items-center gap-4">
                <View className="size-16 items-center justify-center overflow-hidden rounded-full bg-primary-100">
                  <Image
                    // source={require('../../../../assets/images/experience/profile.png')}
                    source={
                      'https://rosepng.com/wp-content/uploads/elementor/thumbs/screenshot-2024-09-09-144753-qtuln5wagd2o4t0vr294tmhlkofp8hcblr1ndokbl6.png'
                    }
                    // source={'https://i.gifer.com/origin/a8/a87541948ce7297723eb5568b7ac83e5_w200.gif'}
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
            <View
              className={`mb-6 flex-row items-center justify-between rounded-xl border p-4 ${
                isValid
                  ? 'border-neutral-200 bg-neutral-50'
                  : 'border-danger-200 bg-danger-50'
              }`}
            >
              <View className="flex-row items-center gap-3">
                <View
                  className={`size-10 items-center justify-center rounded-full ${
                    isValid ? 'bg-primary-100' : 'bg-danger-100'
                  }`}
                >
                  <Ionicons
                    name={isValid ? 'calendar-outline' : 'alert-circle-outline'}
                    size={20}
                    color={isValid ? '#13803b' : '#dc2626'}
                  />
                </View>

                <View>
                  <Text
                    className={`text-sm font-semibold ${
                      isValid ? 'text-neutral-900' : 'text-danger-700'
                    }`}
                  >
                    {isValid ? 'Membership valid till' : 'Membership expired'}
                  </Text>

                  <Text
                    className={`text-sm font-medium ${
                      isValid ? 'text-neutral-600' : 'text-danger-600'
                    }`}
                  >
                    {new Date(MEMBERSHIP_EXPIRY).toLocaleDateString('en-IN', {
                      day: '2-digit',
                      month: 'long',
                      year: 'numeric',
                    })}
                  </Text>
                </View>
              </View>

              {isValid ? (
                <Ionicons name="checkmark-circle" size={20} color="#16a34a" />
              ) : (
                <Ionicons name="close-circle" size={20} color="#dc2626" />
              )}
            </View>

            <View className="mb-6">
              <Text className="mb-3 text-xs font-bold uppercase tracking-wider text-neutral-400">
                Settings
              </Text>
              {SETTINGS.map((item, index) => (
                <SettingsItemRow key={index} item={item} />
              ))}
            </View>

            <View className="rounded-xl bg-yellow-300 p-4">
              <View className="flex-row items-start gap-3">
                <View className="mt-1 size-10 shrink-0 items-center justify-center rounded-full bg-primary-100">
                  <Ionicons name="gift-outline" size={20} color="#13803b" />
                </View>
                <View className="flex-1">
                  <Text className="text-md mb-1 font-bold text-black">
                    Refer & Earn
                  </Text>
                  <Text className="text-sm font-medium leading-5 text-black">
                    Share with friends and earn FLAT ₹50 when they sign up using
                    your email as referral code.
                  </Text>
                  <Text
                    onPress={() =>
                      Linking.openURL(
                        'https://hiringbull.org/referral/' + email
                      )
                    }
                    className="mt-2 text-sm font-semibold text-neutral-900 underline"
                  >
                    Show my earnings
                    <Ionicons
                      className="no-underline"
                      name="open-outline"
                      size={14}
                      color="#111"
                    />
                  </Text>

                  {/* Referral code row */}
                  {email && (
                    <Pressable
                      onPress={() => {
                        Clipboard.setString(email);
                      }}
                      className="mt-3 flex-row items-center justify-between rounded-lg bg-yellow-400 px-3 py-2"
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
      </SafeAreaView>
    </>
  );
}
