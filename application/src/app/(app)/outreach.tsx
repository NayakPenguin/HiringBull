import { useUser } from '@clerk/clerk-expo';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { type TextInput } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';

import {
  Button,
  ControlledInput,
  FocusAwareStatusBar,
  SafeAreaView,
  Text,
  View,
} from '@/components/ui';
import { useOutreachForm } from '@/lib/hooks/use-outreach-form';
import { useSendLimitStore } from '@/lib/stores/send-limit-store';

// Local component for this form with ref support
const ControlledInputWithRef = React.forwardRef<
  TextInput,
  {
    control: any;
    name: string;
    placeholder: string;
    returnKeyType?: 'done' | 'next' | 'default';
    onSubmitEditing?: () => void;
    multiline?: boolean;
    numberOfLines?: number;
    style?: any;
    className?: string;
    disabled?: boolean;
  }
>(({ control, name, ...props }, ref) => {
  return (
    <View className="mb-4">
      <ControlledInput control={control} name={name} {...props} ref={ref} />
    </View>
  );
});

export default function Search() {
  const { form, onSubmit } = useOutreachForm();
  const { control, watch } = form;
  const { user } = useUser();

  const { canSend, getRemaining, increment, resetIfNewMonth } =
    useSendLimitStore();

  // Watch required fields for validation
  const email = watch('email');
  const message = watch('message');

  // Check if all required fields are filled
  const isFormValid = Boolean(email?.trim() && message?.trim());
  console.log(isFormValid, email);

  const emailRef = React.useRef<TextInput>(null);
  const jobIdRef = React.useRef<TextInput>(null);
  const resumeLinkRef = React.useRef<TextInput>(null);
  const messageRef = React.useRef<TextInput>(null);
  const companyRef = React.useRef<{ present: () => void }>(null);

  const remaining = getRemaining();
  const canSendNow = canSend() && isFormValid;

  React.useEffect(() => {
    resetIfNewMonth();
  }, [resetIfNewMonth]);

  React.useEffect(() => {
    if (user?.primaryEmailAddress?.emailAddress) {
      form.setValue('email', user.primaryEmailAddress.emailAddress);
    }
  }, [user, form]);

  const handleSendMessage = () => {
    if (canSendNow) {
      increment();
      onSubmit();
      form.reset({ email });
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white" edges={['top']}>
      <FocusAwareStatusBar />
      <View className="flex-1 pt-6">
        {/* Header */}
        <View className="border-b border-neutral-200 bg-white px-5 pb-4 shadow-sm">
          <Text className="text-3xl font-black text-neutral-900">Outreach</Text>
          <Text className="mb-4 text-base font-medium text-neutral-500">
            Get{' '}
            <Text className="font-semibold text-neutral-700">
              real visibility with employees from the companies you choose
            </Text>
            . Your request is shared in a{' '}
            <Text className="font-semibold text-neutral-700">
              verified WhatsApp group
            </Text>
            , ensuring it reaches the right people. To stay meaningful and
            spam-free,{' '}
            <Text className="font-semibold text-neutral-700">
              up to 3 reviewed requests are allowed each month
            </Text>
            .
          </Text>
        </View>

        <KeyboardAwareScrollView
          alwaysBounceVertical={false}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{
            paddingHorizontal: 20,
            paddingBottom: 24,
            paddingTop: 20,
          }}
          bottomOffset={20}
        >
          {/* Stats Cards */}
          <View className="mb-6 flex-row gap-3">
            <View className="android:shadow-md ios:shadow-sm flex-1 rounded-xl border border-neutral-200 bg-white p-4">
              <View className="mb-2 flex-row items-center gap-2">
                <View className="size-8 items-center justify-center rounded-lg bg-primary-100">
                  <Ionicons name="business-outline" size={16} color="#13803b" />
                </View>
                <Text className="text-xs font-medium text-neutral-500">
                  Companies
                </Text>
              </View>
              <Text className="text-2xl font-bold text-neutral-900">12</Text>
            </View>

            <View className="android:shadow-md ios:shadow-sm flex-1 rounded-xl border border-neutral-200 bg-white p-4">
              <View className="mb-2 flex-row items-center gap-2">
                <View className="size-8 items-center justify-center rounded-lg bg-primary-100">
                  <Ionicons name="people-outline" size={16} color="#13803b" />
                </View>
                <Text className="text-xs font-medium text-neutral-500">
                  Employees & HRs
                </Text>
              </View>
              <Text className="text-2xl font-bold text-neutral-900">85</Text>
            </View>
          </View>

          {/* Form Section */}
          <View>
            <Text className="mb-4 text-xl font-bold text-neutral-900">
              Frame your Message
            </Text>

            <ControlledInputWithRef
              placeholder="Enter your email"
              control={control}
              name="email"
              ref={emailRef}
              returnKeyType="next"
              onSubmitEditing={() => companyRef.current?.present()}
              disabled={remaining === 0}
            />

            <ControlledInputWithRef
              placeholder="Enter Job ID (Optional)"
              control={control}
              name="jobId"
              ref={jobIdRef}
              returnKeyType="next"
              onSubmitEditing={() => resumeLinkRef.current?.focus()}
              disabled={remaining === 0}
            />

            <ControlledInputWithRef
              placeholder="Enter resume link (Optional)"
              control={control}
              name="resumeLink"
              ref={resumeLinkRef}
              returnKeyType="next"
              onSubmitEditing={() => messageRef.current?.focus()}
              disabled={remaining === 0}
            />

            <ControlledInputWithRef
              placeholder="Enter a short message"
              control={control}
              name="message"
              ref={messageRef}
              multiline
              numberOfLines={4}
              returnKeyType="done"
              className="min-h-[120px]"
              disabled={remaining === 0}
            />

            {/* Remaining Count Info */}
            {remaining > 0 ? (
              <View className="mb-4 mt-2 rounded-lg bg-primary-50 px-4 py-3">
                <View className="flex-row items-center gap-2">
                  <Ionicons
                    name="information-circle-outline"
                    size={18}
                    color="#13803b"
                  />
                  <Text className="flex-1 text-sm font-medium text-primary-700">
                    {remaining} request{remaining !== 1 ? 's' : ''} remaining
                    this month
                  </Text>
                </View>
              </View>
            ) : (
              <View className="mb-4 mt-2 rounded-lg bg-neutral-100 px-4 py-3">
                <View className="flex-row items-center gap-2">
                  <Ionicons
                    name="alert-circle-outline"
                    size={18}
                    color="#737373"
                  />
                  <Text className="flex-1 text-sm font-medium text-neutral-600">
                    Monthly limit reached. Requests reset next month.
                  </Text>
                </View>
              </View>
            )}

            <Button
              label={
                remaining > 0 ? `Send Message` : 'Send Message (Limit Reached)'
              }
              onPress={handleSendMessage}
              className="mt-2"
              disabled={!canSendNow}
              size="lg"
            />
          </View>
        </KeyboardAwareScrollView>
      </View>
    </SafeAreaView>
  );
}
