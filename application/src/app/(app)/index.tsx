import { Ionicons } from '@expo/vector-icons';
import React, { useCallback, useState, useMemo, useEffect } from 'react';
import { Pressable, Image, Linking, FlatList, ActivityIndicator } from 'react-native';

import { type Job, JobCard } from '@/components/job-card';
import { useFetchFollowedJobs } from '@/features/jobs';
import { type Job as ApiJob } from '@/api/jobs'; // Import API Job type
import {
  FocusAwareStatusBar,
  Input,
  Modal,
  SafeAreaView,
  ScrollView,
  Text,
  useModal,
  View,
} from '@/components/ui';
import { useAuth } from '@clerk/clerk-expo';
import { router } from 'expo-router';
import { formatSegment } from '@/lib/utils';



export default function Jobs() {
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
  } = useFetchFollowedJobs();

  const [searchQuery, setSearchQuery] = useState('');
  const { ref, present, dismiss } = useModal();

  const allJobs = useMemo(() => {
    return data?.pages.flatMap((page) => page?.data || []) || [];
  }, [data]);

  const handleSaveJob = useCallback((jobId: string) => {
    // TODO: Implement save job functionality
    console.log('Save job:', jobId);
  }, []);

  const handleFilterPress = useCallback(() => {
    present();
  }, [present]);

  const filteredJobs = useMemo(() => {
    return allJobs.filter((job) => {
      if (!job) return false;
      const query = searchQuery.toLowerCase();
      const title = job.title?.toLowerCase() || '';
      const company = job.company?.toLowerCase() || '';
      return title.includes(query) || company.includes(query);
    });
  }, [allJobs, searchQuery]);

  // Map API job to UI Job type
  const mapJobData = useCallback((apiJob: ApiJob): Job => {
    return {
      id: apiJob.id,
      company: apiJob.company,
      segment: formatSegment(apiJob.experience_level || apiJob.segment),
      title: apiJob.title,
      careerpage_link: apiJob.apply_link,
      company_id: apiJob.companyId,
      created_at: apiJob.posted_date || apiJob.created_at,
      created_by: null,
      isSaved: false,
      company_type: apiJob.company_type || 'TECH_GIANT',
    };
  }, []);

  const renderItem = useCallback(({ item }: { item: any }) => {
    return <JobCard job={mapJobData(item)} onSave={() => handleSaveJob(item.id)} />;
  }, [handleSaveJob, mapJobData]);


  const renderFooter = useCallback(() => {
    if (isFetchingNextPage) {
      return (
        <View className="py-4">
          <ActivityIndicator size="small" color="#0000ff" />
        </View>
      );
    }
    if (!hasNextPage && allJobs.length > 0) {
      return (
        <View className="py-8 items-center justify-center">
          <Text className="text-sm text-neutral-400 font-medium">
            You've reached the end of the list
          </Text>
        </View>
      );
    }
    return null;
  }, [isFetchingNextPage, hasNextPage, allJobs.length]);

  return (
    <SafeAreaView className="flex-1 bg-white" edges={['top']}>
      <FocusAwareStatusBar />
      <View className="flex-1 pt-6">
        <View className="px-5 pb-4 border-b border-neutral-200 shadow-sm bg-white">
          <Text className="text-3xl font-black text-neutral-900">
            Explore Jobs
          </Text>
          <Text className="mb-4 text-base font-medium text-neutral-500">
            We curate jobs based on your experience and the companies you care
            about,
            <Text className="font-semibold text-neutral-700">
              notify you within 10 minutes of an opening{' '}
            </Text>
            so you can apply early. Our goal is simple,{' '}
            <Text className="font-semibold text-neutral-700">
              help you get seen before the crowd{' '}
            </Text> without noise or spam.
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

          <Input 
          isSearch
          placeholder="Search jobs..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          />
        </View>

        {(isLoading || !data) ? (
          <View className="flex-1 items-center justify-center pt-20">
            <ActivityIndicator size="large" color="#0000ff" />
          </View>
        ) : (
          <FlatList
            data={filteredJobs}
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
            ListHeaderComponent={
              <View className="mb-3 flex-row gap-2">
                <Pressable
                  onPress={() => router.push('/edit-companies')}
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
                    Edit your companies
                  </Text>
                </Pressable>

                <Pressable
                  onPress={() => router.push('/edit-experience')}
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
                   Edit your experience
                  </Text>
                </Pressable>
              </View>
            }
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
        snapPoints={['50%']}
        title="Filter Jobs"
        onDismiss={dismiss}
      >
        <View className="flex-1 px-4 py-2">
          <Text className="text-base text-neutral-600">
            Filters will appear here.
          </Text>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
