import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  HelpCircle, 
  Plus, 
  Trash2, 
  RefreshCw, 
  CheckCircle2, 
  AlertCircle, 
  Filter, 
  Layers, 
  Check, 
  Sparkles,
  ChevronDown,
  ChevronUp,
  FolderX,
  XCircle,
  Tag,
  Gauge,
  Database,
  Copy,
  Code
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { QuizQuestion, fetchAdminQuestions, createQuizQuestion, deleteQuizQuestion, toggleQuestionStatus } from '../../lib/quizQuestions';

export const QuestionBank: React.FC = () => {
  // Questions list state
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');

  // Form State
  const [isAdding, setIsAdding] = useState<boolean>(false);
  const [showSqlMigration, setShowSqlMigration] = useState<boolean>(false);
  const [copiedSql, setCopiedSql] = useState<boolean>(false);
  const [category, setCategory] = useState<string>('Growth Marketing Strategy');
  const [difficulty, setDifficulty] = useState<string>('beginner');
  const [questionPrompt, setQuestionPrompt] = useState<string>('');
  const [optA, setOptA] = useState<string>('');
  const [optB, setOptB] = useState<string>('');
  const [optC, setOptC] = useState<string>('');
  const [optD, setOptD] = useState<string>('');
  const [correctOptionId, setCorrectOptionId] = useState<string>('a');
  
  // UI & Feedback states
  const [saving, setSaving] = useState<boolean>(false);
  const [deletingId, setDeletingId] = useState<string | number | null>(null);
  const [togglingId, setTogglingId] = useState<string | number | null>(null);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [expandedIds, setExpandedIds] = useState<Record<string | number, boolean>>({});

  // Available Categories
  const categoryOptions = [
    'Growth Marketing Strategy',
    'Paid Media & PPC',
    'SEO & Organic Growth',
    'CRO & Conversion Optimization',
    'Email & Lifecycle Automation',
    'Analytics & Attribution',
    'Digital Marketing General',
    'AI & Automation Strategy'
  ];

  const sqlMigrationCode = `-- Run this in your Supabase SQL Editor to support 'beginner', 'intermediate', and 'advanced'
-- 1. Add new enum values to the existing 'experience_level_type' Postgres enum:
ALTER TYPE experience_level_type ADD VALUE IF NOT EXISTS 'beginner';
ALTER TYPE experience_level_type ADD VALUE IF NOT EXISTS 'intermediate';
ALTER TYPE experience_level_type ADD VALUE IF NOT EXISTS 'advanced';

-- 2. (Optional) Ensure the 'difficulty' column is present on quiz_questions:
ALTER TABLE quiz_questions ADD COLUMN IF NOT EXISTS difficulty text DEFAULT 'intermediate';`;

  const copySqlToClipboard = () => {
    navigator.clipboard.writeText(sqlMigrationCode);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 3000);
  };

  // Auto-dismiss notification after 4s
  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => setNotification(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  // 1. Initial Data Load from Supabase Live Database
  const loadQuestions = async () => {
    setLoading(true);
    try {
      const data = await fetchAdminQuestions();
      setQuestions(data);
      // Auto-expand first 3 questions for quick inspection
      const initialMap: Record<string | number, boolean> = {};
      data.slice(0, 3).forEach(q => {
        if (q.id !== undefined) initialMap[q.id] = true;
      });
      setExpandedIds(initialMap);
    } catch (err: any) {
      console.error('Error loading questions from Supabase:', err);
      setNotification({
        type: 'error',
        message: 'Failed to load questions from database. Please check Supabase connection.'
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadQuestions();
  }, []);

  // 2. Form Submission Handler (Live Supabase insert with required difficulty)
  const handleSaveQuestion = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!questionPrompt.trim() || !optA.trim() || !optB.trim() || !optC.trim() || !optD.trim()) {
      setNotification({
        type: 'error',
        message: 'Please provide the question prompt and all four answer options.'
      });
      return;
    }

    setSaving(true);
    try {
      const payload: Omit<QuizQuestion, 'id'> = {
        skill_category: category.trim(),
        difficulty: difficulty.toLowerCase().trim(),
        question_text: questionPrompt.trim(),
        options: [
          { id: 'a', text: optA.trim() },
          { id: 'b', text: optB.trim() },
          { id: 'c', text: optC.trim() },
          { id: 'd', text: optD.trim() }
        ],
        correct_option_id: correctOptionId.toLowerCase(),
        is_active: true
      };

      // Direct async insert call to Supabase with multi-strategy fallback
      const newQuestion = await createQuizQuestion(payload);

      // Prepend to questions list
      setQuestions(prev => [newQuestion, ...prev]);
      if (newQuestion.id !== undefined) {
        setExpandedIds(prev => ({ ...prev, [newQuestion.id!]: true }));
      }

      // Success notification
      setNotification({
        type: 'success',
        message: `Question with difficulty "${difficulty}" successfully saved to Supabase live database.`
      });

      // Reset form
      setQuestionPrompt('');
      setDifficulty('beginner');
      setOptA('');
      setOptB('');
      setOptC('');
      setOptD('');
      setCorrectOptionId('a');
      setIsAdding(false);
    } catch (err: any) {
      console.error('Error creating question in Supabase:', err);
      setNotification({
        type: 'error',
        message: err.message || 'Failed to save question to Supabase. Check database permissions.'
      });
    } finally {
      setSaving(false);
    }
  };

  // 3. Delete Question Handler (Direct Supabase delete)
  const handleDelete = async (id: string | number) => {
    if (!window.confirm('Are you sure you want to permanently delete this assessment question from the live database?')) {
      return;
    }

    setDeletingId(id);
    try {
      await deleteQuizQuestion(id);
      setQuestions(prev => prev.filter(q => q.id !== id));
      setNotification({
        type: 'success',
        message: 'Question deleted successfully from live database.'
      });
    } catch (err: any) {
      console.error('Error deleting question:', err);
      setNotification({
        type: 'error',
        message: err.message || 'Failed to delete question from Supabase.'
      });
    } finally {
      setDeletingId(null);
    }
  };

  // 4. Toggle Active Status Handler (Direct Supabase update)
  const handleToggleStatus = async (id: string | number, currentActive?: boolean) => {
    const nextStatus = currentActive === false ? true : false;
    setTogglingId(id);
    try {
      await toggleQuestionStatus(id, nextStatus);
      setQuestions(prev => prev.map(q => q.id === id ? { ...q, is_active: nextStatus } : q));
      setNotification({
        type: 'success',
        message: `Question status updated to ${nextStatus ? 'Active' : 'Disabled'}.`
      });
    } catch (err: any) {
      console.error('Error toggling question status:', err);
      setNotification({
        type: 'error',
        message: err.message || 'Failed to update question status.'
      });
    } finally {
      setTogglingId(null);
    }
  };

  // Toggle Accordion View
  const toggleAccordion = (id: string | number) => {
    setExpandedIds(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  // Toggle All Accordions
  const handleToggleAll = () => {
    const allExpanded = filteredQuestions.every(q => q.id !== undefined && expandedIds[q.id]);
    const nextState: Record<string | number, boolean> = {};
    filteredQuestions.forEach(q => {
      if (q.id !== undefined) nextState[q.id] = !allExpanded;
    });
    setExpandedIds(nextState);
  };

  // Filter and Search Logic
  const filteredQuestions = useMemo(() => {
    return questions.filter(q => {
      const matchesCat = selectedCategory === 'all' || q.skill_category === selectedCategory;
      const matchesDiff = selectedDifficulty === 'all' || (q.difficulty || 'intermediate').toLowerCase() === selectedDifficulty.toLowerCase();
      const term = searchTerm.toLowerCase().trim();
      const matchesSearch = !term || 
        q.question_text.toLowerCase().includes(term) || 
        q.skill_category.toLowerCase().includes(term) ||
        (q.difficulty && q.difficulty.toLowerCase().includes(term)) ||
        q.options.some(opt => opt.text.toLowerCase().includes(term));

      return matchesCat && matchesDiff && matchesSearch;
    });
  }, [questions, selectedCategory, selectedDifficulty, searchTerm]);

  // Helper for Difficulty styling
  const getDifficultyBadge = (diff?: string) => {
    const key = (diff || 'intermediate').toLowerCase();
    switch (key) {
      case 'beginner':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'advanced':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'intermediate':
      default:
        return 'bg-amber-50 text-amber-700 border-amber-200';
    }
  };

  return (
    <div id="question-bank-root" className="space-y-6 text-left">
      
      {/* Toast Notification */}
      {notification && (
        <div className={`p-4 rounded-xl border flex items-center justify-between text-xs font-semibold shadow-sm transition-all animate-fadeIn ${
          notification.type === 'success'
            ? 'bg-emerald-50 text-emerald-900 border-emerald-200'
            : 'bg-rose-50 text-rose-900 border-rose-200'
        }`}>
          <div className="flex items-center gap-2.5">
            {notification.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            )}
            <span>{notification.message}</span>
          </div>
          <button 
            onClick={() => setNotification(null)}
            className="text-slate-400 hover:text-slate-700 ml-4 font-bold text-xs"
          >
            ✕
          </button>
        </div>
      )}

      {/* Header Banner & Action Buttons */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-emerald-600 text-xs font-mono font-bold uppercase tracking-wider mb-1">
            <Sparkles className="w-4 h-4" />
            <span>Supabase Live Question Repository</span>
          </div>
          <h3 className="text-xl font-bold text-slate-900 tracking-tight">
            Accreditation Question Bank
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Author, categorize, and manage verified multi-choice assessment questions connected directly to the live database.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
          {/* SQL Migration Script Toggle */}
          <button
            onClick={() => setShowSqlMigration(!showSqlMigration)}
            className="p-2 text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-xl transition cursor-pointer flex items-center gap-1.5 text-xs font-semibold"
            title="View PostgreSQL Enum Migration Script"
          >
            <Database className="w-3.5 h-3.5 text-indigo-600" />
            <span>SQL Enum Helper</span>
          </button>

          {/* Sync DB */}
          <button
            onClick={loadQuestions}
            disabled={loading}
            className="p-2 text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-xl transition cursor-pointer flex items-center gap-1.5 text-xs font-semibold"
            title="Reload questions from Supabase"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-emerald-600' : ''}`} />
            <span>Sync Live DB</span>
          </button>

          {/* Author Button */}
          <button
            onClick={() => setIsAdding(!isAdding)}
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-2 px-4 rounded-xl text-xs flex items-center gap-2 shadow-xs transition cursor-pointer"
          >
            {isAdding ? (
              <>
                <XCircle className="w-4 h-4" />
                <span>Close Builder</span>
              </>
            ) : (
              <>
                <Plus className="w-4 h-4" />
                <span>Author New Question</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* SQL Migration Helper Banner */}
      <AnimatePresence>
        {showSqlMigration && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.22 }}
            className="overflow-hidden"
          >
            <div className="bg-slate-900 text-slate-100 rounded-2xl p-5 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-indigo-400 font-mono text-xs font-bold">
                  <Code className="w-4 h-4" />
                  <span>PostgreSQL Enum Migration (ALTER TYPE experience_level_type)</span>
                </div>
                <button
                  onClick={copySqlToClipboard}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
                >
                  {copiedSql ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedSql ? 'Copied SQL!' : 'Copy SQL Script'}</span>
                </button>
              </div>
              <p className="text-xs text-slate-400">
                To allow PostgreSQL to natively store <code className="text-emerald-400 font-mono font-bold">'beginner'</code>, <code className="text-amber-400 font-mono font-bold">'intermediate'</code>, and <code className="text-purple-400 font-mono font-bold">'advanced'</code> in the <code className="text-slate-200 font-mono">experience_level_type</code> enum, run this in your Supabase SQL Editor:
              </p>
              <pre className="p-3 bg-black/50 rounded-xl text-[11px] font-mono text-emerald-300 overflow-x-auto border border-slate-800">
                {sqlMigrationCode}
              </pre>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* =========================================================================
          INTERACTIVE QUESTION BUILDER FORM (Live Supabase Insert with Difficulty)
         ========================================================================= */}
      <AnimatePresence>
        {isAdding && (
          <motion.div
            initial={{ opacity: 0, height: 0, scale: 0.98 }}
            animate={{ opacity: 1, height: 'auto', scale: 1 }}
            exit={{ opacity: 0, height: 0, scale: 0.98 }}
            transition={{ duration: 0.28, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <div className="bg-emerald-50/50 border-2 border-emerald-300 rounded-2xl p-6 sm:p-8 space-y-6 shadow-sm">
              <div className="flex items-center justify-between border-b border-emerald-200/60 pb-3">
                <div className="flex items-center gap-2">
                  <Plus className="w-4 h-4 text-emerald-700" />
                  <span className="text-xs font-bold uppercase tracking-wider text-emerald-950 font-mono">
                    Direct Supabase Live Insertion Form
                  </span>
                </div>
                <span className="text-[11px] text-slate-500">
                  Target Table: <code className="font-mono text-emerald-800 font-bold">quiz_questions</code>
                </span>
              </div>

              <form onSubmit={handleSaveQuestion} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                  {/* Skill Category Selector */}
                  <div className="md:col-span-4 space-y-1.5">
                    <label className="text-xs font-semibold text-slate-800 flex items-center gap-1">
                      <Tag className="w-3 h-3 text-slate-400" />
                      <span>Skill Category</span>
                    </label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900 bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 font-medium"
                    >
                      {categoryOptions.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>

                  {/* Difficulty Selector */}
                  <div className="md:col-span-3 space-y-1.5">
                    <label className="text-xs font-semibold text-slate-800 flex items-center gap-1">
                      <Gauge className="w-3 h-3 text-slate-400" />
                      <span>Difficulty Level <strong className="text-emerald-700 font-normal">(Required)</strong></span>
                    </label>
                    <select
                      value={difficulty}
                      onChange={(e) => setDifficulty(e.target.value)}
                      className="w-full border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900 bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 font-medium capitalize"
                    >
                      <option value="beginner">beginner</option>
                      <option value="intermediate">intermediate</option>
                      <option value="advanced">advanced</option>
                    </select>
                  </div>

                  {/* Question Prompt */}
                  <div className="md:col-span-5 space-y-1.5">
                    <label className="text-xs font-semibold text-slate-800">Question Prompt</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Which metric best indicates retention health in a subscription SaaS cohort model?"
                      value={questionPrompt}
                      onChange={(e) => setQuestionPrompt(e.target.value)}
                      className="w-full border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900 bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
                    />
                  </div>
                </div>

                {/* 4 Choices Grid */}
                <div className="space-y-3 pt-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-900 block">
                      Answer Choices (Select radio button for the correct answer key)
                    </label>
                    <span className="text-[11px] text-slate-500 font-mono">
                      Active Key: Option {correctOptionId.toUpperCase()}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {/* Option A */}
                    <div className={`p-3 rounded-xl border flex items-center gap-3 transition ${
                      correctOptionId === 'a' ? 'bg-emerald-100/90 border-emerald-400 shadow-2xs' : 'bg-white border-slate-200'
                    }`}>
                      <input
                        type="radio"
                        id="opt_a_radio"
                        name="correct_choice"
                        checked={correctOptionId === 'a'}
                        onChange={() => setCorrectOptionId('a')}
                        className="text-emerald-600 focus:ring-emerald-500 cursor-pointer w-4 h-4"
                      />
                      <span className="font-mono text-xs font-bold text-slate-800 uppercase">A.</span>
                      <input
                        type="text"
                        required
                        placeholder="Option A description..."
                        value={optA}
                        onChange={(e) => setOptA(e.target.value)}
                        className="flex-1 bg-transparent text-xs text-slate-900 focus:outline-none border-b border-dashed border-slate-300 focus:border-emerald-600 py-1"
                      />
                    </div>

                    {/* Option B */}
                    <div className={`p-3 rounded-xl border flex items-center gap-3 transition ${
                      correctOptionId === 'b' ? 'bg-emerald-100/90 border-emerald-400 shadow-2xs' : 'bg-white border-slate-200'
                    }`}>
                      <input
                        type="radio"
                        id="opt_b_radio"
                        name="correct_choice"
                        checked={correctOptionId === 'b'}
                        onChange={() => setCorrectOptionId('b')}
                        className="text-emerald-600 focus:ring-emerald-500 cursor-pointer w-4 h-4"
                      />
                      <span className="font-mono text-xs font-bold text-slate-800 uppercase">B.</span>
                      <input
                        type="text"
                        required
                        placeholder="Option B description..."
                        value={optB}
                        onChange={(e) => setOptB(e.target.value)}
                        className="flex-1 bg-transparent text-xs text-slate-900 focus:outline-none border-b border-dashed border-slate-300 focus:border-emerald-600 py-1"
                      />
                    </div>

                    {/* Option C */}
                    <div className={`p-3 rounded-xl border flex items-center gap-3 transition ${
                      correctOptionId === 'c' ? 'bg-emerald-100/90 border-emerald-400 shadow-2xs' : 'bg-white border-slate-200'
                    }`}>
                      <input
                        type="radio"
                        id="opt_c_radio"
                        name="correct_choice"
                        checked={correctOptionId === 'c'}
                        onChange={() => setCorrectOptionId('c')}
                        className="text-emerald-600 focus:ring-emerald-500 cursor-pointer w-4 h-4"
                      />
                      <span className="font-mono text-xs font-bold text-slate-800 uppercase">C.</span>
                      <input
                        type="text"
                        required
                        placeholder="Option C description..."
                        value={optC}
                        onChange={(e) => setOptC(e.target.value)}
                        className="flex-1 bg-transparent text-xs text-slate-900 focus:outline-none border-b border-dashed border-slate-300 focus:border-emerald-600 py-1"
                      />
                    </div>

                    {/* Option D */}
                    <div className={`p-3 rounded-xl border flex items-center gap-3 transition ${
                      correctOptionId === 'd' ? 'bg-emerald-100/90 border-emerald-400 shadow-2xs' : 'bg-white border-slate-200'
                    }`}>
                      <input
                        type="radio"
                        id="opt_d_radio"
                        name="correct_choice"
                        checked={correctOptionId === 'd'}
                        onChange={() => setCorrectOptionId('d')}
                        className="text-emerald-600 focus:ring-emerald-500 cursor-pointer w-4 h-4"
                      />
                      <span className="font-mono text-xs font-bold text-slate-800 uppercase">D.</span>
                      <input
                        type="text"
                        required
                        placeholder="Option D description..."
                        value={optD}
                        onChange={(e) => setOptD(e.target.value)}
                        className="flex-1 bg-transparent text-xs text-slate-900 focus:outline-none border-b border-dashed border-slate-300 focus:border-emerald-600 py-1"
                      />
                    </div>
                  </div>
                </div>

                {/* Form Action Controls */}
                <div className="flex items-center justify-end gap-3 pt-4 border-t border-emerald-200/60">
                  <button
                    type="button"
                    onClick={() => setIsAdding(false)}
                    className="px-4 py-2 border border-slate-300 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-100 transition cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-semibold py-2 px-5 rounded-xl text-xs flex items-center gap-2 shadow-xs transition cursor-pointer"
                  >
                    {saving ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        <span>Persisting to Supabase...</span>
                      </>
                    ) : (
                      <>
                        <Plus className="w-3.5 h-3.5" />
                        <span>Save to Supabase Question Bank</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* =========================================================================
          QUESTION BANK LIST & LIVE CATEGORY / DIFFICULTY FILTERING
         ========================================================================= */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
        {/* Filter Controls Bar */}
        <div className="p-4 sm:p-5 bg-slate-50/70 border-b border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 flex-1">
            {/* Category Filter Dropdown */}
            <div className="relative min-w-[190px]">
              <Filter className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full pl-8 pr-4 py-2 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 bg-white"
              >
                <option value="all">All Categories ({questions.length})</option>
                {categoryOptions.map(cat => {
                  const count = questions.filter(q => q.skill_category === cat).length;
                  return (
                    <option key={cat} value={cat}>
                      {cat} {count > 0 ? `(${count})` : ''}
                    </option>
                  );
                })}
              </select>
            </div>

            {/* Difficulty Filter Dropdown */}
            <div className="relative min-w-[150px]">
              <Gauge className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
              <select
                value={selectedDifficulty}
                onChange={(e) => setSelectedDifficulty(e.target.value)}
                className="w-full pl-8 pr-4 py-2 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 bg-white capitalize"
              >
                <option value="all">All Difficulties</option>
                <option value="beginner">Beginner ({questions.filter(q => (q.difficulty || 'intermediate').toLowerCase() === 'beginner').length})</option>
                <option value="intermediate">Intermediate ({questions.filter(q => (q.difficulty || 'intermediate').toLowerCase() === 'intermediate').length})</option>
                <option value="advanced">Advanced ({questions.filter(q => (q.difficulty || 'intermediate').toLowerCase() === 'advanced').length})</option>
              </select>
            </div>

            {/* Keyword Search */}
            <input
              type="text"
              placeholder="Search question prompt, category, difficulty, or choices..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1 px-3 py-2 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 bg-white"
            />
          </div>

          <div className="flex items-center gap-3 self-start md:self-auto text-xs text-slate-500">
            <button
              onClick={handleToggleAll}
              className="hover:text-slate-900 flex items-center gap-1 font-semibold transition"
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Toggle All</span>
            </button>
            <span>Showing <strong className="text-slate-800">{filteredQuestions.length}</strong> of {questions.length} questions</span>
          </div>
        </div>

        {/* Content Body */}
        {loading ? (
          <div className="py-16 text-center text-xs text-slate-400 space-y-2">
            <RefreshCw className="w-5 h-5 animate-spin mx-auto text-emerald-600" />
            <p>Querying live questions from Supabase <code className="font-mono">quiz_questions</code> table...</p>
          </div>
        ) : filteredQuestions.length === 0 ? (
          <div className="py-16 text-center text-slate-400 space-y-3">
            <FolderX className="w-10 h-10 mx-auto text-slate-300" />
            <div>
              <p className="text-xs font-bold text-slate-700">No Assessment Questions Found</p>
              <p className="text-[11px] text-slate-400 max-w-sm mx-auto mt-0.5">
                {selectedCategory !== 'all' || selectedDifficulty !== 'all'
                  ? `No questions found matching your filter criteria. Click "Author New Question" above to add one.` 
                  : 'Click "Author New Question" to add questions directly to your live Supabase database.'}
              </p>
            </div>
          </div>
        ) : (
          <motion.div layout className="divide-y divide-slate-100">
            <AnimatePresence>
              {filteredQuestions.map((q, idx) => {
                const isExpanded = Boolean(q.id !== undefined && expandedIds[q.id]);
                const isDeleting = q.id !== undefined && deletingId === q.id;
                const isToggling = q.id !== undefined && togglingId === q.id;
                const diffKey = q.difficulty || 'intermediate';

                return (
                  <motion.div
                    layout
                    key={q.id || idx}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                    className="hover:bg-slate-50/70 transition group"
                  >
                    {/* Header Row */}
                    <div 
                      onClick={() => q.id !== undefined && toggleAccordion(q.id)}
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

                        <div className="space-y-1.5 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            {/* Skill Category */}
                            <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 bg-slate-100 text-slate-700 border border-slate-200 rounded-md">
                              {q.skill_category}
                            </span>

                            {/* Difficulty Badge */}
                            <span className={`text-[10px] font-bold capitalize px-2 py-0.5 rounded-md border ${getDifficultyBadge(diffKey)}`}>
                              {diffKey}
                            </span>

                            {/* Active Status */}
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                              q.is_active !== false ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-slate-100 text-slate-500'
                            }`}>
                              {q.is_active !== false ? 'Active in Rotation' : 'Disabled'}
                            </span>

                            {/* Answer Key */}
                            <span className="text-[10px] font-mono text-slate-400">
                              Answer Key: Choice {q.correct_option_id?.toUpperCase()}
                            </span>
                          </div>
                          <h4 className="text-xs font-bold text-slate-900 group-hover:text-emerald-950 transition">
                            {idx + 1}. {q.question_text}
                          </h4>
                        </div>
                      </div>

                      {/* Action Controls */}
                      <div 
                        className="flex items-center gap-2 shrink-0"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {/* Toggle Active Button */}
                        <button
                          onClick={() => q.id !== undefined && handleToggleStatus(q.id, q.is_active)}
                          disabled={isToggling}
                          className={`text-[11px] font-semibold px-2.5 py-1 rounded-lg border transition cursor-pointer ${
                            q.is_active !== false 
                              ? 'border-slate-200 hover:bg-slate-100 text-slate-600' 
                              : 'border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                          }`}
                        >
                          {isToggling ? (
                            <RefreshCw className="w-3 h-3 animate-spin" />
                          ) : q.is_active !== false ? (
                            'Deactivate'
                          ) : (
                            'Activate'
                          )}
                        </button>

                        {/* Delete Button */}
                        <button
                          onClick={() => q.id !== undefined && handleDelete(q.id)}
                          disabled={isDeleting}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition cursor-pointer"
                          title="Delete question permanently from database"
                        >
                          {isDeleting ? (
                            <RefreshCw className="w-4 h-4 animate-spin text-rose-600" />
                          ) : (
                            <Trash2 className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Accordion Multiple-Choice Details */}
                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.22, ease: 'easeInOut' }}
                          className="overflow-hidden px-5 pb-5 pt-0"
                        >
                          <div className="pl-9 space-y-3 pt-1 border-t border-dashed border-slate-200/80">
                            <span className="text-[11px] font-semibold text-slate-500 block">
                              Verified Answer Key & Multiple Choices:
                            </span>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                              {q.options.map((opt) => {
                                const isCorrect = opt.id?.toLowerCase() === q.correct_option_id?.toLowerCase();
                                return (
                                  <div 
                                    key={opt.id} 
                                    className={`p-2.5 rounded-xl border flex items-center gap-2.5 transition ${
                                      isCorrect 
                                        ? 'bg-emerald-50/90 border-emerald-400 font-semibold text-emerald-950 shadow-2xs' 
                                        : 'bg-slate-50/60 border-slate-200 text-slate-700'
                                    }`}
                                  >
                                    <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold uppercase shrink-0 ${
                                      isCorrect ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-700'
                                    }`}>
                                      {opt.id}
                                    </span>
                                    <span className="flex-1 text-xs">{opt.text}</span>
                                    {isCorrect && (
                                      <span className="inline-flex items-center gap-1 text-[10px] uppercase font-bold text-emerald-700 bg-emerald-100/80 px-1.5 py-0.5 rounded shrink-0">
                                        <Check className="w-3 h-3" />
                                        Correct Choice
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
  );
};

export default QuestionBank;
