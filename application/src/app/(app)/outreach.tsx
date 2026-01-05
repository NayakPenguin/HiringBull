import { useUser } from '@clerk/clerk-expo';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Image, Linking, Pressable, type TextInput } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';

import {
  Button,
  ControlledInput,
  ControlledSelect,
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
  return <ControlledInput control={control} name={name} {...props} ref={ref} />;
});

type Company = {
  id: string;
  name: string;
};

const COMPANIES: Company[] = [
  { id: '1', name: 'Google' },
  { id: '2', name: 'Meta' },
  { id: '3', name: 'Amazon' },
  { id: '4', name: 'Microsoft' },
];

const COMPANY_OPTIONS = [
  { label: 'Adobe', value: 'adobe', icon: 'color-palette' },
  { label: 'Amazon', value: 'amazon', icon: 'basket' },
  { label: 'Apple', value: 'apple', icon: 'logo-apple' },
  { label: 'Atlassian', value: 'atlassian', icon: 'code-slash' },
  { label: 'Google', value: 'google', icon: 'logo-google' },
  { label: 'Meta', value: 'meta', icon: 'logo-facebook' },
  { label: 'Microsoft', value: 'microsoft', icon: 'logo-windows' },
  { label: 'Oracle', value: 'oracle', icon: 'server' },
  { label: 'Salesforce', value: 'salesforce', icon: 'cloud' },
  { label: 'Samsung', value: 'samsung', icon: 'phone-portrait' },
  { label: 'Uber', value: 'uber', icon: 'car' },
  { label: 'Walmart', value: 'walmart', icon: 'storefront' },
];

const REASON_OPTIONS = [
  { label: 'Seeking a Referral', value: 'seeking_a_referral', icon: 'people' },
  {
    label: 'Resume Review / Profile Feedback',
    value: 'resume_review_profile_feedback',
    icon: 'document-text',
  },
  {
    label: 'Preparing for an Upcoming Interview',
    value: 'preparing_for_an_upcoming_interview',
    icon: 'school',
  },
  {
    label: 'Online Assessment (OA) Preparation Guidance',
    value: 'online_assessment_oa_preparation_guidance',
    icon: 'laptop',
  },
  {
    label: 'Understanding the Hiring Process at This Company',
    value: 'understanding_the_hiring_process_at_this_company',
    icon: 'information-circle',
  },
  {
    label: 'Role Fit - Behavioral round prep',
    value: 'role_fit_behavioral_round_prep',
    icon: 'chatbubbles',
  },
  {
    label: 'Clarifying Job Requirements or Tech Stack',
    value: 'clarifying_job_requirements_or_tech_stack',
    icon: 'code-working',
  },
  {
    label: 'Interview Experience & Preparation Tips',
    value: 'interview_experience_preparation_tips',
    icon: 'bulb',
  },
  {
    label: 'Following Up After Applying',
    value: 'following_up_after_applying',
    icon: 'mail',
  },
];

function DiscussionCard({ name }: { name: string }) {
  return (
    <Pressable className="mb-4 flex-row items-center justify-between rounded-xl border border-neutral-200 bg-white p-5 android:shadow-md ios:shadow-sm">
      <View>
        <Text className="text-xs font-bold uppercase tracking-widest text-emerald-600 dark:text-emerald-400">
          Company
        </Text>
        <Text className="text-lg font-bold text-neutral-900 dark:text-white">
          {name}
        </Text>
      </View>
      <View className="size-10 items-center justify-center rounded-full bg-emerald-50 dark:bg-emerald-900/20">
        <Ionicons name="chatbubbles-outline" size={20} color="#10b981" />
      </View>
    </Pressable>
  );
}

