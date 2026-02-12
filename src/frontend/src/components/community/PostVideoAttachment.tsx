import { ExternalBlob } from '../../backend';
import { useEffect, useState } from 'react';

interface PostVideoAttachmentProps {
  video?: ExternalBlob | null;
}

export function PostVideoAttachment({ video }: PostVideoAttachmentProps) {
  const [videoUrl, setVideoUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!video) {
      setVideoUrl(null);
      return;
    }

    // Use direct URL for streaming and caching
    const url = video.getDirectURL();
    setVideoUrl(url);
  }, [video]);

  if (!video || !videoUrl) {
    return null;
  }

  return (
    <div className="w-full overflow-hidden rounded-lg">
      <video
        controls
        className="h-auto w-full rounded-lg"
        preload="metadata"
      >
        <source src={videoUrl} type="video/mp4" />
        <source src={videoUrl} type="video/webm" />
        <source src={videoUrl} type="video/ogg" />
        Your browser does not support the video tag.
      </video>
    </div>
  );
}
