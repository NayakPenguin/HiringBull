import { ExperienceLevel, OnboardedCompanies } from "@/app/onboarding/types";

export interface DeviceRegistration {
  token: string;
  type: 'ios' | 'android';
  deviceId: string;
}

export interface DeviceResponse {
  message: string;
  // Add other fields returned by the backend as needed
}

export type UserRegistration = {
  name: string;
  experience_level:  'ONE_TO_THREE_YEARS' | 'INTERNSHIP' | 'FRESHER_OR_LESS_THAN_1_YEAR'|'three-to-five'|'five-plus';
  resume_link: string;
  followedCompanies: string[];
} & ({ 
  is_experienced: true;
  company_name: string;
  years_of_experience: number;
} | {is_experienced: false, 
  college_name: string;cgpa: string
})


export type UserInfo = {
    "id": string,
    "clerkId": string,
    "name": string,
    "email": string,
    "active": boolean,
    "is_experienced": boolean,
    "company_name": string,
    "resume_link": string,
    "onboarding_completed": boolean|null,
    "onboarding_completed_at":string|null,
    "followedCompanies": string[] | OnboardedCompanies,
    experience_level: ExperienceLevel,
}

export function isFollowedCompanyObject(followedCompanies:  string[] | OnboardedCompanies): followedCompanies is OnboardedCompanies {
  return followedCompanies[0] !== 'string';
}