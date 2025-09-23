import { CacheProvider } from '@emotion/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import './index.css';
import { rtlCache } from './rtl-cache';

const queryClient = new QueryClient();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AuthProvider>
      <QueryClientProvider client={queryClient}>
        <ReactQueryDevtools
          initialIsOpen={false}
          buttonPosition="bottom-left"
        />
        <CacheProvider value={rtlCache}>
          <ThemeProvider>
            <App />
          </ThemeProvider>
        </CacheProvider>
      </QueryClientProvider>
    </AuthProvider>
  </StrictMode>
);
