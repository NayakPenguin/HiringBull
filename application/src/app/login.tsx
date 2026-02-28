import { Ionicons } from '@expo/vector-icons';
import {
  GoogleSignin,
  isErrorWithCode,
  statusCodes,
} from '@react-native-google-signin/google-signin';
// LinkedIn uses server-side OAuth callback (LinkedIn rejects custom scheme redirects)
import { useRouter } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import React, { useEffect, useState } from 'react';
import { Image, Platform, Pressable } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';
import Animated, { FadeInUp } from 'react-native-reanimated';

import { client } from '@/api/common/client';
import { FocusAwareStatusBar, Input, Text, View } from '@/components/ui';
import { OTPInput } from '@/components/ui/otp-input';
import { useRegisterDevice } from '@/features/users';
import { hideGlobalLoading, showGlobalLoading } from '@/lib';
import { useAuth } from '@/lib/auth';
import getOrCreateDeviceId from '@/utils/getOrCreatedId';

WebBrowser.maybeCompleteAuthSession();

/* ---------- Google Sign-In Configuration ---------- */
GoogleSignin.configure({
  webClientId: process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID_WEB,
  offlineAccess: false,
});

/* ---------- LinkedIn: server-side OAuth ---------- */
// LinkedIn only accepts HTTPS redirect URIs, so we use the server as intermediary.
// Flow: App opens browser → server → LinkedIn → server callback → app deep link with JWT
const LINKEDIN_START_URL = `${process.env.EXPO_PUBLIC_API_URL}/api/auth/linkedin/start`;
const APP_SCHEME = 'exp+hiringbull-nayak';

/* ----------------------------- Screen ----------------------------- */

