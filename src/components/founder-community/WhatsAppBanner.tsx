import React from 'react';
import { ArrowRight, MessageCircle } from 'lucide-react';

interface WhatsAppBannerProps {
  onJoinClick?: () => void;
}

export const WhatsAppBanner: React.FC<WhatsAppBannerProps> = ({ onJoinClick }) => {
  const handleAction = () => {
    if (onJoinClick) {
      onJoinClick();
    } else {
      const el = document.getElementById('founder-form');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        const firstInput = el.querySelector('input') as HTMLInputElement | null;
        if (firstInput) {
          firstInput.focus();
        }
      }
    }
  };

  return (
    <section className="bg-[#0B3B24] text-white py-6 sm:py-8 border-y border-[#0E4A2E]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          
          {/* Left: WhatsApp Icon & Text */}
          <div className="flex items-center gap-4 text-center md:text-left">
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-[#25D366] flex items-center justify-center shrink-0 shadow-lg shadow-black/20">
              {/* Official WhatsApp Glyph */}
              <svg className="w-8 h-8 sm:w-9 sm:h-9 text-white fill-current" viewBox="0 0 24 24">
                <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91C2.13 13.66 2.59 15.36 3.45 16.86L2.05 22L7.3 20.62C8.75 21.41 10.38 21.83 12.04 21.83C17.5 21.83 21.95 17.38 21.95 11.92C21.95 9.27 20.92 6.78 19.05 4.91C17.18 3.03 14.69 2 12.04 2M12.05 3.67C14.25 3.67 16.31 4.53 17.87 6.09C19.42 7.65 20.28 9.72 20.28 11.92C20.28 16.46 16.58 20.15 12.04 20.15C10.56 20.15 9.11 19.76 7.85 19L7.55 18.83L4.43 19.65L5.26 16.61L5.06 16.29C4.24 15 3.8 13.47 3.8 11.91C3.81 7.37 7.5 3.67 12.05 3.67M9.07 7.38C8.89 7.38 8.6 7.45 8.35 7.72C8.1 7.99 7.4 8.65 7.4 10C7.4 11.35 8.38 12.65 8.52 12.83C8.66 13.01 10.45 15.77 13.19 16.95C13.84 17.23 14.35 17.4 14.74 17.53C15.4 17.74 16 17.71 16.47 17.64C17 17.56 18.1 16.97 18.33 16.32C18.56 15.67 18.56 15.11 18.49 15C18.42 14.89 18.24 14.82 17.96 14.68C17.68 14.54 16.33 13.88 16.08 13.79C15.83 13.7 15.65 13.65 15.47 13.93C15.29 14.21 14.77 14.82 14.61 15C14.45 15.19 14.29 15.21 14.01 15.07C13.73 14.93 12.83 14.64 11.76 13.68C10.93 12.94 10.37 12.02 10.21 11.75C10.05 11.47 10.19 11.32 10.33 11.18C10.46 11.05 10.62 10.84 10.76 10.68C10.9 10.51 10.95 10.4 11.04 10.21C11.13 10.03 11.08 9.87 11.01 9.73C10.94 9.59 10.41 8.29 10.19 7.76C9.97 7.24 9.75 7.32 9.59 7.31C9.44 7.31 9.26 7.38 9.07 7.38Z" />
              </svg>
            </div>
            <div>
              <h3 className="font-sans font-black text-xl sm:text-2xl text-white tracking-tight">
                Be Part of the Conversation
              </h3>
              <p className="text-xs sm:text-sm text-slate-200/90 font-normal mt-0.5">
                Join our temporary WhatsApp community of founders while we build our in-house platform.
              </p>
            </div>
          </div>

          {/* Right: Join WhatsApp Community Button -> Smoothly jumps up to application form */}
          <div className="shrink-0">
            <button
              type="button"
              onClick={handleAction}
              className="bg-white hover:bg-slate-100 text-[#0B3B24] font-bold text-xs sm:text-sm px-6 py-3.5 rounded-full shadow-md transition flex items-center gap-2 cursor-pointer active:scale-[0.98]"
            >
              <span>Join WhatsApp Community</span>
              <ArrowRight className="w-4 h-4 text-[#0B3B24]" />
            </button>
          </div>

        </div>
      </div>
    </section>
  );
};
