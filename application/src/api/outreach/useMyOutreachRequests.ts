import type { AxiosError } from 'axios';
import { createQuery } from 'react-query-kit';
import { client } from '../common';

/** Backend response shape */
export type OutreachApiItem = {
  reply: any;
  id: string;
  email: string;
  companyName: string;
  reason: string;
  jobId?: string;
  resumeLink?: string;
  message: string;
  status: 'PENDING' | 'SENT' | 'REPLIED';
  createdAt: string;
  reviewedAt?: string;
  sentAt?: string;
};

export const useMyOutreachRequests = createQuery<
  OutreachApiItem[],
  void,
  AxiosError
>({
  queryKey: ['outreach', 'me'],
  fetcher: async () => {
    const res = await client.get('api/outreach/me');
    return res.data;
  },
});
