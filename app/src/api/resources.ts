import { client } from './common';
import Domains from '../service/domains';

export type ResourceCategory =
  | 'INTERVIEW_PREP'
  | 'SYSTEM_DESIGN'
  | 'DSA'
  | 'BEHAVIORAL'
  | 'CAREER_GROWTH'
  | 'COMPANY_RESEARCH'
  | 'RESUME'
  | 'NEGOTIATION'
  | 'TECH_BLOGS'
  | 'PODCASTS_VIDEOS';

export type ResourceType =
  | 'ARTICLE'
  | 'VIDEO'
  | 'BOOK'
  | 'COURSE'
  | 'TOOL'
  | 'PODCAST'
  | 'REPO'
  | 'NEWSLETTER'
  | 'CHEATSHEET';

export interface Resource {
  id: string;
  title: string;
  description: string;
  url: string;
  category: ResourceCategory;
  type: ResourceType;
  author?: string | null;
  source?: string | null;
  thumbnail?: string | null;
  tags: string[];
  is_free: boolean;
  is_curated: boolean;
  language: string;
  difficulty?: 'beginner' | 'intermediate' | 'advanced' | null;
  estimated_min?: number | null;
  view_count: number;
  isBookmarked: boolean;
  created_at: string;
  updated_at: string;
}

export interface Pagination {
  currentPage: number;
  limit: number;
  totalCount: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface ResourcesResponse {
  data: Resource[];
  pagination: Pagination;
}

export interface CategoryCountsResponse {
  data: {
    total: number;
    byCategory: { category: ResourceCategory; count: number }[];
  };
}

export interface FetchResourcesParams {
  pageParam?: number;
  category?: ResourceCategory | '';
  type?: ResourceType | '';
  difficulty?: 'beginner' | 'intermediate' | 'advanced' | '';
  search?: string;
  bookmarkedOnly?: boolean;
}

export const fetchResources = async ({
  pageParam = 1,
  category,
  type,
  difficulty,
  search,
  bookmarkedOnly,
}: FetchResourcesParams): Promise<ResourcesResponse> => {
  const { data } = await client.get<ResourcesResponse>(Domains.resources, {
    params: {
      page: pageParam,
      limit: 20,
      ...(category ? { category } : {}),
      ...(type ? { type } : {}),
      ...(difficulty ? { difficulty } : {}),
      ...(search ? { search } : {}),
      ...(bookmarkedOnly ? { bookmarkedOnly: true } : {}),
    },
  });
  return data;
};

export const fetchResourceCategories = async (): Promise<CategoryCountsResponse> => {
  const { data } = await client.get<CategoryCountsResponse>(
    `${Domains.resources}/categories`
  );
  return data;
};

export const toggleResourceBookmark = async (
  id: string
): Promise<{ data: { isBookmarked: boolean } }> => {
  const { data } = await client.post<{ data: { isBookmarked: boolean } }>(
    `${Domains.resources}/${id}/bookmark`
  );
  return data;
};
