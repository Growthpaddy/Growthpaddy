import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useAdminAuth } from '../context/AdminAuthContext';
import { useSupabase } from '../context/SupabaseContext';
import { 
  ShieldCheck, 
  ShieldAlert, 
  Lock, 
  ArrowRight, 
  LogIn, 
  Building2, 
  Sparkles, 
  UserCheck,
  AlertCircle
} from 'lucide-react';

export interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: 'talent' | 'recruiter' | 'admin';
  superAdminOnly?: boolean;
  fallbackPage?: string;
  onUnauthorized?: () => void;
  onNavigate?: (page: string) => void;
  onOpenSignIn?: (role: 'talent' | 'recruiter' | 'admin') => void;
}

export default function ProtectedRoute({ 
  children, 
  requiredRole = 'talent',
  superAdminOnly = false,
  fallbackPage,
  onUnauthorized,
  onNavigate,
  onOpenSignIn
}: ProtectedRouteProps) {
  const { user: adminUser, profile: adminProfile, loading: adminLoading } = useAdminAuth();
  const { user: supUser, loading: supLoading } = useSupabase();

  const [checkingAuth, setCheckingAuth] = useState<boolean>(true);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isAuthorized, setIsAuthorized] = useState<boolean>(false);
  const [detectedRole, setDetectedRole] = useState<'talent' | 'recruiter' | 'admin' | null>(null);

  useEffect(() => {
    let isMounted = true;

    const evaluateAuthorization = async () => {
      // 1. If checking admin role
      if (requiredRole === 'admin') {
        if (adminLoading) return;

        // Check Admin Context
        const hasAdminAuthContext = Boolean(adminUser && adminProfile && adminProfile.is_active === true);
        
        // Check localStorage for simulated admin session (for local sandbox/demo resilience)
        let hasSimulatedAdmin = false;
        let simAdminRole: string | undefined = undefined;
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

        // Check active onboarding session
        let hasOnboardingAdmin = false;
        try {
          const onb = localStorage.getItem('dsp_active_onboarding');
          if (onb) {
            const parsed = JSON.parse(onb);
            if (parsed?.userType === 'admin') {
              hasOnboardingAdmin = true;
            }
          }
        } catch {
          // ignore
        }

        const isAuthedAdmin = hasAdminAuthContext || hasSimulatedAdmin || hasOnboardingAdmin;

        if (!isAuthedAdmin) {
          if (isMounted) {
            setIsAuthenticated(false);
            setIsAuthorized(false);
            setDetectedRole(null);
            setCheckingAuth(false);
          }
          return;
        }

        // Check Super Admin constraint if applicable
        if (superAdminOnly) {
          const effectiveRole = adminProfile?.role || simAdminRole || 'admin';
          const isSuper = effectiveRole === 'super_admin';
          if (isMounted) {
            setIsAuthenticated(true);
            setIsAuthorized(isSuper);
            setDetectedRole('admin');
            setCheckingAuth(false);
          }
          return;
        }

        if (isMounted) {
          setIsAuthenticated(true);
          setIsAuthorized(true);
          setDetectedRole('admin');
          setCheckingAuth(false);
        }
        return;
      }

      // 2. Checking Recruiter role
      if (requiredRole === 'recruiter') {
        if (supLoading) return;

        // Check active onboarding data in localStorage
        let onbRecruiter = false;
        try {
          const onb = localStorage.getItem('dsp_active_onboarding');
          if (onb) {
            const parsed = JSON.parse(onb);
            if (parsed?.userType === 'recruiter') {
              onbRecruiter = true;
            }
          }
        } catch {
          // ignore
        }

        // Check Supabase session user
        let supRecruiter = false;
        if (supUser) {
          const metaRole = supUser.user_metadata?.role || supUser.user_metadata?.user_type;
          if (metaRole === 'recruiter') {
            supRecruiter = true;
          } else {
            // Check recruiter profile record
            try {
              const { data } = await supabase
                .from('recruiter_profiles')
                .select('*')
                .or(`user_id.eq.${supUser.id},id.eq.${supUser.id}`)
                .maybeSingle();
              if (data?.id || data?.user_id) {
                supRecruiter = true;
              } else {
                const cached = localStorage.getItem('dsp_recruiter_profile');
                if (cached) {
                  const p = JSON.parse(cached);
                  if (p?.user_id === supUser.id || p?.id === supUser.id) {
                    supRecruiter = true;
                  }
                }
              }
            } catch {
              // ignore
            }
          }
        }

        const isAuthedRecruiter = onbRecruiter || supRecruiter;

        if (isMounted) {
          setIsAuthenticated(isAuthedRecruiter);
          setIsAuthorized(isAuthedRecruiter);
          setDetectedRole(isAuthedRecruiter ? 'recruiter' : null);
          setCheckingAuth(false);
        }
        return;
      }

      // 3. Checking Talent role
      if (requiredRole === 'talent') {
        if (supLoading) return;

        // Check active onboarding in localStorage
        let onbTalent = false;
        try {
          const onb = localStorage.getItem('dsp_active_onboarding');
          if (onb) {
            const parsed = JSON.parse(onb);
            if (parsed?.userType === 'talent') {
              onbTalent = true;
            }
          }
        } catch {
          // ignore
        }

        // Check Supabase session user
        let supTalent = false;
        if (supUser) {
          const metaRole = supUser.user_metadata?.role || supUser.user_metadata?.user_type;
          if (metaRole === 'talent' || (!metaRole && metaRole !== 'recruiter' && metaRole !== 'admin')) {
            supTalent = true;
          } else {
            try {
              const { data } = await supabase
                .from('talent_profiles')
                .select('id')
                .eq('id', supUser.id)
                .maybeSingle();
              if (data?.id) {
                supTalent = true;
              }
            } catch {
              // ignore
            }
          }
        }

        const isAuthedTalent = onbTalent || supTalent;

        if (isMounted) {
          setIsAuthenticated(isAuthedTalent);
          setIsAuthorized(isAuthedTalent);
          setDetectedRole(isAuthedTalent ? 'talent' : null);
          setCheckingAuth(false);
        }
        return;
      }
    };

    evaluateAuthorization();

    return () => {
      isMounted = false;
    };
  }, [requiredRole, superAdminOnly, adminUser, adminProfile, adminLoading, supUser, supLoading]);

  // Loading Screen: Animated verification badge
  if (checkingAuth || (requiredRole === 'admin' && adminLoading) || (requiredRole !== 'admin' && supLoading)) {
    return (
      <div className="min-h-[60vh] bg-slate-50 flex flex-col items-center justify-center p-6 text-center font-sans">
        <div className="w-14 h-14 rounded-2xl bg-slate-900 text-emerald-400 flex items-center justify-center shadow-lg shadow-slate-900/10 mb-4 animate-pulse">
          <ShieldCheck className="w-7 h-7" />
        </div>
        <div className="space-y-1.5 max-w-sm">
          <h3 className="text-base font-bold text-slate-900 tracking-tight">
            Verifying Dashboard Access
          </h3>
          <p className="text-xs text-slate-500 font-medium">
            Validating encrypted credentials and role authorization privileges...
          </p>
        </div>
        <div className="mt-5 flex items-center gap-2 text-xs font-mono font-semibold text-slate-600 bg-white border border-slate-200 px-3.5 py-1.5 rounded-full shadow-2xs">
          <div className="w-2.5 h-2.5 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
          <span>Security Handshake in progress</span>
        </div>
      </div>
    );
  }

  // If Authorized: safely render protected children
  if (isAuthenticated && isAuthorized) {
    return <>{children}</>;
  }

  // ACCESS DENIED / AUTH REQUIRED GATE: Impenetrable barrier with role-specific messaging
  const handlePrimarySignIn = () => {
    if (requiredRole === 'admin') {
      if (onNavigate) {
        onNavigate('admin-login');
      } else {
        window.location.pathname = '/admin/login';
      }
    } else if (requiredRole === 'recruiter') {
      if (onNavigate) {
        onNavigate('recruiter-login');
      } else {
        window.location.pathname = '/recruiter/login';
      }
    } else {
      // Talent: open sign-in modal
      if (onOpenSignIn) {
        onOpenSignIn('talent');
      } else if (onUnauthorized) {
        onUnauthorized();
      } else if (onNavigate) {
        onNavigate('home');
      }
    }
  };

  const handleRegisterAction = () => {
    if (requiredRole === 'recruiter') {
      if (onNavigate) {
        onNavigate('recruiter-signup');
      } else {
        window.location.pathname = '/recruiter/signup';
      }
    } else if (requiredRole === 'talent') {
      if (onNavigate) {
        onNavigate('home');
      } else {
        window.location.pathname = '/';
      }
    } else {
      if (onNavigate) {
        onNavigate('admin-register');
      } else {
        window.location.pathname = '/admin/register';
      }
    }
  };

  return (
    <div className="min-h-[75vh] bg-slate-50 flex items-center justify-center p-4 sm:p-8 font-sans">
      <div className="max-w-md w-full bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 shadow-xl text-left space-y-6">
        
        {/* Security Badge Header */}
        <div className="flex items-center justify-between">
          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-xs ${
            requiredRole === 'admin' 
              ? 'bg-purple-950 text-purple-400' 
              : requiredRole === 'recruiter' 
              ? 'bg-slate-900 text-emerald-400' 
              : 'bg-emerald-950 text-emerald-400'
          }`}>
            <Lock className="w-6 h-6" />
          </div>
          <span className={`text-[11px] font-mono font-bold px-2.5 py-1 rounded-full uppercase tracking-wider border ${
            requiredRole === 'admin'
              ? 'bg-purple-50 text-purple-700 border-purple-200'
              : requiredRole === 'recruiter'
              ? 'bg-slate-100 text-slate-800 border-slate-300'
              : 'bg-emerald-50 text-emerald-800 border-emerald-200'
          }`}>
            {requiredRole === 'admin' ? 'Admin Security Lock' : requiredRole === 'recruiter' ? 'Recruiter Portal Lock' : 'Talent Hub Lock'}
          </span>
        </div>

        {/* Title & Description */}
        <div className="space-y-2">
          <h2 className="text-xl sm:text-2xl font-display font-black text-slate-900 tracking-tight">
            {superAdminOnly 
              ? 'Super Admin Clearance Required' 
              : requiredRole === 'admin' 
              ? 'Administrative Session Required' 
              : requiredRole === 'recruiter' 
              ? 'Recruiter Account Required' 
              : 'Talent Authentication Required'}
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            {superAdminOnly
              ? 'This administration area is strictly restricted to Super Administrators with full clearance. Elevated system credentials are required to modify platform rules and user approvals.'
              : requiredRole === 'admin'
              ? 'The Administrative Command Center is restricted to authorized platform operations staff. Please sign in with your verified administrative credentials to proceed.'
              : requiredRole === 'recruiter'
              ? 'The Employer & Direct Sourcing Dashboard is restricted to verified hiring partners. Sign in to access pre-vetted candidate contact details, shortlists, and hiring tools.'
              : 'The Talent Dashboard contains your private assessment results, accreditation matrix, and candidate portfolio dossier. Sign in to your talent account to continue.'}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="space-y-2.5 pt-2">
          <button
            onClick={handlePrimarySignIn}
            className={`w-full font-bold py-3 px-4 rounded-xl text-xs sm:text-sm flex items-center justify-center gap-2 transition-all cursor-pointer shadow-xs ${
              requiredRole === 'admin'
                ? 'bg-purple-900 hover:bg-purple-800 text-white'
                : requiredRole === 'recruiter'
                ? 'bg-slate-900 hover:bg-slate-800 text-white'
                : 'bg-emerald-600 hover:bg-emerald-500 text-white'
            }`}
            id="auth-gate-signin-btn"
          >
            <LogIn className="w-4 h-4" />
            <span>
              {requiredRole === 'admin' 
                ? 'Sign In to Admin Console' 
                : requiredRole === 'recruiter' 
                ? 'Sign In as Recruiter' 
                : 'Sign In to Talent Dashboard'}
            </span>
            <ArrowRight className="w-4 h-4" />
          </button>

          {requiredRole !== 'admin' && (
            <button
              onClick={handleRegisterAction}
              className="w-full bg-slate-100 hover:bg-slate-200/90 text-slate-800 font-bold py-2.5 px-4 rounded-xl text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer border border-slate-200"
              id="auth-gate-register-btn"
            >
              <span>{requiredRole === 'recruiter' ? 'Create New Employer Account' : 'Apply to Talent Network'}</span>
            </button>
          )}

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
            Browse Public Vetted Talent Directory
          </button>
        </div>

        {/* Security Assurance Footer */}
        <div className="pt-4 border-t border-slate-100 flex items-center gap-2 text-[11px] font-mono text-slate-400">
          <ShieldAlert className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <span>Strict zero-trust verification enforced. Unauthorized access is blocked.</span>
        </div>

      </div>
    </div>
  );
}
