import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { CacheProvider } from '@emotion/react';
import { rtlCache } from './rtl-cache';
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from './contexts/ThemeContext';

const queryClient = new QueryClient();

createRoot(document.getElementById('root')!).render(
    <StrictMode>
        <QueryClientProvider client={queryClient}>
            <CacheProvider value={rtlCache}>
                <ThemeProvider>
                    <App />
                </ThemeProvider>
            </CacheProvider>
        </QueryClientProvider>
    </StrictMode>,
);