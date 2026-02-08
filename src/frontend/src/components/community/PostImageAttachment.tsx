import { useEffect, useState } from 'react';
import type { ImageAttachment } from '../../backend';

interface PostImageAttachmentProps {
  image?: ImageAttachment;
  alt?: string;
}

/**
 * Component to display an optional post image attachment
 * Converts bytes to Blob URL and handles cleanup
 */
export function PostImageAttachment({ image, alt = 'Post attachment' }: PostImageAttachmentProps) {
  const [imageUrl, setImageUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!image) {
      setImageUrl(null);
      return;
    }

    // Convert Uint8Array to Blob URL for display
    // Create a new Uint8Array to ensure proper ArrayBuffer type
    const bytes = new Uint8Array(image.bytes);
    const blob = new Blob([bytes], { type: image.contentType });
    const url = URL.createObjectURL(blob);
    setImageUrl(url);

    // Cleanup: revoke the object URL when component unmounts or image changes
    return () => {
      URL.revokeObjectURL(url);
    };
  }, [image]);

  if (!image || !imageUrl) {
    return null;
  }

  return (
    <div className="mt-4 overflow-hidden rounded-lg border-2 border-border">
      <img
        src={imageUrl}
        alt={alt}
        className="h-auto w-full object-contain"
        style={{ maxHeight: '400px' }}
      />
    </div>
  );
}
