import { Ionicons,Feather } from '@expo/vector-icons';
import React, { useState, useCallback, useMemo } from 'react';
import { Linking, Pressable } from 'react-native';

import { Image, Text, View } from '@/components/ui';
import { formatRelativeTime } from '@/lib/utils';

export type CompanyType =
  | 'TECH_GIANT'
  | 'FINTECH_GIANT'
  | 'INDIAN_STARTUP'
  | 'GLOBAL_STARTUP'
  | 'YCOMBINATOR'
  | 'MASS_HIRING'
  | 'HFT';

export type Job = {
  id: string;
  company: string;
  segment: string;
  title: string;
  careerpage_link?: string;
  company_id?: string;
  created_at: string;
  created_by?: string | null;
  isSaved?: boolean;
  company_type?: CompanyType | string;
  location?: string;
  salary_range?: string;
  job_type?: string;
  company_logo?: string;
  companyRel?: { logo?: string };
  tags?: string[];
};

type JobCardProps = {
  job: Job;
  onSave: () => void;
};

export function JobCard({ job, onSave }: JobCardProps) {
  const [isSaved, setIsSaved] = useState(job.isSaved || false);
  const [expanded, setExpanded] = useState(false);

  const tags = useMemo(() => Array.from(new Set(job.tags || [])), [job.tags]);

  const visibleTags = expanded ? tags : tags.slice(0, 3);
  const hiddenCount = tags.length - visibleTags.length;

  const handleStarPress = useCallback(() => {
    setIsSaved((prev) => !prev);
    onSave();
  }, [onSave]);

  const formatSalary = useCallback((salary?: string) => {
    if (!salary) return '';
    const match = salary.match(/\$?(\d+)[Kk]\/[Mm]o/i);
    return match ? `$${match[1]}K/Mo` : salary;
  }, []);

  const formattedSalary = formatSalary(job.salary_range);
  const companyLocation = `${job.company} ${job.location ? ` · ${job.location}` : ''}`;
  //https://jobs.innovatesoft.com/react-developer
  const handleCardPress = useCallback(() => {
    if (job.careerpage_link) {
      Linking.openURL(job.careerpage_link);
    }
  }, [job.careerpage_link]);

  return (
    <>
      <View
        className={`android:shadow-md ios:shadow-sm mb-4 rounded-xl border bg-white p-4 ${
          isSaved ? 'border-neutral-400' : 'border-neutral-200'
        }`}
      >
        <View className="flex-row items-start gap-3">
          {/* Company Logo */}
          {job.companyRel?.logo ? (
            <Image
              source={{ uri: job.companyRel.logo }}
              className="rounded-xl"
              style={{ width: 50, height: 50 }}
              contentFit="cover"
            />
          ) : (
            <View
              className="items-center justify-center rounded-xl bg-neutral-200"
              style={{ width: 50, height: 50 }}
            >
              <Text className="text-lg font-bold text-neutral-500">
                {job.company.charAt(0).toUpperCase()}
              </Text>
            </View>
          )}

          <View className="flex-1">
            <Pressable onPress={handleCardPress} className='flex-row gap-1'>
              <Text className="mb-1 text-base font-bold text-neutral-900">
                {job.title}
              </Text>
              <Feather name={'arrow-up-right'}  color={'#000000'} />
            </Pressable>
            <Text className="mb-2 text-sm text-neutral-600">
              {companyLocation}
            </Text>

            <View className="flex-row flex-wrap gap-2">
              {visibleTags.map((tag) => (
                <View key={tag} className="rounded-md bg-gray-100 px-2 py-1">
                  <Text className="text-xs font-medium text-gray-800">
                    {tag}
                  </Text>
                </View>
              ))}
              {!expanded && hiddenCount > 0 && (
                <Pressable
                  onPress={(e) => {
                    e.stopPropagation();
                    setExpanded(true);
                  }}
                  className="rounded-md bg-gray-200 px-2 py-1"
                >
                  <Text className="text-xs font-medium text-gray-600">
                    +{hiddenCount} more
                  </Text>
                </Pressable>
              )}
            </View>

            {/* Footer */}
            <View className="mt-3 flex-row items-center justify-between border-t border-neutral-100 pt-2">
              <View>
                <Text className="text-xs text-neutral-400 mb-1">
                  Add these keywords to your resume to improve ATS matching.
                </Text>
                <Text className="text-xs text-neutral-400">
                  {formatRelativeTime(job.created_at)}
                </Text>
              </View>
              {formattedSalary && (
                <Text className="text-sm font-bold text-neutral-900">
                  {formattedSalary}
                </Text>
              )}
            </View>
          </View>

          <View className="flex-col items-center gap-3">
            <Pressable
              hitSlop={12}
              onPress={(e) => {
                e.stopPropagation();
                handleStarPress();
              }}
            >
              <Ionicons
                name={isSaved ? 'star' : 'star-outline'}
                size={20}
                color={isSaved ? '#FFD700' : '#000000'}
              />
            </Pressable>
          </View>
        </View>
      </View>
    </>
  );
}
