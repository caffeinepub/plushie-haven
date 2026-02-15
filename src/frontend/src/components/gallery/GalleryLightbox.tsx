import { useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { X, ChevronLeft, ChevronRight, Heart } from 'lucide-react';
import type { UnifiedGalleryItem } from '@/utils/galleryMedia';

interface GalleryLightboxProps {
  item: UnifiedGalleryItem;
  onClose: () => void;
  onPrevious: () => void;
  onNext: () => void;
  hasPrevious: boolean;
  hasNext: boolean;
  currentIndex: number;
  totalCount: number;
  isFavorite: boolean;
  onToggleFavorite: () => void;
}

export function GalleryLightbox({
  item,
  onClose,
  onPrevious,
  onNext,
  hasPrevious,
  hasNext,
  currentIndex,
  totalCount,
  isFavorite,
  onToggleFavorite,
}: GalleryLightboxProps) {
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    // Focus the close button when lightbox opens
    closeButtonRef.current?.focus();

    // Handle keyboard navigation
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowLeft' && hasPrevious) {
        onPrevious();
      } else if (e.key === 'ArrowRight' && hasNext) {
        onNext();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose, onPrevious, onNext, hasPrevious, hasNext]);

  // Prevent body scroll when lightbox is open
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, []);

  const isVideo = item.mediaType === 'video';

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="lightbox-title"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-6xl max-h-[90vh] flex flex-col bg-white rounded-lg shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header with controls */}
        <div className="flex items-center justify-between gap-4 p-4 border-b bg-white">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>
              {currentIndex} / {totalCount}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={onToggleFavorite}
              aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
            >
              <Heart className={`h-5 w-5 ${isFavorite ? 'fill-accent text-accent' : ''}`} />
            </Button>
            <Button
              ref={closeButtonRef}
              variant="ghost"
              size="icon"
              onClick={onClose}
              aria-label="Close lightbox"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Media container */}
        <div className="flex-1 flex items-center justify-center p-4 sm:p-8 bg-muted/30 overflow-auto">
          <div className="relative max-w-full max-h-full">
            {isVideo ? (
              <video
                src={item.src}
                controls
                className="max-w-full max-h-[60vh] sm:max-h-[70vh] w-auto h-auto rounded-lg shadow-lg"
                aria-label={item.description}
              >
                Your browser does not support the video tag.
              </video>
            ) : (
              <img
                src={item.src}
                alt={item.description}
                className="max-w-full max-h-[60vh] sm:max-h-[70vh] w-auto h-auto object-contain rounded-lg shadow-lg"
              />
            )}
          </div>
        </div>

        {/* Navigation controls - positioned over media on larger screens */}
        <div className="hidden sm:block">
          <Button
            variant="secondary"
            size="icon"
            className="absolute left-4 top-1/2 -translate-y-1/2 h-12 w-12 rounded-full shadow-lg disabled:opacity-50"
            onClick={onPrevious}
            disabled={!hasPrevious}
            aria-label="Previous item"
          >
            <ChevronLeft className="h-6 w-6" />
          </Button>
          <Button
            variant="secondary"
            size="icon"
            className="absolute right-4 top-1/2 -translate-y-1/2 h-12 w-12 rounded-full shadow-lg disabled:opacity-50"
            onClick={onNext}
            disabled={!hasNext}
            aria-label="Next item"
          >
            <ChevronRight className="h-6 w-6" />
          </Button>
        </div>

        {/* Footer with title, description, and mobile navigation */}
        <div className="p-4 sm:p-6 border-t bg-white">
          <h2 id="lightbox-title" className="text-xl sm:text-2xl font-bold mb-2">
            {item.title}
          </h2>
          <p className="text-muted-foreground mb-4 sm:mb-0">{item.description}</p>

          {/* Mobile navigation buttons */}
          <div className="flex gap-2 mt-4 sm:hidden">
            <Button
              variant="outline"
              className="flex-1"
              onClick={onPrevious}
              disabled={!hasPrevious}
            >
              <ChevronLeft className="h-4 w-4 mr-2" />
              Previous
            </Button>
            <Button variant="outline" className="flex-1" onClick={onNext} disabled={!hasNext}>
              Next
              <ChevronRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
