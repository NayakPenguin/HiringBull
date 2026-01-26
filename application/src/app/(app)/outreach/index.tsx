import { useUser } from '@clerk/clerk-expo';
import { Ionicons } from '@expo/vector-icons';
import { type BottomSheetModal } from '@gorhom/bottom-sheet';
import { BottomSheetScrollView } from '@gorhom/bottom-sheet';
import { router } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import { FlatList, Image, Pressable, type TextInput } from 'react-native';

import { useSendOutreach } from '@/api/outreach/useSendOutreach';
import {
  Button,
  ControlledInput,
  FocusAwareStatusBar,
  Input,
  Modal,
  SafeAreaView,
  Text,
  View,
} from '@/components/ui';
import { useOnboarding } from '@/lib';
import { useOutreachForm } from '@/lib/hooks/use-outreach-form';
import { showToast } from '@/lib/toast';
import { useMyProfile } from '@/api/outreach/useUserInfo';
import { useQueryClient } from '@tanstack/react-query';

type Company = {
  id: string;
  name: string;
  icon: any;
};

export const COMPANIES: Company[] = [
  {
    id: 'google',
    name: 'Google',
    icon: 'https://hiringbull-images.s3.ap-south-1.amazonaws.com/google.png',
  },
  {
    id: 'amazon',
    name: 'Amazon',
    icon: 'https://hiringbull-images.s3.ap-south-1.amazonaws.com/amazon.png',
  },
  {
    id: 'microsoft',
    name: 'Microsoft',
    icon: 'https://hiringbull-images.s3.ap-south-1.amazonaws.com/microsoft.png',
  },
  {
    id: 'salesforce',
    name: 'Salesforce',
    icon: 'https://hiringbull-images.s3.ap-south-1.amazonaws.com/salesforce.png',
  },
  {
    id: 'samsung',
    name: 'Samsung',
    icon: 'https://hiringbull-images.s3.ap-south-1.amazonaws.com/samsung.jpeg',
  },
  {
    id: 'oracle',
    name: 'Oracle',
    icon: 'https://cabinetm-beta.s3.amazonaws.com/00000175-f643-6db2-8d63-54349eb41198.jpg',
  },
  {
    id: 'swiggy',
    name: 'Swiggy',
    icon: 'https://hiringbull-images.s3.ap-south-1.amazonaws.com/swiggy.png',
  },
  {
    id: 'nvidia',
    name: 'NVIDIA',
    icon: 'https://hiringbull-images.s3.ap-south-1.amazonaws.com/nvidia.png',
  },
];

const ControlledInputWithRef = React.forwardRef<TextInput, any>(
  ({ control, name, ...props }, ref) => {
    return (
      <View className="mb-4">
        <ControlledInput ref={ref} control={control} name={name} {...props} />
      </View>
    );
  }
);
function CompanyCard({
  company,
  selected,
  onPress,
}: {
  company: Company;
  selected: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      className={`relative aspect-square w-[22%] items-center justify-center rounded-xl border bg-white android:shadow-sm ios:shadow-sm ${
        selected ? 'border-primary-600' : 'border-neutral-200'
      }`}
    >
      {selected && (
        <View className="absolute -right-2 -top-2 size-6 items-center justify-center rounded-full bg-primary-600">
          <Ionicons name="checkmark" size={14} color="white" />
        </View>
      )}

      <Image
        source={{ uri: company.icon }}
        className="size-10"
        resizeMode="contain"
      />
    </Pressable>
  );
}

