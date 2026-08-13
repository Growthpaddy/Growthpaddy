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

  // Fetch live profile directly from Supabase DB on mount or when user changes
  const fetchLiveProfile = async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const { data, error: fetchErr } = await supabase
        .from('talent_profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (fetchErr) {
        console.warn('Could not fetch single profile from talent_profiles table:', fetchErr.message);
        // Fallback query if row missing
        const { data: maybeData } = await supabase
          .from('talent_profiles')
          .select('*')
          .eq('id', user.id)
          .maybeSingle();

        if (maybeData) {
          setProfile(maybeData);
          if (maybeData.phase_3_fee_paid || maybeData.vetting_status === 'fee_paid' || maybeData.vetting_status === 'completed') {
            setIsTalentPaid(true);
          }
        } else {
          // Construct live session fallback profile object
          setProfile({
            id: user.id,
            full_name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'Vetted Operator',
            email: user.email,
            specialty: user.user_metadata?.specialty || 'AI Automation',
            experience_level: 'Seasoned Professional',
            vetting_status: 'not_started',
            phase_1_quiz_passed: false,
            phase_2_interview_scheduled: false,
            phase_3_fee_paid: false
          });
        }
      } else if (data) {
        setProfile(data);
        if (data.phase_3_fee_paid || data.vetting_status === 'fee_paid' || data.vetting_status === 'completed') {
          setIsTalentPaid(true);
        }
      }
    } catch (err: any) {
      console.error('Exception fetching live talent profile:', err);
      setError('Could not load profile from database.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLiveProfile();
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
    if (profile.vetting_status === 'completed') return '100% VETTED & HIRED READY';
    if (profile.phase_3_fee_paid || profile.vetting_status === 'fee_paid') return 'ACCREDITATION VERIFIED';
    if (profile.phase_2_interview_passed) return 'INTERVIEW PASSED';
    if (profile.phase_2_interview_scheduled) return 'PANEL SCHEDULED';
    if (profile.phase_1_quiz_passed) return 'PHASE 1 CLEARED';
    return 'PHASE 1 IN PROGRESS';
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
            <div className="border-l-2 border-slate-300 dark:border-slate-700 pl-3">
              <span className="text-[10px] font-mono font-black uppercase tracking-widest text-[#00A86B] block">
                TALENT OPERATOR PORTAL
              </span>
              <h2 className="font-display font-black text-sm uppercase tracking-tight text-slate-900 dark:text-white">
                {profile?.full_name || 'Vetted Operator Workspace'}
              </h2>
            </div>
          </div>

          {/* Right Status Controls & Sign Out */}
          <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
            
            {/* Candidate Status Badge */}
            <div className={`inline-flex items-center gap-1.5 px-3 py-1 text-[10px] font-mono font-black uppercase tracking-wider border ${
              profile?.phase_1_quiz_passed || profile?.vetting_status === 'completed'
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
              onClick={fetchLiveProfile}
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
              onClick={fetchLiveProfile}
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
              userName: profile?.full_name || 'Vetted Operator',
              experienceLevel: profile?.experience_level === 'fresher' || profile?.experience_level === 'Fresher/Newbie' ? 'Fresher/Newbie' : 'Seasoned Professional',
              specialty: profile?.specialty || 'AI Automation',
              careerGoal: profile?.career_goal || 'Full-Time Remote Job',
              email: profile?.email
            }}
          />
        )}
      </main>

    </div>
  );
}
