import { client } from './common';

export interface SocialPost {
  id: string;
  name: string;
  description: string;
  segment: string | null;
  company: string | null;
  source: string;
  source_link: string | null;
  image_link: string | null;
  created_at: string;
  created_by: string | null;
}

export interface SocialPostsPagination {
  currentPage: number;
  totalPages: number;
  totalCount: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface SocialPostsResponse {
  data: SocialPost[];
  pagination: SocialPostsPagination;
}

export const fetchSocialPosts = async ({ pageParam = 1 }: { pageParam?: number }) => {
  const { data } = await client.get<SocialPostsResponse>('/api/social-posts/all', {
    params: {
      page: pageParam,
      limit: 20,
    },
  });
  return data;
};
