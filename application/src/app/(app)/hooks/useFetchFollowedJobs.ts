import { fetchFollowedJobs, JobsResponse } from '@/api';
import QueryKeys from '@/service/queryKeys';
import { useAuth } from '@clerk/clerk-expo';
import { useInfiniteQuery } from '@tanstack/react-query';

const useFetchFollowedJobs = () => {
  const { isSignedIn } = useAuth();
  return useInfiniteQuery<JobsResponse, Error>({
    queryKey: [QueryKeys.followedJobs],
    queryFn: ({ pageParam }) => fetchFollowedJobs({ pageParam: pageParam as number }),
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

export default useFetchFollowedJobs;
