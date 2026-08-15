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
  CheckCircle2,
  Calendar,
  User,
  Sparkles,
  Plus
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
    <div className="space-y-8 text-left max-w-7xl mx-auto">
      
      {/* 1. Header Banner & Stats */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-6 bg-white p-6 sm:p-7 border border-slate-200/80 rounded-2xl shadow-xs">
        <div className="space-y-1.5 max-w-xl">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-emerald-700 uppercase tracking-wider bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
              Employer Console
            </span>
          </div>
          <h2 className="font-display font-bold text-2xl sm:text-3xl text-slate-900">
            {orgName}'s Hiring Workspace
          </h2>
          <p className="text-xs text-slate-500 leading-relaxed">
            Manage unlocked dossiers, pipeline interviews, private notes, and custom hiring criteria.
          </p>
        </div>

        {/* Access Slots Summary Card */}
        <div className="bg-slate-900 text-white p-5 rounded-2xl border border-slate-800 text-left min-w-[260px] flex-shrink-0 space-y-3.5 shadow-sm">
          <div className="flex items-center justify-between gap-4">
            <div className="space-y-0.5">
              <span className="text-[11px] font-mono text-emerald-400 font-bold uppercase tracking-wider block">Available Slots</span>
              <p className="text-2xl font-display font-bold text-white leading-none">
                {employerSlots} <span className="text-xs text-slate-400 font-medium font-sans">Active</span>
              </p>
            </div>
            <div className="w-10 h-10 bg-emerald-600 rounded-xl flex items-center justify-center">
              <Unlock className="w-5 h-5 text-white" />
            </div>
          </div>
          <button
            onClick={() => navigateToPage && navigateToPage('pricing')}
            className="w-full bg-slate-800 hover:bg-emerald-600 text-white font-semibold py-2 px-3 rounded-xl text-xs transition cursor-pointer text-center block"
          >
            Add Sourcing Slots
          </button>
        </div>
      </div>

      {/* 2. Interactive Workspace Tabs */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Side: Navigation Workspace Tabs (Width: 3) */}
        <div className="lg:col-span-3 flex flex-row lg:flex-col gap-1.5 overflow-x-auto pb-1 lg:pb-0">
          <button
            onClick={() => setActiveTab('unlocked')}
            className={`flex-1 lg:flex-initial py-2.5 px-3.5 text-xs font-semibold rounded-xl text-left transition duration-150 cursor-pointer flex items-center gap-2.5 whitespace-nowrap
              ${activeTab === 'unlocked' 
                ? 'bg-slate-900 text-white font-bold shadow-xs' 
                : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200/80'}`}
          >
            <Unlock className="w-4 h-4 flex-shrink-0 text-emerald-400" />
            <span>Unlocked ({unlockedProfiles.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('interviews')}
            className={`flex-1 lg:flex-initial py-2.5 px-3.5 text-xs font-semibold rounded-xl text-left transition duration-150 cursor-pointer flex items-center gap-2.5 whitespace-nowrap
              ${activeTab === 'interviews' 
                ? 'bg-slate-900 text-white font-bold shadow-xs' 
                : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200/80'}`}
          >
            <Clock className="w-4 h-4 flex-shrink-0 text-emerald-400" />
            <span>Interviews ({interviews.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('notes')}
            className={`flex-1 lg:flex-initial py-2.5 px-3.5 text-xs font-semibold rounded-xl text-left transition duration-150 cursor-pointer flex items-center gap-2.5 whitespace-nowrap
              ${activeTab === 'notes' 
                ? 'bg-slate-900 text-white font-bold shadow-xs' 
                : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200/80'}`}
          >
            <Bookmark className="w-4 h-4 flex-shrink-0 text-emerald-400" />
            <span>Notes ({allNotes.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('settings')}
            className={`flex-1 lg:flex-initial py-2.5 px-3.5 text-xs font-semibold rounded-xl text-left transition duration-150 cursor-pointer flex items-center gap-2.5 whitespace-nowrap
              ${activeTab === 'settings' 
                ? 'bg-slate-900 text-white font-bold shadow-xs' 
                : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200/80'}`}
          >
            <Settings className="w-4 h-4 flex-shrink-0 text-emerald-400" />
            <span>Company Preferences</span>
          </button>
        </div>

        {/* Right Side: Tab Contents (Width: 9) */}
        <div className="lg:col-span-9 bg-white border border-slate-200/80 rounded-2xl p-6 sm:p-7 shadow-xs text-left">
          
          <AnimatePresence mode="wait">
            
            {/* View Tab 1: Unlocked profiles */}
            {activeTab === 'unlocked' && (
              <motion.div
                key="unlocked-tab"
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                className="space-y-6"
              >
                <div className="border-b border-slate-100 pb-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                  <div>
                    <h3 className="font-display font-bold text-lg text-slate-900">Unlocked Candidate Portfolios</h3>
                    <p className="text-xs text-slate-500 mt-0.5">Full contact parameters opened via your sourcing slot balance.</p>
                  </div>
                  <span className="text-xs font-mono font-medium text-slate-600 bg-slate-100 px-2.5 py-0.5 rounded-full">
                    {unlockedProfiles.length} Unlocked
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {unlockedProfiles.map((c) => (
                    <div key={c.id} className="border border-slate-200 rounded-2xl p-5 bg-white hover:border-emerald-500/40 hover:shadow-xs transition flex flex-col justify-between space-y-4">
                      <div className="space-y-3">
                        <div className="flex items-center gap-3">
                          <img src={c.avatarUrl} alt={c.name} className="w-11 h-11 rounded-xl object-cover border border-slate-200" referrerPolicy="no-referrer" />
                          <div>
                            <h4 className="font-bold text-slate-900 text-sm">{c.name}</h4>
                            <p className="text-xs text-emerald-700 font-semibold">{c.role}</p>
                          </div>
                        </div>

                        <div className="bg-slate-50 p-3 rounded-xl space-y-1 font-mono text-xs border border-slate-200">
                          <p className="flex justify-between">
                            <span className="text-slate-500">Email:</span>
                            <span className="text-slate-900 font-bold select-all">{c.email}</span>
                          </p>
                          <p className="flex justify-between">
                            <span className="text-slate-500">Phone:</span>
                            <span className="text-slate-900 font-bold select-all">{c.phone}</span>
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-3 border-t border-slate-100 text-xs">
                        <button
                          onClick={() => navigateToPage && navigateToPage('directory')}
                          className="text-slate-900 hover:text-emerald-700 flex items-center gap-1 font-semibold text-xs cursor-pointer"
                        >
                          <span>Review Dossier</span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                        <span className="text-[10px] font-mono font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                          Vetted Active
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                <button
                  onClick={() => navigateToPage && navigateToPage('directory')}
                  className="w-full bg-slate-900 hover:bg-emerald-600 text-center font-semibold text-white py-2.5 rounded-xl text-xs transition cursor-pointer shadow-2xs"
                >
                  Browse Full Candidate Directory
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
                <div className="border-b border-slate-100 pb-4">
                  <h3 className="font-display font-bold text-lg text-slate-900">Active Interview Pipeline</h3>
                  <p className="text-xs text-slate-500 mt-0.5">Track and synchronize candidate interviews.</p>
                </div>

                {/* Interviews list */}
                <div className="space-y-3">
                  {interviews.map((item) => (
                    <div key={item.id} className="border border-slate-200 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-slate-50/50">
                      <div className="space-y-0.5">
                        <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                          {item.name} 
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-200 text-slate-800 font-medium">{item.role}</span>
                        </h4>
                        <p className="text-xs text-slate-500 font-mono">📅 {item.date} · {item.time}</p>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full border
                          ${item.status === 'Confirmed' 
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-200' 
                            : 'bg-amber-50 text-amber-800 border-amber-200'}`}
                        >
                          ● {item.status}
                        </span>

                        <button 
                          onClick={() => deleteInterview(item.id)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-slate-100 transition cursor-pointer"
                          title="Remove Entry"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Schedule Quick Form */}
                <form onSubmit={handleAddInterview} className="bg-slate-50 border border-slate-200/90 p-5 rounded-2xl space-y-4 pt-4">
                  <h4 className="font-mono font-bold text-xs text-emerald-800 uppercase tracking-wider">
                    Schedule Candidate Interview
                  </h4>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <input
                      type="text"
                      required
                      placeholder="Candidate Name"
                      value={newInterview.candidateName}
                      onChange={(e) => setNewInterview({ ...newInterview, candidateName: e.target.value })}
                      className="border border-slate-200 rounded-xl p-2.5 bg-white text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                    />
                    <input
                      type="text"
                      required
                      placeholder="Date (e.g. July 18th)"
                      value={newInterview.date}
                      onChange={(e) => setNewInterview({ ...newInterview, date: e.target.value })}
                      className="border border-slate-200 rounded-xl p-2.5 bg-white text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                    />
                    <input
                      type="text"
                      placeholder="Time (e.g. 10:00 AM UTC)"
                      value={newInterview.time}
                      onChange={(e) => setNewInterview({ ...newInterview, time: e.target.value })}
                      className="border border-slate-200 rounded-xl p-2.5 bg-white text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-2.5 rounded-xl text-xs cursor-pointer shadow-xs transition"
                  >
                    Add Interview Entry
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
                <div className="border-b border-slate-100 pb-4">
                  <h3 className="font-display font-bold text-lg text-slate-900">Private Sourcing Notes</h3>
                  <p className="text-xs text-slate-500 mt-0.5">Notes you've attached to candidate dossiers for internal review.</p>
                </div>

                {allNotes.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {allNotes.map((note) => (
                      <div key={note.id} className="border border-slate-200 bg-slate-50/60 p-5 rounded-2xl space-y-2.5 relative">
                        <div className="flex items-center justify-between border-b border-slate-200/80 pb-2">
                          <h4 className="font-bold text-slate-900 text-xs">{note.name}</h4>
                          <span className="text-[10px] font-mono text-slate-400">UID: {note.id}</span>
                        </div>
                        <p className="text-xs text-slate-700 leading-relaxed italic">
                          "{note.text}"
                        </p>
                        
                        <button
                          onClick={() => {
                            if (navigateToPage) navigateToPage('directory');
                          }}
                          className="mt-2 text-xs font-semibold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 cursor-pointer"
                        >
                          <span>Open Candidate in Directory</span>
                          <ExternalLink className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="bg-slate-50 rounded-2xl border border-slate-200 p-10 text-center space-y-2">
                    <Bookmark className="w-8 h-8 text-slate-400 mx-auto" />
                    <p className="text-slate-900 font-bold text-xs">No candidate notes saved yet.</p>
                    <p className="text-xs text-slate-500">Open individual profiles in the talent directory to record private review notes.</p>
                    <button
                      onClick={() => navigateToPage && navigateToPage('directory')}
                      className="mt-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-2 px-4 rounded-xl text-xs cursor-pointer shadow-xs"
                    >
                      Browse Talent Directory
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
                <div className="border-b border-slate-100 pb-4">
                  <h3 className="font-display font-bold text-lg text-slate-900 flex items-center gap-2">
                    <Building className="w-5 h-5 text-emerald-600" />
                    <span>Company Preferences & Hiring Needs</span>
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Update organization specifications to receive optimized candidate recommendations.
                  </p>
                </div>

                <form onSubmit={handleSavePreferences} className="space-y-5 max-w-xl bg-slate-50 border border-slate-200 p-6 rounded-2xl">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-slate-700 block">Organization Name</label>
                      <input
                        type="text"
                        required
                        value={orgName}
                        onChange={(e) => setOrgName(e.target.value)}
                        className="w-full border border-slate-200 bg-white rounded-xl py-2 px-3 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-slate-700 block">Team Size</label>
                      <select
                        value={orgSize}
                        onChange={(e) => setOrgSize(e.target.value)}
                        className="w-full border border-slate-200 bg-white rounded-xl py-2 px-3 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
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
                      <label className="text-xs font-semibold text-slate-700 block">Industry Vertical</label>
                      <select
                        value={industry}
                        onChange={(e) => setIndustry(e.target.value)}
                        className="w-full border border-slate-200 bg-white rounded-xl py-2 px-3 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                      >
                        <option value="Digital Marketing">Digital Growth Marketing</option>
                        <option value="E-Commerce Operations">E-Commerce Operations</option>
                        <option value="AI Automation Consulting">AI Automation Consulting</option>
                        <option value="SaaS / Software Product">SaaS Product / Tech</option>
                        <option value="Creative Agency">Creative & Media Agency</option>
                      </select>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-slate-700 block">Target Role Type</label>
                      <select
                        value={neededRole}
                        onChange={(e) => setNeededRole(e.target.value)}
                        className="w-full border border-slate-200 bg-white rounded-xl py-2 px-3 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                      >
                        <option value="Interns">Remote Interns Pathways</option>
                        <option value="Project Freelancers">Project Freelancers (Contracts)</option>
                        <option value="Full-Time Dedicated Talent">Full-Time Dedicated Talent</option>
                      </select>
                    </div>
                  </div>

                  {settingsSuccess && (
                    <div className="p-2.5 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-medium rounded-xl text-center flex items-center justify-center gap-1.5 animate-fadeIn">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span>Company preferences successfully synchronized!</span>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={savingSettings}
                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-2.5 rounded-xl text-xs transition cursor-pointer shadow-xs flex items-center justify-center gap-1.5"
                  >
                    {savingSettings ? (
                      <span>Saving preferences...</span>
                    ) : (
                      <>
                        <Save className="w-4 h-4 text-white" />
                        <span>Save Company Preferences</span>
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
