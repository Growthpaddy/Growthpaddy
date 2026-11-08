import React from 'react';
import { X, Calendar, Clock, Share2, User } from 'lucide-react';
import { FounderArticle } from '../../types';

interface FounderArticleReaderModalProps {
  article: FounderArticle | null;
  isOpen: boolean;
  onClose: () => void;
  onShare: (article: FounderArticle) => void;
  authorName?: string;
}

export const FounderArticleReaderModal: React.FC<FounderArticleReaderModalProps> = ({
  article,
  isOpen,
  onClose,
  onShare,
  authorName = 'Founder'
}) => {
  if (!isOpen || !article) return null;

  const dateStr = article.published_at
    ? new Date(article.published_at).toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric'
      })
    : 'Draft';

  return (
    <div className="fixed inset-0 bg-black/75 z-50 flex items-center justify-center p-3 sm:p-5 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-3xl max-w-3xl w-full max-h-[92vh] overflow-y-auto shadow-2xl relative border border-slate-200">
        
        {/* Floating Top Controls */}
        <div className="sticky top-0 bg-white/95 backdrop-blur-md px-6 py-4 border-b border-slate-100 flex items-center justify-between z-20">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
            <User className="w-3.5 h-3.5 text-emerald-600" />
            <span>{authorName}</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onShare(article)}
              className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-full transition"
              title="Share Article"
            >
              <Share2 className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-full transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Article Body */}
        <div className="p-6 sm:p-10 space-y-6">
          
          <div className="space-y-3">
            <div className="flex items-center gap-3 text-xs text-slate-400">
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-emerald-600" />
                {dateStr}
              </span>
              <span>·</span>
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-emerald-600" />
                {article.reading_time_minutes} min read
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900 tracking-tight leading-tight">
              {article.title}
            </h1>

            {article.excerpt && (
              <p className="text-sm sm:text-base text-slate-600 font-medium leading-relaxed italic border-l-4 border-emerald-500 pl-4 py-1">
                {article.excerpt}
              </p>
            )}
          </div>

          {/* Cover image */}
          {article.cover_image_url && (
            <div className="rounded-2xl overflow-hidden aspect-video bg-slate-100 shadow-xs">
              <img 
                src={article.cover_image_url} 
                alt={article.title} 
                className="w-full h-full object-cover"
              />
            </div>
          )}

          {/* Body content */}
          <div className="prose prose-slate max-w-none text-slate-800 text-sm sm:text-base leading-relaxed space-y-4 pt-2">
            {article.content.split('\n\n').map((paragraph, index) => (
              <p key={index}>{paragraph}</p>
            ))}
          </div>

        </div>

      </div>
    </div>
  );
};
