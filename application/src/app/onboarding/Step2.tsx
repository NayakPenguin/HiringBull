import { useMemo, useState } from "react";
import { useColorScheme } from 'nativewind';
import {  Pressable} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInRight, FadeOutLeft } from 'react-native-reanimated';
import{
  Checkbox,
  Text,
  View,
  ScrollView,
} from '@/components/ui';
import {TextInput} from 'react-native';
import useFetchOnboardedCompanies from "@/app/onboarding/hooks/useFetchOnboardedCompanies";

type Step2Props = {
  selectedCompanies: string[];
  onToggle: (companyId: string) => void;
  onBack: () => void;
  onSelectAll: (companyIds: string[], select: boolean) => void;
};
function Step2({
  selectedCompanies,
  onToggle,
  onBack,
  onSelectAll,
}: Step2Props) {
  const [search, setSearch] = useState('');
  const [activeFilter, setActiveFilter] =
    useState<string>('ALL');
  const { colorScheme } = useColorScheme();

  const {data:COMPANIES, isFetching: isFetchingCompanies} = useFetchOnboardedCompanies();

  console.log({COMPANIES,activeFilter});

  const filteredCompanies = useMemo(() => {
    let result = COMPANIES ? activeFilter === 'ALL' ? 
    COMPANIES : COMPANIES.filter((c) => c.category === activeFilter) : [];
    if (!search.trim()) return result;
    return result.filter((company) =>
      company.name.toLowerCase().includes(search.toLowerCase())
    );
  }, [search, activeFilter]);

  const allFilteredSelected = useMemo(() => {
    if (filteredCompanies.length === 0) return false;
    return filteredCompanies.every((c) => selectedCompanies.includes(c.id));
  }, [filteredCompanies, selectedCompanies]);

  if(!COMPANIES || isFetchingCompanies){
    return <Text className="ml-1 text-xl font-medium text-neutral-500  dark:text-neutral-400">
            Loading list of companies ...
          </Text>
  }

  console.log({COMPANIES});

  const FILTERS = ['ALL',...new Set(COMPANIES.map(c=> c.category))];
  console.log({FILTERS})
  return (
    <Animated.View
      entering={FadeInRight.duration(300)}
      exiting={FadeOutLeft.duration(300)}
      className="flex-1"
    >
      <View className="px-6">
        <Pressable
          onPress={onBack}
          className="mb-4 flex-row items-center self-start"
        >
          <Ionicons
            name="arrow-back"
            size={16}
            color={colorScheme === 'dark' ? '#a3a3a3' : '#737373'}
          />
          <Text className="ml-1 text-sm font-medium text-neutral-500 underline dark:text-neutral-400">
            Back
          </Text>
        </Pressable>
        <Text className="mb-2 text-3xl font-bold">
          Companies you&apos;d love
        </Text>
        <Text className="mb-4 text-base text-neutral-500">
          Select companies you&apos;re interested in working for
        </Text>

        <View className="mb-4 flex-row items-center rounded-xl border border-neutral-200 bg-neutral-100 px-4 dark:border-neutral-700 dark:bg-neutral-800">
          <Text className="mr-2">🔍</Text>
          <TextInput
            value={search}
            onChangeText={setSearch}
            placeholder="Search companies..."
            placeholderTextColor="#9ca3af"
            className="flex-1 py-3 text-base text-black dark:text-white"
          />
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          className="mb-4 flex-row"
        >
          {FILTERS.map((filter) => (
            <Pressable
              key={filter}
              onPress={() => setActiveFilter(filter)}
              className={`mr-2 rounded-full border px-4 py-2  ${
                activeFilter === filter
                  ? 'border-black bg-black dark:border-white dark:bg-white'
                  : 'border-neutral-200 bg-white dark:border-neutral-700 dark:bg-neutral-800'
              }`}
            >
              <Text
                className={`text-sm font-medium ${
                  activeFilter === filter
                    ? 'text-white dark:text-black'
                    : 'text-neutral-600 dark:text-neutral-300'
                }`}
              >
                {filter.toUpperCase()}
              </Text>
            </Pressable>
          ))}
        </ScrollView>

        <View className="mb-4 flex-row items-center justify-between">
          <Text className="text-sm font-medium text-neutral-500">
            {filteredCompanies.length} companies found
          </Text>
          <Pressable
            onPress={() => {
              const ids = filteredCompanies.map((c) => c.id);
              onSelectAll(ids, !allFilteredSelected);
            }}
            className="flex-row items-center"
          >
            <Text className="mr-2 text-sm font-medium dark:text-neutral-300">
              Select All
            </Text>
            <Checkbox
              checked={allFilteredSelected}
              onChange={() => {
                const ids = filteredCompanies.map((c) => c.id);
                onSelectAll(ids, !allFilteredSelected);
              }}
              accessibilityLabel="Select all visible companies"
            />
          </Pressable>
        </View>
      </View>

      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: 24,
          paddingBottom: 24,
        }}
      >
        {filteredCompanies.map((company) => {
          const isSelected = selectedCompanies.includes(company.id);
          return (
            <OptionCard
              key={company.id}
              selected={isSelected}
              onPress={() => onToggle(company.id)}
            >
              <View className="flex-row items-center">
                <View className="mr-3 size-10 items-center justify-center rounded-full bg-neutral-100 dark:bg-neutral-800">
                  <Ionicons name="business" size={20} color={colorScheme === 'dark' ? '#ffffff' : '#000000'} />
                </View>
                <Text className="text-lg font-semibold">{company.name}</Text>
              </View>
            </OptionCard>
          );
        })}
        {filteredCompanies.length === 0 && (
          <Text className="py-8 text-center text-neutral-500">
            No companies found
          </Text>
        )}
      </ScrollView>
    </Animated.View>
  );
}

type OptionCardProps = {
  selected: boolean;
  onPress: () => void;
  children: React.ReactNode;
};

function OptionCard({ selected, onPress, children }: OptionCardProps) {
  return (
    <Pressable
      onPress={onPress}
      className={`mb-3 flex-row items-center rounded-xl border bg-white p-5 ${
        selected
          ? 'border-2 border-black android:shadow-lg ios:shadow-sm'
          : 'border-neutral-200 android:shadow-md ios:shadow-sm dark:border-neutral-700'
      }`}
    >
      <View className="flex-1">{children}</View>
      <Ionicons
        name={selected ? 'checkmark-circle' : 'checkmark-circle-outline'}
        size={24}
        color={selected ? '#000000' : '#d1d5db'}
      />
    </Pressable>
  );
}

export default Step2;