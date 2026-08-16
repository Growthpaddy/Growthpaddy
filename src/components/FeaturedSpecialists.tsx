import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { 
  ArrowUpRight, 
  Users, 
  ChevronRight, 
  Sparkles, 
  UserCheck, 
  AlertCircle,
  Clock,
  Briefcase,
  Lock
} from 'lucide-react';

interface FeaturedSpecialist {
  id: string;
  name: string;
  role: string;
  specialty: string;
  isApproved: boolean;
  vettingStatus: string;
  availability_status: 'available' | 'hired';
  skills: string[];
  score: number;
  avatarUrl: string;
  slug?: string;
}

const DEFAULT_AVATARS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=300',
  'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=300',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=300',
  'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=300',
  'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&q=80&w=300',
  'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=300'
];

interface FeaturedSpecialistsProps {
  onNavigateToDirectory: () => void;
  onOpenTalentModal?: () => void;
}

export const FeaturedSpecialists: React.FC<FeaturedSpecialistsProps> = ({ 
  onNavigateToDirectory,
  onOpenTalentModal 
}) => {
  const [featuredTalents, setFeaturedTalents] = useState<FeaturedSpecialist[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchAndShuffleTalents = async () => {
      setLoading(true);
      
      try {
        // Query real candidate records directly from Supabase
        const { data: allTalents, error } = await supabase
          .from('talent_profiles')
          .select('*');

        let candidateRows = allTalents || [];

        // Check local storage mock entries if any were created during current session
        try {
          const localCandidates: any[] = [];
          for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && (key.startsWith('mock_talent_profiles_') || key.startsWith('digitalcampux_talent_profile_'))) {
              const itemStr = localStorage.getItem(key);
              if (itemStr) {
                const parsed = JSON.parse(itemStr);
                if (parsed && (parsed.full_name || parsed.userName || parsed.name || parsed.email)) {
                  if (!candidateRows.some((row: any) => row.id === parsed.id)) {
                    localCandidates.push(parsed);
                  }
                }
              }
            }
          }
          if (localCandidates.length > 0) {
            candidateRows = [...candidateRows, ...localCandidates];
          }
        } catch (storageErr) {
          console.warn('Storage check notice:', storageErr);
        }

        if (error) {
          console.error("Error fetching featured specialists:", error);
        }

        if (candidateRows && candidateRows.length > 0) {
          // Shuffle candidates randomly on every page refresh (Fisher-Yates)
          const shuffled = [...candidateRows];
          for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
          }

          // Pick exactly top 3 candidates (or fewer if fewer than 3 exist)
          const selectedRows = shuffled.slice(0, 3);

          const mapped: FeaturedSpecialist[] = selectedRows.map((item: any, idx: number) => {
            const name = item.full_name || item.fullName || item.userName || item.name || (item.email ? item.email.split('@')[0] : `Specialist #${idx + 1}`);
            const rawSpecialty = item.specialty || item.specialization || item.role || item.career_goal || 'Growth Specialist';
            
            // Parse skills
            const rawSkills = item.skills || item.session_responses?.skills;
            let parsedSkills: string[] = [];
            if (Array.isArray(rawSkills) && rawSkills.length > 0) {
              parsedSkills = rawSkills.filter(Boolean);
            } else if (typeof rawSkills === 'string' && rawSkills.trim().length > 0) {
              try {
                const jsonParsed = JSON.parse(rawSkills);
                if (Array.isArray(jsonParsed)) parsedSkills = jsonParsed;
                else parsedSkills = rawSkills.split(',').map(s => s.trim()).filter(Boolean);
              } catch {
                parsedSkills = rawSkills.split(',').map(s => s.trim()).filter(Boolean);
              }
            }

            if (parsedSkills.length === 0) {
              parsedSkills = ['Technical Strategy', 'Growth Ops', 'Automation'];
            }

            // Default Unverified Status Display:
            // Only 'approved' is verified. Everything else is unverified.
            const isApproved = item.vetting_status === 'approved';
            const availability_status = item.availability_status === 'hired' ? 'hired' : 'available';

            const score = typeof item.phase_1_score === 'number'
              ? item.phase_1_score
              : typeof item.latest_quiz_score === 'number'
              ? item.latest_quiz_score
              : item.phase_1_quiz_passed
              ? 95
              : 88;

            const avatar = item.profile_picture_url || item.avatar_url || item.profilePictureUrl || DEFAULT_AVATARS[idx % DEFAULT_AVATARS.length];

            return {
              id: item.id || `talent-${idx}`,
              name,
              role: item.role || rawSpecialty,
              specialty: rawSpecialty,
              isApproved,
              vettingStatus: item.vetting_status || 'unverified',
              availability_status,
              skills: parsedSkills.slice(0, 3),
              score,
              avatarUrl: avatar,
              slug: item.slug
            };
          });

          setFeaturedTalents(mapped);
        } else {
          setFeaturedTalents([]);
        }
      } catch (err) {
        console.error("Error in fetchAndShuffleTalents:", err);
        setFeaturedTalents([]);
      } finally {
        setLoading(false);
      }
    };

    fetchAndShuffleTalents();
  }, []);

  return (
    <section className="py-16 sm:py-20 px-4 sm:px-6 lg:px-8 bg-slate-900 text-white space-y-10">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header Bar */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 pb-6 border-b border-slate-800">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 text-emerald-400 text-xs font-mono uppercase tracking-wider font-semibold">
              <Users className="w-3.5 h-3.5" />
              <span>Live Candidate Stream</span>
            </div>
            <h2 className="font-display font-bold text-3xl sm:text-4xl text-white tracking-tight">
              Battle-Tested AI & Growth Specialists Ready to Deploy
            </h2>
            <p className="text-sm text-slate-400 max-w-xl leading-relaxed">
              Handpicked, performance-audited digital operators available for immediate onboarding.
            </p>
          </div>

          <button
            onClick={onNavigateToDirectory}
            className="bg-emerald-600 hover:bg-emerald-500 text-white font-semibold py-2.5 px-5 rounded-xl text-xs flex items-center gap-2 cursor-pointer transition shadow-xs self-start sm:self-auto"
          >
            <span>Explore Full Directory</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Dynamic Content: Loading, Empty State, or 3 Random Cards */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((n) => (
              <div 
                key={n} 
                className="bg-slate-800/50 border border-slate-700/60 rounded-2xl p-6 h-64 animate-pulse flex flex-col justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-slate-700 rounded-xl" />
                  <div className="space-y-2 flex-1">
                    <div className="h-4 bg-slate-700 rounded w-3/4" />
                    <div className="h-3 bg-slate-700/60 rounded w-1/2" />
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="h-3 bg-slate-700/60 rounded w-full" />
                  <div className="h-3 bg-slate-700/40 rounded w-2/3" />
                </div>
                <div className="h-9 bg-slate-700/50 rounded-xl w-full" />
              </div>
            ))}
          </div>
        ) : featuredTalents.length === 0 ? (
          /* Empty State */
          <div className="bg-slate-800/60 border border-slate-700/80 rounded-2xl p-10 text-center max-w-2xl mx-auto space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-950/80 border border-emerald-800 text-emerald-400 mx-auto flex items-center justify-center">
              <Briefcase className="w-6 h-6" />
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-bold text-white">
                No Featured Candidates Right Now
              </h3>
              <p className="text-sm text-slate-400 max-w-md mx-auto leading-relaxed">
                New specialists are joining daily. Check back soon or browse the full directory!
              </p>
            </div>
            <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
              <button
                onClick={onNavigateToDirectory}
                className="bg-emerald-600 hover:bg-emerald-500 text-white font-semibold py-2.5 px-5 rounded-xl text-xs cursor-pointer transition shadow-xs"
              >
                Browse Full Directory
              </button>
              {onOpenTalentModal && (
                <button
                  onClick={onOpenTalentModal}
                  className="bg-slate-700 hover:bg-slate-600 text-slate-200 font-semibold py-2.5 px-5 rounded-xl text-xs cursor-pointer transition"
                >
                  Join as a Specialist
                </button>
              )}
            </div>
          </div>
        ) : (
          /* Exactly 3 (or available) candidate cards */
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {featuredTalents.map((candidate) => (
              <div 
                key={candidate.id}
                className="bg-slate-800/85 border border-slate-700/80 hover:border-emerald-500/60 rounded-2xl p-5 flex flex-col justify-between space-y-5 transition-all duration-200 group shadow-md"
              >
                <div className="space-y-4">
                  {/* Avatar, Name & Specialty */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3.5 min-w-0">
                      <img 
                        src={candidate.avatarUrl} 
                        alt={candidate.name}
                        className="w-12 h-12 rounded-xl object-cover border border-slate-600 shrink-0"
                        referrerPolicy="no-referrer"
                      />
                      <div className="min-w-0 flex-1">
                        <h4 className="font-bold text-sm text-white group-hover:text-emerald-400 transition-colors truncate">
                          {candidate.name}
                        </h4>
                        <p className="text-xs text-emerald-400 font-medium truncate">
                          {candidate.specialty}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Availability Badge */}
                  <div>
                    {candidate.availability_status === 'available' ? (
                      <span className="inline-flex items-center gap-1.5 bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 px-2.5 py-1 rounded-full font-mono font-bold text-[10px] tracking-wide uppercase">
                        <span className="relative flex h-1.5 w-1.5">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
                        </span>
                        AVAILABLE FOR HIRE
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 bg-slate-900 text-slate-400 border border-slate-700 px-2.5 py-1 rounded-full font-mono font-bold text-[10px] tracking-wide uppercase">
                        <Lock className="w-3 h-3 text-slate-400" />
                        CURRENTLY HIRED
                      </span>
                    )}
                  </div>

                  {/* Vetting Status Badge: Approved vs Open / Unverified */}
                  <div className="pt-2 pb-1 border-t border-slate-700/60 flex items-center justify-between gap-2 text-xs">
                    {candidate.isApproved ? (
                      <span className="inline-flex items-center gap-1.5 text-amber-300 bg-amber-950/70 border border-amber-500/50 font-mono text-[11px] font-bold px-2.5 py-1 rounded-lg shadow-xs">
                        <span>🏆 Digital Campux Verified</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 text-slate-300 bg-slate-700/70 border border-slate-600 font-mono text-[10px] font-semibold px-2.5 py-1 rounded-lg">
                        <Clock className="w-3 h-3 text-slate-400" />
                        <span>Open Candidate / Unverified</span>
                      </span>
                    )}

                    <span className="font-mono text-slate-400 text-xs shrink-0">
                      Score: <strong className="text-emerald-400">{candidate.score}%</strong>
                    </span>
                  </div>

                  {/* Skill Badges */}
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {candidate.skills.map((skill, sIdx) => (
                      <span 
                        key={sIdx}
                        className="text-[10px] font-mono font-medium bg-slate-900/90 text-slate-300 px-2 py-0.5 rounded-md border border-slate-700/80"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Card Action */}
                <button
                  onClick={onNavigateToDirectory}
                  className="w-full bg-slate-900 hover:bg-emerald-600 text-slate-200 hover:text-white font-medium py-2.5 px-3 rounded-xl text-xs border border-slate-700 hover:border-emerald-500 transition-all cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <span>View Candidate Profile</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}

      </div>
    </section>
  );
};

export default FeaturedSpecialists;
