import React from 'react';
import { FileText, CheckCircle, Video, Users } from 'lucide-react';

export const ProcessSection: React.FC = () => {
  const steps = [
    {
      num: 1,
      icon: FileText,
      title: 'Fill the Form',
      description: 'Share basic information about you and what you are building.'
    },
    {
      num: 2,
      icon: CheckCircle,
      title: 'Join Our WhatsApp Community (Temporary)',
      description: 'Connect with other founders while we build our in-house community.'
    },
    {
      num: 3,
      icon: Video,
      title: 'Get Featured',
      description: 'Stand a chance to be invited for a live YouTube session with Ezeji Patrick.'
    },
    {
      num: 4,
      icon: Users,
      title: 'Grow Together',
      description: 'Learn, get visibility and access opportunities as the community grows.'
    }
  ];

  return (
    <section id="process" className="bg-[#F8FAF8] py-16 sm:py-20 lg:py-24 border-b border-slate-200/70">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        
        {/* Section Pill Badge */}
        <div className="inline-flex items-center px-4 py-1.5 rounded-full bg-white border border-[#16834A]/30 text-[#16834A] text-[11px] sm:text-xs font-bold tracking-wider uppercase mb-4 shadow-2xs">
          <span>HOW IT WORKS</span>
        </div>

        {/* Section Heading */}
        <h2 className="font-sans font-black text-3xl sm:text-4xl lg:text-[40px] text-neutral-900 tracking-tight mb-3">
          A simple process to get started
        </h2>

        {/* Subtitle */}
        <p className="text-sm sm:text-base text-neutral-600 max-w-2xl mx-auto mb-14 font-normal">
          Join the community in just a few steps and start your journey with Digital Campux.
        </p>

        {/* Steps Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 relative">
          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <div key={step.num} className="relative flex flex-col items-center text-center px-2 group">
                
                {/* Connecting arrow for desktop between steps */}
                {index < steps.length - 1 && (
                  <div className="hidden md:block absolute top-5 -right-4 w-8 text-slate-300 z-0 pointer-events-none select-none">
                    <svg className="w-6 h-6 text-slate-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M5 12h14" />
                      <path d="m12 5 7 7-7 7" />
                    </svg>
                  </div>
                )}

                {/* Step circle with number badge & icon */}
                <div className="relative mb-5 z-10">
                  <div className="w-14 h-14 rounded-full bg-white border-2 border-[#16834A]/30 group-hover:border-[#16834A] shadow-sm flex items-center justify-center text-[#16834A] transition-all duration-300 transform group-hover:scale-105">
                    <Icon className="w-6 h-6 text-[#16834A]" />
                  </div>
                  {/* Step number badge on top-left of circle */}
                  <div className="absolute -top-1.5 -left-1.5 w-6 h-6 rounded-full bg-white border border-slate-300 text-neutral-800 text-xs font-bold font-mono flex items-center justify-center shadow-2xs">
                    {step.num}
                  </div>
                </div>

                {/* Step Title */}
                <h3 className="font-sans font-bold text-base sm:text-lg text-neutral-900 mb-2 leading-snug">
                  {step.title}
                </h3>

                {/* Step Description */}
                <p className="text-xs sm:text-sm text-neutral-600 leading-relaxed max-w-xs font-normal">
                  {step.description}
                </p>

              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
};
