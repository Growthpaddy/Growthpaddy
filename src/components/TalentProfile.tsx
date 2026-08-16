import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useSupabase } from '../context/SupabaseContext';
import TalentDashboard from './TalentDashboard';
import TalentResumeEditor from './TalentResumeEditor';
import TalentPortfolioModal from './TalentPortfolioModal';
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
  AlertCircle,
  Briefcase,
  Lock,
  CheckCircle,
  FileText,
  Award,
  Eye,
  ArrowUpRight
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
  const [isTalentPaid, setIsTalentPaid] = useState(false);
  const [statusToast, setStatusToast] = useState<string | null>(null);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  // Active view in candidate workspace: 'resume' (Executive CV Editor) or 'assessment' (3-Phase Vetting)
  const [workspaceMode, setWorkspaceMode] = useState<'resume' | 'assessment'>('resume');
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
  const [previewSlug, setPreviewSlug] = useState<string>('');

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
          headline: 'Senior AI Automation Engineer & Growth Lead',
          specialty: user.user_metadata?.specialty || 'AI Automation Engineer',
          experience_level: 'Seasoned Professional',
          vetting_status: 'pending',
          availability_status: 'available',
          hourly_rate: '$65/hr',
          monthly_retainer: '$4,500/mo',
          location: 'Lagos, Nigeria • Remote Global',
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

      // Ensure availability_status default is 'available'
      if (!profileData.availability_status) {
        profileData.availability_status = 'available';
      }

      setProfile(profileData);
      setPreviewSlug(profileData.slug || profileData.full_name?.toLowerCase().replace(/[^a-z0-9]+/g, '-') || 'vetted-candidate');
      
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

  // Status Change Handler ('available' vs 'hired')
  const handleStatusChange = async (newStatus: 'available' | 'hired') => {
    try {
      setIsUpdatingStatus(true);
      const { data: { user: authUser } } = await supabase.auth.getUser();
      const targetUser = authUser || user;
      if (!targetUser) return;

      const { error } = await supabase
        .from('talent_profiles')
        .update({ 
          availability_status: newStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', targetUser.id);

      if (error) {
        console.warn("Supabase update availability status error:", error);
      }

      // Update local storage backup for rapid offline sync
      try {
        const storedKey = `digitalcampux_talent_profile_${targetUser.id}`;
        const stored = localStorage.getItem(storedKey);
        if (stored) {
          const parsed = JSON.parse(stored);
          parsed.availability_status = newStatus;
          localStorage.setItem(storedKey, JSON.stringify(parsed));
        }
      } catch (lsErr) {
        console.warn('LocalStorage sync warning:', lsErr);
      }

      // Update local state
      setProfile((prev: any) => ({ ...prev, availability_status: newStatus }));
      setStatusToast(newStatus === 'available' ? 'Status updated: Available for Hire 🟢' : 'Status updated: Marked as Currently Hired 🔒');
      setTimeout(() => setStatusToast(null), 3500);
    } catch (err: any) {
      console.error("Error updating availability status:", err);
    } finally {
      setIsUpdatingStatus(false);
    }
  };

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

  const currentAvailability: 'available' | 'hired' = profile?.availability_status === 'hired' ? 'hired' : 'available';

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-emerald-500 selection:text-white">
      
      {/* Toast Notification */}
      {statusToast && (
        <div className="fixed top-6 right-6 z-50 bg-white text-slate-900 border-2 border-emerald-500 px-4 py-3 rounded-2xl shadow-xl flex items-center gap-3 animate-fadeIn">
          <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
          <div>
            <p className="font-mono text-[10px] font-bold uppercase text-emerald-700">Live Status Update</p>
            <p className="text-xs font-bold text-slate-900">{statusToast}</p>
          </div>
          <button onClick={() => setStatusToast(null)} className="ml-2 text-slate-400 hover:text-slate-700 font-mono text-xs cursor-pointer">✕</button>
        </div>
      )}

      {/* Modern Plain Light SaaS Talent Portal Topbar */}
      <header className="sticky top-0 z-40 border-b bg-white/95 border-slate-200/80 backdrop-blur-md px-4 sm:px-8 py-3.5 shadow-2xs">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-left">
          
          {/* Brand & Portal Label */}
          <div className="flex items-center gap-3">
            <div className="bg-emerald-600 text-white p-2 rounded-xl flex items-center justify-center shadow-xs font-bold">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-display font-black text-sm tracking-tight text-slate-900">
                  GrowthPaddy
                </span>
                <span className="text-[10px] font-mono font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-full">
                  Candidate Workspace
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium">
                {profile?.full_name || 'Candidate Dashboard'}
              </p>
            </div>
          </div>

          {/* Right Status Controls & Actions */}
          <div className="flex items-center gap-2.5 w-full sm:w-auto justify-between sm:justify-end flex-wrap">
            
            {/* Live Portfolio Preview Trigger */}
            <button
              onClick={() => {
                setPreviewSlug(profile?.slug || profile?.full_name?.toLowerCase().replace(/[^a-z0-9]+/g, '-') || 'candidate');
                setIsPreviewModalOpen(true);
              }}
              className="flex items-center gap-1.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 font-mono text-xs font-bold px-3.5 py-1.5 rounded-xl transition cursor-pointer shadow-2xs"
              title="Open public portfolio view"
            >
              <Eye className="w-3.5 h-3.5 text-emerald-600" />
              <span>Preview Live CV</span>
              <ArrowUpRight className="w-3 h-3 text-slate-400" />
            </button>

            {/* Candidate Status Badge */}
            <div className={`inline-flex items-center gap-1.5 px-3 py-1 text-xs font-mono font-bold uppercase rounded-full border ${
              profile?.vetting_status === 'approved' || profile?.vetting_status === 'verified'
                ? 'bg-amber-50 text-amber-800 border-amber-200'
                : 'bg-slate-100 text-slate-600 border-slate-200'
            }`}>
              <UserCheck className="w-3.5 h-3.5 text-slate-500" />
              <span>{getStatusBadge()}</span>
            </div>

            {/* Refresh Profile Button */}
            <button
              onClick={fetchOrCreateTalentProfile}
              title="Sync Live Profile Data"
              className="p-2 border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 rounded-xl cursor-pointer transition shadow-2xs"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-emerald-600' : ''}`} />
            </button>

            {/* Sign Out Button */}
            <button
              onClick={handleSignOut}
              className="bg-white hover:bg-rose-50 hover:text-rose-700 text-slate-700 font-semibold py-1.5 px-3.5 rounded-xl text-xs flex items-center gap-1.5 cursor-pointer border border-slate-200 transition shadow-2xs"
            >
              <LogOut className="w-3.5 h-3.5 text-slate-400" />
              <span>Sign Out</span>
            </button>

          </div>

        </div>
      </header>

      {/* PORTAL BODY CONTAINER */}
      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 space-y-6">
        
        {/* Workspace Mode Switcher: Resume Editor vs 3-Phase Assessment */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white border border-slate-200/90 rounded-2xl p-4 shadow-xs">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setWorkspaceMode('resume')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-mono text-xs font-bold uppercase tracking-wider transition cursor-pointer ${
                workspaceMode === 'resume'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 border border-slate-200 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
            >
              <FileText className="w-4 h-4" />
              <span>Executive Resume & Portfolio</span>
            </button>

            <button
              type="button"
              onClick={() => setWorkspaceMode('assessment')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-mono text-xs font-bold uppercase tracking-wider transition cursor-pointer ${
                workspaceMode === 'assessment'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 border border-slate-200 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
            >
              <Award className="w-4 h-4" />
              <span>3-Phase Accreditation & Quiz</span>
            </button>
          </div>

          {/* Quick Market Status Pill */}
          <div className="flex items-center gap-2.5 text-xs font-mono text-slate-600">
            <span className="font-semibold">Market Status:</span>
            {currentAvailability === 'available' ? (
              <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold px-2.5 py-1 rounded-full flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                Available for Hire
              </span>
            ) : (
              <span className="bg-slate-100 text-slate-600 border border-slate-200 font-bold px-2.5 py-1 rounded-full flex items-center gap-1.5">
                <Lock className="w-3 h-3 text-slate-500" />
                Hired
              </span>
            )}
          </div>
        </div>

        {loading ? (
          <Preloader />
        ) : error ? (
          <div className="p-6 max-w-lg mx-auto bg-rose-50 border border-rose-200 text-rose-800 rounded-2xl text-left space-y-3 shadow-xs">
            <div className="flex items-center gap-2 font-semibold text-xs text-rose-700">
              <AlertCircle className="w-4 h-4" />
              <span>Profile Sync Notice</span>
            </div>
            <p className="text-xs leading-relaxed">{error}</p>
            <button
              onClick={fetchOrCreateTalentProfile}
              className="bg-rose-600 hover:bg-rose-700 text-white font-semibold px-4 py-2 text-xs rounded-xl cursor-pointer"
            >
              Retry Sync
            </button>
          </div>
        ) : workspaceMode === 'resume' ? (
          /* TABBED EXECUTIVE RESUME & PORTFOLIO EDITOR */
          <TalentResumeEditor
            initialProfile={profile}
            onProfileUpdated={(updatedData) => {
              setProfile((prev: any) => ({ ...prev, ...updatedData }));
            }}
            onOpenPublicPreview={(targetSlug) => {
              setPreviewSlug(targetSlug || profile?.slug || 'candidate');
              setIsPreviewModalOpen(true);
            }}
          />
        ) : (
          /* 3-PHASE VETTING ASSESSMENT WORKSPACE */
          <TalentDashboard
            isTalentPaid={isTalentPaid}
            setIsTalentPaid={setIsTalentPaid}
            navigateToPage={navigateToPage}
            availabilityStatus={currentAvailability}
            onStatusChange={handleStatusChange}
            onboardingData={{
              userName: profile?.full_name || 'Talent Candidate',
              experienceLevel: profile?.experience_level === 'fresher' || profile?.experience_level === 'Fresher/Newbie' ? 'Fresher/Newbie' : 'Seasoned Professional',
              specialty: profile?.specialty || 'AI Automation',
              careerGoal: profile?.career_goal || 'Full-Time Remote Job',
              email: profile?.email,
              profilePictureUrl: profile?.profile_picture_url,
              slug: profile?.slug,
              vettingStatus: profile?.vetting_status,
              availability_status: currentAvailability
            }}
            onProfileUpdated={(updatedData) => {
              setProfile((prev: any) => ({ ...prev, ...updatedData }));
            }}
          />
        )}
      </main>

      {/* Live Preview Modal */}
      <TalentPortfolioModal
        isOpen={isPreviewModalOpen}
        onClose={() => setIsPreviewModalOpen(false)}
        onNavigateToDashboard={() => setIsPreviewModalOpen(false)}
        publicSlug={previewSlug}
        onboardingData={profile}
      />

    </div>
  );
}
