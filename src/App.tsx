import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ArrowRight, 
  ShieldCheck, 
  CheckCircle2, 
  Award, 
  TrendingUp, 
  Briefcase, 
  ArrowUpRight,
  Zap,
  Lock,
  MessageCircle,
  HelpCircle,
  Sparkles,
  Users,
  ChevronRight
} from 'lucide-react';

import { Header, Footer } from './components/HeaderAndFooter';
import TalentDirectory from './components/TalentDirectory';
import FAQSection from './components/FAQSection';
import HomeOverview from './components/HomeOverview';
import EmployerWorkspace from './components/EmployerWorkspace';
import TalentDashboard from './components/TalentDashboard';
import PracticeAssessment from './components/PracticeAssessment';
import PricingPlans from './components/PricingPlans';

export default function App() {
  // Navigation State
  const [currentPage, setCurrentPage] = useState<'home' | 'directory' | 'employer' | 'talent' | 'assessment' | 'pricing'>('home');

  // Shared Global States
  const [employerSlots, setEmployerSlots] = useState<number>(1);
  const [isTalentPaid, setIsTalentPaid] = useState<boolean>(false);

  // Modals Core Settings
  const [isHireModalOpen, setIsHireModalOpen] = useState(false);
  const [hireForm, setHireForm] = useState({ name: '', company: '', roleNeeded: 'AI Automation', message: '' });
  const [hireSubmitted, setHireSubmitted] = useState(false);

  const [isTalentModalOpen, setIsTalentModalOpen] = useState(false);
  const [talentForm, setTalentForm] = useState({ name: '', email: '', track: 'Internship Track', skills: '' });
  const [talentSubmitted, setTalentSubmitted] = useState(false);

  const navigateToPage = (pageName: 'home' | 'directory' | 'employer' | 'talent' | 'assessment' | 'pricing') => {
    setCurrentPage(pageName);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-white text-neutral-850 font-sans antialiased selection:bg-emerald-500/30 selection:text-neutral-900">
      
      {/* GLOBAL HEADER */}
      <Header 
        currentPage={currentPage} 
        setCurrentPage={setCurrentPage} 
        openHireModal={() => setIsHireModalOpen(true)}
        openTalentModal={() => setIsTalentModalOpen(true)}
        employerSlots={employerSlots}
      />

      {/* PRIMARY VIEWS CONTAINER */}
      <main className="min-h-[70vh]">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentPage}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
          >
            
            {/* View 1: Home/Overview Landing Page */}
            {currentPage === 'home' && (
              <HomeOverview 
                navigateToPage={navigateToPage} 
                openHireModal={() => setIsHireModalOpen(true)} 
                openTalentModal={() => setIsTalentModalOpen(true)} 
              />
            )}

            {/* View 2: Find Talent (Directory Page) */}
            {currentPage === 'directory' && (
              <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-12">
                <div className="text-left border-b border-neutral-100 pb-6 space-y-3">
                  <span className="text-[10px] font-mono font-bold bg-emerald-50 border border-emerald-150 text-emerald-800 px-3 py-1 rounded-full uppercase tracking-wider inline-block">
                    Audited Candidates Directory
                  </span>
                  <h1 className="font-display font-medium text-3xl sm:text-4.5xl text-neutral-900 tracking-tight leading-none pt-1">
                    Find Digitally Verified Professionals
                  </h1>
                  <p className="text-xs sm:text-sm text-neutral-400 max-w-2xl font-secondary leading-relaxed">
                    Instantly browse and unlock specialized candidates with certified skill metrics. Zero empty claims tolerated—every profile is backed by actual audited projects.
                  </p>
                </div>

                <TalentDirectory 
                  employerSlots={employerSlots} 
                  setEmployerSlots={setEmployerSlots} 
                  navigateToPricing={() => navigateToPage('pricing')} 
                />
              </section>
            )}

            {/* View 3: Employer Workspace (Sourcing Dashboard) */}
            {currentPage === 'employer' && (
              <EmployerWorkspace 
                employerSlots={employerSlots} 
                setEmployerSlots={setEmployerSlots} 
                navigateToPage={navigateToPage} 
              />
            )}

            {/* View 4: Talent Workspace (Portfolio checklist / upgrade pass) */}
            {currentPage === 'talent' && (
              <TalentDashboard 
                isTalentPaid={isTalentPaid} 
                setIsTalentPaid={setIsTalentPaid} 
                navigateToPage={navigateToPage} 
              />
            )}

            {/* View 5: Practice Assessment */}
            {currentPage === 'assessment' && (
              <PracticeAssessment />
            )}

            {/* View 6: Pricing Plans */}
            {currentPage === 'pricing' && (
              <PricingPlans 
                setEmployerSlots={setEmployerSlots} 
                navigateToPage={navigateToPage} 
              />
            )}

          </motion.div>
        </AnimatePresence>
      </main>

      {/* GLOBAL SUPPORT & FAQ (Displayed above footer to reinforce trust metrics) */}
      <FAQSection />

      {/* GENERAL CALL TO ACTION SLIT-BANNER (Included once on App root to keep UI dynamic) */}
      <section className="py-16 md:py-20 px-4 sm:px-6 lg:px-8 bg-[#092013] text-white relative text-center overflow-hidden">
        {/* Fine grid design highlights */}
        <div className="absolute inset-0 bg-[#092013] bg-[radial-gradient(#10b981_1px,transparent_1px)] [background-size:24px_24px] opacity-10 pointer-events-none" />
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-emerald-550/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-4xl mx-auto space-y-6 relative z-10 text-center">
          <div className="space-y-4">
            <span className="text-[10px] font-mono font-bold text-emerald-400 uppercase tracking-widest block bg-white/5 border border-white/10 px-3 py-1 rounded-full max-w-xs mx-auto text-center font-secondary">Verified Sourcing Pipeline</span>
            <h2 className="font-display font-medium text-3xl sm:text-4xl text-white tracking-tight leading-tight pt-1">
              Connect Sourced on Authentic Evidence
            </h2>
            <p className="text-neutral-400 text-xs sm:text-sm max-w-xl mx-auto leading-relaxed font-secondary">
              Acquire top-performing digital talent graded through scenario assessments and verified by actual live project parameters.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 max-w-sm mx-auto pt-2">
            <button
              onClick={() => navigateToPage('directory')}
              className="w-full bg-[#10b981] hover:bg-emerald-500 text-neutral-950 font-bold px-6 py-3.5 rounded-xl text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow-md transition duration-205"
            >
              <span>Snoop Verified Talent</span>
              <ChevronRight className="w-3.5 h-3.5 text-neutral-950 stroke-[2.5]" />
            </button>

            <button
              onClick={() => navigateToPage('talent')}
              className="w-full bg-white/5 hover:bg-white/10 text-white font-bold px-6 py-3.5 rounded-xl text-xs border border-white/10 flex items-center justify-center gap-1.5 cursor-pointer transition duration-205"
            >
              <span>Build Proof Portfolio</span>
              <ArrowUpRight className="w-3.5 h-3.5 text-neutral-400" />
            </button>
          </div>
        </div>
      </section>

      {/* ======================================= */}
      {/* DIALOG MODE: MODAL FOR EMPLOYERS        */}
      {/* ======================================= */}
      {isHireModalOpen && (
        <div className="fixed inset-0 bg-neutral-950/75 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl border border-neutral-200 max-w-lg w-full p-6 md:p-8 space-y-6 text-left relative shadow-2xl font-secondary">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[10px] uppercase font-mono font-bold text-emerald-850 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-100">Consultant Routing</span>
                <h3 className="font-display font-semibold text-2xl text-neutral-950 mt-4 leading-none">Custom Placement Proposal</h3>
                <p className="text-xs text-neutral-450 mt-1.5">Brief our sourcing coordinators on your target metrics and tools prerequisites.</p>
              </div>
              <button 
                onClick={() => { setIsHireModalOpen(false); setHireSubmitted(false); }}
                className="text-neutral-450 hover:text-neutral-800 p-1.5 rounded-lg hover:bg-neutral-100 transition cursor-pointer font-bold text-sm"
              >
                ✕
              </button>
            </div>

            {hireSubmitted ? (
              <div className="p-8 text-center bg-emerald-50/50 rounded-2xl border border-emerald-100 space-y-4">
                <CheckCircle2 className="w-12 h-12 text-[#10b981] mx-auto animate-bounce" />
                <h4 className="font-bold text-neutral-950">Proposal Scheduled!</h4>
                <p className="text-xs text-neutral-600">A Talent Advisor will inspect our active registries and email custom matched candidate models within 2 business hours.</p>
                <button 
                  onClick={() => { setIsHireModalOpen(false); setHireSubmitted(false); }}
                  className="bg-neutral-950 hover:bg-neutral-900 text-white font-semibold py-2 px-4 rounded-xl text-xs cursor-pointer"
                >
                  Close Window
                </button>
              </div>
            ) : (
              <form 
                onSubmit={(e) => { e.preventDefault(); setHireSubmitted(true); }}
                className="space-y-4 text-xs font-sans"
              >
                <div className="space-y-1">
                  <label className="text-[9px] font-mono text-neutral-400 font-bold uppercase block">Contact Full Name</label>
                  <input 
                    type="text" 
                    required 
                    value={hireForm.name} 
                    onChange={(e) => setHireForm({ ...hireForm, name: e.target.value })}
                    placeholder="Enter your name" 
                    className="w-full border border-neutral-300 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-1 focus:ring-emerald-500 bg-neutral-50/50 focus:bg-white text-xs text-neutral-800"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] font-mono text-neutral-400 font-bold uppercase block">Company Name</label>
                  <input 
                    type="text" 
                    required 
                    value={hireForm.company}
                    onChange={(e) => setHireForm({ ...hireForm, company: e.target.value })}
                    placeholder="e.g. Acme Tech Agencies" 
                    className="w-full border border-neutral-300 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-1 focus:ring-emerald-500 bg-neutral-50/50 focus:bg-white text-xs text-neutral-800"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] font-mono text-neutral-400 font-bold uppercase block">Core Specialization Needed</label>
                  <select 
                    value={hireForm.roleNeeded}
                    onChange={(e) => setHireForm({ ...hireForm, roleNeeded: e.target.value })}
                    className="w-full border border-neutral-300 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-1 focus:ring-emerald-500 bg-neutral-50/55 text-xs text-neutral-805"
                  >
                    <option value="AI Automation">AI Automation Operations (Zapier, Python, Make, n8n)</option>
                    <option value="Technical SEO">Technical SEO & Programmatic clustering</option>
                    <option value="Paid Acquisition">PPC Acquisition Advertising (Google Ads, Meta Ads)</option>
                    <option value="Growth Marketing">Growth Marketing Specialist</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] font-mono text-neutral-400 font-bold uppercase block">Scope Details / Notes</label>
                  <textarea 
                    value={hireForm.message}
                    onChange={(e) => setHireForm({ ...hireForm, message: e.target.value })}
                    rows={3} 
                    placeholder="Budget, key tool preferences, startup parameters..." 
                    className="w-full border border-neutral-300 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-1 focus:ring-emerald-500 bg-neutral-50/50 focus:bg-white text-xs text-neutral-800"
                  />
                </div>

                <button 
                  type="submit" 
                  className="w-full bg-[#0d1c11] hover:bg-neutral-900 text-white font-bold py-3 px-4 rounded-xl text-xs uppercase tracking-wider cursor-pointer"
                >
                  Send Placement Brief
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      {/* ======================================= */}
      {/* DIALOG MODE: MODAL FOR TALENT COHORT    */}
      {/* ======================================= */}
      {isTalentModalOpen && (
        <div className="fixed inset-0 bg-neutral-950/75 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl border border-neutral-200 max-w-lg w-full p-6 md:p-8 space-y-6 text-left relative shadow-2xl font-secondary">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[10px] uppercase font-mono font-bold text-emerald-850 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-100">Vetting Registration</span>
                <h3 className="font-display font-medium text-2xl text-neutral-950 mt-4 leading-none">Join Verified Directory</h3>
                <p className="text-xs text-neutral-400 mt-1.5">Attempt scenario-based assessments and create proof of competence.</p>
              </div>
              <button 
                onClick={() => { setIsTalentModalOpen(false); setTalentSubmitted(false); }}
                className="text-neutral-400 hover:text-neutral-805 p-1.5 rounded-lg hover:bg-neutral-100 transition cursor-pointer font-bold text-sm"
              >
                ✕
              </button>
            </div>

            {talentSubmitted ? (
              <div className="p-8 text-center bg-emerald-50/50 rounded-2xl border border-emerald-100 space-y-4">
                <CheckCircle2 className="w-12 h-12 text-[#10b981] mx-auto animate-bounce" />
                <h4 className="font-bold text-neutral-950">Registration Pending!</h4>
                <p className="text-xs text-neutral-600">Verification parameters and practice credentials files have been compiled for your email.</p>
                <button 
                  onClick={() => { setIsTalentModalOpen(false); setTalentSubmitted(false); }}
                  className="bg-neutral-950 hover:bg-neutral-900 text-white font-semibold py-2 px-4 rounded-xl text-xs cursor-pointer"
                >
                  Close Window
                </button>
              </div>
            ) : (
              <form 
                onSubmit={(e) => { e.preventDefault(); setTalentSubmitted(true); }}
                className="space-y-4 text-xs font-sans"
              >
                <div className="space-y-1">
                  <label className="text-[9px] font-mono text-neutral-400 font-bold uppercase block">Professional Full Name</label>
                  <input 
                    type="text" 
                    required 
                    value={talentForm.name} 
                    onChange={(e) => setTalentForm({ ...talentForm, name: e.target.value })}
                    placeholder="Enter your name" 
                    className="w-full border border-neutral-300 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-1 focus:ring-emerald-500 bg-neutral-50/50 focus:bg-white text-xs text-neutral-800"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] font-mono text-neutral-400 font-bold uppercase block">Email Address</label>
                  <input 
                    type="email" 
                    required 
                    value={talentForm.email} 
                    onChange={(e) => setTalentForm({ ...talentForm, email: e.target.value })}
                    placeholder="you@corporate-domain.com" 
                    className="w-full border border-neutral-300 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-1 focus:ring-emerald-500 bg-neutral-50/50 focus:bg-white text-xs text-neutral-800"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] font-mono text-neutral-400 font-bold uppercase block">Specialization Tier</label>
                  <select 
                    value={talentForm.track}
                    onChange={(e) => setTalentForm({ ...talentForm, track: e.target.value })}
                    className="w-full border border-neutral-300 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-1 focus:ring-emerald-500 bg-neutral-50/50 text-xs text-neutral-800"
                  >
                    <option value="Professional Track">Professional Verification (immediate listing)</option>
                    <option value="Internship Track">Supervised Internship Pathway (junior placement)</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] font-mono text-neutral-400 font-bold uppercase block">Digital Toolsets Proficiencies</label>
                  <input 
                    type="text" 
                    value={talentForm.skills}
                    onChange={(e) => setTalentForm({ ...talentForm, skills: e.target.value })}
                    placeholder="e.g. Zapier, Make, GA4, Semrush, Technical crawls, custom campaign configurations" 
                    className="w-full border border-neutral-300 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-1 focus:ring-emerald-500 bg-neutral-50/50 focus:bg-white text-xs text-neutral-800"
                  />
                </div>

                <button 
                  type="submit" 
                  className="w-full bg-[#0a1b10] hover:bg-neutral-900 text-white font-bold py-3.5 px-4 rounded-xl text-xs uppercase cursor-pointer"
                >
                  Begin Verification
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      {/* GLOBAL FOOTER */}
      <Footer setCurrentPage={setCurrentPage} />

    </div>
  );
}
