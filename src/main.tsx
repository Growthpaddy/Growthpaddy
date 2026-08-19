import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App.tsx';
import './index.css';
import { SupabaseProvider } from './context/SupabaseContext.tsx';
import { AdminAuthProvider } from './context/AdminAuthContext.tsx';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <SupabaseProvider>
        <AdminAuthProvider>
          <App />
        </AdminAuthProvider>
      </SupabaseProvider>
    </BrowserRouter>
  </StrictMode>,
);
