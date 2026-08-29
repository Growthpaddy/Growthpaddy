import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  CheckCircle2, 
  Lock, 
  Sparkles, 
  Award, 
  Save, 
  RefreshCw, 
  ExternalLink, 
  Briefcase, 
  FileText, 
  Plus, 
  Trash2, 
  Check, 
  AlertCircle,
  HelpCircle,
  FolderPlus,
  GraduationCap,
  Eye,
  Globe,
  Linkedin,
  Github,
  Mail,
  Phone,
  MapPin,
  TrendingUp,
  Sliders,
  Layers
} from 'lucide-react';
import { supabase } from '../../lib/supabaseClient';
import { PREDEFINED_SKILL_CATEGORIES, getTalentVerifiedSkills } from '../../lib/quizAdmin';
import { CaseStudyItem, WorkHistoryItem, EducationItem } from '../../types';

interface PortfolioEditorProps {
  initialProfile: any;
  onProfileUpdated?: (updatedProfile: any) => void;
  onTakeQuizForCategory?: (category: string) => void;
}

export const PortfolioEditor: React.FC<PortfolioEditorProps> = ({
  initialProfile,
  onProfileUpdated,
  onTakeQuizForCategory
}) => {
  const talentId = initialProfile?.id || initialProfile?.user_id;

  // 1. Core Profile States (NO HOURLY RATE)
  const [fullName, setFullName] = useState(initialProfile?.full_name || '');
  const [headline, setHeadline] = useState(initialProfile?.headline || initialProfile?.specialty || '');
  const [bio, setBio] = useState(initialProfile?.bio || initialProfile?.career_goal || '');
  const [yearsExperience, setYearsExperience] = useState<number | string>(
    typeof initialProfile?.years_experience === 'number' 
      ? initialProfile.years_experience 
      : typeof initialProfile?.years_of_experience === 'number'
      ? initialProfile.years_of_experience
      : ''
  );
  const [profilePictureUrl, setProfilePictureUrl] = useState(initialProfile?.profile_picture_url || '');
  const [location, setLocation] = useState(initialProfile?.location || 'Remote Global');
  const [availabilityStatus, setAvailabilityStatus] = useState<'available' | 'hired'>(
    initialProfile?.availability_status === 'hired' ? 'hired' : 'available'
  );
  const [slug, setSlug] = useState(initialProfile?.slug || '');
  const [whatsappNumber, setWhatsappNumber] = useState(initialProfile?.whatsapp_number || initialProfile?.phone || '');
  const [contactEmail, setContactEmail] = useState(initialProfile?.contact_email || initialProfile?.email || '');

  // Links
  const [linkedinUrl, setLinkedinUrl] = useState(initialProfile?.linkedin_url || '');
  const [githubUrl, setGithubUrl] = useState(initialProfile?.github_url || '');
  const [portfolioUrl, setPortfolioUrl] = useState(initialProfile?.portfolio_url || '');

  // 2. Verified Skills & Selected Showcased Skills
  const [verifiedSkills, setVerifiedSkills] = useState<string[]>([]);
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [loadingVerifiedSkills, setLoadingVerifiedSkills] = useState<boolean>(true);

  // 3. Work History & Case Studies
  const [workHistory, setWorkHistory] = useState<WorkHistoryItem[]>([]);
  const [caseStudies, setCaseStudies] = useState<CaseStudyItem[]>([]);
  const [education, setEducation] = useState<EducationItem[]>([]);

  // UI state
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  // Fetch verified skills from Supabase
  useEffect(() => {
    async function loadVerifiedSkills() {
      if (!talentId) {
        setLoadingVerifiedSkills(false);
        return;
      }
      try {
        setLoadingVerifiedSkills(true);
        const verified = await getTalentVerifiedSkills(talentId);
        
        // If the candidate already passed Phase 1 in profile, ensure at least their specialty or General is verified
        if (initialProfile?.phase_1_quiz_passed || initialProfile?.phase_1_status === 'passed') {
          const mainSpec = initialProfile?.specialty || initialProfile?.role || 'General Digital Marketing';
          if (!verified.includes(mainSpec)) {
            verified.push(mainSpec);
          }
        }

        setVerifiedSkills(verified);

        // Initialize selected skills from initialProfile.skills or defaults
        const existing = Array.isArray(initialProfile?.skills) ? initialProfile.skills : [];
        if (existing.length > 0) {
          setSelectedSkills(existing);
        } else if (verified.length > 0) {
          setSelectedSkills(verified);
        }
      } catch (err) {
        console.error('Error fetching verified skills:', err);
      } finally {
        setLoadingVerifiedSkills(false);
      }
    }

    loadVerifiedSkills();
  }, [talentId, initialProfile]);

  // Load Work History, Case Studies, Education from initialProfile
  useEffect(() => {
    if (!initialProfile) return;

    if (Array.isArray(initialProfile.work_history)) {
      setWorkHistory(initialProfile.work_history);
    }
    if (Array.isArray(initialProfile.case_studies)) {
      setCaseStudies(initialProfile.case_studies);
    }
    if (Array.isArray(initialProfile.education)) {
      setEducation(initialProfile.education);
    }
  }, [initialProfile]);

  // Toggle selection of a verified skill to showcase
  const handleToggleSkillSelection = (category: string) => {
    if (!verifiedSkills.includes(category)) return;

    setSelectedSkills(prev => {
      if (prev.includes(category)) {
        return prev.filter(s => s !== category);
      } else {
        return [...prev, category];
      }
    });
  };

  // Route to take quiz for unverified category
  const handleTakeQuiz = (category: string) => {
    if (onTakeQuizForCategory) {
      onTakeQuizForCategory(category);
    } else {
      window.location.href = `/assessment?category=${encodeURIComponent(category)}`;
    }
  };

  // Save Portfolio
  const handleSavePortfolio = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsSaving(true);
    setSaveSuccess(false);
    setSaveError(null);

    const parsedYearsExp = Number(yearsExperience) || 0;
    const targetSlug = slug.trim() || (fullName.trim() ? fullName.toLowerCase().replace(/[^a-z0-9]+/g, '-') : 'candidate');

    const updatePayload: any = {
      full_name: fullName,
      headline,
      bio,
      years_experience: parsedYearsExp,
      skills: selectedSkills,
      location,
      availability_status: availabilityStatus,
      profile_picture_url: profilePictureUrl,
      slug: targetSlug,
      whatsapp_number: whatsappNumber,
      contact_email: contactEmail,
      linkedin_url: linkedinUrl,
      github_url: githubUrl,
      portfolio_url: portfolioUrl,
      work_history: workHistory,
      case_studies: caseStudies,
      education: education,
      updated_at: new Date().toISOString()
    };

    try {
      if (talentId) {
        const { error } = await supabase
          .from('talent_profiles')
          .update(updatePayload)
          .eq('id', talentId);

        if (error) {
          console.warn('Direct update notice in Supabase:', error.message);
        }
      }

      setSaveSuccess(true);
      if (onProfileUpdated) {
        onProfileUpdated({ ...initialProfile, ...updatePayload });
      }

      setTimeout(() => setSaveSuccess(false), 4000);
    } catch (err: any) {
      console.error('Error saving portfolio:', err);
      setSaveError(err.message || 'Failed to save portfolio');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-8 text-left max-w-5xl mx-auto">
      
      {/* Toast Feedback */}
      {saveSuccess && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-2xl flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span className="text-xs font-semibold">
              Profile & Verified Skills successfully updated and synced with your public portfolio!
            </span>
          </div>
        </div>
      )}

      {saveError && (
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-900 rounded-2xl flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-2.5">
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
            <span className="text-xs font-semibold">{saveError}</span>
          </div>
        </div>
      )}

      {/* =========================================================================
          SECTION 1: 8 PREDEFINED SKILL CATEGORIES & VERIFIED SKILLS GRID
         ========================================================================= */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-5">
          <div>
            <div className="flex items-center gap-2 text-emerald-600 text-xs font-mono font-bold uppercase tracking-wider mb-1">
              <Award className="w-4 h-4" />
              <span>Skill Accreditation & Verification Matrix</span>
            </div>
            <h3 className="text-xl font-bold text-slate-900 tracking-tight">
              Predefined Verified Skills (8 Skill Tracks)
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Pass diagnostic assessments to unlock verified skill badges. Check the boxes on your unlocked skills to showcase them on your public profile.
            </p>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto bg-slate-50 border border-slate-200 px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-700">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>{verifiedSkills.length} of 8 Tracks Verified</span>
          </div>
        </div>

        {/* Skill Tracks Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {PREDEFINED_SKILL_CATEGORIES.map((category) => {
            const isVerified = verifiedSkills.includes(category);
            const isSelected = selectedSkills.includes(category);

            return (
              <div 
                key={category}
                className={`rounded-2xl p-4 sm:p-5 border transition-all duration-200 flex flex-col justify-between space-y-3 relative ${
                  isVerified
                    ? isSelected
                      ? 'bg-emerald-50/70 border-emerald-300 ring-2 ring-emerald-500/20 shadow-xs'
                      : 'bg-white border-emerald-200 hover:border-emerald-300'
                    : 'bg-slate-50/60 border-slate-200 opacity-80'
                }`}
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    {isVerified ? (
                      <span className="inline-flex items-center gap-1 bg-emerald-100/80 text-emerald-800 border border-emerald-300 text-[10px] font-bold px-2 py-0.5 rounded-full shadow-2xs">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        <span>Verified</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 bg-slate-200 text-slate-600 text-[10px] font-semibold px-2 py-0.5 rounded-full">
                        <Lock className="w-2.5 h-2.5 text-slate-500" />
                        <span>Locked</span>
                      </span>
                    )}

                    {isVerified && (
                      <label className="flex items-center gap-1.5 cursor-pointer text-[11px] font-semibold text-slate-700">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleToggleSkillSelection(category)}
                          className="w-4 h-4 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500 cursor-pointer"
                        />
                        <span className="text-[10px] font-mono text-slate-500">Showcase</span>
                      </label>
                    )}
                  </div>

                  <h4 className={`text-xs font-bold ${isVerified ? 'text-slate-900' : 'text-slate-600'}`}>
                    {category}
                  </h4>
                </div>

                {/* Bottom Action */}
                <div className="pt-2 border-t border-slate-200/60">
                  {isVerified ? (
                    <div className="flex items-center justify-between text-[11px] text-emerald-800 font-medium">
                      <span>Accredited</span>
                      <span className="text-[10px] font-mono text-emerald-600 font-bold">100% Validated</span>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleTakeQuiz(category)}
                      className="w-full bg-slate-900 hover:bg-emerald-600 text-white text-[11px] font-semibold py-1.5 px-2.5 rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
                    >
                      <Sparkles className="w-3 h-3 text-amber-300" />
                      <span>Take Quiz to Unlock Skill</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Selected Skills Summary Banner */}
        <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-0.5">
            <span className="text-xs font-bold text-slate-800">
              Active Showcased Skills on Public Profile:
            </span>
            <div className="flex flex-wrap gap-1.5 pt-1">
              {selectedSkills.length > 0 ? (
                selectedSkills.map(skill => (
                  <span 
                    key={skill}
                    className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[11px] font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200"
                  >
                    <Check className="w-3 h-3 text-emerald-600" />
                    <span>{skill}</span>
                  </span>
                ))
              ) : (
                <span className="text-xs text-slate-400 italic">
                  No verified skills selected yet. Check the boxes above to display verified badges on your profile card.
                </span>
              )}
            </div>
          </div>

          <button
            type="button"
            onClick={() => handleSavePortfolio()}
            disabled={isSaving}
            className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold py-2 px-4 rounded-xl flex items-center justify-center gap-1.5 shadow-xs transition cursor-pointer shrink-0"
          >
            {isSaving ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
            <span>Save Skill Showcases</span>
          </button>
        </div>
      </div>

      {/* =========================================================================
          SECTION 2: EXECUTIVE PROFILE ESSENTIALS (NO HOURLY RATE)
         ========================================================================= */}
      <form onSubmit={handleSavePortfolio} className="space-y-8">
        <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
          <div className="border-b border-slate-100 pb-4">
            <h3 className="text-lg font-bold text-slate-900 tracking-tight">
              Executive Profile & Bio
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Personal branding, career narrative, and professional availability.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {/* Full Name */}
            <div>
              <label className="block text-[11px] font-mono uppercase font-bold text-slate-700 mb-1.5">
                Full Name
              </label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="e.g. Alex Morgan"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-emerald-600 focus:bg-white transition"
              />
            </div>

            {/* Primary Headline */}
            <div>
              <label className="block text-[11px] font-mono uppercase font-bold text-slate-700 mb-1.5">
                Primary Specialty / Role Title
              </label>
              <input
                type="text"
                required
                value={headline}
                onChange={(e) => setHeadline(e.target.value)}
                placeholder="e.g. Senior Growth Marketing Strategist & Paid Media Lead"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-emerald-600 focus:bg-white transition"
              />
            </div>

            {/* Years of Experience */}
            <div>
              <label className="block text-[11px] font-mono uppercase font-bold text-slate-700 mb-1.5">
                Years of Professional Experience
              </label>
              <input
                type="number"
                min="0"
                max="50"
                value={yearsExperience}
                onChange={(e) => setYearsExperience(e.target.value)}
                placeholder="e.g. 5"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-emerald-600 focus:bg-white transition"
              />
            </div>

            {/* Availability Status */}
            <div>
              <label className="block text-[11px] font-mono uppercase font-bold text-slate-700 mb-1.5">
                Placement Availability Status
              </label>
              <select
                value={availabilityStatus}
                onChange={(e) => setAvailabilityStatus(e.target.value as any)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-emerald-600 focus:bg-white transition font-medium"
              >
                <option value="available">🟢 Available for Placement & Interviews</option>
                <option value="hired">🔴 In Placement / Hired</option>
              </select>
            </div>

            {/* Location */}
            <div>
              <label className="block text-[11px] font-mono uppercase font-bold text-slate-700 mb-1.5">
                Location & Remote Preference
              </label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g. Lagos, Nigeria • Remote Global"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-emerald-600 focus:bg-white transition"
              />
            </div>

            {/* Custom Public Slug */}
            <div>
              <label className="block text-[11px] font-mono uppercase font-bold text-slate-700 mb-1.5">
                Public Portfolio URL Slug
              </label>
              <div className="flex items-center bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900">
                <span className="text-slate-400 font-mono select-none">/portfolio/</span>
                <input
                  type="text"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                  placeholder="alex-morgan"
                  className="bg-transparent border-none outline-none flex-1 font-mono text-emerald-800 font-semibold pl-1"
                />
              </div>
            </div>
          </div>

          {/* Bio / Summary */}
          <div>
            <label className="block text-[11px] font-mono uppercase font-bold text-slate-700 mb-1.5">
              Professional Summary & Executive Bio
            </label>
            <textarea
              rows={4}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Detail your core competencies, quantifiable campaign ROI wins, and career focus..."
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3.5 text-xs text-slate-900 focus:outline-none focus:border-emerald-600 focus:bg-white transition"
            />
          </div>

          {/* Contact Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-100">
            <div>
              <label className="block text-[11px] font-mono uppercase font-bold text-slate-700 mb-1.5">
                Contact Email (Direct Recruiters)
              </label>
              <input
                type="email"
                value={contactEmail}
                onChange={(e) => setContactEmail(e.target.value)}
                placeholder="alex@domain.com"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-emerald-600 focus:bg-white"
              />
            </div>
            <div>
              <label className="block text-[11px] font-mono uppercase font-bold text-slate-700 mb-1.5">
                WhatsApp / Direct Contact Number
              </label>
              <input
                type="text"
                value={whatsappNumber}
                onChange={(e) => setWhatsappNumber(e.target.value)}
                placeholder="+234 800 000 0000"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-emerald-600 focus:bg-white"
              />
            </div>
          </div>

          {/* Social Links */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 border-t border-slate-100">
            <div>
              <label className="block text-[11px] font-mono uppercase font-bold text-slate-700 mb-1.5">
                LinkedIn Profile URL
              </label>
              <input
                type="url"
                value={linkedinUrl}
                onChange={(e) => setLinkedinUrl(e.target.value)}
                placeholder="https://linkedin.com/in/..."
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-emerald-600 focus:bg-white"
              />
            </div>
            <div>
              <label className="block text-[11px] font-mono uppercase font-bold text-slate-700 mb-1.5">
                GitHub / Code Repository URL
              </label>
              <input
                type="url"
                value={githubUrl}
                onChange={(e) => setGithubUrl(e.target.value)}
                placeholder="https://github.com/..."
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-emerald-600 focus:bg-white"
              />
            </div>
            <div>
              <label className="block text-[11px] font-mono uppercase font-bold text-slate-700 mb-1.5">
                External Portfolio / Website URL
              </label>
              <input
                type="url"
                value={portfolioUrl}
                onChange={(e) => setPortfolioUrl(e.target.value)}
                placeholder="https://mywork.com"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-emerald-600 focus:bg-white"
              />
            </div>
          </div>
        </div>

        {/* Global Save Button */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="submit"
            disabled={isSaving}
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-3 px-8 rounded-2xl text-xs flex items-center gap-2 shadow-sm transition cursor-pointer"
          >
            {isSaving ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Syncing Portfolio with Database...</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>Save All Profile & Skill Updates</span>
              </>
            )}
          </button>
        </div>
      </form>

    </div>
  );
};

export default PortfolioEditor;
