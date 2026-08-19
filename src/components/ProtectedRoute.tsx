import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAdminAuth } from '../context/AdminAuthContext';
import { ShieldCheck, ShieldAlert } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: 'talent' | 'recruiter' | 'admin';
  fallbackPage?: string;
}

export default function ProtectedRoute({ 
  children, 
  requiredRole = 'admin',
  fallbackPage = '/admin/login' 
}: ProtectedRouteProps) {
  const { user: adminUser, profile: adminProfile, loading: adminLoading } = useAdminAuth();

  // If safeguarding admin portal
  if (requiredRole === 'admin') {
    if (adminLoading) {
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

    if (!adminUser || !adminProfile || adminProfile.is_active !== true) {
      return <Navigate to={fallbackPage} replace />;
    }

    return <>{children}</>;
  }

  // Generic role protection for other areas
  return <>{children}</>;
}
