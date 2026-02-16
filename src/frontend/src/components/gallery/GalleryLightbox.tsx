import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { X, ChevronLeft, ChevronRight, Heart, Trash2 } from 'lucide-react';
import type { UnifiedGalleryItem, StorybookGalleryItem } from '@/utils/galleryMedia';

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
  canDelete?: boolean;
  onDelete?: () => void;
  isDeleting?: boolean;
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
  canDelete = false,
  onDelete,
  isDeleting = false,
}: GalleryLightboxProps) {
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

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
  const isStorybook = item.mediaType === 'storybook';

  const handleDeleteClick = () => {
    setShowDeleteConfirm(true);
  };

  const handleConfirmDelete = () => {
    setShowDeleteConfirm(false);
    onDelete?.();
  };

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
        {/* Header */}
        <div className="flex items-center justify-between gap-4 p-4 border-b bg-background">
          <div className="flex-1 min-w-0">
            <h2 id="lightbox-title" className="text-xl font-semibold truncate">
              {item.title}
            </h2>
            <p className="text-sm text-muted-foreground">
              {currentIndex} of {totalCount}
            </p>
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
            
            {canDelete && onDelete && (
              <Button
                variant="ghost"
                size="icon"
                onClick={handleDeleteClick}
                disabled={isDeleting}
                aria-label="Delete item"
                className="hover:bg-destructive hover:text-destructive-foreground"
              >
                <Trash2 className="h-5 w-5" />
              </Button>
            )}
            
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

        {/* Content */}
        <div className="flex-1 overflow-hidden flex items-center justify-center bg-muted relative">
          {isStorybook ? (
            <ScrollArea className="h-full w-full p-8">
              <div className="max-w-3xl mx-auto prose prose-lg">
                <p className="whitespace-pre-wrap leading-relaxed text-foreground">
                  {(item as StorybookGalleryItem).story}
                </p>
              </div>
            </ScrollArea>
          ) : isVideo ? (
            <video
              src={item.src}
              controls
              autoPlay
              className="max-h-full max-w-full object-contain"
            />
          ) : (
            <img
              src={item.src}
              alt={item.description}
              className="max-h-full max-w-full object-contain"
            />
          )}

          {/* Navigation Buttons */}
          {hasPrevious && (
            <Button
              variant="ghost"
              size="icon"
              className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white shadow-lg"
              onClick={onPrevious}
              aria-label="Previous item"
            >
              <ChevronLeft className="h-6 w-6" />
            </Button>
          )}
          {hasNext && (
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white shadow-lg"
              onClick={onNext}
              aria-label="Next item"
            >
              <ChevronRight className="h-6 w-6" />
            </Button>
          )}
        </div>

        {/* Footer */}
        {!isStorybook && (
          <div className="p-4 border-t bg-background">
            <p className="text-sm text-muted-foreground">{item.description}</p>
          </div>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <AlertDialogContent onClick={(e) => e.stopPropagation()}>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Gallery Item</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{item.title}"? This action is permanent and cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
