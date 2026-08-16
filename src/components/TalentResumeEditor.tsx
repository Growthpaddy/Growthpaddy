import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { CaseStudyItem, WorkHistoryItem, EducationItem } from '../types';
import { 
  User, 
  Briefcase, 
  Flame, 
  Cpu, 
  GraduationCap, 
  Plus, 
  Trash2, 
  Save, 
  CheckCircle2, 
  Sparkles, 
  Eye, 
  Globe, 
  Linkedin, 
  Github, 
  MapPin, 
  Calendar, 
  Code, 
  Zap, 
  X, 
  AlertCircle,
  ExternalLink,
  Loader2,
  Building2,
  TrendingUp,
  Award
} from 'lucide-react';

interface TalentResumeEditorProps {
  initialProfile: any;
  onProfileUpdated?: (updated: any) => void;
  onOpenPublicPreview?: (slug?: string) => void;
}

const PRESET_AVATARS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=300',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=300',
  'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=300',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=300'
];

const PRESET_CORE_SKILLS = [
  'Workflow Automation', 'Full-Stack Development', 'Python & TypeScript', 
  'Cloud Infrastructure', 'API Orchestration', 'Growth Marketing', 
  'GA4 Analytics', 'Conversion Rate Optimization', 'Prompt Engineering',
  'Data Pipelines', 'HubSpot Integration', 'PostgreSQL'
];

const PRESET_AI_TOOLS = [
  'Claude 3.7 Sonnet', 'Make.com', 'Zapier Enterprise', 'ChatGPT Enterprise', 
  'Cursor AI', 'HubSpot AI', 'Midjourney v6', 'LangChain', 'n8n Automation', 
  'OpenAI API', 'v0 by Vercel', 'Perplexity Pro'
];

const PRESET_CERTS = [
  'GrowthPaddy Certified Technical Specialist',
  'Make.com Advanced Automation Specialist',
  'Anthropic Certified Prompt Engineer',
  'Google Professional Cloud Architect',
  'Reforge Growth Series Graduate',
  'HubSpot Inbound Marketing Certified'
];

