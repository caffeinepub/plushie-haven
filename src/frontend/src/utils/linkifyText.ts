// Safe URL detection and text splitting utility
// Returns an array of text, URL, and video embed tokens for safe rendering

import { detectVideoEmbed, VideoEmbedDescriptor } from './videoEmbeds';

export type TextToken = {
  type: 'text';
  content: string;
};

export type LinkToken = {
  type: 'link';
  content: string;
  href: string;
};

export type VideoToken = {
  type: 'video';
  content: string;
  href: string;
  embed: VideoEmbedDescriptor;
};

export type Token = TextToken | LinkToken | VideoToken;

// Conservative URL regex that matches common URL patterns
// Matches http://, https://, and www. prefixes
const URL_REGEX = /(https?:\/\/[^\s]+|www\.[^\s]+)/gi;

// Characters that should not be included at the end of a URL
const TRAILING_PUNCTUATION = /[.,;:!?)\]}>'"]+$/;

/**
 * Normalizes a URL by adding https:// if missing
 */
function normalizeUrl(url: string): string {
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }
  if (url.startsWith('www.')) {
    return `https://${url}`;
  }
  return url;
}

/**
 * Cleans trailing punctuation from URLs
 */
function cleanUrl(url: string): string {
  const match = url.match(TRAILING_PUNCTUATION);
  if (match) {
    return url.slice(0, -match[0].length);
  }
  return url;
}

/**
 * Splits text into an array of text, link, and video tokens
 * Does not generate HTML - returns structured data for safe rendering
 */
export function linkifyText(text: string): Token[] {
  if (!text) return [];

  const tokens: Token[] = [];
  let lastIndex = 0;

  // Find all URL matches
  const matches = Array.from(text.matchAll(URL_REGEX));

  matches.forEach((match) => {
    const rawUrl = match[0];
    const matchIndex = match.index!;

    // Add text before the URL
    if (matchIndex > lastIndex) {
      tokens.push({
        type: 'text',
        content: text.slice(lastIndex, matchIndex),
      });
    }

    // Clean and normalize the URL
    const cleanedUrl = cleanUrl(rawUrl);
    const href = normalizeUrl(cleanedUrl);

    // Check if this is a video embed
    const videoEmbed = detectVideoEmbed(href);

    if (videoEmbed) {
      tokens.push({
        type: 'video',
        content: cleanedUrl,
        href,
        embed: videoEmbed,
      });
    } else {
      tokens.push({
        type: 'link',
        content: cleanedUrl,
        href,
      });
    }

    lastIndex = matchIndex + rawUrl.length;
  });

  // Add remaining text after the last URL
  if (lastIndex < text.length) {
    tokens.push({
      type: 'text',
      content: text.slice(lastIndex),
    });
  }

  return tokens;
}
