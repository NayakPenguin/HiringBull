import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  Dimensions,
  TextInput,
  Alert,
  View as RNView,
  Keyboard,
} from 'react-native';
import Animated, {
  Extrapolation,
  interpolate,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
  runOnJS,
} from 'react-native-reanimated';

import {
  FocusAwareStatusBar,
  Pressable,
  SafeAreaView,
  Text,
  View,
  Modal,
  useModal,
} from '@/components/ui';
import { subscribe } from '@/lib';

const { width } = Dimensions.get('window');
const CARD_WIDTH = width * 0.8;
const ITEM_SPACING = (width - CARD_WIDTH) / 2;

const PlanCard = ({
  item,
  index,
  scrollX,
}: {
  item: {
    id: string;
    title: string;
    duration: string;
    price: string;
    totalPrice: number;
    perMonth: string;
    saveLabel: string | null;
    features: string[];
    color: string;
    popular?: boolean;
  };
  index: number;
  scrollX: Animated.SharedValue<number>;
}) => {
  const animatedStyle = useAnimatedStyle(() => {
    const inputRange = [
      (index - 1) * CARD_WIDTH,
      index * CARD_WIDTH,
      (index + 1) * CARD_WIDTH,
    ];

    const scale = interpolate(
      scrollX.value,
      inputRange,
      [0.9, 1, 0.9],
      Extrapolation.CLAMP
    );

    const opacity = interpolate(
      scrollX.value,
      inputRange,
      [0.6, 1, 0.6],
      Extrapolation.CLAMP
    );

    return {
      transform: [{ scale }],
      opacity,
    };
  });

  return (
    <Animated.View
      style={[{ width: CARD_WIDTH }, animatedStyle]}
      className="py-4"
    >
      <View className="flex-1 overflow-hidden rounded-3xl border border-neutral-200 bg-white shadow-xl dark:border-neutral-800 dark:bg-neutral-900">
        {/* Header Color Strip */}
        <View className="h-2 w-full" style={{ backgroundColor: item.color }} />

        {item.popular && (
          <View className="absolute right-0 top-6 rounded-l-lg bg-black px-3 py-1 dark:bg-white">
            <Text className="text-xs font-bold text-white dark:text-black">
              MOST POPULAR
            </Text>
          </View>
        )}

        <View className="flex-1 p-6">
          <View className="mb-6">
            <Text className="text-sm font-bold uppercase tracking-widest text-neutral-500">
              {item.title}
            </Text>
            <RNView className="mt-2 flex-row items-baseline gap-2">
              {item.originalPrice && (
                <Text className="text-xl font-semibold text-neutral-400 line-through">
                  {item.originalPrice}
                </Text>
              )}

              <Text className="text-5xl font-black text-neutral-900 dark:text-white">
                {item.price}
              </Text>

              <Text className="ml-1 text-lg font-medium text-neutral-400">
                /mo
              </Text>
            </RNView>

            <View className="mt-2 flex-row items-center gap-2">
              <View className="rounded-md bg-neutral-100 px-2 py-1 dark:bg-neutral-800">
                <Text className="text-xs font-medium text-neutral-600 dark:text-neutral-400">
                  {item.duration}
                </Text>
              </View>
              {item.saveLabel && (
                <View className="rounded-md bg-green-100 px-2 py-1 dark:bg-green-900/30">
                  <Text className="text-xs font-bold text-green-700 dark:text-green-400">
                    {item.saveLabel}
                  </Text>
                </View>
              )}
            </View>
          </View>

          <View className="flex-1 gap-4">
            {item.features.map((feature, i) => (
              <View key={i} className="flex-row items-start gap-3">
                <View className="mt-0.5 size-5 items-center justify-center rounded-full bg-neutral-100 dark:bg-neutral-800">
                  <Ionicons name="checkmark" size={12} color={item.color} />
                </View>
                <Text className="flex-1 text-base font-medium leading-6 text-neutral-600 dark:text-neutral-300">
                  {feature}
                </Text>
              </View>
            ))}
          </View>

          {item.originalTotalPrice && (
            <Text className="mt-4 text-center text-sm font-medium text-neutral-400 line-through">
              Total: ₹{item.originalTotalPrice}
            </Text>
          )}

          <Text className="mt-2 text-center text-sm font-medium text-neutral-400">
            Total: ₹{item.totalPrice} billed upfront
          </Text>
        </View>
      </View>
    </Animated.View>
  );
};

