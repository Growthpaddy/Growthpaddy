import React from 'react';
import { 
  FileText, 
  Edit3, 
  PlaySquare, 
  Target, 
  ExternalLink, 
  Share2, 
  Plus, 
  Calendar, 
  ArrowRight, 
  Play, 
  Shield, 
  CheckCircle2,
  Clock
} from 'lucide-react';
import { 
  FounderArticle, 
  FounderPodcast, 
  FounderDailyGoal, 
  FounderTask, 
  FounderDistraction, 
  PageType 
} from '../../types';
import { FounderProfile } from '../../lib/founderAuth';

interface FounderOverviewViewProps {
  profile: FounderProfile;
  publishedArticles: FounderArticle[];
  draftArticles: FounderArticle[];
  podcasts: FounderPodcast[];
  dailyGoal: FounderDailyGoal;
  todayTasks: FounderTask[];
  distractions: FounderDistraction[];
  stats: {
    publishedArticlesCount: number;
    draftArticlesCount: number;
    podcastsCount: number;
    todayProgressPercent: number;
    completedTasksCount: number;
    totalTasksCount: number;
  };
  onNavigate: (page: PageType) => void;
  onOpenWriteArticle: () => void;
  onOpenEditProfile: () => void;
  onOpenPublicProfile: () => void;
  onShareProfile: () => void;
  onShareArticle: (article: FounderArticle) => void;
  onSharePodcast: (podcast: FounderPodcast) => void;
  onPlayPodcast: (podcast: FounderPodcast) => void;
  onReadArticle: (article: FounderArticle) => void;
}

