import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { User, Session, AuthChangeEvent } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';

export interface AdminProfile {
  id: string;
  user_id: string;
  full_name: string;
  email: string;
  role: 'super_admin' | 'admin';
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface AdminAuthContextType {
  user: User | null;
  session: Session | null;
  profile: AdminProfile | null;
  loading: boolean;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<AdminProfile | null>;
}

const AdminAuthContext = createContext<AdminAuthContextType | undefined>(undefined);

export const AdminAuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<AdminProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Fetch admin profile from admin_profiles table
  const fetchAdminProfile = useCallback(async (userId: string, userEmail?: string): Promise<AdminProfile | null> => {
    try {
      // 1. Try querying by user_id
      const { data: profileByUid, error: uidError } = await supabase
        .from('admin_profiles')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();

      if (profileByUid && !uidError) {
        return profileByUid as AdminProfile;
      }

      // 2. Fallback query by email if available
      if (userEmail) {
        const { data: profileByEmail, error: emailError } = await supabase
          .from('admin_profiles')
          .select('*')
          .ilike('email', userEmail)
          .maybeSingle();

        if (profileByEmail && !emailError) {
          // If record found by email but user_id is missing/different, sync it
          if (profileByEmail.user_id !== userId) {
            await supabase
              .from('admin_profiles')
              .update({ user_id: userId })
              .eq('id', profileByEmail.id);
          }
          return profileByEmail as AdminProfile;
        }
      }

      return null;
    } catch (err) {
      console.warn('[AdminAuthContext] Error fetching admin profile:', err);
      return null;
    }
  }, []);

  // Public method to force-refresh the current admin profile
  const refreshProfile = useCallback(async (): Promise<AdminProfile | null> => {
    if (!user) {
      setProfile(null);
      return null;
    }
    const refreshed = await fetchAdminProfile(user.id, user.email || undefined);
    setProfile(refreshed);
    return refreshed;
  }, [user, fetchAdminProfile]);

  // Handle session check and subscription
  useEffect(() => {
    let isMounted = true;

    const initializeAuth = async () => {
      try {
        const { data: { session: initialSession } } = await supabase.auth.getSession();
        
        if (!isMounted) return;

        if (initialSession?.user) {
          setSession(initialSession);
          setUser(initialSession.user);
          const adminProf = await fetchAdminProfile(initialSession.user.id, initialSession.user.email || undefined);
          if (isMounted) {
            setProfile(adminProf);
          }
        } else {
          setSession(null);
          setUser(null);
          setProfile(null);
        }
      } catch (err) {
        console.warn('[AdminAuthContext] Session initialization error:', err);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    initializeAuth();

    // Listen to real-time auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event: AuthChangeEvent, currentSession: Session | null) => {
        if (!isMounted) return;

        setSession(currentSession);
        setUser(currentSession?.user ?? null);

        if (currentSession?.user) {
          const adminProf = await fetchAdminProfile(currentSession.user.id, currentSession.user.email || undefined);
          if (isMounted) {
            setProfile(adminProf);
          }
        } else {
          if (isMounted) {
            setProfile(null);
          }
        }

        if (isMounted) {
          setLoading(false);
        }
      }
    );

    return () => {
      isMounted = false;
      subscription?.unsubscribe();
    };
  }, [fetchAdminProfile]);

  // Sign out handler
  const signOut = async () => {
    setLoading(true);
    try {
      await supabase.auth.signOut();
    } catch (err) {
      console.warn('[AdminAuthContext] Sign out error:', err);
    } finally {
      setUser(null);
      setSession(null);
      setProfile(null);
      setLoading(false);
    }
  };

  return (
    <AdminAuthContext.Provider
      value={{
        user,
        session,
        profile,
        loading,
        signOut,
        refreshProfile,
      }}
    >
      {children}
    </AdminAuthContext.Provider>
  );
};

export const useAdminAuth = (): AdminAuthContextType => {
  const context = useContext(AdminAuthContext);
  if (!context) {
    throw new Error('useAdminAuth must be used within an <AdminAuthProvider>');
  }
  return context;
};

export default AdminAuthContext;
