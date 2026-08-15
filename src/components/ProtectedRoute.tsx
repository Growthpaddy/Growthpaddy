import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { ShieldAlert } from 'lucide-react';
import { Preloader } from './Preloader';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: 'talent' | 'recruiter' | 'admin';
  fallbackPage?: string;
}

export default function ProtectedRoute({ 
  children, 
  requiredRole = 'talent',
  fallbackPage = '/' 
}: ProtectedRouteProps) {
  const [loading, setLoading] = useState(true);
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const verifySessionAndRole = async () => {
      try {
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();

        if (sessionError || !session || !session.user) {
          if (isMounted) {
            setLoading(false);
            setAuthorized(false);
            window.history.pushState({}, '', fallbackPage);
            window.dispatchEvent(new Event('popstate'));
          }
          return;
        }

        const user = session.user;
        let role = user.user_metadata?.role || user.user_metadata?.user_type || 'talent';

        // Check user_roles table as primary source of truth if needed
        try {
          const { data: roleData } = await supabase
            .from('user_roles')
            .select('role_type')
            .eq('user_id', user.id)
            .maybeSingle();

          if (roleData?.role_type) {
            role = roleData.role_type;
          }
        } catch (roleErr) {
          console.warn('Could not query user_roles table, defaulting to metadata role:', roleErr);
        }

        // Verify if role matches requiredRole
        if (role === requiredRole || (requiredRole === 'talent' && role !== 'admin' && role !== 'recruiter')) {
          if (isMounted) {
            setAuthorized(true);
            setLoading(false);
          }
        } else {
          // Unauthorized role accessing this portal -> redirect appropriately
          let targetRedirect = fallbackPage;
          if (role === 'admin') targetRedirect = '/admin-profile';
          else if (role === 'recruiter') targetRedirect = '/recruiter-profile';

          if (isMounted) {
            setLoading(false);
            setAuthorized(false);
            window.history.pushState({}, '', targetRedirect);
            window.dispatchEvent(new Event('popstate'));
          }
        }
      } catch (err) {
        console.error('Session security guard verification failed:', err);
        if (isMounted) {
          setLoading(false);
          setAuthorized(false);
          window.history.pushState({}, '', fallbackPage);
          window.dispatchEvent(new Event('popstate'));
        }
      }
    };

    verifySessionAndRole();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT' || !session) {
        if (isMounted) {
          setAuthorized(false);
          window.history.pushState({}, '', fallbackPage);
          window.dispatchEvent(new Event('popstate'));
        }
      }
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [requiredRole, fallbackPage]);

  if (loading) {
    return <Preloader />;
  }

  if (!authorized) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center p-6 text-center space-y-4">
        <ShieldAlert className="w-12 h-12 text-rose-500" />
        <h3 className="font-display font-black text-xl uppercase tracking-tight text-white">
          Unauthorized Access Blocked
        </h3>
        <p className="text-xs text-slate-400 font-mono uppercase">
          Redirecting to default landing gateway...
        </p>
      </div>
    );
  }

  return <>{children}</>;
}
