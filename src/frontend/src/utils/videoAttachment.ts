// Video attachment validation utilities

export const ACCEPTED_VIDEO_TYPES = [
  'video/mp4',
  'video/webm',
  'video/ogg',
  'video/quicktime', // .mov files
];

// 100 MB limit for videos
export const MAX_VIDEO_SIZE_BYTES = 100 * 1024 * 1024;

/**
 * Format bytes to human-readable file size
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}

/**
 * Validate a video file for upload
 */
export function validateVideoFile(file: File): { valid: boolean; error?: string } {
  if (!ACCEPTED_VIDEO_TYPES.includes(file.type)) {
    return { 
      valid: false, 
      error: 'Please use MP4, WebM, OGG, or MOV video files only.' 
    };
  }
  if (file.size > MAX_VIDEO_SIZE_BYTES) {
    return { 
      valid: false, 
      error: `Video is too large. Maximum size is ${formatFileSize(MAX_VIDEO_SIZE_BYTES)}.` 
    };
  }
  return { valid: true };
}
