import { useMemo, useState } from 'react';
import { useColorScheme } from 'nativewind';
import { Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
// import Animated, { FadeInRight, FadeOutLeft } from 'react-native-reanimated';
import { Checkbox, Text, View, ScrollView, Input, Image } from '@/components/ui';
import { TextInput } from 'react-native';
import useFetchOnboardedCompanies from '@/app/onboarding/hooks/useFetchOnboardedCompanies';
import LogoLoader from '@/components/logo-loader';

type Step2Props = {
  selectedCompanies: string[];
  onToggle: (companyId: string) => void;
  onBack: () => void;
  onSelectAll: (companyIds: string[], select: boolean) => void;
  label?: string;
};
function Step2({
  selectedCompanies,
  onToggle,
  onBack,
  onSelectAll,
  label = 'Companies you love',
}: Step2Props) {
  const [search, setSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState<string>('ALL');
  const { colorScheme } = useColorScheme();

  const { data: COMPANIES, isFetching: isFetchingCompanies } =
    useFetchOnboardedCompanies();

  const filteredCompanies = useMemo(() => {
    let result = COMPANIES
      ? activeFilter === 'ALL'
        ? COMPANIES
        : COMPANIES.filter((c) => c.category === activeFilter)
      : [];
    if (!search.trim()) return result;
    return result.filter((company) =>
      company.name.toLowerCase().includes(search.toLowerCase())
    );
  }, [search, activeFilter, COMPANIES]);

  const allFilteredSelected = useMemo(() => {
    if (filteredCompanies.length === 0) return false;
    return filteredCompanies.every((c) => selectedCompanies.includes(c.id));
  }, [filteredCompanies, selectedCompanies]);

  if (!COMPANIES || isFetchingCompanies) {
    return <LogoLoader />;
  }

  const FILTERS = ['ALL', ...new Set(COMPANIES.map((c) => c.category))];

  const filterNameFormat = (name: string) => {
    let output = name.replace('_', ' ').toUpperCase();
    output = output.charAt(0).toUpperCase() + output.slice(1).toLowerCase();
    return output;
  };
  return (
    <View
      // entering={FadeInRight.duration(300)}
      // exiting={FadeOutLeft.duration(300)}
      className="flex-1"
    >
      <View className="px-6">
        <View className="flex-row items-center">
          <Pressable onPress={onBack}>
            <Ionicons
              name="arrow-back"
              size={24}
              color={colorScheme === 'dark' ? '#a3a3a3' : '#737373'}
              className="mb-2 mr-4 bg-neutral-200 rounded-md p-1"
            />
          </Pressable>

          <Text className="mb-2 text-3xl font-bold dark:text-white">
            {label}
          </Text>
        </View>
        <Text className="mb-4 text-base text-neutral-500">
          Select companies you&apos;re interested in working for
        </Text>

        <View className="mb-4">
          <Input
            isSearch
            placeholder="Search Jobs"
            value={search}
            onChangeText={setSearch}
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
                  : 'border-1 border-black bg-white dark:border-neutral-700 dark:bg-neutral-800'
              }`}
            >
              <Text
                className={`text-sm font-medium ${
                  activeFilter === filter
                    ? 'text-white dark:text-black'
                    : 'text-neutral-600 dark:text-neutral-300'
                }`}
              >
                {filterNameFormat(filter)}
              </Text>
            </Pressable>
          ))}
        </ScrollView>

        <View className="mb-4 flex-row items-center justify-between">
          <Text className="text-md font-medium text-neutral-500">
            {filteredCompanies.length} companies found
          </Text>
          <Pressable
            onPress={() => {
              const ids = filteredCompanies.map((c) => c.id);
              onSelectAll(ids, !allFilteredSelected);
            }}
            className="flex-row items-center"
          >
            <Text className="text-md mr-2 font-medium dark:text-neutral-300">
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
                <Image
                  source={company?.logo}
                  className="mr-3 size-10 items-center justify-center rounded-full bg-neutral-800 dark:bg-neutral-800"
                />

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
    </View>
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
      className={`mb-3 flex-row items-center rounded-xl border bg-neutral-200 p-4 android:shadow-lg ios:shadow-sm border-1 border-neutral-${selected ? 500 : 200}`}
    >
      <View className="flex-1">{children}</View>
      <Ionicons
        name={selected ? 'checkmark-circle' : 'checkmark-circle-outline'}
        size={24}
        color={selected ? '#000000' : '#A3A3A3'}
      />
    </Pressable>
  );
}

export default Step2;
