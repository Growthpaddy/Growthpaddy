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
  Lock,
  Check
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

        const candidateRows = allTalents || [];

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

            const isApproved = item.vetting_status === 'approved' || item.vetting_status === 'verified' || (item.phase_1_quiz_passed && item.phase_2_interview_passed && item.phase_3_fee_paid);
            const availability_status = item.availability_status === 'hired' ? 'hired' : 'available';

            let score = 0;
            if (typeof item.score === 'number' && !isNaN(item.score)) {
              score = item.score;
            } else if (typeof item.latest_quiz_score === 'number' && !isNaN(item.latest_quiz_score)) {
              score = item.latest_quiz_score;
            } else if (typeof item.phase_1_score === 'number' && !isNaN(item.phase_1_score)) {
              score = item.phase_1_score;
            } else if (item.phase_1_quiz_passed && item.phase_2_interview_passed && (item.phase_3_fee_paid || item.vetting_status === 'approved' || item.vetting_status === 'verified')) {
              score = 100;
            } else if (item.phase_1_quiz_passed && item.phase_2_interview_passed) {
              score = 85;
            } else if (item.phase_1_quiz_passed) {
              score = 75;
            } else {
              score = 0;
            }

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
                onClick={onNavigateToDirectory}
                className="bg-slate-850/90 border border-slate-700/80 hover:border-slate-600 hover:shadow-xl rounded-2xl p-5 flex flex-col justify-between space-y-4 transition-all duration-200 group cursor-pointer relative"
              >
                <div className="space-y-4">
                  {/* Header: Avatar, Name, Specialty & Badges */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3.5 min-w-0">
                      <div className="relative shrink-0">
                        <img 
                          src={candidate.avatarUrl} 
                          alt={candidate.name}
                          className="w-12 h-12 rounded-xl object-cover border border-slate-700 shadow-2xs"
                          referrerPolicy="no-referrer"
                        />
                        {candidate.availability_status === 'available' ? (
                          <span className="absolute -bottom-1 -right-1 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-slate-900 ring-2 ring-slate-800">
                            <span className="h-2 w-2 rounded-full bg-emerald-400"></span>
                          </span>
                        ) : (
                          <span className="absolute -bottom-1 -right-1 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-slate-900 ring-2 ring-slate-800">
                            <span className="h-1.5 w-1.5 rounded-full bg-slate-400"></span>
                          </span>
                        )}
                      </div>
                      <div className="min-w-0 flex-1 space-y-0.5">
                        <h4 className="font-bold text-sm text-white group-hover:text-emerald-400 transition-colors truncate">
                          {candidate.name}
                        </h4>
                        <p className="text-xs text-emerald-400 font-medium truncate">
                          {candidate.specialty}
                        </p>
                      </div>
                    </div>

                    {/* Status Badges */}
                    <div className="flex flex-col items-end gap-1.5 shrink-0">
                      {candidate.isApproved ? (
                        <span className="inline-flex items-center gap-1 bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 text-[11px] font-semibold px-2 py-0.5 rounded-md shadow-2xs">
                          <Check className="w-3 h-3 text-emerald-400" />
                          <span>Verified</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 bg-slate-800/90 text-slate-400 border border-slate-700 text-[11px] font-semibold px-2 py-0.5 rounded-md">
                          <Clock className="w-3 h-3 text-slate-400" />
                          <span>Unverified</span>
                        </span>
                      )}

                      {candidate.availability_status === 'available' ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-medium text-emerald-400">
                          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400"></span>
                          <span>Available</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[10px] font-medium text-slate-400">
                          <Lock className="w-2.5 h-2.5 text-slate-400" />
                          <span>Hired</span>
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Metric Strip */}
                  <div className="grid grid-cols-2 gap-2 py-2 px-3 bg-slate-900/80 border border-slate-800 rounded-xl text-center">
                    <div>
                      <span className="block text-[10px] uppercase font-mono font-medium text-slate-400">Score</span>
                      <span className="text-xs font-bold text-emerald-400">{candidate.score}/100</span>
                    </div>
                    <div className="border-l border-slate-800">
                      <span className="block text-[10px] uppercase font-mono font-medium text-slate-400">Track</span>
                      <span className="text-xs font-bold text-slate-300 truncate block px-1">{candidate.specialty}</span>
                    </div>
                  </div>

                  {/* Skill Badges */}
                  <div className="flex flex-wrap gap-1.5 pt-0.5">
                    {candidate.skills.map((skill, sIdx) => (
                      <span 
                        key={sIdx}
                        className="text-[11px] font-medium bg-slate-900/90 text-slate-300 px-2.5 py-0.5 rounded-md border border-slate-700/80"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Card Action */}
                <button
                  onClick={onNavigateToDirectory}
                  className="w-full bg-slate-900 group-hover:bg-emerald-600 text-slate-200 group-hover:text-white font-medium py-2.5 px-3 rounded-xl text-xs border border-slate-700/80 group-hover:border-emerald-500 transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-2xs"
                >
                  <span>View Candidate Profile</span>
                  <ArrowUpRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
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
