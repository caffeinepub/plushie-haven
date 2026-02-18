import type { ExternalBlob } from '../../backend';

interface PostImageAttachmentProps {
  image?: ExternalBlob | null;
}

export function PostImageAttachment({ image }: PostImageAttachmentProps) {
  if (!image) {
    return null;
  }

  // Use ExternalBlob's direct URL for streaming and caching
  const imageUrl = image.getDirectURL();

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
