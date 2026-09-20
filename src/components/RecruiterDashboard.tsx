import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useSupabase } from '../context/SupabaseContext';
import { Preloader } from './Preloader';
import PublicPortfolio from './PublicPortfolio';
import { 
  Building2, 
  Users, 
  Unlock, 
  MessageSquare, 
  Mail, 
  ExternalLink, 
  Search, 
  RefreshCw, 
  CreditCard, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  ShieldCheck, 
  ArrowUpRight, 
  ArrowRight,
  Zap, 
  Phone, 
  UserCheck, 
  LogOut, 
  ChevronRight, 
  SlidersHorizontal, 
  Award,
  Sparkles,
  MapPin,
  Calendar,
  Layers,
  Copy,
  Check,
  Send,
  X,
  LogIn,
  Lock,
  Ban
} from 'lucide-react';
import {
  fetchRecruiterVerification,
  subscribeToRecruiterStatus,
  normalizeVerificationStatus
} from '../services/recruiterVerification';

export interface AccessOverlayProps {
  status?: 'pending_verification' | 'verified' | 'suspended' | string;
  companyName?: string;
  email?: string;
  onRefresh?: () => void;
  whatsappUrl?: string;
}

/**
 * AccessOverlay component that covers the 'Talent Contacts' section with a semi-transparent blur,
 * displaying a 'Pending Verification' message and a WhatsApp redirect link if the recruiter's
 * status is not 'verified'.
 */
