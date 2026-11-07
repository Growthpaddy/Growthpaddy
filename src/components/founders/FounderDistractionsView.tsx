import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Plus, 
  CheckCircle2, 
  X, 
  AlertTriangle, 
  Smartphone, 
  Brain, 
  Clock, 
  Sparkles,
  Shield
} from 'lucide-react';
import { FounderDistraction } from '../../types';

interface FounderDistractionsViewProps {
  distractions: FounderDistraction[];
  onToggleDistraction: (id: string) => void;
  onAddCustomDistraction: (name: string, category: 'Digital' | 'Habits' | 'Social' | 'Mindset' | 'Productivity', icon: string) => void;
}

export const FounderDistractionsView: React.FC<FounderDistractionsViewProps> = ({
  distractions,
  onToggleDistraction,
  onAddCustomDistraction
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [customName, setCustomName] = useState('');
  const [customCategory, setCustomCategory] = useState<'Digital' | 'Habits' | 'Social' | 'Mindset' | 'Productivity'>('Digital');
  const [customIcon, setCustomIcon] = useState('🚫');

  const categories = ['all', 'Digital', 'Habits', 'Social', 'Mindset', 'Productivity'];

  const filteredDistractions = distractions.filter(d => {
    if (selectedCategory !== 'all' && d.category !== selectedCategory) {
      return false;
    }
    return true;
  });

  const activeCount = distractions.filter(d => d.is_active_today).length;

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customName.trim()) return;
    onAddCustomDistraction(customName.trim(), customCategory, customIcon.trim() || '🚫');
    setCustomName('');
    setIsAddModalOpen(false);
  };

  return (
    <div className="space-y-6 sm:space-y-8 animate-fadeIn">
      
      {/* HEADER & TOP ACTIONS */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Distraction Guard &amp; Focus Shield
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-1">
            Flag the specific cognitive leaks and digital interruptions you commit to eliminating today.
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="self-start sm:self-auto inline-flex items-center gap-2 bg-[#059669] hover:bg-[#047857] text-white font-bold text-xs sm:text-sm px-5 py-2.5 rounded-xl shadow-xs transition active:scale-[0.98] cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Add Custom Distraction</span>
        </button>
      </div>

      {/* SUMMARY STATS CARD */}
      <div className="bg-gradient-to-br from-[#031A14] to-[#083024] rounded-3xl p-6 sm:p-7 text-white shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-5 relative overflow-hidden">
        <div className="space-y-2 max-w-xl z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold border border-emerald-500/30">
            <Shield className="w-3.5 h-3.5" />
            <span>Active Focus Guard</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black tracking-tight">
            Guarding Against {activeCount} Distraction{activeCount === 1 ? '' : 's'} Today
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            Eliminating distractions yields 3x more output than working longer hours. Your selections are automatically synced to your overview dashboard.
          </p>
        </div>

        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/10 text-center shrink-0 z-10 sm:w-44">
          <p className="text-3xl font-black text-emerald-400 leading-none">
            {activeCount}
          </p>
          <p className="text-xs font-bold text-slate-200 mt-1">
            Active Shields
          </p>
        </div>
      </div>

      {/* CATEGORY FILTER TABS */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer ${
              selectedCategory === cat
                ? 'bg-[#059669] text-white shadow-2xs'
                : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200/80 hover:bg-slate-50'
            }`}
          >
            {cat === 'all' ? 'All Categories' : cat}
          </button>
        ))}
      </div>

      {/* DISTRACTIONS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredDistractions.map((dist) => {
          const isActive = dist.is_active_today;

          return (
            <div
              key={dist.id}
              className={`rounded-3xl p-5 border transition flex flex-col justify-between shadow-2xs ${
                isActive
                  ? 'bg-emerald-50/70 border-emerald-300 ring-2 ring-emerald-500/20'
                  : 'bg-white border-slate-200/80 hover:border-slate-300'
              }`}
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl select-none">{dist.icon}</span>
                    <div>
                      <h3 className="font-bold text-sm text-slate-900 leading-snug">
                        {dist.name}
                      </h3>
                      <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
                        {dist.category}
                      </span>
                    </div>
                  </div>

                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    isActive
                      ? 'bg-emerald-600 text-white'
                      : 'bg-slate-200 text-slate-600'
                  }`}>
                    {isActive ? 'Guarding' : 'Inactive'}
                  </span>
                </div>

                {dist.description && (
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {dist.description}
                  </p>
                )}
              </div>

              <div className="pt-4 mt-4 border-t border-slate-200/60 flex items-center justify-between">
                <span className="text-xs text-slate-500">
                  {isActive ? 'Marked to avoid today' : 'Not currently shielded'}
                </span>

                <button
                  onClick={() => onToggleDistraction(dist.id)}
                  className={`text-xs font-bold py-1.5 px-3.5 rounded-xl transition cursor-pointer flex items-center gap-1.5 ${
                    isActive
                      ? 'bg-white text-emerald-800 border border-emerald-200 hover:bg-emerald-100'
                      : 'bg-[#059669] text-white hover:bg-[#047857]'
                  }`}
                >
                  {isActive ? (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Avoid Today</span>
                    </>
                  ) : (
                    <span>+ Avoid Today</span>
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* ADD CUSTOM DISTRACTION MODAL */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-5 shadow-2xl relative">
            <button
              onClick={() => setIsAddModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-700"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="space-y-1">
              <h3 className="font-black text-lg text-slate-900">
                Add Custom Distraction
              </h3>
              <p className="text-xs text-slate-500">
                Identify a personal bad habit or cognitive distraction you want to guard against.
              </p>
            </div>

            <form onSubmit={handleAddSubmit} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-slate-700">Distraction Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Refreshing analytics every 10 minutes"
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                  className="w-full border border-slate-300 rounded-xl px-3.5 py-2.5 text-slate-800 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Category</label>
                  <select
                    value={customCategory}
                    onChange={(e) => setCustomCategory(e.target.value as any)}
                    className="w-full border border-slate-300 rounded-xl px-3 py-2 text-slate-800 focus:outline-none focus:border-emerald-500 bg-white"
                  >
                    <option value="Digital">Digital</option>
                    <option value="Habits">Habits</option>
                    <option value="Social">Social</option>
                    <option value="Mindset">Mindset</option>
                    <option value="Productivity">Productivity</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Emoji / Icon</label>
                  <input
                    type="text"
                    value={customIcon}
                    onChange={(e) => setCustomIcon(e.target.value)}
                    className="w-full border border-slate-300 rounded-xl px-3 py-2 text-slate-800 text-center font-bold text-base focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 text-slate-600 hover:text-slate-900 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-[#059669] hover:bg-emerald-700 text-white font-bold px-5 py-2.5 rounded-xl cursor-pointer"
                >
                  Add &amp; Activate
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
