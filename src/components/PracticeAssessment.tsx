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
  Lightbulb,
  Check,
  X,
  RotateCcw
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
      question: 'Your webhooks setup inside Make.com/n8n is timing out due to heavy 40MB response objects. Which pipeline architecture is recommended?',
      options: [
        'Return 202 Accepted immediately from webhook, then process the payload asynchronously via background queue streams',
        'Add a sleep timer module of 10 seconds before parsing parameters',
        'Increase HTTP request headers timeout values to 60 minutes',
        'Convert all inputs to JSON string parameters and re-trigger on loop intervals'
      ],
      correctIdx: 0,
      explanation: 'Returning 202 Accepted immediately decouples the source webhook trigger from heavy compute routines, allowing your server parameters to scale cleanly without timeout drops.'
    },
    {
      id: 'ai-2',
      question: 'When configuring the Gemini API SDK in Node, how do you enforce JSON schemas to guarantee safe backend parser executions?',
      options: [
        'By hardcoding "Return JSON Only" into system templates',
        'Setting the responseSchema parameter inside generateContentConfig to your target structured schema model object',
        'Splitting string records using regex patterns inside client.post parameters',
        'Executing standard JSON.parse() inside try/catch loops directly'
      ],
      correctIdx: 1,
      explanation: 'Using responseSchema directly prompts the model to validate output structure according to your chosen schema before returning responses.'
    },
    {
      id: 'ai-3',
      question: 'Which tool allows executing headless agentic workflows with custom code splits and loop conditions natively without per-step pricing penalties?',
      options: [
        'Zapier Basic Starter',
        'n8n Local Community Docker Instance',
        'IFTTT Standard Trigger',
        'Make.com Hobby plan'
      ],
      correctIdx: 1,
      explanation: 'A self-hosted n8n instance lets you execute complex trigger graphs and multi-step agent loops without volume billing limits.'
    }
  ],
  'SEO': [
    {
      id: 'seo-1',
      question: 'A SaaS platform experiences a drop in organic traffic. Google Search Console marks canonical status as: "Duplicate page without user-selected canonical". What is the immediate fix?',
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
      question: 'Which semantic technique maximizes technical SEO keyword footprints across programmatic directories without triggering thin content penalties?',
      options: [
        'Scraping Wikipedia definitions and placing them as footer paragraphs',
        'Programmatic SEO clustering using schema database objects mapped with custom local briefs',
        'Injecting hidden white paragraphs of keywords matching popular search terms',
        'Spam-linking multiple subdomain directories to standard hub structures'
      ],
      correctIdx: 1,
      explanation: 'Programmatic SEO is highly compliant and scalable when dynamic database records are combined with rich, unique contextual parameters.'
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
        'The pricing tables copy is excellent, but high checkout friction or unexpected costs are introduced inside checkout panels',
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

  const activeQuestions = selectedTrack ? ASSESSMENT_SETS[selectedTrack] : [];

  const handleSelectAnswer = (optionIdx: number) => {
    if (showExplanation) return;
    setAnswers(prev => ({ ...prev, [currentQuestionIdx]: optionIdx }));
    setShowExplanation(true);
  };

  const handleNext = () => {
    setShowExplanation(false);
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
    setCurrentQuestionIdx(0);
    setAnswers({});
    setShowExplanation(false);
    setQuizFinished(false);
  };

  return (
    <div className="space-y-8 py-6 max-w-4xl mx-auto text-left">
      
      {/* Page Title Block */}
      <div className="text-center space-y-3 max-w-xl mx-auto">
        <span className="text-xs font-semibold text-emerald-700 uppercase tracking-widest bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
          Skill Vetting Simulator
        </span>
        <h2 className="font-display font-bold text-3xl sm:text-4xl text-slate-900 tracking-tight">
          Practice Technical Assessment
        </h2>
        <p className="text-sm text-slate-600 leading-relaxed">
          Test your real-world problem-solving skills across technical domains. Experience the exact grading standards recruiters evaluate.
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
              className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 space-y-5 shadow-sm text-left"
            >
              <div className="space-y-1">
                <h3 className="font-display font-bold text-xl text-slate-900">Select Specialization Field</h3>
                <p className="text-xs text-slate-500">Choose a discipline to start interactive scenario questions:</p>
              </div>
              
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
                    className="w-full p-4 sm:p-5 bg-slate-50 hover:bg-slate-100/80 border border-slate-200 rounded-2xl flex items-center justify-between text-left transition cursor-pointer group hover:border-emerald-500/40"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-slate-900 text-sm">{trackName} Assessment</h4>
                        <span className="text-[10px] font-mono font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200 px-2 py-0.5 rounded-full">
                          3 Scenarios
                        </span>
                      </div>
                      <p className="text-xs text-slate-500">Scenario questions testing architecture, debugging, and execution limits.</p>
                    </div>
                    <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-slate-900 group-hover:translate-x-1 transition-transform flex-shrink-0" />
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
              className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 space-y-6 shadow-sm text-left"
            >
              {/* Question Header */}
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="space-y-0.5">
                  <span className="text-xs font-semibold text-emerald-700 uppercase tracking-wider block">
                    {selectedTrack} Technical Audit
                  </span>
                  <p className="text-xs font-mono font-medium text-slate-500">
                    Question {currentQuestionIdx + 1} of {activeQuestions.length}
                  </p>
                </div>
                
                <span className="text-xs font-mono text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
                  Interactive Practice
                </span>
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                <div 
                  className="bg-emerald-600 h-full rounded-full transition-all duration-300"
                  style={{ width: `${((currentQuestionIdx + 1) / activeQuestions.length) * 100}%` }}
                />
              </div>

              {/* Question Text */}
              <div className="space-y-2">
                <h4 className="font-display font-bold text-base sm:text-lg text-slate-900 leading-snug">
                  {activeQuestions[currentQuestionIdx].question}
                </h4>
              </div>

              {/* Options selectors */}
              <div className="space-y-2.5 pt-1">
                {activeQuestions[currentQuestionIdx].options.map((optionText, optionIdx) => {
                  const isSelected = answers[currentQuestionIdx] === optionIdx;
                  const isCorrect = optionIdx === activeQuestions[currentQuestionIdx].correctIdx;
                  
                  let optionStyle = "border-slate-200 bg-white hover:bg-slate-50 text-slate-800";
                  if (showExplanation) {
                    if (isCorrect) {
                      optionStyle = "border-emerald-600 bg-emerald-50 text-emerald-950 font-medium";
                    } else if (isSelected) {
                      optionStyle = "border-red-500 bg-red-50 text-red-950";
                    } else {
                      optionStyle = "border-slate-200 opacity-50 text-slate-400";
                    }
                  }

                  return (
                    <button
                      key={optionIdx}
                      disabled={showExplanation}
                      onClick={() => handleSelectAnswer(optionIdx)}
                      className={`w-full p-4 text-left text-xs rounded-xl border transition-all cursor-pointer ${optionStyle}`}
                    >
                      <div className="flex items-start gap-3">
                        <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-mono font-bold flex-shrink-0 mt-0.5 ${
                          showExplanation && isCorrect 
                            ? 'bg-emerald-600 text-white' 
                            : showExplanation && isSelected 
                            ? 'bg-red-500 text-white' 
                            : 'bg-slate-100 text-slate-700'
                        }`}>
                          {String.fromCharCode(65 + optionIdx)}
                        </span>
                        <span className="flex-1 leading-relaxed">{optionText}</span>
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
                    className="p-4 bg-emerald-50/70 border border-emerald-200 rounded-2xl space-y-1.5"
                  >
                    <div className="flex items-center gap-1.5 text-emerald-800 font-bold text-xs">
                      <Lightbulb className="w-4 h-4 text-emerald-600" />
                      <span>Evaluation Insight</span>
                    </div>
                    <p className="text-xs text-slate-700 leading-relaxed">
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
                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-2.5 px-5 rounded-xl text-xs flex items-center gap-2 cursor-pointer shadow-xs transition"
                  >
                    <span>{currentQuestionIdx < activeQuestions.length - 1 ? 'Next Question' : 'View Final Scorecard'}</span>
                    <ArrowRight className="w-4 h-4" />
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
              className="bg-white border border-slate-200 rounded-3xl p-8 space-y-6 shadow-sm text-center"
            >
              <div className="space-y-2">
                <div className="w-14 h-14 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-2xl flex items-center justify-center mx-auto shadow-2xs">
                  <Award className="w-7 h-7" />
                </div>
                <h3 className="font-display font-bold text-2xl text-slate-900 tracking-tight">Assessment Completed</h3>
                <p className="text-xs text-slate-500 font-mono">{selectedTrack} Scenario Simulation</p>
              </div>

              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 space-y-2 max-w-sm mx-auto">
                <span className="text-xs font-mono uppercase text-slate-500 tracking-wider block">Your Simulated Score</span>
                <p className="text-4xl font-extrabold font-display text-slate-900">{calculateScore()}%</p>
                <div className="pt-2">
                  {calculateScore() >= 70 ? (
                    <p className="text-emerald-700 font-semibold text-xs flex items-center justify-center gap-1">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span>Passed Digital Campux Benchmark</span>
                    </p>
                  ) : (
                    <p className="text-amber-800 font-medium text-xs">
                      Under Standard Threshold (Requires 70% to pass)
                    </p>
                  )}
                </div>
              </div>

              <p className="text-xs text-slate-500 leading-relaxed max-w-md mx-auto">
                Ready to submit your verified profile, take the formal diagnostic assessment, and showcase live portfolio work to active employers?
              </p>

              <div className="flex flex-col sm:flex-row gap-3 pt-2 justify-center">
                <button
                  onClick={resetQuiz}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold py-2.5 px-5 rounded-xl text-xs cursor-pointer flex items-center justify-center gap-1.5 transition"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Retry Diagnostic</span>
                </button>
              </div>

            </motion.div>
          )}

        </AnimatePresence>
      </div>

    </div>
  );
}
