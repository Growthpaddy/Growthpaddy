import React, { useState } from 'react';
import { 
  Search, 
  Target, 
  FileCode, 
  Cpu, 
  FileText, 
  GitFork, 
  Network, 
  Award, 
  Crown, 
  MapPin, 
  ShoppingBag, 
  BarChart, 
  Flame, 
  Gauge, 
  Sparkles, 
  CpuIcon, 
  Bot, 
  Eye,
  CheckCircle2
} from 'lucide-react';

interface SkillItem {
  name: string;
  category: 'Foundation' | 'Technical' | 'Authority' | 'AI & Future';
  tier: string;
  xpReward: number;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
}

const SKILLS: SkillItem[] = [
  { name: 'Keyword Research', category: 'Foundation', tier: 'Tier 1', xpReward: 150, icon: Search, description: 'Uncover real customer queries, search volumes, and commercial intent ratios.' },
  { name: 'Search Intent', category: 'Foundation', tier: 'Tier 1', xpReward: 120, icon: Target, description: 'Align page format with transactional, informational, and navigational queries.' },
  { name: 'On-Page SEO', category: 'Foundation', tier: 'Tier 1', xpReward: 140, icon: FileCode, description: 'Craft compelling titles, structured headers, and contextual internal cues.' },
  { name: 'Technical SEO', category: 'Technical', tier: 'Tier 2', xpReward: 250, icon: Cpu, description: 'Resolve crawl budget leaks, canonical misconfigurations, and index directives.' },
  { name: 'Content SEO', category: 'Foundation', tier: 'Tier 1', xpReward: 180, icon: FileText, description: 'Build comprehensive editorial hubs that answer all latent user questions.' },
  { name: 'Internal Linking', category: 'Technical', tier: 'Tier 2', xpReward: 160, icon: GitFork, description: 'Architect siloed page clusters and pass link equity to core money pages.' },
  { name: 'Backlinks', category: 'Authority', tier: 'Tier 2', xpReward: 300, icon: Network, description: 'Execute digital PR campaigns and secure contextual editorial citations.' },
  { name: 'E-E-A-T', category: 'Authority', tier: 'Tier 2', xpReward: 220, icon: Award, description: 'Demonstrate first-hand experience, authority, and trustworthiness signals.' },
  { name: 'Topical Authority', category: 'Authority', tier: 'Tier 3', xpReward: 350, icon: Crown, description: 'Cover an entire niche comprehensively to dominate head term SERPs.' },
  { name: 'Local SEO', category: 'Foundation', tier: 'Tier 2', xpReward: 200, icon: MapPin, description: 'Dominate Google Map 3-packs, localized citations, and geo-targeted keywords.' },
  { name: 'Ecommerce SEO', category: 'Technical', tier: 'Tier 2', xpReward: 280, icon: ShoppingBag, description: 'Manage faceted navigation, product schema, and collection page hierarchies.' },
  { name: 'Analytics', category: 'Technical', tier: 'Tier 2', xpReward: 190, icon: BarChart, description: 'Read Google Search Console data, crawl log files, and revenue funnels.' },
  { name: 'Algorithm Updates', category: 'Authority', tier: 'Tier 3', xpReward: 400, icon: Flame, description: 'Diagnose sudden traffic drops and execute recovery sprint procedures.' },
  { name: 'Core Web Vitals', category: 'Technical', tier: 'Tier 2', xpReward: 240, icon: Gauge, description: 'Optimize LCP, INP, and CLS for seamless mobile user experience.' },
  { name: 'AI Search', category: 'AI & Future', tier: 'Tier 3', xpReward: 320, icon: Sparkles, description: 'Structure brand entities for conversational AI engines and assistant discovery.' },
  { name: 'Generative Engine Optimization', category: 'AI & Future', tier: 'Tier 3', xpReward: 450, icon: CpuIcon, description: 'GEO strategies to win authoritative citations in LLM synthesis models.' },
  { name: 'AI Overviews', category: 'AI & Future', tier: 'Tier 3', xpReward: 350, icon: Bot, description: 'Position pages as direct primary sources within Google Gemini synthesis.' },
  { name: 'Search Visibility', category: 'Authority', tier: 'Tier 2', xpReward: 210, icon: Eye, description: 'Track holistic footprint across rich snippets, featured answers, and organic slots.' }
];

