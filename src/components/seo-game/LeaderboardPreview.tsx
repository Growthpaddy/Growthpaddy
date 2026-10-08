import React from 'react';
import { Trophy, Medal, Award, TrendingUp, Users, Sparkles } from 'lucide-react';

interface LeaderboardPlayer {
  rank: number;
  name: string;
  niche: string;
  xp: number;
  da: number;
  traffic: string;
  streak: number;
}

const PLAYERS: LeaderboardPlayer[] = [
  { rank: 1, name: 'Zenith Tech Labs', niche: 'B2B SaaS', xp: 14850, da: 74, traffic: '124.5K/mo', streak: 18 },
  { rank: 2, name: 'LagosPrime Realty', niche: 'Real Estate', xp: 12420, da: 68, traffic: '98.2K/mo', streak: 14 },
  { rank: 3, name: 'Apex Realty (You)', niche: 'Real Estate', xp: 11950, da: 62, traffic: '84.6K/mo', streak: 12 },
  { rank: 4, name: 'Kano Organics', niche: 'E-commerce', xp: 10300, da: 59, traffic: '72.1K/mo', streak: 9 },
  { rank: 5, name: 'FinPulse Africa', niche: 'Fintech', xp: 9800, da: 54, traffic: '65.3K/mo', streak: 8 }
];

export function LeaderboardPreview() {
  return (
    <section id="leaderboard" className="py-16 sm:py-24 relative overflow-hidden">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        
        {/* Section Heading */}
        <div className="text-center max-w-xl mx-auto mb-12 space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-xs font-mono font-bold text-[#18B892]">
            <span>GLOBAL SERP COMPETITION</span>
          </div>
          <h2 className="font-display font-extrabold text-2xl sm:text-4xl text-white tracking-tight">
            Weekly Leaderboard
          </h2>
          <p className="text-xs sm:text-sm text-slate-400">
            Compete against digital marketers and founders worldwide. Top rankers earn verified DSP Academy credentials and rewards.
          </p>
        </div>

        {/* Leaderboard Table / Cards */}
        <div className="bg-[#080E1C] border border-slate-800/90 rounded-2xl sm:rounded-3xl p-3 sm:p-6 shadow-2xl overflow-x-auto text-left">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800/80 text-[10px] font-mono text-slate-400 uppercase tracking-wider">
                <th className="pb-3 pl-3 font-semibold">Rank</th>
                <th className="pb-3 font-semibold">Player / Business</th>
                <th className="pb-3 font-semibold hidden sm:table-cell">Industry</th>
                <th className="pb-3 font-semibold">Total XP</th>
                <th className="pb-3 font-semibold hidden md:table-cell">Organic Traffic</th>
                <th className="pb-3 pr-3 text-right font-semibold">Streak</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              {PLAYERS.map((player) => {
                const isUser = player.name.includes('(You)');
                return (
                  <tr 
                    key={player.rank}
                    className={`transition-colors ${
                      isUser 
                        ? 'bg-[#0E1F30] border-l-2 border-l-[#18B892]' 
                        : 'hover:bg-slate-900/50'
                    }`}
                  >
                    <td className="py-3.5 pl-3 font-bold text-slate-200">
                      <div className="flex items-center gap-1.5">
                        {player.rank === 1 && <Trophy className="w-4 h-4 text-amber-400" />}
                        {player.rank === 2 && <Medal className="w-4 h-4 text-slate-300" />}
                        {player.rank === 3 && <Award className="w-4 h-4 text-amber-600" />}
                        <span>#{player.rank}</span>
                      </div>
                    </td>

                    <td className="py-3.5 font-sans font-bold text-white">
                      <div className="flex items-center gap-2">
                        <span>{player.name}</span>
                        {isUser && (
                          <span className="text-[9px] font-mono font-bold bg-[#18B892]/20 text-[#18B892] px-2 py-0.5 rounded border border-[#18B892]/30">
                            YOUR RANK
                          </span>
                        )}
                      </div>
                    </td>

                    <td className="py-3.5 text-slate-400 hidden sm:table-cell font-sans">
                      {player.niche}
                    </td>

                    <td className="py-3.5 text-[#18B892] font-bold">
                      {player.xp.toLocaleString()} XP
                    </td>

                    <td className="py-3.5 text-cyan-400 hidden md:table-cell">
                      {player.traffic}
                    </td>

                    <td className="py-3.5 pr-3 text-right text-amber-300 font-bold">
                      🔥 {player.streak}d
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

      </div>
    </section>
  );
}
