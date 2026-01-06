import Step2 from "@/app/onboarding/Step2";
import {
  Text,
  View,
  SafeAreaView
} from '@/components/ui';
import {Pressable} from 'react-native';
import {useState, useCallback} from 'react';
import { updateUserInfo, useOnboarding } from "@/lib";
import { useRouter } from "expo-router";
import useRegisterOrEditUser from "@/features/users/hooks/useRegisterOrEditUser";
import { isFollowedCompanyObject } from "@/features/users";
import QueryKeys from "@/service/queryKeys";
import { useIsFetching, useQueryClient } from "@tanstack/react-query";

const EditFollowedCompanies = () => {
  const router = useRouter();
  const userInfo = useOnboarding.use.userInfo();
  const queryClient = useQueryClient();

  // Initialize state from userInfo directly
  const getInitialCompanies = () => {
    if (userInfo?.followedCompanies && isFollowedCompanyObject(userInfo.followedCompanies)) {
      return userInfo.followedCompanies.map(fl => fl.id);
    }
    return [];
  };

  const [selectedCompanies, setSelectedCompanies] = useState<string[]>(getInitialCompanies);

  const {mutate: editUser, isPending: isUpdating} = useRegisterOrEditUser();

  const fetchingOnboardingCompanies = useIsFetching({ queryKey: [QueryKeys.onboardedCompanies] })

  const handleBack = useCallback(() => {
    router.back();
  }, []);


  if(!userInfo){
    return null;
  }

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
        // Invalidate jobs query so user gets fresh recommendations
        queryClient.invalidateQueries({ queryKey: [QueryKeys.followedJobs] });
        router.back();
      }
    })
  }
  const btnDisabled = (fetchingOnboardingCompanies > 0) || isUpdating;
  return (
    <SafeAreaView
        className="flex-1 dark:bg-neutral-950"
        edges={['top', 'bottom']}
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
