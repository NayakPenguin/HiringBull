import { useAuth } from '@clerk/clerk-expo';
import { FontAwesome6, Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Linking, Pressable, ScrollView } from 'react-native';

import { SafeAreaView, Text, View } from '@/components/ui';
import { hideGlobalLoading, resetOnboarding, showGlobalLoading } from '@/lib';
import { useEffect } from 'react';
import { clearMembership } from '@/lib/membership';

export default function NoActiveMembership() {
  const { navigate } = useRouter();
  const { signOut } = useAuth();
  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* Header */}
      <View className="flex-row items-center gap-3 px-5 pt-4">
        <Pressable
          onPress={async () => {
            await signOut();
            resetOnboarding();
            clearMembership();
            navigate('/login');
          }}
          className="size-10 items-center justify-center rounded-full bg-neutral-100"
        >
          <Ionicons name="arrow-back" size={20} color="#262626" />
        </Pressable>

        <Text className="text-3xl font-bold dark:text-white">
          No Active Membership
        </Text>
      </View>

      <ScrollView
        contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 20 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Subtitle */}
        <Text className="mb-5 text-base font-medium text-neutral-500">
          You’re currently not holding an active HiringBull membership.
        </Text>

        {/* Info Card */}
        <View className="rounded-2xl bg-yellow-400 p-5">
          <View className="mb-3 size-10 items-center justify-center rounded-full bg-black">
            <FontAwesome6 name="crown" size={20} color="#facc15" />
          </View>

          <Text className="mb-4 text-base font-bold text-black">
            Hiring Bull is a members-only platform and requires an active
            membership plan to access its features.
          </Text>

          <Text className="mb-4 text-base font-semibold text-black">
            Your membership is usually activated within 2 minutes of completing
            the membership process, giving you immediate access to the platform.
          </Text>

          <Text className="mb-4 text-base font-semibold text-black">
            However, all memberships go through a manual review during the first
            48 hours. If your application is not approved during this period,
            your access may be revoked and a full refund will be processed
            automatically.
          </Text>

          <Text className="mb-4 text-base font-semibold text-black">
            We do this to ensure our services reach the first 1,000 members at a
            given experience level especially those who truly need the early
            advantage. That’s why every application is carefully and manually
            reviewed by our team.
          </Text>
        </View>
      </ScrollView>

      {/* Footer Actions */}
      <View className="border-t border-neutral-200 px-5 pb-6 pt-4">
        <Pressable
          onPress={() => Linking.openURL('mailto:team@hiringbull.org')}
        >
          <Text className="mb-4 text-center text-sm font-semibold text-neutral-600 underline">
            Contact Support
          </Text>
        </Pressable>

        <Pressable
          onPress={() =>
            Linking.openURL('https://hiringbull.org/join-membership')
          }
          className="rounded-xl bg-black py-4"
        >
          <Text className="text-center text-base font-bold text-white">
            Apply Now
          </Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}
