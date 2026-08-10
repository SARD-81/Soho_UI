import { CacheProvider } from '@emotion/react';
import {
  MutationCache,
  QueryClient,
  QueryClientProvider,
} from '@tanstack/react-query';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import './index.css';
import { rtlCache } from './rtl-cache';

const createAppQueryClient = () => {
  let client: QueryClient;

  const mutationCache = new MutationCache({
    onSuccess: async () => {
      // Refresh active UI data only after a mutation actually succeeded.
      // Database persistence is handled separately by StateSyncManager, so a
      // failed mutation cannot trigger either a snapshot or a global refetch.
      await client.invalidateQueries({ type: 'active' });
    },
  });

  client = new QueryClient({
    mutationCache,
    defaultOptions: {
      queries: {
        retry: false,
        refetchOnMount: 'always',
        refetchOnWindowFocus: false,
        refetchOnReconnect: false,
        staleTime: 10_000,
        gcTime: 5 * 60 * 1000,
      },
      mutations: {
        retry: false,
      },
    },
  });

  return client;
};

const queryClient = createAppQueryClient();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AuthProvider>
      <QueryClientProvider client={queryClient}>
        <CacheProvider value={rtlCache}>
          <ThemeProvider>
            <App />
          </ThemeProvider>
        </CacheProvider>
      </QueryClientProvider>
    </AuthProvider>
  </StrictMode>
);
