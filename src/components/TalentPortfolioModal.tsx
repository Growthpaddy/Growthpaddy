import React from 'react';
import PublicPortfolio from './PublicPortfolio';
import { X, ExternalLink } from 'lucide-react';

interface TalentPortfolioModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateToDashboard: () => void;
  publicSlug?: string;
  onboardingData?: any;
}

export default function TalentPortfolioModal({
  isOpen,
  onClose,
  onNavigateToDashboard,
  publicSlug,
  onboardingData
}: TalentPortfolioModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-2 sm:p-4 overflow-y-auto animate-fadeIn">
      <div className="bg-white border border-slate-200 rounded-3xl shadow-2xl max-w-6xl w-full my-4 sm:my-8 relative overflow-hidden text-left max-h-[92vh] flex flex-col">
        
        {/* Modal Top Bar - Clean Plain Light SaaS */}
        <div className="flex items-center justify-between px-6 py-3.5 border-b border-slate-200 bg-white shrink-0">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-bold uppercase text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full">
              Live Digital CV & Portfolio Preview
            </span>
          </div>

          <div className="flex items-center gap-3">
            {publicSlug && (
              <a
                href={`/#/p/${publicSlug}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs font-mono font-bold text-slate-600 hover:text-emerald-700 bg-slate-50 border border-slate-200 px-3 py-1 rounded-xl transition flex items-center gap-1.5 shadow-2xs"
              >
                <span>Open in New Tab</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            )}

            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 flex items-center justify-center transition cursor-pointer"
              id="close-portfolio-modal-btn"
              title="Close modal"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Modal Scrollable Body hosting PublicPortfolio */}
        <div className="overflow-y-auto flex-1 bg-slate-50">
          <PublicPortfolio
            candidateSlug={publicSlug}
            initialData={onboardingData}
            onClose={onClose}
            isEmbedded={true}
          />
        </div>
      </div>
    </div>
  );
}
