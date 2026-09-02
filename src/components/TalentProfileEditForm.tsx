'use client';

import React from 'react';
import {
  Camera,
  Sliders,
  Briefcase,
  Plus,
  Trash2,
  Save,
  RefreshCw,
  Edit3
} from 'lucide-react';
import {
  ProfileFormData,
  WORK_TYPE_OPTIONS,
  WorkHistoryItem,
  EducationItem,
  CaseStudyItem
} from './TalentProfile';

interface TalentProfileEditFormProps {
  formData: ProfileFormData;
  setFormData: React.Dispatch<React.SetStateAction<ProfileFormData>>;
  isSaving: boolean;
  initials: string;
  onCancel: () => void;
  onSave: (e: React.FormEvent) => void;
  onAddWorkHistory: () => void;
  onUpdateWorkHistory: (index: number, field: keyof WorkHistoryItem, val: string) => void;
  onRemoveWorkHistory: (index: number) => void;
  onAddEducation: () => void;
  onUpdateEducation: (index: number, field: keyof EducationItem, val: string) => void;
  onRemoveEducation: (index: number) => void;
  onAddCaseStudy: () => void;
  onUpdateCaseStudy: (index: number, field: keyof CaseStudyItem, val: string) => void;
  onRemoveCaseStudy: (index: number) => void;
}

