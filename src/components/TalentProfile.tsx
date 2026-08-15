import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useSupabase } from '../context/SupabaseContext';
import TalentDashboard from './TalentDashboard';
import { Preloader } from './Preloader';
import { 
  ShieldCheck, 
  LogOut, 
  Sparkles, 
  Sun, 
  Moon, 
  UserCheck, 
  RefreshCw, 
  CheckCircle2, 
  AlertCircle 
} from 'lucide-react';

interface TalentProfileProps {
  onSignOut?: () => void;
  navigateToPage?: (page: any) => void;
}

export default function TalentProfile({ onSignOut, navigateToPage }: TalentProfileProps) {
  const { user } = useSupabase();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isTalentPaid, setIsTalentPaid] = useState(false);

  // Fetch live profile or create missing profile row dynamically (Self-Healing)
  const fetchOrCreateTalentProfile = async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // 1. Attempt to fetch existing profile
      let { data: profileData, error: fetchErr } = await supabase
        .from('talent_profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle();

      // 2. SELF-HEALING: If no profile row exists, create it live on the fly
      if (!profileData) {
        console.log("Profile missing in talent_profiles table. Creating live profile row...");
        
        const newProfile = {
          id: user.id,
          email: user.email,
          full_name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'Talent Candidate',
          specialty: user.user_metadata?.specialty || 'AI Automation Engineer',
          experience_level: 'Seasoned Professional',
          vetting_status: 'pending',
          phase_1_quiz_passed: false,
          phase_2_interview_passed: false,
          phase_2_interview_scheduled: false,
          phase_3_fee_paid: false,
          phase_4_portfolio_submitted: false
        };

        const { data: createdProfile, error: createError } = await supabase
          .from('talent_profiles')
          .insert([newProfile])
          .select()
          .single();

        if (createError) {
          console.warn("Insert missing profile error, retrying select query:", createError.message);
          const { data: retryData } = await supabase
            .from('talent_profiles')
            .select('*')
            .eq('id', user.id)
            .maybeSingle();

          if (retryData) {
            profileData = retryData;
          } else {
            profileData = newProfile;
          }
        } else {
          profileData = createdProfile;
        }
      }

      setProfile(profileData);
      if (profileData?.phase_3_fee_paid || profileData?.vetting_status === 'fee_paid' || profileData?.vetting_status === 'completed' || profileData?.vetting_status === 'approved') {
        setIsTalentPaid(true);
      }
    } catch (err: any) {
      console.error("Error fetching/creating profile:", err);
      setError("Unable to load profile. Please refresh or try logging in again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrCreateTalentProfile();
  }, [user]);

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
    } catch (err) {
      console.warn('Sign out error:', err);
    }
    if (onSignOut) {
      onSignOut();
    } else {
      window.history.pushState({}, '', '/');
      window.dispatchEvent(new Event('popstate'));
    }
  };

  const getStatusBadge = () => {
    if (!profile) return 'INITIALIZING';
    if (profile.vetting_status === 'approved' || profile.vetting_status === 'verified') return 'VERIFIED TALENT';
    return 'IN PROGRESS';
  };

  return (
    <div className={`min-h-screen transition-colors duration-200 ${isDarkMode ? 'dark bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'}`}>
      
      {/* Modern SaaS Talent Portal Topbar */}
      <header className={`sticky top-0 z-40 border-b ${isDarkMode ? 'bg-slate-900/90 border-slate-800' : 'bg-white/90 border-slate-200'} backdrop-blur-md px-4 sm:px-8 py-3.5`}>
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-left">
          
          {/* Brand & Portal Label */}
          <div className="flex items-center gap-3">
            <div className="bg-emerald-600 text-white p-2 rounded-xl flex items-center justify-center shadow-xs">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-display font-bold text-sm tracking-tight text-slate-900 dark:text-white">
                  Digital Campux
                </span>
                <span className="text-[10px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200 px-2 py-0.5 rounded-full">
                  Candidate Workspace
                </span>
              </div>
              <p className="text-xs text-slate-500">
                {profile?.full_name || 'Candidate Dashboard'}
              </p>
            </div>
          </div>

          {/* Right Status Controls & Sign Out */}
          <div className="flex items-center gap-2.5 w-full sm:w-auto justify-between sm:justify-end">
            
            {/* Candidate Status Badge */}
            <div className={`inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-full border ${
              profile?.vetting_status === 'approved' || profile?.vetting_status === 'verified'
                ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                : 'bg-amber-50 text-amber-800 border-amber-200'
            }`}>
              <UserCheck className="w-3.5 h-3.5" />
              <span>{getStatusBadge()}</span>
            </div>

            {/* Dark/Light Mode Toggle */}
            <button
              onClick={() => setIsDarkMode(!isDarkMode)}
              title="Toggle Dark/Light Mode"
              className="p-2 border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl cursor-pointer transition"
            >
              {isDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-700" />}
            </button>

            {/* Refresh Profile Button */}
            <button
              onClick={fetchOrCreateTalentProfile}
              title="Sync Live Profile Data"
              className="p-2 border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl cursor-pointer transition"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-emerald-600' : ''}`} />
            </button>

            {/* Sign Out Button */}
            <button
              onClick={handleSignOut}
              className="bg-slate-900 hover:bg-red-600 text-white font-semibold py-1.5 px-3.5 rounded-xl text-xs flex items-center gap-1.5 cursor-pointer shadow-2xs transition"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out</span>
            </button>

          </div>

        </div>
      </header>

      {/* PORTAL BODY CONTAINER */}
      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6">
        {loading ? (
          <Preloader />
        ) : error ? (
          <div className="p-6 max-w-lg mx-auto bg-red-50 border border-red-200 text-red-800 rounded-2xl text-left space-y-3">
            <div className="flex items-center gap-2 font-semibold text-xs">
              <AlertCircle className="w-4 h-4 text-red-600" />
              <span>Profile Sync Notice</span>
            </div>
            <p className="text-xs leading-relaxed">{error}</p>
            <button
              onClick={fetchOrCreateTalentProfile}
              className="bg-red-700 text-white font-semibold px-4 py-2 text-xs rounded-xl cursor-pointer"
            >
              Retry Sync
            </button>
          </div>
        ) : (
          <TalentDashboard
            isTalentPaid={isTalentPaid}
            setIsTalentPaid={setIsTalentPaid}
            navigateToPage={navigateToPage}
            onboardingData={{
              userName: profile?.full_name || 'Talent Candidate',
              experienceLevel: profile?.experience_level === 'fresher' || profile?.experience_level === 'Fresher/Newbie' ? 'Fresher/Newbie' : 'Seasoned Professional',
              specialty: profile?.specialty || 'AI Automation',
              careerGoal: profile?.career_goal || 'Full-Time Remote Job',
              email: profile?.email,
              profilePictureUrl: profile?.profile_picture_url,
              slug: profile?.slug,
              vettingStatus: profile?.vetting_status
            }}
            onProfileUpdated={(updatedData) => {
              setProfile((prev: any) => ({ ...prev, ...updatedData }));
            }}
          />
        )}
      </main>

    </div>
  );
}
