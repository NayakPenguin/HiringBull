import { fetchSocialPosts, SocialPostsResponse } from '@/api';
import QueryKeys from '@/service/queryKeys';
import { useAuth } from '@clerk/clerk-expo';
import { useInfiniteQuery } from '@tanstack/react-query';

export const useFetchSocialPosts = () => {
  const { isSignedIn } = useAuth();
  return useInfiniteQuery<SocialPostsResponse, Error>({
    queryKey: [QueryKeys.socialPosts],
    queryFn: ({ pageParam }) => fetchSocialPosts({ pageParam: pageParam as number }),
    enabled: !!isSignedIn,
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      if (!lastPage || !lastPage.pagination) {
        return undefined;
      }
      if (lastPage.pagination.hasNextPage) {
        return lastPage.pagination.currentPage + 1;
      }
      return undefined;
    },
  });
};
