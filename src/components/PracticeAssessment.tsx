import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Award, 
  ArrowRight, 
  CheckCircle2, 
  RefreshCw, 
  Sparkles, 
  ChevronRight, 
  BrainCircuit, 
  Lightbulb
} from 'lucide-react';

interface Question {
  id: string;
  question: string;
  options: string[];
  correctIdx: number;
  explanation: string;
}

const ASSESSMENT_SETS: Record<string, Question[]> = {
  'AI Automation': [
    {
      id: 'ai-1',
      question: 'Your webhooks setup inside Make.com are timing out due to heavy 40MB response objects. Which pipeline restructure is recommended?',
      options: [
        'Place a webhook response module returning 202 Accepted immediately, then process the payload asynchronously via background queue streams',
        'Add a sleep timer module of 10 seconds before parsing parameters',
        'Increase HTTP request headers timeout values to 60 minutes',
        'Convert all inputs to JSON string parameters and re-trigger on loop intervals'
      ],
      correctIdx: 0,
      explanation: 'Returning 202 Accepted immediately decouples the source webhook from heavy compute routines, allowing your server parameters to scale cleanly.'
    },
    {
      id: 'ai-2',
      question: 'When configuring the Gemini API SDK in Node, how do you enforce JSON schemas to guarantee safe backend parser executions?',
      options: [
        'By hardcoding "Return JSON Only" parameters into system templates',
        'Setting the responseSchema parameter inside generateContentConfig to your target structured schema model object',
        'Splitting string records using regex patterns inside client.post parameters',
        'Executing standard JSON.parse() inside try/catch loops directly'
      ],
      correctIdx: 1,
      explanation: 'Using responseSchema directly prompts Gemini to validate output structure according to your chosen schema before returning responses.'
    },
    {
      id: 'ai-3',
      question: 'Which tool allows executing headless agentic workflows with custom code splits and loop conditions natively without subscription overhead?',
      options: [
        'Zapier Basic Starter',
        'n8n Local Community Docker Instance',
        'Ifttt Standard Trigger',
        'Make.com Hobby plan'
      ],
      correctIdx: 1,
      explanation: 'An on-premise n8n Docker setup lets you execute millions of triggers and loop configurations without volume price penalties.'
    }
  ],
  'SEO': [
    {
      id: 'seo-1',
      question: 'A client-facing SaaS platform experiences a drop in organic registrations or clicks. Google Search Console marks canonical status as: "Duplicate page without user-selected canonical". What is the immediate fix?',
      options: [
        'Add generic redirect loops on all internal index pages',
        'Declare explicit link rel="canonical" tags pointing directly to the primary authoritative page destination',
        'Modify robots.txt parameters to disallow searching deep index files entirely',
        'Delete the affected pages from site maps and retry requests'
      ],
      correctIdx: 1,
      explanation: 'Explicit canonical tags guide Google index engines to prioritize the primary page, consolidating duplicate query weight.'
    },
    {
      id: 'seo-2',
      question: 'Which semantic technique maximizes technical SEO keyword footprints across scale-up directories without triggering thin content algorithms?',
      options: [
        'Scraping Wikipedia definitions and placing them as footer paragraphs',
        'Programmatic SEO clustering using schema database objects mapped with custom local briefs',
        'Injecting hidden white paragraphs of keywords matching popular search terms',
        'Spam-linking multiple subdomain directories to standard hub structures'
      ],
      correctIdx: 1,
      explanation: 'Programmatic SEO is highly compliant and scalable when dynamic database records are combined with rich, custom geographical parameters.'
    },
    {
      id: 'seo-3',
      question: 'Which metadata header parameter instructs crawler robots not to cache pages locally but allow indexing them on searches?',
      options: [
        'noindex, follow',
        'noarchive',
        'noreferrer',
        'disallow: /'
      ],
      correctIdx: 1,
      explanation: 'noarchive allows crawlers to index and rank the current page on search results directly while disabling outdated local caching nodes.'
    }
  ],
  'Growth Marketing': [
    {
      id: 'gm-1',
      question: 'When running conversion optimization tests on pricing blocks, you notice sign-up clicks are high but checkout completion rates drop by 68%. What does this suggest?',
      options: [
        'The pricing tables copy is excellent, but high checkout friction or hidden costs are introduced inside checkout panels',
        'The hero header needs a different color contrast',
        'Your user tags in GA4 are broken, corrupting search tables',
        'Your A/B testing duration didn\'t run long enough'
      ],
      correctIdx: 0,
      explanation: 'Friction mismatch is the primary reason users drop out at checkout after expressing solid high-intent on product marketing tables.'
    },
    {
      id: 'gm-2',
      question: 'To set up multi-channel revenue attribution mapping in GA4 accurately, which model is recommended over legacy models?',
      options: [
        'First-Click Attribution',
        'Data-Driven Attribution Model',
        'Last-Click Baseline',
        'Linear average splitting'
      ],
      correctIdx: 1,
      explanation: 'Data-Driven Attribution uses machine learning to assign fractional weights to every touchpoint along search journeys.'
    }
  ]
};

