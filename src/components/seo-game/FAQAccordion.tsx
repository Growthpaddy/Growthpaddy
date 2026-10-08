import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';

interface FAQItem {
  question: string;
  answer: string;
}

const FAQS: FAQItem[] = [
  {
    question: 'How is The SEO Game different from watching video tutorials or courses?',
    answer: 'Standard SEO courses only show you passive theory and outdated slides. In The SEO Game, you manage an actual simulated business, audit code, deploy pillar pages, target real keywords, and witness simulated search bots index and rank your work. You learn cause and effect by actually making the decisions.'
  },
  {
    question: 'Do I need an existing website or client account to play?',
    answer: 'No. The game provisions a completely isolated, realistic digital environment. You select an industry (like Real Estate, E-commerce, or B2B SaaS) and immediately begin optimizing inside the sandbox without any risk of damaging a live client domain.'
  },
  {
    question: 'Is The SEO Game beginner-friendly or only for advanced SEOs?',
    answer: 'The game features progressive difficulty across 4 distinct stages. Beginners start with foundational keyword research and on-page metadata, while senior practitioners can test advanced programmatic SEO, entity schema graphs, and Generative Engine Optimization (GEO).'
  },
  {
    question: 'How do the algorithm updates and competitors work?',
    answer: 'Our simulator models authentic search algorithms, including ranking volatility, crawl budgets, E-E-A-T signals, and competitor counter-attacks. If you ignore technical errors or rely on thin content, unexpected algorithm events will shake your rankings—forcing you to diagnose and recover.'
  },
  {
    question: 'Is creating an account completely free?',
    answer: 'Yes! Creating a free account gives you instant access to the core tutorial questlines, beginner business district simulation, and initial SERP battles.'
  }
];

export function FAQAccordion() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggle = (idx: number) => {
    setOpenIndex(openIndex === idx ? null : idx);
  };

  return (
    <section id="faq" className="py-16 sm:py-24 relative">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        
        {/* Section Heading */}
        <div className="text-center max-w-xl mx-auto mb-12 space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-xs font-mono font-bold text-[#18B892]">
            <span>FREQUENTLY ASKED QUESTIONS</span>
          </div>
          <h2 className="font-display font-extrabold text-2xl sm:text-4xl text-white tracking-tight">
            Everything You Need to Know
          </h2>
          <p className="text-xs sm:text-sm text-slate-400">
            Got questions about how the simulation works? Here are the answers.
          </p>
        </div>

        {/* Accordion List */}
        <div className="space-y-3 text-left">
          {FAQS.map((faq, idx) => {
            const isOpen = openIndex === idx;
            return (
              <div 
                key={idx}
                className="rounded-2xl bg-[#080E1C] border border-slate-800/90 overflow-hidden transition-colors"
              >
                <button
                  onClick={() => toggle(idx)}
                  className="w-full p-4 sm:p-5 flex items-center justify-between gap-4 text-left font-bold text-sm sm:text-base text-slate-100 hover:text-white cursor-pointer focus:outline-none"
                >
                  <span>{faq.question}</span>
                  <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-200 shrink-0 ${
                    isOpen ? 'rotate-180 text-[#18B892]' : ''
                  }`} />
                </button>

                {isOpen && (
                  <div className="px-4 sm:px-5 pb-5 text-xs sm:text-sm text-slate-300 leading-relaxed border-t border-slate-800/60 pt-3">
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
}
