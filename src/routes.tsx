import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import AdminGuard from './components/AdminGuard';
import AdminOperations from './components/AdminOperations';
import SuperAdminApprovalsPage from '../app/admin/approvals/page';

/**
 * Standard React Router Route Hierarchy for Vite SPA Deployments
 * 
 * Route Structure:
 * - Public: /admin/login (Admin login & invite code verification)
 * - Protected (Admin): /admin (Base operations dashboard guarded by AdminGuard)
 * - Protected (Super Admin): /admin/approvals (Guarded by AdminGuard with superAdminOnly=true)
 */
export function AdminRoutes() {
  return (
    <Routes>
      {/* 1. Public Authentication Route (Outside Guard) */}
      <Route 
        path="/admin/login" 
        element={
          <AdminOperations 
            mode="login" 
            onBackToMain={() => window.location.href = '/'} 
            onLoginSuccess={() => window.location.href = '/admin'} 
          />
        } 
      />

      {/* 2. Guarded Standard Admin Routes */}
      <Route element={<AdminGuard />}>
        <Route 
          path="/admin" 
          element={
            <AdminOperations 
              mode="dashboard" 
              onBackToMain={() => window.location.href = '/'} 
              onRedirectToLogin={() => window.location.href = '/admin/login'} 
            />
          } 
        />
        
        {/* 3. Nested Super Admin Only Routes */}
        <Route element={<AdminGuard superAdminOnly={true} />}>
          <Route path="/admin/approvals" element={<SuperAdminApprovalsPage />} />
        </Route>
      </Route>

      {/* 4. Legacy Aliases / Fallbacks */}
      <Route path="/admin-profile" element={<Navigate to="/admin" replace />} />
      <Route path="/admin-login" element={<Navigate to="/admin/login" replace />} />
    </Routes>
  );
}

export default AdminRoutes;
