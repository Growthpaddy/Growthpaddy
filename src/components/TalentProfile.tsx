import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useSupabase } from '../context/SupabaseContext';
import TalentDashboard from './TalentDashboard';
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

  // Helper status text for topbar badge
  const getStatusBadge = () => {
    if (!profile) return 'INITIALIZING';
    if (profile.vetting_status === 'approved' || profile.vetting_status === 'verified') return 'VERIFIED SKILLS';
    return 'UNVERIFIED SKILLS';
  };

  return (
    <div className={`min-h-screen transition-colors duration-200 ${isDarkMode ? 'dark bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'}`}>
      
      {/* ISOLATED TALENT PORTAL TOPBAR */}
      <header className={`sticky top-0 z-40 border-b-2 ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-neutral-900'} px-4 sm:px-8 py-3.5 shadow-sm`}>
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-left">
          
          {/* Brand & Portal Label */}
          <div className="flex items-center gap-3">
            <div className="bg-[#00A86B] text-white p-2 font-mono font-black text-sm tracking-tighter flex items-center gap-1.5 border-2 border-neutral-950">
              <Sparkles className="w-4 h-4 text-white" />
              <span>GROWTHPADDY</span>
            </div>
            <div className="border-l-2 border-slate-300 dark:border-slate-700 pl-3 flex items-center gap-2.5">
              {profile?.profile_picture_url ? (
                <img
                  src={profile.profile_picture_url}
                  alt={profile?.full_name || 'Talent Avatar'}
                  className="w-10 h-10 border-2 border-[#00A86B] object-cover shrink-0 shadow-xs"
                />
              ) : (
                <div className="w-10 h-10 bg-neutral-950 text-emerald-400 font-mono font-black text-sm flex items-center justify-center border-2 border-[#00A86B] shrink-0">
                  {profile?.full_name ? profile.full_name.charAt(0).toUpperCase() : 'T'}
                </div>
              )}
              <div>
                <span className="text-[10px] font-mono font-black uppercase tracking-widest text-[#00A86B] block">
                  TALENT PORTAL
                </span>
                <h2 className="font-display font-black text-sm uppercase tracking-tight text-slate-900 dark:text-white">
                  {profile?.full_name || 'Talent Workspace'}
                </h2>
              </div>
            </div>
          </div>

          {/* Right Status Controls & Sign Out */}
          <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
            
            {/* Candidate Status Badge */}
            <div className={`inline-flex items-center gap-1.5 px-3 py-1 text-[10px] font-mono font-black uppercase tracking-wider border ${
              profile?.vetting_status === 'approved' || profile?.vetting_status === 'verified'
                ? 'bg-emerald-50 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border-emerald-300 dark:border-emerald-700'
                : 'bg-amber-50 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 border-amber-300 dark:border-amber-700'
            }`}>
              <UserCheck className="w-3.5 h-3.5" />
              <span>{getStatusBadge()}</span>
            </div>

            {/* Dark/Light Mode Toggle */}
            <button
              onClick={() => setIsDarkMode(!isDarkMode)}
              title="Toggle Dark/Light Mode"
              className="p-2 border-2 border-neutral-950 dark:border-slate-700 bg-neutral-100 dark:bg-slate-800 text-neutral-800 dark:text-slate-200 hover:bg-neutral-200 dark:hover:bg-slate-700 cursor-pointer transition-colors"
            >
              {isDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-700" />}
            </button>

            {/* Refresh Profile Button */}
            <button
              onClick={fetchOrCreateTalentProfile}
              title="Sync Live DB Record"
              className="p-2 border-2 border-neutral-950 dark:border-slate-700 bg-neutral-100 dark:bg-slate-800 text-neutral-800 dark:text-slate-200 hover:bg-neutral-200 dark:hover:bg-slate-700 cursor-pointer transition-colors"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-[#00A86B]' : ''}`} />
            </button>

            {/* Sign Out Button */}
            <button
              onClick={handleSignOut}
              className="bg-rose-600 hover:bg-rose-700 text-white font-black py-1.5 px-3.5 border-2 border-neutral-950 text-[10px] uppercase tracking-widest flex items-center gap-1.5 cursor-pointer shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-none transition-all"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out</span>
            </button>

          </div>

        </div>
      </header>

      {/* PORTAL BODY CONTAINER */}
      <main className="max-w-7xl mx-auto py-6">
        {loading ? (
          <div className="p-16 text-center space-y-4">
            <RefreshCw className="w-10 h-10 text-[#00A86B] animate-spin mx-auto" />
            <p className="text-xs font-mono font-bold uppercase tracking-wider text-slate-500">
              Synchronizing Live Supabase Profile Row...
            </p>
          </div>
        ) : error ? (
          <div className="p-8 max-w-lg mx-auto bg-rose-50 border-2 border-rose-600 text-rose-900 text-left space-y-3">
            <div className="flex items-center gap-2 font-mono font-black text-xs uppercase">
              <AlertCircle className="w-4 h-4 text-rose-600" />
              <span>Profile Sync Error</span>
            </div>
            <p className="text-xs font-medium">{error}</p>
            <button
              onClick={fetchOrCreateTalentProfile}
              className="bg-rose-900 text-white font-black px-4 py-2 text-[10px] uppercase tracking-wider cursor-pointer"
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
