import { ExperienceLevel } from '@/app/onboarding/types';
import { useColorScheme } from 'nativewind';
// import Animated,{FadeInRight,FadeOutLeft} from "react-native-reanimated";
import { Ionicons } from '@expo/vector-icons';
import { Text, View, ScrollView, Image } from '@/components/ui';
import { Pressable } from 'react-native';
import type { ImageSourcePropType } from 'react-native';

import { EXPERIENCE_LEVELS } from '@/app/onboarding/constants';

type Props = {
  selectedLevel: ExperienceLevel | null;
  onSelect: (level: ExperienceLevel) => void;
  onBack: () => void;
};
function Step1({ selectedLevel, onSelect, onBack }: Props) {
  const { colorScheme } = useColorScheme();
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
            What&apos;s your experience?
          </Text>
        </View>

        <Text className="mb-8 text-base text-neutral-500">
          This helps us show you the most relevant jobs
        </Text>
      </View>

      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: 24,
          paddingBottom: 24,
        }}
      >
        {EXPERIENCE_LEVELS.map((level) => {
          const isDisabled =
            level.id === 'three-to-five' || level.id === 'five-plus';
          return (
            <ExperienceCard
              key={level.id}
              selected={selectedLevel === level.id}
              onPress={() => onSelect(level.id)}
              label={level.label}
              image={level.image}
              disabled={isDisabled}
            />
          );
        })}
      </ScrollView>
    </View>
  );
}

export default Step1;

type ExperienceCardProps = {
  selected: boolean;
  onPress: () => void;
  label: string;
  image: ImageSourcePropType;
  disabled?: boolean;
};

function ExperienceCard({
  selected,
  onPress,
  label,
  image,
  disabled,
}: ExperienceCardProps) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      className={`mb-3 flex-row items-center overflow-hidden rounded-2xl border p-3 ${
        disabled
          ? 'border-neutral-200 bg-neutral-100 opacity-50 dark:border-neutral-800 dark:bg-neutral-900'
          : `android:shadow-md ios:shadow-sm border-1 border-neutral-${selected ? 500 : 200} bg-white dark:border-white dark:bg-neutral-800`
      }`}
    >
      <Image source={image} className="size-14 rounded-xl" contentFit="cover" />
      <Text className="ml-4 flex-1 text-lg font-semibold dark:text-white">
        {label}
      </Text>
      {!disabled && (
        <Ionicons
          name={selected ? 'checkmark-circle' : 'checkmark-circle-outline'}
          size={24}
          color={selected ? '#000000' : '#d1d5db'}
        />
      )}
    </Pressable>
  );
}
