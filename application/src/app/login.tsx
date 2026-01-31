import { useSignIn, useSignUp, useSSO } from '@clerk/clerk-expo';
import { Ionicons } from '@expo/vector-icons';
import * as AuthSession from 'expo-auth-session';
import { useRouter } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import React, { useCallback, useEffect, useState } from 'react';
import { Image, Platform, Pressable } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';
import Animated, { FadeInUp } from 'react-native-reanimated';

import { FocusAwareStatusBar, Input, Text, View } from '@/components/ui';
import { OTPInput } from '@/components/ui/otp-input';
import { useRegisterDevice } from '@/features/users';
import { hideGlobalLoading, showGlobalLoading } from '@/lib';
import getOrCreateDeviceId from '@/utils/getOrCreatedId';

/* ----------------------------- Utils ----------------------------- */

const useWarmUpBrowser = () => {
  useEffect(() => {
    if (Platform.OS !== 'android') return;
    WebBrowser.warmUpAsync();
    return () => {
      void WebBrowser.coolDownAsync();
    };
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
  const [error, setError] = useState('');

  /* ----------------------------- Google ----------------------------- */

  const handleGoogleLogin = useCallback(async () => {
    showGlobalLoading();
    setError('');

    try {
      const redirectUrl = AuthSession.makeRedirectUri({
        path: 'sso-callback',
      });

      console.log('OAuth Redirect URL:', redirectUrl);

      const { createdSessionId, setActive } = await startSSOFlow({
        strategy: 'oauth_google',
        redirectUrl,
      });

      console.log('OAuth completed - createdSessionId:', createdSessionId);

      if (createdSessionId) {
        await setActive!({ session: createdSessionId });
        console.log(' Session activated, navigating to home');
        router.replace('/');
      }
    } catch (err: any) {
      console.error(' OAuth Error:', err?.message || err);
      setError('Google sign-in failed');
    } finally {
      hideGlobalLoading();
    }
  }, [router, startSSOFlow]);

  /* ----------------------------- Email Step ----------------------------- */

  // Email validation regex
  const isValidEmail = (emailStr: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(emailStr.trim());
  };

  const handleContinue = async () => {
    // --------- CLIENT SIDE VALIDATION ---------
    if (!email.trim()) {
      setError('Please enter your email');
      return;
    }

    if (!isValidEmail(email)) {
      setError('Please enter a valid email address');
      return;
    }

    if (!isSignInLoaded || !isSignUpLoaded) return;

    showGlobalLoading();
    setError('');

    try {
      // Try sign-in first
      const attempt = await signIn.create({ identifier: email.trim() });

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
      // If user not found → Sign up flow
      if (e?.errors?.[0]?.code === 'form_identifier_not_found') {
        try {
          await signUp.create({ emailAddress: email.trim() });
          await signUp.prepareEmailAddressVerification({
            strategy: 'email_code',
          });

          setAuthMode('signUp');
          setStep('otp');
        } catch {
          setError('Unable to send verification code');
        }
      } else {
        setError('Something went wrong. Please try again');
      }
    } finally {
      hideGlobalLoading();
    }
  };

  /* ----------------------------- OTP ----------------------------- */
  // const { expoPushToken } = useNotifications();
  const { mutate: registerDevice } = useRegisterDevice();
  const handleVerify = async () => {
    // --------- CLIENT SIDE VALIDATION ---------
    if (!otp.trim()) {
      setError('Please enter the 6-digit code');
      return;
    }

    if (otp.length !== 6) {
      setError('OTP must be 6 digits');
      return;
    }

    showGlobalLoading();
    setError('');

    const deviceId = await getOrCreateDeviceId();

    try {
      if (authMode === 'signIn' && signIn) {
        const res = await signIn.attemptFirstFactor({
          strategy: 'email_code',
          code: otp,
        });

        if (res.status === 'complete' && setActiveSignIn) {
          await setActiveSignIn({ session: res.createdSessionId });
          const deviceType = Platform.OS === 'ios' ? 'ios' : 'android';
          registerDevice({
            deviceId: deviceId,
            type: deviceType,
          });
          router.replace('/');
        } else {
          console.log(' SignIn not complete, status:', res.status);
        }
      }

      if (authMode === 'signUp' && signUp) {
        const res = await signUp.attemptEmailAddressVerification({ code: otp });

        if (res.status === 'complete' && setActiveSignUp) {
          await setActiveSignUp({ session: res.createdSessionId });

          const deviceType = Platform.OS === 'ios' ? 'ios' : 'android';
          registerDevice({
            deviceId: deviceId,
            type: deviceType,
          });
          router.replace('/');
        } else {
          console.log(' SignUp not complete, status:', res.status);
        }
      }
    } catch (e: any) {
      console.error(' OTP Error:', e?.message || e, e?.errors);
      setError('Invalid or expired code');
    } finally {
      hideGlobalLoading();
    }
  };
  useEffect(() => {
    if (otp.length === 6) {
      handleVerify();
    }
  }, [otp]);
  /* ----------------------------- UI ----------------------------- */

  return (
    <KeyboardAwareScrollView keyboardShouldPersistTaps="handled">
      <Animated.View
        className="flex-1 bg-white"
        entering={FadeInUp.duration(400)}
      >
        <FocusAwareStatusBar />

        {/* ---------------- HERO ---------------- */}
        <View className="items-center bg-yellow-50 pt-20">
          <Image
            source={require('../../assets/images/experience/HBLongLogo.png')}
            className="h-[80px] w-[160px]"
            resizeMode="contain"
          />
        </View>

        <View className="items-center bg-yellow-50">
          <Image
            source={require('../../assets/images/experience/appSample.png')}
            className="mt-6 h-[320px] w-full"
            resizeMode="contain"
          />
        </View>

        {/* ---------------- CARD ---------------- */}
        <Animated.View
          entering={FadeInUp.duration(400)}
          className="flex-1 rounded-t-3xl bg-white px-6 pt-8"
        >
          <Text className="text-center font-['Montez'] text-3xl text-neutral-900">
            Welcome
          </Text>

          <Text className="my-5 mt-2 text-center text-neutral-500">
            Find your dream job effortlessly
          </Text>

          {/* EMAIL / OTP */}

          {step === 'email' ? (
            <>
              <Text className="mb-2 text-base font-semibold text-neutral-500">
                Enter Email Address
              </Text>
              <Input
                placeholder="example@gmail.com"
                value={email}
                onChangeText={(text) => {
                  setEmail(text);
                  if (error) setError('');
                }}
                keyboardType="email-address"
                autoCapitalize="none"
              />
              {error ? (
                <View className="mt-4 flex-row items-center">
                  <Ionicons
                    name="information-circle"
                    size={20}
                    color="#ef4444"
                    style={{ marginRight: 6 }}
                  />
                  <Text className="text-left text-sm text-red-500">
                    {error}
                  </Text>
                </View>
              ) : null}

              <Pressable
                onPress={handleContinue}
                className="mt-6 rounded-xl bg-neutral-900 py-4"
              >
                <Text className="text-center text-lg font-bold text-white">
                  Continue to Proceed
                </Text>
              </Pressable>
            </>
          ) : (
            <>
              {/* Back button */}
              <Pressable
                onPress={() => {
                  setStep('email');
                  setOtp('');
                  setError('');
                }}
                className="mb-4 flex-row items-center self-start"
              >
                <Ionicons name="arrow-back" size={20} color="#525252" />
                <Text className="ml-2 text-base font-medium text-neutral-600">
                  Change Email
                </Text>
              </Pressable>

              {/* OTP sent message */}
              <View className="mb-6 rounded-xl bg-green-50 p-4">
                <Text className="text-center text-sm text-green-700">
                  OTP has been sent to your email
                </Text>
                <Text className="mt-1 text-center text-base font-semibold text-green-800">
                  {email}
                </Text>
              </View>

              {/* 6-box OTP Input */}
              <OTPInput value={otp} onChange={setOtp} length={6} autoFocus />
              {error ? (
                <View className="mt-4 flex-row items-center">
                  <Ionicons
                    name="information-circle"
                    size={20}
                    color="#ef4444"
                    style={{ marginRight: 6 }}
                  />
                  <Text className="text-left text-sm text-red-500">
                    {error}
                  </Text>
                </View>
              ) : null}

              <Pressable
                onPress={handleVerify}
                disabled={otp.length !== 6}
                className={`mt-6 rounded-xl py-4 ${otp.length === 6 ? 'bg-neutral-900' : 'bg-neutral-400'}`}
              >
                <Text className="text-center text-lg font-bold text-white">
                  Verify & Continue
                </Text>
              </Pressable>
            </>
          )}

          {/* TERMS */}
          <Text className="mt-8 pb-6 text-center text-xs text-neutral-400">
            By continuing, you agree to our Terms & Privacy Policy
          </Text>
        </Animated.View>
      </Animated.View>
    </KeyboardAwareScrollView>
  );
}
