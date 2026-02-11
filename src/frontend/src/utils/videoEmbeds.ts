// Video embed utilities with strict allowlist for YouTube and Vimeo

export interface VideoEmbedDescriptor {
  provider: 'youtube' | 'vimeo';
  embedUrl: string;
  videoId: string;
}

/**
 * Detects if a URL is a supported video provider (YouTube or Vimeo)
 * Returns null if not a supported video URL
 */
export function detectVideoEmbed(url: string): VideoEmbedDescriptor | null {
  try {
    const urlObj = new URL(url);
    
    // YouTube detection
    if (
      urlObj.hostname === 'www.youtube.com' ||
      urlObj.hostname === 'youtube.com' ||
      urlObj.hostname === 'youtu.be' ||
      urlObj.hostname === 'm.youtube.com'
    ) {
      let videoId: string | null = null;

      // Standard youtube.com/watch?v=VIDEO_ID
      if (urlObj.pathname === '/watch') {
        videoId = urlObj.searchParams.get('v');
      }
      // Short youtu.be/VIDEO_ID
      else if (urlObj.hostname === 'youtu.be') {
        videoId = urlObj.pathname.slice(1);
      }
      // Embed format youtube.com/embed/VIDEO_ID
      else if (urlObj.pathname.startsWith('/embed/')) {
        videoId = urlObj.pathname.split('/')[2];
      }

      if (videoId) {
        return {
          provider: 'youtube',
          embedUrl: `https://www.youtube.com/embed/${videoId}`,
          videoId,
        };
      }
    }

    // Vimeo detection
    if (
      urlObj.hostname === 'vimeo.com' ||
      urlObj.hostname === 'www.vimeo.com' ||
      urlObj.hostname === 'player.vimeo.com'
    ) {
      let videoId: string | null = null;

      // Standard vimeo.com/VIDEO_ID
      const pathMatch = urlObj.pathname.match(/^\/(\d+)/);
      if (pathMatch) {
        videoId = pathMatch[1];
      }
      // Player format player.vimeo.com/video/VIDEO_ID
      else if (urlObj.pathname.startsWith('/video/')) {
        videoId = urlObj.pathname.split('/')[2];
      }

      if (videoId) {
        return {
          provider: 'vimeo',
          embedUrl: `https://player.vimeo.com/video/${videoId}`,
          videoId,
        };
      }
    }

    return null;
  } catch {
    // Invalid URL
    return null;
  }
}
