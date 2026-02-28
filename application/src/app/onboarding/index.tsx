import { useAuth, getUserEmail } from '@/lib/auth';
import { useRouter } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Pressable } from 'react-native';

import Step0 from '@/app/onboarding/ExperienceLevel';
import Step1 from '@/app/onboarding/Step1';
import Step2 from '@/app/onboarding/Step2';
import { type ExperienceLevel, type ProfileData } from '@/app/onboarding/types';
import { FocusAwareStatusBar, SafeAreaView, Text, View } from '@/components/ui';
import { checkUserVerification, UserRegistration } from '@/features/users';
import useRegisterOrEditUser from '@/features/users/hooks/useRegisterOrEditUser';
import { useOnboarding, showGlobalLoading, hideGlobalLoading } from '@/lib';
import NoActiveMembership from '../no-membership';
import { getMembership, isMembershipValid, saveMembership } from '@/lib/membership';


type StepIndicatorProps = {
  currentStep: number;
  totalSteps: number;
};

function StepIndicator({ currentStep, totalSteps }: StepIndicatorProps) {
  return (
    <View className="mb-4 w-full flex-row items-center">
      {[1, 2, 3].map((step, index) => {
         const isActive = currentStep >= step;
        return (
          <React.Fragment key={step}>
            <View
              className={`h-2 flex-1 overflow-hidden rounded-full bg-neutral-200 dark:bg-neutral-700 ${step === 2 && `mx-4`} `}
            >
              <View
                className={`h-full rounded-full ${
                  isActive ? 'bg-orange-400' : 'bg-transparent'
                }`}
                style={{ width: isActive ? '100%' : '0%' }}
              />
            </View>
            {/* )} */}
          </React.Fragment>
        );
      })}
    </View>
  );
}



export default function Onboarding() {
  const router = useRouter();
  const completeOnboarding = useOnboarding.use.completeOnboarding();
  const [isVerifiedUser, setIsVerifiedUser] = useState(false);

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

  const { mutate: registerUser, isPending: isRegistering } =
    useRegisterOrEditUser();

  const [membershipLoading, setMembershipLoading] = useState(true);

  useEffect(() => {
    const checkIfVerified = async () => {
      const email = getUserEmail();
      console.log('[Onboarding] checkIfVerified: email =', email);
      if (!email) {
        console.log('[Onboarding] No email in JWT, cannot check membership');
        setMembershipLoading(false);
        return;
      }

      try {
        console.log('[Onboarding] Calling checkUserVerification for:', email);
        const verificationData = await checkUserVerification(email);
        console.log('[Onboarding] Verification response:', JSON.stringify(verificationData));
        saveMembership({
          email,
          membershipEnd: verificationData.data.membershipEnd,
        });

        const isValid = isMembershipValid(verificationData.data.membershipEnd);
        console.log('[Onboarding] Membership valid =', isValid, '| membershipEnd =', verificationData.data.membershipEnd);
        if (!isValid) {
          setIsVerifiedUser(false);
        } else {
          setIsVerifiedUser(true);
        }
      } catch (err: any) {
        // 404 = no membership record exists → user has no membership
        console.log('[Onboarding] Membership check failed:', err?.response?.status || err.message);
        setIsVerifiedUser(false);
      } finally {
        setMembershipLoading(false);
      }
    };

    checkIfVerified();
  }, []);

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
  };

  const handleContinue = useCallback(() => {
    setStep((prev) => prev + 1);
  }, []);

  const handleBack = useCallback(() => {
    setStep((prev) => prev - 1);
  }, []);

  const handleFinish = () => {
    if (profileData && experienceLevel && selectedCompanies) {
      let payload = {
        name: profileData.name,
        is_experienced: profileData.isExperienced,
        resume_link: profileData.resumeLink,
        experience_level: experienceLevel,
        followedCompanies: selectedCompanies,
      } as UserRegistration;

      if (payload.is_experienced) {
        payload = {
          ...payload,
          is_experienced: true,
          years_of_experience: Number(profileData.cgpaOrYoe),
          company_name: profileData.collegeOrCompany,
        };
      } else {
        payload = {
          ...payload,
          cgpa: profileData.cgpaOrYoe,
          college_name: profileData.collegeOrCompany,
        };
      }

      registerUser(payload, {
        onSuccess: () => {
          hideGlobalLoading();
          completeOnboarding();
          router.replace('/');
        },
        onError: (e) => {
          hideGlobalLoading();
          console.error(e);
        },
      });
      showGlobalLoading();
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

  const openInviteEmail = async () => {
    await WebBrowser.openBrowserAsync(
      'https://www.hiringbull.in/join-membership'
    );
  };
  if (membershipLoading) {
    console.log('[Onboarding] Still checking membership, showing loading...');
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <Text className="text-base text-neutral-500">Checking membership...</Text>
      </View>
    );
  }

  console.log('[Onboarding] isVerifiedUser =', isVerifiedUser);
  if (!isVerifiedUser) {
    console.log('[Onboarding] User has no valid membership → showing NoActiveMembership');
    return <NoActiveMembership />;
  }
  console.log('[Onboarding] User has valid membership → showing onboarding steps');

  return (
    <View className="flex-1 bg-white dark:bg-neutral-900">
      <FocusAwareStatusBar />
      <SafeAreaView className="flex-1">
        {!isVerifiedUser && (
          <Pressable className="p-0" onPress={openInviteEmail}>
            <Text className="text-center text-xl mb-4 leading-5 bg-primary-200 py-3 px-2">
              You have not received the invite.Kindly click here to get invite{' '}
            </Text>
          </Pressable>
        )}
        <View className="flex-1 pt-4" key={step}>
          <View className="px-6">
            <StepIndicator currentStep={step} totalSteps={3} />
          </View>
          {/* <View key={step}> */}
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
          {/* </View> */}
        </View>
      </SafeAreaView>

      {isVerifiedUser ? (
        step === 1 ? (
          <View>
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
                    canContinue
                      ? 'text-white dark:text-black'
                      : 'text-neutral-500'
                  }`}
                >
                  Continue
                </Text>
              </Pressable>
            </View>
          </View>
        ) : (
          <View className="border-t border-neutral-200 bg-white px-6 pb-8 pt-4 dark:border-neutral-700 dark:bg-neutral-900">
            {step === 3 && selectedCompanies.length > 0 && (
              <Text className="mb-3 text-center text-sm font-medium text-neutral-600 dark:text-neutral-400">
                You will be notified for {selectedCompanies.length} companies
                info
              </Text>
            )}
            <Pressable
              onPress={step < 3 ? handleContinue : handleFinish}
              disabled={!canContinue || isRegistering}
              className={`h-14 items-center justify-center rounded-xl ${
                canContinue ? 'bg-black dark:bg-white' : 'bg-neutral-300'
              }`}
            >
              <Text
                className={`text-lg font-semibold ${
                  canContinue
                    ? 'text-white dark:text-black'
                    : 'text-neutral-500'
                }`}
              >
                {step < 3 ? 'Continue' : 'Finish'}
              </Text>
            </Pressable>
          </View>
        )
      ) : null}
    </View>
  );
}
