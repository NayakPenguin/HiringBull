import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';

import {
  fetchResourceCategories,
  fetchResources,
  toggleResourceBookmark,
  type CategoryCountsResponse,
  type FetchResourcesParams,
  type Resource,
  type ResourcesResponse,
} from '@/api';
import { useAuth } from '@/lib/auth';
import QueryKeys from '@/service/queryKeys';

const FIVE_MIN = 5 * 60 * 1000;

type Filters = Omit<FetchResourcesParams, 'pageParam'>;

export const useFetchResources = (filters: Filters = {}) => {
  const { isSignedIn } = useAuth();

  return useInfiniteQuery<ResourcesResponse, Error>({
    queryKey: [QueryKeys.resources, filters],
    queryFn: ({ pageParam }) =>
      fetchResources({ ...filters, pageParam: pageParam as number }),

    enabled: !!isSignedIn,
    initialPageParam: 1,

    getNextPageParam: (lastPage) => {
      if (!lastPage?.pagination?.hasNextPage) return undefined;
      return lastPage.pagination.currentPage + 1;
    },

    staleTime: FIVE_MIN,
    refetchOnWindowFocus: false,
  });
};

export const useFetchResourceCategories = () => {
  const { isSignedIn } = useAuth();

  return useQuery<CategoryCountsResponse, Error>({
    queryKey: [QueryKeys.resourceCategories],
    queryFn: fetchResourceCategories,
    enabled: !!isSignedIn,
    staleTime: FIVE_MIN,
  });
};

/**
 * Toggle bookmark with optimistic update across every cached resources query.
 */
export const useToggleResourceBookmark = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => toggleResourceBookmark(id),
    onMutate: async (id: string) => {
      await queryClient.cancelQueries({ queryKey: [QueryKeys.resources] });

      const previous = queryClient.getQueriesData<{ pages: ResourcesResponse[] }>({
        queryKey: [QueryKeys.resources],
      });

      queryClient.setQueriesData<{ pages: ResourcesResponse[] }>(
        { queryKey: [QueryKeys.resources] },
        (old) => {
          if (!old) return old;
          return {
            ...old,
            pages: old.pages.map((page) => ({
              ...page,
              data: page.data.map((r: Resource) =>
                r.id === id ? { ...r, isBookmarked: !r.isBookmarked } : r
              ),
            })),
          };
        }
      );

      return { previous };
    },
    onError: (_err, _id, ctx) => {
      ctx?.previous?.forEach(([key, value]) => {
        queryClient.setQueryData(key, value);
      });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: [QueryKeys.resources] });
    },
  });
};
