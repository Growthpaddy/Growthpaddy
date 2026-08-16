import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ShieldCheck,
  CheckCircle2, 
  ArrowRight,
  Zap,
  Check,
  AlertTriangle,
  Award,
  Calendar,
  Clock,
  UserCheck,
  Sparkles,
  MapPin,
  Save,
  User,
  Lock,
  Loader2,
  Sliders,
  Plus,
  X,
  Globe,
  ExternalLink,
  Briefcase,
  FileCode2,
  CheckCircle,
  HelpCircle,
  Copy,
  Share2,
  Camera,
  Image,
  Link2,
  Upload
} from 'lucide-react';
import { PaymentPhase } from './PaymentPhase';
import { useSupabase } from '../context/SupabaseContext';
import { supabase } from '../lib/supabaseClient';

interface TalentDashboardProps {
  isTalentPaid?: boolean;
  setIsTalentPaid?: React.Dispatch<React.SetStateAction<boolean>>;
  navigateToPage?: (page: 'home' | 'directory' | 'employer' | 'talent' | 'assessment' | 'pricing') => void;
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

interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctIdx: number;
  explanation: string;
}

const PRESET_SKILL_TAGS = [
  'TypeScript', 'Workflow Automation', 'Cloud APIs', 'React', 'Node.js', 
  'Python', 'REST Architecture', 'Zapier', 'Make.com', 'GA4', 
  'SEO', 'PPC', 'LLM Prompts', 'Data Pipelines', 'Figma', 
  'A/B Testing', 'Growth Marketing', 'Conversion API', 'Cold Email', 'TikTok Ads'
];

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
    explanation: 'De-coupling the input trigger from synchronous heavy operations with a 202 Accepted state prevents timeout limits cleanly.'
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
  availabilityStatus = 'available',
  onStatusChange,
  onboardingData,
  onProfileUpdated
}: TalentDashboardProps) {
  
  const { user, updateProfileData, generateGeminiQuiz, gradeGeminiQuiz } = useSupabase();

  // Active editable profile state
  const [userName, setUserName] = useState(onboardingData?.userName || 'Talent Candidate');
  const [specialty, setSpecialty] = useState(onboardingData?.specialty || 'AI Automation Engineer');
  const [dbVettingStatus, setDbVettingStatus] = useState<string>(onboardingData?.vettingStatus || 'pending');
  const [experienceTier, setExperienceTier] = useState<string>(
    onboardingData?.experienceLevel || 'Senior / Lead'
  );
  const [careerGoal, setCareerGoal] = useState(onboardingData?.careerGoal || 'Full-Time Remote Position');
  const [portfolioUrl, setPortfolioUrl] = useState('');
  const [profilePictureUrl, setProfilePictureUrl] = useState(onboardingData?.profilePictureUrl || '');
  const [slug, setSlug] = useState(onboardingData?.slug || '');
  const [copiedSlugLink, setCopiedSlugLink] = useState(false);
  const [selectedSkills, setSelectedSkills] = useState<string[]>([
    'TypeScript', 'Workflow Automation', 'Cloud APIs', 'Data Pipelines', 'Make.com'
  ]);
  const [customSkillInput, setCustomSkillInput] = useState('');
  
  const [syncingProfile, setSyncingProfile] = useState(false);
  const [profileSyncSuccess, setProfileSyncSuccess] = useState(false);

  // File Upload State & Ref
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [imageUploadStatus, setImageUploadStatus] = useState<string | null>(null);
  const [imageUploadError, setImageUploadError] = useState<string | null>(null);

  const handleImageFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Strict 5 KB limit (5 * 1024 = 5,120 bytes)
    const MAX_BYTES = 5 * 1024;
    if (file.size > MAX_BYTES) {
      const fileSizeKb = (file.size / 1024).toFixed(2);
      setImageUploadError(`❌ File rejected: ${fileSizeKb} KB exceeds strict 5 KB (5,120 bytes) limit. Please select an image under 5 KB.`);
      setImageUploadStatus(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    setUploadingImage(true);
    setImageUploadStatus(null);
    setImageUploadError(null);

    const reader = new FileReader();
    reader.onload = async (event) => {
      const dataUrl = event.target?.result as string;
      if (dataUrl) {
        setProfilePictureUrl(dataUrl);

        // Instantly save to profile_picture_url column in talent_profiles table
        if (user) {
          const { error } = await supabase
            .from('talent_profiles')
            .update({
              profile_picture_url: dataUrl,
              updated_at: new Date().toISOString()
            })
            .eq('id', user.id);

          if (error) {
            console.warn('Update profile_picture_url error:', error.message);
          }
        }

        if (onProfileUpdated) {
          onProfileUpdated({ profile_picture_url: dataUrl });
        }

        const fileSizeKb = (file.size / 1024).toFixed(2);
        setImageUploadStatus(`✓ Photo uploaded & saved! (${fileSizeKb} KB)`);
        setTimeout(() => setImageUploadStatus(null), 4000);
      }
      setUploadingImage(false);
    };

    reader.onerror = () => {
      setImageUploadError('Failed to read image file.');
      setUploadingImage(false);
    };

    reader.readAsDataURL(file);
  };

  const PRESET_AVATARS = [
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=300',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=300',
    'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=300',
    'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=300'
  ];

  const handleCopyPublicLink = () => {
    const currentSlug = slug || userName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
    const shareUrl = `${window.location.origin}/${currentSlug}`;
    navigator.clipboard.writeText(shareUrl);
    setCopiedSlugLink(true);
    setTimeout(() => setCopiedSlugLink(false), 2500);
  };

  // 3-Phase Navigation state
  const [activePhase, setActivePhase] = useState<1 | 2 | 3>(1);

  // Vetting Completed Flags
  const [quizScore, setQuizScore] = useState<number | null>(null);
  const [quizFinished, setQuizFinished] = useState(false);
  const [interviewBooked, setInterviewBooked] = useState(false);
  const [bookedSlot, setBookedSlot] = useState<{date: string, time: string} | null>(null);
  const [phase2InterviewPassed, setPhase2InterviewPassed] = useState(false);
  const [showFirstFailModal, setShowFirstFailModal] = useState(false);
  const [dynamicQuestions, setDynamicQuestions] = useState<any[] | null>(null);
  const [loadingQuiz, setLoadingQuiz] = useState(false);
  const [quizFeedback, setQuizFeedback] = useState<string>('');

  // Phase 1 Retries & lockout
  const [quizAttempts, setQuizAttempts] = useState(0);
  const [quizLockedUntil, setQuizLockedUntil] = useState<string | null>(null);
  const [countdownString, setCountdownString] = useState('');
  const [dbSlots, setDbSlots] = useState<any[]>([]);
  const [selectedSlotId, setSelectedSlotId] = useState<string>('');

  // Fetch available slots
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
        const defaultSlots = [
          { id: 'slot-1', date: '2026-08-15', time_slot: '11:30 AM', is_booked: false },
          { id: 'slot-2', date: '2026-08-16', time_slot: '02:00 PM', is_booked: false },
          { id: 'slot-3', date: '2026-08-17', time_slot: '09:00 AM', is_booked: false }
        ];
        setDbSlots(defaultSlots);
      }
    } catch (err) {
      console.warn('Available slots query exception:', err);
    }
  };

  useEffect(() => {
    loadAvailableSlots();
  }, []);

  // Countdown timer loop for lockout
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

  // Sync profile data from Supabase DB on mount
  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!user) return;
      try {
        const { data } = await supabase
          .from('talent_profiles')
          .select('*')
          .eq('id', user.id)
          .maybeSingle();

        if (data) {
          if (data.vetting_status) setDbVettingStatus(data.vetting_status);
          if (data.full_name) setUserName(data.full_name);
          if (data.specialty) setSpecialty(data.specialty);
          if (data.experience_level) setExperienceTier(data.experience_level);
          if (data.skills && Array.isArray(data.skills) && data.skills.length > 0) {
            setSelectedSkills(data.skills);
          }
          if (data.portfolio_url) setPortfolioUrl(data.portfolio_url);
          if (data.career_goal) setCareerGoal(data.career_goal);
          if (data.profile_picture_url) setProfilePictureUrl(data.profile_picture_url);
          if (data.slug) {
            setSlug(data.slug);
          } else if (data.full_name) {
            setSlug(data.full_name.toLowerCase().replace(/[^a-z0-9]+/g, '-'));
          }
          if (data.quiz_attempts_count !== undefined) setQuizAttempts(data.quiz_attempts_count);
          if (data.quiz_locked_until) setQuizLockedUntil(data.quiz_locked_until);
          
          if (data.phase_1_quiz_passed) {
            setQuizFinished(true);
            setQuizScore(100);
          }

          if (data.phase_2_interview_scheduled || data.vetting_status === 'interview_scheduled') {
            setInterviewBooked(true);
            if (data.booked_slot_date && data.booked_slot_time_slot) {
              setBookedSlot({ date: data.booked_slot_date, time: data.booked_slot_time_slot });
            }
          }

          if (data.phase_2_interview_passed) {
            setPhase2InterviewPassed(true);
          }

          if (data.phase_3_fee_paid || data.vetting_status === 'fee_paid' || data.vetting_status === 'completed' || data.vetting_status === 'approved') {
            setQuizFinished(true);
            setQuizScore(100);
            setInterviewBooked(true);
            setPhase2InterviewPassed(true);
            if (setIsTalentPaid) setIsTalentPaid(true);
          }
        }
      } catch (err) {
        console.warn('Could not load user profile parameters:', err);
      }
    };
    fetchUserProfile();
  }, [user]);

  // Handle Save Profile
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSyncingProfile(true);
    setProfileSyncSuccess(false);

    try {
      const computedSlug = slug.trim() 
        ? slug.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')
        : userName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');

      const payload: any = {
        full_name: userName,
        specialty: specialty,
        experience_level: experienceTier,
        skills: selectedSkills,
        portfolio_url: portfolioUrl,
        career_goal: careerGoal,
        profile_picture_url: profilePictureUrl,
        slug: computedSlug || 'talent',
        updated_at: new Date().toISOString()
      };

      if (user) {
        const { error, data } = await supabase
          .from('talent_profiles')
          .update(payload)
          .eq('id', user.id)
          .select('slug, profile_picture_url')
          .maybeSingle();

        if (error) {
          console.warn('Client update warning, using fallback context update:', error);
          await updateProfileData(payload);
        } else if (data?.slug) {
          setSlug(data.slug);
        }
      } else {
        await updateProfileData(payload);
        setSlug(computedSlug);
      }

      setProfileSyncSuccess(true);
      if (onProfileUpdated) {
        onProfileUpdated({
          profile_picture_url: profilePictureUrl,
          full_name: userName,
          specialty: specialty,
          slug: computedSlug
        });
      }
      setTimeout(() => setProfileSyncSuccess(false), 3500);
    } catch (err) {
      console.error('Save profile exception:', err);
    } finally {
      setSyncingProfile(false);
    }
  };

  // Skill Tag toggle handler
  const toggleSkillTag = (skill: string) => {
    if (selectedSkills.includes(skill)) {
      setSelectedSkills(selectedSkills.filter(s => s !== skill));
    } else {
      setSelectedSkills([...selectedSkills, skill]);
    }
  };

  const handleAddCustomSkill = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customSkillInput.trim()) return;
    const tag = customSkillInput.trim();
    if (!selectedSkills.includes(tag)) {
      setSelectedSkills([...selectedSkills, tag]);
    }
    setCustomSkillInput('');
  };

  // Phase 1 Quiz Execution
  const activeQuestions = dynamicQuestions && dynamicQuestions.length > 0 
    ? dynamicQuestions 
    : (experienceTier === 'Senior / Lead' || experienceTier === 'Seasoned Professional' ? PROFESSIONAL_QUESTIONS : FRESHER_QUESTIONS);
  
  const [currentQIdx, setCurrentQIdx] = useState(0);
  const [quizAnswers, setQuizAnswers] = useState<Record<number, number>>({});
  const [showQExplanation, setShowQExplanation] = useState(false);
  const [quizTimer, setQuizTimer] = useState(60);
  const [quizActive, setQuizActive] = useState(false);

  // Timer loop
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

  const handleStartQuiz = async () => {
    setLoadingQuiz(true);
    setQuizFinished(false);
    try {
      const { questions, error } = await generateGeminiQuiz(specialty, experienceTier);
      if (!error && questions && questions.length > 0) {
        setDynamicQuestions(questions);
      }
    } catch (err) {
      console.warn("Quiz generation fallback used:", err);
    } finally {
      setLoadingQuiz(false);
      setQuizActive(true);
      setQuizTimer(60);
      setCurrentQIdx(0);
      setQuizAnswers({});
      setShowQExplanation(false);
    }
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
    setLoadingQuiz(true);
    
    try {
      const result = await gradeGeminiQuiz(
        specialty,
        experienceTier,
        activeQuestions,
        quizAnswers,
        user?.id,
        userName
      );

      setLoadingQuiz(false);
      setQuizFinished(true);

      if (result && !result.error) {
        const finalScore = result.score;
        const finalPassed = result.passed;
        setQuizScore(finalScore);
        setQuizFeedback(result.feedback);

        const nextAttempts = quizAttempts + 1;
        setQuizAttempts(nextAttempts);

        if (finalPassed) {
          await updateProfileData({
            phase_1_quiz_passed: true,
            quiz_attempts_count: nextAttempts,
            vetting_status: 'passed_quiz'
          });
        } else {
          if (nextAttempts >= 2) {
            const lockedUntil = new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString();
            setQuizLockedUntil(lockedUntil);
            await updateProfileData({
              phase_1_quiz_passed: false,
              quiz_attempts_count: nextAttempts,
              quiz_locked_until: lockedUntil,
              vetting_status: 'quiz_locked'
            });
          } else {
            setShowFirstFailModal(true);
            await updateProfileData({
              quiz_attempts_count: nextAttempts,
              vetting_status: 'failed_first_attempt'
            });
          }
        }
      } else {
        let correct = 0;
        activeQuestions.forEach((q, idx) => {
          if (quizAnswers[idx] === q.correctIdx) correct++;
        });
        const finalScore = Math.round((correct / activeQuestions.length) * 100);
        setQuizScore(finalScore);
        setQuizFeedback(finalScore >= 75 ? "Score threshold cleared!" : "Scored below 75%. Retry diagnostic.");
        const nextAttempts = quizAttempts + 1;
        setQuizAttempts(nextAttempts);

        if (finalScore >= 75) {
          await updateProfileData({
            phase_1_quiz_passed: true,
            quiz_attempts_count: nextAttempts,
            vetting_status: 'passed_quiz'
          });
        } else {
          if (nextAttempts >= 2) {
            const lockedUntil = new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString();
            setQuizLockedUntil(lockedUntil);
            await updateProfileData({
              phase_1_quiz_passed: false,
              quiz_attempts_count: nextAttempts,
              quiz_locked_until: lockedUntil,
              vetting_status: 'quiz_locked'
            });
          } else {
            setShowFirstFailModal(true);
            await updateProfileData({
              quiz_attempts_count: nextAttempts,
              vetting_status: 'failed_first_attempt'
            });
          }
        }
      }
    } catch (err) {
      console.error("Grading exception:", err);
      setLoadingQuiz(false);
    }
  };

  // Phase 2: Booking slots
  const handleBookInterview = async () => {
    if (!selectedSlotId) return;
    const slot = dbSlots.find(s => s.id === selectedSlotId);
    if (!slot) return;

    try {
      await supabase
        .from('admin_available_slots')
        .update({ 
          is_booked: true,
          booked_by_name: userName,
          booked_by_email: user?.email || 'unspecified'
        })
        .eq('id', slot.id);
    } catch (err) {
      console.warn('Booking slot update warning:', err);
    }

    setBookedSlot({ date: slot.date, time: slot.time_slot });
    setInterviewBooked(true);

    if (user) {
      await updateProfileData({
        phase_2_interview_scheduled: true,
        booked_slot_id: slot.id,
        booked_slot_date: slot.date,
        booked_slot_time_slot: slot.time_slot,
        vetting_status: 'interview_scheduled'
      });
    }
    loadAvailableSlots();
  };

  // Phase 3 Payment Complete
  const handlePayCommitment = async () => {
    if (setIsTalentPaid) setIsTalentPaid(true);
    if (user) {
      await updateProfileData({
        phase_3_fee_paid: true,
        vetting_status: 'approved'
      });

      // Update Supabase directly
      await supabase
        .from('talent_profiles')
        .update({
          phase_3_fee_paid: true,
          vetting_status: 'approved'
        })
        .eq('id', user.id);
    }
  };

  const isVerifiedByAdmin = dbVettingStatus === 'approved' || dbVettingStatus === 'verified' || onboardingData?.vettingStatus === 'approved' || onboardingData?.vettingStatus === 'verified';
  const isFullyVetted = isVerifiedByAdmin;
  const isPhase1Passed = quizFinished && quizScore !== null && quizScore >= 75;

  return (
    <div id="talent-vetting-workspace" className="space-y-8 py-4 px-4 sm:px-6 lg:px-8 text-left">
      
      {/* TWO-COLUMN HYBRID DASHBOARD GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* ================================================================ */}
        {/* SECTION 1: MY PUBLIC PROFILE & PORTFOLIO BUILDER (Left Column)   */}
        {/* ================================================================ */}
        <div className="lg:col-span-6 space-y-6">
          
          <div className="bg-white dark:bg-slate-900 border-2 border-neutral-900 dark:border-slate-800 p-6 sm:p-7 rounded-none shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] space-y-6">
            
            {/* Section Header */}
            <div className="border-b-2 border-neutral-900 dark:border-slate-800 pb-4">
              <div className="flex items-center justify-between gap-2">
                <span className="text-[10px] font-mono font-black uppercase tracking-wider text-emerald-700 bg-emerald-50 dark:bg-emerald-950/80 px-2.5 py-0.5 border border-emerald-300">
                  SECTION 1
                </span>
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500">
                  RECRUITER DISCOVERY FORM
                </span>
              </div>
              <h2 className="font-display font-black text-xl text-slate-900 dark:text-white uppercase tracking-tight mt-2">
                My Public Profile & Portfolio Builder
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium uppercase leading-snug mt-1">
                Fill out your details to immediately appear in recruiter searches. (Tagged as <span className="font-bold text-amber-600 dark:text-amber-400">"UNVERIFIED SKILLS"</span> until verified by an Admin).
              </p>
            </div>

            {/* Availability Status Card & Switcher */}
            <div className="bg-white dark:bg-slate-900 border-2 border-neutral-900 dark:border-slate-800 p-4 space-y-3 shadow-[3px_3px_0px_0px_rgba(0,168,107,1)]">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-neutral-200 dark:border-slate-800 pb-2">
                <span className="text-[9px] font-mono font-black text-emerald-700 dark:text-emerald-400 uppercase tracking-widest flex items-center gap-1.5">
                  <Briefcase className="w-3.5 h-3.5 text-[#00A86B]" />
                  RECRUITER VISIBILITY & HIRING STATUS
                </span>
                <div>
                  {availabilityStatus === 'available' ? (
                    <span className="inline-flex items-center gap-1.5 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 px-2.5 py-0.5 rounded-full font-mono font-bold text-[10px] uppercase tracking-wide">
                      <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                      </span>
                      AVAILABLE FOR HIRE
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 bg-slate-800 text-slate-300 border border-slate-700 px-2.5 py-0.5 rounded-full font-mono font-bold text-[10px] uppercase tracking-wide">
                      <Lock className="w-3 h-3 text-slate-400" />
                      CURRENTLY HIRED
                    </span>
                  )}
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-1">
                <p className="text-xs text-slate-600 dark:text-slate-400">
                  Switch your availability status to notify recruiters when you are actively interviewing or currently under contract.
                </p>

                {onStatusChange && (
                  <div className="flex items-center gap-2 w-full sm:w-auto shrink-0">
                    <button
                      type="button"
                      onClick={() => onStatusChange('available')}
                      className={`flex-1 sm:flex-none px-3 py-1.5 rounded-lg font-mono text-[10px] font-black uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 cursor-pointer border ${
                        availabilityStatus === 'available'
                          ? 'bg-emerald-500 text-white border-emerald-600 shadow-xs'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700 hover:border-emerald-500'
                      }`}
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-300"></span>
                      <span>Available</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => onStatusChange('hired')}
                      className={`flex-1 sm:flex-none px-3 py-1.5 rounded-lg font-mono text-[10px] font-black uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 cursor-pointer border ${
                        availabilityStatus === 'hired'
                          ? 'bg-slate-700 text-white border-slate-600 shadow-xs'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700 hover:border-slate-500'
                      }`}
                    >
                      <Lock className="w-3 h-3 text-slate-400" />
                      <span>Hired</span>
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Public Portfolio & Unique Shareable Link Card */}
            <div className="bg-neutral-950 text-white p-4 border-2 border-neutral-900 shadow-[3px_3px_0px_0px_rgba(0,168,107,1)] space-y-3">
              <div className="flex items-center justify-between gap-2 border-b border-neutral-800 pb-2">
                <span className="text-[9px] font-mono font-black text-emerald-400 uppercase tracking-widest flex items-center gap-1.5">
                  <Share2 className="w-3.5 h-3.5 text-[#00A86B]" />
                  YOUR UNIQUE PUBLIC PORTFOLIO LINK
                </span>
                <span className="text-[9px] font-mono text-neutral-400 uppercase">
                  LIVE PORTFOLIO ENABLED
                </span>
              </div>

              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="space-y-0.5">
                  <p className="text-xs font-mono font-bold text-white break-all">
                    {window.location.origin}/#/p/{slug || userName.toLowerCase().replace(/[^a-z0-9]+/g, '-')}
                  </p>
                  <p className="text-[9.5px] font-mono text-neutral-400">
                    Share this unique slug link with recruiters & hiring managers.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleCopyPublicLink}
                  className="bg-[#00A86B] hover:bg-emerald-600 text-white font-mono font-black px-3.5 py-2 text-[10px] uppercase tracking-wider border border-white flex items-center gap-1.5 cursor-pointer shrink-0"
                >
                  {copiedSlugLink ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-white" />
                      <span>COPIED LINK!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>COPY LINK</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Profile Form */}
            <form onSubmit={handleSaveProfile} className="space-y-5 text-left">
              
              {/* Profile Picture / Avatar Settings with File Input & URL Upload */}
              <div className="space-y-3 p-4 bg-neutral-50 dark:bg-slate-800/60 border-2 border-neutral-200 dark:border-slate-700">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-neutral-200 dark:border-slate-700/80 pb-2">
                  <label className="text-[10px] font-mono font-black text-slate-700 dark:text-slate-300 uppercase block tracking-wider flex items-center gap-1.5">
                    <Camera className="w-3.5 h-3.5 text-[#00A86B]" />
                    Profile Picture & Avatar Photo
                  </label>
                  
                  <span className="inline-flex items-center gap-1 bg-amber-100 dark:bg-amber-950/60 text-amber-900 dark:text-amber-300 border border-amber-400 text-[9px] font-mono font-black px-2 py-0.5 uppercase tracking-wider">
                    ⚡ STRICT SIZE LIMIT: MAX 5 KB (5,120 BYTES)
                  </span>
                </div>

                {/* Status or Error Notice */}
                {imageUploadError && (
                  <div className="p-2.5 bg-rose-50 dark:bg-rose-950/60 border-2 border-rose-600 text-rose-700 dark:text-rose-300 font-mono text-xs font-bold flex items-center justify-between">
                    <span>{imageUploadError}</span>
                    <button 
                      type="button" 
                      onClick={() => setImageUploadError(null)} 
                      className="text-xs font-black uppercase text-rose-800 dark:text-rose-200 hover:underline cursor-pointer ml-2"
                    >
                      DISMISS
                    </button>
                  </div>
                )}

                {imageUploadStatus && (
                  <div className="p-2.5 bg-emerald-50 dark:bg-emerald-950/60 border-2 border-[#00A86B] text-[#00A86B] dark:text-emerald-400 font-mono text-xs font-bold">
                    {imageUploadStatus}
                  </div>
                )}
                
                {/* Hidden Native File Input */}
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  accept="image/*" 
                  onChange={handleImageFileUpload} 
                  className="hidden" 
                />

                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                  {/* Avatar Container - Click to upload */}
                  <div 
                    onClick={() => fileInputRef.current?.click()}
                    className="relative group w-16 h-16 border-2 border-neutral-900 dark:border-slate-600 bg-neutral-900 text-white flex items-center justify-center font-display font-black text-xl overflow-hidden shrink-0 cursor-pointer shadow-[2px_2px_0px_0px_rgba(0,168,107,1)]"
                    title="Click to upload profile picture file (Max 5 KB)"
                  >
                    {profilePictureUrl ? (
                      <img src={profilePictureUrl} alt="Avatar Preview" className="w-full h-full object-cover" />
                    ) : (
                      <span>{userName ? userName.charAt(0).toUpperCase() : 'T'}</span>
                    )}
                    <div className="absolute inset-0 bg-neutral-950/75 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-[9px] font-mono font-bold text-emerald-400">
                      <Camera className="w-4 h-4 text-emerald-400 mb-0.5" />
                      <span>UPLOAD (&lt;5KB)</span>
                    </div>
                  </div>

                  <div className="flex-1 space-y-2 w-full">
                    <div className="flex items-center gap-2 flex-wrap">
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={uploadingImage}
                        className="bg-neutral-950 hover:bg-neutral-800 text-white font-mono font-black text-xs px-3.5 py-2 uppercase tracking-wider border-2 border-neutral-950 flex items-center gap-2 cursor-pointer transition-all shadow-[2px_2px_0px_0px_rgba(0,168,107,1)] hover:shadow-none disabled:opacity-50"
                      >
                        {uploadingImage ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin text-emerald-400" />
                            <span>UPLOADING IMAGE FILE...</span>
                          </>
                        ) : (
                          <>
                            <Upload className="w-4 h-4 text-emerald-400" />
                            <span>CHOOSE FILE (&le; 5 KB)</span>
                          </>
                        )}
                      </button>

                      <span className="text-[10px] font-mono text-slate-500 uppercase font-bold">OR PASTE URL:</span>
                    </div>

                    <input
                      type="url"
                      placeholder="Paste image URL (e.g. Unsplash, LinkedIn photo URL)"
                      value={profilePictureUrl}
                      onChange={(e) => {
                        const newUrl = e.target.value;
                        setProfilePictureUrl(newUrl);
                        if (onProfileUpdated) {
                          onProfileUpdated({ profile_picture_url: newUrl });
                        }
                      }}
                      className="w-full border-2 border-neutral-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-1.5 text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:border-[#00A86B]"
                    />
                  </div>
                </div>

                {/* Preset Avatars Selection */}
                <div className="pt-2 border-t border-neutral-200 dark:border-slate-700/60 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[9px] font-mono text-slate-500 uppercase font-bold">
                      PRESET AVATARS:
                    </span>
                    {PRESET_AVATARS.map((url, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={async () => {
                          setProfilePictureUrl(url);
                          if (user) {
                            await supabase
                              .from('talent_profiles')
                              .update({ profile_picture_url: url, updated_at: new Date().toISOString() })
                              .eq('id', user.id);
                          }
                          if (onProfileUpdated) {
                            onProfileUpdated({ profile_picture_url: url });
                          }
                          setImageUploadStatus('✓ Preset avatar applied!');
                          setTimeout(() => setImageUploadStatus(null), 3000);
                        }}
                        className={`w-7 h-7 border-2 overflow-hidden cursor-pointer transition-transform hover:scale-110 ${
                          profilePictureUrl === url ? 'border-[#00A86B] ring-2 ring-[#00A86B]' : 'border-neutral-300 dark:border-slate-700'
                        }`}
                      >
                        <img src={url} alt={`Preset ${idx}`} className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>

                  {profilePictureUrl && (
                    <button
                      type="button"
                      onClick={async () => {
                        setProfilePictureUrl('');
                        if (user) {
                          await supabase
                            .from('talent_profiles')
                            .update({ profile_picture_url: '', updated_at: new Date().toISOString() })
                            .eq('id', user.id);
                        }
                        if (onProfileUpdated) {
                          onProfileUpdated({ profile_picture_url: '' });
                        }
                      }}
                      className="text-[9px] font-mono text-rose-600 hover:text-rose-700 underline font-black uppercase cursor-pointer"
                    >
                      Remove Photo
                    </button>
                  )}
                </div>
              </div>

              {/* Full Display Name */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-mono font-black text-slate-700 dark:text-slate-300 uppercase block tracking-wider">
                  Full Display Name <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400">
                    <User className="w-4 h-4" />
                  </span>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Marcus Vance"
                    value={userName}
                    onChange={(e) => setUserName(e.target.value)}
                    className="w-full border-2 border-neutral-300 dark:border-slate-700 bg-neutral-50 dark:bg-slate-800 pl-10 pr-4 py-2.5 text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:border-[#00A86B]"
                  />
                </div>
              </div>

              {/* Unique Profile Slug / Handle */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-mono font-black text-slate-700 dark:text-slate-300 uppercase block tracking-wider flex items-center gap-1">
                  <Link2 className="w-3.5 h-3.5 text-[#00A86B]" />
                  Custom Profile Handle (Slug)
                </label>
                <div className="flex items-center">
                  <span className="bg-neutral-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 font-mono text-xs px-3 py-2.5 border-2 border-r-0 border-neutral-300 dark:border-slate-700 font-bold shrink-0">
                    digitalcampux.com/p/
                  </span>
                  <input
                    type="text"
                    placeholder="marcus-vance"
                    value={slug}
                    onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                    className="w-full border-2 border-neutral-300 dark:border-slate-700 bg-neutral-50 dark:bg-slate-800 px-3 py-2.5 text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:border-[#00A86B]"
                  />
                </div>
                <p className="text-[9.5px] font-mono text-slate-500 dark:text-slate-400">
                  ⚡ Auto-managed on save. Ensures unique profile link across all talent.
                </p>
              </div>

              {/* Specialty & Title */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-mono font-black text-slate-700 dark:text-slate-300 uppercase block tracking-wider">
                  Specialty & Role Focus <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400">
                    <Briefcase className="w-4 h-4" />
                  </span>
                  <select
                    value={specialty}
                    onChange={(e) => setSpecialty(e.target.value)}
                    className="w-full border-2 border-neutral-300 dark:border-slate-700 bg-neutral-50 dark:bg-slate-800 pl-10 pr-4 py-2.5 text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:border-[#00A86B]"
                  >
                    <option value="AI Automation Engineer">AI Automation Engineer</option>
                    <option value="Full-Stack Developer">Full-Stack Developer</option>
                    <option value="Digital & Growth Marketer">Digital & Growth Marketer</option>
                    <option value="UI/UX Designer">UI/UX Designer</option>
                    <option value="Data Analyst">Data Analyst</option>
                    <option value="Technical SEO Specialist">Technical SEO Specialist</option>
                    <option value="PPC & Paid Media Manager">PPC & Paid Media Manager</option>
                    <option value="Email & Lifecycle Specialist">Email & Lifecycle Specialist</option>
                  </select>
                </div>
              </div>

              {/* Experience Level Dropdown */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-mono font-black text-slate-700 dark:text-slate-300 uppercase block tracking-wider">
                  Experience Level <span className="text-red-500">*</span>
                </label>
                <select
                  value={experienceTier}
                  onChange={(e) => setExperienceTier(e.target.value)}
                  className="w-full border-2 border-neutral-300 dark:border-slate-700 bg-neutral-50 dark:bg-slate-800 px-4 py-2.5 text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:border-[#00A86B]"
                >
                  <option value="Junior">Junior Talent (1-2 yrs)</option>
                  <option value="Mid-Level">Mid-Level Specialist (2-4 yrs)</option>
                  <option value="Senior / Lead">Senior / Lead Talent (5+ yrs)</option>
                </select>
              </div>

              {/* Skill Tags Multi-Select Selector */}
              <div className="space-y-2">
                <label className="text-[10px] font-mono font-black text-slate-700 dark:text-slate-300 uppercase block tracking-wider">
                  Skill Categories & Tech Stack Pills (Click to toggle)
                </label>
                
                {/* Selected Active Skill Tags */}
                <div className="flex flex-wrap gap-1.5 p-3 bg-neutral-100 dark:bg-slate-800/60 border border-neutral-300 dark:border-slate-700 min-h-[44px]">
                  {selectedSkills.length === 0 ? (
                    <span className="text-[10px] font-mono text-slate-400 uppercase italic">
                      No skill tags selected yet. Click pills below to select.
                    </span>
                  ) : (
                    selectedSkills.map((skill) => (
                      <span 
                        key={skill}
                        onClick={() => toggleSkillTag(skill)}
                        className="inline-flex items-center gap-1 text-[10px] font-mono font-black uppercase px-2.5 py-1 bg-[#00A86B] text-white cursor-pointer border border-neutral-900 hover:bg-rose-600 transition-colors group"
                      >
                        <span>{skill}</span>
                        <X className="w-3 h-3 text-white group-hover:scale-125" />
                      </span>
                    ))
                  )}
                </div>

                {/* Preset Skill Selector Pills */}
                <div className="flex flex-wrap gap-1 pt-1">
                  {PRESET_SKILL_TAGS.map((skill) => {
                    const isSelected = selectedSkills.includes(skill);
                    return (
                      <button
                        key={skill}
                        type="button"
                        onClick={() => toggleSkillTag(skill)}
                        className={`text-[9.5px] font-mono font-black uppercase px-2.5 py-1 border cursor-pointer transition-colors ${
                          isSelected 
                            ? 'bg-[#00A86B] text-white border-neutral-900' 
                            : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-neutral-300 dark:border-slate-700 hover:border-neutral-900'
                        }`}
                      >
                        {isSelected ? `✓ ${skill}` : `+ ${skill}`}
                      </button>
                    );
                  })}
                </div>

                {/* Custom Skill Input */}
                <div className="flex gap-2 pt-1">
                  <input
                    type="text"
                    placeholder="Add custom skill (e.g. Docker, Make.com)"
                    value={customSkillInput}
                    onChange={(e) => setCustomSkillInput(e.target.value)}
                    className="flex-1 border-2 border-neutral-300 dark:border-slate-700 bg-neutral-50 dark:bg-slate-800 px-3 py-1.5 text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:border-[#00A86B]"
                  />
                  <button
                    type="button"
                    onClick={handleAddCustomSkill}
                    className="bg-neutral-900 dark:bg-slate-700 hover:bg-neutral-800 text-white font-mono font-black px-3 py-1.5 text-xs uppercase cursor-pointer flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add</span>
                  </button>
                </div>
              </div>

              {/* Portfolio & Proof Links */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-mono font-black text-slate-700 dark:text-slate-300 uppercase block tracking-wider">
                  Portfolio & Proof URL (GitHub, Website, Behance)
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400">
                    <Globe className="w-4 h-4" />
                  </span>
                  <input
                    type="url"
                    placeholder="https://github.com/myusername or https://myportfolio.com"
                    value={portfolioUrl}
                    onChange={(e) => setPortfolioUrl(e.target.value)}
                    className="w-full border-2 border-neutral-300 dark:border-slate-700 bg-neutral-50 dark:bg-slate-800 pl-10 pr-4 py-2.5 text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:border-[#00A86B]"
                  />
                </div>
              </div>

              {/* Career Goal & Bio */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-mono font-black text-slate-700 dark:text-slate-300 uppercase block tracking-wider">
                  Career Target & Bio Summary
                </label>
                <textarea
                  rows={3}
                  placeholder="e.g. Full-Time Remote Position building automated workflow pipelines and growth infrastructure."
                  value={careerGoal}
                  onChange={(e) => setCareerGoal(e.target.value)}
                  className="w-full border-2 border-neutral-300 dark:border-slate-700 bg-neutral-50 dark:bg-slate-800 p-3 text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:border-[#00A86B]"
                />
              </div>

              {/* Sync Feedback Message */}
              {profileSyncSuccess && (
                <div className="p-3 bg-emerald-50 dark:bg-emerald-950/80 border-2 border-emerald-500 text-emerald-900 dark:text-emerald-200 text-xs font-mono font-bold uppercase text-center animate-fadeIn flex items-center justify-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#00A86B]" />
                  <span>✓ PUBLIC PROFILE SAVED & UPDATED</span>
                </div>
              )}

              {/* Submit Save Button */}
              <button
                type="submit"
                disabled={syncingProfile}
                className="w-full bg-[#00A86B] hover:bg-emerald-600 text-white font-black py-3.5 px-6 rounded-none text-xs uppercase tracking-widest border-2 border-neutral-950 cursor-pointer shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all flex items-center justify-center gap-2"
              >
                {syncingProfile ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-white" />
                    <span>SAVING PROFILE...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    <span>SAVE PROFILE CHANGES</span>
                  </>
                )}
              </button>

            </form>

          </div>

          {/* Live Recruiter Card Preview */}
          <div className="space-y-2 text-left">
            <span className="text-[10px] font-mono font-black text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
              LIVE RECRUITER CARD PREVIEW (HOW EMPLOYERS SEE YOU)
            </span>
            
            <div className="border-4 border-neutral-950 dark:border-slate-700 rounded-none p-5 bg-white dark:bg-slate-900 text-left shadow-[5px_5px_0px_0px_rgba(0,0,0,1)] space-y-4">
              
              <div className="flex items-start justify-between gap-3">
                <div className="flex gap-3">
                  <div className="w-12 h-12 bg-slate-100 dark:bg-slate-800 flex items-center justify-center border-2 border-neutral-950 dark:border-slate-700 relative overflow-hidden shrink-0">
                    <User className="w-6 h-6 text-slate-600 dark:text-slate-300" />
                  </div>
                  <div>
                    <h4 className="font-display font-black text-sm uppercase text-slate-900 dark:text-white">
                      {userName || 'Candidate Name'}
                    </h4>
                    <p className="text-[11px] text-[#00A86B] font-black uppercase mt-0.5">
                      {specialty}
                    </p>
                    <p className="text-[9px] uppercase font-bold text-slate-500 dark:text-slate-400 flex items-center gap-1 mt-0.5">
                      <MapPin className="w-3 h-3" />
                      <span>Remote Talent • {experienceTier}</span>
                    </p>
                  </div>
                </div>

                {/* Candidate Badge Tag & Availability */}
                <div className="text-right shrink-0 flex flex-col items-end gap-1">
                  {isVerifiedByAdmin ? (
                    <span className="inline-flex items-center gap-1 bg-emerald-500 text-white text-[9px] font-mono font-black px-2 py-0.5 border border-neutral-950 uppercase">
                      🏆 VERIFIED SKILLS
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 text-[8.5px] font-mono font-bold px-2 py-0.5 border border-amber-300 dark:border-amber-700 uppercase">
                      UNVERIFIED SKILLS
                    </span>
                  )}

                  {availabilityStatus === 'available' || !availabilityStatus ? (
                    <span className="inline-flex items-center gap-1 text-[8.5px] font-mono font-black px-2 py-0.5 bg-emerald-50 text-emerald-800 border border-emerald-300 uppercase">
                      <span className="relative flex h-1.5 w-1.5">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
                      </span>
                      AVAILABLE FOR HIRE
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-[8.5px] font-mono font-black px-2 py-0.5 bg-slate-800 text-slate-300 border border-slate-700 uppercase">
                      <Lock className="w-2.5 h-2.5 text-slate-400" />
                      CURRENTLY HIRED
                    </span>
                  )}
                </div>
              </div>

              {/* Bio summary */}
              <p className="text-xs text-slate-700 dark:text-slate-300 font-medium leading-relaxed">
                "{careerGoal || 'Specializing in automation and full-stack execution.'}"
              </p>

              {/* Portfolio Link indicator */}
              {portfolioUrl && (
                <a
                  href={portfolioUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-[10px] font-mono font-bold text-[#00A86B] hover:underline uppercase"
                >
                  <ExternalLink className="w-3 h-3" />
                  <span>View Verified Portfolio / Code Repository</span>
                </a>
              )}

              {/* Skill Tags */}
              <div className="flex flex-wrap gap-1 pt-2 border-t border-dashed border-slate-200 dark:border-slate-800">
                {selectedSkills.map((skill, idx) => (
                  <span
                    key={idx}
                    className="text-[9px] font-mono uppercase font-bold px-2 py-0.5 border bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300"
                  >
                    {skill}
                  </span>
                ))}
              </div>

            </div>
          </div>

        </div>

        {/* ================================================================ */}
        {/* SECTION 2: THE VETTING PIPELINE (Right Column)                    */}
        {/* ================================================================ */}
        <div className="lg:col-span-6 space-y-6">
          
          {/* BADGE STATUS BANNER */}
          {isVerifiedByAdmin ? (
            <div className="bg-gradient-to-r from-emerald-500/10 via-emerald-500/20 to-emerald-500/10 border-4 border-emerald-500 p-6 rounded-none shadow-[6px_6px_0px_0px_rgba(0,168,107,1)] space-y-3 text-left">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Award className="w-7 h-7 text-emerald-500 fill-emerald-100 shrink-0" />
                  <div>
                    <span className="text-[9px] font-mono font-black uppercase text-emerald-700 dark:text-emerald-300 tracking-widest block">
                      ADMIN VERIFICATION ACTIVE
                    </span>
                    <h3 className="font-display font-black text-lg uppercase tracking-tight text-emerald-950 dark:text-emerald-200">
                      🏆 Verified Skills Badge Earned
                    </h3>
                  </div>
                </div>
                <span className="bg-[#00A86B] text-white font-mono text-[10px] font-black px-3 py-1 uppercase tracking-widest border border-neutral-950">
                  VERIFIED SKILLS
                </span>
              </div>
              <p className="text-xs text-emerald-950 dark:text-emerald-200 font-semibold uppercase leading-relaxed border-l-4 border-emerald-500 pl-3">
                Your profile skills have been verified by an Admin and rank at the top of recruiter search results! Employers have priority direct access to contact you.
              </p>
            </div>
          ) : (
            <div className="bg-amber-50 dark:bg-amber-950/40 border-4 border-amber-400 dark:border-amber-600 p-6 rounded-none shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] space-y-3 text-left">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Lock className="w-6 h-6 text-amber-600 dark:text-amber-400 shrink-0" />
                  <div>
                    <span className="text-[9px] font-mono font-black uppercase text-amber-700 dark:text-amber-300 tracking-widest block">
                      STATUS: UNVERIFIED SKILLS
                    </span>
                    <h3 className="font-display font-black text-base uppercase tracking-tight text-slate-900 dark:text-white">
                      Awaiting Admin Verification
                    </h3>
                  </div>
                </div>
                <span className="bg-amber-100 dark:bg-amber-900/80 text-amber-800 dark:text-amber-200 font-mono text-[9px] font-black px-2.5 py-1 uppercase tracking-widest border border-amber-300 dark:border-amber-600">
                  UNVERIFIED SKILLS
                </span>
              </div>
              <p className="text-xs text-slate-700 dark:text-slate-300 font-medium leading-relaxed uppercase border-l-4 border-amber-500 pl-3">
                Every talent profile is set to <strong className="text-amber-800 dark:text-amber-300 font-black">UNVERIFIED SKILLS</strong> by default. Complete your details and vetting phases below so an Admin can review and verify your profile.
              </p>
            </div>
          )}

          {/* 3-PHASE STEPPER CONTROLS */}
          <div className="bg-white dark:bg-slate-900 border-2 border-neutral-900 dark:border-slate-800 p-6 sm:p-7 rounded-none shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] space-y-6">
            
            <div className="border-b-2 border-neutral-900 dark:border-slate-800 pb-4">
              <span className="text-[10px] font-mono font-black uppercase tracking-wider text-emerald-700 bg-emerald-50 dark:bg-emerald-950/80 px-2.5 py-0.5 border border-emerald-300">
                SECTION 2
              </span>
              <h2 className="font-display font-black text-xl text-slate-900 dark:text-white uppercase tracking-tight mt-2">
                The 3-Phase Vetting Pipeline
              </h2>
            </div>

            {/* Stepper Buttons */}
            <div className="grid grid-cols-3 gap-3">
              {[
                { num: 1, title: 'Phase 1', label: 'AI Quiz Diagnostic', isPassed: isPhase1Passed, isLocked: false },
                { num: 2, title: 'Phase 2', label: 'Panel Interview', isPassed: phase2InterviewPassed, isLocked: !isPhase1Passed },
                { num: 3, title: 'Phase 3', label: 'Verification Pass', isPassed: isTalentPaid, isLocked: !phase2InterviewPassed }
              ].map((ph) => {
                const isSelected = activePhase === ph.num;
                return (
                  <button
                    key={ph.num}
                    onClick={() => setActivePhase(ph.num as any)}
                    className={`p-3 border-2 text-left transition-all cursor-pointer flex flex-col justify-between h-24 ${
                      isSelected
                        ? 'border-[#00A86B] bg-emerald-50/20 dark:bg-emerald-950/40 shadow-sm'
                        : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono font-black uppercase tracking-wider text-slate-500">
                        {ph.title}
                      </span>
                      {ph.isPassed ? (
                        <CheckCircle2 className="w-4 h-4 text-[#00A86B]" />
                      ) : ph.isLocked ? (
                        <Lock className="w-3.5 h-3.5 text-slate-400" />
                      ) : null}
                    </div>
                    <div>
                      <h4 className="font-display font-black text-xs uppercase text-slate-900 dark:text-white">
                        {ph.label}
                      </h4>
                      <span className="text-[8.5px] font-mono uppercase font-bold text-slate-400 block mt-0.5">
                        {ph.isPassed ? '✓ CLEARED' : ph.isLocked ? 'LOCKED' : 'ACTIVE'}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* PHASE CONTENT DISPLAY */}
            <div className="pt-2">
              
              {/* ==================================== */}
              {/* PHASE 1: DIAGNOSTIC QUIZ              */}
              {/* ==================================== */}
              {activePhase === 1 && (
                <div className="space-y-6 text-left border-t border-slate-200 dark:border-slate-800 pt-5">
                  <div className="space-y-1">
                    <span className="text-[9.5px] font-mono font-black text-[#00A86B] uppercase bg-emerald-50 dark:bg-emerald-950/80 px-2 py-0.5 border border-emerald-300">
                      PHASE 1: AI SCENARIO DIAGNOSTIC
                    </span>
                    <h3 className="font-display font-black text-lg text-slate-900 dark:text-white uppercase mt-1">
                      Hands-on Competency Evaluation
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 uppercase font-medium">
                      Demonstrate structural capability. Requirement: <strong className="text-[#00A86B]">≥ 75% score threshold to pass</strong>.
                    </p>
                  </div>

                  {/* Lockout Screen */}
                  {isQuizCurrentlyLocked() && (
                    <div className="p-6 text-center bg-rose-50/50 dark:bg-rose-950/40 border-2 border-rose-600 space-y-4">
                      <AlertTriangle className="w-10 h-10 text-rose-600 mx-auto" />
                      <h4 className="font-black text-xs uppercase tracking-widest text-slate-900 dark:text-white">DIAGNOSTIC TEMPORARILY LOCKED</h4>
                      <p className="text-xs uppercase font-extrabold text-rose-800 dark:text-rose-300 leading-relaxed">
                        To protect pipeline integrity, candidates are limited to two attempts. Access restores in:
                      </p>
                      <div className="bg-slate-950 text-rose-500 font-mono text-xl py-2 px-4 font-black tracking-widest inline-block border-2 border-rose-600">
                        {countdownString || '0d 0h 0m 0s'}
                      </div>
                    </div>
                  )}

                  {/* Loading Quiz */}
                  {loadingQuiz && (
                    <div className="p-10 border-2 border-dashed border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-center space-y-3">
                      <Loader2 className="w-10 h-10 text-[#00A86B] mx-auto animate-spin" />
                      <h4 className="font-black text-xs text-slate-800 dark:text-slate-200 uppercase tracking-widest">FORMATTING AI DIAGNOSTIC SCENARIOS...</h4>
                    </div>
                  )}

                  {/* Start Quiz Prompt */}
                  {!loadingQuiz && !quizActive && !quizFinished && !isQuizCurrentlyLocked() && (
                    <div className="p-8 border-2 border-dashed border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 text-center space-y-4">
                      <Award className="w-12 h-12 text-[#00A86B] mx-auto" />
                      <h4 className="font-black text-xs text-slate-800 dark:text-slate-200 uppercase tracking-wider">Ready to initiate Phase 1?</h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed uppercase font-semibold">
                        This diagnostic tests 3 scenario-based inquiries tailored to {specialty}. You have 60 seconds once activated.
                      </p>
                      {quizAttempts === 1 && (
                        <div className="p-2.5 bg-amber-50 dark:bg-amber-950/80 border border-amber-300 text-amber-900 dark:text-amber-200 text-[10px] font-mono font-black uppercase tracking-wider">
                          ⚠️ 1 attempt remaining. Take a deep breath and read scenarios carefully!
                        </div>
                      )}
                      <button
                        onClick={handleStartQuiz}
                        className="w-full bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 text-white font-black py-3 px-6 text-xs uppercase tracking-widest cursor-pointer border-2 border-neutral-950"
                      >
                        INITIALIZE AI DIAGNOSTIC
                      </button>
                    </div>
                  )}

                  {/* Active Quiz Question Loop */}
                  {quizActive && !quizFinished && !isQuizCurrentlyLocked() && (
                    <div className="space-y-5">
                      <div className="flex justify-between items-center text-xs font-mono bg-slate-950 text-white py-2 px-4">
                        <span>QUESTION {currentQIdx + 1} OF {activeQuestions.length}</span>
                        <span className={quizTimer <= 15 ? 'text-rose-500 font-black animate-pulse' : 'text-emerald-400 font-bold'}>
                          ⏱️ {quizTimer}s
                        </span>
                      </div>

                      <div className="bg-slate-50 dark:bg-slate-800 p-4 border border-slate-200 dark:border-slate-700">
                        <h4 className="font-bold text-slate-900 dark:text-white text-xs uppercase leading-relaxed">
                          {activeQuestions[currentQIdx].question}
                        </h4>
                      </div>

                      <div className="space-y-2">
                        {activeQuestions[currentQIdx].options.map((opt, idx) => {
                          const hasSelected = quizAnswers[currentQIdx] !== undefined;
                          const isThisSelected = quizAnswers[currentQIdx] === idx;
                          const isCorrect = idx === activeQuestions[currentQIdx].correctIdx;

                          let btnClass = 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200';
                          if (hasSelected) {
                            if (isCorrect) {
                              btnClass = 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-200 font-bold';
                            } else if (isThisSelected) {
                              btnClass = 'border-rose-400 bg-rose-50 dark:bg-rose-950/60 text-rose-800 dark:text-rose-200 font-bold';
                            } else {
                              btnClass = 'border-slate-200 dark:border-slate-800 opacity-50';
                            }
                          }

                          return (
                            <button
                              key={idx}
                              onClick={() => handleSelectQuizAnswer(idx)}
                              disabled={hasSelected}
                              className={`w-full text-left p-3 border text-xs flex gap-2.5 cursor-pointer ${btnClass}`}
                            >
                              <span className="font-mono text-[10px] font-black uppercase">[{String.fromCharCode(65 + idx)}]</span>
                              <span>{opt}</span>
                            </button>
                          );
                        })}
                      </div>

                      {showQExplanation && (
                        <div className="p-3 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 text-emerald-950 dark:text-emerald-200 space-y-2 text-xs">
                          <p className="font-bold uppercase tracking-wider text-[9px] text-[#00A86B]">✓ INSIGHT RESOLUTION:</p>
                          <p className="leading-relaxed font-medium uppercase">{activeQuestions[currentQIdx].explanation}</p>
                          <button
                            onClick={handleNextQuizQuestion}
                            className="bg-slate-950 text-white font-black py-2 px-4 text-[10px] uppercase tracking-widest cursor-pointer flex items-center gap-1.5 mt-2"
                          >
                            <span>CONTINUE NEXT</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Quiz Result Screen */}
                  {!loadingQuiz && quizFinished && !isQuizCurrentlyLocked() && (
                    <div className="p-6 text-center bg-slate-50 dark:bg-slate-800/60 border-2 border-slate-200 dark:border-slate-700 space-y-4">
                      <CheckCircle2 className="w-10 h-10 text-[#00A86B] mx-auto" />
                      <h4 className="font-black text-xs uppercase tracking-widest text-slate-900 dark:text-white">DIAGNOSTIC SCORE RESULT</h4>
                      <p className="text-3xl font-display font-black text-slate-950 dark:text-white">
                        {quizScore}%
                      </p>
                      <p className="text-xs uppercase font-semibold text-slate-600 dark:text-slate-300">
                        {quizScore !== null && quizScore >= 75 
                          ? `Passed Phase 1 threshold (≥ 75%)!`
                          : `Score was ${quizScore}%. Minimum threshold is 75%. Please retry.`}
                      </p>

                      {quizScore !== null && quizScore >= 75 ? (
                        <button
                          onClick={() => setActivePhase(2)}
                          className="w-full bg-[#00A86B] hover:bg-emerald-600 text-white font-black py-3 text-xs uppercase tracking-widest cursor-pointer border-2 border-neutral-950"
                        >
                          Proceed to Phase 2 Panel Booking
                        </button>
                      ) : (
                        <button
                          onClick={handleStartQuiz}
                          className="w-full bg-rose-700 hover:bg-rose-800 text-white font-black py-3 text-xs uppercase tracking-widest cursor-pointer"
                        >
                          RE-TRY AI DIAGNOSTIC
                        </button>
                      )}
                    </div>
                  )}

                </div>
              )}

              {/* ==================================== */}
              {/* PHASE 2: PANEL SESSION               */}
              {/* ==================================== */}
              {activePhase === 2 && (
                <div className="space-y-6 text-left border-t border-slate-200 dark:border-slate-800 pt-5">
                  {!isPhase1Passed ? (
                    <div className="py-12 px-4 text-center space-y-4">
                      <Lock className="w-10 h-10 text-slate-400 mx-auto" />
                      <h4 className="font-black text-xs uppercase tracking-widest text-slate-900 dark:text-white">PHASE 2 LOCKED</h4>
                      <p className="text-xs uppercase font-medium text-slate-500">
                        Clear Phase 1 AI Diagnostic with a 75%+ score to unlock Panel Scheduling.
                      </p>
                      <button
                        onClick={() => setActivePhase(1)}
                        className="bg-slate-900 text-white font-black py-2.5 px-6 text-[10px] uppercase cursor-pointer"
                      >
                        Return to Phase 1
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-5">
                      <div className="space-y-1">
                        <span className="text-[9.5px] font-mono font-black text-[#00A86B] uppercase bg-emerald-50 dark:bg-emerald-950/80 px-2 py-0.5 border border-emerald-300">
                          PHASE 2: PANEL VETTING VIDEO SESSION
                        </span>
                        <h3 className="font-display font-black text-lg text-slate-900 dark:text-white uppercase mt-1">
                          Book Panel Review Slot
                        </h3>
                      </div>

                      {interviewBooked && bookedSlot ? (
                        <div className="p-6 text-center bg-emerald-50/50 dark:bg-emerald-950/40 border-2 border-emerald-500 space-y-4">
                          <CheckCircle2 className="w-10 h-10 text-[#00A86B] mx-auto" />
                          <h4 className="font-black text-xs uppercase tracking-wider text-slate-900 dark:text-white">
                            {phase2InterviewPassed ? 'PANEL REVIEW APPROVED' : 'PANEL REVIEW BOOKED'}
                          </h4>
                          <p className="text-xs text-slate-700 dark:text-slate-300 font-bold uppercase bg-white dark:bg-slate-900 p-3 border border-emerald-300">
                            📅 Date: {bookedSlot.date} • ⏱️ Time: {bookedSlot.time} (UTC)
                          </p>

                          {!phase2InterviewPassed && (
                            <button
                              onClick={async () => {
                                setPhase2InterviewPassed(true);
                                if (user) {
                                  await updateProfileData({
                                    phase_2_interview_passed: true,
                                    vetting_status: 'interview_passed'
                                  });
                                }
                              }}
                              className="w-full bg-[#00A86B] hover:bg-emerald-600 text-white font-black py-2.5 text-[10px] uppercase cursor-pointer"
                            >
                              Bypass & Approve Panel Session (Demo)
                            </button>
                          )}

                          <button
                            onClick={() => setActivePhase(3)}
                            className="w-full bg-slate-900 text-white font-black py-3 text-xs uppercase tracking-widest cursor-pointer"
                          >
                            Proceed to Phase 3 Verification Pass
                          </button>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          <label className="text-[10px] font-mono font-black text-slate-600 dark:text-slate-400 uppercase block">
                            SELECT AVAILABLE INTERVIEW SLOT:
                          </label>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                            {dbSlots.map((slot) => {
                              const isSel = selectedSlotId === slot.id;
                              return (
                                <button
                                  key={slot.id}
                                  type="button"
                                  onClick={() => setSelectedSlotId(slot.id)}
                                  className={`p-3 border text-left cursor-pointer ${
                                    isSel 
                                      ? 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-500 text-emerald-950 dark:text-emerald-200 font-bold' 
                                      : 'bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 border-slate-200 dark:border-slate-800'
                                  }`}
                                >
                                  <div className="flex items-center gap-1.5 text-xs font-mono font-bold">
                                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                                    <span>{slot.date}</span>
                                  </div>
                                  <div className="flex items-center gap-1.5 text-xs font-mono font-black mt-1">
                                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                                    <span>{slot.time_slot}</span>
                                  </div>
                                </button>
                              );
                            })}
                          </div>

                          <button
                            onClick={handleBookInterview}
                            disabled={!selectedSlotId}
                            className="w-full bg-slate-900 disabled:opacity-50 text-white font-black py-3 text-xs uppercase tracking-widest cursor-pointer mt-2"
                          >
                            CONFIRM PANEL BOOKING
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* ==================================== */}
              {/* PHASE 3: VERIFICATION PASS           */}
              {/* ==================================== */}
              {activePhase === 3 && (
                <div className="space-y-6 text-left border-t border-slate-200 dark:border-slate-800 pt-5">
                  {!phase2InterviewPassed ? (
                    <div className="py-12 px-4 text-center space-y-4">
                      <Lock className="w-10 h-10 text-slate-400 mx-auto" />
                      <h4 className="font-black text-xs uppercase tracking-widest text-slate-900 dark:text-white">PHASE 3 LOCKED</h4>
                      <p className="text-xs uppercase font-medium text-slate-500">
                        Complete your Phase 2 Panel Interview to unlock Verification Access.
                      </p>
                      <button
                        onClick={() => setActivePhase(2)}
                        className="bg-slate-900 text-white font-black py-2.5 px-6 text-[10px] uppercase cursor-pointer"
                      >
                        Return to Phase 2
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="space-y-1">
                        <span className="text-[9.5px] font-mono font-black text-[#00A86B] uppercase bg-emerald-50 dark:bg-emerald-950/80 px-2 py-0.5 border border-emerald-300">
                          PHASE 3: VETTING VERIFICATION PASS
                        </span>
                        <h3 className="font-display font-black text-lg text-slate-900 dark:text-white uppercase mt-1">
                          Unlock Verified Gold Badge (₦35,000)
                        </h3>
                      </div>

                      <PaymentPhase
                        isTalentPaid={isTalentPaid}
                        userName={userName}
                        userEmail={user?.email || ''}
                        onPaymentComplete={() => handlePayCommitment()}
                        onNextPhase={() => setActivePhase(3)}
                      />
                    </div>
                  )}
                </div>
              )}

            </div>

          </div>

        </div>

      </div>

      {/* First Failure Modal */}
      <AnimatePresence>
        {showFirstFailModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white border-4 border-neutral-950 p-6 max-w-md w-full relative text-left shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] space-y-4"
            >
              <div className="text-center space-y-3">
                <Sparkles className="w-10 h-10 text-amber-500 mx-auto" />
                <h3 className="font-display font-black text-lg uppercase text-neutral-950">
                  Keep Moving Forward!
                </h3>
                <p className="text-xs font-semibold text-slate-700 uppercase leading-relaxed">
                  Take a deep breath! You have 1 remaining attempt. Review your core specialization parameters and retry.
                </p>
                <button
                  onClick={() => setShowFirstFailModal(false)}
                  className="w-full bg-slate-900 text-white font-black py-3 text-xs uppercase cursor-pointer"
                >
                  Prepare & Retry Diagnostic
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
