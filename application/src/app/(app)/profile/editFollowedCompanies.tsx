import Step2 from "@/app/onboarding/Step2";
import {
  Text,
  View,
  SafeAreaView
} from '@/components/ui';
import {Pressable} from 'react-native';
import {useState, useEffect, useCallback} from 'react';
import { updateUserInfo, useOnboarding } from "@/lib";
import { useRouter } from "expo-router";
import useRegisterOrEditUser from "@/features/users/hooks/useRegisterOrEditUser";
import { isFollowedCompanyObject } from "@/features/users";
import QueryKeys from "@/service/queryKeys";
import { useIsFetching } from "@tanstack/react-query";

const EditFollowedCompanies = () => {
    const router = useRouter();
  const userInfo = useOnboarding.use.userInfo();

  const [selectedCompanies, setSelectedCompanies] = useState<string[]>([]);
  
    
  const {mutate: editUser, isPending: isUpdating} = useRegisterOrEditUser();

  const fetchingOnboardingCompanies = useIsFetching({ queryKey: [QueryKeys.onboardedCompanies] })

  const handleBack = useCallback(() => {
    router.back();
  }, []);


  if(!userInfo){
    return null;
  }

  useEffect(()=>{
    if(userInfo.followedCompanies){
        if(isFollowedCompanyObject(userInfo.followedCompanies)){
         setSelectedCompanies(userInfo.followedCompanies.map(fl=> fl.id))
        }
    }
  },[]);

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

  const updateFollowedCompanies = ()=>{
    editUser({followedCompanies:selectedCompanies}, {
        onSuccess:(data)=>{
        updateUserInfo(data);
      }
    })
  } 
  const btnDisabled = (fetchingOnboardingCompanies > 0) || isUpdating;
  return (
    <SafeAreaView
        className="flex-1 dark:bg-neutral-950"
        edges={['top']}
    >
      <View className='flex-1 p-2'>
        <View className='flex-1'>
          <Step2
            selectedCompanies={selectedCompanies}
            onToggle={handleToggleCompany}
            onBack={handleBack}
            onSelectAll={handleSelectAll}
            label="Edit Companies"
            />
        </View>
        <Pressable
        onPress={updateFollowedCompanies}
        disabled={btnDisabled }
        className={`h-14 items-center justify-center rounded-xl ${
              !btnDisabled ? 'bg-black dark:bg-white' : 'bg-neutral-300'
        }`}
      >
        <Text
          className={`text-lg font-semibold ${
            !btnDisabled ? 'text-white dark:text-black' : 'text-neutral-500'
          }`}
        >
          {fetchingOnboardingCompanies ? 'Fetching companies...' : isUpdating ? 'Updating...' : 'Update'}
        </Text>
      </Pressable>
      </View>
       
        
    </SafeAreaView>
  )
}
export default EditFollowedCompanies;