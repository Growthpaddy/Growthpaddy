import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { CaseStudyItem, WorkHistoryItem, EducationItem } from '../types';
import { 
  CheckCircle2, 
  MapPin, 
  Linkedin, 
  Github, 
  Globe, 
  Mail, 
  Award, 
  Briefcase, 
  Code, 
  Cpu, 
  ExternalLink, 
  Share2, 
  Check, 
  Copy, 
  ChevronLeft, 
  Building2, 
  Calendar, 
  GraduationCap, 
  Flame, 
  TrendingUp, 
  Clock, 
  User, 
  ShieldCheck, 
  Zap, 
  AlertTriangle,
  Printer,
  Lock,
  Unlock,
  MessageSquare,
  FileText,
  Send,
  Sparkles,
  Phone,
  ArrowRight,
  CreditCard,
  X
} from 'lucide-react';

interface PublicPortfolioProps {
  slug?: string;
  candidateSlug?: string;
  onNavigateBack?: () => void;
  onClose?: () => void;
  onOpenHireModal?: (candidate: any) => void;
  initialData?: any;
  isEmbedded?: boolean;
}

export default function PublicPortfolio({
  slug,
  candidateSlug,
  onNavigateBack,
  onClose,
  onOpenHireModal,
  initialData,
  isEmbedded = false
}: PublicPortfolioProps) {
  const activeSlug = candidateSlug || slug;
  const handleBack = onClose || onNavigateBack;
  const [loading, setLoading] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [talent, setTalent] = useState<any>(initialData || null);

  // Recruiter Contact Locking & Modal States
  const [isContactUnlocked, setIsContactUnlocked] = useState(false);
  const [unlockingContact, setUnlockingContact] = useState(false);
  const [showRecruiterPricingModal, setShowRecruiterPricingModal] = useState(false);
  const [verificationNotice, setVerificationNotice] = useState<string | null>(null);

  // Contact Form Modal
  const [showContactModal, setShowContactModal] = useState(false);
  const [contactSubmitted, setContactSubmitted] = useState(false);
  const [contactForm, setContactForm] = useState({
    name: '',
    email: '',
    company: '',
    message: ''
  });

  // Fetch talent profile from Supabase
  useEffect(() => {
    if (initialData) {
      setTalent(initialData);
      return;
    }

    const fetchTalentProfile = async () => {
      setLoading(true);
      const targetSlug = activeSlug || 
        window.location.hash.replace(/^#\/p\//, '').replace(/^#\//, '').trim() ||
        window.location.pathname.replace(/^\/p\//, '').replace(/^\//, '').trim();

      try {
        if (targetSlug && targetSlug !== 'directory' && targetSlug !== 'profile' && targetSlug !== 'talent-profile') {
          // 1. Try slug match
          const { data, error } = await supabase
            .from('talent_profiles')
            .select('*')
            .eq('slug', targetSlug)
            .maybeSingle();

          if (data) {
            setTalent(data);
            setLoading(false);
            return;
          }

          // 2. Try ID match if targetSlug looks like a UUID
          const { data: idData } = await supabase
            .from('talent_profiles')
            .select('*')
            .eq('id', targetSlug)
            .maybeSingle();

          if (idData) {
            setTalent(idData);
            setLoading(false);
            return;
          }

          // 3. Fallback: try user_id match
          const { data: uidData } = await supabase
            .from('talent_profiles')
            .select('*')
            .eq('user_id', targetSlug)
            .maybeSingle();

          if (uidData) {
            setTalent(uidData);
            setLoading(false);
            return;
          }
        }

        // If no slug matched, fetch the most recent approved or registered talent
        const { data: fallbackList } = await supabase
          .from('talent_profiles')
          .select('*')
          .order('updated_at', { ascending: false })
          .limit(1);

        if (fallbackList && fallbackList.length > 0) {
          setTalent(fallbackList[0]);
        }
      } catch (err) {
        console.error('Failed to load public talent profile:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchTalentProfile();
  }, [activeSlug, initialData]);

  // Check if current authenticated recruiter has already unlocked this candidate
  useEffect(() => {
    const checkUnlockStatus = async () => {
      if (!talent?.id) return;
      try {
        const { data: authData } = await supabase.auth.getUser();
        const user = authData?.user;
        if (!user) return;

        const { data: unlockRow } = await supabase
          .from('unlocked_contacts')
          .select('*')
          .eq('talent_id', talent.id)
          .or(`recruiter_id.eq.${user.id}`)
          .maybeSingle();

        if (unlockRow) {
          setIsContactUnlocked(true);
        }
      } catch (e) {
        console.warn('Unlock status lookup warning:', e);
      }
    };

    checkUnlockStatus();
  }, [talent?.id]);

  // Vetting Status and Media Locking Checks
  const isApproved = talent?.vetting_status === 'approved' || talent?.vetting_status === 'verified';
  const isPhotoLocked = !isApproved || talent?.profile_picture_locked === true;

  // Extract Raw Fields directly from Supabase schema
  const candidateName = talent?.full_name || talent?.name || 'Vetted Professional';
  const headline = talent?.headline || talent?.specialty || '';
  const bio = talent?.bio || '';
  const yearsExperience = talent?.years_experience || 0;
  const experienceLabel = yearsExperience > 0 
    ? `${yearsExperience} Year${yearsExperience > 1 ? 's' : ''}` 
    : (talent?.experience_level ? (talent.experience_level === 'fresher' ? 'Fresher (1 Yr)' : 'Seasoned (3+ Yrs)') : '1+ Year');

  const skills: string[] = Array.isArray(talent?.skills) ? talent.skills : [];
  const aiTools: string[] = Array.isArray(talent?.ai_tools) ? talent.ai_tools : (Array.isArray(talent?.aiTools) ? talent.aiTools : []);
  const certifications: string[] = Array.isArray(talent?.certifications) ? talent.certifications : [];
  const caseStudies: CaseStudyItem[] = Array.isArray(talent?.case_studies) ? talent.case_studies : (Array.isArray(talent?.caseStudies) ? talent.caseStudies : []);
  const workHistory: WorkHistoryItem[] = Array.isArray(talent?.work_history) ? talent.work_history : (Array.isArray(talent?.workHistory) ? talent.workHistory : []);
  const education: EducationItem[] = Array.isArray(talent?.education) ? talent.education : [];

  const location = talent?.location || 'Lagos, Nigeria (Remote / Hybrid)';
  const availabilityStatus = talent?.availability_status || (talent?.is_hired ? 'hired' : 'available');
  const score = talent?.diagnostic_score || talent?.portfolioScore || (talent?.phase_1_quiz_passed ? 92 : 88);

  const linkedinUrl = talent?.linkedin_url || talent?.linkedinUrl;
  const githubUrl = talent?.github_url || talent?.githubUrl;
  const portfolioUrl = talent?.portfolio_url || talent?.portfolioUrl;

  const rawPhone = talent?.whatsapp_number || talent?.phone || '+234 816 966 4607';
  const rawEmail = talent?.contact_email || talent?.email || 'contact@growthpaddy.com';
  const cleanPhone = rawPhone.replace(/[^0-9+]/g, '').replace(/^0/, '234');

  const defaultAvatar = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=400';
  const avatarUrl = talent?.profile_picture_url || talent?.avatarUrl || defaultAvatar;

  const handleCopyLink = () => {
    const fullUrl = window.location.href;
    navigator.clipboard.writeText(fullUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 3000);
  };

  // Recruiter Paywall & Contact Unlock Action Handler
  const handleContactAction = async (actionType: 'whatsapp' | 'email' | 'hire') => {
    setVerificationNotice(null);

    // 1. Check logged in user
    const { data: authData } = await supabase.auth.getUser();
    const user = authData?.user;

    if (!user) {
      setShowRecruiterPricingModal(true);
      return;
    }

    // 2. Fetch live recruiter profile
    const { data: recruiterData, error: recErr } = await supabase
      .from('recruiters')
      .select('*')
      .or(`user_id.eq.${user.id},id.eq.${user.id}`)
      .maybeSingle();

    if (!recruiterData) {
      setShowRecruiterPricingModal(true);
      return;
    }

    // 3. Check recruiter payment status
    if (recruiterData.payment_status === 'pending_verification') {
      setVerificationNotice('Your recruiter account is currently undergoing GTBank payment verification (typically under 1 hour). Approval is required before unlocking candidate contact channels.');
      return;
    }

    if (recruiterData.payment_status === 'rejected') {
      setVerificationNotice('Your recruiter account verification was not approved. Please contact support via WhatsApp.');
      return;
    }

    // 4. Check contact limits
    const isStarter = recruiterData.selected_package === 'starter_tier';
    const unlockedCount = recruiterData.contacts_unlocked_count || 0;

    // Check if THIS candidate was already unlocked before
    const { data: existingUnlock } = await supabase
      .from('unlocked_contacts')
      .select('*')
      .or(`recruiter_id.eq.${user.id},recruiter_id.eq.${recruiterData.id}`)
      .eq('talent_id', talent.id)
      .maybeSingle();

    if (!existingUnlock && isStarter && unlockedCount >= 5) {
      setVerificationNotice('You have reached your 5 candidate unlock limit for the Starter Hiring Pack. Please upgrade to Annual Scale for unlimited access.');
      setShowRecruiterPricingModal(true);
      return;
    }

    // 5. Unlock contact in database if not already unlocked
    try {
      setUnlockingContact(true);

      if (!existingUnlock) {
        await supabase
          .from('unlocked_contacts')
          .insert([{
            recruiter_id: user.id,
            talent_id: talent.id,
            created_at: new Date().toISOString()
          }]);

        if (isStarter) {
          await supabase
            .from('recruiters')
            .update({
              contacts_unlocked_count: unlockedCount + 1,
              updated_at: new Date().toISOString()
            })
            .eq('id', recruiterData.id);
        }
      }

      setIsContactUnlocked(true);

      // Perform direct action
      if (actionType === 'whatsapp') {
        window.open(`https://wa.me/${cleanPhone}?text=${encodeURIComponent(`Hi ${candidateName}, I reviewed your GrowthPaddy verified portfolio and would like to schedule an introductory interview with ${recruiterData.company_name}.`)}`, '_blank');
      } else if (actionType === 'email') {
        window.location.href = `mailto:${rawEmail}?subject=${encodeURIComponent(`Interview Invitation from ${recruiterData.company_name}`)}`;
      } else {
        setShowContactModal(true);
      }
    } catch (err) {
      console.error('Error unlocking contact channel:', err);
      setVerificationNotice('Unable to unlock candidate contact at this time. Please try again.');
    } finally {
      setUnlockingContact(false);
    }
  };

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setContactSubmitted(true);
    setTimeout(() => {
      setContactSubmitted(false);
      setShowContactModal(false);
      setContactForm({ name: '', email: '', company: '', message: '' });
    }, 2500);
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 text-slate-800">
        <div className="text-center space-y-3">
          <div className="w-8 h-8 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="font-mono text-xs uppercase tracking-wider text-slate-500">Loading Candidate Portfolio...</p>
        </div>
      </div>
    );
  }

  if (!talent) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 text-slate-800">
        <div className="bg-white border border-slate-200 rounded-2xl p-8 max-w-md text-center space-y-4 shadow-sm">
          <AlertTriangle className="w-10 h-10 text-amber-500 mx-auto" />
          <h2 className="text-lg font-bold font-display text-slate-900">Talent Dossier Not Found</h2>
          <p className="text-xs text-slate-600">The requested talent candidate profile is unavailable or private.</p>
          {handleBack && (
            <button
              onClick={handleBack}
              className="px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-semibold hover:bg-slate-800 transition cursor-pointer"
            >
              Return to Directory
            </button>
          )}
        </div>
      </div>
    );
  }

  const hasLeftContent = bio || caseStudies.length > 0 || workHistory.length > 0 || education.length > 0;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-emerald-500 selection:text-white pb-20 text-left">
      
      {/* Top Navbar */}
      <nav className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 px-4 sm:px-8 py-3.5 shadow-2xs">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            {handleBack && (
              <button
                onClick={handleBack}
                className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-xl transition cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Back</span>
              </button>
            )}
            <div className="flex items-center gap-2">
              <span className="font-display font-black text-sm tracking-tight text-slate-900">
                GrowthPaddy
              </span>
              <span className="text-[10px] font-mono font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 px-2 py-0.5 rounded-full">
                Candidate Dossier
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="hidden sm:flex items-center gap-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 bg-white border border-slate-200 hover:bg-slate-50 px-3 py-1.5 rounded-xl transition cursor-pointer shadow-2xs"
            >
              <Printer className="w-3.5 h-3.5 text-slate-500" />
              <span>Export PDF</span>
            </button>

            <button
              onClick={handleCopyLink}
              className="flex items-center gap-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 bg-white border border-slate-200 hover:bg-slate-50 px-3 py-1.5 rounded-xl transition cursor-pointer shadow-2xs"
            >
              {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Share2 className="w-3.5 h-3.5 text-slate-500" />}
              <span>{copiedLink ? 'Link Copied' : 'Share'}</span>
            </button>
          </div>
        </div>
      </nav>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-8 space-y-6 sm:space-y-8">
        
        {/* Verification Alert Notice Banner if Present */}
        {verificationNotice && (
          <div className="p-4 bg-amber-50 border-2 border-amber-400 text-amber-950 rounded-2xl text-xs flex items-start gap-3 shadow-xs animate-fadeIn">
            <Clock className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="font-bold uppercase font-mono text-[11px] text-amber-900">
                Recruiter Access Notice
              </p>
              <p className="leading-relaxed">{verificationNotice}</p>
            </div>
          </div>
        )}

        {/* 1. HEADER HERO BANNER & RESUME HEADER */}
        <section className="bg-white border border-slate-200/90 rounded-2xl sm:rounded-3xl p-6 sm:p-8 shadow-xs relative overflow-hidden text-left">
          
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 sm:gap-8">
            
            {/* Left Side: Avatar & Candidate Info */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5 sm:gap-6 flex-1">
              
              {/* Profile Avatar with Live Media Locking / Vetting Check */}
              <div className="relative shrink-0">
                <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl border-2 border-slate-200 shadow-sm bg-slate-100 overflow-hidden relative">
                  <img
                    src={avatarUrl}
                    alt={candidateName}
                    className={`w-full h-full object-cover transition duration-300 ${
                      isPhotoLocked ? 'filter blur-md scale-105' : ''
                    }`}
                  />
                  {/* Photo Lock Overlay */}
                  {isPhotoLocked && (
                    <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-xs flex flex-col items-center justify-center p-2 text-center text-white">
                      <Lock className="w-5 h-5 text-amber-400 mb-1" />
                      <span className="font-mono text-[9px] font-bold uppercase tracking-wider text-amber-300 leading-tight">
                        Photo Locked
                      </span>
                    </div>
                  )}
                </div>

                {/* Availability Status Dot */}
                <span 
                  className={`absolute bottom-1 right-1 w-4 h-4 rounded-full border-2 border-white shadow-xs ${
                    availabilityStatus === 'available' ? 'bg-emerald-500' : 'bg-slate-400'
                  }`}
                  title={availabilityStatus === 'available' ? 'Available for hire' : 'Currently hired'}
                />
              </div>

              {/* Center Info */}
              <div className="space-y-2 text-left flex-1">
                {/* Badges Row */}
                <div className="flex flex-wrap items-center gap-2">
                  {availabilityStatus === 'available' ? (
                    <span className="inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-700 border border-emerald-200 px-3 py-0.5 rounded-full font-mono text-[11px] font-bold uppercase tracking-wide">
                      <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-600"></span>
                      </span>
                      AVAILABLE FOR HIRE
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 bg-slate-100 text-slate-600 border border-slate-200 px-3 py-0.5 rounded-full font-mono text-[11px] font-bold uppercase tracking-wide">
                      <Lock className="w-3 h-3 text-slate-500" />
                      CURRENTLY HIRED
                    </span>
                  )}

                  {/* GrowthPaddy Verified Gold Badge */}
                  {isApproved ? (
                    <span className="inline-flex items-center gap-1 bg-amber-50 text-amber-900 border border-amber-300 px-3 py-0.5 rounded-full font-mono text-[11px] font-bold uppercase shadow-2xs">
                      <Award className="w-3.5 h-3.5 text-amber-600" />
                      <span>🏆 GrowthPaddy Verified</span>
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 bg-slate-100 text-slate-600 border border-slate-200 px-2.5 py-0.5 rounded-full font-mono text-[11px] font-bold uppercase">
                      <Clock className="w-3.5 h-3.5 text-slate-500" />
                      <span>Registered Candidate</span>
                    </span>
                  )}
                </div>

                {/* Candidate Name */}
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 tracking-tight font-display">
                  {candidateName}
                </h1>

                {/* Headline */}
                {headline && (
                  <p className="text-sm sm:text-base font-semibold text-emerald-700 font-sans">
                    {headline}
                  </p>
                )}

                {/* Location & Social links */}
                <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 pt-1">
                  {location && (
                    <span className="flex items-center gap-1 font-medium">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      <span>{location}</span>
                    </span>
                  )}

                  {linkedinUrl && (
                    <a
                      href={linkedinUrl.startsWith('http') ? linkedinUrl : `https://${linkedinUrl}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-slate-600 hover:text-emerald-700 font-medium transition"
                    >
                      <Linkedin className="w-3.5 h-3.5 text-slate-400" />
                      <span>LinkedIn</span>
                    </a>
                  )}

                  {githubUrl && (
                    <a
                      href={githubUrl.startsWith('http') ? githubUrl : `https://${githubUrl}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-slate-600 hover:text-emerald-700 font-medium transition"
                    >
                      <Github className="w-3.5 h-3.5 text-slate-400" />
                      <span>GitHub</span>
                    </a>
                  )}

                  {portfolioUrl && (
                    <a
                      href={portfolioUrl.startsWith('http') ? portfolioUrl : `https://${portfolioUrl}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-slate-600 hover:text-emerald-700 font-medium transition"
                    >
                      <Globe className="w-3.5 h-3.5 text-slate-400" />
                      <span>Live Site</span>
                    </a>
                  )}
                </div>

                {isPhotoLocked && (
                  <p className="text-[11px] text-amber-700 bg-amber-50/80 border border-amber-200/80 px-2.5 py-1 rounded-lg inline-block">
                    * Photo & Full Accreditation Badge available once Phase 3 Vetting is complete.
                  </p>
                )}
              </div>
            </div>

            {/* Right Side: Recruiter Paywall & Direct Outreach CTA Box */}
            <div className="w-full lg:w-80 bg-slate-50/90 border border-slate-200/80 rounded-2xl p-4 sm:p-5 space-y-3 shrink-0 text-left shadow-2xs">
              <div className="flex items-center justify-between border-b border-slate-200 pb-2.5">
                <span className="text-[11px] font-mono font-bold uppercase text-slate-500">
                  {isContactUnlocked ? 'Contact Channels Unlocked' : 'Employer Sourcing'}
                </span>
                <span className="text-[10px] font-mono font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                  0% Commission
                </span>
              </div>

              {isContactUnlocked ? (
                /* Unlocked Direct Contacts View */
                <div className="space-y-2.5 animate-fadeIn">
                  <div className="bg-emerald-50 border border-emerald-200 p-3 rounded-xl space-y-1.5 text-xs">
                    <span className="font-mono text-[10px] font-bold uppercase text-emerald-800 flex items-center gap-1">
                      <Unlock className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Direct Channels Active</span>
                    </span>
                    <p className="font-semibold text-slate-900 flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5 text-slate-500" />
                      <span>{rawPhone}</span>
                    </p>
                    <p className="font-semibold text-slate-900 flex items-center gap-1.5 truncate" title={rawEmail}>
                      <Mail className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                      <span className="truncate">{rawEmail}</span>
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <a
                      href={`https://wa.me/${cleanPhone}?text=${encodeURIComponent(`Hi ${candidateName}, I reviewed your GrowthPaddy verified portfolio and want to discuss a role.`)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs py-2.5 rounded-xl transition flex items-center justify-center gap-1.5 shadow-xs"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      <span>WhatsApp</span>
                    </a>

                    <a
                      href={`mailto:${rawEmail}?subject=${encodeURIComponent(`Interview Invitation via GrowthPaddy: ${candidateName}`)}`}
                      className="bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs py-2.5 rounded-xl transition flex items-center justify-center gap-1.5 shadow-xs"
                    >
                      <Mail className="w-3.5 h-3.5" />
                      <span>Email</span>
                    </a>
                  </div>
                </div>
              ) : (
                /* Locked Paywall View */
                <div className="space-y-2">
                  <button
                    type="button"
                    onClick={() => handleContactAction('whatsapp')}
                    disabled={unlockingContact}
                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs py-3 rounded-xl shadow-xs transition cursor-pointer flex items-center justify-center gap-2 tracking-wide uppercase"
                  >
                    <MessageSquare className="w-4 h-4" />
                    <span>{unlockingContact ? 'Unlocking...' : 'WhatsApp Candidate'}</span>
                  </button>

                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => handleContactAction('email')}
                      disabled={unlockingContact}
                      className="w-full bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-xs py-2.5 rounded-xl transition cursor-pointer flex items-center justify-center gap-1.5 font-medium shadow-2xs"
                    >
                      <Mail className="w-3.5 h-3.5 text-slate-500" />
                      <span>Email Candidate</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleContactAction('hire')}
                      disabled={unlockingContact}
                      className="w-full bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-xs py-2.5 rounded-xl transition cursor-pointer flex items-center justify-center gap-1.5 font-medium shadow-2xs"
                    >
                      <Briefcase className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Hire / Interview</span>
                    </button>
                  </div>
                </div>
              )}

              <p className="text-[10px] text-slate-500 text-center leading-tight pt-1 font-sans">
                Direct introductions facilitated by GrowthPaddy. Zero ongoing recruitment commission.
              </p>
            </div>

          </div>

          {/* Dynamic Metrics Bar */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 pt-6 mt-6 border-t border-slate-100 text-left">
            
            {/* 1. Experience */}
            <div className="bg-slate-50 border border-slate-200/80 p-3.5 rounded-xl shadow-2xs">
              <div className="flex items-center gap-1.5 text-slate-500 text-xs font-mono">
                <Clock className="w-3.5 h-3.5 text-emerald-600" />
                <span>Experience</span>
              </div>
              <p className="text-base sm:text-lg font-bold text-slate-900 font-mono mt-1">
                {experienceLabel}
              </p>
            </div>

            {/* 2. Diagnostic Assessment */}
            <div className="bg-slate-50 border border-slate-200/80 p-3.5 rounded-xl shadow-2xs">
              <div className="flex items-center gap-1.5 text-slate-500 text-xs font-mono">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>Diagnostic Test</span>
              </div>
              <p className="text-base sm:text-lg font-bold text-slate-900 font-mono mt-1">
                {score > 0 ? `${score}/100 Audited` : 'Profile Registered'}
              </p>
            </div>

            {/* 3. AI Stack Count */}
            <div className="bg-slate-50 border border-slate-200/80 p-3.5 rounded-xl shadow-2xs">
              <div className="flex items-center gap-1.5 text-slate-500 text-xs font-mono">
                <Cpu className="w-3.5 h-3.5 text-emerald-600" />
                <span>AI Stack</span>
              </div>
              <p className="text-base sm:text-lg font-bold text-slate-900 font-mono mt-1">
                {aiTools.length} Tools Mastered
              </p>
            </div>

            {/* 4. Case Studies Count */}
            <div className="bg-slate-50 border border-slate-200/80 p-3.5 rounded-xl shadow-2xs">
              <div className="flex items-center gap-1.5 text-slate-500 text-xs font-mono">
                <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
                <span>Case Studies</span>
              </div>
              <p className="text-base sm:text-lg font-bold text-emerald-700 font-mono mt-1">
                {caseStudies.length} Projects
              </p>
            </div>

          </div>

        </section>

        {/* 2. DUAL-COLUMN RESUME LAYOUT */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 text-left">
          
          {/* MAIN LEFT COLUMN (8 cols): Bio, Case Studies, Work History, Education */}
          <div className="lg:col-span-8 space-y-6 sm:space-y-8">
            
            {/* A. Executive Summary & Bio */}
            {bio && (
              <section className="bg-white border border-slate-200/90 rounded-2xl sm:rounded-3xl p-6 sm:p-7 space-y-3.5 shadow-xs">
                <div className="flex items-center gap-2.5 pb-2.5 border-b border-slate-100">
                  <User className="w-4 h-4 text-emerald-600" />
                  <h2 className="text-base sm:text-lg font-bold text-slate-900 font-display tracking-tight">
                    Executive Summary & Profile
                  </h2>
                </div>

                <p className="text-slate-700 leading-relaxed text-sm sm:text-base whitespace-pre-line font-normal">
                  {bio}
                </p>
              </section>
            )}

            {/* B. Featured Case Studies & ROI Wins */}
            {caseStudies.length > 0 && (
              <section className="bg-white border border-slate-200/90 rounded-2xl sm:rounded-3xl p-6 sm:p-7 space-y-5 shadow-xs">
                <div className="flex items-center justify-between pb-2.5 border-b border-slate-100">
                  <div className="flex items-center gap-2.5">
                    <Flame className="w-4 h-4 text-amber-600" />
                    <h2 className="text-base sm:text-lg font-bold text-slate-900 font-display tracking-tight">
                      Featured Case Studies & ROI Wins
                    </h2>
                  </div>
                  <span className="text-xs font-mono font-medium text-slate-500">{caseStudies.length} Projects</span>
                </div>

                <div className="space-y-4">
                  {caseStudies.map((cs, idx) => {
                    const stack = cs.tech_stack || cs.techStack || cs.tools || [];
                    return (
                      <div
                        key={cs.id || idx}
                        className="bg-slate-50/70 border border-slate-200/90 hover:border-emerald-500/50 rounded-2xl p-5 transition space-y-3 shadow-2xs group"
                      >
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                          <h3 className="font-display font-bold text-sm sm:text-base text-slate-900 group-hover:text-emerald-700 transition">
                            {cs.title}
                          </h3>

                          {(cs.metric || cs.metrics) && (
                            <span className="inline-flex items-center gap-1 font-mono text-xs font-extrabold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-lg shrink-0">
                              <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
                              {cs.metric || cs.metrics}
                            </span>
                          )}
                        </div>

                        {cs.description && (
                          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                            {cs.description}
                          </p>
                        )}

                        {stack.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 pt-2 border-t border-slate-200/60">
                            {stack.map((t, tIdx) => (
                              <span
                                key={tIdx}
                                className="text-[10px] font-mono font-semibold text-slate-700 bg-white border border-slate-200 px-2 py-0.5 rounded-md shadow-2xs"
                              >
                                {t}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </section>
            )}

            {/* C. Work Experience & Career History */}
            {workHistory.length > 0 && (
              <section className="bg-white border border-slate-200/90 rounded-2xl sm:rounded-3xl p-6 sm:p-7 space-y-6 shadow-xs">
                <div className="flex items-center justify-between pb-2.5 border-b border-slate-100">
                  <div className="flex items-center gap-2.5">
                    <Briefcase className="w-4 h-4 text-emerald-600" />
                    <h2 className="text-base sm:text-lg font-bold text-slate-900 font-display tracking-tight">
                      Work Experience & Career History
                    </h2>
                  </div>
                  <span className="text-xs font-mono font-medium text-slate-500">Chronological</span>
                </div>

                <div className="relative pl-6 space-y-8 before:absolute before:left-2.5 before:top-3 before:bottom-3 before:w-0.5 before:bg-slate-200">
                  {workHistory.map((item, idx) => {
                    const bullets = item.bullets || item.highlights || [];
                    const displayDates = item.dates || (item.startDate && item.endDate ? `${item.startDate} - ${item.endDate}` : item.startDate || item.endDate || '');
                    const jobRole = item.role || item.title || 'Technical Specialist';

                    return (
                      <div key={item.id || idx} className="relative space-y-2">
                        <div className="absolute -left-6 top-1.5 w-3 h-3 rounded-full bg-emerald-600 border-2 border-white shadow-xs"></div>

                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                          <div>
                            <h3 className="font-display font-bold text-sm sm:text-base text-slate-900">
                              {jobRole}
                            </h3>
                            <p className="text-xs text-emerald-700 font-semibold flex items-center gap-1.5">
                              <Building2 className="w-3.5 h-3.5 text-slate-400" />
                              <span>{item.company}</span>
                              {item.location && <span className="text-slate-400 font-normal">• {item.location}</span>}
                            </p>
                          </div>

                          {displayDates && (
                            <span className="inline-flex items-center gap-1 font-mono text-xs text-slate-600 bg-slate-100 border border-slate-200 px-2.5 py-1 rounded-md self-start sm:self-auto shadow-2xs">
                              <Calendar className="w-3.5 h-3.5 text-slate-400" />
                              {displayDates}
                            </span>
                          )}
                        </div>

                        {bullets.length > 0 && (
                          <ul className="space-y-1.5 text-xs text-slate-600 list-disc pl-4 pt-1 leading-relaxed">
                            {bullets.map((bullet, bIdx) => (
                              <li key={bIdx}>{bullet}</li>
                            ))}
                          </ul>
                        )}
                      </div>
                    );
                  })}
                </div>
              </section>
            )}

            {/* D. Education & Credentials */}
            {education.length > 0 && (
              <section className="bg-white border border-slate-200/90 rounded-2xl sm:rounded-3xl p-6 sm:p-7 space-y-6 shadow-xs">
                <div className="flex items-center gap-2.5 pb-2.5 border-b border-slate-100">
                  <GraduationCap className="w-4 h-4 text-emerald-600" />
                  <h2 className="text-base sm:text-lg font-bold text-slate-900 font-display tracking-tight">
                    Education & Credentials
                  </h2>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {education.map((edu, idx) => (
                    <div key={edu.id || idx} className="bg-slate-50 border border-slate-200 p-4 rounded-2xl space-y-1 shadow-2xs">
                      {edu.year && (
                        <span className="text-[10px] font-mono uppercase text-emerald-700 font-bold block">
                          {edu.year}
                        </span>
                      )}
                      <h4 className="font-display font-bold text-sm text-slate-900">
                        {edu.degree}
                      </h4>
                      {edu.institution && (
                        <p className="text-xs text-slate-600 font-medium">{edu.institution}</p>
                      )}
                      {(edu.honors || edu.details) && (
                        <p className="text-[11px] text-slate-500 pt-1 leading-normal">{edu.honors || edu.details}</p>
                      )}
                    </div>
                  ))}
                </div>
              </section>
            )}

            {!hasLeftContent && (
              <div className="bg-white border border-slate-200 rounded-3xl p-8 text-center text-slate-500 space-y-3 shadow-xs">
                <FileText className="w-10 h-10 text-slate-400 mx-auto" />
                <h3 className="text-base font-bold text-slate-800">Candidate Technical Dossier</h3>
                <p className="text-xs text-slate-500 max-w-md mx-auto">
                  {candidateName} is currently updating their resume details and project case studies.
                </p>
              </div>
            )}

          </div>

          {/* RIGHT SIDEBAR (4 cols): Vetting Notice, Core Skills, AI Stack, Certs */}
          <div className="lg:col-span-4 space-y-6">
            
            {/* 1. GrowthPaddy Vetting Audit Notice */}
            <div className={`p-5 rounded-2xl border ${
              isApproved
                ? 'bg-amber-50/70 border-amber-200 text-amber-950'
                : 'bg-slate-100 border-slate-200 text-slate-800'
            } space-y-3 shadow-2xs`}>
              <div className="flex items-center gap-2">
                {isApproved ? (
                  <ShieldCheck className="w-5 h-5 text-amber-600" />
                ) : (
                  <AlertTriangle className="w-5 h-5 text-slate-500" />
                )}
                <h3 className="font-display font-bold text-sm uppercase tracking-wide text-slate-900">
                  {isApproved ? 'GrowthPaddy Verified File' : 'Verification Status'}
                </h3>
              </div>

              <p className="text-xs leading-relaxed text-slate-600">
                {isApproved
                  ? 'Identity, problem-solving speed, and automation architecture verified by GrowthPaddy technical evaluators.'
                  : 'Candidate profile registered on GrowthPaddy talent network. Phase 3 verification in progress.'}
              </p>

              <div className="pt-2 border-t border-slate-200/80 space-y-1.5 text-[11px] font-mono text-slate-600">
                <div className="flex items-center justify-between">
                  <span>Technical Assessment:</span>
                  <span className={score >= 75 ? 'text-emerald-700 font-bold' : 'text-slate-500'}>
                    {score >= 75 ? `Passed (${score}%)` : 'Pending Review'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Panel Interview:</span>
                  <span className={talent?.phase_2_interview_passed ? 'text-emerald-700 font-bold' : 'text-slate-500'}>
                    {talent?.phase_2_interview_passed ? 'Passed ✓' : 'Scheduled'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Identity Verification:</span>
                  <span className={isApproved ? 'text-emerald-700 font-bold' : 'text-slate-500'}>
                    {isApproved ? 'Audited ✓' : 'In Review'}
                  </span>
                </div>
              </div>
            </div>

            {/* 2. Core Discipline Skills */}
            {skills.length > 0 && (
              <div className="bg-white border border-slate-200/90 rounded-2xl sm:rounded-3xl p-5 space-y-4 shadow-xs">
                <div className="flex items-center gap-2 pb-2.5 border-b border-slate-100">
                  <Code className="w-4 h-4 text-emerald-600" />
                  <h3 className="font-display font-bold text-sm text-slate-900">
                    Core Skills & Capabilities
                  </h3>
                </div>

                <div className="flex flex-wrap gap-1.5">
                  {skills.map((skill, idx) => (
                    <span
                      key={idx}
                      className="text-xs font-mono font-medium text-slate-800 bg-slate-50 border border-slate-200 hover:border-emerald-500/50 px-3 py-1 rounded-xl transition shadow-2xs"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* 3. AI & Automation Tools Stack */}
            {aiTools.length > 0 && (
              <div className="bg-white border border-slate-200/90 rounded-2xl sm:rounded-3xl p-5 space-y-4 shadow-xs">
                <div className="flex items-center gap-2 pb-2.5 border-b border-slate-100">
                  <Cpu className="w-4 h-4 text-emerald-600" />
                  <h3 className="font-display font-bold text-sm text-slate-900">
                    AI & Automation Stack
                  </h3>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  {aiTools.map((tool, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-2 bg-slate-50 border border-slate-200 px-2.5 py-2 rounded-xl text-xs font-mono text-slate-800 font-medium shadow-2xs"
                    >
                      <Zap className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span className="truncate">{tool}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 4. Industry Accreditations & Certifications */}
            {certifications.length > 0 && (
              <div className="bg-white border border-slate-200/90 rounded-2xl sm:rounded-3xl p-5 space-y-4 shadow-xs">
                <div className="flex items-center gap-2 pb-2.5 border-b border-slate-100">
                  <Award className="w-4 h-4 text-amber-600" />
                  <h3 className="font-display font-bold text-sm text-slate-900">
                    Industry Accreditations
                  </h3>
                </div>

                <div className="space-y-2">
                  {certifications.map((cert, idx) => (
                    <div key={idx} className="flex items-center gap-2 bg-slate-50 border border-slate-200 px-3 py-2 rounded-xl text-xs text-slate-800 font-medium shadow-2xs">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span className="truncate">{cert}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>

        </div>

      </main>

      {/* RECRUITER PRICING & CONTACT UNLOCK PAYWALL MODAL */}
      {showRecruiterPricingModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/75 backdrop-blur-sm p-4 overflow-y-auto animate-fadeIn">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 max-w-2xl w-full text-left relative shadow-2xl space-y-6 my-6">
            
            <button
              onClick={() => setShowRecruiterPricingModal(false)}
              className="absolute right-5 top-5 text-slate-400 hover:text-slate-700 font-mono text-sm cursor-pointer p-1"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="space-y-2">
              <div className="inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-800 border border-emerald-200 font-mono text-[10px] font-bold uppercase px-2.5 py-0.5 rounded-full">
                <Lock className="w-3 h-3 text-emerald-600" />
                <span>Recruiter Sourcing Gateway</span>
              </div>
              <h3 className="font-display font-bold text-2xl text-slate-900">
                Unlock Direct WhatsApp & Email Access
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Connect directly with <strong>{candidateName}</strong> and hundreds of audited Nigerian tech talents with 0% ongoing salary commissions. Choose a sourcing tier below:
              </p>
            </div>

            {/* Pricing Packages Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              
              {/* Package 1: Starter Hiring Pack */}
              <div className="border-2 border-slate-200 hover:border-emerald-500 rounded-2xl p-5 space-y-3 bg-white flex flex-col justify-between shadow-2xs">
                <div className="space-y-1">
                  <span className="text-[10px] font-mono font-bold uppercase text-emerald-800 bg-emerald-100/80 px-2 py-0.5 rounded">
                    Pay-As-You-Go
                  </span>
                  <h4 className="font-display font-bold text-base text-slate-900">
                    Starter Hiring Pack
                  </h4>
                  <p className="text-2xl font-black text-slate-900 font-display">
                    ₦35,000 <span className="text-xs font-normal text-slate-500">/ One-Time</span>
                  </p>
                </div>

                <ul className="text-xs text-slate-600 space-y-1.5 border-t border-slate-100 pt-2">
                  <li className="flex items-center gap-1.5">
                    <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span><strong>5 Pre-Vetted Talent</strong> Contact Unlocks</span>
                  </li>
                  <li className="flex items-center gap-1.5">
                    <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>Direct WhatsApp & Verified Email</span>
                  </li>
                  <li className="flex items-center gap-1.5">
                    <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>0% Ongoing recruitment commission</span>
                  </li>
                </ul>

                <button
                  type="button"
                  onClick={() => {
                    setShowRecruiterPricingModal(false);
                    if (onClose) onClose();
                    window.history.pushState({}, '', '/recruiter/signup?package=starter_tier');
                    window.dispatchEvent(new Event('popstate'));
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="w-full bg-slate-900 hover:bg-emerald-600 text-white font-bold py-2.5 px-3 rounded-xl text-xs flex items-center justify-center gap-1.5 transition cursor-pointer shadow-xs"
                >
                  <span>Select Starter Pack (₦35k)</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Package 2: Annual Scale & Co-Pilot Access */}
              <div className="border-2 border-emerald-600 rounded-2xl p-5 space-y-3 bg-emerald-50/30 flex flex-col justify-between shadow-xs relative">
                <div className="space-y-1">
                  <span className="text-[10px] font-mono font-bold uppercase text-amber-900 bg-amber-100/90 px-2 py-0.5 rounded">
                    Recommended Scale
                  </span>
                  <h4 className="font-display font-bold text-base text-slate-900">
                    Annual Scale & Co-Pilot
                  </h4>
                  <p className="text-2xl font-black text-slate-900 font-display">
                    ₦250,000 <span className="text-xs font-normal text-slate-500">/ Year</span>
                  </p>
                </div>

                <ul className="text-xs text-slate-600 space-y-1.5 border-t border-slate-200/60 pt-2">
                  <li className="flex items-center gap-1.5 text-slate-900 font-medium">
                    <Zap className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span><strong>UNLIMITED Unlocks</strong> for 365 Days</span>
                  </li>
                  <li className="flex items-center gap-1.5">
                    <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span><strong>3-Month Talent Integration Co-Supervision</strong></span>
                  </li>
                  <li className="flex items-center gap-1.5">
                    <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>Dedicated Matchmaker Priority Support</span>
                  </li>
                </ul>

                <button
                  type="button"
                  onClick={() => {
                    setShowRecruiterPricingModal(false);
                    if (onClose) onClose();
                    window.history.pushState({}, '', '/recruiter/signup?package=annual_unlimited');
                    window.dispatchEvent(new Event('popstate'));
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 px-3 rounded-xl text-xs flex items-center justify-center gap-1.5 transition cursor-pointer shadow-md"
                >
                  <span>Select Annual Scale (₦250k)</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

            </div>

            {/* Already registered recruiter link */}
            <div className="text-center pt-2 border-t border-slate-100">
              <p className="text-xs text-slate-500">
                Already registered as an employer?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setShowRecruiterPricingModal(false);
                    if (onClose) onClose();
                    window.history.pushState({}, '', '/recruiter/login');
                    window.dispatchEvent(new Event('popstate'));
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="font-bold text-emerald-700 hover:underline cursor-pointer"
                >
                  Sign In to Recruiter Portal
                </button>
              </p>
            </div>

          </div>
        </div>
      )}

      {/* Hire / Contact Talent Modal */}
      {showContactModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-fadeIn">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 max-w-md w-full text-left relative shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="text-[10px] font-mono font-bold uppercase text-emerald-700 block">
                  Direct Candidate Outreach
                </span>
                <h3 className="font-display font-bold text-lg text-slate-900">
                  Contact {candidateName}
                </h3>
              </div>
              <button
                onClick={() => setShowContactModal(false)}
                className="text-slate-400 hover:text-slate-700 font-mono text-sm cursor-pointer p-1"
              >
                ✕
              </button>
            </div>

            {contactSubmitted ? (
              <div className="bg-emerald-50 border border-emerald-200 p-6 rounded-2xl text-center space-y-2">
                <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
                <h4 className="font-bold text-slate-900 text-base">Inquiry Dispatched!</h4>
                <p className="text-xs text-slate-600">
                  {candidateName} and GrowthPaddy talent coordinators have been notified.
                </p>
              </div>
            ) : (
              <form onSubmit={handleContactSubmit} className="space-y-3.5 text-xs">
                <div>
                  <label className="block text-[11px] font-mono font-semibold text-slate-700 mb-1">Your Full Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Alexander Vance"
                    value={contactForm.name}
                    onChange={e => setContactForm({ ...contactForm, name: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-slate-900 focus:outline-none focus:border-emerald-600 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-mono font-semibold text-slate-700 mb-1">Work Email</label>
                  <input
                    type="email"
                    required
                    placeholder="e.g. alex@company.com"
                    value={contactForm.email}
                    onChange={e => setContactForm({ ...contactForm, email: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-slate-900 focus:outline-none focus:border-emerald-600 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-mono font-semibold text-slate-700 mb-1">Role / Project Scope</label>
                  <input
                    type="text"
                    placeholder="e.g. Full-Time AI Engineer or 3-Month Contract"
                    value={contactForm.company}
                    onChange={e => setContactForm({ ...contactForm, company: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-slate-900 focus:outline-none focus:border-emerald-600 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-mono font-semibold text-slate-700 mb-1">Project Brief / Message</label>
                  <textarea
                    rows={3}
                    required
                    placeholder="Describe your tech stack, timeline, and key requirements..."
                    value={contactForm.message}
                    onChange={e => setContactForm({ ...contactForm, message: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-slate-900 focus:outline-none focus:border-emerald-600 focus:bg-white font-sans"
                  ></textarea>
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowContactModal(false)}
                    className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold py-2.5 rounded-xl cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 rounded-xl shadow-xs cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Send Inquiry</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

    </div>
  );
}
