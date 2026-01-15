import { Ionicons } from '@expo/vector-icons';
import React, { useCallback, useState } from 'react';
import { Pressable } from 'react-native';

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
  careerpage_link: string;
  company_id: string;
  created_at: string;
  created_by: string | null;
  isSaved?: boolean;
  company_type: CompanyType | string;
  location?: string;
  salary_range?: string;
  job_type?: string;
  company_logo?: string;
};

type JobCardProps = {
  job: Job;
  onSave: () => void;
};

export function JobCard({ job, onSave }: JobCardProps) {
  const [isSaved, setIsSaved] = useState(job.isSaved || false);

  const handleStarPress = useCallback(() => {
    const newSavedState = !isSaved;
    setIsSaved(newSavedState);
    onSave();
  }, [isSaved, onSave]);

  const formatSalary = useCallback((salary?: string): string => {
    if (!salary) return '';
    const monthlyMatch = salary.match(/\$?(\d+)[Kk]\/[Mm]o/i);
    if (monthlyMatch) {
      return `$${monthlyMatch[1]}K/Mo`;
    }
    return salary;
  }, []);

  const getTags = useCallback(() => {
    const tags: string[] = [];
    if (job.segment) {
      if (job.segment.toLowerCase().includes('design')) {
        tags.push('Design');
      }
    }
    if (job.job_type) {
      tags.push(job.job_type);
    }
    if (job.segment) {
      // Extract level from segment
      if (job.segment.toLowerCase().includes('senior')) {
        tags.push('Senior designer');
      } else if (job.segment.toLowerCase().includes('lead')) {
        tags.push('Lead designer');
      }
    }
    // Default tags if none found
    if (tags.length === 0) {
      tags.push('Design', 'Full time', 'Senior designer');
    }
    return tags;
  }, [job.segment, job.job_type]);

  const companyLocation = `${job.company} inc${job.location ? ` · ${job.location}` : ''}`;
  const tags = getTags();
  const formattedSalary = formatSalary(job.salary_range);

  return (
    <View
      className={`android:shadow-md ios:shadow-sm mb-4 rounded-xl border bg-white p-4 ${
        isSaved ? 'border-neutral-400' : 'border-neutral-200'
      }`}
    >
      <View className="flex-row items-start gap-3">
        {job.company_logo ? (
          <Image
            source={{ uri: job.company_logo }}
            className="rounded-xl"
            style={{ width: 48, height: 48 }}
            contentFit="cover"
          />
        ) : (
          <View
            className="items-center justify-center rounded-xl bg-neutral-200"
            style={{ width: 48, height: 48 }}
          >
            <Text className="text-lg font-bold text-neutral-500">
              {job.company.charAt(0).toUpperCase()}
            </Text>
          </View>
        )}

        <View className="flex-1">
          <Text className="mb-1 text-base font-bold text-neutral-900">
            {job.title}
          </Text>

          <Text className="mb-2 text-sm text-neutral-600">
            {companyLocation}
          </Text>

          <View className="mb-3 flex-row flex-wrap gap-2">
            {tags.map((tag, index) => (
              <View key={index} className="rounded-lg bg-neutral-100 px-2 py-1">
                <Text className="text-xs font-medium text-neutral-600">
                  {tag}
                </Text>
              </View>
            ))}
          </View>

          <View className="flex-row items-center justify-between border-t border-neutral-100 pt-2">
            <Text className="text-xs text-neutral-400">
              {formatRelativeTime(job.created_at)}
            </Text>
            {formattedSalary && (
              <Text className="text-sm font-bold text-neutral-900">
                {formattedSalary}
              </Text>
            )}
          </View>
        </View>

        <View className="flex-col items-center gap-3">
          <Pressable hitSlop={12} onPress={handleStarPress}>
            <Ionicons
              name={isSaved ? 'star' : 'star-outline'}
              size={20}
              color={isSaved ? '#FFD700' : '#000000'}
            />
          </Pressable>
        </View>
      </View>
    </View>
  );
}
