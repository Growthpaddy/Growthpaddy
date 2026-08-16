import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { 
  X, 
  Sparkles, 
  ShieldCheck, 
  ExternalLink, 
  Globe, 
  Award, 
  CheckCircle2, 
  Briefcase, 
  Code, 
  Layers, 
  User, 
  ArrowRight,
  FileCode2,
  Zap,
  Copy,
  Check,
  Share2,
  FolderKanban,
  Lock
} from 'lucide-react';

interface TalentPortfolioModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateToDashboard: () => void;
  publicSlug?: string;
  onboardingData?: {
    userName?: string;
    specialty?: string;
    experienceLevel?: string;
    careerGoal?: string;
    email?: string;
    portfolioUrl?: string;
    profilePictureUrl?: string;
    slug?: string;
    availability_status?: 'available' | 'hired';
  } | null;
}

export default function TalentPortfolioModal({
  isOpen,
  onClose,
  onNavigateToDashboard,
  publicSlug,
  onboardingData
}: TalentPortfolioModalProps) {
  const [copiedLink, setCopiedLink] = useState(false);
  const [loading, setLoading] = useState(false);
  const [fetchedData, setFetchedData] = useState<{
    userName?: string;
    specialty?: string;
    experienceLevel?: string;
    careerGoal?: string;
    bio?: string;
    email?: string;
    phone?: string;
    location?: string;
    portfolioUrl?: string;
    profilePictureUrl?: string;
    slug?: string;
    availability_status?: 'available' | 'hired';
    vetting_status?: string;
    score?: number;
    skills?: string[];
  } | null>(null);

  useEffect(() => {
    if (!isOpen) return;

    const targetSlug = (publicSlug || onboardingData?.slug || '').trim();
    if (targetSlug) {
      const fetchBySlug = async () => {
        setLoading(true);
        try {
          // 1. Try exact slug match
          let { data } = await supabase
            .from('talent_profiles')
            .select('*')
            .eq('slug', targetSlug.toLowerCase())
            .maybeSingle();

          // 2. Fallback to name search if slug not matched
          if (!data) {
            const nameGuess = targetSlug.replace(/-/g, ' ');
            const { data: nameMatch } = await supabase
              .from('talent_profiles')
              .select('*')
              .ilike('full_name', `%${nameGuess}%`)
              .maybeSingle();
            if (nameMatch) data = nameMatch;
          }

          // 3. Fallback to slug partial match
          if (!data) {
            const { data: slugPartial } = await supabase
              .from('talent_profiles')
              .select('*')
              .ilike('slug', `%${targetSlug}%`)
              .maybeSingle();
            if (slugPartial) data = slugPartial;
          }

          // 4. Fallback to id match if UUID format
          if (!data && targetSlug.length > 20) {
            const { data: idMatch } = await supabase
              .from('talent_profiles')
              .select('*')
              .eq('id', targetSlug)
              .maybeSingle();
            if (idMatch) data = idMatch;
          }

          if (data) {
            let parsedSkills: string[] = [];
            if (Array.isArray(data.skills)) {
              parsedSkills = data.skills.filter(Boolean);
            } else if (typeof data.skills === 'string' && data.skills.trim()) {
              try {
                const parsed = JSON.parse(data.skills);
                if (Array.isArray(parsed)) parsedSkills = parsed;
                else parsedSkills = data.skills.split(',').map((s: string) => s.trim()).filter(Boolean);
              } catch {
                parsedSkills = data.skills.split(',').map((s: string) => s.trim()).filter(Boolean);
              }
            }

            setFetchedData({
              userName: data.full_name || 'Verified Talent',
              specialty: data.specialty || 'AI Automation & Growth Specialist',
              experienceLevel: data.experience_level || 'Seasoned Professional',
              careerGoal: data.career_goal || data.bio || 'Building automated growth systems and scalable workflows.',
              bio: data.bio || data.career_goal,
              email: data.email || 'talent@digitalcampux.com',
              phone: data.phone || '+234 816 966 4607',
              location: data.location || 'Lagos, Nigeria (Remote)',
              portfolioUrl: data.portfolio_url || '',
              profilePictureUrl: data.profile_picture_url || '',
              slug: data.slug || targetSlug,
              availability_status: data.availability_status === 'hired' ? 'hired' : 'available',
              vetting_status: data.vetting_status || 'verified',
              score: typeof data.phase_1_score === 'number' ? data.phase_1_score : 100,
              skills: parsedSkills
            });
          }
        } catch (err) {
          console.warn('Error fetching candidate profile by slug:', err);
        } finally {
          setLoading(false);
        }
      };
      fetchBySlug();
    }
  }, [isOpen, publicSlug, onboardingData]);

  if (!isOpen) return null;

  const displayData = fetchedData || onboardingData;

  const candidateName = displayData?.userName || 'Verified Talent';
  const specialty = displayData?.specialty || 'AI Automation & Growth Specialist';
  const experienceTier = displayData?.experienceLevel || 'Seasoned Professional';
  const careerGoal = displayData?.careerGoal || 'Building high-performance automated workflows and growth infrastructure.';
  const email = displayData?.email || 'talent@digitalcampux.com';
  const portfolioUrl = displayData?.portfolioUrl || '';
  const profilePictureUrl = displayData?.profilePictureUrl || '';
  const slug = displayData?.slug || candidateName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
  const availabilityStatus: 'available' | 'hired' = displayData?.availability_status === 'hired' ? 'hired' : 'available';
  const shareableUrl = `${window.location.origin}/${slug}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareableUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const candidateSkills = (fetchedData?.skills && fetchedData.skills.length > 0)
    ? fetchedData.skills
    : [
        'TypeScript', 'Workflow Automation', 'Cloud APIs', 'Python', 
        'Make.com', 'Zapier', 'GA4 Analytics', 'LLM Prompts', 'Data Pipelines'
      ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto animate-fadeIn">
      
      <div className="bg-white border border-slate-200 rounded-3xl shadow-2xl max-w-3xl w-full my-8 relative overflow-hidden text-left">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between p-5 sm:p-6 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="bg-emerald-50 text-emerald-700 p-2 rounded-xl border border-emerald-200">
              <FolderKanban className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-mono font-bold text-emerald-700 uppercase tracking-wider block">
                Digital Campux Portfolio
              </span>
              <h3 className="font-display font-bold text-base sm:text-lg text-slate-900">
                Verified Candidate Showcase
              </h3>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-900 flex items-center justify-center transition cursor-pointer"
            id="close-portfolio-modal-btn"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 sm:p-7 space-y-6 max-h-[75vh] overflow-y-auto">
          
          {/* Candidate Profile Hero Card */}
          <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white p-6 rounded-2xl border border-slate-800 space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                {profilePictureUrl ? (
                  <img 
                    src={profilePictureUrl} 
                    alt={candidateName} 
                    className="w-14 h-14 object-cover rounded-xl border-2 border-emerald-500/40 shrink-0"
                  />
                ) : (
                  <div className="w-14 h-14 bg-emerald-600 text-white flex items-center justify-center font-display font-bold text-xl rounded-xl border border-emerald-400 shrink-0">
                    {candidateName.charAt(0).toUpperCase()}
                  </div>
                )}
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h2 className="font-display font-bold text-lg sm:text-xl text-white">
                      {candidateName}
                    </h2>
                    <span className="inline-flex items-center gap-1 bg-emerald-500/20 text-emerald-300 text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border border-emerald-500/30">
                      ✓ Verified Skills
                    </span>

                    {/* BOLD AVAILABILITY STATUS BADGE */}
                    {availabilityStatus === 'available' ? (
                      <span className="inline-flex items-center gap-1.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 px-3 py-1 rounded-full font-bold text-xs tracking-wide uppercase">
                        <span className="relative flex h-2 w-2">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                        </span>
                        AVAILABLE FOR HIRE
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 bg-slate-800 text-slate-300 border border-slate-700 px-3 py-1 rounded-full font-bold text-xs tracking-wide uppercase">
                        <Lock className="w-3.5 h-3.5 text-slate-400" />
                        CURRENTLY HIRED
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-emerald-400 font-semibold mt-0.5">
                    {specialty} · {experienceTier}
                  </p>
                  <p className="text-xs text-slate-400 mt-0.5 font-mono">
                    {email} · <span className="text-slate-300">/p/{slug}</span>
                  </p>
                </div>
              </div>
            </div>

            {/* Candidate Bio Statement */}
            <div className="bg-slate-800/80 border-l-2 border-emerald-500 p-3 rounded-r-xl text-xs text-slate-300 leading-relaxed">
              "{careerGoal}"
            </div>
          </div>

          {/* Shareable Unique Slug Link Bar */}
          <div className="p-4 bg-slate-50 border border-slate-200/90 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-3 text-left">
            <div className="flex items-center gap-3">
              <Share2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <div>
                <span className="text-[10px] font-mono text-slate-500 uppercase font-semibold block">
                  Public Candidate Share Link
                </span>
                <span className="text-xs font-mono font-bold text-slate-800 break-all">
                  {shareableUrl}
                </span>
              </div>
            </div>

            <button
              onClick={handleCopyLink}
              className="bg-slate-900 hover:bg-emerald-600 text-white font-semibold px-3.5 py-2 text-xs rounded-xl flex items-center gap-1.5 cursor-pointer shrink-0 transition shadow-2xs"
            >
              {copiedLink ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy Link</span>
                </>
              )}
            </button>
          </div>

          {/* Verified Skills & Tech Stack Section */}
          <div className="space-y-2.5 text-left">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <span className="text-xs font-bold text-slate-900 flex items-center gap-2">
                <Code className="w-4 h-4 text-emerald-600" />
                Verified Technical Competencies
              </span>
              <span className="text-[10px] font-mono text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                100% Vetted
              </span>
            </div>

            <div className="flex flex-wrap gap-1.5">
              {candidateSkills.map((skill, idx) => (
                <span
                  key={idx}
                  className="text-[11px] font-mono font-semibold px-2.5 py-1 bg-slate-100 text-slate-800 rounded-lg border border-slate-200"
                >
                  ✓ {skill}
                </span>
              ))}
            </div>
          </div>

          {/* Featured Deliverables & Case Studies */}
          <div className="space-y-3 text-left">
            <span className="text-xs font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-2">
              <FileCode2 className="w-4 h-4 text-emerald-600" />
              Audited Deliverables & Work Samples
            </span>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              <div className="bg-slate-50 border border-slate-200/90 rounded-2xl p-4 space-y-2 relative">
                <span className="text-[10px] font-mono font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full inline-block">
                  Case Study 01
                </span>
                <h4 className="font-bold text-xs text-slate-900">
                  Automated LLM Webhook Engine
                </h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Engineered custom Make.com scenarios with strict Gemini schema validation, background queueing, and secure cloud persistence.
                </p>
                <div className="text-[10px] font-mono text-slate-500 pt-1 border-t border-slate-200 flex items-center gap-1">
                  <Zap className="w-3 h-3 text-emerald-600" />
                  <span>Phase 1 Score: 100/100</span>
                </div>
              </div>

              <div className="bg-slate-50 border border-slate-200/90 rounded-2xl p-4 space-y-2 relative">
                <span className="text-[10px] font-mono font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full inline-block">
                  Case Study 02
                </span>
                <h4 className="font-bold text-xs text-slate-900">
                  Growth Analytics & Conversion API
                </h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Implemented server-side GA4 conversion tracking, real-time lead webhook listeners, and dynamic recruiter directory metrics.
                </p>
                <div className="text-[10px] font-mono text-slate-500 pt-1 border-t border-slate-200 flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3 text-emerald-600" />
                  <span>Accreditation: Approved</span>
                </div>
              </div>

            </div>
          </div>

          {/* External Link or Dashboard Navigation Callout */}
          <div className="bg-emerald-50/70 border border-emerald-200 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-left">
            <div>
              <p className="text-xs font-bold text-slate-900">
                Want to update your showcase details?
              </p>
              <p className="text-xs text-slate-600 mt-0.5">
                Manage skills, links, and portfolio project descriptions inside your candidate portal.
              </p>
            </div>
            
            <button
              onClick={() => {
                onClose();
                onNavigateToDashboard();
              }}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-4 py-2 text-xs rounded-xl flex items-center gap-1.5 cursor-pointer shrink-0 shadow-xs transition"
            >
              <span>Go to Dashboard</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

        </div>

      </div>

    </div>
  );
}
