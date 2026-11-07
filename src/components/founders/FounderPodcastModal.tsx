import React, { useState } from 'react';
import { X, PlaySquare, Video, Clock, Calendar, Plus } from 'lucide-react';
import { FounderPodcast } from '../../types';

interface FounderPodcastModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: {
    title: string;
    channel_name: string;
    video_url: string;
    duration_display?: string;
    thumbnail_url?: string;
    recorded_at?: string;
  }) => Promise<void>;
}

export const FounderPodcastModal: React.FC<FounderPodcastModalProps> = ({
  isOpen,
  onClose,
  onSave
}) => {
  const [title, setTitle] = useState('');
  const [channelName, setChannelName] = useState('Ezeji Patrick Channel');
  const [videoUrl, setVideoUrl] = useState('');
  const [duration, setDuration] = useState('45:00');
  const [thumbnailUrl, setThumbnailUrl] = useState('');
  const [recordedAt, setRecordedAt] = useState(new Date().toISOString().split('T')[0]);
  const [isSaving, setIsSaving] = useState(false);

  if (!isOpen) return null;

  const handleUrlBlur = () => {
    // Auto-detect YouTube thumbnail if user didn't specify one
    if (videoUrl && !thumbnailUrl) {
      const ytMatch = videoUrl.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/);
      if (ytMatch && ytMatch[1]) {
        setThumbnailUrl(`https://img.youtube.com/vi/${ytMatch[1]}/hqdefault.jpg`);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !videoUrl.trim()) return;
    setIsSaving(true);
    try {
      await onSave({
        title: title.trim(),
        channel_name: channelName.trim() || 'Digital Campux Stories',
        video_url: videoUrl.trim(),
        duration_display: duration.trim() || '40:00',
        thumbnail_url: thumbnailUrl.trim() || 'https://images.unsplash.com/photo-1590602847861-f357a9332bbc?auto=format&fit=crop&w=800&q=80',
        recorded_at: recordedAt
      });
      onClose();
    } catch (e) {
      console.error('Error saving podcast:', e);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-3 sm:p-5 backdrop-blur-xs animate-fadeIn">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-6 shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-slate-700 w-8 h-8 rounded-full hover:bg-slate-100 flex items-center justify-center transition"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="border-b border-slate-100 pb-3">
          <h3 className="text-xl font-black text-slate-900">
            Add Podcast / Video Session
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Embed an interview, podcast episode, or talk from YouTube or Vimeo.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div className="space-y-1">
            <label className="font-bold text-slate-700">Episode / Video Title</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. The Founder's Journey: From Idea to Impact"
              className="w-full border border-slate-300 rounded-xl px-3.5 py-2.5 text-slate-900 font-semibold focus:outline-none focus:border-emerald-500 bg-slate-50/50 focus:bg-white"
            />
          </div>

          <div className="space-y-1">
            <label className="font-bold text-slate-700">YouTube or Vimeo Video Link</label>
            <input
              type="url"
              required
              value={videoUrl}
              onChange={(e) => setVideoUrl(e.target.value)}
              onBlur={handleUrlBlur}
              placeholder="https://www.youtube.com/watch?v=DrpZwdPNnIY"
              className="w-full border border-slate-300 rounded-xl px-3.5 py-2.5 text-slate-800 focus:outline-none focus:border-emerald-500 bg-slate-50/50 focus:bg-white"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="font-bold text-slate-700">Channel / Show Name</label>
              <input
                type="text"
                value={channelName}
                onChange={(e) => setChannelName(e.target.value)}
                placeholder="Ezeji Patrick Channel"
                className="w-full border border-slate-300 rounded-xl px-3.5 py-2 text-slate-800 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div className="space-y-1">
              <label className="font-bold text-slate-700">Duration (e.g. 45:20)</label>
              <input
                type="text"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                placeholder="45:20"
                className="w-full border border-slate-300 rounded-xl px-3.5 py-2 text-slate-800 focus:outline-none focus:border-emerald-500 text-center font-bold"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="font-bold text-slate-700">Recorded Date</label>
              <input
                type="date"
                value={recordedAt}
                onChange={(e) => setRecordedAt(e.target.value)}
                className="w-full border border-slate-300 rounded-xl px-3 py-2 text-slate-800 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div className="space-y-1">
              <label className="font-bold text-slate-700">Thumbnail URL (Optional)</label>
              <input
                type="text"
                value={thumbnailUrl}
                onChange={(e) => setThumbnailUrl(e.target.value)}
                placeholder="Auto-extracted if blank"
                className="w-full border border-slate-300 rounded-xl px-3 py-2 text-slate-800 focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-slate-600 hover:text-slate-900 font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="bg-[#059669] hover:bg-emerald-700 text-white font-bold px-5 py-2.5 rounded-xl shadow-xs transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              <Plus className="w-4 h-4" />
              <span>{isSaving ? 'Adding...' : 'Add Podcast'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
