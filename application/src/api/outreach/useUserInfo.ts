import type { AxiosError } from 'axios';
import { createQuery } from 'react-query-kit';
import { client } from '../common';
// api/users/types.ts
type UserDevice = {
  id: string;
  userId: string;
  type: 'android' | 'ios' | 'web';
  token: string;
  createdAt: string;
};

type FollowedCompany = {
  id: string;
  name: string;
  logo: string;
  category: string;
  description?: string | null;
  createdAt: string;
  updatedAt: string;
};

type UserMeResponse = {
  active: boolean;
  email: string;
  clerkId: string;

  company_name?: string | null;
  college_name?: string | null;
  cgpa?: number | null;

  experience_level:
    | 'FRESHER_OR_LESS_THAN_1_YEAR'
    | 'ONE_TO_THREE_YEARS'
    | 'THREE_PLUS_YEARS';

  created_at: string;

  current_plan_start?: string | null;
  current_plan_end?: string | null;
  expiry?: string | null;

  devices: UserDevice[];
  followedCompanies: FollowedCompany[];
  planExpiry: string | null;
};

export const useMyProfile = createQuery<UserMeResponse, void, AxiosError>({
  queryKey: ['users', 'me'],
  fetcher: async () => {
    const res = await client.get('api/users/me');
    return res.data;
  },
  staleTime: Infinity, // 👈 prevents auto refetch
  refetchOnMount: false,
  refetchOnWindowFocus: false,
  refetchOnReconnect: false,
});