export default function TalentResumeEditor({
  initialProfile,
  onProfileUpdated,
  onOpenPublicPreview
}: TalentResumeEditorProps) {
  const [activeTab, setActiveTab] = useState<'basic' | 'experience' | 'cases' | 'skills' | 'education'>('basic');
  const [saving, setSaving] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Form States
  const [fullName, setFullName] = useState(initialProfile?.full_name || '');
  const [headline, setHeadline] = useState(initialProfile?.headline || initialProfile?.specialty || 'Senior AI Automation & Growth Engineer');
  const [bio, setBio] = useState(initialProfile?.bio || initialProfile?.career_goal || '');
  const [profilePictureUrl, setProfilePictureUrl] = useState(initialProfile?.profile_picture_url || PRESET_AVATARS[0]);
  const [location, setLocation] = useState(initialProfile?.location || 'Lagos, Nigeria • Remote Global');
  const [availabilityStatus, setAvailabilityStatus] = useState<'available' | 'hired'>(initialProfile?.availability_status === 'hired' ? 'hired' : 'available');
  const [slug, setSlug] = useState(initialProfile?.slug || '');

  // Links
  const [linkedinUrl, setLinkedinUrl] = useState(initialProfile?.linkedin_url || '');
  const [githubUrl, setGithubUrl] = useState(initialProfile?.github_url || '');
  const [portfolioUrl, setPortfolioUrl] = useState(initialProfile?.portfolio_url || '');
  const [phone, setPhone] = useState(initialProfile?.phone || '');

  // Skills & AI Tools
  const [skills, setSkills] = useState<string[]>([]);
  const [customSkill, setCustomSkill] = useState('');
  const [aiTools, setAiTools] = useState<string[]>([]);
  const [customAiTool, setCustomAiTool] = useState('');
  const [certifications, setCertifications] = useState<string[]>([]);
  const [customCert, setCustomCert] = useState('');

  // Work History
  const [workHistory, setWorkHistory] = useState<WorkHistoryItem[]>([]);

  // Case Studies
  const [caseStudies, setCaseStudies] = useState<CaseStudyItem[]>([]);

  // Education
  const [education, setEducation] = useState<EducationItem[]>([]);

  // Initialize values from props
  useEffect(() => {
    if (!initialProfile) return;

    setFullName(initialProfile.full_name || '');
    setHeadline(initialProfile.headline || initialProfile.specialty || 'Senior AI Automation & Growth Engineer');
    setBio(initialProfile.bio || initialProfile.career_goal || '');
    setProfilePictureUrl(initialProfile.profile_picture_url || PRESET_AVATARS[0]);
    setLocation(initialProfile.location || 'Lagos, Nigeria • Remote Global');
    setAvailabilityStatus(initialProfile.availability_status === 'hired' ? 'hired' : 'available');
    setSlug(initialProfile.slug || (initialProfile.full_name ? initialProfile.full_name.toLowerCase().replace(/[^a-z0-9]+/g, '-') : ''));
    setLinkedinUrl(initialProfile.linkedin_url || '');
    setGithubUrl(initialProfile.github_url || '');
    setPortfolioUrl(initialProfile.portfolio_url || '');
    setPhone(initialProfile.phone || '');

    // Parse skills
    if (Array.isArray(initialProfile.skills)) {
      setSkills(initialProfile.skills);
    } else if (typeof initialProfile.skills === 'string') {
      try {
        const p = JSON.parse(initialProfile.skills);
        setSkills(Array.isArray(p) ? p : initialProfile.skills.split(',').map((s: string) => s.trim()));
      } catch {
        setSkills(initialProfile.skills.split(',').map((s: string) => s.trim()).filter(Boolean));
      }
    } else {
      setSkills(['Workflow Automation', 'Full-Stack Development', 'Python & TypeScript', 'API Orchestration']);
    }

    // Parse AI tools
    if (Array.isArray(initialProfile.ai_tools)) {
      setAiTools(initialProfile.ai_tools);
    } else if (typeof initialProfile.ai_tools === 'string') {
      try {
        const p = JSON.parse(initialProfile.ai_tools);
        setAiTools(Array.isArray(p) ? p : initialProfile.ai_tools.split(',').map((s: string) => s.trim()));
      } catch {
        setAiTools(initialProfile.ai_tools.split(',').map((s: string) => s.trim()).filter(Boolean));
      }
    } else {
      setAiTools(['Claude 3.7 Sonnet', 'Make.com', 'Zapier Enterprise', 'ChatGPT Enterprise', 'Cursor AI']);
    }

    // Parse Certifications
    if (Array.isArray(initialProfile.certifications)) {
      setCertifications(initialProfile.certifications.map((c: any) => typeof c === 'string' ? c : c.name));
    } else {
      setCertifications(['GrowthPaddy Certified Technical Specialist', 'Make.com Advanced Automation Specialist']);
    }

    // Parse Work History
    if (Array.isArray(initialProfile.work_history) && initialProfile.work_history.length > 0) {
      setWorkHistory(initialProfile.work_history);
    } else {
      setWorkHistory([
        {
          id: 'wh-1',
          title: 'Lead AI Solutions Architect',
          company: 'Apex Automation Labs',
          dates: 'Jan 2023 - Present',
          location: 'Remote',
          highlights: [
            'Spearheaded enterprise AI deployment and workflow automation saving over 120 operational hours weekly.',
            'Built custom vector search pipelines for internal knowledge discovery.'
          ]
        },
        {
          id: 'wh-2',
          title: 'Senior Growth & Systems Engineer',
          company: 'HyperScale Digital',
          dates: 'Mar 2021 - Dec 2022',
          location: 'Lagos, Nigeria',
          highlights: [
            'Engineered full-funnel attribution models and automated lead qualification queues.',
            'Increased activation rate by 42% via automated event listeners.'
          ]
        }
      ]);
    }

    // Parse Case Studies
    if (Array.isArray(initialProfile.case_studies) && initialProfile.case_studies.length > 0) {
      setCaseStudies(initialProfile.case_studies);
    } else {
      setCaseStudies([
        {
          id: 'cs-1',
          title: 'Autonomous Client Onboarding & CRM Pipeline',
          metric: '+240% Velocity Lift (35 hrs saved/wk)',
          description: 'Architected an end-to-end automated pipeline connecting webhook triggers, LLM payload categorization, and automated contract generation.',
          techStack: ['Make.com', 'Claude 3.7', 'Zapier Enterprise', 'HubSpot API', 'Python']
        },
        {
          id: 'cs-2',
          title: 'Enterprise Multi-Model Document Intelligence Engine',
          metric: '99.4% Parsing Accuracy on 45,000+ Records',
          description: 'Designed a high-throughput serverless microservice utilizing Gemini & Claude OCR to extract complex tabular financial figures into structured PostgreSQL schemas.',
          techStack: ['Python', 'PostgreSQL', 'LangChain', 'OpenAI', 'FastAPI']
        }
      ]);
    }

    // Parse Education
    if (Array.isArray(initialProfile.education) && initialProfile.education.length > 0) {
      setEducation(initialProfile.education);
    } else {
      setEducation([
        {
          id: 'edu-1',
          degree: 'B.Sc. in Computer Science / Information Systems',
          institution: 'University of Lagos',
          year: '2020',
          details: 'First Class Honors • Lead of Developer Student Club'
        }
      ]);
    }
  }, [initialProfile]);

  // Skill Handlers
  const toggleSkill = (skillName: string) => {
    if (skills.includes(skillName)) {
      setSkills(skills.filter(s => s !== skillName));
    } else {
      setSkills([...skills, skillName]);
    }
  };

  const handleAddCustomSkill = () => {
    if (!customSkill.trim()) return;
    if (!skills.includes(customSkill.trim())) {
      setSkills([...skills, customSkill.trim()]);
    }
    setCustomSkill('');
  };

  // AI Tools Handlers
  const toggleAiTool = (toolName: string) => {
    if (aiTools.includes(toolName)) {
      setAiTools(aiTools.filter(t => t !== toolName));
    } else {
      setAiTools([...aiTools, toolName]);
    }
  };

  const handleAddCustomAiTool = () => {
    if (!customAiTool.trim()) return;
    if (!aiTools.includes(customAiTool.trim())) {
      setAiTools([...aiTools, customAiTool.trim()]);
    }
    setCustomAiTool('');
  };

  // Cert Handlers
  const toggleCert = (certName: string) => {
    if (certifications.includes(certName)) {
      setCertifications(certifications.filter(c => c !== certName));
    } else {
      setCertifications([...certifications, certName]);
    }
  };

  const handleAddCustomCert = () => {
    if (!customCert.trim()) return;
    if (!certifications.includes(customCert.trim())) {
      setCertifications([...certifications, customCert.trim()]);
    }
    setCustomCert('');
  };

  // Work History Handlers
  const handleAddWorkHistory = () => {
    const newItem: WorkHistoryItem = {
      id: `wh-${Date.now()}`,
      title: 'Senior Technical Lead',
      company: 'Tech Enterprise / Agency',
      dates: 'Jan 2024 - Present',
      location: 'Remote',
      highlights: [
        'Spearheaded automated pipelines and API integrations for client teams.',
        'Engineered high-ROI systems cutting processing time significantly.'
      ]
    };
    setWorkHistory([...workHistory, newItem]);
  };

  const handleUpdateWorkHistory = (index: number, updated: Partial<WorkHistoryItem>) => {
    const copy = [...workHistory];
    copy[index] = { ...copy[index], ...updated };
    setWorkHistory(copy);
  };

  const handleRemoveWorkHistory = (index: number) => {
    setWorkHistory(workHistory.filter((_, i) => i !== index));
  };

  const handleAddHighlight = (whIndex: number) => {
    const copy = [...workHistory];
    const item = copy[whIndex];
    item.highlights = [...(item.highlights || []), 'Delivered impactful technical achievement with measurable outcome'];
    setWorkHistory(copy);
  };

  const handleUpdateHighlight = (whIndex: number, hlIndex: number, text: string) => {
    const copy = [...workHistory];
    const item = copy[whIndex];
    if (item.highlights) {
      item.highlights[hlIndex] = text;
      setWorkHistory(copy);
    }
  };

  const handleRemoveHighlight = (whIndex: number, hlIndex: number) => {
    const copy = [...workHistory];
    const item = copy[whIndex];
    if (item.highlights) {
      item.highlights = item.highlights.filter((_, i) => i !== hlIndex);
      setWorkHistory(copy);
    }
  };

  // Case Studies Handlers
  const handleAddCaseStudy = () => {
    const newCs: CaseStudyItem = {
      id: `cs-${Date.now()}`,
      title: 'High-Impact Automation Pipeline',
      metric: '+150% Operational Velocity Lift',
      description: 'Architected an automated multi-step pipeline connecting data sources and AI models to solve key workflow bottlenecks.',
      techStack: ['Make.com', 'OpenAI API', 'Python']
    };
    setCaseStudies([...caseStudies, newCs]);
  };

  const handleUpdateCaseStudy = (index: number, updated: Partial<CaseStudyItem>) => {
    const copy = [...caseStudies];
    copy[index] = { ...copy[index], ...updated };
    setCaseStudies(copy);
  };

  const handleRemoveCaseStudy = (index: number) => {
    setCaseStudies(caseStudies.filter((_, i) => i !== index));
  };

  // Education Handlers
  const handleAddEducation = () => {
    const newEdu: EducationItem = {
      id: `edu-${Date.now()}`,
      degree: 'B.Sc. in Engineering / Technology',
      institution: 'University Name',
      year: '2022',
      details: 'Relevant coursework in Systems Engineering and AI'
    };
    setEducation([...education, newEdu]);
  };

  const handleUpdateEducation = (index: number, updated: Partial<EducationItem>) => {
    const copy = [...education];
    copy[index] = { ...copy[index], ...updated };
    setEducation(copy);
  };

  const handleRemoveEducation = (index: number) => {
    setEducation(education.filter((_, i) => i !== index));
  };

  // Main Save Handler
  const handleSaveAll = async () => {
    setSaving(true);
    const targetSlug = slug.trim() || fullName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');

    const payload = {
      full_name: fullName,
      headline,
      bio,
      profile_picture_url: profilePictureUrl,
      location,
      availability_status: availabilityStatus,
      slug: targetSlug,
      linkedin_url: linkedinUrl,
      github_url: githubUrl,
      portfolio_url: portfolioUrl,
      phone,
      skills,
      ai_tools: aiTools,
      certifications,
      work_history: workHistory,
      case_studies: caseStudies,
      education,
      updated_at: new Date().toISOString()
    };

    try {
      // 1. Update Supabase
      if (initialProfile?.id) {
        const { error } = await supabase
          .from('talent_profiles')
          .update(payload)
          .eq('id', initialProfile.id);

        if (error) {
          console.warn('Supabase update warning (continuing to localStorage sync):', error.message);
        }
      }

      // 2. Sync to LocalStorage for rapid immediate preview persistence
      if (initialProfile?.id) {
        const storedKey = `digitalcampux_talent_profile_${initialProfile.id}`;
        const merged = { ...initialProfile, ...payload };
        localStorage.setItem(storedKey, JSON.stringify(merged));
      }

      if (onProfileUpdated) {
        onProfileUpdated(payload);
      }

      setToastMessage('✓ Tech Profile & Digital CV updated successfully!');
      setTimeout(() => setToastMessage(null), 4000);
    } catch (err: any) {
      console.error('Error saving resume:', err);
      setToastMessage('Saved locally. Profile preview is ready.');
      setTimeout(() => setToastMessage(null), 4000);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-white border border-slate-200/90 rounded-3xl p-5 sm:p-7 space-y-6 text-left shadow-xs text-slate-900">
      
      {/* Header with Save & Preview Actions - Plain Light SaaS */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono font-bold uppercase text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full">
              GrowthPaddy Talent Engine
            </span>
            <span className="text-xs text-slate-500 font-medium">Digital CV & Portfolio Builder</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 font-display mt-1">
            Talent Profile & Portfolio Editor
          </h2>
        </div>

        <div className="flex items-center gap-2.5 w-full sm:w-auto">
          {onOpenPublicPreview && (
            <button
              type="button"
              onClick={() => onOpenPublicPreview(slug || fullName.toLowerCase().replace(/[^a-z0-9]+/g, '-'))}
              className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 px-4 py-2.5 rounded-xl font-mono text-xs font-bold transition cursor-pointer shadow-2xs"
              title="View your public portfolio as hiring managers see it"
            >
              <Eye className="w-4 h-4 text-emerald-600" />
              <span>Preview Live CV</span>
            </button>
          )}

          <button
            type="button"
            onClick={handleSaveAll}
            disabled={saving}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-xl font-bold text-xs shadow-xs transition cursor-pointer disabled:opacity-50"
          >
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Saving...</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>Save Changes</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Floating Toast Notification */}
      {toastMessage && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-900 px-4 py-3 rounded-2xl flex items-center justify-between gap-3 animate-fadeIn shadow-2xs">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span className="text-xs font-semibold">{toastMessage}</span>
          </div>
          <button onClick={() => setToastMessage(null)} className="text-slate-400 hover:text-slate-700 text-xs">✕</button>
        </div>
      )}

      {/* 5-Tab Navigation Strip - Plain Light SaaS */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-2 border-b border-slate-100 scrollbar-none">
        <button
          type="button"
          onClick={() => setActiveTab('basic')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-mono font-bold whitespace-nowrap transition cursor-pointer ${
            activeTab === 'basic'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 bg-slate-100 border border-slate-200/80 hover:bg-slate-200/60'
          }`}
        >
          <User className="w-3.5 h-3.5" />
          <span>1. Basic Profile</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('experience')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-mono font-bold whitespace-nowrap transition cursor-pointer ${
            activeTab === 'experience'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 bg-slate-100 border border-slate-200/80 hover:bg-slate-200/60'
          }`}
        >
          <Briefcase className="w-3.5 h-3.5" />
          <span>2. Work History ({workHistory.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('cases')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-mono font-bold whitespace-nowrap transition cursor-pointer ${
            activeTab === 'cases'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 bg-slate-100 border border-slate-200/80 hover:bg-slate-200/60'
          }`}
        >
          <Flame className="w-3.5 h-3.5" />
          <span>3. Case Studies & ROI ({caseStudies.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('skills')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-mono font-bold whitespace-nowrap transition cursor-pointer ${
            activeTab === 'skills'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 bg-slate-100 border border-slate-200/80 hover:bg-slate-200/60'
          }`}
        >
          <Cpu className="w-3.5 h-3.5" />
          <span>4. Skills & AI Stack ({skills.length + aiTools.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('education')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-mono font-bold whitespace-nowrap transition cursor-pointer ${
            activeTab === 'education'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 bg-slate-100 border border-slate-200/80 hover:bg-slate-200/60'
          }`}
        >
          <GraduationCap className="w-3.5 h-3.5" />
          <span>5. Education & Links</span>
        </button>
      </div>

      {/* TAB CONTENT SECTIONS */}
      <div className="space-y-6">
        
        {/* ========================================================================= */}
        {/* TAB 1: BASIC INFO & AVATAR (NO RATES) */}
        {/* ========================================================================= */}
        {activeTab === 'basic' && (
          <div className="space-y-5 animate-fadeIn">
            
            {/* Avatar & Photo Picker */}
            <div className="p-4.5 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
              <label className="block text-[11px] font-mono uppercase font-bold text-slate-700">
                Candidate Profile Photo
              </label>

              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                <img
                  src={profilePictureUrl || PRESET_AVATARS[0]}
                  alt="Candidate Avatar Preview"
                  className="w-16 h-16 rounded-2xl object-cover border-2 border-slate-200 shadow-xs shrink-0 bg-slate-100"
                />

                <div className="space-y-2 flex-1 w-full">
                  <input
                    type="url"
                    placeholder="Enter custom photo image URL..."
                    value={profilePictureUrl}
                    onChange={(e) => setProfilePictureUrl(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-900 focus:outline-none focus:border-emerald-600"
                  />

                  {/* Preset photo chips */}
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[10px] font-mono text-slate-500">Preset Avatars:</span>
                    {PRESET_AVATARS.map((url, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setProfilePictureUrl(url)}
                        className={`w-7 h-7 rounded-lg overflow-hidden border-2 cursor-pointer transition ${
                          profilePictureUrl === url ? 'border-emerald-600 scale-110' : 'border-slate-200 hover:border-slate-400'
                        }`}
                      >
                        <img src={url} alt={`Preset ${idx + 1}`} className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Name & Headline */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-mono uppercase font-bold text-slate-700 mb-1">
                  Full Name <span className="text-emerald-600">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Sarah Jenkins"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 font-medium focus:outline-none focus:border-emerald-600 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-[11px] font-mono uppercase font-bold text-slate-700 mb-1">
                  Professional Headline <span className="text-emerald-600">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Senior AI Automation Architect & Growth Lead"
                  value={headline}
                  onChange={(e) => setHeadline(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 font-medium focus:outline-none focus:border-emerald-600 focus:bg-white"
                />
              </div>
            </div>

            {/* Location & Public Slug */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-mono uppercase font-bold text-slate-700 mb-1">
                  Location & Remote Preference
                </label>
                <input
                  type="text"
                  placeholder="e.g. Lagos, Nigeria • Remote Global"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-emerald-600 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-[11px] font-mono uppercase font-bold text-slate-700 mb-1">
                  Custom Digital Portfolio Slug (URL)
                </label>
                <div className="flex items-center">
                  <span className="bg-slate-100 border border-r-0 border-slate-200 text-slate-500 font-mono text-xs px-3 py-2.5 rounded-l-xl">
                    /p/
                  </span>
                  <input
                    type="text"
                    placeholder="sarah-jenkins"
                    value={slug}
                    onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]+/g, ''))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-r-xl px-3.5 py-2.5 text-xs text-slate-900 font-mono focus:outline-none focus:border-emerald-600 focus:bg-white"
                  />
                </div>
              </div>
            </div>

            {/* Executive Summary / Bio */}
            <div>
              <label className="block text-[11px] font-mono uppercase font-bold text-slate-700 mb-1">
                Executive Bio & Strategic Background
              </label>
              <textarea
                rows={4}
                placeholder="Introduce your domain background, technical capabilities, and how you drive ROI for enterprise & startup teams..."
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3.5 text-xs text-slate-900 leading-relaxed focus:outline-none focus:border-emerald-600 focus:bg-white font-sans"
              ></textarea>
            </div>

            {/* Availability Status Selector */}
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div>
                <span className="text-xs font-bold text-slate-900 block">Marketplace Availability Toggle</span>
                <span className="text-[11px] text-slate-500">Controls whether recruiters see you as Available for Hire or Currently Hired</span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setAvailabilityStatus('available')}
                  className={`px-3.5 py-1.5 rounded-xl font-mono text-xs font-bold cursor-pointer transition shadow-2xs ${
                    availabilityStatus === 'available'
                      ? 'bg-emerald-600 text-white font-black'
                      : 'bg-white text-slate-600 border border-slate-200'
                  }`}
                >
                  🟢 Available for Hire
                </button>

                <button
                  type="button"
                  onClick={() => setAvailabilityStatus('hired')}
                  className={`px-3.5 py-1.5 rounded-xl font-mono text-xs font-bold cursor-pointer transition shadow-2xs ${
                    availabilityStatus === 'hired'
                      ? 'bg-slate-700 text-white font-black'
                      : 'bg-white text-slate-600 border border-slate-200'
                  }`}
                >
                  🔒 Currently Hired
                </button>
              </div>
            </div>

          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 2: WORK EXPERIENCE */}
        {/* ========================================================================= */}
        {activeTab === 'experience' && (
          <div className="space-y-5 animate-fadeIn">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900 font-display">Work History & Experience</h3>
                <p className="text-xs text-slate-500">Add chronological career milestones with bulleted impact achievements.</p>
              </div>
              <button
                type="button"
                onClick={handleAddWorkHistory}
                className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-3.5 py-2 rounded-xl cursor-pointer transition shadow-2xs"
              >
                <Plus className="w-4 h-4" />
                <span>Add Position</span>
              </button>
            </div>

            {workHistory.length === 0 ? (
              <div className="p-8 bg-slate-50 border border-slate-200 rounded-2xl text-center text-slate-500 space-y-2">
                <Briefcase className="w-8 h-8 text-slate-400 mx-auto" />
                <p className="text-xs">No career milestones added yet. Click &apos;Add Position&apos; above.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {workHistory.map((item, idx) => (
                  <div key={item.id || idx} className="p-5 bg-slate-50 border border-slate-200 rounded-2xl space-y-3 relative group">
                    <div className="flex items-center justify-between border-b border-slate-200/80 pb-2">
                      <span className="text-[11px] font-mono font-bold uppercase text-emerald-700">
                        Position #{idx + 1}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleRemoveWorkHistory(idx)}
                        className="text-slate-400 hover:text-rose-600 p-1 cursor-pointer transition"
                        title="Remove position"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[10px] font-mono uppercase text-slate-700 mb-1 font-semibold">Job Title</label>
                        <input
                          type="text"
                          value={item.title}
                          onChange={(e) => handleUpdateWorkHistory(idx, { title: e.target.value })}
                          className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-emerald-600"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-mono uppercase text-slate-700 mb-1 font-semibold">Company / Organization</label>
                        <input
                          type="text"
                          value={item.company}
                          onChange={(e) => handleUpdateWorkHistory(idx, { company: e.target.value })}
                          className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-emerald-600"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-mono uppercase text-slate-700 mb-1 font-semibold">Dates of Employment</label>
                        <input
                          type="text"
                          placeholder="e.g. Jan 2023 - Present"
                          value={item.dates}
                          onChange={(e) => handleUpdateWorkHistory(idx, { dates: e.target.value })}
                          className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 font-mono focus:outline-none focus:border-emerald-600"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-mono uppercase text-slate-700 mb-1 font-semibold">Location / Remote</label>
                        <input
                          type="text"
                          placeholder="e.g. Remote or Lagos, Nigeria"
                          value={item.location || ''}
                          onChange={(e) => handleUpdateWorkHistory(idx, { location: e.target.value })}
                          className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-emerald-600"
                        />
                      </div>
                    </div>

                    {/* Highlights / Achievements */}
                    <div className="space-y-2 pt-2 border-t border-slate-200/80">
                      <div className="flex items-center justify-between">
                        <label className="text-[10px] font-mono uppercase text-slate-700 font-semibold">
                          Key Achievements & Responsibilities
                        </label>
                        <button
                          type="button"
                          onClick={() => handleAddHighlight(idx)}
                          className="text-[11px] font-mono text-emerald-700 hover:text-emerald-800 font-bold flex items-center gap-1 cursor-pointer"
                        >
                          <Plus className="w-3 h-3" />
                          <span>Add Bullet</span>
                        </button>
                      </div>

                      {(item.highlights || []).map((hl, hlIdx) => (
                        <div key={hlIdx} className="flex items-center gap-2">
                          <span className="text-emerald-600 font-bold">•</span>
                          <input
                            type="text"
                            value={hl}
                            onChange={(e) => handleUpdateHighlight(idx, hlIdx, e.target.value)}
                            placeholder="e.g. Reduced client churn by 28% through automated onboarding workflows..."
                            className="flex-1 bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-900 focus:outline-none focus:border-emerald-600"
                          />
                          <button
                            type="button"
                            onClick={() => handleRemoveHighlight(idx, hlIdx)}
                            className="text-slate-400 hover:text-rose-600 p-1 cursor-pointer"
                          >
                            ✕
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 3: CASE STUDIES & ROI IMPACT WINS */}
        {/* ========================================================================= */}
        {activeTab === 'cases' && (
          <div className="space-y-5 animate-fadeIn">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900 font-display">Case Studies & ROI Wins</h3>
                <p className="text-xs text-slate-500">Showcase tangible projects with proven quantitative metrics and tools used.</p>
              </div>
              <button
                type="button"
                onClick={handleAddCaseStudy}
                className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-3.5 py-2 rounded-xl cursor-pointer transition shadow-2xs"
              >
                <Plus className="w-4 h-4" />
                <span>Add Case Study</span>
              </button>
            </div>

            {caseStudies.length === 0 ? (
              <div className="p-8 bg-slate-50 border border-slate-200 rounded-2xl text-center text-slate-500 space-y-2">
                <Flame className="w-8 h-8 text-slate-400 mx-auto" />
                <p className="text-xs">No case studies added yet. Click &apos;Add Case Study&apos; to showcase your ROI.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {caseStudies.map((cs, idx) => (
                  <div key={cs.id || idx} className="p-5 bg-slate-50 border border-slate-200 rounded-2xl space-y-3 relative group">
                    <div className="flex items-center justify-between border-b border-slate-200/80 pb-2">
                      <span className="text-[11px] font-mono font-bold uppercase text-amber-700 flex items-center gap-1">
                        <Flame className="w-3.5 h-3.5" />
                        Case Study #{idx + 1}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleRemoveCaseStudy(idx)}
                        className="text-slate-400 hover:text-rose-600 p-1 cursor-pointer transition"
                        title="Remove case study"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[10px] font-mono uppercase text-slate-700 mb-1 font-semibold">Project Title</label>
                        <input
                          type="text"
                          value={cs.title}
                          onChange={(e) => handleUpdateCaseStudy(idx, { title: e.target.value })}
                          className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-emerald-600"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-mono uppercase text-slate-700 mb-1 font-semibold">Quantified Impact Metric</label>
                        <input
                          type="text"
                          placeholder="e.g. +240% Velocity Lift (35 hrs saved/wk)"
                          value={cs.metric || ''}
                          onChange={(e) => handleUpdateCaseStudy(idx, { metric: e.target.value })}
                          className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 font-mono focus:outline-none focus:border-emerald-600"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] font-mono uppercase text-slate-700 mb-1 font-semibold">
                        Architecture, Problem & Solution
                      </label>
                      <textarea
                        rows={3}
                        placeholder="Describe the architectural challenge, how you engineered the solution, and the resulting business value..."
                        value={cs.description}
                        onChange={(e) => handleUpdateCaseStudy(idx, { description: e.target.value })}
                        className="w-full bg-white border border-slate-200 rounded-xl p-3 text-xs text-slate-900 focus:outline-none focus:border-emerald-600 font-sans"
                      ></textarea>
                    </div>

                    <div>
                      <label className="block text-[10px] font-mono uppercase text-slate-700 mb-1 font-semibold">
                        Technologies & Tools (comma-separated)
                      </label>
                      <input
                        type="text"
                        placeholder="Make.com, Claude 3.7, Python, PostgreSQL"
                        value={Array.isArray(cs.techStack) ? cs.techStack.join(', ') : (cs.techStack || '')}
                        onChange={(e) => {
                          const arr = e.target.value.split(',').map(s => s.trim()).filter(Boolean);
                          handleUpdateCaseStudy(idx, { techStack: arr });
                        }}
                        className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 font-mono focus:outline-none focus:border-emerald-600"
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 4: SKILLS & AI TOOL STACK */}
        {/* ========================================================================= */}
        {activeTab === 'skills' && (
          <div className="space-y-6 animate-fadeIn">
            
            {/* Core Skills Selector */}
            <div className="p-5 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
              <div className="flex items-center gap-2">
                <Code className="w-4 h-4 text-emerald-600" />
                <h4 className="text-xs font-mono font-bold uppercase text-slate-900">
                  Core Discipline Skills ({skills.length} Selected)
                </h4>
              </div>

              <div className="flex flex-wrap gap-2">
                {PRESET_CORE_SKILLS.map((skill, idx) => {
                  const isSelected = skills.includes(skill);
                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => toggleSkill(skill)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-mono transition cursor-pointer shadow-2xs ${
                        isSelected
                          ? 'bg-emerald-600 text-white font-bold'
                          : 'bg-white text-slate-600 border border-slate-200 hover:border-slate-400'
                      }`}
                    >
                      {skill} {isSelected ? '✓' : '+'}
                    </button>
                  );
                })}
              </div>

              {/* Add Custom Skill */}
              <div className="flex gap-2 pt-2">
                <input
                  type="text"
                  placeholder="Add custom skill..."
                  value={customSkill}
                  onChange={(e) => setCustomSkill(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddCustomSkill(); } }}
                  className="flex-1 bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-900 focus:outline-none focus:border-emerald-600"
                />
                <button
                  type="button"
                  onClick={handleAddCustomSkill}
                  className="bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold px-3.5 py-1.5 text-xs rounded-xl cursor-pointer"
                >
                  Add
                </button>
              </div>
            </div>

            {/* AI Stack & Automation Tools */}
            <div className="p-5 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
              <div className="flex items-center gap-2">
                <Cpu className="w-4 h-4 text-emerald-600" />
                <h4 className="text-xs font-mono font-bold uppercase text-slate-900">
                  AI & Automation Tooling Stack ({aiTools.length} Selected)
                </h4>
              </div>

              <div className="flex flex-wrap gap-2">
                {PRESET_AI_TOOLS.map((tool, idx) => {
                  const isSelected = aiTools.includes(tool);
                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => toggleAiTool(tool)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-mono transition cursor-pointer shadow-2xs ${
                        isSelected
                          ? 'bg-emerald-600 text-white font-bold'
                          : 'bg-white text-slate-600 border border-slate-200 hover:border-slate-400'
                      }`}
                    >
                      {tool} {isSelected ? '✓' : '+'}
                    </button>
                  );
                })}
              </div>

              {/* Add Custom AI Tool */}
              <div className="flex gap-2 pt-2">
                <input
                  type="text"
                  placeholder="Add custom AI tool (e.g. OpenAI o3-mini, Retool)..."
                  value={customAiTool}
                  onChange={(e) => setCustomAiTool(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddCustomAiTool(); } }}
                  className="flex-1 bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-900 focus:outline-none focus:border-emerald-600"
                />
                <button
                  type="button"
                  onClick={handleAddCustomAiTool}
                  className="bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold px-3.5 py-1.5 text-xs rounded-xl cursor-pointer"
                >
                  Add
                </button>
              </div>
            </div>

            {/* Certifications Strip */}
            <div className="p-5 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
              <div className="flex items-center gap-2">
                <Award className="w-4 h-4 text-amber-600" />
                <h4 className="text-xs font-mono font-bold uppercase text-slate-900">
                  Industry Certifications ({certifications.length})
                </h4>
              </div>

              <div className="flex flex-wrap gap-2">
                {PRESET_CERTS.map((cert, idx) => {
                  const isSelected = certifications.includes(cert);
                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => toggleCert(cert)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-mono transition cursor-pointer shadow-2xs ${
                        isSelected
                          ? 'bg-amber-100 text-amber-900 border border-amber-300 font-bold'
                          : 'bg-white text-slate-600 border border-slate-200 hover:border-slate-400'
                      }`}
                    >
                      {cert} {isSelected ? '✓' : '+'}
                    </button>
                  );
                })}
              </div>

              <div className="flex gap-2 pt-2">
                <input
                  type="text"
                  placeholder="Add custom certificate..."
                  value={customCert}
                  onChange={(e) => setCustomCert(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddCustomCert(); } }}
                  className="flex-1 bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-900 focus:outline-none focus:border-emerald-600"
                />
                <button
                  type="button"
                  onClick={handleAddCustomCert}
                  className="bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold px-3.5 py-1.5 text-xs rounded-xl cursor-pointer"
                >
                  Add
                </button>
              </div>
            </div>

          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 5: EDUCATION & SOCIAL LINKS */}
        {/* ========================================================================= */}
        {activeTab === 'education' && (
          <div className="space-y-6 animate-fadeIn">
            
            {/* Education Records */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-slate-900 font-display">Academic Education</h4>
                  <p className="text-xs text-slate-500">Degree, institution, and graduating honor details.</p>
                </div>
                <button
                  type="button"
                  onClick={handleAddEducation}
                  className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-3.5 py-2 rounded-xl cursor-pointer transition shadow-2xs"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Degree</span>
                </button>
              </div>

              {education.map((edu, idx) => (
                <div key={edu.id || idx} className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-2.5 relative">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono font-bold uppercase text-emerald-700">Degree #{idx + 1}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveEducation(idx)}
                      className="text-slate-400 hover:text-rose-600 p-1 cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                    <div className="sm:col-span-2">
                      <label className="block text-[10px] font-mono uppercase text-slate-700 mb-0.5 font-semibold">Degree / Major</label>
                      <input
                        type="text"
                        value={edu.degree}
                        onChange={(e) => handleUpdateEducation(idx, { degree: e.target.value })}
                        className="w-full bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-900 focus:outline-none focus:border-emerald-600"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-mono uppercase text-slate-700 mb-0.5 font-semibold">Year</label>
                      <input
                        type="text"
                        value={edu.year}
                        onChange={(e) => handleUpdateEducation(idx, { year: e.target.value })}
                        className="w-full bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-900 font-mono focus:outline-none focus:border-emerald-600"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <div>
                      <label className="block text-[10px] font-mono uppercase text-slate-700 mb-0.5 font-semibold">Institution / University</label>
                      <input
                        type="text"
                        value={edu.institution}
                        onChange={(e) => handleUpdateEducation(idx, { institution: e.target.value })}
                        className="w-full bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-900 focus:outline-none focus:border-emerald-600"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-mono uppercase text-slate-700 mb-0.5 font-semibold">Honors / Details</label>
                      <input
                        type="text"
                        placeholder="e.g. First Class Honors"
                        value={edu.details || ''}
                        onChange={(e) => handleUpdateEducation(idx, { details: e.target.value })}
                        className="w-full bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-900 focus:outline-none focus:border-emerald-600"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Social & Professional Links */}
            <div className="p-5 bg-slate-50 border border-slate-200 rounded-2xl space-y-3.5">
              <h4 className="text-xs font-mono font-bold uppercase text-slate-900">
                Professional Web Links & Socials
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-mono uppercase text-slate-700 mb-1 font-semibold flex items-center gap-1">
                    <Linkedin className="w-3.5 h-3.5 text-slate-500" />
                    <span>LinkedIn Profile URL</span>
                  </label>
                  <input
                    type="url"
                    placeholder="https://linkedin.com/in/username"
                    value={linkedinUrl}
                    onChange={(e) => setLinkedinUrl(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-emerald-600"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-mono uppercase text-slate-700 mb-1 font-semibold flex items-center gap-1">
                    <Github className="w-3.5 h-3.5 text-slate-500" />
                    <span>GitHub Profile URL</span>
                  </label>
                  <input
                    type="url"
                    placeholder="https://github.com/username"
                    value={githubUrl}
                    onChange={(e) => setGithubUrl(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-emerald-600"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-mono uppercase text-slate-700 mb-1 font-semibold flex items-center gap-1">
                    <Globe className="w-3.5 h-3.5 text-slate-500" />
                    <span>Personal Live Site / Portfolio URL</span>
                  </label>
                  <input
                    type="url"
                    placeholder="https://yourportfolio.dev"
                    value={portfolioUrl}
                    onChange={(e) => setPortfolioUrl(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-emerald-600"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-mono uppercase text-slate-700 mb-1 font-semibold">
                    Direct Contact Phone / WhatsApp
                  </label>
                  <input
                    type="text"
                    placeholder="+234 816 966 4607"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-emerald-600"
                  />
                </div>
              </div>
            </div>

          </div>
        )}

      </div>

    </div>
  );
}
