import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronDown, HelpCircle, Users, Briefcase, Sparkles, MessageCircle } from 'lucide-react';

interface FAQItem {
  id: string;
  category: 'candidates' | 'employers';
  question: string;
  answer: string;
}

const FAQ_ITEMS: FAQItem[] = [
  {
    id: 'f1',
    category: 'candidates',
    question: 'How does the DSP Talent Hub assessment and verification process work?',
    answer: 'Unlike generic multiple-choice resume filters, our skill verification program involves rigorous professional assessments. We evaluate actual outputs—such as configuring live marketing databases, executing search performance audits, or setting up automation triggers. Only candidates who demonstrate verified competence and cross our scoring thresholds earn the DSP Professional Verification badges.'
  },
  {
    id: 'f2',
    category: 'candidates',
    question: 'Are there any fees for candidates on the platform?',
    answer: 'Creating a basic profile and taking initial skill assessments is completely free. To unlock the comprehensive Portfolio Builder, showcase verified project evidence, and gain high priority discovery by enterprise hiring managers, candidates pay a small, one-time onboarding fee for Professional Verification & Portfolio Access. This is not a course or examination fee—it is a premium access pass to showcase proven metrics.'
  },
  {
    id: 'f3',
    category: 'candidates',
    question: 'How long does the verification timeline take?',
    answer: 'Our professional grading and feedback loop typically concludes within 3 to 5 business days from your assessment submission. Once your skills are validated, your premium profile is marked as Hiring Ready and immediately becomes searchable by top growth corporations and agencies.'
  },
  {
    id: 'f4',
    category: 'employers',
    question: 'How do you ensure candidate claims are trustworthy?',
    answer: 'Every candidate profile features detailed Portfolio Evidence, direct project metrics, and validated Skill Scores. Rather than trusting self-reported claims, employers instantly review verified case studies and candidate insights. This ensures you find digital talent whose technical competence is fully audited.'
  },
  {
    id: 'f5',
    category: 'employers',
    question: 'How do we contact the candidates we like?',
    answer: 'To protect candidated privacy, contact details remain locked while browsing. Employers browse freely and can unlock candidate contact profiles by purchasing Talent Access Slots. One Slot translates to complete Contact Access for two candidates. We provide bulk packages to simplify recruitment at any scale.'
  },
  {
    id: 'f6',
    category: 'employers',
    question: 'Can we filter candidates by specific tool suites and specializations?',
    answer: 'Yes! Our custom-search directory lets you instantly filter digital professionals by key skills (technical SEO, Google Analytics, Klaviyo segmentation, Make.com triggers, Gemini API) and direct experience levels to quickly identify your ideal Talent Match.'
  }
];

