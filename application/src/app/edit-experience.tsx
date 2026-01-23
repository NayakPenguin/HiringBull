import Step1 from '@/app/onboarding/Step1';
import { ExperienceLevel } from '@/app/onboarding/types';
import {
  Text,
  View,
  SafeAreaView
} from '@/components/ui';
import { useOnboarding, showGlobalLoading, hideGlobalLoading } from '@/lib';
import { useRouter } from 'expo-router';
import {Pressable} from 'react-native';
import {useState, useCallback} from 'react';
import useRegisterOrEditUser from '@/features/users/hooks/useRegisterOrEditUser';
import { updateUserInfo } from '@/lib';
import { useQueryClient } from '@tanstack/react-query';
import QueryKeys from '@/service/queryKeys';

const EditExperience = () => {
  const router = useRouter();
  const userInfo = useOnboarding.use.userInfo();
  const queryClient = useQueryClient();

  const [experienceLevel, setExperienceLevel] =
      useState<ExperienceLevel | null>(userInfo?.experience_level ?? null);

  const {mutate: editUser, isPending: isUpdating} = useRegisterOrEditUser();

  const handleBack = useCallback(() => {
    router.back();
  }, []);


  if(!userInfo){
    return null;
  }

  const updateExperienceLevel = ()=>{
    if(experienceLevel){
      showGlobalLoading();
      editUser({experience_level: experienceLevel},{
        onSuccess:(data)=>{
          setExperienceLevel(data.experience_level);
          updateUserInfo(data);
          // Invalidate jobs query so user gets fresh recommendations
          queryClient.invalidateQueries({ queryKey: [QueryKeys.followedJobs] });
          hideGlobalLoading();
          router.back();
        },
        onError: () => {
          hideGlobalLoading();
        }
      })
    }
  }

  const btnDisabled = userInfo.experience_level === experienceLevel;

  return (
    <SafeAreaView
        className="flex-1 dark:bg-neutral-950"
        edges={['top', 'bottom']}
    >
      <View className='flex-1 p-2'>
        <View className='flex-1'>
          <Step1
            selectedLevel={experienceLevel}
            onSelect={setExperienceLevel}
            onBack={handleBack}
            />
        </View>
        <Pressable
        onPress={updateExperienceLevel}
        disabled={btnDisabled}
        className={`h-14 items-center justify-center rounded-xl ${
              !btnDisabled ? 'bg-black dark:bg-white' : 'bg-neutral-300'
        }`}
      >
        <Text
          className={`text-lg font-semibold ${
            !btnDisabled ? 'text-white dark:text-black' : 'text-neutral-500'
          }`}
        >
          Update
        </Text>
      </Pressable>
      </View>


    </SafeAreaView>
  )
}
export default EditExperience
