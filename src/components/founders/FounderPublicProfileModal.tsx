import React, { useState } from 'react';
import { 
  X, 
  ExternalLink, 
  Share2, 
  Check, 
  Globe, 
  MapPin, 
  Building2, 
  FileText, 
  PlaySquare, 
  Calendar,
  Sparkles,
  Play
} from 'lucide-react';
import { FounderProfile } from '../../lib/founderAuth';
import { FounderArticle, FounderPodcast } from '../../types';

interface FounderPublicProfileModalProps {
  profile: FounderProfile;
  publishedArticles: FounderArticle[];
  podcasts: FounderPodcast[];
  isOpen: boolean;
  onClose: () => void;
  onReadArticle?: (article: FounderArticle) => void;
  onPlayPodcast?: (podcast: FounderPodcast) => void;
}

export const FounderPublicProfileModal: React.FC<FounderPublicProfileModalProps> = ({
  profile,
  publishedArticles,
  podcasts,
  isOpen,
  onClose,
  onReadArticle,
  onPlayPodcast
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const publicSlug = profile.slug || 'ezeji-patrick';
  const fullShareUrl = `https://digitalcampux.com/founders/${publicSlug}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(fullShareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-3 sm:p-5 backdrop-blur-sm animate-fadeIn">
      <div className="bg-[#F3F5F3] rounded-3xl max-w-4xl w-full max-h-[92vh] overflow-y-auto shadow-2xl relative border border-slate-200">
        
        {/* Floating Close Button */}
        <button
          onClick={onClose}
          className="sticky top-4 right-4 ml-auto mr-4 text-slate-500 hover:text-slate-900 w-9 h-9 rounded-full bg-white/90 shadow-md flex items-center justify-center transition z-20"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="p-5 sm:p-8 space-y-6 sm:space-y-8">
          
          {/* Public Profile Hero Header */}
          <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-xs">
            <div className="flex flex-col md:flex-row items-start gap-6">
              {profile.avatar_url ? (
                <img 
                  src={profile.avatar_url} 
                  alt={profile.full_name} 
                  className="w-32 h-32 sm:w-40 sm:h-40 rounded-2xl object-cover shadow-sm border border-slate-100 shrink-0"
                />
              ) : (
                <div className="w-32 h-32 sm:w-40 sm:h-40 rounded-2xl bg-emerald-900 text-white flex items-center justify-center font-black text-4xl shrink-0">
                  {profile.full_name.charAt(0)}
                </div>
              )}

              <div className="space-y-3 flex-1 min-w-0">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                      {profile.full_name}
                    </h1>
                    <p className="text-sm font-bold text-[#059669] mt-0.5">
                      {profile.headline || `Founder, ${profile.business_name || 'DSP Academy'}`}
                    </p>
                  </div>

                  <button
                    onClick={handleCopyLink}
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-2xs transition"
                  >
                    {copied ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        <span className="text-emerald-700 font-bold">Link Copied!</span>
                      </>
                    ) : (
                      <>
                        <Share2 className="w-3.5 h-3.5 text-slate-500" />
                        <span>Copy Profile Link</span>
                      </>
                    )}
                  </button>
                </div>

                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  {profile.bio || "Tech founder and community builder passionate about helping young Africans turn ideas into sustainable businesses."}
                </p>

                {/* Metadata Pills */}
                <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 pt-1">
                  {profile.location && (
                    <div className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                      <span>{profile.location}</span>
                    </div>
                  )}
                  {profile.website && (
                    <a
                      href={profile.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-emerald-700 hover:underline font-semibold"
                    >
                      <Globe className="w-3.5 h-3.5" />
                      <span>{profile.website.replace(/^https?:\/\//, '')}</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Published Articles by this Founder */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-emerald-700" />
                <h2 className="text-lg font-black text-slate-900 tracking-tight">
                  Articles by {profile.full_name} ({publishedArticles.length})
                </h2>
              </div>
            </div>

            {publishedArticles.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {publishedArticles.map((article) => (
                  <div
                    key={article.id}
                    onClick={() => onReadArticle && onReadArticle(article)}
                    className="bg-white rounded-2xl border border-slate-200/80 p-3.5 shadow-2xs hover:shadow-md transition cursor-pointer flex flex-col justify-between group"
                  >
                    <div className="space-y-2.5">
                      <div className="aspect-video w-full rounded-xl overflow-hidden bg-slate-100 relative">
                        <img 
                          src={article.cover_image_url || 'https://images.unsplash.com/photo-1531403009284-440f080d1e12?auto=format&fit=crop&w=800&q=80'} 
                          alt={article.title} 
                          className="w-full h-full object-cover group-hover:scale-105 transition"
                        />
                        <span className="absolute top-2 right-2 bg-black/75 text-white text-[10px] font-bold px-2 py-0.5 rounded">
                          {article.reading_time_minutes} min read
                        </span>
                      </div>

                      <h3 className="font-bold text-xs text-slate-900 group-hover:text-emerald-700 line-clamp-2 leading-snug">
                        {article.title}
                      </h3>
                    </div>

                    <div className="pt-2 mt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                      <span>{article.published_at ? new Date(article.published_at).toLocaleDateString() : 'Recent'}</span>
                      <span className="text-emerald-700 font-bold group-hover:underline">Read →</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-2xl border border-slate-200 p-6 text-center text-xs text-slate-500">
                No published articles yet.
              </div>
            )}
          </div>

          {/* Podcasts & Interviews by this Founder */}
          {podcasts.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <PlaySquare className="w-5 h-5 text-emerald-700" />
                <h2 className="text-lg font-black text-slate-900 tracking-tight">
                  Podcast Appearances &amp; Interviews ({podcasts.length})
                </h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {podcasts.map((podcast) => (
                  <div
                    key={podcast.id}
                    onClick={() => onPlayPodcast && onPlayPodcast(podcast)}
                    className="bg-white rounded-2xl border border-slate-200/80 p-3.5 shadow-2xs hover:shadow-md transition cursor-pointer flex flex-col justify-between group"
                  >
                    <div className="space-y-2.5">
                      <div className="aspect-video w-full rounded-xl overflow-hidden bg-slate-900 relative">
                        <img 
                          src={podcast.thumbnail_url || 'https://images.unsplash.com/photo-1590602847861-f357a9332bbc?auto=format&fit=crop&w=800&q=80'} 
                          alt={podcast.title} 
                          className="w-full h-full object-cover group-hover:scale-105 transition"
                        />
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="w-10 h-10 rounded-full bg-white text-emerald-700 flex items-center justify-center shadow-lg">
                            <Play className="w-4 h-4 fill-emerald-700 ml-0.5" />
                          </div>
                        </div>
                        <span className="absolute bottom-2 right-2 bg-black/80 text-white text-[10px] font-bold px-2 py-0.5 rounded">
                          {podcast.duration_display}
                        </span>
                      </div>

                      <div>
                        <h3 className="font-bold text-xs text-slate-900 group-hover:text-emerald-700 line-clamp-2">
                          {podcast.title}
                        </h3>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          {podcast.channel_name}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
