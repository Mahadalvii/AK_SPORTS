import React from 'react';
import { getSafeVideoEmbed } from '../lib/adminApi';
import { VideoOff } from 'lucide-react';

interface SafeVideoPlayerProps {
  url?: string | null;
  title?: string;
  className?: string;
}

/**
 * Security Rule 2:
 * Render videos only through a safe embed or <video src>.
 * Never put video_url into an href, innerHTML, or dangerouslySetInnerHTML.
 * Sandbox permissions restrict frames strictly.
 */
export const SafeVideoPlayer: React.FC<SafeVideoPlayerProps> = ({
  url,
  title = 'Product Demonstration Video',
  className = 'w-full aspect-video rounded-xl overflow-hidden bg-black',
}) => {
  if (!url || !url.trim()) return null;

  const embed = getSafeVideoEmbed(url);

  if (embed.type === 'direct' && embed.directSrc) {
    return (
      <div className={className}>
        <video
          src={embed.directSrc}
          controls
          preload="metadata"
          className="w-full h-full object-contain"
        >
          Your browser does not support the video tag.
        </video>
      </div>
    );
  }

  if (embed.type === 'youtube' && embed.embedUrl) {
    return (
      <div className={className}>
        <iframe
          src={embed.embedUrl}
          title={title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          sandbox="allow-scripts allow-same-origin allow-presentation"
          className="w-full h-full border-0"
        />
      </div>
    );
  }

  if (embed.type === 'instagram' && embed.embedUrl) {
    return (
      <div className={className}>
        <iframe
          src={embed.embedUrl}
          title={title}
          allowFullScreen
          sandbox="allow-scripts allow-same-origin"
          className="w-full h-full border-0"
        />
      </div>
    );
  }

  return (
    <div className="p-3 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-zinc-400 flex items-center gap-2">
      <VideoOff className="w-4 h-4 text-zinc-500 shrink-0" />
      <span>Safe preview unavailable: URL must be a valid HTTPS link on YouTube, Instagram, or an MP4 from your Supabase storage.</span>
    </div>
  );
};
