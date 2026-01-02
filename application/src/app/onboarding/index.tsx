import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@clerk/clerk-expo';
import { useRouter } from 'expo-router';
import { useColorScheme } from 'nativewind';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { ImageSourcePropType, TextInput as RNTextInput } from 'react-native';
import { Pressable, TextInput } from 'react-native';
import {
  KeyboardAwareScrollView,
  KeyboardStickyView,
} from 'react-native-keyboard-controller';
import Animated, { FadeInRight, FadeOutLeft } from 'react-native-reanimated';

import {
  Checkbox,
  FocusAwareStatusBar,
  Image,
  Input,
  SafeAreaView,
  ScrollView,
  Text,
  View,
} from '@/components/ui';

import { Images } from '../../../assets/images';
import useRegisterUser from '@/features/users/hooks/useRegisterUser';
import { UserRegistration } from '@/features/users';
import Step2 from '@/app/onboarding/Step2';

const EXPERIENCE_LEVELS:{id: UserRegistration['experience_level'],
  label: string,
  description: string,
  image: ImageSourcePropType,
}[] = [
  {
    id: 'INTERNSHIP',
    label: 'Internships',
    description: 'Looking for internship opportunities',
    image: Images.experience.internship,
  },
  {
    id: 'FRESHER_OR_LESS_THAN_1_YEAR',
    label: 'Fresher or experience < 1 Year',
    description: 'Just starting out',
    image: Images.experience.lessThanOne,
  },
  {
    id: 'ONE_TO_THREE_YEARS',
    label: '1 - 3 Years Experience',
    description: 'Building experience',
    image: Images.experience.oneToThree,
  },
] as const;

type ExperienceLevel = (typeof EXPERIENCE_LEVELS)[number]['id'];

type StepIndicatorProps = {
  currentStep: number;
  totalSteps: number;
};

function StepIndicator({ currentStep, totalSteps }: StepIndicatorProps) {
  return (
    <View className="mb-8 w-full flex-row items-center px-2">
      {[1, 2, 3].map((step) => (
        <React.Fragment key={step}>
          <View
            className={`size-8 items-center justify-center rounded-full ${
              currentStep >= step
                ? 'bg-black dark:bg-white'
                : 'bg-neutral-200 dark:bg-neutral-700'
            }`}
          >
            <Text
              className={`text-sm font-semibold ${
                currentStep >= step
                  ? 'text-white dark:text-black'
                  : 'text-neutral-500'
              }`}
            >
              {step}
            </Text>
          </View>
          {step < 3 && (
            <View className="mx-2 h-1 flex-1 overflow-hidden rounded-full bg-neutral-200 dark:bg-neutral-700">
              <View
                className="h-full rounded-full bg-black dark:bg-white"
                style={{
                  width: `${currentStep > step ? 100 : 0}%`,
                }}
              />
            </View>
          )}
        </React.Fragment>
      ))}
    </View>
  );
}

type ProfileData = {
  name: string;
  isExperienced: boolean;
  collegeOrCompany: string;
  cgpaOrYoe: string;
  resumeLink: string;
};

type Step0Props = {
  data: ProfileData;
  onChange: (data: ProfileData) => void;
  onContinue: () => void;
  canContinue: boolean;
};

