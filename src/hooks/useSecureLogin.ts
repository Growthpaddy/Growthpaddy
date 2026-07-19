import { useState } from 'react';
import { supabase } from '../lib/supabaseClient';

export interface UseSecureLoginReturn {
  loading: boolean;
  error: string | null;
  setError: (err: string | null) => void;
  handleSecureLogin: (
    email: string,
    password: string,
    selectedRole: 'talent' | 'recruiter' | 'admin'
  ) => Promise<{ success: boolean; user: any; onboarding: any }>;
}

export function useSecureLogin(): UseSecureLoginReturn {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleSecureLogin = async (
    email: string,
    password: string,
    selectedRole: 'talent' | 'recruiter' | 'admin'
  ): Promise<{ success: boolean; user: any; onboarding: any }> => {
    setLoading(true);
    setError(null);

    const cleanedEmail = email.trim();
    const cleanedPassword = password.trim();

    if (!cleanedEmail || !cleanedPassword) {
      setError('Please provide both email and password.');
      setLoading(false);
      return { success: false, user: null, onboarding: null };
    }

    try {
      let activeUser = null;
      let isMockUser = false;
      let mockOnboarding = null;

      // Step 1: Query Supabase Auth Engine
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: cleanedEmail,
        password: cleanedPassword,
      });

      if (authError) {
        // Fallback to local storage registered users simulation for development/sandbox mode
        const rawUsers = localStorage.getItem('dsp_registered_users');
        const users = rawUsers ? JSON.parse(rawUsers) : [];
        let found = users.find(
          (u: any) => u.email.toLowerCase() === cleanedEmail.toLowerCase() && u.password === cleanedPassword
        );

        // If not found in standard users, check simulated admins db
        if (!found) {
          const rawAdmins = localStorage.getItem('dsp_simulated_admins_db');
          const admins = rawAdmins ? JSON.parse(rawAdmins) : [];
          const adminFound = admins.find(
            (a: any) => a.email.toLowerCase() === cleanedEmail.toLowerCase() && a.password === cleanedPassword
          );
          if (adminFound) {
            found = {
              email: adminFound.email,
              password: adminFound.password,
              userName: adminFound.fullName,
              userType: 'admin',
              onboarding: {
                userType: 'admin',
                userName: adminFound.fullName,
                email: adminFound.email
              }
            };
          }
        }

        if (found) {
          isMockUser = true;
          activeUser = {
            id: found.email,
            email: found.email,
            user_metadata: {
              user_type: found.userType,
              role: found.userType,
              full_name: found.userName,
            },
          };
          mockOnboarding = found.onboarding;
        } else {
          // If neither Supabase nor mock matches, immediately stop and show credentials error
          setError('Invalid login credentials.');
          setLoading(false);
          return { success: false, user: null, onboarding: null };
        }
      } else {
        activeUser = authData.user;
      }

      if (!activeUser) {
        setError('Invalid login credentials.');
        setLoading(false);
        return { success: false, user: null, onboarding: null };
      }

      const userId = activeUser.id;

      // Step 2: Query Profile Enforcer Tables based on chosen gateway role
      if (selectedRole === 'talent') {
        if (isMockUser) {
          if (activeUser.user_metadata?.user_type !== 'talent') {
            setError('Access Denied: This account is registered as a Recruiter/Admin. Please switch tabs to login.');
            setLoading(false);
            return { success: false, user: null, onboarding: null };
          }
        } else {
          // Check user_metadata first to see if they are actually a Recruiter or Admin
          if (activeUser.user_metadata?.user_type === 'recruiter' || activeUser.user_metadata?.role === 'recruiter' || activeUser.user_metadata?.role === 'admin' || activeUser.user_metadata?.user_type === 'admin') {
            await supabase.auth.signOut();
            setError('Access Denied: This account is registered with a different role. Please switch tabs to login.');
            setLoading(false);
            return { success: false, user: null, onboarding: null };
          }

          // Query Supabase talent_profiles
          const { data: talent, error: talentError } = await supabase
            .from('talent_profiles')
            .select('id, full_name, career_goal, specialty, experience_level, vetting_status')
            .eq('id', userId)
            .maybeSingle();

          if (talentError || !talent) {
            // Check localStorage sandbox fallback for profile sync
            const localProfileStr = localStorage.getItem(`mock_talent_profiles_${userId}`);
            let localProfile = null;
            if (localProfileStr) {
              try {
                localProfile = JSON.parse(localProfileStr);
              } catch (e) {
                console.error('Error parsing local talent profile:', e);
              }
            }

            if (localProfile) {
              mockOnboarding = {
                userType: 'talent',
                userName: localProfile.full_name || activeUser.user_metadata?.full_name || 'Talent Specialist',
                careerGoal: localProfile.career_goal,
                specialty: localProfile.specialty,
                experienceLevel: localProfile.experience_level,
                email: activeUser.email,
              };
            } else {
              // Sign out user immediately from Supabase to prevent unauthorized session
              await supabase.auth.signOut();
              setError('Access Denied: Profile not found. Please switch tabs to login.');
              setLoading(false);
              return { success: false, user: null, onboarding: null };
            }
          } else {
            mockOnboarding = {
              userType: 'talent',
              userName: talent.full_name || activeUser.user_metadata?.full_name || 'Talent Specialist',
              careerGoal: talent.career_goal,
              specialty: talent.specialty,
              experienceLevel: talent.experience_level,
              email: activeUser.email,
            };
          }
        }
      } else if (selectedRole === 'recruiter') {
        if (isMockUser) {
          if (activeUser.user_metadata?.user_type !== 'recruiter') {
            setError('Access Denied: This account is registered with a different role. Please switch tabs to login.');
            setLoading(false);
            return { success: false, user: null, onboarding: null };
          }
        } else {
          // Check user_metadata first to see if they are actually a Talent or Admin
          if (activeUser.user_metadata?.user_type === 'talent' || activeUser.user_metadata?.role === 'talent' || activeUser.user_metadata?.role === 'admin' || activeUser.user_metadata?.user_type === 'admin') {
            await supabase.auth.signOut();
            setError('Access Denied: This account is registered with a different role. Please switch tabs to login.');
            setLoading(false);
            return { success: false, user: null, onboarding: null };
          }

          // Query Supabase recruiter_profiles
          const { data: recruiter, error: recruiterError } = await supabase
            .from('recruiter_profiles')
            .select('id, organization_name, organization_size, industry_vertical, needed_talent_role')
            .eq('id', userId)
            .maybeSingle();

          if (recruiterError || !recruiter) {
            // Check localStorage sandbox fallback for profile sync
            const localProfileStr = localStorage.getItem(`mock_recruiter_profiles_${userId}`);
            let localProfile = null;
            if (localProfileStr) {
              try {
                localProfile = JSON.parse(localProfileStr);
              } catch (e) {
                console.error('Error parsing local recruiter profile:', e);
              }
            }

            if (localProfile) {
              mockOnboarding = {
                userType: 'recruiter',
                userName: localProfile.organization_name || activeUser.user_metadata?.full_name || 'Recruiter Client',
                orgName: localProfile.organization_name,
                orgSize: localProfile.organization_size,
                industry: localProfile.industry_vertical,
                neededRole: localProfile.needed_talent_role,
                email: activeUser.email,
              };
            } else {
              // Sign out user immediately from Supabase to prevent unauthorized session
              await supabase.auth.signOut();
              setError('Access Denied: Profile not found. Please switch tabs to login.');
              setLoading(false);
              return { success: false, user: null, onboarding: null };
            }
          } else {
            mockOnboarding = {
              userType: 'recruiter',
              userName: recruiter.organization_name || activeUser.user_metadata?.full_name || 'Recruiter Client',
              orgName: recruiter.organization_name,
              orgSize: recruiter.organization_size,
              industry: recruiter.industry_vertical,
              neededRole: recruiter.needed_talent_role,
              email: activeUser.email,
            };
          }
        }
      } else if (selectedRole === 'admin') {
        if (isMockUser) {
          if (activeUser.user_metadata?.user_type !== 'admin' && activeUser.user_metadata?.role !== 'admin') {
            setError('Access Denied: This account is not registered as an Administrator.');
            setLoading(false);
            return { success: false, user: null, onboarding: null };
          }
        } else {
          // Check user_metadata first to see if they are actually an Admin
          if (activeUser.user_metadata?.role !== 'admin' && activeUser.user_metadata?.user_type !== 'admin') {
            await supabase.auth.signOut();
            setError('Access Denied: This account is not registered as an Administrator.');
            setLoading(false);
            return { success: false, user: null, onboarding: null };
          }

          mockOnboarding = {
            userType: 'admin',
            userName: activeUser.user_metadata?.full_name || 'System Staff',
            email: activeUser.email,
          };
        }
      }

      setLoading(false);
      return { success: true, user: activeUser, onboarding: mockOnboarding };
    } catch (err: any) {
      console.error('Secure Login Exception:', err);
      setError(err.message || 'An unexpected error occurred during role verification.');
      setLoading(false);
      return { success: false, user: null, onboarding: null };
    }
  };

  return {
    loading,
    error,
    setError,
    handleSecureLogin,
  };
}