export default function Payment() {
  const router = useRouter();
  const [activeIndex, setActiveIndex] = useState(1);
  const [code, setCode] = useState('');
  const [isReferralApplied, setIsReferralApplied] = useState(false);
  const scrollX = useSharedValue(CARD_WIDTH * 1);
  const { ref, present, dismiss } = useModal();

  const activePlans = React.useMemo(() => {
    const plans = [
      {
        id: 'starter',
        title: 'Starter',
        duration: '1 Month',
        price: '₹249',
        totalPrice: 249,
        perMonth: '₹249/mo',
        saveLabel: null,
        features: [
          'Early notifications to verified job openings',
          'Ideal for trying the platform',
        ],
        color: '#000000',
      },
      {
        id: 'popular',
        title: 'Popular',
        duration: '3 Months',
        price: '₹199',
        totalPrice: 597,
        perMonth: '₹199/mo',
        saveLabel: 'Save 20%',
        popular: true,
        features: [
          'Early notifications to verified job openings',
          'Get full refund if you get job in the time period',
        ],
        color: '#8b5cf6',
      },
      {
        id: 'best_value',
        title: 'Best Value',
        duration: '6 Months',
        price: '₹169',
        totalPrice: 1014,
        perMonth: '₹169/mo',
        saveLabel: 'Save 32%',
        features: [
          'Early notifications to verified job openings',
          'Get full refund if you get job in the time period',
          'Free mock interview if user receives an interview call from a top MNC',
        ],
        color: '#10b981',
      },
    ];

    if (!isReferralApplied) {
      return plans;
    }

    return plans.map((plan) => {
      const months = Number(plan.duration.split(' ')[0]); // 1, 3, 6
      const discount = months * 50;

      const monthlyPrice = Number(plan.price.replace('₹', ''));

      return {
        ...plan,
        originalTotalPrice: plan.totalPrice, // for total strikethrough
        totalPrice: plan.totalPrice - discount,

        originalPrice: plan.price, // 👈 for /mo strikethrough
        price: `₹${monthlyPrice - 50}`, // 👈 new discounted monthly price
      };
    });
  }, [isReferralApplied]);

  const handleScroll = useAnimatedScrollHandler((event) => {
    scrollX.value = event.contentOffset.x;
    const index = Math.round(event.contentOffset.x / CARD_WIDTH);
    runOnJS(setActiveIndex)(index);
  });

  const handleApply = () => {
    Keyboard.dismiss();

    const cleanedCode = code.replace(/\s+/g, ''); // 🔥 remove all spaces

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(cleanedCode)) {
      Alert.alert(
        'Invalid Code',
        'Please enter a valid referral code (email address)'
      );
      return;
    }

    setIsReferralApplied(true);
    dismiss();
    Alert.alert('Applied', 'Referral code applied successfully! ₹50 off.');
  };

  const handleSubscribe = () => {
    subscribe();
    router.replace('/');
  };

  const activePlan = activePlans[activeIndex] || activePlans[0];

  return (
    <View className="flex-1 bg-white dark:bg-neutral-950">
      <FocusAwareStatusBar />
      <SafeAreaView className="flex-1">
        <View className="px-5 pb-4 pt-6 border-b border-neutral-200 shadow-sm bg-white dark:bg-neutral-950 dark:border-neutral-800">
          <Text className="text-3xl font-black text-neutral-900 dark:text-white">
            Choose Your Plan
          </Text>
          <Text className="mt-2 text-base font-medium leading-6 text-neutral-500 text-left">
            Unlock premium features and accelerate your career growth with our
            tailored plans.
          </Text>
        </View>

        <Animated.FlatList
          data={activePlans}
          horizontal
          initialScrollIndex={1}
          getItemLayout={(data, index) => ({
            length: CARD_WIDTH,
            offset: CARD_WIDTH * index,
            index,
          })}
          showsHorizontalScrollIndicator={false}
          snapToInterval={CARD_WIDTH}
          decelerationRate="fast"
          contentContainerStyle={{
            paddingHorizontal: ITEM_SPACING,
            paddingVertical: 20,
          }}
          onScroll={handleScroll}
          scrollEventThrottle={16}
          keyExtractor={(item) => item.id}
          renderItem={({ item, index }) => (
            <PlanCard item={item} index={index} scrollX={scrollX} />
          )}
        />

        <View className="border-t border-neutral-100 bg-white px-6 pb-6 pt-4 dark:border-neutral-900 dark:bg-neutral-950">
          {!isReferralApplied ? (
            <Pressable
              onPress={present}
              className="mb-6 items-center justify-center"
            >
              <Text className="text-sm font-medium text-neutral-500 dark:text-neutral-400">
                Have a referral code?
              </Text>

              <View className="flex-row items-center gap-1.5">
                <Text className="text-sm font-medium text-neutral-500 dark:text-neutral-400">
                  Get flat ₹50 off per month 🎉
                </Text>
                <Text className="text-sm font-bold text-neutral-900 underline dark:text-white">
                  Apply
                </Text>
              </View>
            </Pressable>
          ) : (
            <View className="mb-6 items-center justify-center">
              <Text className="text-sm font-medium text-green-600 dark:text-green-400">
                🎉 Referral code applied
              </Text>

              <Text className="mt-1 text-sm font-bold lowercase text-green-700 dark:text-green-300">
                {code.replace(/\s+/g, '')} saved you ₹
                {activePlan.originalTotalPrice - activePlan.totalPrice}
              </Text>
            </View>
          )}

          <Pressable
            onPress={handleSubscribe}
            className="flex-row items-center justify-center rounded-xl py-4 shadow-sm"
            style={{ backgroundColor: activePlan.color }}
          >
            <Text className="text-lg font-bold text-white">
              Subscribe for ₹{activePlan.totalPrice}
            </Text>
            <Ionicons
              name="arrow-forward"
              size={20}
              color="white"
              style={{ marginLeft: 8 }}
            />
          </Pressable>
          <Text className="mt-4 text-center text-xs text-neutral-400">
            Recurs annually. Cancel anytime.
          </Text>
        </View>

        <Modal
          ref={ref}
          snapPoints={['45%']}
          title="Redeem Code"
          onDismiss={dismiss}
        >
          <View className="flex-1 px-6 pt-4">
            <Text className="mb-4 text-center text-sm font-bold uppercase tracking-widest text-green-600 dark:text-green-400">
              Flat ₹50 off with referral code
            </Text>
            <RNView className="mb-4 justify-center rounded-xl bg-neutral-100 px-4 py-3 dark:bg-neutral-900">
              <TextInput
                className="text-base font-medium text-neutral-900 placeholder:text-neutral-500 dark:text-white"
                placeholder="Enter referral code"
                placeholderTextColor="#737373"
                value={code}
                onChangeText={setCode}
                autoFocus
              />
            </RNView>
            <Pressable
              onPress={handleApply}
              className="items-center justify-center rounded-xl bg-neutral-900 py-4 dark:bg-white"
            >
              <Text className="text-base font-bold text-white dark:text-black">
                Apply Code
              </Text>
            </Pressable>
          </View>
        </Modal>
      </SafeAreaView>
    </View>
  );
}
