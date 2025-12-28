import { useReactQueryDevTools } from '@dev-plugins/react-query';
import {
  QueryClient,
  QueryClientProvider,
  MutationCache,
  QueryCache,
} from '@tanstack/react-query';
import * as React from 'react';
import { showMessage } from 'react-native-flash-message';

// Create QueryClient with global configuration
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000, // 30 seconds
      gcTime: 5 * 60_000, // 5 minutes (formerly cacheTime)
      retry: 2,
      refetchOnReconnect: true,
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: 0,
    },
  },
  // Global mutation cache - handles success/error toasts
  mutationCache: new MutationCache({
    onError(error) {
      showMessage({
        message: (error as Error).message || 'An error occurred',
        type: 'danger',
        icon: 'danger',
      });
    },
    onSuccess(data, _variables, _context, mutation) {
      const meta = (mutation.meta || {}) as any;
      const serverMsg = (data as any)?.message;
      const msg = meta?.successMessage || serverMsg;

      if (msg) {
        showMessage({
          message: String(msg),
          type: 'success',
          icon: 'success',
        });
      }
    },
  }),
  // Global query cache - handles query errors
  queryCache: new QueryCache({
    onError(error, query) {
      const meta = (query.meta || {}) as any;
      // Only show toast if explicitly requested via meta
      if (meta?.toastError) {
        showMessage({
          message: (error as Error).message || 'Failed to fetch data',
          type: 'danger',
          icon: 'danger',
        });
      }
    },
  }),
});

export function APIProvider({ children }: { children: React.ReactNode }) {
  useReactQueryDevTools(queryClient);
  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}
