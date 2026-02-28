import { useAuth, getUserEmail } from '@/lib/auth';
import { FontAwesome6, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useState, useCallback } from 'react';
import { Alert, Pressable, ScrollView, ActivityIndicator, Platform } from 'react-native';
import {
  initConnection,
  endConnection,
  fetchProducts,
  requestPurchase,
  finishTransaction,
  purchaseUpdatedListener,
  purchaseErrorListener,
  ErrorCode,
  type Purchase,
  type PurchaseError,
  type Product,
} from 'react-native-iap';

import { SafeAreaView, Text, View } from '@/components/ui';
import { client } from '@/api/common/client';
import { saveMembership } from '@/lib/membership';

const TAG = '[Payment]';

// ─── Plan definitions (matches webclient GetMembership.js) ──
const PLANS = [
  {
    id: 'hb_starter_1mo',
    name: 'Starter Plan',
    duration: '1 Month',
    durationMonths: 1,
    subtitle: 'Best for trying HiringBull',
    totalPrice: '₹249',
    pricePerMonth: '₹249',
    totalPriceNum: 249,
    features: [
      'Early alerts from verified career pages you select',
      'Curated hiring signals from social posts',
      'Up to 3 outreach requests per month',
    ],
    color: '#f59e0b', // amber
    icon: 'rocket-launch' as const,
  },
  {
    id: 'hb_growth_3mo',
    name: 'Growth Plan',
    duration: '3 Months',
    durationMonths: 3,
    subtitle: 'Best for active job seekers',
    totalPrice: '₹599',
    pricePerMonth: '₹199',
    totalPriceNum: 599,
    features: [
      'All Starter features included',
      '100% money-back guarantee if placed',
      'Priority support',
    ],
    color: '#3b82f6', // blue
    icon: 'trending-up' as const,
    popular: true,
  },
  {
    id: 'hb_pro_6mo',
    name: 'Pro Plan',
    duration: '6 Months',
    durationMonths: 6,
    subtitle: 'Maximum Advantage 🔥',
    totalPrice: '₹999',
    pricePerMonth: '₹167',
    totalPriceNum: 999,
    features: [
      'All Growth features included',
      'Free mock interviews with FAANG employees',
      'Outreach feature priority',
    ],
    color: '#8b5cf6', // purple
    icon: 'crown' as const,
  },
];

const productIds = PLANS.map((p) => p.id);

