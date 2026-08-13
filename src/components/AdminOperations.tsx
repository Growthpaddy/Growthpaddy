import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  Lock, 
  User, 
  Mail, 
  Key, 
  TrendingUp, 
  CheckCircle, 
  AlertCircle, 
  Users, 
  CreditCard, 
  Building, 
  Database, 
  ArrowRight, 
  RotateCcw,
  RefreshCw,
  Eye,
  LogOut,
  Sliders,
  Sparkles,
  Zap,
  ExternalLink,
  X,
  Check,
  Edit3
} from 'lucide-react';
import { supabase } from '../lib/supabaseClient';
import { useSupabase } from '../context/SupabaseContext';
import { useAdminPipeline } from '../hooks/useAdminPipeline';
import { TalentCandidate } from '../types';

interface AdminOperationsProps {
  onBackToMain: () => void;
  mode?: 'dashboard' | 'login' | 'auto';
  onLoginSuccess?: () => void;
  onRedirectToLogin?: () => void;
}

interface AdminUser {
  email: string;
  fullName: string;
  role: string;
}

interface RecruiterRecord {
  id: string;
  orgName: string;
  email: string;
  size: string;
  industry: string;
  neededRole: string;
  slotsBought: number;
  activeSearches: number;
  onboardedAt: string;
}