export default function TalentProfileEditForm({
  formData,
  setFormData,
  isSaving,
  initials,
  onCancel,
  onSave,
  onAddWorkHistory,
  onUpdateWorkHistory,
  onRemoveWorkHistory,
  onAddEducation,
  onUpdateEducation,
  onRemoveEducation,
  onAddCaseStudy,
  onUpdateCaseStudy,
  onRemoveCaseStudy
}: TalentProfileEditFormProps) {
  return (
    <form
      id="edit-portfolio-dossier-section"
      onSubmit={onSave}
      className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 shadow-xs space-y-8 animate-fadeIn scroll-mt-20"
    >
      <div className="flex items-center justify-between border-b border-slate-100 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-slate-900">Edit Portfolio Dossier & Resume</h2>
            <span className="text-[10px] font-mono font-bold uppercase bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full border border-emerald-200">
              Active Mode
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Update your avatar, public profile, external links, career history, case studies, and toolkits.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:text-slate-900 border border-slate-200 cursor-pointer transition hover:bg-slate-50"
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={isSaving}
            className="px-5 py-2 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white transition cursor-pointer shadow-xs flex items-center gap-1.5 disabled:opacity-50"
          >
            {isSaving ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
            <span>Save Changes</span>
          </button>
        </div>
      </div>

      {/* Profile Picture URL Field & Live Preview */}
      <div className="p-4 bg-slate-50/80 border border-slate-200/80 rounded-2xl space-y-3">
        <div className="flex items-center gap-2 text-xs font-bold text-slate-900 uppercase tracking-wider font-mono">
          <Camera className="w-4 h-4 text-emerald-600" />
          <span>Profile Picture URL Management</span>
        </div>
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className="w-14 h-14 rounded-2xl overflow-hidden bg-slate-200 shrink-0 border border-slate-300 flex items-center justify-center">
            {formData.profile_picture_url.trim() ? (
              <img
                src={formData.profile_picture_url.trim()}
                alt="Avatar Preview"
                referrerPolicy="no-referrer"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = 'none';
                }}
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-sm font-bold text-slate-500">
                {initials}
              </span>
            )}
          </div>
          <div className="flex-1 w-full space-y-1">
            <label className="text-xs font-semibold text-slate-700">Avatar Image URL (Direct link to PNG, JPG, WebP)</label>
            <input
              type="url"
              value={formData.profile_picture_url}
              onChange={(e) => setFormData({ ...formData, profile_picture_url: e.target.value })}
              placeholder="https://images.unsplash.com/... or hosted picture link"
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-white"
            />
            <p className="text-[11px] text-slate-500">If empty or unreachable, the header automatically displays your initials ({initials}).</p>
          </div>
        </div>
      </div>

      {/* Work Status / Availability Toggle in Edit Form */}
      <div className="p-4 bg-slate-50/80 border border-slate-200 rounded-xl space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-0.5">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-900 uppercase tracking-wider font-mono">
              <Sliders className="w-4 h-4 text-emerald-600" />
              <span>Work Status & Placement Availability</span>
            </div>
            <p className="text-xs font-normal text-slate-500">
              Control whether recruiters can contact you for immediate roles and interview opportunities.
            </p>
          </div>

          <div className="flex items-center gap-3 self-start sm:self-auto">
            <span className={`text-xs font-semibold ${
              formData.availability_status === 'available' ? 'text-emerald-700 font-bold' : 'text-slate-600'
            }`}>
              {formData.availability_status === 'available' ? 'Available for Placement' : 'Hired / In Placement'}
            </span>
            <button
              type="button"
              role="switch"
              aria-checked={formData.availability_status === 'available'}
              onClick={() => {
                const nextStatus = formData.availability_status === 'available' ? 'hired' : 'available';
                setFormData(prev => ({ ...prev, availability_status: nextStatus }));
              }}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-emerald-500/30 ${
                formData.availability_status === 'available' ? 'bg-emerald-600' : 'bg-slate-300'
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                  formData.availability_status === 'available' ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        </div>
      </div>

      {/* Work Type Availability / Open To Multi-Select in Edit Form */}
      <div className="p-4 bg-slate-50/80 border border-slate-200 rounded-xl space-y-3">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-900 uppercase tracking-wider font-mono">
            <Briefcase className="w-4 h-4 text-emerald-600" />
            <span>Work Preference & Engagement Type (Open To)</span>
          </div>
          <p className="text-xs font-normal text-slate-500">
            Select all employment arrangements you are available and actively looking for.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 pt-1">
          {WORK_TYPE_OPTIONS.map((type) => {
            const currentSelected = Array.isArray(formData.work_availability_type)
              ? formData.work_availability_type
              : ['Full-Time', 'Freelance'];
            const isChecked = currentSelected.includes(type);

            return (
              <button
                key={type}
                type="button"
                onClick={() => {
                  const updated = isChecked
                    ? currentSelected.filter((t) => t !== type)
                    : [...currentSelected, type];
                  setFormData((prev) => ({ ...prev, work_availability_type: updated }));
                }}
                className={`px-3.5 py-1.5 text-xs font-medium rounded-full border transition-all cursor-pointer flex items-center gap-2 ${
                  isChecked
                    ? 'bg-slate-900 text-white border-slate-900 shadow-2xs font-semibold'
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                <span className={`w-2 h-2 rounded-full ${isChecked ? 'bg-emerald-400' : 'bg-slate-300'}`} />
                <span>{type}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Basic Info Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-700">Role Title</label>
          <input
            type="text"
            required
            value={formData.role_title}
            onChange={(e) => setFormData({ ...formData, role_title: e.target.value })}
            placeholder="e.g. Senior Growth Marketer"
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-slate-50/50"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-700">Years of Experience</label>
          <input
            type="number"
            min="0"
            max="40"
            required
            value={formData.years_experience}
            onChange={(e) => setFormData({ ...formData, years_experience: Number(e.target.value) })}
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-slate-50/50"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-700">Location</label>
          <input
            type="text"
            value={formData.location}
            onChange={(e) => setFormData({ ...formData, location: e.target.value })}
            placeholder="e.g. Lagos, Nigeria / London, UK"
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-slate-50/50"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-700">Remote Preference</label>
          <select
            value={formData.remote_preference}
            onChange={(e) => setFormData({ ...formData, remote_preference: e.target.value })}
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-slate-50/50"
          >
            <option value="Remote">Remote Only</option>
            <option value="Hybrid">Hybrid</option>
            <option value="On-site">On-site</option>
          </select>
        </div>
      </div>

      {/* Headline & Bio */}
      <div className="space-y-4">
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-700">Professional Headline</label>
          <input
            type="text"
            value={formData.headline}
            onChange={(e) => setFormData({ ...formData, headline: e.target.value })}
            placeholder="Short impact summary"
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-slate-50/50"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-700">Executive Bio & Career Summary</label>
          <textarea
            rows={4}
            value={formData.bio}
            onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
            placeholder="Describe your core domain specializations, past campaign sizes, and key achievements..."
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-slate-50/50"
          />
        </div>
      </div>

      {/* Contact & External Links */}
      <div className="space-y-3">
        <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider font-mono">Contact & External Dossier Links</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="space-y-1">
            <label className="text-[11px] font-semibold text-slate-600">Contact Email</label>
            <input
              type="email"
              value={formData.contact_email}
              onChange={(e) => setFormData({ ...formData, contact_email: e.target.value })}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs bg-slate-50/50"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[11px] font-semibold text-slate-600">Phone Number</label>
            <input
              type="text"
              value={formData.phone_number}
              onChange={(e) => setFormData({ ...formData, phone_number: e.target.value })}
              placeholder="+1 555 123 4567"
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs bg-slate-50/50"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[11px] font-semibold text-slate-600">WhatsApp Number</label>
            <input
              type="text"
              value={formData.whatsapp_number}
              onChange={(e) => setFormData({ ...formData, whatsapp_number: e.target.value })}
              placeholder="+234 800 000 0000"
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs bg-slate-50/50"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[11px] font-semibold text-slate-600">CV Document URL</label>
            <input
              type="url"
              value={formData.cv_url}
              onChange={(e) => setFormData({ ...formData, cv_url: e.target.value })}
              placeholder="https://drive.google.com/... or Notion link"
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs bg-slate-50/50"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[11px] font-semibold text-slate-600">Portfolio Website URL</label>
            <input
              type="url"
              value={formData.portfolio_url}
              onChange={(e) => setFormData({ ...formData, portfolio_url: e.target.value })}
              placeholder="https://yourportfolio.com"
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs bg-slate-50/50"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[11px] font-semibold text-slate-600">LinkedIn Profile URL</label>
            <input
              type="url"
              value={formData.linkedin_url}
              onChange={(e) => setFormData({ ...formData, linkedin_url: e.target.value })}
              placeholder="https://linkedin.com/in/username"
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs bg-slate-50/50"
            />
          </div>

          <div className="space-y-1 sm:col-span-2 lg:col-span-3">
            <label className="text-[11px] font-semibold text-slate-600">GitHub Profile URL</label>
            <input
              type="url"
              value={formData.github_url}
              onChange={(e) => setFormData({ ...formData, github_url: e.target.value })}
              placeholder="https://github.com/username"
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs bg-slate-50/50"
            />
          </div>
        </div>
      </div>

      {/* Work History Builder */}
      <div className="space-y-3 pt-2 border-t border-slate-100">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider font-mono">Work Experience History</h3>
          <button
            type="button"
            onClick={onAddWorkHistory}
            className="text-xs font-semibold text-emerald-700 hover:text-emerald-900 flex items-center gap-1 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Experience</span>
          </button>
        </div>

        <div className="space-y-3">
          {formData.work_history.map((work, idx) => (
            <div key={idx} className="p-4 bg-slate-50/70 border border-slate-200 rounded-2xl space-y-2.5 relative">
              <button
                type="button"
                onClick={() => onRemoveWorkHistory(idx)}
                className="absolute top-3 right-3 text-slate-400 hover:text-rose-600 p-1 cursor-pointer"
                title="Remove experience"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pr-6">
                <input
                  type="text"
                  placeholder="Company Name"
                  value={work.company}
                  onChange={(e) => onUpdateWorkHistory(idx, 'company', e.target.value)}
                  className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs bg-white"
                />
                <input
                  type="text"
                  placeholder="Role / Title"
                  value={work.role}
                  onChange={(e) => onUpdateWorkHistory(idx, 'role', e.target.value)}
                  className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs bg-white"
                />
                <input
                  type="text"
                  placeholder="Duration (e.g. 2022 - Present)"
                  value={work.duration}
                  onChange={(e) => onUpdateWorkHistory(idx, 'duration', e.target.value)}
                  className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs bg-white"
                />
              </div>
              <textarea
                rows={2}
                placeholder="Key accomplishments, budget managed, conversion metrics achieved..."
                value={work.description}
                onChange={(e) => onUpdateWorkHistory(idx, 'description', e.target.value)}
                className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-xs bg-white"
              />
            </div>
          ))}
        </div>
      </div>

      {/* Education Builder */}
      <div className="space-y-3 pt-2 border-t border-slate-100">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider font-mono">Education & Academic Degrees</h3>
          <button
            type="button"
            onClick={onAddEducation}
            className="text-xs font-semibold text-emerald-700 hover:text-emerald-900 flex items-center gap-1 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Degree</span>
          </button>
        </div>

        <div className="space-y-3">
          {formData.education.map((edu, idx) => (
            <div key={idx} className="p-4 bg-slate-50/70 border border-slate-200 rounded-2xl grid grid-cols-1 sm:grid-cols-3 gap-2 relative">
              <input
                type="text"
                placeholder="University / School"
                value={edu.school}
                onChange={(e) => onUpdateEducation(idx, 'school', e.target.value)}
                className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs bg-white"
              />
              <input
                type="text"
                placeholder="Degree / Major"
                value={edu.degree}
                onChange={(e) => onUpdateEducation(idx, 'degree', e.target.value)}
                className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs bg-white"
              />
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder="Year (e.g. 2021)"
                  value={edu.year}
                  onChange={(e) => onUpdateEducation(idx, 'year', e.target.value)}
                  className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs bg-white flex-1"
                />
                <button
                  type="button"
                  onClick={() => onRemoveEducation(idx)}
                  className="text-slate-400 hover:text-rose-600 p-1.5 cursor-pointer"
                  title="Remove degree"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Case Studies Builder */}
      <div className="space-y-3 pt-2 border-t border-slate-100">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider font-mono">Case Studies & Growth Highlights</h3>
          <button
            type="button"
            onClick={onAddCaseStudy}
            className="text-xs font-semibold text-emerald-700 hover:text-emerald-900 flex items-center gap-1 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Case Study</span>
          </button>
        </div>

        <div className="space-y-3">
          {formData.case_studies.map((cs, idx) => (
            <div key={idx} className="p-4 bg-slate-50/70 border border-slate-200 rounded-2xl space-y-2.5 relative">
              <button
                type="button"
                onClick={() => onRemoveCaseStudy(idx)}
                className="absolute top-3 right-3 text-slate-400 hover:text-rose-600 p-1 cursor-pointer"
                title="Remove case study"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pr-6">
                <input
                  type="text"
                  placeholder="Case Study Title"
                  value={cs.title}
                  onChange={(e) => onUpdateCaseStudy(idx, 'title', e.target.value)}
                  className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs bg-white"
                />
                <input
                  type="text"
                  placeholder="Client / Brand"
                  value={cs.client_or_brand}
                  onChange={(e) => onUpdateCaseStudy(idx, 'client_or_brand', e.target.value)}
                  className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs bg-white"
                />
                <input
                  type="text"
                  placeholder="Metrics Achieved (e.g. +140% ROAS)"
                  value={cs.metrics_achieved}
                  onChange={(e) => onUpdateCaseStudy(idx, 'metrics_achieved', e.target.value)}
                  className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs bg-white"
                />
              </div>
              <textarea
                rows={2}
                placeholder="Execution strategy, funnel mechanics, optimization results..."
                value={cs.description}
                onChange={(e) => onUpdateCaseStudy(idx, 'description', e.target.value)}
                className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-xs bg-white"
              />
              <input
                type="url"
                placeholder="Case Study Link (optional)"
                value={cs.link || ''}
                onChange={(e) => onUpdateCaseStudy(idx, 'link', e.target.value)}
                className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-xs bg-white"
              />
            </div>
          ))}
        </div>
      </div>

      {/* AI Tools & Certifications */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-slate-100">
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-700">AI Growth Tools (Comma-separated)</label>
          <input
            type="text"
            value={formData.ai_tools_input}
            onChange={(e) => setFormData({ ...formData, ai_tools_input: e.target.value })}
            placeholder="ChatGPT Plus, Midjourney, Claude 3.5, Make.com"
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs bg-slate-50/50"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-700">Certifications (Comma-separated)</label>
          <input
            type="text"
            value={formData.certifications_input}
            onChange={(e) => setFormData({ ...formData, certifications_input: e.target.value })}
            placeholder="Google Ads Search Certified, Meta Certified Buyer"
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs bg-slate-50/50"
          />
        </div>
      </div>

      <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:text-slate-900 border border-slate-200 cursor-pointer"
        >
          Cancel
        </button>

        <button
          type="submit"
          disabled={isSaving}
          className="px-6 py-2.5 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white transition cursor-pointer shadow-xs flex items-center gap-1.5 disabled:opacity-50"
        >
          {isSaving ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
          <span>Save Profile Dossier</span>
        </button>
      </div>
    </form>
  );
}
