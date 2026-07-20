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
        console.log('DEBUG [handleSecureLogin]: Login Auth User ID:', activeUser?.id);
        console.log('DEBUG [handleSecureLogin]: Login Auth User Type Metadata:', activeUser?.user_metadata?.user_type || activeUser?.user_metadata?.role);
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
          let { data: talent, error: talentError } = await supabase
            .from('talent_profiles')
            .select('*')
            .eq('id', userId)
            .maybeSingle();

          if (talentError) {
            console.error('Database Verification Error on talent_profiles:', talentError.message || talentError);
          }

          if (!talent) {
            console.error(`DEBUG [handleSecureLogin]: Profile query returned null for table: talent_profiles. User ID: ${userId}. Initiating auto-healing...`);
            
            // Try to find rawProfileData in local storage first
            const localProfileStr = localStorage.getItem(`mock_talent_profiles_${userId}`);
            let localProfilePayload: any = null;
            if (localProfileStr) {
              try {
                localProfilePayload = JSON.parse(localProfileStr);
              } catch (e) {
                console.error('Error parsing local talent profile during auto-healing:', e);
              }
            }

            const mapExperienceLevel = (level?: string | null): 'fresher' | 'professional' => {
              if (!level) return 'professional';
              const clean = level.toLowerCase();
              if (clean === 'fresher/newbie' || clean === 'fresher') return 'fresher';
              return 'professional';
            };

            const meta = activeUser.user_metadata || {};
            const userName = meta.full_name || meta.name || 'Onboarded Candidate';
            const careerGoal = meta.career_goal || meta.goal || 'Full-Time Remote Job';
            const specialty = meta.specialty || (meta.skills && meta.skills[0]) || 'AI Automation';
            const rawExperienceLevel = meta.experience_level || meta.level || 'Seasoned Professional';
            const experienceLevel = mapExperienceLevel(rawExperienceLevel);
            const session_responses = meta.session_responses || localProfilePayload?.session_responses || {};

            const healedPayload = {
              id: userId,
              full_name: userName,
              career_goal: careerGoal,
              specialty: specialty,
              experience_level: experienceLevel,
              email: activeUser.email,
              session_responses: session_responses,
              phase_1_quiz_passed: localProfilePayload?.phase_1_quiz_passed || false,
              vetting_status: localProfilePayload?.vetting_status || 'not_started',
              updated_at: new Date().toISOString()
            };

            console.log('DEBUG [handleSecureLogin]: Attempting to insert healed Talent Profile into Supabase database...', healedPayload);
            const { data: healedData, error: healedError } = await supabase
              .from('talent_profiles')
              .upsert(healedPayload)
              .select('*')
              .maybeSingle();

            if (healedError) {
              console.error('DEBUG [handleSecureLogin]: Profile healing database insert failed:', healedError.message);
            } else if (healedData) {
              console.log('DEBUG [handleSecureLogin]: Profile healing database insert succeeded!', healedData);
              talent = healedData;
            }
          }

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

            const mapExperienceLevelBack = (val?: string | null): 'Fresher/Newbie' | 'Seasoned Professional' => {
              if (!val) return 'Seasoned Professional';
              const clean = val.toLowerCase();
              if (clean === 'fresher' || clean === 'fresher/newbie') return 'Fresher/Newbie';
              return 'Seasoned Professional';
            };

            if (localProfile) {
              mockOnboarding = {
                userType: 'talent',
                userName: localProfile.full_name || activeUser.user_metadata?.full_name || 'Talent Specialist',
                careerGoal: localProfile.career_goal,
                specialty: localProfile.specialty,
                experienceLevel: mapExperienceLevelBack(localProfile.experience_level),
                email: activeUser.email,
              };
            } else {
              // Sign out user immediately from Supabase to prevent unauthorized session
              await supabase.auth.signOut();
              setError('Access Denied: Profile not found in talent_profiles table. Please switch tabs to login.');
              setLoading(false);
              return { success: false, user: null, onboarding: null };
            }
          } else {
            const mapExperienceLevelBack = (val?: string | null): 'Fresher/Newbie' | 'Seasoned Professional' => {
              if (!val) return 'Seasoned Professional';
              const clean = val.toLowerCase();
              if (clean === 'fresher' || clean === 'fresher/newbie') return 'Fresher/Newbie';
              return 'Seasoned Professional';
            };

            mockOnboarding = {
              userType: 'talent',
              userName: talent.full_name || activeUser.user_metadata?.full_name || 'Talent Specialist',
              careerGoal: talent.career_goal,
              specialty: talent.specialty,
              experienceLevel: mapExperienceLevelBack(talent.experience_level),
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
          let { data: recruiter, error: recruiterError } = await supabase
            .from('recruiter_profiles')
            .select('*')
            .eq('id', userId)
            .maybeSingle();

          if (recruiterError) {
            console.error('Database Verification Error on recruiter_profiles:', recruiterError.message || recruiterError);
          }

          if (!recruiter) {
            console.error(`DEBUG [handleSecureLogin]: Profile query returned null for table: recruiter_profiles. User ID: ${userId}. Initiating auto-healing...`);

            // Try to find rawCompanyData in local storage first
            const localProfileStr = localStorage.getItem(`mock_recruiter_profiles_${userId}`);
            let localProfilePayload: any = null;
            if (localProfileStr) {
              try {
                localProfilePayload = JSON.parse(localProfileStr);
              } catch (e) {
                console.error('Error parsing local recruiter profile during auto-healing:', e);
              }
            }

            const meta = activeUser.user_metadata || {};
            const organizationName = meta.organization_name || meta.org_name || 'Dynamic Partner';
            const organizationSize = meta.organization_size || meta.org_size || '1-10 Employees';
            const industryVertical = meta.industry_vertical || meta.industry || 'Digital Marketing';
            const neededTalentRole = meta.needed_talent_role || meta.needed_role || 'Full-Time Dedicated Talent';
            const session_responses = meta.session_responses || localProfilePayload?.session_responses || {};

            const healedPayload = {
              id: userId,
              organization_name: organizationName,
              organization_size: organizationSize,
              industry_vertical: industryVertical,
              needed_talent_role: neededTalentRole,
              email: activeUser.email,
              session_responses: session_responses,
              updated_at: new Date().toISOString()
            };

            console.log('DEBUG [handleSecureLogin]: Attempting to insert healed Recruiter Profile into Supabase database...', healedPayload);
            const { data: healedData, error: healedError } = await supabase
              .from('recruiter_profiles')
              .upsert(healedPayload)
              .select('*')
              .maybeSingle();

            if (healedError) {
              console.error('DEBUG [handleSecureLogin]: Profile healing database insert failed:', healedError.message);
            } else if (healedData) {
              console.log('DEBUG [handleSecureLogin]: Profile healing database insert succeeded!', healedData);
              recruiter = healedData;
            }
          }

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
              setError('Access Denied: Profile not found in recruiter_profiles table. Please switch tabs to login.');
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
