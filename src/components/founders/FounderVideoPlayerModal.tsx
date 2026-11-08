import React from 'react';
import { X, ExternalLink, Share2, Calendar, Tv } from 'lucide-react';
import { FounderPodcast } from '../../types';

interface FounderVideoPlayerModalProps {
  podcast: FounderPodcast | null;
  isOpen: boolean;
  onClose: () => void;
  onShare: (podcast: FounderPodcast) => void;
}

export const FounderVideoPlayerModal: React.FC<FounderVideoPlayerModalProps> = ({
  podcast,
  isOpen,
  onClose,
  onShare
}) => {
  if (!isOpen || !podcast) return null;

  // Derive embed URL if not directly provided
  let embedUrl = podcast.embed_url;
  if (!embedUrl) {
    const ytMatch = podcast.video_url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/);
    if (ytMatch && ytMatch[1]) {
      embedUrl = `https://www.youtube.com/embed/${ytMatch[1]}?autoplay=1`;
    } else {
      embedUrl = podcast.video_url;
    }
  } else if (!embedUrl.includes('autoplay=')) {
    embedUrl = `${embedUrl}${embedUrl.includes('?') ? '&' : '?'}autoplay=1`;
  }

  return (
    <div className="fixed inset-0 bg-black/85 z-50 flex items-center justify-center p-3 sm:p-6 backdrop-blur-md animate-fadeIn">
      <div className="bg-slate-900 text-white rounded-3xl max-w-4xl w-full overflow-hidden shadow-2xl relative border border-slate-800">
        
        {/* Top Header */}
        <div className="px-5 py-4 bg-slate-950/80 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Tv className="w-4 h-4 text-emerald-400" />
            <span className="text-xs font-bold text-slate-300">
              {podcast.channel_name}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onShare(podcast)}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg transition"
              title="Share Episode"
            >
              <Share2 className="w-4 h-4" />
            </button>
            <a
              href={podcast.video_url}
              target="_blank"
              rel="noopener noreferrer"
              className="p-1.5 text-slate-400 hover:text-white rounded-lg transition"
              title="Open on YouTube"
            >
              <ExternalLink className="w-4 h-4" />
            </a>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Responsive Video Container */}
        <div className="aspect-video w-full bg-black relative">
          <iframe
            src={embedUrl}
            title={podcast.title}
            className="w-full h-full border-0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
          />
        </div>

        {/* Video Info Footer */}
        <div className="p-5 space-y-2 bg-slate-950">
          <h2 className="text-base sm:text-lg font-bold text-white leading-snug">
            {podcast.title}
          </h2>
          {(podcast.duration_display || podcast.recorded_at) ? (
            <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400">
              {podcast.duration_display ? <span>Duration: {podcast.duration_display}</span> : null}
              {podcast.recorded_at ? <span>Recorded: {new Date(podcast.recorded_at).toLocaleDateString()}</span> : null}
            </div>
          ) : null}
        </div>

      </div>
    </div>
  );
};
