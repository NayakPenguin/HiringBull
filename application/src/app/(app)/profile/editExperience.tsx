import Step1 from '@/app/onboarding/Step1';
import { ExperienceLevel } from '@/app/onboarding/types';
import {
  Text,
  View,
  SafeAreaView
} from '@/components/ui';
import { useOnboarding } from '@/lib';
import { useRouter } from 'expo-router';
import {Pressable} from 'react-native';
import {useState, useCallback, useEffect} from 'react';
import useRegisterOrEditUser from '@/features/users/hooks/useRegisterOrEditUser';
import { updateUserInfo } from '@/lib';

const EditExperience = () => {
  const router = useRouter();
  const userInfo = useOnboarding.use.userInfo();

  const [experienceLevel, setExperienceLevel] =
      useState<ExperienceLevel | null>(null);
    
  const {mutate: editUser, isPending: isUpdating} = useRegisterOrEditUser();

  const handleBack = useCallback(() => {
    router.back();
  }, []);


  if(!userInfo){
    return null;
  }

  useEffect(()=>{
    if(userInfo.experience_level){
      setExperienceLevel(userInfo.experience_level)
    }
  },[userInfo.experience_level]);

  const updateExperienceLevel = ()=>{
    if(experienceLevel){
      editUser({experience_level: experienceLevel},{
      onSuccess:(data)=>{
        setExperienceLevel(data);
        updateUserInfo(data);
      }
    })
    }
    
  }

  const btnDisabled = userInfo.experience_level === experienceLevel;

  return (
    <SafeAreaView
        className="flex-1 dark:bg-neutral-950"
        edges={['top']}
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
        disabled={btnDisabled || isUpdating}
        className={`h-14 items-center justify-center rounded-xl ${
              !btnDisabled ? 'bg-black dark:bg-white' : 'bg-neutral-300'
        }`}
      >
        <Text
          className={`text-lg font-semibold ${
            !btnDisabled ? 'text-white dark:text-black' : 'text-neutral-500'
          }`}
        >
          {isUpdating ? 'Updating...' : 'Update'}
        </Text>
      </Pressable>
      </View>
       
        
    </SafeAreaView>
  )
}
export default EditExperience