function Step0({ data, onChange, onContinue, canContinue }: Step0Props) {
  const nameRef = useRef<RNTextInput>(null);
  const collegeOrCompanyRef = useRef<RNTextInput>(null);
  const cgpaOrYoeRef = useRef<RNTextInput>(null);
  const resumeLinkRef = useRef<RNTextInput>(null);

  const updateField = (field: keyof ProfileData, value: any) => {
    onChange({ ...data, [field]: value });
  };

  const handleSubmit = () => {
    if (canContinue) {
      onContinue();
    }
  };

  return (
    <Animated.View
      entering={FadeInRight.duration(300)}
      exiting={FadeOutLeft.duration(300)}
      className="flex-1"
    >
      <View className="px-6">
        <Text className="mb-2 text-3xl font-bold dark:text-white">
          Tell us about you
        </Text>
        <Text className="mb-8 text-base text-neutral-500">
          We&apos;ll personalize your experience based on this
        </Text>
      </View>

      <KeyboardAwareScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: 24,
          paddingBottom: 24,
        }}
        bottomOffset={100}
      >
        <View className="gap-5">
          <View>
            <Text className="mb-2 font-medium text-neutral-900 dark:text-white">
              Full Name
            </Text>
            <Input
              ref={nameRef}
              placeholder="Enter your full name"
              value={data.name}
              onChangeText={(text) => updateField('name', text)}
              returnKeyType="next"
              onSubmitEditing={() => collegeOrCompanyRef.current?.focus()}
              blurOnSubmit={false}
            />
          </View>

          <Pressable
            onPress={() => updateField('isExperienced', !data.isExperienced)}
            className="flex-row items-center gap-3 py-2"
          >
            <Checkbox
              checked={data.isExperienced}
              onChange={() =>
                updateField('isExperienced', !data.isExperienced)
              }
              accessibilityLabel="I am an experienced professional"
            />
            <Text className="text-base text-neutral-900 dark:text-white">
              I am an experienced professional
            </Text>
          </Pressable>

          <View>
            <Text className="mb-2 font-medium text-neutral-900 dark:text-white">
              {data.isExperienced ? 'Current Company' : 'College Name'}
            </Text>
            <Input
              ref={collegeOrCompanyRef}
              placeholder={
                data.isExperienced ? 'e.g. Google' : 'e.g. IIT Delhi'
              }
              value={data.collegeOrCompany}
              onChangeText={(text) => updateField('collegeOrCompany', text)}
              returnKeyType="next"
              onSubmitEditing={() => cgpaOrYoeRef.current?.focus()}
              blurOnSubmit={false}
            />
          </View>

          <View>
            <Text className="mb-2 font-medium text-neutral-900 dark:text-white">
              {data.isExperienced
                ? 'Years of Experience'
                : 'CGPA / Percentage'}
            </Text>
            <Input
              ref={cgpaOrYoeRef}
              placeholder={data.isExperienced ? 'e.g. 0.5' : 'e.g. 8.5'}
              value={data.cgpaOrYoe}
              onChangeText={(text) => {
                if (data.isExperienced) {
                  // Only allow numbers and decimal point
                  const numericText = text.replace(/[^0-9.]/g, '');
                  updateField('cgpaOrYoe', numericText);
                } else {
                  updateField('cgpaOrYoe', text);
                }
              }}
              keyboardType={data.isExperienced ? 'numeric' : 'default'}
              returnKeyType="next"
              onSubmitEditing={() => resumeLinkRef.current?.focus()}
              blurOnSubmit={false}
            />
          </View>

          <View>
            <Text className="mb-2 font-medium text-neutral-900 dark:text-white">
              Resume Link <Text className="text-neutral-400">(Optional)</Text>
            </Text>
            <Input
              ref={resumeLinkRef}
              placeholder="Google Drive / Dropbox link"
              value={data.resumeLink}
              onChangeText={(text) => updateField('resumeLink', text)}
              autoCapitalize="none"
              returnKeyType="done"
              onSubmitEditing={handleSubmit}
            />
          </View>
        </View>
      </KeyboardAwareScrollView>
    </Animated.View>
  );
}

type Step1Props = {
  selectedLevel: ExperienceLevel | null;
  onSelect: (level: ExperienceLevel) => void;
  onBack: () => void;
};

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

function Step1({ selectedLevel, onSelect, onBack }: Step1Props) {
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
          return (
            <ExperienceCard
              key={level.id}
              selected={selectedLevel === level.id}
              onPress={() => onSelect(level.id)}
              label={level.label}
              image={level.image}
            />
          );
        })}
      </ScrollView>
    </Animated.View>
  );
}


