import React, { useEffect, useState } from 'react';
import { 
  Calendar, 
  Target, 
  CheckCircle2, 
  Circle, 
  Plus, 
  Sparkles, 
  Trash2, 
  Clock, 
  AlertCircle, 
  TrendingUp, 
  Award,
  ArrowRight,
  Flame
} from 'lucide-react';
import { 
  FounderTask, 
  FounderDailyGoal, 
  FounderObjective, 
  FounderKeyResult 
} from '../../types';

interface FounderPlannerViewProps {
  dailyGoal: FounderDailyGoal | null;
  tasks: FounderTask[];
  objectives: FounderObjective[];
  keyResults: FounderKeyResult[];
  onToggleTask: (taskId: string) => void;
  onAddTask: (title: string, priority: 'low' | 'medium' | 'high' | 'urgent', estimatedMinutes: number) => void;
  onDeleteTask: (taskId: string) => void;
  onUpdateDailyGoal: (title: string, benchmarkPercent: number) => void;
  onOpenAIBreakdown: () => void;
}

export const FounderPlannerView: React.FC<FounderPlannerViewProps> = ({
  dailyGoal,
  tasks,
  objectives,
  keyResults,
  onToggleTask,
  onAddTask,
  onDeleteTask,
  onUpdateDailyGoal,
  onOpenAIBreakdown
}) => {
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskPriority, setNewTaskPriority] = useState<'low' | 'medium' | 'high' | 'urgent'>('medium');
  const [newTaskMinutes, setNewTaskMinutes] = useState(30);
  const [isEditingGoal, setIsEditingGoal] = useState(false);
  const [goalInput, setGoalInput] = useState(dailyGoal?.title || '');
  const [benchmarkInput, setBenchmarkInput] = useState(dailyGoal?.benchmark_percent ?? 80);

  useEffect(() => {
    setGoalInput(dailyGoal?.title || '');
    setBenchmarkInput(dailyGoal?.benchmark_percent ?? 80);
  }, [dailyGoal]);

  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(t => t.is_completed).length;
  const progressPercent = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
  const isBenchmarkMet = Boolean(dailyGoal) && progressPercent >= (dailyGoal?.benchmark_percent ?? 0);

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;
    onAddTask(newTaskTitle.trim(), newTaskPriority, newTaskMinutes);
    setNewTaskTitle('');
  };

  const handleSaveGoal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!goalInput.trim()) return;
    onUpdateDailyGoal(goalInput.trim(), benchmarkInput);
    setIsEditingGoal(false);
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-100 text-red-800 border border-red-200">Urgent</span>;
      case 'high':
        return <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-200">High</span>;
      case 'medium':
        return <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">Medium</span>;
      default:
        return <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">Low</span>;
    }
  };

  return (
    <div className="space-y-6 sm:space-y-8 animate-fadeIn">
      
      {/* HEADER & TOP ACTIONS */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Founder Focus Planner &amp; OKRs
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-1">
            Align daily high-leverage execution with quarterly objectives to maintain relentless startup momentum.
          </p>
        </div>

        <button
          onClick={onOpenAIBreakdown}
          className="self-start sm:self-auto inline-flex items-center gap-2 bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white font-bold text-xs sm:text-sm px-5 py-2.5 rounded-xl shadow-xs transition active:scale-[0.98] cursor-pointer"
        >
          <Sparkles className="w-4 h-4 text-emerald-200" />
          <span>Break Down Goal</span>
        </button>
      </div>

      {/* TODAY'S FOCUS & BENCHMARK HERO CARD */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-7 shadow-xs space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-5">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-emerald-700 text-xs font-bold uppercase tracking-wider">
              <Target className="w-4 h-4" />
              <span>Today's Daily Execution Anchor</span>
            </div>
            
            {isEditingGoal ? (
              <form onSubmit={handleSaveGoal} className="pt-2 flex flex-col sm:flex-row items-center gap-3">
                <input
                  type="text"
                  value={goalInput}
                  onChange={(e) => setGoalInput(e.target.value)}
                  className="w-full sm:w-96 text-sm font-semibold border border-slate-300 rounded-xl px-3 py-1.5 focus:border-emerald-500 focus:outline-none"
                  placeholder="Enter today's primary focus..."
                  autoFocus
                />
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-500">Benchmark:</span>
                  <input
                    type="number"
                    min="10"
                    max="100"
                    value={benchmarkInput}
                    onChange={(e) => setBenchmarkInput(Number(e.target.value))}
                    className="w-16 text-xs border border-slate-300 rounded-xl px-2 py-1 text-center font-bold"
                  />
                  <span className="text-xs text-slate-500">%</span>
                  <button
                    type="submit"
                    className="bg-[#059669] text-white text-xs font-bold px-3 py-1.5 rounded-xl cursor-pointer"
                  >
                    Save
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsEditingGoal(false)}
                    className="text-xs text-slate-500 hover:text-slate-800"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            ) : (
              <div className="flex items-center gap-3 group">
                <h2 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">
                  {dailyGoal?.title || 'No daily goal set for today.'}
                </h2>
                <button
                  onClick={() => {
                    setGoalInput(dailyGoal?.title || '');
                    setBenchmarkInput(dailyGoal?.benchmark_percent ?? 80);
                    setIsEditingGoal(true);
                  }}
                  className="text-xs text-emerald-700 hover:underline font-bold cursor-pointer opacity-80 group-hover:opacity-100"
                >
                  {dailyGoal ? 'Edit Goal' : 'Set Goal'}
                </button>
              </div>
            )}
          </div>

          <div className="flex items-center gap-4 text-right">
            <div>
              <p className="text-3xl font-black text-emerald-600 leading-none">
                {progressPercent}%
              </p>
              <p className="text-xs text-slate-500 mt-1">
                {completedTasks} of {totalTasks} tasks done
              </p>
            </div>
            {isBenchmarkMet ? (
              <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center" title="Daily Benchmark Achieved!">
                <Flame className="w-5 h-5 fill-emerald-500 text-emerald-500" />
              </div>
            ) : (
              <div className="w-10 h-10 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center" title={dailyGoal ? `Target: ${dailyGoal.benchmark_percent}%` : 'No benchmark set'}>
                <Target className="w-5 h-5" />
              </div>
            )}
          </div>
        </div>

        {/* Dynamic Progress Bar */}
        <div className="space-y-2">
          <div className="w-full h-3 rounded-full bg-slate-100 overflow-hidden relative">
            <div 
              className={`h-full rounded-full transition-all duration-500 ${
                isBenchmarkMet ? 'bg-gradient-to-r from-emerald-500 to-teal-500' : 'bg-[#059669]'
              }`}
              style={{ width: `${Math.min(progressPercent, 100)}%` }}
            />
          </div>
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>{dailyGoal ? `Minimum Target: ${dailyGoal.benchmark_percent}% completion` : 'Set a daily goal to define your benchmark.'}</span>
            {dailyGoal && <span className={isBenchmarkMet ? 'text-emerald-700 font-bold' : 'text-slate-500'}>
              {isBenchmarkMet ? '✓ Daily Benchmark Achieved' : `${Math.max(0, dailyGoal.benchmark_percent - progressPercent)}% to target`}
            </span>}
          </div>
        </div>
      </div>

      {/* TWO COLUMN GRID: TODAY'S TASKS (7 COLS) + QUARTERLY OKRS (5 COLS) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-7 items-start">
        
        {/* LEFT COLUMN: TODAY'S TASK CHECKLIST (7 COLS) */}
        <div className="lg:col-span-7 bg-white rounded-3xl border border-slate-200/80 p-5 sm:p-6 shadow-xs space-y-5">
          
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-emerald-600" />
              <h3 className="font-black text-base text-slate-900 tracking-tight">
                Today's Priority Tasks
              </h3>
            </div>
            <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full">
              {completedTasks}/{totalTasks} Completed
            </span>
          </div>

          {/* Quick Add Task Form */}
          <form onSubmit={handleCreateTask} className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3">
            <input
              type="text"
              placeholder="Add high-leverage task for today..."
              value={newTaskTitle}
              onChange={(e) => setNewTaskTitle(e.target.value)}
              className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-emerald-500"
            />
            <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
              <div className="flex items-center gap-2">
                <span className="text-[11px] text-slate-500 font-medium">Priority:</span>
                <select
                  value={newTaskPriority}
                  onChange={(e) => setNewTaskPriority(e.target.value as any)}
                  className="bg-white border border-slate-200 rounded-lg px-2 py-1 text-xs text-slate-700"
                >
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                  <option value="urgent">Urgent</option>
                </select>

                <span className="text-[11px] text-slate-500 font-medium ml-1">Time:</span>
                <input
                  type="number"
                  min="5"
                  step="5"
                  value={newTaskMinutes}
                  onChange={(e) => setNewTaskMinutes(Number(e.target.value))}
                  className="w-14 bg-white border border-slate-200 rounded-lg px-2 py-1 text-xs text-center"
                />
                <span className="text-[11px] text-slate-500">mins</span>
              </div>

              <button
                type="submit"
                className="bg-[#059669] hover:bg-emerald-700 text-white font-bold text-xs py-1.5 px-3.5 rounded-xl transition cursor-pointer flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Task</span>
              </button>
            </div>
          </form>

          {/* Tasks List */}
          <div className="space-y-2.5">
            {tasks.length > 0 ? (
              tasks.map((task) => (
                <div
                  key={task.id}
                  className={`p-3.5 rounded-2xl border transition flex items-start justify-between gap-3 group ${
                    task.is_completed
                      ? 'bg-slate-50/70 border-slate-200/60 text-slate-400'
                      : 'bg-white border-slate-200 hover:border-emerald-300 text-slate-900 shadow-2xs'
                  }`}
                >
                  <div className="flex items-start gap-3 min-w-0">
                    <button
                      onClick={() => onToggleTask(task.id)}
                      className="mt-0.5 text-slate-400 hover:text-emerald-600 transition cursor-pointer shrink-0"
                    >
                      {task.is_completed ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-600 fill-emerald-100" />
                      ) : (
                        <Circle className="w-5 h-5 text-slate-300 group-hover:text-emerald-500" />
                      )}
                    </button>

                    <div className="space-y-1 min-w-0">
                      <p className={`text-xs font-semibold leading-snug break-words ${
                        task.is_completed ? 'line-through text-slate-400' : 'text-slate-800'
                      }`}>
                        {task.title}
                      </p>

                      <div className="flex items-center gap-2 text-[11px] text-slate-400">
                        {getPriorityBadge(task.priority)}
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {task.estimated_minutes}m
                        </span>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => onDeleteTask(task.id)}
                    className="p-1 text-slate-300 hover:text-red-600 transition cursor-pointer shrink-0"
                    title="Delete task"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-slate-400 text-xs">
                No tasks added for today yet. Use the form above or break down a milestone into suggested tasks.
              </div>
            )}
          </div>

        </div>

        {/* RIGHT COLUMN: MONTHLY OBJECTIVES & KEY RESULTS (5 COLS) */}
        <div className="lg:col-span-5 bg-white rounded-3xl border border-slate-200/80 p-5 sm:p-6 shadow-xs space-y-5">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div className="flex items-center gap-2">
              <Award className="w-4 h-4 text-emerald-600" />
              <h3 className="font-black text-base text-slate-900 tracking-tight">
                Your Objectives
              </h3>
            </div>

          </div>

          <div className="space-y-4">
            {objectives.length === 0 ? (
              <p className="text-xs text-slate-500 text-center py-8">No objectives created yet.</p>
            ) : objectives.map((obj) => {
              const matchedKRs = keyResults.filter(kr => kr.objective_id === obj.id);

              return (
                <div 
                  key={obj.id} 
                  className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3"
                >
                  <div className="flex items-start justify-between gap-2">
                    <h4 className="font-bold text-xs sm:text-sm text-slate-900 leading-snug">
                      {obj.title}
                    </h4>
                    <span className="text-xs font-black text-emerald-700 shrink-0">
                      {obj.progress_percent}%
                    </span>
                  </div>

                  <div className="w-full h-2 rounded-full bg-slate-200 overflow-hidden">
                    <div 
                      className="h-full bg-emerald-600 rounded-full"
                      style={{ width: `${obj.progress_percent}%` }}
                    />
                  </div>

                  {matchedKRs.length > 0 && (
                    <div className="space-y-2 pt-2 border-t border-slate-200/60">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        Key Results
                      </p>
                      {matchedKRs.map((kr) => {
                        const krPercent = Math.min(100, Math.round((kr.current_value / kr.target_value) * 100));

                        return (
                          <div key={kr.id} className="space-y-1 text-xs">
                            <div className="flex items-center justify-between text-[11px]">
                              <span className="text-slate-600 font-medium truncate max-w-[180px]">
                                {kr.title}
                              </span>
                              <span className="font-bold text-slate-800">
                                {kr.current_value}/{kr.target_value} {kr.unit}
                              </span>
                            </div>
                            <div className="w-full h-1.5 rounded-full bg-slate-200 overflow-hidden">
                              <div 
                                className="h-full bg-teal-600 rounded-full"
                                style={{ width: `${krPercent}%` }}
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

      </div>

    </div>
  );
};
