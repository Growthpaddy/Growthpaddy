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
  Sparkles
} from 'lucide-react';

interface TalentDashboardProps {
  isTalentPaid?: boolean;
  setIsTalentPaid?: React.Dispatch<React.SetStateAction<boolean>>;
  navigateToPage?: (page: 'home' | 'directory' | 'employer' | 'talent' | 'assessment' | 'pricing') => void;
  onboardingData?: {
    userName?: string;
    experienceLevel?: 'Fresher' | 'Professional';
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
  
  // Personalization fields fallback
  const userName = onboardingData?.userName || 'Candidate Specialist';
  const experienceTier = onboardingData?.experienceLevel || 'Professional';
  const specialty = onboardingData?.specialty || 'AI Automation';

  // 4-Phase Navigation state
  const [activePhase, setActivePhase] = useState<1 | 2 | 3 | 4>(1);

  // Vetting Completed Flags (simulation)
  const [quizScore, setQuizScore] = useState<number | null>(null);
  const [quizFinished, setQuizFinished] = useState(false);
  const [interviewBooked, setInterviewBooked] = useState(false);
  const [bookedSlot, setBookedSlot] = useState<{date: string, time: string} | null>(null);
  const [dossierSubmitted, setDossierSubmitted] = useState(false);

  // Phase 1 Quiz State
  const activeQuestions = experienceTier === 'Professional' ? PROFESSIONAL_QUESTIONS : FRESHER_QUESTIONS;
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
            // Time out quiz
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

  const handleFinishQuiz = () => {
    setQuizActive(false);
    setQuizFinished(true);
    
    // Compute Score
    let correct = 0;
    activeQuestions.forEach((q, idx) => {
      if (quizAnswers[idx] === q.correctIdx) correct++;
    });
    setQuizScore(Math.round((correct / activeQuestions.length) * 100));
  };

  // Phase 2: Booking slots data
  const calendarDays = [
    { dayName: 'Mon', dateNum: '20', fullDate: 'July 20, 2026' },
    { dayName: 'Tue', dateNum: '21', fullDate: 'July 21, 2026' },
    { dayName: 'Wed', dateNum: '22', fullDate: 'July 22, 2026' },
    { dayName: 'Thu', dateNum: '23', fullDate: 'July 23, 2026' },
    { dayName: 'Fri', dateNum: '24', fullDate: 'July 24, 2026' }
  ];
  const timeSlots = ['09:00 AM', '11:30 AM', '02:00 PM', '04:30 PM'];
  const [selectedDayIdx, setSelectedDayIdx] = useState(0);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState('');

  const handleBookInterview = () => {
    if (!selectedTimeSlot) return;
    setBookedSlot({
      date: calendarDays[selectedDayIdx].fullDate,
      time: selectedTimeSlot
    });
    setInterviewBooked(true);
  };

  // Phase 3: Stripe simulation payment form
  const [cardDetails, setCardDetails] = useState({ cardNo: '', exp: '', cvc: '', name: '' });
  const [payingState, setPayingState] = useState(false);

  const handlePayCommitment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!cardDetails.cardNo || !cardDetails.exp || !cardDetails.cvc) return;
    setPayingState(true);
    setTimeout(() => {
      setPayingState(false);
      if (setIsTalentPaid) {
        setIsTalentPaid(true);
      }
      setActivePhase(4); // auto progress to build portfolio
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
    setTimeout(() => {
      setDossierSubmitted(false);
      alert('Your verified case dossier has been serialized and published to the employer directory successfully!');
    }, 1200);
  };

  // Vetting indicators summary
  const getPhaseStatusBadge = (phaseNum: 1 | 2 | 3 | 4) => {
    if (phaseNum === 1) return quizFinished ? 'Passed' : 'Incomplete';
    if (phaseNum === 2) return interviewBooked ? 'Scheduled' : 'Incomplete';
    if (phaseNum === 3) return isTalentPaid ? 'Verified' : 'Incomplete';
    if (phaseNum === 4) return 'Active';
    return 'Incomplete';
  };

  return (
    <div id="talent-vetting-workspace" className="space-y-10 py-10 px-4 sm:px-6 lg:px-8 bg-[#fafbfc]">
      
      {/* Page header with verified badge status */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-6 bg-white p-6 sm:p-8 border-2 border-neutral-200 rounded-none shadow-sm text-left">
        <div className="space-y-2 max-w-xl">
          <div className="flex items-center gap-2">
            <span className="text-[10px] uppercase font-mono font-black tracking-widest text-emerald-700 bg-emerald-50 px-2.5 py-0.5 border border-emerald-300 inline-block">
              SPECIALIST CONSOLE
            </span>
            <span className="text-[10px] uppercase font-mono font-black tracking-widest text-slate-700 bg-slate-50 px-2.5 py-0.5 border border-slate-200 inline-block">
              DIFFICULTY: {experienceTier === 'Professional' ? 'EXPERT PROFESSIONAL' : 'FOUNDATIONAL FRESHER'}
            </span>
          </div>
          <h1 className="font-display font-black text-3xl text-neutral-950 uppercase tracking-tight leading-none pt-1">
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
              {isTalentPaid && quizFinished && interviewBooked ? '100% HIRED READY' : 'IN VETTING PIPELINE'}
            </span>
          </div>
          <div className="grid grid-cols-4 gap-1.5 pt-1.5">
            <div className={`h-1.5 rounded-none ${quizFinished ? 'bg-emerald-500' : 'bg-slate-700'}`} />
            <div className={`h-1.5 rounded-none ${interviewBooked ? 'bg-emerald-500' : 'bg-slate-700'}`} />
            <div className={`h-1.5 rounded-none ${isTalentPaid ? 'bg-emerald-500' : 'bg-slate-700'}`} />
            <div className={`h-1.5 rounded-none ${isTalentPaid ? 'bg-emerald-400/40' : 'bg-slate-700'}`} />
          </div>
          <p className="text-[9.5px] text-slate-400 font-bold uppercase tracking-wider block">
            Specialization Field: <span className="text-white font-black">{specialty}</span>
          </p>
        </div>
      </div>

      {/* 4-PHASE PROGRESS STEPPER WIZARD */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-left">
        {[
          { num: 1, title: 'Phase 1: Scenario Quiz', subtitle: 'Adaptive Assessment', state: getPhaseStatusBadge(1) },
          { num: 2, title: 'Phase 2: Panel Interview', subtitle: 'Schedule Boarding', state: getPhaseStatusBadge(2) },
          { num: 3, title: 'Phase 3: Review Fee', subtitle: 'Platform Accreditation', state: getPhaseStatusBadge(3) },
          { num: 4, title: 'Phase 4: Dossier Builder', subtitle: 'Project Evidence', state: getPhaseStatusBadge(4) }
        ].map((ph) => {
          const isSelected = activePhase === ph.num;
          return (
            <button
              key={ph.num}
              onClick={() => setActivePhase(ph.num as any)}
              className={`p-5 border-2 text-left transition-all relative focus:outline-none cursor-pointer flex flex-col justify-between h-28 rounded-none
                ${isSelected 
                  ? 'border-emerald-600 bg-emerald-50/10 shadow-sm' 
                  : 'border-slate-200 bg-white hover:bg-slate-50/50'}`}
            >
              <div>
                <span className={`text-[8.5px] font-mono font-black uppercase tracking-widest px-2 py-0.5 rounded-none border block w-max
                  ${ph.state === 'Passed' || ph.state === 'Scheduled' || ph.state === 'Verified'
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-300' 
                    : 'bg-slate-50 text-slate-500 border-slate-200'}`}
                >
                  {ph.state}
                </span>
                <h4 className="font-display font-black text-xs text-slate-800 uppercase tracking-tight mt-2">{ph.title}</h4>
              </div>
              <p className="text-[9px] text-slate-400 uppercase tracking-wider font-semibold">{ph.subtitle}</p>
            </button>
          );
        })}
      </div>

      {/* PHASE ACTIVE WORKSPACE PANEL */}
      <div className="bg-white border-2 border-neutral-200 p-6 sm:p-10 text-left rounded-none shadow-sm min-h-[400px]">
        <AnimatePresence mode="wait">
          
          {/* ======================================================== */}
          {/* PHASE 1: THE DYNAMIC QUIZ ENGINE                         */}
          {/* ======================================================== */}
          {activePhase === 1 && (
            <motion.div
              key="phase1"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="space-y-6"
            >
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
                <div className="space-y-1">
                  <span className="text-[9.5px] font-mono font-black text-emerald-700 uppercase bg-emerald-50 px-2 py-0.5 border border-emerald-200">
                    DIFFICULTY PARAMETER: {experienceTier.toUpperCase()} SCENARIO ENGINE
                  </span>
                  <h3 className="font-display font-black text-lg text-slate-900 uppercase">
                    Phase 1: Adaptive Problem-Solving Diagnostic
                  </h3>
                  <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold">
                    You must score 70% or higher to unlock certified badge validation indices.
                  </p>
                </div>

                {quizActive && (
                  <div className="bg-slate-900 text-white font-mono text-sm font-black px-4 py-2 flex items-center gap-2">
                    <Clock className="w-4 h-4 text-emerald-400 animate-spin" />
                    <span>TIME REMAINING: {quizTimer}s</span>
                  </div>
                )}
              </div>

              {/* Quiz content wrapper */}
              {!quizActive && !quizFinished && (
                <div className="p-8 text-center bg-slate-50 border border-slate-200 max-w-xl mx-auto space-y-6">
                  <Award className="w-12 h-12 text-emerald-600 mx-auto" />
                  <div className="space-y-2">
                    <h4 className="text-xs font-black uppercase tracking-wider text-slate-800">READY TO ATTEMPT DIAGNOSTIC SIMULATOR?</h4>
                    <p className="text-[11px] text-slate-500 uppercase leading-relaxed max-w-md mx-auto">
                      This timed test verifies tool mechanics like Webhooks parameters, canonical mapping, and GA4 tag analytics.
                    </p>
                  </div>
                  <button
                    onClick={handleStartQuiz}
                    className="bg-slate-900 hover:bg-slate-800 text-white font-black py-3 px-6 rounded-none text-xs uppercase tracking-widest cursor-pointer transition shadow-[2px_2px_0px_0px_rgba(16,185,129,1)]"
                  >
                    START DYNAMIC DIAGNOSTIC
                  </button>
                </div>
              )}

              {quizActive && !quizFinished && (
                <div className="space-y-6 max-w-2xl">
                  {/* Progress bar */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-[10px] font-mono font-bold text-slate-400">
                      <span>SCENARIO {currentQIdx + 1} of {activeQuestions.length}</span>
                      <span>{Math.round(((currentQIdx + 1) / activeQuestions.length) * 100)}% COMPLETED</span>
                    </div>
                    <div className="w-full bg-slate-100 h-2 border border-slate-200 overflow-hidden">
                      <div 
                        className="bg-emerald-600 h-full transition-all duration-300" 
                        style={{ width: `${((currentQIdx + 1) / activeQuestions.length) * 100}%` }}
                      />
                    </div>
                  </div>

                  {/* Question Prompt */}
                  <div className="p-5 bg-slate-50 border-l-4 border-slate-900">
                    <h4 className="font-display font-bold text-base text-slate-950 uppercase leading-snug">
                      {activeQuestions[currentQIdx].question}
                    </h4>
                  </div>

                  {/* Options */}
                  <div className="space-y-2">
                    {activeQuestions[currentQIdx].options.map((optText, optIdx) => {
                      const isSelected = quizAnswers[currentQIdx] === optIdx;
                      const isCorrect = optIdx === activeQuestions[currentQIdx].correctIdx;

                      let btnStyle = "border-2 border-neutral-200 bg-white text-slate-800 hover:bg-neutral-50";
                      if (showQExplanation) {
                        if (isCorrect) {
                          btnStyle = "border-2 border-emerald-600 bg-emerald-50 text-emerald-950 font-black";
                        } else if (isSelected) {
                          btnStyle = "border-2 border-rose-600 bg-red-50 text-rose-950";
                        } else {
                          btnStyle = "border border-neutral-200 opacity-50 text-neutral-400";
                        }
                      }

                      return (
                        <button
                          key={optIdx}
                          disabled={showQExplanation}
                          onClick={() => handleSelectQuizAnswer(optIdx)}
                          className={`w-full p-4 text-left text-xs uppercase font-semibold tracking-wide cursor-pointer focus:outline-none transition-all ${btnStyle}`}
                        >
                          <div className="flex items-start gap-3">
                            <span className="font-mono bg-slate-900 text-white w-5 h-5 flex items-center justify-center text-[10px] flex-shrink-0">
                              {String.fromCharCode(65 + optIdx)}
                            </span>
                            <span className="leading-normal">{optText}</span>
                          </div>
                        </button>
                      );
                    })}
                  </div>

                  {/* Explanation Block */}
                  {showQExplanation && (
                    <div className="p-4 bg-amber-50/50 border border-amber-300 space-y-1.5">
                      <span className="text-[9px] font-mono text-amber-800 font-extrabold uppercase tracking-wide block">AUDITED EXPLANATION MEMO</span>
                      <p className="text-[10.5px] text-amber-950 uppercase font-bold leading-relaxed tracking-wider">
                        {activeQuestions[currentQIdx].explanation}
                      </p>
                    </div>
                  )}

                  {showQExplanation && (
                    <div className="flex justify-end pt-2">
                      <button
                        onClick={handleNextQuizQuestion}
                        className="bg-slate-900 hover:bg-slate-800 text-white font-black py-3.5 px-6 rounded-none text-xs uppercase tracking-widest flex items-center gap-1.5 cursor-pointer shadow-[2px_2px_0px_0px_rgba(16,185,129,1)]"
                      >
                        <span>{currentQIdx < activeQuestions.length - 1 ? 'CONTINUE DIAGNOSTIC' : 'COMPILE PERFORMANCE MEMO'}</span>
                        <ArrowRight className="w-4 h-4 text-emerald-400" />
                      </button>
                    </div>
                  )}
                </div>
              )}

              {quizFinished && (
                <div className="p-8 text-center bg-emerald-50/20 border border-emerald-300 max-w-xl mx-auto space-y-6">
                  <Award className="w-12 h-12 text-emerald-600 mx-auto" />
                  <div className="space-y-1">
                    <h4 className="text-sm font-black uppercase text-emerald-950">COMPLIANCE DIAGNOSTIC COMPLETED</h4>
                    <p className="text-[10px] font-mono text-neutral-400 uppercase tracking-wider">AGGREGATED SCORE RECORDED</p>
                  </div>

                  <p className="text-4xl font-black font-mono text-slate-900">{quizScore}%</p>

                  <p className="text-xs text-slate-600 uppercase font-bold tracking-wider leading-relaxed max-w-md mx-auto">
                    {quizScore && quizScore >= 70 
                      ? 'Congratulations! You achieved the verification threshold score. Proceed directly to scheduling your panel session.' 
                      : 'You scored below the standard threshold. However, we have saved this run as a practice attempts. Let\'s proceed to next phase!'}
                  </p>

                  <div className="flex gap-3 justify-center pt-2">
                    <button
                      onClick={handleStartQuiz}
                      className="border-2 border-slate-900 text-slate-900 font-black py-2.5 px-5 text-xs uppercase tracking-widest hover:bg-slate-50 cursor-pointer"
                    >
                      Retry Simulator
                    </button>
                    <button
                      onClick={() => setActivePhase(2)}
                      className="bg-emerald-700 hover:bg-emerald-800 text-white font-black py-2.5 px-5 text-xs uppercase tracking-widest cursor-pointer shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                    >
                      Proceed to Phase 2
                    </button>
                  </div>
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
                  <h4 className="font-black text-xs uppercase tracking-wider text-slate-900">PANEL REVIEW BOOKED</h4>
                  <p className="text-xs text-slate-600 uppercase tracking-wider leading-relaxed">
                    Date: <strong className="text-slate-900">{bookedSlot.date}</strong> <br />
                    Time: <strong className="text-slate-900">{bookedSlot.time} (UTC/GMT)</strong>
                  </p>
                  <p className="text-[10px] text-slate-400 font-mono uppercase tracking-widest block pt-2">
                    ZOOM credentials and calendar invites have been routed to your profile coordinates.
                  </p>
                  <button
                    onClick={() => setActivePhase(3)}
                    className="w-full bg-slate-900 hover:bg-slate-800 text-white font-black py-3.5 rounded-none text-xs uppercase tracking-widest cursor-pointer shadow-[2px_2px_0px_0px_rgba(16,185,129,1)]"
                  >
                    Proceed to Phase 3
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
                  
                  {/* Left calendar widget (Width: 6) */}
                  <div className="md:col-span-7 bg-slate-50 border border-slate-200 p-5 space-y-4">
                    <h4 className="text-[10px] uppercase font-mono font-black text-slate-700">1. SELECT AVAILABLE DATE</h4>
                    
                    <div className="grid grid-cols-5 gap-2">
                      {calendarDays.map((day, idx) => {
                        const isSelected = selectedDayIdx === idx;
                        return (
                          <button
                            key={idx}
                            onClick={() => setSelectedDayIdx(idx)}
                            className={`p-3.5 border text-center transition cursor-pointer focus:outline-none rounded-none
                              ${isSelected 
                                ? 'bg-slate-900 text-white border-slate-900' 
                                : 'bg-white text-slate-800 hover:bg-slate-100 border-slate-200'}`}
                          >
                            <span className="text-[9px] font-bold block uppercase font-mono tracking-widest opacity-80">{day.dayName}</span>
                            <span className="text-lg font-mono font-black block mt-1">{day.dateNum}</span>
                          </button>
                        );
                      })}
                    </div>

                    <p className="text-[10px] text-slate-500 uppercase tracking-wider leading-relaxed bg-white p-3 border border-slate-200">
                      ℹ️ Slots represent live panel groups consisting of senior marketing partners in E-Commerce and Digital Operations.
                    </p>
                  </div>

                  {/* Right calendar widget (Width: 5) */}
                  <div className="md:col-span-5 bg-slate-50 border border-slate-200 p-5 space-y-4 flex flex-col justify-between min-h-[220px]">
                    <div>
                      <h4 className="text-[10px] uppercase font-mono font-black text-slate-700">2. CHOOSE TIMESLOT (UTC)</h4>
                      
                      <div className="grid grid-cols-2 gap-2 mt-3">
                        {timeSlots.map((slot) => {
                          const isSel = selectedTimeSlot === slot;
                          return (
                            <button
                              key={slot}
                              onClick={() => setSelectedTimeSlot(slot)}
                              className={`p-2.5 border text-center text-[10.5px] font-mono font-bold transition cursor-pointer focus:outline-none rounded-none
                                ${isSel 
                                  ? 'bg-emerald-600 text-white border-emerald-600' 
                                  : 'bg-white text-slate-800 hover:bg-slate-100 border-slate-200'}`}
                            >
                              {slot}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    <button
                      onClick={handleBookInterview}
                      disabled={!selectedTimeSlot}
                      className="w-full bg-slate-900 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-800 text-white font-black py-3 rounded-none text-xs uppercase tracking-widest cursor-pointer shadow-[2px_2px_0px_0px_rgba(16,185,129,1)] transition-all mt-4"
                    >
                      BOOK PANEL SESSION
                    </button>
                  </div>

                </div>
              )}
            </motion.div>
          )}

          {/* ======================================================== */}
          {/* PHASE 3: SUBSCRIPTION & COMMITMENT FEE                  */}
          {/* ======================================================== */}
          {activePhase === 3 && (
            <motion.div
              key="phase3"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="space-y-6"
            >
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
                  <p className="text-xs text-slate-600 uppercase tracking-wider leading-relaxed">
                    Your $45 onboarding pass is authorized securely. Your certified project profile features the "VERIFIED PROFESSIONAL" badge permanently.
                  </p>
                  <button
                    onClick={() => setActivePhase(4)}
                    className="w-full bg-slate-900 hover:bg-slate-800 text-white font-black py-3.5 rounded-none text-xs uppercase tracking-widest cursor-pointer shadow-[2px_2px_0px_0px_rgba(16,185,129,1)]"
                  >
                    Build Project Dossier Dossier
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                  
                  {/* Left Column - cost breakdown (Width: 6) */}
                  <div className="lg:col-span-6 bg-slate-50 border border-slate-200 p-5 sm:p-6 space-y-5">
                    <span className="text-[9px] font-mono font-black text-emerald-700 uppercase tracking-widest block">COST STRUCTURE TRANSPARENCY</span>
                    
                    <div className="space-y-3 font-semibold uppercase tracking-wider text-xs">
                      
                      <div className="flex justify-between border-b border-slate-200 pb-2">
                        <span className="text-slate-500">Accreditation Pass Fee</span>
                        <span className="text-slate-900 font-mono font-black">$45.00</span>
                      </div>
                      
                      <div className="flex justify-between border-b border-slate-200 pb-2">
                        <span className="text-slate-500">Security & Anti-Cheat Validation</span>
                        <span className="text-emerald-700 font-mono font-black">INCLUDED</span>
                      </div>

                      <div className="flex justify-between border-b border-slate-200 pb-2">
                        <span className="text-slate-500">Dossier Serialization</span>
                        <span className="text-emerald-700 font-mono font-black">INCLUDED</span>
                      </div>

                      <div className="flex justify-between pt-2">
                        <span className="text-slate-800 font-black">TOTAL ONE-TIME</span>
                        <span className="text-slate-950 font-mono text-xl font-black">$45.00</span>
                      </div>

                    </div>

                    <div className="bg-amber-50/50 border border-amber-300 p-3.5 space-y-1 text-[10.5px] uppercase font-bold text-amber-900 leading-normal">
                      <span className="block font-mono font-black text-[9px] tracking-wider">⚠️ THE COST OF DISREGARDING VERIFICATION:</span>
                      Unverified profiles are locked in automated global resumes pipelines with low discovery rates, dragging down your Remote career timeline indefinitely.
                    </div>
                  </div>

                  {/* Right Column - payment checkout (Width: 6) */}
                  <div className="lg:col-span-6 bg-slate-50 border border-slate-200 p-5 sm:p-6">
                    <form onSubmit={handlePayCommitment} className="space-y-4 text-xs font-mono">
                      <span className="text-[9px] font-mono font-black text-slate-500 uppercase tracking-widest block">SECURE CREDIT CARD GATEWAY</span>
                      
                      <div className="space-y-1">
                        <label className="text-[9px] text-slate-400 font-extrabold uppercase tracking-wider block">Credit Card Number</label>
                        <input
                          type="text"
                          required
                          placeholder="4242 4242 4242 4242"
                          maxLength={19}
                          value={cardDetails.cardNo}
                          onChange={(e) => setCardDetails({ ...cardDetails, cardNo: e.target.value })}
                          className="w-full bg-white border border-slate-300 py-2 px-3 text-slate-900 font-bold focus:outline-none"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <label className="text-[9px] text-slate-400 font-extrabold uppercase tracking-wider block">Exp Date</label>
                          <input
                            type="text"
                            required
                            placeholder="MM/YY"
                            maxLength={5}
                            value={cardDetails.exp}
                            onChange={(e) => setCardDetails({ ...cardDetails, exp: e.target.value })}
                            className="w-full bg-white border border-slate-300 py-2 px-3 text-slate-900 font-bold focus:outline-none"
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
                            className="w-full bg-white border border-slate-300 py-2 px-3 text-slate-900 font-bold focus:outline-none"
                          />
                        </div>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[9px] text-slate-400 font-extrabold uppercase tracking-wider block">Name on Card</label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. John Doe"
                          value={cardDetails.name}
                          onChange={(e) => setCardDetails({ ...cardDetails, name: e.target.value })}
                          className="w-full bg-white border border-slate-300 py-2 px-3 text-slate-900 font-bold focus:outline-none uppercase"
                        />
                      </div>

                      <button
                        type="submit"
                        disabled={payingState}
                        className="w-full bg-[#033c2a] hover:bg-emerald-950 text-white font-black py-4 rounded-none text-xs uppercase tracking-widest cursor-pointer shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:shadow-none transition-all duration-150"
                      >
                        {payingState ? 'Processing Ledger Security...' : 'AUTHORIZE VERIFICATION ACCREDITATION ($45)'}
                      </button>
                    </form>
                  </div>

                </div>
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
                <div className="p-6 bg-rose-50 border border-rose-300 space-y-3 text-rose-950">
                  <span className="text-[9px] font-mono font-black uppercase tracking-widest block">⛔ ACCESS PRIVILEGE CONSTRAINED:</span>
                  <p className="text-xs font-bold uppercase tracking-wider leading-relaxed">
                    You must authorize your Onboarding Verification Pass (Phase 3) first prior to compiling your public folder parameters for employers.
                  </p>
                  <button
                    onClick={() => setActivePhase(3)}
                    className="bg-rose-900 hover:bg-rose-950 text-white font-black py-2.5 px-4 rounded-none text-[10px] uppercase tracking-widest cursor-pointer"
                  >
                    Go to Phase 3
                  </button>
                </div>
              )}

              {isTalentPaid && (
                <form onSubmit={handleSaveDossier} className="space-y-5 max-w-3xl">
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    
                    <div className="space-y-1">
                      <label className="text-[9px] text-slate-400 font-extrabold uppercase tracking-wider block">CHAMPION PROJECT TITLE</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Programmatic SEO scale optimization"
                        value={portfolioData.title}
                        onChange={(e) => setPortfolioData({ ...portfolioData, title: e.target.value })}
                        className="w-full border border-slate-300 py-2.5 px-4 text-xs font-bold text-slate-900 focus:outline-none"
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
                        className="w-full border border-slate-300 py-2.5 px-4 text-xs font-bold text-slate-900 focus:outline-none"
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
                      className="w-full border border-slate-300 py-2.5 px-4 text-xs font-bold text-slate-900 focus:outline-none"
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
                      className="w-full border border-slate-300 py-2.5 px-4 text-xs font-bold text-slate-900 focus:outline-none"
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
                    className="bg-slate-900 hover:bg-slate-800 text-white font-black py-4 px-6 rounded-none text-xs uppercase tracking-widest cursor-pointer shadow-[3px_3px_0px_0px_rgba(16,185,129,1)] hover:shadow-none transition-all duration-155"
                  >
                    SERIALIZE VERIFIED DOSSIER
                  </button>

                </form>
              )}

            </motion.div>
          )}

        </AnimatePresence>
      </div>

    </div>
  );
}
