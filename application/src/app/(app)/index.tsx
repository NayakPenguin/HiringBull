import { Ionicons } from '@expo/vector-icons';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, FlatList, View as RNView } from 'react-native';
import { Pressable, ScrollView } from 'react-native';

import { type Job as ApiJob, JobCard } from '@/components/job-card';
import {
  Checkbox,
  FocusAwareStatusBar,
  Input,
  Modal,
  SafeAreaView,
  Text,
  useModal,
  View,
} from '@/components/ui';
import { useFetchFollowedJobs } from '@/features/jobs';
import { BottomToast } from '@/components/BottomToast';
const FILTER_TAGS = [
  'Design',
  'Full time',
  'Senior',
  'C++',
  'React.js',
  'React Native',
  'JavaScript',
  'TypeScript',
  'Python',
  'Java',
  'Remote',
  'Part time',
  'Junior',
  'Lead',
  'UI/UX',
];

export default function Jobs() {
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isFetching,
    refetch,
    isError
  } = useFetchFollowedJobs();


  const [isRefreshing, setIsRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const { ref, present, dismiss } = useModal();
  const [toast, setToast] = useState<{
    message: string;
    type: 'success' | 'error';
  } | null>(null);
  const hasShownToastRef = React.useRef(false);


  useEffect(() => {
    console.log(isFetching)
    if (isFetching && data && !hasShownToastRef.current) {
      hasShownToastRef.current = true;
    }
    if (isError) {
      setToast({
        message: 'Failed to update jobs. Please try again.',
        type: 'error',
      });
      hasShownToastRef.current = false;
    }

    if (!isFetching && hasShownToastRef.current) {
      setToast({
        message: 'Jobs updated successfully',
        type: 'success',
      });
      hasShownToastRef.current = false;
    }
  }, [isFetching]);

  const handleFilterPress = useCallback(() => {
    present();
  }, [present]);

  const handleToggleTag = useCallback((tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  }, []);

  // Pull-to-refresh
  const onRefresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      await refetch();
    } finally {
      setIsRefreshing(false);
    }
  }, [refetch]);

  // Show global loading on initial load
  useEffect(() => {
    if (isLoading) {
      showGlobalLoading();
    } else {
      hideGlobalLoading();
    }
  }, [isLoading]);

  // Flatten all pages
  const allJobs = useMemo(
    () => data?.pages.flatMap((page) => page.data || []) || [],
    [data]
  );

  // Filter jobs by search and selected tags
  const filteredJobs = useMemo(() => {
    return allJobs.filter((job) => {
      if (!job) return false;

      const query = searchQuery.toLowerCase();
      const matchesSearch =
        job.title?.toLowerCase().includes(query) ||
        job.company?.toLowerCase().includes(query);

      if (!matchesSearch) return false;

      if (!selectedTags.length) return true;

      const jobTags = Array.from(new Set(job.tags || []));
      return selectedTags.some((tag) =>
        jobTags.some((jobTag) => jobTag.toLowerCase() === tag.toLowerCase())
      );
    });
  }, [allJobs, searchQuery, selectedTags]);

  // Save job callback
  // Show global loading on initial load
  useEffect(() => {
    if (isLoading) {
      showGlobalLoading();
    } else {
      hideGlobalLoading();
    }
  }, [isLoading]);

  const handleSaveJob = useCallback((jobId: string) => {
    console.log('Save job:', jobId);
  }, []);

  const renderItem = useCallback(
    ({ item }: { item: ApiJob }) => (
      <JobCard job={item} onSave={() => handleSaveJob(item.id)} />
    ),
    [handleSaveJob]
  );

  const renderFooter = useCallback(() => {
    if (isFetchingNextPage) {
      return (
        <RNView className="py-4">
          <Text className="text-center text-sm text-neutral-400">Loading more...</Text>
        </RNView>
      );
    }
    if (!hasNextPage && allJobs.length > 0) {
      return (
        <RNView className="items-center justify-center py-8">
          <Text className="text-sm font-medium text-neutral-400">
            You&apos;ve reached the end of the list
          </Text>
        </RNView>
      );
    }
    return null;
  }, [isFetchingNextPage, hasNextPage, allJobs.length]);

  return (
    <SafeAreaView className="flex-1 bg-white" edges={['top']}>
      <FocusAwareStatusBar />
      <View className="flex-1 pt-6">
        <View className="border-b border-neutral-200 bg-white px-5 pb-4 shadow-sm">
          <Text
            className="text-3xl text-neutral-900"
            style={{ fontFamily: 'Montez' }}
          >
            Explore Jobs
          </Text>
          <Text className="my-4 text-base font-medium text-neutral-500">
            Personalized job openings based on your experience and preferences.
            New roles appear quickly, often within 10 minutes of being posted.
          </Text>
          <View className="mt-2 flex-row items-center gap-2">
            <View className="flex-1">
              <Input
                isSearch
                placeholder="Search Jobs"
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
            </View>

            <Pressable
              onPress={handleFilterPress}
              className="items-center justify-center rounded-xl bg-neutral-900"
              style={{ width: 48, height: 48 }}
            >
              <Ionicons name="options-outline" size={24} color="#ffffff" />
            </Pressable>
          </View>
        </View>

        {!data ? (
          <View className="flex-1" />
        ) : (
          <FlatList
            data={filteredJobs}
            renderItem={renderItem}
            keyExtractor={(item, index) => `${item.id}-${index}`}
            contentContainerStyle={{
              paddingHorizontal: 20,
              paddingBottom: 20,
              paddingTop: 10,
            }}
            refreshing={isRefreshing && !isFetchingNextPage}
            onRefresh={onRefresh}
            showsVerticalScrollIndicator={false}
            onEndReached={() => hasNextPage && fetchNextPage()}
            onEndReachedThreshold={0.5}
            ListEmptyComponent={
              <View className="mt-20 items-center justify-center">
                <Ionicons name="search-outline" size={48} color="#a3a3a3" />
                <Text className="mt-4 text-center text-lg font-medium text-neutral-500">
                  No jobs found
                </Text>
                <Text className="mt-1 text-center text-sm text-neutral-400">
                  Try adjusting your search or filters
                </Text>
              </View>
            }
            ListFooterComponent={renderFooter}
          />
        )}

      </View>


      <Modal
        ref={ref}
        snapPoints={['60%']}
        title="Filter Jobs"
        onDismiss={dismiss}
      >
        <View className="flex-1 px-4 py-2">
          <Text className="mb-4 text-base font-medium text-neutral-700">
            Select tags to filter jobs
          </Text>

          <ScrollView showsVerticalScrollIndicator={false}>
            <View className="flex-row flex-wrap gap-3">
              {FILTER_TAGS.map((tag) => {
                const isSelected = selectedTags.includes(tag);
                return (
                  <Pressable
                    key={tag}
                    onPress={() => handleToggleTag(tag)}
                    className={`rounded-lg border-2 px-4 py-2 ${isSelected
                        ? 'border-primary-500 bg-primary-50'
                        : 'border-neutral-200 bg-white'
                      }`}
                  >
                    <View className="flex-row items-center gap-2">
                      <Checkbox
                        checked={isSelected}
                        onChange={() => handleToggleTag(tag)}
                        accessibilityLabel={`Filter by ${tag}`}
                      />
                      <Text
                        className={`text-sm font-medium ${isSelected ? 'text-primary-700' : 'text-neutral-700'
                          }`}
                      >
                        {tag}
                      </Text>
                    </View>
                  </Pressable>
                );
              })}
            </View>

            {selectedTags.length > 0 && (
              <View className="mt-6 flex-row items-center justify-between">
                <Text className="text-sm text-neutral-600">
                  {selectedTags.length} tag
                  {selectedTags.length !== 1 ? 's' : ''} selected
                </Text>
                <Pressable
                  onPress={() => setSelectedTags([])}
                  className="rounded-lg bg-neutral-100 px-4 py-2"
                >
                  <Text className="text-sm font-medium text-neutral-700">
                    Clear all
                  </Text>
                </Pressable>
              </View>
            )}
          </ScrollView>
        </View>
      </Modal>
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
