import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { useState } from 'react';
import { FlatList, Image, Pressable, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';


import { FocusAwareStatusBar } from '@/components/ui';
type Company = {
  id: string;
  name: string;
  icon: string;
};
const MOCK_REQUESTS: OutreachRequest[] = [
  {
    id: '1',
    company: {
      id: 'c1',
      name: 'Google',
      icon: 'https://logo.clearbit.com/google.com',
    },
    sentAt: '12 Jan 2026',
    status: 'delivered',
  },
  {
    id: '2',
    company: {
      id: 'c2',
      name: 'Netflix',
      icon: 'https://logo.clearbit.com/netflix.com',
    },
    sentAt: '14 Jan 2026',
    status: 'replied',
  },
];

const MOCK_REPLIES = [
  {
    requestId: '2',
    message:
      'Thanks for reaching out! We are reviewing your profile and will get back soon.',
  },
];

type OutreachRequest = {
  id: string;
  company: Company;
  sentAt: string;
  status: 'delivered' | 'replied';
};
function SentCard({ item }: { item: OutreachRequest }) {
  return (
    <View className="flex-row px-4 py-3">
      <Image
        source={{ uri: item.company.icon }}
        className="h-14 w-14 rounded-md bg-neutral-200"
      />

      <View className="ml-4 flex-1">
        <Text className="font-semibold text-lg">{item.company.name}</Text>
        <Text className="text-sm text-neutral-700">Sent on {item.sentAt}</Text>
        <View className="flex-row items-center gap-1 mt-2">
          <Ionicons
            name={
              item.status === 'replied' ? 'checkmark-circle' : 'time-outline'
            }
            size={14}
            color={item.status === 'replied' ? '#16a34a' : '#999'}
          />
          <Text className="text-sm text-neutral-500">
            {item.status === 'replied' ? 'Replied' : 'Delivered'}
          </Text>
        </View>
      </View>
    </View>
  );
}

function ReplyBubble({ message }: { message: string }) {
  return (
    <View className="mx-4 my-3 rounded-xl bg-neutral-100 p-4">
      <Text className="text-lg text-neutral-800">{message}</Text>
      <Text className="mt-2 text-lg text-neutral-500">–Sarah, Recruiter</Text>
    </View>
  );
}

const TABS = ['Sent', 'Replies'] as const;
type Tab = (typeof TABS)[number];
const Request = () => {
  const [activeTab, setActiveTab] = useState<Tab>('Sent');

  const repliedRequests = MOCK_REQUESTS.filter((r) => r.status === 'replied');

  return (
    <SafeAreaView className="flex-1 bg-white">
      <FocusAwareStatusBar />

      {/* Header */}
      <View className="border-neutral-200 px-4 pb-4 pt-6">
        <View className="flex-row items-center">
          <Pressable onPress={() => router.back()}>
            <Ionicons
              name="arrow-back"
              size={24}
              className="mr-4 rounded-md bg-neutral-200 p-1"
            />
          </Pressable>
          <Text className="text-3xl" style={{ fontFamily: 'Montez' }}>
            Outreach Requests
          </Text>
        </View>

        {/* Tabs */}
        <View className="mt-6 flex-row border-b border-neutral-200">
          {TABS.map((tab) => (
            <Pressable
              key={tab}
              onPress={() => setActiveTab(tab)}
              className="flex-1 items-center"
            >
              <Text
                className={`pb-2 text-lg ${
                  activeTab === tab
                    ? 'font-semibold text-black'
                    : 'text-neutral-400'
                }`}
              >
                {tab}
              </Text>
              {activeTab === tab && (
                <View className="h-[3px] w-full bg-yellow-400" />
              )}
            </Pressable>
          ))}
        </View>
      </View>

      {/* Content */}
      <View className="flex-1">
        {activeTab === 'Sent' && (
          <FlatList
            data={MOCK_REQUESTS}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => <SentCard item={item} />}
            ItemSeparatorComponent={() => (
              <View className="mx-4 h-[1px] bg-neutral-200" />
            )}
          />
        )}

        {activeTab === 'Replies' && (
          <FlatList
            data={repliedRequests}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => {
              const reply = MOCK_REPLIES.find((r) => r.requestId === item.id);

              return (
                <View>
                  <SentCard item={item} />
                  {reply && <ReplyBubble message={reply.message} />}
                </View>
              );
            }}
            ItemSeparatorComponent={() => (
              <View className="mx-4 h-[1px] bg-neutral-200" />
            )}
            ListEmptyComponent={
              <Text className="mt-10 text-center text-neutral-400">
                No replies yet
              </Text>
            }
          />
        )}
      </View>
    </SafeAreaView>
  );
};

export default Request;
