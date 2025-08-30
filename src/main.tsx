import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { CacheProvider } from '@emotion/react';
import theme from './theme';
import { rtlCache } from './rtl-cache';
import { ThemeProvider, CssBaseline } from '@mui/material';
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const queryClient = new QueryClient();


createRoot(document.getElementById('root')!).render(
  <StrictMode>
      <QueryClientProvider client={queryClient}>
          <CacheProvider value={rtlCache}>
              <ThemeProvider theme={theme}>
                  <CssBaseline />
                  <App />
              </ThemeProvider>
          </CacheProvider>
      </QueryClientProvider>
  </StrictMode>,
)
