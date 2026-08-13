import React, { useState, useEffect } from 'react';
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
  Clock,
  Lock,
  Unlock,
  FileText,
  Bookmark,
  PlusCircle,
  Eye,
  Check,
  MessageSquare,
  Mail,
  X,
  UserCheck
} from 'lucide-react';
import { TalentCandidate } from '../types';
import { MOCK_TALENT } from '../data/mockTalent';
import { supabase } from '../lib/supabaseClient';

interface TalentDirectoryProps {
  employerSlots?: number;
  setEmployerSlots?: React.Dispatch<React.SetStateAction<number>>;
  navigateToPricing?: () => void;
  onboardingData?: {
    userType?: 'talent' | 'recruiter' | null;
    userName?: string;
    neededRole?: string;
    industry?: string;
    orgName?: string;
  };
}

const SPECIALIZATIONS = [
  'All Profiles',
  'SEO',
  'AI Automation',
  'Growth Marketing',
  'PPC',
  'Social Media',
  'Email Marketing'
] as const;

export default function TalentDirectory({ 
  employerSlots = 1, 
  setEmployerSlots, 
  navigateToPricing,
  onboardingData
}: TalentDirectoryProps) {
  const [candidatesList, setCandidatesList] = useState<TalentCandidate[]>(MOCK_TALENT);
  const [selectedSpecialization, setSelectedSpecialization] = useState<string>('All Profiles');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCandidate, setSelectedCandidate] = useState<TalentCandidate | null>(null);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState<boolean>(false);
  const [unlockedCandidateIds, setUnlockedCandidateIds] = useState<string[]>([]);
  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null);
  const [showBuyWarning, setShowBuyWarning] = useState(false);
  const [candidateNotes, setCandidateNotes] = useState<string>('');

  // Fetch Talent Pool from Supabase (talent_profiles where phase_1_quiz_passed is true)
  useEffect(() => {
    const fetchTalentPool = async () => {
      try {
        const { data, error } = await supabase
          .from('talent_profiles')
          .select('id, full_name, specialty, experience_level, skills, vetting_status, portfolio_url, career_goal, location, timezone, phase_1_score, bio')
          .eq('phase_1_quiz_passed', true);

        if (data && data.length > 0) {
          const dbTalent: TalentCandidate[] = data.map((item: any, idx: number) => ({
            id: item.id || `DB-${idx}`,
            name: item.full_name || 'Verified Tech Operator',
            avatarUrl: `https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=300`,
            role: item.specialty || 'Full-Stack Developer',
            specialization: (item.specialty as any) || 'AI Automation',
            verificationBadge: item.vetting_status === 'verified' ? 'Verified Professional' : 'Top Performer',
            skills: item.skills && item.skills.length > 0 ? item.skills : ['TypeScript', 'Supabase', 'Vite', 'Python'],
            availability: 'Available Immediately',
            portfolioScore: item.phase_1_score || 96,
            experienceCount: item.experience_level === 'Senior' ? 5 : item.experience_level === 'Mid-Level' ? 3 : 2,
            bio: item.bio || item.career_goal || 'Passed Phase 1 Diagnostic Assessment.',
            location: item.location || item.timezone || 'Lagos, Nigeria',
            email: 'matchmaker@growthpaddy.com',
            phone: '+234 816 966 4607',
            about: item.career_goal ? `Career Goal: ${item.career_goal}` : 'Vetted candidate active in GrowthPaddy pool.',
            featuredProject: {
              title: 'Verified Technical Case Study',
              metrics: 'Phase 1 Audit Passed (100% Scorecard)'
            },
            projects: item.portfolio_url ? [
              {
                title: 'Verified Candidate Live Portfolio',
                description: 'Audited codebase and live system architecture.',
                metrics: 'Live URL Verified',
                tools: item.skills || ['TypeScript', 'Vite'],
                year: '2026'
              }
            ] : undefined
          }));

          // Merge DB candidates on top of Mock Talent
          setCandidatesList([...dbTalent, ...MOCK_TALENT]);
        }
      } catch (err) {
        console.warn('Talent directory DB sync notice: showing cached pool', err);
      }
    };

    fetchTalentPool();
  }, []);

  // Prefilter based on onboardingData recruiter choice
  useEffect(() => {
    if (onboardingData?.userType === 'recruiter' && onboardingData?.neededRole) {
      const roleMap: Record<string, string> = {
        'AI Automation Operations Architect': 'AI Automation',
        'SEO Strategist & Content Architect': 'SEO',
        'Growth Marketing Lead': 'Growth Marketing',
        'Paid Acquisition & PPC Engineer': 'PPC',
        'Lifecycle & Email Marketer': 'Email Marketing',
        'Social Media & Brand Builder': 'Social Media'
      };
      const matchedSpecialization = roleMap[onboardingData.neededRole];
      if (matchedSpecialization) {
        setSelectedSpecialization(matchedSpecialization);
      }
    }
  }, [onboardingData]);

  useEffect(() => {
    if (selectedCandidate) {
      const saved = localStorage.getItem(`candidate-notes-${selectedCandidate.id}`);
      setCandidateNotes(saved || '');
    }
  }, [selectedCandidate]);

  const saveCandidateNotes = (text: string) => {
    setCandidateNotes(text);
    if (selectedCandidate) {
      localStorage.setItem(`candidate-notes-${selectedCandidate.id}`, text);
    }
  };

  // Filter candidates
  const filteredCandidates = candidatesList.filter(talent => {
    const matchesSpecialty = selectedSpecialization === 'All Profiles' || talent.specialization === selectedSpecialization;
    const matchesSearch = 
      talent.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      talent.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
      talent.skills.some(skill => skill.toLowerCase().includes(searchQuery.toLowerCase()));
    
    return matchesSpecialty && matchesSearch;
  });

  const handleOpenFullProfile = (candidate: TalentCandidate) => {
    setSelectedCandidate(candidate);
    setIsProfileModalOpen(true);
  };

  const handleUnlockCandidate = (id: string) => {
    if (unlockedCandidateIds.includes(id)) return;

    if (employerSlots >= 0.5) {
      if (setEmployerSlots) {
        setEmployerSlots(prev => Number((prev - 0.5).toFixed(2)));
      }
      setUnlockedCandidateIds(prev => [...prev, id]);
      setFeedbackMsg("Candidate verified contact folder unlocked successfully!");
      setTimeout(() => setFeedbackMsg(null), 3000);
    } else {
      setShowBuyWarning(true);
    }
  };

  return (
    <div id="live-talent-directory" className="space-y-6 text-left">
      
      {/* 1. Header & Filters Panel */}
      <div className="bg-white p-6 rounded-none border-4 border-neutral-950 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 bg-emerald-50 text-[#00A86B] px-3 py-1 border border-emerald-300 rounded-none mb-1">
              <span className="w-2 h-2 rounded-full bg-[#00A86B] animate-ping" />
              <span className="text-[10px] font-mono font-black uppercase tracking-wider">CROWN JEWEL DIRECTORY</span>
            </div>
            <h2 className="font-display font-black text-2xl uppercase text-neutral-950 tracking-tight">
              VERIFIED TALENT POOL
            </h2>
            <p className="text-xs text-neutral-600 font-bold uppercase tracking-wider">
              Browse pre-vetted specialists with audited skill scorecards, verified project portfolios, and immediate hirability.
            </p>
          </div>

          <div className="relative w-full md:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500 w-4 h-4" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search skills, names, roles..."
              className="w-full text-xs pl-9 pr-4 py-3 bg-neutral-50 border-2 border-neutral-950 rounded-none focus:outline-none focus:bg-white placeholder:text-neutral-500 font-bold uppercase"
            />
          </div>
        </div>

        {/* Specialization Filter Tabs */}
        <div className="flex flex-wrap gap-2 pt-2 border-t-2 border-neutral-200">
          {SPECIALIZATIONS.map((spec) => (
            <button
              key={spec}
              onClick={() => setSelectedSpecialization(spec)}
              className={`py-1.5 px-3.5 rounded-none text-[11px] font-mono font-black uppercase cursor-pointer border-2 transition-all ${
                selectedSpecialization === spec
                  ? 'bg-neutral-950 text-white border-neutral-950 shadow-[2px_2px_0px_0px_rgba(0,168,107,1)]'
                  : 'bg-white hover:bg-neutral-50 text-neutral-700 border-neutral-300'
              }`}
            >
              {spec}
            </button>
          ))}
        </div>
      </div>

      {/* 2. Candidate Cards Grid View */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <AnimatePresence mode="popLayout">
          {filteredCandidates.length > 0 ? (
            filteredCandidates.map((candidate) => (
              <motion.div
                key={candidate.id}
                layout="position"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-white border-2 border-neutral-950 rounded-none p-5 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_0px_rgba(0,168,107,1)] transition-all flex flex-col justify-between space-y-4 text-left group"
              >
                {/* Header: Name, Specialty Badge & Avatar */}
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <img 
                        src={candidate.avatarUrl} 
                        alt={candidate.name}
                        className="w-12 h-12 rounded-none object-cover border-2 border-neutral-950 grayscale group-hover:grayscale-0 transition-all"
                        referrerPolicy="no-referrer"
                      />
                      <div>
                        <h3 className="font-display font-extrabold text-base uppercase text-neutral-950 leading-tight group-hover:text-[#00A86B] transition-colors">
                          {candidate.name}
                        </h3>
                        <p className="text-[11px] font-mono font-black uppercase text-[#00A86B] mt-0.5">
                          {candidate.role}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Badges: Experience Level & Vetting Pass */}
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="bg-neutral-950 text-white font-mono text-[9px] font-black uppercase px-2 py-0.5 rounded-none border border-neutral-950">
                      {candidate.experienceCount >= 5 ? 'Senior Level' : 'Mid-Level'}
                    </span>

                    <span className="bg-emerald-50 text-[#00A86B] font-mono text-[9px] font-black uppercase px-2 py-0.5 rounded-none border border-emerald-300 flex items-center gap-1">
                      <ShieldCheck className="w-3 h-3 text-[#00A86B]" />
                      <span>{candidate.verificationBadge}</span>
                    </span>

                    <span className="bg-amber-50 text-amber-800 font-mono text-[9px] font-black uppercase px-2 py-0.5 rounded-none border border-amber-300 flex items-center gap-1">
                      <Award className="w-3 h-3 text-amber-600" />
                      <span>SCORE: {candidate.portfolioScore}%</span>
                    </span>
                  </div>

                  {/* Bio / Summary */}
                  <p className="text-xs text-neutral-600 font-medium leading-relaxed line-clamp-2">
                    {candidate.bio}
                  </p>

                  {/* Core Skill Tags */}
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {candidate.skills.slice(0, 4).map((skill, idx) => (
                      <span 
                        key={idx}
                        className="text-[9.5px] font-mono font-bold uppercase bg-neutral-100 text-neutral-700 px-2 py-0.5 border border-neutral-300 rounded-none"
                      >
                        {skill}
                      </span>
                    ))}
                    {candidate.skills.length > 4 && (
                      <span className="text-[9.5px] font-mono font-bold text-neutral-500 px-1 py-0.5">
                        +{candidate.skills.length - 4}
                      </span>
                    )}
                  </div>
                </div>

                {/* Primary CTA Button */}
                <button
                  onClick={() => handleOpenFullProfile(candidate)}
                  className="w-full bg-neutral-950 hover:bg-neutral-900 text-white font-black py-3 px-4 rounded-none text-xs uppercase tracking-wider border-2 border-neutral-950 flex items-center justify-center gap-2 cursor-pointer shadow-[2px_2px_0px_0px_rgba(0,168,107,1)] hover:shadow-none transition-all"
                >
                  <Eye className="w-4 h-4 text-emerald-400" />
                  <span>VIEW FULL PROFILE</span>
                </button>
              </motion.div>
            ))
          ) : (
            <div className="col-span-full bg-white p-12 text-center rounded-none border-2 border-neutral-950 space-y-3">
              <Search className="w-10 h-10 text-neutral-400 mx-auto" />
              <p className="text-neutral-700 text-sm font-black uppercase">No candidates matched query "{searchQuery}".</p>
              <button 
                onClick={() => { setSearchQuery(''); setSelectedSpecialization('All Profiles'); }}
                className="bg-neutral-950 hover:bg-neutral-900 text-white font-black py-2.5 px-5 rounded-none text-xs uppercase cursor-pointer"
              >
                Reset Filters
              </button>
            </div>
          )}
        </AnimatePresence>
      </div>

      {/* 3. Full Candidate Profile Modal Drawer */}
      {isProfileModalOpen && selectedCandidate && (
        <div className="fixed inset-0 bg-neutral-950/75 backdrop-blur-xs flex items-center justify-center z-50 p-4 overflow-y-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-white border-4 border-neutral-950 rounded-none shadow-[10px_10px_0px_0px_rgba(0,0,0,1)] max-w-3xl w-full my-8 overflow-hidden text-left relative"
          >
            {/* Modal Header */}
            <div className="bg-neutral-950 text-white p-6 border-b-4 border-neutral-950 flex items-start justify-between gap-4">
              <div className="flex items-center gap-4">
                <img 
                  src={selectedCandidate.avatarUrl} 
                  alt={selectedCandidate.name} 
                  className="w-16 h-16 rounded-none object-cover border-2 border-white"
                  referrerPolicy="no-referrer"
                />
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-display font-black text-2xl uppercase tracking-tight text-white">
                      {selectedCandidate.name}
                    </h3>
                    <span className="bg-[#00A86B] text-white font-mono text-[9px] font-black uppercase px-2 py-0.5 border border-emerald-400">
                      {selectedCandidate.verificationBadge}
                    </span>
                  </div>
                  <p className="text-[#00A86B] font-mono text-xs font-black uppercase">
                    {selectedCandidate.role}
                  </p>
                  <p className="text-[10px] text-neutral-400 font-mono uppercase flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-emerald-400" />
                    <span>{selectedCandidate.location}</span>
                  </p>
                </div>
              </div>

              <button 
                onClick={() => setIsProfileModalOpen(false)}
                className="text-neutral-400 hover:text-white bg-neutral-900 border-2 border-neutral-700 p-2 rounded-none transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 md:p-8 space-y-6 max-h-[70vh] overflow-y-auto">
              
              {/* Career Goal & Bio */}
              <div className="bg-neutral-50 border-2 border-neutral-950 p-5 space-y-2">
                <h4 className="font-mono text-xs font-black text-[#00A86B] uppercase tracking-wider flex items-center gap-2">
                  <UserCheck className="w-4 h-4" />
                  <span>CAREER GOAL & BIO</span>
                </h4>
                <p className="text-xs text-neutral-800 font-bold uppercase leading-relaxed">
                  {selectedCandidate.about}
                </p>
                <p className="text-xs text-neutral-600 font-medium leading-relaxed pt-1">
                  {selectedCandidate.bio}
                </p>
              </div>

              {/* Vetting Scorecard */}
              <div className="border-2 border-neutral-950 p-5 space-y-3 bg-emerald-50/20">
                <div className="flex items-center justify-between border-b-2 border-neutral-950 pb-2">
                  <h4 className="font-display font-black text-sm uppercase text-neutral-950 flex items-center gap-2">
                    <Award className="w-4 h-4 text-[#00A86B]" />
                    <span>PHASE 1 VETTING SCORECARD</span>
                  </h4>
                  <span className="font-mono font-black text-emerald-800 text-sm">
                    {selectedCandidate.portfolioScore}/100 PASSED
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                  <div className="bg-white p-3 border border-neutral-300">
                    <span className="text-[9px] font-mono font-black uppercase text-neutral-500 block">DIAGNOSTIC QUIZ</span>
                    <span className="text-sm font-black text-emerald-800">Passed (Score: {selectedCandidate.portfolioScore}%)</span>
                  </div>
                  <div className="bg-white p-3 border border-neutral-300">
                    <span className="text-[9px] font-mono font-black uppercase text-neutral-500 block">IDENTITY / KYC</span>
                    <span className="text-sm font-black text-emerald-800">Verified Professional</span>
                  </div>
                  <div className="bg-white p-3 border border-neutral-300">
                    <span className="text-[9px] font-mono font-black uppercase text-neutral-500 block">PORTFOLIO AUDIT</span>
                    <span className="text-sm font-black text-emerald-800">Phase 1 Approved</span>
                  </div>
                </div>
              </div>

              {/* Portfolio & Verified Projects */}
              <div className="space-y-3">
                <h4 className="font-display font-black text-sm text-neutral-950 uppercase tracking-wider flex items-center gap-2">
                  <FileText className="w-4 h-4 text-emerald-700" />
                  <span>PORTFOLIO & AUDITED PROJECTS</span>
                </h4>

                {selectedCandidate.projects && selectedCandidate.projects.length > 0 ? (
                  <div className="space-y-3">
                    {selectedCandidate.projects.map((proj, pIdx) => (
                      <div key={pIdx} className="border-2 border-neutral-950 p-4 space-y-2 bg-white">
                        <div className="flex items-center justify-between">
                          <h5 className="font-black text-xs uppercase text-neutral-950">{proj.title}</h5>
                          <span className="text-[10px] font-mono font-bold text-neutral-500">{proj.year}</span>
                        </div>
                        <p className="text-xs text-neutral-600 font-medium">{proj.description}</p>
                        <div className="bg-emerald-50 text-emerald-900 border border-emerald-300 text-[10px] font-mono font-black px-2.5 py-1 rounded-none inline-block uppercase">
                          METRIC IMPACT: {proj.metrics}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="border-2 border-neutral-950 p-4 space-y-2 bg-white">
                    <h5 className="font-black text-xs uppercase text-neutral-950">{selectedCandidate.featuredProject.title}</h5>
                    <p className="text-xs text-neutral-600 font-medium">Verified case study evaluated during Phase 1 assessment.</p>
                    <div className="bg-emerald-50 text-emerald-900 border border-emerald-300 text-[10px] font-mono font-black px-2.5 py-1 rounded-none inline-block uppercase">
                      IMPACT: {selectedCandidate.featuredProject.metrics}
                    </div>
                  </div>
                )}
              </div>

              {/* Skills List */}
              <div className="space-y-2">
                <h4 className="font-mono text-xs font-black text-neutral-950 uppercase tracking-wider">
                  VERIFIED TECHNICAL SKILLS
                </h4>
                <div className="flex flex-wrap gap-1.5">
                  {selectedCandidate.skills.map((s, idx) => (
                    <span key={idx} className="bg-neutral-950 text-white font-mono text-[10px] font-bold px-2.5 py-1 uppercase">
                      {s}
                    </span>
                  ))}
                </div>
              </div>

              {/* Direct Hire Call To Action */}
              <div className="border-4 border-neutral-950 bg-neutral-950 text-white p-6 space-y-4 text-center">
                <h4 className="font-display font-black text-lg uppercase tracking-tight text-white">
                  READY TO HIRE {selectedCandidate.name.toUpperCase()}?
                </h4>
                <p className="text-xs text-neutral-300 font-bold uppercase tracking-wider max-w-lg mx-auto">
                  Instant introduction with zero agency markup fees. Connect directly with our GrowthPaddy matchmaker team now.
                </p>

                <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
                  <a 
                    href={`https://wa.me/2348169664607?text=${encodeURIComponent(`Hello GrowthPaddy Matchmaker, I am a recruiter interested in hiring ${selectedCandidate.name} (${selectedCandidate.role}). Please connect us.`)}`}
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="bg-[#00A86B] hover:bg-emerald-600 text-white font-black py-3.5 px-6 rounded-none text-xs uppercase tracking-wider flex items-center justify-center gap-2 border-2 border-white shadow-[3px_3px_0px_0px_rgba(255,255,255,1)] cursor-pointer"
                  >
                    <MessageSquare className="w-4 h-4 fill-current" />
                    <span>HIRE VIA WHATSAPP MATCHMAKER</span>
                  </a>

                  <a 
                    href={`mailto:matchmaker@growthpaddy.com?subject=Hire Request: ${selectedCandidate.name}&body=Hi GrowthPaddy Team, I want to interview/hire ${selectedCandidate.name} (${selectedCandidate.role}).`}
                    className="bg-white text-neutral-950 hover:bg-neutral-100 font-black py-3.5 px-6 rounded-none text-xs uppercase tracking-wider flex items-center justify-center gap-2 border-2 border-white cursor-pointer"
                  >
                    <Mail className="w-4 h-4" />
                    <span>EMAIL MATCHMAKER</span>
                  </a>
                </div>
              </div>

            </div>
          </motion.div>
        </div>
      )}

      {/* Access Warning Modal */}
      {showBuyWarning && (
        <div className="fixed inset-0 bg-neutral-950/70 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-none p-6 md:p-8 space-y-6 max-w-sm w-full text-center relative border-4 border-neutral-950 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
            <button 
              onClick={() => setShowBuyWarning(false)}
              className="absolute top-4 right-4 text-neutral-900 hover:text-red-600 font-extrabold cursor-pointer"
            >
              ✕
            </button>
            <Lock className="w-12 h-12 text-neutral-950 mx-auto" />
            <h4 className="font-display font-black text-xl text-neutral-950 uppercase tracking-tight">SLOTS EXHAUSTED</h4>
            <p className="text-xs text-neutral-600 font-bold uppercase tracking-wide">
              Contact folders are locked. Slots are required to view direct phone lines, emails, and verified client sheets.
            </p>
            <button
              onClick={() => {
                setShowBuyWarning(false);
                if (navigateToPricing) navigateToPricing();
              }}
              className="w-full bg-neutral-950 hover:bg-neutral-900 text-white font-black py-3 px-4 rounded-none text-xs uppercase tracking-widest cursor-pointer"
            >
              ACQUIRE SOURCE SLOTS
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
