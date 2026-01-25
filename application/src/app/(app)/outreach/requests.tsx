import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useEffect } from 'react';
import { useState } from 'react';
import { FlatList, Image, Pressable, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useMyOutreachRequests } from '@/api/outreach/useMyOutreachRequests';
import { FocusAwareStatusBar } from '@/components/ui';
import { hideGlobalLoading, showGlobalLoading } from '@/lib';
type Company = {
  id: string;
  name: string;
  icon: string;
};
const formatDate = (iso?: string) =>
  iso
    ? new Date(iso).toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      })
    : '';

type OutreachRequest = {
  reply: string;
  id: string;
  company: Company;
  sentAt: string;
  status: 'delivered' | 'replied';
  message?: string;
  reason?: string;
};
function SentCard({ item }: { item: OutreachRequest }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <View className="px-4 py-3">
      <View className="flex-row">
        <Image
          source={{ uri: item.company.icon }}
          className="h-14 w-14 rounded-md bg-neutral-200"
        />

        <View className="ml-4 flex-1">
          {/* Top row: Company + Status */}
          <View className="flex-row items-start justify-between">
            <Text className="font-semibold text-lg">{item.company.name}</Text>

            <View className="flex-row items-center gap-1">
              <Ionicons
                name={
                  item.status === 'replied'
                    ? 'checkmark-circle'
                    : 'time-outline'
                }
                size={14}
                color={item.status === 'replied' ? '#16a34a' : '#999'}
              />
              <Text className="text-sm text-neutral-500">
                {item.status === 'replied' ? 'Replied' : 'Delivered'}
              </Text>
            </View>
          </View>

          {/* Date */}
          <Text className="mt-1 text-sm text-neutral-700">
            Sent on {item.sentAt}
          </Text>
          {expanded && (
            <>
              <Text className="mt-1 text-sm text-neutral-700">
                Message: {item.message}
              </Text>
              <Text className="mt-1 text-sm text-neutral-700">
                Reason: {item.reason}
              </Text>
            </>
          )}

          {/* Show more / less */}
          {(item.message || item.reason) && (
            <Pressable onPress={() => setExpanded((p) => !p)} className="mt-2">
              <Text className="text-sm font-medium text-yellow-600">
                {expanded ? 'Show less' : 'Show more'}
              </Text>
            </Pressable>
          )}
        </View>
      </View>
    </View>
  );
}

function ReplyBubble({ message }: { message: string }) {
  return (
    <View className="mx-4 my-3 rounded-xl bg-neutral-100 p-4">
      <Text className="text-lg text-neutral-800">{message}</Text>
    </View>
  );
}

const TABS = ['Sent', 'Replies'] as const;
type Tab = (typeof TABS)[number];
const Request = () => {
  const [activeTab, setActiveTab] = useState<Tab>('Sent');

  const { data, isLoading, isError, refetch, isFetching } =
    useMyOutreachRequests();
  const requests: OutreachRequest[] =
    data?.map((item) => ({
      id: item.id,
      company: {
        id: item.companyName.toLowerCase(),
        name: item.companyName,
        icon: `https://logo.clearbit.com/${item.companyName.toLowerCase()}.com`,
      },
      sentAt: formatDate(item.sentAt || item.createdAt),
      status: item.status === 'REPLIED' ? 'replied' : 'delivered',
      reply: item.reply,
      message: item.message,
      reason: item.reason,
    })) ?? [];
  const repliedRequests = requests.filter((r) => r.status === 'replied');
  // console.log('Outreach Requests:', repliedRequests);
  useEffect(() => {
    if (isLoading) {
      showGlobalLoading();
    } else {
      hideGlobalLoading();
    }

    return () => {
      hideGlobalLoading();
    };
  }, [isLoading]);

  if (isError) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-white px-6">
        <Ionicons name="alert-circle-outline" size={40} color="#dc2626" />
        <Text className="mt-3 text-lg font-semibold text-neutral-900">
          Something went wrong
        </Text>
        <Text className="mt-1 text-center text-neutral-500">
          Unable to load your outreach requests. Please try again.
        </Text>

        <Pressable
          onPress={() => refetch()}
          className="mt-4 rounded-lg bg-neutral-900 px-6 py-3"
        >
          <Text className="font-semibold text-white">Retry</Text>
        </Pressable>
      </SafeAreaView>
    );
  }

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
            data={requests}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => <SentCard item={item} />}
            refreshing={isFetching}
            onRefresh={refetch}
            ItemSeparatorComponent={() => (
              <View className="mx-4 h-[1px] bg-neutral-200" />
            )}
            ListEmptyComponent={
              <Text className="mt-10 text-center text-neutral-400">
                No outreach sent yet
              </Text>
            }
          />
        )}

        {activeTab === 'Replies' && (
          <FlatList
            data={repliedRequests}
            keyExtractor={(item) => item.id}
            refreshing={isFetching}
            onRefresh={refetch}
            renderItem={({ item }) => (
              <View>
                <SentCard item={item} />
                <ReplyBubble message={item?.reply} />
              </View>
            )}
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
