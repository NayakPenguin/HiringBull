import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { Image, ScrollView } from 'react-native';

// import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import {
  FocusAwareStatusBar,
  Pressable,
  SafeAreaView,
  Text,
  View,
} from '@/components/ui';
import { useIsFirstTime } from '@/lib';

const FEATURES = [
  {
    icon: 'rocket',
    title: 'Early Access',
    description: 'Discover opportunities before they trend',
    gradient: ['#f59e0b', '#ef4444'],
  },
  {
    icon: 'trophy',
    title: 'Beat the Crowd',
    description: '50 competitors, not 50,000',
    gradient: ['#3b82f6', '#8b5cf6'],
  },
  {
    icon: 'people',
    title: 'Direct Referrals',
    description: 'Employee connections that matter',
    gradient: ['#10b981', '#06b6d4'],
  },
] as const;

function FeatureCard({
  icon,
  title,
  description,
  gradient,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  description: string;
  gradient: readonly string[];
}) {
  return (
    <View
      // entering={FadeInUp.duration(500)}
      className="mb-4 overflow-hidden rounded-3xl bg-white p-6 shadow-sm dark:bg-neutral-900/50"
    >
      <View className="mb-3 mr-8 size-14 items-center justify-center rounded-2xl bg-neutral-900 dark:bg-white">
        <Ionicons name={icon} size={26} color={gradient[0]} />
      </View>
      <Text className="mb-2 text-xl font-bold text-neutral-900 dark:text-white">
        {title}
      </Text>
      <Text className="text-base leading-6 text-neutral-600 dark:text-neutral-400">
        {description}
      </Text>
    </View>
  );
}

export default function Landing() {
  const router = useRouter();
  const [_, setIsFirstTime] = useIsFirstTime();

  const handleContinue = () => {
    setIsFirstTime(false);
    router.replace('/login');
  };

  return (
    <View className="flex-1 bg-slate-50 dark:bg-black">
      <FocusAwareStatusBar />
      <SafeAreaView className="flex-1">
        <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
          <View className="flex-1 px-6">
            {/* Hero Section */}
            <View
              // entering={FadeInDown.duration(600)}
              className="mb-10 mt-16"
            >
              {/* Logo with glow effect */}
              <View className="flex h-[90px] w-full flex-row items-center justify-start px-6">
                <Image
                  source={require('assets/logo-big.png')}
                  style={{
                    width: '80%',
                    height: '100%',
                    marginLeft: -20,
                    marginBottom: 20,
                  }}
                  resizeMode="contain"
                />
              </View>

              {/* Main Tagline */}
              <View>
                <Text className="text-[28px] font-bold leading-[38px] text-neutral-900 dark:text-white">
                  Apply early.{'\n'}Don't keep searching{'\n'}
                  <Text className="text-[28px] font-black text-amber-500">
                    Get Notified!
                  </Text>
                </Text>
              </View>

              {/* Stats Badge */}
              <View className="mt-6 flex-row items-center justify-center gap-2 rounded-2xl bg-neutral-900/5 px-4 py-3 dark:bg-white/5">
                <Ionicons name="people" size={16} color="#f59e0b" />
                <Text className="text-sm font-semibold text-neutral-700 dark:text-neutral-300">
                  Members only application - <Text className='text-sm font-bold text-neutral-700 dark:text-neutral-300'>HiringBull.org</Text>
                </Text>
              </View>

              {/* <Text className="text-lg leading-7 text-neutral-600 dark:text-neutral-400">
                Early job alerts. Direct referrals.{'\n'}Better odds at landing
                your dream role.
              </Text> */}
            </View>

            {/* Features Grid */}
            <View className="flex-1">
              {FEATURES.map((feature, index) => (
                <FeatureCard key={index} {...feature} />
              ))}
            </View>
          </View>
        </ScrollView>

        {/* CTA Section */}
        <View className="px-6 pb-8">
          <Pressable
            onPress={handleContinue}
            className="h-16 items-center justify-center rounded-[24px] bg-neutral-900 shadow-xl active:scale-[0.98] dark:bg-white"
          >
            <View className="flex-row items-center gap-2">
              <Text className="text-xl font-bold text-white dark:text-black">
                Start Winning
              </Text>
              <Ionicons
                name="arrow-forward"
                size={20}
                color="white"
                className="dark:text-black"
              />
            </View>
          </Pressable>
        </View>
      </SafeAreaView>
    </View>
  );
}
