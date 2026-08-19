import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAdminAuth } from '../context/AdminAuthContext';
import { ShieldCheck } from 'lucide-react';

interface ProtectedRouteProps {
  children?: React.ReactNode;
  superAdminOnly?: boolean;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children,
  superAdminOnly = false 
}) => {
  const { user, profile, loading } = useAdminAuth();

  // 1. Show centered loading indicator while verifying admin auth state
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
        <div className="w-12 h-12 rounded-2xl bg-slate-900 flex items-center justify-center text-white mb-4 shadow-sm">
          <ShieldCheck className="w-6 h-6 text-emerald-400 animate-pulse" />
        </div>
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-700">
          <div className="w-4 h-4 border-2 border-slate-300 border-t-slate-900 rounded-full animate-spin" />
          <span>Verifying Administrator Access...</span>
        </div>
      </div>
    );
  }

  // 2. If unauthenticated or no profile or profile is inactive, redirect to Admin Login
  if (!user || !profile || profile.is_active !== true) {
    return <Navigate to="/admin/login" replace />;
  }

  // 3. Super admin role check if required
  if (superAdminOnly && profile.role !== 'super_admin') {
    return <Navigate to="/admin/dashboard" replace />;
  }

  // 4. Authorized: render children or nested Outlet
  return children ? <>{children}</> : <Outlet />;
};

export default ProtectedRoute;
