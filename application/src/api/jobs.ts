import { client } from './common';
import Domains from '../service/domains';

export interface JobCompany {
  id: string;
  name: string;
  logo: string;
}

export interface Job {
  id: string;
  title: string;
  company: string;
  companyId: string;
  segment: string;
  location: string;
  job_type: string;
  experience_level: string;
  description: string;
  apply_link: string;
  salary_range: string;
  posted_date: string;
  created_at: string;
  company_type?: string;
  updated_at: string;
  companyRel: JobCompany;
}

export interface Pagination {
  currentPage: number;
  limit: number;
  totalCount: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface JobsResponse {
  data: Job[];
  pagination: Pagination;
}

export const fetchFollowedJobs = async ({ pageParam = 1 }: { pageParam?: number }) => {
  const { data } = await client.get<JobsResponse>(Domains.jobsFollowed, {
    params: {
      page: pageParam,
      limit: 10,
    },
  });
  return data;
};
