import React, { useState } from 'react';
import { X, Sparkles, Check, ArrowRight, Loader2, Target } from 'lucide-react';
import { FounderTask } from '../../types';

interface FounderAIBreakdownModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyTasks: (newTasks: { title: string; priority: 'low' | 'medium' | 'high' | 'urgent'; estimatedMinutes: number }[]) => void;
}

export const FounderAIBreakdownModal: React.FC<FounderAIBreakdownModalProps> = ({
  isOpen,
  onClose,
  onApplyTasks
}) => {
  const [goalInput, setGoalInput] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedTasks, setGeneratedTasks] = useState<Array<{
    title: string;
    priority: 'low' | 'medium' | 'high' | 'urgent';
    estimatedMinutes: number;
    selected: boolean;
  }> | null>(null);

  if (!isOpen) return null;

  const handleGenerate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!goalInput.trim()) return;

    setIsGenerating(true);

    // Deterministic keyword-based suggestions; no external AI service is called.
    setTimeout(() => {
      const g = goalInput.toLowerCase();
      let suggestions: Array<{ title: string; priority: 'low' | 'medium' | 'high' | 'urgent'; estimatedMinutes: number; selected: boolean }> = [];

      if (g.includes('customer') || g.includes('sales') || g.includes('lead') || g.includes('pilot')) {
        suggestions = [
          { title: 'Draft tailored outreach message highlighting core ROI value proposition', priority: 'high', estimatedMinutes: 30, selected: true },
          { title: 'Identify and qualify 15 prospective decision-makers on LinkedIn', priority: 'high', estimatedMinutes: 45, selected: true },
          { title: 'Send personalized discovery emails with direct scheduling link', priority: 'medium', estimatedMinutes: 30, selected: true },
          { title: 'Follow up with 5 previous warm inquiries via WhatsApp Business', priority: 'urgent', estimatedMinutes: 20, selected: true }
        ];
      } else if (g.includes('content') || g.includes('newsletter') || g.includes('article') || g.includes('post')) {
        suggestions = [
          { title: 'Outline core contrarian insight and 3 practical case examples', priority: 'high', estimatedMinutes: 40, selected: true },
          { title: 'Draft 800-word founder reflection focusing on real startup obstacles', priority: 'high', estimatedMinutes: 60, selected: true },
          { title: 'Extract 3 short bite-sized takeaways for social distribution', priority: 'medium', estimatedMinutes: 20, selected: true },
          { title: 'Schedule newsletter dispatch to founder community subscribers', priority: 'medium', estimatedMinutes: 15, selected: true }
        ];
      } else if (g.includes('product') || g.includes('mvp') || g.includes('feature') || g.includes('launch')) {
        suggestions = [
          { title: 'Define minimum acceptance criteria for MVP release scope', priority: 'urgent', estimatedMinutes: 35, selected: true },
          { title: 'Run end-to-end user testing flow on staging environment', priority: 'high', estimatedMinutes: 45, selected: true },
          { title: 'Document onboarding checklist for first 10 beta test users', priority: 'medium', estimatedMinutes: 30, selected: true },
          { title: 'Record 2-minute walkthrough demo video for early adopters', priority: 'medium', estimatedMinutes: 25, selected: true }
        ];
      } else {
        suggestions = [
          { title: `Clarify single most critical milestone outcome for: "${goalInput.slice(0, 40)}"`, priority: 'high', estimatedMinutes: 25, selected: true },
          { title: 'Identify primary bottleneck or missing asset preventing progress', priority: 'high', estimatedMinutes: 35, selected: true },
          { title: 'Execute uninterrupted 45-minute deep focus work sprint on core deliverable', priority: 'urgent', estimatedMinutes: 45, selected: true },
          { title: 'Review output and set next tangible milestone checkpoint', priority: 'medium', estimatedMinutes: 20, selected: true }
        ];
      }

      setGeneratedTasks(suggestions);
      setIsGenerating(false);
    }, 600);
  };

  const toggleTaskSelection = (index: number) => {
    if (!generatedTasks) return;
    const updated = [...generatedTasks];
    updated[index].selected = !updated[index].selected;
    setGeneratedTasks(updated);
  };

  const handleApply = () => {
    if (!generatedTasks) return;
    const toAdd = generatedTasks.filter(t => t.selected).map(t => ({
      title: t.title,
      priority: t.priority,
      estimatedMinutes: t.estimatedMinutes
    }));
    onApplyTasks(toAdd);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-3 sm:p-5 backdrop-blur-xs animate-fadeIn">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-6 shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-slate-700 w-8 h-8 rounded-full hover:bg-slate-100 flex items-center justify-center transition"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="border-b border-slate-100 pb-3 space-y-1">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 text-[10px] font-bold border border-emerald-200">
            <Sparkles className="w-3 h-3 text-emerald-600" />
            <span>Task Breakdown Suggestions</span>
          </div>
          <h3 className="text-xl font-black text-slate-900">
            Break Down Milestone into Tasks
          </h3>
          <p className="text-xs text-slate-500">
            Enter an objective or milestone to receive rule-based task suggestions. Review and select suggestions before they are saved to today's planner.
          </p>
        </div>

        {!generatedTasks ? (
          <form onSubmit={handleGenerate} className="space-y-4 text-xs">
            <div className="space-y-1">
              <label className="font-bold text-slate-700">Milestone or High-Level Goal</label>
              <textarea
                rows={3}
                required
                value={goalInput}
                onChange={(e) => setGoalInput(e.target.value)}
                placeholder="e.g. Complete customer discovery for a new product..."
                className="w-full border border-slate-300 rounded-xl p-3 text-slate-800 focus:outline-none focus:border-emerald-500 bg-slate-50/50 focus:bg-white leading-relaxed text-xs"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-slate-600 hover:text-slate-900 font-semibold"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isGenerating}
                className="bg-[#059669] hover:bg-emerald-700 text-white font-bold px-5 py-2.5 rounded-xl shadow-xs transition flex items-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Preparing Suggestions...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Generate Task Suggestions</span>
                  </>
                )}
              </button>
            </div>
          </form>
        ) : (
          <div className="space-y-4">
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700">
              <span className="font-bold text-slate-900">Goal:</span> "{goalInput}"
            </div>

            <div className="space-y-2 max-h-60 overflow-y-auto">
              {generatedTasks.map((task, idx) => (
                <div
                  key={idx}
                  onClick={() => toggleTaskSelection(idx)}
                  className={`p-3 rounded-xl border text-xs flex items-center justify-between gap-3 cursor-pointer transition select-none ${
                    task.selected
                      ? 'bg-emerald-50/80 border-emerald-300 text-slate-900'
                      : 'bg-white border-slate-200 text-slate-400'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className={`w-4 h-4 rounded-md flex items-center justify-center shrink-0 ${
                      task.selected ? 'bg-emerald-600 text-white' : 'border border-slate-300'
                    }`}>
                      {task.selected && <Check className="w-3 h-3" />}
                    </div>
                    <span className="truncate font-semibold">{task.title}</span>
                  </div>

                  <span className="text-[10px] font-bold text-slate-400 shrink-0">
                    {task.estimatedMinutes}m · {task.priority}
                  </span>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setGeneratedTasks(null)}
                className="text-xs text-slate-500 hover:text-slate-800 underline font-semibold"
              >
                ← Back to edit goal
              </button>

              <button
                onClick={handleApply}
                className="bg-[#059669] hover:bg-emerald-700 text-white font-bold text-xs px-5 py-2.5 rounded-xl shadow-xs transition flex items-center gap-2 cursor-pointer"
              >
                <span>Add {generatedTasks.filter(t => t.selected).length} Tasks to Planner</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