export function AccessOverlay({
  status = 'pending_verification',
  companyName = 'Employer Workspace',
  email = '',
  onRefresh,
  whatsappUrl
}: AccessOverlayProps) {
  // If status is verified, overlay is not rendered
  if (status === 'verified') {
    return null;
  }

  const isSuspended = status === 'suspended';

  const defaultExpediteWhatsAppUrl = `https://wa.me/2348169664607?text=${encodeURIComponent(
    `Hello Digital Campux Verification Team, I have registered as a recruiter for ${companyName} (${email || 'our organization'}). Our account status is pending verification. Please review and expedite our recruiter access so we can unlock candidate talent contacts.`
  )}`;

  const supportWhatsAppUrl = `https://wa.me/2348169664607?text=${encodeURIComponent(
    `Hello Digital Campux Support, our recruiter account (${companyName} - ${email}) has verification_status: suspended. Please review our account status and assist in restoring dashboard access.`
  )}`;

  const paymentProofWhatsAppUrl = `https://wa.me/2348169664607?text=${encodeURIComponent(
    `Hello Digital Campux Verification Team, here is our company registration details / payment receipt for ${companyName} (${email}) to expedite recruiter verification.`
  )}`;

  const activeWhatsAppUrl = whatsappUrl || (isSuspended ? supportWhatsAppUrl : defaultExpediteWhatsAppUrl);

  return (
    <div
      id="access-overlay"
      data-testid="access-overlay"
      role="region"
      aria-label={isSuspended ? 'Talent Contacts locked due to account suspension' : 'Talent Contacts locked: Pending Verification'}
      className="absolute inset-0 z-30 rounded-3xl backdrop-blur-md p-6 sm:p-10 flex flex-col items-center justify-center text-center transition-all duration-300 shadow-xl overflow-hidden"
      style={{
        backgroundColor: isSuspended ? 'rgba(255, 241, 242, 0.88)' : 'rgba(255, 255, 255, 0.85)',
        borderColor: isSuspended ? '#fda4af' : '#cbd5e1'
      }}
    >
      <div className="max-w-xl mx-auto space-y-6 flex flex-col items-center">
        {/* Status Icon & Badge */}
        <div className="flex flex-col items-center gap-3">
          <div className={`w-16 h-16 rounded-2xl flex items-center justify-center shadow-md ${
            isSuspended ? 'bg-rose-100 text-rose-600 border border-rose-200' : 'bg-amber-100 text-amber-700 border border-amber-200'
          }`}>
            {isSuspended ? <Ban className="w-8 h-8" /> : <Lock className="w-8 h-8" />}
          </div>

          <span className={`inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-mono font-bold uppercase tracking-wide border ${
            isSuspended 
              ? 'bg-rose-100/90 text-rose-900 border-rose-300' 
              : 'bg-amber-100/90 text-amber-900 border-amber-300'
          }`}>
            {isSuspended ? (
              <>
                <span className="w-2 h-2 rounded-full bg-rose-600 animate-pulse" />
                <span>Account Status: Suspended</span>
              </>
            ) : (
              <>
                <Clock className="w-3.5 h-3.5 text-amber-700 animate-pulse" />
                <span>Pending Verification</span>
              </>
            )}
          </span>
        </div>

        {/* Headline & Explanation */}
        <div className="space-y-2">
          <h3 className="font-display font-bold text-xl sm:text-2xl text-slate-900 tracking-tight">
            {isSuspended
              ? 'Talent Contacts Masked: Account Suspended'
              : 'Pending Verification: Talent Contacts Masked'}
          </h3>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed max-w-md mx-auto">
            {isSuspended
              ? 'Direct candidate phone numbers, WhatsApp channels, and email addresses are restricted. Please reach out to administrative support on WhatsApp to restore your organization access.'
              : 'Your recruiter account is currently pending verification. Admin review is in progress (estimated review: 1 hour). Candidate WhatsApp outreach numbers and direct email addresses will activate automatically once verified.'}
          </p>
        </div>

        {/* WhatsApp redirect link and Action Controls */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 w-full sm:w-auto">
          {/* Primary WhatsApp Redirect Link */}
          <a
            href={activeWhatsAppUrl}
            target="_blank"
            rel="noopener noreferrer"
            id="access-overlay-whatsapp-link"
            className={`w-full sm:w-auto inline-flex items-center justify-center gap-2 font-bold px-6 py-3 rounded-xl shadow-md transition cursor-pointer text-xs sm:text-sm group ${
              isSuspended
                ? 'bg-rose-600 hover:bg-rose-700 text-white'
                : 'bg-emerald-600 hover:bg-emerald-700 text-white hover:shadow-emerald-600/25'
            }`}
          >
            {!isSuspended && <Zap className="w-4 h-4 text-emerald-200 group-hover:scale-110 transition-transform" />}
            <MessageSquare className="w-4 h-4" />
            <span>
              {isSuspended ? 'Contact Support on WhatsApp' : 'Expedite via WhatsApp'}
            </span>
          </a>

          {!isSuspended && (
            /* Secondary WhatsApp Payment/Credentials Proof Link */
            <a
              href={paymentProofWhatsAppUrl}
              target="_blank"
              rel="noopener noreferrer"
              id="send-payment-proof-whatsapp-cta"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-white hover:bg-slate-50 text-slate-800 font-semibold px-5 py-3 rounded-xl border border-slate-300 shadow-2xs transition cursor-pointer text-xs sm:text-sm"
            >
              <Send className="w-3.5 h-3.5 text-slate-500" />
              <span>Send Verification Credentials via WhatsApp</span>
            </a>
          )}

          {onRefresh && (
            <button
              type="button"
              onClick={onRefresh}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 text-xs text-slate-500 hover:text-slate-800 font-medium py-2.5 px-3 rounded-xl border border-transparent hover:border-slate-200 transition cursor-pointer"
              title="Check if admin has approved your account"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Re-check Status</span>
            </button>
          )}
        </div>

        {/* Reassurance text */}
        <p className="text-[11px] text-slate-400 font-mono">
          {isSuspended
            ? `Account: ${email || companyName} • Support Hotline Available 24/7`
            : '🔒 Once verified, full contact reveals and direct outreach activate automatically.'}
        </p>
      </div>
    </div>
  );
}

// Alias for backwards compatibility
export const TalentContactsSectionOverlay = AccessOverlay;
export type TalentContactsSectionOverlayProps = AccessOverlayProps;

// Sample talent dossiers displayed under blur when new recruiter has 0 unlocked candidates yet
const SAMPLE_TALENT_DOSSIERS = [
  {
    id: 'sample-1',
    full_name: 'Damilola Adeyemi',
    headline: 'Senior Full-Stack AI Engineer',
    specialty: 'Python, LangChain, React, FastAPI',
    location: 'Lagos, Nigeria (Remote)',
    vetting_status: 'verified',
    skills: ['LangChain', 'Next.js', 'Python', 'FastAPI'],
    profile_picture_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=300'
  },
  {
    id: 'sample-2',
    full_name: 'Chidi Okafor',
    headline: 'Machine Learning & LLM Specialist',
    specialty: 'PyTorch, Transformers, Agentic Systems',
    location: 'Abuja, Nigeria (Hybrid)',
    vetting_status: 'verified',
    skills: ['PyTorch', 'HuggingFace', 'RAG', 'TypeScript'],
    profile_picture_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=300'
  },
  {
    id: 'sample-3',
    full_name: 'Fatima Bello',
    headline: 'Growth Marketing & Technical Talent Lead',
    specialty: 'Product Analytics, SQL, Growth Engineering',
    location: 'Kano / Remote',
    vetting_status: 'verified',
    skills: ['Product Analytics', 'SQL', 'A/B Testing', 'Growth'],
    profile_picture_url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=300'
  }
];

export interface TalentContactMaskOverlayProps {
  status: 'verified' | 'suspended' | 'pending' | string;
  candidateName?: string;
  recruiterCompany?: string;
}

/**
 * Overlay component that masks individual talent card contact channels if recruiter is 'suspended' or 'pending'.
 */
export function TalentContactMaskOverlay({
  status,
  candidateName = 'Talent Candidate',
  recruiterCompany = 'Employer Workspace'
}: TalentContactMaskOverlayProps) {
  const isSuspended = status === 'suspended';

  return (
    <div
      id="talent-contact-mask-overlay"
      role="region"
      aria-label={isSuspended ? 'Access Denied: Contacts masked due to account suspension' : 'Verification Pending: Contacts masked'}
      className="absolute inset-0 z-20 rounded-xl backdrop-blur-[3px] p-3 flex flex-col items-center justify-center text-center gap-1.5 border transition-all shadow-xs"
      style={{
        backgroundColor: isSuspended ? 'rgba(255, 241, 242, 0.94)' : 'rgba(254, 252, 232, 0.94)',
        borderColor: isSuspended ? '#fda4af' : '#fde047'
      }}
    >
      <div className={`p-1.5 rounded-full ${isSuspended ? 'bg-rose-100 text-rose-700' : 'bg-amber-100 text-amber-800'}`}>
        {isSuspended ? <Ban className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
      </div>

      <div className="space-y-0.5 max-w-[220px]">
        <span className={`text-[10px] font-mono font-bold uppercase tracking-wider block ${
          isSuspended ? 'text-rose-800' : 'text-amber-800'
        }`}>
          {isSuspended ? 'Access Denied: Account Suspended' : 'Verification Pending'}
        </span>
        <p className="text-[11px] text-slate-600 leading-tight">
          {isSuspended
            ? 'Candidate outreach is locked. Contact administration to restore account access.'
            : 'Candidate contacts unlock automatically once admin verification is approved.'}
        </p>
      </div>

      {isSuspended ? (
        <a
          href={`https://wa.me/2348169664607?text=${encodeURIComponent(`Hello Support, our recruiter account (${recruiterCompany}) is suspended. Please assist in restoring access.`)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-[10px] font-bold font-mono bg-rose-600 hover:bg-rose-700 text-white px-2.5 py-1 rounded-lg flex items-center gap-1 shadow-2xs transition"
        >
          <MessageSquare className="w-3 h-3" />
          <span>Contact Support to Restore</span>
        </a>
      ) : (
        <a
          href={`https://wa.me/2348169664607?text=${encodeURIComponent(`Hello Digital Campux Verification Team, I registered as a recruiter for ${recruiterCompany}. Please review and approve my account.`)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-[10px] font-bold font-mono bg-emerald-600 hover:bg-emerald-700 text-white px-2.5 py-1 rounded-lg flex items-center gap-1 shadow-2xs transition"
        >
          <MessageSquare className="w-3 h-3" />
          <span>Expedite via WhatsApp</span>
        </a>
      )}
    </div>
  );
}

interface RecruiterDashboardProps {
  onSignOut?: () => void;
  onNavigateHome?: () => void;
  onOpenCandidatePortfolio?: (slug: string) => void;
  onNavigateToWorkspace?: () => void;
  onNavigateToDirectory?: () => void;
  onNavigateToPricing?: () => void;
}

export default function RecruiterDashboard({
  onSignOut,
  onNavigateHome,
  onOpenCandidatePortfolio,
  onNavigateToWorkspace,
  onNavigateToDirectory,
  onNavigateToPricing
}: RecruiterDashboardProps) {
  const { user } = useSupabase();
  const [recruiter, setRecruiter] = useState<any>(null);
  const [recruiterProfile, setRecruiterProfile] = useState<any>(null);
  const [unlockedTalents, setUnlockedTalents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeNav, setActiveNav] = useState<'unlocked' | 'billing' | 'cosupervision'>('unlocked');
  
  // Dedicated state for verification status: 'pending_verification' vs 'verified' vs 'suspended'
  const [liveVerificationStatus, setLiveVerificationStatus] = useState<'pending_verification' | 'verified' | 'suspended'>('pending_verification');

  // Co-Supervision Modal State
  const [showCoSupervisionModal, setShowCoSupervisionModal] = useState(false);
  const [coSupervisionSubject, setCoSupervisionSubject] = useState('');
  const [coSupervisionMessage, setCoSupervisionMessage] = useState('');
  const [coSupervisionSending, setCoSupervisionSending] = useState(false);
  const [coSupervisionSuccess, setCoSupervisionSuccess] = useState(false);

  // Live Candidate Portfolio Preview Modal
  const [previewCandidateSlug, setPreviewCandidateSlug] = useState<string | null>(null);

  // Fetch live recruiter record and unlocked contacts
  const fetchRecruiterData = async () => {
    const urlParams = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null;
    const urlStatus = urlParams?.get('status');

    if (!user) {
      const cached = typeof window !== 'undefined' ? localStorage.getItem('dsp_recruiter_profile') : null;
      if (cached || urlStatus === 'pending_approval' || urlStatus === 'pending_verification') {
        try {
          const parsed = cached ? JSON.parse(cached) : {};
          setRecruiter({
            id: parsed.id || parsed.user_id || 'rec_pending',
            user_id: parsed.user_id || 'rec_pending',
            company_name: parsed.company_name || parsed.organization_name || 'Employer Workspace',
            contact_person: parsed.contact_person || 'Recruiter Lead',
            business_email: parsed.business_email || parsed.email || 'recruiter@company.com',
            selected_package: parsed.selected_package || parsed.subscribed_package || 'Starter',
            subscribed_package: parsed.subscribed_package || parsed.selected_package || 'Starter',
            verification_status: 'pending_verification',
            payment_status: 'pending_verification',
            status: 'pending_approval',
            contacts_unlocked_count: 0
          });
          setLoading(false);
          return;
        } catch (_) {}
      }

      const onb = typeof window !== 'undefined' ? localStorage.getItem('dsp_active_onboarding') : null;
      if (onb) {
        try {
          const parsed = JSON.parse(onb);
          if (parsed?.userType === 'recruiter') {
            setRecruiter({
              id: 'recruiter-local',
              company_name: parsed.orgName || parsed.userName || 'Employer Workspace',
              contact_person: parsed.userName || 'Recruiter Lead',
              business_email: parsed.email || 'recruiter@company.com',
              selected_package: 'annual_unlimited',
              verification_status: 'pending_verification',
              payment_status: 'pending_verification',
              contacts_unlocked_count: 0
            });
            setLoading(false);
            return;
          }
        } catch {
          // ignore
        }
      }
      setLoading(false);
      return;
    }

    try {
      setRefreshing(true);

      // 1. Fetch recruiter profile from server API (authoritative status) or Supabase fallback
      let recruiter: any = null;
      try {
        const profileRes = await fetch(`/api/recruiter/profile?userId=${user.id}&email=${encodeURIComponent(user.email || '')}`);
        if (profileRes.ok) {
          const profileJson = await profileRes.json();
          if (profileJson.success && profileJson.recruiter) {
            recruiter = profileJson.recruiter;
          }
        }
      } catch (e) {
        console.warn('[RecruiterDashboard] /api/recruiter/profile notice:', e);
      }

      if (!recruiter) {
        try {
          const { data } = await supabase
            .from('recruiters')
            .select('*')
            .or(`user_id.eq.${user.id},business_email.eq.${user.email || ''}`)
            .maybeSingle();
          if (data) recruiter = data;
        } catch (_) {}
      }

      if (!recruiter) {
        const cached = localStorage.getItem('dsp_recruiter_profile') || localStorage.getItem(`mock_recruiter_profiles_${user.id}`);
        if (cached) {
          try {
            const parsed = JSON.parse(cached);
            if (parsed.user_id === user.id || parsed.id === user.id || parsed.business_email === user.email) {
              recruiter = parsed;
            }
          } catch (_) {}
        }
      }

      const companyName = recruiter?.company_name || user.user_metadata?.company_name || 'Hiring Enterprise';
      const contactName = recruiter?.contact_person || user.user_metadata?.contact_person || user.user_metadata?.full_name || user.email?.split('@')[0] || 'Recruiter';
      const selectedPkg = recruiter?.subscribed_package || recruiter?.selected_package || user.user_metadata?.subscribed_package || 'Starter';
      const maxContacts = (selectedPkg === 'Enterprise' || selectedPkg === 'annual_unlimited') ? 99999 : (selectedPkg === 'Growth') ? 25 : 5;

      const vState = normalizeVerificationStatus(recruiter, user.user_metadata);
      const effectiveVerificationStatus = urlStatus === 'pending_approval' || urlStatus === 'pending_verification'
        ? (vState.isApproved ? 'verified' : 'pending_verification')
        : vState.verificationStatus;

      const mergedRecruiter = {
        id: recruiter?.id || user.id,
        user_id: user.id,
        company_name: companyName,
        contact_person: contactName,
        business_email: recruiter?.business_email || user.email,
        phone_number: recruiter?.phone_number || '',
        selected_package: selectedPkg,
        subscribed_package: selectedPkg,
        verification_status: effectiveVerificationStatus,
        payment_status: vState.paymentStatus,
        is_suspended: vState.isSuspended,
        is_approved: vState.isApproved,
        contacts_unlocked_count: recruiter?.contacts_unlocked_count || 0,
        max_contacts: recruiter?.max_contacts || maxContacts,
        created_at: recruiter?.created_at || new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      setRecruiter(mergedRecruiter);

      // 2. Fetch all unlocked contacts for this recruiter
      const { data: unlockedRows, error: unlockedErr } = await supabase
        .from('unlocked_contacts')
        .select('*')
        .or(`recruiter_id.eq.${user.id},recruiter_id.eq.${recruiter?.id || user.id}`)
        .order('created_at', { ascending: false });

      if (unlockedRows && unlockedRows.length > 0) {
        const talentIds = unlockedRows.map((r: any) => r.talent_id).filter(Boolean);

        if (talentIds.length > 0) {
          const { data: talentsData, error: talentErr } = await supabase
            .from('talent_profiles')
            .select('*')
            .in('id', talentIds);

          if (talentsData) {
            // Merge unlocked timestamp
            const merged = talentsData.map((talent: any) => {
              const matchedRow = unlockedRows.find((r: any) => r.talent_id === talent.id);
              return {
                ...talent,
                unlocked_at: matchedRow?.created_at || matchedRow?.unlocked_at || new Date().toISOString()
              };
            });
            setUnlockedTalents(merged);
          }
        } else {
          setUnlockedTalents([]);
        }
      } else {
        setUnlockedTalents([]);
      }
    } catch (err) {
      console.error('Error loading recruiter dashboard data:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const fetchRecruiterProfile = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    try {
      const { data: recruiter, error } = await supabase
        .from('recruiters')
        .select('*')
        .or(`user_id.eq.${user.id},business_email.eq.${user.email || ''}`)
        .maybeSingle();

      if (!error && recruiter) {
        setRecruiterProfile(recruiter);
        setRecruiter((prev: any) => ({ ...prev, ...recruiter }));
        return;
      }
    } catch (_) {}

    // Resilient fallback to local storage recruiter profile
    try {
      const saved = localStorage.getItem(`mock_recruiter_profiles_${user.id}`) || localStorage.getItem('dsp_recruiter_profile');
      if (saved) {
        const parsed = JSON.parse(saved);
        setRecruiterProfile(parsed);
        setRecruiter((prev: any) => ({ ...prev, ...parsed }));
      }
    } catch (_) {}
  };

  useEffect(() => {
    fetchRecruiterData();
    fetchRecruiterProfile();
  }, [user]);

  // Dedicated useEffect: Uses recruiterVerification service to fetch latest status
  // and subscribes to realtime updates so the UI immediately reflects admin actions (approval, suspension, restoration).
  useEffect(() => {
    let isMounted = true;

    const fetchLatestVerificationStatus = async () => {
      try {
        const result = await fetchRecruiterVerification({
          userId: user?.id,
          email: user?.email,
          recruiterId: recruiter?.id
        });

        if (result.success && result.state && isMounted) {
          const { verificationStatus, isApproved, isSuspended, paymentStatus } = result.state;
          const vStatus = verificationStatus as 'pending_verification' | 'verified' | 'suspended';

          setLiveVerificationStatus(vStatus);

          setRecruiter((prev: any) => ({
            ...prev,
            ...(result.recruiter || {}),
            verification_status: vStatus,
            is_suspended: isSuspended,
            is_approved: isApproved,
            payment_status: paymentStatus
          }));

          // Clean up pending URL param if account is activated
          if (isApproved && typeof window !== 'undefined' && window.location.search.includes('status=')) {
            const newUrl = window.location.pathname;
            window.history.replaceState({}, document.title, newUrl);
          }
        }
      } catch (err) {
        console.warn('[RecruiterDashboard] Error fetching latest verification_status on mount:', err);
      }
    };

    fetchLatestVerificationStatus();

    // 1. Polling interval to auto-refresh status every 4 seconds
    const intervalId = setInterval(() => {
      if (isMounted) {
        fetchLatestVerificationStatus();
      }
    }, 4000);

    // 2. Subscribe to centralized recruiter status events (fired on Admin approval/suspension)
    const unsubscribeStatus = subscribeToRecruiterStatus(
      recruiter?.id || user?.id,
      (detail) => {
        if (!isMounted) return;
        const isSusp = detail.is_suspended || detail.verification_status === 'suspended';
        const isAppr = !isSusp && (detail.is_approved || detail.verification_status === 'verified');
        const vStatus: 'pending_verification' | 'verified' | 'suspended' = isSusp
          ? 'suspended'
          : isAppr
          ? 'verified'
          : 'pending_verification';

        setLiveVerificationStatus(vStatus);
        setRecruiter((prev: any) => ({
          ...prev,
          verification_status: vStatus,
          is_approved: isAppr,
          is_suspended: isSusp,
          payment_status: isAppr ? 'verified' : (isSusp ? 'suspended' : prev?.payment_status)
        }));

        fetchLatestVerificationStatus();
      }
    );

    window.addEventListener('storage', fetchLatestVerificationStatus);

    // 3. Supabase Realtime subscription for recruiters table
    let channel: any = null;
    try {
      channel = supabase
        .channel('recruiter_live_status')
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'recruiters' },
          () => {
            fetchLatestVerificationStatus();
          }
        )
        .subscribe();
    } catch (_) {}

    return () => {
      isMounted = false;
      clearInterval(intervalId);
      unsubscribeStatus();
      window.removeEventListener('storage', fetchLatestVerificationStatus);
      if (channel) {
        try {
          supabase.removeChannel(channel);
        } catch (_) {}
      }
    };
  }, [user, recruiter?.id]);

  const handleSignOutClick = async () => {
    try {
      // 1. Sign out from Supabase Auth
      await supabase.auth.signOut();

      // 2. Clear local storage / session storage
      localStorage.clear();
      sessionStorage.clear();

      // 3. Reset local component state
      setRecruiter(null);

      if (onSignOut) {
        onSignOut();
      } else {
        window.location.href = '/recruiter-login';
      }
    } catch (err) {
      console.warn('Sign out error:', err);
      window.location.href = '/recruiter-login';
    }
  };

  const navToDirectory = () => {
    if (onNavigateToDirectory) {
      onNavigateToDirectory();
    } else {
      window.history.pushState({}, '', '/directory');
      window.dispatchEvent(new Event('popstate'));
    }
  };

  const handleCoSupervisionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setCoSupervisionSending(true);

    try {
      // In real scenario, can log request to support queue or send email
      await new Promise(r => setTimeout(r, 800));
      setCoSupervisionSuccess(true);
      setTimeout(() => {
        setCoSupervisionSuccess(false);
        setShowCoSupervisionModal(false);
        setCoSupervisionSubject('');
        setCoSupervisionMessage('');
      }, 2500);
    } catch (err) {
      console.error('Co-supervision submission error:', err);
    } finally {
      setCoSupervisionSending(false);
    }
  };

  // Filter unlocked candidates by search
  const filteredTalents = unlockedTalents.filter((t) => {
    const q = searchQuery.toLowerCase();
    const name = (t.full_name || t.name || '').toLowerCase();
    const headline = (t.headline || t.specialty || '').toLowerCase();
    const skills = Array.isArray(t.skills) ? t.skills.join(' ').toLowerCase() : '';
    return name.includes(q) || headline.includes(q) || skills.includes(q);
  });

  const isSuspended = Boolean(
    recruiter?.is_suspended ||
    recruiter?.verification_status === 'suspended' ||
    liveVerificationStatus === 'suspended' ||
    user?.user_metadata?.is_suspended ||
    user?.user_metadata?.verification_status === 'suspended'
  );

  const isApproved = !isSuspended && Boolean(
    recruiter?.verification_status === 'verified' ||
    recruiter?.verification_status === 'approved' ||
    recruiter?.payment_status === 'verified' ||
    recruiter?.payment_status === 'approved' ||
    recruiter?.is_approved === true ||
    recruiter?.status === 'verified' ||
    recruiter?.status === 'active' ||
    liveVerificationStatus === 'verified' ||
    user?.user_metadata?.verification_status === 'verified' ||
    user?.user_metadata?.is_approved === true
  );

  const isDisapproved = !isSuspended && !isApproved && Boolean(
    recruiter?.verification_status === 'rejected' ||
    recruiter?.verification_status === 'disapproved' ||
    recruiter?.payment_status === 'rejected' ||
    recruiter?.payment_status === 'disapproved' ||
    user?.user_metadata?.verification_status === 'rejected'
  );

  // Strictly normalized verification_status ('pending_verification' vs 'verified' vs 'suspended')
  const verificationStatus: 'pending_verification' | 'verified' | 'suspended' = isSuspended 
    ? 'suspended' 
    : isApproved 
    ? 'verified' 
    : (liveVerificationStatus === 'suspended' ? 'suspended' : liveVerificationStatus === 'verified' ? 'verified' : 'pending_verification');

  const isPendingVerification = verificationStatus === 'pending_verification';

  // Dynamic display messages based strictly on 'pending_verification' vs 'verified' vs 'suspended'
  const statusDisplayMessages = {
    verified: {
      statusBadge: 'Account Status: Account Activated',
      badgeClass: 'bg-emerald-200/80 text-emerald-900 border-emerald-300',
      headline: 'Account Activated: Your recruiter account has been verified and approved!',
      description: 'Recruiter account approved! Contact unlock access activated according to package.',
      subtext: 'Your recruiter account is active. Candidate talent contact unlocks and direct outreach channels (WhatsApp & Email) are fully enabled according to your package tier.',
      ctaText: 'Browse Talent Directory',
    },
    suspended: {
      statusBadge: 'Account Status: Suspended (Access Denied)',
      badgeClass: 'bg-rose-200/90 text-rose-900 border-rose-300',
      headline: 'Access Denied: Recruiter Account Suspended',
      description: 'Your recruiter account access has been suspended by administration. Your company records are preserved, but direct candidate contact reveals and outreach channels are masked and locked.',
      subtext: 'Please contact our support team on WhatsApp to review your account verification status and restore access.',
      ctaText: 'Contact Support on WhatsApp',
      whatsappUrl: `https://wa.me/2348169664607?text=${encodeURIComponent(
        `Hello Digital Campux Support, our recruiter account (${recruiter?.company_name || user?.email || 'our organization'}) is suspended. Please review our verification status and assist in restoring dashboard access.`
      )}`,
    },
    pending_verification: {
      statusBadge: 'Account Status: Pending Review',
      badgeClass: 'bg-amber-200/80 text-amber-900 border-amber-300',
      headline: 'Your recruiter account has been created. Admin verification is in progress (estimated review: 1 hour). Your contact unlocks will activate automatically once verified.',
      description: 'Admin verification is in progress. While under review, candidate talent contacts remain masked to prevent unauthorized outreach.',
      subtext: 'All recruiter accounts remain in Review Mode upon registration until approved by our verification team (typically within 1 hour). Once verified, full WhatsApp & email contact unlock features will automatically activate.',
      ctaText: '⚡ Expedite via WhatsApp',
      whatsappUrl: `https://wa.me/2348169664607?text=${encodeURIComponent(
        `Hello Digital Campux, I have registered ${recruiter?.company_name || 'my company'} (${recruiter?.business_email || user?.email || ''}). Please expedite our recruiter account verification.`
      )}`,
    }
  };
  const isAnnual = recruiter?.selected_package === 'annual_unlimited' || recruiter?.selected_package === 'Enterprise' || recruiter?.subscribed_package === 'Enterprise';
  const isGrowth = recruiter?.selected_package === 'Growth' || recruiter?.subscribed_package === 'Growth';
  const unlockedCount = recruiter?.contacts_unlocked_count || unlockedTalents.length || 0;
  const maxContacts = recruiter?.max_contacts || (isAnnual ? 99999 : isGrowth ? 25 : 5);

  if (loading) {
    return <Preloader />;
  }

  // HARD GUARD: If not logged in as a recruiter, block access completely
  if (!user && !recruiter) {
    return (
      <div className="min-h-[75vh] bg-slate-50 flex items-center justify-center p-6 font-sans text-left">
        <div className="max-w-md w-full bg-white rounded-3xl border border-slate-200/90 p-8 shadow-xl space-y-6">
          <div className="w-12 h-12 rounded-2xl bg-slate-900 text-emerald-400 flex items-center justify-center shadow-xs">
            <Lock className="w-6 h-6" />
          </div>
          <div className="space-y-2">
            <h2 className="text-xl font-display font-black text-slate-900 tracking-tight">
              Recruiter Authentication Required
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              The candidate direct sourcing dashboard contains sensitive candidate contact records, unlocked pipeline dossiers, and co-supervision tools. You must be signed in as a verified employer to access this console.
            </p>
          </div>
          <div className="space-y-2.5 pt-2">
            <button
              onClick={() => {
                window.location.pathname = '/recruiter/login';
              }}
              className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-3 px-4 rounded-xl text-xs sm:text-sm flex items-center justify-center gap-2 transition-all cursor-pointer shadow-xs"
              id="recruiter-gate-signin-btn"
            >
              <LogIn className="w-4 h-4" />
              <span>Sign In to Recruiter Portal</span>
            </button>
            <button
              onClick={() => {
                if (onNavigateHome) onNavigateHome();
                else window.location.pathname = '/';
              }}
              className="w-full text-slate-500 hover:text-slate-800 font-semibold py-2 px-4 rounded-xl text-xs text-center transition-colors cursor-pointer"
            >
              Return Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-emerald-500 selection:text-white pb-20 text-left">
      
      {/* Recruiter Header */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 px-4 sm:px-8 py-3.5 shadow-2xs">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          
          <div className="flex items-center gap-3">
            <div className="bg-slate-900 text-white p-2 rounded-xl flex items-center justify-center font-bold">
              <Building2 className="w-4 h-4 text-emerald-400" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-display font-black text-sm tracking-tight text-slate-900">
                  {recruiter?.company_name || 'Employer Workspace'}
                </span>
                <span className="text-[10px] font-mono font-bold bg-slate-100 text-slate-700 border border-slate-200 px-2 py-0.5 rounded-full">
                  Recruiter Portal
                </span>

                {/* Visual Verification Status Badge */}
                <div id="recruiter-verification-status-badge" className="inline-flex items-center">
                  {isSuspended ? (
                    <span 
                      id="verification-status-badge" 
                      className="inline-flex items-center gap-1.5 bg-rose-100 text-rose-800 border border-rose-300 text-[11px] font-bold px-2.5 py-0.5 rounded-full shadow-2xs"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-rose-600" />
                      <Ban className="w-3.5 h-3.5 text-rose-600" />
                      <span>Suspended</span>
                    </span>
                  ) : verificationStatus === 'verified' || isApproved ? (
                    <span 
                      id="verification-status-badge" 
                      className="inline-flex items-center gap-1.5 bg-emerald-100 text-emerald-800 border border-emerald-300 text-[11px] font-bold px-2.5 py-0.5 rounded-full shadow-2xs"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Account Activated</span>
                    </span>
                  ) : (
                    <span 
                      id="verification-status-badge" 
                      className="inline-flex items-center gap-1.5 bg-amber-100 text-amber-800 border border-amber-300 text-[11px] font-bold px-2.5 py-0.5 rounded-full shadow-2xs"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-600 animate-pulse" />
                      <Clock className="w-3.5 h-3.5 text-amber-600" />
                      <span>Pending Review</span>
                    </span>
                  )}
                </div>
              </div>
              <p className="text-xs text-slate-500 font-medium">
                {recruiter?.contact_person} · {recruiter?.business_email}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            
            {/* Browse Directory Button */}
            <button
              type="button"
              onClick={navToDirectory}
              className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-3.5 py-1.5 rounded-xl transition cursor-pointer shadow-xs"
            >
              <Search className="w-3.5 h-3.5" />
              <span>Browse Talent Directory</span>
            </button>

            {/* Sync Refresh */}
            <button
              type="button"
              onClick={fetchRecruiterData}
              title="Sync Account Status"
              className="p-2 border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 rounded-xl cursor-pointer transition shadow-2xs"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin text-emerald-600' : ''}`} />
            </button>

            {/* Sign Out */}
            <button
              type="button"
              onClick={handleSignOutClick}
              className="bg-white hover:bg-rose-50 hover:text-rose-700 text-slate-700 font-semibold py-1.5 px-3 rounded-xl text-xs flex items-center gap-1.5 cursor-pointer border border-slate-200 transition shadow-2xs"
            >
              <LogOut className="w-3.5 h-3.5 text-slate-400" />
              <span>Sign Out</span>
            </button>

          </div>

        </div>
      </header>

      {/* MAIN DASHBOARD CONTENT */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 space-y-6">
        
        {/* 0. ACCESS DENIED: SUSPENDED ACCOUNT BANNER */}
        {verificationStatus === 'suspended' && (
          <div 
            id="access-denied-suspended-banner"
            role="alert"
            className="bg-rose-50 border-2 border-rose-400 rounded-3xl p-6 sm:p-7 shadow-sm text-rose-950 space-y-4 animate-fadeIn"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-3.5">
                <div className="p-2.5 bg-rose-100 text-rose-700 rounded-xl shrink-0">
                  <Ban className="w-6 h-6" />
                </div>
                <div>
                  <div className={`inline-flex items-center gap-1.5 font-mono text-[10px] font-bold uppercase px-2.5 py-0.5 rounded-full mb-1 border ${statusDisplayMessages.suspended.badgeClass}`}>
                    <span>{statusDisplayMessages.suspended.statusBadge}</span>
                  </div>
                  <h2 className="font-display font-bold text-base sm:text-lg text-rose-950">
                    {statusDisplayMessages.suspended.headline}
                  </h2>
                </div>
              </div>

              <a
                href={statusDisplayMessages.suspended.whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="hidden sm:flex items-center gap-1.5 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs px-4 py-2.5 rounded-xl transition shadow-xs whitespace-nowrap shrink-0"
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>{statusDisplayMessages.suspended.ctaText}</span>
              </a>
            </div>

            <p className="text-xs text-rose-900 leading-relaxed max-w-4xl">
              <strong>{statusDisplayMessages.suspended.description}</strong> {statusDisplayMessages.suspended.subtext}
            </p>
          </div>
        )}
        
        {/* 1. APPROVED / ACTIVATED SUCCESS BANNER */}
        {verificationStatus === 'verified' && (
          <div 
            id="account-approved-success-banner"
            className="bg-emerald-50/90 border-2 border-emerald-500 rounded-3xl p-6 sm:p-7 shadow-xs text-emerald-950 space-y-4 animate-fadeIn"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-3.5">
                <div className="p-2.5 bg-emerald-100 text-emerald-700 rounded-xl shrink-0">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <div>
                  <div className={`inline-flex items-center gap-1.5 font-mono text-[10px] font-bold uppercase px-2.5 py-0.5 rounded-full mb-1 border ${statusDisplayMessages.verified.badgeClass}`}>
                    <Check className="w-3 h-3 text-emerald-700" />
                    <span>{statusDisplayMessages.verified.statusBadge}</span>
                  </div>
                  <h2 className="font-display font-bold text-base sm:text-lg text-emerald-950">
                    {statusDisplayMessages.verified.headline}
                  </h2>
                </div>
              </div>

              <button
                type="button"
                onClick={navToDirectory}
                className="hidden sm:flex items-center gap-1.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs px-4 py-2.5 rounded-xl transition shadow-xs whitespace-nowrap shrink-0 cursor-pointer"
              >
                <Search className="w-3.5 h-3.5" />
                <span>{statusDisplayMessages.verified.ctaText}</span>
              </button>
            </div>

            <p className="text-xs text-emerald-800 leading-relaxed max-w-4xl">
              <strong>{statusDisplayMessages.verified.description}</strong> {statusDisplayMessages.verified.subtext}
            </p>
          </div>
        )}

        {/* 2. DISAPPROVED PAYMENT WARNING BANNER */}
        {isDisapproved && (
          <div 
            id="account-disapproved-alert-banner"
            className="bg-red-50 border-2 border-red-400 rounded-3xl p-6 sm:p-7 shadow-sm text-red-950 space-y-4 animate-fadeIn"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-3.5">
                <div className="p-2.5 bg-red-100 text-red-700 rounded-xl shrink-0">
                  <AlertCircle className="w-6 h-6" />
                </div>
                <div>
                  <div className="inline-flex items-center gap-1.5 bg-red-200/80 text-red-900 font-mono text-[10px] font-bold uppercase px-2.5 py-0.5 rounded-full mb-1">
                    <span>Account Status: Disapproved (Payment Not Received)</span>
                  </div>
                  <h2 className="font-display font-bold text-base sm:text-lg text-red-950">
                    Account Verification Disapproved: Subscription payment was not received.
                  </h2>
                </div>
              </div>

              <a
                href={`https://wa.me/2348169664607?text=${encodeURIComponent(`Hello Digital Campux Support, our recruiter payment for ${recruiter?.company_name || 'our company'} (${recruiter?.business_email || ''}) was marked as not received. Here is our transfer receipt:`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="hidden sm:flex items-center gap-1.5 bg-red-600 hover:bg-red-700 text-white font-bold text-xs px-4 py-2 rounded-xl transition shadow-xs whitespace-nowrap shrink-0"
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>Submit Receipt via WhatsApp</span>
              </a>
            </div>

            <p className="text-xs text-red-900 leading-relaxed max-w-4xl">
              Your recruiter account has been disapproved because subscription payment could not be confirmed. Candidate contact unlocking is currently locked. To activate your account and access pre-vetted talent, please complete payment or send your payment receipt to our verification desk.
            </p>

            <div className="bg-white/90 border border-red-200 rounded-2xl p-4 text-xs grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <span className="text-slate-500 font-mono text-[10px] uppercase block">Bank Name</span>
                <span className="font-bold text-slate-800">Guaranty Trust Bank (GTBank)</span>
              </div>
              <div>
                <span className="text-slate-500 font-mono text-[10px] uppercase block">Account Name</span>
                <span className="font-bold text-slate-800">DSP Academy Ltd</span>
              </div>
              <div>
                <span className="text-slate-500 font-mono text-[10px] uppercase block">Account Number</span>
                <span className="font-mono font-bold text-sm text-red-700">3003427360</span>
              </div>
            </div>
          </div>
        )}

        {/* 3. PENDING VERIFICATION AMBER ALERT BANNER */}
        {verificationStatus === 'pending_verification' && !isDisapproved && (
          <div 
            id="pending-verification-alert-banner"
            className="bg-amber-50 border-2 border-amber-400 rounded-3xl p-6 sm:p-7 shadow-sm text-amber-950 space-y-4 animate-fadeIn"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-amber-100 text-amber-800 rounded-xl shrink-0">
                  <Clock className="w-6 h-6 animate-pulse" />
                </div>
                <div>
                  <div className={`inline-flex items-center gap-1.5 font-mono text-[10px] font-bold uppercase px-2.5 py-0.5 rounded-full mb-1 border ${statusDisplayMessages.pending_verification.badgeClass}`}>
                    <span>{statusDisplayMessages.pending_verification.statusBadge}</span>
                  </div>
                  <h2 className="font-display font-bold text-base sm:text-lg text-amber-950">
                    {statusDisplayMessages.pending_verification.headline}
                  </h2>
                </div>
              </div>

              <a
                href={statusDisplayMessages.pending_verification.whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="hidden sm:flex items-center gap-1.5 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs px-4 py-2 rounded-xl transition shadow-xs whitespace-nowrap shrink-0"
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>{statusDisplayMessages.pending_verification.ctaText}</span>
              </a>
            </div>

            <p className="text-xs text-amber-900 leading-relaxed max-w-4xl">
              <strong>{statusDisplayMessages.pending_verification.description}</strong> {statusDisplayMessages.pending_verification.subtext}
            </p>

            <div className="bg-white/80 border border-amber-200 rounded-2xl p-4 text-xs grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <span className="text-slate-500 font-mono text-[10px] uppercase block">Bank Name</span>
                <span className="font-bold text-slate-800">Guaranty Trust Bank (GTBank)</span>
              </div>
              <div>
                <span className="text-slate-500 font-mono text-[10px] uppercase block">Account Name</span>
                <span className="font-bold text-slate-800">DSP Academy Ltd</span>
              </div>
              <div>
                <span className="text-slate-500 font-mono text-[10px] uppercase block">Account Number</span>
                <span className="font-mono font-bold text-sm text-emerald-700">3003427360</span>
              </div>
            </div>
          </div>
        )}

        {/* SUBSCRIPTION & PLAN SUMMARY STRIP */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          
          {/* Card 1: Package Tier */}
          <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs space-y-2">
            <span className="text-[10px] font-mono font-bold uppercase text-slate-400 block">
              Active Subscription
            </span>
            <div className="flex items-center justify-between">
              <h3 className="font-display font-bold text-base text-slate-900">
                {isAnnual ? 'Enterprise Scale & Co-Pilot' : isGrowth ? 'Growth Hiring Pack' : 'Starter Hiring Pack'}
              </h3>
              <span id="card-verification-status-badge" className={`text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full uppercase flex items-center gap-1 ${
                isSuspended
                  ? 'bg-rose-100 text-rose-800 border border-rose-200'
                  : isApproved
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  : isDisapproved
                  ? 'bg-red-100 text-red-800 border border-red-200'
                  : 'bg-amber-100 text-amber-800 border border-amber-200'
              }`}>
                {isSuspended ? (
                  <>
                    <Ban className="w-3 h-3 text-rose-600" />
                    <span>Suspended</span>
                  </>
                ) : isApproved ? (
                  <>
                    <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                    <span>Account Activated</span>
                  </>
                ) : isDisapproved ? (
                  <>
                    <AlertCircle className="w-3 h-3 text-red-600" />
                    <span>Disapproved</span>
                  </>
                ) : (
                  <>
                    <Clock className="w-3 h-3 text-amber-600" />
                    <span>Pending Review</span>
                  </>
                )}
              </span>
            </div>
            <p className="text-xs text-slate-500">
              {isAnnual ? '365 Days Unlimited Unlocks & Support' : isGrowth ? '25 Contact Unlocks Included' : '5 Contact Unlocks Included'}
            </p>
          </div>

          {/* Card 2: Contact Unlock Quota */}
          <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs space-y-2">
            <span className="text-[10px] font-mono font-bold uppercase text-slate-400 block">
              Candidate Unlock Quota
            </span>
            <div className="flex items-center justify-between">
              <span className="font-display font-extrabold text-2xl text-slate-900">
                {isAnnual ? 'UNLIMITED' : `${unlockedCount} / ${maxContacts}`}
              </span>
              {!isAnnual && (
                <span className="text-xs text-slate-500 font-mono">
                  {Math.max(0, maxContacts - unlockedCount)} remaining
                </span>
              )}
            </div>

            {!isAnnual ? (
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                <div 
                  className="bg-emerald-600 h-full rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(100, (unlockedCount / maxContacts) * 100)}%` }}
                />
              </div>
            ) : (
              <div className="flex items-center gap-1.5 text-xs text-emerald-700 font-semibold">
                <Zap className="w-3.5 h-3.5 text-emerald-600" />
                <span>Unlimited 24/7 Candidate Sourcing</span>
              </div>
            )}
          </div>

          {/* Card 3: Upgrade / Co-Supervision Action */}
          <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white rounded-2xl p-5 shadow-xs flex flex-col justify-between space-y-3">
            <div>
              <span className="text-[10px] font-mono font-bold uppercase text-emerald-400 block">
                {isAnnual ? 'Annual Partner Advantage' : 'Scale Recruitment'}
              </span>
              <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                {isAnnual 
                  ? 'Access your 3-Month Talent Integration Co-Supervision module.' 
                  : 'Upgrade to Annual Scale (₦250,000) for unlimited candidate unlocks.'}
              </p>
            </div>

            {isAnnual ? (
              <button
                type="button"
                onClick={() => setShowCoSupervisionModal(true)}
                className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2 px-3 rounded-xl text-xs flex items-center justify-center gap-1.5 transition cursor-pointer shadow-xs"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Request Co-Supervision</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={onNavigateToPricing || navToDirectory}
                className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2 px-3 rounded-xl text-xs flex items-center justify-center gap-1.5 transition cursor-pointer shadow-xs"
              >
                <span>Upgrade to Annual Scale</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

        </div>

        {/* TALENT CONTACTS & UNLOCKED CANDIDATES ROSTER SECTION */}
        <div 
          id="talent-contacts-section" 
          data-testid="talent-contacts-section"
          className="relative bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6 overflow-hidden min-h-[420px]"
        >
          {/* AccessOverlay component covering the Talent Contacts section when verification_status is not 'verified' */}
          {verificationStatus !== 'verified' && (
            <AccessOverlay
              status={verificationStatus}
              companyName={recruiter?.company_name}
              email={recruiter?.business_email || user?.email}
              onRefresh={() => {
                fetchRecruiterData();
              }}
            />
          )}

          <div className={verificationStatus !== 'verified' ? 'filter blur-[3.5px] opacity-35 select-none pointer-events-none transition-all duration-300' : 'transition-all duration-300'}>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-display font-bold text-xl sm:text-2xl text-slate-900" id="talent-contacts-title">
                  Talent Contacts
                </h2>
                <span className="bg-emerald-50 text-emerald-800 border border-emerald-200 font-mono text-xs font-bold px-2.5 py-0.5 rounded-full">
                  {unlockedTalents.length}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Full direct contact channels (WhatsApp, phone &amp; email) for candidates you have unlocked.
              </p>
            </div>

            {/* Search filter for unlocked */}
            <div className="w-full sm:w-72 relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search unlocked candidates..."
                className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-slate-50"
              />
            </div>
          </div>

          {unlockedTalents.length === 0 ? (
            verificationStatus !== 'verified' ? (
              /* Sample candidate dossiers blurred underneath the overlay */
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-2">
                {SAMPLE_TALENT_DOSSIERS.map((candidate) => (
                  <div
                    key={candidate.id}
                    className="bg-white border border-slate-200/90 rounded-2xl p-5 sm:p-6 shadow-2xs space-y-4 flex flex-col justify-between"
                  >
                    <div className="space-y-4">
                      <div className="flex items-start gap-3.5">
                        <img
                          src={candidate.profile_picture_url}
                          alt={candidate.full_name}
                          className="w-14 h-14 rounded-xl object-cover border border-slate-200 shrink-0 bg-slate-100"
                        />
                        <div className="min-w-0 flex-1 space-y-1">
                          <div className="flex items-center gap-1.5">
                            <h4 className="font-display font-bold text-base text-slate-900 truncate">
                              {candidate.full_name}
                            </h4>
                            <span className="text-[10px] font-mono font-bold bg-amber-50 text-amber-800 border border-amber-200 px-1.5 py-0.2 rounded-md">
                              Verified
                            </span>
                          </div>
                          <p className="text-xs text-emerald-700 font-semibold truncate">
                            {candidate.headline}
                          </p>
                          <p className="text-[11px] text-slate-400 flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            <span>{candidate.location}</span>
                          </p>
                        </div>
                      </div>

                      {/* Direct Outreach Channels Masked */}
                      <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3 space-y-2 text-xs">
                        <span className="font-mono text-[10px] font-bold uppercase text-emerald-700 block">
                          Direct Contact Channels (Masked)
                        </span>
                        <div className="flex items-center justify-between text-slate-700 mt-2">
                          <span className="flex items-center gap-1.5 font-medium">
                            <Phone className="w-3.5 h-3.5 text-slate-400" />
                            <span>+234 ••• ••• ••••</span>
                          </span>
                          <span className="text-slate-400 font-mono text-[11px] bg-slate-100 px-2 py-0.5 rounded">
                            WhatsApp
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-slate-700 mt-2">
                          <span className="flex items-center gap-1.5 font-medium">
                            <Mail className="w-3.5 h-3.5 text-slate-400" />
                            <span>••••••@••••••.com</span>
                          </span>
                          <span className="text-slate-400 font-mono text-[11px] bg-slate-100 px-2 py-0.5 rounded">
                            Email
                          </span>
                        </div>
                      </div>

                      {/* Skills */}
                      <div className="flex flex-wrap gap-1">
                        {candidate.skills.map((sk, i) => (
                          <span key={i} className="text-[10px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md font-medium">
                            {sk}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              /* Empty Unlocked State */
              <div className="py-12 sm:py-16 text-center space-y-4 max-w-md mx-auto">
                <div className="w-14 h-14 bg-slate-100 text-slate-500 rounded-2xl flex items-center justify-center mx-auto border border-slate-200">
                  <Unlock className="w-7 h-7" />
                </div>
                <div className="space-y-1">
                  <h3 className="font-display font-bold text-lg text-slate-900">
                    No Talent Contacts Unlocked Yet
                  </h3>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Browse our directory of pre-vetted AI engineers, growth marketers, and full-stack builders to unlock direct WhatsApp and email outreach.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={navToDirectory}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 px-6 rounded-xl text-xs inline-flex items-center gap-2 cursor-pointer shadow-xs transition"
                >
                  <Search className="w-4 h-4" />
                  <span>Explore Vetted Talent Pool</span>
                </button>
              </div>
            )
          ) : filteredTalents.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-500">
              No unlocked candidates match your search "{searchQuery}".
            </div>
          ) : (
            /* Unlocked Candidate Cards Grid */
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredTalents.map((candidate) => {
                const phone = candidate.whatsapp_number || candidate.phone || '';
                const cleanPhone = phone.replace(/[^0-9+]/g, '').replace(/^0/, '234');
                const email = candidate.contact_email || candidate.email || '';
                const isApproved = candidate.vetting_status === 'approved' || candidate.vetting_status === 'verified';

                return (
                  <div
                    key={candidate.id}
                    className="bg-white border border-slate-200/90 hover:border-slate-300 rounded-2xl p-5 sm:p-6 shadow-2xs hover:shadow-md transition space-y-4 flex flex-col justify-between"
                  >
                    <div className="space-y-4">
                      {/* Avatar, Name, Status */}
                      <div className="flex items-start gap-3.5">
                        <img
                          src={candidate.profile_picture_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=300'}
                          alt={candidate.full_name}
                          className="w-14 h-14 rounded-xl object-cover border border-slate-200 shrink-0 bg-slate-100 shadow-2xs"
                        />
                        <div className="min-w-0 flex-1 space-y-1">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <h4 className="font-display font-bold text-base text-slate-900 truncate">
                              {candidate.full_name}
                            </h4>
                            {isApproved && (
                              <span className="text-[10px] font-mono font-bold bg-amber-50 text-amber-800 border border-amber-200 px-1.5 py-0.2 rounded-md">
                                Verified
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-emerald-700 font-semibold truncate">
                            {candidate.headline || candidate.specialty || 'Technical Talent'}
                          </p>
                          {candidate.location && (
                            <p className="text-[11px] text-slate-400 flex items-center gap-1">
                              <MapPin className="w-3 h-3" />
                              <span>{candidate.location}</span>
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Direct Unlocked Contact Channels */}
                      <div className="relative bg-slate-50 border border-slate-200/80 rounded-xl p-3 space-y-2 text-xs overflow-hidden">
                        {/* Overlay component that masks talent contacts if the status is 'suspended' or 'pending' */}
                        {(isSuspended || isPendingVerification) && (
                          <TalentContactMaskOverlay
                            status={isSuspended ? 'suspended' : 'pending'}
                            candidateName={candidate.full_name}
                            recruiterCompany={recruiter?.company_name}
                          />
                        )}

                        <div className={isSuspended || isPendingVerification ? 'filter blur-[2px] opacity-40 select-none pointer-events-none' : ''}>
                          <span className="font-mono text-[10px] font-bold uppercase text-emerald-700 block">
                            ✓ Direct Outreach Channels Unlocked
                          </span>

                          {phone && (
                            <div className="flex items-center justify-between text-slate-700 mt-2">
                              <span className="flex items-center gap-1.5 font-medium">
                                <Phone className="w-3.5 h-3.5 text-slate-400" />
                                <span>{isSuspended || isPendingVerification ? '+234 ••• ••• ••••' : phone}</span>
                              </span>
                              <a
                                href={isSuspended || isPendingVerification ? '#' : `https://wa.me/${cleanPhone}?text=${encodeURIComponent(`Hi ${candidate.full_name}, I'm reaching out from ${recruiter?.company_name || 'Digital Campux Recruiter Network'} regarding an opportunity.`)}`}
                                target={isSuspended || isPendingVerification ? '_self' : '_blank'}
                                rel="noopener noreferrer"
                                className="text-emerald-700 hover:text-emerald-800 font-bold font-mono text-[11px] bg-emerald-100/70 hover:bg-emerald-200/70 px-2 py-0.5 rounded transition"
                              >
                                WhatsApp
                              </a>
                            </div>
                          )}

                          {email && (
                            <div className="flex items-center justify-between text-slate-700 mt-2">
                              <span className="flex items-center gap-1.5 font-medium truncate max-w-[170px]" title={email}>
                                <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                                <span className="truncate">{isSuspended || isPendingVerification ? '••••••@••••••.com' : email}</span>
                              </span>
                              <a
                                href={isSuspended || isPendingVerification ? '#' : `mailto:${email}?subject=${encodeURIComponent(`Interview Invitation from ${recruiter?.company_name || 'Hiring Team'}`)}`}
                                className="text-slate-700 hover:text-slate-900 font-bold font-mono text-[11px] bg-slate-200/70 hover:bg-slate-300/70 px-2 py-0.5 rounded transition shrink-0"
                              >
                                Email
                              </a>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Skills Strip */}
                      {Array.isArray(candidate.skills) && candidate.skills.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {candidate.skills.slice(0, 3).map((sk: string, i: number) => (
                            <span key={i} className="text-[10px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md font-medium">
                              {sk}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* View CV Portfolio Modal Button */}
                    <button
                      type="button"
                      onClick={() => setPreviewCandidateSlug(candidate.slug || candidate.full_name?.toLowerCase().replace(/[^a-z0-9]+/g, '-'))}
                      className="w-full bg-slate-900 hover:bg-emerald-600 text-white font-medium py-2 px-3 rounded-xl text-xs flex items-center justify-center gap-1.5 transition cursor-pointer shadow-2xs"
                    >
                      <span>View Executive CV & Portfolio</span>
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                );
              })}
            </div>
          )}

          </div>
        </div>

      </main>

      {/* CO-SUPERVISION MODAL FOR ANNUAL PLAN SUBSCRIBERS */}
      {showCoSupervisionModal && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 max-w-lg w-full space-y-6 text-left shadow-2xl relative">
            <button
              type="button"
              onClick={() => setShowCoSupervisionModal(false)}
              className="absolute right-5 top-5 text-slate-400 hover:text-slate-600"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="space-y-1">
              <div className="inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-800 border border-emerald-200 font-mono text-[10px] font-bold uppercase px-2.5 py-0.5 rounded-full">
                <Sparkles className="w-3 h-3 text-emerald-600" />
                <span>Annual Co-Pilot Benefit</span>
              </div>
              <h3 className="font-display font-bold text-xl text-slate-900">
                Request 3-Month Talent Integration Co-Supervision
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Our senior engineering directors and growth architects will co-supervise your newly hired talent's first 90 days, setting sprint milestones and QA audits.
              </p>
            </div>

            {coSupervisionSuccess ? (
              <div className="p-6 bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-2xl text-center space-y-2">
                <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
                <h4 className="font-bold text-sm">Co-Supervision Request Received!</h4>
                <p className="text-xs text-emerald-700">
                  Our Technical Director will reach out to <strong>{recruiter?.business_email}</strong> within 4 business hours to schedule your onboarding kickoff session.
                </p>
              </div>
            ) : (
              <form onSubmit={handleCoSupervisionSubmit} className="space-y-4">
                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-slate-700">
                    Candidate Hired / Role Focus
                  </label>
                  <input
                    type="text"
                    required
                    value={coSupervisionSubject}
                    onChange={(e) => setCoSupervisionSubject(e.target.value)}
                    placeholder="e.g. AI Automation Engineer - Workflow Orchestration"
                    className="w-full p-2.5 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-slate-700">
                    Project Scope & Key 90-Day Goals
                  </label>
                  <textarea
                    rows={4}
                    required
                    value={coSupervisionMessage}
                    onChange={(e) => setCoSupervisionMessage(e.target.value)}
                    placeholder="Describe your tech stack, key delivery milestones, or specific support needed during sprint onboarding..."
                    className="w-full p-2.5 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none leading-relaxed"
                  />
                </div>

                <button
                  type="submit"
                  disabled={coSupervisionSending}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold py-3 px-4 rounded-xl text-xs flex items-center justify-center gap-2 cursor-pointer shadow-md transition"
                >
                  {coSupervisionSending ? (
                    <span>Submitting Request...</span>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      <span>Submit Co-Supervision Schedule</span>
                    </>
                  )}
                </button>
              </form>
            )}

          </div>
        </div>
      )}

      {/* FULL CANDIDATE PORTFOLIO PREVIEW MODAL */}
      {previewCandidateSlug && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center z-50 p-2 sm:p-4 overflow-y-auto animate-fadeIn">
          <div className="bg-white border border-slate-200 rounded-3xl shadow-2xl max-w-5xl w-full my-4 overflow-hidden text-left relative flex flex-col max-h-[92vh]">
            <div className="bg-slate-900 text-white p-4 sm:px-6 flex items-center justify-between gap-4 shrink-0">
              <span className="font-mono text-xs font-bold text-emerald-400">
                Candidate Portfolio Preview: /{previewCandidateSlug}
              </span>
              <button
                type="button"
                onClick={() => setPreviewCandidateSlug(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto">
              <PublicPortfolio
                candidateSlug={previewCandidateSlug}
                onClose={() => setPreviewCandidateSlug(null)}
                isEmbedded={true}
              />
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
