import { useEffect, useState } from 'react';

interface PostImageAttachmentProps {
  image?: { bytes: number[]; contentType: string } | null;
}

export function PostImageAttachment({ image }: PostImageAttachmentProps) {
  const [imageUrl, setImageUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!image) {
      setImageUrl(null);
      return;
    }

    // Convert bytes array to Uint8Array and then to Blob
    const uint8Array = new Uint8Array(image.bytes);
    const blob = new Blob([uint8Array], { type: image.contentType });
    const url = URL.createObjectURL(blob);
    setImageUrl(url);

    // Cleanup on unmount
    return () => {
      URL.revokeObjectURL(url);
    };
  }, [image]);

  if (!image || !imageUrl) {
    return null;
  }

  return (
    <div className="w-full overflow-hidden rounded-lg">
      <img
        src={imageUrl}
        alt="Post attachment"
        className="h-auto w-full rounded-lg object-cover"
      />
    </div>
  );
}
