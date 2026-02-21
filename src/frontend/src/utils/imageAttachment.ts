// Image validation utilities for profile images and plushie uploads

export const ACCEPTED_IMAGE_TYPES = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'];
export const MAX_IMAGE_SIZE_BYTES = 2 * 1024 * 1024; // 2MB

export function isValidImageType(file: File): boolean {
  return ACCEPTED_IMAGE_TYPES.includes(file.type);
}

export function isValidImageSize(file: File): boolean {
  return file.size <= MAX_IMAGE_SIZE_BYTES;
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function getAcceptedImageTypesString(): string {
  return ACCEPTED_IMAGE_TYPES.join(',');
}

export interface ImageValidationResult {
  valid: boolean;
  error?: string;
}

export function validateImageFile(file: File): ImageValidationResult {
  if (!isValidImageType(file)) {
    return {
      valid: false,
      error: 'Please select a PNG, JPEG, or WebP image.',
    };
  }

  if (!isValidImageSize(file)) {
    return {
      valid: false,
      error: `Image must be smaller than ${formatFileSize(MAX_IMAGE_SIZE_BYTES)}.`,
    };
  }

  return { valid: true };
}

export function validateImageFiles(files: File[]): ImageValidationResult {
  for (const file of files) {
    const result = validateImageFile(file);
    if (!result.valid) {
      return result;
    }
  }
  return { valid: true };
}
