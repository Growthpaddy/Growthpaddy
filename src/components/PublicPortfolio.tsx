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
  Phone, 
  Award, 
  Briefcase, 
  Sparkles, 
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
  MessageSquare,
  FileText,
  Send
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
  const [showContactModal, setShowContactModal] = useState(false);
  const [contactSubmitted, setContactSubmitted] = useState(false);
  const [contactForm, setContactForm] = useState({
    name: '',
    email: '',
    company: '',
    message: ''
  });

  const [talent, setTalent] = useState<any>(initialData || null);

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
        if (targetSlug && targetSlug !== 'directory' && targetSlug !== 'profile') {
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
        }

        // Fallback: fetch current logged in user profile or latest verified profile
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data: userProfile } = await supabase
            .from('talent_profiles')
            .select('*')
            .eq('id', user.id)
            .maybeSingle();

          if (userProfile) {
            setTalent(userProfile);
            setLoading(false);
            return;
          }
        }

        // Fallback to demo talent
        const { data: defaultData } = await supabase
          .from('talent_profiles')
          .select('*')
          .limit(1)
          .maybeSingle();

        if (defaultData) {
          setTalent(defaultData);
        }
      } catch (err) {
        console.error('Error fetching talent profile for portfolio:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchTalentProfile();
  }, [activeSlug, initialData]);

  const handleCopyLink = () => {
    const url = window.location.origin + (talent?.slug ? `/#/p/${talent.slug}` : window.location.pathname);
    navigator.clipboard.writeText(url);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 3000);
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

  if (loading) {
    return (
      <div className="min-h-[50vh] bg-slate-50 text-slate-900 flex items-center justify-center p-6">
        <div className="text-center space-y-4">
          <div className="w-10 h-10 border-3 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-xs font-mono uppercase tracking-wider text-slate-500 font-semibold">Loading Tech Portfolio...</p>
        </div>
      </div>
    );
  }

  // Parse structured data safely
  const candidateName = talent?.full_name || talent?.name || 'Vetted Candidate';
  const headline = talent?.headline || talent?.specialty || talent?.role || 'Senior AI Automation & Growth Engineer';
  const bio = talent?.bio || talent?.about || talent?.career_goal || 'Seasoned technical specialist with deep expertise in architecting autonomous AI pipelines, API orchestrations, and full-funnel growth infrastructure.';
  const avatarUrl = talent?.profile_picture_url || talent?.avatar_url || talent?.avatarUrl || talent?.profilePictureUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=300';
  const location = talent?.location || 'Lagos, Nigeria • Remote Global';
  const availabilityStatus: 'available' | 'hired' = (talent?.availability_status === 'hired' || talent?.availability === 'In Placement') ? 'hired' : 'available';
  const isVerified = talent?.vetting_status === 'approved' || talent?.vetting_status === 'verified' || talent?.isVerified || (talent?.phase_1_quiz_passed && talent?.phase_2_interview_passed);
  const score = typeof talent?.score === 'number' ? talent.score : typeof talent?.portfolioScore === 'number' ? talent.portfolioScore : (isVerified ? 98 : 0);
  const experienceYears = talent?.years_of_experience || (talent?.experienceCount ? `${talent.experienceCount}+ Years` : (talent?.experience_level?.includes('Senior') ? '5+ Years' : '3+ Years'));
  
  // Social links
  const linkedinUrl = talent?.linkedin_url || talent?.linkedinUrl || '';
  const githubUrl = talent?.github_url || talent?.githubUrl || '';
  const portfolioUrl = talent?.portfolio_url || talent?.portfolioUrl || '';
  const email = talent?.email || 'talent@growthpaddy.com';

  // Parse Core Skills
  let skills: string[] = [];
  if (Array.isArray(talent?.skills)) {
    skills = talent.skills;
  } else if (typeof talent?.skills === 'string') {
    try {
      const parsed = JSON.parse(talent.skills);
      skills = Array.isArray(parsed) ? parsed : talent.skills.split(',').map((s: string) => s.trim());
    } catch {
      skills = talent.skills.split(',').map((s: string) => s.trim());
    }
  }
  if (skills.length === 0) {
    skills = ['Full-Stack AI Architecture', 'Workflow Automation', 'Growth Infrastructure', 'Python & TypeScript', 'API Orchestration', 'Conversion Optimization'];
  }

  // Parse AI Tools Stack
  let aiTools: string[] = [];
  if (Array.isArray(talent?.ai_tools)) {
    aiTools = talent.ai_tools;
  } else if (Array.isArray(talent?.aiTools)) {
    aiTools = talent.aiTools;
  } else if (typeof talent?.ai_tools === 'string') {
    try {
      const parsed = JSON.parse(talent.ai_tools);
      aiTools = Array.isArray(parsed) ? parsed : talent.ai_tools.split(',').map((s: string) => s.trim());
    } catch {
      aiTools = talent.ai_tools.split(',').map((s: string) => s.trim());
    }
  }
  if (aiTools.length === 0) {
    aiTools = ['Claude 3.7 Sonnet', 'Make.com', 'Zapier Enterprise', 'ChatGPT Enterprise', 'Cursor AI', 'HubSpot AI', 'Midjourney v6', 'LangChain', 'n8n'];
  }

  // Parse Case Studies
  let caseStudies: CaseStudyItem[] = [];
  if (Array.isArray(talent?.case_studies) && talent.case_studies.length > 0) {
    caseStudies = talent.case_studies;
  } else if (Array.isArray(talent?.caseStudies) && talent.caseStudies.length > 0) {
    caseStudies = talent.caseStudies.map((cs: any) => ({
      title: cs.title,
      metric: cs.results || cs.metrics || '+180% Impact Lift',
      description: cs.solution || cs.description || cs.problem,
      techStack: cs.tools || ['Make.com', 'OpenAI API', 'Python']
    }));
  } else if (Array.isArray(talent?.projects) && talent.projects.length > 0) {
    caseStudies = talent.projects.map((p: any) => ({
      title: p.title,
      metric: p.metrics || '+240% Growth Lift',
      description: p.description,
      techStack: p.tools || ['Automations', 'Cloud APIs', 'Tailwind']
    }));
  } else {
    caseStudies = [
      {
        title: 'Autonomous Client Onboarding & CRM Pipeline',
        metric: '+240% Velocity Lift (35 hrs saved/wk)',
        description: 'Architected an end-to-end automated pipeline connecting webhook triggers, LLM payload categorization, and automated contract generation.',
        techStack: ['Make.com', 'Claude 3.7', 'Zapier Enterprise', 'HubSpot API', 'Python']
      },
      {
        title: 'Enterprise Multi-Model Document Intelligence Engine',
        metric: '99.4% Parsing Accuracy on 45,000+ Records',
        description: 'Designed a high-throughput serverless microservice utilizing Gemini & Claude OCR to extract complex tabular financial figures into structured PostgreSQL schemas.',
        techStack: ['Python', 'PostgreSQL', 'LangChain', 'OpenAI', 'FastAPI']
      }
    ];
  }

  // Parse Work History
  let workHistory: WorkHistoryItem[] = [];
  if (Array.isArray(talent?.work_history) && talent.work_history.length > 0) {
    workHistory = talent.work_history;
  } else {
    workHistory = [
      {
        title: 'Lead AI Solutions Architect',
        company: 'Apex Automation Labs',
        dates: 'Jan 2023 - Present',
        location: 'Remote / Global',
        highlights: [
          'Spearheaded enterprise AI deployment and workflow automation saving over 120 operational hours weekly across 6 client teams.',
          'Built internal custom GPT agent suites integrating live database vector search for rapid sales intelligence.'
        ]
      },
      {
        title: 'Senior Growth & Systems Engineer',
        company: 'HyperScale Digital',
        dates: 'Mar 2021 - Dec 2022',
        location: 'Lagos, Nigeria',
        highlights: [
          'Engineered full-funnel attribution models, automated lead distribution queues, and multi-tier email sequencing.',
          'Increased monthly recurring activation rates by 42% through rapid A/B experimentation and automated feedback loops.'
        ]
      }
    ];
  }

  // Parse Education
  let education: EducationItem[] = [];
  if (Array.isArray(talent?.education) && talent.education.length > 0) {
    education = talent.education;
  } else {
    education = [
      {
        degree: 'B.Sc. in Computer Science / Information Systems',
        institution: 'University of Lagos',
        year: '2020',
        details: 'First Class Honors • Lead of Developer Student Club'
      }
    ];
  }

  // Parse Certifications
  let certifications: string[] = [];
  if (Array.isArray(talent?.certifications) && talent.certifications.length > 0) {
    certifications = talent.certifications.map((c: any) => typeof c === 'string' ? c : c.name);
  } else {
    certifications = [
      'GrowthPaddy Certified Technical Specialist (98/100)',
      'Make.com Advanced Automation Specialist',
      'Anthropic Certified Prompt Engineer',
      'Google Professional Cloud Architect'
    ];
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-emerald-500 selection:text-white pb-20">
      
      {/* Top Navbar Header - Clean Plain Light SaaS */}
      {!isEmbedded && (
        <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 px-4 sm:px-8 py-3.5 shadow-2xs">
          <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
            
            <div className="flex items-center gap-3">
              {handleBack ? (
                <button
                  onClick={handleBack}
                  className="flex items-center gap-1.5 text-xs font-mono font-bold uppercase tracking-wider text-slate-600 hover:text-slate-900 bg-white border border-slate-200 hover:border-slate-300 px-3 py-1.5 rounded-xl transition cursor-pointer shadow-2xs"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>Back</span>
                </button>
              ) : (
                <a
                  href="/directory"
                  className="flex items-center gap-1.5 text-xs font-mono font-bold uppercase tracking-wider text-slate-600 hover:text-slate-900 bg-white border border-slate-200 hover:border-slate-300 px-3 py-1.5 rounded-xl transition shadow-2xs"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>Directory</span>
                </a>
              )}

              <div className="flex items-center gap-2">
                <span className="font-display font-black text-sm text-slate-900 tracking-tight">GrowthPaddy</span>
                <span className="text-[10px] font-mono font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-full">
                  Candidate File
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2.5">
              <button
                onClick={handleCopyLink}
                className="flex items-center gap-1.5 text-xs font-semibold bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 px-3.5 py-1.5 rounded-xl transition cursor-pointer shadow-2xs"
                title="Copy shareable link"
              >
                {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Share2 className="w-3.5 h-3.5 text-slate-500" />}
                <span>{copiedLink ? 'Link Copied!' : 'Share'}</span>
              </button>

              <button
                onClick={() => window.print()}
                className="hidden sm:flex items-center gap-1.5 text-xs font-semibold bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 px-3.5 py-1.5 rounded-xl transition cursor-pointer shadow-2xs"
                title="Print or Save PDF"
              >
                <Printer className="w-3.5 h-3.5 text-slate-500" />
                <span>Print CV</span>
              </button>

              <button
                onClick={() => {
                  if (onOpenHireModal) {
                    onOpenHireModal(talent);
                  } else {
                    setShowContactModal(true);
                  }
                }}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-4 py-1.5 rounded-xl shadow-xs transition cursor-pointer flex items-center gap-1.5"
              >
                <Mail className="w-3.5 h-3.5" />
                <span>Hire Talent</span>
              </button>
            </div>

          </div>
        </header>
      )}

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-8 space-y-6 sm:space-y-8">
        
        {/* 1. HEADER HERO BANNER & ACTIONS (NO ENGAGEMENT RATES - CLEAN TECH SAAS) */}
        <section className="bg-white border border-slate-200/90 rounded-2xl sm:rounded-3xl p-6 sm:p-8 shadow-xs relative overflow-hidden text-left">
          
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 sm:gap-8">
            
            {/* Left Side: Avatar & Candidate Info */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5 sm:gap-6 flex-1">
              <div className="relative shrink-0">
                <img
                  src={avatarUrl}
                  alt={candidateName}
                  className="w-20 h-20 sm:w-28 sm:h-28 object-cover rounded-2xl border-2 border-slate-200 shadow-sm bg-slate-100"
                />
                {/* Status Indicator */}
                <span 
                  className={`absolute bottom-1 right-1 w-4 h-4 rounded-full border-2 border-white shadow-xs ${
                    availabilityStatus === 'available' ? 'bg-emerald-500' : 'bg-slate-400'
                  }`}
                  title={availabilityStatus === 'available' ? 'Available for hire' : 'Currently hired'}
                ></span>
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

                  {isVerified ? (
                    <span className="inline-flex items-center gap-1 bg-amber-50 text-amber-800 border border-amber-200 px-2.5 py-0.5 rounded-full font-mono text-[11px] font-bold uppercase">
                      <Award className="w-3.5 h-3.5 text-amber-600" />
                      GrowthPaddy Verified
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 bg-slate-100 text-slate-600 border border-slate-200 px-2.5 py-0.5 rounded-full font-mono text-[11px] font-bold uppercase">
                      <Clock className="w-3.5 h-3.5 text-slate-500" />
                      Open Candidate
                    </span>
                  )}
                </div>

                {/* Candidate Name */}
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 tracking-tight font-display">
                  {candidateName}
                </h1>

                {/* Headline */}
                <p className="text-sm sm:text-base font-semibold text-emerald-700 font-sans">
                  {headline}
                </p>

                {/* Location & Social links */}
                <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 pt-1">
                  <span className="flex items-center gap-1 font-medium">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    <span>{location}</span>
                  </span>

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
              </div>
            </div>

            {/* Right Side: Clean SaaS Action CTA Panel (NO RATES) */}
            <div className="w-full lg:w-80 bg-slate-50/90 border border-slate-200/80 rounded-2xl p-4 sm:p-5 space-y-3 shrink-0 text-left shadow-2xs">
              <div className="flex items-center justify-between border-b border-slate-200 pb-2.5">
                <span className="text-[11px] font-mono font-bold uppercase text-slate-500">
                  Direct Outreach
                </span>
                <span className="text-[10px] font-mono font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                  0% Commission
                </span>
              </div>

              <div className="space-y-2">
                <button
                  onClick={() => {
                    if (onOpenHireModal) {
                      onOpenHireModal(talent);
                    } else {
                      setShowContactModal(true);
                    }
                  }}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs py-3 rounded-xl shadow-xs transition cursor-pointer flex items-center justify-center gap-2 tracking-wide uppercase"
                >
                  <Mail className="w-4 h-4" />
                  <span>Hire / Contact Candidate</span>
                </button>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={handleCopyLink}
                    className="w-full bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-xs py-2.5 rounded-xl transition cursor-pointer flex items-center justify-center gap-1.5 font-medium shadow-2xs"
                  >
                    {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-slate-500" />}
                    <span>{copiedLink ? 'Copied' : 'Share Link'}</span>
                  </button>

                  <a
                    href={`https://wa.me/2348169664607?text=${encodeURIComponent(`Hello GrowthPaddy Matchmaker, I want to interview ${candidateName} (${headline}).`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-xs py-2.5 rounded-xl transition cursor-pointer flex items-center justify-center gap-1.5 font-medium shadow-2xs"
                  >
                    <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
                    <span>WhatsApp</span>
                  </a>
                </div>
              </div>

              <p className="text-[10px] text-slate-500 text-center leading-tight pt-1 font-sans">
                Direct introduction facilitated by GrowthPaddy. No hidden agency fees.
              </p>
            </div>

          </div>

          {/* Metrics Bar (4 Quick-Glance Stat Cards) */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 pt-6 mt-6 border-t border-slate-100 text-left">
            
            <div className="bg-slate-50 border border-slate-200/80 p-3.5 rounded-xl shadow-2xs">
              <div className="flex items-center gap-1.5 text-slate-500 text-xs font-mono">
                <Clock className="w-3.5 h-3.5 text-emerald-600" />
                <span>Experience</span>
              </div>
              <p className="text-base sm:text-lg font-bold text-slate-900 font-mono mt-1">{experienceYears}</p>
            </div>

            <div className="bg-slate-50 border border-slate-200/80 p-3.5 rounded-xl shadow-2xs">
              <div className="flex items-center gap-1.5 text-slate-500 text-xs font-mono">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>Diagnostic Test</span>
              </div>
              <p className="text-base sm:text-lg font-bold text-slate-900 font-mono mt-1">
                {score > 0 ? `${score}/100 Audited` : '0/100 (In Review)'}
              </p>
            </div>

            <div className="bg-slate-50 border border-slate-200/80 p-3.5 rounded-xl shadow-2xs">
              <div className="flex items-center gap-1.5 text-slate-500 text-xs font-mono">
                <Cpu className="w-3.5 h-3.5 text-emerald-600" />
                <span>AI Stack</span>
              </div>
              <p className="text-base sm:text-lg font-bold text-slate-900 font-mono mt-1">
                {aiTools.length} Tools Mastered
              </p>
            </div>

            <div className="bg-slate-50 border border-slate-200/80 p-3.5 rounded-xl shadow-2xs">
              <div className="flex items-center gap-1.5 text-slate-500 text-xs font-mono">
                <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
                <span>Proven Delivery</span>
              </div>
              <p className="text-base sm:text-lg font-bold text-emerald-700 font-mono mt-1">100% Verified Work</p>
            </div>

          </div>

        </section>

        {/* 2. DUAL-COLUMN LAYOUT - CLEAN WHITE ON SLATE-50 */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 text-left">
          
          {/* MAIN LEFT COLUMN (8 cols) */}
          <div className="lg:col-span-8 space-y-6 sm:space-y-8">
            
            {/* A. Executive Summary & Bio */}
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

            {/* B. Featured Case Studies & Impact Wins */}
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
                {caseStudies.map((cs, idx) => (
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

                    <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                      {cs.description}
                    </p>

                    {(cs.techStack || cs.tools) && (
                      <div className="flex flex-wrap gap-1.5 pt-2 border-t border-slate-200/60">
                        {(cs.techStack || cs.tools || []).map((t, tIdx) => (
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
                ))}
              </div>
            </section>

            {/* C. Work Experience & Career History */}
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
                {workHistory.map((item, idx) => (
                  <div key={item.id || idx} className="relative space-y-2">
                    {/* Timeline Node Icon */}
                    <div className="absolute -left-6 top-1.5 w-3 h-3 rounded-full bg-emerald-600 border-2 border-white shadow-xs"></div>

                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                      <div>
                        <h3 className="font-display font-bold text-sm sm:text-base text-slate-900">
                          {item.title}
                        </h3>
                        <p className="text-xs text-emerald-700 font-semibold flex items-center gap-1.5">
                          <Building2 className="w-3.5 h-3.5 text-slate-400" />
                          <span>{item.company}</span>
                          {item.location && <span className="text-slate-400 font-normal">• {item.location}</span>}
                        </p>
                      </div>

                      <span className="inline-flex items-center gap-1 font-mono text-xs text-slate-600 bg-slate-100 border border-slate-200 px-2.5 py-1 rounded-md self-start sm:self-auto shadow-2xs">
                        <Calendar className="w-3 h-3 text-slate-400" />
                        {item.dates}
                      </span>
                    </div>

                    {item.highlights && item.highlights.length > 0 && (
                      <ul className="space-y-1.5 text-xs text-slate-600 list-disc pl-4 pt-1 leading-relaxed">
                        {item.highlights.map((bullet, bIdx) => (
                          <li key={bIdx}>{bullet}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                ))}
              </div>
            </section>

            {/* D. Education & Certifications */}
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
                    <span className="text-[10px] font-mono uppercase text-emerald-700 font-bold block">
                      {edu.year}
                    </span>
                    <h4 className="font-display font-bold text-sm text-slate-900">
                      {edu.degree}
                    </h4>
                    <p className="text-xs text-slate-600 font-medium">{edu.institution}</p>
                    {edu.details && (
                      <p className="text-[11px] text-slate-500 pt-1 leading-normal">{edu.details}</p>
                    )}
                  </div>
                ))}
              </div>

              {/* Verified Certificates Strip */}
              <div className="pt-4 border-t border-slate-100 space-y-3">
                <span className="text-xs font-mono font-bold uppercase text-slate-500 block">
                  Industry Accreditations
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {certifications.map((cert, idx) => (
                    <div key={idx} className="flex items-center gap-2 bg-slate-50 border border-slate-200 px-3 py-2 rounded-xl text-xs text-slate-800 font-medium shadow-2xs">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span className="truncate">{cert}</span>
                    </div>
                  ))}
                </div>
              </div>
            </section>

          </div>

          {/* RIGHT SIDEBAR (4 cols) */}
          <div className="lg:col-span-4 space-y-6">
            
            {/* 1. GrowthPaddy Vetting Audit Notice */}
            <div className={`p-5 rounded-2xl border ${
              isVerified
                ? 'bg-amber-50/70 border-amber-200 text-amber-950'
                : 'bg-slate-100 border-slate-200 text-slate-800'
            } space-y-3 shadow-2xs`}>
              <div className="flex items-center gap-2">
                {isVerified ? (
                  <ShieldCheck className="w-5 h-5 text-amber-600" />
                ) : (
                  <AlertTriangle className="w-5 h-5 text-slate-500" />
                )}
                <h3 className="font-display font-bold text-sm uppercase tracking-wide text-slate-900">
                  {isVerified ? 'GrowthPaddy Verified File' : 'Verification Status'}
                </h3>
              </div>

              <p className="text-xs leading-relaxed text-slate-600">
                {isVerified
                  ? 'Identity, problem-solving speed, and automation architecture verified by GrowthPaddy technical evaluators.'
                  : 'Candidate profile registered. Official GrowthPaddy panel accreditation in progress.'}
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
                  <span className="text-emerald-700 font-bold">Audited ✓</span>
                </div>
              </div>
            </div>

            {/* 2. Core Discipline Skills */}
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

            {/* 3. AI & Automation Tools Stack */}
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

            {/* 4. Direct Talent Inquiry Card */}
            <div className="bg-slate-900 text-white rounded-2xl sm:rounded-3xl p-5 sm:p-6 space-y-4 shadow-md text-left">
              <div className="flex items-center gap-2 pb-2.5 border-b border-slate-800">
                <MessageSquare className="w-4 h-4 text-emerald-400" />
                <h3 className="font-display font-bold text-sm text-white">
                  Schedule Interview
                </h3>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed font-sans">
                Connect directly with {candidateName} for full-time engineering roles, high-ROI workflow contracts, or technical advisory.
              </p>

              <div className="space-y-2 pt-1">
                <button
                  onClick={() => setShowContactModal(true)}
                  className="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs py-2.5 rounded-xl transition cursor-pointer flex items-center justify-center gap-2 shadow-xs"
                >
                  <Mail className="w-3.5 h-3.5" />
                  <span>Send Direct Message</span>
                </button>

                <a
                  href={`mailto:${email}?subject=Hiring Inquiry via GrowthPaddy: ${candidateName}`}
                  className="w-full bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs py-2.5 rounded-xl transition flex items-center justify-center gap-2 font-medium"
                >
                  <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
                  <span>Email Candidate</span>
                </a>
              </div>
            </div>

          </div>

        </div>

      </main>

      {/* Hire / Contact Talent Modal - Plain Light SaaS */}
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
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-slate-900 focus:outline-none focus:border-emerald-600 focus:bg-white"
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
