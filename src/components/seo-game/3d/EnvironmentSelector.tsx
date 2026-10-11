import React from 'react';
import { Globe, MapPin, Check } from 'lucide-react';
import { CityEnvironment } from '../../../hooks/useEnvironmentalAudio';

interface EnvironmentSelectorProps {
  currentCity: CityEnvironment;
  onSelectCity: (city: CityEnvironment) => void;
  playSfx?: (type: 'click' | 'confirm') => void;
}

export function EnvironmentSelector({
  currentCity,
  onSelectCity,
  playSfx
}: EnvironmentSelectorProps) {
  const handleSelect = (city: CityEnvironment) => {
    if (city === currentCity) return;
    playSfx?.('confirm');
    onSelectCity(city);
    try {
      localStorage.setItem('seo_game_selected_environment', city);
    } catch (_) {}
  };

  return (
    <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-slate-900/90 border border-slate-700/80 backdrop-blur-md shadow-lg">
      <div className="px-2.5 py-1 text-slate-400 font-mono text-[10px] uppercase font-bold hidden sm:flex items-center gap-1.5 border-r border-slate-800">
        <Globe className="w-3.5 h-3.5 text-[#18B892]" />
        <span>Location</span>
      </div>

      <button
        onClick={() => handleSelect('lagos')}
        className={`px-3 py-1.5 rounded-xl transition cursor-pointer flex items-center gap-1.5 text-xs font-semibold ${
          currentCity === 'lagos'
            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 shadow-xs'
            : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
        }`}
        title="African Business Environment — Lagos (Victoria Island & Marina)"
      >
        <span>🇳🇬 Lagos</span>
        {currentCity === 'lagos' && <Check className="w-3 h-3 text-emerald-400" />}
      </button>

      <button
        onClick={() => handleSelect('london')}
        className={`px-3 py-1.5 rounded-xl transition cursor-pointer flex items-center gap-1.5 text-xs font-semibold ${
          currentCity === 'london'
            ? 'bg-blue-500/20 text-blue-400 border border-blue-500/40 shadow-xs'
            : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
        }`}
        title="Western Business Environment — London (Canary Wharf & City)"
      >
        <span>🇬🇧 London</span>
        {currentCity === 'london' && <Check className="w-3 h-3 text-blue-400" />}
      </button>
    </div>
  );
}
