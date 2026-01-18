import { useSignIn, useSignUp, useSSO } from '@clerk/clerk-expo';
import { Ionicons } from '@expo/vector-icons';
import * as AuthSession from 'expo-auth-session';
import { useRouter } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Image, Platform, Pressable } from 'react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';

import {
  FocusAwareStatusBar,
  Input,
  SafeAreaView,
  Text,
  View,
} from '@/components/ui';

/* ----------------------------- Utils ----------------------------- */

const useWarmUpBrowser = () => {
  useEffect(() => {
    if (Platform.OS !== 'android') return;
    WebBrowser.warmUpAsync();
    return () => WebBrowser.coolDownAsync();
  }, []);
};

WebBrowser.maybeCompleteAuthSession();

/* ----------------------------- Screen ----------------------------- */

export default function Login() {
  useWarmUpBrowser();

  const router = useRouter();
  const {
    signIn,
    setActive: setActiveSignIn,
    isLoaded: isSignInLoaded,
  } = useSignIn();
  const {
    signUp,
    setActive: setActiveSignUp,
    isLoaded: isSignUpLoaded,
  } = useSignUp();
  const { startSSOFlow } = useSSO();

  const [step, setStep] = useState<'email' | 'otp'>('email');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [authMode, setAuthMode] = useState<'signIn' | 'signUp' | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  /* ----------------------------- Google ----------------------------- */

  const handleGoogleLogin = useCallback(async () => {
    setIsLoading(true);
    setError('');

    try {
      const redirectUrl = AuthSession.makeRedirectUri({
        path: 'sso-callback',
      });

      const { createdSessionId, setActive } = await startSSOFlow({
        strategy: 'oauth_google',
        redirectUrl,
      });

      if (createdSessionId) {
        await setActive!({ session: createdSessionId });
        router.replace('/');
      }
    } catch (err: any) {
      setError('Google sign-in failed');
    } finally {
      setIsLoading(false);
    }
  }, [router, startSSOFlow]);

  /* ----------------------------- Email Step ----------------------------- */

  const handleContinue = async () => {
    if (!email || !isSignInLoaded || !isSignUpLoaded) return;

    setIsLoading(true);
    setError('');

    try {
      const attempt = await signIn.create({ identifier: email });

      const factor = attempt.supportedFirstFactors?.find(
        (f) => f.strategy === 'email_code'
      );

      if (factor && 'emailAddressId' in factor) {
        await signIn.prepareFirstFactor({
          strategy: 'email_code',
          emailAddressId: factor.emailAddressId,
        });
      }

      setAuthMode('signIn');
      setStep('otp');
    } catch (e: any) {
      if (e?.errors?.[0]?.code === 'form_identifier_not_found') {
        await signUp.create({ emailAddress: email });
        await signUp.prepareEmailAddressVerification({
          strategy: 'email_code',
        });
        setAuthMode('signUp');
        setStep('otp');
      } else {
        setError('Unable to send code');
      }
    } finally {
      setIsLoading(false);
    }
  };

  /* ----------------------------- OTP ----------------------------- */

  const handleVerify = async () => {
    if (otp.length !== 6) return;

    setIsLoading(true);
    setError('');

    try {
      if (authMode === 'signIn') {
        const res = await signIn.attemptFirstFactor({
          strategy: 'email_code',
          code: otp,
        });
        if (res.status === 'complete') {
          await setActiveSignIn({ session: res.createdSessionId });
          router.replace('/');
        }
      }

      if (authMode === 'signUp') {
        const res = await signUp.attemptEmailAddressVerification({ code: otp });
        if (res.status === 'complete') {
          await setActiveSignUp({ session: res.createdSessionId });
          router.replace('/');
        }
      }
    } catch {
      setError('Invalid or expired code');
    } finally {
      setIsLoading(false);
    }
  };

  /* ----------------------------- UI ----------------------------- */

  return (
    <Animated.View
      className="flex-1 bg-white"
      entering={FadeInUp.duration(400)}
    >
      <FocusAwareStatusBar />

      {/* ---------------- HERO ---------------- */}
      <View className="items-center pt-20">

        <Image
          source={require('../../assets/images/experience/hero-logo.png')}
          className="mt-6 h-[320px] w-full"
          resizeMode="contain"
        />
      </View>

      {/* ---------------- CARD ---------------- */}
      <Animated.View
        entering={FadeInUp.duration(400)}
        className="flex-1 rounded-t-3xl bg-white px-6 pt-8"
      >
        <Text className="font-bold text-center text-3xl text-neutral-900">
          Welcome
        </Text>

        <Text className="mt-2 text-center text-neutral-500">
          Find your dream job effortlessly
        </Text>

        {/* GOOGLE */}
        <Pressable
          onPress={handleGoogleLogin}
          className="mt-8 flex-row items-center justify-center rounded-xl border border-neutral-200 py-4"
        >
          <Ionicons name="logo-google" size={20} />
          <Text className="ml-3 text-base font-semibold">
            Signup with Google
          </Text>
        </Pressable>

        {/* DIVIDER */}
        <View className="my-6 flex-row items-center gap-3">
          <View className="h-[1px] flex-1 bg-neutral-200" />
          <Text className="text-sm text-neutral-400">
            or continue with email
          </Text>
          <View className="h-[1px] flex-1 bg-neutral-200" />
        </View>

        {/* EMAIL / OTP */}
        {step === 'email' ? (
          <>
            <Input
              placeholder="example@gmail.com"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />

            <Pressable
              onPress={handleContinue}
              disabled={!email || isLoading}
              className="mt-6 rounded-xl bg-neutral-900 py-4"
            >
              {isLoading ? (
                <ActivityIndicator style={{color:"white"}} />
              ) : (
                <Text className="text-center text-lg font-bold text-white">
                  Continue to Proceed
                </Text>
              )}
            </Pressable>
          </>
        ) : (
          <>
            <Input
              placeholder="000000"
              value={otp}
              onChangeText={setOtp}
              keyboardType="number-pad"
              maxLength={6}
              className="text-center text-2xl tracking-widest"
            />

            <Pressable
              onPress={handleVerify}
              className="mt-6 rounded-xl bg-yellow-400 py-4"
            >
              <Text className="text-center text-lg font-bold">
                Verify & Continue
              </Text>
            </Pressable>
          </>
        )}

        {error ? (
          <Text className="mt-4 text-center text-sm text-red-500">{error}</Text>
        ) : null}

        {/* TERMS */}
        <Text className="mt-8 pb-6 text-center text-xs text-neutral-400">
          By continuing, you agree to our Terms & Privacy Policy
        </Text>
      </Animated.View>
    </Animated.View>
  );
}
