import type { AxiosError } from 'axios';
import { createMutation } from 'react-query-kit';

import { client } from '../common';
import type { OutreachRequest, OutreachResponse } from './types';

export const useSendOutreach = createMutation<
  OutreachResponse,
  OutreachRequest,
  AxiosError<{ error?: string }>
>({
  mutationFn: async (variables) =>
    client({
      url: 'api/outreach',
      method: 'POST',
      data: variables,
    }).then((response) => response.data),
});
