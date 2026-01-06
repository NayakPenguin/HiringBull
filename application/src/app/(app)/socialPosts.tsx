import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import * as Linking from 'expo-linking';
import React, { useCallback, useMemo } from 'react';
import { Pressable, Image, FlatList, ActivityIndicator } from 'react-native';

import {
  FocusAwareStatusBar,
  SafeAreaView,
  Text,
  View,
} from '@/components/ui';
import { formatRelativeTime, formatSegment } from '@/lib/utils';
import { useFetchSocialPosts } from '@/features/social-posts';
import { SocialPost } from '@/api';

function SocialPostCard({ post }: { post: SocialPost }) {
  const handleOpenSource = useCallback(() => {
    if (post.source_link) {
      Linking.openURL(post.source_link);
    }
  }, [post.source_link]);

  return (
    <View className="mb-4 rounded-xl border border-neutral-200 bg-white android:shadow-md ios:shadow-sm">
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
          <View className="size-10 items-center justify-center rounded-full bg-neutral-100 dark:bg-neutral-800">
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

        <Text className="mb-4 text-base leading-7 text-neutral-600 dark:text-neutral-300">
          {post.description}
        </Text>

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
              <Ionicons name="link" size={14} />
              <Text className="text-xs font-medium text-neutral-500 dark:text-neutral-400">
                Source
              </Text>
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
    isLoading,
  } = useFetchSocialPosts();

  const allPosts = useMemo(() => {
    return data?.pages.flatMap((page) => page?.data || []) || [];
  }, [data]);

  const renderItem = useCallback(({ item }: { item: SocialPost }) => {
    return <SocialPostCard post={item} />;
  }, []);

  const renderFooter = useCallback(() => {
    if (isFetchingNextPage) {
      return (
        <View className="py-4">
          <ActivityIndicator size="small" color="#0000ff" />
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
    <SafeAreaView
      className="flex-1 bg-white dark:bg-neutral-950"
      edges={['top']}
    >
      <FocusAwareStatusBar />
      <View className="flex-1 pt-6">
        <View className="flex-row items-center justify-between px-5 pb-4 border-b border-neutral-200 shadow-sm bg-white dark:bg-neutral-950 dark:border-neutral-800">
          <View className="mr-4 flex-1">
            <Text className="text-3xl font-black text-neutral-900 dark:text-white">
              Social posts
            </Text>
            <Text className="mb-4 text-base font-medium text-neutral-500">
              We surface{' '}
              <Text className="font-semibold text-neutral-700">
                hiring posts that usually get buried in feeds
              </Text>
              , including updates shared by{' '}
              <Text className="font-semibold text-neutral-700">
                employees, founders of YC-backed companies and HR
              </Text>
              . You'll also see{' '}
              <Text className="font-semibold text-neutral-700">
                posts asking candidates to fill hiring interest forms
              </Text>
              , all curated in one place so you can{' '}
              <Text className="font-semibold text-neutral-700">
                respond faster and with context
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

        {(isLoading || !data) ? (
          <View className="flex-1 items-center justify-center pt-20">
            <ActivityIndicator size="large" color="#0000ff" />
          </View>
        ) : (
          <FlatList
            data={allPosts}
            renderItem={renderItem}
            keyExtractor={(item) => item.id}
            contentContainerStyle={{
              paddingHorizontal: 20,
              paddingBottom: 20,
              paddingTop: 10,
            }}
            showsVerticalScrollIndicator={false}
            onEndReached={() => {
              if (hasNextPage) {
                fetchNextPage();
              }
            }}
            onEndReachedThreshold={0.5}
            // Filter chips - commented out for now
            // ListHeaderComponent={
            //   <View className="mb-3 flex-row gap-2">
            //     <Pressable className="...">
            //       <Text>All Companies</Text>
            //     </Pressable>
            //     <Pressable className="...">
            //       <Text>All Levels</Text>
            //     </Pressable>
            //   </View>
            // }
            ListEmptyComponent={
              <View className="mt-20 items-center justify-center">
                <Ionicons name="chatbubbles-outline" size={48} color="#a3a3a3" />
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
    </SafeAreaView>
  );
}
