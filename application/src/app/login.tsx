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
import { showGlobalLoading, hideGlobalLoading } from '@/lib';

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
const isValidEmail = (email: string) => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
};
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
      // If user not found → Sign up flow
      if (e?.errors?.[0]?.code === 'form_identifier_not_found') {
        try {
          await signUp.create({ emailAddress: email });
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

    console.log(' OTP Verification starting... authMode:', authMode);

    try {
      if (authMode === 'signIn' && signIn) {
        console.log(' Attempting signIn.attemptFirstFactor...');
        const res = await signIn.attemptFirstFactor({
          strategy: 'email_code',
          code: otp,
        });
        console.log(' SignIn result status:', res.status, 'sessionId:', res.createdSessionId);

        if (res.status === 'complete' && setActiveSignIn) {
          console.log('Setting active session...');
          await setActiveSignIn({ session: res.createdSessionId });
          console.log(' Session set, navigating to home...');
          router.replace('/');
        } else {
          console.log(' SignIn not complete, status:', res.status);
        }
      }

      if (authMode === 'signUp' && signUp) {
        console.log(' Attempting signUp.attemptEmailAddressVerification...');
        const res = await signUp.attemptEmailAddressVerification({ code: otp });
        console.log(' SignUp result status:', res.status, 'sessionId:', res.createdSessionId);
        console.log(' SignUp missingFields:', res.missingFields);
        console.log(' SignUp unverifiedFields:', res.unverifiedFields);

        if (res.status === 'complete' && setActiveSignUp) {
          console.log(' Setting active session...');
          await setActiveSignUp({ session: res.createdSessionId });
          console.log(' Session set, navigating to home...');
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


  /* ----------------------------- UI ----------------------------- */

  return (
    <KeyboardAwareScrollView keyboardShouldPersistTaps="handled">
      <Animated.View
        className="flex-1 bg-white"
        entering={FadeInUp.duration(400)}
      >
        <FocusAwareStatusBar />

        {/* ---------------- HERO ---------------- */}
        <View className="items-center pt-20 bg-yellow-50">
          <Image
            // source={require('../../assets/images/experience/hero-logo.png')}
            source={require('../../assets/images/experience/HBLongLogo.png')}
            className="h-[80px] w-[160px]"
            resizeMode="contain"
          />
        </View>

        <View className="items-center bg-yellow-50">
          <Image
            // source={require('../../assets/images/experience/hero-logo.png')}
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
          <Text className="text-center text-3xl font-bold text-neutral-900">
            Welcome
          </Text>

          <Text className="mt-2 my-5 text-center text-neutral-500">
            Find your dream job effortlessly
          </Text>

          {/* GOOGLE */}
          {/* <Pressable
            onPress={handleGoogleLogin}
            className="mt-8 flex-row items-center justify-center rounded-xl border border-neutral-200 py-4"
          >
            <Ionicons name="logo-google" size={20} />
            <Text className="ml-3 text-base font-semibold">
              Signup with Google
            </Text>
          </Pressable> */}

          {/* DIVIDER */}
          {/* <View className="my-6 flex-row items-center gap-3">
            <View className="h-px flex-1 bg-neutral-200" />
            <Text className="text-sm text-neutral-400">
              or continue with email
            </Text>
            <View className="h-px flex-1 bg-neutral-200" />
          </View> */}

          {/* EMAIL / OTP */}

          {step === 'email' ? (
            <>
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
                disabled={isLoading}
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
              <OTPInput
                value={otp}
                onChangeText={(text) => {
                  setOtp(text);
                  if (error) setError('');
                }}
                keyboardType="number-pad"
                maxLength={6}
                className="text-center text-2xl tracking-widest"
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



              {error ? (
                <View className="mt-4 flex-row items-center justify-center">
                  <Ionicons
                    name="information-circle"
                    size={20}
                    color={'#ef4444'}
                    className='mr-2'
                  />
                  <Text className="text-center text-sm text-red-500">
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
