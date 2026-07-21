import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ShieldCheck,
  CheckCircle2, 
  ArrowRight,
  CreditCard,
  Zap,
  Check,
  TrendingUp,
  AlertTriangle,
  Award,
  Calendar,
  Clock,
  Briefcase,
  Layers,
  FileText,
  UserCheck,
  ChevronRight,
  Info,
  Sliders,
  Sparkles,
  MapPin,
  Save,
  User,
  Lock
} from 'lucide-react';
import { useSupabase } from '../context/SupabaseContext';
import { supabase } from '../lib/supabaseClient';

interface TalentDashboardProps {
  isTalentPaid?: boolean;
  setIsTalentPaid?: React.Dispatch<React.SetStateAction<boolean>>;
  navigateToPage?: (page: 'home' | 'directory' | 'employer' | 'talent' | 'assessment' | 'pricing') => void;
  onboardingData?: {
    userName?: string;
    experienceLevel?: 'Fresher/Newbie' | 'Seasoned Professional';
    specialty?: string;
    careerGoal?: string;
    email?: string;
  };
}

interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctIdx: number;
  explanation: string;
}

// Question banks based on experience tier
const PROFESSIONAL_QUESTIONS: QuizQuestion[] = [
  {
    id: 'p1',
    question: 'Your client Make.com scenario webhook fails with a 504 Gateway Timeout processing 40MB payloads. Which architecture resolution secures the workflow?',
    options: [
      'Mount an immediate 202 Accepted response module, offloading downstream heavy compute to an asynchronous background queue',
      'Inject a 15-second sleep timer to throttle the input throughput manually',
      'Multiply HTTP retry headers directly on the client fetch instance',
      'Rewrite the incoming webhook request string format inside direct server loops'
    ],
    correctIdx: 0,
    explanation: 'De-coupling the input trigger from synchronous heavy operations with a 220/202 state prevents timeout limits cleanly.'
  },
  {
    id: 'p2',
    question: 'How do you guarantee strict structured JSON responses when calling Gemini LLM endpoints for programmatic category sorting?',
    options: [
      'Add "Strict JSON format" to the raw system instructions prompt strings',
      'Declare a strict responseSchema definition using the responseSchema parameter inside generateContentConfig',
      'Parse the raw text string utilizing string replacement regex loops after completion',
      'Split incoming responses at paragraph breaks and enforce arrays'
    ],
    correctIdx: 1,
    explanation: 'Enforcing schemas natively at the API configuration level forces structural schema compliance before token completion.'
  },
  {
    id: 'p3',
    question: 'Which Semrush crawl marker identifies canonical indexation errors when a site shows "Duplicate page without user-selected canonical" in Search Console?',
    options: [
      'Unchecked redirect loops on home pages',
      'Absence of self-referencing or explicit link rel="canonical" tags',
      'robots.txt blocks pointing to static index assets',
      'High image size thresholds over 4MB'
    ],
    correctIdx: 1,
    explanation: 'An explicit canonical URL directs the search indexer to prioritize the definitive version, resolving duplicated page weight penalties.'
  }
];

const FRESHER_QUESTIONS: QuizQuestion[] = [
  {
    id: 'f1',
    question: 'What is the primary function of a webhook inside a digital integration system like Zapier?',
    options: [
      'To regularly pull database tables on scheduled 15-minute intervals',
      'To push real-time event notifications immediately from a source system to a destination url',
      'To encrypt personal browser passwords across public networks',
      'To store large image file attachments locally on the machine'
    ],
    correctIdx: 1,
    explanation: 'Webhooks are trigger-based events that push real-time data to specific target URLs the moment an action occurs.'
  },
  {
    id: 'f2',
    question: 'You want to improve a landing page conversion rate. Which variable represents the best primary test metric for a call-to-action button color change?',
    options: [
      'The average time spent scrolling the page',
      'The click-through rate (CTR) of the CTA button',
      'The total organic traffic coming from searches',
      'The pixel resolution of the button graphics'
    ],
    correctIdx: 1,
    explanation: 'Button-specific clicks are measured directly by its CTA click-through rate, identifying which variant drives more action.'
  },
  {
    id: 'f3',
    question: 'Which of the following describes an on-page SEO best practice for a header tag structure?',
    options: [
      'Using only a single H1 tag representing the primary topic, followed by logical H2 and H3 subheadings',
      'Creating ten H1 tags on the same page to confuse competitors',
      'Replacing text headers entirely with visual graphic banners',
      'Hiding the main keywords using CSS display:none techniques'
    ],
    correctIdx: 0,
    explanation: 'A clean, single H1 hierarchy followed by H2 and H3 subheadings makes the document structure readable for crawlers and humans alike.'
  }
];

