import React, { useState } from 'react';
import { Plus, Minus, ArrowRight } from 'lucide-react';

interface FAQItem {
  id: string;
  question: string;
  answer: string;
}

export const FAQFounderSection: React.FC = () => {
  const [openIds, setOpenIds] = useState<Record<string, boolean>>({});

  const faqs: FAQItem[] = [
    {
      id: 'faq-1',
      question: 'Who can join Digital Campux?',
      answer: 'Digital Campux is built for any young, aspiring, or emerging founder in Nigeria who is pursuing an idea, validating a problem, or actively building an early-stage or established business.'
    },
    {
      id: 'faq-2',
      question: 'Does submitting the form guarantee a podcast invitation?',
      answer: 'Submitting the form admits you to our founder directory and community. Selected founders are curated and invited for one-on-one recorded podcast and YouTube sessions based on alignment and editorial scheduling.'
    },
    {
      id: 'faq-3',
      question: 'Is there a cost to join?',
      answer: 'No. Joining the founder community, submitting your story, and being considered for an interview is 100% free. We are committed to democratizing founder visibility across Nigeria.'
    },
    {
      id: 'faq-4',
      question: 'When will the in-house community be launched?',
      answer: 'We are currently connecting founders through our curated temporary WhatsApp community and live sessions while finalizing our dedicated in-house community platform and founder portal.'
    }
  ];

  const toggleFAQ = (id: string) => {
    setOpenIds(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  return (
    <section id="faq" className="bg-[#FAFBF9] py-16 sm:py-20 lg:py-24 border-b border-slate-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header with pill and View All FAQs button */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
          <div>
            <div className="inline-flex items-center px-4 py-1.5 rounded-full bg-white border border-[#16834A]/30 text-[#16834A] text-[11px] sm:text-xs font-bold tracking-wider uppercase mb-3 shadow-2xs">
              <span>FREQUENTLY ASKED QUESTIONS</span>
            </div>
            <h2 className="font-sans font-black text-3xl sm:text-4xl text-neutral-900 tracking-tight">
              Quick Answers
            </h2>
          </div>

          <a 
            href="#faq"
            onClick={(e) => {
              e.preventDefault();
              // Open all FAQs
              setOpenIds({
                'faq-1': true,
                'faq-2': true,
                'faq-3': true,
                'faq-4': true
              });
            }}
            className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold text-[#16834A] hover:text-[#13723f] border border-[#16834A]/30 bg-white hover:bg-emerald-50/50 px-4 py-2 rounded-full transition shadow-2xs self-start sm:self-auto cursor-pointer"
          >
            <span>View All FAQs</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </a>
        </div>

        {/* 2x2 FAQ Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
          {faqs.map((faq) => {
            const isOpen = Boolean(openIds[faq.id]);
            return (
              <div 
                key={faq.id}
                className="bg-white rounded-2xl border border-slate-200 shadow-2xs transition-all duration-200 overflow-hidden"
              >
                <button
                  type="button"
                  onClick={() => toggleFAQ(faq.id)}
                  className="w-full p-5 sm:p-6 text-left flex items-center justify-between gap-4 cursor-pointer hover:bg-slate-50/50 transition"
                  aria-expanded={isOpen}
                >
                  <span className="font-sans font-bold text-sm sm:text-base text-neutral-900 leading-snug">
                    {faq.question}
                  </span>
                  <div className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center text-neutral-700 shrink-0">
                    {isOpen ? (
                      <Minus className="w-4 h-4" />
                    ) : (
                      <Plus className="w-4 h-4" />
                    )}
                  </div>
                </button>

                {isOpen && (
                  <div className="px-5 pb-5 sm:px-6 sm:pb-6 text-xs sm:text-sm text-neutral-600 leading-relaxed font-normal border-t border-slate-100 pt-3 animate-fadeIn">
                    {faq.answer}
                  </div>
                )}
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
};
