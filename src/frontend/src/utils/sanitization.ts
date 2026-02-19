/**
 * Sanitization utilities for user input.
 */

/**
 * Strips all HTML tags from text.
 */
export function stripHtml(text: string): string {
  // Create a temporary div to leverage browser's HTML parsing
  const temp = document.createElement('div');
  temp.innerHTML = text;
  return temp.textContent || temp.innerText || '';
}

/**
 * Escapes HTML special characters.
 */
export function escapeHtml(text: string): string {
  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;',
  };
  return text.replace(/[&<>"']/g, char => map[char]);
}

/**
 * Sanitizes URLs to prevent javascript: and data: protocols.
 */
export function sanitizeUrl(url: string): string {
  const trimmed = url.trim();
  
  if (!trimmed) return '';
  
  try {
    const urlObj = new URL(trimmed);
    
    // Only allow http and https
    if (['http:', 'https:'].includes(urlObj.protocol)) {
      return urlObj.toString();
    }
    
    return '';
  } catch {
    // If URL parsing fails, try to prepend https://
    if (!trimmed.includes('://')) {
      try {
        const urlObj = new URL('https://' + trimmed);
        return urlObj.toString();
      } catch {
        return '';
      }
    }
    return '';
  }
}

/**
 * Normalizes whitespace in text.
 */
export function normalizeWhitespace(text: string): string {
  return text
    .replace(/\r\n/g, '\n') // Normalize line endings
    .replace(/\r/g, '\n')
    .replace(/\t/g, '  ') // Convert tabs to spaces
    .trim();
}

/**
 * Sanitizes text for safe display (removes dangerous content, normalizes whitespace).
 */
export function sanitizeText(text: string, maxLength?: number): string {
  let sanitized = stripHtml(text);
  sanitized = normalizeWhitespace(sanitized);
  
  if (maxLength && sanitized.length > maxLength) {
    sanitized = sanitized.substring(0, maxLength);
  }
  
  return sanitized;
}
