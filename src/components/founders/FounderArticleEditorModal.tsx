import React, { useState } from 'react';
import { X, Save, FileText, Image, Clock, Send, Eye } from 'lucide-react';
import { FounderArticle } from '../../types';

interface FounderArticleEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (article: Partial<FounderArticle>) => Promise<void>;
  initialArticle?: FounderArticle | null;
}

export const FounderArticleEditorModal: React.FC<FounderArticleEditorModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialArticle
}) => {
  const [title, setTitle] = useState(initialArticle?.title || '');
  const [slug, setSlug] = useState(initialArticle?.slug || '');
  const [excerpt, setExcerpt] = useState(initialArticle?.excerpt || '');
  const [content, setContent] = useState(initialArticle?.content || '');
  const [coverImageUrl, setCoverImageUrl] = useState(initialArticle?.cover_image_url || '');
  const [readingTimeOverride, setReadingTimeOverride] = useState<number | null>(null);
  const estimatedReadingTime = content.trim()
    ? Math.max(1, Math.ceil((content.trim().match(/\S+/g) || []).length / 200))
    : null;
  const readingTime = readingTimeOverride ?? (initialArticle?.content === content ? initialArticle?.reading_time_minutes ?? estimatedReadingTime : estimatedReadingTime);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleTitleChange = (newTitle: string) => {
    setTitle(newTitle);
    if (!initialArticle) {
      setSlug(newTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''));
    }
  };

  const handleSubmit = async (submitStatus: 'draft' | 'published') => {
    if (!title.trim()) { alert('Please enter an article title.'); return; }
    if (!content.trim()) { alert('Please enter the article content.'); return; }
    setIsSubmitting(true);
    try {
      await onSave({
        id: initialArticle?.id,
        title: title.trim(),
        slug: slug.trim() || title.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        excerpt: excerpt.trim(),
        content: content.trim(),
        cover_image_url: coverImageUrl.trim(),
        reading_time_minutes: readingTime ?? 1,
        status: submitStatus
      });
      onClose();
    } catch (e) {
      console.error('Error saving article:', e);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-3 sm:p-5 backdrop-blur-xs animate-fadeIn">
      <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 space-y-6 shadow-2xl relative max-h-[92vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-slate-700 w-8 h-8 rounded-full hover:bg-slate-100 flex items-center justify-center transition"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="border-b border-slate-100 pb-3">
          <h3 className="text-xl font-black text-slate-900">
            {initialArticle ? 'Edit Article' : 'Write New Article'}
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Craft high-impact founder insights for the Digital Campux community.
          </p>
        </div>

        <form onSubmit={(e) => { e.preventDefault(); handleSubmit('published'); }} className="space-y-4 text-xs">
          <div className="space-y-1">
            <label className="font-bold text-slate-700">Article Title</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => handleTitleChange(e.target.value)}
              placeholder="e.g. From Idea to First Customer: Lessons for Early-Stage Founders"
              className="w-full border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 font-semibold focus:outline-none focus:border-emerald-500 bg-slate-50/50 focus:bg-white"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="font-bold text-slate-700">Custom URL Slug</label>
              <input
                type="text"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                placeholder="from-idea-to-first-customer"
                className="w-full border border-slate-300 rounded-xl px-3.5 py-2 text-slate-700 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div className="space-y-1">
              <label className="font-bold text-slate-700">Estimated Reading Time (minutes)</label>
              <input
                type="number"
                min="1"
                max="60"
                value={readingTime ?? ''}
                onChange={(e) => setReadingTimeOverride(e.target.value === '' ? null : Math.max(1, Number(e.target.value)))}
                className="w-full border border-slate-300 rounded-xl px-3.5 py-2 text-slate-700 focus:outline-none focus:border-emerald-500 text-center font-bold"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="font-bold text-slate-700">Cover Image URL</label>
            <input
              type="text"
              value={coverImageUrl}
              onChange={(e) => setCoverImageUrl(e.target.value)}
              placeholder="https://your-image-url.example/image.jpg"
              className="w-full border border-slate-300 rounded-xl px-3.5 py-2 text-slate-700 focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div className="space-y-1">
            <label className="font-bold text-slate-700">Short Summary / Excerpt</label>
            <textarea
              rows={2}
              value={excerpt}
              onChange={(e) => setExcerpt(e.target.value)}
              placeholder="1-2 sentences summarizing key lessons from this article..."
              className="w-full border border-slate-300 rounded-xl p-3 text-slate-800 focus:outline-none focus:border-emerald-500 leading-relaxed"
            />
          </div>

          <div className="space-y-1">
            <label className="font-bold text-slate-700">Article Content (Markdown supported)</label>
            <textarea
              rows={7}
              required
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Write your article body here... Share your experiences, challenges, and actionable steps."
              className="w-full border border-slate-300 rounded-xl p-3 text-slate-800 focus:outline-none focus:border-emerald-500 leading-relaxed font-mono text-[11px]"
            />
          </div>

          {/* Action buttons */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-100">
            <button
              type="button"
              disabled={isSubmitting}
              onClick={() => handleSubmit('draft')}
              className="px-4 py-2.5 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700 font-bold transition flex items-center gap-1.5 cursor-pointer"
            >
              <Save className="w-4 h-4 text-slate-500" />
              <span>Save as Draft</span>
            </button>

            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-slate-500 hover:text-slate-800 font-medium"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={isSubmitting}
                className="bg-[#059669] hover:bg-emerald-700 text-white font-bold px-6 py-2.5 rounded-xl shadow-xs transition flex items-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <Send className="w-4 h-4" />
                <span>{isSubmitting ? 'Submitting...' : 'Submit for Review'}</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
