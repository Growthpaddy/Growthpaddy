import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ShieldCheck, 
  Search, 
  Award, 
  ArrowRight, 
  Sparkles, 
  Briefcase, 
  CheckCircle2, 
  MapPin, 
  Activity, 
  ExternalLink,
  ChevronRight,
  TrendingUp,
  Clock
} from 'lucide-react';
import { TalentCandidate } from '../types';

const MOCK_TALENT: TalentCandidate[] = [
  {
    id: 'T1',
    name: 'Sarah Jenkins',
    avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=150',
    role: 'Growth Marketing Lead',
    specialization: 'Growth Marketing',
    verificationBadge: 'Verified Professional',
    skills: ['Conversion Rate Optimization', 'A/B Testing', 'Google Analytics 4', 'User Acquisition', 'SQL'],
    availability: 'Available Immediately',
    portfolioScore: 98,
    featuredProject: {
      title: 'SaaS User Activation Redesign',
      metrics: '+42% sign-up to trial activation rate'
    },
    experienceCount: 4,
    bio: 'Completed a 6-month elite Growth training scheme. Led a client-facing growth trial boosting activation for two leading FinTech solutions.'
  },
  {
    id: 'T2',
    name: 'Marcus Chen',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=150',
    role: 'AI Automation Operations Architect',
    specialization: 'AI Automation',
    verificationBadge: 'Top Performer',
    skills: ['Zapier Enterprise', 'Make.com', 'Gemini API Orchestration', 'n8n', 'Python Scripts'],
    availability: 'Interviews Open',
    portfolioScore: 99,
    featuredProject: {
      title: 'Customer Onboarding Auto-pilot',
      metrics: 'Reduced client setup delay from 48h to 4m, saving 35 engineer hr/wk'
    },
    experienceCount: 3,
    bio: 'Ranked in top 1% of the AI Automation cohort. Designed and deployed complex custom LLM ingestion loops for high-growth e-commerce agencies.'
  },
  {
    id: 'T3',
    name: 'Amara Okafor',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150',
    role: 'SEO Strategist & Content Architect',
    specialization: 'SEO',
    verificationBadge: 'Verified Professional',
    skills: ['Technical SEO Audit', 'Keyword Intelligence', 'Ahrefs Power-User', 'Programmatic SEO', 'Screaming Frog'],
    availability: 'Available Immediately',
    portfolioScore: 95,
    featuredProject: {
      title: 'Programmatic SEO Directory Build',
      metrics: 'Grew organic traffic from 5k to 120k monthly visits in 90 days'
    },
    experienceCount: 5,
    bio: 'Passionate Technical SEO specialist. Rebranded three enterprise websites and structured high-performance semantic clusters.'
  },
  {
    id: 'T4',
    name: 'Liam Vance',
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=150',
    role: 'Paid Acquisition & PPC Engineer',
    specialization: 'PPC',
    verificationBadge: 'Verified Intern',
    skills: ['Google Paid Search', 'Meta Ads Manager', 'RoAS Strategy', 'Creative Testing', 'Retargeting Flow'],
    availability: 'Available Immediately',
    portfolioScore: 92,
    featuredProject: {
      title: 'B2B Lead Generation Re-modeling',
      metrics: 'Decreased Cost-Per-Lead (CPL) by 31% while maintaining volume'
    },
    experienceCount: 2,
    bio: 'Trained PPC operator with extensive hands-on budget experience during Verifolio Practical Labs. Fully Certified in Google Ads.'
  },
  {
    id: 'T5',
    name: 'Elena Rostova',
    avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=150',
    role: 'Social Media & Brand Builder',
    specialization: 'Social Media',
    verificationBadge: 'Internship Graduate',
    skills: ['Short-form Video Edit', 'Brand Positioning', 'TikTok Analytics', 'Community Moderation', 'CapCut Pro'],
    availability: 'Onboard in 1 Week',
    portfolioScore: 94,
    featuredProject: {
      title: 'Viral Interactive Campaign Launch',
      metrics: '2.4 Million total organic views, 40,000+ brand hashtag uses'
    },
    experienceCount: 3,
    bio: 'Graduate of the premium Social Media Fellowship. Successfully completed a 12-week placements with a high-growth scale-up agency.'
  },
  {
    id: 'T6',
    name: 'David Kim',
    avatarUrl: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&q=80&w=150',
    role: 'Lifecycle & Email Marketer',
    specialization: 'Email Marketing',
    verificationBadge: 'Verified Professional',
    skills: ['Klaviyo Flow Architecture', 'Customer Segmentation', 'Copywriting', 'Deliverability Audit', 'HTML Templates'],
    availability: 'Interviews Open',
    portfolioScore: 96,
    featuredProject: {
      title: 'Abandoned Cart Pipeline Optimize',
      metrics: 'Recovered $142,000 in lost revenue in 60-day window'
    },
    experienceCount: 4,
    bio: 'Certified CRM and lifecycle marketer. Exceptional copywriter focused on behavioral triggers and long-term retention lists.'
  },
  {
    id: 'T7',
    name: 'Sophia Patel',
    avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=150',
    role: 'SEO & Growth Strategist',
    specialization: 'SEO',
    verificationBadge: 'Top Performer',
    skills: ['Content Writing', 'On-Page SEO', 'Link Building', 'Semrush Analytics', 'Google Search Console'],
    availability: 'Available Immediately',
    portfolioScore: 97,
    featuredProject: {
      title: 'SaaS Blog Expansion',
      metrics: 'Secured 45 top-3 Google keyword rankings inside 4 months'
    },
    experienceCount: 3,
    bio: 'Expert at high-intent SEO copywriting. Hand-picked for the Top Performer cohort due to stellar technical competency test scores.'
  },
  {
    id: 'T8',
    name: 'Jordan Miller',
    avatarUrl: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&q=80&w=150',
    role: 'AI Workflows Developer',
    specialization: 'AI Automation',
    verificationBadge: 'Verified Professional',
    skills: ['LangChain Integrations', 'OpenAI API Node Config', 'Database Setup', 'System Prompt Tune', 'Automated Scraping'],
    availability: 'In Placement',
    portfolioScore: 95,
    featuredProject: {
      title: 'Real Estate Deal-Scout AI Agent',
      metrics: 'Automated 2,000 daily listings crawls, routing top 1% opportunities'
    },
    experienceCount: 3,
    bio: 'Software engineer transitioning into specialized AI execution paths. Combines deep classical coding with agentic architectures.'
  }
];