export function SkillGrid() {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [activeSkill, setActiveSkill] = useState<SkillItem | null>(null);

  const categories = ['All', 'Foundation', 'Technical', 'Authority', 'AI & Future'];

  const filteredSkills = selectedCategory === 'All'
    ? SKILLS
    : SKILLS.filter(s => s.category === selectedCategory);

  return (
    <section className="py-16 sm:py-24 relative overflow-hidden">
      
      {/* Background glow */}
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-gradient-to-r from-[#18B892]/10 to-cyan-500/10 blur-[130px] rounded-full pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Heading */}
        <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16 space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-xs font-mono font-bold text-[#18B892]">
            <span>18 VERIFIED SKILL DISCIPLINES</span>
          </div>

          <h2 className="font-display font-extrabold text-3xl sm:text-5xl text-white tracking-tight">
            Master SEO By Doing It
          </h2>

          <p className="text-sm sm:text-base text-slate-300 font-medium">
            You aren&apos;t memorizing SEO concepts. You&apos;re learning how to use them.
          </p>

          <p className="text-xs sm:text-sm text-slate-400 max-w-xl mx-auto">
            Each discipline represents a playable game module with actionable mechanics, realistic feedback, and measurable business impact.
          </p>
        </div>

        {/* Category Filters */}
        <div className="flex flex-wrap items-center justify-center gap-2 mb-10">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-[#18B892] text-slate-950 font-bold shadow-md shadow-[#18B892]/20'
                  : 'bg-slate-900/80 border border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Skill Chips / Cards Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
          {filteredSkills.map((skill) => {
            const Icon = skill.icon;
            const isSelected = activeSkill?.name === skill.name;

            return (
              <button
                key={skill.name}
                onClick={() => setActiveSkill(isSelected ? null : skill)}
                className={`p-3.5 rounded-2xl border text-left transition-all duration-200 flex flex-col justify-between group cursor-pointer focus:outline-none ${
                  isSelected
                    ? 'bg-[#0E1C2E] border-[#18B892] shadow-lg shadow-[#18B892]/20 scale-105'
                    : 'bg-[#09101E]/80 border-slate-800/80 hover:border-slate-700 hover:bg-slate-900/90'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2.5">
                    <div className="w-8 h-8 rounded-lg bg-slate-800/80 group-hover:bg-[#18B892]/15 flex items-center justify-center transition-colors">
                      <Icon className="w-4 h-4 text-slate-300 group-hover:text-[#18B892] transition-colors" />
                    </div>
                    <span className="text-[9px] font-mono font-bold text-slate-400 group-hover:text-[#18B892]">
                      +{skill.xpReward} XP
                    </span>
                  </div>

                  <h3 className="font-display font-bold text-xs sm:text-sm text-slate-100 group-hover:text-white leading-snug">
                    {skill.name}
                  </h3>
                </div>

                <div className="mt-2.5 pt-2 border-t border-slate-800/60 flex items-center justify-between text-[9px] font-mono text-slate-400">
                  <span>{skill.category}</span>
                  <span className="text-slate-500">{skill.tier}</span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Selected Skill Preview Drawer / Card */}
        {activeSkill && (
          <div className="mt-8 max-w-2xl mx-auto p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-[#0C1628] to-[#0A101C] border border-[#18B892]/50 text-left flex items-start gap-4 shadow-xl shadow-[#18B892]/10 animate-fadeIn">
            <div className="w-10 h-10 rounded-xl bg-[#18B892]/20 border border-[#18B892]/40 flex items-center justify-center shrink-0">
              <activeSkill.icon className="w-5 h-5 text-[#18B892]" />
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h4 className="font-bold text-white text-sm">{activeSkill.name}</h4>
                <span className="text-[10px] font-mono text-[#18B892] bg-[#18B892]/10 px-2 py-0.5 rounded">
                  Reward: +{activeSkill.xpReward} XP
                </span>
                <span className="text-[10px] font-mono text-slate-400">
                  {activeSkill.category} · {activeSkill.tier}
                </span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                {activeSkill.description}
              </p>
            </div>
          </div>
        )}

      </div>
    </section>
  );
}