export default function FAQSection() {
  const [activeTab, setActiveTab] = useState<'all' | 'candidates' | 'employers'>('all');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const filteredItems = FAQ_ITEMS.filter(item => {
    if (activeTab === 'all') return true;
    return item.category === activeTab;
  });

  return (
    <section id="faq" className="py-24 px-4 sm:px-6 lg:px-8 bg-white border-b-4 border-neutral-950">
      <div className="max-w-4xl mx-auto space-y-16">
        
        {/* Header Block */}
        <div className="text-left space-y-4 border-l-4 border-neutral-950 pl-6">
          <span className="text-[11px] uppercase font-mono font-black text-emerald-700 tracking-widest block">
            KNOWLEDGE BASE DIRECTORY
          </span>
          <h2 className="font-display font-black text-3xl sm:text-5xl text-neutral-950 uppercase tracking-tight">
            SYSTEM F.A.Q.
          </h2>
          <p className="text-xs font-bold text-neutral-600 max-w-xl uppercase tracking-wider leading-relaxed">
            Everything you need to know about Africa's premier verified hiring engine, vetting metrics, and access credits.
          </p>
        </div>

        {/* Tab Filters */}
        <div className="flex bg-neutral-200 border-2 border-neutral-950 rounded-none max-w-md mx-auto p-1 relative z-10">
          <button
            onClick={() => { setActiveTab('all'); setExpandedId(null); }}
            className={`flex-1 py-2.5 px-4 text-[10.5px] uppercase font-black transition cursor-pointer flex items-center justify-center gap-1.5
              ${activeTab === 'all' 
                ? 'bg-neutral-950 text-white' 
                : 'text-neutral-700 hover:text-neutral-950 bg-transparent'}`}
          >
            <span>All Questions</span>
          </button>
          
          <button
            onClick={() => { setActiveTab('candidates'); setExpandedId(null); }}
            className={`flex-1 py-2.5 px-4 text-[10.5px] uppercase font-black transition cursor-pointer flex items-center justify-center gap-1.5
              ${activeTab === 'candidates' 
                ? 'bg-neutral-950 text-white' 
                : 'text-neutral-700 hover:text-neutral-950 bg-transparent'}`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>For Talent</span>
          </button>

          <button
            onClick={() => { setActiveTab('employers'); setExpandedId(null); }}
            className={`flex-1 py-2.5 px-4 text-[10.5px] uppercase font-black transition cursor-pointer flex items-center justify-center gap-1.5
              ${activeTab === 'employers' 
                ? 'bg-neutral-950 text-white' 
                : 'text-neutral-700 hover:text-neutral-950 bg-transparent'}`}
          >
            <Briefcase className="w-3.5 h-3.5" />
            <span>For Employers</span>
          </button>
        </div>

        {/* Accordions List */}
        <div className="space-y-4">
          <AnimatePresence mode="popLayout">
            {filteredItems.map((item, index) => {
              const isExpanded = expandedId === item.id;
              return (
                <motion.div
                  key={item.id}
                  layout="position"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  transition={{ duration: 0.2, delay: index * 0.02 }}
                  className={`bg-white border-2 border-neutral-950 rounded-none transition-all duration-150 overflow-hidden text-left
                    ${isExpanded 
                      ? 'shadow-[4px_4px_0px_0px_rgba(16,185,129,1)]' 
                      : 'shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:bg-neutral-50/50'}`}
                >
                  <button
                    onClick={() => toggleExpand(item.id)}
                    className="w-full text-left py-5 px-6 sm:px-8 flex items-center justify-between gap-4 cursor-pointer focus:outline-none"
                  >
                    <div className="space-y-1">
                      <span className="text-[9px] uppercase font-mono font-black tracking-wider px-2 py-0.5 rounded-none bg-neutral-950 text-white border border-neutral-950">
                        {item.category === 'candidates' ? 'Professional Talent' : 'Employer Sourcing'}
                      </span>
                      <h3 className="font-display font-black text-sm sm:text-base text-neutral-950 pt-1.5 uppercase leading-tight">
                        {item.question}
                      </h3>
                    </div>
                    
                    <div className={`p-1.5 rounded-none border-2 border-neutral-950 text-neutral-950 bg-white transition-transform duration-300 flex-shrink-0
                      ${isExpanded ? 'rotate-180 bg-neutral-950 text-white' : ''}`}
                    >
                      <ChevronDown className="w-4 h-4" />
                    </div>
                  </button>

                  <AnimatePresence initial={false}>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2, ease: "easeInOut" }}
                      >
                        <div className="pb-6 pt-2 px-6 sm:px-8 border-t-2 border-dashed border-neutral-950 text-xs sm:text-sm text-neutral-700 font-bold uppercase tracking-wider leading-relaxed space-y-3 bg-neutral-50/30">
                          <p>{item.answer}</p>
                          {item.category === 'candidates' ? (
                            <div className="flex items-center gap-1.5 text-xs text-emerald-800 font-black">
                              <Sparkles className="w-3.5 h-3.5" />
                              <span>ACTIVATE PORTFOLIO VERIFICATION TO EARN LIVE RANKING BADGES.</span>
                            </div>
                          ) : (
                            <div className="flex items-center gap-1.5 text-xs text-emerald-800 font-black">
                              <Sparkles className="w-3.5 h-3.5" />
                              <span>UNLOCK VERIFIED DOSSIERS TO VIEW PRIMARY CREDENTILED ASSETS.</span>
                            </div>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>

        {/* Support Help Box */}
        <div className="bg-yellow-50 border-4 border-neutral-950 p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] text-left">
          <div className="space-y-1.5">
            <h4 className="font-display font-black text-neutral-950 text-base uppercase tracking-tight flex items-center gap-2">
              <MessageCircle className="w-4 h-4 text-emerald-850" />
              <span>CUSTOM SPECIFICATION ROUTING</span>
            </h4>
            <p className="text-xs text-neutral-600 font-bold uppercase tracking-wider leading-relaxed max-w-xl">
              Do you have specialized technical requirements or need dedicated batch matching? Our partner coordinators can curate specialized talent queues matching exact metrics.
            </p>
          </div>
          <button
            onClick={() => {
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className="self-start sm:self-auto bg-neutral-950 hover:bg-neutral-900 border-2 border-neutral-950 text-white font-black py-3 px-6 rounded-none text-xs uppercase tracking-widest transition duration-150 cursor-pointer whitespace-nowrap shadow-[3px_3px_0px_0px_rgba(16,185,129,1)]"
          >
            CONNECT COORDINATORS
          </button>
        </div>

      </div>
    </section>
  );
}