const SPECIALIZATIONS = [
  'All Profiles',
  'SEO',
  'Social Media',
  'Email Marketing',
  'Growth Marketing',
  'PPC',
  'AI Automation'
] as const;

export default function TalentDirectory() {
  const [selectedSpecialization, setSelectedSpecialization] = useState<string>('All Profiles');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCandidate, setSelectedCandidate] = useState<TalentCandidate | null>(MOCK_TALENT[1]); // Preselect T2 for an aesthetic showcase
  const [copiedText, setCopiedText] = useState<string | null>(null);

  // Filter candidates
  const filteredCandidates = MOCK_TALENT.filter(talent => {
    // Check specialty filter
    const matchesSpecialty = selectedSpecialization === 'All Profiles' || talent.specialization === selectedSpecialization;
    // Check search query (name, role, or skills)
    const matchesSearch = 
      talent.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      talent.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
      talent.skills.some(skill => skill.toLowerCase().includes(searchQuery.toLowerCase()));
    
    return matchesSpecialty && matchesSearch;
  });

  const handleCopyLink = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText("Copied URL to Clipboard!");
    setTimeout(() => setCopiedText(null), 2000);
  };

  const getBadgeColors = (badge: TalentCandidate['verificationBadge']) => {
    switch (badge) {
      case 'Verified Professional':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'Top Performer':
        return 'bg-amber-50 text-amber-800 border-amber-200';
      case 'Verified Intern':
        return 'bg-teal-50 text-teal-700 border-teal-200';
      case 'Internship Graduate':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  return (
    <div id="live-talent-directory" className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
      {/* List Panel */}
      <div className="lg:col-span-7 space-y-6">
        
        {/* Search and Filters Header */}
        <div className="bg-white p-5 rounded-2xl border border-neutral-200/80 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
            <h4 className="font-display font-semibold text-lg text-neutral-900 self-start sm:self-center flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping"></span>
              Live Talent Pool
              <span className="text-xs font-mono font-normal text-neutral-400 bg-neutral-100 px-2 py-0.5 rounded-md">
                {filteredCandidates.length} Available Now
              </span>
            </h4>
            
            {/* Search Input */}
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 w-4 h-4" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search skills, names, roles..."
                className="w-full text-sm pl-9 pr-4 py-2 bg-neutral-50/50 border border-neutral-200 rounded-lg focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary placeholder:text-neutral-400 text-neutral-800"
              />
            </div>
          </div>

          {/* Filtering Badges */}
          <div className="flex flex-wrap gap-1.5 pt-2">
            {SPECIALIZATIONS.map((spec) => (
              <button
                key={spec}
                onClick={() => {
                  setSelectedSpecialization(spec);
                  // Auto focus first item on filter change
                  const matched = MOCK_TALENT.find(t => spec === 'All Profiles' || t.specialization === spec);
                  if (matched) {
                    setSelectedCandidate(matched);
                  }
                }}
                className={`py-1.5 px-3.5 rounded-full text-xs font-medium cursor-pointer transition-all duration-200 ${
                  selectedSpecialization === spec
                    ? 'bg-neutral-900 text-white shadow-xs'
                    : 'bg-neutral-50 hover:bg-neutral-100 text-neutral-600 border border-neutral-200/60'
                }`}
              >
                {spec}
              </button>
            ))}
          </div>
        </div>

        {/* Directory Grid */}
        <div className="space-y-3 max-h-[640px] overflow-y-auto pr-1">
          <AnimatePresence mode="popLayout">
            {filteredCandidates.length > 0 ? (
              filteredCandidates.map((candidate) => {
                const isActive = selectedCandidate?.id === candidate.id;
                return (
                  <motion.div
                    key={candidate.id}
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                    onClick={() => setSelectedCandidate(candidate)}
                    className={`p-5 rounded-2xl border-2 text-left cursor-pointer transition-all duration-300 ${
                      isActive
                        ? 'bg-white border-brand-primary shadow-md ring-1 ring-brand-primary/25'
                        : 'bg-white border-neutral-200/80 hover:border-neutral-300 shadow-xs hover:shadow-sm'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex gap-4">
                        <img 
                          src={candidate.avatarUrl} 
                          alt={candidate.name}
                          className="w-12 h-12 rounded-full object-cover border border-neutral-100 shadow-2xs"
                        />
                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <h5 className="font-semibold text-[#111311] group-hover:text-brand-primary text-base">
                              {candidate.name}
                            </h5>
                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium border ${getBadgeColors(candidate.verificationBadge)}`}>
                              <ShieldCheck className="w-3 h-3 flex-shrink-0" />
                              {candidate.verificationBadge}
                            </span>
                          </div>
                          <p className="text-sm font-medium text-neutral-500 mt-0.5">{candidate.role}</p>
                        </div>
                      </div>

                      <div className="text-right hidden sm:block">
                        <span className="text-xs font-mono text-neutral-400">Verifolio Score</span>
                        <p className="text-lg font-bold font-display text-brand-dark flex items-center justify-end gap-1">
                          <Award className="w-4 h-4 text-emerald-500" />
                          {candidate.portfolioScore}
                          <span className="text-xs text-neutral-400 font-normal">/100</span>
                        </p>
                      </div>
                    </div>

                    {/* Skill Badges */}
                    <div className="flex flex-wrap gap-1.5 mt-4">
                      {candidate.skills.slice(0, 3).map((skill, idx) => (
                        <span 
                          key={idx} 
                          className="text-[11px] font-mono font-medium text-neutral-700 bg-neutral-100 px-2 py-0.5 rounded-md"
                        >
                          {skill}
                        </span>
                      ))}
                      {candidate.skills.length > 3 && (
                        <span className="text-[10px] font-mono text-neutral-400 bg-neutral-50 px-2 py-1.5 rounded-md leading-none">
                          +{candidate.skills.length - 3} more
                        </span>
                      )}
                    </div>

                    {/* Footer Row */}
                    <div className="flex items-center justify-between border-t border-neutral-100 mt-4 pt-4 text-xs">
                      <div className="flex items-center gap-2 text-neutral-500">
                        <Clock className="w-3.5 h-3.5 text-neutral-400" />
                        <span className="font-medium text-neutral-600">{candidate.availability}</span>
                      </div>
                      
                      <div className="flex items-center gap-1.5 text-brand-primary font-semibold hover:text-brand-700 group">
                        <span>View Verified Dossier</span>
                        <ChevronRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
                      </div>
                    </div>
                  </motion.div>
                );
              })
            ) : (
              <div className="bg-neutral-50 rounded-2xl border border-dashed border-neutral-300 p-12 text-center">
                <p className="text-neutral-500 text-sm font-medium">No candidates fit your exact filter or search term.</p>
                <button 
                  onClick={() => { setSearchQuery(''); setSelectedSpecialization('All Profiles'); }}
                  className="mt-3 text-xs text-brand-primary underline hover:text-brand-700 font-semibold cursor-pointer"
                >
                  Clear all filters
                </button>
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Detail Panel (Mock SaaS Employer Dashboard Vetting Report) */}
      <div className="lg:col-span-5 sticky top-8">
        <AnimatePresence mode="wait">
          {selectedCandidate ? (
            <motion.div
              key={selectedCandidate.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="bg-white border-2 border-neutral-900 rounded-3xl overflow-hidden shadow-lg p-6 md:p-8 space-y-6"
            >
              {/* Header Box */}
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[10px] uppercase tracking-wider font-mono bg-emerald-100 text-emerald-800 font-bold px-2 py-1 rounded">
                    Verified Candidate Dossier
                  </span>
                  <h3 className="font-display font-bold text-2xl text-neutral-900 mt-3">
                    {selectedCandidate.name}
                  </h3>
                  <p className="text-emerald-600 font-semibold text-sm mt-0.5 flex items-center gap-1.5">
                    <Briefcase className="w-3.5 h-3.5" />
                    {selectedCandidate.role}
                  </p>
                </div>
                <img 
                  src={selectedCandidate.avatarUrl} 
                  alt={selectedCandidate.name} 
                  className="w-16 h-16 rounded-full object-cover border-2 border-neutral-900 shadow-md"
                />
              </div>

              {/* Bio summary */}
              <p className="text-sm leading-relaxed text-neutral-600 font-normal border-l-2 border-emerald-500 pl-4 py-1 italic">
                "{selectedCandidate.bio}"
              </p>

              {/* Vetting Assessment Table */}
              <div className="space-y-3 bg-neutral-50/80 p-4 rounded-2xl border border-neutral-200">
                <h5 className="font-mono text-xs font-bold text-neutral-400 uppercase tracking-widest flex items-center justify-between">
                  <span>Verified Credentials</span>
                  <span className="text-brand-primary">100% Legit</span>
                </h5>
                
                <div className="grid grid-cols-2 gap-4 pt-2">
                  <div className="space-y-1">
                    <span className="text-xs text-neutral-500">Structured Training</span>
                    <p className="text-sm font-semibold text-neutral-800 flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                      Completed (100%)
                    </p>
                  </div>
                  <div className="space-y-1">
                    <span className="text-xs text-neutral-500">Technical Assessment</span>
                    <p className="text-sm font-semibold text-neutral-800 flex items-center gap-1.5">
                      <Activity className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                      Passed (Score: {selectedCandidate.portfolioScore}%)
                    </p>
                  </div>
                  <div className="space-y-1">
                    <span className="text-xs text-neutral-500">Identity & Reference</span>
                    <p className="text-sm font-semibold text-neutral-800 flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                      KYC Verified
                    </p>
                  </div>
                  <div className="space-y-1">
                    <span className="text-xs text-neutral-500">Practical Projects</span>
                    <p className="text-sm font-semibold text-neutral-800 flex items-center gap-1.5">
                      <TrendingUp className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                      {selectedCandidate.experienceCount} Live Delivered
                    </p>
                  </div>
                </div>
              </div>

              {/* Featured Project Showcase */}
              <div className="space-y-3">
                <h4 className="font-display font-semibold text-base text-neutral-900 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-500" />
                  Featured Verified Deliverable
                </h4>
                <div className="bg-white border border-neutral-200 p-4 rounded-xl shadow-2xs space-y-2">
                  <h5 className="font-semibold text-sm text-neutral-800 flex items-center justify-between">
                    <span>{selectedCandidate.featuredProject.title}</span>
                    <ExternalLink className="w-3.5 h-3.5 text-neutral-400" />
                  </h5>
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-emerald-50 text-[11px] font-mono font-semibold text-emerald-800 border border-emerald-100">
                    Impact: {selectedCandidate.featuredProject.metrics}
                  </div>
                  <p className="text-xs text-neutral-500">
                    This business outcome was achieved during a structured internship facilitated and audited directly on the Verifolio platform.
                  </p>
                </div>
              </div>

              {/* All Candidate Competencies list */}
              <div className="space-y-2">
                <label className="text-xs font-mono font-bold text-neutral-400 uppercase tracking-widest block">
                  Verified Skill Map
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {selectedCandidate.skills.map((skill, index) => (
                    <span
                      key={index}
                      className="text-xs font-medium text-neutral-800 bg-brand-50 border border-brand-200/55 px-2.5 py-1 rounded-lg"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              {/* Action Trigger Buttons for SaaS Employer Vibe */}
              <div className="pt-4 space-y-3">
                <button 
                  onClick={() => handleCopyLink(`https://verifolio.com/talent/${selectedCandidate.id}`)}
                  className="w-full bg-[#111311] hover:bg-neutral-800 text-white font-medium py-3 px-4 rounded-xl text-sm transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer shadow-sm hover:shadow"
                >
                  <span>Request Candidate Interview</span>
                  <ArrowRight className="w-4 h-4 text-emerald-400" />
                </button>
                
                <div className="flex gap-2.5">
                  <button 
                    onClick={() => handleCopyLink(`https://verifolio.com/dossier/${selectedCandidate.id}`)}
                    className="flex-1 text-center border border-neutral-200 bg-white hover:bg-neutral-50 text-neutral-700 font-medium py-2 rounded-lg text-xs transition duration-150 cursor-pointer"
                  >
                    Share Dossier Link
                  </button>
                  <a 
                    href="#how-it-works"
                    className="flex-1 text-center border border-neutral-200 bg-white hover:bg-neutral-50 text-neutral-700 font-medium py-2 rounded-lg text-xs flex items-center justify-center gap-1 transition duration-150"
                  >
                    <span>Vetting Standard</span>
                  </a>
                </div>
                {copiedText && (
                  <p className="text-xs text-center text-emerald-600 font-medium animate-pulse">
                    {copiedText}
                  </p>
                )}
              </div>
            </motion.div>
          ) : (
            <div className="bg-neutral-50 rounded-3xl border-2 border-dashed border-neutral-200 p-12 text-center h-[500px] flex flex-col justify-center items-center">
              <ShieldCheck className="w-12 h-12 text-neutral-300 mb-3" />
              <p className="text-neutral-500 font-medium">Select any verified profile on the left to review their complete capability dossier.</p>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
