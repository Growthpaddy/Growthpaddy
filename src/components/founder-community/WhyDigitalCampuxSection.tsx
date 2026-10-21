import React, { useState } from 'react';
import { 
  Eye, 
  Users, 
  Rocket, 
  MessageSquare, 
  ArrowRight, 
  CheckCircle2, 
  AlertCircle, 
  Loader2, 
  ChevronDown, 
  ChevronUp, 
  ExternalLink 
} from 'lucide-react';
import { FounderApplication, ALLOWED_BUSINESS_STAGES, BusinessStage } from '../../types';

interface WhyDigitalCampuxSectionProps {
  onSuccessSubmit?: (data: any) => void;
}

export const WhyDigitalCampuxSection: React.FC<WhyDigitalCampuxSectionProps> = ({
  onSuccessSubmit
}) => {
  // Required form state
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [location, setLocation] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [founderStage, setFounderStage] = useState<string>('');
  
  // Optional expandable story details
  const [showExtendedFields, setShowExtendedFields] = useState(false);
  const [industry, setIndustry] = useState('');
  const [websiteUrl, setWebsiteUrl] = useState('');
  const [businessDescription, setBusinessDescription] = useState('');
  const [biggestChallenge, setBiggestChallenge] = useState('');
  const [visibilityGoal, setVisibilityGoal] = useState('');

  // Checkbox fields
  const [interviewInterest, setInterviewInterest] = useState(true);
  const [whatsappOptIn, setWhatsappOptIn] = useState(true);

  // Submission state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [submittedData, setSubmittedData] = useState<{
    id: string;
    fullName: string;
    businessName: string;
    whatsappOptIn: boolean;
    whatsappUrl: string;
  } | null>(null);

  const exactWhatsAppUrl = "https://chat.whatsapp.com/HjVefSGI3nCFXCYTCjni0F?s=sw&p=a&mlu=4&ilr=4";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return; // Prevent duplicate submissions caused by repeated clicks
    setFormError(null);

    const cleanFullName = fullName.trim();
    const cleanEmail = email.trim().toLowerCase();
    const cleanPhone = phone.trim();
    const cleanLocation = location.trim();
    const cleanBusinessName = businessName.trim();
    const cleanStage = founderStage.trim();

    // 1. Validate the six required fields
    if (!cleanFullName) {
      setFormError('Please enter your full name.');
      return;
    }
    if (!cleanEmail) {
      setFormError('Please enter your email address.');
      return;
    }

    // 2. Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(cleanEmail)) {
      setFormError('Please enter a valid email address.');
      return;
    }

    if (!cleanPhone || cleanPhone.replace(/\D/g, '').length < 8) {
      setFormError('Please enter a valid phone number (at least 8 digits).');
      return;
    }
    if (!cleanLocation) {
      setFormError('Please provide your city and state in Nigeria.');
      return;
    }
    if (!cleanBusinessName) {
      setFormError('Please provide your business or idea name.');
      return;
    }

    // 3. Validate business stage against the authoritative permitted options
    if (!cleanStage || !(ALLOWED_BUSINESS_STAGES as readonly string[]).includes(cleanStage)) {
      setFormError('Please select a valid business stage from the options provided.');
      return;
    }

    setIsSubmitting(true);

    // 4 & 5. Trim text inputs, convert empty optional fields to null, and pass exact booleans
    const payload = {
      full_name: cleanFullName,
      email: cleanEmail,
      phone_number: cleanPhone.startsWith('+234') ? cleanPhone : `+234 ${cleanPhone}`,
      location: cleanLocation,
      business_idea_name: cleanBusinessName,
      business_stage: cleanStage,
      industry_sector: industry.trim() || null,
      website_social_link: websiteUrl.trim() || null,
      business_description: businessDescription.trim() || null,
      biggest_challenge: biggestChallenge.trim() || null,
      visibility_goal: visibilityGoal.trim() || null,
      interview_interest: Boolean(interviewInterest),
      whatsapp_opt_in: Boolean(whatsappOptIn),
      application_status: 'pending'
    };

    try {
      const response = await fetch('/api/founder-applications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || 'Unable to submit your application to the database. Please try again.');
      }

      // 10. Only show success screen after Supabase confirms the insert succeeded
      setSubmittedData({
        id: result.applicationId || result.application?.id,
        fullName: cleanFullName,
        businessName: cleanBusinessName,
        whatsappOptIn: Boolean(whatsappOptIn),
        whatsappUrl: exactWhatsAppUrl
      });

      if (onSuccessSubmit) {
        onSuccessSubmit(result.application || payload);
      }
    } catch (err: any) {
      console.error('Founder application submission error:', err);
      // 12. Preserve entered values after an error so applicant doesn't re-type everything
      setFormError(err.message || 'Could not connect to the database. Please check your network connection and try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section id="why-digital-campux" className="bg-[#F3F5F3] py-16 sm:py-20 lg:py-28 border-b border-slate-200/70">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-14 items-start">
          
          {/* LEFT COLUMN: WHY DIGITAL CAMPUX & 4 BENEFIT CARDS */}
          <div className="lg:col-span-6 space-y-8">
            
            {/* Tag pill */}
            <div className="inline-flex items-center px-4 py-1.5 rounded-full bg-white border border-[#16834A]/40 text-[#16834A] text-xs font-bold tracking-wider uppercase shadow-2xs">
              <span>WHY DIGITAL CAMPUX</span>
            </div>

            {/* Headline */}
            <h2 className="font-sans font-black text-3xl sm:text-4xl lg:text-5xl leading-[1.12] tracking-tight text-neutral-900">
              Because amazing founders shouldn’t remain unknown.
            </h2>

            {/* Body copy */}
            <div className="space-y-4 text-neutral-600 text-base sm:text-lg leading-relaxed font-normal">
              <p>
                There are thousands of young Nigerians building incredible ideas, solving real problems and creating value — but their stories are not being heard.
              </p>
              <p className="font-semibold text-neutral-900">
                <span className="text-[#16834A]">Digital Campux</span> exists to change that.
              </p>
            </div>

            {/* 4 BENEFIT CARDS (2x2 GRID) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              
              {/* Card 1: Visibility */}
              <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-2xs hover:shadow-md transition">
                <div className="w-12 h-12 rounded-xl bg-[#16834A]/10 border border-[#16834A]/20 flex items-center justify-center text-[#16834A] mb-4">
                  <Eye className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-lg text-neutral-900 mb-1.5 font-sans">
                  Visibility
                </h3>
                <p className="text-sm text-neutral-600 leading-relaxed font-normal">
                  Get your story in front of wider audience.
                </p>
              </div>

              {/* Card 2: Community */}
              <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-2xs hover:shadow-md transition">
                <div className="w-12 h-12 rounded-xl bg-[#16834A]/10 border border-[#16834A]/20 flex items-center justify-center text-[#16834A] mb-4">
                  <Users className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-lg text-neutral-900 mb-1.5 font-sans">
                  Community
                </h3>
                <p className="text-sm text-neutral-600 leading-relaxed font-normal">
                  Connect with other founders who understand your journey.
                </p>
              </div>

              {/* Card 3: Opportunities */}
              <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-2xs hover:shadow-md transition">
                <div className="w-12 h-12 rounded-xl bg-[#16834A]/10 border border-[#16834A]/20 flex items-center justify-center text-[#16834A] mb-4">
                  <Rocket className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-lg text-neutral-900 mb-1.5 font-sans">
                  Opportunities
                </h3>
                <p className="text-sm text-neutral-600 leading-relaxed font-normal">
                  Be discovered by potential partners, customers and investors.
                </p>
              </div>

              {/* Card 4: Real Conversations */}
              <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-2xs hover:shadow-md transition">
                <div className="w-12 h-12 rounded-xl bg-[#16834A]/10 border border-[#16834A]/20 flex items-center justify-center text-[#16834A] mb-4">
                  <MessageSquare className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-lg text-neutral-900 mb-1.5 font-sans">
                  Real Conversations
                </h3>
                <p className="text-sm text-neutral-600 leading-relaxed font-normal">
                  Join live YouTube sessions and community discussions.
                </p>
              </div>

            </div>

          </div>

          {/* RIGHT COLUMN: EMBEDDED "JOIN AS A FOUNDER" FORM CARD */}
          <div id="founder-form" className="lg:col-span-6 scroll-mt-24">
            <div className="bg-[#0C121A] text-white rounded-3xl p-6 sm:p-8 lg:p-9 border border-slate-800 shadow-2xl relative overflow-hidden">
              
              {/* Subtle ambient lighting inside card */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-[#16834A]/15 rounded-full blur-3xl pointer-events-none" />

              {!submittedData ? (
                <>
                  {/* Card Header */}
                  <div className="flex items-start gap-4 mb-6 relative z-10">
                    <div className="w-12 h-12 rounded-2xl bg-[#16834A]/25 border border-[#16834A]/40 flex items-center justify-center text-[#18B892] shrink-0">
                      <Users className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="font-sans font-black text-2xl sm:text-[26px] text-white tracking-tight">
                        Join as a Founder
                      </h3>
                      <p className="text-xs sm:text-sm text-slate-400 mt-1 leading-snug">
                        Fill the form below to become part of the Digital Campux founder community.
                      </p>
                    </div>
                  </div>

                  {/* Submission Error Banner */}
                  {formError && (
                    <div className="mb-5 p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-start gap-2.5 text-xs text-rose-300">
                      <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                      <span>{formError}</span>
                    </div>
                  )}

                  {/* FORM INPUTS */}
                  <form onSubmit={handleSubmit} className="space-y-4 relative z-10">
                    
                    {/* Full Name */}
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                        Full Name <span className="text-[#18B892]">*</span>
                      </label>
                      <input
                        type="text"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="e.g. Ezeji Patrick"
                        className="w-full bg-white text-slate-900 placeholder:text-slate-400 text-sm px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#16834A] transition"
                        required
                      />
                    </div>

                    {/* Email Address */}
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                        Email Address <span className="text-[#18B892]">*</span>
                      </label>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="you@example.com"
                        className="w-full bg-white text-slate-900 placeholder:text-slate-400 text-sm px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#16834A] transition"
                        required
                      />
                    </div>

                    {/* Phone Number with Nigerian Flag */}
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                        Phone Number <span className="text-[#18B892]">*</span>
                      </label>
                      <div className="flex bg-white rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-[#16834A] transition">
                        <div className="flex items-center gap-1 px-3.5 bg-slate-100/80 border-r border-slate-200 text-slate-700 text-xs font-semibold select-none">
                          <span className="text-base">🇳🇬</span>
                          <span>+234</span>
                          <ChevronDown className="w-3 h-3 text-slate-500" />
                        </div>
                        <input
                          type="tel"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          placeholder="801 234 5678"
                          className="w-full text-slate-900 placeholder:text-slate-400 text-sm px-4 py-3 focus:outline-none"
                          required
                        />
                      </div>
                    </div>

                    {/* Location (City, State) */}
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                        Location (City, State) <span className="text-[#18B892]">*</span>
                      </label>
                      <input
                        type="text"
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                        placeholder="e.g. Lagos, Nigeria"
                        className="w-full bg-white text-slate-900 placeholder:text-slate-400 text-sm px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#16834A] transition"
                        required
                      />
                    </div>

                    {/* Business / Idea Name */}
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                        Business / Idea Name <span className="text-[#18B892]">*</span>
                      </label>
                      <input
                        type="text"
                        value={businessName}
                        onChange={(e) => setBusinessName(e.target.value)}
                        placeholder="e.g. DSP Academy"
                        className="w-full bg-white text-slate-900 placeholder:text-slate-400 text-sm px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#16834A] transition"
                        required
                      />
                    </div>

                    {/* Business Stage Dropdown */}
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                        Business Stage <span className="text-[#18B892]">*</span>
                      </label>
                      <div className="relative">
                        <select
                          value={founderStage}
                          onChange={(e) => setFounderStage(e.target.value)}
                          className="w-full bg-white text-slate-900 text-sm px-4 py-3 rounded-xl appearance-none focus:outline-none focus:ring-2 focus:ring-[#16834A] transition cursor-pointer"
                          required
                        >
                          <option value="" disabled>Select your stage</option>
                          {ALLOWED_BUSINESS_STAGES.map((stage) => (
                            <option key={stage} value={stage}>
                              {stage}
                            </option>
                          ))}
                        </select>
                        <ChevronDown className="w-4 h-4 text-slate-500 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" />
                      </div>
                    </div>

                    {/* OPTIONAL PROGRESSIVE DISCLOSURE FOR STORY & INTERVIEW INTEREST */}
                    <div className="pt-1">
                      <button
                        type="button"
                        onClick={() => setShowExtendedFields(!showExtendedFields)}
                        className="text-xs text-[#18B892] hover:text-emerald-400 font-semibold flex items-center gap-1.5 cursor-pointer transition py-1"
                      >
                        <span>{showExtendedFields ? 'Hide additional story details' : '+ Add more story details (Optional)'}</span>
                        {showExtendedFields ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                      </button>

                      {showExtendedFields && (
                        <div className="mt-3 space-y-3.5 p-4 rounded-2xl bg-slate-900/80 border border-slate-800 text-xs">
                          <div>
                            <label className="block text-slate-400 mb-1">Industry / Sector</label>
                            <input
                              type="text"
                              value={industry}
                              onChange={(e) => setIndustry(e.target.value)}
                              placeholder="e.g. EdTech, FinTech, Agriculture, Creative"
                              className="w-full bg-slate-800 text-white placeholder:text-slate-500 text-xs px-3 py-2 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#18B892]"
                            />
                          </div>

                          <div>
                            <label className="block text-slate-400 mb-1">Website or Social Profile link</label>
                            <input
                              type="url"
                              value={websiteUrl}
                              onChange={(e) => setWebsiteUrl(e.target.value)}
                              placeholder="https://..."
                              className="w-full bg-slate-800 text-white placeholder:text-slate-500 text-xs px-3 py-2 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#18B892]"
                            />
                          </div>

                          <div>
                            <label className="block text-slate-400 mb-1">Brief Description of what you are building</label>
                            <textarea
                              rows={2}
                              value={businessDescription}
                              onChange={(e) => setBusinessDescription(e.target.value)}
                              placeholder="Tell us what problem your business or idea is solving..."
                              className="w-full bg-slate-800 text-white placeholder:text-slate-500 text-xs px-3 py-2 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#18B892] resize-none"
                            />
                          </div>

                          <div>
                            <label className="block text-slate-400 mb-1">What is your biggest current challenge?</label>
                            <input
                              type="text"
                              value={biggestChallenge}
                              onChange={(e) => setBiggestChallenge(e.target.value)}
                              placeholder="e.g. Visibility, capital, team, distribution"
                              className="w-full bg-slate-800 text-white placeholder:text-slate-500 text-xs px-3 py-2 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#18B892]"
                            />
                          </div>

                          <div>
                            <label className="block text-slate-400 mb-1">What would greater visibility mean to you?</label>
                            <input
                              type="text"
                              value={visibilityGoal}
                              onChange={(e) => setVisibilityGoal(e.target.value)}
                              placeholder="e.g. Finding early adopters, partners, customer trust"
                              className="w-full bg-slate-800 text-white placeholder:text-slate-500 text-xs px-3 py-2 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#18B892]"
                            />
                          </div>

                          <div className="pt-1 space-y-2">
                            <label className="flex items-center gap-2 cursor-pointer text-slate-300">
                              <input
                                type="checkbox"
                                checked={interviewInterest}
                                onChange={(e) => setInterviewInterest(e.target.checked)}
                                className="rounded text-[#16834A] focus:ring-[#16834A] bg-slate-800 border-slate-700"
                              />
                              <span>Consider me for a recorded founder interview on YouTube</span>
                            </label>

                            <label className="flex items-center gap-2 cursor-pointer text-slate-300">
                              <input
                                type="checkbox"
                                checked={whatsappOptIn}
                                onChange={(e) => setWhatsappOptIn(e.target.checked)}
                                className="rounded text-[#16834A] focus:ring-[#16834A] bg-slate-800 border-slate-700"
                              />
                              <span>Join the temporary WhatsApp founder community</span>
                            </label>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* SUBMIT BUTTON */}
                    <div className="pt-2">
                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full bg-[#16834A] hover:bg-[#13723f] disabled:opacity-60 text-white font-bold text-base py-3.5 px-6 rounded-xl transition shadow-lg shadow-[#16834A]/25 flex items-center justify-center gap-2 cursor-pointer active:scale-[0.99]"
                      >
                        {isSubmitting ? (
                          <>
                            <Loader2 className="w-5 h-5 animate-spin" />
                            <span>Submitting Your Dossier...</span>
                          </>
                        ) : (
                          <>
                            <span>Join the Community</span>
                            <ArrowRight className="w-4 h-4" />
                          </>
                        )}
                      </button>
                    </div>

                    {/* Disclaimer Text */}
                    <p className="text-[11px] text-slate-400 text-center leading-relaxed pt-1">
                      By submitting this form, you agree to be contacted about the Digital Campux community and related updates. You can opt out at any time.
                    </p>

                  </form>
                </>
              ) : (
                /* SUCCESS CONFIRMATION STATE */
                <div className="py-8 text-center space-y-6 relative z-10 animate-fadeIn">
                  <div className="w-16 h-16 rounded-full bg-[#16834A]/20 border border-[#16834A] flex items-center justify-center text-[#18B892] mx-auto shadow-lg shadow-[#16834A]/20">
                    <CheckCircle2 className="w-9 h-9" />
                  </div>

                  <div className="space-y-3">
                    <h3 className="font-sans font-black text-2xl text-white">
                      Welcome to the Community!
                    </h3>
                    <p className="text-sm text-slate-300 max-w-sm mx-auto leading-relaxed">
                      Thank you, <strong className="text-white font-bold">{submittedData.fullName}</strong>! Your founder dossier for <strong className="text-white font-bold">{submittedData.businessName}</strong> has been received and registered.
                    </p>
                  </div>

                  <div className="p-5 rounded-2xl bg-[#111A24] border border-[#16834A]/40 space-y-3 max-w-sm mx-auto text-left">
                    <p className="text-xs text-slate-300 leading-relaxed">
                      <strong className="text-white">Step 2:</strong> {submittedData.whatsappOptIn 
                        ? "Join the temporary WhatsApp community of founders while we build our in-house platform."
                        : "You can optionally join our temporary WhatsApp community of founders whenever you wish to connect directly with fellow entrepreneurs."}
                    </p>
                    <a
                      href={submittedData.whatsappUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full bg-[#16834A] hover:bg-[#13723f] text-white font-bold text-xs uppercase tracking-wider py-3.5 px-4 rounded-xl flex items-center justify-center gap-2 shadow-md transition"
                    >
                      <span>Join WhatsApp Community</span>
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  </div>

                  <div className="pt-2">
                    <button
                      type="button"
                      onClick={() => {
                        setSubmittedData(null);
                        setFullName('');
                        setEmail('');
                        setPhone('');
                        setLocation('');
                        setBusinessName('');
                        setFounderStage('');
                        setIndustry('');
                        setWebsiteUrl('');
                        setBusinessDescription('');
                        setBiggestChallenge('');
                        setVisibilityGoal('');
                        setInterviewInterest(true);
                        setWhatsappOptIn(true);
                      }}
                      className="text-xs text-slate-400 hover:text-white underline transition cursor-pointer"
                    >
                      Submit another founder application
                    </button>
                  </div>
                </div>
              )}

            </div>
          </div>

        </div>
      </div>
    </section>
  );
};
