import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Unlock, 
  Trash2, 
  Clock, 
  Bookmark, 
  ExternalLink, 
  ChevronRight,
  Settings,
  Building,
  Save,
  CheckCircle2
} from 'lucide-react';
import { MOCK_TALENT } from '../data/mockTalent';
import { useSupabase } from '../context/SupabaseContext';
import { supabase } from '../lib/supabaseClient';

interface EmployerWorkspaceProps {
  employerSlots?: number;
  setEmployerSlots?: React.Dispatch<React.SetStateAction<number>>;
  navigateToPage?: (page: 'home' | 'directory' | 'employer' | 'talent' | 'assessment' | 'pricing') => void;
}

export default function EmployerWorkspace({ 
  employerSlots = 1, 
  setEmployerSlots, 
  navigateToPage 
}: EmployerWorkspaceProps) {
  
  const { user, updateProfileData } = useSupabase();

  // Basic Sourcing & Workspace States
  const [unlockedProfiles, setUnlockedProfiles] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'unlocked' | 'interviews' | 'notes' | 'settings'>('unlocked');
  const [newInterview, setNewInterview] = useState({ candidateName: '', date: '', time: '', notes: '' });
  const [interviews, setInterviews] = useState<any[]>([
    { id: '1', name: 'Sarah Jenkins', role: 'Growth Marketing Lead', date: 'July 8th, 2026', time: '10:00 AM (UTC)', status: 'Confirmed' },
    { id: '2', name: 'Marcus Chen', role: 'AI Automation Operations Architect', date: 'July 12th, 2026', time: '2:30 PM (UTC)', status: 'Pending Review' }
  ]);
  const [allNotes, setAllNotes] = useState<{ id: string; name: string; text: string }[]>([]);

  // Recruiter Corporate Preferences
  const [orgName, setOrgName] = useState('Dynamic Partner');
  const [orgSize, setOrgSize] = useState('1-10 Employees');
  const [industry, setIndustry] = useState('Digital Marketing');
  const [neededRole, setNeededRole] = useState('Full-Time Dedicated Talent');
  
  const [savingSettings, setSavingSettings] = useState(false);
  const [settingsSuccess, setSettingsSuccess] = useState(false);

  // Load recruiter preferences on mount from Supabase
  useEffect(() => {
    const fetchRecruiterProfile = async () => {
      if (!user) return;
      try {
        const { data, error } = await supabase
          .from('recruiter_profiles')
          .select('*')
          .eq('id', user.id)
          .maybeSingle();

        if (data) {
          if (data.organization_name) setOrgName(data.organization_name);
          if (data.organization_size) setOrgSize(data.organization_size);
          if (data.industry_vertical) setIndustry(data.industry_vertical);
          if (data.needed_talent_role) setNeededRole(data.needed_talent_role);
        } else {
          // Check local sandbox cache fallback
          const local = localStorage.getItem(`mock_recruiter_profiles_${user.id}`);
          if (local) {
            const parsed = JSON.parse(local);
            if (parsed.organization_name) setOrgName(parsed.organization_name);
            if (parsed.organization_size) setOrgSize(parsed.organization_size);
            if (parsed.industry_vertical) setIndustry(parsed.industry_vertical);
            if (parsed.needed_talent_role) setNeededRole(parsed.needed_talent_role);
          }
        }
      } catch (err) {
        console.warn('Recruiter DB profile lookup failed. Continuing in local sandbox mode.', err);
      }
    };
    fetchRecruiterProfile();
  }, [user]);

  // Handle saving corporate settings
  const handleSavePreferences = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingSettings(true);
    setSettingsSuccess(false);

    const payload = {
      organization_name: orgName,
      organization_size: orgSize,
      industry_vertical: industry,
      needed_talent_role: neededRole,
    };

    const { error } = await updateProfileData(payload);
    setSavingSettings(false);

    if (!error) {
      setSettingsSuccess(true);
      setTimeout(() => setSettingsSuccess(false), 3000);
    }
  };

  // Reload notes & unlocked data from localStorage
  useEffect(() => {
    const savedNotesList: { id: string; name: string; text: string }[] = [];
    MOCK_TALENT.forEach(candidate => {
      const text = localStorage.getItem(`candidate-notes-${candidate.id}`);
      if (text) {
        savedNotesList.push({ id: candidate.id, name: candidate.name, text });
      }
    });
    setAllNotes(savedNotesList);

    const unlocked = MOCK_TALENT.filter((c, idx) => idx === 0 || idx === 1);
    setUnlockedProfiles(unlocked);
  }, [activeTab]);

  const handleAddInterview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newInterview.candidateName || !newInterview.date) return;
    
    setInterviews(prev => [
      ...prev, 
      {
        id: Date.now().toString(),
        name: newInterview.candidateName,
        role: 'Verified Candidate',
        date: newInterview.date,
        time: newInterview.time || '12:00 PM',
        status: 'Requested'
      }
    ]);
    setNewInterview({ candidateName: '', date: '', time: '', notes: '' });
  };

  const deleteInterview = (id: string) => {
    setInterviews(prev => prev.filter(item => item.id !== id));
  };

  return (
    <div className="space-y-10 py-10 px-4 sm:px-6 lg:px-8 bg-neutral-105">
      
      {/* 1. Header Banner & Dynamic stats */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-6 bg-white p-6 sm:p-8 border-4 border-neutral-950 rounded-none shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] text-left">
        <div className="space-y-2 max-w-xl">
          <span className="text-[10px] uppercase font-mono font-black tracking-widest text-emerald-850 bg-emerald-50 px-2.5 py-0.5 border border-emerald-950 inline-block">
            RECRUITING CORE CONSOLE
          </span>
          <h1 className="font-display font-black text-3xl sm:text-4xl text-neutral-950 uppercase tracking-tight">
            {orgName}'s Workspace
          </h1>
          <p className="text-xs font-bold text-neutral-600 uppercase tracking-wider leading-relaxed">
            Manage corporate preferences, view unlocked dossiers, pipeline candidates, schedule interviews, and private sourcing notes.
          </p>
        </div>

        {/* Access Slots Summary Card */}
        <div className="bg-neutral-950 text-white p-5 rounded-none border-2 border-neutral-950 text-left min-w-[280px] flex-shrink-0 space-y-4">
          <div className="flex items-center justify-between gap-4">
            <div className="space-y-1">
              <span className="text-[9px] font-mono text-[#00A86B] uppercase tracking-widest block font-black">ACCESS BALANCE</span>
              <p className="text-3xl font-display font-black text-white leading-none">
                {employerSlots} <span className="text-xs text-neutral-400 font-bold uppercase tracking-wider font-mono">SLOTS</span>
              </p>
            </div>
            <div className="w-10 h-10 bg-[#00A86B] rounded-none flex items-center justify-center border-2 border-neutral-950">
              <Unlock className="w-5 h-5 text-white" />
            </div>
          </div>
          <button
            onClick={() => navigateToPage && navigateToPage('pricing')}
            className="w-full bg-white hover:bg-neutral-150 text-neutral-950 font-black py-2 px-3 rounded-none text-[10px] uppercase tracking-widest transition cursor-pointer text-center block border border-neutral-950 shadow-[2px_2px_0px_0px_rgba(16,185,129,1)]"
          >
            PURCHASE BALANCE
          </button>
        </div>
      </div>

      {/* 2. Interactive Workspace Tabs */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Side: Navigation Workspace Tabs (Width: 3) */}
        <div className="lg:col-span-3 flex flex-row lg:flex-col gap-2 overflow-x-auto pb-2 lg:pb-0">
          <button
            onClick={() => setActiveTab('unlocked')}
            className={`flex-1 lg:flex-initial py-3.5 px-4 text-xs font-black rounded-none text-left transition duration-150 cursor-pointer flex items-center gap-2.5 whitespace-nowrap uppercase tracking-widest border-2 border-neutral-950
              ${activeTab === 'unlocked' 
                ? 'bg-neutral-950 text-white shadow-[3px_3px_0px_0px_rgba(16,185,129,1)]' 
                : 'bg-white hover:bg-neutral-50 text-neutral-700'}`}
          >
            <Unlock className="w-4 h-4 flex-shrink-0" />
            <span>Unlocked ({unlockedProfiles.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('interviews')}
            className={`flex-1 lg:flex-initial py-3.5 px-4 text-xs font-black rounded-none text-left transition duration-150 cursor-pointer flex items-center gap-2.5 whitespace-nowrap uppercase tracking-widest border-2 border-neutral-950
              ${activeTab === 'interviews' 
                ? 'bg-neutral-950 text-white shadow-[3px_3px_0px_0px_rgba(16,185,129,1)]' 
                : 'bg-white hover:bg-neutral-50 text-neutral-700'}`}
          >
            <Clock className="w-4 h-4 flex-shrink-0" />
            <span>Interviews ({interviews.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('notes')}
            className={`flex-1 lg:flex-initial py-3.5 px-4 text-xs font-black rounded-none text-left transition duration-150 cursor-pointer flex items-center gap-2.5 whitespace-nowrap uppercase tracking-widest border-2 border-neutral-950
              ${activeTab === 'notes' 
                ? 'bg-neutral-950 text-white shadow-[3px_3px_0px_0px_rgba(16,185,129,1)]' 
                : 'bg-white hover:bg-neutral-50 text-neutral-700'}`}
          >
            <Bookmark className="w-4 h-4 flex-shrink-0" />
            <span>Notes ({allNotes.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('settings')}
            className={`flex-1 lg:flex-initial py-3.5 px-4 text-xs font-black rounded-none text-left transition duration-150 cursor-pointer flex items-center gap-2.5 whitespace-nowrap uppercase tracking-widest border-2 border-neutral-950
              ${activeTab === 'settings' 
                ? 'bg-neutral-950 text-white shadow-[3px_3px_0px_0px_rgba(16,185,129,1)]' 
                : 'bg-white hover:bg-neutral-50 text-neutral-700'}`}
          >
            <Settings className="w-4 h-4 flex-shrink-0" />
            <span>Settings</span>
          </button>
        </div>

        {/* Right Side: Tab Contents (Width: 9) */}
        <div className="lg:col-span-9 bg-white border-4 border-neutral-950 rounded-none p-6 sm:p-8 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] text-left animate-fadeIn">
          
          <AnimatePresence mode="wait">
            
            {/* View Tab 1: Unlocked profiles */}
            {activeTab === 'unlocked' && (
              <motion.div
                key="unlocked-tab"
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                className="space-y-6 animate-fadeIn"
              >
                <div className="border-b-2 border-neutral-950 pb-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                  <div>
                    <h3 className="font-display font-black text-lg text-neutral-950 uppercase tracking-tight">Unlocked Candidiate Portfolios</h3>
                    <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wider mt-1">Full authentication parameters opened via active subscription slot balance.</p>
                  </div>
                  <span className="text-[10px] font-mono font-black text-neutral-500 bg-neutral-100 border border-neutral-300 px-2 py-0.5 uppercase">UNLOCKED: {unlockedProfiles.length}</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {unlockedProfiles.map((c) => (
                    <div key={c.id} className="border-2 border-neutral-950 rounded-none p-5 bg-white hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] transition-all flex flex-col justify-between">
                      <div className="space-y-3">
                        <div className="flex gap-3">
                          <img src={c.avatarUrl} alt={c.name} className="w-12 h-12 rounded-none object-cover border-2 border-neutral-950" referrerPolicy="no-referrer" />
                          <div>
                            <h4 className="font-black text-neutral-950 uppercase text-sm leading-tight">{c.name}</h4>
                            <p className="text-[10px] text-emerald-800 font-mono font-black uppercase mt-1">{c.role}</p>
                          </div>
                        </div>

                        <div className="bg-neutral-50 p-3 rounded-none space-y-1.5 font-mono text-[10px] border-2 border-neutral-950">
                          <p className="flex justify-between">
                            <span className="text-neutral-500 uppercase">EMAIL:</span>
                            <span className="text-neutral-950 font-black select-all">{c.email}</span>
                          </p>
                          <p className="flex justify-between">
                            <span className="text-neutral-500 uppercase">PHONE:</span>
                            <span className="text-neutral-950 font-black select-all">{c.phone}</span>
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-4 mt-3 border-t-2 border-dashed border-neutral-200 text-xs">
                        <button
                          onClick={() => navigateToPage && navigateToPage('directory')}
                          className="text-neutral-950 hover:text-emerald-800 flex items-center gap-1 font-black uppercase tracking-wider text-[10px]"
                        >
                          <span>REVIEW CONSOLE</span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                        <span className="text-[9px] font-mono font-black text-emerald-800 bg-emerald-50 px-2.5 py-0.5 border border-emerald-950 uppercase">VETTED ACTIVE</span>
                      </div>
                    </div>
                  ))}
                </div>

                <button
                  onClick={() => navigateToPage && navigateToPage('directory')}
                  className="w-full bg-neutral-950 hover:bg-neutral-900 border-2 border-neutral-950 text-center font-black text-white py-3.5 rounded-none text-xs uppercase tracking-widest shadow-[3px_3px_0px_0px_rgba(16,185,129,1)]"
                >
                  BROWSE ALL SYSTEM DIGITAL OPERATORS
                </button>
              </motion.div>
            )}

            {/* View Tab 2: Scheduled Interviews */}
            {activeTab === 'interviews' && (
              <motion.div
                key="interviews-tab"
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                className="space-y-6"
              >
                <div className="border-b-2 border-neutral-950 pb-4">
                  <h3 className="font-display font-black text-lg text-neutral-950 uppercase tracking-tight">Active Pipelines</h3>
                  <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wider mt-1">Synchronized interview schedules and recruitment feedback tracking.</p>
                </div>

                {/* Interviews list */}
                <div className="space-y-3">
                  {interviews.map((item) => (
                    <div key={item.id} className="border-2 border-neutral-950 rounded-none p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-neutral-50/30">
                      <div className="space-y-1">
                        <h4 className="font-black text-neutral-950 uppercase text-sm flex items-center gap-2">
                          {item.name} 
                          <span className="text-[9px] font-mono px-2 py-0.5 rounded-none bg-neutral-950 text-white border font-bold uppercase">{item.role}</span>
                        </h4>
                        <p className="text-xs text-neutral-600 font-mono font-black">📅 {item.date} // {item.time}</p>
                      </div>

                      <div className="flex items-center gap-3">
                        <span className={`text-[10px] font-mono font-black px-2.5 py-1 rounded-none border-2 border-neutral-950 uppercase
                          ${item.status === 'Confirmed' 
                            ? 'bg-emerald-50 text-emerald-800' 
                            : 'bg-amber-50 text-amber-805'}`}
                        >
                          ● {item.status}
                        </span>

                        <button 
                          onClick={() => deleteInterview(item.id)}
                          className="p-1.5 rounded-none border-2 border-neutral-950 text-neutral-400 hover:text-red-700 hover:bg-neutral-50 transition cursor-pointer"
                          title="Remove Entry"
                        >
                          <Trash2 className="w-4 h-4 text-neutral-950" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Schedule Quick Form */}
                <form onSubmit={handleAddInterview} className="bg-white border-2 border-neutral-950 p-5 rounded-none space-y-4 pt-5 mt-5">
                  <h4 className="font-mono font-black text-[11px] text-[#047857] uppercase tracking-widest">SCHEDULE PIPELINE CONSOLE</h4>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <input
                      type="text"
                      required
                      placeholder="Candidate Name"
                      value={newInterview.candidateName}
                      onChange={(e) => setNewInterview({ ...newInterview, candidateName: e.target.value })}
                      className="border-2 border-neutral-950 rounded-none p-2.5 bg-white text-xs text-neutral-950 font-bold uppercase tracking-wider"
                    />
                    <input
                      type="text"
                      required
                      placeholder="e.g. July 18th"
                      value={newInterview.date}
                      onChange={(e) => setNewInterview({ ...newInterview, date: e.target.value })}
                      className="border-2 border-neutral-950 rounded-none p-2.5 bg-white text-xs text-neutral-950 font-bold uppercase tracking-wider"
                    />
                    <input
                      type="text"
                      placeholder="e.g. 10:00 AM UTC"
                      value={newInterview.time}
                      onChange={(e) => setNewInterview({ ...newInterview, time: e.target.value })}
                      className="border-2 border-neutral-950 rounded-none p-2.5 bg-white text-xs text-neutral-950 font-bold uppercase tracking-wider"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-neutral-950 hover:bg-neutral-900 border-2 border-neutral-950 text-white font-black py-2.5 rounded-none text-xs uppercase tracking-widest shadow-[3px_3px_0px_0px_rgba(16,185,129,1)]"
                  >
                    LOCK PIPELINE SELECTION
                  </button>
                </form>
              </motion.div>
            )}

            {/* View Tab 3: Candidate Notes List */}
            {activeTab === 'notes' && (
              <motion.div
                key="notes-tab"
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                className="space-y-6"
              >
                <div className="border-b-2 border-neutral-950 pb-4">
                  <h3 className="font-display font-black text-lg text-neutral-950 uppercase tracking-tight">Sourcing Dossier Notes</h3>
                  <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wider mt-1">These insights are cached securely in your active session structure. Inspect any profile in the directory to log notes.</p>
                </div>

                {allNotes.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {allNotes.map((note) => (
                      <div key={note.id} className="border-2 border-neutral-950 bg-neutral-50/50 p-5 rounded-none space-y-3 relative shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">
                        <div className="flex items-center justify-between border-b-2 border-dashed pb-1.5 border-neutral-250">
                          <h4 className="font-black text-neutral-950 uppercase text-xs">{note.name}</h4>
                          <span className="text-[10px] font-mono text-neutral-400">UID: {note.id}</span>
                        </div>
                        <p className="text-xs text-neutral-800 uppercase font-bold tracking-wider leading-relaxed italic">
                          "{note.text}"
                        </p>
                        
                        <button
                          onClick={() => {
                            if (navigateToPage) navigateToPage('directory');
                          }}
                          className="mt-2 text-[10px] font-black uppercase text-emerald-800 hover:text-emerald-950 flex items-center gap-1"
                        >
                          <span>MUTATE NOTES DIRECTLY</span>
                          <ExternalLink className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="bg-white rounded-none border-4 border-dashed border-neutral-300 p-12 text-center">
                    <Bookmark className="w-10 h-10 text-neutral-400 mx-auto mb-3" />
                    <p className="text-neutral-950 font-black uppercase text-xs">No active dossier feedback logged.</p>
                    <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider mt-1">Open individual system cards to cache private interview review insights.</p>
                    <button
                      onClick={() => navigateToPage && navigateToPage('directory')}
                      className="mt-4 bg-neutral-950 hover:bg-neutral-900 text-white font-black py-2.5 px-5 rounded-none text-xs uppercase tracking-widest shadow-[3px_3px_0px_0px_rgba(16,185,129,1)]"
                    >
                      BROWSE SOURCING CATALOG
                    </button>
                  </div>
                )}
              </motion.div>
            )}

            {/* View Tab 4: Company Preferences Settings */}
            {activeTab === 'settings' && (
              <motion.div
                key="settings-tab"
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                className="space-y-6"
              >
                <div className="border-b-2 border-neutral-950 pb-4">
                  <h3 className="font-display font-black text-lg text-neutral-950 uppercase tracking-tight flex items-center gap-2">
                    <Building className="w-5 h-5 text-[#00A86B]" />
                    <span>Company Preferences & Settings</span>
                  </h3>
                  <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wider mt-1">
                    Manage corporate branding parameters, hiring specialties, and preferred candidate pathways saved directly to Supabase.
                  </p>
                </div>

                <form onSubmit={handleSavePreferences} className="space-y-5 max-w-2xl bg-neutral-50 border-2 border-neutral-950 p-6 rounded-none">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-mono font-black text-neutral-500 uppercase tracking-wider block">ORGANIZATION DISPLAY NAME</label>
                      <input
                        type="text"
                        required
                        value={orgName}
                        onChange={(e) => setOrgName(e.target.value)}
                        className="w-full border-2 border-neutral-950 py-2 px-3 text-xs font-bold text-neutral-900 focus:outline-none"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] font-mono font-black text-neutral-500 uppercase tracking-wider block">ORGANIZATION SIZE</label>
                      <select
                        value={orgSize}
                        onChange={(e) => setOrgSize(e.target.value)}
                        className="w-full border-2 border-neutral-950 bg-white py-2 px-3 text-xs font-bold text-neutral-900 focus:outline-none"
                      >
                        <option value="1-10 Employees">1-10 Employees (Seed/Startup)</option>
                        <option value="11-50 Employees">11-50 Employees (Mid-Scale)</option>
                        <option value="51-200 Employees">51-200 Employees (Growing Org)</option>
                        <option value="200+ Employees">200+ Employees (Enterprise)</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-mono font-black text-neutral-500 uppercase tracking-wider block">INDUSTRY VERTICAL</label>
                      <select
                        value={industry}
                        onChange={(e) => setIndustry(e.target.value)}
                        className="w-full border-2 border-neutral-950 bg-white py-2 px-3 text-xs font-bold text-neutral-900 focus:outline-none"
                      >
                        <option value="Digital Marketing">Digital Growth Marketing</option>
                        <option value="E-Commerce Operations">E-Commerce Operations</option>
                        <option value="AI Automation Consulting">AI Automation Consulting</option>
                        <option value="SaaS / Software Product">SaaS Product / Tech</option>
                        <option value="Creative Agency">Creative & Media Agency</option>
                      </select>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] font-mono font-black text-neutral-500 uppercase tracking-wider block">NEEDED TALENT ROLE</label>
                      <select
                        value={neededRole}
                        onChange={(e) => setNeededRole(e.target.value)}
                        className="w-full border-2 border-neutral-950 bg-white py-2 px-3 text-xs font-bold text-neutral-900 focus:outline-none"
                      >
                        <option value="Interns">Remote Interns Pathways</option>
                        <option value="Project Freelancers">Project Freelancers (Contracts)</option>
                        <option value="Full-Time Dedicated Talent">Full-Time Dedicated Talent</option>
                      </select>
                    </div>
                  </div>

                  {settingsSuccess && (
                    <div className="p-2 bg-emerald-50 border-2 border-emerald-900 text-emerald-800 text-[10px] font-mono font-black uppercase text-center animate-fadeIn flex items-center justify-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>CLOUDS PREFERENCES COORDINATED & SAVED IN SUPABASE</span>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={savingSettings}
                    className="w-full bg-[#00A86B] hover:bg-emerald-700 text-white font-black py-3 rounded-none text-xs uppercase tracking-widest transition-all shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:shadow-none flex items-center justify-center gap-1.5 border-2 border-neutral-950"
                  >
                    {savingSettings ? (
                      <span>SAVING CLOUD DOSSIER CONSOLE...</span>
                    ) : (
                      <>
                        <Save className="w-4 h-4 text-white" />
                        <span>SAVE COMPANY PREFERENCES</span>
                      </>
                    )}
                  </button>
                </form>
              </motion.div>
            )}

          </AnimatePresence>

        </div>

      </div>

    </div>
  );
}