export default function Onboarding() {
  const router = useRouter();
  const { getToken } = useAuth();

  const [step, setStep] = useState(1);
  const [profileData, setProfileData] = useState<ProfileData>({
    name: '',
    isExperienced: true,
    collegeOrCompany: '',
    cgpaOrYoe: '',
    resumeLink: '',
  });
  const [experienceLevel, setExperienceLevel] =
    useState<ExperienceLevel | null>(null);
  const [selectedCompanies, setSelectedCompanies] = useState<string[]>([]);

  const {mutate: registerUser, isPending: isRegistering} = useRegisterUser();

  useEffect(() => {
    const logToken = async () => {
      const token = await getToken();
      console.log('getToken:', token);
    };
    logToken();
  }, [getToken]);

  const handleToggleCompany = (companyId: string) => {
    setSelectedCompanies((prev) =>
      prev.includes(companyId)
        ? prev.filter((id) => id !== companyId)
        : [...prev, companyId]
    );
  };

  const handleSelectAll = (companyIds: string[], select: boolean) => {
    setSelectedCompanies((prev) => {
      if (select) {
        return companyIds;
      } else {
        return prev.filter((id) => !companyIds.includes(id));
      }
    });
  }

  const handleContinue = useCallback(() => {
    setStep((prev) => prev + 1);
  }, []);

  const handleBack = useCallback(() => {
    setStep((prev) => prev - 1);
  }, []);

  console.log({profileData , experienceLevel , selectedCompanies})
  const handleFinish = () => {
    if(profileData && experienceLevel && selectedCompanies){
      let payload = {
        name:profileData.name,
        is_experienced: profileData.isExperienced,
        resume_link: profileData.resumeLink,
        experience_level: experienceLevel,
        followedCompanies: selectedCompanies,
      } as UserRegistration;

      if(payload.is_experienced){
        payload = {
          ...payload,
          is_experienced: true,
          years_of_experience: Number(profileData.cgpaOrYoe),
          company_name: profileData.collegeOrCompany
        }
      }else{
        payload = {
          ...payload,
          cgpa: profileData.cgpaOrYoe, 
          college_name:profileData.collegeOrCompany
        }
      }

      console.log({payload})

      // registerUser(payload,{
      //     onSuccess:()=>{
      //       router.replace('/');
      //     },
      //     onError:(e)=>{
      //       console.error(e)
      //     }
      //   })
    }

   
  };

  const canContinue = useMemo(() => {
    if (step === 1) {
      return (
        profileData.name.trim().length > 0 &&
        profileData.collegeOrCompany.trim().length > 0 &&
        profileData.cgpaOrYoe.trim().length > 0
      );
    }
    if (step === 2) {
      return experienceLevel !== null;
    }
    return true; // Step 3
  }, [step, profileData, experienceLevel]);

  return (
    <View className="flex-1 bg-white dark:bg-neutral-900">
      <FocusAwareStatusBar />
      <SafeAreaView className="flex-1">
        <View className="flex-1 pt-4">
          <View className="px-6">
            <StepIndicator currentStep={step} totalSteps={3} />
          </View>

          {step === 1 ? (
            <Step0
              data={profileData}
              onChange={setProfileData}
              onContinue={handleContinue}
              canContinue={canContinue}
            />
          ) : step === 2 ? (
            <Step1
              selectedLevel={experienceLevel}
              onSelect={setExperienceLevel}
              onBack={handleBack}
            />
          ) : (
            <Step2
              selectedCompanies={selectedCompanies}
              onToggle={handleToggleCompany}
              onBack={handleBack}
              onSelectAll={handleSelectAll}
            />
          )}
        </View>
      </SafeAreaView>

      {step === 1 ? (

        <KeyboardStickyView offset={{ closed: 0, opened: 0 }}>
          <View className="border-t border-neutral-200 bg-white px-6 pb-8 pt-4 dark:border-neutral-700 dark:bg-neutral-900">
            <Pressable
              onPress={handleContinue}
              disabled={!canContinue}
              className={`h-14 items-center justify-center rounded-xl ${
                canContinue ? 'bg-black dark:bg-white' : 'bg-neutral-300'
              }`}
            >
              <Text
                className={`text-lg font-semibold ${
                  canContinue ? 'text-white dark:text-black' : 'text-neutral-500'
                }`}
              >
                Continue
              </Text>
            </Pressable>
          </View>
         </KeyboardStickyView>
      ) : (
        <View className="border-t border-neutral-200 bg-white px-6 pb-8 pt-4 dark:border-neutral-700 dark:bg-neutral-900">
          {step === 3 && selectedCompanies.length > 0 && (
            <Text className="mb-3 text-center text-sm font-medium text-neutral-600 dark:text-neutral-400">
              You will be notified for {selectedCompanies.length} companies info
              🚀
            </Text>
          )}
          <Pressable
            onPress={step < 3 ? handleContinue : handleFinish}
            disabled={!canContinue}
            className={`h-14 items-center justify-center rounded-xl ${
              canContinue ? 'bg-black dark:bg-white' : 'bg-neutral-300'
            }`}
          >
            <Text
              className={`text-lg font-semibold ${
                canContinue ? 'text-white dark:text-black' : 'text-neutral-500'
              }`}
            >
              {step < 3 ? 'Continue' : 'Finish'}
            </Text>
          </Pressable>
        </View>
      )}
    </View>
  );
}
