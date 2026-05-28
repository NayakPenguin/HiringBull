import { Ionicons } from '@expo/vector-icons';
import {
  GoogleSignin,
  isErrorWithCode,
  statusCodes,
} from '@react-native-google-signin/google-signin';
// LinkedIn uses server-side OAuth callback (LinkedIn rejects custom scheme redirects)
import { useRouter } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import React, { useCallback, useEffect, useState } from 'react';
import { Image, Platform, Pressable } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';
import Animated, { FadeInUp } from 'react-native-reanimated';

import { client } from '@/api/common/client';
import { FocusAwareStatusBar, Input, Text, View } from '@/components/ui';
import { GoogleLogo } from '@/components/ui/GoogleLogo';
import { OTPInput } from '@/components/ui/otp-input';
import { useRegisterDevice } from '@/features/users';
import { hideGlobalLoading, showGlobalLoading } from '@/lib';
import { useAuth } from '@/lib/auth';
import getOrCreateDeviceId from '@/utils/getOrCreatedId';

WebBrowser.maybeCompleteAuthSession();

/* ---------- Google Sign-In Configuration ---------- */
const GOOGLE_WEB_CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID_WEB;
if (__DEV__) {
  console.log(
    '[Login:Google:Config] webClientId =',
    GOOGLE_WEB_CLIENT_ID || '⚠️ UNDEFINED!'
  );
  console.log(
    '[Login:Google:Config] webClientId length =',
    GOOGLE_WEB_CLIENT_ID?.length || 0
  );
}
GoogleSignin.configure({
  webClientId: GOOGLE_WEB_CLIENT_ID,
  offlineAccess: false,
});