export default function TalentDashboard({ 
  isTalentPaid = false, 
  setIsTalentPaid,
  navigateToPage,
  onboardingData 
}: TalentDashboardProps) {
  
  const { user, updateProfileData, triggerGradeQuiz } = useSupabase();

  // Active editable form/profile values with automatic DB sync
  const [userName, setUserName] = useState(onboardingData?.userName || 'Candidate Specialist');
  const [experienceTier, setExperienceTier] = useState<'Fresher/Newbie' | 'Seasoned Professional'>(
    onboardingData?.experienceLevel || 'Seasoned Professional'
  );
  const [specialty, setSpecialty] = useState(onboardingData?.specialty || 'AI Automation');
  const [careerGoal, setCareerGoal] = useState(onboardingData?.careerGoal || 'Full-Time Remote Job');
  
  const [syncingProfile, setSyncingProfile] = useState(false);
  const [profileSyncSuccess, setProfileSyncSuccess] = useState(false);

  // 4-Phase Navigation state
  const [activePhase, setActivePhase] = useState<1 | 2 | 3 | 4>(1);

  // Vetting Completed Flags
  const [quizScore, setQuizScore] = useState<number | null>(null);
  const [quizFinished, setQuizFinished] = useState(false);
  const [interviewBooked, setInterviewBooked] = useState(false);
  const [bookedSlot, setBookedSlot] = useState<{date: string, time: string} | null>(null);
  const [dossierSubmitted, setDossierSubmitted] = useState(false);
  const [phase2InterviewPassed, setPhase2InterviewPassed] = useState(false);
  const [showFirstFailModal, setShowFirstFailModal] = useState(false);

  // Phase 1 Retries, lockouts, and live slots
  const [quizAttempts, setQuizAttempts] = useState(0);
  const [quizLockedUntil, setQuizLockedUntil] = useState<string | null>(null);
  const [countdownString, setCountdownString] = useState('');
  const [dbSlots, setDbSlots] = useState<any[]>([]);
  const [selectedSlotId, setSelectedSlotId] = useState<string>('');

  // Fetch dynamic available slots
  const loadAvailableSlots = async () => {
    try {
      const { data, error } = await supabase
        .from('admin_available_slots')
        .select('*')
        .eq('is_booked', false)
        .order('date', { ascending: true });
      if (!error && data && data.length > 0) {
        setDbSlots(data);
      } else {
        // Load fallback mock slots
        const cached = localStorage.getItem('dsp_available_slots');
        if (cached) {
          const parsed = JSON.parse(cached).filter((s: any) => !s.is_booked);
          setDbSlots(parsed);
        } else {
          const defaultSlots = [
            { id: 'slot-1', date: '2026-07-22', time_slot: '11:30 AM', is_booked: false, meeting_link: 'https://zoom.us/j/1234567890' },
            { id: 'slot-2', date: '2026-07-23', time_slot: '02:00 PM', is_booked: false, meeting_link: 'https://zoom.us/j/1234567891' },
            { id: 'slot-3', date: '2026-07-24', time_slot: '09:00 AM', is_booked: false, meeting_link: 'https://zoom.us/j/1234567892' }
          ];
          setDbSlots(defaultSlots);
          localStorage.setItem('dsp_available_slots', JSON.stringify(defaultSlots));
        }
      }
    } catch (err) {
      console.warn('Available slots query exception, using mock fallback', err);
    }
  };

  useEffect(() => {
    loadAvailableSlots();
  }, []);

  // Countdown timer loop for quiz lockout
  useEffect(() => {
    if (!quizLockedUntil) return;
    const updateCountdown = () => {
      const now = Date.now();
      const target = new Date(quizLockedUntil).getTime();
      const diff = target - now;
      if (diff <= 0) {
        setCountdownString('');
        setQuizAttempts(0);
        setQuizLockedUntil(null);
        // Save to DB / Local state
        if (user) {
          updateProfileData({
            quiz_attempts_count: 0,
            quiz_locked_until: null,
            vetting_status: 'not_started'
          });
        }
        return;
      }
      const days = Math.floor(diff / (24 * 60 * 60 * 1000));
      const hours = Math.floor((diff % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000));
      const minutes = Math.floor((diff % (60 * 60 * 1000)) / (60 * 1000));
      const seconds = Math.floor((diff % (60 * 1000)) / 1000);
      setCountdownString(`${days}d ${hours}h ${minutes}m ${seconds}s`);
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, [quizLockedUntil, user]);

  const isQuizCurrentlyLocked = () => {
    if (!quizLockedUntil) return false;
    return new Date(quizLockedUntil) > new Date();
  };

  // Load and sync real user profile from Supabase on mount
  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!user) return;
      try {
        const { data, error } = await supabase
          .from('talent_profiles')
          .select('*')
          .eq('id', user.id)
          .maybeSingle();

        // Load unified profile parameters
        let val = data;
        if (!val) {
          const cached = localStorage.getItem(`mock_talent_profiles_${user.id}`);
          if (cached) {
            val = JSON.parse(cached);
          }
        }

        if (val) {
          if (val.full_name) setUserName(val.full_name);
          if (val.specialty) setSpecialty(val.specialty);
          if (val.experience_level) {
            const mapped = val.experience_level === 'fresher' || val.experience_level === 'Fresher/Newbie' ? 'Fresher/Newbie' : 'Seasoned Professional';
            setExperienceTier(mapped);
          }
          if (val.career_goal) setCareerGoal(val.career_goal);
          if (val.quiz_attempts_count !== undefined) setQuizAttempts(val.quiz_attempts_count);
          if (val.quiz_locked_until) setQuizLockedUntil(val.quiz_locked_until);
          
          if (val.phase_1_quiz_passed) {
            setQuizFinished(true);
            setQuizScore(100);
          }

          if (val.phase_2_interview_scheduled || val.vetting_status === 'interview_scheduled') {
            setInterviewBooked(true);
            if (val.booked_slot_date && val.booked_slot_time_slot) {
              setBookedSlot({ date: val.booked_slot_date, time: val.booked_slot_time_slot });
            } else {
              setBookedSlot({ date: 'July 22, 2026', time: '11:30 AM' });
            }
          }

          if (val.phase_3_fee_paid || val.vetting_status === 'fee_paid') {
            setQuizFinished(true);
            setQuizScore(100);
            setInterviewBooked(true);
            setPhase2InterviewPassed(true);
            if (setIsTalentPaid) setIsTalentPaid(true);
          }

          if (val.phase_2_interview_passed) {
            setPhase2InterviewPassed(true);
          }

          if (val.vetting_status === 'completed') {
            setQuizFinished(true);
            setQuizScore(100);
            setInterviewBooked(true);
            setPhase2InterviewPassed(true);
            if (setIsTalentPaid) setIsTalentPaid(true);
            setDossierSubmitted(true);
          }
        }
      } catch (err) {
        console.warn('Could not load online profile parameters, remaining on local sandbox mode.', err);
      }
    };
    fetchUserProfile();
  }, [user]);

  // Synchronize changes to Supabase
  const handleSaveProfileSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSyncingProfile(true);
    setProfileSyncSuccess(false);

    const payload = {
      full_name: userName,
      specialty: specialty,
      experience_level: experienceTier,
      career_goal: careerGoal,
    };

    const { error } = await updateProfileData(payload);
    setSyncingProfile(false);
    
    if (!error) {
      setProfileSyncSuccess(true);
      setTimeout(() => setProfileSyncSuccess(false), 3000);
    }
  };

  // Phase 1 Quiz State
  const activeQuestions = experienceTier === 'Seasoned Professional' ? PROFESSIONAL_QUESTIONS : FRESHER_QUESTIONS;
  const [currentQIdx, setCurrentQIdx] = useState(0);
  const [quizAnswers, setQuizAnswers] = useState<Record<number, number>>({});
  const [showQExplanation, setShowQExplanation] = useState(false);
  const [quizTimer, setQuizTimer] = useState(60); // 60 seconds countdown
  const [quizActive, setQuizActive] = useState(false);

  // Timer simulation
  useEffect(() => {
    let interval: any = null;
    if (quizActive && quizTimer > 0 && !quizFinished) {
      interval = setInterval(() => {
        setQuizTimer(prev => {
          if (prev <= 1) {
            handleFinishQuiz();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [quizActive, quizTimer, quizFinished]);

  const handleStartQuiz = () => {
    setQuizActive(true);
    setQuizTimer(60);
    setCurrentQIdx(0);
    setQuizAnswers({});
    setShowQExplanation(false);
  };

  const handleSelectQuizAnswer = (optionIdx: number) => {
    if (showQExplanation) return;
    setQuizAnswers(prev => ({ ...prev, [currentQIdx]: optionIdx }));
    setShowQExplanation(true);
  };

  const handleNextQuizQuestion = () => {
    setShowQExplanation(false);
    if (currentQIdx < activeQuestions.length - 1) {
      setCurrentQIdx(prev => prev + 1);
    } else {
      handleFinishQuiz();
    }
  };

  const handleFinishQuiz = async () => {
    setQuizActive(false);
    setQuizFinished(true);
    
    // Compute Score
    let correct = 0;
    activeQuestions.forEach((q, idx) => {
      if (quizAnswers[idx] === q.correctIdx) correct++;
    });
    const finalScore = Math.round((correct / activeQuestions.length) * 100);
    setQuizScore(finalScore);

    const nextAttempts = quizAttempts + 1;
    setQuizAttempts(nextAttempts);

    // Save score and passing state to Supabase / Mock Layer
    if (finalScore >= 75) {
      const answersFormatted = activeQuestions.map((q, idx) => ({
        question_id: q.id,
        selected_option_id: String(quizAnswers[idx])
      }));
      
      // Trigger either edge function or mock update
      if (user) {
        await triggerGradeQuiz(user.id, answersFormatted);
        await updateProfileData({
          phase_1_quiz_passed: true,
          quiz_attempts_count: nextAttempts,
          vetting_status: 'passed_quiz'
        });
      }
      
      // Cache locally
      const mockKey = `mock_talent_profiles_${user?.id || 'guest'}`;
      const existing = JSON.parse(localStorage.getItem(mockKey) || '{}');
      localStorage.setItem(mockKey, JSON.stringify({
        ...existing,
        phase_1_quiz_passed: true,
        quiz_attempts_count: nextAttempts,
        vetting_status: 'passed_quiz'
      }));
    } else {
      // Failed attempt
      if (nextAttempts >= 2) {
        // Locked for 5 days
        const lockDuration = 5 * 24 * 60 * 60 * 1000; // 5 days in ms
        const lockedUntil = new Date(Date.now() + lockDuration).toISOString();
        setQuizLockedUntil(lockedUntil);

        if (user) {
          await updateProfileData({
            phase_1_quiz_passed: false,
            quiz_attempts_count: nextAttempts,
            quiz_locked_until: lockedUntil,
            vetting_status: 'quiz_locked'
          });
        }
        
        // Cache locally
        const mockKey = `mock_talent_profiles_${user?.id || 'guest'}`;
        const existing = JSON.parse(localStorage.getItem(mockKey) || '{}');
        localStorage.setItem(mockKey, JSON.stringify({
          ...existing,
          phase_1_quiz_passed: false,
          quiz_attempts_count: nextAttempts,
          quiz_locked_until: lockedUntil,
          vetting_status: 'quiz_locked'
        }));
      } else {
        // First Failure
        setShowFirstFailModal(true);
        if (user) {
          await updateProfileData({
            quiz_attempts_count: nextAttempts,
            vetting_status: 'failed_first_attempt'
          });
        }
        
        // Cache locally
        const mockKey = `mock_talent_profiles_${user?.id || 'guest'}`;
        const existing = JSON.parse(localStorage.getItem(mockKey) || '{}');
        localStorage.setItem(mockKey, JSON.stringify({
          ...existing,
          quiz_attempts_count: nextAttempts,
          vetting_status: 'failed_first_attempt'
        }));
      }
    }
  };

  // Phase 2: Booking slots data
  const handleBookInterview = async () => {
    if (!selectedSlotId) return;
    const slot = dbSlots.find(s => s.id === selectedSlotId);
    if (!slot) return;

    // Update slot is_booked = true in DB
    try {
      const { error } = await supabase
        .from('admin_available_slots')
        .update({ 
          is_booked: true,
          booked_by_name: userName,
          booked_by_email: user?.email || 'unspecified'
        })
        .eq('id', slot.id);

      // Also update locally cached slots
      const cached = localStorage.getItem('dsp_available_slots');
      if (cached) {
        const parsed = JSON.parse(cached).map((s: any) => {
          if (s.id === slot.id) {
            return { 
              ...s, 
              is_booked: true, 
              booked_by_name: userName, 
              booked_by_email: user?.email || 'unspecified' 
            };
          }
          return s;
        });
        localStorage.setItem('dsp_available_slots', JSON.stringify(parsed));
      }
    } catch (err) {
      console.warn('DB update of slots failed, utilizing mock fallback', err);
    }

    setBookedSlot({
      date: slot.date,
      time: slot.time_slot
    });
    setInterviewBooked(true);

    if (user) {
      await updateProfileData({
        phase_2_interview_scheduled: true,
        booked_slot_id: slot.id,
        booked_slot_date: slot.date,
        booked_slot_time_slot: slot.time_slot,
        vetting_status: 'interview_scheduled'
      });
      
      // Cache locally
      const mockKey = `mock_talent_profiles_${user.id}`;
      const existing = JSON.parse(localStorage.getItem(mockKey) || '{}');
      localStorage.setItem(mockKey, JSON.stringify({
        ...existing,
        phase_2_interview_scheduled: true,
        booked_slot_id: slot.id,
        booked_slot_date: slot.date,
        booked_slot_time_slot: slot.time_slot,
        vetting_status: 'interview_scheduled'
      }));
    }
    loadAvailableSlots(); // reload slots
  };

  // Phase 3: Stripe simulation payment form
  const [cardDetails, setCardDetails] = useState({ cardNo: '', exp: '', cvc: '', name: '' });
  const [payingState, setPayingState] = useState(false);

  const handlePayCommitment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!cardDetails.cardNo || !cardDetails.exp || !cardDetails.cvc) return;
    setPayingState(true);
    setTimeout(async () => {
      setPayingState(false);
      if (setIsTalentPaid) {
        setIsTalentPaid(true);
      }
      
      if (user) {
        await updateProfileData({
          phase_3_fee_paid: true,
          vetting_status: 'fee_paid'
        });

        // Cache locally
        const mockKey = `mock_talent_profiles_${user.id}`;
        const existing = JSON.parse(localStorage.getItem(mockKey) || '{}');
        localStorage.setItem(mockKey, JSON.stringify({
          ...existing,
          phase_3_fee_paid: true,
          vetting_status: 'fee_paid'
        }));
      }
      setActivePhase(4); // Auto progress to build portfolio
    }, 1800);
  };

  // Phase 4: Portfolio Builder state
  const [portfolioData, setPortfolioData] = useState({
    title: '',
    metrics: '',
    url: '',
    about: '',
    caseText: ''
  });

  const handleSaveDossier = (e: React.FormEvent) => {
    e.preventDefault();
    setDossierSubmitted(true);
    setTimeout(async () => {
      if (user) {
        await updateProfileData({
          vetting_status: 'completed',
          session_responses: {
            ...onboardingData,
            portfolio: portfolioData
          }
        });
      }
      alert('Your verified case dossier has been serialized and published to the employer directory successfully!');
    }, 1200);
  };

  const isPhase1Passed = quizFinished && quizScore !== null && quizScore >= 75;

  // Vetting indicators summary
  const getPhaseStatusBadge = (phaseNum: 1 | 2 | 3 | 4) => {
    if (phaseNum === 1) return quizFinished ? 'Passed' : 'Incomplete';
    if (phaseNum === 2) {
      if (phase2InterviewPassed) return 'Passed';
      return interviewBooked ? 'Scheduled' : 'Incomplete';
    }
    if (phaseNum === 3) return isTalentPaid ? 'Verified' : 'Incomplete';
    if (phaseNum === 4) return dossierSubmitted ? 'Submitted' : 'Active';
    return 'Incomplete';
  };

  // Specialty Dynamic Skill Mapping for Portfolio Card Preview
  const getPreviewSkills = () => {
    const skillMap: Record<string, string[]> = {
      'SEO': ['Technical SEO', 'Programmatic SEO', 'Semrush Audit', 'Search Console'],
      'AI Automation': ['Make.com workflows', 'Gemini API', 'Vector Databases', 'Structured JSON'],
      'Growth Marketing': ['LTV Optimization', 'A/B Testing', 'Retention Analytics', 'Paid Acquisition'],
      'PPC': ['Facebook Ad Manager', 'Google Search Ads', 'Ad Account Audits', 'Conversion API'],
      'Social Media': ['TikTok Brand Scale', 'User-Generated Content', 'Community Building', 'Shortform Video'],
      'Email Marketing': ['Klaviyo Flows', 'Direct-Response Copy', 'List Segmentation', 'Cold Outreach']
    };
    return skillMap[specialty] || ['Automation Webhooks', 'Structured Prompts', 'Growth Optimization'];
  };

  return (
    <div id="talent-vetting-workspace" className="space-y-8 py-8 px-4 sm:px-6 lg:px-8 bg-[#fafbfc]">
      
      {/* Page header with verified badge status */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-6 bg-white p-6 border-2 border-neutral-200 rounded-none shadow-sm text-left">
        <div className="space-y-2 max-w-xl">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[10px] uppercase font-mono font-black tracking-widest text-emerald-700 bg-emerald-50 px-2.5 py-0.5 border border-emerald-300 inline-block">
              SPECIALIST CONSOLE
            </span>
            <span className="text-[10px] uppercase font-mono font-black tracking-widest text-slate-700 bg-slate-50 px-2.5 py-0.5 border border-slate-200 inline-block">
              DIFFICULTY: {experienceTier === 'Seasoned Professional' ? 'EXPERT PROFESSIONAL' : 'FOUNDATIONAL FRESHER'}
            </span>
          </div>
          <h1 className="font-display font-black text-2xl text-neutral-950 uppercase tracking-tight leading-none pt-1">
            {userName}'s Vetting Hub
          </h1>
          <p className="text-xs text-neutral-500 uppercase tracking-wider font-semibold">
            Track and complete your 4-Phase Operational Verification to secure priority ranking in employer matching filters.
          </p>
        </div>

        {/* Global Progress Matrix */}
        <div className="bg-slate-900 text-white p-4 rounded-none text-left min-w-[280px] flex-shrink-0 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[9px] font-mono text-slate-400 uppercase font-black tracking-widest">VERIFIED COMPLIANCE STATUS</span>
            <span className="text-xs font-mono font-bold text-emerald-400">
              {isTalentPaid && quizFinished && phase2InterviewPassed && dossierSubmitted ? '100% HIRED READY' : 'IN VETTING PIPELINE'}
            </span>
          </div>
          <div className="grid grid-cols-4 gap-1.5 pt-1.5">
            <div className={`h-1.5 rounded-none ${quizFinished ? 'bg-[#00A86B]' : 'bg-slate-700'}`} />
            <div className={`h-1.5 rounded-none ${phase2InterviewPassed ? 'bg-[#00A86B]' : 'bg-slate-700'}`} />
            <div className={`h-1.5 rounded-none ${isTalentPaid ? 'bg-[#00A86B]' : 'bg-slate-700'}`} />
            <div className={`h-1.5 rounded-none ${dossierSubmitted ? 'bg-[#00A86B]' : 'bg-slate-700'}`} />
          </div>
          <p className="text-[9.5px] text-slate-400 font-bold uppercase tracking-wider block">
            Specialization Field: <span className="text-white font-black">{specialty}</span>
          </p>
        </div>
      </div>

      {/* 4-PHASE PROGRESS STEPPER WIZARD */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-left">
        {[
          { num: 1, title: 'Phase 1: Scenario Quiz', subtitle: 'Adaptive Assessment', state: getPhaseStatusBadge(1), isLocked: false },
          { num: 2, title: 'Phase 2: Panel Interview', subtitle: 'Schedule Boarding', state: getPhaseStatusBadge(2), isLocked: !isPhase1Passed },
          { num: 3, title: 'Phase 3: Review Fee', subtitle: 'Platform Accreditation', state: getPhaseStatusBadge(3), isLocked: !phase2InterviewPassed },
          { num: 4, title: 'Phase 4: Dossier Builder', subtitle: 'Project Evidence', state: getPhaseStatusBadge(4), isLocked: !isTalentPaid }
        ].map((ph) => {
          const isSelected = activePhase === ph.num;
          return (
            <button
              key={ph.num}
              onClick={() => setActivePhase(ph.num as any)}
              className={`p-4 border-2 text-left transition-all relative focus:outline-none cursor-pointer flex flex-col justify-between h-28 rounded-none
                ${isSelected 
                  ? 'border-[#00A86B] bg-emerald-50/10 shadow-sm' 
                  : 'border-slate-200 bg-white hover:bg-slate-50/50'}
                ${ph.isLocked ? 'opacity-85' : ''}`}
            >
              <div>
                <div className="flex items-center justify-between gap-1.5">
                  <span className={`text-[8.5px] font-mono font-black uppercase tracking-widest px-2 py-0.5 rounded-none border block w-max
                    ${ph.state === 'Passed' || ph.state === 'Scheduled' || ph.state === 'Verified' || ph.state === 'Submitted'
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-300' 
                      : 'bg-slate-50 text-slate-500 border-slate-200'}`}
                  >
                    {ph.state}
                  </span>
                  {ph.isLocked && (
                    <Lock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  )}
                </div>
                <h4 className="font-display font-black text-xs text-slate-800 uppercase tracking-tight mt-2">{ph.title}</h4>
              </div>
              <p className="text-[9px] text-slate-400 uppercase tracking-wider font-semibold">{ph.subtitle}</p>
            </button>
          );
        })}
      </div>

      {/* Bento Grid: Left Vetting Board, Right Profile Customizer & Live Card Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left 8-column Panel: Vetting Action Content */}
        <div className="lg:col-span-8 bg-white border-2 border-neutral-200 p-6 sm:p-8 text-left rounded-none shadow-sm min-h-[460px]">
          
          <AnimatePresence mode="wait">
            
            {/* ======================================================== */}
            {/* PHASE 1: SCENARIO QUIZ ASSESSMENT                        */}
            {/* ======================================================== */}
            {activePhase === 1 && (
              <motion.div
                key="phase1"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="space-y-6"
              >
                <div className="border-b border-slate-100 pb-4">
                  <span className="text-[9.5px] font-mono font-black text-[#00A86B] uppercase bg-emerald-50 px-2 py-0.5 border border-emerald-200">
                    ADAPTIVE AUTOMATION ENGINE
                  </span>
                  <h3 className="font-display font-black text-lg text-slate-900 uppercase mt-1">
                    Phase 1: Marketing Operations scenario quiz
                  </h3>
                  <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold mt-1">
                    Prove your hands-on systems capability. You have 60 seconds. High score requirement: <strong className="text-emerald-700 font-mono">75% score threshold to pass</strong>.
                  </p>
                </div>

                {isQuizCurrentlyLocked() && (
                  <div className="p-8 text-center bg-rose-50/30 border-2 border-rose-600 max-w-lg mx-auto space-y-5">
                    <AlertTriangle className="w-12 h-12 text-rose-600 mx-auto" />
                    <h4 className="font-black text-xs uppercase tracking-widest text-neutral-900">DIAGNOSTIC PIPELINE TEMPORARILY LOCKED</h4>
                    <p className="text-xs uppercase font-extrabold text-rose-800 leading-relaxed">
                      To protect pipeline integrity, candidates are limited to two sequential attempts. Your access will be automatically restored after the duration below.
                    </p>
                    
                    <div className="bg-slate-950 text-rose-500 font-mono text-2xl py-3 px-6 font-black tracking-widest inline-block border-2 border-rose-600 shadow-[4px_4px_0px_0px_rgba(225,29,72,1)]">
                      {countdownString || '0d 0h 0m 0s'}
                    </div>

                    <p className="text-[10.5px] text-slate-500 uppercase tracking-wider font-bold leading-relaxed pt-2">
                      While you wait, leverage our high-impact preparation and fast-track coaching streams:
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                      <a
                        href="https://growthpaddy.com/academy-fast-track"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bg-slate-900 hover:bg-slate-800 text-white font-black py-3 px-4 rounded-none text-xs uppercase tracking-wider text-center flex items-center justify-center border-2 border-slate-900 hover:scale-[1.01] transition-transform duration-100"
                      >
                        Option A: Self-Study Fast Track
                      </a>
                      <a
                        href="https://wa.me/2349015187763?text=Hi%20GrowthPaddy,%20I%20failed%20my%20vetting%20quiz%20and%20need%20expert%20coaching"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bg-emerald-600 hover:bg-emerald-700 text-white font-black py-3 px-4 rounded-none text-xs uppercase tracking-wider text-center flex items-center justify-center border-2 border-emerald-600 hover:scale-[1.01] transition-transform duration-100"
                      >
                        Option B: WhatsApp Coaching
                      </a>
                    </div>
                  </div>
                )}

                {!quizActive && !quizFinished && !isQuizCurrentlyLocked() && (
                  <div className="p-8 border border-dashed border-slate-300 bg-slate-50 text-center space-y-4 max-w-lg mx-auto">
                    <Award className="w-12 h-12 text-[#00A86B] mx-auto" />
                    <h4 className="font-black text-xs text-slate-800 uppercase tracking-wider">Are you ready to initiate?</h4>
                    <p className="text-xs text-slate-500 leading-relaxed uppercase font-semibold">
                      This diagnostic contains 3 challenging structural logic inquiries covering {specialty} paradigms. Once activated, the timer counts down immediately.
                    </p>
                    
                    {quizAttempts === 1 && (
                      <div className="p-3 bg-amber-50 border-2 border-amber-300 text-amber-900 text-[10px] font-mono font-black uppercase tracking-wider leading-relaxed text-left">
                        ⚠️ Take a deep breath and stay calm if you're feeling nervous! You have 1 remaining attempt.
                      </div>
                    )}

                    <button
                      onClick={handleStartQuiz}
                      className="bg-slate-900 hover:bg-slate-800 text-white font-black py-3 px-6 rounded-none text-xs uppercase tracking-widest cursor-pointer shadow-[3px_3px_0px_0px_rgba(16,185,129,1)] transition-all duration-150"
                    >
                      INITIALIZE CORE DIAGNOSTIC
                    </button>
                  </div>
                )}

                {quizActive && !quizFinished && !isQuizCurrentlyLocked() && (
                  <div className="space-y-6 max-w-2xl">
                    <div className="flex justify-between items-center text-xs font-mono bg-slate-950 text-white py-2 px-4">
                      <span>QUESTION {currentQIdx + 1} OF {activeQuestions.length}</span>
                      <span className={`${quizTimer <= 15 ? 'text-rose-500 animate-pulse font-black' : 'text-emerald-400 font-bold'}`}>
                        ⏱️ TIMER: {quizTimer}s
                      </span>
                    </div>

                    <div className="bg-slate-50 border border-slate-200 p-5">
                      <h4 className="font-bold text-slate-900 text-sm uppercase leading-relaxed text-left">
                        {activeQuestions[currentQIdx].question}
                      </h4>
                    </div>

                    <div className="space-y-2">
                      {activeQuestions[currentQIdx].options.map((opt, idx) => {
                        const hasSelected = quizAnswers[currentQIdx] !== undefined;
                        const isThisSelected = quizAnswers[currentQIdx] === idx;
                        const isCorrect = idx === activeQuestions[currentQIdx].correctIdx;

                        let btnClass = 'border-slate-200 bg-white hover:bg-slate-50 text-slate-800';
                        if (hasSelected) {
                          if (isCorrect) {
                            btnClass = 'border-emerald-500 bg-emerald-50/25 text-emerald-800 font-bold';
                          } else if (isThisSelected) {
                            btnClass = 'border-rose-300 bg-rose-50/25 text-rose-800 font-bold';
                          } else {
                            btnClass = 'border-slate-200 bg-white opacity-60 text-slate-500';
                          }
                        }

                        return (
                          <button
                            key={idx}
                            onClick={() => handleSelectQuizAnswer(idx)}
                            disabled={hasSelected}
                            className={`w-full text-left p-3.5 border transition rounded-none text-xs flex gap-3 ${btnClass}`}
                          >
                            <span className="font-mono text-[10px] font-black uppercase">[{String.fromCharCode(65 + idx)}]</span>
                            <span>{opt}</span>
                          </button>
                        );
                      })}
                    </div>

                    {showQExplanation && (
                      <motion.div
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="p-4 bg-emerald-50/30 border border-emerald-200 text-emerald-950 space-y-2 text-xs text-left"
                      >
                        <p className="font-bold uppercase tracking-wider text-[9px] text-emerald-700">✓ VETTING INSIGHT RESOLUTION:</p>
                        <p className="leading-relaxed font-medium uppercase">{activeQuestions[currentQIdx].explanation}</p>
                        
                        <button
                          onClick={handleNextQuizQuestion}
                          className="bg-slate-950 text-white font-black py-2 px-4 rounded-none text-[10px] uppercase tracking-widest cursor-pointer flex items-center gap-1.5 mt-2"
                        >
                          <span>CONTINUE FLOW</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      </motion.div>
                    )}
                  </div>
                )}

                {quizFinished && !isQuizCurrentlyLocked() && (
                  <div className="p-8 text-center bg-slate-50 border border-slate-200 max-w-md mx-auto space-y-4">
                    <CheckCircle2 className="w-12 h-12 text-[#00A86B] mx-auto" />
                    <h4 className="font-black text-xs uppercase tracking-widest text-slate-900">DIAGNOSTIC COMPLETED</h4>
                    <p className="text-3xl font-display font-black text-slate-950">
                      SCORE: {quizScore}%
                    </p>
                    <p className="text-xs uppercase tracking-wider font-semibold leading-relaxed text-slate-500">
                      {quizScore !== null && quizScore >= 75 
                        ? `Congratulations! You cleared the DSP Phase 1 Gateway! Your profile status is verified as COMPREHENSIVE EXPERT.`
                        : `Your score was ${quizScore}%. The minimum entry parameter is 75%. Please brush up on core metrics and retry.`}
                    </p>

                    {quizScore !== null && quizScore < 75 && quizAttempts === 1 && (
                      <div className="p-3 bg-amber-50 border-2 border-amber-300 text-amber-900 text-[10px] font-mono font-black uppercase tracking-wider leading-relaxed text-left">
                        ⚠️ Take a deep breath and stay calm if you're feeling nervous! You have 1 remaining attempt.
                      </div>
                    )}
                    
                    {quizScore !== null && quizScore >= 75 ? (
                      <button
                        onClick={() => setActivePhase(2)}
                        className="w-full bg-slate-900 hover:bg-slate-800 text-white font-black py-3.5 rounded-none text-xs uppercase tracking-widest cursor-pointer shadow-[2px_2px_0px_0px_rgba(16,185,129,1)]"
                      >
                        Proceed to Phase 2
                      </button>
                    ) : (
                      <button
                        onClick={handleStartQuiz}
                        className="w-full bg-rose-900 hover:bg-rose-950 text-white font-black py-3.5 rounded-none text-xs uppercase tracking-widest cursor-pointer"
                      >
                        RE-INITIALIZE DIAGNOSTIC
                      </button>
                    )}
                  </div>
                )}

              </motion.div>
            )}

            {/* ======================================================== */}
            {/* PHASE 2: PANEL INTERVIEW SCHEDULER                      */}
            {/* ======================================================== */}
            {activePhase === 2 && (
              <motion.div
                key="phase2"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="space-y-6"
              >
                {!isPhase1Passed ? (
                  <div className="py-16 px-4 text-center space-y-6 max-w-md mx-auto flex flex-col items-center justify-center">
                    <div className="w-16 h-16 bg-slate-100 border-2 border-slate-300 flex items-center justify-center rounded-none text-slate-400 opacity-50">
                      <Lock className="w-8 h-8 stroke-[2.5]" />
                    </div>
                    <h4 className="font-display font-black text-xs uppercase tracking-widest text-slate-900">PHASE LOCKED</h4>
                    <p className="text-xs uppercase font-extrabold text-slate-500 leading-relaxed">
                      Complete Phase 1 with a 75%+ score to unlock Panel Scheduling.
                    </p>
                    <button
                      onClick={() => setActivePhase(1)}
                      className="bg-slate-900 hover:bg-slate-800 text-white font-black py-2.5 px-6 rounded-none text-[10px] uppercase tracking-wider transition cursor-pointer"
                    >
                      Return to Phase 1 Diagnostic
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="border-b border-slate-100 pb-5 text-left">
                      <span className="text-[9.5px] font-mono font-black text-emerald-700 uppercase bg-emerald-50 px-2 py-0.5 border border-emerald-200">
                        CALENDLY SCHEDULING INTEGRATION
                      </span>
                      <h3 className="font-display font-black text-lg text-slate-900 uppercase mt-1">
                        Phase 2: Panel Vetting Video Session
                      </h3>
                      <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold mt-1">
                        Pick a calendar day and confirm a timezone-adjusted slot for your 2-to-3 person panel competence review.
                      </p>
                    </div>

                {interviewBooked && bookedSlot ? (
                  <div className="p-8 text-center bg-emerald-50/20 border border-emerald-300 max-w-md mx-auto space-y-4">
                    <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto" />
                    <h4 className="font-black text-xs uppercase tracking-wider text-slate-900">
                      {phase2InterviewPassed ? 'PANEL REVIEW PASSED' : 'PANEL REVIEW BOOKED'}
                    </h4>
                    <p className="text-xs text-slate-600 uppercase tracking-wider leading-relaxed text-left bg-white p-4 border-2 border-emerald-200">
                      📅 Date: <strong className="text-slate-900 uppercase">{new Date(bookedSlot.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}</strong> <br />
                      ⏱️ Time: <strong className="text-slate-900 uppercase">{bookedSlot.time} (UTC/GMT)</strong>
                    </p>
                    
                    {phase2InterviewPassed ? (
                      <div className="p-3 bg-emerald-100 border border-emerald-300 text-emerald-950 text-[10px] font-bold uppercase text-left rounded-none">
                        ✓ ACCREDITATION COMPLETE: Your interview records have been processed and approved by the panel. Verification is unlocked.
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <p className="text-[10px] text-slate-400 font-mono uppercase tracking-widest block pt-2">
                          ZOOM credentials and calendar invites have been routed to your profile coordinates.
                        </p>
                        
                        <div className="p-4 bg-slate-950 text-white space-y-2 text-left rounded-none border border-emerald-500">
                          <span className="text-[9px] font-mono font-black text-emerald-400 uppercase tracking-widest block">DEVELOPER PREVIEW MATRIX</span>
                          <p className="text-[10px] text-slate-300 font-semibold uppercase leading-normal">
                            In production, growthpaddy staff will grade your video call. For demo/review testing, bypass the manual staff evaluation by clicking below:
                          </p>
                          <button
                            onClick={async () => {
                              setPhase2InterviewPassed(true);
                              if (user) {
                                await updateProfileData({
                                  phase_2_interview_passed: true,
                                  vetting_status: 'interview_passed'
                                });
                                // Cache locally
                                const mockKey = `mock_talent_profiles_${user.id}`;
                                const existing = JSON.parse(localStorage.getItem(mockKey) || '{}');
                                localStorage.setItem(mockKey, JSON.stringify({
                                  ...existing,
                                  phase_2_interview_passed: true,
                                  vetting_status: 'interview_passed'
                                }));
                              }
                            }}
                            className="w-full bg-[#00A86B] hover:bg-emerald-600 text-white font-black py-2.5 rounded-none text-[10px] uppercase tracking-widest transition cursor-pointer"
                          >
                            Bypass & Pass Interview (Demo Mode)
                          </button>
                        </div>
                      </div>
                    )}

                    <button
                      onClick={() => setActivePhase(3)}
                      className="w-full bg-slate-900 hover:bg-slate-800 text-white font-black py-3.5 rounded-none text-xs uppercase tracking-widest cursor-pointer shadow-[2px_2px_0px_0px_rgba(16,185,129,1)]"
                    >
                      Proceed to Phase 3
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4 text-left">
                    <h4 className="text-[10px] uppercase font-mono font-black text-slate-700">SELECT AN AVAILABLE TIME SLOT</h4>
                    
                    {dbSlots.length === 0 ? (
                      <div className="p-8 bg-slate-50 border-2 border-dashed border-slate-200 text-center text-xs text-slate-500 font-semibold uppercase tracking-wider">
                        ⚠️ No panel interview slots are available at this moment. Please contact support or check back soon.
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                        {dbSlots.map((slot) => {
                          const isSel = selectedSlotId === slot.id;
                          return (
                            <button
                              key={slot.id}
                              type="button"
                              onClick={() => setSelectedSlotId(slot.id)}
                              className={`p-4 border text-left transition cursor-pointer focus:outline-none rounded-none flex flex-col justify-between h-24
                                ${isSel 
                                  ? 'bg-emerald-50/10 border-emerald-500 text-emerald-950 font-bold shadow-sm' 
                                  : 'bg-white text-slate-800 hover:bg-slate-50 border-slate-200'}`}
                            >
                              <div className="flex items-center gap-1.5">
                                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                                <span className="text-[10px] font-mono font-black text-slate-600 uppercase tracking-widest">
                                  {new Date(slot.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
                                </span>
                              </div>
                              <div className="flex items-center gap-1.5 mt-2">
                                <Clock className="w-3.5 h-3.5 text-slate-400" />
                                <span className="text-sm font-mono font-black text-neutral-900">{slot.time_slot}</span>
                              </div>
                              <span className="text-[8.5px] font-mono text-slate-400 font-black tracking-widest block text-right">UTC ZONE</span>
                            </button>
                          );
                        })}
                      </div>
                    )}

                    <div className="pt-4 flex justify-end">
                      <button
                        onClick={handleBookInterview}
                        disabled={!selectedSlotId}
                        className="bg-slate-900 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-800 text-white font-black py-3.5 px-6 rounded-none text-xs uppercase tracking-widest cursor-pointer shadow-[3px_3px_0px_0px_rgba(16,185,129,1)] transition-all"
                      >
                        BOOK PANEL SESSION
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </motion.div>
            )}

            {/* ======================================================== */}
            {/* PHASE 3: PLATFORM ACCREDITATION PASS                      */}
            {/* ======================================================== */}
            {activePhase === 3 && (
              <motion.div
                key="phase3"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="space-y-6"
              >
                {!phase2InterviewPassed ? (
                  <div className="py-16 px-4 text-center space-y-6 max-w-md mx-auto flex flex-col items-center justify-center">
                    <div className="w-16 h-16 bg-slate-100 border-2 border-slate-300 flex items-center justify-center rounded-none text-slate-400 opacity-50">
                      <Lock className="w-8 h-8 stroke-[2.5]" />
                    </div>
                    <h4 className="font-display font-black text-xs uppercase tracking-widest text-slate-900">PHASE LOCKED</h4>
                    <p className="text-xs uppercase font-extrabold text-slate-500 leading-relaxed">
                      Complete your Phase 2 Panel Vetting Interview to unlock Verification Access.
                    </p>
                    <button
                      onClick={() => setActivePhase(2)}
                      className="bg-slate-900 hover:bg-slate-800 text-white font-black py-2.5 px-6 rounded-none text-[10px] uppercase tracking-wider transition cursor-pointer"
                    >
                      Return to Phase 2 Interview Board
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="border-b border-slate-100 pb-5 text-left">
                      <span className="text-[9.5px] font-mono font-black text-emerald-700 uppercase bg-emerald-50 px-2 py-0.5 border border-emerald-200">
                        PLATFORM ACCREDITATION SAFE-GUARD
                      </span>
                      <h3 className="font-display font-black text-lg text-slate-900 uppercase mt-1">
                        Phase 3: Vetting Verification Pass
                      </h3>
                      <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold mt-1">
                        Secure your verified placement status. This refundable onboarding pass filters high-intent candidates from spammers.
                      </p>
                    </div>

                {isTalentPaid ? (
                  <div className="p-8 text-center bg-emerald-50/20 border border-emerald-300 max-w-md mx-auto space-y-4">
                    <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto" />
                    <h4 className="font-black text-xs uppercase tracking-wider text-slate-900">VERIFICATION ACCREDITED</h4>
                    <p className="text-xs text-slate-600 uppercase tracking-wider leading-relaxed text-left bg-white p-4 border-2 border-emerald-200">
                      Your onboarding pass is authorized securely. Your certified project profile features the "VERIFIED PROFESSIONAL" badge permanently.
                    </p>
                    <button
                      onClick={() => setActivePhase(4)}
                      className="w-full bg-slate-900 hover:bg-slate-800 text-white font-black py-3.5 rounded-none text-xs uppercase tracking-widest cursor-pointer shadow-[2px_2px_0px_0px_rgba(16,185,129,1)]"
                    >
                      Build Project Dossier
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                    
                    {/* Left Column - cost breakdown */}
                    <div className="lg:col-span-6 bg-amber-50/40 border-2 border-amber-500/30 p-6 text-left space-y-4">
                      <span className="text-[9px] font-mono font-black text-amber-900 uppercase tracking-widest bg-amber-100 px-2.5 py-0.5 border border-amber-300 inline-block">
                        WHY THE ₦35,000 VETTING VERIFICATION PASS?
                      </span>
                      
                      <div className="space-y-4 text-xs font-semibold uppercase text-slate-700 leading-relaxed">
                        <p>
                          The ₦35,000 verification pass serves as a powerful filter, signaling high intent and serious commitment to prospective employers. By locking down a verified slot, we filter out casual spammers, ensuring our vetted talent pool remains exclusive and high-quality.
                        </p>
                        
                        <div className="bg-white border-l-4 border-emerald-500 p-4 font-mono font-bold text-[10.5px] text-slate-800 space-y-2">
                          <span className="text-[#00A86B] font-black block">🌟 100% REFUNDABLE GUARANTEE</span>
                          <p className="normal-case leading-normal font-sans font-medium text-slate-600 text-[11px] mt-1">
                            The fee is fully refundable immediately upon securing your first role through GrowthPaddy, or if you do not land an engagement within 90 days. It is entirely risk-free.
                          </p>
                        </div>
                        
                        <div className="pt-2 space-y-2">
                          <span className="text-[9.5px] font-mono font-black text-slate-900 block">YOUR PASS UNLOCKS:</span>
                          <ul className="space-y-1.5 text-[10.5px] text-slate-600 font-mono">
                            <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" /> "VERIFIED PROFESSIONAL" PROFILE BADGE</li>
                            <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" /> DIRECT ACCESS TO PREMIUM REMOTE EMPLOYER MATCHING</li>
                            <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" /> COMPLIMENTARY ADMISSION TO THE ACADEMY EXPERT RETRAINING HUB</li>
                          </ul>
                        </div>
                      </div>
                    </div>

                    {/* Right Column - payment checkout */}
                    <div className="lg:col-span-6 bg-slate-50 border border-slate-200 p-5">
                      <form onSubmit={handlePayCommitment} className="space-y-3 text-xs font-mono">
                        <span className="text-[9px] font-mono font-black text-slate-500 uppercase tracking-widest block text-left">SECURE CREDIT CARD GATEWAY</span>
                        
                        <div className="space-y-1 text-left">
                          <label className="text-[9px] text-slate-400 font-extrabold uppercase tracking-wider block">Credit Card Number</label>
                          <input
                            type="text"
                            required
                            placeholder="4242 4242 4242 4242"
                            maxLength={19}
                            value={cardDetails.cardNo}
                            onChange={(e) => setCardDetails({ ...cardDetails, cardNo: e.target.value })}
                            className="w-full bg-white border border-slate-300 py-1.5 px-3 text-slate-900 font-bold focus:outline-none"
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-3 text-left">
                          <div className="space-y-1">
                            <label className="text-[9px] text-slate-400 font-extrabold uppercase tracking-wider block">Exp Date</label>
                            <input
                              type="text"
                              required
                              placeholder="MM/YY"
                              maxLength={5}
                              value={cardDetails.exp}
                              onChange={(e) => setCardDetails({ ...cardDetails, exp: e.target.value })}
                              className="w-full bg-white border border-slate-300 py-1.5 px-3 text-slate-900 font-bold focus:outline-none"
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[9px] text-slate-400 font-extrabold uppercase tracking-wider block">CVC</label>
                            <input
                              type="password"
                              required
                              placeholder="•••"
                              maxLength={3}
                              value={cardDetails.cvc}
                              onChange={(e) => setCardDetails({ ...cardDetails, cvc: e.target.value })}
                              className="w-full bg-white border border-slate-300 py-1.5 px-3 text-slate-900 font-bold focus:outline-none"
                            />
                          </div>
                        </div>

                        <div className="space-y-1 text-left">
                          <label className="text-[9px] text-slate-400 font-extrabold uppercase tracking-wider block">Name on Card</label>
                          <input
                            type="text"
                            required
                            placeholder="e.g. John Doe"
                            value={cardDetails.name}
                            onChange={(e) => setCardDetails({ ...cardDetails, name: e.target.value })}
                            className="w-full bg-white border border-slate-300 py-1.5 px-3 text-slate-900 font-bold focus:outline-none uppercase"
                          />
                        </div>

                        <button
                          type="submit"
                          disabled={payingState}
                          className="w-full bg-[#033c2a] hover:bg-[#002b1c] text-white font-black py-3 rounded-none text-xs uppercase tracking-widest cursor-pointer shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:shadow-none transition-all duration-150"
                        >
                          {payingState ? 'Processing Security Ledger...' : 'AUTHORIZE ACCREDITATION PASS (₦35,000)'}
                        </button>
                      </form>
                    </div>
                  </div>
                )}
              </>
            )}
              </motion.div>
            )}

            {/* ======================================================== */}
            {/* PHASE 4: PORTFOLIO & EVIDENCE DOSSIER BUILDER           */}
            {/* ======================================================== */}
            {activePhase === 4 && (
              <motion.div
                key="phase4"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="space-y-6"
              >
                <div className="border-b border-slate-100 pb-5 text-left">
                  <span className="text-[9.5px] font-mono font-black text-emerald-700 uppercase bg-emerald-50 px-2 py-0.5 border border-emerald-200">
                    OBJECTIVE RECORD SERIALIZATION
                  </span>
                  <h3 className="font-display font-black text-lg text-slate-900 uppercase mt-1">
                    Phase 4: Verified Case & Portfolio Dossier
                  </h3>
                  <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold mt-1">
                    Populate actual verifiable metrics, live automation web apps, and concrete campaign numbers. Leave zero empty resume claims.
                  </p>
                </div>

                {!isTalentPaid && (
                  <div className="p-6 bg-rose-50 border border-rose-300 space-y-3 text-rose-950 text-left">
                    <span className="text-[9px] font-mono font-black uppercase tracking-widest block">⛔ ACCESS PRIVILEGE CONSTRAINED:</span>
                    <p className="text-xs font-bold uppercase tracking-wider leading-relaxed">
                      You must authorize your Onboarding Verification Pass (Phase 3) first prior to compiling your public folder parameters for employers.
                    </p>
                    <button
                      onClick={() => setActivePhase(3)}
                      className="bg-rose-900 hover:bg-rose-950 text-white font-black py-2 px-4 rounded-none text-[10px] uppercase tracking-widest cursor-pointer"
                    >
                      Go to Phase 3
                    </button>
                  </div>
                )}

                {isTalentPaid && (
                  <form onSubmit={handleSaveDossier} className="space-y-4 max-w-3xl text-left">
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      
                      <div className="space-y-1">
                        <label className="text-[9px] text-slate-400 font-extrabold uppercase tracking-wider block">CHAMPION PROJECT TITLE</label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. Programmatic SEO scale optimization"
                          value={portfolioData.title}
                          onChange={(e) => setPortfolioData({ ...portfolioData, title: e.target.value })}
                          className="w-full border border-slate-300 py-2 px-4 text-xs font-bold text-slate-900 focus:outline-none"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[9px] text-slate-400 font-extrabold uppercase tracking-wider block">KEY RESULTS METRIC (OBJECTIVE VALUE)</label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. +42% sign-up conversions, $142,000 cart recovery"
                          value={portfolioData.metrics}
                          onChange={(e) => setPortfolioData({ ...portfolioData, metrics: e.target.value })}
                          className="w-full border border-slate-300 py-2 px-4 text-xs font-bold text-slate-900 focus:outline-none"
                        />
                      </div>

                    </div>

                    <div className="space-y-1">
                      <label className="text-[9px] text-slate-400 font-extrabold uppercase tracking-wider block">LIVE PROTOTYPE OR REPOSITORY LINK</label>
                      <input
                        type="url"
                        placeholder="e.g. https://github.com/myaccount/make-flow-agent"
                        value={portfolioData.url}
                        onChange={(e) => setPortfolioData({ ...portfolioData, url: e.target.value })}
                        className="w-full border border-slate-300 py-2 px-4 text-xs font-bold text-slate-900 focus:outline-none"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[9px] text-slate-400 font-extrabold uppercase tracking-wider block">BRIEF CASE DESCRIPTION</label>
                      <textarea
                        required
                        rows={3}
                        placeholder="Detailing the automated flow systems, semantic groupings, or bidding adjustments configured..."
                        value={portfolioData.about}
                        onChange={(e) => setPortfolioData({ ...portfolioData, about: e.target.value })}
                        className="w-full border border-slate-300 py-2 px-4 text-xs font-bold text-slate-900 focus:outline-none"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[9px] text-slate-400 font-extrabold uppercase tracking-wider block">EVIDENCE PROOF (DRAG-AND-DROP OR PASTE SCREENSHOT LINK)</label>
                      <div className="border-2 border-dashed border-slate-300 hover:border-slate-400 bg-slate-50 p-6 text-center transition cursor-pointer">
                        <FileText className="w-8 h-8 text-slate-400 mx-auto" />
                        <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest mt-2">DRAG AND DROP SCREENSHOT IMAGES OR AUDIT LOGS HERE</p>
                        <p className="text-[9px] text-slate-400 mt-0.5 uppercase tracking-wide">Supports JPG, PNG, PDF formats up to 10MB</p>
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="bg-slate-900 hover:bg-slate-800 text-white font-black py-3 px-6 rounded-none text-xs uppercase tracking-widest cursor-pointer shadow-[3px_3px_0px_0px_rgba(16,185,129,1)] hover:shadow-none transition-all duration-155"
                    >
                      {dossierSubmitted ? 'SERIALIZING DOSSIER RECORD...' : 'SERIALIZE VERIFIED DOSSIER'}
                    </button>

                  </form>
                )}

              </motion.div>
            )}

          </AnimatePresence>
        </div>

        {/* Right 4-column Panel: Live Profile Customizer & Live Card Preview */}
        <div className="lg:col-span-4 space-y-6 text-left">
          
          {/* Interactive Profile Form Settings */}
          <div className="bg-white border-2 border-slate-200 p-5 rounded-none shadow-sm space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
              <Sliders className="w-4 h-4 text-[#00A86B]" />
              <h3 className="font-display font-black text-sm text-slate-900 uppercase">
                Profile Customizer Form
              </h3>
            </div>

            <form onSubmit={handleSaveProfileSettings} className="space-y-3">
              <div className="space-y-1">
                <label className="text-[9px] font-mono font-black text-slate-400 uppercase tracking-wider block">
                  FULL DISPLAY NAME
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                    <User className="w-3.5 h-3.5" />
                  </span>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Patrick Moore"
                    value={userName}
                    onChange={(e) => setUserName(e.target.value)}
                    className="w-full border border-slate-300 bg-white py-1.5 pl-9 pr-3 text-xs font-bold text-slate-900 focus:outline-none focus:border-[#00A86B]"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[9px] font-mono font-black text-slate-400 uppercase tracking-wider block">
                  SPECIALIZATION FOCUS
                </label>
                <select
                  value={specialty}
                  onChange={(e) => setSpecialty(e.target.value)}
                  className="w-full border border-slate-300 bg-white py-1.5 px-2 text-xs font-bold text-slate-900 focus:outline-none focus:border-[#00A86B]"
                >
                  <option value="SEO">SEO (Search Engine Optimization)</option>
                  <option value="AI Automation">AI & Workflow Automation</option>
                  <option value="Growth Marketing">Growth Marketing / Analytics</option>
                  <option value="PPC">PPC & Paid Acquisition</option>
                  <option value="Social Media">Social Media & UGC Brand Building</option>
                  <option value="Email Marketing">Email Marketing & Klaviyo Flows</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[9px] font-mono font-black text-slate-400 uppercase tracking-wider block">
                  EXPERIENCE TIER
                </label>
                <select
                  value={experienceTier}
                  onChange={(e) => setExperienceTier(e.target.value as any)}
                  className="w-full border border-slate-300 bg-white py-1.5 px-2 text-xs font-bold text-slate-900 focus:outline-none focus:border-[#00A86B]"
                >
                  <option value="Fresher/Newbie">Foundational Fresher</option>
                  <option value="Seasoned Professional">Expert Professional (Seasoned)</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[9px] font-mono font-black text-slate-400 uppercase tracking-wider block">
                  CAREER OBJECTIVE TARGET
                </label>
                <select
                  value={careerGoal}
                  onChange={(e) => setCareerGoal(e.target.value)}
                  className="w-full border border-slate-300 bg-white py-1.5 px-2 text-xs font-bold text-slate-900 focus:outline-none focus:border-[#00A86B]"
                >
                  <option value="Internship">Remote Internship Pathway</option>
                  <option value="Freelance Gigs">High-Growth Freelance Gigs</option>
                  <option value="Full-Time Remote Job">Full-Time Remote Position</option>
                </select>
              </div>

              {profileSyncSuccess && (
                <div className="p-2 bg-emerald-50 border border-emerald-300 text-emerald-800 text-[10px] font-mono font-bold uppercase text-center animate-fadeIn">
                  ✓ CLOUD DOSSIER CO-ORDINATED SECURELY
                </div>
              )}

              <button
                type="submit"
                disabled={syncingProfile}
                className="w-full bg-[#00A86B] hover:bg-emerald-700 text-white font-black py-2.5 rounded-none text-[10px] uppercase tracking-widest transition-all duration-150 flex items-center justify-center gap-1.5 shadow-[2px_2px_0px_0px_rgba(15,23,42,1)]"
              >
                {syncingProfile ? (
                  <span>SYNCHRONIZING SECURELY...</span>
                ) : (
                  <>
                    <Save className="w-3.5 h-3.5" />
                    <span>SAVE PROFILE TO DB</span>
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Live Portfolio Card Preview */}
          <div className="space-y-2">
            <span className="text-[9px] font-mono font-black text-slate-400 uppercase tracking-wider block pl-1">
              LIVE PORTFOLIO CARD PREVIEW (EMPLOYER VIEW)
            </span>
            
            {/* Replicated high-quality card layout */}
            <div className="border-4 border-neutral-950 rounded-none p-5 bg-white text-left shadow-[5px_5px_0px_0px_rgba(0,0,0,1)] hover:shadow-none transition-all space-y-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex gap-3">
                  <div className="w-12 h-12 bg-slate-100 flex items-center justify-center border-2 border-neutral-950 relative overflow-hidden flex-shrink-0">
                    <User className="w-6 h-6 text-slate-600 grayscale" />
                  </div>
                  <div>
                    <div className="flex flex-wrap items-center gap-1.5">
                      <h4 className="font-display font-black text-sm uppercase text-neutral-950">
                        {userName}
                      </h4>
                      <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-none text-[8px] font-mono font-black uppercase border leading-none bg-emerald-50 text-emerald-800 border-emerald-200">
                        <ShieldCheck className="w-2.5 h-2.5 flex-shrink-0 text-emerald-600" />
                        <span>{isTalentPaid ? 'VERIFIED' : 'PENDING'}</span>
                      </span>
                    </div>
                    <p className="text-[11px] text-[#00A86B] font-black uppercase mt-1">
                      {specialty} Specialist
                    </p>
                    <p className="text-[9px] uppercase font-bold mt-0.5 flex items-center gap-1 text-slate-500">
                      <MapPin className="w-3 h-3 text-slate-400" />
                      <span>Remote / Global</span>
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-[8px] font-mono font-black uppercase tracking-wide block text-slate-400">SCORE</span>
                  <p className="text-base font-black font-display flex items-center justify-end gap-0.5 mt-0.5 text-neutral-950">
                    <Award className="w-3.5 h-3.5 text-emerald-600" />
                    {quizFinished ? '95' : '0'}
                    <span className="text-[10px] font-normal text-slate-400">/100</span>
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-[10px] font-mono font-bold text-slate-500 uppercase">
                  CAREER OBJECTIVE: <span className="text-slate-900 font-black">{careerGoal}</span>
                </p>
                <p className="text-xs text-neutral-700 leading-relaxed font-semibold uppercase">
                  Verified {experienceTier === 'Seasoned Professional' ? 'expert' : 'foundational'} operations specialist, fully vetted in scenario modeling campaigns and automation networks.
                </p>
              </div>

              {/* Dynamic skills tag list based on specialty selection */}
              <div className="flex flex-wrap gap-1 pt-1 border-t-2 border-dashed border-slate-100">
                {getPreviewSkills().map((skill, idx) => (
                  <span 
                    key={idx} 
                    className="text-[9px] font-mono uppercase font-bold px-2 py-0.5 border bg-neutral-50 border-neutral-200 text-neutral-600"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
