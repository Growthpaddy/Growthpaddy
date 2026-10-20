import React from 'react';

export const FounderPlatformBar: React.FC = () => {
  return (
    <div className="bg-white border-b border-slate-100 py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-center justify-center gap-8 sm:gap-14 text-neutral-500">
          
          {/* YouTube Platform Badge */}
          <div className="flex items-center gap-2.5 opacity-90 hover:opacity-100 transition">
            <div className="w-8 h-6 bg-[#FF0000] rounded-lg flex items-center justify-center shadow-xs">
              <svg className="w-4 h-4 text-white fill-current ml-0.5" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
            </div>
            <span className="font-extrabold text-xl tracking-tight text-neutral-900 font-sans">
              YouTube
            </span>
          </div>

          {/* Zoom Platform Badge */}
          <div className="flex items-center gap-2 opacity-90 hover:opacity-100 transition">
            <div className="w-7 h-7 bg-[#2D8CFF] rounded-lg flex items-center justify-center shadow-xs text-white">
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                <path d="M4.5 7.5A2.5 2.5 0 0 1 7 5h7a2.5 2.5 0 0 1 2.5 2.5v9A2.5 2.5 0 0 1 14 19H7a2.5 2.5 0 0 1-2.5-2.5v-9z" />
                <path d="M16.5 10.25l4-2.5v8.5l-4-2.5v-3.5z" />
              </svg>
            </div>
            <span className="font-bold text-xl tracking-tight text-[#2D8CFF] font-sans">
              zoom
            </span>
          </div>

          {/* Growing Note */}
          <div className="text-xs sm:text-sm text-neutral-400 font-medium">
            And more as the community grows...
          </div>

        </div>
      </div>
    </div>
  );
};
