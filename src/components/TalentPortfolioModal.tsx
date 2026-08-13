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
  FolderKanban
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
  const [fetchedData, setFetchedData] = useState<{
    userName?: string;
    specialty?: string;
    experienceLevel?: string;
    careerGoal?: string;
    email?: string;
    portfolioUrl?: string;
    profilePictureUrl?: string;
    slug?: string;
  } | null>(null);

  useEffect(() => {
    if (!isOpen) return;

    const targetSlug = publicSlug || onboardingData?.slug;
    if (targetSlug && publicSlug) {
      const fetchBySlug = async () => {
        try {
          const { data } = await supabase
            .from('talent_profiles')
            .select('*')
            .eq('slug', targetSlug)
            .maybeSingle();

          if (data) {
            setFetchedData({
              userName: data.full_name || 'Verified Operator',
              specialty: data.specialty || 'AI Automation & Growth Specialist',
              experienceLevel: data.experience_level || 'Seasoned Professional',
              careerGoal: data.career_goal || 'Building automated growth systems',
              email: data.email || 'talent@growthpaddy.com',
              portfolioUrl: data.portfolio_url || '',
              profilePictureUrl: data.profile_picture_url || '',
              slug: data.slug || targetSlug
            });
          }
        } catch (err) {
          console.warn('Error fetching candidate profile by slug:', err);
        }
      };
      fetchBySlug();
    }
  }, [isOpen, publicSlug, onboardingData]);

  if (!isOpen) return null;

  const displayData = fetchedData || onboardingData;

  const candidateName = displayData?.userName || 'Verified Talent Operator';
  const specialty = displayData?.specialty || 'AI Automation & Growth Engineer';
  const experienceTier = displayData?.experienceLevel || 'Seasoned Professional';
  const careerGoal = displayData?.careerGoal || 'Building high-performance automated workflows and growth infrastructure.';
  const email = displayData?.email || 'talent@growthpaddy.com';
  const portfolioUrl = displayData?.portfolioUrl || '';
  const profilePictureUrl = displayData?.profilePictureUrl || '';
  const slug = displayData?.slug || candidateName.toLowerCase().replace(/[^a-z0-9]+/g, '-');
  const shareableUrl = `${window.location.origin}/p/${slug}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareableUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const defaultSkills = [
    'TypeScript', 'Supabase', 'React', 'Vite', 'Python', 
    'Make.com', 'Zapier', 'GA4 Analytics', 'LLM Prompts', 'PostgreSQL'
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-neutral-950/80 backdrop-blur-xs p-4 overflow-y-auto animate-fadeIn">
      
      <div className="bg-white border-4 border-neutral-950 shadow-[10px_10px_0px_0px_rgba(0,168,107,1)] max-w-3xl w-full my-8 relative overflow-hidden text-left">
        
        {/* Top Accent Bar */}
        <div className="h-2 w-full bg-[#00A86B]" />

        {/* Modal Header */}
        <div className="flex items-center justify-between p-5 border-b-2 border-neutral-950 bg-neutral-50">
          <div className="flex items-center gap-2.5">
            <div className="bg-neutral-950 text-emerald-400 p-2 font-mono font-black border border-neutral-950">
              <FolderKanban className="w-5 h-5 text-[#00A86B]" />
            </div>
            <div>
              <span className="text-[9px] font-mono font-black text-[#00A86B] uppercase tracking-widest block">
                GROWTHPADDY DEDICATED PORTFOLIO
              </span>
              <h3 className="font-display font-black text-lg text-neutral-950 uppercase tracking-tight">
                VERIFIED TALENT SHOWCASE
              </h3>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 border-2 border-neutral-950 bg-white hover:bg-rose-50 text-neutral-950 hover:text-rose-600 transition-colors cursor-pointer"
            id="close-portfolio-modal-btn"
          >
            <X className="w-5 h-5 stroke-[3px]" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          
          {/* Candidate Profile Hero Card */}
          <div className="bg-neutral-950 text-white p-6 border-2 border-neutral-950 relative overflow-hidden space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                {profilePictureUrl ? (
                  <img 
                    src={profilePictureUrl} 
                    alt={candidateName} 
                    className="w-16 h-16 object-cover border-2 border-[#00A86B] shrink-0"
                  />
                ) : (
                  <div className="w-16 h-16 bg-[#00A86B] text-white flex items-center justify-center font-display font-black text-2xl border-2 border-white shrink-0">
                    {candidateName.charAt(0).toUpperCase()}
                  </div>
                )}
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h2 className="font-display font-black text-xl text-white uppercase tracking-tight">
                      {candidateName}
                    </h2>
                    <span className="inline-flex items-center gap-1 bg-amber-400 text-neutral-950 text-[9px] font-mono font-black px-2 py-0.5 border border-neutral-950 uppercase">
                      <Award className="w-3 h-3 text-neutral-950" />
                      VERIFIED OPERATOR
                    </span>
                  </div>
                  <p className="text-xs font-mono font-bold text-emerald-400 uppercase mt-0.5">
                    ⚡ {specialty} • {experienceTier}
                  </p>
                  <p className="text-[10px] font-mono text-neutral-400 mt-1">
                    {email} • <span className="text-emerald-400 font-bold">/p/{slug}</span>
                  </p>
                </div>
              </div>

              {/* Action Link to External Portfolio if configured */}
              {portfolioUrl ? (
                <a
                  href={portfolioUrl.startsWith('http') ? portfolioUrl : `https://${portfolioUrl}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-[#00A86B] hover:bg-emerald-600 text-white font-mono font-black px-4 py-2 text-xs uppercase tracking-wider border-2 border-white flex items-center gap-2 cursor-pointer shrink-0 shadow-[2px_2px_0px_0px_rgba(255,255,255,1)] hover:shadow-none transition-all"
                >
                  <ExternalLink className="w-4 h-4" />
                  <span>OPEN LIVE PORTFOLIO</span>
                </a>
              ) : (
                <button
                  onClick={() => {
                    onClose();
                    onNavigateToDashboard();
                  }}
                  className="bg-amber-400 hover:bg-amber-500 text-neutral-950 font-mono font-black px-3.5 py-2 text-[10px] uppercase tracking-wider border-2 border-neutral-950 flex items-center gap-1.5 cursor-pointer shrink-0"
                >
                  <Globe className="w-3.5 h-3.5" />
                  <span>ADD PORTFOLIO LINK</span>
                </button>
              )}
            </div>

            {/* Candidate Bio Statement */}
            <div className="bg-neutral-900 border-l-4 border-[#00A86B] p-3 text-xs text-neutral-300 font-medium leading-relaxed">
              "{careerGoal}"
            </div>
          </div>

          {/* Shareable Unique Slug Link Bar */}
          <div className="p-3.5 bg-neutral-100 border-2 border-neutral-950 flex flex-col sm:flex-row items-center justify-between gap-3 text-left">
            <div className="flex items-center gap-2">
              <Share2 className="w-4 h-4 text-[#00A86B] shrink-0" />
              <div>
                <span className="text-[9px] font-mono font-bold text-neutral-500 uppercase block">
                  PUBLIC PORTFOLIO HANDLE
                </span>
                <span className="text-xs font-mono font-black text-neutral-900 break-all">
                  {shareableUrl}
                </span>
              </div>
            </div>

            <button
              onClick={handleCopyLink}
              className="bg-neutral-950 hover:bg-neutral-800 text-white font-mono font-black px-3.5 py-2 text-[10px] uppercase tracking-wider border-2 border-neutral-950 flex items-center gap-1.5 cursor-pointer shrink-0"
            >
              {copiedLink ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400">COPIED LINK!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>COPY PORTFOLIO LINK</span>
                </>
              )}
            </button>
          </div>

          {/* Verified Skills & Tech Stack Section */}
          <div className="space-y-3 text-left">
            <div className="flex items-center justify-between border-b-2 border-neutral-200 pb-1.5">
              <span className="text-xs font-mono font-black text-neutral-950 uppercase tracking-wider flex items-center gap-2">
                <Code className="w-4 h-4 text-[#00A86B]" />
                VERIFIED TECHNICAL STACK & COMPETENCIES
              </span>
              <span className="text-[10px] font-mono font-bold text-neutral-500 uppercase">
                100% VETTED
              </span>
            </div>

            <div className="flex flex-wrap gap-1.5">
              {defaultSkills.map((skill, idx) => (
                <span
                  key={idx}
                  className="text-[10px] font-mono uppercase font-black px-2.5 py-1 bg-emerald-50 text-emerald-900 border border-emerald-800"
                >
                  ✓ {skill}
                </span>
              ))}
            </div>
          </div>

          {/* Featured Deliverables & Case Studies */}
          <div className="space-y-3 text-left">
            <span className="text-xs font-mono font-black text-neutral-950 uppercase tracking-wider flex items-center gap-2 border-b-2 border-neutral-200 pb-1.5">
              <FileCode2 className="w-4 h-4 text-[#00A86B]" />
              FEATURED PORTFOLIO DELIVERABLES
            </span>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              <div className="bg-neutral-50 border-2 border-neutral-950 p-4 space-y-2 relative">
                <span className="text-[9px] font-mono font-black text-[#00A86B] bg-emerald-100 px-2 py-0.5 border border-neutral-950 uppercase inline-block">
                  PROJECT CASE STUDY 01
                </span>
                <h4 className="font-display font-black text-sm uppercase text-neutral-950">
                  Automated LLM Webhook Engine
                </h4>
                <p className="text-xs text-neutral-600 font-medium leading-relaxed">
                  Engineered custom Make.com scenarios with strict Gemini schema validation, background queueing, and Supabase database persistence.
                </p>
                <div className="text-[9px] font-mono font-bold text-neutral-500 pt-1 border-t border-neutral-200 flex items-center gap-1">
                  <Zap className="w-3 h-3 text-[#00A86B]" />
                  <span>Phase 1 Practical Audit Score: 100/100</span>
                </div>
              </div>

              <div className="bg-neutral-50 border-2 border-neutral-950 p-4 space-y-2 relative">
                <span className="text-[9px] font-mono font-black text-[#00A86B] bg-emerald-100 px-2 py-0.5 border border-neutral-950 uppercase inline-block">
                  PROJECT CASE STUDY 02
                </span>
                <h4 className="font-display font-black text-sm uppercase text-neutral-950">
                  Growth Analytics & Conversion API
                </h4>
                <p className="text-xs text-neutral-600 font-medium leading-relaxed">
                  Implemented server-side GA4 conversion tracking, real-time lead webhook listeners, and dynamic recruiter directory metrics.
                </p>
                <div className="text-[9px] font-mono font-bold text-neutral-500 pt-1 border-t border-neutral-200 flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3 text-[#00A86B]" />
                  <span>Accreditation Verification: Passed</span>
                </div>
              </div>

            </div>
          </div>

          {/* External Link or Dashboard Navigation Callout */}
          <div className="bg-emerald-50 border-2 border-neutral-950 p-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-left">
            <div>
              <p className="text-xs font-black uppercase text-neutral-950">
                WANT TO UPDATE OR EXTEND YOUR PORTFOLIO?
              </p>
              <p className="text-[11px] text-neutral-600 font-medium mt-0.5">
                You can manage skills, links, and portfolio details directly in your candidate dashboard.
              </p>
            </div>
            
            <button
              onClick={() => {
                onClose();
                onNavigateToDashboard();
              }}
              className="bg-neutral-950 hover:bg-neutral-900 text-white font-mono font-black px-4 py-2 text-xs uppercase tracking-widest border-2 border-neutral-950 flex items-center gap-2 cursor-pointer shrink-0 shadow-[2px_2px_0px_0px_rgba(0,168,107,1)] hover:shadow-none"
            >
              <span>GOTO DASHBOARD</span>
              <ArrowRight className="w-4 h-4 text-emerald-400" />
            </button>
          </div>

        </div>

      </div>

    </div>
  );
}

function FolderIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg 
      {...props}
      fill="none" 
      stroke="currentColor" 
      viewBox="0 0 24 24" 
      xmlns="http://www.w3.org/2000/svg"
    >
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
    </svg>
  );
}
