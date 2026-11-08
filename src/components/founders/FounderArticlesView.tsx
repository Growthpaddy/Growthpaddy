import React, { useState } from 'react';
import { 
  FileText, 
  Plus, 
  Search, 
  Calendar, 
  Eye, 
  Edit3, 
  Trash2, 
  Share2, 
  ArrowRight, 
  CheckCircle2, 
  Clock, 
  Filter
} from 'lucide-react';
import { FounderArticle } from '../../types';

interface FounderArticlesViewProps {
  articles: FounderArticle[];
  onOpenWriteArticle: () => void;
  onEditArticle: (article: FounderArticle) => void;
  onDeleteArticle: (id: string) => void;
  onReadArticle: (article: FounderArticle) => void;
  onShareArticle: (article: FounderArticle) => void;
}

export const FounderArticlesView: React.FC<FounderArticlesViewProps> = ({
  articles,
  onOpenWriteArticle,
  onEditArticle,
  onDeleteArticle,
  onReadArticle,
  onShareArticle
}) => {
  const [activeTab, setActiveTab] = useState<'all' | 'published' | 'draft' | 'pending_review' | 'archived'>('all');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredArticles = articles.filter(article => {
    if (activeTab !== 'all' && article.status !== activeTab) {
      return false;
    }
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      return (
        article.title.toLowerCase().includes(q) ||
        (article.excerpt && article.excerpt.toLowerCase().includes(q))
      );
    }
    return true;
  });

  const publishedCount = articles.filter(a => a.status === 'published').length;
  const draftCount = articles.filter(a => a.status === 'draft').length;
  const pendingCount = articles.filter(a => a.status === 'pending_review').length;
  const archivedCount = articles.filter(a => a.status === 'archived').length;

  return (
    <div className="space-y-6 sm:space-y-8 animate-fadeIn">
      
      {/* HEADER & TOP ACTIONS */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Founder Articles &amp; Insights
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-1">
            Share lessons, case studies, and business reflections to inspire African founders and connect with partners.
          </p>
        </div>

        <button
          onClick={onOpenWriteArticle}
          className="self-start sm:self-auto inline-flex items-center gap-2 bg-[#059669] hover:bg-[#047857] text-white font-bold text-xs sm:text-sm px-5 py-2.5 rounded-xl shadow-xs transition active:scale-[0.98] cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Write New Article</span>
        </button>
      </div>

      {/* FILTER TABS & SEARCH */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-3 sm:p-4 shadow-2xs flex flex-col md:flex-row items-center justify-between gap-4">
        
        {/* Status Filter Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer ${
              activeTab === 'all'
                ? 'bg-[#059669] text-white shadow-2xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            All Articles ({articles.length})
          </button>
          
          <button
            onClick={() => setActiveTab('published')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer ${
              activeTab === 'published'
                ? 'bg-[#059669] text-white shadow-2xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            Published ({publishedCount})
          </button>

          <button
            onClick={() => setActiveTab('draft')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer ${
              activeTab === 'draft'
                ? 'bg-[#059669] text-white shadow-2xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            Drafts ({draftCount})
          </button>

          <button
            onClick={() => setActiveTab('pending_review')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer ${
              activeTab === 'pending_review'
                ? 'bg-[#059669] text-white shadow-2xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            Under Review ({pendingCount})
          </button>

          <button
            onClick={() => setActiveTab('archived')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer ${
              activeTab === 'archived'
                ? 'bg-[#059669] text-white shadow-2xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            Archived ({archivedCount})
          </button>
        </div>

        {/* Search input */}
        <div className="relative w-full md:w-64">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search articles by title..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-emerald-500"
          />
        </div>

      </div>

      {/* ARTICLES GRID */}
      {filteredArticles.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredArticles.map((article) => {
            const formattedDate = article.published_at
              ? new Date(article.published_at).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric'
                })
              : new Date(article.created_at).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric'
                });

            const isPublished = article.status === 'published';

            return (
              <div
                key={article.id}
                className="bg-white rounded-3xl border border-slate-200/80 p-4 shadow-2xs hover:shadow-md hover:border-slate-300 transition flex flex-col justify-between group"
              >
                <div className="space-y-3.5">
                  {/* Cover Image & Tags */}
                  <div className="aspect-video w-full rounded-2xl overflow-hidden relative bg-slate-100">
                    {article.cover_image_url ? (
                      <img src={article.cover_image_url} alt={article.title} className="w-full h-full object-cover group-hover:scale-105 transition duration-300" />
                    ) : <div className="w-full h-full bg-slate-100" aria-label="No cover image" />}
                    
                    {/* Status Pill */}
                    <span className={`absolute top-2.5 left-2.5 text-[10px] font-bold px-2.5 py-0.5 rounded-full shadow-2xs ${
                      isPublished
                        ? 'bg-emerald-600 text-white'
                        : article.status === 'pending_review'
                        ? 'bg-amber-600 text-white'
                        : article.status === 'archived'
                        ? 'bg-slate-500 text-white'
                        : 'bg-slate-800 text-white'
                    }`}>
                      {isPublished ? 'Published' : article.status === 'pending_review' ? 'Pending Review' : article.status === 'archived' ? 'Archived' : 'Draft'}
                    </span>

                    {/* Reading Time */}
                    <span className="absolute top-2.5 right-2.5 bg-black/75 backdrop-blur-xs text-white text-[10px] font-bold px-2 py-0.5 rounded-md">
                      {article.reading_time_minutes} min read
                    </span>
                  </div>

                  {/* Title & Excerpt */}
                  <div className="space-y-1.5">
                    <h3 
                      onClick={() => onReadArticle(article)}
                      className="font-bold text-sm sm:text-base text-slate-900 group-hover:text-[#059669] line-clamp-2 leading-snug cursor-pointer transition"
                    >
                      {article.title}
                    </h3>

                    {article.excerpt && (
                      <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                        {article.excerpt}
                      </p>
                    )}
                  </div>

                  {/* Metadata Row */}
                  <div className="flex items-center gap-3 text-[11px] text-slate-400">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {formattedDate}
                    </span>
                    {isPublished && article.views_count !== undefined && (
                      <span className="flex items-center gap-1">
                        <Eye className="w-3 h-3" />
                        {article.views_count} views
                      </span>
                    )}
                  </div>
                </div>

                {/* Card Actions Footer */}
                <div className="flex items-center justify-between pt-3 mt-4 border-t border-slate-100">
                  <button
                    onClick={() => onReadArticle(article)}
                    className="text-xs font-bold text-[#059669] hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <span>Read</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => onShareArticle(article)}
                      className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition cursor-pointer"
                      title="Share Article"
                    >
                      <Share2 className="w-3.5 h-3.5" />
                    </button>
                    
                    <button
                      onClick={() => onEditArticle(article)}
                      className="p-1.5 text-slate-400 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition cursor-pointer"
                      title="Edit Article"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={() => {
                        if (window.confirm(`Are you sure you want to delete "${article.title}"?`)) {
                          onDeleteArticle(article.id);
                        }
                      }}
                      className="p-1.5 text-slate-400 hover:text-red-700 hover:bg-red-50 rounded-lg transition cursor-pointer"
                      title="Delete Article"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-dashed border-slate-300 p-12 text-center space-y-4">
          <FileText className="w-12 h-12 text-slate-400 mx-auto" />
          <h3 className="font-bold text-slate-800 text-base">No Articles Found</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            {searchTerm 
              ? `No articles match "${searchTerm}". Try adjusting your search query.`
              : `You have no ${activeTab === 'all' ? '' : activeTab} articles yet. Start sharing your founder perspectives.`}
          </p>
          <button
            onClick={onOpenWriteArticle}
            className="inline-flex items-center gap-2 bg-[#059669] hover:bg-[#047857] text-white font-bold text-xs py-2.5 px-5 rounded-xl shadow-xs transition cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Write New Article</span>
          </button>
        </div>
      )}

    </div>
  );
};