export default function Search() {
  const { form, onSubmit } = useOutreachForm();
  const {
    control,
    handleSubmit,
    formState: { errors },
    watch,
  } = form;
  const { user } = useUser();

  const { canSend, getRemaining, increment, resetIfNewMonth } =
    useSendLimitStore();

  // Watch required fields for validation
  const email = watch('email');
  const company = watch('company');
  const reason = watch('reason');
  const message = watch('message');

  // Check if all required fields are filled
  const isFormValid = Boolean(
    email?.trim() && company?.trim() && reason?.trim() && message?.trim()
  );

  const emailRef = React.useRef<TextInput>(null);
  const jobIdRef = React.useRef<TextInput>(null);
  const resumeLinkRef = React.useRef<TextInput>(null);
  const messageRef = React.useRef<TextInput>(null);
  const companyRef = React.useRef<{ present: () => void }>(null);
  const reasonRef = React.useRef<{ present: () => void }>(null);

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
    <SafeAreaView
      className="flex-1 bg-white dark:bg-neutral-950"
      edges={['top']}
    >
      <FocusAwareStatusBar />
      <View className="flex-1 pt-6">
        <View className="flex-row items-center justify-between border-b border-neutral-200 bg-white px-5 pb-4 shadow-sm dark:border-neutral-800 dark:bg-neutral-950">
          <View className="mr-4 flex-1">
            <Text className="text-3xl font-black text-neutral-900 dark:text-white">
              Outreach
            </Text>
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
            <Pressable
              onPress={() => {
                Linking.openURL('https://github.com/NayakPenguin/HiringBull');
              }}
              className="mb-4 self-start flex-row items-center rounded-full border border-neutral-300"
              style={{
                paddingVertical: 5,
                paddingHorizontal: 10,
                backgroundColor: '#fff',
              }}
            >
              <View className="flex-row items-center gap-2">
                <Image
                  source={{
                    uri: 'https://icones.pro/wp-content/uploads/2021/06/icone-github-noir.png',
                  }}
                  style={{ width: 22, height: 22 }}
                  resizeMode="contain"
                />

                <Text
                  style={{
                    fontSize: 11, // ~0.8rem
                    color: 'rgb(19, 128, 59)',
                    fontWeight: '100',
                  }}
                >
                  Contribute to our open-source code on GitHub
                </Text>

                <Text
                  style={{
                    fontSize: 16,
                    color: 'rgb(19, 128, 59)',
                    fontWeight: '100',
                    marginLeft: -6,
                  }}
                >
                  ↗
                </Text>
              </View>
            </Pressable>
          </View>
        </View>

        <KeyboardAwareScrollView
          alwaysBounceVertical={false}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{
            paddingHorizontal: 24,
            paddingBottom: 24,
            paddingTop: 16,
          }}
          bottomOffset={20}
        >
          <View className="mb-3 flex-row gap-2">
            <Pressable
              className="self-start items-center justify-center rounded-xl border border-neutral-200 bg-white android:shadow-md ios:shadow-sm"
              style={{
                paddingVertical: 5,
                paddingHorizontal: 10,
              }}
            >
              <Text
                style={{
                  fontSize: 11,
                  color: 'rgb(19, 128, 59)',
                  fontWeight: '400',
                }}
              >
                12 Companies
              </Text>
            </Pressable>

            <Pressable
              className="self-start items-center justify-center rounded-xl border border-neutral-200 bg-white android:shadow-md ios:shadow-sm"
              style={{
                paddingVertical: 5,
                paddingHorizontal: 10,
              }}
            >
              <Text
                style={{
                  fontSize: 11,
                  color: 'rgb(19, 128, 59)',
                  fontWeight: '400',
                }}
              >
                85 Employees & HRs
              </Text>
            </Pressable>
          </View>

          <View className="mt-6">
            <Text className="mb-4 text-xl font-bold text-neutral-900 dark:text-white">
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

            <ControlledSelect
              placeholder="Select company"
              options={COMPANY_OPTIONS}
              control={control}
              name="company"
              ref={companyRef}
              onValueChange={() => {
                if (!reason) {
                  reasonRef.current?.present();
                }
              }}
              className="border-neutral-300 bg-neutral-100 px-4 py-3 dark:border-neutral-700"
              inputValueClassName="text-neutral-400"
              modalExtraHeight={0}
              optionClassName="flex-row items-center border-b border-neutral-200 bg-white px-5 py-3 dark:border-neutral-700 dark:bg-neutral-800"
              optionTextClassName="flex-1 text-neutral-900 dark:text-neutral-100"
              itemHeight={52}
              disabled={remaining === 0}
            />

            <ControlledSelect
              placeholder="Select reason for outreach"
              options={REASON_OPTIONS}
              control={control}
              name="reason"
              ref={reasonRef}
              onValueChange={() => jobIdRef.current?.focus()}
              className="border-neutral-300 bg-neutral-100 px-4 py-3 dark:border-neutral-700"
              inputValueClassName="text-neutral-400"
              modalExtraHeight={0}
              optionClassName="flex-row items-center border-b border-neutral-200 bg-white px-5 py-3 dark:border-neutral-700 dark:bg-neutral-800"
              optionTextClassName="flex-1 text-neutral-900 dark:text-neutral-100"
              itemHeight={52}
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

            <Button
              label={
                remaining > 0
                  ? `Send Message (${remaining} Left this month)`
                  : 'Send Message (Limit Reached for this month)'
              }
              onPress={handleSendMessage}
              className="mt-4"
              disabled={!canSendNow}
            />
          </View>

          {/* {COMPANIES.map((company) => (
            <DiscussionCard key={company.id} name={company.name} />
          ))} */}
        </KeyboardAwareScrollView>
      </View>
    </SafeAreaView>
  );
}
