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
import useRegisterOrEditUser from '@/features/users/hooks/useRegisterOrEditUser';
import { UserRegistration } from '@/features/users';
import Step2 from '@/app/onboarding/Step2';
import Step0 from '@/app/onboarding/ExperienceLevel';
import { ExperienceLevel, ProfileData } from '@/app/onboarding/types';
import Step1 from '@/app/onboarding/Step1';
import { useOnboarding } from '@/lib';



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




export default function Onboarding() {
  const router = useRouter();
  const { getToken } = useAuth();
  const completeOnboarding = useOnboarding.use.completeOnboarding()

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

  const {mutate: registerUser, isPending: isRegistering} = useRegisterOrEditUser();

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

      registerUser(payload,{
          onSuccess:()=>{
            completeOnboarding()
            router.replace('/payment');
          },
          onError:(e)=>{
            console.error(e)
          }
        })
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
