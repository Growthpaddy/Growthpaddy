import React, { useState } from 'react';
import { 
  PlaySquare, 
  Plus, 
  Play, 
  Calendar, 
  Trash2, 
  Share2, 
  ExternalLink,
  Video,
  Clock
} from 'lucide-react';
import { FounderPodcast } from '../../types';

interface FounderPodcastsViewProps {
  podcasts: FounderPodcast[];
  onOpenAddPodcast: () => void;
  onPlayPodcast: (podcast: FounderPodcast) => void;
  onDeletePodcast: (id: string) => void;
  onSharePodcast: (podcast: FounderPodcast) => void;
}

export const FounderPodcastsView: React.FC<FounderPodcastsViewProps> = ({
  podcasts,
  onOpenAddPodcast,
  onPlayPodcast,
  onDeletePodcast,
  onSharePodcast
}) => {
  return (
    <div className="space-y-6 sm:space-y-8 animate-fadeIn">
      
      {/* HEADER & TOP ACTIONS */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Founder Stories &amp; Podcast Sessions
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-1">
            Embed YouTube &amp; Vimeo founder interviews, talks, and community sessions directly to your profile.
          </p>
        </div>

        <button
          onClick={onOpenAddPodcast}
          className="self-start sm:self-auto inline-flex items-center gap-2 bg-[#059669] hover:bg-[#047857] text-white font-bold text-xs sm:text-sm px-5 py-2.5 rounded-xl shadow-xs transition active:scale-[0.98] cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Add Podcast Episode</span>
        </button>
      </div>

      {/* PODCASTS GRID */}
      {podcasts.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {podcasts.map((podcast) => {
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
                className="bg-white rounded-3xl border border-slate-200/80 p-4 shadow-2xs hover:shadow-md hover:border-slate-300 transition flex flex-col justify-between group"
              >
                <div className="space-y-3.5">
                  {/* Video Thumbnail with Play Button */}
                  <div 
                    onClick={() => onPlayPodcast(podcast)}
                    className="aspect-video w-full rounded-2xl overflow-hidden relative bg-slate-950 group/thumb cursor-pointer"
                  >
                    <img 
                      src={podcast.thumbnail_url || 'https://images.unsplash.com/photo-1590602847861-f357a9332bbc?auto=format&fit=crop&w=800&q=80'} 
                      alt={podcast.title} 
                      className="w-full h-full object-cover group-hover/thumb:scale-105 transition duration-300 opacity-90 group-hover/thumb:opacity-100"
                    />

                    {/* Centered Play Button */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-12 h-12 rounded-full bg-white text-emerald-700 flex items-center justify-center shadow-xl group-hover/thumb:scale-110 transition">
                        <Play className="w-5 h-5 fill-emerald-700 ml-0.5" />
                      </div>
                    </div>

                    {/* Duration badge */}
                    <span className="absolute bottom-2.5 right-2.5 bg-black/85 backdrop-blur-xs text-white text-[10px] font-bold px-2 py-0.5 rounded">
                      {podcast.duration_display}
                    </span>
                  </div>

                  {/* Title & Channel */}
                  <div className="space-y-1">
                    <h3 
                      onClick={() => onPlayPodcast(podcast)}
                      className="font-bold text-sm sm:text-base text-slate-900 group-hover:text-[#059669] line-clamp-2 leading-snug cursor-pointer transition"
                    >
                      {podcast.title}
                    </h3>
                    <p className="text-xs font-medium text-emerald-700">
                      {podcast.channel_name}
                    </p>
                  </div>
                </div>

                {/* Footer Metadata & Actions */}
                <div className="flex items-center justify-between pt-3 mt-4 border-t border-slate-100">
                  <div className="flex items-center gap-1.5 text-xs text-slate-400">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>{recordedDate}</span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => onSharePodcast(podcast)}
                      className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition cursor-pointer"
                      title="Share Podcast"
                    >
                      <Share2 className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => {
                        if (window.confirm(`Are you sure you want to delete "${podcast.title}"?`)) {
                          onDeletePodcast(podcast.id);
                        }
                      }}
                      className="p-1.5 text-slate-400 hover:text-red-700 hover:bg-red-50 rounded-lg transition cursor-pointer"
                      title="Delete Podcast"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-dashed border-slate-300 p-12 text-center space-y-4">
          <PlaySquare className="w-12 h-12 text-slate-400 mx-auto" />
          <h3 className="font-bold text-slate-800 text-base">No Podcast Episodes Added</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Feature your YouTube or Vimeo appearances and let investors, recruits, and customers hear your founder journey.
          </p>
          <button
            onClick={onOpenAddPodcast}
            className="inline-flex items-center gap-2 bg-[#059669] hover:bg-[#047857] text-white font-bold text-xs py-2.5 px-5 rounded-xl shadow-xs transition cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Podcast Episode</span>
          </button>
        </div>
      )}

    </div>
  );
};
