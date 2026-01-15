import { Ionicons } from '@expo/vector-icons';
import React, { useCallback, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  ScrollView,
} from 'react-native';

import { type Job as ApiJob } from '@/api/jobs';
import { type Job, JobCard } from '@/components/job-card';
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
import { formatSegment } from '@/lib/utils';

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
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } =
    useFetchFollowedJobs();
  console.log('data', data);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
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

  const handleToggleTag = useCallback((tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  }, []);

  const getJobTags = useCallback((job: ApiJob): string[] => {
    const tags: string[] = [];
    const segment = formatSegment(job.experience_level || job.segment || '');

    // Extract tags from segment
    if (segment.toLowerCase().includes('design')) {
      tags.push('Design');
    }
    if (segment.toLowerCase().includes('senior')) {
      tags.push('Senior');
    }
    if (segment.toLowerCase().includes('junior')) {
      tags.push('Junior');
    }
    if (segment.toLowerCase().includes('lead')) {
      tags.push('Lead');
    }

    // Add job type
    if (job.job_type) {
      const jobType = job.job_type.toLowerCase();
      if (jobType.includes('full time') || jobType.includes('fulltime')) {
        tags.push('Full time');
      }
      if (jobType.includes('part time') || jobType.includes('parttime')) {
        tags.push('Part time');
      }
      if (jobType.includes('remote')) {
        tags.push('Remote');
      }
    }

    // Extract tech stack from title and description
    const titleLower = job.title?.toLowerCase() || '';
    const descriptionLower = job.description?.toLowerCase() || '';
    const combinedText = `${titleLower} ${descriptionLower}`;

    if (
      combinedText.includes('react native') ||
      combinedText.includes('react-native')
    ) {
      tags.push('React Native');
    } else if (
      combinedText.includes('react.js') ||
      combinedText.includes('reactjs')
    ) {
      tags.push('React.js');
    }
    if (combinedText.includes('javascript')) {
      tags.push('JavaScript');
    }
    if (combinedText.includes('typescript')) {
      tags.push('TypeScript');
    }
    if (combinedText.includes('python')) {
      tags.push('Python');
    }
    if (combinedText.includes('java') && !combinedText.includes('javascript')) {
      tags.push('Java');
    }
    if (combinedText.includes('c++') || combinedText.includes('cpp')) {
      tags.push('C++');
    }
    if (
      combinedText.includes('ui/ux') ||
      combinedText.includes('ui ') ||
      combinedText.includes('ux ')
    ) {
      tags.push('UI/UX');
    }

    return tags;
  }, []);

  const filteredJobs = useMemo(() => {
    return allJobs.filter((job) => {
      if (!job) return false;

      // Search filter
      const query = searchQuery.toLowerCase();
      const title = job.title?.toLowerCase() || '';
      const company = job.company?.toLowerCase() || '';
      const matchesSearch = title.includes(query) || company.includes(query);

      // Tag filter
      if (selectedTags.length === 0) {
        return matchesSearch;
      }

      const jobTags = getJobTags(job);
      const matchesTag = selectedTags.some((tag) =>
        jobTags.some((jobTag) => jobTag.toLowerCase() === tag.toLowerCase())
      );

      return matchesSearch && matchesTag;
    });
  }, [allJobs, searchQuery, selectedTags, getJobTags]);

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
      location: apiJob.location || '',
      salary_range: apiJob.salary_range || '',
      job_type: apiJob.job_type || '',
      company_logo: apiJob.companyRel?.logo || '',
    };
  }, []);

  const renderItem = useCallback(
    ({ item }: { item: any }) => (
      <JobCard job={mapJobData(item)} onSave={() => handleSaveJob(item.id)} />
    ),
    [handleSaveJob, mapJobData]
  );

  const renderFooter = useCallback(() => {
    if (isFetchingNextPage) {
      return (
        <View className="py-4">
          <ActivityIndicator size="small" color="#A3A3A3" />
        </View>
      );
    }
    if (!hasNextPage && allJobs.length > 0) {
      return (
        <View className="items-center justify-center py-8">
          <Text className="text-sm font-medium text-neutral-400">
            You&apos;ve reached the end of the list
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
        <View className="border-b border-neutral-200 bg-white px-5 pb-4 shadow-sm">
          <Text className="text-3xl font-black text-neutral-900">
            Explore Jobs
          </Text>
          <Text className="mb-4 text-base font-medium text-neutral-500">
            Personalized job alerts, delivered fast, so you get noticed before
            everyone else.
          </Text>

          <View className="flex-row items-center gap-2">
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
              style={{
                width: 48,
                height: 48,
              }}
            >
              <Ionicons name="options-outline" size={24} color="#ffffff" />
            </Pressable>
          </View>
        </View>

        {isLoading || !data ? (
          <View className="flex-1 items-center justify-center pt-20">
            <ActivityIndicator size="large" color="#A3A3A3" />
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
                    className={`rounded-lg border-2 px-4 py-2 ${
                      isSelected
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
                        className={`text-sm font-medium ${
                          isSelected ? 'text-primary-700' : 'text-neutral-700'
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
    </SafeAreaView>
  );
}