export default function AdminOperations({ 
  onBackToMain, 
  mode = 'auto', 
  onLoginSuccess, 
  onRedirectToLogin 
}: AdminOperationsProps) {
  const { user, signIn, signUp } = useSupabase();
  
  // Auth state controls
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState<boolean>(false);
  const [authView, setAuthView] = useState<'signin' | 'signup'>('signin');
  
  // Form input states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [authError, setAuthError] = useState<string | null>(null);
  const [authSuccessMsg, setAuthSuccessMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  
  // Toast notification state & Live Pipeline hook
  const {
    talents: talentList,
    recruiters,
    loadingTalents,
    loadingRecruiters,
    error: pipelineError,
    toastMsg,
    setToastMsg,
    fetchTalents,
    fetchRecruiters,
    handleUpdateTalent
  } = useAdminPipeline();

  // Current logged in admin info
  const [currentAdmin, setCurrentAdmin] = useState<AdminUser | null>(null);

  // Modal and audit states
  const [selectedTalentModal, setSelectedTalentModal] = useState<any | null>(null);
  const [selectedResponsesLog, setSelectedResponsesLog] = useState<{ name: string; logs: { question: string; answer: string }[] } | null>(null);
  const [auditViewType, setAuditViewType] = useState<'structured' | 'jsonb'>('jsonb');

  // Available slots management states
  const [slotsList, setSlotsList] = useState<any[]>([]);
  const [newSlotDate, setNewSlotDate] = useState('');
  const [newSlotTime, setNewSlotTime] = useState('');
  const [newSlotLink, setNewSlotLink] = useState('');
  const [slotStatusMsg, setSlotStatusMsg] = useState<string | null>(null);

  // Quiz Audits states
  const [activeTab, setActiveTab] = useState<'registry' | 'audits' | 'recruiters' | 'slots'>('registry');
  const [quizAttemptsLog, setQuizAttemptsLog] = useState<any[]>([]);
  const [loadingAttempts, setLoadingAttempts] = useState<boolean>(false);
  const [selectedAuditAttempt, setSelectedAuditAttempt] = useState<any | null>(null);

  // Wrapper for updateTalentStatus to synchronize selected modal
  const updateTalentStatus = async (talentId: string, updates: Record<string, any>) => {
    if (selectedTalentModal && selectedTalentModal.id === talentId) {
      setSelectedTalentModal((prev: any) => (prev ? { ...prev, ...updates } : null));
    }
    await handleUpdateTalent(talentId, updates);
  };

  const fetchQuizAttempts = async () => {
    setLoadingAttempts(true);
    try {
      const { data, error } = await supabase
        .from('talent_quiz_attempts')
        .select('*')
        .order('created_at', { ascending: false });
      if (!error && data) {
        setQuizAttemptsLog(data);
      } else {
        const cached = localStorage.getItem('mock_quiz_attempts');
        if (cached) {
          setQuizAttemptsLog(JSON.parse(cached));
        } else {
          const defaultAttempts = [
            {
              id: 'att-1',
              full_name: 'Damilola Shofoluwe',
              specialty: 'AI Automation',
              experience_level: 'Seasoned Professional',
              score: 90,
              passed: true,
              ai_feedback: 'Candidate displayed deep technical understanding of make.com scenarios, webhook error handling, and structured JSON outputs.',
              question_breakdown: [
                { question: 'Scenario: Make.com scenario loop recovery...', selectedAnswer: 'Implement an Error handler route with resume', correctAnswer: 'Implement an Error handler route with resume', wasCorrect: true },
                { question: 'Scenario: Handling high-volume API payloads...', selectedAnswer: 'Scale with webhook queues', correctAnswer: 'Scale with webhook queues', wasCorrect: true },
                { question: 'Scenario: Designing prompts for dynamic fields...', selectedAnswer: 'Provide few-shot formatted exemplars', correctAnswer: 'Provide few-shot formatted exemplars', wasCorrect: true }
              ],
              created_at: new Date(Date.now() - 3600000).toISOString()
            },
            {
              id: 'att-2',
              full_name: 'Kofi Mensah',
              specialty: 'SEO Specialization',
              experience_level: 'Fresher/Newbie',
              score: 66,
              passed: false,
              ai_feedback: 'Candidate struggled with canonical tag rules and search crawler index configurations. Recommended remedial study on core search ranking signals.',
              question_breakdown: [
                { question: 'Scenario: Fixing crawl budget congestion...', selectedAnswer: 'Add random pages to sitemap', correctAnswer: 'Configure robots.txt disallows for low-value parameters', wasCorrect: false },
                { question: 'Scenario: Correcting self-referencing canonical structures...', selectedAnswer: 'Point all canonicals to the homepage', correctAnswer: 'Ensure canonical points to the primary URL variation', wasCorrect: false },
                { question: 'Scenario: Designing meta tags for rich indexation...', selectedAnswer: 'Configure meta title with proper keyword density', correctAnswer: 'Configure meta title with proper keyword density', wasCorrect: true }
              ],
              created_at: new Date(Date.now() - 7200000).toISOString()
            }
          ];
          setQuizAttemptsLog(defaultAttempts);
          localStorage.setItem('mock_quiz_attempts', JSON.stringify(defaultAttempts));
        }
      }
    } catch (err) {
      console.warn('Fetch quiz attempts error:', err);
    } finally {
      setLoadingAttempts(false);
    }
  };

  const handleForcePassAttempt = async (attempt: any) => {
    try {
      await supabase
        .from('talent_quiz_attempts')
        .update({ passed: true, score: 75, ai_feedback: attempt.ai_feedback + " (FORCE PASSED BY ADMIN)" })
        .eq('id', attempt.id);

      const userId = attempt.user_id;
      if (userId) {
        await supabase
          .from('talent_profiles')
          .update({
            phase_1_quiz_passed: true,
            vetting_status: 'passed_quiz'
          })
          .eq('id', userId);
        
        const mockKey = `mock_talent_profiles_${userId}`;
        const existing = JSON.parse(localStorage.getItem(mockKey) || '{}');
        localStorage.setItem(mockKey, JSON.stringify({
          ...existing,
          phase_1_quiz_passed: true,
          vetting_status: 'passed_quiz'
        }));
      }

      if (userId) {
        await handleUpdateTalent(userId, {
          phase_1_quiz_passed: true,
          latest_quiz_score: 75,
          vetting_status: 'passed_quiz'
        });
      } else {
        await fetchTalents();
      }

      setQuizAttemptsLog(prev => prev.map(a => {
        if (a.id === attempt.id) {
          return {
            ...a,
            passed: true,
            score: 75,
            ai_feedback: a.ai_feedback + " (FORCE PASSED BY ADMIN)"
          };
        }
        return a;
      }));

      const cached = localStorage.getItem('mock_quiz_attempts');
      if (cached) {
        const parsed = JSON.parse(cached);
        const updated = parsed.map((a: any) => {
          if (a.id === attempt.id) {
            return {
              ...a,
              passed: true,
              score: 75,
              ai_feedback: a.ai_feedback + " (FORCE PASSED BY ADMIN)"
            };
          }
          return a;
        });
        localStorage.setItem('mock_quiz_attempts', JSON.stringify(updated));
      }

      alert(`Successfully forced pass status for ${attempt.full_name}. Their core diagnostic block is now unlocked!`);
    } catch (err) {
      console.warn('Force pass failed:', err);
    }
  };

  const fetchAdminSlots = async () => {
    try {
      const { data, error } = await supabase
        .from('admin_available_slots')
        .select('*')
        .order('date', { ascending: true });
      if (!error && data) {
        setSlotsList(data);
      } else {
        const cached = localStorage.getItem('dsp_available_slots');
        if (cached) {
          setSlotsList(JSON.parse(cached));
        } else {
          const defaultSlots = [
            { id: 'slot-1', date: '2026-07-22', time_slot: '11:30 AM', is_booked: false, meeting_link: 'https://zoom.us/j/1234567890' },
            { id: 'slot-2', date: '2026-07-23', time_slot: '02:00 PM', is_booked: false, meeting_link: 'https://zoom.us/j/1234567891' },
            { id: 'slot-3', date: '2026-07-24', time_slot: '09:00 AM', is_booked: true, meeting_link: 'https://zoom.us/j/1234567892', booked_by_name: 'Damilola Shofoluwe', booked_by_email: 'damilola@example.com' }
          ];
          setSlotsList(defaultSlots);
          localStorage.setItem('dsp_available_slots', JSON.stringify(defaultSlots));
        }
      }
    } catch (err) {
      console.warn('Query slots error:', err);
    }
  };

  const handleCreateSlot = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSlotDate || !newSlotTime) return;

    const newSlot = {
      id: 'slot-' + Math.random().toString(36).substr(2, 9),
      date: newSlotDate,
      time_slot: newSlotTime,
      meeting_link: newSlotLink || 'https://zoom.us/j/mock-meeting-' + Math.floor(100000 + Math.random() * 900000),
      is_booked: false
    };

    try {
      const { error } = await supabase
        .from('admin_available_slots')
        .insert([newSlot]);

      // Cache locally
      const cached = localStorage.getItem('dsp_available_slots');
      const current = cached ? JSON.parse(cached) : [];
      const updated = [...current, newSlot];
      localStorage.setItem('dsp_available_slots', JSON.stringify(updated));

      setSlotsList(updated);
      setNewSlotDate('');
      setNewSlotTime('');
      setNewSlotLink('');
      setSlotStatusMsg('Panel interview slot configured successfully!');
      setTimeout(() => setSlotStatusMsg(null), 3000);
    } catch (err) {
      console.warn('DB Insert slot failed, local cache updated', err);
      // Fallback
      const cached = localStorage.getItem('dsp_available_slots');
      const current = cached ? JSON.parse(cached) : [];
      const updated = [...current, newSlot];
      localStorage.setItem('dsp_available_slots', JSON.stringify(updated));
      setSlotsList(updated);
      setNewSlotDate('');
      setNewSlotTime('');
      setNewSlotLink('');
      setSlotStatusMsg('Panel interview slot configured successfully (Local Storage)!');
      setTimeout(() => setSlotStatusMsg(null), 3000);
    }
  };

  const handleDeleteSlot = async (slotId: string) => {
    try {
      await supabase
        .from('admin_available_slots')
        .delete()
        .eq('id', slotId);

      const updated = slotsList.filter(s => s.id !== slotId);
      localStorage.setItem('dsp_available_slots', JSON.stringify(updated));
      setSlotsList(updated);
    } catch (err) {
      console.warn('Delete slot failed, fallback local update', err);
      const updated = slotsList.filter(s => s.id !== slotId);
      localStorage.setItem('dsp_available_slots', JSON.stringify(updated));
      setSlotsList(updated);
    }
  };

  const handleToggleSlotBooked = async (slotId: string) => {
    const slot = slotsList.find(s => s.id === slotId);
    if (!slot) return;
    const nextBooked = !slot.is_booked;

    try {
      await supabase
        .from('admin_available_slots')
        .update({ is_booked: nextBooked })
        .eq('id', slotId);

      const updated = slotsList.map(s => {
        if (s.id === slotId) {
          return { ...s, is_booked: nextBooked };
        }
        return s;
      });
      localStorage.setItem('dsp_available_slots', JSON.stringify(updated));
      setSlotsList(updated);
    } catch (err) {
      console.warn('Toggle slot booked failed, fallback local update', err);
      const updated = slotsList.map(s => {
        if (s.id === slotId) {
          return { ...s, is_booked: nextBooked };
        }
        return s;
      });
      localStorage.setItem('dsp_available_slots', JSON.stringify(updated));
      setSlotsList(updated);
    }
  };

  // Initialize and load default state of vetting candidates
  useEffect(() => {
    fetchTalents();
    fetchRecruiters();
    fetchAdminSlots();
  }, []);

  // Monitor Supabase session user role to bypass auth gate if user is already an admin
  useEffect(() => {
    let authed = false;
    let adminInfo: AdminUser | null = null;

    if (user && user.user_metadata?.role === 'admin') {
      authed = true;
      adminInfo = {
        email: user.email || '',
        fullName: user.user_metadata?.full_name || 'System Staff',
        role: 'admin'
      };
    } else {
      const simulatedAdmin = localStorage.getItem('dsp_simulated_admin');
      if (simulatedAdmin) {
        try {
          const parsed = JSON.parse(simulatedAdmin);
          authed = true;
          adminInfo = parsed;
        } catch (_) {}
      }
    }

    setIsAdminAuthenticated(authed);
    if (adminInfo) {
      setCurrentAdmin(adminInfo);
    }
  }, [user]);

  useEffect(() => {
    if (activeTab === 'audits') {
      fetchQuizAttempts();
    } else if (activeTab === 'registry') {
      fetchTalents();
    } else if (activeTab === 'recruiters') {
      fetchRecruiters();
    }
  }, [activeTab]);

  // Handle Admin registration logic (creates real user in Supabase Auth & admin_profiles)
  const handleAdminSignUpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    setAuthSuccessMsg(null);
    setLoading(true);

    if (!email || !password || !fullName) {
      setAuthError('Please fill in all three fields.');
      setLoading(false);
      return;
    }

    try {
      // 1. Live Supabase Auth SignUp Call
      const { user: authedUser, error: signUpErr } = await signUp(email, password, {
        data: {
          role: 'admin',
          full_name: fullName
        }
      });

      if (signUpErr) {
        throw signUpErr;
      }

      // 2. Write to admin_profiles table if user created
      if (authedUser) {
        try {
          await supabase.from('admin_profiles').upsert([
            {
              id: authedUser.id,
              full_name: fullName,
              email: email.toLowerCase().trim(),
              role: 'admin'
            }
          ]);
        } catch (dbErr) {
          console.warn('admin_profiles record notice:', dbErr);
        }
      }

      setAuthSuccessMsg('Live Staff Account created! Verification dispatched. You can now Sign In.');
      setAuthView('signin');
    } catch (err: any) {
      setAuthError(err.message || 'Staff node registration failed.');
    } finally {
      setLoading(false);
    }
  };

  // Handle Admin Sign In logic with live Supabase Auth & admin_profiles
  const handleAdminSignInSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    setAuthSuccessMsg(null);
    setLoading(true);

    if (!email || !password) {
      setAuthError('Please enter both administrative credentials.');
      setLoading(false);
      return;
    }

    try {
      // Direct demo credential shortcut for admin@dsp.com
      if (email.toLowerCase() === 'admin@dsp.com' && password === 'password123') {
        const simulatedAdmin = {
          email: 'admin@dsp.com',
          fullName: 'System Administrator',
          role: 'admin'
        };
        localStorage.setItem('dsp_simulated_admin', JSON.stringify(simulatedAdmin));
        setIsAdminAuthenticated(true);
        setCurrentAdmin(simulatedAdmin);
        setLoading(false);
        if (onLoginSuccess) {
          onLoginSuccess();
        }
        return;
      }

      const { user: authedUser, error: signInErr } = await signIn(email, password);
      
      if (signInErr) {
        throw signInErr;
      }

      if (authedUser) {
        const simulatedAdmin = {
          email: authedUser.email || email,
          fullName: authedUser.user_metadata?.full_name || fullName || 'System Staff',
          role: 'admin'
        };
        localStorage.setItem('dsp_simulated_admin', JSON.stringify(simulatedAdmin));
        setIsAdminAuthenticated(true);
        setCurrentAdmin(simulatedAdmin);
        setLoading(false);
        if (onLoginSuccess) {
          onLoginSuccess();
        }
        return;
      }

      throw new Error('Access Denied. Invalid credentials or insufficient operational role.');
    } catch (err: any) {
      setAuthError(err.message || 'Operation restricted. Check credential matrix.');
    } finally {
      setLoading(false);
    }
  };

  // Sign out administrator
  const handleAdminSignOut = () => {
    localStorage.removeItem('dsp_simulated_admin');
    setIsAdminAuthenticated(false);
    setCurrentAdmin(null);
    setAuthSuccessMsg('Staff session severed successfully.');
    if (onRedirectToLogin) {
      onRedirectToLogin();
    }
  };

  // Compute stats on current live state list
  const activeEnrolledCount = talentList.length;
  const approvedCardsCount = talentList.filter(t => t.vetting_status === 'approved' || t.vetting_status === 'passed').length;
  const activeRecruitersCount = recruiters.length;
  const revenueTotal = talentList.filter(t => t.phase_3_fee_paid).length * 35000;

  return (
    <div className="bg-neutral-50 min-h-screen text-neutral-900 font-sans border-t-8 border-neutral-950 flex flex-col" id="admin-operations-container">
      
      {/* Subtle staff-only header ribbon */}
      <div className="bg-neutral-900 text-neutral-400 py-2 px-6 flex justify-between items-center text-[10px] font-mono tracking-wider font-extrabold uppercase border-b border-neutral-800">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-none bg-emerald-500 animate-pulse" />
          <span>{mode === 'login' ? 'ADMINISTRATIVE LOGIN GATE (/ADMIN-LOGIN)' : 'INTERNAL OPERATIONS COMMAND DASHBOARD (/ADMIN-PROFILE)'}</span>
        </div>
        <div className="flex items-center gap-3">
          {mode === 'login' && isAdminAuthenticated && (
            <button 
              onClick={onLoginSuccess}
              className="text-emerald-400 hover:text-white font-bold transition duration-150 uppercase tracking-wider"
            >
              Go to Dashboard →
            </button>
          )}
          {mode === 'dashboard' && !isAdminAuthenticated && (
            <button 
              onClick={onRedirectToLogin}
              className="text-amber-400 hover:text-white font-bold transition duration-150 uppercase tracking-wider"
            >
              Sign In →
            </button>
          )}
          <button 
            onClick={onBackToMain} 
            className="text-[#00A86B] hover:text-white transition duration-150 underline"
          >
            Exit Console
          </button>
        </div>
      </div>

      {mode === 'dashboard' && !isAdminAuthenticated ? (
        /* Restricted Access Guard for /admin-profile when not authenticated */
        <div className="flex-1 flex items-center justify-center p-4 sm:p-12">
          <div className="bg-white border-4 border-neutral-950 p-6 sm:p-10 max-w-md w-full text-center relative shadow-[10px_10px_0px_0px_rgba(0,0,0,1)] space-y-6">
            <div className="w-16 h-16 bg-rose-950 text-rose-400 border-2 border-neutral-950 flex items-center justify-center mx-auto">
              <Lock className="w-8 h-8 stroke-[2.5]" />
            </div>
            <div className="space-y-2">
              <h1 className="font-display font-black text-2xl uppercase tracking-tighter text-neutral-950 leading-none">
                ACCESS RESTRICTED
              </h1>
              <p className="text-xs font-mono font-bold text-neutral-600 uppercase tracking-wider">
                STAFF AUTHENTICATION REQUIRED FOR DASHBOARD (/ADMIN-PROFILE)
              </p>
            </div>
            <p className="text-xs text-neutral-500 font-semibold leading-relaxed">
              You must log in with valid administrative credentials at <code className="bg-neutral-100 text-neutral-900 px-1.5 py-0.5 font-mono font-bold">/admin-login</code> to view staff metrics, vetting pipelines, and corporate accounts.
            </p>
            <div className="pt-2">
              <button 
                onClick={onRedirectToLogin}
                className="w-full bg-neutral-950 hover:bg-neutral-800 text-white font-black py-3 px-6 uppercase tracking-widest text-xs border-2 border-neutral-950 shadow-[4px_4px_0px_0px_rgba(16,185,129,1)] transition-all cursor-pointer"
              >
                GO TO ADMIN LOGIN (/ADMIN-LOGIN) →
              </button>
            </div>
          </div>
        </div>
      ) : mode === 'login' && isAdminAuthenticated ? (
        /* Notice when visiting /admin-login while already authenticated */
        <div className="flex-1 flex items-center justify-center p-4 sm:p-12">
          <div className="bg-white border-4 border-neutral-950 p-6 sm:p-10 max-w-md w-full text-center relative shadow-[10px_10px_0px_0px_rgba(0,0,0,1)] space-y-6">
            <div className="w-16 h-16 bg-emerald-950 text-emerald-400 border-2 border-neutral-950 flex items-center justify-center mx-auto">
              <ShieldCheck className="w-8 h-8 stroke-[2.5]" />
            </div>
            <div className="space-y-2">
              <h1 className="font-display font-black text-2xl uppercase tracking-tighter text-neutral-950 leading-none">
                STAFF SESSION ACTIVE
              </h1>
              <p className="text-xs font-mono font-bold text-emerald-800 bg-emerald-50 px-2.5 py-1 border border-emerald-950 inline-block uppercase">
                {currentAdmin?.fullName || currentAdmin?.email || 'System Administrator'}
              </p>
            </div>
            <p className="text-xs text-neutral-500 font-semibold leading-relaxed">
              You are currently authenticated as an administrative staff member. Proceed to the Command Dashboard at <code className="bg-neutral-100 text-neutral-900 px-1.5 py-0.5 font-mono font-bold">/admin-profile</code>.
            </p>
            <div className="pt-2 space-y-3">
              <button 
                onClick={onLoginSuccess}
                className="w-full bg-[#00A86B] hover:bg-emerald-600 text-white font-black py-3 px-6 uppercase tracking-widest text-xs border-2 border-neutral-950 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all cursor-pointer"
              >
                OPEN ADMIN DASHBOARD (/ADMIN-PROFILE) →
              </button>
              <button 
                onClick={handleAdminSignOut}
                className="w-full bg-neutral-100 hover:bg-neutral-200 text-neutral-800 font-bold py-2 px-4 uppercase tracking-wider text-[10px] border border-neutral-400 cursor-pointer"
              >
                Sign Out Admin Session
              </button>
            </div>
          </div>
        </div>
      ) : !isAdminAuthenticated ? (
        /* =================== 1. THE SUBTLY ACCESSED ADMIN GATE =================== */
        <div className="flex-1 flex items-center justify-center p-4 sm:p-12">
          <div className="bg-white border-4 border-neutral-950 p-6 sm:p-10 max-w-md w-full relative shadow-[10px_10px_0px_0px_rgba(0,0,0,1)] transition-all duration-300">
            
            {/* Design Icon and Title */}
            <div className="text-center space-y-3 pb-6 border-b-2 border-dashed border-neutral-200">
              <div className="w-14 h-14 bg-neutral-950 text-emerald-400 border-2 border-neutral-950 flex items-center justify-center mx-auto rounded-none">
                <Lock className="w-7 h-7 stroke-[2.5]" />
              </div>
              <h1 className="font-display font-black text-2xl uppercase tracking-tighter text-neutral-950 leading-none">
                STAFF CREDENTIALS REQUIRED
              </h1>
              <p className="text-[10px] font-mono text-neutral-500 uppercase tracking-widest font-black">
                PROPRIETARY DATA MATRIX PORTAL
              </p>
            </div>

            {/* Error & Success Messages */}
            {authError && (
              <div className="mt-4 p-3.5 bg-rose-50 border-2 border-rose-600 text-rose-700 text-xs font-bold uppercase tracking-wider flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-700" />
                <span>{authError}</span>
              </div>
            )}
            {authSuccessMsg && (
              <div className="mt-4 p-3.5 bg-emerald-50 border-2 border-[#00A86B] text-emerald-800 text-xs font-bold uppercase tracking-wider flex items-start gap-2">
                <CheckCircle className="w-4 h-4 shrink-0 mt-0.5 text-[#00A86B]" />
                <span>{authSuccessMsg}</span>
              </div>
            )}

            {/* Main Auth Forms */}
            {authView === 'signin' ? (
              <form onSubmit={handleAdminSignInSubmit} className="mt-6 space-y-4">
                <div className="space-y-1.5 text-left">
                  <label className="text-[10px] font-mono font-black text-neutral-400 uppercase tracking-wider">
                    Staff Email Address
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-3.5 text-neutral-400">
                      <Mail className="w-4 h-4" />
                    </span>
                    <input 
                      type="email"
                      required
                      placeholder="e.g. staff@dsptalenthub.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full border-2 border-neutral-300 rounded-none pl-10 pr-4 py-3 focus:outline-none focus:border-[#00A86B] bg-neutral-50 focus:bg-white text-xs font-bold text-neutral-900 uppercase"
                    />
                  </div>
                </div>

                <div className="space-y-1.5 text-left">
                  <label className="text-[10px] font-mono font-black text-neutral-400 uppercase tracking-wider">
                    Administrative Password
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-3.5 text-neutral-400">
                      <Key className="w-4 h-4" />
                    </span>
                    <input 
                      type="password"
                      required
                      placeholder="••••••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full border-2 border-neutral-300 rounded-none pl-10 pr-4 py-3 focus:outline-none focus:border-[#00A86B] bg-neutral-50 focus:bg-white text-xs font-bold text-neutral-900"
                    />
                  </div>
                </div>

                <button 
                  type="submit"
                  disabled={loading}
                  className="w-full bg-neutral-950 hover:bg-neutral-900 text-white font-black py-4 px-6 rounded-none text-xs uppercase tracking-widest transition cursor-pointer flex items-center justify-center gap-2 border-2 border-neutral-950 shadow-[5px_5px_0px_0px_rgba(0,168,107,1)] hover:shadow-none disabled:opacity-50"
                >
                  <Lock className="w-4 h-4 text-emerald-400" />
                  <span>{loading ? 'VALIDATING OPERATIONS...' : 'AUTHENTICATE SESSION'}</span>
                </button>
              </form>
            ) : (
              <form onSubmit={handleAdminSignUpSubmit} className="mt-6 space-y-4">
                <div className="space-y-1.5 text-left">
                  <label className="text-[10px] font-mono font-black text-neutral-400 uppercase tracking-wider">
                    Full Professional Name
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-3.5 text-neutral-400">
                      <User className="w-4 h-4" />
                    </span>
                    <input 
                      type="text"
                      required
                      placeholder="e.g. Director Elizabeth Vance"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full border-2 border-neutral-300 rounded-none pl-10 pr-4 py-3 focus:outline-none focus:border-[#00A86B] bg-neutral-50 focus:bg-white text-xs font-bold text-neutral-900"
                    />
                  </div>
                </div>

                <div className="space-y-1.5 text-left">
                  <label className="text-[10px] font-mono font-black text-neutral-400 uppercase tracking-wider">
                    Professional Staff Email
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-3.5 text-neutral-400">
                      <Mail className="w-4 h-4" />
                    </span>
                    <input 
                      type="email"
                      required
                      placeholder="you@dsptalenthub.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full border-2 border-neutral-300 rounded-none pl-10 pr-4 py-3 focus:outline-none focus:border-[#00A86B] bg-neutral-50 focus:bg-white text-xs font-bold text-neutral-900"
                    />
                  </div>
                </div>

                <div className="space-y-1.5 text-left">
                  <label className="text-[10px] font-mono font-black text-neutral-400 uppercase tracking-wider">
                    Secure Staff Password
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-3.5 text-neutral-400">
                      <Key className="w-4 h-4" />
                    </span>
                    <input 
                      type="password"
                      required
                      placeholder="Min 6 characters"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full border-2 border-neutral-300 rounded-none pl-10 pr-4 py-3 focus:outline-none focus:border-[#00A86B] bg-neutral-50 focus:bg-white text-xs font-bold text-neutral-900"
                    />
                  </div>
                </div>

                <button 
                  type="submit"
                  disabled={loading}
                  className="w-full bg-neutral-950 hover:bg-neutral-900 text-white font-black py-4 px-6 rounded-none text-xs uppercase tracking-widest transition cursor-pointer flex items-center justify-center gap-2 border-2 border-neutral-950 shadow-[5px_5px_0px_0px_rgba(0,168,107,1)] hover:shadow-none disabled:opacity-50"
                >
                  <User className="w-4 h-4 text-emerald-400" />
                  <span>{loading ? 'CREATING PROFILE...' : 'REGISTER STAFF NODE'}</span>
                </button>
              </form>
            )}

            {/* Subtle Gate Toggle */}
            <div className="mt-6 pt-4 border-t border-neutral-200 text-center flex flex-col items-center gap-3">
              {authView === 'signin' ? (
                <>
                  <p className="text-[11px] font-bold uppercase text-neutral-400">
                    No authorized console node?
                  </p>
                  <button 
                    onClick={() => { setAuthView('signup'); setAuthError(null); }}
                    className="text-xs font-black text-[#00A86B] hover:text-emerald-800 uppercase tracking-widest cursor-pointer underline decoration-2 underline-offset-2"
                  >
                    Create Staff Account
                  </button>
                </>
              ) : (
                <>
                  <p className="text-[11px] font-bold uppercase text-neutral-400">
                    Already possess staff credentials?
                  </p>
                  <button 
                    onClick={() => { setAuthView('signin'); setAuthError(null); }}
                    className="text-xs font-black text-[#00A86B] hover:text-emerald-800 uppercase tracking-widest cursor-pointer underline decoration-2 underline-offset-2"
                  >
                    Return to Sign In Portal
                  </button>
                </>
              )}
            </div>



          </div>
        </div>
      ) : (
        /* =================== 2. THE COMPREHENSIVE ADMIN OPERATIONS CONTROL CENTER =================== */
        <div className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-8 space-y-8 animate-fadeIn">
          
          {/* Active Staff Session Banner */}
          <div className="bg-neutral-950 text-white p-6 rounded-none border-2 border-neutral-950 flex flex-col md:flex-row md:items-center md:justify-between gap-4 shadow-[4px_4px_0px_0px_rgba(0,168,107,1)]">
            <div className="space-y-1 text-left">
              <span className="text-[10px] font-mono font-black tracking-widest text-[#00A86B] uppercase block">
                AUTHENTICATED OPERATIONAL SESSION
              </span>
              <h2 className="font-display font-black text-xl uppercase tracking-tight flex items-center gap-2">
                <span>{currentAdmin?.fullName}</span>
                <span className="text-[10px] font-mono font-black bg-emerald-800 text-emerald-100 px-2 py-0.5 border border-emerald-900 uppercase">
                  STAFF ROLE
                </span>
              </h2>
              <p className="text-[11px] text-neutral-400 font-bold uppercase tracking-wider font-mono">
                Admin Node ID: {currentAdmin?.email.toLowerCase()}
              </p>
            </div>
            
            <div className="flex flex-wrap items-center gap-3">
              <button 
                onClick={onBackToMain}
                className="bg-neutral-900 hover:bg-neutral-850 border border-neutral-700 text-neutral-300 font-black text-[11px] px-4 py-2.5 rounded-none uppercase tracking-widest transition duration-150 cursor-pointer"
              >
                Exit Workspace
              </button>
              <button 
                onClick={handleAdminSignOut}
                className="bg-rose-950 hover:bg-rose-900 border border-rose-800 text-rose-200 font-black text-[11px] px-4 py-2.5 rounded-none uppercase tracking-widest transition duration-150 cursor-pointer flex items-center gap-1.5"
              >
                <LogOut className="w-3.5 h-3.5 text-rose-400" />
                <span>TERMINATE SESSION</span>
              </button>
            </div>
          </div>

          {/* Operations Metric Workspace KPI Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            
            <div className="bg-white border-2 border-neutral-950 p-6 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] text-left flex flex-col justify-between h-32">
              <div className="flex justify-between items-start">
                <span className="text-[9px] font-mono font-black text-neutral-500 uppercase tracking-widest">
                  ENROLLED TALENTS
                </span>
                <Users className="w-4 h-4 text-neutral-400" />
              </div>
              <div>
                <p className="text-3xl font-display font-black text-neutral-950 leading-none">
                  {activeEnrolledCount}
                </p>
                <p className="text-[9px] uppercase font-bold text-[#00A86B] mt-1">
                  Active diagnostic pipelines
                </p>
              </div>
            </div>

            <div className="bg-white border-2 border-neutral-950 p-6 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] text-left flex flex-col justify-between h-32">
              <div className="flex justify-between items-start">
                <span className="text-[9px] font-mono font-black text-neutral-500 uppercase tracking-widest">
                  APPROVED PLACEMENTS
                </span>
                <CheckCircle className="w-4 h-4 text-emerald-600" />
              </div>
              <div>
                <p className="text-3xl font-display font-black text-neutral-950 leading-none">
                  {approvedCardsCount}
                </p>
                <p className="text-[9px] uppercase font-bold text-[#00A86B] mt-1">
                  Passed all 3 vetting phases
                </p>
              </div>
            </div>

            <div className="bg-white border-2 border-neutral-950 p-6 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] text-left flex flex-col justify-between h-32">
              <div className="flex justify-between items-start">
                <span className="text-[9px] font-mono font-black text-neutral-500 uppercase tracking-widest">
                  ACTIVE RECRUITERS
                </span>
                <Building className="w-4 h-4 text-neutral-400" />
              </div>
              <div>
                <p className="text-3xl font-display font-black text-neutral-950 leading-none">
                  {activeRecruitersCount}
                </p>
                <p className="text-[9px] uppercase font-bold text-neutral-500 mt-1">
                  SaaS organization directories
                </p>
              </div>
            </div>

            <div className="bg-white border-2 border-neutral-950 p-6 shadow-[3px_3px_0px_0px_rgba(0,168,107,1)] text-left flex flex-col justify-between h-32">
              <div className="flex justify-between items-start">
                <span className="text-[9px] font-mono font-black text-neutral-500 uppercase tracking-widest">
                  PHASE 3 FEE REVENUES
                </span>
                <CreditCard className="w-4 h-4 text-emerald-600" />
              </div>
              <div>
                <p className="text-3xl font-display font-black text-[#00A86B] leading-none">
                  ₦{revenueTotal.toLocaleString()}
                </p>
                <p className="text-[9px] uppercase font-bold text-neutral-500 mt-1">
                  @ ₦35,000 / Accreditation Pass
                </p>
              </div>
            </div>

          </div>

          {/* Pipeline Error Banner */}
          {pipelineError && (
            <div className="bg-rose-50 border-2 border-rose-500 text-rose-900 p-4 mb-4 flex items-center justify-between font-mono text-xs shadow-[4px_4px_0px_0px_rgba(244,63,94,1)]">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
                <div>
                  <span className="font-black uppercase block">Supabase Pipeline Error</span>
                  <span className="text-[11px] font-bold">{pipelineError}</span>
                </div>
              </div>
              <button onClick={fetchTalents} className="bg-rose-600 text-white font-black px-3 py-1 uppercase text-[10px] hover:bg-rose-700 cursor-pointer">
                RETRY
              </button>
            </div>
          )}

          {/* Toast Notification Alert Banner */}
          {toastMsg && (
            <div className="fixed top-6 right-6 z-50 bg-neutral-950 text-white border-2 border-emerald-500 p-4 shadow-[6px_6px_0px_0px_rgba(0,168,107,1)] flex items-center gap-3 animate-fadeIn">
              <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0" />
              <div>
                <p className="font-mono text-xs font-black uppercase text-emerald-400">SUPABASE LIVE UPDATE</p>
                <p className="text-xs font-extrabold text-neutral-200">{toastMsg}</p>
              </div>
              <button onClick={() => setToastMsg(null)} className="ml-2 text-neutral-400 hover:text-white font-mono text-xs cursor-pointer">✕</button>
            </div>
          )}

          {/* Operations Navigation Tab Selector */}
          <div className="flex border-b-4 border-neutral-950 gap-2 mb-6 mt-4 overflow-x-auto">
            {[
              { id: 'registry', label: 'Talent Registry', count: talentList.length },
              { id: 'audits', label: 'Gemini Quiz Audits' },
              { id: 'recruiters', label: 'Recruiter Placements', count: recruiters.length },
              { id: 'slots', label: 'Vetting Slots Manager', count: slotsList.length }
            ].map((tb) => {
              const isActive = activeTab === tb.id;
              return (
                <button
                  key={tb.id}
                  onClick={() => setActiveTab(tb.id as any)}
                  className={`px-4 py-3 text-[11px] font-display font-black uppercase tracking-wider border-2 border-b-0 cursor-pointer transition-all duration-150 shrink-0
                    ${isActive 
                      ? 'bg-white border-neutral-950 text-neutral-950 shadow-[0px_4px_0px_white] -mb-[4px] z-10' 
                      : 'bg-neutral-100 border-neutral-200 text-neutral-500 hover:bg-neutral-50 hover:text-neutral-700'}`}
                >
                  <span className="flex items-center gap-1.5">
                    {tb.label}
                    {tb.count !== undefined && (
                      <span className="bg-neutral-950 text-white text-[8px] font-mono px-1.5 py-0.5 rounded-none font-black">
                        {tb.count}
                      </span>
                    )}
                  </span>
                </button>
              );
            })}
          </div>

          {activeTab === 'registry' && (
            /* =================== 2a. THE TALENT OPTIMIZATION REGISTRY TABLE =================== */
            <div className="bg-white border-4 border-neutral-950 p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
            <div className="flex flex-col md:flex-row md:items-center justify-between border-b-2 border-neutral-200 pb-4 mb-6 gap-4">
              <div className="text-left space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-[9px] font-mono font-black text-emerald-800 bg-emerald-50 border border-emerald-150 px-2 py-0.5">
                    REGISTRY MONITOR
                  </span>
                  <span className="text-[9px] font-mono font-black text-neutral-500 bg-neutral-100 border border-neutral-200 px-2 py-0.5">
                    DYNAMIC SYSTEM STATE
                  </span>
                </div>
                <h3 className="font-display font-black text-xl text-neutral-950 uppercase tracking-tight">
                  Talent Optimization Registry Table
                </h3>
                <p className="text-[10px] text-neutral-500 uppercase tracking-wider font-bold">
                  Review digital talent status profiles, 4-phase matrix checks, and update vetting statuses live in Supabase.
                </p>
              </div>
              
              <div className="flex items-center gap-2">
                <button
                  onClick={fetchTalents}
                  disabled={loadingTalents}
                  className="bg-neutral-950 hover:bg-neutral-900 text-white font-mono text-[10px] px-3.5 py-1.5 uppercase tracking-wider flex items-center gap-1.5 font-black border-2 border-neutral-950 cursor-pointer"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${loadingTalents ? 'animate-spin text-emerald-400' : ''}`} />
                  <span>REFRESH TALENT</span>
                </button>
                <span className="text-[10px] font-mono uppercase text-neutral-400 font-bold ml-2">Total Enrolled:</span>
                <strong className="text-xs font-mono font-extrabold text-neutral-900 bg-neutral-100 px-2.5 py-1 border border-neutral-300">{talentList.length}</strong>
              </div>
            </div>

            {loadingTalents ? (
              <div className="py-16 text-center space-y-3 font-mono">
                <RefreshCw className="w-8 h-8 text-emerald-600 mx-auto animate-spin" />
                <p className="text-[10px] font-black text-neutral-500 uppercase tracking-widest">LOADING LIVE TALENT PROFILES FROM SUPABASE...</p>
              </div>
            ) : talentList.length === 0 ? (
              <div className="p-12 text-center border-2 border-dashed border-neutral-300 text-neutral-400 font-mono text-xs uppercase space-y-2">
                <p className="font-black text-neutral-600">NO TALENT PROFILES FOUND IN SUPABASE</p>
                <p className="text-[10px] text-neutral-400">Talent candidates registering in the portal will populate public.talent_profiles automatically.</p>
              </div>
            ) : (
              /* Responsive Horizontal Table Container */
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs tracking-tight border-collapse min-w-[1200px]">
                  <thead>
                    <tr className="bg-neutral-900 text-white uppercase font-mono text-[9px] font-black tracking-widest border-2 border-neutral-900">
                      <th className="py-3 px-4">Talent Profile</th>
                      <th className="py-3 px-4 text-center">Progress Matrix</th>
                      <th className="py-3 px-4 text-center">Phase 1: Diagnostic</th>
                      <th className="py-3 px-4 text-center">Phase 2: Panel Interview</th>
                      <th className="py-3 px-4 text-center">Phase 3: Verification Fee</th>
                      <th className="py-3 px-4 text-center">Phase 4: Portfolio</th>
                      <th className="py-3 px-4 text-center">Vetting Status</th>
                      <th className="py-3 px-4 text-right">Admin Action Controls</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y-2 divide-neutral-150">
                  {talentList.map((talent) => {
                    const completedCount = 
                      (talent.phase_1_quiz_passed ? 1 : 0) +
                      (talent.phase_2_interview_passed ? 1 : 0) +
                      (talent.phase_3_fee_paid ? 1 : 0) +
                      (talent.phase_4_portfolio_submitted ? 1 : 0);
                    const progressPercent = completedCount * 25;

                    return (
                    <tr key={talent.id} className="hover:bg-neutral-50 transition duration-100">
                      
                      {/* Basic Info */}
                      <td className="py-4.5 px-4 text-left">
                        <div className="flex items-center gap-3">
                          <img 
                            src={talent.avatar_url || talent.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'} 
                            alt={talent.full_name || talent.name} 
                            className="w-10 h-10 border-2 border-neutral-950 object-cover rounded-none shrink-0"
                            referrerPolicy="no-referrer"
                          />
                          <div>
                            <p className="font-extrabold text-sm text-neutral-950 uppercase">{talent.full_name || talent.name || 'Anonymous Candidate'}</p>
                            <p className="text-[10px] font-bold text-neutral-500 uppercase">{talent.email}</p>
                            <div className="flex flex-wrap items-center gap-1.5 mt-1">
                              <span className="bg-neutral-100 border border-neutral-200 text-neutral-700 px-1.5 py-0.5 text-[8.5px] font-bold uppercase">
                                {talent.specialty || 'Growth Marketing'}
                              </span>
                              <span className="bg-neutral-100 border border-neutral-200 text-neutral-600 px-1.5 py-0.5 text-[8.5px] font-bold uppercase">
                                {talent.career_goal || 'Full-Time Remote'}
                              </span>
                            </div>
                            <p className="text-[8px] font-mono text-neutral-400 mt-1">
                              Enrolled: {talent.created_at ? new Date(talent.created_at).toLocaleDateString() : 'Recent'}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Progress Matrix */}
                      <td className="py-4.5 px-4 text-center min-w-[140px]">
                        <div className="space-y-1.5 max-w-[120px] mx-auto">
                          <div className="flex items-center justify-between text-[9px] font-mono font-black text-neutral-900">
                            <span>Phase {completedCount}/4</span>
                            <span>{progressPercent}%</span>
                          </div>
                          <div className="w-full bg-neutral-200 h-2 border border-neutral-900 overflow-hidden">
                            <div 
                              className="bg-[#00A86B] h-full transition-all duration-300" 
                              style={{ width: `${progressPercent}%` }}
                            />
                          </div>
                          <span className={`inline-block text-[8px] font-mono font-extrabold uppercase px-1.5 py-0.5 border ${
                            completedCount === 4
                              ? 'bg-emerald-100 text-emerald-900 border-emerald-300'
                              : 'bg-neutral-100 text-neutral-600 border-neutral-200'
                          }`}>
                            {completedCount === 4 ? 'Phase 4/4 Complete' : `Phase ${completedCount}/4 Complete`}
                          </span>
                        </div>
                      </td>

                      {/* Phase 1: Diagnostic */}
                      <td className="py-4.5 px-4 text-center">
                        <div className="space-y-1.5">
                          <span className={`inline-flex items-center gap-1 font-mono text-[9px] font-black px-2 py-0.5 uppercase border ${
                            talent.phase_1_quiz_passed 
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-300' 
                              : 'bg-rose-50 text-rose-800 border-rose-300'
                          }`}>
                            <span className={`w-1.5 h-1.5 ${talent.phase_1_quiz_passed ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                            <span>{talent.phase_1_quiz_passed ? 'PASSED' : 'PENDING'}</span>
                          </span>
                          <div className="text-[9px] font-mono font-bold text-neutral-500">
                            Score: {talent.latest_quiz_score ?? 0}/100
                          </div>
                          <button
                            onClick={() => updateTalentStatus(talent.id, { phase_1_quiz_passed: !talent.phase_1_quiz_passed })}
                            className="text-[8.5px] font-mono font-extrabold underline text-neutral-700 hover:text-emerald-700 cursor-pointer block mx-auto"
                          >
                            Toggle Phase 1
                          </button>
                        </div>
                      </td>

                      {/* Phase 2: Panel Interview */}
                      <td className="py-4.5 px-4 text-center">
                        <div className="space-y-1.5">
                          <div className="flex flex-col gap-1 items-center">
                            <span className={`inline-flex items-center gap-1 font-mono text-[8.5px] font-black px-2 py-0.5 uppercase border ${
                              talent.phase_2_interview_scheduled 
                                ? 'bg-emerald-50 text-emerald-800 border-emerald-300' 
                                : 'bg-neutral-100 text-neutral-500 border-neutral-300'
                            }`}>
                              <span>Sched: {talent.phase_2_interview_scheduled ? 'YES' : 'NO'}</span>
                            </span>
                            <span className={`inline-flex items-center gap-1 font-mono text-[8.5px] font-black px-2 py-0.5 uppercase border ${
                              talent.phase_2_interview_passed 
                                ? 'bg-emerald-50 text-emerald-800 border-emerald-300' 
                                : 'bg-amber-50 text-amber-800 border-amber-300'
                            }`}>
                              <span>Passed: {talent.phase_2_interview_passed ? 'YES' : 'NO'}</span>
                            </span>
                          </div>
                          <div className="flex justify-center gap-1.5">
                            <button
                              onClick={() => updateTalentStatus(talent.id, { phase_2_interview_scheduled: !talent.phase_2_interview_scheduled })}
                              className="text-[8px] font-mono font-extrabold underline text-neutral-600 hover:text-neutral-900 cursor-pointer"
                            >
                              Toggle Sched
                            </button>
                            <button
                              onClick={() => updateTalentStatus(talent.id, { phase_2_interview_passed: !talent.phase_2_interview_passed })}
                              className="text-[8px] font-mono font-extrabold underline text-neutral-600 hover:text-emerald-700 cursor-pointer"
                            >
                              Toggle Pass
                            </button>
                          </div>
                        </div>
                      </td>

                      {/* Phase 3: Verification Fee */}
                      <td className="py-4.5 px-4 text-center">
                        <div className="space-y-1.5">
                          <span className={`inline-flex items-center gap-1 font-mono text-[9px] font-black px-2.5 py-0.5 uppercase border ${
                            talent.phase_3_fee_paid 
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-300' 
                              : 'bg-rose-50 text-rose-800 border-rose-300'
                          }`}>
                            <span className={`w-1.5 h-1.5 ${talent.phase_3_fee_paid ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                            <span>{talent.phase_3_fee_paid ? 'PAID $45' : 'UNPAID'}</span>
                          </span>
                          <button
                            onClick={() => updateTalentStatus(talent.id, { phase_3_fee_paid: !talent.phase_3_fee_paid })}
                            className="text-[8.5px] font-mono font-extrabold underline text-neutral-700 hover:text-emerald-700 cursor-pointer block mx-auto"
                          >
                            Toggle Fee
                          </button>
                        </div>
                      </td>

                      {/* Phase 4: Portfolio */}
                      <td className="py-4.5 px-4 text-center">
                        <div className="space-y-1.5">
                          <span className={`inline-flex items-center gap-1 font-mono text-[8.5px] font-black px-2 py-0.5 uppercase border ${
                            talent.phase_4_portfolio_submitted 
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-300' 
                              : 'bg-neutral-100 text-neutral-500 border-neutral-300'
                          }`}>
                            <span>{talent.phase_4_portfolio_submitted ? 'SUBMITTED' : 'PENDING'}</span>
                          </span>
                          {talent.portfolio_url && (
                            <a 
                              href={talent.portfolio_url} 
                              target="_blank" 
                              rel="noreferrer"
                              className="text-[8.5px] font-mono text-emerald-700 hover:underline flex items-center justify-center gap-0.5"
                            >
                              <span>View Link</span>
                              <ExternalLink className="w-2.5 h-2.5" />
                            </a>
                          )}
                          <button
                            onClick={() => updateTalentStatus(talent.id, { phase_4_portfolio_submitted: !talent.phase_4_portfolio_submitted })}
                            className="text-[8.5px] font-mono font-extrabold underline text-neutral-700 hover:text-emerald-700 cursor-pointer block mx-auto"
                          >
                            Toggle Portfolio
                          </button>
                        </div>
                      </td>

                      {/* Overall Vetting Status */}
                      <td className="py-4.5 px-4 text-center">
                        <div className="space-y-1.5">
                          <span className={`inline-flex items-center gap-1 px-2.5 py-1 text-[9px] font-black uppercase tracking-wider border-2 ${
                            talent.vetting_status === 'approved' || talent.vetting_status === 'verified' || talent.vetting_status === 'passed'
                              ? 'bg-[#00A86B]/10 text-[#00A86B] border-[#00A86B]' 
                              : talent.vetting_status === 'rejected' || talent.vetting_status === 'revoked'
                              ? 'bg-rose-50 text-rose-800 border-rose-300'
                              : 'bg-amber-50 text-amber-800 border-amber-300'
                          }`}>
                            <span className={`w-1.5 h-1.5 ${
                              talent.vetting_status === 'approved' || talent.vetting_status === 'verified' || talent.vetting_status === 'passed'
                                ? 'bg-[#00A86B]'
                                : talent.vetting_status === 'rejected' || talent.vetting_status === 'revoked'
                                ? 'bg-rose-600'
                                : 'bg-amber-500'
                            }`} />
                            <span>
                              {talent.vetting_status === 'approved' || talent.vetting_status === 'verified' || talent.vetting_status === 'passed'
                                ? 'VERIFIED SKILLS'
                                : 'UNVERIFIED SKILLS'}
                            </span>
                          </span>

                          <button
                            onClick={() => updateTalentStatus(talent.id, { 
                              vetting_status: (talent.vetting_status === 'approved' || talent.vetting_status === 'verified') ? 'pending' : 'approved' 
                            })}
                            className={`w-full text-[8.5px] font-mono font-black px-1.5 py-1 uppercase border border-neutral-950 transition cursor-pointer ${
                              (talent.vetting_status === 'approved' || talent.vetting_status === 'verified')
                                ? 'bg-amber-100 hover:bg-amber-200 text-amber-900'
                                : 'bg-[#00A86B] hover:bg-emerald-700 text-white'
                            }`}
                          >
                            {(talent.vetting_status === 'approved' || talent.vetting_status === 'verified') ? '✕ UNVERIFY SKILLS' : '✓ VERIFY SKILLS'}
                          </button>

                          <select
                            value={talent.vetting_status || 'pending'}
                            onChange={(e) => updateTalentStatus(talent.id, { vetting_status: e.target.value })}
                            className="block w-full border border-neutral-950 font-mono text-[9px] font-bold px-1 py-0.5 bg-white focus:outline-none uppercase cursor-pointer"
                          >
                            <option value="pending">UNVERIFIED SKILLS (PENDING)</option>
                            <option value="approved">VERIFIED SKILLS (APPROVED)</option>
                            <option value="rejected">REJECTED</option>
                            <option value="revoked">REVOKED</option>
                          </select>
                        </div>
                      </td>

                      {/* Administrative Action Controls */}
                      <td className="py-4.5 px-4 text-right space-y-2">
                        <div className="flex flex-col items-end gap-1.5">
                          <button 
                            onClick={() => setSelectedTalentModal(talent)}
                            className="bg-neutral-900 hover:bg-neutral-800 text-white font-black text-[9px] px-2 py-1.5 rounded-none uppercase tracking-wider cursor-pointer border border-neutral-950 transition w-full flex items-center justify-center gap-1"
                          >
                            <Edit3 className="w-3 h-3 text-emerald-400" />
                            <span>MANAGE CANDIDATE</span>
                          </button>

                          <button 
                            onClick={() => updateTalentStatus(talent.id, {
                              phase_1_quiz_passed: true,
                              phase_2_interview_scheduled: true,
                              phase_2_interview_passed: true,
                              phase_3_fee_paid: true,
                              phase_4_portfolio_submitted: true,
                              vetting_status: 'approved'
                            })}
                            className="bg-[#00A86B] hover:bg-emerald-800 text-white font-black text-[8.5px] px-2 py-0.5 rounded-none uppercase tracking-wider cursor-pointer border border-[#00A86B] transition w-full text-center"
                          >
                            APPROVE ALL
                          </button>
                        </div>
                      </td>

                    </tr>
                  );
                  })}
                </tbody>
              </table>
            </div>
            )}

          </div>
          )}

          {activeTab === 'audits' && (
            /* =================== DYNAMIC AI QUIZ AUDITS MATRIX =================== */
            <div className="bg-white border-4 border-neutral-950 p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] text-left space-y-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between border-b-2 border-neutral-200 pb-4 mb-6 gap-4">
                <div className="text-left space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[9px] font-mono font-black text-amber-900 bg-amber-50 border border-amber-200 px-2 py-0.5">
                      AUDIT CONTEXT
                    </span>
                    <span className="text-[9px] font-mono font-black text-neutral-500 bg-neutral-100 border border-neutral-200 px-2 py-0.5">
                      GEMINI GENERATIVE VERIFIED LOGS
                    </span>
                  </div>
                  <h3 className="font-display font-black text-xl text-neutral-950 uppercase tracking-tight">
                    Candidate Quiz Audits
                  </h3>
                  <p className="text-[10px] text-neutral-500 uppercase tracking-wider font-bold">
                    Audit and inspect Gemini-graded quiz attempts, read dynamic cognitive feedback logs, see answers breakdown, or force pass override.
                  </p>
                </div>
                
                <button 
                  onClick={fetchQuizAttempts}
                  disabled={loadingAttempts}
                  className="bg-neutral-950 hover:bg-neutral-900 text-white font-mono text-[10px] px-3.5 py-2 uppercase tracking-wider flex items-center gap-1.5 font-black border-2 border-neutral-950"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${loadingAttempts ? 'animate-spin text-emerald-400' : ''}`} />
                  <span>REFRESH AUDIT STREAM</span>
                </button>
              </div>

              {loadingAttempts ? (
                <div className="py-20 text-center space-y-3 font-mono">
                  <RefreshCw className="w-8 h-8 text-emerald-600 mx-auto animate-spin" />
                  <p className="text-[10px] font-black text-neutral-500 uppercase tracking-widest">LOADING REAL-TIME GEMINI COGNITION LOGS...</p>
                </div>
              ) : quizAttemptsLog.length === 0 ? (
                <div className="p-12 text-center border-2 border-dashed border-neutral-300 text-neutral-400 uppercase font-mono text-xs">
                  No core diagnostic quiz attempts found in the live ledger.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs tracking-tight border-collapse min-w-[800px]">
                    <thead>
                      <tr className="bg-neutral-950 text-white uppercase font-mono text-[9px] font-black tracking-widest border-2 border-neutral-950">
                        <th className="py-3 px-4">Candidate Full Name</th>
                        <th className="py-3 px-4">Specialty Core</th>
                        <th className="py-3 px-4">Experience Tier</th>
                        <th className="py-3 px-4 text-center">Diagnostic Score</th>
                        <th className="py-3 px-4 text-center">System Status</th>
                        <th className="py-3 px-4 text-right">Attempt Timestamp</th>
                        <th className="py-3 px-4 text-right">Action Logs</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y-2 divide-neutral-150">
                      {quizAttemptsLog.map((attempt) => (
                        <tr key={attempt.id} className="hover:bg-neutral-50 transition duration-100">
                          <td className="py-4 px-4 font-black text-neutral-950 uppercase flex items-center gap-2">
                            <User className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
                            <span>{attempt.full_name}</span>
                          </td>
                          <td className="py-4 px-4 uppercase text-neutral-500 font-bold">
                            {attempt.specialty}
                          </td>
                          <td className="py-4 px-4 font-mono font-bold text-neutral-700 uppercase text-[10px]">
                            {attempt.experience_level}
                          </td>
                          <td className="py-4 px-4 text-center font-mono font-black text-sm">
                            <span className={attempt.passed ? 'text-emerald-700' : 'text-rose-700'}>
                              {attempt.score}%
                            </span>
                          </td>
                          <td className="py-4 px-4 text-center">
                            <span className={`font-mono text-[8.5px] font-black uppercase px-2 py-0.5 rounded-none border block w-max mx-auto
                              ${attempt.passed 
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-300' 
                                : 'bg-rose-50 text-rose-700 border-rose-300'}`}
                            >
                              {attempt.passed ? 'PASSED' : 'FAILED'}
                            </span>
                          </td>
                          <td className="py-4 px-4 text-right font-mono text-neutral-450 font-bold">
                            {new Date(attempt.created_at).toLocaleString()}
                          </td>
                          <td className="py-4 px-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => setSelectedAuditAttempt(attempt)}
                                className="bg-neutral-950 hover:bg-neutral-900 text-white font-mono text-[10px] font-black px-2.5 py-1.5 uppercase tracking-wide cursor-pointer flex items-center gap-1 shrink-0 border border-neutral-950"
                              >
                                <Eye className="w-3 h-3 text-emerald-400" />
                                <span>INSPECT FEEDBACK</span>
                              </button>
                              {!attempt.passed && (
                                <button
                                  onClick={() => handleForcePassAttempt(attempt)}
                                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-mono text-[10px] font-black px-2.5 py-1.5 uppercase tracking-wide cursor-pointer flex items-center gap-1 shrink-0 border border-emerald-600"
                                >
                                  <Sparkles className="w-3 h-3 text-white" />
                                  <span>FORCE PASS</span>
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {activeTab === 'recruiters' && (
            /* =================== 2b. THE RECRUITER PLACEMENT MONITORING TABLE =================== */
            <div className="bg-white border-4 border-neutral-950 p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] text-left">
            <div className="flex items-center justify-between border-b-2 border-neutral-200 pb-4 mb-6">
              <div>
                <span className="text-[9px] font-mono font-black text-emerald-800 bg-emerald-50 border border-emerald-150 px-2 py-0.5">
                  PIPELINE CONTROLS
                </span>
                <h3 className="font-display font-black text-xl text-neutral-950 uppercase tracking-tight mt-1">
                  The Recruiter Placement Directory
                </h3>
                <p className="text-[10px] text-neutral-500 uppercase tracking-wider font-bold">
                  Live directory of corporate client organizations querying public.recruiter_profiles in real time.
                </p>
              </div>
              <button 
                onClick={fetchRecruiters}
                disabled={loadingRecruiters}
                className="bg-neutral-950 hover:bg-neutral-900 text-white font-mono text-[10px] px-3.5 py-2 uppercase tracking-wider flex items-center gap-1.5 font-black border-2 border-neutral-950 cursor-pointer"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loadingRecruiters ? 'animate-spin text-emerald-400' : ''}`} />
                <span>REFRESH DIRECTORY</span>
              </button>
            </div>

            {loadingRecruiters ? (
              <div className="py-16 text-center space-y-3 font-mono">
                <RefreshCw className="w-8 h-8 text-emerald-600 mx-auto animate-spin" />
                <p className="text-[10px] font-black text-neutral-500 uppercase tracking-widest">LOADING LIVE RECRUITER PROFILES FROM SUPABASE...</p>
              </div>
            ) : recruiters.length === 0 ? (
              <div className="p-12 text-center border-2 border-dashed border-neutral-300 text-neutral-400 font-mono text-xs uppercase space-y-2">
                <p className="font-black text-neutral-600">NO RECRUITER PROFILES IN SUPABASE LEDGER</p>
                <p className="text-[10px] text-neutral-400">Recruiters signing up in the application will populate public.recruiter_profiles automatically.</p>
              </div>
            ) : (
              /* Grid Matrix Table */
              <div className="overflow-x-auto">
                <table className="w-full text-xs tracking-tight border-collapse min-w-[800px]">
                  <thead>
                    <tr className="bg-neutral-900 text-white uppercase font-mono text-[9px] font-black tracking-widest border-2 border-neutral-900">
                      <th className="py-3 px-4">Corporate Client Organization</th>
                      <th className="py-3 px-4">Industry / Vertical</th>
                      <th className="py-3 px-4">Company Size</th>
                      <th className="py-3 px-4">Search Preference Target</th>
                      <th className="py-3 px-4 text-center">Purchased Slots</th>
                      <th className="py-3 px-4 text-center">Active Campaigns</th>
                      <th className="py-3 px-4 text-right">Onboarding Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y-2 divide-neutral-150">
                    {recruiters.map((recruiter) => (
                      <tr key={recruiter.id} className="hover:bg-neutral-50 transition duration-100">
                        
                        <td className="py-4 px-4 text-left">
                          <div className="font-extrabold text-neutral-950 uppercase flex items-center gap-2">
                            <div className="w-2.5 h-2.5 rounded-none bg-neutral-950 border border-emerald-400 shrink-0" />
                            <span>{recruiter.orgName}</span>
                          </div>
                          {recruiter.email && (
                            <p className="text-[10px] font-mono font-bold text-neutral-500 uppercase mt-0.5 pl-4.5">
                              {recruiter.email}
                            </p>
                          )}
                        </td>

                        <td className="py-4 px-4 uppercase text-neutral-500 font-bold">
                          {recruiter.industry}
                        </td>

                        <td className="py-4 px-4 font-mono font-bold text-neutral-700">
                          {recruiter.size} EMPLOYEES
                        </td>

                        <td className="py-4 px-4">
                          <span className="bg-emerald-50 border border-emerald-150 text-[#00A86B] font-bold uppercase text-[9px] px-2 py-1 rounded-none">
                            {recruiter.neededRole}
                          </span>
                        </td>

                        <td className="py-4 px-4 text-center">
                          <span className="font-mono text-xs font-black bg-neutral-150 px-2.5 py-0.5 border border-neutral-300">
                            {recruiter.slotsBought} SLOTS
                          </span>
                        </td>

                        <td className="py-4 px-4 text-center">
                          <div className="flex items-center justify-center gap-1.5 font-mono text-xs font-black">
                            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                            <span>{recruiter.activeSearches} RUNNING</span>
                          </div>
                        </td>

                        <td className="py-4 px-4 text-right text-neutral-400 font-mono font-bold">
                          {recruiter.onboardedAt}
                        </td>

                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

          </div>
          )}

          {activeTab === 'slots' && (
            /* =================== 2c. PANEL INTERVIEW SLOT MANAGER UI =================== */
            <div className="bg-white border-4 border-neutral-950 p-6 shadow-[8px_8px_0px_0px_rgba(0,168,107,1)] text-left space-y-6">
            <div className="border-b-2 border-neutral-200 pb-4">
              <span className="text-[9px] font-mono font-black text-emerald-800 bg-emerald-50 border border-emerald-150 px-2 py-0.5">
                VETTING INFRASTRUCTURE
              </span>
              <h3 className="font-display font-black text-xl text-neutral-950 uppercase tracking-tight mt-1">
                Panel Interview Slot Manager
              </h3>
              <p className="text-[10px] text-neutral-500 uppercase tracking-wider font-bold">
                Configure and release dynamic calendar coordinates that synchronize directly onto Phase 2 of active Talent dashboards.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              
              {/* Form to configure new slot (Left: 4 cols) */}
              <form onSubmit={handleCreateSlot} className="lg:col-span-4 bg-neutral-50 border-2 border-neutral-200 p-5 space-y-4">
                <span className="text-[10px] font-mono font-black text-neutral-500 uppercase tracking-widest block">
                  DEPLOY CALENDAR SLOT
                </span>

                {slotStatusMsg && (
                  <div className="p-2 bg-emerald-50 border border-[#00A86B] text-[#00A86B] text-[10px] font-mono font-black uppercase text-center">
                    {slotStatusMsg}
                  </div>
                )}

                <div className="space-y-1.5">
                  <label className="text-[9px] font-mono font-black text-neutral-400 uppercase tracking-wider block">
                    Slot Date
                  </label>
                  <input
                    type="date"
                    required
                    value={newSlotDate}
                    onChange={(e) => setNewSlotDate(e.target.value)}
                    className="w-full bg-white border-2 border-neutral-300 py-1.5 px-3 text-xs font-bold text-neutral-900 focus:outline-none focus:border-[#00A86B]"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[9px] font-mono font-black text-neutral-400 uppercase tracking-wider block">
                    Slot Time (e.g., 11:30 AM)
                  </label>
                  <select
                    value={newSlotTime}
                    onChange={(e) => setNewSlotTime(e.target.value)}
                    required
                    className="w-full bg-white border-2 border-neutral-300 py-1.5 px-2 text-xs font-bold text-neutral-900 focus:outline-none focus:border-[#00A86B]"
                  >
                    <option value="">-- Choose Time Slot --</option>
                    <option value="09:00 AM">09:00 AM (UTC)</option>
                    <option value="11:30 AM">11:30 AM (UTC)</option>
                    <option value="02:00 PM">02:00 PM (UTC)</option>
                    <option value="04:30 PM">04:30 PM (UTC)</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[9px] font-mono font-black text-neutral-400 uppercase tracking-wider block">
                    Meeting Link (Zoom / Meet)
                  </label>
                  <input
                    type="url"
                    placeholder="https://zoom.us/j/..."
                    value={newSlotLink}
                    onChange={(e) => setNewSlotLink(e.target.value)}
                    className="w-full bg-white border-2 border-neutral-300 py-1.5 px-3 text-xs font-bold text-neutral-900 focus:outline-none focus:border-[#00A86B]"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-neutral-950 hover:bg-neutral-900 text-white font-black py-3 px-4 rounded-none text-xs uppercase tracking-widest cursor-pointer border-2 border-neutral-950 shadow-[4px_4px_0px_0px_rgba(0,168,107,1)] hover:shadow-none transition-all duration-150 flex items-center justify-center gap-1.5"
                >
                  <Zap className="w-4 h-4 text-emerald-400" />
                  <span>PUBLISH ACTIVE SLOT</span>
                </button>
              </form>

              {/* Dynamic slots list (Right: 8 cols) */}
              <div className="lg:col-span-8 space-y-3">
                <span className="text-[10px] font-mono font-black text-neutral-500 uppercase tracking-widest block pl-1">
                  CURRENTLY RELEASED CALENDAR COORDINATES
                </span>

                {slotsList.length === 0 ? (
                  <div className="p-8 border-2 border-dashed border-neutral-200 bg-neutral-50 text-center text-xs font-semibold text-neutral-400 uppercase">
                    No available panel slots are currently registered. Use the left builder form to launch live schedules.
                  </div>
                ) : (
                  <div className="overflow-x-auto border-2 border-neutral-950">
                    <table className="w-full text-left text-xs tracking-tight border-collapse min-w-[550px]">
                      <thead>
                        <tr className="bg-neutral-950 text-white uppercase font-mono text-[9px] font-black tracking-widest border-b-2 border-neutral-950">
                          <th className="py-2 px-3">Slot Schedule (UTC)</th>
                          <th className="py-2 px-3">Meeting Credentials</th>
                          <th className="py-2 px-3 text-center">Booking State</th>
                          <th className="py-2 px-3 text-right">Operational Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-neutral-200">
                        {slotsList.map((slot) => (
                          <tr key={slot.id} className="hover:bg-neutral-50 transition duration-100">
                            
                            <td className="py-3 px-3">
                              <p className="font-extrabold text-neutral-950 uppercase">
                                {new Date(slot.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
                              </p>
                              <p className="font-mono text-[10px] font-black text-emerald-700 mt-0.5">
                                ⏱️ {slot.time_slot}
                              </p>
                            </td>

                            <td className="py-3 px-3">
                              <a
                                href={slot.meeting_link}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-neutral-500 hover:text-neutral-950 font-mono text-[10.5px] uppercase font-bold break-all underline decoration-[#00A86B] decoration-2"
                              >
                                Link URL
                              </a>
                            </td>

                            <td className="py-3 px-3 text-center">
                              {slot.is_booked ? (
                                <div className="space-y-0.5">
                                  <span className="bg-rose-50 text-rose-800 border border-rose-300 font-mono text-[9px] font-black uppercase px-2 py-0.5 inline-block">
                                    BOOKED
                                  </span>
                                  {slot.booked_by_name && (
                                    <p className="text-[9px] font-bold text-neutral-600 uppercase mt-1 leading-none">
                                      {slot.booked_by_name}
                                    </p>
                                  )}
                                </div>
                              ) : (
                                <span className="bg-emerald-50 text-emerald-800 border border-emerald-300 font-mono text-[9px] font-black uppercase px-2 py-0.5 inline-block">
                                  AVAILABLE
                                </span>
                              )}
                            </td>

                            <td className="py-3 px-3 text-right">
                              <div className="flex justify-end gap-1.5">
                                <button
                                  type="button"
                                  onClick={() => handleToggleSlotBooked(slot.id)}
                                  className="bg-neutral-100 hover:bg-neutral-200 border-2 border-neutral-950 px-2 py-1 text-[9px] font-black uppercase transition cursor-pointer"
                                  title="Manually override booked coordinate"
                                >
                                  {slot.is_booked ? 'RELEASE' : 'RESERVE'}
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleDeleteSlot(slot.id)}
                                  className="bg-rose-50 hover:bg-rose-100 border-2 border-rose-600 text-rose-700 px-2 py-1 text-[9px] font-black uppercase transition cursor-pointer"
                                  title="Deprovision slot"
                                >
                                  ✕ DELETE
                                </button>
                              </div>
                            </td>

                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

            </div>

          </div>
          )}

        </div>
      )}

      {/* =================== SECONDARY POPUP MODAL: SESSION RESPONSES =================== */}
      {selectedResponsesLog && (
        <div className="fixed inset-0 bg-neutral-950/80 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-fadeIn">
          <div className="bg-white border-4 border-neutral-950 max-w-2xl w-full p-6 sm:p-8 space-y-5 text-left relative shadow-[10px_10px_0px_0px_rgba(0,168,107,1)]">
            
            <button 
              onClick={() => setSelectedResponsesLog(null)}
              className="absolute top-4 right-4 text-neutral-400 hover:text-neutral-950 font-mono font-black border-2 border-neutral-950 px-2 py-0.5 text-xs transition uppercase"
            >
              ✕ CLOSE
            </button>

            <div className="border-b-2 border-neutral-200 pb-3 text-left">
              <span className="text-[9px] font-mono font-black text-emerald-800 bg-emerald-50 border border-emerald-150 px-2 py-0.5 uppercase tracking-widest">
                session_responses Log (JSONB)
              </span>
              <h3 className="font-display font-black text-xl text-neutral-950 uppercase tracking-tight mt-1">
                {selectedResponsesLog.name.toUpperCase()}
              </h3>
              <p className="text-[10px] text-neutral-500 uppercase tracking-wider font-bold">
                Auditing dynamic conversational pipeline outputs for database validation.
              </p>
            </div>

            {/* High-contrast toggle tabs */}
            <div className="grid grid-cols-2 gap-2 p-1 bg-neutral-100 border border-neutral-300">
              <button
                type="button"
                onClick={() => setAuditViewType('jsonb')}
                className={`py-2 px-3 text-center text-xs font-black uppercase tracking-wider transition ${
                  auditViewType === 'jsonb'
                    ? 'bg-neutral-950 text-white'
                    : 'bg-transparent text-neutral-600 hover:text-neutral-950'
                }`}
              >
                Raw JSONB Audit Log
              </button>
              <button
                type="button"
                onClick={() => setAuditViewType('structured')}
                className={`py-2 px-3 text-center text-xs font-black uppercase tracking-wider transition ${
                  auditViewType === 'structured'
                    ? 'bg-neutral-950 text-white'
                    : 'bg-transparent text-neutral-600 hover:text-neutral-950'
                }`}
              >
                Structured Questionnaire View
              </button>
            </div>

            {/* Display Based On State */}
            {auditViewType === 'jsonb' ? (
              <div className="space-y-2">
                <div className="flex justify-between items-center text-[9px] font-mono font-bold text-neutral-400 uppercase">
                  <span>POSTGRESQL JSONB REPRESENTATION:</span>
                  <span className="text-emerald-700 font-extrabold">READ-ONLY AUDIT STREAM</span>
                </div>
                <div className="bg-neutral-900 border-2 border-neutral-950 p-4 font-mono text-[11px] text-emerald-400 overflow-auto max-h-[300px] rounded-none shadow-inner select-all relative">
                  <div className="absolute right-2 top-2 bg-neutral-800 text-[8px] font-bold text-neutral-400 px-1.5 py-0.5">
                    JSONB payload
                  </div>
                  <pre className="whitespace-pre-wrap font-mono leading-relaxed">
                    {JSON.stringify({
                      talent_id: talentList.find(t => (t.full_name || t.name) === selectedResponsesLog.name)?.id || 'unknown',
                      recorded_at: new Date().toISOString().split('T')[0] + " 14:03:42 UTC",
                      session_responses: selectedResponsesLog.logs.reduce((acc, current, idx) => {
                        acc[`question_${idx + 1}`] = {
                          prompt: current.question,
                          response_payload: current.answer
                        };
                        return acc;
                      }, {} as Record<string, any>)
                    }, null, 2)}
                  </pre>
                </div>
                <p className="text-[9.5px] font-semibold text-neutral-400 uppercase tracking-wide leading-normal">
                  💡 Hint: Click inside the dark window and press <kbd className="font-mono bg-neutral-200 px-1 text-neutral-800">Ctrl+A</kbd> then <kbd className="font-mono bg-neutral-200 px-1 text-neutral-800">Ctrl+C</kbd> to copy raw database insert statements.
                </p>
              </div>
            ) : (
              <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2">
                {selectedResponsesLog.logs.map((item, idx) => (
                  <div key={idx} className="p-3 bg-neutral-50 border border-neutral-200 space-y-1 text-xs">
                    <div className="flex items-start gap-1.5">
                      <span className="font-mono text-[9px] font-black text-[#00A86B] uppercase shrink-0 mt-0.5">
                        Q{idx + 1}:
                      </span>
                      <p className="font-extrabold text-neutral-900 uppercase tracking-wide">
                        {item.question}
                      </p>
                    </div>
                    <div className="pl-6 font-semibold text-neutral-600 bg-white border border-neutral-200 p-2 text-xs uppercase tracking-wider">
                      {item.answer}
                    </div>
                  </div>
                ))}
              </div>
            )}

            <button 
              onClick={() => setSelectedResponsesLog(null)}
              className="w-full bg-neutral-950 hover:bg-neutral-900 text-white font-black py-4 px-6 rounded-none text-xs uppercase tracking-widest transition cursor-pointer text-center border-2 border-neutral-950 shadow-[4px_4px_0px_0px_rgba(0,168,107,1)] hover:shadow-none"
            >
              Close Responses Log
            </button>

          </div>
        </div>
      )}

      {/* =================== COGNITIVE AI QUIZ AUDIT DETAIL MODAL =================== */}
      {selectedAuditAttempt && (
        <div className="fixed inset-0 bg-neutral-950/80 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-fadeIn">
          <div className="bg-white border-4 border-neutral-950 max-w-3xl w-full p-6 sm:p-8 space-y-5 text-left relative shadow-[10px_10px_0px_0px_rgba(245,158,11,1)] max-h-[90vh] overflow-y-auto">
            
            <button 
              onClick={() => setSelectedAuditAttempt(null)}
              className="absolute top-4 right-4 text-neutral-400 hover:text-neutral-950 font-mono font-black border-2 border-neutral-950 px-2 py-0.5 text-xs transition uppercase"
            >
              ✕ CLOSE
            </button>

            <div className="border-b-2 border-neutral-200 pb-3 text-left">
              <span className="text-[9px] font-mono font-black text-amber-800 bg-amber-50 border border-amber-150 px-2 py-0.5 uppercase tracking-widest">
                GEMINI AI COGNITION AUDIT LOG
              </span>
              <h3 className="font-display font-black text-2xl text-neutral-950 uppercase tracking-tight mt-1 flex items-center gap-3">
                <span>{selectedAuditAttempt.full_name}</span>
                <span className={`text-xs font-mono font-black px-2 py-0.5 border uppercase
                  ${selectedAuditAttempt.passed 
                    ? 'bg-emerald-100 text-emerald-800 border-emerald-200' 
                    : 'bg-rose-100 text-rose-800 border-rose-200'}`}
                >
                  SCORE: {selectedAuditAttempt.score}%
                </span>
              </h3>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2 text-[10px] text-neutral-500 uppercase font-mono font-black">
                <span>Specialty: <strong className="text-neutral-800">{selectedAuditAttempt.specialty}</strong></span>
                <span>•</span>
                <span>Experience: <strong className="text-neutral-800">{selectedAuditAttempt.experience_level}</strong></span>
                <span>•</span>
                <span>Recorded: <strong className="text-neutral-800">{new Date(selectedAuditAttempt.created_at).toLocaleString()}</strong></span>
              </div>
            </div>

            {/* Questions and Answers Ledger */}
            <div className="space-y-4">
              <h4 className="text-[10px] font-mono font-black text-neutral-400 uppercase tracking-widest">
                Dynamic Diagnostic Scenario Ledger
              </h4>
              <div className="space-y-3">
                {selectedAuditAttempt.questions && selectedAuditAttempt.questions.map((q, idx) => {
                  const candidateAnswer = selectedAuditAttempt.answers[q.id || (idx + 1)] || "NO ANSWER SUBMITTED";
                  return (
                    <div key={idx} className="p-4 bg-neutral-50 border border-neutral-200 space-y-2.5 text-xs">
                      <div className="flex items-start gap-2">
                        <span className="font-mono text-[10px] font-black text-neutral-500 bg-neutral-200 px-1.5 py-0.5 uppercase shrink-0">
                          Q{idx + 1}
                        </span>
                        <div>
                          <p className="font-mono text-[10px] text-neutral-500 uppercase font-bold tracking-wide leading-relaxed">
                            {q.scenario}
                          </p>
                          <p className="font-extrabold text-neutral-950 uppercase tracking-wide mt-1">
                            {q.question}
                          </p>
                        </div>
                      </div>
                      
                      <div className="pl-6 space-y-1.5">
                        <p className="text-[9px] font-mono font-black text-neutral-400 uppercase">
                          Candidate Selection:
                        </p>
                        <div className="border border-neutral-300 bg-white p-2.5 text-neutral-800 font-bold uppercase tracking-wide border-l-4 border-l-neutral-950">
                          {candidateAnswer}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* AI Grading Evaluation Feedback */}
            <div className="space-y-2 bg-neutral-900 border-2 border-neutral-950 p-4 text-left">
              <div className="flex justify-between items-center text-[9px] font-mono font-black text-emerald-400 uppercase tracking-wider">
                <span>GEMINI GRADING EVALUATION:</span>
                <span>COGNITIVE SUMMARY FEEDBACK</span>
              </div>
              <div className="text-xs text-neutral-200 font-mono leading-relaxed whitespace-pre-wrap max-h-[150px] overflow-y-auto mt-2 select-all p-1">
                {selectedAuditAttempt.ai_evaluation || "No dynamic system evaluation feedback generated for this attempt."}
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              {!selectedAuditAttempt.passed && (
                <button 
                  onClick={() => {
                    handleForcePassAttempt(selectedAuditAttempt);
                    setSelectedAuditAttempt(null);
                  }}
                  className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-black py-3.5 px-6 rounded-none text-xs uppercase tracking-widest transition cursor-pointer text-center flex items-center justify-center gap-2 border-2 border-emerald-600"
                >
                  <Sparkles className="w-4 h-4 text-white" />
                  <span>FORCE PASS OVERRIDE</span>
                </button>
              )}
              <button 
                onClick={() => setSelectedAuditAttempt(null)}
                className="flex-1 bg-neutral-950 hover:bg-neutral-900 text-white font-black py-3.5 px-6 rounded-none text-xs uppercase tracking-widest transition cursor-pointer text-center border-2 border-neutral-950"
              >
                Close Audit Inspection
              </button>
            </div>

          </div>
        </div>
      )}

      {/* =================== CANDIDATE VETTING ACTION MODAL =================== */}
      {selectedTalentModal && (
        <div className="fixed inset-0 bg-neutral-950/80 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-fadeIn">
          <div className="bg-white border-4 border-neutral-950 max-w-xl w-full p-6 sm:p-8 space-y-5 text-left relative shadow-[12px_12px_0px_0px_rgba(0,168,107,1)] max-h-[90vh] overflow-y-auto">
            
            <button 
              onClick={() => setSelectedTalentModal(null)}
              className="absolute top-4 right-4 text-neutral-400 hover:text-neutral-950 font-mono font-black border-2 border-neutral-950 px-2.5 py-1 text-xs transition uppercase cursor-pointer"
            >
              ✕ CLOSE
            </button>

            {/* Candidate Header */}
            <div className="border-b-2 border-neutral-200 pb-4 flex items-center gap-4">
              <img 
                src={selectedTalentModal.avatar_url || selectedTalentModal.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'} 
                alt={selectedTalentModal.full_name || selectedTalentModal.name} 
                className="w-14 h-14 border-2 border-neutral-950 object-cover shrink-0"
              />
              <div>
                <span className="text-[9px] font-mono font-black text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 uppercase tracking-widest">
                  ACTION CONTROL MATRIX
                </span>
                <h3 className="font-display font-black text-xl text-neutral-950 uppercase tracking-tight mt-1">
                  {selectedTalentModal.full_name || selectedTalentModal.name || 'Candidate Details'}
                </h3>
                <p className="text-xs font-mono font-bold text-neutral-500">{selectedTalentModal.email}</p>
              </div>
            </div>

            {/* Progress Bar Summary */}
            {(() => {
              const count = 
                (selectedTalentModal.phase_1_quiz_passed ? 1 : 0) +
                (selectedTalentModal.phase_2_interview_passed ? 1 : 0) +
                (selectedTalentModal.phase_3_fee_paid ? 1 : 0) +
                (selectedTalentModal.phase_4_portfolio_submitted ? 1 : 0);
              const pct = count * 25;

              return (
                <div className="bg-neutral-50 border-2 border-neutral-950 p-4 space-y-2">
                  <div className="flex justify-between items-center text-xs font-mono font-black uppercase">
                    <span>Overall Progression:</span>
                    <span className="text-[#00A86B]">Phase {count}/4 Complete ({pct}%)</span>
                  </div>
                  <div className="w-full bg-neutral-200 h-3 border border-neutral-950 overflow-hidden">
                    <div className="bg-[#00A86B] h-full transition-all duration-300" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })()}

            {/* Interactive Phase Matrix Toggles */}
            <div className="space-y-3">
              <h4 className="text-[10px] font-mono font-black text-neutral-400 uppercase tracking-widest">
                4-Phase Vetting Checkpoints
              </h4>

              {/* Phase 1 */}
              <div className="flex items-center justify-between p-3 border-2 border-neutral-200 hover:border-neutral-950 transition">
                <div>
                  <p className="font-extrabold text-xs text-neutral-950 uppercase">Phase 1: Diagnostic Assessment</p>
                  <p className="text-[10px] font-mono text-neutral-500">Score: {selectedTalentModal.latest_quiz_score || 0}/100</p>
                </div>
                <button
                  onClick={async () => {
                    const nextVal = !selectedTalentModal.phase_1_quiz_passed;
                    setSelectedTalentModal((prev: any) => ({ ...prev, phase_1_quiz_passed: nextVal }));
                    await updateTalentStatus(selectedTalentModal.id, { phase_1_quiz_passed: nextVal });
                  }}
                  className={`font-mono text-[10px] font-black px-3 py-1.5 uppercase border-2 cursor-pointer transition ${
                    selectedTalentModal.phase_1_quiz_passed
                      ? 'bg-emerald-500 text-white border-emerald-600'
                      : 'bg-neutral-100 text-neutral-700 border-neutral-300'
                  }`}
                >
                  {selectedTalentModal.phase_1_quiz_passed ? 'PASSED ✓' : 'SET PASSED'}
                </button>
              </div>

              {/* Phase 2 */}
              <div className="flex items-center justify-between p-3 border-2 border-neutral-200 hover:border-neutral-950 transition">
                <div>
                  <p className="font-extrabold text-xs text-neutral-950 uppercase">Phase 2: Panel Interview</p>
                  <p className="text-[10px] font-mono text-neutral-500">
                    Sched: {selectedTalentModal.phase_2_interview_scheduled ? 'Yes' : 'No'} | Passed: {selectedTalentModal.phase_2_interview_passed ? 'Yes' : 'No'}
                  </p>
                </div>
                <div className="flex gap-1.5">
                  <button
                    onClick={async () => {
                      const nextVal = !selectedTalentModal.phase_2_interview_scheduled;
                      setSelectedTalentModal((prev: any) => ({ ...prev, phase_2_interview_scheduled: nextVal }));
                      await updateTalentStatus(selectedTalentModal.id, { phase_2_interview_scheduled: nextVal });
                    }}
                    className={`font-mono text-[9px] font-black px-2 py-1 uppercase border-2 cursor-pointer ${
                      selectedTalentModal.phase_2_interview_scheduled
                        ? 'bg-emerald-100 text-emerald-800 border-emerald-400'
                        : 'bg-neutral-100 text-neutral-600 border-neutral-300'
                    }`}
                  >
                    {selectedTalentModal.phase_2_interview_scheduled ? 'SCHED ✓' : 'SET SCHED'}
                  </button>
                  <button
                    onClick={async () => {
                      const nextVal = !selectedTalentModal.phase_2_interview_passed;
                      setSelectedTalentModal((prev: any) => ({ ...prev, phase_2_interview_passed: nextVal }));
                      await updateTalentStatus(selectedTalentModal.id, { phase_2_interview_passed: nextVal });
                    }}
                    className={`font-mono text-[9px] font-black px-2 py-1 uppercase border-2 cursor-pointer ${
                      selectedTalentModal.phase_2_interview_passed
                        ? 'bg-emerald-500 text-white border-emerald-600'
                        : 'bg-neutral-100 text-neutral-600 border-neutral-300'
                    }`}
                  >
                    {selectedTalentModal.phase_2_interview_passed ? 'PASSED ✓' : 'SET PASSED'}
                  </button>
                </div>
              </div>

              {/* Phase 3 */}
              <div className="flex items-center justify-between p-3 border-2 border-neutral-200 hover:border-neutral-950 transition">
                <div>
                  <p className="font-extrabold text-xs text-neutral-950 uppercase">Phase 3: Verification Fee</p>
                  <p className="text-[10px] font-mono text-neutral-500">Fee Amount: $45</p>
                </div>
                <button
                  onClick={async () => {
                    const nextVal = !selectedTalentModal.phase_3_fee_paid;
                    setSelectedTalentModal((prev: any) => ({ ...prev, phase_3_fee_paid: nextVal }));
                    await updateTalentStatus(selectedTalentModal.id, { phase_3_fee_paid: nextVal });
                  }}
                  className={`font-mono text-[10px] font-black px-3 py-1.5 uppercase border-2 cursor-pointer transition ${
                    selectedTalentModal.phase_3_fee_paid
                      ? 'bg-emerald-500 text-white border-emerald-600'
                      : 'bg-neutral-100 text-neutral-700 border-neutral-300'
                  }`}
                >
                  {selectedTalentModal.phase_3_fee_paid ? 'PAID $45 ✓' : 'SET PAID'}
                </button>
              </div>

              {/* Phase 4 */}
              <div className="flex items-center justify-between p-3 border-2 border-neutral-200 hover:border-neutral-950 transition">
                <div>
                  <p className="font-extrabold text-xs text-neutral-950 uppercase">Phase 4: Portfolio Verification</p>
                  <p className="text-[10px] font-mono text-neutral-500">{selectedTalentModal.portfolio_url || 'No URL submitted'}</p>
                </div>
                <button
                  onClick={async () => {
                    const nextVal = !selectedTalentModal.phase_4_portfolio_submitted;
                    setSelectedTalentModal((prev: any) => ({ ...prev, phase_4_portfolio_submitted: nextVal }));
                    await updateTalentStatus(selectedTalentModal.id, { phase_4_portfolio_submitted: nextVal });
                  }}
                  className={`font-mono text-[10px] font-black px-3 py-1.5 uppercase border-2 cursor-pointer transition ${
                    selectedTalentModal.phase_4_portfolio_submitted
                      ? 'bg-emerald-500 text-white border-emerald-600'
                      : 'bg-neutral-100 text-neutral-700 border-neutral-300'
                  }`}
                >
                  {selectedTalentModal.phase_4_portfolio_submitted ? 'SUBMITTED ✓' : 'SET SUBMITTED'}
                </button>
              </div>
            </div>

            {/* Overall Vetting Status Selector */}
            <div className="space-y-1.5 bg-neutral-100 border-2 border-neutral-950 p-3">
              <label className="block text-[10px] font-mono font-black text-neutral-700 uppercase">
                Overall Candidate Vetting Status:
              </label>
              <select
                value={selectedTalentModal.vetting_status || 'pending'}
                onChange={async (e) => {
                  const newStatus = e.target.value;
                  setSelectedTalentModal((prev: any) => ({ ...prev, vetting_status: newStatus }));
                  await updateTalentStatus(selectedTalentModal.id, { vetting_status: newStatus });
                }}
                className="w-full border-2 border-neutral-950 font-mono text-xs font-black p-2 bg-white focus:outline-none uppercase cursor-pointer"
              >
                <option value="pending">PENDING (IN VETTING)</option>
                <option value="approved">APPROVED (PASS CATALOG)</option>
                <option value="rejected">REJECTED</option>
                <option value="revoked">REVOKED</option>
              </select>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-2 pt-2">
              <button
                onClick={async () => {
                  const updates = {
                    phase_1_quiz_passed: true,
                    phase_2_interview_scheduled: true,
                    phase_2_interview_passed: true,
                    phase_3_fee_paid: true,
                    phase_4_portfolio_submitted: true,
                    vetting_status: 'approved'
                  };
                  setSelectedTalentModal((prev: any) => ({ ...prev, ...updates }));
                  await updateTalentStatus(selectedTalentModal.id, updates);
                  setSelectedTalentModal(null);
                }}
                className="flex-1 bg-[#00A86B] hover:bg-emerald-800 text-white font-black py-3 px-4 rounded-none text-xs uppercase tracking-widest transition cursor-pointer border-2 border-[#00A86B] text-center"
              >
                APPROVE ALL PHASES
              </button>
              <button
                onClick={async () => {
                  const updates = { vetting_status: 'revoked' };
                  setSelectedTalentModal((prev: any) => ({ ...prev, ...updates }));
                  await updateTalentStatus(selectedTalentModal.id, updates);
                  setSelectedTalentModal(null);
                }}
                className="flex-1 bg-rose-700 hover:bg-rose-800 text-white font-black py-3 px-4 rounded-none text-xs uppercase tracking-widest transition cursor-pointer border-2 border-rose-700 text-center"
              >
                REVOKE ACCESS
              </button>
            </div>

            <button 
              onClick={() => setSelectedTalentModal(null)}
              className="w-full bg-neutral-950 hover:bg-neutral-900 text-white font-black py-3.5 px-6 rounded-none text-xs uppercase tracking-widest transition cursor-pointer text-center border-2 border-neutral-950 mt-2"
            >
              SAVE & CLOSE
            </button>

          </div>
        </div>
      )}

    </div>
  );
}
