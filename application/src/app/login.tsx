import { Ionicons } from '@expo/vector-icons';
import { useSignIn, useSignUp, useSSO } from '@clerk/clerk-expo';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Platform, Pressable } from 'react-native';
import Animated, { FadeInRight } from 'react-native-reanimated';
import * as WebBrowser from 'expo-web-browser';
import * as AuthSession from 'expo-auth-session';

import {
  FocusAwareStatusBar,
  Input,
  SafeAreaView,
  Text,
  View,
} from '@/components/ui';

type Step = 'email' | 'otp';
type AuthMode = 'signIn' | 'signUp' | null;

// Preloads the browser for Android devices to reduce authentication load time
const useWarmUpBrowser = () => {
  useEffect(() => {
    if (Platform.OS !== 'android') return;
    void WebBrowser.warmUpAsync();
    return () => {
      void WebBrowser.coolDownAsync();
    };
  }, []);
};

// Handle any pending authentication sessions
WebBrowser.maybeCompleteAuthSession();

export default function Login() {
  useWarmUpBrowser();

  const router = useRouter();
  const { signIn, setActive: setActiveSignIn, isLoaded: isSignInLoaded } = useSignIn();
  const { signUp, setActive: setActiveSignUp, isLoaded: isSignUpLoaded } = useSignUp();
  const { startSSOFlow } = useSSO();

  const [step, setStep] = useState<Step>('email');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [authMode, setAuthMode] = useState<AuthMode>(null);

  const handleGoogleLogin = useCallback(async () => {
    setIsLoading(true);
    setError('');

    try {
      const { createdSessionId, setActive, signIn, signUp } = await startSSOFlow({
        strategy: 'oauth_google',
        redirectUrl: AuthSession.makeRedirectUri(),
      });

      if (createdSessionId) {
        await setActive!({ session: createdSessionId });
        router.replace('/');
      } else {
        // Handle missing requirements if needed (MFA, etc.)
        console.log('OAuth flow incomplete:', { signIn, signUp });
        setError('Sign-in incomplete. Please try again.');
      }
    } catch (err: any) {
      console.error('Google OAuth error:', JSON.stringify(err, null, 2));
      setError(err?.errors?.[0]?.message || 'Google sign-in failed');
    } finally {
      setIsLoading(false);
    }
  }, [startSSOFlow, router]);

  const handleInitialContinue = async () => {
    if (!isSignInLoaded || !isSignUpLoaded || !signIn || !signUp || email.length === 0) return;

    setIsLoading(true);
    setError('');

    try {
      // First, try to sign in (existing user)
      const signInAttempt = await signIn.create({
        identifier: email,
      });

      // Prepare email code verification
      const emailFactor = signInAttempt.supportedFirstFactors?.find(
        (factor) => factor.strategy === 'email_code'
      );

      if (emailFactor && 'emailAddressId' in emailFactor) {
        await signIn.prepareFirstFactor({
          strategy: 'email_code',
          emailAddressId: emailFactor.emailAddressId,
        });
      }

      setAuthMode('signIn');
      setStep('otp');
    } catch (signInError: any) {
      // If user doesn't exist, create a new one
      if (signInError?.errors?.[0]?.code === 'form_identifier_not_found') {
        try {
          await signUp.create({
            emailAddress: email,
          });

          // Prepare email verification for new user
          await signUp.prepareEmailAddressVerification({
            strategy: 'email_code',
          });

          setAuthMode('signUp');
          setStep('otp');
        } catch (signUpError: any) {
          setError(signUpError?.errors?.[0]?.message || 'Failed to send code');
        }
      } else {
        setError(signInError?.errors?.[0]?.message || 'Failed to send code');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerify = async () => {
    if (!isSignInLoaded || !isSignUpLoaded || !signIn || !signUp || otp.length !== 6) return;

    setIsLoading(true);
    setError('');

    try {
      if (authMode === 'signIn') {
        // Verify sign in
        const signInAttempt = await signIn.attemptFirstFactor({
          strategy: 'email_code',
          code: otp,
        });

        if (signInAttempt.status === 'complete') {
          await setActiveSignIn({ session: signInAttempt.createdSessionId });
          router.replace('/');
          return;
        } else {
          console.log('Sign in status:', signInAttempt.status);
          setError('Verification incomplete. Please try again.');
        }
      } else if (authMode === 'signUp') {
        // Verify sign up
        const signUpAttempt = await signUp.attemptEmailAddressVerification({
          code: otp,
        });

        if (signUpAttempt.status === 'complete') {
          await setActiveSignUp({ session: signUpAttempt.createdSessionId });
          router.replace('/');
          return;
        } else if (signUpAttempt.status === 'missing_requirements') {
          // User created but may need additional setup
          // For now, just set active and proceed
          if (signUpAttempt.createdSessionId) {
            await setActiveSignUp({ session: signUpAttempt.createdSessionId });
            router.replace('/');
            return;
          }
          console.log('Sign up missing requirements:', signUpAttempt);
          setError('Additional verification required.');
        } else {
          console.log('Sign up status:', signUpAttempt.status);
          setError('Verification incomplete. Please try again.');
        }
      }
    } catch (err: any) {
      console.error('Verification error:', err);
      setError(err?.errors?.[0]?.message || 'Invalid verification code');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendCode = async () => {
    if (!signIn || !signUp) return;

    setIsLoading(true);
    setError('');

    try {
      if (authMode === 'signIn') {
        const emailFactor = signIn.supportedFirstFactors?.find(
          (factor) => factor.strategy === 'email_code'
        );
        if (emailFactor && 'emailAddressId' in emailFactor) {
          await signIn.prepareFirstFactor({
            strategy: 'email_code',
            emailAddressId: emailFactor.emailAddressId,
          });
        }
      } else if (authMode === 'signUp') {
        await signUp.prepareEmailAddressVerification({
          strategy: 'email_code',
        });
      }
    } catch (err: any) {
      setError(err?.errors?.[0]?.message || 'Failed to resend code');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBack = () => {
    setStep('email');
    setOtp('');
    setError('');
    setAuthMode(null);
  };

  return (
    <View className="flex-1 bg-white dark:bg-neutral-900">
      <FocusAwareStatusBar />
      <SafeAreaView className="flex-1">
        <View className="flex-1 px-6 pt-12">
          {step === 'otp' && (
            <Pressable
              onPress={handleBack}
              className="mb-8 flex-row items-center self-start"
            >
              <Ionicons
                name="arrow-back"
                size={20}
                className="text-neutral-900 dark:text-white"
                color="#525252"
              />
              <Text className="ml-2 text-sm font-medium text-neutral-600 dark:text-neutral-400">
                Change email
              </Text>
            </Pressable>
          )}

          <Animated.View
            entering={FadeInRight.duration(300)}
            key={step}
            className="flex-1"
          >
            <Text className="mb-2 text-3xl font-bold dark:text-white">
              {step === 'email' ? 'Welcome' : 'Check your inbox'}
            </Text>
            <Text className="mb-8 text-base text-neutral-500">
              {step === 'email'
                ? 'Enter your email to continue'
                : `We've sent a 6-digit code to ${email}`}
            </Text>

            {error ? (
              <View className="mb-4 rounded-lg bg-red-50 p-3 dark:bg-red-900/20">
                <Text className="text-sm text-red-600 dark:text-red-400">
                  {error}
                </Text>
              </View>
            ) : null}

            {step === 'email' ? (
              <View>
                <Pressable
                  onPress={handleGoogleLogin}
                  className="mb-8 flex-row items-center justify-center rounded-xl border border-neutral-200 bg-white py-4 active:bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-800 dark:active:bg-neutral-700"
                >
                  <Ionicons name="logo-google" size={20} color={""} />
                  <Text className="ml-3 text-base font-semibold dark:text-white">
                    Continue with Google
                  </Text>
                </Pressable>

                <View className="mb-8 flex-row items-center gap-4">
                  <View className="h-[1px] flex-1 bg-neutral-200 dark:bg-neutral-800" />
                  <Text className="text-sm text-neutral-400">
                    Or continue with email
                  </Text>
                  <View className="h-[1px] flex-1 bg-neutral-200 dark:bg-neutral-800" />
                </View>

                <View className="gap-4">
                  <Input
                    placeholder="name@work-email.com"
                    value={email}
                    onChangeText={setEmail}
                    autoCapitalize="none"
                    keyboardType="email-address"
                    returnKeyType="go"
                    onSubmitEditing={handleInitialContinue}
                    editable={!isLoading}
                  />

                  <Pressable
                    onPress={handleInitialContinue}
                    disabled={email.length === 0 || isLoading}
                    className={`items-center justify-center rounded-xl py-4 ${
                      email.length > 0 && !isLoading
                        ? 'bg-neutral-900 dark:bg-white'
                        : 'bg-neutral-200 dark:bg-neutral-800'
                    }`}
                  >
                    {isLoading ? (
                      <ActivityIndicator color="#fff" />
                    ) : (
                      <Text
                        className={`text-base font-semibold ${
                          email.length > 0
                            ? 'text-white dark:text-black'
                            : 'text-neutral-500'
                        }`}
                      >
                        Continue
                      </Text>
                    )}
                  </Pressable>
                </View>
              </View>
            ) : (
              <View className="gap-4">
                <Input
                  placeholder="000000"
                  value={otp}
                  onChangeText={setOtp}
                  keyboardType="number-pad"
                  maxLength={6}
                  autoFocus
                  returnKeyType="go"
                  onSubmitEditing={handleVerify}
                  className="text-center text-2xl tracking-widest"
                  editable={!isLoading}
                />

                <Pressable
                  onPress={handleVerify}
                  disabled={otp.length !== 6 || isLoading}
                  className={`items-center justify-center rounded-xl py-4 ${
                    otp.length === 6 && !isLoading
                      ? 'bg-neutral-900 dark:bg-white'
                      : 'bg-neutral-200 dark:bg-neutral-800'
                  }`}
                >
                  {isLoading ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <Text
                      className={`text-base font-semibold ${
                        otp.length === 6
                          ? 'text-white dark:text-black'
                          : 'text-neutral-500'
                      }`}
                    >
                      Verify & Continue
                    </Text>
                  )}
                </Pressable>

                <Pressable
                  className="mt-4 items-center"
                  onPress={handleResendCode}
                  disabled={isLoading}
                >
                  <Text className="text-sm font-medium text-neutral-900 dark:text-white">
                    Resend Code
                  </Text>
                </Pressable>
              </View>
            )}
            {/* Disclaimer */}
            <View className="mt-auto pb-8">
              <Text className="text-center text-xs text-neutral-400 leading-5">
                By clicking continue, you agree to our{' '}
                <Text className="text-neutral-900 dark:text-white underline">
                  Terms of Service
                </Text>{' '}
                and{' '}
                <Text className="text-neutral-900 dark:text-white underline">
                  Privacy Policy
                </Text>
              </Text>
            </View>
          </Animated.View>
        </View>
      </SafeAreaView>
    </View>
  );
}
