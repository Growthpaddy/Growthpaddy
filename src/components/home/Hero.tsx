import React, { useState, useRef, useEffect, MouseEvent } from 'react';
import { motion, useMotionValue, useSpring } from 'motion/react';
import { 
  Briefcase, 
  Zap, 
  ArrowRight, 
  ShieldCheck, 
  Clock, 
  Award, 
  Sparkles, 
  CheckCircle2 
} from 'lucide-react';
import gridPatternAsset from '../../assets/images/images.jpg';

export interface HeroProps {
  navigateToPage?: (page: 'home' | 'directory' | 'employer' | 'talent' | 'assessment' | 'pricing' | 'admin' | 'admin-login' | any) => void;
  openHireModal?: () => void;
  openTalentModal?: () => void;
  title?: string;
  subtitle?: string;
}

export const Hero: React.FC<HeroProps> = ({
  navigateToPage,
  openHireModal,
  openTalentModal,
  title = "Unlock the World's Elite AI & Growth Talent",
  subtitle = "We curate the top 5% of digital operators, AI workflow architects, and performance growth specialists. Cut your sourcing cycles by 80% with verified technical accreditation and direct hiring."
}) => {
  const containerRef = useRef<HTMLElement>(null);
  
  // Interactive mouse follow coordinates
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const [isHovered, setIsHovered] = useState(false);

  // Smooth spring physics for fluid interactive spotlight glow
  const smoothX = useSpring(mouseX, { stiffness: 150, damping: 25 });
  const smoothY = useSpring(mouseY, { stiffness: 150, damping: 25 });

  const handleMouseMove = (e: MouseEvent<HTMLElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    mouseX.set(x);
    mouseY.set(y);
  };

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
  };

  return (
    <section 
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className="relative min-h-[640px] pt-16 sm:pt-24 pb-20 sm:pb-28 px-4 sm:px-6 lg:px-8 bg-slate-950 text-white overflow-hidden border-b border-slate-800/80 select-none selection:bg-emerald-500/30 selection:text-emerald-200"
      id="homepage-hero-section"
    >
      {/* ========================================================================= */}
      {/* 1. LAYER 0: BASE DARK BACKGROUND & RADIAL VIGNETTE GRADIENTS */}
      {/* ========================================================================= */}
      <div className="absolute inset-0 bg-slate-950 pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(16,185,129,0.15),rgba(255,255,255,0))] pointer-events-none" />

      {/* ========================================================================= */}
      {/* 2. LAYER 1: GRID BACKGROUND IMPLEMENTATION (Subtle Tiled Grid + Color-Dodge) */}
      {/* ========================================================================= */}
      {/* Tiled Grid Image Layer with extreme subtlety (opacity <= 0.15) and mix-blend-mode: color-dodge */}
      <div 
        className="absolute inset-0 pointer-events-none hero-grid-tiled"
        style={{
          backgroundImage: `url(${gridPatternAsset}), linear-gradient(to right, rgba(255, 255, 255, 0.05) 1px, transparent 1px), linear-gradient(to bottom, rgba(255, 255, 255, 0.05) 1px, transparent 1px)`,
          backgroundSize: '48px 48px, 48px 48px, 48px 48px',
          backgroundRepeat: 'repeat',
          opacity: 0.14,
          mixBlendMode: 'color-dodge',
        }}
        aria-hidden="true"
      />

      {/* Top & Bottom Depth Mask to softly fade grid borders */}
      <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-slate-950 via-transparent to-slate-950/80" />

      {/* ========================================================================= */}
      {/* 3. LAYER 2: INTERACTIVE DYNAMIC MOUSE-FOLLOW GLOW (Underneath Text) */}
      {/* ========================================================================= */}
      <motion.div
        className="pointer-events-none absolute -inset-px opacity-0 transition-opacity duration-500"
        style={{
          opacity: isHovered ? 1 : 0,
          background: `radial-gradient(650px circle at ${smoothX.get()}px ${smoothY.get()}px, rgba(16, 185, 129, 0.18), rgba(5, 150, 105, 0.08) 35%, transparent 70%)`,
        }}
      />
      
      {/* Subtle secondary ambient glow orbs */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none animate-pulse duration-1000" />
      <div className="absolute bottom-10 right-10 w-72 h-72 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* ========================================================================= */}
      {/* 4. LAYER 3: FOREGROUND HERO CONTENT (High-Contrast White Typography) */}
      {/* ========================================================================= */}
      <div className="relative z-10 max-w-6xl mx-auto space-y-8 sm:space-y-10 text-left">
        
        {/* Live Status Pill */}
        <motion.div 
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 sm:gap-2.5 bg-slate-900/90 border border-slate-700/80 hover:border-emerald-500/50 backdrop-blur-md px-3.5 py-1.5 rounded-full text-xs font-semibold text-emerald-400 shadow-xl transition-colors duration-200"
        >
          <span className="relative flex h-2 w-2 shrink-0">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span className="font-mono text-[10px] sm:text-xs uppercase tracking-wider font-bold text-slate-200">
            ⚡ Speed-First Talent Network • Pre-Vetted AI & Growth Marketers
          </span>
        </motion.div>

        {/* Main Title & Body Typography */}
        <motion.div 
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="max-w-4xl space-y-6"
        >
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-white leading-[1.08] font-sans">
            {title}{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-emerald-200">
              — At 60% Less Cost.
            </span>
          </h1>

          <p className="text-base sm:text-xl text-slate-300 font-normal max-w-3xl leading-relaxed">
            {subtitle}
          </p>
        </motion.div>

        {/* Action Buttons */}
        <motion.div 
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 pt-2"
        >
          <button
            onClick={() => navigateToPage ? navigateToPage('directory') : openHireModal ? openHireModal() : null}
            className="bg-emerald-600 hover:bg-emerald-500 text-white font-semibold py-4 px-8 rounded-xl text-sm flex items-center justify-center gap-3 cursor-pointer shadow-lg shadow-emerald-950/50 hover:shadow-emerald-900/60 transition-all duration-200 group"
            id="hero-explore-talent-btn"
          >
            <Briefcase className="w-4 h-4 text-emerald-100 group-hover:scale-110 transition-transform" />
            <span>Deploy Vetted Talent in 48 Hours →</span>
            <ArrowRight className="w-4 h-4 text-emerald-100 group-hover:translate-x-0.5 transition-transform" />
          </button>

          <button
            onClick={() => openTalentModal ? openTalentModal() : navigateToPage ? navigateToPage('talent') : null}
            className="bg-slate-900/80 hover:bg-slate-800 text-slate-200 hover:text-white font-semibold py-4 px-8 rounded-xl text-sm border border-slate-700/90 hover:border-slate-600 flex items-center justify-center gap-3 cursor-pointer backdrop-blur-sm transition-all duration-200 shadow-xs"
            id="hero-apply-talent-btn"
          >
            <Zap className="w-4 h-4 text-emerald-400" />
            <span>Apply as a Specialist →</span>
          </button>
        </motion.div>

        {/* Quick Metrics Strip */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="pt-10 border-t border-slate-800/80"
        >
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6">
            <div className="bg-slate-900/60 backdrop-blur-md p-4 sm:p-5 rounded-2xl border border-slate-800 shadow-sm text-left hover:border-slate-700 transition-colors">
              <span className="text-2xl sm:text-3xl font-extrabold font-mono text-emerald-400 block">&lt; 48 Hours</span>
              <span className="text-xs text-slate-400 font-medium block mt-1">Average Matching Time</span>
            </div>

            <div className="bg-slate-900/60 backdrop-blur-md p-4 sm:p-5 rounded-2xl border border-slate-800 shadow-sm text-left hover:border-slate-700 transition-colors">
              <span className="text-2xl sm:text-3xl font-extrabold font-mono text-white block">Top 3%</span>
              <span className="text-xs text-slate-400 font-medium block mt-1">Vetted Acceptance Rate</span>
            </div>

            <div className="bg-slate-900/60 backdrop-blur-md p-4 sm:p-5 rounded-2xl border border-slate-800 shadow-sm text-left hover:border-slate-700 transition-colors">
              <span className="text-2xl sm:text-3xl font-extrabold font-mono text-emerald-400 block">0% Markups</span>
              <span className="text-xs text-slate-400 font-medium block mt-1">Direct Salary Billing</span>
            </div>

            <div className="bg-slate-900/60 backdrop-blur-md p-4 sm:p-5 rounded-2xl border border-slate-800 shadow-sm text-left hover:border-slate-700 transition-colors">
              <span className="text-2xl sm:text-3xl font-extrabold font-mono text-white block">100% Audited</span>
              <span className="text-xs text-slate-400 font-medium block mt-1">Verified Technical Output</span>
            </div>
          </div>
        </motion.div>

      </div>
    </section>
  );
};

export default Hero;
