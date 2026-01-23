import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import * as Linking from 'expo-linking';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, FlatList, Image, Pressable } from 'react-native';

import { SocialPost } from '@/api';
import { BottomToast } from '@/components/BottomToast';
import {
  FocusAwareStatusBar,
  Input,
  SafeAreaView,
  Text,
  View,
} from '@/components/ui';
import { useFetchSocialPosts } from '@/features/social-posts';
import { hideGlobalLoading, showGlobalLoading } from '@/lib';
import { formatRelativeTime, formatSegment } from '@/lib/utils';
import { ParsedContent } from '@/utils/ParsedContent';

function SocialPostCard({ post }: { post: SocialPost }) {
  const handleOpenSource = useCallback(() => {
    if (post.source_link) {
      Linking.openURL(post.source_link);
    }
  }, [post.source_link]);

  return (
    <View className="mb-4 rounded-xl border border-neutral-400 bg-white android:shadow-md ios:shadow-sm">
      <View className="relative overflow-hidden p-5">
        {/* Decorative Quote Icon */}
        <View className="absolute -right-4 -top-4 opacity-5">
          <MaterialCommunityIcons
            name="format-quote-close"
            size={80}
            color="black"
          />
        </View>

        <View className="mb-3 flex-row items-center gap-3">
          <View className="size-10 items-center justify-center rounded-full bg-yellow-300 dark:bg-neutral-100">
            <Text className="text-lg font-bold text-neutral-700 dark:text-neutral-300">
              {post.name.charAt(0)}
            </Text>
          </View>
          <View className="flex-1">
            <Text className="text-base font-bold text-neutral-900 dark:text-white">
              {post.name}
            </Text>
            <Text className="text-xs font-medium text-neutral-400">
              {formatRelativeTime(post.created_at)}
            </Text>
          </View>
        </View>

        {post.image_link && (
          <Image
            source={{ uri: post.image_link }}
            resizeMode="cover"
            style={{
              width: '100%',
              height: undefined, // auto height
              aspectRatio: 16 / 9, // stable layout
              borderRadius: 20,
              marginBottom: 16,
            }}
          />
        )}

        <View className="mb-4">
          <ParsedContent text={post.description} />
        </View>

        {/* Segment and Company Tags */}
        {(post.segment || post.company) && (
          <View className="mb-3 flex-row flex-wrap gap-2">
            {post.segment && (
              <View className="rounded-md bg-blue-100 px-2 py-1">
                <Text className="text-xs font-medium text-blue-800">
                  {formatSegment(post.segment)}
                </Text>
              </View>
            )}
            {post.company && (
              <View className="rounded-md bg-green-100 px-2 py-1">
                <Text className="text-xs font-medium text-green-800">
                  {formatSegment(post.company)}
                </Text>
              </View>
            )}
          </View>
        )}

        <View className="mt-2 flex-row flex-wrap items-center gap-2">
          {/* AI Summarized */}
          <Pressable
            onPress={handleOpenSource}
            className="flex-row items-center gap-2 rounded-full border border-blue-100 px-4 py-2 active:opacity-70 dark:border-blue-900/30 dark:bg-blue-900/20"
          >
            <Image
              source={{
                uri: 'https://storage.googleapis.com/gweb-uniblog-publish-prod/images/Gemini_SparkIcon_.width-500.format-webp.webp',
              }}
              style={{ width: 14, height: 14 }}
              resizeMode="contain"
            />
            <Text className="text-xs font-medium text-neutral-500 dark:text-neutral-400">
              AI Summarized
            </Text>
          </Pressable>

          {/* Source */}
          {post.source_link && (
            <Pressable
              onPress={handleOpenSource}
              className="flex-row items-center gap-2 rounded-full border border-blue-100 px-4 py-2 active:opacity-70 dark:border-blue-900/30 dark:bg-blue-900/20"
              style={{ maxWidth: '100%' }}
            >
              <Text
                className="text-xs font-bold text-blue-600 dark:text-blue-400 flex-shrink"
                numberOfLines={1}
              >
                {post.source}
              </Text>
            </Pressable>
          )}
        </View>
      </View>
    </View>
  );
}

