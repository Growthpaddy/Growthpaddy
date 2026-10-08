import React, { useState } from 'react';
import { 
  AlertTriangle, 
  TrendingDown, 
  ArrowRight, 
  Activity, 
  ShieldAlert, 
  CheckCircle2, 
  RefreshCw,
  Search,
  Wrench,
  Check
} from 'lucide-react';

export function AlgorithmEvent() {
  const [isDiagnosing, setIsDiagnosing] = useState(false);
  const [diagnosisStep, setDiagnosisStep] = useState<number>(0);
  const [isRecovered, setIsRecovered] = useState(false);

  const startDiagnosis = () => {
    setIsDiagnosing(true);
    setDiagnosisStep(1);
    setTimeout(() => setDiagnosisStep(2), 700);
    setTimeout(() => {
      setDiagnosisStep(3);
      setIsRecovered(true);
    }, 1400);
  };

  const resetSimulation = () => {
    setIsDiagnosing(false);
    setDiagnosisStep(0);
    setIsRecovered(false);
  };

  return (
    <section className="py-14 sm:py-20 relative">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        
        {/* Card Container */}
        <div className="relative rounded-3xl bg-gradient-to-br from-[#1A0D14] via-[#0E0B16] to-[#0A0D1A] border-2 border-rose-500/40 p-6 sm:p-9 shadow-2xl shadow-rose-950/40 overflow-hidden text-left">
          
          {/* Subtle Ambient Flashing Indicator */}
          <div className="absolute -top-12 -right-12 w-48 h-48 bg-rose-500/15 rounded-full blur-3xl pointer-events-none" />
          
          {/* Header & Warning Banner */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-rose-500/20 pb-5">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-rose-500/20 border border-rose-500/50 flex items-center justify-center text-rose-400 shrink-0 animate-pulse">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono font-extrabold text-xs tracking-widest uppercase text-rose-400">
                    IN-GAME LIVE EVENT
                  </span>
                  <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
                </div>
                <h3 className="font-display font-black text-xl sm:text-2xl text-white tracking-tight">
                  ⚠ ALGORITHM UPDATE DETECTED
                </h3>
              </div>
            </div>

            <div className="text-[11px] font-mono text-rose-300 bg-rose-950/60 border border-rose-800/60 px-3 py-1.5 rounded-xl">
              Google Helpful Content & Core Volatility Spike
            </div>
          </div>

          {/* Event Context */}
          <div className="py-5">
            <p className="text-sm sm:text-base text-slate-300 font-medium">
              &ldquo;Search rankings are fluctuating.&rdquo;
            </p>
            <p className="text-xs sm:text-sm text-slate-400 mt-1 leading-relaxed">
              A major search engine update just rolled out across your vertical. Your unmonitored legacy pages experienced sudden visibility turbulence.
            </p>
          </div>

          {/* Three Crisis Metrics */}
          <div className="grid grid-cols-3 gap-3 sm:gap-4 mb-6">
            
            {/* Metric 1: Traffic */}
            <div className="p-3.5 sm:p-4 rounded-2xl bg-black/40 border border-rose-500/30 text-left">
              <span className="text-[10px] sm:text-xs font-mono uppercase tracking-wider text-slate-400 block mb-1">
                Organic Traffic
              </span>
              <div className="font-display font-black text-2xl sm:text-3xl text-rose-400 tracking-tight flex items-center gap-1">
                {isRecovered ? (
                  <span className="text-emerald-400">+22%</span>
                ) : (
                  <>
                    <TrendingDown className="w-5 h-5 text-rose-400" />
                    <span>-18%</span>
                  </>
                )}
              </div>
              <span className="text-[10px] text-slate-500 font-mono">
                {isRecovered ? 'Post-fix rebound' : 'Past 72 hours'}
              </span>
            </div>

            {/* Metric 2: Keywords */}
            <div className="p-3.5 sm:p-4 rounded-2xl bg-black/40 border border-rose-500/30 text-left">
              <span className="text-[10px] sm:text-xs font-mono uppercase tracking-wider text-slate-400 block mb-1">
                Keywords Tracked
              </span>
              <div className="font-display font-black text-2xl sm:text-3xl text-rose-400 tracking-tight">
                {isRecovered ? (
                  <span className="text-emerald-400">+31</span>
                ) : (
                  '-24'
                )}
              </div>
              <span className="text-[10px] text-slate-500 font-mono">
                {isRecovered ? 'Re-indexed higher' : 'Dropped positions'}
              </span>
            </div>

            {/* Metric 3: Top 10 */}
            <div className="p-3.5 sm:p-4 rounded-2xl bg-black/40 border border-rose-500/30 text-left">
              <span className="text-[10px] sm:text-xs font-mono uppercase tracking-wider text-slate-400 block mb-1">
                Top 10 Positions
              </span>
              <div className="font-display font-black text-2xl sm:text-3xl text-rose-400 tracking-tight">
                {isRecovered ? (
                  <span className="text-emerald-400">+9</span>
                ) : (
                  '-7'
                )}
              </div>
              <span className="text-[10px] text-slate-500 font-mono">
                {isRecovered ? 'Won back 1st page' : 'Pushed to page 2'}
              </span>
            </div>

          </div>

          {/* Action Area: Diagnose the Problem */}
          {!isDiagnosing ? (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
              <p className="text-xs text-slate-400">
                In the actual game, your response time and diagnosis determine whether you recover or lose market share to competitors.
              </p>

              <button
                onClick={startDiagnosis}
                className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-rose-500 hover:bg-rose-400 text-slate-950 font-black text-xs sm:text-sm tracking-wide shadow-lg shadow-rose-500/25 flex items-center justify-center gap-2 cursor-pointer transition active:scale-95 shrink-0"
              >
                <span>Diagnose the Problem</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="p-4 rounded-2xl bg-black/50 border border-slate-700 space-y-3">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-[#18B892] font-bold flex items-center gap-2">
                  <Activity className="w-4 h-4 animate-spin" />
                  Diagnostic Protocol in Progress
                </span>
                <button
                  onClick={resetSimulation}
                  className="text-slate-400 hover:text-white flex items-center gap-1 cursor-pointer"
                >
                  <RefreshCw className="w-3 h-3" /> Reset Event
                </button>
              </div>

              <div className="space-y-2 text-xs">
                <div className={`flex items-center gap-2 ${diagnosisStep >= 1 ? 'text-emerald-300' : 'text-slate-500'}`}>
                  {diagnosisStep >= 1 ? <Check className="w-4 h-4 text-emerald-400" /> : <div className="w-4 h-4 rounded-full border border-slate-600" />}
                  <span>Step 1: Audited Intent Volatility — Identified 3 pages flagged as thin programmatic content.</span>
                </div>
                <div className={`flex items-center gap-2 ${diagnosisStep >= 2 ? 'text-emerald-300' : 'text-slate-500'}`}>
                  {diagnosisStep >= 2 ? <Check className="w-4 h-4 text-emerald-400" /> : <div className="w-4 h-4 rounded-full border border-slate-600" />}
                  <span>Step 2: Upgraded E-E-A-T Signals — Added verifiable author credentials & primary study citations.</span>
                </div>
                <div className={`flex items-center gap-2 ${diagnosisStep >= 3 ? 'text-[#18B892] font-bold' : 'text-slate-500'}`}>
                  {diagnosisStep >= 3 ? <CheckCircle2 className="w-4 h-4 text-[#18B892]" /> : <div className="w-4 h-4 rounded-full border border-slate-600" />}
                  <span>Step 3: Algorithm Recovery Verified — Traffic restored +22% above baseline!</span>
                </div>
              </div>
            </div>
          )}

        </div>

      </div>
    </section>
  );
}
