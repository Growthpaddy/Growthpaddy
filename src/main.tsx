import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import App from './App.tsx';
import './index.css';
import { SupabaseProvider } from './context/SupabaseContext.tsx';
import { AdminAuthProvider } from './context/AdminAuthContext.tsx';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 30, // 30 seconds fresh
      gcTime: 1000 * 60 * 5, // 5 minutes cache retention
      refetchOnWindowFocus: true,
      retry: 1,
    },
  },
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <SupabaseProvider>
          <AdminAuthProvider>
            <App />
          </AdminAuthProvider>
        </SupabaseProvider>
      </BrowserRouter>
    </QueryClientProvider>
  </StrictMode>,
);
