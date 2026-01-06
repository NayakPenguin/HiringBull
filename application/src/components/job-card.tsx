import { Ionicons } from '@expo/vector-icons';
import * as Linking from 'expo-linking';
import React, { useCallback } from 'react';
import { Pressable } from 'react-native';

import { Text, View } from '@/components/ui';
import { formatRelativeTime, formatSegment } from '@/lib/utils';

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
  careerpage_link: string;
  company_id: string;
  created_at: string;
  created_by: string | null;
  isSaved?: boolean;
  company_type: CompanyType | string;
};

type JobCardProps = {
  job: Job;
  onSave: () => void;
};

export function JobCard({ job, onSave }: JobCardProps) {
  const handleOpenLink = useCallback(() => {
    Linking.openURL(job.careerpage_link);
  }, [job.careerpage_link]);

  // Define nice pastel themes for accents only
  const getCardTheme = () => {
    if (job.segment.includes('<1')) {
      return {
        text: 'text-blue-700 dark:text-blue-300',
      };
    }
    if (job.segment.includes('1-3') || job.segment.includes('1-2')) {
      return {
        text: 'text-blue-700 dark:text-blue-300',
      };
    }
    if (
      job.segment.includes('Senior') ||
      job.segment.includes('3-5') ||
      job.segment.includes('2-4')
    ) {
      return {
        text: 'text-blue-700 dark:text-blue-300',
      };
    }
    return {
      text: 'text-blue-700 dark:text-blue-300',
    };
  };

  const getTagStyle = (type: string) => {
    switch (type) {
      case 'TECH_GIANT':
        return { bg: 'bg-blue-100', text: 'text-blue-800' };
      case 'FINTECH_GIANT':
        return { bg: 'bg-green-100', text: 'text-green-800' };
      case 'INDIAN_STARTUP':
        return { bg: 'bg-amber-100', text: 'text-amber-800' };
      case 'GLOBAL_STARTUP':
        return { bg: 'bg-pink-100', text: 'text-pink-800' };
      case 'YCOMBINATOR':
        return { bg: 'bg-orange-100', text: 'text-orange-800' };
      case 'MASS_HIRING':
        return { bg: 'bg-gray-100', text: 'text-gray-800' };
      case 'HFT':
        return { bg: 'bg-indigo-100', text: 'text-indigo-800' };
      default:
        return { bg: 'bg-gray-100', text: 'text-gray-800' };
    }
  };

  const theme = getCardTheme();
  const tagStyle = getTagStyle(job.company_type);

  return (
    <View className="mb-4 rounded-xl border border-neutral-200 bg-white p-5 android:shadow-md ios:shadow-sm">
      <View className="mb-3 flex-row items-center justify-between">
        <View className="flex-1">
          <View className="mb-1 flex-row items-center gap-2">
            <Text
              className={`text-sm font-bold uppercase tracking-wider ${theme.text}`}
            >
              {job.company}
            </Text>
            <View className={`rounded-md px-2 py-0.5 ${tagStyle.bg}`}>
              <Text className={`text-[10px] font-medium ${tagStyle.text}`}>
                {formatSegment(job.company_type)}
              </Text>
            </View>
          </View>

          <Text className="text-lg font-bold leading-tight text-neutral-900">
            {job.title}
          </Text>
        </View>
      </View>

      <Text className="mb-4 text-sm font-medium text-neutral-600">
        {job.segment}
      </Text>

      <View className="flex-row items-center justify-between border-t border-neutral-200/50 pt-4">
        <Text className="text-[10px] font-bold uppercase tracking-tighter text-neutral-400">
          Posted : {formatRelativeTime(job.created_at)}
        </Text>
        <View className="flex-row items-center gap-7">
          {/* <Pressable hitSlop={12} onPress={onSave}>
            <Ionicons
              name={job.isSaved ? 'star' : 'star-outline'}
              size={20}
              color={job.isSaved ? '#FFD700' : '#000000'}
            />
          </Pressable> */}
          <Pressable hitSlop={12} onPress={handleOpenLink}>
            <Ionicons name="paper-plane-outline" size={20} color="#000000" />
          </Pressable>
        </View>
      </View>
    </View>
  );
}