/* ---------- LinkedIn: server-side OAuth ---------- */
// LinkedIn only accepts HTTPS redirect URIs, so we use the server as intermediary.
// Flow: App opens browser → server → LinkedIn → server callback → app deep link with JWT
// LinkedIn OAuth MUST use production HTTPS URL (LinkedIn rejects HTTP redirect URIs)
const LINKEDIN_START_URL = `https://api.hiringbull.org/api/auth/linkedin/start`;
const APP_SCHEME = __DEV__ ? 'exp+hiringbull-nayak' : 'hiringbull';

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

  const registerDeviceAndNavigate = useCallback(async () => {
    const deviceId = await getOrCreateDeviceId();
    registerDevice({
      deviceId,
      type: Platform.OS === 'ios' ? 'ios' : 'android',
      token: '',
    });
    router.replace('/');
  }, [registerDevice, router]);

  /* ----------------------------- Google ----------------------------- */

  const handleGoogleSignIn = async () => {
    showGlobalLoading();
    setError('');
    console.log('[Login:Google] ====== SIGN-IN ATTEMPT ======');
    console.log(
      '[Login:Google] webClientId configured:',
      GOOGLE_WEB_CLIENT_ID
        ? `${GOOGLE_WEB_CLIENT_ID.substring(0, 20)}...`
        : '⚠️ UNDEFINED'
    );
    try {
      console.log('[Login:Google] Checking Play Services...');
      await GoogleSignin.hasPlayServices({
        showPlayServicesUpdateDialog: true,
      });
      console.log('[Login:Google] Play Services OK, calling signIn()...');
      const response = await GoogleSignin.signIn();
      console.log(
        '[Login:Google] Native sign-in response type:',
        response?.type
      );
      console.log(
        '[Login:Google] Native sign-in response keys:',
        Object.keys(response || {})
      );
      console.log(
        '[Login:Google] response.data keys:',
        Object.keys(response?.data || {})
      );
      const idToken = response.data?.idToken;
      console.log(
        '[Login:Google] idToken present:',
        !!idToken,
        'length:',
        idToken?.length || 0
      );
      if (!idToken) {
        throw new Error('No ID token returned from Google');
      }
      console.log('[Login:Google] Sending idToken to server...');
      const { data } = await client.post('/api/auth/google', { idToken });
      console.log('[Login:Google] Server response:', data.user?.id);
      await signIn(data.token);
      await registerDeviceAndNavigate();
    } catch (err: any) {
      console.error('[Login:Google] ====== ERROR ======');
      console.error('[Login:Google] Error name:', err?.name);
      console.error('[Login:Google] Error message:', err?.message);
      console.error('[Login:Google] Error code:', err?.code);
      console.error(
        '[Login:Google] Full error:',
        JSON.stringify(err, Object.getOwnPropertyNames(err))
      );
      if (isErrorWithCode(err)) {
        switch (err.code) {
          case statusCodes.SIGN_IN_CANCELLED:
            // User dismissed — no error message needed
            break;
          case statusCodes.IN_PROGRESS:
            setError('Sign-in already in progress. Please wait.');
            break;
          case statusCodes.PLAY_SERVICES_NOT_AVAILABLE:
            setError(
              'Google Play Services not available. Please update and try again.'
            );
            break;
          default:
            // Error code 10 = DEVELOPER_ERROR (SHA-1 fingerprint / package name mismatch)
            if (String(err.code) === '10') {
              setError(
                'Google sign-in is not configured for this build. Please use Email or LinkedIn to sign in.'
              );
            } else {
              setError(
                'Google sign-in failed. Please try again or use another method.'
              );
            }
        }
      } else {
        const serverMsg = (
          err?.response?.data as { error?: string } | undefined
        )?.error;
        setError(serverMsg || 'Google sign-in failed. Please try again.');
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
      console.log(
        '[Login:LinkedIn] Opening server OAuth flow:',
        LINKEDIN_START_URL
      );

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
          console.log(
            '[Login:LinkedIn] Got token from callback, signing in...'
          );
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

  const handleContinue = useCallback(async () => {
    if (!email.trim()) return setError('Please enter your email');
    if (!isValidEmail(email))
      return setError('Please enter a valid email address');

    showGlobalLoading();
    setError('');

    try {
      await client.post('/api/auth/email/send-otp', { email: email.trim() });
      setStep('otp');
    } catch (err: any) {
      const serverMsg = (err?.response?.data as { error?: string } | undefined)
        ?.error;
      setError(
        serverMsg || 'Unable to send verification code. Please try again.'
      );
    } finally {
      hideGlobalLoading();
    }
  }, [email]);

  /* ----------------------------- OTP Verify ----------------------------- */

  const handleVerify = useCallback(async () => {
    if (!otp.trim()) return setError('Please enter the 6-digit code');
    if (otp.length !== 6) return setError('OTP must be 6 digits');

    showGlobalLoading();
    setError('');

    try {
      const { data } = await client.post('/api/auth/email/verify-otp', {
        email: email.trim(),
        code: otp,
      });
      await signIn(data.token);
      await registerDeviceAndNavigate();
    } catch (err: any) {
      const serverMsg = (err?.response?.data as { error?: string } | undefined)
        ?.error;
      setError(serverMsg || 'Invalid or expired code. Please try again.');
    } finally {
      hideGlobalLoading();
    }
  }, [email, otp, signIn, registerDeviceAndNavigate]);

  useEffect(() => {
    if (otp.length === 6) handleVerify();
  }, [otp, handleVerify]);
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

          {/* SOCIAL LOGINS + EMAIL / OTP */}

          {step === 'email' ? (
            <>
              {/* Social logins — above email per client request */}
              <Pressable
                onPress={handleGoogleSignIn}
                className="mb-3 flex-row items-center justify-center rounded-xl border border-neutral-200 py-4"
              >
                <View style={{ marginRight: 8 }}>
                  <GoogleLogo size={20} />
                </View>
                <Text className="text-base font-semibold text-neutral-700">
                  Continue with Google
                </Text>
              </Pressable>

              <Pressable
                onPress={handleLinkedInSignIn}
                className="mb-3 flex-row items-center justify-center rounded-xl border border-neutral-200 py-4"
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

              <View className="my-5 flex-row items-center">
                <View className="h-px flex-1 bg-neutral-200" />
                <Text className="mx-4 text-sm text-neutral-400">
                  or continue with email
                </Text>
                <View className="h-px flex-1 bg-neutral-200" />
              </View>

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

              {/* Resend OTP */}
              <Pressable
                onPress={async () => {
                  setError('');
                  showGlobalLoading();
                  try {
                    console.log('[Login:OTP] Resending OTP to:', email.trim());
                    await client.post('/api/auth/email/send-otp', {
                      email: email.trim(),
                    });
                    console.log('[Login:OTP] OTP resent successfully');
                  } catch (err: any) {
                    setError(
                      err?.response?.data?.error || 'Failed to resend code'
                    );
                  } finally {
                    hideGlobalLoading();
                  }
                }}
                className="mt-4"
              >
                <Text className="text-center text-sm font-semibold text-blue-600">
                  Didn't receive the code? Resend OTP
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
