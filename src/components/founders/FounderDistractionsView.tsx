import React, { useState } from 'react';
import { CheckCircle2, Shield } from 'lucide-react';
import { FounderDistraction } from '../../types';

interface FounderDistractionsViewProps {
  distractions: FounderDistraction[];
  onToggleDistraction: (id: string) => void;
}

export const FounderDistractionsView: React.FC<FounderDistractionsViewProps> = ({
  distractions,
  onToggleDistraction
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const categories = ['all', ...Array.from(new Set(distractions.map(item => item.category)))];
  const filteredDistractions = distractions.filter(item =>
    selectedCategory === 'all' || item.category === selectedCategory
  );
  const activeCount = distractions.filter(item => item.is_active_today).length;

  return (
    <div className="space-y-6 sm:space-y-8 animate-fadeIn">
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
          Distraction Guard &amp; Focus Shield
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 mt-1">
          Select the distractions you want to guard against today.
        </p>
      </div>

      <div className="bg-gradient-to-br from-[#031A14] to-[#083024] rounded-3xl p-6 sm:p-7 text-white shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-5">
        <div className="space-y-2 max-w-xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold border border-emerald-500/30">
            <Shield className="w-3.5 h-3.5" />
            <span>Active Focus Guard</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black tracking-tight">
            Guarding Against {activeCount} Distraction{activeCount === 1 ? '' : 's'} Today
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            Your selections are saved to your founder account and shown on your overview.
          </p>
        </div>
        <div className="bg-white/10 rounded-2xl p-4 border border-white/10 text-center shrink-0 sm:w-44">
          <p className="text-3xl font-black text-emerald-400 leading-none">{activeCount}</p>
          <p className="text-xs font-bold text-slate-200 mt-1">Active Shields</p>
        </div>
      </div>

      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {categories.map(category => (
          <button
            key={category}
            onClick={() => setSelectedCategory(category)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer ${
              selectedCategory === category
                ? 'bg-[#059669] text-white shadow-2xs'
                : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200/80 hover:bg-slate-50'
            }`}
          >
            {category === 'all' ? 'All Categories' : category}
          </button>
        ))}
      </div>

      {filteredDistractions.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center text-sm text-slate-500">
          {distractions.length === 0
            ? 'The distraction catalogue is currently empty.'
            : 'No distractions match this category.'}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredDistractions.map(item => {
            const active = item.is_active_today;
            return (
              <div key={item.id} className={`rounded-3xl p-5 border transition flex flex-col justify-between shadow-2xs ${
                active ? 'bg-emerald-50/70 border-emerald-300 ring-2 ring-emerald-500/20' : 'bg-white border-slate-200/80 hover:border-slate-300'
              }`}>
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <span className="text-3xl select-none">{item.icon}</span>
                      <div>
                        <h3 className="font-bold text-sm text-slate-900 leading-snug">{item.name}</h3>
                        <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">{item.category}</span>
                      </div>
                    </div>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${active ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-600'}`}>
                      {active ? 'Guarding' : 'Inactive'}
                    </span>
                  </div>
                  {item.description && <p className="text-xs text-slate-600 leading-relaxed">{item.description}</p>}
                </div>
                <div className="pt-4 mt-4 border-t border-slate-200/60 flex items-center justify-between">
                  <span className="text-xs text-slate-500">{active ? 'Marked to avoid today' : 'Not currently shielded'}</span>
                  <button
                    onClick={() => onToggleDistraction(item.id)}
                    className={`text-xs font-bold py-1.5 px-3.5 rounded-xl transition cursor-pointer flex items-center gap-1.5 ${
                      active ? 'bg-white text-emerald-800 border border-emerald-200 hover:bg-emerald-100' : 'bg-[#059669] text-white hover:bg-[#047857]'
                    }`}
                  >
                    {active ? <><CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /><span>Avoid Today</span></> : <span>+ Avoid Today</span>}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