export default function PaymentScreen() {
  console.log('[PaymentScreen] Screen rendered');
  const router = useRouter();
  const { signOut } = useAuth();

  const [selectedPlan, setSelectedPlan] = useState(PLANS[1].id); // default Growth
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState(false);
  const [connectionReady, setConnectionReady] = useState(false);

  // ─── Initialize IAP connection ────────────────────────────
  useEffect(() => {
    let purchaseUpdateSub: ReturnType<typeof purchaseUpdatedListener> | null = null;
    let purchaseErrorSub: ReturnType<typeof purchaseErrorListener> | null = null;

    const init = async () => {
      try {
        console.log(`${TAG} Initializing IAP connection...`);
        const result = await initConnection();
        console.log(`${TAG} IAP connected:`, result);
        setConnectionReady(true);

        // Fetch products from Google Play (in-app type only)
        const items = await fetchProducts({ skus: productIds, type: 'in-app' });
        console.log(`${TAG} Products fetched:`, items?.length ?? 0);
        setProducts((items as Product[]) ?? []);
      } catch (err: any) {
        console.error(`${TAG} IAP init error:`, err.message);
        // In dev/emulator, IAP may not be available
        Alert.alert(
          'Store Unavailable',
          'Could not connect to Google Play. Make sure you are using a real device with Google Play services.',
        );
      } finally {
        setLoading(false);
      }
    };

    init();

    // Listen for purchase updates (success)
    purchaseUpdateSub = purchaseUpdatedListener(async (purchase: Purchase) => {
      console.log(`${TAG} Purchase updated:`, purchase.productId);

      try {
        // Verify on our server
        const email = getUserEmail();
        const response = await client.post('/api/payment/google-play/verify', {
          purchaseToken: purchase.purchaseToken,
          productId: purchase.productId,
          packageName: ('packageNameAndroid' in purchase ? purchase.packageNameAndroid : null) || 'com.hiringbull.development',
        });

        if (response.data.success) {
          console.log(`${TAG} Server verified purchase`);

          // Save membership locally
          const plan = PLANS.find((p) => p.id === purchase.productId);
          const daysMap: Record<string, number> = {
            hb_starter_1mo: 30,
            hb_growth_3mo: 90,
            hb_pro_6mo: 180,
          };
          const days = daysMap[purchase.productId] || 30;
          const membershipEnd = new Date(Date.now() + days * 24 * 60 * 60 * 1000);

          saveMembership({
            email: email || '',
            membershipEnd: membershipEnd.toISOString(),
          });

          // Finish/acknowledge the transaction on client side
          await finishTransaction({ purchase, isConsumable: true });
          console.log(`${TAG} Transaction finished`);

          Alert.alert(
            'Membership Activated! 🎉',
            `Your ${plan?.name || ''} plan is now active.`,
            [{ text: 'Continue', onPress: () => router.replace('/(app)') }],
          );
        } else {
          throw new Error('Server verification failed');
        }
      } catch (err: any) {
        console.error(`${TAG} Verify error:`, err.message);
        Alert.alert('Verification Failed', 'Payment was received but verification failed. Please contact support.');
      } finally {
        setPurchasing(false);
      }
    });

    // Listen for purchase errors
    purchaseErrorSub = purchaseErrorListener((error: PurchaseError) => {
      console.error(`${TAG} Purchase error:`, error.code, error.message);
      setPurchasing(false);

      if (error.code === ErrorCode.UserCancelled) {
        // User cancelled — do nothing
        return;
      }

      Alert.alert('Purchase Failed', error.message || 'Something went wrong. Please try again.');
    });

    return () => {
      purchaseUpdateSub?.remove();
      purchaseErrorSub?.remove();
      endConnection();
    };
  }, []);

  // ─── Handle purchase ──────────────────────────────────────
  const handlePurchase = useCallback(async () => {
    if (purchasing) return;

    const plan = PLANS.find((p) => p.id === selectedPlan);
    if (!plan) return;

    console.log(`${TAG} Starting purchase for: ${plan.id}`);
    setPurchasing(true);

    try {
      await requestPurchase({
        type: 'in-app',
        request: {
          google: { skus: [plan.id] },
          apple: { sku: plan.id },
        },
      });
      // The purchaseUpdatedListener will handle the result
    } catch (err: any) {
      console.error(`${TAG} requestPurchase error:`, err.message);
      setPurchasing(false);

      if (err.code !== ErrorCode.UserCancelled) {
        Alert.alert('Purchase Error', 'Could not initiate purchase. Please try again.');
      }
    }
  }, [selectedPlan, purchasing]);

  // ─── Render ───────────────────────────────────────────────
  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* Header */}
      <View className="flex-row items-center gap-3 px-5 pt-4 pb-2">
        <Pressable
          onPress={() => router.canGoBack() ? router.back() : router.replace('/no-membership')}
          className="size-10 items-center justify-center rounded-full bg-neutral-100"
        >
          <Ionicons name="arrow-back" size={20} color="#262626" />
        </Pressable>
        <Text className="text-2xl font-bold">Choose Your Plan</Text>
      </View>

      {loading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#f59e0b" />
          <Text className="mt-4 text-base text-neutral-500">Loading plans...</Text>
        </View>
      ) : (
        <>
          <ScrollView
            contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 12, paddingBottom: 24 }}
            showsVerticalScrollIndicator={false}
          >
            {/* Subtitle */}
            <Text className="mb-5 text-base text-neutral-500">
              Get access to exclusive job listings, company filters, and more.
            </Text>

            {/* Plan Cards */}
            {PLANS.map((plan) => {
              const isSelected = selectedPlan === plan.id;
              // Use Google Play price if available, otherwise fallback
              const googleProduct = products.find((p) => p.id === plan.id);
              const displayPrice = googleProduct?.displayPrice || plan.totalPrice;

              return (
                <Pressable
                  key={plan.id}
                  onPress={() => setSelectedPlan(plan.id)}
                  className={`mb-4 rounded-2xl border-2 p-5 ${
                    isSelected ? 'border-black bg-neutral-50' : 'border-neutral-200 bg-white'
                  }`}
                >
                  {/* Popular badge */}
                  {plan.popular && (
                    <View className="absolute -top-3 right-4 rounded-full bg-blue-500 px-3 py-1">
                      <Text className="text-xs font-bold text-white">MOST POPULAR</Text>
                    </View>
                  )}

                  {/* Plan header */}
                  <View className="flex-row items-center justify-between pr-8">
                    <View className="flex-row items-center gap-3 flex-1">
                      <View
                        className="size-12 items-center justify-center rounded-full"
                        style={{ backgroundColor: plan.color + '20' }}
                      >
                        {plan.icon === 'crown' ? (
                          <FontAwesome6 name="crown" size={20} color={plan.color} />
                        ) : plan.icon === 'trending-up' ? (
                          <MaterialCommunityIcons name="trending-up" size={22} color={plan.color} />
                        ) : (
                          <MaterialCommunityIcons name="rocket-launch" size={20} color={plan.color} />
                        )}
                      </View>
                      <View className="flex-1">
                        <Text className="text-lg font-bold">
                          {plan.name}{plan.durationMonths > 1 ? ` - ${plan.duration}` : ''}
                        </Text>
                        <Text className="text-xs text-neutral-400">{plan.subtitle}</Text>
                      </View>
                    </View>
                  </View>

                  {/* Price row */}
                  <View className="mt-3">
                    <View className="flex-row items-baseline gap-1">
                      <Text className="text-2xl font-bold" style={{ color: plan.color }}>
                        {plan.pricePerMonth}
                      </Text>
                      <Text className="text-sm text-neutral-400">/ month</Text>
                    </View>
                    <Text className="mt-1 text-xs text-neutral-400">
                      {plan.durationMonths > 1
                        ? `( ${plan.duration} Access — ${displayPrice} Total )`
                        : `( ${plan.duration} Access )`}
                    </Text>
                  </View>

                  {/* Features */}
                  {isSelected && (
                    <View className="mt-4 border-t border-neutral-100 pt-4">
                      {plan.features.map((feature, idx) => (
                        <View key={idx} className="mb-2 flex-row items-center gap-2">
                          <Ionicons name="checkmark-circle" size={18} color={plan.color} />
                          <Text className="text-sm text-neutral-700">{feature}</Text>
                        </View>
                      ))}
                    </View>
                  )}

                  {/* Selection indicator */}
                  <View className="absolute right-5 top-6">
                    <View
                      className={`size-6 items-center justify-center rounded-full border-2 ${
                        isSelected ? 'border-black bg-black' : 'border-neutral-300'
                      }`}
                    >
                      {isSelected && <Ionicons name="checkmark" size={14} color="white" />}
                    </View>
                  </View>
                </Pressable>
              );
            })}

            {/* Trust badges */}
            <View className="mt-2 rounded-xl bg-neutral-50 p-4">
              <View className="mb-2 flex-row items-center gap-2">
                <Ionicons name="shield-checkmark" size={18} color="#22c55e" />
                <Text className="text-sm font-semibold text-neutral-700">
                  Secured by Google Play
                </Text>
              </View>
              <View className="mb-2 flex-row items-center gap-2">
                <Ionicons name="refresh-circle" size={18} color="#3b82f6" />
                <Text className="text-sm font-semibold text-neutral-700">
                  48-hour review period with full refund guarantee
                </Text>
              </View>
              <View className="flex-row items-center gap-2">
                <Ionicons name="time" size={18} color="#f59e0b" />
                <Text className="text-sm font-semibold text-neutral-700">
                  Instant activation after purchase
                </Text>
              </View>
            </View>
          </ScrollView>

          {/* Purchase button */}
          <View className="border-t border-neutral-200 px-5 pb-6 pt-4">
            <Pressable
              onPress={handlePurchase}
              disabled={purchasing}
              className={`rounded-xl py-4 ${purchasing ? 'bg-neutral-400' : 'bg-black'}`}
            >
              {purchasing ? (
                <View className="flex-row items-center justify-center gap-2">
                  <ActivityIndicator size="small" color="white" />
                  <Text className="text-base font-bold text-white">Processing...</Text>
                </View>
              ) : (
                <Text className="text-center text-base font-bold text-white">
                  Subscribe — {PLANS.find((p) => p.id === selectedPlan)?.totalPrice}
                </Text>
              )}
            </Pressable>

            <Pressable
              onPress={() => router.canGoBack() ? router.back() : router.replace('/no-membership')}
              className="mt-3"
            >
              <Text className="text-center text-sm text-neutral-500">
                Maybe later
              </Text>
            </Pressable>
          </View>
        </>
      )}
    </SafeAreaView>
  );
}
