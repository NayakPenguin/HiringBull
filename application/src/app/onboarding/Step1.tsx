import { ExperienceLevel } from "@/app/onboarding/types";
import { useColorScheme } from "nativewind";
import Animated,{FadeInRight,FadeOutLeft} from "react-native-reanimated";
import { Ionicons } from '@expo/vector-icons';
import { Text,
  View,
  ScrollView,
  Image,
} from '@/components/ui';
import { Pressable } from 'react-native';
import type { ImageSourcePropType } from 'react-native';

import { EXPERIENCE_LEVELS } from "@/app/onboarding/constants";

type Props = {
  selectedLevel: ExperienceLevel | null;
  onSelect: (level: ExperienceLevel) => void;
  onBack: () => void;
};
function Step1({ selectedLevel, onSelect, onBack }: Props) {
  const { colorScheme } = useColorScheme();
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
        <Text className="mb-2 text-3xl font-bold dark:text-white">
          What&apos;s your experience level?
        </Text>
        <Text className="mb-6 text-base text-neutral-500">
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
    </Animated.View>
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
          ? 'bg-neutral-100 border-neutral-200 opacity-50 dark:bg-neutral-900 dark:border-neutral-800'
          : selected
          ? 'bg-white border-2 border-black android:shadow-md ios:shadow-sm dark:bg-neutral-800 dark:border-white'
          : 'bg-white border-neutral-200 android:shadow-md ios:shadow-sm dark:bg-neutral-800 dark:border-neutral-700'
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