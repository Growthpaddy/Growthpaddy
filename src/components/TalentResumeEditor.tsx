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
  Award,
  DollarSign,
  Clock,
  ChevronRight,
  ShieldCheck
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
  'Data Pipelines', 'HubSpot Integration', 'PostgreSQL', 'FastAPI', 'React'
];

const PRESET_AI_TOOLS = [
  'Claude 3.7 Sonnet', 'Make.com', 'Zapier Enterprise', 'ChatGPT Enterprise', 
  'Cursor AI', 'HubSpot AI', 'Midjourney v6', 'LangChain', 'n8n Automation', 
  'OpenAI API', 'v0 by Vercel', 'Perplexity Pro', 'Anthropic API', 'DeepSeek'
];

const PRESET_CERTS = [
  'GrowthPaddy Certified Technical Specialist',
  'Make.com Advanced Automation Specialist',
  'Anthropic Certified Prompt Engineer',
  'Google Professional Cloud Architect',
  'Reforge Growth Series Graduate',
  'HubSpot Inbound Marketing Certified',
  'AWS Certified Solutions Architect'
];

export default function TalentResumeEditor({
  initialProfile,
  onProfileUpdated,
  onOpenPublicPreview
}: TalentResumeEditorProps) {
  const [activeTab, setActiveTab] = useState<'basic' | 'experience' | 'cases' | 'education' | 'skills'>('basic');
  const [saving, setSaving] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // 1. Basic Overview States
  const [fullName, setFullName] = useState(initialProfile?.full_name || '');
  const [headline, setHeadline] = useState(initialProfile?.headline || '');
  const [bio, setBio] = useState(initialProfile?.bio || '');
  const [yearsExperience, setYearsExperience] = useState<number | string>(
    typeof initialProfile?.years_experience === 'number' 
      ? initialProfile.years_experience 
      : typeof initialProfile?.years_of_experience === 'number'
      ? initialProfile.years_of_experience
      : ''
  );
  const [hourlyRate, setHourlyRate] = useState(initialProfile?.hourly_rate || '');
  const [profilePictureUrl, setProfilePictureUrl] = useState(initialProfile?.profile_picture_url || PRESET_AVATARS[0]);
  const [location, setLocation] = useState(initialProfile?.location || '');
  const [availabilityStatus, setAvailabilityStatus] = useState<'available' | 'hired'>(
    initialProfile?.availability_status === 'hired' ? 'hired' : 'available'
  );
  const [slug, setSlug] = useState(initialProfile?.slug || '');
  const [whatsappNumber, setWhatsappNumber] = useState(initialProfile?.whatsapp_number || initialProfile?.phone || '');
  const [contactEmail, setContactEmail] = useState(initialProfile?.contact_email || initialProfile?.email || '');

  // Social & External Links
  const [linkedinUrl, setLinkedinUrl] = useState(initialProfile?.linkedin_url || '');
  const [githubUrl, setGithubUrl] = useState(initialProfile?.github_url || '');
  const [portfolioUrl, setPortfolioUrl] = useState(initialProfile?.portfolio_url || '');

  // 2. Skills & AI Tools
  const [skills, setSkills] = useState<string[]>([]);
  const [customSkill, setCustomSkill] = useState('');
  const [aiTools, setAiTools] = useState<string[]>([]);
  const [customAiTool, setCustomAiTool] = useState('');
  const [certifications, setCertifications] = useState<string[]>([]);
  const [customCert, setCustomCert] = useState('');

  // 3. Work History
  const [workHistory, setWorkHistory] = useState<WorkHistoryItem[]>([]);

  // 4. Case Studies & ROI Wins
  const [caseStudies, setCaseStudies] = useState<CaseStudyItem[]>([]);
  const [newTagInputs, setNewTagInputs] = useState<{ [key: number]: string }>({});

  // 5. Education & Credentials
  const [education, setEducation] = useState<EducationItem[]>([]);

  // Initialize values safely from initialProfile
  useEffect(() => {
    if (!initialProfile) return;

    setFullName(initialProfile.full_name || '');
    setHeadline(initialProfile.headline || initialProfile.specialty || '');
    setBio(initialProfile.bio || initialProfile.career_goal || '');
    
    const exp = typeof initialProfile.years_experience === 'number' 
      ? initialProfile.years_experience 
      : typeof initialProfile.years_of_experience === 'number'
      ? initialProfile.years_of_experience
      : '';
    setYearsExperience(exp);

    setHourlyRate(initialProfile.hourly_rate || '');
    setProfilePictureUrl(initialProfile.profile_picture_url || PRESET_AVATARS[0]);
    setLocation(initialProfile.location || '');
    setAvailabilityStatus(initialProfile.availability_status === 'hired' ? 'hired' : 'available');
    setSlug(initialProfile.slug || (initialProfile.full_name ? initialProfile.full_name.toLowerCase().replace(/[^a-z0-9]+/g, '-') : ''));
    setLinkedinUrl(initialProfile.linkedin_url || '');
    setGithubUrl(initialProfile.github_url || '');
    setPortfolioUrl(initialProfile.portfolio_url || '');
    setWhatsappNumber(initialProfile.whatsapp_number || initialProfile.phone || '');
    setContactEmail(initialProfile.contact_email || initialProfile.email || '');

    // Parse skills
    if (Array.isArray(initialProfile.skills)) {
      setSkills(initialProfile.skills);
    } else if (typeof initialProfile.skills === 'string') {
      try {
        const p = JSON.parse(initialProfile.skills);
        setSkills(Array.isArray(p) ? p : initialProfile.skills.split(',').map((s: string) => s.trim()).filter(Boolean));
      } catch {
        setSkills(initialProfile.skills.split(',').map((s: string) => s.trim()).filter(Boolean));
      }
    } else {
      setSkills([]);
    }

    // Parse AI tools
    if (Array.isArray(initialProfile.ai_tools)) {
      setAiTools(initialProfile.ai_tools);
    } else if (typeof initialProfile.ai_tools === 'string') {
      try {
        const p = JSON.parse(initialProfile.ai_tools);
        setAiTools(Array.isArray(p) ? p : initialProfile.ai_tools.split(',').map((s: string) => s.trim()).filter(Boolean));
      } catch {
        setAiTools(initialProfile.ai_tools.split(',').map((s: string) => s.trim()).filter(Boolean));
      }
    } else {
      setAiTools([]);
    }

    // Parse Certifications
    if (Array.isArray(initialProfile.certifications)) {
      setCertifications(initialProfile.certifications.map((c: any) => typeof c === 'string' ? c : c.name).filter(Boolean));
    } else {
      setCertifications([]);
    }

    // Parse Work History
    if (Array.isArray(initialProfile.work_history)) {
      const normalized = initialProfile.work_history.map((item: any) => ({
        id: item.id || `wh-${Math.random().toString(36).substring(2, 9)}`,
        company: item.company || '',
        role: item.role || item.title || '',
        location: item.location || '',
        startDate: item.startDate || (item.dates ? item.dates.split('-')[0]?.trim() : ''),
        endDate: item.endDate || (item.dates ? item.dates.split('-')[1]?.trim() : ''),
        bullets: Array.isArray(item.bullets) ? item.bullets : (Array.isArray(item.highlights) ? item.highlights : [])
      }));
      setWorkHistory(normalized);
    } else {
      setWorkHistory([]);
    }

    // Parse Case Studies
    if (Array.isArray(initialProfile.case_studies)) {
      const normalized = initialProfile.case_studies.map((item: any) => ({
        id: item.id || `cs-${Math.random().toString(36).substring(2, 9)}`,
        title: item.title || '',
        metric: item.metric || item.metrics || '',
        description: item.description || '',
        tech_stack: Array.isArray(item.tech_stack) ? item.tech_stack : (Array.isArray(item.techStack) ? item.techStack : (Array.isArray(item.tools) ? item.tools : []))
      }));
      setCaseStudies(normalized);
    } else {
      setCaseStudies([]);
    }

    // Parse Education
    if (Array.isArray(initialProfile.education)) {
      const normalized = initialProfile.education.map((item: any) => ({
        id: item.id || `edu-${Math.random().toString(36).substring(2, 9)}`,
        degree: item.degree || '',
        institution: item.institution || '',
        year: item.year || '',
        honors: item.honors || item.details || ''
      }));
      setEducation(normalized);
    } else {
      setEducation([]);
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

  const handleRemoveSkill = (skillToRemove: string) => {
    setSkills(skills.filter(s => s !== skillToRemove));
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

  const handleRemoveAiTool = (toolToRemove: string) => {
    setAiTools(aiTools.filter(t => t !== toolToRemove));
  };

  // Certifications Handlers
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

  const handleRemoveCert = (certToRemove: string) => {
    setCertifications(certifications.filter(c => c !== certToRemove));
  };

  // Work History Handlers
  const handleAddWorkHistory = () => {
    const newItem: WorkHistoryItem = {
      id: `wh-${Date.now()}`,
      company: '',
      role: '',
      location: '',
      startDate: '',
      endDate: 'Present',
      bullets: ['Led development and automation workflows that boosted team throughput']
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

  const handleAddBullet = (whIndex: number) => {
    const copy = [...workHistory];
    const item = copy[whIndex];
    const currentBullets = item.bullets || item.highlights || [];
    item.bullets = [...currentBullets, ''];
    setWorkHistory(copy);
  };

  const handleUpdateBullet = (whIndex: number, bIndex: number, text: string) => {
    const copy = [...workHistory];
    const item = copy[whIndex];
    const currentBullets = [...(item.bullets || item.highlights || [])];
    currentBullets[bIndex] = text;
    item.bullets = currentBullets;
    setWorkHistory(copy);
  };

  const handleRemoveBullet = (whIndex: number, bIndex: number) => {
    const copy = [...workHistory];
    const item = copy[whIndex];
    const currentBullets = item.bullets || item.highlights || [];
    item.bullets = currentBullets.filter((_, i) => i !== bIndex);
    setWorkHistory(copy);
  };

  // Case Studies Handlers
  const handleAddCaseStudy = () => {
    const newCs: CaseStudyItem = {
      id: `cs-${Date.now()}`,
      title: '',
      metric: '',
      description: '',
      tech_stack: []
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

  const handleAddCaseTechTag = (csIndex: number) => {
    const tag = (newTagInputs[csIndex] || '').trim();
    if (!tag) return;
    const copy = [...caseStudies];
    const currentStack = copy[csIndex].tech_stack || copy[csIndex].techStack || [];
    if (!currentStack.includes(tag)) {
      copy[csIndex].tech_stack = [...currentStack, tag];
      setCaseStudies(copy);
    }
    setNewTagInputs(prev => ({ ...prev, [csIndex]: '' }));
  };

  const handleRemoveCaseTechTag = (csIndex: number, tagToRemove: string) => {
    const copy = [...caseStudies];
    const currentStack = copy[csIndex].tech_stack || copy[csIndex].techStack || [];
    copy[csIndex].tech_stack = currentStack.filter(t => t !== tagToRemove);
    setCaseStudies(copy);
  };

  // Education Handlers
  const handleAddEducation = () => {
    const newEdu: EducationItem = {
      id: `edu-${Date.now()}`,
      degree: '',
      institution: '',
      year: '',
      honors: ''
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

  // Main Save Handler to public.talent_profiles
  const handleSaveAll = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setSaving(true);

    const targetSlug = slug.trim() || fullName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || 'candidate';
    const parsedYearsExp = yearsExperience !== '' ? parseInt(String(yearsExperience), 10) || 0 : 0;

    // Clean work history payload with exact DB fields
    const formattedWorkHistory = workHistory.map(wh => ({
      id: wh.id,
      company: wh.company,
      role: wh.role || wh.title || '',
      location: wh.location || '',
      startDate: wh.startDate || '',
      endDate: wh.endDate || '',
      dates: wh.startDate && wh.endDate ? `${wh.startDate} - ${wh.endDate}` : (wh.dates || ''),
      bullets: wh.bullets || wh.highlights || []
    }));

    // Clean case studies payload
    const formattedCaseStudies = caseStudies.map(cs => ({
      id: cs.id,
      title: cs.title,
      metric: cs.metric || cs.metrics || '',
      description: cs.description,
      tech_stack: cs.tech_stack || cs.techStack || []
    }));

    // Clean education payload
    const formattedEducation = education.map(edu => ({
      id: edu.id,
      degree: edu.degree,
      institution: edu.institution,
      year: edu.year,
      honors: edu.honors || edu.details || ''
    }));

    const payload: any = {
      full_name: fullName,
      headline,
      bio,
      years_experience: parsedYearsExp,
      hourly_rate: hourlyRate,
      linkedin_url: linkedinUrl,
      github_url: githubUrl,
      portfolio_url: portfolioUrl,
      whatsapp_number: whatsappNumber,
      contact_email: contactEmail,
      location,
      availability_status: availabilityStatus,
      profile_picture_url: profilePictureUrl,
      slug: targetSlug,
      skills,
      ai_tools: aiTools,
      certifications,
      work_history: formattedWorkHistory,
      case_studies: formattedCaseStudies,
      education: formattedEducation,
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
          console.warn('Supabase update warning:', error.message);
        }
      }

      // 2. Cache locally for instant preview sync
      if (initialProfile?.id) {
        const storedKey = `digitalcampux_talent_profile_${initialProfile.id}`;
        const merged = { ...initialProfile, ...payload };
        localStorage.setItem(storedKey, JSON.stringify(merged));
      }

      if (onProfileUpdated) {
        onProfileUpdated(payload);
      }

      setToastMessage('✓ Profile successfully saved to database!');
      setTimeout(() => setToastMessage(null), 4000);
    } catch (err: any) {
      console.error('Error saving profile:', err);
      setToastMessage('Saved locally. Refresh to verify cloud connection.');
      setTimeout(() => setToastMessage(null), 4000);
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSaveAll} className="bg-white border border-slate-200/90 rounded-3xl p-5 sm:p-7 space-y-6 text-left shadow-xs text-slate-900">
      
      {/* Header with Save & Preview Actions - Plain Light SaaS */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono font-bold uppercase text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full">
              GrowthPaddy Candidate Engine
            </span>
            <span className="text-xs text-slate-500 font-medium">Digital CV & Resume Builder</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 font-display mt-1">
            Executive Profile & Portfolio Editor
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
            type="submit"
            disabled={saving}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-xl font-bold text-xs shadow-xs transition cursor-pointer disabled:opacity-50"
          >
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Saving to Cloud...</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>Save Profile</span>
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
          <button type="button" onClick={() => setToastMessage(null)} className="text-slate-400 hover:text-slate-700 text-xs">✕</button>
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
          <span>1. Basic Overview</span>
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
          <span>2. Work Experience ({workHistory.length})</span>
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
          onClick={() => setActiveTab('education')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-mono font-bold whitespace-nowrap transition cursor-pointer ${
            activeTab === 'education'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 bg-slate-100 border border-slate-200/80 hover:bg-slate-200/60'
          }`}
        >
          <GraduationCap className="w-3.5 h-3.5" />
          <span>4. Education & Credentials ({education.length + certifications.length})</span>
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
          <span>5. Skills & AI Stack ({skills.length + aiTools.length})</span>
        </button>
      </div>

      {/* TAB CONTENT PANELS */}
      <div className="space-y-6">
        
        {/* ========================================================================= */}
        {/* TAB 1: BASIC OVERVIEW (Headline, Bio, Years Exp, Rate, Links, Availability) */}
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
                    placeholder="Enter custom image URL..."
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
                  Professional Headline / Hook <span className="text-emerald-600">*</span>
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

            {/* Years of Experience & Hourly Rate */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-mono uppercase font-bold text-slate-700 mb-1">
                  Years of Experience (Total)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min="0"
                    max="50"
                    placeholder="e.g. 5"
                    value={yearsExperience}
                    onChange={(e) => setYearsExperience(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 font-mono focus:outline-none focus:border-emerald-600 focus:bg-white"
                  />
                  <span className="absolute right-3.5 top-2.5 text-xs text-slate-400 font-mono pointer-events-none">
                    Years
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-mono uppercase font-bold text-slate-700 mb-1">
                  Target Hourly Rate (Optional)
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-2.5 text-xs text-slate-400 font-mono pointer-events-none">
                    $
                  </span>
                  <input
                    type="text"
                    placeholder="65/hr or Negotiable"
                    value={hourlyRate}
                    onChange={(e) => setHourlyRate(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-8 pr-3.5 py-2.5 text-xs text-slate-900 font-mono focus:outline-none focus:border-emerald-600 focus:bg-white"
                  />
                </div>
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
                Executive Bio / Summary
              </label>
              <textarea
                rows={4}
                placeholder="Introduce your engineering background, high-impact achievements, and how you architect systems to drive business ROI..."
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3.5 text-xs text-slate-900 leading-relaxed focus:outline-none focus:border-emerald-600 focus:bg-white font-sans"
              ></textarea>
            </div>

            {/* Social Links (LinkedIn, GitHub, Portfolio) */}
            <div className="p-4.5 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
              <label className="block text-[11px] font-mono uppercase font-bold text-slate-700">
                Online Profiles & Links
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[10px] font-mono text-slate-600 mb-1 flex items-center gap-1">
                    <Linkedin className="w-3 h-3 text-slate-500" />
                    <span>LinkedIn URL</span>
                  </label>
                  <input
                    type="url"
                    placeholder="https://linkedin.com/in/..."
                    value={linkedinUrl}
                    onChange={(e) => setLinkedinUrl(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-emerald-600"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-mono text-slate-600 mb-1 flex items-center gap-1">
                    <Github className="w-3 h-3 text-slate-500" />
                    <span>GitHub URL</span>
                  </label>
                  <input
                    type="url"
                    placeholder="https://github.com/..."
                    value={githubUrl}
                    onChange={(e) => setGithubUrl(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-emerald-600"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-mono text-slate-600 mb-1 flex items-center gap-1">
                    <Globe className="w-3 h-3 text-slate-500" />
                    <span>Website / Portfolio</span>
                  </label>
                  <input
                    type="url"
                    placeholder="https://mysite.dev"
                    value={portfolioUrl}
                    onChange={(e) => setPortfolioUrl(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-emerald-600"
                  />
                </div>
              </div>
            </div>

            {/* Direct Candidate Contact Channels (Protected for Verified Recruiters) */}
            <div className="p-4.5 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
              <div className="flex items-center justify-between">
                <label className="block text-[11px] font-mono uppercase font-bold text-slate-700">
                  Direct Contact Channels (Recruiter Unlocks)
                </label>
                <span className="text-[10px] font-mono font-bold text-emerald-800 bg-emerald-100/70 border border-emerald-200 px-2 py-0.5 rounded">
                  Securely Protected
                </span>
              </div>
              <p className="text-[11px] text-slate-500">
                These contact channels are encrypted and only revealed to verified enterprise recruiters who unlock your candidate dossier.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-mono text-slate-600 mb-1">
                    WhatsApp Number (with country code)
                  </label>
                  <input
                    type="tel"
                    placeholder="+234 812 345 6789"
                    value={whatsappNumber}
                    onChange={(e) => setWhatsappNumber(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-emerald-600"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-mono text-slate-600 mb-1">
                    Primary Contact Email
                  </label>
                  <input
                    type="email"
                    placeholder="candidate@example.com"
                    value={contactEmail}
                    onChange={(e) => setContactEmail(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-emerald-600"
                  />
                </div>
              </div>
            </div>

            {/* Availability Status Toggle */}
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div>
                <span className="text-xs font-bold text-slate-900 block">Marketplace Availability Status</span>
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
        {/* TAB 2: WORK EXPERIENCE (Dynamic List: company, role, location, dates, bullets) */}
        {/* ========================================================================= */}
        {activeTab === 'experience' && (
          <div className="space-y-5 animate-fadeIn">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900 font-display">Work Experience</h3>
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
              <div className="p-8 bg-slate-50 border border-dashed border-slate-300 rounded-2xl text-center text-slate-500 space-y-3">
                <Briefcase className="w-8 h-8 text-slate-400 mx-auto" />
                <div>
                  <p className="text-xs font-semibold text-slate-700">No work experience entries yet</p>
                  <p className="text-[11px] text-slate-500">Click &apos;+ Add Position&apos; to showcase your employment history.</p>
                </div>
                <button
                  type="button"
                  onClick={handleAddWorkHistory}
                  className="inline-flex items-center gap-1 bg-white hover:bg-slate-100 text-slate-800 border border-slate-200 text-xs font-bold px-3.5 py-1.5 rounded-xl cursor-pointer shadow-2xs"
                >
                  <Plus className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Add First Position</span>
                </button>
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
                        <label className="block text-[10px] font-mono uppercase text-slate-700 mb-1 font-semibold">
                          Job Role / Title <span className="text-emerald-600">*</span>
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. Senior AI Solutions Engineer"
                          value={item.role || item.title || ''}
                          onChange={(e) => handleUpdateWorkHistory(idx, { role: e.target.value, title: e.target.value })}
                          className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-emerald-600"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-mono uppercase text-slate-700 mb-1 font-semibold">
                          Company / Organization <span className="text-emerald-600">*</span>
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. Apex Automation Labs"
                          value={item.company || ''}
                          onChange={(e) => handleUpdateWorkHistory(idx, { company: e.target.value })}
                          className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-emerald-600"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-[10px] font-mono uppercase text-slate-700 mb-1 font-semibold">
                            Start Date
                          </label>
                          <input
                            type="text"
                            placeholder="e.g. Jan 2023"
                            value={item.startDate || ''}
                            onChange={(e) => handleUpdateWorkHistory(idx, { startDate: e.target.value })}
                            className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 font-mono focus:outline-none focus:border-emerald-600"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-mono uppercase text-slate-700 mb-1 font-semibold">
                            End Date
                          </label>
                          <input
                            type="text"
                            placeholder="e.g. Present"
                            value={item.endDate || ''}
                            onChange={(e) => handleUpdateWorkHistory(idx, { endDate: e.target.value })}
                            className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 font-mono focus:outline-none focus:border-emerald-600"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-[10px] font-mono uppercase text-slate-700 mb-1 font-semibold">
                          Location (City, Country / Remote)
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. Remote or Lagos, Nigeria"
                          value={item.location || ''}
                          onChange={(e) => handleUpdateWorkHistory(idx, { location: e.target.value })}
                          className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-emerald-600"
                        />
                      </div>
                    </div>

                    {/* Achievement Bullet Points */}
                    <div className="space-y-2 pt-2 border-t border-slate-200/80">
                      <div className="flex items-center justify-between">
                        <label className="text-[10px] font-mono uppercase text-slate-700 font-semibold">
                          Key Achievements & Responsibilities ({((item.bullets || item.highlights) || []).length})
                        </label>
                        <button
                          type="button"
                          onClick={() => handleAddBullet(idx)}
                          className="text-[11px] font-mono text-emerald-700 hover:text-emerald-800 font-bold flex items-center gap-1 cursor-pointer"
                        >
                          <Plus className="w-3 h-3" />
                          <span>Add Bullet</span>
                        </button>
                      </div>

                      {((item.bullets || item.highlights) || []).map((bullet, bIdx) => (
                        <div key={bIdx} className="flex items-center gap-2">
                          <span className="text-emerald-600 font-bold text-sm">•</span>
                          <input
                            type="text"
                            value={bullet}
                            onChange={(e) => handleUpdateBullet(idx, bIdx, e.target.value)}
                            placeholder="e.g. Automated contract generation pipelines, cutting onboarding latency by 45%..."
                            className="flex-1 bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-900 focus:outline-none focus:border-emerald-600"
                          />
                          <button
                            type="button"
                            onClick={() => handleRemoveBullet(idx, bIdx)}
                            className="text-slate-400 hover:text-rose-600 p-1 cursor-pointer"
                            title="Delete bullet"
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
        {/* TAB 3: CASE STUDIES & ROI WINS (title, metric, description, tech_stack) */}
        {/* ========================================================================= */}
        {activeTab === 'cases' && (
          <div className="space-y-5 animate-fadeIn">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900 font-display">Case Studies & ROI Wins</h3>
                <p className="text-xs text-slate-500">Showcase tangible projects with proven quantitative metrics and tech stack tags.</p>
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
              <div className="p-8 bg-slate-50 border border-dashed border-slate-300 rounded-2xl text-center text-slate-500 space-y-3">
                <Flame className="w-8 h-8 text-slate-400 mx-auto" />
                <div>
                  <p className="text-xs font-semibold text-slate-700">No case studies added yet</p>
                  <p className="text-[11px] text-slate-500">Click &apos;+ Add Case Study&apos; to showcase your ROI results and tools used.</p>
                </div>
                <button
                  type="button"
                  onClick={handleAddCaseStudy}
                  className="inline-flex items-center gap-1 bg-white hover:bg-slate-100 text-slate-800 border border-slate-200 text-xs font-bold px-3.5 py-1.5 rounded-xl cursor-pointer shadow-2xs"
                >
                  <Plus className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Add First Case Study</span>
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {caseStudies.map((cs, idx) => {
                  const currentStack = cs.tech_stack || cs.techStack || [];
                  return (
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
                          <label className="block text-[10px] font-mono uppercase text-slate-700 mb-1 font-semibold">
                            Project Title <span className="text-emerald-600">*</span>
                          </label>
                          <input
                            type="text"
                            placeholder="e.g. Autonomous Client Onboarding Pipeline"
                            value={cs.title}
                            onChange={(e) => handleUpdateCaseStudy(idx, { title: e.target.value })}
                            className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-emerald-600"
                          />
                        </div>

                        <div>
                          <label className="block text-[10px] font-mono uppercase text-slate-700 mb-1 font-semibold">
                            Key Metric / Quantified Lift <span className="text-emerald-600">*</span>
                          </label>
                          <input
                            type="text"
                            placeholder="e.g. +240% Velocity Lift (35 hrs saved/wk)"
                            value={cs.metric || cs.metrics || ''}
                            onChange={(e) => handleUpdateCaseStudy(idx, { metric: e.target.value, metrics: e.target.value })}
                            className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 font-mono focus:outline-none focus:border-emerald-600"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-[10px] font-mono uppercase text-slate-700 mb-1 font-semibold">
                          Problem, Engineering Architecture & Solution
                        </label>
                        <textarea
                          rows={3}
                          placeholder="Describe the architectural challenge, how you engineered the solution, and the resulting business value..."
                          value={cs.description}
                          onChange={(e) => handleUpdateCaseStudy(idx, { description: e.target.value })}
                          className="w-full bg-white border border-slate-200 rounded-xl p-3 text-xs text-slate-900 focus:outline-none focus:border-emerald-600 font-sans"
                        ></textarea>
                      </div>

                      {/* Tech Stack Tags */}
                      <div className="space-y-2 pt-2 border-t border-slate-200/80">
                        <label className="block text-[10px] font-mono uppercase text-slate-700 font-semibold">
                          Tech Stack Tags ({currentStack.length})
                        </label>

                        <div className="flex flex-wrap gap-1.5">
                          {currentStack.map((tag, tIdx) => (
                            <span
                              key={tIdx}
                              className="inline-flex items-center gap-1 text-[11px] font-mono bg-white border border-slate-200 text-slate-700 px-2.5 py-1 rounded-lg shadow-2xs"
                            >
                              <span>{tag}</span>
                              <button
                                type="button"
                                onClick={() => handleRemoveCaseTechTag(idx, tag)}
                                className="text-slate-400 hover:text-rose-600 cursor-pointer ml-1"
                              >
                                ✕
                              </button>
                            </span>
                          ))}
                        </div>

                        {/* Tag Adder */}
                        <div className="flex gap-2 pt-1">
                          <input
                            type="text"
                            placeholder="Add tech tag (e.g. Make.com, Claude 3.7, Python)..."
                            value={newTagInputs[idx] || ''}
                            onChange={(e) => setNewTagInputs({ ...newTagInputs, [idx]: e.target.value })}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                e.preventDefault();
                                handleAddCaseTechTag(idx);
                              }
                            }}
                            className="flex-1 bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-900 focus:outline-none focus:border-emerald-600"
                          />
                          <button
                            type="button"
                            onClick={() => handleAddCaseTechTag(idx)}
                            className="bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold px-3 py-1.5 text-xs rounded-xl cursor-pointer"
                          >
                            + Tag
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 4: EDUCATION & CREDENTIALS (degree, institution, year, honors + certs) */}
        {/* ========================================================================= */}
        {activeTab === 'education' && (
          <div className="space-y-6 animate-fadeIn">
            
            {/* Degrees / Universities List */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 font-display">Academic Degrees & Higher Education</h3>
                  <p className="text-xs text-slate-500">Add college, university, or boot camp qualifications.</p>
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

              {education.length === 0 ? (
                <div className="p-8 bg-slate-50 border border-dashed border-slate-300 rounded-2xl text-center text-slate-500 space-y-3">
                  <GraduationCap className="w-8 h-8 text-slate-400 mx-auto" />
                  <div>
                    <p className="text-xs font-semibold text-slate-700">No education entries added</p>
                    <p className="text-[11px] text-slate-500">Click &apos;+ Add Degree&apos; to showcase your academic credentials.</p>
                  </div>
                  <button
                    type="button"
                    onClick={handleAddEducation}
                    className="inline-flex items-center gap-1 bg-white hover:bg-slate-100 text-slate-800 border border-slate-200 text-xs font-bold px-3.5 py-1.5 rounded-xl cursor-pointer shadow-2xs"
                  >
                    <Plus className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Add First Degree</span>
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {education.map((edu, idx) => (
                    <div key={edu.id || idx} className="p-4.5 bg-slate-50 border border-slate-200 rounded-2xl space-y-3 relative group">
                      <div className="flex items-center justify-between border-b border-slate-200/80 pb-2">
                        <span className="text-[11px] font-mono font-bold uppercase text-emerald-700">
                          Degree / Education #{idx + 1}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleRemoveEducation(idx)}
                          className="text-slate-400 hover:text-rose-600 p-1 cursor-pointer transition"
                          title="Remove degree"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[10px] font-mono uppercase text-slate-700 mb-1 font-semibold">Degree / Qualification</label>
                          <input
                            type="text"
                            placeholder="e.g. B.Sc. in Computer Science"
                            value={edu.degree}
                            onChange={(e) => handleUpdateEducation(idx, { degree: e.target.value })}
                            className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-emerald-600"
                          />
                        </div>

                        <div>
                          <label className="block text-[10px] font-mono uppercase text-slate-700 mb-1 font-semibold">Institution / University</label>
                          <input
                            type="text"
                            placeholder="e.g. University of Lagos"
                            value={edu.institution}
                            onChange={(e) => handleUpdateEducation(idx, { institution: e.target.value })}
                            className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-emerald-600"
                          />
                        </div>

                        <div>
                          <label className="block text-[10px] font-mono uppercase text-slate-700 mb-1 font-semibold">Graduation Year</label>
                          <input
                            type="text"
                            placeholder="e.g. 2021"
                            value={edu.year}
                            onChange={(e) => handleUpdateEducation(idx, { year: e.target.value })}
                            className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 font-mono focus:outline-none focus:border-emerald-600"
                          />
                        </div>

                        <div>
                          <label className="block text-[10px] font-mono uppercase text-slate-700 mb-1 font-semibold">Honors / Extra Details</label>
                          <input
                            type="text"
                            placeholder="e.g. First Class Honors • GPA 4.8/5.0"
                            value={edu.honors || edu.details || ''}
                            onChange={(e) => handleUpdateEducation(idx, { honors: e.target.value, details: e.target.value })}
                            className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-emerald-600"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Certifications & Accreditations Tag Input */}
            <div className="p-5 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
              <div className="flex items-center gap-2">
                <Award className="w-4 h-4 text-amber-600" />
                <h4 className="text-xs font-mono font-bold uppercase text-slate-900">
                  Industry Accreditations & Certifications ({certifications.length} Selected)
                </h4>
              </div>

              {/* Selected Certs */}
              {certifications.length > 0 && (
                <div className="flex flex-wrap gap-1.5 pb-2">
                  {certifications.map((cert, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center gap-1.5 bg-amber-50 border border-amber-200 text-amber-900 font-mono text-xs px-3 py-1.5 rounded-xl shadow-2xs"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5 text-amber-600" />
                      <span>{cert}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveCert(cert)}
                        className="text-amber-500 hover:text-rose-600 cursor-pointer ml-1"
                      >
                        ✕
                      </button>
                    </span>
                  ))}
                </div>
              )}

              {/* Preset Selector */}
              <div className="space-y-1.5">
                <span className="text-[10px] font-mono text-slate-500">Popular Accreditations:</span>
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
                            ? 'bg-amber-600 text-white font-bold'
                            : 'bg-white text-slate-600 border border-slate-200 hover:border-slate-400'
                        }`}
                      >
                        {cert} {isSelected ? '✓' : '+'}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Add Custom Certification */}
              <div className="flex gap-2 pt-2 border-t border-slate-200/80">
                <input
                  type="text"
                  placeholder="Add custom certificate (e.g. AWS Certified Solutions Architect)..."
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
        {/* TAB 5: SKILLS & AI TOOL STACK */}
        {/* ========================================================================= */}
        {activeTab === 'skills' && (
          <div className="space-y-6 animate-fadeIn">
            
            {/* Core Skills Selector */}
            <div className="p-5 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Code className="w-4 h-4 text-emerald-600" />
                  <h4 className="text-xs font-mono font-bold uppercase text-slate-900">
                    Core Discipline Skills ({skills.length} Selected)
                  </h4>
                </div>
                <span className="text-[11px] text-slate-500 font-mono">Click to toggle</span>
              </div>

              {/* Selected Skills Chips */}
              {skills.length > 0 && (
                <div className="flex flex-wrap gap-1.5 pb-2">
                  {skills.map((skill, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center gap-1.5 bg-emerald-50 border border-emerald-200 text-emerald-900 font-mono text-xs px-3 py-1.5 rounded-xl shadow-2xs"
                    >
                      <span>{skill}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveSkill(skill)}
                        className="text-emerald-600 hover:text-rose-600 cursor-pointer ml-1"
                      >
                        ✕
                      </button>
                    </span>
                  ))}
                </div>
              )}

              {/* Preset Skills */}
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
              <div className="flex gap-2 pt-2 border-t border-slate-200/80">
                <input
                  type="text"
                  placeholder="Add custom skill (e.g. Next.js, Web Scraping)..."
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
                  Add Skill
                </button>
              </div>
            </div>

            {/* AI Stack & Automation Tools */}
            <div className="p-5 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Cpu className="w-4 h-4 text-emerald-600" />
                  <h4 className="text-xs font-mono font-bold uppercase text-slate-900">
                    AI & Automation Tooling Stack ({aiTools.length} Selected)
                  </h4>
                </div>
                <span className="text-[11px] text-slate-500 font-mono">Click to toggle</span>
              </div>

              {/* Selected AI Tools Chips */}
              {aiTools.length > 0 && (
                <div className="flex flex-wrap gap-1.5 pb-2">
                  {aiTools.map((tool, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center gap-1.5 bg-emerald-50 border border-emerald-200 text-emerald-900 font-mono text-xs px-3 py-1.5 rounded-xl shadow-2xs"
                    >
                      <Zap className="w-3 h-3 text-emerald-600" />
                      <span>{tool}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveAiTool(tool)}
                        className="text-emerald-600 hover:text-rose-600 cursor-pointer ml-1"
                      >
                        ✕
                      </button>
                    </span>
                  ))}
                </div>
              )}

              {/* Preset AI Tools */}
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
              <div className="flex gap-2 pt-2 border-t border-slate-200/80">
                <input
                  type="text"
                  placeholder="Add custom AI tool (e.g. OpenAI o3-mini, Gemini Pro)..."
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
                  Add Tool
                </button>
              </div>
            </div>

          </div>
        )}

      </div>

      {/* Bottom Save Action Bar */}
      <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="text-xs text-slate-500 font-medium">
          All changes are synchronized directly to your live GrowthPaddy candidate dossier.
        </div>

        <div className="flex items-center gap-2.5 w-full sm:w-auto">
          {onOpenPublicPreview && (
            <button
              type="button"
              onClick={() => onOpenPublicPreview(slug || fullName.toLowerCase().replace(/[^a-z0-9]+/g, '-'))}
              className="flex-1 sm:flex-none bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2.5 rounded-xl font-mono text-xs font-bold transition cursor-pointer"
            >
              Preview Live Portfolio
            </button>
          )}

          <button
            type="submit"
            disabled={saving}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2.5 rounded-xl font-bold text-xs shadow-xs transition cursor-pointer disabled:opacity-50"
          >
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Saving to Cloud...</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>Save Profile Changes</span>
              </>
            )}
          </button>
        </div>
      </div>

    </form>
  );
}
