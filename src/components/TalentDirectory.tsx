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
  Check
} from 'lucide-react';
import { TalentCandidate } from '../types';
import { MOCK_TALENT } from '../data/mockTalent';

interface TalentDirectoryProps {
  employerSlots?: number;
  setEmployerSlots?: React.Dispatch<React.SetStateAction<number>>;
  navigateToPricing?: () => void;
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
  navigateToPricing 
}: TalentDirectoryProps) {
  const [selectedSpecialization, setSelectedSpecialization] = useState<string>('All Profiles');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCandidate, setSelectedCandidate] = useState<TalentCandidate | null>(MOCK_TALENT[0]);
  const [unlockedCandidateIds, setUnlockedCandidateIds] = useState<string[]>([]);
  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null);
  const [showBuyWarning, setShowBuyWarning] = useState(false);
  
  // Local Notes State (Keys map as: candidate-notes-[candidate.id])
  const [candidateNotes, setCandidateNotes] = useState<string>('');

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
  const filteredCandidates = MOCK_TALENT.filter(talent => {
    const matchesSpecialty = selectedSpecialization === 'All Profiles' || talent.specialization === selectedSpecialization;
    const matchesSearch = 
      talent.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      talent.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
      talent.skills.some(skill => skill.toLowerCase().includes(searchQuery.toLowerCase()));
    
    return matchesSpecialty && matchesSearch;
  });

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

  const getBadgeColors = (badge: TalentCandidate['verificationBadge']) => {
    switch (badge) {
      case 'Verified Professional':
        return 'bg-emerald-50 text-emerald-800 border-emerald-250';
      case 'Top Performer':
        return 'bg-amber-50 text-amber-800 border-amber-200';
      case 'Verified Intern':
        return 'bg-teal-50 text-teal-700 border-teal-200';
      case 'Internship Graduate':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      default:
        return 'bg-neutral-50 text-neutral-700 border-neutral-200';
    }
  };

  return (
    <div id="live-talent-directory" className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
      
      {/* 1. Filter and list panel */}
      <div className="lg:col-span-7 space-y-4">
        
        {/* Search, Filter Panel */}
        <div className="bg-white p-5 rounded-none border-2 border-neutral-950 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] space-y-4 text-left">
          <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
            <h4 className="font-display font-black text-sm uppercase text-neutral-950 flex items-center gap-2">
              <span className="w-2.5 h-2.5 bg-emerald-500 animate-pulse"></span>
              TALENT DIRECTORY
              <span className="text-[10px] font-mono font-bold text-neutral-500 bg-neutral-100 px-2 py-0.5 border border-neutral-200">
                {filteredCandidates.length} ACTIVE
              </span>
            </h4>
            
            {/* Search inputs */}
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-600 w-4 h-4" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search skills, names, roles..."
                className="w-full text-xs pl-9 pr-4 py-2.5 bg-neutral-50 border-2 border-neutral-950 rounded-none focus:outline-none focus:bg-white placeholder:text-neutral-500 font-bold uppercase"
              />
            </div>
          </div>

          {/* Specialization filtering tags */}
          <div className="flex flex-wrap gap-1">
            {SPECIALIZATIONS.map((spec) => (
              <button
                key={spec}
                onClick={() => {
                  setSelectedSpecialization(spec);
                  const matched = MOCK_TALENT.find(t => spec === 'All Profiles' || t.specialization === spec);
                  if (matched) {
                    setSelectedCandidate(matched);
                  }
                }}
                className={`py-1 px-3 rounded-none text-[10px] font-black uppercase cursor-pointer border-2 transition-all ${
                  selectedSpecialization === spec
                    ? 'bg-neutral-950 text-white border-neutral-950'
                    : 'bg-white hover:bg-neutral-50 text-neutral-700 border-neutral-200'
                }`}
              >
                {spec}
              </button>
            ))}
          </div>
        </div>

        {/* Directory Card rows scroll container */}
        <div className="space-y-3 max-h-[700px] overflow-y-auto pr-1">
          <AnimatePresence mode="popLayout">
            {filteredCandidates.length > 0 ? (
              filteredCandidates.map((candidate) => {
                const isActive = selectedCandidate?.id === candidate.id;
                return (
                  <motion.div
                    key={candidate.id}
                    layout="position"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.96 }}
                    transition={{ duration: 0.15 }}
                    onClick={() => setSelectedCandidate(candidate)}
                    className={`p-4 rounded-none border-2 text-left cursor-pointer transition-all ${
                      isActive
                        ? 'bg-neutral-950 text-white border-neutral-950 shadow-[4px_4px_0px_0px_rgba(16,185,129,1)]'
                        : 'bg-white border-neutral-300 hover:border-neutral-950 hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex gap-3">
                        <img 
                          src={candidate.avatarUrl} 
                          alt={candidate.name}
                          className="w-11 h-11 rounded-none object-cover border-2 border-neutral-950 grayscale"
                          referrerPolicy="no-referrer"
                        />
                        <div>
                          <div className="flex flex-wrap items-center gap-1.5 animate-fadeIn">
                            <h5 className={`font-display font-black text-sm uppercase ${isActive ? 'text-white' : 'text-neutral-955'}`}>
                              {candidate.name}
                            </h5>
                            <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-none text-[8px] font-mono font-black uppercase border leading-none ${isActive ? 'bg-emerald-950 text-emerald-450 border-emerald-400' : 'bg-emerald-50 text-emerald-800 border-emerald-200'}`}>
                              <ShieldCheck className="w-2.5 h-2.5 flex-shrink-0" />
                              {candidate.verificationBadge}
                            </span>
                          </div>
                          <p className={`text-[11px] font-black uppercase mt-1 ${isActive ? 'text-emerald-450' : 'text-emerald-800'}`}>{candidate.role}</p>
                          <p className={`text-[9px] uppercase font-bold mt-0.5 flex items-center gap-1 ${isActive ? 'text-neutral-400' : 'text-neutral-500'}`}>
                            <MapPin className="w-3 h-3" />
                            <span>{candidate.location}</span>
                          </p>
                        </div>
                      </div>

                      {/* Score Badge */}
                      <div className="text-right hidden sm:block">
                        <span className={`text-[8px] font-mono font-black uppercase tracking-wide block ${isActive ? 'text-neutral-400' : 'text-neutral-400'}`}>SCORE</span>
                        <p className={`text-base font-black font-display flex items-center justify-end gap-0.5 mt-0.5 ${isActive ? 'text-white' : 'text-neutral-950'}`}>
                          <Award className={`w-3.5 h-3.5 ${isActive ? 'text-emerald-450' : 'text-emerald-600'}`} />
                          {candidate.portfolioScore}
                          <span className={`text-2xs font-normal ${isActive ? 'text-neutral-500' : 'text-neutral-400'}`}>/100</span>
                        </p>
                      </div>
                    </div>

                    <p className={`text-xs mt-2.5 leading-relaxed line-clamp-1 ${isActive ? 'text-neutral-300' : 'text-neutral-600 font-medium'}`}>
                      {candidate.bio}
                    </p>

                    {/* Skill Badges */}
                    <div className="flex flex-wrap gap-1 mt-2.5">
                      {candidate.skills.slice(0, 3).map((skill, idx) => (
                        <span 
                          key={idx} 
                          className={`text-[9px] font-mono uppercase font-bold px-2 py-0.5 border ${
                            isActive 
                              ? 'bg-neutral-900 border-neutral-700 text-neutral-300' 
                              : 'bg-neutral-50 border-neutral-200 text-neutral-600'
                          }`}
                        >
                          {skill}
                        </span>
                      ))}
                      {candidate.skills.length > 3 && (
                        <span className={`text-[9px] font-mono uppercase font-black px-1.5 py-0.5 border border-transparent ${isActive ? 'text-neutral-400' : 'text-neutral-500'}`}>
                          +{candidate.skills.length - 3} more
                        </span>
                      )}
                    </div>

                    {/* Footer Row */}
                    <div className={`flex items-center justify-between border-t border-dashed mt-3 pt-2.5 text-[10px] ${isActive ? 'border-neutral-800' : 'border-neutral-150'}`}>
                      <div className="flex items-center gap-1.5">
                        <Clock className={`w-3 h-3 ${isActive ? 'text-emerald-400' : 'text-emerald-600'}`} />
                        <span className={`font-black uppercase ${isActive ? 'text-neutral-300' : 'text-neutral-700'}`}>{candidate.availability}</span>
                      </div>
                      
                      <div className={`flex items-center gap-1 font-black uppercase ${isActive ? 'text-emerald-400' : 'text-emerald-800'}`}>
                        <span>VIEW GRID</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </div>
                    </div>
                  </motion.div>
                );
              })
            ) : (
              <div className="bg-white p-12 text-center rounded-none border-2 border-neutral-950">
                <Search className="w-8 h-8 text-neutral-400 mx-auto mb-2" />
                <p className="text-neutral-700 text-xs font-black uppercase">No candidates matched {selectedSpecialization}.</p>
                <button 
                  onClick={() => { setSearchQuery(''); setSelectedSpecialization('All Profiles'); }}
                  className="mt-3 bg-neutral-950 hover:bg-neutral-900 text-white font-black py-2.5 px-4 rounded-none text-xs uppercase cursor-pointer"
                >
                  Reset
                </button>
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* 2. Candidate expanded detailed panel */}
      <div className="lg:col-span-5 sticky top-24">
        <AnimatePresence mode="wait">
          {selectedCandidate ? (
            <motion.div
              key={selectedCandidate.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="bg-white border-2 border-neutral-950 rounded-none shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] flex flex-col min-h-[500px]"
            >
              
              {/* Profile Header Image / Name block */}
              <div className="p-6 border-b-2 border-neutral-950 space-y-4 text-left relative bg-neutral-50">
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-2">
                    <span className="text-[9px] uppercase font-mono font-black bg-neutral-950 text-white px-2 py-0.5 rounded-none tracking-wider">
                      AUDITED OPERATOR
                    </span>
                    <h3 className="font-display font-black text-2xl uppercase text-neutral-950 leading-tight pt-1">
                      {selectedCandidate.name}
                    </h3>
                    <p className="text-emerald-800 font-black text-xs uppercase flex items-center gap-1.5">
                      <Briefcase className="w-3.5 h-3.5" />
                      {selectedCandidate.role}
                    </p>
                    <p className="text-[10px] text-neutral-500 font-mono font-bold uppercase">ID REF: {selectedCandidate.id}</p>
                  </div>

                  <img 
                    src={selectedCandidate.avatarUrl} 
                    alt={selectedCandidate.name} 
                    className="w-16 h-16 rounded-none object-cover border-2 border-neutral-950 grayscale"
                    referrerPolicy="no-referrer"
                  />
                </div>

                <p className="text-xs text-neutral-600 font-medium uppercase tracking-wide leading-relaxed">
                  {selectedCandidate.about}
                </p>
              </div>

              {/* Scrollable contents: Projects, Certifications, Recommendations */}
              <div className="flex-1 p-6 space-y-6 overflow-y-auto max-h-[460px] text-left">
                
                {/* 1. Verified Credentials Graph */}
                <div className="space-y-3 bg-neutral-50 border-2 border-neutral-950 p-4 rounded-none shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                  <span className="text-[9px] font-mono uppercase font-black text-neutral-500 tracking-wider block">SKILL VALIDATION AUDIT</span>
                  
                  <div className="space-y-1.5 pt-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-neutral-700 font-black uppercase text-[10px]">CORE COMPETENCE</span>
                      <span className="font-mono font-black text-emerald-800">{selectedCandidate.portfolioScore}%</span>
                    </div>
                    <div className="w-full bg-neutral-200 h-2 rounded-none overflow-hidden border border-neutral-400">
                      <div className="bg-emerald-600 h-full rounded-none" style={{ width: `${selectedCandidate.portfolioScore}%` }} />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 pt-2">
                    <div className="flex items-center gap-1.5 text-[10px] uppercase font-bold text-neutral-700">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                      <span>KYC AUDITED</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-[10px] uppercase font-bold text-neutral-700">
                      <Award className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                      <span>{selectedCandidate.experienceCount} METRIC REPORTS</span>
                    </div>
                  </div>
                </div>

                {/* 2. Contact Credentials - Locked/Unlocked State */}
                <div className="border-2 border-neutral-950 rounded-none p-4 space-y-3.5 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                  <div className="flex items-center justify-between border-b border-neutral-200 pb-2.5">
                    <span className="text-[10px] font-mono uppercase font-black text-neutral-500">CONTACT CREDENTIALS</span>
                    
                    {unlockedCandidateIds.includes(selectedCandidate.id) ? (
                      <span className="inline-flex items-center gap-1 text-[9px] bg-emerald-50 text-emerald-800 font-mono font-black px-2 py-0.5 rounded-none border border-emerald-300 uppercase">
                        <Unlock className="w-3 h-3 text-emerald-600" />
                        UNLOCKED
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[9px] bg-amber-50 text-amber-800 font-mono font-black px-2 py-0.5 rounded-none border border-amber-300 uppercase animate-pulse">
                        <Lock className="w-3 h-3 text-amber-600" />
                        LOCKED
                      </span>
                    )}
                  </div>

                  {unlockedCandidateIds.includes(selectedCandidate.id) ? (
                    <div className="text-[11px] space-y-2 font-mono">
                      <p className="flex justify-between border-b border-dashed border-neutral-250 pb-1.5">
                        <span className="text-neutral-400 uppercase">EMAIL:</span>
                        <span className="text-neutral-950 font-black select-all">{selectedCandidate.email}</span>
                      </p>
                      <p className="flex justify-between border-b border-dashed border-neutral-250 pb-1.5">
                        <span className="text-neutral-400 uppercase">PHONE:</span>
                        <span className="text-neutral-950 font-black select-all">{selectedCandidate.phone}</span>
                      </p>
                      <p className="flex justify-between pb-1">
                        <span className="text-neutral-400 uppercase">VERIFIED LINK:</span>
                        <span className="text-emerald-700 font-black underline select-all cursor-pointer">dsp.pro/{selectedCandidate.id.toLowerCase()}</span>
                      </p>
                    </div>
                  ) : (
                    <div className="py-4 space-y-4">
                      {/* High impact value loss indicator */}
                      <div className="bg-neutral-50 border border-neutral-300 p-3.5 space-y-3 text-left">
                        <span className="text-[9px] font-mono font-black text-rose-700 uppercase tracking-wider block">
                          ⚠️ VALUE AT RISK OF BEING LOST:
                        </span>
                        
                        <div className="space-y-2 text-[10.5px] font-bold text-neutral-700 uppercase tracking-wide">
                          <p className="flex items-start gap-2">
                            <span className="text-rose-600 font-mono text-xs leading-none">✕</span>
                            <span><strong>Direct Hirability:</strong> Miss out on directly emailing & interviewing this operator. Middlemen recruiters charge 20% commission; here, hiring is completely direct.</span>
                          </p>
                          <p className="flex items-start gap-2">
                            <span className="text-rose-600 font-mono text-xs leading-none">✕</span>
                            <span><strong>Verified Metric Impact:</strong> Lose access to this professional's verified results: <span className="text-indigo-800 font-black">"{selectedCandidate.featuredProject?.metrics || 'Proven ROI'}"</span>.</span>
                          </p>
                          <p className="flex items-start gap-2">
                            <span className="text-rose-600 font-mono text-xs leading-none">✕</span>
                            <span><strong>Onboarding Asset Protection:</strong> Wasting an estimated 40+ hours filtering unverified resumes on standard job boards instead of instant contact.</span>
                          </p>
                        </div>
                      </div>

                      <div className="text-center space-y-2.5">
                        <p className="text-[10px] text-neutral-500 uppercase font-bold tracking-wide">
                          Use 0.5 sourcing slots to protect your hiring timeline.
                        </p>
                        <button
                          onClick={() => handleUnlockCandidate(selectedCandidate.id)}
                          className="w-full bg-neutral-950 hover:bg-neutral-900 border-2 border-neutral-950 text-white font-black py-3.5 rounded-none text-xs uppercase flex items-center justify-center gap-1.5 cursor-pointer shadow-[3px_3px_0px_0px_rgba(16,185,129,1)] hover:shadow-none transition-all duration-150"
                        >
                          <Unlock className="w-4 h-4 text-emerald-400" />
                          <span>UNLOCK FULL DIRECT CONTACT DIRECTORY</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* 3. Verified Projects Output */}
                <div className="space-y-3">
                  <h4 className="font-display font-black text-sm text-neutral-900 uppercase tracking-wider">VERIFIED PROJECTS</h4>
                  {selectedCandidate.projects && selectedCandidate.projects.length > 0 ? (
                    <div className="space-y-3">
                      {selectedCandidate.projects.map((proj, pIdx) => (
                        <div key={pIdx} className="border-2 border-neutral-950 p-3.5 rounded-none space-y-2 bg-neutral-50/25">
                          <div className="flex items-center justify-between gap-2">
                            <h5 className="font-black text-neutral-950 uppercase text-xs">{proj.title}</h5>
                            <span className="text-[10px] font-mono font-bold text-neutral-500">{proj.year}</span>
                          </div>
                          <p className="text-[11px] text-neutral-600 uppercase font-semibold tracking-wide leading-relaxed">{proj.description}</p>
                          <div className="bg-emerald-50 text-emerald-900 border border-emerald-200 text-[10px] font-mono font-black px-2.5 py-1 rounded-none inline-block uppercase">
                            METRIC IMPACT: {proj.metrics}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="border-2 border-neutral-950 p-4 rounded-none space-y-2 bg-neutral-50/25">
                      <h5 className="font-black uppercase text-xs text-neutral-950">{selectedCandidate.featuredProject.title}</h5>
                      <p className="text-[11px] text-neutral-500 uppercase font-semibold">Outcome completed in partner-guided placements.</p>
                      <span className="text-[10px] font-mono font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-none">IMPACT: {selectedCandidate.featuredProject.metrics}</span>
                    </div>
                  )}
                </div>

                {/* 4. Case Studies */}
                {selectedCandidate.caseStudies && selectedCandidate.caseStudies.length > 0 && (
                  <div className="space-y-3">
                    <h4 className="font-display font-black text-sm text-neutral-900 uppercase tracking-wider">AUDITED CASE STUDIES</h4>
                    <div className="space-y-3">
                      {selectedCandidate.caseStudies.map((cs, cIdx) => (
                        <div key={cIdx} className="border-2 border-neutral-950 p-4 rounded-none space-y-2 bg-white">
                          <h5 className="font-black uppercase text-xs text-neutral-900">{cs.title}</h5>
                          <p className="text-[11px] uppercase font-semibold text-neutral-600"><strong className="text-red-700 font-extrabold">PROBLEM:</strong> {cs.problem}</p>
                          <p className="text-[11px] uppercase font-semibold text-neutral-600"><strong className="text-emerald-850 font-extrabold">SOLUTION:</strong> {cs.solution}</p>
                          <p className="text-[10px] text-neutral-950 font-black bg-neutral-50 p-2.5 border border-neutral-250 font-mono">⭐ OUTCOME: {cs.results}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 5. Professional Certifications */}
                {selectedCandidate.certifications && selectedCandidate.certifications.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="font-display font-black text-sm text-neutral-900 uppercase tracking-wider">CERTIFICATIONS</h4>
                    <div className="flex flex-col gap-1.5 text-xs text-neutral-700">
                      {selectedCandidate.certifications.map((cert, certIdx) => (
                        <div key={certIdx} className="flex items-center gap-2 font-mono text-[11px] font-bold uppercase">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                          <span>{cert}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 6. Partner Recommendations */}
                {selectedCandidate.recommendations && selectedCandidate.recommendations.length > 0 && (
                  <div className="space-y-3">
                    <h4 className="font-display font-black text-sm text-neutral-900 uppercase tracking-wider">ECOSYSTEM RECS</h4>
                    <div className="space-y-3">
                      {selectedCandidate.recommendations.map((rec, rIdx) => (
                        <div key={rIdx} className="border-2 border-neutral-950 bg-neutral-50 p-4 rounded-none text-left space-y-3">
                          <p className="text-xs text-neutral-600 uppercase font-semibold italic">
                            "{rec.text}"
                          </p>
                          <div className="flex items-center gap-2.5">
                            <img src={rec.avatar} alt={rec.author} className="w-8 h-8 rounded-none object-cover border border-neutral-900" referrerPolicy="no-referrer" />
                            <div className="leading-none">
                              <p className="text-xs font-black uppercase text-neutral-950">{rec.author}</p>
                              <p className="text-[9px] uppercase font-bold text-neutral-500 mt-0.5">{rec.role}, {rec.company}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 7. Internal Notepad Card (PERSISTED) */}
                <div className="border-2 border-neutral-950 rounded-none p-4 bg-yellow-50 space-y-3 text-left">
                  <div className="flex items-center justify-between">
                    <label className="text-[10px] font-mono uppercase font-black text-neutral-600 flex items-center gap-1.5">
                      <Bookmark className="w-3.5 h-3.5 text-amber-600" />
                      <span>INTERNAL NOTEPAD</span>
                    </label>
                    <span className="text-[9px] text-neutral-450 font-mono uppercase font-black">PRIVATE LOG</span>
                  </div>
                  
                  <textarea
                    value={candidateNotes}
                    onChange={(e) => saveCandidateNotes(e.target.value)}
                    placeholder="Enter interview timelines, feedback notes, or target salary logs..."
                    rows={3}
                    className="w-full border-2 border-neutral-950 rounded-none p-2 bg-white text-xs text-neutral-800 placeholder:text-neutral-400 focus:outline-none placeholder:uppercase placeholder:font-bold font-bold uppercase"
                  />
                  <p className="text-[9px] font-mono text-neutral-400 uppercase font-bold">Auto-persisted to local browser cache.</p>
                </div>

              </div>

              {/* Feedback Notifications */}
              {feedbackMsg && (
                <div className="bg-emerald-600 text-white text-xs font-black uppercase py-2 px-4 text-center animate-pulse">
                  {feedbackMsg}
                </div>
              )}

            </motion.div>
          ) : (
            <div className="bg-white rounded-none border-2 border-dashed border-neutral-400 p-12 text-center min-h-[500px] flex flex-col justify-center items-center">
              <ShieldCheck className="w-12 h-12 text-neutral-400 mb-3 animate-pulse" />
              <p className="text-neutral-700 font-black uppercase text-xs">Select any verified specialist to begin auditing evidence sheets.</p>
            </div>
          )}
        </AnimatePresence>
      </div>

      {/* 3. Access Slots modal when checkout warning trigger is set */}
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
            <div className="bg-neutral-50 border-2 border-dashed border-neutral-300 p-4 text-left text-[10px] text-neutral-600 uppercase font-bold tracking-wide">
              💡 1 slot grants access to 2 full candidate folders.
            </div>
            
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
