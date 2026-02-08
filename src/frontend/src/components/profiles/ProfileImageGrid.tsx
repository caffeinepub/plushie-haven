import type { ExternalBlob } from '../../backend';

interface ProfileImageGridProps {
  images: ExternalBlob[];
}

export function ProfileImageGrid({ images }: ProfileImageGridProps) {
  if (!images || images.length === 0) {
    return null;
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
      {images.map((image, index) => {
        const imageUrl = image.getDirectURL();
        return (
          <div
            key={index}
            className="aspect-square overflow-hidden rounded-lg border-2 hover:shadow-gentle transition-shadow"
          >
            <img
              src={imageUrl}
              alt={`Plushie ${index + 1}`}
              className="h-full w-full object-cover"
            />
          </div>
        );
      })}
    </div>
  );
}
