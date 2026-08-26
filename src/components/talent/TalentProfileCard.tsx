import React from 'react';
import { motion } from 'motion/react';
import { 
  Check, 
  MapPin, 
  Clock, 
  Lock, 
  Briefcase, 
  Award, 
  ChevronRight, 
  CheckCircle2, 
  Sparkles,
  Layers,
  ArrowUpRight
} from 'lucide-react';
import { TalentCandidate } from '../../types';

interface TalentProfileCardProps {
  candidate: TalentCandidate | any;
  onClick?: () => void;
  onSkillClick?: (skill: string) => void;
}

export const TalentProfileCard: React.FC<TalentProfileCardProps> = ({
  candidate,
  onClick,
  onSkillClick
}) => {
  const isAvailable = candidate.availability_status === 'available' || !candidate.availability_status;
  const isVerified = Boolean(candidate.isVerified || candidate.is_verified || candidate.phase_1_quiz_passed || candidate.phase_1_status === 'passed');
  const skillsList: string[] = Array.isArray(candidate.skills) ? candidate.skills : [];

  return (
    <motion.div
      layout="position"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      whileHover={{ y: -3 }}
      transition={{ duration: 0.2 }}
      onClick={onClick}
      className="bg-white border border-slate-200/90 hover:border-slate-300 hover:shadow-lg rounded-3xl p-5 sm:p-6 transition-all duration-200 flex flex-col justify-between space-y-4 text-left group cursor-pointer relative"
    >
      <div className="space-y-4">
        {/* Top Header: Avatar, Name, Role, Location and Verification Badge */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3.5 min-w-0">
            <div className="relative shrink-0">
              <img 
                src={candidate.avatarUrl || candidate.profile_picture_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80'} 
                alt={candidate.name || candidate.full_name}
                className="w-12 h-12 rounded-2xl object-cover border border-slate-200/80 shadow-2xs"
                referrerPolicy="no-referrer"
              />
              {isAvailable ? (
                <span className="absolute -bottom-1 -right-1 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-white ring-2 ring-white">
                  <span className="h-2 w-2 rounded-full bg-emerald-500"></span>
                </span>
              ) : (
                <span className="absolute -bottom-1 -right-1 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-slate-900 ring-2 ring-white">
                  <span className="h-1.5 w-1.5 rounded-full bg-slate-400"></span>
                </span>
              )}
            </div>

            <div className="min-w-0 flex-1 space-y-0.5">
              <h4 className="font-display font-bold text-sm sm:text-base text-slate-900 group-hover:text-emerald-600 transition-colors truncate">
                {candidate.name || candidate.full_name || 'Anonymous Candidate'}
              </h4>
              <p className="text-xs text-emerald-700 font-medium truncate">
                {candidate.role || candidate.headline || candidate.specialization || 'Growth Marketer'}
              </p>
              <p className="text-[11px] text-slate-400 flex items-center gap-1 truncate">
                <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                <span>{candidate.location || 'Remote Global'}</span>
              </p>
            </div>
          </div>

          {/* Status Badges */}
          <div className="flex flex-col items-end gap-1.5 shrink-0">
            {/* Verified vs Unverified Badge */}
            {isVerified ? (
              <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 border border-emerald-200/90 text-[11px] font-bold px-2 py-0.5 rounded-md shadow-2xs">
                <Check className="w-3 h-3 text-emerald-600" />
                <span>Verified</span>
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 bg-slate-100 text-slate-600 border border-slate-200 text-[11px] font-medium px-2 py-0.5 rounded-md">
                <Clock className="w-3 h-3 text-slate-400" />
                <span>Unverified</span>
              </span>
            )}

            {/* Availability Indicator */}
            {isAvailable ? (
              <span className="inline-flex items-center gap-1 text-[10px] font-medium text-emerald-700">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
                <span>Available</span>
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-[10px] font-medium text-slate-500">
                <Lock className="w-2.5 h-2.5 text-slate-400" />
                <span>Hired</span>
              </span>
            )}
          </div>
        </div>

        {/* Metric / Meta Strip (NO HOURLY RATES) */}
        <div className="grid grid-cols-3 gap-2 py-2 px-3 bg-slate-50 border border-slate-100 rounded-2xl text-center">
          <div>
            <span className="block text-[10px] uppercase font-mono font-medium text-slate-400">Score</span>
            <span className="text-xs font-bold text-slate-800">
              {candidate.portfolioScore ?? (isVerified ? '85' : '75')}/100
            </span>
          </div>
          <div className="border-x border-slate-200/60">
            <span className="block text-[10px] uppercase font-mono font-medium text-slate-400">Exp</span>
            <span className="text-xs font-bold text-slate-800">
              {candidate.experienceCount >= 5 || candidate.years_experience >= 5 ? 'Senior' : 'Mid-Level'}
            </span>
          </div>
          <div>
            <span className="block text-[10px] uppercase font-mono font-medium text-slate-400">Track</span>
            <span className="text-xs font-bold text-slate-800 truncate block px-1">
              {candidate.specialization || candidate.specialty || 'Growth'}
            </span>
          </div>
        </div>

        {/* Professional Summary / Bio */}
        <p className="text-xs text-slate-600 leading-relaxed line-clamp-2">
          {candidate.bio || candidate.headline || 'Verified candidate with demonstrated expertise across campaign execution, analytics, and marketing automation.'}
        </p>

        {/* Verified Showcased Skill Badges */}
        <div className="space-y-1.5 pt-1">
          <span className="text-[10px] font-mono uppercase font-bold text-slate-400 block">
            Verified Competencies:
          </span>
          <div className="flex flex-wrap gap-1.5">
            {skillsList.slice(0, 4).map((skill, idx) => (
              <button
                key={idx}
                type="button"
                onClick={(e) => {
                  if (onSkillClick) {
                    e.stopPropagation();
                    onSkillClick(skill);
                  }
                }}
                className="text-[11px] font-medium bg-emerald-50/70 hover:bg-emerald-100 text-emerald-800 px-2.5 py-0.5 border border-emerald-200 rounded-lg transition cursor-pointer flex items-center gap-1 shadow-2xs"
              >
                <Check className="w-2.5 h-2.5 text-emerald-600 shrink-0" />
                <span>{skill}</span>
              </button>
            ))}
            {skillsList.length > 4 && (
              <span className="text-[10px] font-mono font-medium text-slate-400 self-center px-1">
                +{skillsList.length - 4} more
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Card Action Footer */}
      <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
        <span className="text-[11px] text-slate-400 font-mono">
          DSP Verified Candidate
        </span>
        <span className="text-xs font-bold text-emerald-600 group-hover:text-emerald-700 flex items-center gap-1 transition">
          <span>View Verified CV</span>
          <ArrowUpRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
        </span>
      </div>
    </motion.div>
  );
};

export default TalentProfileCard;
