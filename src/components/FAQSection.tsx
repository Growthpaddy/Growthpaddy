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
    question: 'How does the DSP Talent Hub assessment and validation process work?',
    answer: 'Unlike generic multiple-choice quizzes, our vetting requires you to pass "The Gauntlet" — a brutal 48-hour scenario-based assessment that filters for real-world execution. Most applicants fail within the first two hours. We audit actual outputs — like configuring multi-stage data pipelines, coding automation scripts, or running target keyword analyses. This ensures only those who can actually perform the work gain the DSP Talent Hub credentials.'
  },
  {
    id: 'f2',
    category: 'candidates',
    question: 'Are there any hidden costs or fees for fellowship candidates?',
    answer: 'Absolutely not. The core fellowship track, including comprehensive assessments, performance badging, and internship curation, is 100% free for approved candidates. This is fully funded by our hiring agency and enterprise partners who trust us to screen and identify top-tier talent.'
  },
  {
    id: 'f3',
    category: 'candidates',
    question: 'How long does the verification timeline take?',
    answer: 'Our vetting and review process typically finishes within 5 to 7 business days from submission of your diagnostic. Once your skills are verified, your talent dossier is instantly compiled, badged, and surfaced to employers who match your specific skill profile.'
  },
  {
    id: 'f4',
    category: 'employers',
    question: 'How does DSP Talent Hub guarantee the authenticity of candidate skills?',
    answer: 'Every verified profile is backed by a verified talent performance history. Employers can view deep diagnostic logs, examine actual outcomes from comprehensive performance-based tests, listen to brief communication recordings, and review validated historical project metrics. We eliminate credentials bluffing completely.'
  },
  {
    id: 'f5',
    category: 'employers',
    question: 'What models of engagement do you support for talent hiring?',
    answer: 'DSP Talent Hub supports three main paths: 12-week supervised internship placements with pre-negotiated stipend structures, contractual and task-oriented freelancing, and direct-hire full-time listings. We act as structural support throughout, providing dynamic tools and replacement guarantees.'
  },
  {
    id: 'f6',
    category: 'employers',
    question: 'Can we filter candidates by specific tool suites and tech stacks?',
    answer: 'Yes! Our custom-attributed directory allows employers to search by validated software proficiencies. You can search for candidates with verified experience in specialized automation (Make, Zapier), marketing platforms (GA4, HubSpot, Semrush), development languages, or standard AI engineering APIs.'
  },
  {
    id: 'f7',
    category: 'candidates',
    question: 'What happens if I fail or do not meet the minimum assessment score?',
    answer: 'We believe persistent growth is key. If your candidate diagnostic doesn\'t meet our initial benchmark, you\'ll receive a detailed performance feedback log pointing out precise areas to strengthen. You will be eligible to re-submit or attempt a diagnostic review after a 14-day study period.'
  },
  {
    id: 'f8',
    category: 'employers',
    question: 'What is the refund or replacement policy if a placement doesn\'t work out?',
    answer: 'We provide a comprehensive 14-day satisfaction guarantee on every candidate placed from our verified pool. If the candidate\'s execution doesn\'t live up to their digital credentials, we will match you with an alternate pre-vetted candidate immediately at zero auxiliary cost.'
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
    <section id="faq" className="py-24 px-4 sm:px-6 lg:px-8 bg-white border-b border-neutral-100">
      <div className="max-w-4xl mx-auto space-y-16">
        
        {/* Header Block */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-700 font-mono text-xs font-bold rounded-full border border-emerald-100 uppercase tracking-wider">
            <HelpCircle className="w-3.5 h-3.5" />
            <span>F.A.Q. Ecosystem</span>
          </div>
          <h2 className="font-display font-semibold text-3xl sm:text-4xl text-neutral-950 tracking-tight">
            Frequently Asked Questions
          </h2>
          <p className="text-sm sm:text-base text-neutral-500 max-w-xl mx-auto leading-relaxed">
            Have queries about how our verification, internship placement, or enterprise hiring pipeline runs? Find answers below.
          </p>
        </div>

        {/* Tab Filters */}
        <div className="flex justify-center p-1 bg-neutral-100 rounded-2xl max-w-md mx-auto relative z-10">
          <button
            onClick={() => { setActiveTab('all'); setExpandedId(null); }}
            className={`flex-1 py-2.5 px-4 text-xs font-medium rounded-xl transition duration-200 cursor-pointer flex items-center justify-center gap-1.5
              ${activeTab === 'all' 
                ? 'bg-white text-neutral-950 shadow-xs border border-neutral-200/50' 
                : 'text-neutral-500 hover:text-neutral-900 bg-transparent'}`}
          >
            <span>All Questions</span>
          </button>
          
          <button
            onClick={() => { setActiveTab('candidates'); setExpandedId(null); }}
            className={`flex-1 py-2.5 px-4 text-xs font-medium rounded-xl transition duration-200 cursor-pointer flex items-center justify-center gap-1.5
              ${activeTab === 'candidates' 
                ? 'bg-white text-neutral-950 shadow-xs border border-neutral-200/50' 
                : 'text-neutral-500 hover:text-neutral-900 bg-transparent'}`}
          >
            <Users className="w-3.5 h-3.5 text-emerald-600" />
            <span>For Candidates</span>
          </button>

          <button
            onClick={() => { setActiveTab('employers'); setExpandedId(null); }}
            className={`flex-1 py-2.5 px-4 text-xs font-medium rounded-xl transition duration-200 cursor-pointer flex items-center justify-center gap-1.5
              ${activeTab === 'employers' 
                ? 'bg-white text-neutral-950 shadow-xs border border-neutral-200/50' 
                : 'text-neutral-500 hover:text-neutral-900 bg-transparent'}`}
          >
            <Briefcase className="w-3.5 h-3.5 text-emerald-600" />
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
                  transition={{ duration: 0.25, delay: index * 0.05 }}
                  className={`bg-[#f8fafc] border rounded-2xl transition-all duration-300 overflow-hidden
                    ${isExpanded 
                      ? 'border-emerald-500/40 shadow-sm shadow-emerald-500/5 ring-1 ring-emerald-500/10' 
                      : 'border-neutral-200/60 hover:border-neutral-300 hover:bg-[#f1f5f9]'}`}
                >
                  <button
                    onClick={() => toggleExpand(item.id)}
                    className="w-full text-left py-5 px-6 sm:px-8 flex items-center justify-between gap-4 cursor-pointer focus:outline-none"
                  >
                    <div className="space-y-1">
                      <span className={`text-[9px] uppercase font-mono font-bold tracking-wider px-2 py-0.5 rounded-sm
                        ${item.category === 'candidates' 
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' 
                          : 'bg-teal-50 text-teal-700 border border-teal-100'}`}
                      >
                        {item.category === 'candidates' ? 'Candidate Program' : 'Employer Sourcing'}
                      </span>
                      <h3 className="font-display font-medium text-sm sm:text-base text-neutral-900 pt-1.5">
                        {item.question}
                      </h3>
                    </div>
                    
                    <div className={`p-1.5 rounded-full bg-white border border-neutral-200 text-neutral-400 transition-transform duration-300 flex-shrink-0
                      ${isExpanded ? 'rotate-180 text-emerald-600 border-emerald-200' : ''}`}
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
                        <div className="pb-6 pt-1 px-6 sm:px-8 border-t border-dashed border-neutral-200 text-xs sm:text-sm text-neutral-600 leading-relaxed space-y-3">
                          <p>{item.answer}</p>
                          {item.category === 'candidates' ? (
                            <div className="flex items-center gap-1.5 text-xs text-emerald-700 font-medium">
                              <Sparkles className="w-3.5 h-3.5" />
                              <span>Ready to test your actual competence? Choose the Internship Track or Fellowship above.</span>
                            </div>
                          ) : (
                            <div className="flex items-center gap-1.5 text-xs text-teal-700 font-medium">
                              <Sparkles className="w-3.5 h-3.5" />
                              <span>Require diagnostic reports on candidates? Let\'s build a curated shortlist for you.</span>
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

        {/* Live Support Help Box */}
        <div className="bg-[#f0f9f4] border border-emerald-500/10 rounded-2xl p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
          <div className="space-y-1">
            <h4 className="font-display font-bold text-[#0c2e17] text-sm sm:text-base flex items-center gap-2">
              <MessageCircle className="w-4 h-4 text-emerald-600" />
              <span>Still have questions about DSP Talent Hub?</span>
            </h4>
            <p className="text-xs text-[#2a5c39] leading-relaxed max-w-xl">
              Our placement specialists and talent intelligence managers are ready to support your goals. We usually answer within 15 minutes during business hours.
            </p>
          </div>
          <button
            onClick={() => {
              const element = document.getElementById('navbar');
              element?.scrollIntoView({ behavior: 'smooth' });
            }}
            className="self-start sm:self-auto bg-[#10b981] hover:bg-emerald-500 text-white font-bold py-3 px-6 rounded-xl text-xs transition duration-150 cursor-pointer shadow-xs whitespace-nowrap"
          >
            Connect With Admission
          </button>
        </div>

      </div>
    </section>
  );
}