export default function Login() {
  const router = useRouter();
  const { signIn } = useAuth();
  const { mutate: registerDevice } = useRegisterDevice();

  const [step, setStep] = useState<'email' | 'otp'>('email');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');

  /* ---------- Shared: register device + navigate ---------- */

  const registerDeviceAndNavigate = async () => {
    const deviceId = await getOrCreateDeviceId();
    registerDevice({
      deviceId,
      type: Platform.OS === 'ios' ? 'ios' : 'android',
    });
    router.replace('/');
  };

  /* ----------------------------- Google ----------------------------- */

  const handleGoogleSignIn = async () => {
    showGlobalLoading();
    setError('');
    try {
      await GoogleSignin.hasPlayServices();
      const response = await GoogleSignin.signIn();
      console.log('[Login:Google] Native sign-in success, getting idToken...');
      const idToken = response.data?.idToken;
      if (!idToken) {
        throw new Error('No ID token returned from Google');
      }
      console.log('[Login:Google] Sending idToken to server...');
      const { data } = await client.post('/api/auth/google', { idToken });
      console.log('[Login:Google] Success, userId:', data.user?.id);
      await signIn(data.token);
      await registerDeviceAndNavigate();
    } catch (err: any) {
      if (isErrorWithCode(err)) {
        switch (err.code) {
          case statusCodes.SIGN_IN_CANCELLED:
            console.log('[Login:Google] User cancelled');
            break;
          case statusCodes.IN_PROGRESS:
            console.log('[Login:Google] Already in progress');
            break;
          case statusCodes.PLAY_SERVICES_NOT_AVAILABLE:
            setError('Google Play Services not available');
            break;
          default:
            console.error('[Login:Google] Error code:', err.code, err.message);
            setError(err?.response?.data?.error || 'Google sign-in failed');
        }
      } else {
        console.error('[Login:Google] Failed:', err?.response?.data || err.message);
        setError(err?.response?.data?.error || 'Google sign-in failed');
      }
    } finally {
      hideGlobalLoading();
    }
  };

  /* ----------------------------- LinkedIn ----------------------------- */

  const handleLinkedInSignIn = async () => {
    showGlobalLoading();
    setError('');
    try {
      console.log('[Login:LinkedIn] Opening server OAuth flow:', LINKEDIN_START_URL);

      // Open browser → server redirects to LinkedIn → LinkedIn redirects back to server
      // → server exchanges code, creates JWT, redirects to app deep link with ?token=...
      const result = await WebBrowser.openAuthSessionAsync(
        LINKEDIN_START_URL,
        `${APP_SCHEME}://login`
      );

      console.log('[Login:LinkedIn] WebBrowser result type:', result.type);

      if (result.type === 'success' && result.url) {
        const url = new URL(result.url);
        const token = url.searchParams.get('token');
        const errorMsg = url.searchParams.get('error');

        if (errorMsg) {
          console.error('[Login:LinkedIn] Server returned error:', errorMsg);
          setError(errorMsg);
          return;
        }

        if (token) {
          console.log('[Login:LinkedIn] Got token from callback, signing in...');
          await signIn(token);
          await registerDeviceAndNavigate();
        } else {
          setError('No token received from LinkedIn');
        }
      } else if (result.type === 'cancel' || result.type === 'dismiss') {
        console.log('[Login:LinkedIn] User cancelled');
      }
    } catch (err: any) {
      console.error('[Login:LinkedIn] Error:', err.message);
      setError('LinkedIn sign-in failed');
    } finally {
      hideGlobalLoading();
    }
  };

  /* ----------------------------- Email OTP ----------------------------- */

  const isValidEmail = (emailStr: string) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailStr.trim());

  const handleContinue = async () => {
    if (!email.trim()) return setError('Please enter your email');
    if (!isValidEmail(email))
      return setError('Please enter a valid email address');

    showGlobalLoading();
    setError('');

    try {
      console.log('[Login:OTP] Sending OTP to:', email.trim());
      await client.post('/api/auth/email/send-otp', { email: email.trim() });
      console.log('[Login:OTP] OTP sent successfully');
      setStep('otp');
    } catch (err: any) {
      setError(
        err?.response?.data?.error || 'Unable to send verification code'
      );
    } finally {
      hideGlobalLoading();
    }
  };

  /* ----------------------------- OTP Verify ----------------------------- */

  const handleVerify = async () => {
    if (!otp.trim()) return setError('Please enter the 6-digit code');
    if (otp.length !== 6) return setError('OTP must be 6 digits');

    showGlobalLoading();
    setError('');

    try {
      console.log('[Login:OTP] Verifying OTP for:', email.trim());
      const { data } = await client.post('/api/auth/email/verify-otp', {
        email: email.trim(),
        code: otp,
      });
      console.log('[Login:OTP] Verify success, userId:', data.user?.id);
      await signIn(data.token);
      await registerDeviceAndNavigate();
    } catch (err: any) {
      setError(err?.response?.data?.error || 'Invalid or expired code');
    } finally {
      hideGlobalLoading();
    }
  };

  useEffect(() => {
    if (otp.length === 6) handleVerify();
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

              {/* Social logins */}
              <View className="my-6 flex-row items-center">
                <View className="h-px flex-1 bg-neutral-200" />
                <Text className="mx-4 text-sm text-neutral-400">or</Text>
                <View className="h-px flex-1 bg-neutral-200" />
              </View>

              <Pressable
                onPress={handleGoogleSignIn}
                className="mb-3 flex-row items-center justify-center rounded-xl border border-neutral-200 py-4"
              >
                <Ionicons
                  name="logo-google"
                  size={20}
                  color="#4285F4"
                  style={{ marginRight: 8 }}
                />
                <Text className="text-base font-semibold text-neutral-700">
                  Continue with Google
                </Text>
              </Pressable>

              <Pressable
                onPress={handleLinkedInSignIn}
                className="flex-row items-center justify-center rounded-xl border border-neutral-200 py-4"
              >
                <Ionicons
                  name="logo-linkedin"
                  size={20}
                  color="#0A66C2"
                  style={{ marginRight: 8 }}
                />
                <Text className="text-base font-semibold text-neutral-700">
                  Continue with LinkedIn
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