export default function SocialPosts() {
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isFetching,
    isLoading,
    refetch,
  } = useFetchSocialPosts();
  const [searchQuery, setSearchQuery] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [toast, setToast] = useState<{
    message: string;
    type: 'success' | 'error';
  } | null>(null);
  const hasShownToastRef = React.useRef(false);

  useEffect(() => {
    console.log(isFetching);
    if (isFetching && data && !hasShownToastRef.current) {
      hasShownToastRef.current = true;
    }

    if (!isFetching && hasShownToastRef.current) {
      setToast({
        message: 'Social posts updated',
        type: 'success',
      });
      hasShownToastRef.current = false;
    }
  }, [isFetching]);

  const onRefresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      await refetch();
    } finally {
      setIsRefreshing(false);
    }
  }, [refetch]);

  const allPosts = useMemo(() => {
    return data?.pages.flatMap((page) => page?.data || []) || [];
  }, [data]);
  const filteredPosts = useMemo(() => {
    if (!searchQuery.trim()) return allPosts;

    const query = searchQuery.toLowerCase();

    return allPosts.filter((post) => {
      return (
        post.name?.toLowerCase().includes(query) ||
        post.description?.toLowerCase().includes(query) ||
        post.company?.toLowerCase().includes(query) ||
        post.segment?.toLowerCase().includes(query)
      );
    });
  }, [allPosts, searchQuery]);

  // Show global loading on initial load
  useEffect(() => {
    if (isLoading) {
      showGlobalLoading();
    } else {
      hideGlobalLoading();
    }
  }, [isLoading]);

  const renderItem = useCallback(({ item }: { item: SocialPost }) => {
    return <SocialPostCard post={item} />;
  }, []);

  const renderFooter = useCallback(() => {
    if (isFetchingNextPage) {
      return (
        <View className="py-4">
          <Text className="text-center text-sm text-neutral-400">
            Loading more...
          </Text>
        </View>
      );
    }
    if (!hasNextPage && allPosts.length > 0) {
      return (
        <View className="py-8 items-center justify-center">
          <Text className="text-sm text-neutral-400 font-medium">
            You've reached the end of the list
          </Text>
        </View>
      );
    }
    return null;
  }, [isFetchingNextPage, hasNextPage, allPosts.length]);

  return (
    <SafeAreaView className="flex-1 bg-white" edges={['top']}>
      <FocusAwareStatusBar />
      <View className="flex-1 pt-6">
        <View className="border-b border-neutral-200 bg-white px-5 pb-4 shadow-sm">
          <Text
            className="text-3xl text-neutral-900"
            style={{ fontFamily: 'Montez' }}
          >
            Social Posts
          </Text>
          <Text className="my-2 text-base font-medium text-neutral-500">
            AI summarized hiring posts from platforms like LinkedIn, X, and
            Reddit. Find relevant opportunities without scrolling through noise.
          </Text>

          <View className="flex-row items-center gap-2 mt-2">
            <View className="flex-1">
              <Input
                isSearch
                placeholder="Search Jobs"
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
            </View>
          </View>
        </View>

        {!data ? (
          <View className="flex-1" />
        ) : (
          <FlatList
            data={filteredPosts}
            renderItem={renderItem}
            keyExtractor={(item) => item.id}
            contentContainerStyle={{
              paddingHorizontal: 20,
              paddingBottom: 20,
              paddingTop: 10,
            }}
            refreshing={isRefreshing}
            onRefresh={onRefresh}
            showsVerticalScrollIndicator={false}
            onEndReached={() => {
              if (hasNextPage && !isFetchingNextPage) {
                fetchNextPage();
              }
            }}
            onEndReachedThreshold={0.5}
            ListEmptyComponent={
              <View className="mt-20 items-center justify-center">
                <Ionicons
                  name="chatbubbles-outline"
                  size={48}
                  color="#a3a3a3"
                />
                <Text className="mt-4 text-center text-lg font-medium text-neutral-500">
                  No social posts found
                </Text>
                <Text className="mt-1 text-center text-sm text-neutral-400">
                  Check back later for new hiring posts
                </Text>
              </View>
            }
            ListFooterComponent={renderFooter}
          />
        )}
      </View>
      {toast && (
        <BottomToast
          message={toast.message}
          type={toast.type}
          visible={!!toast}
          onHide={() => setToast(null)}
        />
      )}
    </SafeAreaView>
  );
}