export const FounderOverviewView: React.FC<FounderOverviewViewProps> = ({
  profile,
  publishedArticles,
  draftArticles,
  podcasts,
  dailyGoal,
  todayTasks,
  distractions,
  stats,
  onNavigate,
  onOpenWriteArticle,
  onOpenEditProfile,
  onOpenPublicProfile,
  onShareProfile,
  onShareArticle,
  onSharePodcast,
  onPlayPodcast,
  onReadArticle
}) => {
  // Dynamic time greeting
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const firstName = profile.full_name?.split(' ')[0] || 'Founder';
  const publicSlug = profile.slug || 'ezeji-patrick';
  const publicUrlText = `digitalcampux.com/founders/${publicSlug}`;

  // Top 3 published articles for the grid
  const recentPublished = publishedArticles.slice(0, 3);
  // Top 2 podcasts for the grid
  const recentPodcasts = podcasts.slice(0, 2);
  // Distractions active today
  const activeDistractions = distractions.filter(d => d.is_active_today).slice(0, 4);

  // Formatted date string for today's focus (e.g. "Tue, Mar 11, 2025")
  const todayDateDisplay = new Date().toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });

  return (
    <div className="space-y-6 sm:space-y-8 animate-fadeIn">
      
      {/* 1. TOP HEADER & WRITE ARTICLE CTA */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-emerald-50 text-emerald-800 text-[11px] font-bold tracking-wider uppercase border border-emerald-200/80">
            <span>FOUNDER DASHBOARD</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            {getGreeting()}, {firstName} 👋
          </h1>
          <p className="text-xs sm:text-sm text-slate-600">
            Your journey, ideas and daily progress — all in one place.
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

      {/* 2. HERO FOUNDER PROFILE CARD */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-7 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          
          {/* Left: Portrait + Info */}
          <div className="flex flex-col sm:flex-row items-start gap-5 sm:gap-6 flex-1">
            {profile.avatar_url ? (
              <img 
                src={profile.avatar_url} 
                alt={profile.full_name} 
                className="w-36 h-32 sm:w-44 sm:h-36 rounded-2xl object-cover shadow-2xs border border-slate-100 shrink-0"
              />
            ) : (
              <div className="w-36 h-32 sm:w-44 sm:h-36 rounded-2xl bg-emerald-900 text-emerald-100 flex items-center justify-center font-black text-4xl shrink-0">
                {profile.full_name.charAt(0)}
              </div>
            )}

            <div className="space-y-2.5 max-w-2xl">
              <div>
                <h2 className="text-2xl sm:text-[26px] font-black text-slate-900 tracking-tight leading-tight">
                  {profile.full_name}
                </h2>
                <p className="text-sm font-bold text-[#059669] mt-0.5">
                  {profile.headline || `Founder, ${profile.business_name || 'DSP Academy'}`}
                </p>
              </div>

              <p className="text-xs sm:text-[13px] text-slate-600 leading-relaxed">
                {profile.bio || "I'm a tech founder and community builder passionate about helping young Africans turn ideas into sustainable businesses through technology, skills and access to opportunities."}
              </p>

              {/* Status & Public Link Row */}
              <div className="flex flex-wrap items-center gap-3 pt-1">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/60">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span>Published</span>
                </span>

                <button
                  onClick={onOpenPublicProfile}
                  className="inline-flex items-center gap-1.5 text-xs text-slate-600 hover:text-emerald-700 font-medium transition cursor-pointer"
                  title="View Public Profile Link"
                >
                  <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
                  <span>{publicUrlText}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Right: Actions Stack */}
          <div className="flex flex-col gap-2.5 sm:w-48 shrink-0">
            <button
              onClick={onOpenPublicProfile}
              className="w-full inline-flex items-center justify-center gap-2 bg-[#0B3A2C] hover:bg-[#07261D] text-white font-bold text-xs py-2.5 px-4 rounded-xl shadow-2xs transition cursor-pointer"
            >
              <span>View Public Profile</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={onShareProfile}
              className="w-full inline-flex items-center justify-center gap-2 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-semibold text-xs py-2.5 px-4 rounded-xl transition cursor-pointer"
            >
              <Share2 className="w-3.5 h-3.5 text-slate-500" />
              <span>Share Profile</span>
            </button>

            <button
              onClick={onOpenEditProfile}
              className="w-full inline-flex items-center justify-center gap-2 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-semibold text-xs py-2.5 px-4 rounded-xl transition cursor-pointer"
            >
              <Edit3 className="w-3.5 h-3.5 text-slate-500" />
              <span>Edit Profile</span>
            </button>
          </div>

        </div>
      </div>

      {/* 3. FOUR SUMMARY METRICS CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        
        {/* Metric 1: Published Articles */}
        <div 
          onClick={() => onNavigate('founder-articles')}
          className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-2xs hover:border-emerald-300 transition cursor-pointer group"
        >
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0 group-hover:scale-105 transition">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <p className="text-2xl sm:text-3xl font-black text-slate-900 leading-none">
                {stats.publishedArticlesCount}
              </p>
              <p className="text-xs font-bold text-slate-800 mt-1">
                Published Articles
              </p>
              <p className="text-[11px] text-slate-500">
                Ideas and insights shared
              </p>
            </div>
          </div>
        </div>

        {/* Metric 2: Draft Articles */}
        <div 
          onClick={() => onNavigate('founder-articles')}
          className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-2xs hover:border-emerald-300 transition cursor-pointer group"
        >
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0 group-hover:scale-105 transition">
              <Edit3 className="w-5 h-5" />
            </div>
            <div>
              <p className="text-2xl sm:text-3xl font-black text-slate-900 leading-none">
                {stats.draftArticlesCount}
              </p>
              <p className="text-xs font-bold text-slate-800 mt-1">
                Draft Articles
              </p>
              <p className="text-[11px] text-slate-500">
                In progress
              </p>
            </div>
          </div>
        </div>

        {/* Metric 3: Podcast Sessions */}
        <div 
          onClick={() => onNavigate('founder-podcasts')}
          className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-2xs hover:border-emerald-300 transition cursor-pointer group"
        >
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0 group-hover:scale-105 transition">
              <PlaySquare className="w-5 h-5" />
            </div>
            <div>
              <p className="text-2xl sm:text-3xl font-black text-slate-900 leading-none">
                {stats.podcastsCount}
              </p>
              <p className="text-xs font-bold text-slate-800 mt-1">
                Podcast Sessions
              </p>
              <p className="text-[11px] text-slate-500">
                Conversations and features
              </p>
            </div>
          </div>
        </div>

        {/* Metric 4: Today's Progress */}
        <div 
          onClick={() => onNavigate('founder-planner')}
          className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-2xs hover:border-emerald-300 transition cursor-pointer group"
        >
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0 group-hover:scale-105 transition">
              <Target className="w-5 h-5" />
            </div>
            <div>
              <p className="text-2xl sm:text-3xl font-black text-slate-900 leading-none">
                {stats.todayProgressPercent}%
              </p>
              <p className="text-xs font-bold text-slate-800 mt-1">
                Today's Progress
              </p>
              <p className="text-[11px] text-slate-500">
                {stats.completedTasksCount} of {stats.totalTasksCount} tasks completed
              </p>
            </div>
          </div>
        </div>

      </div>

      {/* 4. MAIN WORKSPACE GRID: 8 COLS CENTER + 4 COLS RIGHT FOCUS */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-7 items-start">
        
        {/* CENTER COLUMN: PUBLISHED ARTICLES & PODCASTS (8 Cols) */}
        <div className="lg:col-span-8 space-y-6 sm:space-y-8">
          
          {/* Section: Your Published Articles */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-black text-slate-900 tracking-tight">
                Your Published Articles
              </h3>
              <button
                onClick={() => onNavigate('founder-articles')}
                className="text-xs font-bold text-[#059669] hover:text-emerald-800 flex items-center gap-1 transition cursor-pointer"
              >
                <span>View All Articles</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {recentPublished.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {recentPublished.map((article) => {
                  const formattedDate = article.published_at 
                    ? new Date(article.published_at).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric'
                      })
                    : 'Recently Published';

                  return (
                    <div
                      key={article.id}
                      className="bg-white rounded-2xl border border-slate-200/80 p-3 shadow-2xs hover:shadow-md hover:border-slate-300 transition flex flex-col justify-between group"
                    >
                      <div className="space-y-3">
                        {/* Cover Image */}
                        <div className="aspect-video w-full rounded-xl overflow-hidden relative bg-slate-100">
                          <img 
                            src={article.cover_image_url || 'https://images.unsplash.com/photo-1531403009284-440f080d1e12?auto=format&fit=crop&w=800&q=80'} 
                            alt={article.title} 
                            className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                          />
                          <span className="absolute top-2 right-2 bg-black/75 backdrop-blur-xs text-white text-[10px] font-bold px-2 py-0.5 rounded-md">
                            {article.reading_time_minutes} min read
                          </span>
                        </div>

                        {/* Title */}
                        <h4 
                          onClick={() => onReadArticle(article)}
                          className="font-bold text-xs sm:text-[13px] text-slate-900 group-hover:text-[#059669] line-clamp-2 leading-snug cursor-pointer transition"
                        >
                          {article.title}
                        </h4>

                        {/* Date */}
                        <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
                          <Calendar className="w-3 h-3" />
                          <span>{formattedDate}</span>
                        </div>
                      </div>

                      {/* Card Footer: Read + Share */}
                      <div className="flex items-center justify-between pt-3 mt-3 border-t border-slate-100">
                        <button
                          onClick={() => onReadArticle(article)}
                          className="text-xs font-bold text-[#059669] hover:underline flex items-center gap-1 cursor-pointer"
                        >
                          <span>Read Article</span>
                          <ArrowRight className="w-3 h-3" />
                        </button>

                        <button
                          onClick={() => onShareArticle(article)}
                          className="p-1 text-slate-400 hover:text-slate-700 rounded-md transition cursor-pointer"
                          title="Share Article"
                        >
                          <Share2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-8 text-center space-y-3">
                <FileText className="w-10 h-10 text-slate-400 mx-auto" />
                <h4 className="font-bold text-slate-800 text-sm">No Published Articles Yet</h4>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  Publish your first article to share insights with investors, customers, and fellow builders.
                </p>
                <button
                  onClick={onOpenWriteArticle}
                  className="bg-[#059669] text-white text-xs font-bold py-2 px-4 rounded-xl"
                >
                  Write Your First Article
                </button>
              </div>
            )}
          </div>

          {/* Section: Podcast Sessions */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-black text-slate-900 tracking-tight">
                Podcast Sessions
              </h3>
              <button
                onClick={() => onNavigate('founder-podcasts')}
                className="text-xs font-bold text-[#059669] hover:text-emerald-800 flex items-center gap-1 transition cursor-pointer"
              >
                <span>View All Podcasts</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {recentPodcasts.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {recentPodcasts.map((podcast) => {
                  const recordedDate = podcast.recorded_at 
                    ? new Date(podcast.recorded_at).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric'
                      })
                    : 'Recent Episode';

                  return (
                    <div
                      key={podcast.id}
                      className="bg-white rounded-2xl border border-slate-200/80 p-3.5 shadow-2xs hover:shadow-md hover:border-slate-300 transition flex flex-col justify-between group"
                    >
                      <div className="space-y-3">
                        {/* Video Thumbnail with Play Button Overlay */}
                        <div 
                          onClick={() => onPlayPodcast(podcast)}
                          className="aspect-video w-full rounded-xl overflow-hidden relative bg-slate-900 group/thumb cursor-pointer"
                        >
                          <img 
                            src={podcast.thumbnail_url || 'https://images.unsplash.com/photo-1590602847861-f357a9332bbc?auto=format&fit=crop&w=800&q=80'} 
                            alt={podcast.title} 
                            className="w-full h-full object-cover group-hover/thumb:scale-105 transition duration-300 opacity-90 group-hover/thumb:opacity-100"
                          />
                          
                          {/* Play Button Overlay */}
                          <div className="absolute inset-0 flex items-center justify-center">
                            <div className="w-11 h-11 rounded-full bg-white text-emerald-700 flex items-center justify-center shadow-lg group-hover/thumb:scale-110 transition">
                              <Play className="w-4 h-4 fill-emerald-700 ml-0.5" />
                            </div>
                          </div>

                          {/* Duration Pill */}
                          <span className="absolute bottom-2 right-2 bg-black/80 text-white text-[10px] font-bold px-2 py-0.5 rounded">
                            {podcast.duration_display}
                          </span>
                        </div>

                        {/* Title & Channel */}
                        <div>
                          <h4 
                            onClick={() => onPlayPodcast(podcast)}
                            className="font-bold text-xs sm:text-[13px] text-slate-900 group-hover:text-[#059669] line-clamp-2 leading-snug cursor-pointer transition"
                          >
                            {podcast.title}
                          </h4>
                          <p className="text-[11px] text-slate-500 mt-1">
                            {podcast.channel_name}
                          </p>
                        </div>
                      </div>

                      {/* Footer: Date + Share */}
                      <div className="flex items-center justify-between pt-3 mt-3 border-t border-slate-100">
                        <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
                          <Calendar className="w-3 h-3" />
                          <span>{recordedDate}</span>
                        </div>

                        <button
                          onClick={() => onSharePodcast(podcast)}
                          className="p-1 text-slate-400 hover:text-slate-700 rounded-md transition cursor-pointer"
                          title="Share Episode"
                        >
                          <Share2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-8 text-center space-y-3">
                <PlaySquare className="w-10 h-10 text-slate-400 mx-auto" />
                <h4 className="font-bold text-slate-800 text-sm">No Podcast Sessions Added</h4>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  Embed your YouTube or Vimeo founder interviews to showcase your story to the community.
                </p>
                <button
                  onClick={() => onNavigate('founder-podcasts')}
                  className="bg-[#059669] text-white text-xs font-bold py-2 px-4 rounded-xl"
                >
                  Add Podcast Session
                </button>
              </div>
            )}
          </div>

        </div>

        {/* RIGHT PRODUCTIVITY / FOCUS COLUMN (4 Cols) */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Card 1: Today's Focus */}
          <div className="bg-white rounded-3xl border border-slate-200/80 p-5 shadow-xs space-y-4">
            
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Target className="w-4 h-4 text-emerald-600" />
                <h3 className="font-bold text-sm text-slate-900">Today's Focus</h3>
              </div>
              <span className="text-[11px] text-slate-400 font-medium">
                {todayDateDisplay}
              </span>
            </div>

            {/* Daily Goal Block */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-700">
                  Daily Goal
                </span>
                <span className="text-lg font-black text-emerald-600 leading-none">
                  {stats.todayProgressPercent}%
                </span>
              </div>
              
              <p className="text-xs text-slate-600 leading-relaxed font-normal">
                {dailyGoal.title}
              </p>
            </div>

            {/* Progress Bar */}
            <div className="space-y-1.5">
              <div className="w-full h-2.5 rounded-full bg-emerald-100 overflow-hidden">
                <div 
                  className="h-full bg-emerald-600 rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(stats.todayProgressPercent, 100)}%` }}
                />
              </div>

              <div className="flex items-center justify-between text-[11px] text-slate-500 pt-0.5">
                <span>{stats.completedTasksCount} of {stats.totalTasksCount} tasks completed</span>
                <span>Daily benchmark: {dailyGoal.benchmark_percent}%</span>
              </div>
            </div>

            {/* Go to Planner CTA */}
            <button
              onClick={() => onNavigate('founder-planner')}
              className="w-full inline-flex items-center justify-center gap-2 bg-emerald-100/70 hover:bg-emerald-200 text-emerald-900 font-bold text-xs py-2.5 px-4 rounded-xl transition cursor-pointer"
            >
              <Calendar className="w-3.5 h-3.5 text-emerald-700" />
              <span>Go to Planner</span>
            </button>
          </div>

          {/* Card 2: Distractions to Avoid Today */}
          <div className="bg-white rounded-3xl border border-slate-200/80 p-5 shadow-xs space-y-4">
            
            {/* Header */}
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
              <Shield className="w-4 h-4 text-emerald-600" />
              <h3 className="font-bold text-sm text-slate-900">Distractions to Avoid Today</h3>
            </div>

            {/* Distraction Capsule Pills */}
            <div className="space-y-2">
              {activeDistractions.length > 0 ? (
                activeDistractions.map((dist) => (
                  <div
                    key={dist.id}
                    className="p-2.5 rounded-xl bg-slate-50 border border-slate-100/80 text-xs font-semibold text-slate-800 flex items-center gap-2.5"
                  >
                    <span className="text-base select-none shrink-0">{dist.icon}</span>
                    <span className="truncate">{dist.name}</span>
                  </div>
                ))
              ) : (
                <p className="text-xs text-slate-400 italic py-2">
                  No distractions flagged for today. Keep building with clarity!
                </p>
              )}
            </div>

            {/* Manage Distractions Link */}
            <button
              onClick={() => onNavigate('founder-distractions')}
              className="w-full text-xs font-bold text-[#059669] hover:underline flex items-center justify-center gap-1 transition cursor-pointer pt-1"
            >
              <span>Manage Distractions</span>
              <ArrowRight className="w-3 h-3" />
            </button>

          </div>

        </div>

      </div>

    </div>
  );
};
