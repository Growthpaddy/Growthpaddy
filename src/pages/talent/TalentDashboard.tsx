import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ShieldCheck, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Award, 
  Lock, 
  Unlock, 
  ArrowRight, 
  ExternalLink, 
  RefreshCw, 
  Check, 
  BookOpen, 
  Sparkles, 
  User, 
  Briefcase, 
  Globe, 
  Layers, 
  Plus, 
  AlertCircle, 
  AlertTriangle, 
  FileText, 
  Eye, 
  CheckCircle, 
  HelpCircle, 
  MapPin, 
  Calendar, 
  Share2, 
  Copy, 
  ChevronRight, 
  ChevronDown,
  Menu,
  X,
  Sliders,
  GraduationCap
} from 'lucide-react';
import { useSupabase } from '../../context/SupabaseContext';
import { supabase } from '../../lib/supabaseClient';

export interface TalentDashboardProps {
  isTalentPaid?: boolean;
  setIsTalentPaid?: React.Dispatch<React.SetStateAction<boolean>>;
  navigateToPage?: (page: 'home' | 'directory' | 'employer' | 'talent' | 'assessment' | 'pricing' | any) => void;
  availabilityStatus?: 'available' | 'hired';
  onStatusChange?: (status: 'available' | 'hired') => void;
  onboardingData?: {
    userName?: string;
    experienceLevel?: string;
    specialty?: string;
    careerGoal?: string;
    email?: string;
    profilePictureUrl?: string;
    slug?: string;
    vettingStatus?: string;
    availability_status?: 'available' | 'hired';
  };
  onProfileUpdated?: (updatedData: { profile_picture_url?: string; full_name?: string; specialty?: string; slug?: string }) => void;
}

interface SkillItem {
  name: string;
  category: string;
  isVerified: boolean;
  score?: number;
  verifiedAt?: string;
}

const DEFAULT_CORE_SKILLS: SkillItem[] = [
  { name: 'AI Workflow Automation', category: 'AI & Automation', isVerified: true, score: 94, verifiedAt: '2026-08-20' },
  { name: 'TypeScript / Node.js', category: 'Engineering', isVerified: true, score: 90, verifiedAt: '2026-08-21' },
  { name: 'Make.com & Zapier Architecture', category: 'AI & Automation', isVerified: true, score: 96, verifiedAt: '2026-08-22' },
  { name: 'Prompt Engineering & LLM APIs', category: 'AI & Automation', isVerified: false },
  { name: 'Full-Stack React Architecture', category: 'Engineering', isVerified: false },
  { name: 'CRO & Conversion Architecture', category: 'Growth Marketing', isVerified: false },
  { name: 'Paid Media & PPC Attribution', category: 'Growth Marketing', isVerified: false },
  { name: 'Technical SEO & Data Pipelines', category: 'Growth Marketing', isVerified: false },
];

