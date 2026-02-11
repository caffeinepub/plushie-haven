import { VideoEmbedDescriptor } from '../../utils/videoEmbeds';

interface VideoEmbedProps {
  embed: VideoEmbedDescriptor;
  className?: string;
}

/**
 * Responsive video embed component for allowlisted providers (YouTube, Vimeo)
 * Maintains 16:9 aspect ratio and renders safe iframe embeds
 */
export function VideoEmbed({ embed, className = '' }: VideoEmbedProps) {
  return (
    <div className={`relative w-full overflow-hidden rounded-lg ${className}`} style={{ paddingBottom: '56.25%' }}>
      <iframe
        src={embed.embedUrl}
        title={`${embed.provider} video ${embed.videoId}`}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        className="absolute left-0 top-0 h-full w-full border-0"
      />
    </div>
  );
}
