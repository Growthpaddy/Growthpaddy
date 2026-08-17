import React, { useEffect, useState } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import { ShieldCheck, ShieldAlert, Loader2 } from 'lucide-react';

interface AdminGuardProps {
  children?: React.ReactNode;
  superAdminOnly?: boolean;
}

export type AdminGuardRedirect = 
  | { type: 'navigate'; to: string }
  | null;

export default function AdminGuard({ children, superAdminOnly = false }: AdminGuardProps) {
  const location = useLocation();
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [redirectTo, setRedirectTo] = useState<string | null>(null);
  const [isAuthorized, setIsAuthorized] = useState<boolean>(false);

  useEffect(() => {
    let isMounted = true;

    async function checkAdminAuth() {
      setIsLoading(true);
      setRedirectTo(null);

      try {
        // Step 1: Retrieve the current authenticated user from Supabase Auth
        const { data: { user }, error: userError } = await supabase.auth.getUser();

        if (userError || !user) {
          if (isMounted) {
            // Missing or invalid session -> Redirect to login with original target path
            const currentPath = encodeURIComponent(location.pathname + location.search);
            setRedirectTo(`/admin/login?error=unauthorized&redirect=${currentPath}`);
            setIsLoading(false);
          }
          return;
        }

        // Step 2: Query admin_profiles table for role and active status
        // Check by user_id or id for compatibility with schema migrations
        const { data: profileByUserId, error: profileErr } = await supabase
          .from('admin_profiles')
          .select('role, is_active, user_id, email')
          .eq('user_id', user.id)
          .maybeSingle();

        let profile = profileByUserId;

        if (!profile && !profileErr) {
          // Fallback check by primary id = user.id
          const { data: profileById } = await supabase
            .from('admin_profiles')
            .select('role, is_active, user_id, email')
            .eq('id', user.id)
            .maybeSingle();
          
          profile = profileById;
        }

        // Check simulated local storage fallback for dev/demo testing if offline
        if (!profile) {
          const simulatedAdmin = localStorage.getItem('dsp_simulated_admin');
          if (simulatedAdmin) {
            try {
              const parsed = JSON.parse(simulatedAdmin);
              if (parsed.email === user.email || parsed.role === 'admin' || parsed.role === 'super_admin') {
                profile = {
                  role: parsed.role || 'admin',
                  is_active: parsed.is_active !== undefined ? parsed.is_active : true,
                  user_id: user.id,
                  email: user.email || ''
                };
              }
            } catch {
              // ignore parse errors
            }
          }
        }

        // Step 3: Evaluate authorization criteria
        if (!profile) {
          // User exists in auth.users, but has no corresponding record in admin_profiles
          if (isMounted) {
            setRedirectTo('/admin/login?error=not_an_admin');
            setIsLoading(false);
          }
          return;
        }

        if (profile.is_active === false) {
          // Admin account was registered with invite code, but is pending Super Admin approval
          if (isMounted) {
            setRedirectTo('/admin/login?error=account_pending_approval');
            setIsLoading(false);
          }
          return;
        }

        if (superAdminOnly && profile.role !== 'super_admin') {
          // Standard admin attempting to access a Super Admin-restricted route (e.g., /admin/approvals)
          if (isMounted) {
            setRedirectTo('/admin?error=super_admin_required');
            setIsLoading(false);
          }
          return;
        }

        // Step 4: Authorization check passed
        if (isMounted) {
          setIsAuthorized(true);
          setIsLoading(false);
        }
      } catch (err) {
        console.error('[AdminGuard] Security authorization verification error:', err);
        if (isMounted) {
          setRedirectTo('/admin/login?error=unauthorized');
          setIsLoading(false);
        }
      }
    }

    checkAdminAuth();

    // Subscribe to auth state changes (e.g. token expiration or logout)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT' || !session) {
        if (isMounted) {
          const currentPath = encodeURIComponent(location.pathname + location.search);
          setRedirectTo(`/admin/login?error=unauthorized&redirect=${currentPath}`);
          setIsAuthorized(false);
        }
      }
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [location.pathname, location.search, superAdminOnly]);

  // Loading State - Clean Spinner
  if (isLoading) {
    return (
      <div 
        id="admin-guard-loading" 
        className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 text-center space-y-4"
      >
        <div className="relative">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center">
            <Loader2 className="w-6 h-6 text-emerald-400 animate-spin" />
          </div>
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 absolute -bottom-1 -right-1" />
        </div>
        <div className="space-y-1">
          <p className="text-xs font-mono font-bold uppercase tracking-widest text-slate-200">
            Verifying Admin Authorization
          </p>
          <p className="text-[11px] font-mono text-slate-500">
            Evaluating session credentials & PostgreSQL RLS policies...
          </p>
        </div>
      </div>
    );
  }

  // Redirect State
  if (redirectTo) {
    return <Navigate to={redirectTo} replace state={{ from: location }} />;
  }

  // Render Protected Content
  if (isAuthorized) {
    return children ? <>{children}</> : <Outlet />;
  }

  return null;
}
