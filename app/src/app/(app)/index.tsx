import { Ionicons } from '@expo/vector-icons';
import { BottomSheetScrollView } from '@gorhom/bottom-sheet';
import { useColorScheme } from 'nativewind';
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  Animated,
  Easing,
  FlatList,
  Pressable,
  View as RNView,
} from 'react-native';

import { BottomToast } from '@/components/BottomToast';
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
import { hideGlobalLoading, showGlobalLoading } from '@/lib';
const FILTER_TAGS = [
  // Programming Languages
  'Java',
  'Python',
  'JavaScript',
  'TypeScript',
  'C++',
  'C',
  'Go',

  // Frontend
  'React',
  'Angular',
  'Vue.js',
  'HTML',
  'CSS',

  // Backend Frameworks
  'Node.js',
  'Express.js',
  'Spring Boot',
  'Django',
  'Flask',

  // Databases
  'SQL',
  'PostgreSQL',
  'MySQL',
  'MongoDB',
  'Redis',

  // APIs & Architecture
  'REST APIs',
  'GraphQL',
  'Microservices',

  // Cloud & DevOps
  'AWS',
  'GCP',
  'Azure',
  'Docker',
  'Kubernetes',

  // Engineering Fundamentals
  'Git',
  'Linux',
  'CI/CD',
  'System Design',
];
export default function Jobs() {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isFetching,
    refetch,
    isError,
  } = useFetchFollowedJobs();

  // Blinking animation for Live Jobs indicator
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 0.3,
          duration: 800,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 800,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    );
    pulse.start();
    return () => pulse.stop();
  }, [pulseAnim]);

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
    () =>
      (data?.pages ?? []).flatMap(
        (page) => (page as { data: ApiJob[] })?.data ?? []
      ),
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

      // Filter by tags
      const jobTags: string[] = Array.from(new Set(job.tags ?? []));
      return selectedTags.some((tag) =>
        jobTags.some(
          (jobTag: string) => jobTag.toLowerCase() === tag.toLowerCase()
        )
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
  const JobsListHeader = ({
    total,
    selectedTags,
    onClear,
  }: {
    total: number;
    selectedTags: string[];
    onClear: () => void;
  }) => {
    return (
      <View className="mb-3">
        <View className="flex-row items-center justify-between">
          <Text className="mt-2 text-base leading-relaxed text-neutral-500 dark:text-neutral-400">
            {total} jobs found in last 30 days
          </Text>

          {selectedTags.length > 0 && (
            <Pressable onPress={onClear}>
              <Text className="text-sm font-semibold text-red-600">
                Clear filters
              </Text>
            </Pressable>
          )}
        </View>
      </View>
    );
  };

  const handleSaveJob = useCallback((_jobId: string) => {
    // TODO: implement save job
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
          <Text className="text-center text-sm text-neutral-400">
            Loading more...
          </Text>
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
    <SafeAreaView
      edges={['top']}
      className="flex-1 bg-white dark:bg-neutral-950"
    >
      <FocusAwareStatusBar />
      <View className="flex-1 bg-slate-50 dark:bg-neutral-950">
        {/* ============ HEADER SECTION ============ */}
        <View className="bg-white px-5 pb-5 pt-6 shadow-sm dark:bg-neutral-950">
          {/* Title Row */}
          <View className="flex-row items-center">
            <Text
              className="text-3xl text-neutral-900 dark:text-white"
              style={{ fontFamily: 'Montez' }}
            >
              Explore Jobs
            </Text>

            {/* Live Jobs Status Indicator */}
            <View className="ml-2 flex-row items-center gap-2 rounded-full bg-green-100 px-3 py-1.5 dark:bg-green-900/40">
              <Text className="text-xs font-medium text-neutral-600 dark:text-green-200">
                Live Jobs
              </Text>
              <Animated.View
                style={{ opacity: pulseAnim }}
                className="size-2 rounded-full bg-green-500"
              />
            </View>
          </View>

          {/* Description */}
          <Text className="mt-2 text-base leading-relaxed text-neutral-500 dark:text-neutral-400">
            Job openings get notified based on your experience and preferences.
            {/* New roles appear quickly, often within 10 minutes of being posted. */}
          </Text>

          {/* Search Bar - Pill Style */}
          <View className="mt-4 flex-row items-center gap-3">
            <View className="flex-1">
              <Input
                isSearch
                placeholder="Search jobs, companies..."
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
            </View>
            <Pressable
              onPress={handleFilterPress}
              className="size-12 items-center justify-center rounded-full bg-neutral-900 dark:bg-white"
            >
              <Ionicons
                name="options-outline"
                size={20}
                color={isDark ? '#171717' : '#ffffff'}
              />
            </Pressable>
          </View>

          {/* Edit Navigation Buttons */}
          {/* <View className="mt-4 flex-row gap-3">
            <Pressable
              onPress={() => router.push('/edit-companies')}
              className="flex-row items-center gap-2 rounded-full border border-neutral-200 bg-white px-4 py-2.5"
            >
              <Text className="text-sm font-medium text-neutral-700">
                Edit Companies
              </Text>
            </Pressable>
            <Pressable
              onPress={() => router.push('/edit-experience')}
              className="flex-row items-center gap-2 rounded-full border border-neutral-200 bg-white px-4 py-2.5"
            >
              <Text className="text-sm font-medium text-neutral-700">
                Edit Experience
              </Text>
            </Pressable>
          </View> */}
        </View>

        {/* ============ JOB LIST ============ */}
        {!data ? (
          <View className="flex-1 bg-slate-50 dark:bg-neutral-950" />
        ) : (
          <FlatList
            data={filteredJobs}
            renderItem={renderItem}
            keyExtractor={(item, index) => `${item.id}-${index}`}
            className="bg-slate-50 dark:bg-neutral-950"
            contentContainerStyle={{
              paddingHorizontal: 20,
              paddingBottom: 20,
              paddingTop: 10,
            }}
            ListHeaderComponent={
              <JobsListHeader
                total={filteredJobs.length}
                selectedTags={selectedTags}
                onClear={() => setSelectedTags([])}
              />
            }
            refreshing={isRefreshing && !isFetchingNextPage}
            onRefresh={onRefresh}
            showsVerticalScrollIndicator={false}
            onEndReached={() => hasNextPage && fetchNextPage()}
            onEndReachedThreshold={0.5}
            ListEmptyComponent={
              <View className="mt-20 items-center justify-center">
                <Ionicons name="search-outline" size={48} color="#a3a3a3" />
                <Text className="mt-4 text-center text-lg font-medium text-neutral-500 dark:text-neutral-300">
                  No jobs found
                </Text>
                <Text className="mt-1 text-center text-sm text-neutral-400 dark:text-neutral-500">
                  Try adjusting your search or filters
                </Text>
              </View>
            }
            ListFooterComponent={filteredJobs?.length > 0 ? renderFooter : null}
          />
        )}
      </View>

      <Modal
        ref={ref}
        snapPoints={['60%']}
        title="Filter Jobs"
        onDismiss={dismiss}
      >
        <View className="px-4 py-2" style={{ flex: 1 }}>
          <Text className="mb-4 text-base font-medium text-neutral-700 dark:text-neutral-200">
            Select tags to filter jobs
          </Text>

          <BottomSheetScrollView
            contentContainerStyle={{
              paddingBottom: 24,
            }}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="always"
          >
            <View className="flex-row flex-wrap gap-3">
              {FILTER_TAGS.map((tag) => {
                const isSelected = selectedTags.includes(tag);
                return (
                  <Pressable
                    key={tag}
                    onPress={() => handleToggleTag(tag)}
                    className={`rounded-lg border-2 px-4 py-2 ${
                      isSelected
                        ? 'border-primary-500 bg-primary-50 dark:border-white dark:bg-neutral-800'
                        : 'border-neutral-200 bg-white dark:border-neutral-700 dark:bg-neutral-900'
                    }`}
                  >
                    <View className="flex-row items-center gap-2">
                      <Checkbox
                        checked={isSelected}
                        onChange={() => handleToggleTag(tag)}
                        accessibilityLabel={''}
                      />
                      <Text
                        className={`text-sm font-medium ${
                          isSelected
                            ? 'text-primary-700 dark:text-white'
                            : 'text-neutral-700 dark:text-neutral-300'
                        }`}
                      >
                        {tag}
                      </Text>
                    </View>
                  </Pressable>
                );
              })}
            </View>
          </BottomSheetScrollView>

          {/* STICKY FOOTER */}
          {selectedTags.length > 0 && (
            <View className="border-t border-neutral-200 pt-4 dark:border-neutral-800">
              <View className="flex-row items-center justify-between">
                <Text className="text-sm text-neutral-600 dark:text-neutral-300">
                  {selectedTags.length} tag
                  {selectedTags.length !== 1 ? 's' : ''} selected
                </Text>
                <Pressable
                  onPress={() => setSelectedTags([])}
                  className="rounded-lg bg-neutral-100 px-4 py-2 dark:bg-neutral-800"
                >
                  <Text className="text-sm font-medium text-neutral-700 dark:text-neutral-200">
                    Clear all
                  </Text>
                </Pressable>
              </View>
            </View>
          )}
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