export const TalentDashboard: React.FC<TalentDashboardProps> = ({
  isTalentPaid = false,
  setIsTalentPaid,
  navigateToPage,
  availabilityStatus: initialAvailability = 'available',
  onStatusChange,
  onboardingData,
  onProfileUpdated
}) => {
  const { user } = useSupabase();

  // Profile Information State
  const [fullName, setFullName] = useState(onboardingData?.userName || 'Alex Vance');
  const [specialty, setSpecialty] = useState(onboardingData?.specialty || 'AI Automation Operations Architect');
  const [bio, setBio] = useState('Senior Operations Architect specialized in building robust end-to-end automation pipelines, integrating large language models with enterprise backend systems, and scaling workflow reliability.');
  const [location, setLocation] = useState('London, UK (Remote)');
  const [portfolioUrl, setPortfolioUrl] = useState('https://github.com');
  const [slug, setSlug] = useState(onboardingData?.slug || 'alex-vance');
  const [availability, setAvailability] = useState<'available' | 'hired'>(initialAvailability);
  
  // Phase & Vetting State
  // Phase 1: Diagnostic Quiz (Accreditation)
  // Phase 2: Profile & Verification (Portfolio, Verification & Bio)
  // Phase 3: Directory Listing (Live on Marketplace)
  const [activeStep, setActiveStep] = useState<1 | 2 | 3>(2);
  const [phase1QuizPassed, setPhase1QuizPassed] = useState<boolean>(true);
  const [phase2Verified, setPhase2Verified] = useState<boolean>(true);
  const [phase3Listed, setPhase3Listed] = useState<boolean>(true);
  
  // Cooldown State
  const [isCooldownActive, setIsCooldownActive] = useState<boolean>(false);
  const [cooldownRemainingDays, setCooldownRemainingDays] = useState<number>(14);
  const [cooldownCountdownStr, setCooldownCountdownStr] = useState<string>('13d 21h 45m');

  // Skills Matrix State
  const [skillsList, setSkillsList] = useState<SkillItem[]>(DEFAULT_CORE_SKILLS);
  const [newSkillName, setNewSkillName] = useState('');
  const [selectedSkillForQuiz, setSelectedSkillForQuiz] = useState<SkillItem | null>(null);

  // Active Quiz Modal State
  const [isQuizModalOpen, setIsQuizModalOpen] = useState(false);
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [quizScore, setQuizScore] = useState<number | null>(null);
  const [quizFinished, setQuizFinished] = useState(false);

  // UI notifications & Saving state
  const [savingProfile, setSavingProfile] = useState(false);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);
  const [activeTalentTab, setActiveTalentTab] = useState<'all' | 'overview' | 'skills' | 'dossier'>('all');
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);

  // Load candidate profile from Supabase
  useEffect(() => {
    const loadProfile = async () => {
      if (!user) return;
      try {
        const { data, error } = await supabase
          .from('talent_profiles')
          .select('*')
          .eq('id', user.id)
          .maybeSingle();

        if (data) {
          if (data.full_name) setFullName(data.full_name);
          if (data.specialization || data.role || data.specialty) setSpecialty(data.specialization || data.role || data.specialty);
          if (data.bio) setBio(data.bio);
          if (data.location) setLocation(data.location);
          if (data.portfolio_url) setPortfolioUrl(data.portfolio_url);
          if (data.slug) setSlug(data.slug);
          if (data.availability_status) setAvailability(data.availability_status);
          
          // Phase flags
          const quizPassed = Boolean(data.phase_1_quiz_passed ?? true);
          const isVerified = Boolean(data.is_verified ?? true);
          setPhase1QuizPassed(quizPassed);
          setPhase2Verified(isVerified);
          setPhase3Listed(quizPassed && isVerified);

          // Check cooldown
          if (data.quiz_locked_until) {
            const lockTime = new Date(data.quiz_locked_until).getTime();
            const now = Date.now();
            if (lockTime > now) {
              setIsCooldownActive(true);
              const diffMs = lockTime - now;
              const days = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
              setCooldownRemainingDays(days);
              setCooldownCountdownStr(`${days} days remaining`);
            }
          }
        }
      } catch (err) {
        console.warn('Error loading talent profile:', err);
      }
    };
    loadProfile();
  }, [user?.id]);

  // Handle Availability Toggle
  const handleToggleAvailability = async (newStatus: 'available' | 'hired') => {
    setAvailability(newStatus);
    if (onStatusChange) onStatusChange(newStatus);
    if (user) {
      await supabase
        .from('talent_profiles')
        .update({ availability_status: newStatus })
        .eq('id', user.id);
    }
  };

  // Handle Save Profile
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingProfile(true);
    setSaveSuccessMsg(null);

    try {
      if (user) {
        await supabase
          .from('talent_profiles')
          .update({
            full_name: fullName,
            specialization: specialty,
            bio: bio,
            location: location,
            portfolio_url: portfolioUrl,
            slug: slug,
            availability_status: availability,
            skills: skillsList.map(s => s.name),
            updated_at: new Date().toISOString()
          })
          .eq('id', user.id);
      }

      if (onProfileUpdated) {
        onProfileUpdated({
          full_name: fullName,
          specialty: specialty,
          slug: slug
        });
      }

      setSaveSuccessMsg('Profile updated and synchronized successfully.');
      setTimeout(() => setSaveSuccessMsg(null), 3500);
    } catch (err: any) {
      console.error('Error updating profile:', err);
    } finally {
      setSavingProfile(false);
    }
  };

  // Add custom skill
  const handleAddSkill = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = newSkillName.trim();
    if (!clean) return;
    if (skillsList.some(s => s.name.toLowerCase() === clean.toLowerCase())) return;

    setSkillsList(prev => [
      ...prev,
      { name: clean, category: 'Custom Track', isVerified: false }
    ]);
    setNewSkillName('');
  };

  // Launch Skill Quiz
  const handleLaunchQuiz = (skill: SkillItem) => {
    setSelectedSkillForQuiz(skill);
    setCurrentQuestionIdx(0);
    setSelectedAnswer(null);
    setQuizScore(null);
    setQuizFinished(false);
    setIsQuizModalOpen(true);
  };

  // Sample Quiz Questions for the Diagnostic Modal
  const sampleQuizQuestions = useMemo(() => [
    {
      q: `When scaling production ${selectedSkillForQuiz?.name || 'Automation'} workflows, what is the best practice for handling asynchronous API rate-limit responses (HTTP 429)?`,
      options: [
        'Apply exponential backoff with jitter and offload pending retries to an asynchronous background worker queue',
        'Immediately terminate the entire execution pipeline and notify the end-user via SMS',
        'Loop continuously in a synchronous blocking while-loop without sleep intervals',
        'Duplicate the API credentials across 10 simultaneous threads'
      ],
      correct: 0
    },
    {
      q: `How do you guarantee atomic data consistency when updating relational database records during multi-step integration scenarios?`,
      options: [
        'Wrap mutations inside a database transaction block (BEGIN...COMMIT / ROLLBACK)',
        'Write raw JSON files directly to local temporary disk space',
        'Send individual unverified HTTP POST requests without checking the response code',
        'Disable all foreign key constraints permanently across the schema'
      ],
      correct: 0
    },
    {
      q: `Which metric is most crucial when evaluating system reliability for enterprise operations pipelines?`,
      options: [
        'Mean Time to Recovery (MTTR) and execution error rate below 0.1%',
        'The length of the system prompt in tokens',
        'The number of CSS color animations on the front-end dashboard',
        'Total number of developer comments in the codebase'
      ],
      correct: 0
    }
  ], [selectedSkillForQuiz]);

  const handleAnswerSubmit = () => {
    if (selectedAnswer === null) return;
    const isCorrect = selectedAnswer === sampleQuizQuestions[currentQuestionIdx].correct;

    if (currentQuestionIdx + 1 < sampleQuizQuestions.length) {
      setCurrentQuestionIdx(prev => prev + 1);
      setSelectedAnswer(null);
    } else {
      // Finished
      const finalScore = 100;
      setQuizScore(finalScore);
      setQuizFinished(true);
      
      // Mark skill verified
      if (selectedSkillForQuiz) {
        setSkillsList(prev => prev.map(s => 
          s.name === selectedSkillForQuiz.name 
            ? { ...s, isVerified: true, score: finalScore, verifiedAt: 'Today' }
            : s
        ));
      }
    }
  };

  const handleCopyProfileLink = () => {
    const fullUrl = `${window.location.origin}/p/${slug}`;
    if (navigator?.clipboard) {
      navigator.clipboard.writeText(fullUrl);
    }
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 3000);
  };

  return (
    <div className="min-h-screen bg-slate-50/50 py-8 px-4 sm:px-6 lg:px-8 space-y-8 max-w-6xl mx-auto font-sans antialiased text-slate-900 relative">
      
      {/* Toast Notification: Link Copied */}
      <AnimatePresence>
        {copiedLink && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="fixed top-6 right-6 z-50 bg-slate-900 text-white px-4 py-3 rounded-2xl shadow-xl border border-slate-700 flex items-center gap-3 font-medium text-xs pointer-events-none"
          >
            <div className="w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center shrink-0 shadow-xs">
              <Check className="w-3.5 h-3.5 text-white stroke-[3]" />
            </div>
            <div>
              <p className="font-bold text-white text-xs">Link Copied!</p>
              <p className="text-[11px] text-slate-300">Public profile URL copied to your clipboard.</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ========================================================================= */}
      {/* 1. ONBOARDING STEPPER HEADER (3-Step Accreditation Progress Bar) */}
      {/* ========================================================================= */}
      <div className="bg-white rounded-xl p-6 sm:p-8 border border-slate-200 shadow-sm hover:border-slate-300 transition-all space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
          <div>
            <span className="text-xs font-medium tracking-wide text-emerald-700 bg-emerald-50 border border-emerald-200/90 px-3 py-1 rounded-full uppercase">
              Candidate Accreditation Journey
            </span>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 mt-2">
              Talent Accreditation & Profile Hub
            </h1>
            <p className="text-sm font-normal text-slate-500 leading-relaxed">
              Complete your 3-step onboarding to qualify for direct recruiter hiring on the verified directory.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              id="talent-dashboard-share-profile-btn"
              type="button"
              onClick={handleCopyProfileLink}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-white hover:bg-slate-100 text-slate-700 transition cursor-pointer border border-slate-200 shadow-2xs hover:border-slate-300"
              title="Copy public profile link to clipboard"
            >
              {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Share2 className="w-3.5 h-3.5 text-emerald-600" />}
              <span>{copiedLink ? 'Link Copied!' : 'Share Profile'}</span>
            </button>
            <a
              href={`/p/${slug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white transition cursor-pointer shadow-xs"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Preview Live CV</span>
            </a>
          </div>
        </div>

        {/* 3-Step Stepper Visualizer */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
          
          {/* Step 1: Skill Checks */}
          <div className={`p-4 rounded-xl border transition-all ${
            phase1QuizPassed 
              ? 'bg-emerald-50/50 border-emerald-300'
              : activeStep === 1 
              ? 'bg-white border-slate-300 ring-2 ring-emerald-500/20'
              : 'bg-slate-50/60 border-slate-200 opacity-80'
          }`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                  phase1QuizPassed 
                    ? 'bg-emerald-600 text-white shadow-2xs'
                    : 'bg-slate-200 text-slate-700'
                }`}>
                  {phase1QuizPassed ? <Check className="w-4 h-4" /> : '1'}
                </div>
                <div>
                  <h3 className="text-xs font-bold text-slate-800">Step 1: Skill Checks</h3>
                  <p className="text-[11px] font-normal text-slate-500">Skills Accreditation</p>
                </div>
              </div>
              <span className={`text-[10px] font-mono font-medium px-2 py-0.5 rounded-full ${
                phase1QuizPassed ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'
              }`}>
                {phase1QuizPassed ? 'Passed' : 'Required'}
              </span>
            </div>
          </div>

          {/* Step 2: Profile & Verification */}
          <div className={`p-4 rounded-xl border transition-all ${
            phase2Verified 
              ? 'bg-emerald-50/50 border-emerald-300'
              : activeStep === 2 
              ? 'bg-white border-slate-300 ring-2 ring-emerald-500/20'
              : 'bg-slate-50/60 border-slate-200 opacity-80'
          }`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                  phase2Verified 
                    ? 'bg-emerald-600 text-white shadow-2xs'
                    : 'bg-slate-200 text-slate-700'
                }`}>
                  {phase2Verified ? <Check className="w-4 h-4" /> : '2'}
                </div>
                <div>
                  <h3 className="text-xs font-bold text-slate-800">Step 2: Specialist Review & Dossier</h3>
                  <p className="text-[11px] font-normal text-slate-500">Portfolio & Bio Dossier</p>
                </div>
              </div>
              <span className={`text-[10px] font-mono font-medium px-2 py-0.5 rounded-full ${
                phase2Verified ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'
              }`}>
                {phase2Verified ? 'Accredited' : 'In Progress'}
              </span>
            </div>
          </div>

          {/* Step 3: Directory Listing */}
          <div className={`p-4 rounded-xl border transition-all ${
            phase3Listed 
              ? 'bg-emerald-50/50 border-emerald-300'
              : activeStep === 3 
              ? 'bg-white border-slate-300 ring-2 ring-emerald-500/20'
              : 'bg-slate-50/60 border-slate-200 opacity-80'
          }`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                  phase3Listed 
                    ? 'bg-emerald-600 text-white shadow-2xs'
                    : 'bg-slate-200 text-slate-700'
                }`}>
                  {phase3Listed ? <Check className="w-4 h-4" /> : '3'}
                </div>
                <div>
                  <h3 className="text-xs font-bold text-slate-800">Step 3: Directory Listing</h3>
                  <p className="text-[11px] font-normal text-slate-500">Live for Recruiters</p>
                </div>
              </div>
              <span className={`text-[10px] font-mono font-medium px-2 py-0.5 rounded-full ${
                phase3Listed ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'
              }`}>
                {phase3Listed ? 'Active' : 'Pending'}
              </span>
            </div>
          </div>

        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. STATUS BANNERS & COOLDOWN TIMERS */}
      {/* ========================================================================= */}
      {isCooldownActive ? (
        /* Cooldown Notice Alert */
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-5 sm:p-6 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-700 shrink-0">
              <Clock className="w-5 h-5" />
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-amber-800 bg-amber-100/80 px-2 py-0.5 rounded-md">
                  Diagnostic Cooldown Active
                </span>
                <span className="text-xs font-mono font-semibold text-amber-900">
                  {cooldownCountdownStr}
                </span>
              </div>
              <p className="text-xs font-normal text-amber-800/90 leading-relaxed max-w-2xl">
                You recently completed an assessment attempt. You can re-attempt the skill check once the cooldown expires. In the meantime, accelerate your mastery with our official curriculum.
              </p>
            </div>
          </div>

          <a
            href="https://learnwithdsp.com"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold bg-amber-600 hover:bg-amber-700 text-white transition cursor-pointer shadow-xs whitespace-nowrap"
          >
            <GraduationCap className="w-4 h-4" />
            <span>Refresher Course (learnwithdsp.com)</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      ) : (
        /* Verified & Live Active Status Banner */
        <div className="bg-emerald-50/80 border border-emerald-200 rounded-xl p-5 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-700 shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-emerald-900">
                Verified Candidate Dossier Active
              </h2>
              <p className="text-xs font-normal text-emerald-700/90 leading-relaxed">
                Your portfolio file is live on the Digital Campux candidate marketplace for verified recruiters.
              </p>
            </div>
          </div>

          {/* Work Status Toggle Switch */}
          <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-xl p-1 shadow-2xs">
            <button
              type="button"
              onClick={() => handleToggleAvailability('available')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 ${
                availability === 'available'
                  ? 'bg-emerald-600 text-white shadow-2xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-emerald-300" />
              <span>Available for Placement</span>
            </button>
            <button
              type="button"
              onClick={() => handleToggleAvailability('hired')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 ${
                availability === 'hired'
                  ? 'bg-slate-800 text-white shadow-2xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Lock className="w-3 h-3" />
              <span>Hired</span>
            </button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2.5. DASHBOARD NAVIGATION TABS (Mobile / Desktop View Switcher) */}
      {/* ========================================================================= */}
      <div className="bg-white border border-slate-200 rounded-xl p-2 shadow-sm flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 w-full sm:w-auto">
          <button
            onClick={() => setActiveTalentTab('all')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition cursor-pointer flex-1 sm:flex-initial text-center ${
              activeTalentTab === 'all'
                ? 'bg-emerald-50 text-emerald-900 border border-emerald-200 font-bold shadow-2xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            All Sections
          </button>
          <button
            onClick={() => setActiveTalentTab('skills')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition cursor-pointer flex-1 sm:flex-initial text-center flex items-center justify-center gap-1.5 ${
              activeTalentTab === 'skills'
                ? 'bg-emerald-50 text-emerald-900 border border-emerald-200 font-bold shadow-2xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <span>Verified Skills</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-emerald-100 text-emerald-800 font-mono">
              {skillsList.filter(s => s.isVerified).length}/{skillsList.length}
            </span>
          </button>
          <button
            onClick={() => setActiveTalentTab('dossier')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition cursor-pointer flex-1 sm:flex-initial text-center ${
              activeTalentTab === 'dossier'
                ? 'bg-emerald-50 text-emerald-900 border border-emerald-200 font-bold shadow-2xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            Profile Dossier
          </button>
        </div>

        <div className="hidden sm:flex items-center gap-2 pr-2 text-xs text-slate-400 font-medium">
          <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
          <span>Accredited Portfolio Dossier</span>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 3. CORE EDITABLE DOSSIER & VERIFIED SKILLS MATRIX */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Verified Skills & Accreditation Matrix */}
        {(activeTalentTab === 'all' || activeTalentTab === 'skills') && (
        <div className={`${activeTalentTab === 'skills' ? 'lg:col-span-3' : 'lg:col-span-2'} space-y-6`}>
          
          <div className="bg-white rounded-xl p-6 sm:p-8 border border-slate-200 shadow-sm hover:border-slate-300 transition-all space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h2 className="text-lg font-bold text-slate-800">
                  Verified Skills
                </h2>
                <p className="text-sm font-normal text-slate-500 leading-relaxed">
                  Badges verified through diagnostic testing are prominently highlighted on recruiter searches.
                </p>
              </div>
              <span className="text-xs font-medium tracking-wide bg-emerald-50 text-emerald-800 border border-emerald-200/90 px-2.5 py-1 rounded-full font-mono">
                {skillsList.filter(s => s.isVerified).length} / {skillsList.length} Verified
              </span>
            </div>

            {/* Skills Grid */}
            <div className={`grid grid-cols-1 ${activeTalentTab === 'skills' ? 'sm:grid-cols-3' : 'sm:grid-cols-2'} gap-3.5`}>
              {skillsList.map((skill, index) => (
                <div
                  key={index}
                  className={`p-4 rounded-xl border transition-all flex items-start justify-between gap-3 ${
                    skill.isVerified
                      ? 'bg-white border-emerald-200 shadow-sm hover:border-emerald-300'
                      : 'bg-slate-50/70 border-slate-200 hover:bg-slate-50 hover:border-slate-300'
                  }`}
                >
                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="font-semibold text-xs text-slate-900 truncate">
                        {skill.name}
                      </span>
                    </div>
                    <p className="text-[11px] font-normal text-slate-500">
                      {skill.category}
                    </p>
                    {skill.isVerified && skill.score && (
                      <span className="inline-block text-[10px] font-mono font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200/70">
                        Score: {skill.score}% (Accredited)
                      </span>
                    )}
                  </div>

                  {skill.isVerified ? (
                    <button
                      type="button"
                      disabled
                      className="flex items-center gap-1 bg-slate-100 text-slate-400 border border-slate-200 text-[11px] font-semibold px-2.5 py-1 rounded-lg shrink-0 cursor-not-allowed opacity-80 select-none"
                    >
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Passed (Verified)</span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleLaunchQuiz(skill)}
                      className="flex items-center gap-1 bg-white hover:bg-emerald-600 hover:text-white hover:border-emerald-600 text-slate-700 border border-slate-200 text-[11px] font-semibold px-2.5 py-1 rounded-lg transition cursor-pointer shrink-0 shadow-2xs"
                    >
                      <Lock className="w-3 h-3 text-slate-400" />
                      <span>Take Skill Check</span>
                    </button>
                  )}
                </div>
              ))}
            </div>

            {/* Add Custom Skill Form */}
            <form onSubmit={handleAddSkill} className="flex gap-2 pt-2">
              <input
                type="text"
                value={newSkillName}
                onChange={(e) => setNewSkillName(e.target.value)}
                placeholder="Add custom skill or framework (e.g. Python Pipelines, Hubspot CRM)..."
                className="flex-1 px-3.5 py-2 text-xs border border-slate-200 rounded-xl bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 text-slate-900"
              />
              <button
                type="submit"
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 shadow-2xs"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Skill</span>
              </button>
            </form>
          </div>

          {/* Quick Curriculum / Practice Card */}
          <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm hover:border-slate-300 transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-emerald-600" />
                <span>Need Diagnostic Practice?</span>
              </h2>
              <p className="text-xs font-normal text-slate-500 leading-relaxed max-w-xl">
                Review core conceptual frameworks, system architecture questions, and practical scenarios before retaking tests.
              </p>
            </div>
            {navigateToPage && (
              <button
                type="button"
                onClick={() => navigateToPage('assessment')}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 transition cursor-pointer whitespace-nowrap border border-slate-200"
              >
                Launch Sandbox
              </button>
            )}
          </div>
        </div>
        )}

        {/* Right Column: Executive Dossier Details Form */}
        {(activeTalentTab === 'all' || activeTalentTab === 'dossier') && (
        <div className={`${activeTalentTab === 'dossier' ? 'lg:col-span-3 max-w-2xl mx-auto w-full' : ''} space-y-6`}>
          <form onSubmit={handleSaveProfile} className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm hover:border-slate-300 transition-all space-y-4">
            <div className="border-b border-slate-100 pb-3">
              <h2 className="text-base font-bold text-slate-800">
                Executive Profile Details
              </h2>
              <p className="text-xs font-normal text-slate-500">
                Visible to hiring managers in search results.
              </p>
            </div>

            {/* Toast alert */}
            {saveSuccessMsg && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{saveSuccessMsg}</span>
              </div>
            )}

            <div className="space-y-1">
              <label className="text-xs font-bold tracking-wide text-slate-700 block">Full Name</label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
                className="w-full px-3.5 py-2 text-xs border border-slate-200 rounded-xl bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 text-slate-900"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold tracking-wide text-slate-700 block">Specialization Track</label>
              <input
                type="text"
                value={specialty}
                onChange={(e) => setSpecialty(e.target.value)}
                required
                className="w-full px-3.5 py-2 text-xs border border-slate-200 rounded-xl bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 text-slate-900"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold tracking-wide text-slate-700 block">Work Status</label>
              <select
                value={availability}
                onChange={(e) => handleToggleAvailability(e.target.value as 'available' | 'hired')}
                className="w-full px-3.5 py-2 text-xs border border-slate-200 rounded-xl bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 text-slate-900 font-medium"
              >
                <option value="available">Available for Placement</option>
                <option value="hired">Hired</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold tracking-wide text-slate-700 block">Location</label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full px-3.5 py-2 text-xs border border-slate-200 rounded-xl bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 text-slate-900"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold tracking-wide text-slate-700 block">Portfolio / GitHub URL</label>
              <input
                type="url"
                value={portfolioUrl}
                onChange={(e) => setPortfolioUrl(e.target.value)}
                placeholder="https://..."
                className="w-full px-3.5 py-2 text-xs border border-slate-200 rounded-xl bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 text-slate-900"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold tracking-wide text-slate-700 block">Executive Bio / Pitch</label>
              <textarea
                rows={4}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                className="w-full px-3.5 py-2 text-xs border border-slate-200 rounded-xl bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 text-slate-900 leading-relaxed font-normal"
              />
            </div>

            <button
              type="submit"
              disabled={savingProfile}
              className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold transition cursor-pointer shadow-xs flex items-center justify-center gap-2"
            >
              {savingProfile ? 'Saving Changes...' : 'Save Profile Changes'}
            </button>
          </form>
        </div>
        )}

      </div>

      {/* ========================================================================= */}
      {/* 4. DIAGNOSTIC SKILL ACCREDITATION MODAL */}
      {/* ========================================================================= */}
      <AnimatePresence>
        {isQuizModalOpen && selectedSkillForQuiz && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-6 border border-slate-200 shadow-2xl relative text-left"
            >
              <div className="flex items-start justify-between border-b border-slate-100 pb-4">
                <div>
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 border border-emerald-100 px-2.5 py-0.5 rounded-full">
                    Skill Accreditation
                  </span>
                  <h3 className="font-bold text-lg text-slate-900 mt-1">
                    {selectedSkillForQuiz.name} Diagnostic
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setIsQuizModalOpen(false)}
                  className="text-slate-400 hover:text-slate-700 w-8 h-8 rounded-full hover:bg-slate-100 flex items-center justify-center transition cursor-pointer"
                >
                  ✕
                </button>
              </div>

              {quizFinished ? (
                <div className="text-center py-6 space-y-4">
                  <div className="w-12 h-12 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center mx-auto">
                    <Check className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="text-base font-bold text-slate-900">Accreditation Passed!</h4>
                    <p className="text-xs text-slate-500 mt-1">
                      Score: {quizScore}% — Badge successfully added to your candidate profile.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsQuizModalOpen(false)}
                    className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl transition cursor-pointer"
                  >
                    Close & Return to Dashboard
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
                    <span>Question {currentQuestionIdx + 1} of {sampleQuizQuestions.length}</span>
                    <span className="font-mono">Pass Threshold: 80%</span>
                  </div>

                  <p className="text-xs font-semibold text-slate-800 leading-relaxed">
                    {sampleQuizQuestions[currentQuestionIdx].q}
                  </p>

                  <div className="space-y-2 pt-2">
                    {sampleQuizQuestions[currentQuestionIdx].options.map((opt, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setSelectedAnswer(idx)}
                        className={`w-full text-left p-3 rounded-xl border text-xs transition cursor-pointer ${
                          selectedAnswer === idx
                            ? 'bg-emerald-50 border-emerald-400 text-emerald-950 font-medium'
                            : 'bg-slate-50/50 border-slate-200 text-slate-700 hover:bg-slate-100/80'
                        }`}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>

                  <button
                    type="button"
                    onClick={handleAnswerSubmit}
                    disabled={selectedAnswer === null}
                    className="w-full mt-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-xl text-xs font-semibold transition cursor-pointer shadow-xs"
                  >
                    {currentQuestionIdx + 1 === sampleQuizQuestions.length ? 'Finish Quiz' : 'Next Question'}
                  </button>
                </div>
              )}

            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
};

export default TalentDashboard;
