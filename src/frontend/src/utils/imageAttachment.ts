/**
 * Utility functions for handling image attachments in posts and profiles
 */

export const MAX_IMAGE_SIZE_BYTES = 2 * 1024 * 1024; // 2MB limit
export const ACCEPTED_IMAGE_TYPES = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'];

export interface ImageFileData {
  bytes: Uint8Array;
  contentType: string;
  fileName: string;
  size: number;
}

/**
 * Convert a File object to Uint8Array with content type
 */
export async function fileToImageData(file: File): Promise<ImageFileData> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = () => {
      const arrayBuffer = reader.result as ArrayBuffer;
      const bytes = new Uint8Array(arrayBuffer);
      
      resolve({
        bytes,
        contentType: file.type,
        fileName: file.name,
        size: file.size,
      });
    };
    
    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };
    
    reader.readAsArrayBuffer(file);
  });
}

/**
 * Validate image file type
 */
export function isValidImageType(file: File): boolean {
  return ACCEPTED_IMAGE_TYPES.includes(file.type);
}

/**
 * Validate image file size
 */
export function isValidImageSize(file: File): boolean {
  return file.size <= MAX_IMAGE_SIZE_BYTES;
}

/**
 * Validate multiple image files
 */
export function validateImageFiles(files: File[]): { valid: boolean; error?: string } {
  for (const file of files) {
    if (!isValidImageType(file)) {
      return { valid: false, error: `${file.name} is not a supported image type. Please use PNG, JPEG, or WebP.` };
    }
    if (!isValidImageSize(file)) {
      return { valid: false, error: `${file.name} is too large. Maximum size is ${formatFileSize(MAX_IMAGE_SIZE_BYTES)}.` };
    }
  }
  return { valid: true };
}

/**
 * Format file size for display
 */
export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

/**
 * Get accepted image types as a string for input accept attribute
 */
export function getAcceptedImageTypesString(): string {
  return ACCEPTED_IMAGE_TYPES.join(',');
}
