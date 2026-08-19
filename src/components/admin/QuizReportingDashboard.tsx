import React, { useState, useEffect, useMemo } from 'react';
import { 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid,
  AreaChart,
  Area
} from 'recharts';
import { 
  BarChart3, 
  PieChart as PieChartIcon, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  RefreshCw, 
  Award, 
  Target, 
  HelpCircle,
  FolderX,
  Layers,
  Check
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { getQuizSettings, getQuizQuestions, QuizSettings, QuizQuestion } from '../../lib/quizAdmin';

interface QuizReportingProps {
  onNavigateToQuestions?: () => void;
}

export const QuizReportingDashboard: React.FC<QuizReportingProps> = ({ onNavigateToQuestions }) => {
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d' | 'all'>('all');
  const [loading, setLoading] = useState<boolean>(true);
  const [talentsData, setTalentsData] = useState<any[]>([]);
  const [questionsData, setQuestionsData] = useState<QuizQuestion[]>([]);
  const [settings, setSettings] = useState<QuizSettings | null>(null);

  // Fetch real data from Supabase
  const fetchReportingData = async () => {
    setLoading(true);
    try {
      // 1. Fetch real talent records
      const { data: talents, error: talentsErr } = await supabase
        .from('talent_profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (!talentsErr && talents) {
        setTalentsData(talents);
      } else {
        setTalentsData([]);
      }

      // 2. Fetch real question repository
      const questions = await getQuizQuestions();
      setQuestionsData(questions || []);

      // 3. Fetch real quiz settings
      const currentSettings = await getQuizSettings();
      setSettings(currentSettings);
    } catch (err) {
      console.error('Error fetching real quiz reporting records:', err);
      setTalentsData([]);
      setQuestionsData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReportingData();
  }, []);

  // Filter talents based on selected time window
  const filteredTalents = useMemo(() => {
    if (timeRange === 'all') return talentsData;

    const now = Date.now();
    const days = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : 90;
    const cutoff = now - (days * 24 * 60 * 60 * 1000);

    return talentsData.filter(t => {
      if (!t.created_at) return true;
      const createdTime = new Date(t.created_at).getTime();
      return createdTime >= cutoff;
    });
  }, [talentsData, timeRange]);

  // Compute Core Metrics strictly from real data
  const metrics = useMemo(() => {
    const passingThreshold = settings?.passing_grade ?? 80;
    const totalCandidates = filteredTalents.length;
    
    const passedCount = filteredTalents.filter(t => 
      t.phase_1_status === 'passed' || 
      t.phase_2_unlocked === true || 
      (typeof t.quiz_score === 'number' && t.quiz_score >= passingThreshold)
    ).length;

    const cooldownCount = filteredTalents.filter(t => 
      t.phase_1_status === 'cooldown' || 
      (typeof t.quiz_score === 'number' && t.quiz_score < passingThreshold && t.phase_1_status !== 'passed')
    ).length;

    const pendingCount = filteredTalents.filter(t => 
      (t.phase_1_status === 'pending' || !t.phase_1_status) && 
      !t.phase_2_unlocked && 
      (t.quiz_score === null || t.quiz_score === undefined)
    ).length;

    const evaluatedCount = passedCount + cooldownCount;
    const passRate = evaluatedCount > 0 ? Math.round((passedCount / evaluatedCount) * 100) : 0;

    // Average Score from real candidate submissions
    const scoredTalents = filteredTalents.filter(t => typeof t.quiz_score === 'number');
    const avgScore = scoredTalents.length > 0
      ? Math.round(scoredTalents.reduce((acc, curr) => acc + (curr.quiz_score || 0), 0) / scoredTalents.length)
      : null;

    return {
      totalCandidates,
      passedCount,
      cooldownCount,
      pendingCount,
      evaluatedCount,
      passRate,
      avgScore,
      scoredCount: scoredTalents.length,
      passingThreshold
    };
  }, [filteredTalents, settings]);

  // Chart 1: Pass vs Fail Distribution from real DB data
  const passFailData = useMemo(() => {
    const data = [
      { name: 'Passed (Phase 2 Unlocked)', value: metrics.passedCount, color: '#10b981' },
      { name: 'In Cooldown', value: metrics.cooldownCount, color: '#f43f5e' },
      { name: 'Pending Assessment', value: metrics.pendingCount, color: '#f59e0b' }
    ];
    return data.filter(d => d.value > 0);
  }, [metrics]);

  // Chart 2: Score Distribution Histogram from real scored candidates
  const scoreDistributionData = useMemo(() => {
    const scoredTalents = filteredTalents.filter(t => typeof t.quiz_score === 'number');
    
    const buckets = [
      { range: '< 50%', count: 0, label: 'Critical Gap', isPass: false },
      { range: '50-69%', count: 0, label: 'Below Passing', isPass: false },
      { range: '70-79%', count: 0, label: 'Near Threshold', isPass: false },
      { range: '80-89%', count: 0, label: 'Qualified', isPass: true },
      { range: '90-100%', count: 0, label: 'Mastery', isPass: true },
    ];

    scoredTalents.forEach(t => {
      const s = t.quiz_score;
      if (s < 50) buckets[0].count++;
      else if (s < 70) buckets[1].count++;
      else if (s < 80) buckets[2].count++;
      else if (s < 90) buckets[3].count++;
      else buckets[4].count++;
    });

    return buckets;
  }, [filteredTalents]);

  // Chart 3: Real Category Breakdown from Questions and Talents
  const categoryBreakdownData = useMemo(() => {
    const categoryMap: Record<string, { totalQuestions: number; activeQuestions: number; talentCount: number }> = {};

    // Group real questions from DB
    questionsData.forEach(q => {
      const cat = q.skill_category || 'General Strategy';
      if (!categoryMap[cat]) {
        categoryMap[cat] = { totalQuestions: 0, activeQuestions: 0, talentCount: 0 };
      }
      categoryMap[cat].totalQuestions++;
      if (q.is_active) categoryMap[cat].activeQuestions++;
    });

    // Count real candidate disciplines
    filteredTalents.forEach(t => {
      const cat = t.specialization || t.role || 'General Strategy';
      if (!categoryMap[cat]) {
        categoryMap[cat] = { totalQuestions: 0, activeQuestions: 0, talentCount: 0 };
      }
      categoryMap[cat].talentCount++;
    });

    const entries = Object.keys(categoryMap).map(cat => ({
      category: cat,
      totalQuestions: categoryMap[cat].totalQuestions,
      activeQuestions: categoryMap[cat].activeQuestions,
      talentCount: categoryMap[cat].talentCount,
    }));

    return entries.sort((a, b) => b.totalQuestions - a.totalQuestions);
  }, [questionsData, filteredTalents]);

  // Chart 4: Historical Registration & Pass Rate (Real date aggregation)
  const historicalTrendData = useMemo(() => {
    const dateMap: Record<string, { date: string; passed: number; cooldown: number; total: number }> = {};

    filteredTalents.forEach(t => {
      if (!t.created_at) return;
      const dateStr = new Date(t.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
      if (!dateMap[dateStr]) {
        dateMap[dateStr] = { date: dateStr, passed: 0, cooldown: 0, total: 0 };
      }
      dateMap[dateStr].total++;
      if (t.phase_1_status === 'passed' || t.phase_2_unlocked) {
        dateMap[dateStr].passed++;
      } else if (t.phase_1_status === 'cooldown') {
        dateMap[dateStr].cooldown++;
      }
    });

    const list = Object.values(dateMap);
    return list.map(item => ({
      date: item.date,
      passed: item.passed,
      cooldown: item.cooldown,
      total: item.total,
      passRate: item.passed + item.cooldown > 0 
        ? Math.round((item.passed / (item.passed + item.cooldown)) * 100) 
        : 0
    }));
  }, [filteredTalents]);

  const hasAnyData = talentsData.length > 0 || questionsData.length > 0;

  return (
    <div id="quiz-reporting-dashboard" className="space-y-6 text-left">
      
      {/* =========================================================================
          1. HEADER & TIME FILTER TOOLBAR
         ========================================================================= */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-emerald-600 text-xs font-mono font-bold uppercase tracking-wider mb-1">
            <BarChart3 className="w-4 h-4" />
            <span>Accreditation Performance Analytics</span>
          </div>
          <h3 className="text-xl font-bold text-slate-900 tracking-tight">
            Quiz Reporting & Diagnostics
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time telemetry on candidate assessment performance and question repository metrics calculated directly from the database.
          </p>
        </div>

        {/* Time Window Selectors */}
        <div className="flex items-center gap-2 self-start md:self-auto">
          <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200/80">
            {(['7d', '30d', '90d', 'all'] as const).map((range) => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                  timeRange === range
                    ? 'bg-white text-slate-900 shadow-2xs font-bold'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                {range === '7d' ? '7 Days' : range === '30d' ? '30 Days' : range === '90d' ? '90 Days' : 'All Time'}
              </button>
            ))}
          </div>

          <button
            onClick={fetchReportingData}
            disabled={loading}
            className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl border border-slate-200 transition cursor-pointer"
            title="Refresh analytics data"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-emerald-600' : ''}`} />
          </button>
        </div>
      </div>

      {/* =========================================================================
          2. TOP KPI CARDS (Real Calculated Values)
         ========================================================================= */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Card 1: Overall Pass Rate */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
              Overall Pass Rate
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-slate-900">
                {metrics.evaluatedCount > 0 ? `${metrics.passRate}%` : '0%'}
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              {metrics.evaluatedCount > 0 
                ? `${metrics.passedCount} of ${metrics.evaluatedCount} evaluated passed`
                : 'No evaluated attempts yet'}
            </p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 shrink-0">
            <CheckCircle2 className="w-6 h-6" />
          </div>
        </div>

        {/* Card 2: Average Score */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
              Average Score
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-slate-900">
                {metrics.avgScore !== null ? `${metrics.avgScore}%` : '—'}
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              {metrics.scoredCount > 0
                ? `Calculated from ${metrics.scoredCount} candidate score${metrics.scoredCount === 1 ? '' : 's'}`
                : 'Awaiting candidate quiz submissions'}
            </p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-teal-50 border border-teal-100 flex items-center justify-center text-teal-600 shrink-0">
            <Award className="w-6 h-6" />
          </div>
        </div>

        {/* Card 3: In Active Cooldown */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
              Active Cooldowns
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-rose-600">
                {metrics.cooldownCount}
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              {metrics.cooldownCount > 0 
                ? 'Candidate cooldown timer in progress' 
                : 'No candidates currently cooling down'}
            </p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-600 shrink-0">
            <Clock className="w-6 h-6" />
          </div>
        </div>

        {/* Card 4: Question Repository Count */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
              Question Bank Size
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-slate-900">
                {questionsData.length}
              </span>
              <span className="text-[11px] font-bold text-emerald-600">
                {questionsData.filter(q => q.is_active).length} Active
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              Across {categoryBreakdownData.length} skill categories
            </p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shrink-0">
            <Target className="w-6 h-6" />
          </div>
        </div>

      </div>

      {/* =========================================================================
          3. VISUAL ANALYTICS: CHARTS ROW 1 (Pass/Fail Donut + Score Histogram)
         ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Chart A: Pass / Fail / Cooldown Distribution (Donut) */}
        <div className="lg:col-span-5 bg-white border border-slate-200 rounded-2xl p-6 shadow-xs flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <PieChartIcon className="w-4 h-4 text-emerald-600" />
                Accreditation Outcomes
              </h4>
              <p className="text-xs text-slate-500">Live breakdown of talent profile statuses</p>
            </div>
            <span className="text-xs font-mono font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
              {metrics.totalCandidates} Total
            </span>
          </div>

          {passFailData.length === 0 ? (
            <div className="h-64 w-full flex flex-col items-center justify-center text-center p-6 space-y-2">
              <FolderX className="w-8 h-8 text-slate-300" />
              <p className="text-xs font-semibold text-slate-600">No Candidate Records in Selected Window</p>
              <p className="text-[11px] text-slate-400 max-w-xs">
                As candidates register and take the assessment, outcome distribution will display here.
              </p>
            </div>
          ) : (
            <>
              <div className="h-64 w-full flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={passFailData}
                      cx="50%"
                      cy="50%"
                      innerRadius={55}
                      outerRadius={85}
                      paddingAngle={4}
                      dataKey="value"
                    >
                      {passFailData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                      ))}
                    </Pie>
                    <Tooltip 
                      formatter={(value: any) => [`${value} Candidates`, 'Total']}
                      contentStyle={{ backgroundColor: '#0f172a', borderRadius: '12px', color: '#fff', border: 'none', fontSize: '12px' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              {/* Legend Items */}
              <div className="space-y-2 pt-2 border-t border-slate-100">
                {passFailData.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                      <span className="text-slate-700 font-medium">{item.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900">{item.value}</span>
                      <span className="text-slate-400 text-[11px]">
                        ({metrics.totalCandidates > 0 ? Math.round((item.value / metrics.totalCandidates) * 100) : 0}%)
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Chart B: Score Distribution Histogram */}
        <div className="lg:col-span-7 bg-white border border-slate-200 rounded-2xl p-6 shadow-xs flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-emerald-600" />
                Score Distribution Histogram
              </h4>
              <p className="text-xs text-slate-500">Distribution of candidate test scores vs passing threshold ({metrics.passingThreshold}%)</p>
            </div>
            <span className="text-[11px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
              {metrics.scoredCount} Recorded Scores
            </span>
          </div>

          {metrics.scoredCount === 0 ? (
            <div className="h-64 w-full flex flex-col items-center justify-center text-center p-6 space-y-2">
              <FolderX className="w-8 h-8 text-slate-300" />
              <p className="text-xs font-semibold text-slate-600">No Assessment Scores Recorded</p>
              <p className="text-[11px] text-slate-400 max-w-xs">
                Score brackets will populate once candidates complete quiz submissions.
              </p>
            </div>
          ) : (
            <>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={scoreDistributionData} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis 
                      dataKey="range" 
                      tick={{ fontSize: 11, fill: '#64748b' }}
                      axisLine={{ stroke: '#e2e8f0' }}
                      tickLine={false}
                    />
                    <YAxis 
                      tick={{ fontSize: 11, fill: '#64748b' }}
                      axisLine={{ stroke: '#e2e8f0' }}
                      tickLine={false}
                      allowDecimals={false}
                    />
                    <Tooltip
                      cursor={{ fill: '#f8fafc' }}
                      content={({ active, payload, label }) => {
                        if (active && payload && payload.length) {
                          const data = payload[0].payload;
                          return (
                            <div className="bg-slate-900 text-white p-3 rounded-xl shadow-lg text-xs space-y-1 border border-slate-800">
                              <p className="font-bold text-emerald-400">{label} Bracket</p>
                              <p className="text-slate-300">Candidates: <span className="font-bold text-white">{data.count}</span></p>
                              <p className="text-slate-400 text-[10px] uppercase font-mono">{data.label}</p>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                      {scoreDistributionData.map((entry, index) => {
                        return <Cell key={`bar-${index}`} fill={entry.isPass ? '#10b981' : '#f43f5e'} />;
                      })}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-sm bg-rose-500" />
                  <span>Below {metrics.passingThreshold}% (Cooldown)</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-sm bg-emerald-500" />
                  <span>{metrics.passingThreshold}%+ (Qualified)</span>
                </div>
              </div>
            </>
          )}
        </div>

      </div>

      {/* =========================================================================
          4. VISUAL ANALYTICS: CHARTS ROW 2 (Real Category Breakdown + Timeline)
         ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Chart C: Skill Category & Question Inventory */}
        <div className="lg:col-span-7 bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Target className="w-4 h-4 text-emerald-600" />
                Question Bank Inventory by Category
              </h4>
              <p className="text-xs text-slate-500">Live question coverage across technical marketing disciplines</p>
            </div>
            <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
              {questionsData.length} Total Questions
            </span>
          </div>

          {categoryBreakdownData.length === 0 ? (
            <div className="h-64 w-full flex flex-col items-center justify-center text-center p-6 space-y-2">
              <FolderX className="w-8 h-8 text-slate-300" />
              <p className="text-xs font-semibold text-slate-600">No Assessment Questions Authored</p>
              <p className="text-[11px] text-slate-400 max-w-xs">
                Create multiple-choice questions in the Question Bank tab to see category distribution.
              </p>
            </div>
          ) : (
            <>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart 
                    data={categoryBreakdownData} 
                    layout="vertical"
                    margin={{ top: 5, right: 20, left: 40, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                    <XAxis 
                      type="number" 
                      tick={{ fontSize: 11, fill: '#64748b' }}
                      axisLine={{ stroke: '#e2e8f0' }}
                      tickLine={false}
                      allowDecimals={false}
                    />
                    <YAxis 
                      type="category" 
                      dataKey="category" 
                      tick={{ fontSize: 10, fill: '#334155', fontWeight: 600 }}
                      axisLine={{ stroke: '#e2e8f0' }}
                      tickLine={false}
                      width={110}
                    />
                    <Tooltip
                      formatter={(value: any, name: any) => [
                        `${value} Questions`, 
                        name === 'activeQuestions' ? 'Active Questions' : 'Total Questions'
                      ]}
                      contentStyle={{ backgroundColor: '#0f172a', borderRadius: '12px', color: '#fff', border: 'none', fontSize: '12px' }}
                    />
                    <Bar dataKey="totalQuestions" name="Total Questions" radius={[0, 6, 6, 0]} fill="#10b981" />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100">
                <span>Disciplines Represented: {categoryBreakdownData.length}</span>
                <span>Active Questions: {questionsData.filter(q => q.is_active).length}</span>
              </div>
            </>
          )}
        </div>

        {/* Chart D: Real Registration & Candidate Volume Timeline */}
        <div className="lg:col-span-5 bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-emerald-600" />
                Candidate Registration Timeline
              </h4>
              <p className="text-xs text-slate-500">Chronological candidate intake & evaluation</p>
            </div>
            <span className="text-xs font-mono font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded">
              {filteredTalents.length} Recs
            </span>
          </div>

          {historicalTrendData.length === 0 ? (
            <div className="h-64 w-full flex flex-col items-center justify-center text-center p-6 space-y-2">
              <FolderX className="w-8 h-8 text-slate-300" />
              <p className="text-xs font-semibold text-slate-600">No Candidate Records in Timeline</p>
              <p className="text-[11px] text-slate-400 max-w-xs">
                Candidate registrations will plot chronologically as users sign up.
              </p>
            </div>
          ) : (
            <>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={historicalTrendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="talentGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis 
                      dataKey="date" 
                      tick={{ fontSize: 10, fill: '#64748b' }}
                      axisLine={{ stroke: '#e2e8f0' }}
                      tickLine={false}
                    />
                    <YAxis 
                      tick={{ fontSize: 10, fill: '#64748b' }}
                      axisLine={{ stroke: '#e2e8f0' }}
                      tickLine={false}
                      allowDecimals={false}
                    />
                    <Tooltip
                      formatter={(value: any, name: any) => [`${value}`, name === 'total' ? 'Total Candidates' : 'Passed']}
                      contentStyle={{ backgroundColor: '#0f172a', borderRadius: '12px', color: '#fff', border: 'none', fontSize: '12px' }}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="total" 
                      name="total"
                      stroke="#10b981" 
                      strokeWidth={2.5}
                      fillOpacity={1} 
                      fill="url(#talentGrad)" 
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-100">
                <span className="text-slate-500">Qualified Candidates:</span>
                <span className="font-bold text-emerald-600">{metrics.passedCount}</span>
              </div>
            </>
          )}
        </div>

      </div>

      {/* =========================================================================
          5. LIVE QUESTION REPOSITORY AUDIT (Real quiz_questions from DB)
         ========================================================================= */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
        <div className="p-5 bg-slate-50/70 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <HelpCircle className="w-4 h-4 text-emerald-600" />
              Live Question Bank Inventory ({questionsData.length})
            </h4>
            <p className="text-xs text-slate-500">
              Active assessment questions queried directly from the `quiz_questions` database table.
            </p>
          </div>

          {onNavigateToQuestions && (
            <button
              onClick={onNavigateToQuestions}
              className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 bg-emerald-50 hover:bg-emerald-100 px-3 py-1.5 rounded-lg border border-emerald-200 flex items-center gap-1.5 transition self-start sm:self-auto cursor-pointer"
            >
              <HelpCircle className="w-3.5 h-3.5" />
              <span>Manage in Question Bank</span>
            </button>
          )}
        </div>

        {questionsData.length === 0 ? (
          <div className="p-12 text-center space-y-2">
            <FolderX className="w-8 h-8 text-slate-300 mx-auto" />
            <p className="text-xs font-semibold text-slate-700">No Questions Found in Database</p>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Use the Question Bank tab to author assessment questions.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {questionsData.slice(0, 6).map((item, idx) => (
              <div key={item.id || idx} className="p-4 hover:bg-slate-50/60 transition space-y-2">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                  <div className="space-y-1 max-w-2xl">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 bg-slate-100 text-slate-700 border border-slate-200 rounded-md">
                        {item.skill_category}
                      </span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        item.is_active ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-slate-100 text-slate-500'
                      }`}>
                        {item.is_active ? 'Active in Rotation' : 'Disabled'}
                      </span>
                      <span className="text-[10px] font-mono text-slate-400">
                        Answer Key: Choice {item.correct_option_id}
                      </span>
                    </div>
                    <h5 className="text-xs font-bold text-slate-900">
                      {idx + 1}. {item.question_text}
                    </h5>
                  </div>
                </div>

                {/* Options display */}
                {Array.isArray(item.options) && item.options.length > 0 && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs pt-1">
                    {item.options.map((opt) => {
                      const isCorrect = opt.id === item.correct_option_id;
                      return (
                        <div 
                          key={opt.id} 
                          className={`p-2 rounded-lg border text-xs flex items-center gap-2 ${
                            isCorrect 
                              ? 'bg-emerald-50/90 border-emerald-300 text-emerald-950 font-medium' 
                              : 'bg-slate-50/50 border-slate-200 text-slate-600'
                          }`}
                        >
                          <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-bold shrink-0 ${
                            isCorrect ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-700'
                          }`}>
                            {opt.id}
                          </span>
                          <span className="truncate">{opt.text}</span>
                          {isCorrect && (
                            <Check className="w-3 h-3 text-emerald-600 ml-auto shrink-0" />
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
};

export default QuizReportingDashboard;
