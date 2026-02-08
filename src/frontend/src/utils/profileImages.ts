import { ExternalBlob } from '../backend';

/**
 * Convert a File to Uint8Array
 */
export async function fileToBytes(file: File): Promise<Uint8Array> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = () => {
      const arrayBuffer = reader.result as ArrayBuffer;
      const bytes = new Uint8Array(arrayBuffer);
      resolve(bytes);
    };
    
    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };
    
    reader.readAsArrayBuffer(file);
  });
}

/**
 * Convert a File to ExternalBlob for profile images
 */
export async function fileToExternalBlob(file: File): Promise<ExternalBlob> {
  const bytes = await fileToBytes(file);
  // Cast to the expected type to satisfy TypeScript
  return ExternalBlob.fromBytes(bytes as Uint8Array<ArrayBuffer>);
}

/**
 * Create a safe preview URL for a local file
 */
export function createFilePreviewURL(file: File): string {
  return URL.createObjectURL(file);
}

/**
 * Revoke a preview URL to free memory
 */
export function revokeFilePreviewURL(url: string): void {
  URL.revokeObjectURL(url);
}

/**
 * Get direct URL from ExternalBlob for display
 */
export function getBlobDirectURL(blob: ExternalBlob): string {
  return blob.getDirectURL();
}
