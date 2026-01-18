import { useUser } from '@clerk/clerk-expo';
import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useRef, useState } from 'react';
import { FlatList, Image, Pressable, TextInput } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';

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
import { useOutreachForm } from '@/lib/hooks/use-outreach-form';
import { useSendLimitStore } from '@/lib/stores/send-limit-store';

type Company = {
  id: string;
  name: string;
  icon: any;
};

const COMPANIES: Company[] = [
  {
    id: 'amazon',
    name: 'Amazon',
    icon: require('../../../assets/images/experience/five-plus.jpeg'),
  },
  {
    id: 'chatgpt',
    name: 'Chatgpt',
    icon: require('../../../assets/images/experience/chat-gpt.png'),
  },
  {
    id: 'twitter',
    name: 'Twitter',
    icon: require('../../../assets/images/experience/twitter.png'),
  },
  {
    id: 'microsoft',
    name: 'Microsoft',
    icon: require('../../../assets/images/experience/microsoft.png'),
  },
  {
    id: 'paypal',
    name: 'Paypal',
    icon: require('../../../assets/images/experience/paypal.png'),
  },
  {
    id: 'apple',
    name: 'Apple',
    icon: require('../../../assets/images/experience/apple.png'),
  },
  {
    id: 'uber',
    name: 'Uber',
    icon: require('../../../assets/images/experience/uber.png'),
  },
  {
    id: 'nike',
    name: 'Nike',
    icon: require('../../../assets/images/experience/nike.png'),
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
      className={`relative aspect-square flex-1 items-center justify-center rounded-xl border bg-white ${selected ? 'border-primary-600' : 'border-neutral-200'
        }`}
    >
      {selected && (
        <View className="absolute -right-2 -top-2 size-6 items-center justify-center rounded-full bg-primary-600">
          <Ionicons name="checkmark" size={14} color="white" />
        </View>
      )}

      <Image source={company.icon} className="size-10" resizeMode="contain" />
    </Pressable>
  );
}
export default function Outreach() {
  const { user } = useUser();
  const { form, onSubmit } = useOutreachForm();
  const { control, watch, setValue, reset } = form;

  const { canSend, getRemaining, increment, resetIfNewMonth } =
    useSendLimitStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const remaining = getRemaining();

  const email = watch('email');
  const message = watch('message');
  const isFormValid = Boolean(email?.trim() && message?.trim());
  const canSendNow = canSend() && isFormValid;

  const messageRef = useRef<TextInput>(null);

  useEffect(() => {
    resetIfNewMonth();
  }, [resetIfNewMonth]);

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
  const modalRef = useRef<{ present: () => void; dismiss: () => void }>(null);
  const handleSend = () => {
    if (!canSendNow) return;

    increment();
    onSubmit();
    reset({ email });
    modalRef.current?.dismiss();
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
          Reach employees from your target companies through verified WhatsApp
          groups. To keep it spam free, up to 3 reviewed requests are allowed
          each month.
        </Text>

        <View className="mt-4">
          <Input
            isSearch
            placeholder="Search companies"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      {/* CONTENT */}
      <View className="flex-1 pt-4">
        <View className="mb-3 flex-row items-center gap-2">
          <View className="rounded-full bg-yellow-400 px-3 py-1">
            <Text className="text-sm font-semibold">
              {remaining} Outreach Left
            </Text>
          </View>
        </View>

        <FlatList
          data={filteredCompanies}
          numColumns={4}
          columnWrapperStyle={{ gap: 12 }}
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
                modalRef.current?.present();
              }}
            />
          )}
        />
        <View className="flex-row items-center rounded-lg bg-neutral-200 p-1 m-4">
          <Ionicons name="information-circle" size={20} className="mr-2" />
          <Text className="text-neutral-500">
            3 outreach credits per month, reset monthly
          </Text>
        </View>
      </View>

      {/* MODAL */}
      <Modal
        ref={modalRef}
        snapPoints={['70%']}
        onClose={() => setIsModalOpen(false)}
      >
        <KeyboardAwareScrollView
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{ padding: 20 }}
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
            label="Send Message"
            disabled={!canSendNow}
            onPress={handleSend}
            className="mt-4"
          />
        </KeyboardAwareScrollView>
      </Modal>
    </SafeAreaView>
  );
}
