import React from 'react';
import { Trophy, FileText, Settings, Swords, Sparkles, CheckCircle2, Clock } from 'lucide-react';

interface Mission {
  id: string;
  title: string;
  description: string;
  reward: string;
  progress: number;
  current: number;
  total: number;
  unit: string;
  icon: React.ComponentType<{ className?: string }>;
  accentColor: string;
  badge: string;
}

const MISSIONS: Mission[] = [
  {
    id: 'rank-kw',
    title: 'Rank Your First Keyword',
    description: 'Move a target commercial keyword into the top 10 organic search results.',
    reward: '+200 XP',
    progress: 70,
    current: 1,
    total: 1,
    unit: 'Target Position: #3',
    icon: Trophy,
    accentColor: '#18B892',
    badge: 'IN PROGRESS'
  },
  {
    id: 'publish-posts',
    title: 'Publish 5 Blog Posts',
    description: 'Create and optimize five comprehensive cluster content articles with schema.',
    reward: '+150 XP',
    progress: 60,
    current: 3,
    total: 5,
    unit: '3 of 5 Published',
    icon: FileText,
    accentColor: '#8B5CF6',
    badge: 'ACTIVE OBJECTIVE'
  },
  {
    id: 'fix-technical',
    title: 'Fix 10 Technical Issues',
    description: 'Resolve crawling, mobile rendering, and indexation problems in your audit queue.',
    reward: '+100 XP',
    progress: 90,
    current: 9,
    total: 10,
    unit: '9 of 10 Resolved',
    icon: Settings,
    accentColor: '#06B6D4',
    badge: 'ALMOST COMPLETE'
  },
  {
    id: 'beat-competitor',
    title: 'Beat Your First Competitor',
    description: 'Outrank your primary legacy rival for a high-value category query.',
    reward: '+500 XP',
    progress: 40,
    current: 1,
    total: 2,
    unit: 'Gap: -1 Position',
    icon: Swords,
    accentColor: '#F59E0B',
    badge: 'BOUNTY CHALLENGE'
  }
];

export function MissionPreview({ onStartPlayingClick }: { onStartPlayingClick?: () => void }) {
  return (
    <section id="missions" className="py-16 sm:py-24 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Heading */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-12 sm:mb-16 text-left">
          <div className="space-y-3 max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-xs font-mono font-bold text-[#18B892]">
              <span>ACTIVE MISSION BOARD</span>
            </div>
            <h2 className="font-display font-extrabold text-3xl sm:text-5xl text-white tracking-tight">
              Actionable SEO Missions
            </h2>
            <p className="text-sm sm:text-base text-slate-400">
              Clear, gamified milestones that guide you from your first meta tag to dominant SERP supremacy.
            </p>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto font-mono text-xs text-slate-400 bg-slate-900/80 px-3.5 py-2 rounded-xl border border-slate-800">
            <Sparkles className="w-4 h-4 text-[#18B892]" />
            <span>Over 100+ Total Quest Lines Available</span>
          </div>
        </div>

        {/* 4 Mission Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6">
          {MISSIONS.map((mission) => {
            const Icon = mission.icon;
            return (
              <div
                key={mission.id}
                className="p-5 sm:p-6 rounded-2xl sm:rounded-3xl bg-[#09101E]/90 border border-slate-800/90 hover:border-slate-700 transition-all duration-200 text-left relative group overflow-hidden"
              >
                {/* Header */}
                <div className="flex items-start justify-between gap-3 mb-4">
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0"
                      style={{ 
                        backgroundColor: `${mission.accentColor}18`, 
                        border: `1px solid ${mission.accentColor}33` 
                      }}
                    >
                      <Icon className="w-6 h-6" style={{ color: mission.accentColor }} />
                    </div>
                    <div>
                      <span className="text-[10px] font-mono font-bold tracking-wider uppercase text-slate-400 block">
                        {mission.badge}
                      </span>
                      <h3 className="font-display font-black text-base sm:text-lg text-white">
                        {mission.title}
                      </h3>
                    </div>
                  </div>

                  {/* Reward XP Badge */}
                  <div className="text-right shrink-0">
                    <span className="text-xs font-mono font-black text-[#18B892] bg-[#18B892]/10 border border-[#18B892]/30 px-2.5 py-1 rounded-lg">
                      {mission.reward}
                    </span>
                  </div>
                </div>

                {/* Description */}
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed mb-5">
                  {mission.description}
                </p>

                {/* Game Progress Bar */}
                <div className="space-y-2 pt-2 border-t border-slate-800/80">
                  <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
                    <span>{mission.unit}</span>
                    <span className="font-bold text-slate-200">{mission.progress}%</span>
                  </div>
                  <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                    <div 
                      className="h-full rounded-full transition-all duration-500"
                      style={{ 
                        width: `${mission.progress}%`, 
                        backgroundColor: mission.accentColor 
                      }} 
                    />
                  </div>
                </div>

              </div>
            );
          })}
        </div>

        {/* Board CTA */}
        <div className="mt-10 text-center">
          <button
            onClick={onStartPlayingClick}
            className="inline-flex items-center gap-2 text-xs font-bold font-mono text-[#18B892] hover:text-[#38ef7d] bg-slate-900/90 border border-[#18B892]/30 hover:border-[#18B892] px-5 py-2.5 rounded-xl transition cursor-pointer"
          >
            <span>Claim Mission Briefs in the Sandbox Engine</span>
            <span>→</span>
          </button>
        </div>

      </div>
    </section>
  );
}