export default function PracticeAssessment() {
  const [selectedTrack, setSelectedTrack] = useState<string | null>(null);
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState<number>(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [showExplanation, setShowExplanation] = useState<boolean>(false);
  const [quizFinished, setQuizFinished] = useState<boolean>(false);
  const [latestSelectedAnswer, setLatestSelectedAnswer] = useState<number | null>(null);

  const activeQuestions = selectedTrack ? ASSESSMENT_SETS[selectedTrack] : [];

  const handleSelectAnswer = (optionIdx: number) => {
    if (showExplanation) return; // Lock selections during explanation reviews
    setLatestSelectedAnswer(optionIdx);
    setAnswers(prev => ({ ...prev, [currentQuestionIdx]: optionIdx }));
    setShowExplanation(true);
  };

  const handleNext = () => {
    setShowExplanation(false);
    setLatestSelectedAnswer(null);
    if (currentQuestionIdx < activeQuestions.length - 1) {
      setCurrentQuestionIdx(prev => prev + 1);
    } else {
      setQuizFinished(true);
    }
  };

  const calculateScore = () => {
    let score = 0;
    activeQuestions.forEach((q, idx) => {
      if (answers[idx] === q.correctIdx) score++;
    });
    return Math.round((score / activeQuestions.length) * 100);
  };

  const resetQuiz = () => {
    setSelectedTrack(null);
    currentQuestionIdx;
    setAnswers({});
    setShowExplanation(false);
    setQuizFinished(false);
    setLatestSelectedAnswer(null);
  };

  return (
    <div className="space-y-10 py-10 px-4 sm:px-6 lg:px-8 bg-neutral-50/50">
      
      {/* Page Title Block */}
      <div className="text-left space-y-4 max-w-4xl mx-auto border-l-4 border-neutral-950 pl-6">
        <span className="text-[11px] uppercase font-mono font-black text-emerald-700 tracking-widest block">
          METRIC EVALUATION SANDBOX
        </span>
        <h1 className="font-display font-black text-4xl sm:text-6xl text-neutral-950 uppercase tracking-tight leading-none">
          VETTING SIMULATOR.
        </h1>
        <p className="text-xs font-bold text-neutral-600 max-w-lg uppercase tracking-wider leading-relaxed">
          Operational scenarios over multiple-choice resumes. Solve engineering parameter triggers to preview grading systems.
        </p>
      </div>

      <div className="max-w-2xl mx-auto">
        <AnimatePresence mode="wait">
          
          {/* State 1: Choose Specialized Track */}
          {!selectedTrack && (
            <motion.div
              key="choose"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="bg-white border-4 border-neutral-950 rounded-none p-6 sm:p-8 space-y-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] text-left"
            >
              <h3 className="font-display font-black text-xl text-neutral-950 uppercase tracking-tight">SELECT COMPETENCY FIELD</h3>
              <p className="text-xs font-bold text-neutral-500 uppercase tracking-wider">Choose an operational subset to fetch target diagnostic scenarios:</p>
              
              <div className="space-y-3 pt-2">
                {Object.keys(ASSESSMENT_SETS).map((trackName) => (
                  <button
                    key={trackName}
                    onClick={() => {
                      setSelectedTrack(trackName);
                      setCurrentQuestionIdx(0);
                      setAnswers({});
                      setQuizFinished(false);
                      setShowExplanation(false);
                    }}
                    className="w-full p-5 bg-neutral-50 hover:bg-neutral-100 border-2 border-neutral-950 rounded-none flex items-center justify-between text-left transition duration-155 cursor-pointer group"
                  >
                    <div>
                      <h4 className="font-black text-neutral-950 uppercase text-sm">{trackName} CORE AUDIT</h4>
                      <p className="text-xs text-neutral-500 font-semibold uppercase tracking-wider mt-1 pb-1">Performance tests checking workflow triggers and integration limits.</p>
                      <span className="text-[9px] font-mono font-bold bg-neutral-950 text-white px-2 py-0.5 tracking-wider uppercase">3 DEMAND MODULES</span>
                    </div>
                    <ChevronRight className="w-5 h-5 text-neutral-950 group-hover:translate-x-1 transition-transform" />
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {/* State 2: Active Exam Sandbox */}
          {selectedTrack && !quizFinished && (
            <motion.div
              key="test"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="bg-white border-4 border-neutral-950 rounded-none p-6 sm:p-8 space-y-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] text-left"
            >
              {/* Question Header */}
              <div className="flex items-center justify-between border-b-2 border-neutral-950 pb-3">
                <div className="space-y-1">
                  <span className="text-[9px] font-mono text-white uppercase font-black tracking-widest px-2.5 py-1 rounded-none bg-[#047857] border border-neutral-950">
                    {selectedTrack} SPECIALIST ASSESSMENT
                  </span>
                  <p className="text-[10px] uppercase font-mono font-black text-neutral-500">TRIGGER {currentQuestionIdx + 1} OF {activeQuestions.length}</p>
                </div>
                
                <span className="text-[10px] font-mono font-black uppercase text-neutral-400">Sandbox Mode</span>
              </div>

              {/* Progress Slider Bar */}
              <div className="w-full bg-neutral-200 h-2 border border-neutral-400 rounded-none overflow-hidden">
                <div 
                  className="bg-neutral-950 h-full rounded-none transition-all duration-350"
                  style={{ width: `${((currentQuestionIdx + 1) / activeQuestions.length) * 100}%` }}
                />
              </div>

              {/* Question Text block */}
              <div className="space-y-4">
                <h3 className="font-display font-black text-lg text-neutral-950 uppercase leading-snug">
                  {activeQuestions[currentQuestionIdx].question}
                </h3>
              </div>

              {/* Options selectors */}
              <div className="space-y-2.5 pt-2">
                {activeQuestions[currentQuestionIdx].options.map((optionText, optionIdx) => {
                  const isSelected = answers[currentQuestionIdx] === optionIdx;
                  const isCorrect = optionIdx === activeQuestions[currentQuestionIdx].correctIdx;
                  
                  let optionStyle = "border-2 border-neutral-950 bg-white hover:bg-neutral-50 text-neutral-900";
                  if (showExplanation) {
                    if (isCorrect) {
                      optionStyle = "border-2 border-[#10b981] bg-emerald-50 text-emerald-950 font-black";
                    } else if (isSelected) {
                      optionStyle = "border-2 border-rose-600 bg-red-50 text-rose-950";
                    } else {
                      optionStyle = "border border-neutral-200 opacity-60 text-neutral-400";
                    }
                  }

                  return (
                    <button
                      key={optionIdx}
                      disabled={showExplanation}
                      onClick={() => handleSelectAnswer(optionIdx)}
                      className={`w-full p-4 text-left text-xs uppercase font-bold tracking-wider rounded-none cursor-pointer transition-all ${optionStyle}`}
                    >
                      <div className="flex items-start gap-3">
                        <span className="font-mono bg-neutral-950 text-white rounded-none w-5 h-5 flex items-center justify-center text-[10px]">
                          {String.fromCharCode(65 + optionIdx)}
                        </span>
                        <span className="flex-1 leading-normal pt-0.5">{optionText}</span>
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Explanation Reveal */}
              <AnimatePresence>
                {showExplanation && (
                  <motion.div
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="p-4 bg-yellow-50 border-2 border-neutral-950 rounded-none space-y-2"
                  >
                    <div className="flex items-center gap-2 text-amber-900 font-black text-xs uppercase">
                      <Lightbulb className="w-4 h-4" />
                      <span>Audit Dossier Guideline</span>
                    </div>
                    <p className="text-[11px] text-amber-950 uppercase font-bold leading-relaxed tracking-wider">
                      {activeQuestions[currentQuestionIdx].explanation}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Bottom Nav Action */}
              {showExplanation && (
                <div className="pt-2 flex justify-end">
                  <button
                    onClick={handleNext}
                    className="bg-neutral-950 hover:bg-neutral-900 text-white font-black py-3 px-6 rounded-none text-xs uppercase tracking-widest flex items-center gap-1.5 cursor-pointer shadow-[3px_3px_0px_0px_rgba(16,185,129,1)]"
                  >
                    <span>{currentQuestionIdx < activeQuestions.length - 1 ? 'CONTINUE DIAGNOSTIC' : 'COMPILE SCORE REPORT'}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}

            </motion.div>
          )}

          {/* State 3: Scoring report */}
          {selectedTrack && quizFinished && (
            <motion.div
              key="finished"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="bg-white border-4 border-neutral-950 rounded-none p-8 space-y-8 shadow-[8px_8px_0px_0px_rgba(16,185,129,1)] text-center"
            >
              <div className="space-y-3">
                <div className="w-16 h-16 bg-[#033c2a] text-white border-2 border-neutral-950 rounded-none flex items-center justify-center mx-auto shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">
                  <Award className="w-8 h-8 text-emerald-300" />
                </div>
                <h3 className="font-display font-black text-2xl uppercase text-neutral-950 tracking-tight pt-2">VALIDATION RECOGNIZED</h3>
                <p className="text-xs uppercase font-mono font-black text-neutral-400">{selectedTrack} Scenario Simulation Completed</p>
              </div>

              <div className="bg-neutral-50 border-2 border-neutral-950 p-6 rounded-none">
                <span className="text-[10px] font-mono uppercase font-black text-neutral-400 tracking-wider block mb-1">AGGREGATED SCORE</span>
                <p className="text-5xl font-black font-display text-neutral-950">{calculateScore()}%</p>
                <div className="mt-4 pt-4 border-t border-dashed border-neutral-400">
                  {calculateScore() >= 70 ? (
                    <p className="text-emerald-700 font-black text-xs uppercase tracking-wider flex items-center justify-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-705" />
                      <span>Passed Verification Threshold</span>
                    </p>
                  ) : (
                    <p className="text-amber-800 font-extrabold text-xs uppercase tracking-wider">
                      Under Standard Sourcing Badge Limits (Requires 70%)
                    </p>
                  )}
                </div>
              </div>

              <p className="text-xs text-neutral-500 uppercase font-bold tracking-wider leading-relaxed max-w-md mx-auto">
                Ready to make your scores permanent and showcase actual portfolio evidence dossiers to growth agencies? Submit your permanent portfolio file.
              </p>

              <div className="flex flex-col sm:flex-row gap-3 pt-2 justify-center">
                <button
                  onClick={resetQuiz}
                  className="bg-neutral-100 hover:bg-neutral-200 border-2 border-neutral-950 text-neutral-950 font-black py-3 px-6 rounded-none text-xs uppercase tracking-widest cursor-pointer"
                >
                  RETRY DIAGNOSTIC
                </button>
                <button
                  onClick={resetQuiz}
                  className="bg-neutral-950 hover:bg-neutral-900 border-2 border-neutral-950 text-white font-black py-3 px-6 rounded-none text-xs uppercase tracking-widest cursor-pointer shadow-[3px_3px_0px_0px_rgba(16,185,129,1)]"
                >
                  SUBMIT EVIDENCE FILE
                </button>
              </div>

            </motion.div>
          )}

        </AnimatePresence>
      </div>

    </div>
  );
}
