import React, { useEffect } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAdminAuth } from '../context/AdminAuthContext';
import { ShieldCheck, Lock, LogIn, ArrowRight } from 'lucide-react';

interface ProtectedRouteProps {
  children?: React.ReactNode;
  superAdminOnly?: boolean;
  onUnauthorized?: () => void;
  onNavigate?: (page: string) => void;
}

export const AdminProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children,
  superAdminOnly = false,
  onUnauthorized,
  onNavigate
}) => {
  const { user, profile, loading } = useAdminAuth();

  // Check fallback simulated admin
  let hasSimulatedAdmin = false;
  let simAdminRole = 'admin';
  try {
    const sim = localStorage.getItem('dsp_simulated_admin');
    if (sim) {
      const parsed = JSON.parse(sim);
      if (parsed && parsed.email && parsed.is_active) {
        hasSimulatedAdmin = true;
        simAdminRole = parsed.role;
      }
    }
  } catch {
    // ignore
  }

  const isAuthedAdmin = Boolean((user && profile && profile.is_active === true) || hasSimulatedAdmin);
  const effectiveRole = profile?.role || (hasSimulatedAdmin ? simAdminRole : 'admin');
  const isAuthorized = isAuthedAdmin && (!superAdminOnly || effectiveRole === 'super_admin');

  useEffect(() => {
    if (!loading && !isAuthorized) {
      if (onUnauthorized) {
        onUnauthorized();
      }
    }
  }, [loading, isAuthorized, onUnauthorized]);

  // 1. Show centered loading indicator while verifying admin auth state
  if (loading) {
    return (
      <div className="min-h-[60vh] bg-slate-50 flex flex-col items-center justify-center p-6 text-center font-sans">
        <div className="w-14 h-14 rounded-2xl bg-slate-900 text-purple-400 flex items-center justify-center shadow-lg shadow-slate-900/10 mb-4 animate-pulse">
          <ShieldCheck className="w-7 h-7" />
        </div>
        <div className="space-y-1.5 max-w-sm">
          <h3 className="text-base font-bold text-slate-900 tracking-tight">
            Verifying Administrator Access
          </h3>
          <p className="text-xs text-slate-500 font-medium">
            Validating encrypted credentials and security clearance...
          </p>
        </div>
        <div className="mt-5 flex items-center gap-2 text-xs font-mono font-semibold text-slate-600 bg-white border border-slate-200 px-3.5 py-1.5 rounded-full shadow-2xs">
          <div className="w-2.5 h-2.5 border-2 border-purple-600 border-t-transparent rounded-full animate-spin" />
          <span>Security Clearance Handshake</span>
        </div>
      </div>
    );
  }

  // 2. If unauthenticated, render high security barrier and trigger redirect
  if (!isAuthedAdmin) {
    return (
      <div className="min-h-[75vh] bg-slate-50 flex items-center justify-center p-4 sm:p-8 font-sans">
        <div className="max-w-md w-full bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 shadow-xl text-left space-y-6">
          <div className="flex items-center justify-between">
            <div className="w-12 h-12 rounded-2xl bg-purple-950 text-purple-400 flex items-center justify-center shadow-xs">
              <Lock className="w-6 h-6" />
            </div>
            <span className="text-[11px] font-mono font-bold px-2.5 py-1 rounded-full uppercase tracking-wider border bg-purple-50 text-purple-700 border-purple-200">
              Admin Portal Restricted
            </span>
          </div>

          <div className="space-y-2">
            <h2 className="text-xl sm:text-2xl font-display font-black text-slate-900 tracking-tight">
              Administrative Login Required
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Access to the administrative control center is strictly protected. You must log in with authorized staff credentials to view talent pipelines, quiz configurations, and candidate dossiers.
            </p>
          </div>

          <div className="space-y-2.5 pt-2">
            <button
              onClick={() => {
                if (onNavigate) {
                  onNavigate('admin-login');
                } else {
                  window.location.pathname = '/admin/login';
                }
              }}
              className="w-full bg-purple-900 hover:bg-purple-800 text-white font-bold py-3 px-4 rounded-xl text-xs sm:text-sm flex items-center justify-center gap-2 transition-all cursor-pointer shadow-xs"
              id="admin-barrier-login-btn"
            >
              <LogIn className="w-4 h-4" />
              <span>Sign In to Admin Portal</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={() => {
                if (onNavigate) {
                  onNavigate('directory');
                } else {
                  window.location.pathname = '/directory';
                }
              }}
              className="w-full text-slate-500 hover:text-slate-800 font-semibold py-2 px-4 rounded-xl text-xs text-center transition-colors cursor-pointer"
            >
              Return to Public Directory
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 3. Super admin role check if required
  if (superAdminOnly && effectiveRole !== 'super_admin') {
    return (
      <div className="min-h-[75vh] bg-slate-50 flex items-center justify-center p-4 sm:p-8 font-sans">
        <div className="max-w-md w-full bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 shadow-xl text-left space-y-6">
          <div className="flex items-center justify-between">
            <div className="w-12 h-12 rounded-2xl bg-amber-950 text-amber-400 flex items-center justify-center shadow-xs">
              <Lock className="w-6 h-6" />
            </div>
            <span className="text-[11px] font-mono font-bold px-2.5 py-1 rounded-full uppercase tracking-wider border bg-amber-50 text-amber-700 border-amber-200">
              Clearance Level Insufficient
            </span>
          </div>

          <div className="space-y-2">
            <h2 className="text-xl sm:text-2xl font-display font-black text-slate-900 tracking-tight">
              Super Admin Clearance Required
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              This specific module requires Super Administrator privileges. Your account is active as Standard Admin, but lacks authorization to approve or promote administrative accounts.
            </p>
          </div>

          <div className="space-y-2.5 pt-2">
            <button
              onClick={() => {
                if (onNavigate) {
                  onNavigate('admin-dashboard');
                } else {
                  window.location.pathname = '/admin/dashboard';
                }
              }}
              className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-3 px-4 rounded-xl text-xs sm:text-sm flex items-center justify-center gap-2 transition-all cursor-pointer shadow-xs"
            >
              <span>Return to Admin Dashboard</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 4. Authorized: render children or nested Outlet
  return children ? <>{children}</> : <Outlet />;
};

export default AdminProtectedRoute;
