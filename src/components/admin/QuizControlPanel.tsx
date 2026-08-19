import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Sliders, 
  HelpCircle, 
  Users, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Unlock, 
  Plus, 
  Trash2, 
  ExternalLink, 
  RefreshCw, 
  Save, 
  Search, 
  AlertCircle,
  BookOpen,
  Sparkles,
  ChevronDown,
  ChevronUp,
  BarChart3,
  Layers,
  Check
} from 'lucide-react';
import { 
  QuizSettings, 
  QuizQuestion, 
  TalentProfileQuizRecord,
  DEFAULT_QUIZ_SETTINGS,
  getQuizSettings, 
  updateQuizSettings, 
  getQuizQuestions, 
  createQuizQuestion, 
  deleteQuizQuestion, 
  toggleQuizQuestionStatus, 
  getTalentProfilesForQuiz, 
  unlockPhaseTwo 
} from '../../lib/quizAdmin';
import { QuizReportingDashboard } from './QuizReportingDashboard';

export const QuizControlPanel: React.FC = () => {
  // Navigation tabs within Quiz Control Panel
  const [activeTab, setActiveTab] = useState<'config' | 'questions' | 'talents' | 'reports'>('config');

  // --- 1. Global Config State ---
  const [settings, setSettings] = useState<QuizSettings>(DEFAULT_QUIZ_SETTINGS);
  const [settingsLoading, setSettingsLoading] = useState<boolean>(true);
  const [savingSettings, setSavingSettings] = useState<boolean>(false);
  const [settingsSuccessMsg, setSettingsSuccessMsg] = useState<string | null>(null);

  // --- 2. Questions State & Accordion States ---
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [questionsLoading, setQuestionsLoading] = useState<boolean>(true);
  const [isAddingQuestion, setIsAddingQuestion] = useState<boolean>(false);
  const [expandedQuestionIds, setExpandedQuestionIds] = useState<Record<number, boolean>>({});
  
  const [newCategory, setNewCategory] = useState<string>('Growth Marketing');
  const [newQuestionText, setNewQuestionText] = useState<string>('');
  const [optA, setOptA] = useState<string>('');
  const [optB, setOptB] = useState<string>('');
  const [optC, setOptC] = useState<string>('');
  const [optD, setOptD] = useState<string>('');
  const [correctOpt, setCorrectOpt] = useState<'A' | 'B' | 'C' | 'D'>('A');
  const [questionError, setQuestionError] = useState<string | null>(null);
  const [creatingQuestion, setCreatingQuestion] = useState<boolean>(false);

  // --- 3. Talent Phase Manager State ---
  const [talents, setTalents] = useState<TalentProfileQuizRecord[]>([]);
  const [talentsLoading, setTalentsLoading] = useState<boolean>(true);
  const [talentSearch, setTalentSearch] = useState<string>('');
  const [phaseFilter, setPhaseFilter] = useState<'all' | 'pending' | 'passed' | 'cooldown'>('all');
  const [unlockingId, setUnlockingId] = useState<string | null>(null);
  const [talentSuccessMsg, setTalentSuccessMsg] = useState<string | null>(null);

  // Initial Data Load
  useEffect(() => {
    loadSettings();
    loadQuestions();
    loadTalents();
  }, []);

  const loadSettings = async () => {
    setSettingsLoading(true);
    try {
      const data = await getQuizSettings();
      setSettings(data);
    } catch (err) {
      console.error('Error loading settings:', err);
    } finally {
      setSettingsLoading(false);
    }
  };

  const loadQuestions = async () => {
    setQuestionsLoading(true);
    try {
      const data = await getQuizQuestions();
      setQuestions(data);
      // Default first 3 questions expanded
      const initialExpanded: Record<number, boolean> = {};
      data.slice(0, 3).forEach(q => {
        if (q.id) initialExpanded[q.id] = true;
      });
      setExpandedQuestionIds(initialExpanded);
    } catch (err) {
      console.error('Error loading questions:', err);
    } finally {
      setQuestionsLoading(false);
    }
  };

  const loadTalents = async () => {
    setTalentsLoading(true);
    try {
      const data = await getTalentProfilesForQuiz();
      setTalents(data);
    } catch (err) {
      console.error('Error loading talents:', err);
    } finally {
      setTalentsLoading(false);
    }
  };

  // Toggle individual question accordion
  const toggleQuestionAccordion = (id: number) => {
    setExpandedQuestionIds(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  // Expand / Collapse all questions
  const handleToggleExpandAll = () => {
    const allExpanded = questions.every(q => q.id && expandedQuestionIds[q.id]);
    const nextState: Record<number, boolean> = {};
    questions.forEach(q => {
      if (q.id) nextState[q.id] = !allExpanded;
    });
    setExpandedQuestionIds(nextState);
  };

  // 1. Save Settings Handler
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingSettings(true);
    setSettingsSuccessMsg(null);
    try {
      const updated = await updateQuizSettings(settings);
      setSettings(updated);
      setSettingsSuccessMsg('Quiz threshold & cooldown configurations updated successfully.');
      setTimeout(() => setSettingsSuccessMsg(null), 4000);
    } catch (err: any) {
      console.error('Failed to save settings:', err);
    } finally {
      setSavingSettings(false);
    }
  };

  // 2. Create Question Handler
  const handleCreateQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    setQuestionError(null);

    if (!newQuestionText.trim() || !optA.trim() || !optB.trim() || !optC.trim() || !optD.trim()) {
      setQuestionError('Please fill in the question text and all 4 answer options.');
      return;
    }

    setCreatingQuestion(true);
    try {
      const newQuestionPayload = {
        skill_category: newCategory.trim(),
        question_text: newQuestionText.trim(),
        options: [
          { id: 'A', text: optA.trim() },
          { id: 'B', text: optB.trim() },
          { id: 'C', text: optC.trim() },
          { id: 'D', text: optD.trim() }
        ],
        correct_option_id: correctOpt,
        is_active: true
      };

      const res = await createQuizQuestion(newQuestionPayload);
      if (res) {
        setQuestions(prev => [res, ...prev]);
        if (res.id) {
          setExpandedQuestionIds(prev => ({ ...prev, [res.id!]: true }));
        }
        // Reset form
        setNewQuestionText('');
        setOptA('');
        setOptB('');
        setOptC('');
        setOptD('');
        setCorrectOpt('A');
        setIsAddingQuestion(false);
      }
    } catch (err: any) {
      setQuestionError(err.message || 'Failed to save question.');
    } finally {
      setCreatingQuestion(false);
    }
  };

  // Delete Question Handler
  const handleDeleteQuestion = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this question?')) return;
    const ok = await deleteQuizQuestion(id);
    if (ok) {
      setQuestions(prev => prev.filter(q => q.id !== id));
    }
  };

  // Toggle Question Active Status
  const handleToggleQuestion = async (id: number, currentStatus: boolean) => {
    const ok = await toggleQuizQuestionStatus(id, !currentStatus);
    if (ok) {
      setQuestions(prev => prev.map(q => q.id === id ? { ...q, is_active: !currentStatus } : q));
    }
  };

  // 3. Manual Unlock Phase 2 Handler
  const handleUnlockPhaseTwo = async (talentId: string, talentName: string) => {
    setUnlockingId(talentId);
    setTalentSuccessMsg(null);
    try {
      const ok = await unlockPhaseTwo(talentId);
      if (ok) {
        setTalents(prev => prev.map(t => {
          if (t.id === talentId) {
            return {
              ...t,
              phase_2_unlocked: true,
              phase_1_status: 'passed',
              next_retry_date: null
            };
          }
          return t;
        }));
        setTalentSuccessMsg(`Phase 2 successfully unlocked for ${talentName}. Candidate marked as Passed.`);
        setTimeout(() => setTalentSuccessMsg(null), 4000);
      }
    } catch (err: any) {
      console.error('Error unlocking Phase 2:', err);
    } finally {
      setUnlockingId(null);
    }
  };

  // Filtered Talents
  const filteredTalents = talents.filter(t => {
    const matchesSearch = 
      t.full_name.toLowerCase().includes(talentSearch.toLowerCase()) ||
      t.email.toLowerCase().includes(talentSearch.toLowerCase()) ||
      (t.role && t.role.toLowerCase().includes(talentSearch.toLowerCase()));

    if (!matchesSearch) return false;

    if (phaseFilter === 'pending') return t.phase_1_status === 'pending';
    if (phaseFilter === 'passed') return t.phase_1_status === 'passed' || t.phase_2_unlocked;
    if (phaseFilter === 'cooldown') return t.phase_1_status === 'cooldown';
    return true;
  });

  return (
    <div id="quiz-control-panel-root" className="space-y-6">
      {/* Top Banner / Header */}
      <div className="bg-slate-900 text-white rounded-2xl p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-sm border border-slate-800">
        <div>
          <div className="flex items-center gap-2 text-emerald-400 text-xs font-mono font-bold uppercase tracking-wider mb-2">
            <Sparkles className="w-4 h-4" />
            <span>Accreditation Engine & Assessment Config</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
            Quiz & Assessment Control Panel
          </h2>
          <p className="text-slate-400 text-sm mt-1 max-w-2xl">
            Configure passing benchmarks, author skill verification questions with animated accordions, monitor candidate cooldowns, and analyze pass/fail error trends.
          </p>
        </div>

        {/* Global Navigation Pills */}
        <div className="flex flex-wrap items-center bg-slate-800/80 p-1.5 rounded-xl border border-slate-700/60 self-start md:self-auto gap-1">
          <button
            onClick={() => setActiveTab('config')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition ${
              activeTab === 'config' 
                ? 'bg-emerald-600 text-white shadow-xs' 
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Sliders className="w-4 h-4" />
            <span>Global Rules</span>
          </button>
          <button
            onClick={() => setActiveTab('questions')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition ${
              activeTab === 'questions' 
                ? 'bg-emerald-600 text-white shadow-xs' 
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <HelpCircle className="w-4 h-4" />
            <span>Question Bank ({questions.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('talents')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition ${
              activeTab === 'talents' 
                ? 'bg-emerald-600 text-white shadow-xs' 
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Phase Manager ({talents.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('reports')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition ${
              activeTab === 'reports' 
                ? 'bg-emerald-600 text-white shadow-xs' 
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            <span>Reporting & Analytics</span>
          </button>
        </div>
      </div>

      {/* =========================================================================
          TAB 1: GLOBAL CONFIG FORM (`quiz_settings`)
         ========================================================================= */}
      {activeTab === 'config' && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 space-y-6 shadow-xs animate-fadeIn">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Sliders className="w-5 h-5 text-emerald-600" />
                Global Quiz & Cooldown Configuration
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                These thresholds govern candidate evaluation, automatic cooldown locking, and refresher curriculum routing.
              </p>
            </div>
            <button
              onClick={loadSettings}
              className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition"
              title="Refresh settings"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>

          {settingsSuccessMsg && (
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-3 text-emerald-800 text-xs font-medium animate-fadeIn">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{settingsSuccessMsg}</span>
            </div>
          )}

          <form onSubmit={handleSaveSettings} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Passing Grade */}
              <div className="space-y-2 bg-slate-50/70 p-4 rounded-xl border border-slate-200">
                <label className="text-xs font-bold text-slate-900 block">
                  Passing Grade Threshold (%)
                </label>
                <p className="text-[11px] text-slate-500">
                  Minimum score required for automatic Phase 2 qualification.
                </p>
                <div className="relative mt-2">
                  <input
                    type="number"
                    min="1"
                    max="100"
                    required
                    value={settings.passing_grade}
                    onChange={(e) => setSettings({ ...settings, passing_grade: Number(e.target.value) })}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 bg-white"
                  />
                  <span className="absolute right-3 top-2 text-xs font-bold text-slate-400">%</span>
                </div>
              </div>

              {/* Max Attempts */}
              <div className="space-y-2 bg-slate-50/70 p-4 rounded-xl border border-slate-200">
                <label className="text-xs font-bold text-slate-900 block">
                  Max Attempt Limit
                </label>
                <p className="text-[11px] text-slate-500">
                  Total allowed submissions before candidate is locked in cooldown.
                </p>
                <div className="relative mt-2">
                  <input
                    type="number"
                    min="1"
                    max="10"
                    required
                    value={settings.max_attempts}
                    onChange={(e) => setSettings({ ...settings, max_attempts: Number(e.target.value) })}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 bg-white"
                  />
                  <span className="absolute right-3 top-2 text-xs font-semibold text-slate-400">Tries</span>
                </div>
              </div>

              {/* Cooldown Days */}
              <div className="space-y-2 bg-slate-50/70 p-4 rounded-xl border border-slate-200">
                <label className="text-xs font-bold text-slate-900 block">
                  Cooldown Period (Days)
                </label>
                <p className="text-[11px] text-slate-500">
                  Mandatory study duration before retry timestamp is unlocked.
                </p>
                <div className="relative mt-2">
                  <input
                    type="number"
                    min="1"
                    max="90"
                    required
                    value={settings.cooldown_days}
                    onChange={(e) => setSettings({ ...settings, cooldown_days: Number(e.target.value) })}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 bg-white"
                  />
                  <span className="absolute right-3 top-2 text-xs font-semibold text-slate-400">Days</span>
                </div>
              </div>
            </div>

            {/* Course URL Link */}
            <div className="space-y-2 bg-slate-50/70 p-4 rounded-xl border border-slate-200">
              <label className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                <BookOpen className="w-4 h-4 text-emerald-600" />
                Refresher Course Link (`course_url`)
              </label>
              <p className="text-[11px] text-slate-500">
                The targeted educational resource presented to candidates placed into cooldown mode (Default: DSP Academy).
              </p>
              <div className="flex items-center gap-3 mt-2">
                <input
                  type="url"
                  required
                  placeholder="https://learnwithdsp.com/"
                  value={settings.course_url}
                  onChange={(e) => setSettings({ ...settings, course_url: e.target.value })}
                  className="flex-1 border border-slate-300 rounded-lg px-3 py-2 text-xs font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 bg-white"
                />
                <a 
                  href={settings.course_url} 
                  target="_blank" 
                  rel="noreferrer"
                  className="px-3 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  Test URL
                </a>
              </div>
            </div>

            {/* Action Bar */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="submit"
                disabled={savingSettings}
                className="bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white font-semibold py-2.5 px-6 rounded-xl text-xs flex items-center gap-2 shadow-xs transition cursor-pointer"
              >
                {savingSettings ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Persisting Settings...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-3.5 h-3.5" />
                    <span>Save Quiz Settings</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* =========================================================================
          TAB 2: QUESTION BUILDER WITH FRAMER-MOTION ACCORDIONS (`quiz_questions`)
         ========================================================================= */}
      {activeTab === 'questions' && (
        <div className="space-y-6">
          {/* Create Question Header / Toggle */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <HelpCircle className="w-5 h-5 text-emerald-600" />
                Assessment Question Bank & Builder
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Author and manage verified multi-choice questions with animated accordion previews.
              </p>
            </div>
            
            <div className="flex items-center gap-2 self-start sm:self-auto">
              <button
                onClick={handleToggleExpandAll}
                className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold py-2 px-3 rounded-xl text-xs flex items-center gap-1.5 transition cursor-pointer"
              >
                <Layers className="w-3.5 h-3.5" />
                <span>Toggle Accordions</span>
              </button>

              <button
                onClick={() => setIsAddingQuestion(!isAddingQuestion)}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-2 px-4 rounded-xl text-xs flex items-center gap-2 shadow-xs transition cursor-pointer"
              >
                {isAddingQuestion ? (
                  <>
                    <XCircle className="w-4 h-4" />
                    <span>Close Builder</span>
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4" />
                    <span>Create New Question</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* QUESTION BUILDER FORM WITH FRAMER-MOTION SMOOTH EXPANSION */}
          <AnimatePresence>
            {isAddingQuestion && (
              <motion.div
                initial={{ opacity: 0, height: 0, scale: 0.98 }}
                animate={{ opacity: 1, height: 'auto', scale: 1 }}
                exit={{ opacity: 0, height: 0, scale: 0.98 }}
                transition={{ duration: 0.3, ease: 'easeInOut' }}
                className="overflow-hidden"
              >
                <div className="bg-emerald-50/60 border-2 border-emerald-300 rounded-2xl p-6 sm:p-8 space-y-6 shadow-sm">
                  <div className="flex items-center justify-between border-b border-emerald-200/60 pb-3">
                    <div className="flex items-center gap-2">
                      <Plus className="w-4 h-4 text-emerald-700" />
                      <span className="text-xs font-bold uppercase tracking-wider text-emerald-900">
                        Interactive Question Builder Form
                      </span>
                    </div>
                    <span className="text-[11px] text-slate-500">Provide 4 choices and assign the correct answer ID</span>
                  </div>

                  {questionError && (
                    <motion.div 
                      initial={{ opacity: 0, y: -8 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs flex items-center gap-2"
                    >
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span>{questionError}</span>
                    </motion.div>
                  )}

                  <form onSubmit={handleCreateQuestion} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="md:col-span-1 space-y-1.5">
                        <label className="text-xs font-semibold text-slate-800">Skill Category</label>
                        <select
                          value={newCategory}
                          onChange={(e) => setNewCategory(e.target.value)}
                          className="w-full border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900 bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
                        >
                          <option value="Growth Marketing">Growth Marketing & Strategy</option>
                          <option value="Paid Media & PPC">Paid Media & PPC Advertising</option>
                          <option value="SEO & Organic">SEO & Organic Visibility</option>
                          <option value="Conversion Optimization">CRO & A/B Testing</option>
                          <option value="Email & Lifecycle">Email & Lifecycle Automation</option>
                          <option value="Analytics & Attribution">Analytics & Attribution</option>
                          <option value="General Digital">General Digital Strategy</option>
                        </select>
                      </div>

                      <div className="md:col-span-2 space-y-1.5">
                        <label className="text-xs font-semibold text-slate-800">Question Text</label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. Which metric best evaluates bottom-of-funnel conversion efficiency for retargeting campaigns?"
                          value={newQuestionText}
                          onChange={(e) => setNewQuestionText(e.target.value)}
                          className="w-full border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900 bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
                        />
                      </div>
                    </div>

                    {/* 4 Choices */}
                    <div className="space-y-3 pt-2">
                      <label className="text-xs font-bold text-slate-900 block">Answer Choices & Correct Option</label>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {/* Option A */}
                        <div className={`p-3 rounded-xl border flex items-center gap-3 transition ${
                          correctOpt === 'A' ? 'bg-emerald-100/80 border-emerald-400 shadow-2xs' : 'bg-white border-slate-200'
                        }`}>
                          <input
                            type="radio"
                            id="optA_radio"
                            name="correctOption"
                            checked={correctOpt === 'A'}
                            onChange={() => setCorrectOpt('A')}
                            className="text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                          />
                          <span className="font-mono text-xs font-bold text-slate-700">A.</span>
                          <input
                            type="text"
                            required
                            placeholder="Choice A description..."
                            value={optA}
                            onChange={(e) => setOptA(e.target.value)}
                            className="flex-1 bg-transparent text-xs text-slate-900 focus:outline-none border-b border-dashed border-slate-300 focus:border-emerald-600 py-1"
                          />
                        </div>

                        {/* Option B */}
                        <div className={`p-3 rounded-xl border flex items-center gap-3 transition ${
                          correctOpt === 'B' ? 'bg-emerald-100/80 border-emerald-400 shadow-2xs' : 'bg-white border-slate-200'
                        }`}>
                          <input
                            type="radio"
                            id="optB_radio"
                            name="correctOption"
                            checked={correctOpt === 'B'}
                            onChange={() => setCorrectOpt('B')}
                            className="text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                          />
                          <span className="font-mono text-xs font-bold text-slate-700">B.</span>
                          <input
                            type="text"
                            required
                            placeholder="Choice B description..."
                            value={optB}
                            onChange={(e) => setOptB(e.target.value)}
                            className="flex-1 bg-transparent text-xs text-slate-900 focus:outline-none border-b border-dashed border-slate-300 focus:border-emerald-600 py-1"
                          />
                        </div>

                        {/* Option C */}
                        <div className={`p-3 rounded-xl border flex items-center gap-3 transition ${
                          correctOpt === 'C' ? 'bg-emerald-100/80 border-emerald-400 shadow-2xs' : 'bg-white border-slate-200'
                        }`}>
                          <input
                            type="radio"
                            id="optC_radio"
                            name="correctOption"
                            checked={correctOpt === 'C'}
                            onChange={() => setCorrectOpt('C')}
                            className="text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                          />
                          <span className="font-mono text-xs font-bold text-slate-700">C.</span>
                          <input
                            type="text"
                            required
                            placeholder="Choice C description..."
                            value={optC}
                            onChange={(e) => setOptC(e.target.value)}
                            className="flex-1 bg-transparent text-xs text-slate-900 focus:outline-none border-b border-dashed border-slate-300 focus:border-emerald-600 py-1"
                          />
                        </div>

                        {/* Option D */}
                        <div className={`p-3 rounded-xl border flex items-center gap-3 transition ${
                          correctOpt === 'D' ? 'bg-emerald-100/80 border-emerald-400 shadow-2xs' : 'bg-white border-slate-200'
                        }`}>
                          <input
                            type="radio"
                            id="optD_radio"
                            name="correctOption"
                            checked={correctOpt === 'D'}
                            onChange={() => setCorrectOpt('D')}
                            className="text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                          />
                          <span className="font-mono text-xs font-bold text-slate-700">D.</span>
                          <input
                            type="text"
                            required
                            placeholder="Choice D description..."
                            value={optD}
                            onChange={(e) => setOptD(e.target.value)}
                            className="flex-1 bg-transparent text-xs text-slate-900 focus:outline-none border-b border-dashed border-slate-300 focus:border-emerald-600 py-1"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-end gap-3 pt-4 border-t border-emerald-200/60">
                      <button
                        type="button"
                        onClick={() => setIsAddingQuestion(false)}
                        className="px-4 py-2 border border-slate-300 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-100 transition cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={creatingQuestion}
                        className="bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-semibold py-2 px-5 rounded-xl text-xs flex items-center gap-2 shadow-xs transition cursor-pointer"
                      >
                        {creatingQuestion ? (
                          <>
                            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                            <span>Publishing Question...</span>
                          </>
                        ) : (
                          <>
                            <Plus className="w-3.5 h-3.5" />
                            <span>Publish Question to Bank</span>
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* QUESTIONS LIST WITH FRAMER-MOTION ACCORDIONS */}
          <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
            <div className="p-4 bg-slate-50/70 border-b border-slate-200 flex items-center justify-between">
              <span className="text-xs font-bold text-slate-800">
                Active Assessment Questions ({questions.length})
              </span>
              <button 
                onClick={loadQuestions}
                className="text-xs text-slate-500 hover:text-slate-800 flex items-center gap-1 transition"
              >
                <RefreshCw className="w-3 h-3" />
                Reload Questions
              </button>
            </div>

            {questionsLoading ? (
              <div className="p-12 text-center text-slate-400 text-xs">
                <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-emerald-600" />
                Loading question repository...
              </div>
            ) : questions.length === 0 ? (
              <div className="p-12 text-center space-y-3">
                <HelpCircle className="w-10 h-10 text-slate-300 mx-auto" />
                <h4 className="text-sm font-bold text-slate-700">No Assessment Questions Found</h4>
                <p className="text-xs text-slate-400 max-w-sm mx-auto">
                  Get started by authoring assessment questions using the Question Builder button above.
                </p>
              </div>
            ) : (
              <motion.div layout className="divide-y divide-slate-100">
                <AnimatePresence>
                  {questions.map((q, idx) => {
                    const isExpanded = Boolean(q.id && expandedQuestionIds[q.id]);
                    return (
                      <motion.div
                        layout
                        key={q.id || idx}
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ duration: 0.25 }}
                        className="hover:bg-slate-50/60 transition group"
                      >
                        {/* Question Item Header Accordion Trigger */}
                        <div 
                          onClick={() => q.id && toggleQuestionAccordion(q.id)}
                          className="p-4 sm:p-5 flex items-start justify-between gap-4 cursor-pointer select-none"
                        >
                          <div className="flex items-start gap-3 flex-1">
                            <button
                              type="button"
                              className="mt-0.5 w-6 h-6 rounded-lg bg-slate-100 group-hover:bg-emerald-50 text-slate-500 group-hover:text-emerald-700 flex items-center justify-center transition shrink-0"
                            >
                              {isExpanded ? (
                                <ChevronUp className="w-3.5 h-3.5" />
                              ) : (
                                <ChevronDown className="w-3.5 h-3.5" />
                              )}
                            </button>

                            <div className="space-y-1 flex-1">
                              <div className="flex flex-wrap items-center gap-2">
                                <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 bg-slate-100 text-slate-700 border border-slate-200 rounded-md">
                                  {q.skill_category}
                                </span>
                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                  q.is_active ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-slate-100 text-slate-500'
                                }`}>
                                  {q.is_active ? 'Active' : 'Disabled'}
                                </span>
                                <span className="text-[10px] font-mono text-slate-400">
                                  Correct Choice: {q.correct_option_id}
                                </span>
                              </div>
                              <h4 className="text-xs font-bold text-slate-900 group-hover:text-emerald-950 transition">
                                {idx + 1}. {q.question_text}
                              </h4>
                            </div>
                          </div>

                          {/* Controls (Stop Propagation so clicking actions doesn't toggle accordion) */}
                          <div 
                            className="flex items-center gap-2 shrink-0" 
                            onClick={(e) => e.stopPropagation()}
                          >
                            <button
                              onClick={() => q.id && handleToggleQuestion(q.id, q.is_active)}
                              className={`text-[11px] font-semibold px-2.5 py-1 rounded-lg border transition cursor-pointer ${
                                q.is_active 
                                  ? 'border-slate-200 hover:bg-slate-100 text-slate-600' 
                                  : 'border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                              }`}
                            >
                              {q.is_active ? 'Deactivate' : 'Activate'}
                            </button>
                            <button
                              onClick={() => q.id && handleDeleteQuestion(q.id)}
                              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition cursor-pointer"
                              title="Delete question"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>

                        {/* ACCORDION CONTENT EXPANSION */}
                        <AnimatePresence>
                          {isExpanded && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: 'auto' }}
                              exit={{ opacity: 0, height: 0 }}
                              transition={{ duration: 0.25, ease: 'easeInOut' }}
                              className="overflow-hidden px-5 pb-5 pt-0"
                            >
                              <div className="pl-9 space-y-3 pt-1 border-t border-dashed border-slate-200/80">
                                <span className="text-[11px] font-semibold text-slate-500 block">
                                  Multiple Choice Options & Verified Answer Key:
                                </span>
                                
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                                  {q.options.map((opt) => {
                                    const isCorrect = opt.id === q.correct_option_id;
                                    return (
                                      <div 
                                        key={opt.id} 
                                        className={`p-2.5 rounded-xl border flex items-center gap-2.5 transition ${
                                          isCorrect 
                                            ? 'bg-emerald-50/90 border-emerald-400 font-semibold text-emerald-950 shadow-2xs' 
                                            : 'bg-slate-50/60 border-slate-200 text-slate-700'
                                        }`}
                                      >
                                        <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 ${
                                          isCorrect ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-700'
                                        }`}>
                                          {opt.id}
                                        </span>
                                        <span className="flex-1 text-xs">{opt.text}</span>
                                        {isCorrect && (
                                          <span className="inline-flex items-center gap-1 text-[10px] uppercase font-bold text-emerald-700 bg-emerald-100/80 px-1.5 py-0.5 rounded shrink-0">
                                            <Check className="w-3 h-3" />
                                            Correct
                                          </span>
                                        )}
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </motion.div>
            )}
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 3: TALENT PHASE MANAGER (`talent_profiles`)
         ========================================================================= */}
      {activeTab === 'talents' && (
        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs space-y-0 animate-fadeIn">
          {/* Header Controls */}
          <div className="p-6 border-b border-slate-100 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Users className="w-5 h-5 text-emerald-600" />
                  Talent Candidate Phase & Cooldown Manager
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Review test completion states, monitor active cooldown intervals, and override Phase 2 unlocks.
                </p>
              </div>
              <button
                onClick={loadTalents}
                className="text-xs font-semibold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition self-start sm:self-auto cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Refresh Candidates
              </button>
            </div>

            {talentSuccessMsg && (
              <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-2 text-emerald-800 text-xs font-medium animate-fadeIn">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{talentSuccessMsg}</span>
              </div>
            )}

            {/* Filter and Search Bar */}
            <div className="flex flex-col md:flex-row items-center justify-between gap-3 pt-2">
              <div className="relative w-full md:w-80">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Search candidate name, email, or skill..."
                  value={talentSearch}
                  onChange={(e) => setTalentSearch(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 bg-slate-50/50"
                />
              </div>

              {/* Status Filter Tabs */}
              <div className="flex items-center bg-slate-100 p-1 rounded-xl w-full md:w-auto overflow-x-auto">
                <button
                  onClick={() => setPhaseFilter('all')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                    phaseFilter === 'all' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  All ({talents.length})
                </button>
                <button
                  onClick={() => setPhaseFilter('passed')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                    phaseFilter === 'passed' ? 'bg-white text-emerald-700 shadow-2xs' : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  Passed / Phase 2
                </button>
                <button
                  onClick={() => setPhaseFilter('cooldown')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                    phaseFilter === 'cooldown' ? 'bg-white text-rose-700 shadow-2xs' : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  In Cooldown
                </button>
                <button
                  onClick={() => setPhaseFilter('pending')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                    phaseFilter === 'pending' ? 'bg-white text-amber-700 shadow-2xs' : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  Pending
                </button>
              </div>
            </div>
          </div>

          {/* Table Container */}
          <div className="overflow-x-auto">
            {talentsLoading ? (
              <div className="p-12 text-center text-slate-400 text-xs">
                <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-emerald-600" />
                Loading candidate phase data...
              </div>
            ) : filteredTalents.length === 0 ? (
              <div className="p-12 text-center space-y-2">
                <Users className="w-8 h-8 text-slate-300 mx-auto" />
                <p className="text-xs text-slate-500">No candidates match the selected criteria.</p>
              </div>
            ) : (
              <table className="w-full text-left text-xs text-slate-700">
                <thead className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  <tr>
                    <th className="py-3 px-4">Talent Profile</th>
                    <th className="py-3 px-4">Phase 1 Status</th>
                    <th className="py-3 px-4">Score</th>
                    <th className="py-3 px-4">Phase 2 Gate</th>
                    <th className="py-3 px-4">Cooldown Expiry</th>
                    <th className="py-3 px-4 text-right">Administrative Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredTalents.map((talent) => {
                    const isCooldown = talent.phase_1_status === 'cooldown';
                    const isPassed = talent.phase_1_status === 'passed' || talent.phase_2_unlocked;
                    const retryDate = talent.next_retry_date ? new Date(talent.next_retry_date) : null;
                    const isStillCooling = retryDate && retryDate.getTime() > Date.now();

                    return (
                      <tr key={talent.id} className="hover:bg-slate-50/70 transition">
                        {/* Profile */}
                        <td className="py-3.5 px-4">
                          <div className="space-y-0.5">
                            <span className="font-bold text-slate-900 block">{talent.full_name}</span>
                            <span className="text-[11px] text-slate-500 font-mono block">{talent.email}</span>
                            {talent.role && (
                              <span className="text-[10px] text-slate-400">{talent.role}</span>
                            )}
                          </div>
                        </td>

                        {/* Phase 1 Status */}
                        <td className="py-3.5 px-4">
                          {isPassed ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              Passed
                            </span>
                          ) : isCooldown ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                              <Clock className="w-3.5 h-3.5" />
                              In Cooldown
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                              Pending Assessment
                            </span>
                          )}
                        </td>

                        {/* Quiz Score */}
                        <td className="py-3.5 px-4 font-mono font-semibold text-slate-800">
                          {talent.quiz_score !== null && talent.quiz_score !== undefined 
                            ? `${talent.quiz_score}%` 
                            : <span className="text-slate-300">—</span>}
                        </td>

                        {/* Phase 2 Gate */}
                        <td className="py-3.5 px-4">
                          {talent.phase_2_unlocked ? (
                            <span className="inline-flex items-center gap-1 text-emerald-700 font-semibold text-[11px]">
                              <Unlock className="w-3.5 h-3.5 text-emerald-600" />
                              Unlocked
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-slate-400 font-medium text-[11px]">
                              <XCircle className="w-3.5 h-3.5 text-slate-400" />
                              Locked
                            </span>
                          )}
                        </td>

                        {/* Cooldown Expiry */}
                        <td className="py-3.5 px-4 text-[11px] text-slate-600">
                          {isCooldown && retryDate ? (
                            <div className="space-y-0.5">
                              <span className="font-medium text-slate-800 block">
                                {retryDate.toLocaleDateString()}
                              </span>
                              {isStillCooling ? (
                                <span className="text-[10px] text-rose-600 font-medium">
                                  {Math.ceil((retryDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24))} days left
                                </span>
                              ) : (
                                <span className="text-[10px] text-emerald-600 font-medium">
                                  Eligible to Retake
                                </span>
                              )}
                            </div>
                          ) : (
                            <span className="text-slate-300">—</span>
                          )}
                        </td>

                        {/* Actions */}
                        <td className="py-3.5 px-4 text-right">
                          {talent.phase_2_unlocked ? (
                            <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-100 inline-block">
                              Authorized
                            </span>
                          ) : (
                            <button
                              onClick={() => handleUnlockPhaseTwo(talent.id, talent.full_name)}
                              disabled={unlockingId === talent.id}
                              className="bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-semibold py-1.5 px-3 rounded-lg text-xs flex items-center gap-1.5 ml-auto shadow-2xs transition cursor-pointer"
                            >
                              {unlockingId === talent.id ? (
                                <RefreshCw className="w-3 h-3 animate-spin" />
                              ) : (
                                <Unlock className="w-3 h-3" />
                              )}
                              <span>Unlock Phase 2</span>
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 4: QUIZ REPORTING & DIAGNOSTICS DASHBOARD (Recharts)
         ========================================================================= */}
      {activeTab === 'reports' && (
        <QuizReportingDashboard onNavigateToQuestions={() => setActiveTab('questions')} />
      )}

    </div>
  );
};

export default QuizControlPanel;
