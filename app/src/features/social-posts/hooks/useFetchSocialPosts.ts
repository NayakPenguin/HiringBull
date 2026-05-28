import { useAuth } from '@/lib/auth';
import { useInfiniteQuery } from '@tanstack/react-query';

import { fetchSocialPosts, type SocialPostsResponse } from '@/api';
import QueryKeys from '@/service/queryKeys';
const TEN_MIN = 10 * 60 * 1000;

export const useFetchSocialPosts = () => {
  const { isSignedIn } = useAuth();

  return useInfiniteQuery<SocialPostsResponse, Error>({
    queryKey: [QueryKeys.socialPosts],
    queryFn: ({ pageParam }) =>
      fetchSocialPosts({ pageParam: pageParam as number }),

    enabled: !!isSignedIn,
    initialPageParam: 1,

    getNextPageParam: (lastPage) => {
      if (!lastPage?.pagination?.hasNextPage) return undefined;
      return lastPage.pagination.currentPage + 1;
    },

    staleTime: 0,
    refetchInterval: TEN_MIN,
    refetchIntervalInBackground: false,
    refetchOnWindowFocus: true,
  });
};