export default function Outreach() {
  const { user } = useUser();
  const queryClient = useQueryClient();

  const { form } = useOutreachForm();
  const { control, watch, setValue, reset } = form;
  const { data } = useMyProfile();


  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);

  const remaining = data?.tokens_left;

  const email = watch('email');
  const message = watch('message');
  const isFormValid = Boolean(email?.trim() && message?.trim());
  const canSendNow = remaining && isFormValid;

  const messageRef = useRef<TextInput>(null);
  const { mutate: sendOutreach, isPending } = useSendOutreach();

  useEffect(() => {
    if (user?.primaryEmailAddress?.emailAddress) {
      setValue('email', user.primaryEmailAddress.emailAddress);
    }
  }, [user]);

  useEffect(() => {
    if (selectedCompany) {
      setValue('company', selectedCompany.id);
    }
  }, [selectedCompany]);
  const modalRef = useRef<BottomSheetModal>(null);
  const handleSend = () => {
    if (!canSendNow || !selectedCompany) return;

    const values = form.getValues();
    console.log('Sending outreach with values:', values);

    sendOutreach(
      {
        email: values.email,
        companyName: selectedCompany.name,
        reason: values.reason,
        message: values.message,
      },
      {
        onSuccess: (res) => {
          queryClient.invalidateQueries({
            queryKey: ['users', 'me'],
          });
          queryClient.invalidateQueries({
            queryKey: ['outreach', 'me'],
          });

          reset({ email }); // reset form except email
          modalRef.current?.dismiss();
          showToast({
            type: 'success',
            message:
              'Outreach sent successfully. Your message has been delivered to the company network.',
          });

          router.push('/outreach/requests');
          console.log('Outreach sent successfully', res);
        },
        onError: (error) => {
          console.log('Outreach failed:', error.response?.data);
          const apiMessage =
            error.response?.data?.error ||
            'Failed to send outreach. Please try again.';

          showToast({
            type: 'error',
            message: apiMessage,
          });
        },
      }
    );
  };

  const filteredCompanies = COMPANIES.filter((c) =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <SafeAreaView className="flex-1 bg-white">
      <FocusAwareStatusBar />

      {/* HEADER */}
      <View className="border-b border-neutral-200 px-5 pb-4 pt-6">
        <Text className="text-3xl" style={{ fontFamily: 'Montez' }}>
          Outreach
        </Text>

        <Text className="mt-2 text-base text-neutral-500">
          Reach employees, we send it to WhatsApp groups with company employees.
        </Text>

        <View className="mt-4">
          <Input
            isSearch
            placeholder="Search Companies"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      {/* CONTENT */}
      <View className="flex-1 bg-slate-50 pt-4">
        {remaining === 0 ? (
          <View className="mb-3 ml-4 flex-row items-center">
            <View className="flex-row items-center gap-2 rounded-full bg-neutral-200 px-3 py-1.5">
              <Ionicons name="lock-closed" size={14} color="#555" />
              <Text className="text-sm font-medium text-neutral-600">
                Tokens expired for this month
              </Text>
            </View>
          </View>
        ) : (
          <View className="mb-3 ml-4 flex-row items-center">
            <View className="flex-row items-center gap-2 rounded-full bg-yellow-100 px-3 py-1.5">
              <View className="size-6 items-center justify-center rounded-full bg-yellow-400">
                <Ionicons name="flash" size={14} color="#000" />
              </View>
              <Text className="text-sm font-semibold text-yellow-900">
                <Text className="font-bold">{remaining}</Text> Outreach Left
              </Text>
            </View>
          </View>
        )}

        <FlatList
          data={filteredCompanies}
          numColumns={4}
          columnWrapperStyle={{ gap: 12, justifyContent: 'flex-start' }}
          contentContainerStyle={{
            gap: 12,
            padding: 12,
          }}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <CompanyCard
              company={item}
              selected={selectedCompany?.id === item.id}
              onPress={() => {
                setSelectedCompany(item);
              }}
            />
          )}
          ListFooterComponent={() => (
            <View>
              <View className="self-start mt-2">
                <Pressable
                  onPress={() => router.push('/outreach/requests')}
                  className="flex-row items-center gap-2 bg-neutral-900 rounded-xl px-4 py-2"
                >
                  <Text className="font-medium text-white">
                    Outreach & Replies
                  </Text>
                  <Ionicons name="arrow-forward" size={16} color="white" />
                </Pressable>
              </View>
            </View>
          )}
        />
        <View className="m-4 flex-row items-center rounded-lg bg-neutral-200 p-1">
          <Ionicons name="information-circle" size={20} className="mr-2" />
          <Text className="text-sm text-neutral-500">
            3 outreach credits per month, reset monthly
          </Text>
        </View>
        {remaining !== 0 && (
          <View className="mt-2 px-4">
            <Button
              label={
                selectedCompany
                  ? `Draft message to ${selectedCompany.name} Network`
                  : 'Select a company to draft message'
              }
              disabled={!selectedCompany || remaining === 0}
              onPress={() => modalRef.current?.present()}
            />
          </View>
        )}
      </View>

      {/* MODAL */}
      <Modal
        ref={modalRef}
        snapPoints={['70%']}
        keyboardBehavior="interactive"
        keyboardBlurBehavior="restore"
      >
        <BottomSheetScrollView
          contentContainerStyle={{ padding: 20 }}
          keyboardShouldPersistTaps="handled"
        >
          <Text className="mb-1 text-xl font-bold">
            Message {selectedCompany?.name}
          </Text>

          <Text className="mb-4 text-sm text-neutral-500">
            This message will be sent to employees & HRs
          </Text>

          <ControlledInputWithRef
            placeholder="Your Email"
            control={control}
            name="email"
            disabled={remaining === 0}
          />

          <ControlledInputWithRef
            placeholder="Job ID (Optional)"
            control={control}
            name="jobId"
            disabled={remaining === 0}
          />

          <ControlledInputWithRef
            placeholder="Resume Link (Optional)"
            control={control}
            name="resumeLink"
            disabled={remaining === 0}
          />
          <ControlledInputWithRef
            placeholder="Reason"
            control={control}
            name="reason"
            disabled={remaining === 0}
          />

          <ControlledInputWithRef
            placeholder="Write your message"
            control={control}
            name="message"
            multiline
            numberOfLines={4}
            className="min-h-[120px]"
            ref={messageRef}
            disabled={remaining === 0}
          />

          <Button
            label={isPending ? 'Sending...' : 'Send Message'}
            disabled={!canSendNow || isPending}
            onPress={handleSend}
            className="mt-4"
          />
        </BottomSheetScrollView>
      </Modal>
    </SafeAreaView>
  );
}
